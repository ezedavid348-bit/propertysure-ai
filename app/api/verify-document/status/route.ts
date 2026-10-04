import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/*
 * ============================================================
 * PROPERTYSURE AI — VERIFICATION STATUS API
 * ============================================================
 *
 * GET /api/verify-document/status?id=<verificationId>
 *
 * This endpoint is READ-ONLY.
 *
 * It:
 * - verifies the authenticated Supabase user
 * - loads the requested verification
 * - verifies that the authenticated user is connected to the
 *   verification through the verification record OR its paid
 *   payment record
 * - loads the latest confirmed Paystack payment
 * - returns the paid plan
 * - returns the current verification/progress state
 *
 * IMPORTANT:
 * - Do NOT query created_at / updated_at from verifications.
 * - Payment created_at is also not required here.
 * - This endpoint does NOT start AI verification.
 * - Processing starts the appropriate verification engine.
 * ============================================================
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_PLANS = new Set([
  "essential",
  "professional",
  "premium",
]);

/*
 * ============================================================
 * SUPABASE ADMIN
 * ============================================================
 */

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    throw new Error(
      "Supabase server configuration is missing.",
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/*
 * ============================================================
 * SUPABASE PUBLIC CLIENT
 * ============================================================
 *
 * IMPORTANT:
 *
 * The browser application currently uses:
 *
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *
 * We therefore use that key here as the primary public key.
 *
 * NEXT_PUBLIC_SUPABASE_ANON_KEY is kept as a fallback for
 * projects that still use the legacy Supabase anon key.
 * ============================================================
 */

function getSupabasePublic() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  /*
   * Primary:
   *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   *
   * Fallback:
   *   NEXT_PUBLIC_SUPABASE_ANON_KEY
   */
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !publicKey
  ) {
    throw new Error(
      "Supabase public configuration is missing. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createClient(
    supabaseUrl,
    publicKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/*
 * ============================================================
 * JSON ERROR
 * ============================================================
 */

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    },
  );
}

/*
 * ============================================================
 * GET — VERIFICATION STATUS
 * ============================================================
 */

export async function GET(
  request: Request,
) {
  try {
    /*
     * ----------------------------------------------------------
     * 1. READ VERIFICATION ID
     * ----------------------------------------------------------
     */

    const url =
      new URL(request.url);

    const verificationId =
      String(
        url.searchParams.get(
          "id",
        ) || "",
      ).trim();

    if (!verificationId) {
      return jsonError(
        "Verification ID is required.",
        400,
      );
    }

    /*
     * ----------------------------------------------------------
     * 2. READ AUTHORIZATION HEADER
     * ----------------------------------------------------------
     */

    const authorization =
      request.headers.get(
        "authorization",
      ) || "";

    const accessToken =
      authorization
        .replace(
          /^Bearer\s+/i,
          "",
        )
        .trim();

    if (!accessToken) {
      return jsonError(
        "Authentication is required.",
        401,
      );
    }

    /*
     * ----------------------------------------------------------
     * 3. VERIFY SUPABASE USER
     * ----------------------------------------------------------
     */

    const supabasePublic =
      getSupabasePublic();

    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await supabasePublic.auth.getUser(
        accessToken,
      );

    if (
      userError ||
      !user
    ) {
      console.error(
        "STATUS AUTH ERROR:",
        userError,
      );

      return jsonError(
        "Your session could not be verified. Please sign in again.",
        401,
      );
    }

    /*
     * ----------------------------------------------------------
     * 4. ADMIN CLIENT
     * ----------------------------------------------------------
     */

    const supabaseAdmin =
      getSupabaseAdmin();

    /*
     * ----------------------------------------------------------
     * 5. LOAD VERIFICATION BY ID
     * ----------------------------------------------------------
     *
     * IMPORTANT:
     *
     * We intentionally DO NOT put:
     *
     *   .eq("user_id", user.id)
     *
     * on this first query.
     *
     * We need to inspect the actual ownership relationship first.
     *
     * This also allows us to diagnose the situation where the
     * verification was created under an anonymous/session user
     * while the payment belongs to the currently authenticated
     * user.
     * ----------------------------------------------------------
     */

    const {
      data:
        verification,
      error:
        verificationError,
    } =
      await supabaseAdmin
        .from(
          "verifications",
        )
        .select(
          "id,user_id,doc_name,file_url,doc_type,status,trust_score,confidence,risk,findings",
        )
        .eq(
          "id",
          verificationId,
        )
        .maybeSingle();

    if (
      verificationError
    ) {
      console.error(
        "STATUS VERIFICATION LOAD ERROR:",
        verificationError,
      );

      return jsonError(
        "Verification record could not be loaded.",
        500,
      );
    }

    if (!verification) {
      console.error(
        "STATUS VERIFICATION NOT FOUND:",
        {
          verificationId,
          authenticatedUserId:
            user.id,
        },
      );

      return jsonError(
        "Verification record was not found.",
        404,
      );
    }

    /*
     * ----------------------------------------------------------
     * 6. LOAD CONFIRMED PAYMENT
     * ----------------------------------------------------------
     *
     * We deliberately load the payment using ONLY the
     * verification ID first.
     *
     * This lets us determine whether the payment belongs to
     * the currently authenticated user even if the verification
     * record was created under an earlier/anonymous session ID.
     * ----------------------------------------------------------
     */

    const {
      data:
        payment,
      error:
        paymentError,
    } =
      await supabaseAdmin
        .from(
          "payments",
        )
        .select(
          "id,verification_id,user_id,plan,amount,currency,provider,provider_reference,status,payment_method,paid_at",
        )
        .eq(
          "verification_id",
          verificationId,
        )
        .eq(
          "provider",
          "paystack",
        )
        .eq(
          "status",
          "paid",
        )
        .in(
          "plan",
          [
            "essential",
            "professional",
            "premium",
          ],
        )
        .order(
          "paid_at",
          {
            ascending:
              false,
          },
        )
        .limit(1)
        .maybeSingle();

    if (
      paymentError
    ) {
      console.error(
        "STATUS PAYMENT LOOKUP ERROR:",
        paymentError,
      );

      return jsonError(
        "Payment record could not be checked.",
        500,
      );
    }

    /*
     * ----------------------------------------------------------
     * 7. AUTHORIZATION
     * ----------------------------------------------------------
     *
     * A verification is considered accessible when the current
     * authenticated user owns either:
     *
     * A. the verification record
     *
     * OR
     *
     * B. the confirmed payment attached to that verification.
     *
     * This handles the anonymous-auth/session transition without
     * exposing unrelated verification records.
     *
     * We NEVER authorize based only on knowing the verification ID.
     * ----------------------------------------------------------
     */

    const verificationOwnerId =
      String(
        verification.user_id ||
          "",
      ).trim();

    const paymentOwnerId =
      String(
        payment?.user_id ||
          "",
      ).trim();

    const authenticatedUserId =
      String(
        user.id ||
          "",
      ).trim();

    const ownsVerification =
      Boolean(
        verificationOwnerId &&
          verificationOwnerId ===
            authenticatedUserId,
      );

    const ownsPayment =
      Boolean(
        paymentOwnerId &&
          paymentOwnerId ===
            authenticatedUserId,
      );

    const authorized =
      ownsVerification ||
      ownsPayment;

    console.log(
      "STATUS AUTHORIZATION CHECK:",
      {
        verificationId,

        authenticatedUserId,

        verificationOwnerId,

        paymentOwnerId,

        ownsVerification,

        ownsPayment,

        authorized,
      },
    );

    if (!authorized) {
      /*
       * Do not expose another user's IDs to the browser.
       *
       * The detailed ownership information is already logged
       * server-side for development/debugging.
       */

      console.error(
        "STATUS AUTHORIZATION FAILED:",
        {
          verificationId,
          authenticatedUserId,
          hasVerificationOwner:
            Boolean(
              verificationOwnerId,
            ),
          hasPaymentOwner:
            Boolean(
              paymentOwnerId,
            ),
          hasPaidPayment:
            Boolean(
              payment,
            ),
        },
      );

      return jsonError(
        "You are not authorized to access this verification.",
        403,
      );
    }

    /*
     * ----------------------------------------------------------
     * 8. PLAN FALLBACK
     * ----------------------------------------------------------
     *
     * The paid payment is authoritative.
     *
     * If there is no payment row, older verification records may
     * already contain the plan in findings.
     * ----------------------------------------------------------
     */

    const findings =
      verification.findings &&
      typeof verification.findings ===
        "object" &&
      !Array.isArray(
        verification.findings,
      )
        ? (verification.findings as Record<
            string,
            unknown
          >)
        : {};

    const essentialFindings =
      findings.essential &&
      typeof findings.essential ===
        "object" &&
      !Array.isArray(
        findings.essential,
      )
        ? (findings.essential as Record<
            string,
            unknown
          >)
        : {};

    const professionalFindings =
      findings.professional &&
      typeof findings.professional ===
        "object" &&
      !Array.isArray(
        findings.professional,
      )
        ? (findings.professional as Record<
            string,
            unknown
          >)
        : {};

    const premiumFindings =
      findings.premium &&
      typeof findings.premium ===
        "object" &&
      !Array.isArray(
        findings.premium,
      )
        ? (findings.premium as Record<
            string,
            unknown
          >)
        : {};

    const paymentPlan =
      String(
        payment?.plan ||
          "",
      )
        .trim()
        .toLowerCase();

    const findingsPlan =
      String(
        premiumFindings.plan ||
          professionalFindings.plan ||
          essentialFindings.plan ||
          findings.plan ||
          "",
      )
        .trim()
        .toLowerCase();

    const rawPlan =
      paymentPlan ||
      findingsPlan;

    const plan =
      VALID_PLANS.has(
        rawPlan,
      )
        ? rawPlan
        : null;

    /*
     * ----------------------------------------------------------
     * 9. DEVELOPMENT LOG
     * ----------------------------------------------------------
     */

    console.log(
      "STATUS VERIFICATION AUTHORIZED:",
      {
        verificationId:
          verification.id,

        authenticatedUserId,

        verificationOwnerId,

        paymentOwnerId,

        authorizationSource:
          ownsVerification
            ? "verification"
            : ownsPayment
              ? "payment"
              : "none",

        verificationStatus:
          verification.status,

        paymentStatus:
          payment?.status ||
          null,

        paymentPlan:
          payment?.plan ||
          null,

        finalPlan:
          plan,
      },
    );

    /*
     * ----------------------------------------------------------
     * 10. RESPONSE
     * ----------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        verification: {
          id:
            verification.id,

          user_id:
            verification.user_id,

          doc_name:
            verification.doc_name,

          file_url:
            verification.file_url,

          doc_type:
            verification.doc_type,

          status:
            verification.status,

          trust_score:
            verification.trust_score,

          confidence:
            verification.confidence,

          risk:
            verification.risk,

          findings:
            verification.findings,
        },

        plan,

        payment:
          payment
            ? {
                id:
                  payment.id,

                verification_id:
                  payment.verification_id,

                user_id:
                  payment.user_id,

                plan:
                  payment.plan,

                amount:
                  payment.amount,

                currency:
                  payment.currency,

                provider:
                  payment.provider,

                provider_reference:
                  payment.provider_reference,

                status:
                  payment.status,

                payment_method:
                  payment.payment_method,

                paid_at:
                  payment.paid_at,
              }
            : null,

        message:
          payment
            ? "Verification status loaded successfully."
            : "Verification status loaded. No confirmed Paystack payment was found yet.",
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "VERIFICATION STATUS API ERROR:",
      error,
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Verification status could not be loaded.",
      500,
    );
  }
}