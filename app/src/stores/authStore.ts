import { create } from 'zustand';
import { isMockMode } from './mockMode';
import type { User, UserRole } from '@/types';

const API_URL = 'http://localhost:3001/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsRole: (role: UserRole) => void;
  fetchMe: () => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  canAccess: (allowedRoles: UserRole[]) => boolean;
}

/* ------------------------------------------------------------------ */
//  Mock users (mode démo rapide — boutons sur l'écran de login)
/* ------------------------------------------------------------------ */
const MOCK_USERS: Record<string, User & { password: string }> = {
  manager: {
    id: 'USR-001',
    name: 'Pierre Durand',
    username: 'manager',
    password: 'manager',
    role: 'responsable',
    email: 'p.durand@ramondin.fr',
  },
  tech: {
    id: 'USR-002',
    name: 'Jean Martin',
    username: 'tech',
    password: 'tech',
    role: 'technicien',
    email: 'j.martin@ramondin.fr',
  },
  op: {
    id: 'USR-003',
    name: 'Marie Lefebvre',
    username: 'op',
    password: 'op',
    role: 'operateur',
    email: 'm.lefebvre@ramondin.fr',
  },
  mag: {
    id: 'USR-004',
    name: 'Luc Bernard',
    username: 'mag',
    password: 'mag',
    role: 'magasinier',
    email: 'l.bernard@ramondin.fr',
  },
  hse: {
    id: 'USR-005',
    name: 'Sophie Moreau',
    username: 'hse',
    password: 'hse',
    role: 'hse',
    email: 's.moreau@ramondin.fr',
  },
};

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

// Restore mock user from localStorage on init
const storedMock = localStorage.getItem('mockUser');
const initialMockUser = storedMock ? JSON.parse(storedMock) : null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialMockUser,
  isAuthenticated: !!initialMockUser,
  accessToken: null,

  login: async (email: string, password: string) => {
    if (!isMockMode()) {
      // Essayer d'abord le backend réel
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (json.success) {
          const { accessToken, refreshToken, user } = json.data;
          localStorage.setItem('refreshToken', refreshToken);
          set({
            accessToken,
            user: mapBackendUser(user),
            isAuthenticated: true,
          });
          return true;
        }
      } catch {
        // Si le backend est injoignable, fallback sur le mock
      }
    }

    // Fallback mock (ou mock mode direct)
    const mockUser = MOCK_USERS[email.toLowerCase()];
    if (mockUser && mockUser.password === password) {
      const { password: _, ...user } = mockUser;
      set({ user, isAuthenticated: true, accessToken: null });
      return true;
    }
    return false;
  },

  loginAsRole: (role: UserRole) => {
    const roleToUser: Record<UserRole, string> = {
      responsable: 'manager',
      technicien: 'tech',
      operateur: 'op',
      magasinier: 'mag',
      hse: 'hse',
    };
    const username = roleToUser[role];
    const mockUser = MOCK_USERS[username];
    if (mockUser) {
      const { password: _, ...user } = mockUser;
      localStorage.setItem('mockUser', JSON.stringify(user));
      set({ user, isAuthenticated: true, accessToken: null });
    }
  },

  fetchMe: async () => {
    if (isMockMode()) return;
    const token = get().accessToken;
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        set({ user: mapBackendUser(json.data) });
      }
    } catch {
      // ignore
    }
  },

  logout: () => {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('mockUser');
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
