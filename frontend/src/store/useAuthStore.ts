import { create } from 'zustand';
import { api, User } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  switchDemoRole: (role: 'citizen' | 'official' | 'national_admin') => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('setu_access_token'),
  isLoading: false,

  login: async (username, pass) => {
    set({ isLoading: true });
    try {
      const res = await api.login(username, pass);
      set({ user: res.user, token: res.access_token, isLoading: false });
      return res.user;
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: () => {
    api.setToken(null);
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('setu_access_token');
    if (!token) return;
    try {
      const user = await api.getMe();
      set({ user, token });
    } catch (e) {
      api.setToken(null);
      set({ user: null, token: null });
    }
  },

  switchDemoRole: async (role) => {
    set({ isLoading: true });
    try {
      const username = role === 'citizen' ? 'citizen@setu.ai' : (role === 'official' ? 'official@setu.ai' : 'admin@setu.ai');
      const res = await api.login(username, 'password123');
      set({ user: res.user, token: res.access_token, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  }
}));
