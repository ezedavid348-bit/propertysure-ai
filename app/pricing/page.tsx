"use client";

import { useRouter } from "next/navigation";
import styles from "./pricing.module.css";

type Plan = {
  name: string;
  label: string;
  subtitle: string;
  description: string;
  price: string;
  audience: string;
  featured?: boolean;
  premium?: boolean;
  features: string[];
};

const PLANS: Plan[] = [
  {
    name: "Essential",
    label: "ESSENTIAL",
    subtitle: "Digital verification",
    description:
      "Digital document-package verification and property-signal assessment for buyers who want evidence before committing capital.",
    price: "₦399K",
    audience:
      "Individual property buyers and straightforward transactions.",
    features: [
      "AI document verification",
      "Document authenticity assessment",
      "Property information analysis",
      "Risk and inconsistency signals",
      "Digital verification report",
      "Downloadable PDF report",
    ],
  },
  {
    name: "Professional",
    label: "PROFESSIONAL",
    subtitle: "Enhanced due diligence",
    description:
      "Expanded verification, professional review and deeper due diligence checks for higher-value or more complex property transactions.",
    price: "₦849K",
    audience:
      "Buyers, investors and higher-value property transactions.",
    featured: true,
    features: [
      "Everything in Essential",
      "Enhanced document analysis",
      "Deeper due-diligence review",
      "Ownership verification",
      "Property history checks",
      "Priority support",
    ],
  },
  {
    name: "Premium",
    label: "PREMIUM",
    subtitle: "On-site due diligence",
    description:
      "Comprehensive due diligence with on-site inspection and relevant professional and government-search components.",
    price: "₦1.399M",
    audience:
      "High-value, complex or higher-risk property transactions.",
    premium: true,
    features: [
      "Everything in Professional",
      "On-site property inspection",
      "GPS and location verification",
      "Professional review",
      "Government-search components",
      "Comprehensive due-diligence report",
    ],
  },
];

const COMPARISON_ROWS = [
  {
    feature: "AI document verification",
    essential: true,
    professional: true,
    premium: true,
  },
  {
    feature: "Property information analysis",
    essential: true,
    professional: true,
    premium: true,
  },
  {
    feature: "Risk and inconsistency analysis",
    essential: true,
    professional: true,
    premium: true,
  },
  {
    feature: "Enhanced due-diligence review",
    essential: false,
    professional: true,
    premium: true,
  },
  {
    feature: "Ownership / property history checks",
    essential: false,
    professional: true,
    premium: true,
  },
  {
    feature: "On-site inspection",
    essential: false,
    professional: false,
    premium: true,
  },
  {
    feature: "GPS / location verification",
    essential: false,
    professional: false,
    premium: true,
  },
  {
    feature: "Professional / government-search components",
    essential: false,
    professional: false,
    premium: true,
  },
];

export default function PricingPage() {
  const router = useRouter();

  function navigate(path: string) {
    router.push(path);
  }

  return (
    <main className={styles.page}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button
            type="button"
            className={styles.brand}
            onClick={() => navigate("/")}
            aria-label="PropertySure AI home"
          >
            <span className={styles.brandDiamond}>
              ◆
            </span>

            <span className={styles.brandText}>
              PropertySure <strong>AI</strong>
            </span>
          </button>
        </div>
      </header>

      {/* =====================================================
          BACK TO HOME
      ===================================================== */}

      <div className={styles.backRow}>
        <div className={styles.backRowInner}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/")}
            aria-label="Back to PropertySure AI home"
          >
            <span className={styles.backArrow}>
              ←
            </span>

            <span>Back to Home</span>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* =====================================================
            SIMPLE PRICING HEADER
        ===================================================== */}

        <section className={styles.pricingHeader}>
          <p className={styles.eyebrow}>
            PROPERTYSURE AI
          </p>

          <h1>
            Property verification
            <br />
            <span>pricing.</span>
          </h1>

          <p className={styles.pricingHeaderText}>
            Choose the level of due diligence that fits
            your property transaction.
          </p>
        </section>

        {/* =====================================================
            PRICING CARDS
        ===================================================== */}

        <section
          className={styles.plans}
          aria-label="PropertySure AI pricing plans"
        >
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`${styles.planCard} ${
                plan.featured
                  ? styles.planCardFeatured
                  : ""
              } ${
                plan.premium
                  ? styles.planCardPremium
                  : ""
              }`}
            >
              {plan.featured && (
                <div className={styles.popularBadge}>
                  MOST POPULAR
                </div>
              )}

              <div className={styles.planLabel}>
                {plan.label}
              </div>

              <h2>{plan.name}</h2>

              <p className={styles.planSubtitle}>
                {plan.subtitle}
              </p>

              <div className={styles.price}>
                <strong>{plan.price}</strong>

                <span>
                  One-time verification service
                </span>
              </div>

              <p className={styles.planDescription}>
                {plan.description}
              </p>

              <div className={styles.featuresTitle}>
                WHAT'S INCLUDED
              </div>

              <div className={styles.features}>
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className={styles.feature}
                  >
                    <span
                      className={
                        styles.featureCheck
                      }
                    >
                      ✓
                    </span>

                    <p>{feature}</p>
                  </div>
                ))}
              </div>

              <div className={styles.planFooter}>
                <p className={styles.planAudience}>
                  <strong>Best suited for:</strong>{" "}
                  {plan.audience}
                </p>
              </div>
            </article>
          ))}
        </section>

        {/* =====================================================
            VALUE NOTE
        ===================================================== */}

        <section className={styles.valueNote}>
          <strong>
            Choose the verification depth that matches
            your transaction.
          </strong>

          <span>
            Higher levels provide deeper property
            due-diligence coverage for more complex
            transactions.
          </span>
        </section>

        {/* =====================================================
            COMPARISON
        ===================================================== */}

        <section className={styles.comparison}>
          <p className={styles.sectionEyebrow}>
            PLAN COMPARISON
          </p>

          <h2>
            Compare the plans.
          </h2>

          <p className={styles.comparisonIntro}>
            See the verification capabilities included
            at each level.
          </p>

          <div className={styles.comparisonTable}>
            <div
              className={`${styles.tableRow} ${styles.tableHeader}`}
            >
              <div>
                Verification capability
              </div>

              <div>Essential</div>

              <div>Professional</div>

              <div>Premium</div>
            </div>

            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.feature}
                className={styles.tableRow}
              >
                <div className={styles.tableFeature}>
                  {row.feature}
                </div>

                <div>
                  {row.essential ? (
                    <div className={styles.tableCheck}>
                      ✓
                    </div>
                  ) : (
                    <div className={styles.tableDash}>
                      —
                    </div>
                  )}
                </div>

                <div>
                  {row.professional ? (
                    <div className={styles.tableCheck}>
                      ✓
                    </div>
                  ) : (
                    <div className={styles.tableDash}>
                      —
                    </div>
                  )}
                </div>

                <div>
                  {row.premium ? (
                    <div className={styles.tableCheck}>
                      ✓
                    </div>
                  ) : (
                    <div className={styles.tableDash}>
                      —
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            HELP
        ===================================================== */}

        <section className={styles.helpSection}>
          <h2>
            Need help choosing a plan?
          </h2>

          <p>
            If you are unsure which level of property
            due diligence fits your transaction, contact
            PropertySure AI and we can help you understand
            the available options.
          </p>

          <button
            type="button"
            className={styles.helpButton}
            onClick={() => navigate("/contact")}
          >
            Contact PropertySure AI
            <span>→</span>
          </button>
        </section>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <button
            type="button"
            className={styles.footerBrand}
            onClick={() => navigate("/")}
            aria-label="PropertySure AI home"
          >
            <span className={styles.footerDiamond}>
              ◆
            </span>

            <span className={styles.footerBrandText}>
              PropertySure <strong>AI</strong>
            </span>
          </button>

          <nav
            className={styles.footerLinks}
            aria-label="Footer navigation"
          >
            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => navigate("/verify")}
            >
              Verify
            </button>

            <button
              type="button"
              onClick={() => navigate("/pricing")}
            >
              Pricing
            </button>

            <button
              type="button"
              onClick={() => navigate("/about")}
            >
              About
            </button>

            <button
              type="button"
              onClick={() => navigate("/contact")}
            >
              Contact
            </button>
          </nav>

          <span className={styles.footerCopy}>
            © {new Date().getFullYear()} PropertySure AI
          </span>
        </div>
      </footer>
    </main>
  );
}