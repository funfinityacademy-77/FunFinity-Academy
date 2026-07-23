import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertTriangle, Shield } from "lucide-react";
import { useMaintenance } from "@/hooks/use-maintenance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, requireOnboarding = false }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const { isMaintenanceActive } = useMaintenance();

  // Check onboarding status for student role
  const { data: onboardingStatus, isLoading: checkingOnboarding } = useQuery({
    queryKey: ['onboarding-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return { dna_complete: false, academic_complete: false };
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('dna_complete')
          .eq('id', user.id)
          .single();
        
        // Check academic profile separately - handle errors gracefully
        let academic_complete = false;
        try {
          const { data: academicProfile } = await supabase
            .from('academic_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          academic_complete = !!academicProfile;
        } catch (error) {
          // If academic_profiles table doesn't exist or has permission issues, 
          // don't block the user - just mark as complete for onboarding purposes
          console.log('Academic profile check failed, treating as complete:', error);
          academic_complete = true;
        }
        
        return {
          dna_complete: data?.dna_complete || false,
          academic_complete
        };
      } catch (error) {
        console.log('Onboarding status check failed, allowing access:', error);
        // If profile check fails, allow access to prevent blocking
        return { dna_complete: true, academic_complete: true };
      }
    },
    enabled: !!user?.id && role === 'student' && requireOnboarding,
    refetchOnWindowFocus: false
  });

  console.log('ProtectedRoute state v2:', { loading, user: !!user, role, allowedRoles: JSON.stringify(allowedRoles), userObj: user, onboardingStatus });

  if (loading || (requireOnboarding && role === 'student' && checkingOnboarding)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">
          Ecosystem is building up right now please cooperate.
        </p>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Onboarding guardrail - block dashboard access for new students
  if (requireOnboarding && role === 'student' && onboardingStatus) {
    const { dna_complete, academic_complete } = onboardingStatus;
    
    // If onboarding not complete, redirect to welcome gateway
    if (!dna_complete) {
      console.log('ProtectedRoute: DNA onboarding incomplete, redirecting to welcome gateway');
      return <Navigate to="/app/welcome-gateway" replace />;
    }
  }

  // Maintenance mode check
  if (role !== "admin" && isMaintenanceActive()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-4">
          OUR ECOSYSTEM IS UNDER MAINTENANCE. PLEASE SUPPORT US BY YOUR COOPERATION.
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-lg">
          We are performing scheduled maintenance to improve your experience. System access will be restored shortly.
        </p>
      </div>
    );
  }

  if (allowedRoles && role && !allowedRoles.includes(role.toLowerCase())) {
    console.log('ProtectedRoute: Role check failed', { role, allowedRoles });
    const pathMap: Record<string, string> = { student: "/app", admin: "/admin" };
    return <Navigate to={pathMap[role.toLowerCase()] || "/app"} replace />;
  }

  return <>{children}</>;
}
