import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID =
  import.meta.env?.VITE_SUPABASE_PROJECT_ID || 'dkkvulqgfsiuaqadubum';

export const SUPABASE_URL =
  import.meta.env?.VITE_SUPABASE_URL || 'https://dkkvulqgfsiuaqadubum.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_nHZDs5bDhArDsR2X8Nrbdg_uhtWgnam';

// Create and export singleton client instance with auto-refreshing sessions
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
