"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "../../AppShell/AppShell";
import { supabase } from "../../lib/supabase";
import styles from "./checkout.module.css";

type PlanKey = "essential" | "professional" | "premium";

type Plan = {
  name: string;
  price: number;
  description: string;
};

const PLANS: Record<PlanKey, Plan> = {
  essential: {
    name: "Essential",
    price: 299999,
    description: "Fast AI-powered property document verification",
  },
  professional: {
    name: "Professional",
    price: 549999,
    description: "Advanced verification with ownership and registry checks",
  },
  premium: {
    name: "Premium",
    price: 999999,
    description: "Full property due diligence and professional review",
  },
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();

  const verificationId = searchParams.get("id") || "";
  const planParam = searchParams.get("plan") || "professional";

  const selectedPlanKey: PlanKey =
    planParam === "essential" ||
    planParam === "professional" ||
    planParam === "premium"
      ? planParam
      : "professional";

  const selectedPlan = useMemo(
    () => PLANS[selectedPlanKey],
    [selectedPlanKey],
  );

  const [documentCount, setDocumentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCheckoutData = async () => {
      try {
        /*
         * The verification ID is intentionally kept in the URL.
         * The payment API uses this ID to retrieve and validate
         * the real verification record and document package.
         */

        if (mounted) {
          // Document count will be loaded from the verification record
          // as the checkout data layer is expanded.
          setDocumentCount(null);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setError("Unable to load checkout details.");
          setLoading(false);
        }
      }
    };

    loadCheckoutData();

    return () => {
      mounted = false;
    };
  }, [verificationId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const goBackToPlan = () => {
    const query = verificationId
      ? `?id=${encodeURIComponent(verificationId)}`
      : "";

    window.location.href = `/verify/select-plan${query}`;
  };

  const handlePayment = async () => {
    if (!verificationId) {
      setError("Verification ID is missing.");
      return;
    }

    setError("");
    setPaymentLoading(true);

    try {
      /*
       * Get the currently authenticated Supabase session.
       *
       * The payment API uses the access token to verify that the
       * current user owns the verification being paid for.
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError(
          "Your session has expired. Please refresh the page and try again.",
        );
        return;
      }

      /*
       * Send only the verification ID and selected plan.
       *
       * The server determines the official price.
       * The browser is NOT trusted to determine the payment amount.
       */
      const response = await fetch(
        "/api/payments/paystack/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            verificationId,
            plan: selectedPlanKey,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to initialize payment.",
        );
      }

      if (!data?.authorizationUrl) {
        throw new Error(
          "Paystack did not return a payment authorization URL.",
        );
      }

      /*
       * Paystack has successfully initialized the transaction.
       * Redirect the customer to the secure Paystack checkout page.
       */
      window.location.href = data.authorizationUrl;
    } catch (paymentError) {
      console.error("Payment initialization error:", paymentError);

      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to prepare your payment. Please try again.",
      );

      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingLogo}>◇</div>
        <div className={styles.loadingTitle}>PropertySure AI</div>

        <div className={styles.loadingDots}>
          <span />
          <span />
          <span />
        </div>

        <div className={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <AppShell
      activePath="/verify"
      headerPath="/verify/checkout"
    >
      <main className={styles.page}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <div className={styles.eyebrow}>
                PROPERTY VERIFICATION
              </div>

              <h1>Secure Checkout</h1>

              <p>
                Complete your payment to begin your PropertySure AI
                verification.
              </p>
            </div>

            <div className={styles.secureBadge}>
              <span className={styles.lockIcon}>✓</span>
              Secure Checkout
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorBanner}>
              <span className={styles.errorIcon}>!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Main checkout grid */}
          <div className={styles.checkoutGrid}>
            {/* Left column */}
            <div className={styles.leftColumn}>
              {/* Verification summary */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.cardEyebrow}>
                      VERIFICATION SUMMARY
                    </span>

                    <h2>Your Property Verification</h2>
                  </div>

                  <div className={styles.statusBadge}>
                    Ready for payment
                  </div>
                </div>

                <div className={styles.summaryGrid}>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>
                      Verification ID
                    </span>

                    <strong>
                      {verificationId
                        ? `#${verificationId}`
                        : "Not available"}
                    </strong>
                  </div>

                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>
                      Documents
                    </span>

                    <strong>
                      {documentCount !== null
                        ? `${documentCount} Documents`
                        : "Document package"}
                    </strong>
                  </div>

                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>
                      Service
                    </span>

                    <strong>Property Verification</strong>
                  </div>

                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>
                      Payment
                    </span>

                    <strong>One-time payment</strong>
                  </div>
                </div>
              </section>

              {/* Selected plan */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.cardEyebrow}>
                      SELECTED PLAN
                    </span>

                    <h2>{selectedPlan.name}</h2>
                  </div>

                  <button
                    type="button"
                    className={styles.changePlanButton}
                    onClick={goBackToPlan}
                  >
                    Change Plan
                  </button>
                </div>

                <div className={styles.planDetails}>
                  <div className={styles.planIcon}>
                    ✓
                  </div>

                  <div className={styles.planContent}>
                    <h3>{selectedPlan.name} Verification</h3>

                    <p>{selectedPlan.description}</p>
                  </div>

                  <div className={styles.planPrice}>
                    {formatCurrency(selectedPlan.price)}
                  </div>
                </div>
              </section>

              {/* Secure payment information */}
              <section className={styles.securityCard}>
                <div className={styles.securityIcon}>🔒</div>

                <div className={styles.securityContent}>
                  <h3>Secure Payment</h3>

                  <p>
                    Your payment will be securely processed through
                    Paystack. PropertySure AI does not store your card
                    details.
                  </p>

                  <div className={styles.securityFeatures}>
                    <div>
                      <span>✓</span>
                      Secure payment processing
                    </div>

                    <div>
                      <span>✓</span>
                      One-time payment
                    </div>

                    <div>
                      <span>✓</span>
                      Payment receipt
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right column */}
            <aside className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.cardEyebrow}>
                  ORDER SUMMARY
                </span>

                <h2>Payment Details</h2>
              </div>

              <div className={styles.orderPlan}>
                <div>
                  <span className={styles.orderPlanLabel}>
                    Plan
                  </span>

                  <strong>{selectedPlan.name}</strong>
                </div>

                <span className={styles.orderPlanTag}>
                  One-time
                </span>
              </div>

              <div className={styles.divider} />

              <div className={styles.priceRow}>
                <span>Verification service</span>

                <strong>
                  {formatCurrency(selectedPlan.price)}
                </strong>
              </div>

              <div className={styles.priceRow}>
                <span>Processing fee</span>

                <strong>Included</strong>
              </div>

              <div className={styles.divider} />

              <div className={styles.totalRow}>
                <div>
                  <span>Total</span>

                  <small>Amount payable</small>
                </div>

                <strong>
                  {formatCurrency(selectedPlan.price)}
                </strong>
              </div>

              <button
                type="button"
                className={styles.payButton}
                onClick={handlePayment}
                disabled={paymentLoading || !verificationId}
              >
                {paymentLoading ? (
                  <>
                    <span className={styles.buttonSpinner} />
                    Preparing Payment...
                  </>
                ) : (
                  <>
                    Pay {formatCurrency(selectedPlan.price)}
                    <span>→</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className={styles.backButton}
                onClick={goBackToPlan}
              >
                <span>←</span>
                Back to Select Plan
              </button>

              <p className={styles.paymentNote}>
                You will be redirected to the secure Paystack payment
                page to complete your transaction.
              </p>
            </aside>
          </div>

          {/* Bottom trust section */}
          <section className={styles.trustSection}>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>🔒</div>

              <div>
                <strong>Secure Payment</strong>
                <span>Protected payment processing</span>
              </div>
            </div>

            <div className={styles.trustDivider} />

            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>✓</div>

              <div>
                <strong>One-Time Payment</strong>
                <span>No recurring charges</span>
              </div>
            </div>

            <div className={styles.trustDivider} />

            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>▣</div>

              <div>
                <strong>Digital Receipt</strong>
                <span>Payment confirmation provided</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}