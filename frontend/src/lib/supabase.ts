import { createClient } from '@supabase/supabase-js';
import { HybridStorage } from './cookieStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.'
  );
}

// Use hybrid storage (cookies with localStorage fallback) for security
const hybridStorage = new HybridStorage({
  secure: true,
  httpOnly: true,
  sameSite: 'strict',
  path: '/',
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: hybridStorage as any,
    storageKey: 'funfinity-auth-token',
  },
});
