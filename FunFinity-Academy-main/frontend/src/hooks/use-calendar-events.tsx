import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import { useStorageQuota } from './use-storage-quota';

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  event_type: 'general' | 'course' | 'exam' | 'assignment' | 'live_class' | 'personal';
  location?: string;
  is_recurring?: boolean;
  recurrence_pattern?: any;
  course_id?: string;
  lesson_id?: string;
  reminder_minutes_before?: number;
}

export function useCalendarEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkQuota, updateUsage } = useStorageQuota();

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createEvent = useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Check quota
      const canCreate = await checkQuota.mutateAsync('calendar_event');
      if (!canCreate) {
        throw new Error('Calendar events limit reached');
      }
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...event,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update storage usage
      await updateUsage.mutateAsync({ operation: 'calendar_event' });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
