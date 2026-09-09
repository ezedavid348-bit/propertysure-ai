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
  ShieldCheck,
  AlertTriangle,
  Building2,
  FileCheck2,
} from "lucide-react";

type Article = {
  title: string;
  slug: string;
};

/* ============================================================
   ARTICLE ORDER
   The navigation is generated dynamically from this list.
============================================================ */

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

/* ============================================================
   CURRENT ARTICLE
============================================================ */

const currentSlug = "why-fraud-watch-matters";

const currentIndex = articles.findIndex(
  (article) => article.slug === currentSlug
);

const currentArticle =
  currentIndex >= 0
    ? articles[currentIndex]
    : articles[0];

const previousArticle =
  currentIndex > 0
    ? articles[currentIndex - 1]
    : null;

const nextArticle =
  currentIndex >= 0 &&
  currentIndex < articles.length - 1
    ? articles[currentIndex + 1]
    : null;

export default function WhyFraudWatchMattersPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  /* ==========================================================
     DYNAMIC ARTICLE SEARCH
  ========================================================== */

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return articles;

    return articles.filter((article) =>
      article.title.toLowerCase().includes(query)
    );
  }, [search]);

  /* ==========================================================
     DYNAMIC ARTICLE ROUTING
  ========================================================== */

  const navigateToArticle = (article: Article) => {
    router.push(`${basePath}/${article.slug}`);
  };

  const goBack = () => {
    router.push("/settings/support-help/help-center");
  };

  /* ==========================================================
     IN-PAGE SCROLL
  ========================================================== */

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
              Understand why Fraud Watch is an
              important layer of protection when
              evaluating property information and
              making property-related decisions.
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
            {/* =================================================
                INTRODUCTION BOX
            ================================================= */}

            <div
              id="why-fraud-watch-matters"
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
                  Property Fraud Can Be Difficult to
                  Identify:
                </strong>{" "}
                Property transactions often involve
                multiple documents, parties, records,
                and sources of information. Fraud Watch
                provides an additional layer of awareness
                by helping identify potential warning signs.
              </p>
            </div>

            {/* =================================================
                WHY PROPERTY FRAUD MATTERS
            ================================================= */}

            <h2
              id="property-fraud-risk"
              style={{
                margin: "28px 0 14px",
                color: "#111f39",
                fontSize: "20px",
                lineHeight: 1.3,
                fontWeight: 700,
                scrollMarginTop: "30px",
              }}
            >
              Why Property Fraud Matters
            </h2>

            <p style={paragraphStyle}>
              Property transactions can involve significant
              financial commitments. A buyer may rely on
              documents, ownership information, property
              descriptions, and representations made by
              sellers or agents before deciding to proceed.
            </p>

            <p style={paragraphStyle}>
              When important information is false,
              inconsistent, manipulated, or misleading, it
              can expose a buyer to financial loss and other
              serious property-related risks.
            </p>

            {/* =================================================
                MULTIPLE DOCUMENTS
            ================================================= */}

            <div>
              <ReasonItem
                number="01"
                id="multiple-documents"
                icon={<FileCheck2 size={19} />}
                title="Multiple Documents and Records"
                text="Property transactions may involve several documents and records. Reviewing information across these sources can help reveal inconsistencies that may otherwise be overlooked."
              />

              <ReasonItem
                number="02"
                id="hidden-warning-signs"
                icon={<AlertTriangle size={19} />}
                title="Warning Signs May Be Overlooked"
                text="Some potential warning signs may not be obvious during a normal review. Fraud Watch adds another layer of analysis to help bring relevant signals to the user's attention."
              />

              <ReasonItem
                number="03"
                id="financial-risk"
                icon={<Building2 size={19} />}
                title="Financial Risk"
                text="Property purchases can involve substantial amounts of money. Identifying potential concerns before proceeding can help users make more informed decisions."
              />

              <ReasonItem
                number="04"
                id="additional-protection"
                icon={<ShieldCheck size={19} />}
                title="An Additional Protection Layer"
                text="Fraud Watch does not replace professional due diligence. Instead, it provides an additional layer of awareness that can support the wider property verification process."
              />
            </div>

            {/* =================================================
                INFORMED DECISIONS
            ================================================= */}

            <h2
              id="informed-decisions"
              style={{
                margin: "30px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              Helping You Make More Informed Decisions
            </h2>

            <p style={paragraphStyle}>
              Fraud Watch is designed to help users
              identify information that may deserve
              additional attention before making an
              important property decision.
            </p>

            <p style={paragraphStyle}>
              By highlighting potential warning signals,
              the system can help users know when they may
              need to ask additional questions, verify
              information, or seek professional assistance.
            </p>

            {/* =================================================
                NOT A GUARANTEE
            ================================================= */}

            <div
              id="not-a-guarantee"
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
                  Fraud Watch Is Not a Guarantee:
                </strong>{" "}
                A result from Fraud Watch does not
                guarantee that a property or transaction
                is completely free from fraud or risk.
                Appropriate due diligence should always
                be completed.
              </p>
            </div>

            {/* =================================================
                SUPPORTING DUE DILIGENCE
            ================================================= */}

            <h2
              id="supporting-due-diligence"
              style={{
                margin: "30px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              Supporting Property Due Diligence
            </h2>

            <p style={paragraphStyle}>
              Fraud Watch works as part of a broader
              property due-diligence process. Depending on
              the property and transaction, this may include
              official searches, document review, legal
              review, surveying, physical inspection, and
              other professional checks.
            </p>

            {/* =================================================
                WHAT FRAUD WATCH ADDS
            ================================================= */}

            <h2
              id="what-fraud-watch-adds"
              style={{
                margin: "29px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              What Fraud Watch Adds
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
                Helps identify potential warning signals
                from available information.
              </ActionItem>

              <ActionItem>
                Helps users recognize information that may
                require additional attention.
              </ActionItem>

              <ActionItem>
                Supports a more structured property review
                process.
              </ActionItem>

              <ActionItem>
                Encourages appropriate verification before
                important property decisions.
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
                awareness and protection. It is designed
                to support, not replace, appropriate
                property verification and professional
                due diligence.
              </p>
            </div>
          </section>

          {/* =================================================
              DYNAMIC BOTTOM NAVIGATION
          ================================================= */}

          <div
            style={{
              marginTop: "25px",
              display: "grid",
              gridTemplateColumns:
                previousArticle && nextArticle
                  ? "1fr 1fr"
                  : "1fr",
              gap: "15px",
            }}
          >
            {previousArticle && (
              <NavigationButton
                direction="previous"
                article={previousArticle}
                onClick={() =>
                  navigateToArticle(previousArticle)
                }
              />
            )}

            {nextArticle && (
              <NavigationButton
                direction="next"
                article={nextArticle}
                onClick={() =>
                  navigateToArticle(nextArticle)
                }
              />
            )}
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
                label="Why Property Fraud Matters"
                onClick={() =>
                  scrollTo("why-fraud-watch-matters")
                }
              />

              <SideLink
                label="Why Property Fraud Matters"
                onClick={() =>
                  scrollTo("property-fraud-risk")
                }
              />

              <SideLink
                label="Multiple Documents and Records"
                onClick={() =>
                  scrollTo("multiple-documents")
                }
              />

              <SideLink
                label="Warning Signs May Be Overlooked"
                onClick={() =>
                  scrollTo("hidden-warning-signs")
                }
              />

              <SideLink
                label="Financial Risk"
                onClick={() =>
                  scrollTo("financial-risk")
                }
              />

              <SideLink
                label="An Additional Protection Layer"
                onClick={() =>
                  scrollTo("additional-protection")
                }
              />

              <SideLink
                label="Helping You Make More Informed Decisions"
                onClick={() =>
                  scrollTo("informed-decisions")
                }
              />

              <SideLink
                label="Fraud Watch Is Not a Guarantee"
                onClick={() =>
                  scrollTo("not-a-guarantee")
                }
              />

              <SideLink
                label="Supporting Property Due Diligence"
                onClick={() =>
                  scrollTo("supporting-due-diligence")
                }
              />

              <SideLink
                label="What Fraud Watch Adds"
                onClick={() =>
                  scrollTo("what-fraud-watch-adds")
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
              DYNAMIC PREVIOUS / NEXT
          ================================================= */}

          <div style={sideCardStyle}>
            {previousArticle && (
              <>
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
              </>
            )}

            {previousArticle && nextArticle && (
              <div
                style={{
                  height: "1px",
                  background: "#e4e9ef",
                  margin: "18px 0",
                }}
              />
            )}

            {nextArticle && (
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
   REASON ITEM
============================================================ */

function ReasonItem({
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