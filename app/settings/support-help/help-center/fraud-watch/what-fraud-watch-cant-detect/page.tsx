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

const previousArticle = articles[0];
const currentArticle = articles[1];
const nextArticle = articles[2];

export default function WhatFraudWatchCantDetectPage() {
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
              Understand the limitations of Fraud
              Watch and the types of fraud,
              information, or circumstances that may
              require additional investigation.
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
            {/* LIMITATION BOX */}

            <div
              id="limitations"
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
                  Fraud Watch Has Limitations
                </strong>
                Fraud Watch is designed to help
                identify potential warning signs and
                suspicious property-related
                information. However, it cannot
                independently detect or verify every
                type of fraud or risk.
              </p>
            </div>

            {/* =================================================
                SECTION TITLE
            ================================================= */}

            <h2
              id="what-fraud-watch-cant-detect"
              style={{
                margin: "28px 0 19px",
                color: "#111f39",
                fontSize: "20px",
                lineHeight: 1.3,
                fontWeight: 700,
                scrollMarginTop: "30px",
              }}
            >
              What Fraud Watch Can't Detect
            </h2>

            {/* =================================================
                LIMITATION ITEMS
            ================================================= */}

            <div>
              <Limitation
                number="01"
                id="private-conversations"
                title="Private Conversations"
                text="Fraud Watch cannot see or independently verify private conversations between buyers, sellers, agents, or other parties involved in a transaction."
              />

              <Limitation
                number="02"
                id="seller-intentions"
                title="Seller Intentions"
                text="Fraud Watch cannot determine whether a seller or other party is acting honestly or what their personal intentions may be."
              />

              <Limitation
                number="03"
                id="undisclosed-agreements"
                title="Undisclosed Agreements"
                text="Private agreements or arrangements that are not available through reliable records may not be detected."
              />

              <Limitation
                number="04"
                id="physical-property-conditions"
                title="Physical Property Conditions"
                text="Fraud Watch cannot physically inspect a property or independently confirm its physical condition, boundaries, structures, access, occupation, or other conditions that may require an on-site inspection."
              />

              <Limitation
                number="05"
                id="complete-ownership-verification"
                title="Complete Ownership Verification"
                text="Fraud Watch cannot by itself establish complete legal ownership of a property. Ownership and title questions may require official searches and professional legal review."
              />
            </div>

            {/* =================================================
                IDENTITY / AUTHORITY
            ================================================= */}

            <h2
              id="identity-authority"
              style={{
                margin: "30px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              Identity or Authority
            </h2>

            <p style={paragraphStyle}>
              Fraud Watch cannot independently
              determine whether every person
              presenting property information has the
              legal authority to sell, transfer,
              represent, or otherwise act on behalf of
              a property owner.
            </p>

            {/* =================================================
                NO DETECTABLE SIGNAL
            ================================================= */}

            <h2
              id="no-detectable-signal"
              style={{
                margin: "29px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              Fraud With No Detectable Signal
            </h2>

            <p style={paragraphStyle}>
              Fraud may sometimes occur without
              producing a clear or detectable warning
              signal in the information available to
              Fraud Watch.
            </p>

            <p style={paragraphStyle}>
              A clean result therefore does not
              guarantee that a property or transaction
              is completely free from fraud or other
              risks.
            </p>

            {/* =================================================
                OFFICIAL VERIFICATION
            ================================================= */}

            <h2
              id="official-verification"
              style={{
                margin: "29px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              Official Verification
            </h2>

            <p style={paragraphStyle}>
              Fraud Watch cannot replace official
              verification from the relevant
              government authorities, land registries,
              courts, or other authoritative sources.
            </p>

            {/* =================================================
                CLEAN RESULT
            ================================================= */}

            <h2
              id="clean-result"
              style={{
                margin: "29px 0 14px",
                fontSize: "19px",
                color: "#111f39",
                scrollMarginTop: "30px",
              }}
            >
              Clean Result
            </h2>

            <p style={paragraphStyle}>
              If Fraud Watch does not identify a
              warning, this means that no relevant
              warning signal was identified from the
              information available to the system.
            </p>

            {/* =================================================
                DUE DILIGENCE
            ================================================= */}

            <div
              id="due-diligence"
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
                  Complete Appropriate Due Diligence:
                </strong>{" "}
                Fraud Watch is an additional layer of
                awareness and protection. It does not
                replace official property searches,
                legal review, surveying, physical
                inspection, or other professional
                due-diligence procedures.
              </p>
            </div>

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
                Treat Fraud Watch as an additional
                warning and awareness tool.
              </ActionItem>

              <ActionItem>
                Verify important property details
                through appropriate official sources.
              </ActionItem>

              <ActionItem>
                Request supporting documents and
                clarification where necessary.
              </ActionItem>

              <ActionItem>
                Seek professional legal or property
                advice when appropriate.
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
                Fraud Watch helps identify potential
                warning signs based on available
                information. It cannot detect every
                form of fraud or risk. Always complete
                appropriate due diligence before making
                an important property decision.
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
                label="Fraud Watch Has Limitations"
                onClick={() => scrollTo("limitations")}
              />

              <SideLink
                label="What Fraud Watch Can't Detect"
                onClick={() =>
                  scrollTo(
                    "what-fraud-watch-cant-detect"
                  )
                }
              />

              <SideLink
                label="Private Conversations"
                onClick={() =>
                  scrollTo("private-conversations")
                }
              />

              <SideLink
                label="Seller Intentions"
                onClick={() =>
                  scrollTo("seller-intentions")
                }
              />

              <SideLink
                label="Undisclosed Agreements"
                onClick={() =>
                  scrollTo("undisclosed-agreements")
                }
              />

              <SideLink
                label="Physical Property Conditions"
                onClick={() =>
                  scrollTo(
                    "physical-property-conditions"
                  )
                }
              />

              <SideLink
                label="Complete Ownership Verification"
                onClick={() =>
                  scrollTo(
                    "complete-ownership-verification"
                  )
                }
              />

              <SideLink
                label="Identity or Authority"
                onClick={() =>
                  scrollTo("identity-authority")
                }
              />

              <SideLink
                label="Fraud With No Detectable Signal"
                onClick={() =>
                  scrollTo("no-detectable-signal")
                }
              />

              <SideLink
                label="Official Verification"
                onClick={() =>
                  scrollTo("official-verification")
                }
              />

              <SideLink
                label="Clean Result"
                onClick={() =>
                  scrollTo("clean-result")
                }
              />

              <SideLink
                label="Due Diligence"
                onClick={() =>
                  scrollTo("due-diligence")
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
              PREVIOUS / NEXT ARTICLE
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
   LIMITATION ITEM
============================================================ */

function Limitation({
  number,
  id,
  title,
  text,
}: {
  number: string;
  id: string;
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
        <h3
          style={{
            margin: "1px 0 6px",
            color: "#17243c",
            fontSize: "13px",
            lineHeight: 1.4,
            fontWeight: 700,
          }}
        >
          {title}
        </h3>

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