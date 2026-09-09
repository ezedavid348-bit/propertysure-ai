import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type PlanKey = "essential" | "professional" | "premium";

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

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
     * REQUEST
     * ============================================================
     */

    const body = await request.json();

    const verificationId = String(body?.verificationId || "").trim();
    const plan = String(body?.plan || "").trim() as PlanKey;

    if (!verificationId) {
      return NextResponse.json(
        {
          error: "Verification ID is required.",
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
          error: "Invalid verification plan.",
        },
        { status: 400 },
      );
    }

    /*
     * ============================================================
     * SUPABASE SERVER CLIENT
     * ============================================================
     *
     * The service-role key is SERVER ONLY.
     * Never expose it to the browser.
     */

    const supabaseAdmin = createClient(
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
     *
     * The frontend sends the verification ID and plan.
     * We do NOT trust the browser for the payment amount.
     *
     * The authenticated user is determined from the
     * Authorization header.
     */

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 },
      );
    }

    const accessToken = authorization.replace("Bearer ", "").trim();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unable to authenticate user.",
        },
        { status: 401 },
      );
    }

    /*
     * ============================================================
     * VERIFY OWNERSHIP
     * ============================================================
     *
     * Make sure this verification belongs to the logged-in user.
     */

    const { data: verification, error: verificationError } =
      await supabaseAdmin
        .from("verifications")
        .select("id, user_id, doc_name, status")
        .eq("id", verificationId)
        .eq("user_id", user.id)
        .single();

    if (verificationError || !verification) {
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
     *
     * These prices are NOT taken from the browser.
     */

    const amount = PLAN_PRICES[plan];
    const planName = PLAN_NAMES[plan];

    /*
     * ============================================================
     * CUSTOMER EMAIL
     * ============================================================
     */

    const email = user.email;

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

    const providerReference = `PSAI-${verificationId}-${Date.now()}`;

    /*
     * ============================================================
     * CREATE PAYMENT RECORD
     * ============================================================
     */

    const { data: payment, error: paymentError } =
      await supabaseAdmin
        .from("payments")
        .insert({
          verification_id: verification.id,
          user_id: user.id,
          plan,
          amount,
          currency: "NGN",
          provider: "paystack",
          payment_method: null,
          provider_reference: providerReference,
          status: "pending",
        })
        .select()
        .single();

    if (paymentError || !payment) {
      console.error(
        "Payment record creation failed:",
        paymentError,
      );

      return NextResponse.json(
        {
          error: "Unable to create payment record.",
        },
        { status: 500 },
      );
    }

    /*
     * ============================================================
     * PAYSTACK INITIALIZATION
     * ============================================================
     *
     * Paystack expects NGN amounts in kobo.
     *
     * Example:
     * ₦299,999 = 29,999,900 kobo
     */

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: String(amount * 100),
          currency: "NGN",
          reference: providerReference,

          /*
           * Allow multiple payment channels.
           *
           * This is important for the user experience.
           * Paystack supports channels such as card,
           * bank, bank transfer, USSD and others depending
           * on the account/configuration.
           */
          channels: [
            "card",
            "bank",
            "bank_transfer",
            "ussd",
          ],

          callback_url: `${
            process.env.NEXT_PUBLIC_SITE_URL ||
            "http://localhost:3000"
          }/verify/payment-callback`,

          metadata: {
            verification_id: verification.id,
            payment_id: payment.id,
            user_id: user.id,
            plan,
            plan_name: planName,
          },
        }),
      },
    );

    const paystackData = await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData?.status ||
      !paystackData?.data?.authorization_url
    ) {
      console.error(
        "Paystack initialization failed:",
        paystackData,
      );

      /*
       * Mark our payment record as failed if Paystack
       * could not initialize the transaction.
       */

      await supabaseAdmin
        .from("payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

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
     *
     * The reference should already match our generated reference,
     * but we keep the returned value available for confirmation.
     */

    await supabaseAdmin
      .from("payments")
      .update({
        provider_reference:
          paystackData.data.reference || providerReference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    /*
     * ============================================================
     * RESPONSE TO FRONTEND
     * ============================================================
     */

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackData.data.authorization_url,
      accessCode: paystackData.data.access_code,
      reference: paystackData.data.reference,
      paymentId: payment.id,
      verificationId: verification.id,
      plan,
      amount,
      currency: "NGN",
    });
  } catch (error) {
    console.error("Payment initialization error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while preparing your payment.",
      },
      { status: 500 },
    );
  }
}