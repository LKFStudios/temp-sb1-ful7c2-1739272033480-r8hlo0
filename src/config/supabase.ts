import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-jwt-secret': env.SUPABASE_JWT_SECRET
      }
    }
  }
);

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    env.SUPABASE_URL &&
    env.SUPABASE_ANON_KEY &&
    env.SUPABASE_JWT_SECRET &&
    env.SUPABASE_URL !== 'your_supabase_url_here' &&
    env.SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here' &&
    env.SUPABASE_JWT_SECRET !== 'your_supabase_jwt_secret_here'
  );
};