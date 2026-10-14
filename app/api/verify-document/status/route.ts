import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/*
 * ============================================================
 * PROPERTYSURE AI — VERIFICATION STATUS API
 * ============================================================
 *
 * GET /api/verify-document/status?id=<verificationId>
 *
 * SECURITY MODEL
 * ------------------------------------------------------------
 * A verification may only be accessed when the authenticated
 * Supabase user owns either:
 *
 *   1. the verification record
 *   2. the confirmed Paystack payment attached to it
 *
 * This endpoint is READ-ONLY.
 *
 * It does NOT:
 * - start verification
 * - modify verification records
 * - modify payment records
 * - change ownership
 *
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
 * SUPABASE ADMIN CLIENT
 * ============================================================
 */

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
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
 * SUPABASE AUTH CLIENT
 * ============================================================
 */

function getSupabaseAuthClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !publicKey) {
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
 * NORMALIZE PLAN
 * ============================================================
 */

function normalizePlan(
  value: unknown,
): string | null {
  const normalized =
    String(value || "")
      .trim()
      .toLowerCase();

  return VALID_PLANS.has(
    normalized,
  )
    ? normalized
    : null;
}

/*
 * ============================================================
 * GET
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
        url.searchParams.get("id") || "",
      ).trim();

    if (!verificationId) {
      return jsonError(
        "Verification ID is required.",
        400,
      );
    }

    /*
     * ----------------------------------------------------------
     * 2. READ BEARER TOKEN
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
      console.error(
        "STATUS AUTH — NO ACCESS TOKEN",
        {
          verificationId,
        },
      );

      return jsonError(
        "Authentication is required.",
        401,
      );
    }

    /*
     * ----------------------------------------------------------
     * 3. VERIFY AUTHENTICATED USER
     * ----------------------------------------------------------
     */

    const supabaseAuth =
      getSupabaseAuthClient();

    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await supabaseAuth.auth.getUser(
        accessToken,
      );

    if (userError || !user) {
      console.error(
        "STATUS AUTH — INVALID SESSION",
        {
          verificationId,
          error:
            userError?.message ||
            null,
        },
      );

      return jsonError(
        "Your session could not be verified. Please sign in again.",
        401,
      );
    }

    const authenticatedUserId =
      String(
        user.id || "",
      ).trim();

    if (!authenticatedUserId) {
      return jsonError(
        "Authenticated user could not be identified.",
        401,
      );
    }

    console.log(
      "============================================================",
    );

    console.log(
      "STATUS DIAGNOSTIC — AUTH USER",
      {
        verificationId,
        authenticatedUserId,
        email:
          user.email || null,
      },
    );

    /*
     * ----------------------------------------------------------
     * 4. ADMIN DATABASE CLIENT
     * ----------------------------------------------------------
     */

    const supabaseAdmin =
      getSupabaseAdmin();

    /*
     * ----------------------------------------------------------
     * 5. LOAD VERIFICATION
     * ----------------------------------------------------------
     */

    const {
      data:
        verification,
      error:
        verificationError,
    } =
      await supabaseAdmin
        .from("verifications")
        .select(
          "id,user_id,doc_name,file_url,doc_type,status,trust_score,confidence,risk,findings",
        )
        .eq(
          "id",
          verificationId,
        )
        .maybeSingle();

    if (verificationError) {
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
        "STATUS — VERIFICATION NOT FOUND",
        {
          verificationId,
          authenticatedUserId,
        },
      );

      return jsonError(
        "Verification record was not found.",
        404,
      );
    }

    const verificationOwnerId =
      String(
        verification.user_id || "",
      ).trim();

    const ownsVerification =
      Boolean(
        verificationOwnerId &&
          verificationOwnerId ===
            authenticatedUserId,
      );

    console.log(
      "STATUS DIAGNOSTIC — VERIFICATION",
      {
        verificationId,
        verificationOwnerId,
        authenticatedUserId,
        verificationStatus:
          verification.status,
        ownsVerification,
      },
    );

    /*
     * ----------------------------------------------------------
     * 6. LOAD CONFIRMED PAYMENTS
     * ----------------------------------------------------------
     *
     * We intentionally search by verification_id first.
     *
     * We do NOT trust a payment merely because it belongs to
     * the current user.
     *
     * The payment must also be attached to this verification.
     * ----------------------------------------------------------
     */

    const {
      data:
        payments,
      error:
        paymentError,
    } =
      await supabaseAdmin
        .from("payments")
        .select(
          "id,verification_id,user_id,plan,amount,currency,provider,provider_reference,status,payment_method,paid_at,created_at",
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
            ascending: false,
            nullsFirst: false,
          },
        );

    if (paymentError) {
      console.error(
        "STATUS PAYMENT LOOKUP ERROR:",
        paymentError,
      );

      return jsonError(
        "Payment record could not be checked.",
        500,
      );
    }

    const payment =
      Array.isArray(payments) &&
      payments.length > 0
        ? payments[0]
        : null;

    const paymentOwnerId =
      String(
        payment?.user_id || "",
      ).trim();

    const ownsPayment =
      Boolean(
        paymentOwnerId &&
          paymentOwnerId ===
            authenticatedUserId,
      );

    console.log(
      "STATUS DIAGNOSTIC — PAYMENT",
      {
        verificationId,

        paymentFound:
          Boolean(payment),

        paymentId:
          payment?.id || null,

        paymentVerificationId:
          payment?.verification_id ||
          null,

        paymentOwnerId,

        paymentPlan:
          payment?.plan || null,

        paymentStatus:
          payment?.status || null,

        paymentProvider:
          payment?.provider || null,

        authenticatedUserId,

        ownsPayment,
      },
    );

    /*
     * ----------------------------------------------------------
     * 7. AUTHORIZATION
     * ----------------------------------------------------------
     *
     * Either ownership source is acceptable:
     *
     *   verification.user_id === auth user
     *
     * OR
     *
     *   payment.user_id === auth user
     *
     * We deliberately do NOT authorize merely because:
     *
     *   - verification exists
     *   - payment exists
     *   - user is logged in
     *   - verification ID is known
     *
     * ----------------------------------------------------------
     */

    const authorized =
      ownsVerification ||
      ownsPayment;

    console.log(
      "STATUS DIAGNOSTIC — OWNERSHIP",
      {
        verificationId,

        authenticatedUserId,

        verificationOwnerId,

        paymentOwnerId,

        ownsVerification,

        ownsPayment,

        authorized,

        authorizationSource:
          ownsVerification
            ? "verification"
            : ownsPayment
              ? "payment"
              : null,
      },
    );

    /*
     * ----------------------------------------------------------
     * 8. BLOCK UNAUTHORIZED ACCESS
     * ----------------------------------------------------------
     */

    if (!authorized) {
      console.error(
        "============================================================",
      );

      console.error(
        "STATUS AUTHORIZATION FAILED",
      );

      console.error(
        {
          verificationId,

          authenticatedUserId,

          verificationOwnerId,

          paymentOwnerId,

          ownsVerification,

          ownsPayment,

          hasVerification:
            Boolean(
              verification,
            ),

          hasPayment:
            Boolean(payment),
        },
      );

      console.error(
        "============================================================",
      );

      return jsonError(
        "You are not authorized to access this verification.",
        403,
      );
    }

    /*
     * ----------------------------------------------------------
     * 9. DETERMINE PLAN
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
      normalizePlan(
        payment?.plan,
      );

    const findingsPlan =
      normalizePlan(
        premiumFindings.plan ||
          professionalFindings.plan ||
          essentialFindings.plan ||
          findings.plan,
      );

    const plan =
      paymentPlan ||
      findingsPlan;

    /*
     * ----------------------------------------------------------
     * 10. AUTHORIZED RESPONSE
     * ----------------------------------------------------------
     */

    console.log(
      "STATUS VERIFICATION AUTHORIZED",
      {
        verificationId:
          verification.id,

        authenticatedUserId,

        authorizationSource:
          ownsVerification
            ? "verification"
            : "payment",

        verificationStatus:
          verification.status,

        finalPlan:
          plan,
      },
    );

    console.log(
      "============================================================",
    );

    /*
     * ----------------------------------------------------------
     * 11. RETURN STATUS
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
  } catch (error) {
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