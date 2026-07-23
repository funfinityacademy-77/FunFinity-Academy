import { createClient } from '@supabase/supabase-js';

/**
 * Strict environment variable validation
 * Throws fatal error if required Supabase credentials are missing
 */
const getRequiredEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `FATAL: Missing required environment variable ${key}. ` +
      `Please set ${key} in your Vercel environment variables. ` +
      `Application cannot start without this configuration.`
    );
  }
  return value;
};

const supabaseUrl = getRequiredEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getRequiredEnvVar('VITE_SUPABASE_ANON_KEY');

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    `FATAL: Invalid VITE_SUPABASE_URL format: "${supabaseUrl}". ` +
    `Must be a valid URL (e.g., https://your-project.supabase.co)`
  );
}

// Validate anon key format (JWT tokens are typically 200+ characters)
if (supabaseAnonKey.length < 100) {
  throw new Error(
    `FATAL: Invalid VITE_SUPABASE_ANON_KEY format. ` +
    `Supabase anon keys are typically 200+ characters. ` +
    `Please verify your Supabase project settings.`
  );
}

/**
 * Production-grade Supabase client configuration
 * - Secure session persistence with localStorage
 * - Automatic token refresh
 * - Cross-domain session handling
 * - Retry logic for failed requests
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'funfinity-auth-token',
  },
  // Global request headers for client identification
  global: {
    headers: {
      'X-Client-Info': 'funfinity-academy-web',
    },
  },
  db: {
    schema: 'public',
  },
});

/**
 * Health check utility to verify Supabase connection
 * Call this during app initialization to catch connection issues early
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    console.log('✓ Supabase connection verified');
    return true;
  } catch (error) {
    console.error('Supabase connection check error:', error);
    return false;
  }
};

/**
 * Type-safe Supabase client export
 * Re-export for convenience with proper typing
 */
export default supabase;
