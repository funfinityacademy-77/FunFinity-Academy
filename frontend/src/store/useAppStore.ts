/**
 * Centralized Zustand Store for FunFinity Academy
 * Manages global application state including user session, theme, and settings
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// User Session State
interface UserSession {
  id: string;
  email: string;
  display_name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar_url?: string;
}

// Theme State
type ThemeMode = 'light' | 'dark' | 'system';

// Low Bandwidth Mode State
interface LowBandwidthSettings {
  enabled: boolean;
  disableImages: boolean;
  disableVideos: boolean;
  disableAnimations: boolean;
  disableAutoPlay: boolean;
  reduceQuality: boolean;
}

// UI State
interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  notificationsPanelOpen: boolean;
}

// App Store Interface
interface AppStore {
  // User Session
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  clearUser: () => void;

  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Low Bandwidth Mode
  lowBandwidth: LowBandwidthSettings;
  setLowBandwidth: (settings: Partial<LowBandwidthSettings>) => void;
  toggleLowBandwidth: () => void;

  // UI State
  ui: UIState;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setNotificationsPanelOpen: (open: boolean) => void;

  // Loading States
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error State
  error: string | null;
  setError: (error: string | null) => void;

  // Reset Store
  reset: () => void;
}

const defaultLowBandwidthSettings: LowBandwidthSettings = {
  enabled: false,
  disableImages: false,
  disableVideos: false,
  disableAnimations: false,
  disableAutoPlay: false,
  reduceQuality: false,
};

const defaultUIState: UIState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  notificationsPanelOpen: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // User Session
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Low Bandwidth Mode
      lowBandwidth: defaultLowBandwidthSettings,
      setLowBandwidth: (settings) =>
        set((state) => ({
          lowBandwidth: { ...state.lowBandwidth, ...settings },
        })),
      toggleLowBandwidth: () =>
        set((state) => ({
          lowBandwidth: {
            ...state.lowBandwidth,
            enabled: !state.lowBandwidth.enabled,
          },
        })),

      // UI State
      ui: defaultUIState,
      setSidebarOpen: (open) =>
        set((state) => ({
          ui: { ...state.ui, sidebarOpen: open },
        })),
      setMobileMenuOpen: (open) =>
        set((state) => ({
          ui: { ...state.ui, mobileMenuOpen: open },
        })),
      setNotificationsPanelOpen: (open) =>
        set((state) => ({
          ui: { ...state.ui, notificationsPanelOpen: open },
        })),

      // Loading States
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Error State
      error: null,
      setError: (error) => set({ error }),

      // Reset Store
      reset: () =>
        set({
          user: null,
          theme: 'system',
          lowBandwidth: defaultLowBandwidthSettings,
          ui: defaultUIState,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'funfinity-app-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist specific fields
      partialize: (state) => ({
        theme: state.theme,
        lowBandwidth: state.lowBandwidth,
        ui: state.ui,
      }),
    }
  )
);

// Selectors for common use cases
export const selectUser = (state: AppStore) => state.user;
export const selectTheme = (state: AppStore) => state.theme;
export const selectLowBandwidth = (state: AppStore) => state.lowBandwidth;
export const selectUI = (state: AppStore) => state.ui;
export const selectIsLoading = (state: AppStore) => state.isLoading;
export const selectError = (state: AppStore) => state.error;

// Hooks for specific state slices
export const useUser = () => useAppStore(selectUser);
export const useTheme = () => useAppStore(selectTheme);
export const useLowBandwidth = () => useAppStore(selectLowBandwidth);
export const useUI = () => useAppStore(selectUI);
export const useLoading = () => useAppStore(selectIsLoading);
export const useError = () => useAppStore(selectError);

// Helper hook to check if user has specific role
export const useUserRole = () => {
  const user = useUser();
  return user?.role || 'student';
};

// Helper hook to check if user is admin
export const useIsAdmin = () => {
  const role = useUserRole();
  return role === 'admin';
};

// Helper hook to check if user is teacher
export const useIsTeacher = () => {
  const role = useUserRole();
  return role === 'teacher' || role === 'admin';
};

// Helper hook to get effective theme (respects system preference)
export const useEffectiveTheme = () => {
  const theme = useTheme();
  
  if (theme === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  
  return theme;
};
