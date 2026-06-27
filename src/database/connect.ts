import { createClient } from '@supabase/supabase-js';
import env from '../config/env';

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

// Create and export the admin level Supabase client (service role) to run backend operations
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function connectDatabase() {
  console.log('[DB] Supabase connection client initialized.');
  return {
    close: async () => {
      console.log('[DB] Supabase client connection released.');
    },
  };
}

export default connectDatabase;
