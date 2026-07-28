import { supabase } from './supabase';

// ============================================================================
// CRITICAL DASHBOARD DATA PREFETCHING STRATEGY
// ============================================================================
// This module implements a prefetching strategy for critical dashboard data
// to optimize performance for global users on low-bandwidth networks.
//
// Strategy:
// 1. Prefetch critical data during navigation (using Next.js prefetch)
// 2. Cache data in memory with TTL
// 3. Prioritize above-fold content
// 4. Use stale-while-revalidate for non-critical data
// 5. Implement progressive loading
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface PrefetchConfig {
  priority: 'critical' | 'high' | 'medium' | 'low';
  ttl: number;
  staleWhileRevalidate: boolean;
}

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const dataCache = new DataCache();

// ============================================================================
// PREFETCH CONFIGURATION
// ============================================================================

const PREFETCH_CONFIGS: Record<string, PrefetchConfig> = {
  // Critical data - above fold, needed immediately
  'student-stats': {
    priority: 'critical',
    ttl: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: true,
  },
  'user-profile': {
    priority: 'critical',
    ttl: 10 * 60 * 1000, // 10 minutes
    staleWhileRevalidate: true,
  },
  
  // High priority - needed shortly after load
  'courses': {
    priority: 'high',
    ttl: 15 * 60 * 1000, // 15 minutes
    staleWhileRevalidate: true,
  },
  'enrollments': {
    priority: 'high',
    ttl: 15 * 60 * 1000, // 15 minutes
    staleWhileRevalidate: true,
  },
  
  // Medium priority - needed for secondary features
  'achievements': {
    priority: 'medium',
    ttl: 30 * 60 * 1000, // 30 minutes
    staleWhileRevalidate: true,
  },
  'notifications': {
    priority: 'medium',
    ttl: 2 * 60 * 1000, // 2 minutes
    staleWhileRevalidate: true,
  },
  
  // Low priority - nice to have
  'leaderboard': {
    priority: 'low',
    ttl: 60 * 60 * 1000, // 1 hour
    staleWhileRevalidate: true,
  },
  'announcements': {
    priority: 'low',
    ttl: 30 * 60 * 1000, // 30 minutes
    staleWhileRevalidate: true,
  },
};

// ============================================================================
// DATA FETCHING WITH CACHING
// ============================================================================

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  config?: PrefetchConfig
): Promise<T> {
  const cacheKey = key;
  const cacheConfig = config || PREFETCH_CONFIGS[key];

  // Check cache first
  if (dataCache.has(cacheKey)) {
    const cachedData = dataCache.get<T>(cacheKey);
    
    if (cachedData) {
      // If stale-while-revalidate is enabled, fetch in background
      if (cacheConfig?.staleWhileRevalidate) {
        fetcher().then((freshData) => {
          dataCache.set(cacheKey, freshData, cacheConfig.ttl);
        }).catch(() => {
          // Silently fail, use cached data
        });
      }
      
      return cachedData;
    }
  }

  // Fetch fresh data
  const data = await fetcher();
  
  // Cache the result
  if (cacheConfig) {
    dataCache.set(cacheKey, data, cacheConfig.ttl);
  }

  return data;
}

// ============================================================================
// SPECIFIC DATA FETCHERS
// ============================================================================

/**
 * Fetch student statistics with caching
 */
export async function fetchStudentStats(userId: string): Promise<any> {
  const cacheKey = `student-stats-${userId}`;
  
  return fetchWithCache(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          display_name,
          avatar_url,
          points,
          streak,
          level,
          total_points,
          completed_lessons,
          time_spent,
          achievements
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    PREFETCH_CONFIGS['student-stats']
  );
}

/**
 * Fetch user profile with caching
 */
export async function fetchUserProfile(userId: string): Promise<any> {
  const cacheKey = `user-profile-${userId}`;
  
  return fetchWithCache(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    PREFETCH_CONFIGS['user-profile']
  );
}

/**
 * Fetch courses with caching
 */
export async function fetchCourses(userId?: string): Promise<any[]> {
  const cacheKey = userId ? `courses-${userId}` : 'courses';
  
  return fetchWithCache(
    cacheKey,
    async () => {
      let query = supabase
        .from('courses')
        .select(`
          *,
          lessons (
            id,
            title,
            order_index
          )
        `)
        .eq('published', true)
        .eq('active', true);

      if (userId) {
        query = query.select(`
          *,
          enrollments!inner (
            user_id,
            progress,
            enrolled_at
          ),
          lessons (
            id,
            title,
            order_index
          )
        `);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    PREFETCH_CONFIGS['courses']
  );
}

/**
 * Fetch user enrollments with caching
 */
export async function fetchEnrollments(userId: string): Promise<any[]> {
  const cacheKey = `enrollments-${userId}`;
  
  return fetchWithCache(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            thumbnail_url,
            instructor_id
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    },
    PREFETCH_CONFIGS['enrollments']
  );
}

/**
 * Fetch achievements with caching
 */
export async function fetchAchievements(userId: string): Promise<any[]> {
  const cacheKey = `achievements-${userId}`;
  
  return fetchWithCache(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (
            id,
            name,
            description,
            icon_url,
            points
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    },
    PREFETCH_CONFIGS['achievements']
  );
}

/**
 * Fetch notifications with caching
 */
export async function fetchNotifications(userId: string): Promise<any[]> {
  const cacheKey = `notifications-${userId}`;
  
  return fetchWithCache(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    PREFETCH_CONFIGS['notifications']
  );
}

// ============================================================================
 BATCH PREFETCHING FOR DASHBOARD
// ============================================================================

export interface DashboardData {
  stats: any;
  profile: any;
  courses: any[];
  enrollments: any[];
  achievements: any[];
  notifications: any[];
}

/**
 * Prefetch all critical dashboard data
 * This should be called during navigation to the dashboard
 */
export async function prefetchDashboardData(userId: string): Promise<DashboardData> {
  // Prefetch critical data first (parallel)
  const [stats, profile] = await Promise.all([
    fetchStudentStats(userId),
    fetchUserProfile(userId),
  ]);

  // Prefetch high priority data (parallel)
  const [courses, enrollments] = await Promise.all([
    fetchCourses(userId),
    fetchEnrollments(userId),
  ]);

  // Prefetch medium priority data (parallel)
  const [achievements, notifications] = await Promise.all([
    fetchAchievements(userId),
    fetchNotifications(userId),
  ]);

  return {
    stats,
    profile,
    courses,
    enrollments,
    achievements,
    notifications,
  };
}

/**
 * Prefetch only critical data for initial render
 * Use this for fastest possible FCP
 */
export async function prefetchCriticalData(userId: string): Promise<{
  stats: any;
  profile: any;
}> {
  const [stats, profile] = await Promise.all([
    fetchStudentStats(userId),
    fetchUserProfile(userId),
  ]);

  return { stats, profile };
}

// ============================================================================
// PROGRESSIVE DATA LOADING HOOK
// ============================================================================

import { useState, useEffect } from 'react';

export function useProgressiveData<T>(
  fetcher: () => Promise<T>,
  options?: {
    initialData?: T;
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  const [data, setData] = useState<T | undefined>(options?.initialData);
  const [loading, setLoading] = useState(!options?.initialData);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options?.enabled === false) return;

    fetchData();

    if (options?.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [options?.enabled, options?.refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// DASHBOARD DATA HOOK
// ============================================================================

export function useDashboardData(userId: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load critical data first
        const criticalData = await prefetchCriticalData(userId);
        
        // Set initial state with critical data
        setData({
          ...criticalData,
          courses: [],
          enrollments: [],
          achievements: [],
          notifications: [],
        });
        
        // Load remaining data in background
        const remainingData = await Promise.all([
          fetchCourses(userId),
          fetchEnrollments(userId),
          fetchAchievements(userId),
          fetchNotifications(userId),
        ]);

        setData({
          ...criticalData,
          courses: remainingData[0],
          enrollments: remainingData[1],
          achievements: remainingData[2],
          notifications: remainingData[3],
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userId]);

  return { data, loading, error };
}

// ============================================================================
// PREFETCH ON HOVER/INTERACTION
// ============================================================================

export function usePrefetchOnInteraction<T>(
  key: string,
  fetcher: () => Promise<T>,
  config?: PrefetchConfig
) {
  const [prefetched, setPrefetched] = useState(false);

  const prefetch = () => {
    if (!prefetched) {
      fetchWithCache(key, fetcher, config).then(() => {
        setPrefetched(true);
      });
    }
  };

  return { prefetch, prefetched };
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

// Clean up expired cache entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    dataCache.cleanup();
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Clear cache on auth state change
export function clearCacheOnAuthChange() {
  dataCache.clear();
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// In a Next.js page component
import { prefetchDashboardData, useDashboardData } from '@/lib/data-prefetch';

// Prefetch during navigation (in getServerSideProps or generateStaticProps)
export async function getServerSideProps(context) {
  const { userId } = context.params;
  
  // Prefetch critical data for faster initial render
  const criticalData = await prefetchCriticalData(userId);
  
  return {
    props: {
      initialData: criticalData,
    },
  };
}

// In client component
function DashboardPage({ initialData }: { initialData: any }) {
  const { data, loading } = useDashboardData(userId);
  
  // Use initialData for instant render, then hydrate with full data
  const displayData = data || initialData;
  
  return (
    <div>
      // Render with data
    </div>
  );
}

// Prefetch on hover for navigation
function CourseCard({ courseId }: { courseId: string }) {
  const { prefetch } = usePrefetchOnInteraction(
    `course-details-${courseId}`,
    () => fetchCourseDetails(courseId)
  );
  
  return (
    <div onMouseEnter={prefetch}>
      // Course card
    </div>
  );
}
*/
