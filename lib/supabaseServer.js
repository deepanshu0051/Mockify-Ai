/**
 * Server-only Supabase client using the Service Role key.
 * NEVER import this file in client components or pages with 'use client'.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    '[supabaseServer] Missing environment variable: NEXT_PUBLIC_SUPABASE_URL'
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    '[supabaseServer] Missing environment variable: SUPABASE_SERVICE_ROLE_KEY'
  );
}

const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // Service role client should never persist auth sessions
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabaseServer;
