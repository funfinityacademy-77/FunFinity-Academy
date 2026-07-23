import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export function useSupabaseRealtime<T>(
  tableName: string,
  initialData: T[] = [],
  filter?: string
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    async function setupRealtime() {
      try {
        // Initial fetch
        const { data: initialFetch, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .eq(filter?.split('=')[0] || '', filter?.split('=')[1] || '')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setData(initialFetch || []);
        setLoading(false);

        // Set up realtime subscription
        channel = supabase
          .channel(`${tableName}_changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: tableName,
              filter: filter
            },
            (payload) => {
              const { eventType, new: newRecord, old: oldRecord } = payload;

              setData((currentData) => {
                switch (eventType) {
                  case 'INSERT':
                    return [newRecord as T, ...currentData];
                  case 'UPDATE':
                    return currentData.map((item) =>
                      (item as any).id === (newRecord as any).id
                        ? (newRecord as T)
                        : item
                    );
                  case 'DELETE':
                    return currentData.filter(
                      (item) => (item as any).id !== (oldRecord as any).id
                    );
                  default:
                    return currentData;
                }
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`Realtime subscription active for ${tableName}`);
            } else if (status === 'CHANNEL_ERROR') {
              setError(new Error(`Realtime subscription error for ${tableName}`));
            }
          });
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tableName, filter]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: refreshedData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq(filter?.split('=')[0] || '', filter?.split('=')[1] || '')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setData(refreshedData || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [tableName, filter]);

  return { data, loading, error, refresh };
}

// Hook for single record real-time updates
export function useSupabaseRealtimeSingle<T>(
  tableName: string,
  recordId: string | null,
  initialData: T | null = null
) {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!recordId) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;

    async function setupRealtime() {
      try {
        // Initial fetch
        const { data: initialFetch, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', recordId)
          .single();

        if (fetchError) throw fetchError;
        setData(initialFetch);
        setLoading(false);

        // Set up realtime subscription
        channel = supabase
          .channel(`${tableName}_${recordId}_changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: tableName,
              filter: `id=eq.${recordId}`
            },
            (payload) => {
              const { eventType, new: newRecord } = payload;

              if (eventType === 'UPDATE' || eventType === 'INSERT') {
                setData(newRecord as T);
              } else if (eventType === 'DELETE') {
                setData(null);
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`Realtime subscription active for ${tableName}:${recordId}`);
            } else if (status === 'CHANNEL_ERROR') {
              setError(new Error(`Realtime subscription error for ${tableName}:${recordId}`));
            }
          });
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    }

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tableName, recordId]);

  const refresh = useCallback(async () => {
    if (!recordId) return;
    
    setLoading(true);
    try {
      const { data: refreshedData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', recordId)
        .single();

      if (fetchError) throw fetchError;
      setData(refreshedData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [tableName, recordId]);

  return { data, loading, error, refresh };
}
