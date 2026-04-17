import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  setUser: (user: User | null) => set({ user }),

  setTokens: (accessToken: string, refreshToken: string) =>
    set({ accessToken, refreshToken }),

  login: (user: User, accessToken: string, refreshToken: string) =>
    set({ user, accessToken, refreshToken }),

  logout: () => set({ user: null, accessToken: null, refreshToken: null }),
}));
