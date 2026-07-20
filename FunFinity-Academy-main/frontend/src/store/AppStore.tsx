import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  avatar?: string;
  level?: number;
  xp?: number;
  streak?: number;
}

export interface Course {
  id: string;
  title: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  icon: React.ReactNode;
  color: string;
  nextLesson?: string;
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
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

export interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  language: string;
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
}

export interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Student data
  studentStats: StudentStats | null;
  courses: Course[];
  achievements: Achievement[];
  currentLesson: Lesson | null;
  lessonProgress: Record<string, number>;

  // Parent data
  selectedStudent: User | null;
  studentAnalytics: Record<string, any>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'success' | 'info';
    title: string;
    description: string;
    timestamp: string;
    studentId: string;
  }>;

  // UI state
  currentView: string;
  theme: 'light' | 'dark' | 'cosmic';
  animationsEnabled: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: Date;
  }>;
}

// Action types
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_STUDENT_STATS'; payload: StudentStats }
  | { type: 'UPDATE_STUDENT_STATS'; payload: Partial<StudentStats> }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'UPDATE_COURSE_PROGRESS'; payload: { courseId: string; progress: number } }
  | { type: 'SET_ACHIEVEMENTS'; payload: Achievement[] }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'SET_CURRENT_LESSON'; payload: Lesson | null }
  | { type: 'UPDATE_LESSON_PROGRESS'; payload: { lessonId: string; progress: number } }
  | { type: 'COMPLETE_LESSON'; payload: { lessonId: string; xp: number } }
  | { type: 'SET_SELECTED_STUDENT'; payload: User | null }
  | { type: 'SET_STUDENT_ANALYTICS'; payload: Record<string, any> }
  | { type: 'ADD_ALERT'; payload: any }
  | { type: 'REMOVE_ALERT'; payload: string }
  | { type: 'SET_CURRENT_VIEW'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'cosmic' }
  | { type: 'SET_ANIMATIONS_ENABLED'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: { message: string; type: 'success' | 'error' | 'warning' | 'info' } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  studentStats: null,
  courses: [],
  achievements: [],
  currentLesson: null,
  lessonProgress: {},
  selectedStudent: null,
  studentAnalytics: {},
  alerts: [],
  currentView: 'dashboard',
  theme: 'cosmic',
  animationsEnabled: true,
  notifications: [],
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };

    case 'SET_STUDENT_STATS':
      return { ...state, studentStats: action.payload };

    case 'UPDATE_STUDENT_STATS':
      return {
        ...state,
        studentStats: state.studentStats
          ? { ...state.studentStats, ...action.payload }
          : null,
      };

    case 'SET_COURSES':
      return { ...state, courses: action.payload };

    case 'UPDATE_COURSE_PROGRESS':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload.courseId
            ? { ...course, progress: action.payload.progress }
            : course
        ),
      };

    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };

    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map(achievement =>
          achievement.id === action.payload
            ? { ...achievement, unlockedAt: new Date() }
            : achievement
        ),
      };

    case 'SET_CURRENT_LESSON':
      return { ...state, currentLesson: action.payload };

    case 'UPDATE_LESSON_PROGRESS':
      return {
        ...state,
        lessonProgress: {
          ...state.lessonProgress,
          [action.payload.lessonId]: action.payload.progress,
        },
      };

    case 'COMPLETE_LESSON':
      const newProgress = {
        ...state.lessonProgress,
        [action.payload.lessonId]: 100,
      };
      return {
        ...state,
        lessonProgress: newProgress,
        studentStats: state.studentStats
          ? {
              ...state.studentStats,
              xp: state.studentStats.xp + action.payload.xp,
              completedLessons: state.studentStats.completedLessons + 1,
            }
          : null,
      };

    case 'SET_SELECTED_STUDENT':
      return { ...state, selectedStudent: action.payload };

    case 'SET_STUDENT_ANALYTICS':
      return { ...state, studentAnalytics: action.payload };

    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [...state.alerts, { ...action.payload, id: Date.now().toString() }],
      };

    case 'REMOVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload),
      };

    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_ANIMATIONS_ENABLED':
      return { ...state, animationsEnabled: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { ...action.payload, id: Date.now().toString(), timestamp: new Date() },
        ],
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('funfinityAppState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Restore relevant parts of state
        if (parsed.user) dispatch({ type: 'SET_USER', payload: parsed.user });
        if (parsed.theme) dispatch({ type: 'SET_THEME', payload: parsed.theme });
        if (parsed.animationsEnabled !== undefined)
          dispatch({ type: 'SET_ANIMATIONS_ENABLED', payload: parsed.animationsEnabled });
      } catch (error) {
        console.error('Unable to restore your previous session. Starting with a fresh session.');
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const stateToSave = {
      user: state.user,
      theme: state.theme,
      animationsEnabled: state.animationsEnabled,
    };
    localStorage.setItem('funfinityAppState', JSON.stringify(stateToSave));
  }, [state.user, state.theme, state.animationsEnabled]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Application context not available. Please refresh the page and try again.');
  }
  return context;
}

// Action creators
export const appActions = {
  setLoading: (loading: boolean) => ({ type: 'SET_LOADING' as const, payload: loading }),
  setError: (error: string | null) => ({ type: 'SET_ERROR' as const, payload: error }),
  setUser: (user: User | null) => ({ type: 'SET_USER' as const, payload: user }),
  setAuthenticated: (isAuthenticated: boolean) => ({
    type: 'SET_AUTHENTICATED' as const,
    payload: isAuthenticated,
  }),
  setStudentStats: (stats: StudentStats) => ({
    type: 'SET_STUDENT_STATS' as const,
    payload: stats,
  }),
  updateStudentStats: (updates: Partial<StudentStats>) => ({
    type: 'UPDATE_STUDENT_STATS' as const,
    payload: updates,
  }),
  setCourses: (courses: Course[]) => ({
    type: 'SET_COURSES' as const,
    payload: courses,
  }),
  updateCourseProgress: (courseId: string, progress: number) => ({
    type: 'UPDATE_COURSE_PROGRESS' as const,
    payload: { courseId, progress },
  }),
  setAchievements: (achievements: Achievement[]) => ({
    type: 'SET_ACHIEVEMENTS' as const,
    payload: achievements,
  }),
  unlockAchievement: (achievementId: string) => ({
    type: 'UNLOCK_ACHIEVEMENT' as const,
    payload: achievementId,
  }),
  setCurrentLesson: (lesson: Lesson | null) => ({
    type: 'SET_CURRENT_LESSON' as const,
    payload: lesson,
  }),
  updateLessonProgress: (lessonId: string, progress: number) => ({
    type: 'UPDATE_LESSON_PROGRESS' as const,
    payload: { lessonId, progress },
  }),
  completeLesson: (lessonId: string, xp: number) => ({
    type: 'COMPLETE_LESSON' as const,
    payload: { lessonId, xp },
  }),
  setSelectedStudent: (student: User | null) => ({
    type: 'SET_SELECTED_STUDENT' as const,
    payload: student,
  }),
  setStudentAnalytics: (analytics: Record<string, any>) => ({
    type: 'SET_STUDENT_ANALYTICS' as const,
    payload: analytics,
  }),
  addAlert: (alert: any) => ({ type: 'ADD_ALERT' as const, payload: alert }),
  removeAlert: (alertId: string) => ({
    type: 'REMOVE_ALERT' as const,
    payload: alertId,
  }),
  setCurrentView: (view: string) => ({
    type: 'SET_CURRENT_VIEW' as const,
    payload: view,
  }),
  setTheme: (theme: 'light' | 'dark' | 'cosmic') => ({
    type: 'SET_THEME' as const,
    payload: theme,
  }),
  setAnimationsEnabled: (enabled: boolean) => ({
    type: 'SET_ANIMATIONS_ENABLED' as const,
    payload: enabled,
  }),
  addNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => ({
    type: 'ADD_NOTIFICATION' as const,
    payload: { message, type },
  }),
  removeNotification: (notificationId: string) => ({
    type: 'REMOVE_NOTIFICATION' as const,
    payload: notificationId,
  }),
  resetState: () => ({ type: 'RESET_STATE' as const }),
};
