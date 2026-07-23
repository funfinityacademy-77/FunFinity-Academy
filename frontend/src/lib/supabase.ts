import { createClient } from '@supabase/supabase-js';
import { HybridStorage } from './cookieStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[SUPABASE_WARNING]: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Running in degraded mode or utilizing local mocks.');
}

// Use hybrid storage (cookies with localStorage fallback) for security
const hybridStorage = new HybridStorage({
  secure: true,
  httpOnly: true,
  sameSite: 'strict',
  path: '/',
});

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: hybridStorage as any,
      storageKey: 'funfinity-auth-token',
    },
  }
);
