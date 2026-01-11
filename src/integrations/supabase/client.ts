import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    availableEnv: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  });
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'cash-recorder-auth',
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'cash-recorder-app',
    },
  },
  db: {
    schema: 'public',
  },
  // Add retry logic for failed requests
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});