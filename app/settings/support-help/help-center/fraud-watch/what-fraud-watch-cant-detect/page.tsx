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

import styles from "./what-fraud-watch-cant-detect.module.css";

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

export default function WhatFraudWatchCantDetectArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /*
   * =========================================================
   * CURRENT ARTICLE
   * =========================================================
   */

  const currentIndex = 5;

  const currentArticle = fraudWatchArticles[currentIndex];

  const previousArticle =
    fraudWatchArticles[currentIndex - 1];

  const nextArticle =
    fraudWatchArticles[currentIndex + 1];

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
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
   * =========================================================
   * SEARCH
   * =========================================================
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
   * =========================================================
   * FEEDBACK
   * =========================================================
   */

  const handleFeedback = (value: "yes" | "no") => {
    setFeedback(value);
  };

  /*
   * =========================================================
   * PAGE
   * =========================================================
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
              Understand the limitations of Fraud Watch and
              what it cannot independently verify.
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
              <div className={styles.introBox}>
                <div className={styles.introIcon}>
                  <Info
                    size={24}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <h2>
                    Fraud Watch Has Limitations
                  </h2>

                  <p>
                    Fraud Watch is designed to identify
                    potential warning signs and suspicious
                    property-related information. However,
                    it cannot detect every type of fraud or
                    independently verify every situation.
                  </p>
                </div>
              </div>

              <h2>What Fraud Watch Can't Detect</h2>

              <div className={styles.limitList}>
                <div className={styles.limitItem}>
                  <span className={styles.number}>
                    01
                  </span>

                  <div>
                    <h3>Private Conversations</h3>

                    <p>
                      Fraud Watch cannot see or verify
                      private conversations between buyers,
                      sellers, agents, or other parties.
                    </p>
                  </div>
                </div>

                <div className={styles.limitItem}>
                  <span className={styles.number}>
                    02
                  </span>

                  <div>
                    <h3>Seller Intentions</h3>

                    <p>
                      It cannot determine whether a seller
                      is acting honestly or what their
                      personal intentions may be.
                    </p>
                  </div>
                </div>

                <div className={styles.limitItem}>
                  <span className={styles.number}>
                    03
                  </span>

                  <div>
                    <h3>Undisclosed Agreements</h3>

                    <p>
                      Private agreements or arrangements
                      that are not available through
                      reliable records may not be detected.
                    </p>
                  </div>
                </div>

                <div className={styles.limitItem}>
                  <span className={styles.number}>
                    04
                  </span>

                  <div>
                    <h3>Physical Property Condition</h3>

                    <p>
                      Fraud Watch does not physically inspect
                      buildings, land, construction quality,
                      structural conditions, or repairs.
                    </p>
                  </div>
                </div>

                <div className={styles.limitItem}>
                  <span className={styles.number}>
                    05
                  </span>

                  <div>
                    <h3>Future Fraud</h3>

                    <p>
                      Fraud Watch cannot predict whether a
                      property or transaction will become
                      fraudulent in the future.
                    </p>
                  </div>
                </div>

                <div className={styles.limitItem}>
                  <span className={styles.number}>
                    06
                  </span>

                  <div>
                    <h3>Information Outside Available Sources</h3>

                    <p>
                      If reliable information is unavailable,
                      incomplete, or not accessible, Fraud
                      Watch cannot independently confirm it.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  IMPORTANT NOTE
              ================================================= */}

              <div className={styles.noticeBox}>
                <div className={styles.noticeIcon}>
                  <Info
                    size={22}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>Important:</strong>{" "}
                  A clean Fraud Watch result does not mean
                  that a property or transaction is
                  completely risk-free. It means no relevant
                  warning signs were identified from the
                  information and sources available to us.
                </p>
              </div>
            </div>
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

                  <strong>
                    {previousArticle.title}
                  </strong>
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
                    .getElementById("limitations")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                }
              >
                <span className={styles.articleDot} />
                Fraud Watch Has Limitations
              </button>

              <button
                type="button"
                className={styles.activeArticle}
                onClick={() =>
                  document
                    .getElementById("cannot-detect")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                }
              >
                <span className={styles.activeDot} />
                What Fraud Watch Can't Detect
              </button>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("important-note")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                }
              >
                <span className={styles.articleDot} />
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
                  onClick={() =>
                    handleFeedback("yes")
                  }
                >
                  <ThumbsUp
                    size={18}
                    strokeWidth={1.8}
                  />
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleFeedback("no")
                  }
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

            <div className={styles.sideDivider} />

            {/* NEXT */}

            {nextArticle && (
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
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}