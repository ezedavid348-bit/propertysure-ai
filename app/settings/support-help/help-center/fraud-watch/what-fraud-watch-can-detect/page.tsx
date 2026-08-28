"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileWarning,
  Globe,
  MapPin,
  ShieldAlert,
  UserRound,
  AlertTriangle,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./what-fraud-watch-can-detect.module.css";

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

export default function WhatFraudWatchCanDetectArticle() {
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

  const currentIndex = 3;

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
              Understand the types of property fraud risks
              Fraud Watch can identify and flag.
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
              <h2>Fraud Watch Looks for Warning Signs</h2>

              <p>
                Fraud Watch analyzes available property-related
                information to identify suspicious patterns,
                inconsistencies, and known warning signs that
                may require further investigation.
              </p>
            </div>
          </section>

          {/* =================================================
              DETECTION SECTION
          ================================================= */}

          <section className={styles.detectionSection}>
            <h2>What Fraud Watch Can Detect</h2>

            <div className={styles.detectionGrid}>
              {/* =================================================
                  SUSPICIOUS PROPERTY INFORMATION
              ================================================= */}

              <div className={styles.detectionCard}>
                <div
                  className={`${styles.cardIcon} ${styles.blueIcon}`}
                >
                  <FileWarning
                    size={25}
                    strokeWidth={1.9}
                  />
                </div>

                <h3>Suspicious Property Information</h3>

                <p>
                  Identifies unusual or inconsistent property
                  information that may indicate a potential
                  fraud risk.
                </p>
              </div>

              {/* =================================================
                  DUPLICATE OR CONFLICTING INFORMATION
              ================================================= */}

              <div className={styles.detectionCard}>
                <div
                  className={`${styles.cardIcon} ${styles.orangeIcon}`}
                >
                  <AlertTriangle
                    size={25}
                    strokeWidth={1.9}
                  />
                </div>

                <h3>Conflicting Information</h3>

                <p>
                  Can flag information that appears inconsistent
                  across available property records or submitted
                  details.
                </p>
              </div>

              {/* =================================================
                  PROPERTY LOCATION
              ================================================= */}

              <div className={styles.detectionCard}>
                <div
                  className={`${styles.cardIcon} ${styles.greenIcon}`}
                >
                  <MapPin
                    size={25}
                    strokeWidth={1.9}
                  />
                </div>

                <h3>Location Irregularities</h3>

                <p>
                  Helps identify unusual differences between
                  stated property information and available
                  location data.
                </p>
              </div>

              {/* =================================================
                  ONLINE FRAUD SIGNALS
              ================================================= */}

              <div className={styles.detectionCard}>
                <div
                  className={`${styles.cardIcon} ${styles.purpleIcon}`}
                >
                  <Globe
                    size={25}
                    strokeWidth={1.9}
                  />
                </div>

                <h3>Reported Online Fraud Signals</h3>

                <p>
                  May identify reported or publicly available
                  warning signals connected to suspicious
                  property activity.
                </p>
              </div>

              {/* =================================================
                  IDENTITY / SELLER WARNING SIGNS
              ================================================= */}

              <div className={styles.detectionCard}>
                <div
                  className={`${styles.cardIcon} ${styles.redIcon}`}
                >
                  <UserRound
                    size={25}
                    strokeWidth={1.9}
                  />
                </div>

                <h3>Identity Warning Signs</h3>

                <p>
                  Can flag available information that presents
                  potential identity or ownership concerns for
                  further review.
                </p>
              </div>

              {/* =================================================
                  KNOWN FRAUD PATTERNS
              ================================================= */}

              <div className={styles.detectionCard}>
                <div
                  className={`${styles.cardIcon} ${styles.yellowIcon}`}
                >
                  <ShieldAlert
                    size={25}
                    strokeWidth={1.9}
                  />
                </div>

                <h3>Known Fraud Patterns</h3>

                <p>
                  Helps identify patterns or warning signs that
                  are commonly associated with property scams
                  and fraudulent activity.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              IMPORTANT NOTE
          ================================================= */}

          <section className={styles.importantBox}>
            <div className={styles.importantIcon}>
              <AlertTriangle
                size={21}
                strokeWidth={2}
              />
            </div>

            <p>
              <strong>Important:</strong>{" "}
              A detected warning sign does not automatically
              mean a property is fraudulent. It means the
              information should be investigated further before
              proceeding with a transaction.
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
                    .getElementById("warning-signs")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                <span className={styles.articleDot} />
                Warning Signs
              </button>

              <button
                type="button"
                className={styles.activeArticle}
                onClick={() =>
                  document
                    .getElementById("what-can-detect")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                <span className={styles.activeDot} />
                What Fraud Watch Can Detect
              </button>

              <button
                type="button"
                className={styles.articleNavItem}
                onClick={() =>
                  document
                    .getElementById("important-note")
                    ?.scrollIntoView({
                      behavior: "smooth",
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

                  <strong>{previousArticle.title}</strong>
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