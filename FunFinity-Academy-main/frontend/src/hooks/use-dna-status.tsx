import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';

interface DNAStatus {
  dna_complete: boolean;
  dna_completed_at: string | null;
  loading: boolean;
}

export function useDNAStatus() {
  const { user } = useAuth();
  const [dnaStatus, setDnaStatus] = useState<DNAStatus>({
    dna_complete: false,
    dna_completed_at: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setDnaStatus({
        dna_complete: false,
        dna_completed_at: null,
        loading: false,
      });
      return;
    }

    const fetchDNAStatus = async () => {
      try {
        const data = await apiClient.get<any | null>(`/api/users/${user.id}/profile`);
        
        setDnaStatus({
          dna_complete: Boolean(data?.dna_complete),
          dna_completed_at: data?.dna_completed_at || null,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching DNA status:', error);
        setDnaStatus({
          dna_complete: false,
          dna_completed_at: null,
          loading: false,
        });
      }
    };

    fetchDNAStatus();
  }, [user]);

  const markDNAComplete = async () => {
    if (!user) return;

    try {
      await apiClient.put(`/api/users/${user.id}/profile`, {
        dna_complete: true,
        dna_completed_at: new Date().toISOString(),
      });

      setDnaStatus(prev => ({
        ...prev,
        dna_complete: true,
        dna_completed_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error marking DNA complete:', error);
      throw error;
    }
  };

  return {
    ...dnaStatus,
    markDNAComplete,
  };
}
