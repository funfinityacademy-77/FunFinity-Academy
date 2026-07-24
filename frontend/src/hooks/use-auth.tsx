import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types/database";
import { getUserFriendlyError } from "@/lib/error-handler";

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

const ADMIN_EMAILS = ["funfinityacademy@gmail.com", "academyfunfinity@gmail.com"];

const isAdminUser = (email: string) => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(normalizedEmail);
};

const fetchUserRole = async (userId: string, email?: string) => {
  // Direct admin check for whitelisted emails
  if (email && isAdminUser(email)) {
    console.log('Admin email detected, returning admin role');
    return "admin";
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    console.log('fetchUserRole result:', { profile, error });

    if (error) {
      console.warn('Profile query error:', error);
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        console.log('Profile not found, will create on sign-in');
      }
      return "student";
    }

    if (profile && profile.role) {
      return profile.role;
    }

    return "student";
  } catch (error) {
    console.error('fetchUserRole error:', error);
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
      console.log('loadCurrentUser called for:', authUser.id);
      const isAdmin = isAdminUser(authUser.email);
      const adminRole = isAdmin ? 'admin' : 'student';
      
      // Set user immediately without waiting for profile
      setUser({
        id: authUser.id,
        email: authUser.email,
        display_name: authUser.user_metadata.display_name || authUser.email?.split('@')[0],
        role: adminRole
      } as User);
      setRole(adminRole);
      
      // Try to load profile in background (don't block)
      (async () => {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          if (profileError || !profile) {
            console.log('Profile not found, creating in background');
            await supabase
              .from('profiles')
              .insert({
                id: authUser.id,
                email: authUser.email,
                display_name: authUser.user_metadata.display_name || authUser.email?.split('@')[0],
                role: adminRole
              });
          } else if (isAdmin && profile.role !== 'admin') {
            console.log('Updating profile role to admin');
            await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', authUser.id);
          }
        } catch (err) {
          console.warn('Profile load/update failed:', err);
        }
      })();
    } catch (error) {
      console.error('loadCurrentUser error:', error);
      if (authUser) {
        const isAdmin = isAdminUser(authUser.email);
        setUser({
          id: authUser.id,
          email: authUser.email,
          display_name: authUser.user_metadata.display_name || authUser.email?.split('@')[0],
          role: isAdmin ? 'admin' : 'student'
        } as User);
        setRole(isAdmin ? 'admin' : 'student');
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, userRole: string) => {
    try {
      console.log('Attempting sign up with:', email);
      const isAdmin = isAdminUser(email);
      const finalRole = isAdmin ? 'admin' : 'student';
      
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
        console.error('Sign up error:', error);
        throw error;
      }

      if (data.user) {
        console.log('Sign up successful for user:', data.user.id, 'with role:', finalRole);
        
        // Set user immediately
        setUser({
          id: data.user.id,
          email: email,
          display_name: name,
          role: finalRole
        } as User);
        setRole(finalRole);
        
        // Create profile in background (don't block)
        (async () => {
          try {
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: email,
                display_name: name,
                role: finalRole
              });
          } catch (err) {
            console.warn('Profile creation failed:', err);
          }
        })();
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign up failed:', error);
      const userError = getUserFriendlyError(error);
      return { error: { message: userError.message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in with:', email);
      const isAdmin = isAdminUser(email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      if (data.user) {
        console.log('Sign in successful for user:', data.user.id);
        
        // For admin emails, force admin role
        const role = isAdmin ? 'admin' : 'student';
        
        // Set user immediately without waiting for profile
        setUser({
          id: data.user.id,
          email: data.user.email,
          display_name: data.user.user_metadata.display_name || data.user.email?.split('@')[0],
          role: role
        } as User);
        
        setRole(role);
        
        // Try to create/update profile in background (don't block)
        (async () => {
          try {
            const { data: existingProfile, error: profileError } = await supabase
              .from('profiles')
              .select('id, role')
              .eq('id', data.user.id)
              .single();
            
            if (profileError || !existingProfile) {
              console.log('Creating profile in background with role:', role);
              await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: data.user.email,
                  display_name: data.user.user_metadata.display_name || data.user.email?.split('@')[0],
                  role: role
                });
            } else if (isAdmin && existingProfile.role !== 'admin') {
              console.log('Updating profile role to admin');
              await supabase
                .from('profiles')
                .update({ role: 'admin' })
                .eq('id', data.user.id);
            }
          } catch (err) {
            console.warn('Profile check/update failed:', err);
          }
        })();
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign in failed:', error);
      const userError = getUserFriendlyError(error);
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
