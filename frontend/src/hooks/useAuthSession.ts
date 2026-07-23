/**
 * useAuthSession Hook
 * Handles Supabase authentication state with JWT expiration handling
 * Prevents refresh loops and gracefully handles expired sessions
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';

export function useAuthSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setUser, clearUser } = useAppStore();

  const handleSessionExpired = useCallback(() => {
    // Save current route for redirect after login
    const currentPath = location.pathname;
    localStorage.setItem('redirect_after_login', currentPath);
    
    // Clear user state
    clearUser();
    
    // Show user-friendly message
    toast({
      title: 'Session expired',
      description: 'Please sign in again to continue.',
      variant: 'destructive',
    });
    
    // Redirect to auth
    navigate('/auth', { replace: true });
  }, [location.pathname, navigate, toast, clearUser]);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            handleSessionExpired();
          }
          return;
        }

        if (mounted) {
          setSession(initialSession);
          
          if (initialSession?.user) {
            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email || '',
              displayName: initialSession.user.user_metadata?.display_name,
            });
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          handleSessionExpired();
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);

        switch (event) {
          case 'SIGNED_IN':
            setSession(currentSession);
            if (currentSession?.user) {
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                displayName: currentSession.user.user_metadata?.display_name,
              });
            }
            setLoading(false);
            break;

          case 'SIGNED_OUT':
            setSession(null);
            clearUser();
            setLoading(false);
            break;

          case 'TOKEN_REFRESHED':
            setSession(currentSession);
            if (currentSession?.user) {
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                displayName: currentSession.user.user_metadata?.display_name,
              });
            }
            break;

          case 'USER_UPDATED':
            setSession(currentSession);
            if (currentSession?.user) {
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                displayName: currentSession.user.user_metadata?.display_name,
              });
            }
            break;

          default:
            break;
        }
      }
    );

    // Set up periodic session validation
    const validateSessionInterval = setInterval(async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error || !currentSession) {
          console.log('Session validation failed or no session');
          if (mounted && session) {
            handleSessionExpired();
          }
        }
      } catch (error) {
        console.error('Session validation error:', error);
      }
    }, 60000); // Validate every minute

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(validateSessionInterval);
    };
  }, [session, handleSessionExpired, setUser, clearUser]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: 'Sign out failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      clearUser();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign out failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return {
    session,
    loading,
    signOut,
    user: session?.user || null,
  };
}
