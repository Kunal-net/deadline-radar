import { create } from 'zustand';
import { apiRequest } from '../services/apiClient';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  timezone: string;
  created_at: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface RegisterResponse {
  user: UserProfile;
  tokens: TokenResponse;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, timezone?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('deadline_radar_token'),
  isAuthenticated: !!localStorage.getItem('deadline_radar_token'),
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest<TokenResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('deadline_radar_token', data.access_token);
      set({ token: data.access_token, isAuthenticated: true });

      // Fetch user profile immediately
      const profile = await apiRequest<UserProfile>('/auth/me');
      set({ user: profile, isLoading: false, error: null });
    } catch (err: unknown) {
      localStorage.removeItem('deadline_radar_token');
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: msg });
      throw err;
    }
  },

  register: async (email: string, password: string, fullName: string, timezone: string = 'UTC') => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName, timezone }),
      });
      localStorage.setItem('deadline_radar_token', res.tokens.access_token);
      set({
        user: res.user,
        token: res.tokens.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      localStorage.removeItem('deadline_radar_token');
      const msg = err instanceof Error ? err.message : 'Registration failed';
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: msg });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('deadline_radar_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('deadline_radar_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      const profile = await apiRequest<UserProfile>('/auth/me');
      set({ user: profile, token, isAuthenticated: true, isLoading: false, error: null });
    } catch {
      // Token is expired or invalid
      localStorage.removeItem('deadline_radar_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
