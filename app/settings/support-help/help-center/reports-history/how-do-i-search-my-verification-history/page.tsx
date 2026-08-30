"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
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

export default function SearchVerificationHistoryArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /* =========================================================
     CURRENT ARTICLE
  ========================================================= */

  const currentIndex = 4;

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
    router.push(basePath);
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

  const handleFeedback = (
    value: "yes" | "no"
  ) => {
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
                  onClick={() =>
                    goToArticle(article)
                  }
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
              Learn how to find specific verification
              records using the search tools available
              in your Reports &amp; History section.
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
            id="search-history"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                Your Reports &amp; History section may contain
                multiple property verification records. The
                search feature helps you quickly locate a
                particular verification without having to
                review every record manually.
              </p>

              <p>
                You can search your verification history using
                information associated with the verification,
                such as a property name, reference information,
                or other available search terms.
              </p>

              {/* =================================================
                  STEPS
              ================================================= */}

              <h2>
                Steps to Search Your Verification History
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
                      and open the Reports &amp; History section
                      from your account dashboard.
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
                      Locate the Search Field
                    </h3>

                    <p>
                      Look for the search field or search
                      option provided within your verification
                      history.
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
                      Enter Your Search Term
                    </h3>

                    <p>
                      Enter a relevant property name,
                      verification reference, or other
                      available information that can help
                      identify the verification you are
                      looking for.
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
                      Review the Search Results
                    </h3>

                    <p>
                      Review the records returned by the search
                      and select the verification you want to
                      view.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  SEARCH RESULT
              ================================================= */}

              <div
                id="search-result"
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <CheckCircle2
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>Search completed.</strong>{" "}
                  When matching verification records are found,
                  review the available information and select
                  the appropriate record to open its details.
                </p>
              </div>

              {/* =================================================
                  SEARCH TIPS
              ================================================= */}

              <h2 id="search-tips">
                Search Tips
              </h2>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Use information that is closely associated
                  with the verification you are trying to find.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Check your spelling when searching by a
                  property name or reference.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Review the returned records carefully before
                  opening a verification.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  If you cannot find a record, try another
                  available search term.
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
                  Search results depend on the information
                  available in your verification history. If
                  you cannot locate a verification, confirm
                  that you are using the correct search
                  information and check whether the
                  verification has been completed or recorded
                  in your account.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              BOTTOM ARTICLE NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>
            {/* =================================================
                PREVIOUS ARTICLE
            ================================================= */}

            {previousArticle && (
              <button
                type="button"
                className={styles.previousBottom}
                onClick={goToPreviousArticle}
              >
                <ArrowLeft
                  className={
                    styles.bottomPreviousArrow
                  }
                  size={19}
                />

                <span>
                  <small>
                    Previous Article
                  </small>

                  <strong>
                    {previousArticle.title}
                  </strong>
                </span>
              </button>
            )}

            {/* =================================================
                NEXT ARTICLE
            ================================================= */}

            {nextArticle && (
              <button
                type="button"
                className={styles.nextBottom}
                onClick={goToNextArticle}
              >
                <span>
                  <small>
                    Next Article
                  </small>

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
                <span
                  className={styles.activeDot}
                />

                Steps to Search Your Verification History
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "search-result"
                  )
                }
              >
                <span
                  className={styles.articleDot}
                />

                Search Results
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("search-tips")
                }
              >
                <span
                  className={styles.articleDot}
                />

                Search Tips
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "important-note"
                  )
                }
              >
                <span
                  className={styles.articleDot}
                />

                Important Note
              </button>
            </nav>
          </section>

          {/* =================================================
              FEEDBACK
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
            {/* =================================================
                PREVIOUS
            ================================================= */}

            {previousArticle && (
              <button
                type="button"
                className={
                  styles.previousArticle
                }
                onClick={
                  goToPreviousArticle
                }
              >
                <ArrowLeft
                  className={
                    styles.sidebarPreviousArrow
                  }
                  size={16}
                />

                <span>
                  <small>
                    Previous Article
                  </small>

                  <strong>
                    {previousArticle.title}
                  </strong>
                </span>
              </button>
            )}

            <div
              className={styles.sideDivider}
            />

            {/* =================================================
                NEXT
            ================================================= */}

            {nextArticle && (
              <button
                type="button"
                className={
                  styles.nextArticle
                }
                onClick={
                  goToNextArticle
                }
              >
                <span>
                  <small>
                    Next Article
                  </small>

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