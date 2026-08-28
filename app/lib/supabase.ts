import { createClient } from "@supabase/supabase-js";

/*
 * ============================================================
 * SUPABASE CONFIGURATION
 * ============================================================
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/*
 * ============================================================
 * SUPABASE BROWSER CLIENT
 * ============================================================
 *
 * This client is used throughout the client-side application.
 *
 * IMPORTANT:
 *
 * The authentication session is explicitly persisted in the
 * browser so that a user who signs in remains authenticated
 * when navigating from:
 *
 * /signin
 *      ↓
 * /verify
 *      ↓
 * /verify/review
 *
 * This is required because VerifyPage calls:
 *
 * supabase.auth.getUser()
 *
 * before creating the verification record.
 * ============================================================
 */

export const supabase =
  createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        /*
         * Keep the user's Supabase session in browser storage.
         */
        persistSession: true,

        /*
         * Automatically refresh the access token when needed.
         */
        autoRefreshToken: true,

        /*
         * Detect authentication sessions returned through
         * the browser URL.
         */
        detectSessionInUrl: true,
      },
    }
  );