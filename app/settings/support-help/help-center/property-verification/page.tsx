"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  ThumbsUp,
  ThumbsDown,
  Check,
  ShieldCheck,
  Lightbulb,
} from "lucide-react";

import styles from "./property-verification.module.css";

/* =========================================================
   ARTICLE ROUTES
   Keep the complete article order in ONE place.
========================================================= */

const ARTICLE_BASE =
  "/settings/support-help/help-center/property-verification";

const articles = [
  {
    title: "What is Property Verification?",
    path: ARTICLE_BASE,
  },
  {
    title: "Why Verify a Property?",
    path: `${ARTICLE_BASE}/why-verify`,
  },
  {
    title: "How It Works (Overview)",
    path: `${ARTICLE_BASE}/how-it-works`,
  },
  {
    title: "What You Can Verify",
    path: `${ARTICLE_BASE}/what-you-can-verify`,
  },
  {
    title: "What Happens After You Verify",
    path: `${ARTICLE_BASE}/what-happens-after-you-verify`,
  },
  {
    title: "What You Can't Verify",
    path: `${ARTICLE_BASE}/what-you-cant-verify`,
  },
  {
    title: "Verification Results",
    path: `${ARTICLE_BASE}/verification-results`,
  },
  {
    title: "Need More Help?",
    path: `${ARTICLE_BASE}/need-more-help`,
  },
];

/* =========================================================
   CURRENT ARTICLE
========================================================= */

const CURRENT_INDEX = 0;

export default function PropertyVerificationArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const goToArticle = (index: number) => {
    const article = articles[index];

    if (!article) return;

    router.push(article.path);
  };

  const goToHelpCenter = () => {
    router.push("/settings/support-help/help-center");
  };

  const previousArticle =
    CURRENT_INDEX > 0
      ? articles[CURRENT_INDEX - 1]
      : null;

  const nextArticle =
    CURRENT_INDEX < articles.length - 1
      ? articles[CURRENT_INDEX + 1]
      : null;

  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim().toLowerCase();

    if (!query) return;

    const matchingIndex = articles.findIndex((article) =>
      article.title.toLowerCase().includes(query)
    );

    if (matchingIndex !== -1) {
      goToArticle(matchingIndex);
      return;
    }

    router.push("/settings/support-help/help-center");
  };

  /* =====================================================
     FEEDBACK
  ===================================================== */

  const handleFeedback = (value: "yes" | "no") => {
    setFeedback(value);
  };

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className={styles.page}>
      {/* =====================================================
          TOP SEARCH BAR
      ===================================================== */}

      <header className={styles.topHeader}>
        <form
          className={styles.searchBox}
          onSubmit={handleSearch}
        >
          <Search
            size={20}
            strokeWidth={2}
            className={styles.searchIcon}
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search for articles, guides, and topics"
            aria-label="Search help articles"
          />
        </form>
      </header>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <div className={styles.layout}>
        {/* ===================================================
            MAIN ARTICLE
        =================================================== */}

        <article className={styles.article}>
          {/* =================================================
              ARTICLE HEADER
          ================================================= */}

          <header className={styles.articleHeader}>
            <h1>Property Verification</h1>

            <p>
              Learn how to verify properties and understand
              verification reports.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={goToHelpCenter}
            >
              <ArrowLeft size={16} />
              Back to Help Center
            </button>
          </header>

          <div className={styles.divider} />

          {/* =================================================
              WHAT IS PROPERTY VERIFICATION?
          ================================================= */}

          <section className={styles.articleSection}>
            <div className={styles.sectionIcon}>
              <ShieldCheck size={31} strokeWidth={1.8} />
            </div>

            <div className={styles.sectionContent}>
              <h2>What is Property Verification?</h2>

              <p>
                Property Verification is our core service that
                uses AI, official data sources, and blockchain
                technology to verify the authenticity of
                property documents and details.
              </p>

              <p className={styles.intro}>
                It helps you:
              </p>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check size={11} strokeWidth={3} />
                  </span>
                  Confirm property ownership and details
                </li>

                <li>
                  <span>
                    <Check size={11} strokeWidth={3} />
                  </span>
                  Verify document authenticity
                </li>

                <li>
                  <span>
                    <Check size={11} strokeWidth={3} />
                  </span>
                  Detect fraud and potential risks
                </li>

                <li>
                  <span>
                    <Check size={11} strokeWidth={3} />
                  </span>
                  Get a tamper-proof verification report
                </li>
              </ul>

              <div className={styles.tipBox}>
                <span className={styles.tipIcon}>
                  <Lightbulb size={19} />
                </span>

                <div>
                  <strong>Tip:</strong>{" "}
                  Always verify before you buy, sell, or invest
                  in any property.
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              BOTTOM ARTICLE NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>
            {previousArticle ? (
              <button
                type="button"
                className={styles.previousButton}
                onClick={() =>
                  goToArticle(CURRENT_INDEX - 1)
                }
              >
                <ArrowLeft size={18} />

                <span>
                  <small>Previous Article</small>
                  <strong>{previousArticle.title}</strong>
                </span>
              </button>
            ) : (
              <div />
            )}

            {nextArticle && (
              <button
                type="button"
                className={styles.nextButton}
                onClick={() =>
                  goToArticle(CURRENT_INDEX + 1)
                }
              >
                <span>
                  <small>Next Article</small>
                  <strong>{nextArticle.title}</strong>
                </span>

                <ArrowRight
                  size={20}
                  className={styles.nextArrow}
                />
              </button>
            )}
          </div>
        </article>

        {/* ===================================================
            RIGHT SIDEBAR
        =================================================== */}

        <aside className={styles.rightSidebar}>
          {/* =================================================
              IN THIS ARTICLE
          ================================================= */}

          <section className={styles.sideCard}>
            <h3>In this article</h3>

            <nav className={styles.articleNav}>
              {articles.map((article, index) => (
                <button
                  key={article.path}
                  type="button"
                  className={
                    index === CURRENT_INDEX
                      ? styles.activeArticle
                      : ""
                  }
                  onClick={() => goToArticle(index)}
                  aria-current={
                    index === CURRENT_INDEX
                      ? "page"
                      : undefined
                  }
                >
                  <span
                    className={
                      index === CURRENT_INDEX
                        ? styles.activeDot
                        : ""
                    }
                  />

                  {article.title}
                </button>
              ))}
            </nav>
          </section>

          {/* =================================================
              WAS THIS HELPFUL?
          ================================================= */}

          <section className={styles.sideCard}>
            <h3>Was this helpful?</h3>

            {feedback === null ? (
              <div className={styles.feedback}>
                <button
                  type="button"
                  onClick={() => handleFeedback("yes")}
                  aria-label="Yes, this article was helpful"
                >
                  <ThumbsUp
                    size={17}
                    strokeWidth={1.8}
                  />
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => handleFeedback("no")}
                  aria-label="No, this article was not helpful"
                >
                  <ThumbsDown
                    size={17}
                    strokeWidth={1.8}
                  />
                  No
                </button>
              </div>
            ) : (
              <div className={styles.feedbackMessage}>
                <Check size={17} />

                <span>
                  Thanks for your feedback.
                </span>
              </div>
            )}
          </section>

          {/* =================================================
              ARTICLE NAVIGATION
          ================================================= */}

          <section className={styles.sideCard}>
            {/* PREVIOUS */}

            {previousArticle ? (
              <button
                type="button"
                className={styles.previousArticle}
                onClick={() =>
                  goToArticle(CURRENT_INDEX - 1)
                }
              >
                <ArrowLeft size={16} />

                <span>
                  <small>Previous Article</small>
                  <strong>
                    {previousArticle.title}
                  </strong>
                </span>
              </button>
            ) : (
              <div className={styles.previousDisabled}>
                <ArrowLeft size={16} />

                <span>
                  <small>Previous Article</small>
                  <strong>—</strong>
                </span>
              </div>
            )}

            <div className={styles.sideDivider} />

            {/* NEXT */}

            {nextArticle ? (
              <button
                type="button"
                className={styles.nextArticle}
                onClick={() =>
                  goToArticle(CURRENT_INDEX + 1)
                }
              >
                <span>
                  <small>Next Article</small>
                  <strong>
                    {nextArticle.title}
                  </strong>
                </span>

                <ArrowRight size={18} />
              </button>
            ) : (
              <div className={styles.nextDisabled}>
                <span>
                  <small>Next Article</small>
                  <strong>—</strong>
                </span>
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}