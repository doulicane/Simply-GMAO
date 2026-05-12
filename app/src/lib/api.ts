/**
 * =============================================================================
 * Client API — Configuration et wrappers fetch
 * =============================================================================
 * Centralise l'URL de l'API et les helpers de requete.
 * Gestion uniforme des erreurs avec toasts Sonner.
 * Rafraichissement automatique du token sur 401 via ApiClient.
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
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
//  ApiClient — gestion du refresh token encapsulee (pas de monkey-patch)
/* ------------------------------------------------------------------ */

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private async refreshAccessToken(): Promise<string | null> {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // cookie HttpOnly contient le refreshToken
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

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) ?? {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, { ...options, headers, credentials: 'include' });

    if (response.status === 401) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        const newToken = await this.refreshAccessToken();
        this.isRefreshing = false;
        if (newToken) {
          this.onTokenRefreshed(newToken);
          const baseHeaders =
            options.headers instanceof Headers
              ? Object.fromEntries(options.headers.entries())
              : { ...(options.headers ?? {}) };
          return fetch(url, {
            ...options,
            headers: { ...baseHeaders, Authorization: `Bearer ${newToken}` },
            credentials: 'include',
          });
        }
      } else {
        return new Promise<Response>((resolve, reject) => {
          this.subscribeTokenRefresh((token) => {
            const baseHeaders =
              options.headers instanceof Headers
                ? Object.fromEntries(options.headers.entries())
                : { ...(options.headers ?? {}) };
            fetch(url, {
              ...options,
              headers: { ...baseHeaders, Authorization: `Bearer ${token}` },
              credentials: 'include',
            }).then(resolve, reject);
          });
        });
      }
    }

    return response;
  }
}

const apiClient = new ApiClient();

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
    const response = await apiClient.request(url, { ...options, headers });

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
