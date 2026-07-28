import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Auto-complete onboarding for all users - no confirmation required
    const completeOnboarding = async () => {
      if (!user) return;
      try {
        await apiClient.put(`/api/users/${user.id}/profile`, { onboarding_completed: true });
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      }
    };
    completeOnboarding();
  }, [user]);

  return null; // Modal is no longer shown
}
