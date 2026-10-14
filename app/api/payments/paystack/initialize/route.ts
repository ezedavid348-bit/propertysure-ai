import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type PlanKey =
  | "essential"
  | "professional"
  | "premium";

const PLAN_PRICES: Record<PlanKey, number> = {
  essential: 299999,
  professional: 549999,
  premium: 999999,
};

const PLAN_NAMES: Record<PlanKey, string> = {
  essential: "Essential",
  professional: "Professional",
  premium: "Premium",
};

export async function POST(request: Request) {
  try {
    /*
     * ============================================================
     * ENVIRONMENT
     * ============================================================
     */

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseServiceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    const paystackSecretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (
      !supabaseUrl ||
      !supabaseServiceRoleKey ||
      !paystackSecretKey
    ) {
      return NextResponse.json(
        {
          error:
            "Payment service is not configured correctly on the server.",
        },
        { status: 500 },
      );
    }

    /*
     * ============================================================
     * APPLICATION ORIGIN
     * ============================================================
     *
     * For local development, PropertySure AI uses the configured
     * local site URL as the authoritative callback origin.
     *
     * This prevents Paystack from receiving localhost when the
     * application is being tested through the LAN address.
     *
     * Local:
     *
     * http://192.168.1.184:3000
     *
     * Callback:
     *
     * http://192.168.1.184:3000/verify/payment-callback
     *
     * In production, NEXT_PUBLIC_SITE_URL should contain the
     * real HTTPS production domain.
     */

    const requestOrigin =
      new URL(request.url).origin;

    const configuredSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim();

    const isDevelopment =
      process.env.NODE_ENV !== "production";

    /*
     * DEVELOPMENT:
     *
     * Prefer the explicitly configured site URL.
     *
     * This is important because the browser may still have an
     * old localhost tab/session open. We do not want that to
     * determine the Paystack callback URL.
     *
     * PRODUCTION:
     *
     * Use the configured production site URL, falling back to
     * the incoming request origin if necessary.
     */

    const siteUrl =
      isDevelopment
        ? configuredSiteUrl ||
          requestOrigin
        : configuredSiteUrl ||
          requestOrigin;

    /*
     * Remove trailing slash.
     */

    const normalizedSiteUrl =
      siteUrl.replace(/\/+$/, "");

    const callbackUrl =
      `${normalizedSiteUrl}/verify/payment-callback`;

    console.log(
      "PAYSTACK CALLBACK CONFIG:",
      {
        requestOrigin,
        configuredSiteUrl:
          configuredSiteUrl || null,
        environment:
          process.env.NODE_ENV,
        callbackUrl,
      },
    );

    /*
     * ============================================================
     * REQUEST
     * ============================================================
     */

    const body =
      await request.json();

    const verificationId =
      String(
        body?.verificationId || "",
      ).trim();

    const plan =
      String(
        body?.plan || "",
      ).trim() as PlanKey;

    if (!verificationId) {
      return NextResponse.json(
        {
          error:
            "Verification ID is required.",
        },
        { status: 400 },
      );
    }

    if (
      plan !== "essential" &&
      plan !== "professional" &&
      plan !== "premium"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid verification plan.",
        },
        { status: 400 },
      );
    }

    /*
     * ============================================================
     * SUPABASE SERVER CLIENT
     * ============================================================
     */

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        supabaseServiceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );

    /*
     * ============================================================
     * AUTHENTICATED USER
     * ============================================================
     */

    const authorization =
      request.headers.get(
        "authorization",
      );

    if (
      !authorization?.startsWith(
        "Bearer ",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Authentication required.",
        },
        { status: 401 },
      );
    }

    const accessToken =
      authorization
        .replace(
          "Bearer ",
          "",
        )
        .trim();

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
      return NextResponse.json(
        {
          error:
            "Unable to authenticate user.",
        },
        { status: 401 },
      );
    }

    /*
     * ============================================================
     * VERIFY OWNERSHIP
     * ============================================================
     */

    const {
      data: verification,
      error:
        verificationError,
    } =
      await supabaseAdmin
        .from("verifications")
        .select(
          "id,user_id,doc_name,status",
        )
        .eq(
          "id",
          verificationId,
        )
        .eq(
          "user_id",
          user.id,
        )
        .single();

    if (
      verificationError ||
      !verification
    ) {
      return NextResponse.json(
        {
          error:
            "Verification record not found or does not belong to this user.",
        },
        { status: 404 },
      );
    }

    /*
     * ============================================================
     * OFFICIAL SERVER-SIDE PRICE
     * ============================================================
     */

    const amount =
      PLAN_PRICES[plan];

    const planName =
      PLAN_NAMES[plan];

    /*
     * ============================================================
     * CUSTOMER EMAIL
     * ============================================================
     */

    const email =
      user.email;

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Your account does not have an email address. Please update your account before making payment.",
        },
        { status: 400 },
      );
    }

    /*
     * ============================================================
     * PAYMENT REFERENCE
     * ============================================================
     */

    const providerReference =
      `PSAI-${verificationId}-${Date.now()}`;

    /*
     * ============================================================
     * CREATE PAYMENT RECORD
     * ============================================================
     */

    const {
      data: payment,
      error: paymentError,
    } =
      await supabaseAdmin
        .from("payments")
        .insert({
          verification_id:
            verification.id,

          user_id:
            user.id,

          plan,

          amount,

          currency:
            "NGN",

          provider:
            "paystack",

          payment_method:
            null,

          provider_reference:
            providerReference,

          status:
            "pending",
        })
        .select()
        .single();

    if (
      paymentError ||
      !payment
    ) {
      console.error(
        "Payment record creation failed:",
        paymentError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to create payment record.",
        },
        { status: 500 },
      );
    }

    /*
     * ============================================================
     * PAYSTACK INITIALIZATION
     * ============================================================
     */

    const paystackResponse =
      await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${paystackSecretKey}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,

            amount:
              String(
                amount * 100,
              ),

            currency:
              "NGN",

            reference:
              providerReference,

            channels: [
              "card",
              "bank",
              "bank_transfer",
              "ussd",
            ],

            /*
             * Paystack receives the authoritative PropertySure
             * callback URL calculated above.
             */

            callback_url:
              callbackUrl,

            metadata: {
              verification_id:
                verification.id,

              payment_id:
                payment.id,

              user_id:
                user.id,

              plan,

              plan_name:
                planName,
            },
          }),
        },
      );

    const paystackData =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData?.status ||
      !paystackData?.data
        ?.authorization_url
    ) {
      console.error(
        "Paystack initialization failed:",
        paystackData,
      );

      await supabaseAdmin
        .from("payments")
        .update({
          status:
            "failed",

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          payment.id,
        );

      return NextResponse.json(
        {
          error:
            paystackData?.message ||
            "Unable to initialize payment.",
        },
        { status: 502 },
      );
    }

    /*
     * ============================================================
     * SAVE PAYSTACK REFERENCE
     * ============================================================
     */

    await supabaseAdmin
      .from("payments")
      .update({
        provider_reference:
          paystackData.data
            .reference ||
          providerReference,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        payment.id,
      );

    /*
     * ============================================================
     * RESPONSE
     * ============================================================
     */

    return NextResponse.json({
      success: true,

      authorizationUrl:
        paystackData.data
          .authorization_url,

      accessCode:
        paystackData.data
          .access_code,

      reference:
        paystackData.data
          .reference,

      paymentId:
        payment.id,

      verificationId:
        verification.id,

      plan,

      amount,

      currency:
        "NGN",

      callbackUrl,
    });
  } catch (error) {
    console.error(
      "Payment initialization error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while preparing your payment.",
      },
      { status: 500 },
    );
  }
}