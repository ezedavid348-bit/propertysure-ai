"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  UserPlus,
  LogIn,
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Search,
  Upload,
  MapPin,
  CheckCircle2,
  CircleHelp,
} from "lucide-react";

const articles = [
  {
    title: "What is PropertySure AI?",
    slug: "what-is-propertysure-ai",
    description:
      "Learn what PropertySure AI is and how it helps you make safer property verification decisions.",
    icon: ShieldCheck,
  },
  {
    title: "How do I create a PropertySure AI account?",
    slug: "how-do-i-create-a-propertysure-ai-account",
    description:
      "Learn how to create your PropertySure AI account and get started with property verification.",
    icon: UserPlus,
  },
  {
    title: "How do I sign in to my PropertySure AI account?",
    slug: "how-do-i-sign-in-to-my-propertysure-ai-account",
    description:
      "Learn how to securely sign in to your PropertySure AI account.",
    icon: LogIn,
  },
  {
    title: "How do I reset my PropertySure AI password?",
    slug: "how-do-i-reset-my-propertysure-ai-password",
    description:
      "Learn how to reset your PropertySure AI password if you cannot access your account.",
    icon: LogIn,
  },
  {
    title: "How do I navigate my dashboard?",
    slug: "how-do-i-navigate-my-dashboard",
    description:
      "Learn how to use your PropertySure AI dashboard and find the features you need.",
    icon: LayoutDashboard,
  },
  {
    title: "How do I start a property verification?",
    slug: "how-do-i-start-a-property-verification",
    description:
      "Learn how to begin a property verification and submit the required information.",
    icon: Search,
  },
  {
    title: "What documents do I need for verification?",
    slug: "what-documents-do-i-need-for-verification",
    description:
      "Learn which property documents may be required when submitting a verification request.",
    icon: FileText,
  },
  {
    title: "How do I upload property documents?",
    slug: "how-do-i-upload-property-documents",
    description:
      "Learn how to upload the documents needed for your property verification.",
    icon: Upload,
  },
  {
    title: "How do I provide property location details?",
    slug: "how-do-i-provide-property-location-details",
    description:
      "Learn how to provide the location information needed for your property verification.",
    icon: MapPin,
  },
  {
    title: "What happens after I submit a verification?",
    slug: "what-happens-after-i-submit-a-verification",
    description:
      "Learn what happens after your verification request has been submitted.",
    icon: CheckCircle2,
  },
  {
    title: "Need More Help?",
    slug: "need-more-help",
    description:
      "Contact the PropertySure AI support team if you need additional help getting started.",
    icon: CircleHelp,
  },
];

export default function GettingStartedPage() {
  const router = useRouter();

  const basePath =
    "/settings/support-help/help-center/getting-started";

  const goToArticle = (slug: string) => {
    router.push(`${basePath}/${slug}`);
  };

  const goToHelpCenter = () => {
    router.push("/settings/support-help/help-center");
  };

  const goToNeedMoreHelp = () => {
    router.push(`${basePath}/need-more-help`);
  };

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
            Getting Started
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
            Learn how to create your account, navigate
            PropertySure AI, start property verifications,
            and use the platform with confidence.
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
                onClick={() => goToArticle(article.slug)}
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
            If you need additional assistance getting started
            with PropertySure AI, our support team is here to
            help.
          </p>

          <button
            type="button"
            onClick={goToNeedMoreHelp}
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