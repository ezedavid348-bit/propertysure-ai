"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  KeyRound,
  ShieldCheck,
  MonitorSmartphone,
  Bell,
  Database,
  Download,
  CircleHelp,
} from "lucide-react";

const articles = [
  {
    title: "How do I update my account information?",
    slug: "how-do-i-update-my-account-information",
    description:
      "Learn how to update your personal information and account details.",
    icon: LockKeyhole,
  },
  {
    title: "How do I change my password?",
    slug: "how-do-i-change-my-password",
    description:
      "Learn how to securely change your PropertySure AI password.",
    icon: KeyRound,
  },
  {
    title: "How do I enable two-factor authentication?",
    slug: "how-do-i-enable-two-factor-authentication",
    description:
      "Add an extra layer of security to your PropertySure AI account.",
    icon: ShieldCheck,
  },
  {
    title: "How do I manage my active sessions?",
    slug: "how-do-i-manage-my-active-sessions",
    description:
      "Review and manage devices and sessions connected to your account.",
    icon: MonitorSmartphone,
  },
  {
    title: "How do I update my notification preferences?",
    slug: "how-do-i-update-my-notification-preferences",
    description:
      "Control the notifications and account updates you receive.",
    icon: Bell,
  },
  {
    title: "How do I manage privacy and data settings?",
    slug: "how-do-i-manage-privacy-and-data-settings",
    description:
      "Manage your privacy preferences and account data settings.",
    icon: Database,
  },
  {
    title: "How do I export my data?",
    slug: "how-do-i-export-my-data",
    description:
      "Learn how to request and export information associated with your account.",
    icon: Download,
  },
  {
    title: "Need More Help?",
    slug: "need-more-help",
    description:
      "Contact the PropertySure AI support team for additional assistance.",
    icon: CircleHelp,
  },
];

export default function AccountSecurityPage() {
  const router = useRouter();

  const basePath =
    "/settings/support-help/help-center/account-security";

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
            Account & Security
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
            Manage your account, password, security settings,
            privacy preferences, and personal information.
          </p>

          {/* =================================================
              BACK TO HELP CENTER
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              router.push("/settings/support-help/help-center")
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
                  router.push(`${basePath}/${article.slug}`)
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
                {/* Article Icon */}

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

                {/* Article Information */}

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
            account or security settings, our support team
            is here to help.
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