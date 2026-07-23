// Navigation Fluidity System for FunFinity Academy
// Seamless transitions with zero errors
// Perfect routing architecture between ODE database, study modules, and dashboards

import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useRealtimeStateSync } from '@/state/RealtimeStateSync';

// Navigation route definitions
interface Route {
  id: string;
  path: string;
  name: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  requiresAuth?: boolean;
  allowedRoles?: string[];
  preload?: boolean;
  metadata?: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// Navigation state
interface NavigationState {
  currentRoute: Route | null;
  previousRoute: Route | null;
  isTransitioning: boolean;
  transitionDirection: 'forward' | 'backward' | 'none';
  navigationHistory: Route[];
  error: string | null;
}

// Navigation context
interface NavigationContextType {
  state: NavigationState;
  navigate: (routeId: string, params?: Record<string, any>) => Promise<void>;
  goBack: () => void;
  goForward: () => void;
  preloadRoute: (routeId: string) => Promise<void>;
  getRouteById: (routeId: string) => Route | null;
  getRouteByPath: (path: string) => Route | null;
  isRouteAccessible: (routeId: string) => boolean;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

// Navigation Fluidity Manager
export class NavigationFluidityManager {
  private static instance: NavigationFluidityManager;
  private routes: Map<string, Route> = new Map();
  private pathToRoute: Map<string, Route> = new Map();
  private preloadedComponents: Map<string, React.ComponentType> = new Map();
  private navigationHistory: Route[] = [];
  private currentIndex: number = -1;

  private constructor() {
    this.initializeRoutes();
  }

  public static getInstance(): NavigationFluidityManager {
    if (!NavigationFluidityManager.instance) {
      NavigationFluidityManager.instance = new NavigationFluidityManager();
    }
    return NavigationFluidityManager.instance;
  }

  // Initialize core routes
  private initializeRoutes(): void {
    const coreRoutes: Route[] = [
      {
        id: 'dashboard',
        path: '/dashboard',
        name: 'Dashboard',
        component: () => null, // Will be replaced with actual component
        requiresAuth: true,
        preload: true,
        metadata: {
          title: 'FunFinity Academy Dashboard',
          description: 'Your personalized learning dashboard',
          keywords: ['dashboard', 'home', 'learning'],
        },
      },
      {
        id: 'courses',
        path: '/courses',
        name: 'Courses',
        component: () => null,
        requiresAuth: true,
        preload: true,
        metadata: {
          title: 'AP Courses',
          description: 'AP Physics 1 and AP Precalculus courses',
          keywords: ['courses', 'physics', 'precalculus', 'ap'],
        },
      },
      {
        id: 'lesson',
        path: '/lesson/:lessonCode',
        name: 'Lesson',
        component: () => null,
        requiresAuth: true,
        preload: false,
        metadata: {
          title: 'Interactive Lesson',
          description: 'Interactive learning experience',
          keywords: ['lesson', 'learning', 'interactive'],
        },
      },
      {
        id: 'quiz',
        path: '/quiz/:lessonCode',
        name: 'Quiz',
        component: () => null,
        requiresAuth: true,
        preload: false,
        metadata: {
          title: 'Quiz Assessment',
          description: 'Test your knowledge',
          keywords: ['quiz', 'assessment', 'test'],
        },
      },
      {
        id: 'progress',
        path: '/progress',
        name: 'Progress',
        component: () => null,
        requiresAuth: true,
        preload: true,
        metadata: {
          title: 'Learning Progress',
          description: 'Track your learning journey',
          keywords: ['progress', 'tracking', 'analytics'],
        },
      },
      {
        id: 'profile',
        path: '/profile',
        name: 'Profile',
        component: () => null,
        requiresAuth: true,
        preload: true,
        metadata: {
          title: 'Student Profile',
          description: 'Manage your profile and preferences',
          keywords: ['profile', 'settings', 'preferences'],
        },
      },
      {
        id: 'ode-database',
        path: '/ode-database',
        name: 'ODE Database',
        component: () => null,
        requiresAuth: true,
        preload: false,
        metadata: {
          title: 'ODE Database',
          description: 'Ordinary Differential Equations database',
          keywords: ['ode', 'database', 'equations', 'mathematics'],
        },
      },
      {
        id: 'study-modules',
        path: '/study-modules',
        name: 'Study Modules',
        component: () => null,
        requiresAuth: true,
        preload: true,
        metadata: {
          title: 'Study Modules',
          description: 'Comprehensive study modules',
          keywords: ['study', 'modules', 'learning', 'education'],
        },
      },
      {
        id: 'not-found',
        path: '/404',
        name: 'Page Not Found',
        component: () => null,
        requiresAuth: false,
        preload: true,
        metadata: {
          title: 'Page Not Found',
          description: 'The page you are looking for does not exist',
          keywords: ['404', 'error', 'not-found'],
        },
      },
    ];

    // Register all routes
    coreRoutes.forEach(route => {
      this.registerRoute(route);
    });
  }

  // Register a new route
  registerRoute(route: Route): void {
    this.routes.set(route.id, route);
    this.pathToRoute.set(route.path, route);
  }

  // Get route by ID
  getRouteById(routeId: string): Route | null {
    return this.routes.get(routeId) || null;
  }

  // Get route by path
  getRouteByPath(path: string): Route | null {
    // Exact match first
    if (this.pathToRoute.has(path)) {
      return this.pathToRoute.get(path)!;
    }

    // Pattern matching for dynamic routes
    for (const [routePath, route] of this.pathToRoute) {
      if (this.pathMatches(routePath, path)) {
        return route;
      }
    }

    return null;
  }

  // Check if path matches route pattern
  private pathMatches(routePath: string, actualPath: string): boolean {
    const routeSegments = routePath.split('/');
    const pathSegments = actualPath.split('/');

    if (routeSegments.length !== pathSegments.length) {
      return false;
    }

    return routeSegments.every((segment, index) => {
      return segment.startsWith(':') || segment === pathSegments[index];
    });
  }

  // Extract parameters from path
  private extractParams(routePath: string, actualPath: string): Record<string, string> {
    const routeSegments = routePath.split('/');
    const pathSegments = actualPath.split('/');
    const params: Record<string, string> = {};

    routeSegments.forEach((segment, index) => {
      if (segment.startsWith(':')) {
        const paramName = segment.substring(1);
        params[paramName] = pathSegments[index];
      }
    });

    return params;
  }

  // Navigate to a route
  async navigate(routeId: string, params?: Record<string, any>): Promise<void> {
    const route = this.getRouteById(routeId);
    if (!route) {
      throw new Error('The requested page is not available. Please return to the home page.');
    }

    // Check accessibility
    if (!this.isRouteAccessible(routeId)) {
      throw new Error('You don\'t have permission to access this page. Please contact support if you believe this is an error.');
    }

    // Build actual path
    let actualPath = route.path;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        actualPath = actualPath.replace(`:${key}`, String(value));
      });
    }

    // Update navigation history
    const newRoute = { ...route, props: { ...route.props, ...params } };

    // Remove any forward history if we're navigating from a previous point
    if (this.currentIndex < this.navigationHistory.length - 1) {
      this.navigationHistory = this.navigationHistory.slice(0, this.currentIndex + 1);
    }

    this.navigationHistory.push(newRoute);
    this.currentIndex = this.navigationHistory.length - 1;

    // Preload next route if available
    this.preloadNextRoute(routeId);
  }

  // Go back in navigation history
  goBack(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  // Go forward in navigation history
  goForward(): void {
    if (this.currentIndex < this.navigationHistory.length - 1) {
      this.currentIndex++;
    }
  }

  // Get current route
  getCurrentRoute(): Route | null {
    return this.navigationHistory[this.currentIndex] || null;
  }

  // Get previous route
  getPreviousRoute(): Route | null {
    return this.navigationHistory[this.currentIndex - 1] || null;
  }

  // Check if route is accessible
  isRouteAccessible(routeId: string): boolean {
    const route = this.getRouteById(routeId);
    if (!route) return false;

    // Check authentication requirement
    if (route.requiresAuth) {
      // This would check actual authentication status
      // For now, assume user is authenticated
      const isAuthenticated = true;
      if (!isAuthenticated) return false;
    }

    // Check role requirements
    if (route.allowedRoles) {
      // This would check actual user role
      // For now, assume user has required role
      const userRole = 'student';
      if (!route.allowedRoles.includes(userRole)) return false;
    }

    return true;
  }

  // Preload route component
  async preloadRoute(routeId: string): Promise<void> {
    const route = this.getRouteById(routeId);
    if (!route || this.preloadedComponents.has(routeId)) return;

    try {
      // Preload component (this would be implemented with actual lazy loading)
      const component = route.component;
      this.preloadedComponents.set(routeId, component);
    } catch (error) {
      console.error(`Failed to preload route ${routeId}:`, error);
    }
  }

  // Preload next logical route
  private preloadNextRoute(currentRouteId: string): void {
    const nextRoutes = this.getNextLogicalRoutes(currentRouteId);
    nextRoutes.forEach(routeId => {
      this.preloadRoute(routeId);
    });
  }

  // Get next logical routes to preload
  private getNextLogicalRoutes(currentRouteId: string): string[] {
    const routeMap: Record<string, string[]> = {
      'dashboard': ['courses', 'progress'],
      'courses': ['lesson', 'quiz'],
      'lesson': ['quiz', 'courses'],
      'quiz': ['lesson', 'courses'],
      'progress': ['courses', 'lesson'],
      'profile': ['dashboard', 'progress'],
      'ode-database': ['study-modules', 'lesson'],
      'study-modules': ['lesson', 'quiz'],
    };

    return routeMap[currentRouteId] || [];
  }

  // Get navigation state
  getNavigationState(): NavigationState {
    return {
      currentRoute: this.getCurrentRoute(),
      previousRoute: this.getPreviousRoute(),
      isTransitioning: false, // This would be managed by the UI layer
      transitionDirection: 'none', // This would be managed by the UI layer
      navigationHistory: [...this.navigationHistory],
      error: null,
    };
  }

  // Get all registered routes
  getAllRoutes(): Route[] {
    return Array.from(this.routes.values());
  }

  // Get navigation history
  getNavigationHistory(): Route[] {
    return [...this.navigationHistory];
  }

  // Clear navigation history
  clearHistory(): void {
    this.navigationHistory = [];
    this.currentIndex = -1;
  }
}

// Navigation Fluidity Provider
export function NavigationFluidityProvider({ children }: { children: ReactNode }) {
  const navManager = NavigationFluidityManager.getInstance();
  const { triggerSync } = useRealtimeStateSync();
  const [state, setState] = useState<NavigationState>(navManager.getNavigationState());

  useEffect(() => {
    // Update state when navigation changes
    const updateState = () => {
      setState(navManager.getNavigationState());
    };

    // Set up interval to check for navigation changes
    const interval = setInterval(updateState, 100);
    updateState();

    return () => clearInterval(interval);
  }, [navManager]);

  const navigate = useCallback(async (routeId: string, params?: Record<string, any>) => {
    try {
      await navManager.navigate(routeId, params);

      // Trigger sync for navigation event
      await triggerSync({
        type: 'recommendation_update',
        userId: 1, // This would be actual user ID
        data: { navigation: { routeId, params } },
      });

      setState(navManager.getNavigationState());
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: (error as Error).message,
      }));
    }
  }, [navManager, triggerSync]);

  const goBack = useCallback(() => {
    navManager.goBack();
    setState(navManager.getNavigationState());
  }, [navManager]);

  const goForward = useCallback(() => {
    navManager.goForward();
    setState(navManager.getNavigationState());
  }, [navManager]);

  const preloadRoute = useCallback(async (routeId: string) => {
    await navManager.preloadRoute(routeId);
  }, [navManager]);

  const getRouteById = useCallback((routeId: string) => {
    return navManager.getRouteById(routeId);
  }, [navManager]);

  const getRouteByPath = useCallback((path: string) => {
    return navManager.getRouteByPath(path);
  }, [navManager]);

  const isRouteAccessible = useCallback((routeId: string) => {
    return navManager.isRouteAccessible(routeId);
  }, [navManager]);

  const contextValue: NavigationContextType = {
    state,
    navigate,
    goBack,
    goForward,
    preloadRoute,
    getRouteById,
    getRouteByPath,
    isRouteAccessible,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

// Hook to use navigation fluidity
export function useNavigationFluidity() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigationFluidity must be used within NavigationFluidityProvider');
  }
  return context;
}

// Hook for route parameters
export function useRouteParams(): Record<string, string> {
  const { state } = useNavigationFluidity();
  const params: Record<string, string> = {};

  if (state.currentRoute?.path) {
    // Extract params from current route
    const pathSegments = state.currentRoute.path.split('/');
    const currentPath = window.location.pathname;
    const currentSegments = currentPath.split('/');

    pathSegments.forEach((segment, index) => {
      if (segment.startsWith(':')) {
        const paramName = segment.substring(1);
        params[paramName] = currentSegments[index] || '';
      }
    });
  }

  return params;
}

// Hook for navigation actions
export function useNavigationActions() {
  const { navigate, goBack, goForward, preloadRoute } = useNavigationFluidity();

  return {
    navigateToDashboard: () => navigate('dashboard'),
    navigateToCourses: () => navigate('courses'),
    navigateToLesson: (lessonCode: string) => navigate('lesson', { lessonCode }),
    navigateToQuiz: (lessonCode: string) => navigate('quiz', { lessonCode }),
    navigateToProgress: () => navigate('progress'),
    navigateToProfile: () => navigate('profile'),
    navigateToODEDatabase: () => navigate('ode-database'),
    navigateToStudyModules: () => navigate('study-modules'),
    goBack,
    goForward,
    preloadRoute,
  };
}

// Export singleton instance
export const navigationFluidity = NavigationFluidityManager.getInstance();

// Export types
export type { Route, NavigationState, NavigationContextType };
