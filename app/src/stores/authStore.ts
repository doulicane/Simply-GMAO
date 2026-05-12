import { create } from 'zustand';
import { API_URL } from '@/lib/config';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  fetchMe: () => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  canAccess: (allowedRoles: UserRole[]) => boolean;
}

/* ------------------------------------------------------------------ */
//  Helpers
/* ------------------------------------------------------------------ */

function mapBackendRole(role: string): UserRole {
  const map: Record<string, UserRole> = {
    ADMIN: 'responsable',
    RESPONSABLE: 'responsable',
    TECHNICIEN: 'technicien',
    OPERATEUR: 'operateur',
    MAGASINIER: 'magasinier',
    HSE: 'hse',
  };
  return map[role] ?? 'responsable';
}

function mapBackendUser(u: any): User {
  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;
  return {
    id: u.id,
    name,
    username: u.email?.split('@')[0] ?? u.id,
    role: mapBackendRole(u.role),
    email: u.email,
    avatar: undefined,
  };
}

/* ------------------------------------------------------------------ */
//  Store
/* ------------------------------------------------------------------ */

const storedAccessToken = localStorage.getItem('accessToken');
const storedUser = localStorage.getItem('user');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedAccessToken,
  accessToken: storedAccessToken,

  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        const { accessToken, user } = json.data;
        localStorage.setItem('accessToken', accessToken);
        const mappedUser = mapBackendUser(user);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        set({
          accessToken,
          user: mappedUser,
          isAuthenticated: true,
        });
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  },

  fetchMe: async () => {
    const token = get().accessToken;
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        const mappedUser = mapBackendUser(json.data);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        set({ user: mappedUser });
      }
    } catch {
      // ignore
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch {
      // ignore — la deconnexion se fait quand meme cote client
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, accessToken: null });
  },

  hasRole: (role: UserRole | UserRole[]) => {
    const user = get().user;
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  },

  canAccess: (allowedRoles: UserRole[]) => {
    const user = get().user;
    if (!user) return false;
    return allowedRoles.includes(user.role);
  },
}));
