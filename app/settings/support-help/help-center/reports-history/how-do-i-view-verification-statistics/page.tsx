"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "../../account-security/how-do-i-update-my-account-information/how-do-i-update-my-account-information.module.css";

type Article = {
  title: string;
  slug: string;
};

const reportsHistoryArticles: Article[] = [
  {
    title: "How do I view my verification reports?",
    slug: "how-do-i-view-my-verification-reports",
  },
  {
    title: "How do I download a verification report?",
    slug: "how-do-i-download-a-verification-report",
  },
  {
    title: "How do I understand my verification report?",
    slug: "how-do-i-understand-my-verification-report",
  },
  {
    title: "How do I view my verification history?",
    slug: "how-do-i-view-my-verification-history",
  },
  {
    title: "How do I search my verification history?",
    slug: "how-do-i-search-my-verification-history",
  },
  {
    title: "How do I check the status of a verification?",
    slug: "how-do-i-check-the-status-of-a-verification",
  },
  {
    title: "How do I review verification findings?",
    slug: "how-do-i-review-verification-findings",
  },
  {
    title: "How do I view verification statistics?",
    slug: "how-do-i-view-verification-statistics",
  },
  {
    title: "How do I verify a report is complete?",
    slug: "how-do-i-verify-a-report-is-complete",
  },
  {
    title: "Need More Help?",
    slug: "need-more-help",
  },
];

const basePath =
  "/settings/support-help/help-center/reports-history";

const reportsHistoryPath =
  "/settings/support-help/help-center/reports-history";

export default function ViewVerificationStatisticsArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /* =========================================================
     CURRENT ARTICLE
  ========================================================= */

  const currentIndex = 7;

  const currentArticle =
    reportsHistoryArticles[currentIndex];

  const previousArticle =
    reportsHistoryArticles[currentIndex - 1];

  const nextArticle =
    reportsHistoryArticles[currentIndex + 1];

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goToReportsHistory = () => {
    router.push(reportsHistoryPath);
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
     SECTION NAVIGATION
  ========================================================= */

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return reportsHistoryArticles;
    }

    return reportsHistoryArticles.filter((article) =>
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
            onChange={(event) =>
              setSearch(event.target.value)
            }
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
              <span>
                No matching articles found.
              </span>
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
              Learn how to view and interpret verification
              statistics available in your PropertySure AI
              account.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={goToReportsHistory}
            >
              <ArrowLeft size={17} />
              Back to Reports &amp; History
            </button>
          </header>

          <div className={styles.divider} />

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <section
            id="verification-statistics"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                PropertySure AI may provide verification
                statistics to help you understand activity and
                trends across the property verifications
                associated with your account.
              </p>

              <p>
                These statistics can provide a broader view of
                your verification activity, such as the number
                of verifications submitted, completed, or
                currently being processed, depending on the
                information available in your account.
              </p>

              <h2>
                Steps to View Verification Statistics
              </h2>

              <div
                id="steps"
                className={styles.processList}
              >
                {/* =================================================
                    STEP 1
                ================================================= */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    1
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Open Reports &amp; History
                    </h3>

                    <p>
                      Sign in to your PropertySure AI account
                      and navigate to the Reports &amp; History
                      section.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    STEP 2
                ================================================= */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    2
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Locate the Statistics Section
                    </h3>

                    <p>
                      Look for the available statistics,
                      summary information, or analytics area
                      associated with your verification activity.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    STEP 3
                ================================================= */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    3
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Review Your Verification Activity
                    </h3>

                    <p>
                      Review the statistics shown for your
                      verification activity, including available
                      information about submitted, completed,
                      or processing verifications.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    STEP 4
                ================================================= */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    4
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Compare the Available Information
                    </h3>

                    <p>
                      Use the available statistics to understand
                      your overall verification activity and
                      identify changes or patterns over the
                      relevant period.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    STEP 5
                ================================================= */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    5
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Open Individual Reports for Details
                    </h3>

                    <p>
                      If you need more information about a
                      particular verification, open its
                      individual report and review the detailed
                      verification results and findings.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  STATISTICS INFORMATION
              ================================================= */}

              <div
                id="understanding-statistics"
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <BarChart3
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>Use statistics as a summary.</strong>{" "}
                  Verification statistics provide an overview
                  of activity and should not replace reviewing
                  the individual verification reports and
                  findings for specific properties.
                </p>
              </div>

              {/* =================================================
                  THINGS TO KEEP IN MIND
              ================================================= */}

              <h2 id="things-to-keep-in-mind">
                Things to Keep in Mind
              </h2>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Statistics provide a summary of verification
                  activity and may not contain all details from
                  individual reports.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Review individual verification reports when
                  you need property-specific findings.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Make sure you understand the period or scope
                  covered by the statistics being displayed.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Use the statistics as supporting information
                  rather than as a substitute for property
                  due diligence.
                </li>
              </ul>

              {/* =================================================
                  IMPORTANT NOTE
              ================================================= */}

              <div
                id="important-note"
                className={styles.noteBox}
              >
                <div className={styles.noteIcon}>
                  <CheckCircle2
                    size={22}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>Important:</strong>{" "}
                  Verification statistics are summary
                  information and do not by themselves determine
                  whether a property is safe, legally valid, or
                  free from fraud. For important property
                  decisions, review the complete verification
                  report and seek qualified legal or
                  professional advice when necessary.
                </p>
              </div>
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
                className={styles.activeArticle}
                onClick={() =>
                  scrollToSection("steps")
                }
              >
                <span className={styles.activeDot} />

                Steps to View Verification Statistics
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "understanding-statistics"
                  )
                }
              >
                <span className={styles.articleDot} />

                Understanding Statistics
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "things-to-keep-in-mind"
                  )
                }
              >
                <span className={styles.articleDot} />

                Things to Keep in Mind
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("important-note")
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
              <div
                className={
                  styles.feedbackMessage
                }
              >
                <CheckCircle2 size={18} />

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

            {previousArticle && (
              <button
                type="button"
                className={styles.previousArticle}
                onClick={goToPreviousArticle}
              >
                <ArrowLeft
                  className={
                    styles.sidebarPreviousArrow
                  }
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

            {previousArticle && nextArticle && (
              <div className={styles.sideDivider} />
            )}

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
                  className={
                    styles.sidebarNextArrow
                  }
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