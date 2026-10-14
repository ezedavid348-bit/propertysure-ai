import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

/*
 * ============================================================
 * PROPERTY SURE AI
 * SUPABASE BROWSER CLIENT
 * ============================================================
 *
 * This file provides ONE shared Supabase browser client.
 *
 * IMPORTANT:
 *
 * We intentionally keep the client as a browser singleton.
 * This prevents Next.js development/HMR from creating multiple
 * GoTrueClient instances that compete for the same auth session.
 *
 * The same authenticated session must be used throughout:
 *
 * /signin
 *    ↓
 * /verify
 *    ↓
 * /verify/review
 *    ↓
 * /verify/select-plan
 *    ↓
 * /verify/checkout
 *    ↓
 * Paystack
 *    ↓
 * /verify/payment-callback
 *    ↓
 * /processing
 *    ↓
 * /result
 *
 * We DO NOT create anonymous users here.
 * ============================================================
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/*
 * ============================================================
 * ENVIRONMENT VALIDATION
 * ============================================================
 */

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is not configured."
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured."
  );
}

/*
 * ============================================================
 * BROWSER SINGLETON
 * ============================================================
 *
 * Next.js development mode can evaluate modules more than once
 * because of Fast Refresh / HMR.
 *
 * Storing the client on globalThis ensures that we reuse the
 * SAME Supabase client instead of creating another GoTrueClient
 * against the same browser auth storage.
 */

type SupabaseGlobal = typeof globalThis & {
  __propertySureSupabase?: SupabaseClient;
};

const globalSupabase =
  globalThis as SupabaseGlobal;

/*
 * ============================================================
 * CREATE / REUSE CLIENT
 * ============================================================
 */

export const supabase =
  globalSupabase.__propertySureSupabase ??
  createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        /*
         * Keep the authenticated user's session in
         * browser storage.
         */
        persistSession: true,

        /*
         * Automatically refresh expired access tokens.
         */
        autoRefreshToken: true,

        /*
         * Allow Supabase to process authentication
         * information returned through the URL.
         */
        detectSessionInUrl: true,

        /*
         * Explicitly use localStorage in the browser.
         */
        storage:
          typeof window !== "undefined"
            ? window.localStorage
            : undefined,
      },
    }
  );

/*
 * Save the client globally so subsequent module evaluations
 * reuse the exact same Supabase instance.
 */
globalSupabase.__propertySureSupabase =
  supabase;