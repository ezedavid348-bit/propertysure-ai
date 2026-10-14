import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PLAN_PRICES: Record<string, number> = {
  essential: 299999,
  professional: 549999,
  premium: 999999,
};

type PaymentRecord = {
  id: string;
  verification_id: number;
  user_id: string;
  plan: string;
  amount: number;
  currency: string;
  provider: string;
  provider_reference: string | null;
  status: string;
  created_at?: string;
};

export async function GET(request: NextRequest) {
  try {
    /*
     * ============================================================
     * 1. GET PAYSTACK CALLBACK REFERENCE
     * ============================================================
     */

    const callbackReference = (
      request.nextUrl.searchParams.get("reference") ||
      request.nextUrl.searchParams.get("trxref") ||
      ""
    ).trim();

    if (!callbackReference) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment reference is missing.",
        },
        { status: 400 },
      );
    }

    console.log(
      "PAYMENT VERIFY — REFERENCE RECEIVED:",
      JSON.stringify(callbackReference),
    );

    /*
     * ============================================================
     * 2. ENVIRONMENT CONFIGURATION
     * ============================================================
     */

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

    /*
     * ============================================================
     * 3. SUPABASE ADMIN CLIENT
     * ============================================================
     */

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

    /*
     * ============================================================
     * 4. FIND VERIFICATION ID FROM CALLBACK REFERENCE
     * ============================================================
     *
     * Example:
     *
     * PSAI-182-179128774989
     *
     * becomes:
     *
     * verificationId = 182
     */

    const referenceMatch =
      callbackReference.match(
        /^PSAI-(\d+)-/,
      );

    const extractedVerificationId =
      referenceMatch
        ? Number(referenceMatch[1])
        : null;

    console.log(
      "PAYMENT VERIFY — EXTRACTED VERIFICATION ID:",
      extractedVerificationId,
    );

    /*
     * ============================================================
     * 5. FIND PAYMENT BY EXACT REFERENCE FIRST
     * ============================================================
     */

    let payment: PaymentRecord | null =
      null;

    const {
      data: exactPayment,
      error: exactPaymentError,
    } =
      await supabaseAdmin
        .from("payments")
        .select(
          "id, verification_id, user_id, plan, amount, currency, provider, provider_reference, status, created_at",
        )
        .eq(
          "provider_reference",
          callbackReference,
        )
        .eq(
          "provider",
          "paystack",
        )
        .maybeSingle();

    if (exactPaymentError) {
      console.error(
        "PAYMENT VERIFY — EXACT LOOKUP ERROR:",
        exactPaymentError,
      );
    }

    if (exactPayment) {
      payment =
        exactPayment as PaymentRecord;

      console.log(
        "PAYMENT VERIFY — EXACT PAYMENT FOUND:",
        {
          paymentId:
            payment.id,

          verificationId:
            payment.verification_id,

          storedReference:
            payment.provider_reference,

          status:
            payment.status,
        },
      );
    } else {
      console.log(
        "PAYMENT VERIFY — EXACT LOOKUP FAILED:",
        {
          callbackReference,
          extractedVerificationId,
        },
      );
    }

    /*
     * ============================================================
     * 6. FALLBACK — FIND PAYMENT BY VERIFICATION ID
     * ============================================================
     *
     * IMPORTANT:
     *
     * We deliberately DO NOT filter by payment status here.
     *
     * Payment 182 may currently be marked "failed" because the
     * previous verification attempt could not find the Paystack
     * transaction.
     *
     * We still need to recover that payment and retry using its
     * stored Paystack reference.
     */

    if (
      !payment &&
      extractedVerificationId
    ) {
      const {
        data: fallbackPayments,
        error:
          fallbackPaymentError,
      } =
        await supabaseAdmin
          .from("payments")
          .select(
            "id, verification_id, user_id, plan, amount, currency, provider, provider_reference, status, created_at",
          )
          .eq(
            "verification_id",
            extractedVerificationId,
          )
          .eq(
            "provider",
            "paystack",
          )
          .order(
            "created_at",
            {
              ascending: false,
            },
          )
          .limit(10);

      if (fallbackPaymentError) {
        console.error(
          "PAYMENT VERIFY — VERIFICATION ID LOOKUP ERROR:",
          fallbackPaymentError,
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to find the payment record.",
          },
          { status: 500 },
        );
      }

      console.log(
        "PAYMENT VERIFY — PAYMENTS FOR VERIFICATION:",
        fallbackPayments,
      );

      if (
        fallbackPayments &&
        fallbackPayments.length > 0
      ) {
        /*
         * Prefer a pending or processing payment.
         *
         * If none exists, use the newest payment regardless
         * of whether it is currently marked failed.
         */

        payment =
          fallbackPayments.find(
            (item) =>
              item.status ===
                "pending" ||
              item.status ===
                "processing",
          ) ||
          fallbackPayments[0];

        payment =
          payment as PaymentRecord;

        console.log(
          "PAYMENT VERIFY — FALLBACK PAYMENT FOUND:",
          {
            paymentId:
              payment.id,

            verificationId:
              payment.verification_id,

            storedReference:
              payment.provider_reference,

            callbackReference,

            status:
              payment.status,
          },
        );
      }
    }

    /*
     * ============================================================
     * 7. PAYMENT MUST EXIST
     * ============================================================
     */

    if (!payment) {
      console.error(
        "PAYMENT VERIFY — PAYMENT NOT FOUND:",
        {
          callbackReference,
          extractedVerificationId,
        },
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment record not found.",
        },
        { status: 404 },
      );
    }

    console.log(
      "PAYMENT VERIFY — PAYMENT FOUND:",
      {
        paymentId:
          payment.id,

        verificationId:
          payment.verification_id,

        userId:
          payment.user_id,

        storedReference:
          payment.provider_reference,

        receivedReference:
          callbackReference,

        status:
          payment.status,

        plan:
          payment.plan,

        amount:
          payment.amount,
      },
    );

    /*
     * ============================================================
     * 8. IF ALREADY PAID, RETURN SUCCESS
     * ============================================================
     */

    if (
      payment.status ===
      "paid"
    ) {
      console.log(
        "PAYMENT VERIFY — ALREADY PAID:",
        payment.id,
      );

      return NextResponse.json({
        success: true,

        alreadyPaid: true,

        verificationId:
          payment.verification_id,

        plan:
          payment.plan,

        amount:
          payment.amount,
      });
    }

    /*
     * ============================================================
     * 9. GET CANONICAL STORED PAYSTACK REFERENCE
     * ============================================================
     *
     * THIS IS THE IMPORTANT PART.
     *
     * We do NOT verify the callback reference.
     *
     * We verify the reference stored in the payment record.
     */

    const storedReference =
      String(
        payment.provider_reference ||
          "",
      ).trim();

    if (!storedReference) {
      console.error(
        "PAYMENT VERIFY — STORED REFERENCE EMPTY:",
        payment.id,
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "The payment does not have a valid Paystack reference.",
        },
        { status: 500 },
      );
    }

    console.log(
      "PAYMENT VERIFY — CANONICAL STORED REFERENCE:",
      JSON.stringify(storedReference),
    );

    /*
     * ============================================================
     * 10. VERIFY STORED REFERENCE WITH PAYSTACK
     * ============================================================
     */

    const paystackResponse =
      await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          storedReference,
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${paystackSecret}`,

            "Content-Type":
              "application/json",
          },

          cache: "no-store",
        },
      );

    const paystackResult =
      await paystackResponse.json();

    console.log(
      "PAYSTACK VERIFY RESPONSE:",
      {
        httpStatus:
          paystackResponse.status,

        success:
          paystackResult?.status,

        transactionStatus:
          paystackResult?.data?.status,

        reference:
          paystackResult?.data?.reference,

        message:
          paystackResult?.message,
      },
    );

    /*
     * ============================================================
     * 11. PAYSTACK VERIFICATION FAILED
     * ============================================================
     *
     * Do NOT change the payment to failed here.
     *
     * Leave the existing record intact.
     */

    if (
      !paystackResponse.ok ||
      !paystackResult?.status
    ) {
      console.error(
        "PAYSTACK VERIFICATION FAILED:",
        paystackResult,
      );

      return NextResponse.json(
        {
          success: false,

          error:
            paystackResult?.message ||
            "Paystack could not verify this transaction.",

          reference:
            storedReference,

          paymentStatus:
            payment.status,
        },
        { status: 400 },
      );
    }

    const transaction =
      paystackResult.data;

    /*
     * ============================================================
     * 12. TRANSACTION MUST BE SUCCESSFUL
     * ============================================================
     */

    if (
      transaction?.status !==
      "success"
    ) {
      console.log(
        "PAYMENT VERIFY — TRANSACTION STATUS:",
        transaction?.status,
      );

      return NextResponse.json({
        success: false,

        paymentStatus:
          transaction?.status ||
          "unknown",

        error:
          "Payment has not been confirmed as successful.",
      });
    }

    /*
     * ============================================================
     * 13. VERIFY CURRENCY
     * ============================================================
     */

    if (
      transaction.currency !==
      "NGN"
    ) {
      console.error(
        "PAYMENT VERIFY — CURRENCY MISMATCH:",
        {
          expected:
            "NGN",

          received:
            transaction.currency,
        },
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "Payment currency does not match the expected currency.",
        },
        { status: 400 },
      );
    }

    /*
     * ============================================================
     * 14. VERIFY PLAN AMOUNT
     * ============================================================
     */

    const expectedAmount =
      PLAN_PRICES[
        payment.plan
      ];

    if (!expectedAmount) {
      console.error(
        "PAYMENT VERIFY — INVALID PLAN:",
        payment.plan,
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "Invalid verification plan.",
        },
        { status: 400 },
      );
    }

    const expectedAmountInKobo =
      expectedAmount * 100;

    if (
      Number(
        transaction.amount,
      ) !==
      expectedAmountInKobo
    ) {
      console.error(
        "PAYMENT VERIFY — AMOUNT MISMATCH:",
        {
          expected:
            expectedAmountInKobo,

          received:
            transaction.amount,

          plan:
            payment.plan,
        },
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "Payment amount does not match the selected plan.",
        },
        { status: 400 },
      );
    }

    /*
     * ============================================================
     * 15. VERIFY TRANSACTION REFERENCE
     * ============================================================
     */

    if (
      transaction.reference !==
      storedReference
    ) {
      console.error(
        "PAYMENT VERIFY — REFERENCE MISMATCH:",
        {
          callbackReference,

          storedReference,

          paystackReference:
            transaction.reference,
        },
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "The verified Paystack transaction reference does not match our payment record.",
        },
        { status: 400 },
      );
    }

    /*
     * ============================================================
     * 16. OPTIONAL METADATA VALIDATION
     * ============================================================
     */

    const metadata =
      transaction?.metadata;

    if (
      metadata &&
      typeof metadata ===
        "object"
    ) {
      if (
        metadata.verification_id !==
          undefined &&
        String(
          metadata.verification_id,
        ) !==
          String(
            payment.verification_id,
          )
      ) {
        console.error(
          "PAYMENT VERIFY — VERIFICATION METADATA MISMATCH:",
          {
            expected:
              payment.verification_id,

            received:
              metadata.verification_id,
          },
        );

        return NextResponse.json(
          {
            success: false,

            error:
              "Payment verification data does not match this verification.",
          },
          { status: 400 },
        );
      }

      if (
        metadata.payment_id !==
          undefined &&
        String(
          metadata.payment_id,
        ) !==
          String(
            payment.id,
          )
      ) {
        console.error(
          "PAYMENT VERIFY — PAYMENT METADATA MISMATCH:",
          {
            expected:
              payment.id,

            received:
              metadata.payment_id,
          },
        );

        return NextResponse.json(
          {
            success: false,

            error:
              "Payment verification data does not match this payment.",
          },
          { status: 400 },
        );
      }

      if (
        metadata.user_id !==
          undefined &&
        String(
          metadata.user_id,
        ) !==
          String(
            payment.user_id,
          )
      ) {
        console.error(
          "PAYMENT VERIFY — USER METADATA MISMATCH:",
          {
            expected:
              payment.user_id,

            received:
              metadata.user_id,
          },
        );

        return NextResponse.json(
          {
            success: false,

            error:
              "Payment verification data does not match the payment owner.",
          },
          { status: 400 },
        );
      }
    }

    /*
     * ============================================================
     * 17. MARK PAYMENT AS PAID
     * ============================================================
     */

    const {
      error:
        updatePaymentError,
    } =
      await supabaseAdmin
        .from("payments")
        .update({
          status:
            "paid",

          payment_method:
            transaction.channel ||
            null,

          paid_at:
            transaction.paid_at ||
            new Date().toISOString(),

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          payment.id,
        );

    if (
      updatePaymentError
    ) {
      console.error(
        "PAYMENT VERIFY — PAYMENT UPDATE ERROR:",
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

    /*
     * ============================================================
     * 18. ACTIVATE VERIFICATION
     * ============================================================
     */

    const {
      error:
        verificationError,
    } =
      await supabaseAdmin
        .from("verifications")
        .update({
          status:
            "processing",
        })
        .eq(
          "id",
          payment.verification_id,
        );

    if (
      verificationError
    ) {
      console.error(
        "PAYMENT VERIFY — VERIFICATION ACTIVATION ERROR:",
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

    /*
     * ============================================================
     * 19. SUCCESS
     * ============================================================
     */

    console.log(
      "PAYMENT VERIFY — SUCCESS:",
      {
        paymentId:
          payment.id,

        verificationId:
          payment.verification_id,

        plan:
          payment.plan,

        amount:
          payment.amount,

        storedReference:
          storedReference,
      },
    );

    return NextResponse.json({
      success: true,

      verificationId:
        payment.verification_id,

      plan:
        payment.plan,

      amount:
        payment.amount,

      paymentMethod:
        transaction.channel ||
        null,

      reference:
        storedReference,
    });
  } catch (error) {
    console.error(
      "PAYMENT VERIFICATION ERROR:",
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