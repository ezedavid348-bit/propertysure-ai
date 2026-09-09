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
} from "lucide-react";

type Article = {
  title: string;
  slug: string;
};

const articles: Article[] = [
  {
    title: "What is Fraud Watch?",
    slug: "what-is-fraud-watch",
  },
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
  {
    title: "Need More Help?",
    slug: "need-more-help",
  },
];

const basePath =
  "/settings/support-help/help-center/fraud-watch";

const landingPage =
  "/settings/support-help/help-center/fraud-watch";

const currentIndex = 0;
const currentArticle = articles[currentIndex];
const nextArticle = articles[currentIndex + 1];

export default function WhatIsFraudWatchPage() {
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

  const goBackToFraudWatch = () => {
    router.push(landingPage);
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
              Learn what Fraud Watch is, what it
              is designed to do, and how it helps
              identify potential property fraud and
              suspicious activity.
            </p>

            <button
              onClick={goBackToFraudWatch}
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
              Back to Fraud Watch
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
            {/* INTRODUCTION */}

            <div
              id="what-is-fraud-watch"
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
                <Info size={19} />
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
                  Fraud Watch
                </strong>
                is a property-risk monitoring feature
                designed to help identify potential
                warning signs associated with property
                fraud, suspicious information, and
                other risks that may require further
                investigation.
              </p>
            </div>

            {/* =================================================
                WHAT IS FRAUD WATCH
            ================================================= */}

            <h2
              id="what-fraud-watch-does"
              style={{
                margin: "28px 0 14px",
                color: "#111f39",
                fontSize: "20px",
                lineHeight: 1.3,
                fontWeight: 700,
                scrollMarginTop: "30px",
              }}
            >
              What is Fraud Watch?
            </h2>

            <p style={paragraphStyle}>
              Fraud Watch helps users become aware of
              potential property-related risks by
              reviewing available information and
              identifying signals that may warrant
              additional attention.
            </p>

            <p style={paragraphStyle}>
              It is designed to provide an additional
              layer of awareness before a user proceeds
              with an important property decision.
            </p>

            {/* =================================================
                WHY IT EXISTS
            ================================================= */}

            <h2
              id="why-fraud-watch-exists"
              style={{
                margin: "29px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              Why Fraud Watch Exists
            </h2>

            <p style={paragraphStyle}>
              Property transactions can involve
              significant financial commitments and
              may expose buyers, sellers, agents, and
              investors to different types of fraud.
            </p>

            <p style={paragraphStyle}>
              Fraud Watch exists to help users identify
              potential warning signs earlier, so that
              suspicious information can receive further
              investigation before a transaction
              progresses.
            </p>

            {/* =================================================
                WHAT IT CAN HELP IDENTIFY
            ================================================= */}

            <h2
              id="what-it-can-help-identify"
              style={{
                margin: "29px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              What Fraud Watch Can Help Identify
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
                Potentially suspicious property-related
                information.
              </ActionItem>

              <ActionItem>
                Warning signs associated with a property
                or transaction.
              </ActionItem>

              <ActionItem>
                Information that may require additional
                investigation.
              </ActionItem>

              <ActionItem>
                Potential inconsistencies or unusual
                signals within available information.
              </ActionItem>
            </ul>

            {/* =================================================
                HOW IT SHOULD BE USED
            ================================================= */}

            <h2
              id="how-to-use-fraud-watch"
              style={{
                margin: "30px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              How Fraud Watch Should Be Used
            </h2>

            <p style={paragraphStyle}>
              Fraud Watch should be treated as an
              additional property-risk awareness tool,
              not as a replacement for professional
              property due diligence.
            </p>

            <p style={paragraphStyle}>
              When Fraud Watch identifies a warning
              signal, users should investigate the
              relevant information and, where necessary,
              obtain official records or professional
              advice before proceeding.
            </p>

            {/* =================================================
                IMPORTANT NOTE
            ================================================= */}

            <div
              id="important-note"
              style={{
                marginTop: "25px",
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
                A Fraud Watch result is an indication
                based on available information. It is
                not a guarantee that a property is
                completely free from fraud or other
                risks. Appropriate due diligence should
                always be completed before making an
                important property decision.
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
            {/* PREVIOUS */}

            <button
              onClick={goBackToFraudWatch}
              style={{
                minHeight: "70px",
                border: "1px solid #dce3eb",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#18263e",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "13px",
                padding: "13px 17px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <ArrowLeft
                size={19}
                style={{ flexShrink: 0 }}
              />

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
                  Previous Article
                </small>

                <strong
                  style={{
                    fontSize: "11.5px",
                    lineHeight: 1.4,
                  }}
                >
                  Back to Fraud Watch
                </strong>
              </span>
            </button>

            {/* NEXT */}

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
                label="What is Fraud Watch?"
                onClick={() =>
                  scrollTo("what-fraud-watch-does")
                }
              />

              <SideLink
                label="Why Fraud Watch Exists"
                onClick={() =>
                  scrollTo("why-fraud-watch-exists")
                }
              />

              <SideLink
                label="What Fraud Watch Can Help Identify"
                onClick={() =>
                  scrollTo("what-it-can-help-identify")
                }
              />

              <SideLink
                label="How Fraud Watch Should Be Used"
                onClick={() =>
                  scrollTo("how-to-use-fraud-watch")
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