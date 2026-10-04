import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * PropertySure AI
 * Server-side Supabase client
 *
 * IMPORTANT:
 * This client must only be used from server-side code.
 *
 * The service-role key must NEVER be exposed to the browser.
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is not configured.",
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is not configured.",
  );
}

export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);