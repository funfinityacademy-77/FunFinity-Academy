import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export interface GamificationStats {
  total_points_earned: number;
  current_streak: number;
  longest_streak: number;
  courses_completed: number;
  lessons_completed: number;
  quizzes_completed: number;
  perfect_quizzes: number;
  total_study_time_minutes: number;
  last_login_date: string | null;
  login_count: number;
  level: number;
  xp_to_next_level: number;
}

export function useGamificationBackend() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['gamification-stats', user?.id],
    queryFn: async (): Promise<GamificationStats | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('gamification_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Initialize stats if not exists
          const { data: newData, error: insertError } = await supabase
            .from('gamification_stats')
            .insert({ user_id: user.id })
            .select()
            .single();
          
          if (insertError) throw insertError;
          return newData;
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  const addPoints = useMutation({
    mutationFn: async (points: number) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase.rpc('add_gamification_points', {
        p_user_id: user.id,
        p_points: points
      });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['gamification-stats', user.id] });
    },
  });

  const updateStreak = useMutation({
    mutationFn: async (streak: number) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // First get current stats
      const { data: currentStats } = await supabase
        .from('gamification_stats')
        .select('longest_streak')
        .eq('user_id', user.id)
        .single();
      
      const newLongestStreak = Math.max(currentStats?.longest_streak || 0, streak);
      
      const { error } = await supabase
        .from('gamification_stats')
        .update({ 
          current_streak: streak,
          longest_streak: newLongestStreak
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['gamification-stats', user.id] });
    },
  });

  const incrementStat = useMutation({
    mutationFn: async (field: 'courses_completed' | 'lessons_completed' | 'quizzes_completed' | 'perfect_quizzes') => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Get current value
      const { data: currentStats } = await supabase
        .from('gamification_stats')
        .select(field)
        .eq('user_id', user.id)
        .single();
      
      const currentValue = currentStats?.[field] || 0;
      
      const { error } = await supabase
        .from('gamification_stats')
        .update({ [field]: currentValue + 1 })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['gamification-stats', user.id] });
    },
  });

  const recordLogin = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const today = new Date().toISOString().split('T')[0];
      
      // Get current login count
      const { data: currentStats } = await supabase
        .from('gamification_stats')
        .select('login_count')
        .eq('user_id', user.id)
        .single();
      
      const currentLoginCount = currentStats?.login_count || 0;
      
      const { error } = await supabase
        .from('gamification_stats')
        .update({ 
          last_login_date: today,
          login_count: currentLoginCount + 1
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['gamification-stats', user.id] });
    },
  });

  return {
    stats,
    isLoading,
    addPoints,
    updateStreak,
    incrementStat,
    recordLogin,
  };
}
