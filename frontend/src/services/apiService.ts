import { appActions, User, Course, Lesson, Achievement, StudentStats } from '@/store/AppStore';

// API Base Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.funfinity-academy.com'
  : 'http://localhost:8080/api';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API client
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    dispatch?: React.Dispatch<any>
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Set loading state
    if (dispatch) {
      dispatch(appActions.setLoading(true));
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'We encountered an issue processing your request. Please try again.');
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

      if (dispatch) {
        dispatch(appActions.setError(errorMessage));
        dispatch(appActions.addNotification(errorMessage, 'error'));
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      if (dispatch) {
        dispatch(appActions.setLoading(false));
      }
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }, dispatch?: React.Dispatch<any>) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, dispatch);
  }

  async register(userData: any, dispatch?: React.Dispatch<any>) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, dispatch);
  }

  async logout(dispatch?: React.Dispatch<any>) {
    return this.request('/auth/logout', {
      method: 'POST',
    }, dispatch);
  }

  // Student endpoints
  async getStudentStats(studentId: string, dispatch?: React.Dispatch<any>) {
    return this.request<StudentStats>(`/student/${studentId}/stats`, {}, dispatch);
  }

  async updateStudentStats(studentId: string, stats: Partial<StudentStats>, dispatch?: React.Dispatch<any>) {
    return this.request(`/student/${studentId}/stats`, {
      method: 'PUT',
      body: JSON.stringify(stats),
    }, dispatch);
  }

  async getCourses(studentId: string, dispatch?: React.Dispatch<any>) {
    return this.request<Course[]>(`/student/${studentId}/courses`, {}, dispatch);
  }

  async getCourse(courseId: string, dispatch?: React.Dispatch<any>) {
    return this.request<Course>(`/courses/${courseId}`, {}, dispatch);
  }

  async updateCourseProgress(courseId: string, progress: number, dispatch?: React.Dispatch<any>) {
    return this.request(`/courses/${courseId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    }, dispatch);
  }

  async getLesson(lessonId: string, dispatch?: React.Dispatch<any>) {
    return this.request<Lesson>(`/lessons/${lessonId}`, {}, dispatch);
  }

  async completeLesson(lessonId: string, dispatch?: React.Dispatch<any>) {
    return this.request(`/lessons/${lessonId}/complete`, {
      method: 'POST',
    }, dispatch);
  }

  async getAchievements(studentId: string, dispatch?: React.Dispatch<any>) {
    return this.request<Achievement[]>(`/student/${studentId}/achievements`, {}, dispatch);
  }

  async unlockAchievement(achievementId: string, dispatch?: React.Dispatch<any>) {
    return this.request(`/achievements/${achievementId}/unlock`, {
      method: 'POST',
    }, dispatch);
  }

  // Parent endpoints
  async getLinkedStudents(parentId: string, dispatch?: React.Dispatch<any>) {
    return this.request<User[]>(`/parent/${parentId}/students`, {}, dispatch);
  }

  async getStudentAnalytics(studentId: string, dispatch?: React.Dispatch<any>) {
    return this.request(`/parent/analytics/${studentId}`, {}, dispatch);
  }

  async updateSafetySettings(studentId: string, settings: any, dispatch?: React.Dispatch<any>) {
    return this.request(`/parent/${studentId}/safety`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, dispatch);
  }

  async generateReport(studentId: string, reportType: string, dispatch?: React.Dispatch<any>) {
    return this.request(`/parent/${studentId}/report/${reportType}`, {
      method: 'POST',
    }, dispatch);
  }

  // Admin endpoints
  async getAllStudents(dispatch?: React.Dispatch<any>) {
    return this.request<User[]>('/admin/students', {}, dispatch);
  }

  async getAllCourses(dispatch?: React.Dispatch<any>) {
    return this.request<Course[]>('/admin/courses', {}, dispatch);
  }

  async createCourse(courseData: Partial<Course>, dispatch?: React.Dispatch<any>) {
    return this.request<Course>('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }, dispatch);
  }

  async updateCourse(courseId: string, courseData: Partial<Course>, dispatch?: React.Dispatch<any>) {
    return this.request<Course>(`/admin/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    }, dispatch);
  }

  async deleteCourse(courseId: string, dispatch?: React.Dispatch<any>) {
    return this.request(`/admin/courses/${courseId}`, {
      method: 'DELETE',
    }, dispatch);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Mock data service for development
export class MockDataService {
  private static generateMockUser(id: string, role: 'student' | 'parent'): User {
    return {
      id,
      name: role === 'student' ? 'Emma Johnson' : 'Sarah Johnson',
      email: role === 'student' ? 'emma@example.com' : 'sarah@example.com',
      role,
      avatar: role === 'student' ? '👧' : '👩',
      level: role === 'student' ? 15 : undefined,
      xp: role === 'student' ? 3450 : undefined,
      streak: role === 'student' ? 12 : undefined,
    };
  }

  private static generateMockStudentStats(): StudentStats {
    return {
      level: 15,
      xp: 3450,
      xpToNext: 4000,
      streak: 12,
      totalPoints: 2890,
      completedLessons: 124,
      timeSpent: 156,
      achievements: 34,
    };
  }

  private static generateMockCourses(): Course[] {
    return [
      {
        id: '1',
        title: 'Advanced Mathematics',
        progress: 75,
        totalLessons: 20,
        completedLessons: 15,
        difficulty: 'Intermediate',
        estimatedTime: '15h',
        icon: '📐',
        color: 'purple',
        nextLesson: 'Quadratic Equations',
      },
      {
        id: '2',
        title: 'Science Explorers',
        progress: 60,
        totalLessons: 25,
        completedLessons: 15,
        difficulty: 'Beginner',
        estimatedTime: '20h',
        icon: '🔬',
        color: 'green',
        nextLesson: 'Chemistry Basics',
      },
      {
        id: '3',
        title: 'Coding Adventures',
        progress: 45,
        totalLessons: 30,
        completedLessons: 13,
        difficulty: 'Advanced',
        estimatedTime: '25h',
        icon: '💻',
        color: 'blue',
        nextLesson: 'Python Functions',
      },
    ];
  }

  private static generateMockAchievements(): Achievement[] {
    return [
      {
        id: '1',
        title: 'Math Master',
        description: 'Complete 10 math lessons with perfect scores',
        icon: '🏆',
        rarity: 'Epic',
        unlockedAt: new Date(),
      },
      {
        id: '2',
        title: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        rarity: 'Rare',
        unlockedAt: new Date(),
      },
      {
        id: '3',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '👟',
        rarity: 'Common',
        unlockedAt: new Date(),
      },
      {
        id: '4',
        title: 'Code Ninja',
        description: 'Complete 5 coding challenges',
        icon: '🥷',
        rarity: 'Legendary',
        progress: 3,
        maxProgress: 5,
      },
    ];
  }

  // Mock API methods
  static async mockLogin(credentials: { email: string; password: string }): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    if (credentials.email === 'student@example.com' && credentials.password === 'password') {
      return {
        success: true,
        data: this.generateMockUser('1', 'student'),
      };
    }

    if (credentials.email === 'parent@example.com' && credentials.password === 'password') {
      return {
        success: true,
        data: this.generateMockUser('2', 'parent'),
      };
    }

    return {
      success: false,
      error: 'Invalid credentials',
    };
  }

  static async mockGetStudentStats(): Promise<ApiResponse<StudentStats>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: this.generateMockStudentStats(),
    };
  }

  static async mockGetCourses(): Promise<ApiResponse<Course[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: this.generateMockCourses(),
    };
  }

  static async mockGetAchievements(): Promise<ApiResponse<Achievement[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: this.generateMockAchievements(),
    };
  }

  static async mockCompleteLesson(lessonId: string, xp: number): Promise<ApiResponse<{ xp: number }>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: { xp },
      message: `Lesson completed! Earned ${xp} XP`,
    };
  }

  static async mockGenerateReport(studentId: string, reportType: string): Promise<ApiResponse<{ url: string }>> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      data: { url: `/reports/${studentId}-${reportType}-${Date.now()}.pdf` },
      message: 'Report generated successfully',
    };
  }
}

// Export the mock service for development
export const mockApi = MockDataService;
