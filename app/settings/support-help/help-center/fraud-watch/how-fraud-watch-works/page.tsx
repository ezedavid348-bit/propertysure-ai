"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Info,
  Search,
  ThumbsDown,
  ThumbsUp,
  FileSearch,
  Database,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

type Article = {
  title: string;
  slug: string;
};

const articles: Article[] = [
  {
    title: "Why Fraud Watch Matters",
    slug: "why-fraud-watch-matters",
  },
  {
    title: "How Fraud Watch Works",
    slug: "how-fraud-watch-works",
  },
  {
    title: "What Fraud Watch Can Detect",
    slug: "what-fraud-watch-can-detect",
  },
  {
    title: "What Fraud Watch Can't Detect",
    slug: "what-fraud-watch-cant-detect",
  },
  {
    title: "What Happens When Fraud is Detected",
    slug: "what-happens-when-fraud-is-detected",
  },
  {
    title: "Understanding Fraud Watch Results",
    slug: "understanding-fraud-watch-results",
  },
];

const basePath =
  "/settings/support-help/help-center/fraud-watch";

const previousArticle = articles[0];
const currentArticle = articles[1];
const nextArticle = articles[2];

export default function HowFraudWatchWorksPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return articles;

    return articles.filter((article) =>
      article.title.toLowerCase().includes(query)
    );
  }, [search]);

  const navigateToArticle = (article: Article) => {
    router.push(`${basePath}/${article.slug}`);
  };

  const goBack = () => {
    router.push("/settings/support-help/help-center");
  };

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#17233b",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      {/* =====================================================
          TOP SEARCH
      ===================================================== */}

      <div
        style={{
          width: "100%",
          padding: "24px 28px 0",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "min(340px, 100%)",
            height: "45px",
            border: "1px solid #dbe2eb",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            gap: "11px",
            padding: "0 14px",
            background: "#ffffff",
          }}
        >
          <Search
            size={19}
            color="#637188"
            strokeWidth={1.8}
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search for articles, guides, and topics"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "12px",
              color: "#1d2b43",
            }}
          />
        </div>

        {search.trim() && (
          <div
            style={{
              position: "absolute",
              top: "73px",
              left: "28px",
              width: "340px",
              maxWidth: "calc(100% - 56px)",
              background: "#ffffff",
              border: "1px solid #dfe5ec",
              borderRadius: "9px",
              boxShadow:
                "0 12px 30px rgba(20,40,70,.10)",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <button
                  key={article.slug}
                  onClick={() =>
                    navigateToArticle(article)
                  }
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "none",
                    background: "#ffffff",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: "#24344d",
                  }}
                >
                  {article.title}
                </button>
              ))
            ) : (
              <div
                style={{
                  padding: "14px",
                  fontSize: "12px",
                  color: "#718096",
                }}
              >
                No matching articles found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          MAIN PAGE
      ===================================================== */}

      <div
        style={{
          width: "min(1280px, calc(100% - 56px))",
          margin: "0 auto",
          padding: "28px 0 45px",
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) 315px",
          gap: "48px",
        }}
      >
        {/* ===================================================
            ARTICLE
        =================================================== */}

        <article>
          {/* HEADER */}

          <header>
            <h1
              style={{
                margin: 0,
                color: "#0e1c37",
                fontSize: "36px",
                lineHeight: 1.15,
                letterSpacing: "-1px",
                fontWeight: 750,
              }}
            >
              {currentArticle.title}
            </h1>

            <p
              style={{
                margin: "14px 0 0",
                maxWidth: "760px",
                color: "#56657b",
                fontSize: "14px",
                lineHeight: 1.7,
              }}
            >
              Learn how Fraud Watch analyzes
              property-related information to identify
              potential warning signs and help users make
              more informed property decisions.
            </p>

            <button
              onClick={goBack}
              style={{
                marginTop: "19px",
                padding: 0,
                border: "none",
                background: "transparent",
                color: "#075dcc",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={17} />
              Back to Help Center
            </button>
          </header>

          <div
            style={{
              height: "1px",
              background: "#e3e8ef",
              margin: "27px 0 23px",
            }}
          />

          {/* =================================================
              CONTENT CARD
          ================================================= */}

          <section
            style={{
              border: "1px solid #dfe5ec",
              borderRadius: "9px",
              padding: "28px 30px 32px",
              background: "#ffffff",
            }}
          >
            {/* OVERVIEW BOX */}

            <div
              id="how-fraud-watch-works"
              style={{
                padding: "20px 21px",
                borderRadius: "9px",
                background: "#f3f7fd",
                border: "1px solid #dce8f6",
                display: "flex",
                gap: "15px",
                alignItems: "flex-start",
                scrollMarginTop: "30px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  minWidth: "34px",
                  borderRadius: "50%",
                  background: "#e4efff",
                  color: "#176bd1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={19} />
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#42526a",
                  fontSize: "12px",
                  lineHeight: 1.75,
                }}
              >
                <strong
                  style={{
                    color: "#182740",
                    marginRight: "5px",
                  }}
                >
                  Fraud Watch Works as an Additional
                  Protection Layer:
                </strong>
                It reviews available property-related
                information and identifies potential
                warning signs that may require further
                attention or investigation.
              </p>
            </div>

            {/* =================================================
                INTRODUCTION
            ================================================= */}

            <h2
              id="understanding-fraud-watch"
              style={{
                margin: "28px 0 14px",
                color: "#111f39",
                fontSize: "20px",
                lineHeight: 1.3,
                fontWeight: 700,
                scrollMarginTop: "30px",
              }}
            >
              Understanding Fraud Watch
            </h2>

            <p style={paragraphStyle}>
              Fraud Watch is designed to help identify
              potential warning signs associated with
              property information and documents. It
              analyzes information available to the system
              and highlights signals that may require
              additional review.
            </p>

            {/* =================================================
                STEP ITEMS
            ================================================= */}

            <div>
              <ProcessItem
                number="01"
                id="information-submission"
                icon={<FileSearch size={19} />}
                title="Information Submission"
                text="The process begins when relevant property information and documents are submitted for review. The available information provides the basis for the Fraud Watch analysis."
              />

              <ProcessItem
                number="02"
                id="information-analysis"
                icon={<Database size={19} />}
                title="Information Analysis"
                text="Fraud Watch analyzes the available information to identify inconsistencies, unusual details, potential conflicts, and other signals that may require attention."
              />

              <ProcessItem
                number="03"
                id="warning-signals"
                icon={<AlertTriangle size={19} />}
                title="Warning Signal Detection"
                text="When the system identifies a potentially relevant warning signal, it highlights the issue so that the information can receive closer attention."
              />

              <ProcessItem
                number="04"
                id="result-generation"
                icon={<ShieldCheck size={19} />}
                title="Result Generation"
                text="The identified signals are organized into a result that helps the user understand what was detected from the information available to Fraud Watch."
              />
            </div>

            {/* =================================================
                AVAILABLE INFORMATION
            ================================================= */}

            <h2
              id="available-information"
              style={{
                margin: "30px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              Available Information
            </h2>

            <p style={paragraphStyle}>
              Fraud Watch can only analyze information
              that is available to the system. The quality,
              completeness, and reliability of the available
              information can therefore affect what the
              system is able to identify.
            </p>

            {/* =================================================
                DETECTION
            ================================================= */}

            <h2
              id="potential-signals"
              style={{
                margin: "29px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              Identifying Potential Signals
            </h2>

            <p style={paragraphStyle}>
              Fraud Watch looks for information that may
              indicate a potential concern. A signal can
              include an inconsistency, unusual pattern,
              conflicting information, or another detail
              that deserves further investigation.
            </p>

            {/* =================================================
                NOT AUTOMATICALLY FRAUD
            ================================================= */}

            <div
              id="not-automatically-fraud"
              style={{
                marginTop: "25px",
                padding: "18px 20px",
                borderRadius: "9px",
                background: "#f4f8fd",
                border: "1px solid #d9e5f3",
                display: "flex",
                alignItems: "flex-start",
                gap: "13px",
                scrollMarginTop: "30px",
              }}
            >
              <Info
                size={21}
                color="#0879df"
                style={{
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              />

              <p
                style={{
                  margin: 0,
                  color: "#45556c",
                  fontSize: "11.5px",
                  lineHeight: 1.7,
                }}
              >
                <strong
                  style={{ color: "#17253e" }}
                >
                  A Warning Is Not Automatically Fraud:
                </strong>{" "}
                A detected signal does not by itself prove
                that fraud has occurred. It indicates that
                something may require additional review,
                verification, or investigation.
              </p>
            </div>

            {/* =================================================
                RESULT
            ================================================= */}

            <h2
              id="fraud-watch-result"
              style={{
                margin: "30px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              Fraud Watch Result
            </h2>

            <p style={paragraphStyle}>
              The result reflects the warning signals
              identified from the information available
              during the analysis. Users should review the
              result carefully and consider whether further
              verification is appropriate.
            </p>

            {/* =================================================
                WHAT HAPPENS NEXT
            ================================================= */}

            <h2
              id="what-happens-next"
              style={{
                margin: "29px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              What Happens Next
            </h2>

            <p style={paragraphStyle}>
              If Fraud Watch identifies a potential warning
              sign, the user should investigate the relevant
              information and complete appropriate due
              diligence before proceeding with an important
              property transaction.
            </p>

            {/* =================================================
                WHAT YOU SHOULD DO
            ================================================= */}

            <h2
              id="what-you-should-do"
              style={{
                margin: "30px 0 16px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              What You Should Do
            </h2>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <ActionItem>
                Review the Fraud Watch result carefully.
              </ActionItem>

              <ActionItem>
                Examine any information or documents
                associated with a warning signal.
              </ActionItem>

              <ActionItem>
                Verify important property information
                through appropriate official sources.
              </ActionItem>

              <ActionItem>
                Seek professional legal or property advice
                where necessary.
              </ActionItem>
            </ul>

            {/* =================================================
                IMPORTANT NOTE
            ================================================= */}

            <div
              id="important-note"
              style={{
                marginTop: "26px",
                padding: "17px 19px",
                border: "1px solid #cce8d9",
                borderRadius: "9px",
                background: "#f2fbf6",
                display: "flex",
                alignItems: "flex-start",
                gap: "13px",
                scrollMarginTop: "30px",
              }}
            >
              <CheckCircle2
                size={21}
                color="#15995a"
                style={{
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              />

              <p
                style={{
                  margin: 0,
                  color: "#4c665a",
                  fontSize: "11.5px",
                  lineHeight: 1.7,
                }}
              >
                <strong
                  style={{ color: "#187b4d" }}
                >
                  Important Note:
                </strong>{" "}
                Fraud Watch is an additional layer of
                awareness and protection. It does not
                replace official searches, professional
                review, physical inspection, or other
                appropriate due-diligence procedures.
              </p>
            </div>
          </section>

          {/* =================================================
              BOTTOM NAVIGATION
          ================================================= */}

          <div
            style={{
              marginTop: "25px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <NavigationButton
              direction="previous"
              article={previousArticle}
              onClick={() =>
                navigateToArticle(previousArticle)
              }
            />

            <NavigationButton
              direction="next"
              article={nextArticle}
              onClick={() =>
                navigateToArticle(nextArticle)
              }
            />
          </div>
        </article>

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside>
          {/* =================================================
              IN THIS ARTICLE
          ================================================= */}

          <div style={sideCardStyle}>
            <h3 style={sideTitleStyle}>
              In this article
            </h3>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <SideLink
                active
                label="Fraud Watch Works as an Additional Protection Layer"
                onClick={() =>
                  scrollTo("how-fraud-watch-works")
                }
              />

              <SideLink
                label="Understanding Fraud Watch"
                onClick={() =>
                  scrollTo("understanding-fraud-watch")
                }
              />

              <SideLink
                label="Information Submission"
                onClick={() =>
                  scrollTo("information-submission")
                }
              />

              <SideLink
                label="Information Analysis"
                onClick={() =>
                  scrollTo("information-analysis")
                }
              />

              <SideLink
                label="Warning Signal Detection"
                onClick={() =>
                  scrollTo("warning-signals")
                }
              />

              <SideLink
                label="Result Generation"
                onClick={() =>
                  scrollTo("result-generation")
                }
              />

              <SideLink
                label="Available Information"
                onClick={() =>
                  scrollTo("available-information")
                }
              />

              <SideLink
                label="Identifying Potential Signals"
                onClick={() =>
                  scrollTo("potential-signals")
                }
              />

              <SideLink
                label="A Warning Is Not Automatically Fraud"
                onClick={() =>
                  scrollTo("not-automatically-fraud")
                }
              />

              <SideLink
                label="Fraud Watch Result"
                onClick={() =>
                  scrollTo("fraud-watch-result")
                }
              />

              <SideLink
                label="What Happens Next"
                onClick={() =>
                  scrollTo("what-happens-next")
                }
              />

              <SideLink
                label="What You Should Do"
                onClick={() =>
                  scrollTo("what-you-should-do")
                }
              />

              <SideLink
                label="Important Note"
                onClick={() =>
                  scrollTo("important-note")
                }
              />
            </div>
          </div>

          {/* =================================================
              FEEDBACK
          ================================================= */}

          <div style={sideCardStyle}>
            <h3 style={sideTitleStyle}>
              Was this helpful?
            </h3>

            {feedback === null ? (
              <div
                style={{
                  marginTop: "17px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => setFeedback("yes")}
                  style={feedbackButtonStyle}
                >
                  <ThumbsUp size={17} />
                  Yes
                </button>

                <button
                  onClick={() => setFeedback("no")}
                  style={feedbackButtonStyle}
                >
                  <ThumbsDown size={17} />
                  No
                </button>
              </div>
            ) : (
              <div
                style={{
                  marginTop: "17px",
                  padding: "12px",
                  borderRadius: "7px",
                  background: "#f1fbf5",
                  color: "#168b51",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "11px",
                }}
              >
                <CheckCircle2 size={17} />
                Thanks for your feedback.
              </div>
            )}
          </div>

          {/* =================================================
              PREVIOUS / NEXT
          ================================================= */}

          <div style={sideCardStyle}>
            <button
              onClick={() =>
                navigateToArticle(previousArticle)
              }
              style={{
                ...sideNavigationButton,
                color: "#17243b",
              }}
            >
              <ArrowLeft size={16} />

              <span>
                <small
                  style={{
                    display: "block",
                    color: "#596980",
                    fontSize: "10px",
                    marginBottom: "6px",
                  }}
                >
                  Previous Article
                </small>

                <strong
                  style={{
                    color: "#17243b",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {previousArticle.title}
                </strong>
              </span>
            </button>

            <div
              style={{
                height: "1px",
                background: "#e4e9ef",
                margin: "18px 0",
              }}
            />

            <button
              onClick={() =>
                navigateToArticle(nextArticle)
              }
              style={{
                ...sideNavigationButton,
                justifyContent: "space-between",
              }}
            >
              <span>
                <small
                  style={{
                    display: "block",
                    color: "#596980",
                    fontSize: "10px",
                    marginBottom: "6px",
                  }}
                >
                  Next Article
                </small>

                <strong
                  style={{
                    color: "#075dcc",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {nextArticle.title}
                </strong>
              </span>

              <ArrowRight size={16} />
            </button>
          </div>
        </aside>
      </div>

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style jsx>{`
        @media (max-width: 950px) {
          main > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }

          aside {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          aside > div {
            margin-bottom: 0 !important;
          }
        }

        @media (max-width: 650px) {
          main > div:first-child {
            padding-left: 15px !important;
            padding-right: 15px !important;
          }

          main > div:nth-child(2) {
            width: calc(100% - 30px) !important;
            grid-template-columns: 1fr !important;
            padding-top: 25px !important;
          }

          article h1 {
            font-size: 28px !important;
          }

          article section {
            padding: 20px !important;
          }

          aside {
            display: flex;
            flex-direction: column;
          }

          article > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

/* ============================================================
   PROCESS ITEM
============================================================ */

function ProcessItem({
  number,
  id,
  icon,
  title,
  text,
}: {
  number: string;
  id: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      id={id}
      style={{
        display: "grid",
        gridTemplateColumns: "52px minmax(0, 1fr)",
        gap: "15px",
        padding: "17px 0",
        borderBottom: "1px solid #e5e9ee",
        scrollMarginTop: "30px",
      }}
    >
      <div
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "50%",
          background: "#eef4ff",
          color: "#075dcc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {number}
      </div>

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              color: "#075dcc",
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </span>

          <h3
            style={{
              margin: 0,
              color: "#17243c",
              fontSize: "13px",
              lineHeight: 1.4,
              fontWeight: 700,
            }}
          >
            {title}
          </h3>
        </div>

        <p
          style={{
            margin: 0,
            color: "#53647b",
            fontSize: "11.5px",
            lineHeight: 1.7,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   ACTION ITEM
============================================================ */

function ActionItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        color: "#34465f",
        fontSize: "12px",
        lineHeight: 1.6,
      }}
    >
      <span
        style={{
          width: "18px",
          height: "18px",
          minWidth: "18px",
          border: "1.5px solid #22a467",
          borderRadius: "50%",
          color: "#15995a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "1px",
        }}
      >
        <Check size={11} strokeWidth={2.5} />
      </span>

      {children}
    </li>
  );
}

/* ============================================================
   SIDEBAR LINK
============================================================ */

function SideLink({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textAlign: "left",
        color: active ? "#075dcc" : "#53637a",
        fontSize: "11px",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: "12px",
          height: "12px",
          minWidth: "12px",
          borderRadius: "50%",
          background: active
            ? "#075dcc"
            : "transparent",
          border: active
            ? "none"
            : "1.5px solid #9ca8b7",
        }}
      />

      {label}
    </button>
  );
}

/* ============================================================
   NAVIGATION BUTTON
============================================================ */

function NavigationButton({
  direction,
  article,
  onClick,
}: {
  direction: "previous" | "next";
  article: Article;
  onClick: () => void;
}) {
  const isNext = direction === "next";

  return (
    <button
      onClick={onClick}
      style={{
        minHeight: "70px",
        border: isNext
          ? "none"
          : "1px solid #dce3eb",
        borderRadius: "8px",
        background: isNext
          ? "#0879df"
          : "#ffffff",
        color: isNext ? "#ffffff" : "#18263e",
        display: "flex",
        alignItems: "center",
        justifyContent: isNext
          ? "space-between"
          : "flex-start",
        gap: "13px",
        padding: "13px 17px",
        cursor: "pointer",
        textAlign: isNext ? "right" : "left",
      }}
    >
      {!isNext && (
        <ArrowLeft
          size={19}
          style={{ flexShrink: 0 }}
        />
      )}

      <span
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <small
          style={{
            fontSize: "9.5px",
            opacity: 0.8,
          }}
        >
          {isNext
            ? "Next Article"
            : "Previous Article"}
        </small>

        <strong
          style={{
            fontSize: "11.5px",
            lineHeight: 1.4,
          }}
        >
          {article.title}
        </strong>
      </span>

      {isNext && <ArrowRight size={20} />}
    </button>
  );
}

/* ============================================================
   SHARED STYLES
============================================================ */

const paragraphStyle: React.CSSProperties = {
  margin: "0 0 20px",
  color: "#53647b",
  fontSize: "12px",
  lineHeight: 1.8,
};

const sideCardStyle: React.CSSProperties = {
  width: "100%",
  padding: "21px",
  marginBottom: "17px",
  border: "1px solid #dfe5ec",
  borderRadius: "9px",
  background: "#ffffff",
};

const sideTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#17243b",
  fontSize: "14px",
  fontWeight: 700,
};

const feedbackButtonStyle: React.CSSProperties = {
  height: "42px",
  border: "1px solid #dce4ed",
  borderRadius: "7px",
  background: "#ffffff",
  color: "#52637a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
  fontSize: "11px",
  cursor: "pointer",
};

const sideNavigationButton: React.CSSProperties = {
  width: "100%",
  padding: 0,
  border: "none",
  background: "transparent",
  color: "#075dcc",
  display: "flex",
  alignItems: "flex-start",
  gap: "11px",
  textAlign: "left",
  cursor: "pointer",
};