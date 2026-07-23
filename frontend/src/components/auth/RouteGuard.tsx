/**
 * Client-Side Route Guard for Vite/React Router
 * Handles authentication, role-based access, and regional compliance
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { isCountrySupported } from '@/utils/geoPricing';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  allowedRoles?: string[];
}

interface UserProfile {
  id: string;
  is_banned?: boolean;
  banned_until?: string;
  user_roles?: Array<{ role: string }>;
}

export function RouteGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
  allowedRoles = [],
}: RouteGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check regional compliance
        const countryCode = localStorage.getItem('user_country_code');
        if (countryCode && !isCountrySupported(countryCode)) {
          navigate('/restricted');
          return;
        }

        // If no auth required, allow access
        if (!requireAuth && !requireAdmin && allowedRoles.length === 0) {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // Redirect to auth with return URL
          const redirectUrl = `/auth?redirect=${encodeURIComponent(location.pathname)}`;
          navigate(redirectUrl);
          return;
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, is_banned, banned_until, user_roles')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          navigate('/auth');
          return;
        }

        // Check if account is banned
        if (profile.is_banned) {
          const bannedUntil = profile.banned_until ? new Date(profile.banned_until) : null;
          const isPermanentlyBanned = !bannedUntil;
          const isBanActive = bannedUntil && bannedUntil > new Date();

          if (isPermanentlyBanned || isBanActive) {
            navigate('/account-banned');
            return;
          }
        }

        // Check admin role if required
        if (requireAdmin) {
          const userRoles = profile.user_roles || [];
          const isAdmin = userRoles.some((r: any) => r.role === 'admin');

          if (!isAdmin) {
            navigate('/app');
            return;
          }
        }

        // Check allowed roles if specified
        if (allowedRoles.length > 0) {
          const userRoles = profile.user_roles || [];
          const hasRequiredRole = allowedRoles.some(role =>
            userRoles.some((r: any) => r.role === role)
          );

          if (!hasRequiredRole) {
            navigate('/app');
            return;
          }
        }

        setAuthorized(true);
      } catch (error) {
        console.error('Route guard error:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [navigate, location, requireAuth, requireAdmin, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}

/**
 * HOC for protecting routes
 */
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RouteGuardProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <RouteGuard {...guardProps}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}
