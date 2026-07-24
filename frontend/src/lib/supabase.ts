import { createClient } from '@supabase/supabase-js';

/**
 * Resilient environment variable loading with sanitization
 * Logs warnings instead of crashing the app for better UX
 */
const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    console.error(
      `⚠️ Missing environment variable: ${key}. ` +
      `Please set ${key} in your Vercel environment variables. ` +
      `Some features may not work correctly.`
    );
    return '';
  }
  // Trim whitespace and remove trailing slashes
  return value.trim().replace(/\/$/, '');
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Validate URL format (non-blocking)
let isValidUrl = false;
if (supabaseUrl) {
  try {
    new URL(supabaseUrl);
    isValidUrl = true;
  } catch (error) {
    console.error(
      `⚠️ Invalid VITE_SUPABASE_URL format: "${supabaseUrl}". ` +
      `Must be a valid URL (e.g., https://your-project.supabase.co)`
    );
  }
}

// Validate anon key format (non-blocking)
let isValidKey = false;
if (supabaseAnonKey && supabaseAnonKey.length >= 100) {
  isValidKey = true;
} else if (supabaseAnonKey) {
  console.error(
    `⚠️ Invalid VITE_SUPABASE_ANON_KEY format. ` +
    `Supabase anon keys are typically 200+ characters. ` +
    `Please verify your Supabase project settings.`
  );
}

/**
 * Production-grade Supabase client configuration
 * - Secure session persistence with localStorage
 * - Automatic token refresh
 * - Cross-domain session handling
 * - Resilient to connection failures
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
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
  }
);

/**
 * Connection status tracking
 */
export let isSupabaseConfigured = isValidUrl && isValidKey;
export let connectionStatus: 'unknown' | 'connected' | 'disconnected' = 'unknown';

/**
 * Health check utility to verify Supabase connection
 * Call this during app initialization to catch connection issues early
 * Implements retry logic for resilience
 */
export const checkSupabaseConnection = async (
  retries = 3,
  delayMs = 1000
): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not properly configured. Skipping connection check.');
    connectionStatus = 'disconnected';
    return false;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        console.error(`Supabase connection check failed (attempt ${attempt}/${retries}):`, error);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        connectionStatus = 'disconnected';
        return false;
      }
      console.log('✓ Supabase connection verified');
      connectionStatus = 'connected';
      return true;
    } catch (error) {
      console.error(`Supabase connection check error (attempt ${attempt}/${retries}):`, error);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      connectionStatus = 'disconnected';
      return false;
    }
  }
  connectionStatus = 'disconnected';
  return false;
};

/**
 * Safe query wrapper with explicit error handling
 * Use this for all Supabase queries to ensure graceful error handling
 */
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackValue: T | null = null,
  context: string = 'Query'
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const { data, error } = await queryFn();
    if (error) {
      console.error(`Supabase ${context} Error:`, error.message, error.details);
      return { data: fallbackValue, error: error.message };
    }
    return { data, error: null };
  } catch (error) {
    console.error(`Supabase ${context} Exception:`, error);
    return { data: fallbackValue, error: 'Unexpected error occurred' };
  }
};

/**
 * Type-safe Supabase client export
 * Re-export for convenience with proper typing
 */
export default supabase;
