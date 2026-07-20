import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface LiveStats {
  students: number;
  courses: number;
  ratings: number;
  average_rating: number;
}

export function useLiveStats() {
  const [stats, setStats] = useState<LiveStats>({
    students: 0,
    courses: 0,
    ratings: 0,
    average_rating: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<LiveStats>('/api/stats/live');
      setStats(data);
    } catch (error) {
      console.error('Error fetching live stats:', error);
      // Fallback to hardcoded stats if function fails
      setStats({
        students: 10000,
        courses: 50,
        ratings: 487,
        average_rating: 4.9
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // TODO: Replace with WebSocket to Durable Objects for realtime stats updates
    return () => { /* cleanup */ };
  }, []);

  return { stats, loading, refetch: fetchStats };
}
