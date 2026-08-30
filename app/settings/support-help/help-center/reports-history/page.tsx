"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Download,
  ClipboardList,
  History,
  Search,
  Eye,
  BarChart3,
  FileCheck2,
  Clock3,
  CircleHelp,
} from "lucide-react";

const articles = [
  {
    title: "How do I view my verification reports?",
    slug: "how-do-i-view-my-verification-reports",
    description:
      "Learn how to access and review your PropertySure AI verification reports.",
    icon: FileText,
  },
  {
    title: "How do I download a verification report?",
    slug: "how-do-i-download-a-verification-report",
    description:
      "Learn how to download a copy of your completed property verification report.",
    icon: Download,
  },
  {
    title: "How do I understand my verification report?",
    slug: "how-do-i-understand-my-verification-report",
    description:
      "Learn what the different sections, findings, and verification results mean.",
    icon: ClipboardList,
  },
  {
    title: "How do I view my verification history?",
    slug: "how-do-i-view-my-verification-history",
    description:
      "Review your previous property verification requests and their status.",
    icon: History,
  },
  {
    title: "How do I search my verification history?",
    slug: "how-do-i-search-my-verification-history",
    description:
      "Find previous verification records using available search and filtering options.",
    icon: Search,
  },
  {
    title: "How do I check the status of a verification?",
    slug: "how-do-i-check-the-status-of-a-verification",
    description:
      "Learn how to check whether your property verification is pending, completed, or requires attention.",
    icon: Clock3,
  },
  {
    title: "How do I review verification findings?",
    slug: "how-do-i-review-verification-findings",
    description:
      "Learn how to review important findings and information identified during verification.",
    icon: Eye,
  },
  {
    title: "How do I view verification statistics?",
    slug: "how-do-i-view-verification-statistics",
    description:
      "Learn how to review available statistics and activity related to your property verifications.",
    icon: BarChart3,
  },
  {
    title: "How do I verify a report is complete?",
    slug: "how-do-i-verify-a-report-is-complete",
    description:
      "Learn how to confirm that your property verification report contains the available results.",
    icon: FileCheck2,
  },
  {
    title: "Need More Help?",
    slug: "need-more-help",
    description:
      "Contact the PropertySure AI support team for additional assistance with reports and history.",
    icon: CircleHelp,
  },
];

export default function ReportsHistoryPage() {
  const router = useRouter();

  const basePath =
    "/settings/support-help/help-center/reports-history";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#13213a",
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
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
            Reports & History
          </h1>

          <p
            style={{
              margin: "11px 0 0",
              maxWidth: "680px",
              color: "#52637b",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            Generate, download, and understand your reports
            and verification history.
          </p>

          {/* =================================================
              BACK TO HELP CENTER
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              router.push(
                "/settings/support-help/help-center"
              )
            }
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
                  router.push(
                    `${basePath}/${article.slug}`
                  )
                }
                style={{
                  width: "100%",
                  minHeight: "145px",
                  padding: "20px",
                  border: "1px solid #dfe6ee",
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "#b9d5f4";

                  e.currentTarget.style.boxShadow =
                    "0 5px 18px rgba(20, 40, 70, 0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "#dfe6ee";

                  e.currentTarget.style.boxShadow =
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
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
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
                        margin: "7px 0 0",
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
            SUPPORT
        ===================================================== */}

        <section
          style={{
            marginTop: "25px",
            padding: "22px",
            border: "1px solid #d9e4f0",
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
              margin: "8px 0 15px",
              color: "#52637b",
              fontSize: "11px",
              lineHeight: 1.65,
            }}
          >
            If you need additional assistance with your
            reports or verification history, our support
            team is here to help.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(`${basePath}/need-more-help`)
            }
            style={{
              height: "42px",
              padding: "0 15px",
              border: "1px solid #0879df",
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