"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./understanding-fraud-watch-results.module.css";

type Article = {
  title: string;
  slug: string;
};

const fraudWatchArticles: Article[] = [
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
    title: "What Happens When Fraud is Detected",
    slug: "what-happens-when-fraud-is-detected",
  },
  {
    title: "What Fraud Watch Can't Detect",
    slug: "what-fraud-watch-cant-detect",
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

export default function UnderstandingFraudWatchResultsArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /* =========================================================
     CURRENT ARTICLE
  ========================================================= */

  const currentIndex = 6;

  const currentArticle = fraudWatchArticles[currentIndex];

  const previousArticle =
    fraudWatchArticles[currentIndex - 1];

  const nextArticle =
    fraudWatchArticles[currentIndex + 1];

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goToHelpCenter = () => {
    router.push("/settings/support-help/help-center");
  };

  const goToArticle = (article: Article) => {
    router.push(`${basePath}/${article.slug}`);
  };

  const goToPreviousArticle = () => {
    if (previousArticle) {
      goToArticle(previousArticle);
    }
  };

  const goToNextArticle = () => {
    if (nextArticle) {
      goToArticle(nextArticle);
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return fraudWatchArticles;
    }

    return fraudWatchArticles.filter((article) =>
      article.title.toLowerCase().includes(query)
    );
  }, [search]);

  /* =========================================================
     FEEDBACK
  ========================================================= */

  const handleFeedback = (value: "yes" | "no") => {
    setFeedback(value);
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className={styles.page}>
      {/* =====================================================
          TOP SEARCH
      ===================================================== */}

      <header className={styles.topHeader}>
        <div className={styles.searchBox}>
          <svg
            className={styles.searchIcon}
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
            />

            <path
              d="M16.5 16.5L21 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for articles, guides, and topics"
            aria-label="Search help articles"
          />
        </div>

        {search.trim() && (
          <div className={styles.searchResults}>
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <button
                  key={article.slug}
                  type="button"
                  onClick={() => goToArticle(article)}
                >
                  {article.title}
                </button>
              ))
            ) : (
              <span>No matching articles found.</span>
            )}
          </div>
        )}
      </header>

      {/* =====================================================
          MAIN LAYOUT
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
            <h1>{currentArticle.title}</h1>

            <p>
              Learn how to understand Fraud Watch results and
              what different warnings and status indicators
              mean.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={goToHelpCenter}
            >
              <ArrowLeft size={17} />
              Back to Help Center
            </button>
          </header>

          <div className={styles.divider} />

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <section className={styles.contentCard}>
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                Fraud Watch results are designed to help you
                understand whether a property has information
                that may require further attention.
              </p>

              <p>
                A result does not automatically mean that a
                property is fraudulent. Instead, it highlights
                information or activity that may require
                additional investigation.
              </p>

              <h2>Understanding the result</h2>

              <p>
                Fraud Watch may present different findings
                depending on the information available for the
                property.
              </p>

              <div className={styles.resultList}>
                <div className={styles.resultItem}>
                  <div className={styles.resultIcon}>
                    <CheckCircle2
                      size={22}
                      strokeWidth={1.9}
                    />
                  </div>

                  <div>
                    <h3>No Warning Detected</h3>

                    <p>
                      No relevant warning signs were identified
                      from the information checked at the time
                      of the scan.
                    </p>
                  </div>
                </div>

                <div className={styles.resultItem}>
                  <div className={styles.resultIcon}>
                    <Info
                      size={22}
                      strokeWidth={1.9}
                    />
                  </div>

                  <div>
                    <h3>Review Recommended</h3>

                    <p>
                      Some information may require additional
                      attention or verification before you
                      proceed with the property.
                    </p>
                  </div>
                </div>

                <div className={styles.resultItem}>
                  <div className={styles.resultIcon}>
                    <Info
                      size={22}
                      strokeWidth={1.9}
                    />
                  </div>

                  <div>
                    <h3>Potential Risk Detected</h3>

                    <p>
                      Fraud Watch has identified information
                      that may indicate a potential fraud risk.
                      Further investigation is recommended.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  IMPORTANT NOTE
              ================================================= */}

              <div className={styles.infoBox}>
                <div className={styles.infoIcon}>
                  <Info
                    size={22}
                    strokeWidth={1.9}
                  />
                </div>

                <p>
                  <strong>Important:</strong> A Fraud Watch
                  result is an indication that should help guide
                  your next steps. It is not, by itself, a final
                  legal determination that fraud has occurred.
                </p>
              </div>

              <h2>What you should do next</h2>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <CheckCircle2
                      size={13}
                      strokeWidth={2.2}
                    />
                  </span>

                  Review the details included in the result.
                </li>

                <li>
                  <span>
                    <CheckCircle2
                      size={13}
                      strokeWidth={2.2}
                    />
                  </span>

                  Investigate any warning signs identified.
                </li>

                <li>
                  <span>
                    <CheckCircle2
                      size={13}
                      strokeWidth={2.2}
                    />
                  </span>

                  Verify important information through
                  appropriate official or professional sources.
                </li>

                <li>
                  <span>
                    <CheckCircle2
                      size={13}
                      strokeWidth={2.2}
                    />
                  </span>

                  Avoid making payments or commitments until
                  serious concerns have been investigated.
                </li>
              </ul>
            </div>
          </section>

          {/* =================================================
              BOTTOM ARTICLE NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>
            {/* PREVIOUS ARTICLE */}

            {previousArticle && (
              <button
                type="button"
                className={styles.previousBottom}
                onClick={goToPreviousArticle}
              >
                <ArrowLeft
                  className={styles.bottomPreviousArrow}
                  size={19}
                />

                <span>
                  <small>Previous Article</small>

                  <strong>
                    {previousArticle.title}
                  </strong>
                </span>
              </button>
            )}

            {/* NEXT ARTICLE */}

            {nextArticle && (
              <button
                type="button"
                className={styles.nextBottom}
                onClick={goToNextArticle}
              >
                <span>
                  <small>Next Article</small>

                  <strong>
                    {nextArticle.title}
                  </strong>
                </span>

                <ArrowRight size={20} />
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
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("understanding-results")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                }
              >
                <span className={styles.articleDot} />

                Understanding the result
              </button>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("what-to-do")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                }
              >
                <span className={styles.articleDot} />

                What you should do next
              </button>

              <button
                type="button"
                className={styles.activeArticle}
                onClick={() =>
                  document
                    .getElementById("important-note")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                }
              >
                <span className={styles.activeDot} />

                Important Note
              </button>
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
                >
                  <ThumbsUp
                    size={18}
                    strokeWidth={1.8}
                  />

                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => handleFeedback("no")}
                >
                  <ThumbsDown
                    size={18}
                    strokeWidth={1.8}
                  />

                  No
                </button>
              </div>
            ) : (
              <div className={styles.feedbackMessage}>
                <CheckCircle2 size={18} />

                <span>
                  Thanks for your feedback.
                </span>
              </div>
            )}
          </section>

          {/* =================================================
              SIDEBAR ARTICLE NAVIGATION
          ================================================= */}

          <section className={styles.sideCard}>
            {/* PREVIOUS */}

            {previousArticle && (
              <button
                type="button"
                className={styles.previousArticle}
                onClick={goToPreviousArticle}
              >
                <ArrowLeft
                  className={styles.sidebarPreviousArrow}
                  size={16}
                />

                <span>
                  <small>Previous Article</small>

                  <strong>
                    {previousArticle.title}
                  </strong>
                </span>
              </button>
            )}

            {/* DIVIDER */}

            {nextArticle && (
              <>
                <div className={styles.sideDivider} />

                {/* NEXT */}

                <button
                  type="button"
                  className={styles.nextArticle}
                  onClick={goToNextArticle}
                >
                  <span>
                    <small>Next Article</small>

                    <strong>
                      {nextArticle.title}
                    </strong>
                  </span>

                  <ArrowRight
                    className={styles.sidebarNextArrow}
                    size={17}
                  />
                </button>
              </>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}