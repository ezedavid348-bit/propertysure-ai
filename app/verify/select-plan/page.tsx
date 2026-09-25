"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AppShell from "../../AppShell/AppShell";
import VerificationWorkflow from "../components/VerificationWorkflow";

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
      "Basic document-level verification for property owners, buyers and sellers.",
    price: "₦299,999",
    icon: "◆",
    features: [
      "AI Document Verification",
      "Document Identification & Data Extraction",
      "Authenticity & Consistency Checks",
      "Names, Dates & Title Information Cross-Checks",
      "Fraud & Tampering Risk Analysis",
      "Missing / Inconsistent Information Detection",
      "Package Completeness Assessment",
      "AI Findings & Downloadable Report",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description:
      "Comprehensive title, ownership, survey and regulatory verification for property buyers and investors.",
    price: "₦549,999",
    icon: "▥",
    popular: true,
    features: [
      "Everything in Essential",
      "Government Title / Registry Search",
      "Registered Owner & Title Verification",
      "Submitted Documents vs Government Records",
      "Survey / Plot / Land Information Verification",
      "Property History & Encumbrance Checks where available",
      "CAC / Seller / Agent / Developer Verification where applicable",
      "Comprehensive Due-Diligence Report & Priority Support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description:
      "Complete property and site due diligence combining documents, government searches, planning, building, litigation and physical verification.",
    price: "₦999,999",
    icon: "♛",
    features: [
      "Everything in Professional",
      "Planning & Zoning Verification",
      "Permitted Land Use & Development Restrictions",
      "Building Approval / Plan / Development Permit Verification",
      "Building & Development Compliance Check",
      "Property Litigation / Ownership Dispute Search",
      "Physical Site Inspection & GPS / Location / Plot Confirmation",
      "Site Photographs & Physical Evidence",
      "Surveyor-Assisted Site Verification & Survey Comparison",
      "Consolidated Premium Due-Diligence Report",
    ],
  },
];

export default function SelectPlanPage() {
  const router = useRouter();

  const verificationId = useMemo(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    return new URLSearchParams(
      window.location.search,
    ).get("id");
  }, []);

  const [selectedPlan, setSelectedPlan] =
    useState<PlanId>(
      "professional",
    );

  function selectPlan(
    planId: PlanId,
  ): void {
    setSelectedPlan(
      planId,
    );
  }

  function continueToCheckout(): void {
    if (!selectedPlan) {
      return;
    }

    const params =
      new URLSearchParams();

    if (verificationId) {
      params.set(
        "id",
        verificationId,
      );
    }

    params.set(
      "plan",
      selectedPlan,
    );

    router.push(
      `/verify/checkout?${params.toString()}`,
    );
  }

  function goBackToReview(): void {
    if (verificationId) {
      router.push(
        `/verify/review?id=${encodeURIComponent(
          verificationId,
        )}`,
      );

      return;
    }

    router.push(
      "/verify/review",
    );
  }

  function comparePlans(): void {
    document
      .getElementById(
        "verification-plans",
      )
      ?.scrollIntoView({
        behavior:
          "smooth",
        block: "start",
      });
  }

  function requestLegalSupport(): void {
    router.push(
      "/contact?service=legal-support",
    );
  }

  return (
    <AppShell
      activePath="/verify"
      headerPath="/verify/select-plan"
    >
      <main
        className={
          styles.page
        }
      >
        <div
          className={
            styles.content
          }
        >
          {/* ==================================================
              SHARED VERIFICATION WORKFLOW
              STEP 5 — SELECT PLAN
          ================================================== */}

          <VerificationWorkflow
            activeStep={5}
            backHref={
              verificationId
                ? `/verify/review?id=${encodeURIComponent(
                    verificationId,
                  )}`
                : "/verify/review"
            }
            backLabel="Back to Review Package"
            showTopBack={true}
            showBottomActions={false}
            showSecurityNote={false}
          />

          {/* ==================================================
              INTRO
          ================================================== */}

          <section
            className={
              styles.intro
            }
          >
            <div
              className={
                styles.planBadge
              }
            >
              CHOOSE YOUR PLAN
            </div>

            <h1>
              Select a{" "}
              <span>
                Verification Plan
              </span>
            </h1>

            <p>
              Choose the level of
              property verification
              that matches your
              transaction. Each plan
              clearly defines the
              checks and verification
              included.
            </p>
          </section>

          {/* ==================================================
              SECURE PAYMENT
          ================================================== */}

          <section
            className={
              styles.secureCard
            }
          >
            <div
              className={
                styles.secureIcon
              }
            >
              🛡
            </div>

            <div>
              <strong>
                100% Secure Payment
              </strong>

              <span>
                Your payment information
                is encrypted and processed
                securely.
              </span>
            </div>
          </section>

          {/* ==================================================
              VERIFICATION PLANS
          ================================================== */}

          <section
            id="verification-plans"
            className={
              styles.plans
            }
          >
            {PLANS.map(
              (plan) => {
                const isSelected =
                  selectedPlan ===
                  plan.id;

                return (
                  <article
                    key={
                      plan.id
                    }
                    className={`${styles.planCard} ${
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
                      {
                        plan.icon
                      }
                    </div>

                    <h2>
                      {
                        plan.name
                      }
                    </h2>

                    <p
                      className={
                        styles.planDescription
                      }
                    >
                      {
                        plan.description
                      }
                    </p>

                    <div
                      className={
                        styles.priceRow
                      }
                    >
                      <strong>
                        {
                          plan.price
                        }
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
                        (
                          feature,
                        ) => (
                          <div
                            key={
                              feature
                            }
                            className={
                              styles.feature
                            }
                          >
                            <span>
                              ✓
                            </span>

                            <p>
                              {
                                feature
                              }
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
                        selectPlan(
                          plan.id,
                        )
                      }
                    >
                      {isSelected
                        ? `Selected ${plan.name}`
                        : `Select ${plan.name}`}
                    </button>
                  </article>
                );
              },
            )}
          </section>

          {/* ==================================================
              PLAN DIFFERENTIATION
          ================================================== */}

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
                Not sure which plan
                to choose?
              </strong>

              <span>
                Essential =
                document-level AI
                verification.
                Professional =
                documents, title,
                ownership, survey
                and government
                checks. Premium adds
                planning, building,
                litigation and
                physical site
                verification.
              </span>
            </div>

            <button
              type="button"
              className={
                styles.compareButton
              }
              onClick={
                comparePlans
              }
            >
              Compare Plans
            </button>
          </section>

          {/* ==================================================
              LEGAL SUPPORT
          ================================================== */}

          <section
            className={
              styles.legalSupport
            }
          >
            <div
              className={
                styles.legalSupportIcon
              }
            >
              ⚖
            </div>

            <div
              className={
                styles.legalSupportText
              }
            >
              <strong>
                Need Legal Review or
                Transaction Support?
              </strong>

              <span>
                PropertySure can connect
                you with a qualified
                property lawyer for legal
                document review, legal
                advice, transaction support
                or other legal services.
              </span>

              <small>
                Legal services are
                separate from the
                verification packages and
                are available by custom
                quotation.
              </small>
            </div>

            <button
              type="button"
              className={
                styles.legalSupportButton
              }
              onClick={
                requestLegalSupport
              }
            >
              Request Legal Support

              <span>
                →
              </span>
            </button>
          </section>

          {/* ==================================================
              TRUST FEATURES
          ================================================== */}

          <section
            className={
              styles.trustFeatures
            }
          >
            <div
              className={
                styles.trustItem
              }
            >
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

            <div
              className={
                styles.trustItem
              }
            >
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

            <div
              className={
                styles.trustItem
              }
            >
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
                  Professional
                  verification reports
                </span>
              </div>
            </div>

            <div
              className={
                styles.trustItem
              }
            >
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
                  Our team is here to
                  help you succeed
                </span>
              </div>
            </div>
          </section>

          {/* ==================================================
              BOTTOM ACTIONS
              SAME STRUCTURE AS REVIEW PACKAGE
          ================================================== */}

          <section
            className={
              styles.actions
            }
          >
            <button
              type="button"
              className={
                styles.backButton
              }
              onClick={
                goBackToReview
              }
            >
              <span>
                ←
              </span>

              Back
            </button>

            <button
              type="button"
              className={
                styles.continueButton
              }
              onClick={
                continueToCheckout
              }
              disabled={
                !selectedPlan
              }
            >
              Continue to Secure Checkout

              <b>
                →
              </b>
            </button>
          </section>
        </div>
      </main>
    </AppShell>
  );
}