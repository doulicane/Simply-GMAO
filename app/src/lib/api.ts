/**
 * =============================================================================
 * Client API — Configuration et wrappers fetch
 * =============================================================================
 * Centralise l'URL de l'API et les helpers de requete.
 * Gestion uniforme des erreurs avec toasts Sonner.
 * Rafraichissement automatique du token sur 401 (monkey-patch fetch).
 * =============================================================================
 */

import { toast } from 'sonner';
import { API_URL } from '@/lib/config';

/**
 * Headers avec token d'authentification
 */
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Codes d'erreur HTTP avec messages utilisateur
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Requete invalide',
  401: 'Session expiree. Veuillez vous reconnecter.',
  403: 'Acces refuse',
  404: 'Ressource introuvable',
  409: 'Conflit de donnees',
  422: 'Donnees invalides',
  429: 'Trop de requetes. Veuillez patienter.',
  500: 'Erreur serveur. Veuillez reessayer plus tard.',
  503: 'Service temporairement indisponible',
};

/**
 * Gestionnaire d'erreur HTTP uniforme
 */
export function handleApiError(response: Response, validationErrors?: Record<string, string>): void {
  const message = ERROR_MESSAGES[response.status] || `Erreur ${response.status}`;

  switch (response.status) {
    case 401:
      toast.error(message);
      // Deconnexion automatique + redirection login
      localStorage.removeItem('refreshToken');
      window.location.href = '/#/login';
      break;

    case 403:
      toast.error(message);
      break;

    case 404:
      toast.error(message);
      break;

    case 422:
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        Object.entries(validationErrors).forEach(([field, err]) => {
          toast.error(`${field}: ${err}`);
        });
      } else {
        toast.error(message);
      }
      break;

    case 429:
      toast.warning(message);
      break;

    case 500:
    case 503:
      toast.error(message);
      break;

    default:
      toast.error(message);
  }
}

/* ------------------------------------------------------------------ */
//  Refresh token automatique (monkey-patch fetch)
/* ------------------------------------------------------------------ */

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  try {
    const res = await _originalFetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json();
    if (json.success && json.data?.accessToken) {
      localStorage.setItem('accessToken', json.data.accessToken);
      // Mettre a jour le store Zustand
      try {
        const { useAuthStore } = await import('@/stores/authStore');
        useAuthStore.setState({ accessToken: json.data.accessToken });
      } catch {
        // ignore
      }
      return json.data.accessToken;
    }
  } catch {
    // ignore
  }
  return null;
}

if (!(window as any).__simplyGmaoOriginalFetch) {
  (window as any).__simplyGmaoOriginalFetch = window.fetch;
}
const _originalFetch = (window as any).__simplyGmaoOriginalFetch;

if (!(window as any).__simplyGmaoFetchPatched) {
  (window as any).__simplyGmaoFetchPatched = true;
  window.fetch = async function (...args) {
  const [url, options = {}] = args;
  let response = await _originalFetch(url, options);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        if (newToken) {
          onTokenRefreshed(newToken);
          const baseHeaders =
            options.headers instanceof Headers
              ? Object.fromEntries(options.headers.entries())
              : { ...(options.headers ?? {}) };
          return _originalFetch(url, {
            ...options,
            headers: { ...baseHeaders, Authorization: `Bearer ${newToken}` },
          });
        }
      } else {
        return new Promise<Response>((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            const baseHeaders =
              options.headers instanceof Headers
                ? Object.fromEntries(options.headers.entries())
                : { ...(options.headers ?? {}) };
            _originalFetch(url, {
              ...options,
              headers: { ...baseHeaders, Authorization: `Bearer ${token}` },
            }).then(resolve, reject);
          });
        });
      }
    }
  }

  return response;
};
}

/**
 * Helper fetch avec headers JSON et auth par defaut
 * Gere automatiquement les erreurs et les toasts
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      // Essayer d'extraire les erreurs de validation (422)
      let validationErrors: Record<string, string> | undefined;
      if (response.status === 422) {
        try {
          const body = await response.clone().json();
          if (body.error) {
            validationErrors = parseValidationError(body.error);
          }
        } catch {
          // ignore
        }
      }
      handleApiError(response, validationErrors);
    }

    return response;
  } catch (err: any) {
    // Network error
    toast.error('Connexion perdue. Verifiez votre connexion reseau.');
    throw err;
  }
}

/**
 * Parse une chaine d'erreur Zod en objet champ => message
 * Ex: "[body] code : Le champ code doit etre un UUID valide" -> { code: "Le champ code doit etre un UUID valide" }
 */
function parseValidationError(errorStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  const parts = errorStr.split(';');
  for (const part of parts) {
    const match = part.match(/\[?\w+\]?\s*(\w+)\s*:\s*(.+)/);
    if (match) {
      result[match[1]] = match[2].trim();
    }
  }
  return result;
}

/**
 * Helper fetch + parse JSON — retourne directement le body JSON
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
  const response = await apiFetch(endpoint, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Wrapper GET
 */
export function apiGet(endpoint: string, token?: string | null) {
  return apiFetch(endpoint, { method: 'GET' }, token);
}

/**
 * Wrapper POST
 */
export function apiPost(endpoint: string, body: any, token?: string | null) {
  return apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }, token);
}

/**
 * Wrapper PUT
 */
export function apiPut(endpoint: string, body: any, token?: string | null) {
  return apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }, token);
}

/**
 * Wrapper PATCH
 */
export function apiPatch(endpoint: string, body: any, token?: string | null) {
  return apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, token);
}

/**
 * Wrapper DELETE
 */
export function apiDelete(endpoint: string, token?: string | null) {
  return apiFetch(endpoint, { method: 'DELETE' }, token);
}
