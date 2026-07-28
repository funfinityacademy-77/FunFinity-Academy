import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export interface StorageQuota {
  storage_used_bytes: number;
  storage_limit_bytes: number;
  storage_percentage: number;
  notes_count: number;
  notes_limit: number;
  files_count: number;
  files_limit: number;
  calendar_events_count: number;
  calendar_events_limit: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  animations_enabled: boolean;
  sidebar_collapsed: boolean;
  language: string;
  timezone: string;
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export function useStorageQuota() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: quota, isLoading } = useQuery({
    queryKey: ['storage-quota', user?.id],
    queryFn: async (): Promise<StorageQuota | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase.rpc('get_user_storage_info', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user?.id,
  });

  const checkQuota = useMutation({
    mutationFn: async (operation: 'note' | 'file' | 'calendar_event') => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc('check_storage_quota', {
        p_user_id: user.id,
        p_operation: operation
      });
      
      if (error) throw error;
      return data as boolean;
    },
  });

  const updateUsage = useMutation({
    mutationFn: async ({ operation, bytes }: { operation: 'note' | 'file' | 'calendar_event'; bytes?: number }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase.rpc('update_storage_usage', {
        p_user_id: user.id,
        p_operation: operation,
        p_bytes: bytes || 0
      });
      
      if (error) throw error;
      
      // Invalidate quota query to refresh data
      queryClient.invalidateQueries({ queryKey: ['storage-quota', user.id] });
    },
  });

  return {
    quota,
    isLoading,
    checkQuota,
    updateUsage,
    isNearLimit: quota ? quota.storage_percentage > 80 : false,
    isAtLimit: quota ? quota.storage_percentage >= 100 : false,
  };
}

export function useUserPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async (): Promise<UserPreferences | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows
        throw error;
      }
      
      return {
        theme: data.theme || 'dark',
        animations_enabled: data.animations_enabled !== false,
        sidebar_collapsed: data.sidebar_collapsed || false,
        language: data.language || 'en',
        timezone: data.timezone || 'UTC',
        notification_preferences: data.notification_preferences || {
          email: true,
          push: true,
          sms: false
        }
      };
    },
    enabled: !!user?.id,
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updates
        });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['user-preferences', user.id] });
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences,
  };
}
