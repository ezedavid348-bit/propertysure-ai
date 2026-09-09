"use client";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ClipboardCheck,
  SearchCheck,
  FileCheck2,
  FileQuestion,
  BadgeCheck,
  CircleHelp,
} from "lucide-react";

const articles = [
  {
    title: "What is Property Verification?",
    slug: "what-is-property-verification",
    description:
      "Learn what PropertySure AI property verification is, what it checks, and how it helps you make more informed property decisions.",
    icon: ShieldCheck,
  },

  {
    title: "Why Verify a Property?",
    slug: "why-verify",
    description:
      "Understand why property verification matters and how proper due diligence can help identify ownership, documentation, and fraud risks.",
    icon: SearchCheck,
  },

  {
    title: "How Does Property Verification Work?",
    slug: "how-it-works",
    description:
      "Learn how PropertySure AI reviews property information, documents, verification signals, and other relevant data.",
    icon: ClipboardCheck,
  },

  {
    title: "What Can You Verify?",
    slug: "what-you-can-verify",
    description:
      "Learn about the property information and documents that PropertySure AI can review during a property verification.",
    icon: FileCheck2,
  },

  {
    title: "What You Can't Verify?",
    slug: "what-you-cant-verify",
    description:
      "Understand the limitations of property verification and the types of information PropertySure AI may not be able to independently confirm.",
    icon: FileQuestion,
  },

  {
    title: "What Happens After You Verify?",
    slug: "what-happens-after",
    description:
      "Learn what happens after a property verification is completed and how you can review the results and verification information.",
    icon: BadgeCheck,
  },

  {
    title: "Verification Results",
    slug: "verification-results",
    description:
      "Learn how to understand your PropertySure AI verification results, including findings, risk indicators, and verification status.",
    icon: FileCheck2,
  },

  {
    title: "Need More Help?",
    slug: "need-more-help",
    description:
      "Contact the PropertySure AI support team if you need additional help with property verification or understanding your results.",
    icon: CircleHelp,
  },
];

export default function PropertyVerificationPage() {
  const router = useRouter();

  const basePath =
    "/settings/support-help/help-center/property-verification";

  /*
  ============================================================
  ARTICLE NAVIGATION
  ============================================================
  */

  const goToArticle = (slug: string) => {
    router.push(`${basePath}/${slug}`);
  };

  /*
  ============================================================
  BACK TO HELP CENTER
  ============================================================
  */

  const goToHelpCenter = () => {
    router.push(
      "/settings/support-help/help-center"
    );
  };

  /*
  ============================================================
  NEED MORE HELP
  ============================================================
  */

  const goToNeedMoreHelp = () => {
    router.push(
      `${basePath}/need-more-help`
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#13213a",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
        padding: "35px 20px 60px",
      }}
    >
      <div
        style={{
          width: "min(1050px, 100%)",
          margin: "0 auto",
        }}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#0f1d38",
              fontSize: "34px",
              lineHeight: 1.2,
              fontWeight: 700,
              letterSpacing: "-0.7px",
            }}
          >
            Property Verification
          </h1>

          <p
            style={{
              margin: "11px 0 0",
              maxWidth: "700px",
              color: "#52637b",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            Learn how to verify properties,
            understand verification results,
            identify potential risks, and
            make more informed property
            decisions with PropertySure AI.
          </p>

          {/* =================================================
              BACK TO HELP CENTER
          ================================================= */}

          <button
            type="button"
            onClick={goToHelpCenter}
            style={{
              border: 0,
              background: "transparent",
              color: "#0879df",
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              marginTop: "18px",
            }}
          >
            <ArrowLeft size={17} />

            Back to Help Center
          </button>
        </div>

        {/* =====================================================
            DIVIDER
        ===================================================== */}

        <div
          style={{
            width: "100%",
            height: "1px",
            background: "#e3e9f0",
            marginBottom: "25px",
          }}
        />

        {/* =====================================================
            ARTICLES
        ===================================================== */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {articles.map((article) => {
            const Icon = article.icon;

            return (
              <button
                key={article.slug}
                type="button"
                onClick={() =>
                  goToArticle(article.slug)
                }
                style={{
                  width: "100%",
                  minHeight: "145px",
                  padding: "20px",
                  border:
                    "1px solid #dfe6ee",
                  borderRadius: "9px",
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  textAlign: "left",
                  cursor: "pointer",
                  transition:
                    "border-color 0.15s ease, box-shadow 0.15s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor =
                    "#b9d5f4";

                  event.currentTarget.style.boxShadow =
                    "0 5px 18px rgba(20, 40, 70, 0.06)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor =
                    "#dfe6ee";

                  event.currentTarget.style.boxShadow =
                    "none";
                }}
              >
                {/* =================================================
                    ARTICLE ICON
                ================================================= */}

                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    background: "#eaf3ff",
                    color: "#0879df",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "13px",
                  }}
                >
                  <Icon size={19} />
                </div>

                {/* =================================================
                    ARTICLE INFORMATION
                ================================================= */}

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        color: "#172743",
                        fontSize: "13px",
                        lineHeight: 1.45,
                        fontWeight: 700,
                      }}
                    >
                      {article.title}
                    </h2>

                    <p
                      style={{
                        margin:
                          "7px 0 0",
                        color: "#65758c",
                        fontSize: "11px",
                        lineHeight: 1.6,
                      }}
                    >
                      {article.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    style={{
                      flexShrink: 0,
                      marginTop: "2px",
                      color: "#0879df",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </section>

        {/* =====================================================
            NEED MORE HELP — SUPPORT SECTION
        ===================================================== */}

        <section
          style={{
            marginTop: "25px",
            padding: "22px",
            border:
              "1px solid #d9e4f0",
            borderRadius: "9px",
            background:
              "linear-gradient(135deg, #f5faff, #ffffff)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#18253a",
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            Need more help?
          </h2>

          <p
            style={{
              margin:
                "8px 0 15px",
              color: "#52637b",
              fontSize: "11px",
              lineHeight: 1.65,
            }}
          >
            If you need additional
            assistance with property
            verification, verification
            results, property documents,
            or understanding a verification
            report, our support team is
            here to help.
          </p>

          <button
            type="button"
            onClick={
              goToNeedMoreHelp
            }
            style={{
              height: "42px",
              padding: "0 15px",
              border:
                "1px solid #0879df",
              borderRadius: "7px",
              background: "#ffffff",
              color: "#0879df",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Contact Support

            <ArrowRight size={16} />
          </button>
        </section>
      </div>
    </main>
  );
}