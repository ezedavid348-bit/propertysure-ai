"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileSearch,
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

export default function ReviewVerificationFindingsArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /* =========================================================
     CURRENT ARTICLE
  ========================================================= */

  const currentIndex = 6;

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
              Learn how to review the findings included in
              your PropertySure AI verification report.
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
            id="review-findings"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                PropertySure AI verification findings
                summarize the results identified during the
                verification of the submitted property document
                package and related verification information.
                Reviewing these findings helps you understand
                what was identified during the verification
                process.
              </p>

              <p>
                Findings should be reviewed together with the
                rest of the verification report. A finding may
                require additional attention, clarification, or
                professional review depending on the property
                and the information involved.
              </p>

              <h2>
                Steps to Review Verification Findings
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
                      Open the Verification Report
                    </h3>

                    <p>
                      Go to Reports &amp; History and select
                      the completed verification you want to
                      review. Open the available verification
                      report to view its details.
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
                      Locate the Findings
                    </h3>

                    <p>
                      Review the findings section of the report
                      to see the issues, observations, or
                      verification results identified from the
                      submitted property information and
                      documents.
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
                      Read Each Finding Carefully
                    </h3>

                    <p>
                      Read each finding and its supporting
                      details carefully. Consider the context
                      provided in the report rather than
                      relying on a single finding in isolation.
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
                      Check the Supporting Information
                    </h3>

                    <p>
                      Review the relevant document details,
                      verification information, and other
                      available evidence associated with the
                      finding. This can help you understand why
                      the finding was identified.
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
                      Decide Whether Further Review Is Needed
                    </h3>

                    <p>
                      If a finding raises a concern or requires
                      clarification, consider obtaining
                      additional documentation or consulting a
                      qualified property lawyer, surveyor, or
                      other appropriate professional.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  FINDINGS INFORMATION
              ================================================= */}

              <div
                id="understanding-findings"
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <FileSearch
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>Review the full context.</strong>{" "}
                  Verification findings should be considered
                  together with the documents, information, and
                  other results included in the report. A
                  finding does not automatically mean that a
                  property transaction must or must not proceed.
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

                  Review all findings rather than focusing on
                  only one item in the report.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Check the supporting information associated
                  with each finding where available.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Pay particular attention to findings that
                  require clarification or additional
                  documentation.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Keep a copy of the report and supporting
                  documents for your records.
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
                  PropertySure AI verification findings are
                  intended to help you assess information
                  identified during the verification process.
                  They do not guarantee that a property is
                  completely safe, legally perfect, or
                  fraud-free. For significant property
                  decisions or unresolved concerns, seek
                  qualified legal or professional advice.
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

                Steps to Review Verification Findings
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "understanding-findings"
                  )
                }
              >
                <span className={styles.articleDot} />

                Understanding Findings
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