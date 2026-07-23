/**
 * Centralized Zustand Store for State Management
 * Handles user session, theme, low-bandwidth mode, and global application state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Low Bandwidth Mode
  lowBandwidthMode: boolean;
  toggleLowBandwidthMode: () => void;
  setLowBandwidthMode: (enabled: boolean) => void;

  // User Session
  user: {
    id: string;
    email: string;
    displayName?: string;
    role?: string;
  } | null;
  setUser: (user: AppState['user']) => void;
  clearUser: () => void;

  // UI State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Notifications
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: number;
    read: boolean;
  }>;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Loading States
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Error State
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Low Bandwidth Mode
      lowBandwidthMode: false,
      toggleLowBandwidthMode: () => set((state) => ({ lowBandwidthMode: !state.lowBandwidthMode })),
      setLowBandwidthMode: (enabled) => set({ lowBandwidthMode: enabled }),

      // User Session
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      // UI State
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              read: false,
            },
            ...state.notifications,
          ].slice(0, 50), // Keep only last 50 notifications
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),

      // Loading States
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      // Error State
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'funfinity-app-storage',
      partialize: (state) => ({
        theme: state.theme,
        lowBandwidthMode: state.lowBandwidthMode,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Selectors for common use cases
export const selectTheme = (state: AppState) => state.theme;
export const selectLowBandwidthMode = (state: AppState) => state.lowBandwidthMode;
export const selectUser = (state: AppState) => state.user;
export const selectNotifications = (state: AppState) => state.notifications;
export const selectUnreadNotifications = (state: AppState) =>
  state.notifications.filter((n) => !n.read);
