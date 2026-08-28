"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileWarning,
  Info,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./what-happens-when-fraud-is-detected.module.css";

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

export default function WhatHappensWhenFraudIsDetectedArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /*
   * =====================================================
   * CURRENT ARTICLE
   * =====================================================
   */

  const currentIndex = 4;

  const currentArticle = fraudWatchArticles[currentIndex];
  const previousArticle = fraudWatchArticles[currentIndex - 1];
  const nextArticle = fraudWatchArticles[currentIndex + 1];

  /*
   * =====================================================
   * NAVIGATION
   * =====================================================
   */

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

  /*
   * =====================================================
   * SEARCH
   * =====================================================
   */

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return fraudWatchArticles;
    }

    return fraudWatchArticles.filter((article) =>
      article.title.toLowerCase().includes(query)
    );
  }, [search]);

  /*
   * =====================================================
   * FEEDBACK
   * =====================================================
   */

  const handleFeedback = (value: "yes" | "no") => {
    setFeedback(value);
  };

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

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
              Learn what happens when Fraud Watch identifies a
              potential warning sign or suspicious activity.
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
              INTRODUCTION
          ================================================= */}

          <section className={styles.introCard}>
            <div className={styles.introIcon}>
              <ShieldAlert
                size={27}
                strokeWidth={1.9}
              />
            </div>

            <div className={styles.introText}>
              <h2>A Warning Does Not Automatically Mean Fraud</h2>

              <p>
                When Fraud Watch identifies a potential risk,
                the information is flagged for further review.
                A warning is not a final determination that a
                property or person is fraudulent.
              </p>
            </div>
          </section>

          {/* =================================================
              WHAT HAPPENS
          ================================================= */}

          <section
            id="what-happens"
            className={styles.contentSection}
          >
            <h2>What Happens When a Risk is Detected</h2>

            <div className={styles.stepsGrid}>
              {/* STEP 1 */}

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>

                <div
                  className={`${styles.stepIcon} ${styles.blueIcon}`}
                >
                  <FileWarning
                    size={24}
                    strokeWidth={1.9}
                  />
                </div>

                <h3>A Warning is Identified</h3>

                <p>
                  Fraud Watch identifies information or a
                  pattern that may require additional attention.
                </p>
              </div>

              {/* STEP 2 */}

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>

                <div
                  className={`${styles.stepIcon} ${styles.orangeIcon}`}
                >
                  <AlertTriangle
                    size={24}
                    strokeWidth={1.9}
                  />
                </div>

                <h3>The Risk is Flagged</h3>

                <p>
                  The potential issue is presented as a warning
                  so you can review the information carefully.
                </p>
              </div>

              {/* STEP 3 */}

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>

                <div
                  className={`${styles.stepIcon} ${styles.yellowIcon}`}
                >
                  <Info
                    size={24}
                    strokeWidth={1.9}
                  />
                </div>

                <h3>You Review the Information</h3>

                <p>
                  You should investigate the warning and compare
                  it with relevant property documents and
                  available official records.
                </p>
              </div>

              {/* STEP 4 */}

              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>4</div>

                <div
                  className={`${styles.stepIcon} ${styles.greenIcon}`}
                >
                  <CheckCircle2
                    size={24}
                    strokeWidth={1.9}
                  />
                </div>

                <h3>You Decide What to Do</h3>

                <p>
                  Use the available information to decide whether
                  further verification or professional advice is
                  necessary before proceeding.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              IMPORTANT NOTICE
          ================================================= */}

          <section
            id="important-note"
            className={styles.importantBox}
          >
            <div className={styles.importantIcon}>
              <AlertTriangle
                size={21}
                strokeWidth={2}
              />
            </div>

            <p>
              <strong>Important:</strong>{" "}
              Fraud Watch provides risk signals and warnings.
              It does not make a final legal determination that
              a person, property, document, or transaction is
              fraudulent.
            </p>
          </section>

          {/* =================================================
              BOTTOM ARTICLE NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>
            {/* PREVIOUS */}

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

                  <strong>{previousArticle.title}</strong>
                </span>
              </button>
            )}

            {/* NEXT */}

            {nextArticle && (
              <button
                type="button"
                className={styles.nextBottom}
                onClick={goToNextArticle}
              >
                <span>
                  <small>Next Article</small>

                  <strong>{nextArticle.title}</strong>
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
                className={styles.articleNavItem}
                onClick={() =>
                  document
                    .getElementById("what-happens")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                <span className={styles.articleDot} />

                What Happens When a Risk is Detected
              </button>

              <button
                type="button"
                className={styles.activeArticle}
                onClick={() =>
                  document
                    .getElementById("important-note")
                    ?.scrollIntoView({
                      behavior: "smooth",
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

                  <strong>{previousArticle.title}</strong>
                </span>
              </button>
            )}

            <div className={styles.sideDivider} />

            {nextArticle && (
              <button
                type="button"
                className={styles.nextArticle}
                onClick={goToNextArticle}
              >
                <span>
                  <small>Next Article</small>

                  <strong>{nextArticle.title}</strong>
                </span>

                <ArrowRight
                  className={styles.sidebarNextArrow}
                  size={17}
                />
              </button>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}