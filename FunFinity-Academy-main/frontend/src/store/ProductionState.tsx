import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/services/production-logger';

// Enhanced types for production
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  avatar?: string;
  level?: number;
  xp?: number;
  streak?: number;
  preferences?: {
    theme: 'light' | 'dark' | 'cosmic';
    animationsEnabled: boolean;
    notifications: boolean;
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  icon: React.ReactNode;
  color: string;
  nextLesson?: string;
  category: 'ap-physics-1' | 'ap-precalculus' | 'general';
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'interactive' | 'coding';
  content: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  xpReward: number;
  icon: React.ReactNode;
  videoUrl?: string;
  quizQuestions?: QuizQuestion[];
  codeChallenge?: CodeChallenge;
  category: 'ap-physics-1' | 'ap-precalculus';
  learningObjectives: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
  category: string;
}

export interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  language: string;
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  category: 'ap-physics-1' | 'ap-precalculus' | 'general';
}

export interface StudentStats {
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  totalPoints: number;
  completedLessons: number;
  timeSpent: number;
  achievements: number;
  subjectPerformance: {
    'ap-physics-1': number;
    'ap-precalculus': number;
  };
  weeklyProgress: number[];
}

export interface Analytics {
  weeklyProgress: number[];
  subjectPerformance: {
    math: number;
    science: number;
    coding: number;
    language: number;
  };
  studyTime: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  engagement: {
    lessonsCompleted: number;
    quizzesTaken: number;
    averageScore: number;
    streakDays: number;
  };
}

// Production API Client
class ProductionAPIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production'
      ? 'https://api.funfinity-academy.com'
      : 'http://localhost:8080/api';

    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const startTime = Date.now();
    const url = `${this.baseURL}${endpoint}`;

    try {
      logger.apiCall(endpoint, options.method || 'GET');

      const response = await fetch(url, {
        headers: { ...this.defaultHeaders, ...options.headers },
        ...options,
      });

      const duration = Date.now() - startTime;
      logger.performance('api_request_duration', duration, 'ms');

      if (!response.ok) {
        throw new Error(`We're experiencing connectivity issues. Please check your internet connection and try again. If the problem persists, please contact support.`);
      }

      const data = await response.json();
      logger.apiCall(endpoint, options.method || 'GET', duration, response.status);

      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`API request failed: ${endpoint}`, { error, duration });
      throw error;
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/user/current');
  }

  async updateUserPreferences(preferences: Partial<User['preferences']>): Promise<User> {
    return this.request<User>('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Course endpoints
  async getCourses(category?: string): Promise<Course[]> {
    const query = category ? `?category=${category}` : '';
    return this.request<Course[]>(`/courses${query}`);
  }

  async getCourse(id: string): Promise<Course> {
    return this.request<Course>(`/courses/${id}`);
  }

  async updateCourseProgress(courseId: string, progress: number): Promise<void> {
    return this.request<void>(`/courses/${courseId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  }

  // Lesson endpoints
  async getLesson(id: string): Promise<Lesson> {
    return this.request<Lesson>(`/lessons/${id}`);
  }

  async completeLesson(lessonId: string, score?: number): Promise<{ xp: number }> {
    return this.request<{ xp: number }>(`/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ score }),
    });
  }

  // Stats endpoints
  async getStudentStats(studentId: string): Promise<StudentStats> {
    return this.request<StudentStats>(`/students/${studentId}/stats`);
  }

  async getAnalytics(studentId: string): Promise<Analytics> {
    return this.request<Analytics>(`/students/${studentId}/analytics`);
  }

  // Achievement endpoints
  async getAchievements(studentId: string): Promise<Achievement[]> {
    return this.request<Achievement[]>(`/students/${studentId}/achievements`);
  }

  async unlockAchievement(achievementId: string): Promise<void> {
    return this.request<void>(`/achievements/${achievementId}/unlock`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ProductionAPIClient();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'message' in error) {
          const message = (error as any).message;
          if (message.includes('400') || message.includes('401') || message.includes('403') || message.includes('404')) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Production State Context
interface ProductionStateContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  // Query hooks (using React Query types)
  useCourses: typeof useCourses;
  useCourse: typeof useCourse;
  useStudentStats: typeof useStudentStats;
  useAchievements: typeof useAchievements;
  useAnalytics: typeof useAnalytics;
  // Mutation hooks
  useUpdateCourseProgress: typeof useUpdateCourseProgress;
  useCompleteLesson: typeof useCompleteLesson;
  useUnlockAchievement: typeof useUnlockAchievement;
  // Utility methods
  invalidateQueries: (queryKey: string[]) => void;
  prefetchData: (queryKey: string[], data?: any) => void;
}

const ProductionStateContext = createContext<ProductionStateContextType | null>(null);

// Production hooks
export function useCourses(category?: string) {
  return useQuery({
    queryKey: ['courses', category],
    queryFn: () => apiClient.getCourses(category),
    enabled: true,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => apiClient.getCourse(id),
    enabled: !!id,
  });
}

export function useStudentStats(studentId: string) {
  return useQuery({
    queryKey: ['student-stats', studentId],
    queryFn: () => apiClient.getStudentStats(studentId),
    enabled: !!studentId,
  });
}

export function useAchievements(studentId: string) {
  return useQuery({
    queryKey: ['achievements', studentId],
    queryFn: () => apiClient.getAchievements(studentId),
    enabled: !!studentId,
  });
}

export function useAnalytics(studentId: string) {
  return useQuery({
    queryKey: ['analytics', studentId],
    queryFn: () => apiClient.getAnalytics(studentId),
    enabled: !!studentId,
  });
}

export function useUpdateCourseProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, progress }: { courseId: string; progress: number }) =>
      apiClient.updateCourseProgress(courseId, progress),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      logger.userAction('course_progress_updated', { courseId });
    },
    onError: (error) => {
      logger.error('Failed to update course progress', { error });
    },
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, score }: { lessonId: string; score?: number }) =>
      apiClient.completeLesson(lessonId, score),
    onSuccess: (data, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['student-stats'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      logger.business('lesson_completed', { lessonId, xp: data.xp });
    },
    onError: (error) => {
      logger.error('Failed to complete lesson', { error });
    },
  });
}

export function useUnlockAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (achievementId: string) => apiClient.unlockAchievement(achievementId),
    onSuccess: (_, achievementId) => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      logger.business('achievement_unlocked', { achievementId });
    },
    onError: (error) => {
      logger.error('Failed to unlock achievement', { error });
    },
  });
}

// Provider Component
export function ProductionStateProvider({ children }: { children: ReactNode }) {
  const queryClientInstance = useQueryClient();

  const invalidateQueries = useCallback((queryKey: string[]) => {
    queryClientInstance.invalidateQueries({ queryKey });
  }, [queryClientInstance]);

  const prefetchData = useCallback((queryKey: string[], data?: any) => {
    if (data) {
      queryClientInstance.setQueryData(queryKey, data);
    } else {
      queryClientInstance.prefetchQuery({ queryKey });
    }
  }, [queryClientInstance]);

  const contextValue: ProductionStateContextType = useMemo(() => ({
    user: null, // This would come from auth context
    isLoading: false,
    error: null,
    useCourses,
    useCourse,
    useStudentStats,
    useAchievements,
    useAnalytics,
    useUpdateCourseProgress,
    useCompleteLesson,
    useUnlockAchievement,
    invalidateQueries,
    prefetchData,
  }), [invalidateQueries, prefetchData]);

  return (
    <ProductionStateContext.Provider value={contextValue}>
      {children}
    </ProductionStateContext.Provider>
  );
}

// Hook to use the production state
export function useProductionState() {
  const context = useContext(ProductionStateContext);
  if (!context) {
    throw new Error('Application context not available. Please refresh the page and try again.');
  }
  return context;
}

// Main Provider wrapper
export function ProductionProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductionStateProvider>
        {children}
      </ProductionStateProvider>
    </QueryClientProvider>
  );
}

// Global loading state hook
export function useGlobalLoading() {
  const queryClient = useQueryClient();

  const isLoading = queryClient.isFetching() > 0;

  return {
    isLoading,
    loadingCount: queryClient.isFetching(),
  };
}

// Error boundary for production
export class ProductionErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.fatal('React error boundary triggered', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
