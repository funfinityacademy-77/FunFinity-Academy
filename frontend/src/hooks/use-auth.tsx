import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types/database";
import { getUserFriendlyError } from "@/lib/error-handler";
import { CONTACT_EMAIL } from "@/config/constants";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  signUp: (email: string, password: string, name: string, role: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = [CONTACT_EMAIL, "academyfunfinity@gmail.com"];

// Direct admin check - bypasses database for specific credentials
const isAdminUser = (email: string, password?: string) => {
  if (!email) {
    console.log('isAdminUser: No email provided');
    return false;
  }
  const normalizedEmail = email.toLowerCase().trim();
  const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
  console.log('isAdminUser:', { email, normalizedEmail, isAdmin, whitelist: ADMIN_EMAILS });
  return isAdmin;
};

// Allow admin role assignment from database without email whitelist
const canBeAdmin = (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(normalizedEmail);
};
// Client-side rate limiting (temporarily disabled for testing)
const RATE_LIMIT_MS = 60000; // 1 minute between attempts
const rateLimitStore = new Map<string, number>();

function checkRateLimit(action: string): boolean {
  const key = `${action}_${Date.now()}`;
  const now = Date.now();
  
  // Clean up old entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (now - v > RATE_LIMIT_MS) {
      rateLimitStore.delete(k);
    }
  }
  
  // Check if recent attempt exists
  for (const [k, v] of rateLimitStore.entries()) {
    if (k.startsWith(action) && now - v < RATE_LIMIT_MS) {
      return false;
    }
  }
  
  rateLimitStore.set(key, now);
  return true;
}

const fetchUserRole = async (userId: string, email?: string) => {
  console.log('fetchUserRole called:', { userId, email });

  // Direct admin check - bypass database for whitelisted emails
  if (email && isAdminUser(email)) {
    console.log('fetchUserRole: Email is in admin whitelist, returning admin directly');
    return "admin";
  }

  try {
    // First try to get role from profiles table to avoid RLS recursion
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    console.log('fetchUserRole profile query result:', { profile, profileError });

    if (profile && profile.role) {
      console.log('fetchUserRole: Role from profiles table:', profile.role);
      return profile.role;
    }

    // Fallback to user_roles table if profiles doesn't have role
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    console.log('fetchUserRole user_roles query result:', { data, error });

    if (error || !data) {
      console.log('fetchUserRole: No role found in database, defaulting to student');
      // If no role found, default to student
      return "student";
    }

    const role = data.role;
    console.log('fetchUserRole: Role from user_roles database:', role);
    return role;
  } catch (error) {
    console.error('fetchUserRole: Error:', error);
    console.log('fetchUserRole: Fallback to student');
    return "student";
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Check for existing Supabase session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session) {
            await loadCurrentUser(session.user);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        if (session) {
          // Session exists - load user data
          await loadCurrentUser(session.user);
        } else {
          // Only clear user state if this is a SIGN_OUT event
          // This prevents automatic logout on token refresh or other auth events
          if (_event === 'SIGNED_OUT') {
            setUser(null);
            setRole(null);
          }
          // For other events (like TOKEN_REFRESHED), keep the user state
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadCurrentUser = async (authUser: any) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !profile) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            display_name: authUser.user_metadata.display_name || authUser.email?.split('@')[0],
            role: isAdminUser(authUser.email) ? 'admin' : 'student'
          })
          .select()
          .single();

        if (createError) {
          // Set fallback user so the session isn't broken
          setUser({
            id: authUser.id,
            email: authUser.email,
            display_name: authUser.user_metadata.display_name || authUser.email?.split('@')[0],
            role: isAdminUser(authUser.email) ? 'admin' : 'student'
          } as User);
          setRole(isAdminUser(authUser.email) ? 'admin' : 'student');
        } else {
          setUser(newProfile as User);
          setRole(isAdminUser(authUser.email) ? 'admin' : 'student');
        }
      } else {
        // For whitelisted admin emails, force admin role in database and state
        if (authUser.email && isAdminUser(authUser.email)) {
          console.log('loadCurrentUser: Whitelisted admin email, updating profile role to admin');
          // Update profile role to admin in database
          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', authUser.id);
          
          setUser(profile as User);
          setRole('admin');
        } else {
          setUser(profile as User);
          // Use profile.role directly to avoid RLS recursion
          const userRole = profile.role || 'student';
          console.log('loadCurrentUser: Role from profile:', userRole);
          setRole(userRole);
        }
      }
    } catch (error) {
      // Even if everything fails, set a fallback so the user stays authenticated in UI
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          display_name: authUser.user_metadata.display_name || authUser.email?.split('@')[0],
          role: isAdminUser(authUser.email) ? 'admin' : 'student'
        } as User);
        setRole(isAdminUser(authUser.email) ? 'admin' : 'student');
      }
    } finally {
      setLoading(false);
      console.log('loadCurrentUser completed, loading set to false');
    }
  };

  const signUp = async (email: string, password: string, name: string, userRole: string) => {
    // Force admin role for whitelisted emails, ignore passed role
    const finalRole = isAdminUser(email) ? 'admin' : 'student';
    
    // Check client-side rate limit (temporarily disabled for testing)
    // if (!checkRateLimit('signup')) {
    //   return { error: { message: 'Rate Limit Error: Please wait 1 minute before attempting to sign up again.' } };
    // }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            role: finalRole
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Force admin role in database for whitelisted emails
        if (isAdminUser(email)) {
          await supabase
            .from('user_roles')
            .upsert({ user_id: data.user.id, role: 'admin' }, { onConflict: 'user_id' });
        }
        
        // Check if profile already exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // Profile check error
        }

        if (existingProfile) {
          setUser(existingProfile as User);
          // Force admin role for whitelisted emails
          const adminRole = isAdminUser(email) ? 'admin' : (existingProfile.role || finalRole);
          setRole(adminRole);
        } else {
          // Create profile if it doesn't exist
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              display_name: name,
              role: finalRole
            });

          if (profileError) {
            // If profile creation fails due to duplicate, try to fetch it again
            if (profileError.code === '23505' || profileError.message.includes('duplicate key')) {
              const { data: retryProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
              
              if (retryProfile) {
                setUser(retryProfile as User);
                const adminRole = isAdminUser(email) ? 'admin' : (retryProfile.role || finalRole);
                setRole(adminRole);
                return { error: null };
              }
            }
            throw profileError;
          }

          setUser({
            id: data.user.id,
            email: email,
            display_name: name,
            role: finalRole
          } as User);
          setRole(finalRole);
        }
      }

      return { error: null };
    } catch (error: any) {
      const userError = getUserFriendlyError(error);
      return { error: { message: userError.message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    // Check client-side rate limit (temporarily disabled for testing)
    // if (!checkRateLimit('signin')) {
    //   return { error: { message: 'Rate Limit Error: Please wait 1 minute before attempting to sign in again.' } };
    // }
    
    const isAdminEmail = isAdminUser(email);
    console.log('SignIn: Email:', email, 'Is admin email:', isAdminEmail);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        console.log('SignIn: User authenticated:', data.user.id, data.user.email);
        
        // Direct admin role assignment for whitelisted emails
        const finalRole = isAdminEmail ? 'admin' : 'student';
        
        setUser({
          id: data.user.id,
          email: data.user.email,
          display_name: data.user.user_metadata.display_name || data.user.email?.split('@')[0],
          role: finalRole
        } as User);
        
        // Set role directly based on email whitelist
        setRole(finalRole);
        console.log('SignIn: Role set to:', finalRole);
      }

      return { error: null };
    } catch (error: any) {
      const userError = getUserFriendlyError(error);
      console.error('SignIn: Error:', error);
      
      // If admin email and account doesn't exist → auto-create
      if (isAdminEmail) {
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: "Funfinity Admin",
                role: "admin"
              }
            }
          });

          if (signUpError) throw signUpError;

          if (signUpData.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: signUpData.user.id,
                email: email,
                display_name: "Funfinity Admin",
                role: "admin"
              });

            if (profileError) throw profileError;

            setUser({
              id: signUpData.user.id,
              email: email,
              display_name: "Funfinity Admin",
              role: "admin"
            } as User);
            setRole("admin");
          }

          return { error: null };
        } catch (signUpError: any) {
          return { error: { message: "Admin account exists with a different password. Please contact support." } };
        }
      }
      
      return { error: { message: userError.message } };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      const userError = getUserFriendlyError(error);
      return { error: { message: userError.message } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    // Clear any local storage items related to auth
    localStorage.removeItem('funfinity-auth-token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, signUp, signIn, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
