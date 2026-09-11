import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PLAN_PRICES: Record<string, number> = {
  essential: 299999,
  professional: 549999,
  premium: 999999,
};

export async function GET(request: NextRequest) {
  try {
    const reference =
      request.nextUrl.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment reference is missing.",
        },
        { status: 400 },
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecret =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY;

    const paystackSecret =
      process.env.PAYSTACK_SECRET_KEY;

    if (
      !supabaseUrl ||
      !supabaseSecret ||
      !paystackSecret
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment verification service is not configured correctly.",
        },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseSecret,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Find the payment created during initialization.
    const { data: payment, error: paymentError } =
      await supabaseAdmin
        .from("payments")
        .select(
          "id, verification_id, user_id, plan, amount, currency, provider, provider_reference, status",
        )
        .eq("provider_reference", reference)
        .eq("provider", "paystack")
        .maybeSingle();

    if (paymentError) {
      console.error(
        "Payment lookup error:",
        paymentError,
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to find the payment record.",
        },
        { status: 500 },
      );
    }

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment record not found.",
        },
        { status: 404 },
      );
    }

    // If this payment has already been confirmed,
    // don't process it again.
    if (payment.status === "paid") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        verificationId: payment.verification_id,
        plan: payment.plan,
        amount: payment.amount,
      });
    }

    // Verify the transaction directly with Paystack.
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference,
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    const paystackResult =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackResult?.status
    ) {
      console.error(
        "Paystack verification failed:",
        paystackResult,
      );

      await supabaseAdmin
        .from("payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      return NextResponse.json(
        {
          success: false,
          error:
            "Paystack could not verify this transaction.",
        },
        { status: 400 },
      );
    }

    const transaction = paystackResult.data;

    // Paystack's transaction status must be success.
    if (transaction?.status !== "success") {
      return NextResponse.json({
        success: false,
        paymentStatus:
          transaction?.status || "unknown",
        error:
          "Payment has not been confirmed as successful.",
      });
    }

    // Confirm the currency.
    if (transaction.currency !== "NGN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment currency does not match the expected currency.",
        },
        { status: 400 },
      );
    }

    // Our plan prices are stored in Naira.
    const expectedAmount =
      PLAN_PRICES[payment.plan];

    if (!expectedAmount) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid verification plan.",
        },
        { status: 400 },
      );
    }

    // Paystack amounts are returned in kobo,
    // so convert our Naira price to kobo before comparing.
    if (
      Number(transaction.amount) !==
      expectedAmount * 100
    ) {
      console.error(
        "Payment amount mismatch:",
        {
          expected: expectedAmount * 100,
          received: transaction.amount,
        },
      );

      await supabaseAdmin
        .from("payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment amount does not match the selected plan.",
        },
        { status: 400 },
      );
    }

    // Confirm the transaction reference.
    if (
      transaction.reference !==
      payment.provider_reference
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment reference does not match our records.",
        },
        { status: 400 },
      );
    }

    // Mark payment as paid.
    const { error: updatePaymentError } =
      await supabaseAdmin
        .from("payments")
        .update({
          status: "paid",
          payment_method:
            transaction.channel || null,
          paid_at:
            transaction.paid_at ||
            new Date().toISOString(),
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", payment.id);

    if (updatePaymentError) {
      console.error(
        "Payment update error:",
        updatePaymentError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment was verified but could not be recorded.",
        },
        { status: 500 },
      );
    }

    // Activate the verification.
    const { error: verificationError } =
      await supabaseAdmin
        .from("verifications")
        .update({
          status: "processing",
        })
        .eq("id", payment.verification_id);

    if (verificationError) {
      console.error(
        "Verification activation error:",
        verificationError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment was confirmed, but verification could not be activated.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      verificationId:
        payment.verification_id,
      plan: payment.plan,
      amount: payment.amount,
      paymentMethod:
        transaction.channel || null,
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "An unexpected payment verification error occurred.",
      },
      { status: 500 },
    );
  }
}