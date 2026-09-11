import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type PlanKey =
  | "essential"
  | "professional"
  | "premium";

/*
 * ============================================================
 * SUPABASE ADMIN CLIENT
 * ============================================================
 */

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not configured.",
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured.",
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
 * JSON ERROR HELPER
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
): PlanKey | null {
  const normalized =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    normalized === "essential" ||
    normalized === "professional" ||
    normalized === "premium"
  ) {
    return normalized;
  }

  return null;
}

/*
 * ============================================================
 * GET VERIFICATION STATUS
 * ============================================================
 */

export async function GET(
  request: NextRequest,
) {
  try {
    /*
     * ----------------------------------------------------------
     * 1. CREATE SERVER SUPABASE CLIENT
     * ----------------------------------------------------------
     */

    const supabaseAdmin =
      getSupabaseAdmin();

    /*
     * ----------------------------------------------------------
     * 2. GET VERIFICATION ID
     * ----------------------------------------------------------
     */

    const { searchParams } =
      new URL(request.url);

    const verificationId =
      searchParams
        .get("id")
        ?.trim();

    if (!verificationId) {
      return jsonError(
        "Verification ID is required.",
        400,
      );
    }

    /*
     * ----------------------------------------------------------
     * 3. GET AUTHORIZATION TOKEN
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
     * 4. AUTHENTICATE USER
     * ----------------------------------------------------------
     */

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
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
        "Your session is invalid or has expired.",
        401,
      );
    }

    /*
     * ----------------------------------------------------------
     * 5. LOAD VERIFICATION
     * ----------------------------------------------------------
     *
     * IMPORTANT:
     *
     * We only request fields that exist in the current
     * verifications structure.
     *
     * There is NO verification.plan here.
     *
     * The paid plan comes from the payments table.
     * ----------------------------------------------------------
     */

    const {
      data: verification,
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
        .eq(
          "user_id",
          user.id,
        )
        .maybeSingle();

    if (
      verificationError
    ) {
      console.error(
        "STATUS VERIFICATION QUERY ERROR:",
        verificationError,
      );

      return jsonError(
        verificationError.message ||
          "Unable to load verification.",
        500,
      );
    }

    if (!verification) {
      console.warn(
        "STATUS VERIFICATION NOT FOUND:",
        {
          verificationId,
          userId: user.id,
        },
      );

      return jsonError(
        "Verification record not found.",
        404,
      );
    }

    /*
     * ----------------------------------------------------------
     * 6. LOAD PAID PAYSTACK PAYMENT
     * ----------------------------------------------------------
     *
     * The payment is linked to the SAME verification ID.
     *
     * Only a confirmed paid Paystack payment can authorize
     * Processing to start.
     * ----------------------------------------------------------
     */

    const {
      data: payments,
      error:
        paymentsError,
    } =
      await supabaseAdmin
        .from("payments")
        .select(
          "id,verification_id,user_id,plan,amount,currency,provider,payment_method,provider_reference,status,paid_at,created_at",
        )
        .eq(
          "verification_id",
          verification.id,
        )
        .eq(
          "user_id",
          user.id,
        )
        .eq(
          "provider",
          "paystack",
        )
        .eq(
          "status",
          "paid",
        );

    if (
      paymentsError
    ) {
      console.error(
        "STATUS PAYMENT QUERY ERROR:",
        paymentsError,
      );

      return jsonError(
        paymentsError.message ||
          "Unable to load payment status.",
        500,
      );
    }

    /*
     * ----------------------------------------------------------
     * 7. NORMALIZE PAYMENT ARRAY
     * ----------------------------------------------------------
     */

    const paidPayments =
      Array.isArray(payments)
        ? payments
        : [];

    /*
     * ----------------------------------------------------------
     * 8. SELECT MOST RECENT PAID PAYMENT
     * ----------------------------------------------------------
     */

    const sortedPayments =
      [...paidPayments].sort(
        (
          first,
          second,
        ) => {
          const firstTime =
            first?.created_at
              ? new Date(
                  first.created_at,
                ).getTime()
              : 0;

          const secondTime =
            second?.created_at
              ? new Date(
                  second.created_at,
                ).getTime()
              : 0;

          return (
            secondTime -
            firstTime
          );
        },
      );

    const payment =
      sortedPayments[0] ||
      null;

    /*
     * ----------------------------------------------------------
     * 9. DETERMINE THE ACTUAL PAID PLAN
     * ----------------------------------------------------------
     *
     * IMPORTANT:
     *
     * We DO NOT read:
     *
     * verification.plan
     *
     * because the current verifications schema does not contain
     * that property.
     *
     * The payment selected by the customer is authoritative.
     *
     * payment.plan
     *      ↓
     * normalizePlan()
     *      ↓
     * plan
     *
     * Example:
     *
     * payment.plan = "professional"
     *
     * result:
     *
     * plan = "professional"
     * ----------------------------------------------------------
     */

    const plan =
      normalizePlan(
        payment?.plan,
      );

    /*
     * ----------------------------------------------------------
     * 10. NO PAID PAYMENT
     * ----------------------------------------------------------
     *
     * This is NOT an API failure.
     *
     * The verification exists, but payment has not yet been
     * confirmed.
     * ----------------------------------------------------------
     */

    if (!payment) {
      console.warn(
        "STATUS PAYMENT NOT FOUND:",
        {
          verificationId:
            verification.id,

          userId:
            user.id,
        },
      );

      return NextResponse.json(
        {
          success: true,

          verification,

          plan: null,

          payment: null,
        },
        {
          status: 200,

          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        },
      );
    }

    /*
     * ----------------------------------------------------------
     * 11. PAYMENT EXISTS BUT PLAN IS INVALID
     * ----------------------------------------------------------
     */

    if (!plan) {
      console.error(
        "STATUS PAID PAYMENT HAS NO VALID PLAN:",
        {
          paymentId:
            payment.id,

          paymentPlan:
            payment.plan,
        },
      );

      return jsonError(
        "The paid verification plan could not be determined.",
        409,
      );
    }

    /*
     * ----------------------------------------------------------
     * 12. LOG VERIFIED STATUS
     * ----------------------------------------------------------
     */

    console.log(
      "PROPERTY SURE AI VERIFICATION STATUS:",
      {
        verificationId:
          verification.id,

        userId:
          user.id,

        verificationStatus:
          verification.status,

        plan,

        paymentId:
          payment.id,

        paymentStatus:
          payment.status,

        paymentProvider:
          payment.provider,

        paymentCurrency:
          payment.currency,

        paymentAmount:
          payment.amount,
      },
    );

    /*
     * ----------------------------------------------------------
     * 13. RETURN COMPLETE STATUS
     * ----------------------------------------------------------
     *
     * Processing receives:
     *
     * {
     *   success: true,
     *   verification: {...},
     *   plan: "professional",
     *   payment: {...}
     * }
     *
     * The SAME verification ID remains intact.
     * ----------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        /*
         * SAME SUPABASE VERIFICATION
         */
        verification,

        /*
         * ACTUAL PAID PLAN
         */
        plan,

        /*
         * CONFIRMED PAYMENT
         */
        payment: {
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

          payment_method:
            payment.payment_method,

          provider_reference:
            payment.provider_reference,

          status:
            payment.status,

          paid_at:
            payment.paid_at,

          created_at:
            payment.created_at ??
            null,
        },
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