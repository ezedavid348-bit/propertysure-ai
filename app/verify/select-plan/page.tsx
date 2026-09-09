"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../AppShell/AppShell";
import styles from "./select-plan.module.css";

type PlanId =
  | "essential"
  | "professional"
  | "premium";

type Plan = {
  id: PlanId;
  name: string;
  description: string;
  price: string;
  icon: string;
  popular?: boolean;
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: "essential",
    name: "Essential",
    description:
      "Essential verification for individual property transactions.",
    price: "₦299,999",
    icon: "◆",
    features: [
      "AI Document Verification",
      "Authenticity Check",
      "Fraud Risk Analysis",
      "AI Verification Report",
      "Downloadable PDF",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description:
      "Comprehensive verification for property buyers, investors, and most property transactions.",
    price: "₦549,999",
    icon: "▥",
    popular: true,
    features: [
      "Everything in Essential",
      "Government Registry Search",
      "Ownership Verification",
      "Property History Report",
      "Priority Support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description:
      "Complete due diligence for high-value and complex property transactions.",
    price: "₦999,999",
    icon: "♛",
    features: [
      "Everything in Professional",
      "Physical Site Inspection",
      "GPS Boundary Verification",
      "Lawyer Review",
      "Litigation Check",
      "Dedicated Consultant",
    ],
  },
];

export default function SelectPlanPage() {
  const router = useRouter();

  const verificationId = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return new URLSearchParams(
      window.location.search,
    ).get("id");
  }, []);

  const [selectedPlan, setSelectedPlan] =
    useState<PlanId>("professional");

  function goBackToReview(): void {
    if (verificationId) {
      router.push(
        `/verify/review?id=${encodeURIComponent(
          verificationId,
        )}`,
      );
      return;
    }

    router.push("/verify/review");
  }

  function selectPlan(planId: PlanId): void {
    setSelectedPlan(planId);
  }

  function continueToCheckout(): void {
    if (!selectedPlan) {
      return;
    }

    const params = new URLSearchParams();

    if (verificationId) {
      params.set("id", verificationId);
    }

    params.set("plan", selectedPlan);

    router.push(
      `/verify/checkout?${params.toString()}`,
    );
  }

  function comparePlans(): void {
    document
      .getElementById("verification-plans")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <AppShell
      activePath="/verify"
      headerPath="/verify/select-plan"
    >
      <main className={styles.page}>
        <div className={styles.content}>
          {/* BACK TO REVIEW */}

          <button
            type="button"
            className={styles.backButton}
            onClick={goBackToReview}
          >
            <span>←</span>
            Back to Review Package
          </button>

          {/* =====================================================
              WORKFLOW
              ===================================================== */}

          <section className={styles.workflow}>
            {/* STEP 1 */}

            <div className={styles.workflowItem}>
              <span
                className={
                  styles.workflowNumberDone
                }
              >
                ✓
              </span>

              <div>
                <strong>
                  Upload Documents
                </strong>

                <span>
                  Add your property documents
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLineActive
              }
            />

            {/* STEP 2 */}

            <div className={styles.workflowItem}>
              <span
                className={
                  styles.workflowNumberDone
                }
              >
                ✓
              </span>

              <div>
                <strong>
                  Review Package
                </strong>

                <span>
                  Confirm your documents
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLineActive
              }
            />

            {/* STEP 3 */}

            <div
              className={`${styles.workflowItem} ${styles.workflowCurrent}`}
            >
              <span
                className={
                  styles.workflowNumberActive
                }
              >
                3
              </span>

              <div>
                <strong>
                  Select Plan
                </strong>

                <span>
                  Choose your service
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLine
              }
            />

            {/* STEP 4 */}

            <div className={styles.workflowItem}>
              <span
                className={
                  styles.workflowNumber
                }
              >
                4
              </span>

              <div>
                <strong>
                  Secure Checkout
                </strong>

                <span>
                  Complete payment
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLine
              }
            />

            {/* STEP 5 */}

            <div className={styles.workflowItem}>
              <span
                className={
                  styles.workflowNumber
                }
              >
                5
              </span>

              <div>
                <strong>
                  Verification
                </strong>

                <span>
                  AI analysis and results
                </span>
              </div>
            </div>
          </section>

          {/* =====================================================
              PLAN HEADER
              ===================================================== */}

          <section className={styles.intro}>
            <div className={styles.planBadge}>
              CHOOSE YOUR PLAN
            </div>

            <h1>
              Select a{" "}
              <span>
                Verification Plan
              </span>
            </h1>

            <p>
              Choose the verification service
              that best fits your property
              transaction. All plans include
              AI-powered analysis and a
              comprehensive verification
              report.
            </p>
          </section>

          {/* SECURE PAYMENT */}

          <section className={styles.secureCard}>
            <div className={styles.secureIcon}>
              🛡
            </div>

            <div>
              <strong>
                100% Secure Payment
              </strong>

              <span>
                Your payment information is
                encrypted and processed
                securely.
              </span>
            </div>
          </section>

          {/* =====================================================
              PRICING PLANS
              ===================================================== */}

          <section
            id="verification-plans"
            className={styles.plans}
          >
            {PLANS.map((plan) => {
              const isSelected =
                selectedPlan === plan.id;

              return (
                <article
                  key={plan.id}
                  className={`${styles.planCard} ${
                    plan.popular
                      ? styles.planCardPopular
                      : ""
                  } ${
                    isSelected
                      ? styles.planCardSelected
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div
                      className={
                        styles.popularBadge
                      }
                    >
                      MOST POPULAR
                    </div>
                  )}

                  <div
                    className={
                      styles.planIcon
                    }
                  >
                    {plan.icon}
                  </div>

                  <h2>
                    {plan.name}
                  </h2>

                  <p
                    className={
                      styles.planDescription
                    }
                  >
                    {plan.description}
                  </p>

                  <div
                    className={
                      styles.priceRow
                    }
                  >
                    <strong>
                      {plan.price}
                    </strong>

                    <span>
                      One-time
                    </span>
                  </div>

                  <div
                    className={
                      styles.featureList
                    }
                  >
                    {plan.features.map(
                      (feature) => (
                        <div
                          key={feature}
                          className={
                            styles.feature
                          }
                        >
                          <span>✓</span>
                          <p>
                            {feature}
                          </p>
                        </div>
                      ),
                    )}
                  </div>

                  <button
                    type="button"
                    className={
                      isSelected
                        ? styles.selectButtonActive
                        : styles.selectButton
                    }
                    onClick={() =>
                      selectPlan(plan.id)
                    }
                  >
                    {isSelected
                      ? `Selected ${plan.name}`
                      : `Select ${plan.name}`}
                  </button>
                </article>
              );
            })}
          </section>

          {/* =====================================================
              RECOMMENDATION
              ===================================================== */}

          <section
            className={
              styles.recommendation
            }
          >
            <div
              className={
                styles.recommendationIcon
              }
            >
              💡
            </div>

            <div
              className={
                styles.recommendationText
              }
            >
              <strong>
                Not sure which plan to
                choose?
              </strong>

              <span>
                The Professional Plan is
                recommended for most property
                transactions. You can always
                choose a higher level of due
                diligence when needed.
              </span>
            </div>

            <button
              type="button"
              className={
                styles.compareButton
              }
              onClick={comparePlans}
            >
              Compare Plans
            </button>
          </section>

          {/* =====================================================
              TRUST FEATURES
              ===================================================== */}

          <section
            className={
              styles.trustFeatures
            }
          >
            <div className={styles.trustItem}>
              <div
                className={
                  styles.trustIcon
                }
              >
                🔒
              </div>

              <div>
                <strong>
                  Secure Payment
                </strong>

                <span>
                  Encrypted and secure
                  transactions
                </span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div
                className={
                  styles.trustIconYellow
                }
              >
                ⚡
              </div>

              <div>
                <strong>
                  Instant Access
                </strong>

                <span>
                  Get started immediately
                  after payment
                </span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div
                className={
                  styles.trustIconBlue
                }
              >
                ▤
              </div>

              <div>
                <strong>
                  Detailed Reports
                </strong>

                <span>
                  Professional verification
                  reports
                </span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div
                className={
                  styles.trustIconPurple
                }
              >
                ◉
              </div>

              <div>
                <strong>
                  Trusted Support
                </strong>

                <span>
                  Our team is here to help
                  you succeed
                </span>
              </div>
            </div>
          </section>

          {/* =====================================================
              BOTTOM ACTIONS
              ===================================================== */}

          <section
            className={
              styles.bottomActions
            }
          >
            <button
              type="button"
              className={
                styles.checkoutButton
              }
              onClick={
                continueToCheckout
              }
              disabled={!selectedPlan}
            >
              Continue to Checkout
              <span>→</span>
            </button>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
