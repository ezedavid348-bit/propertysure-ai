"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Building2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./what-is-propertysure-ai.module.css";

type Article = {
  title: string;
  slug: string;
};

const gettingStartedArticles: Article[] = [
  {
    title: "What is PropertySure AI?",
    slug: "what-is-propertysure-ai",
  },
  {
    title: "How do I create a PropertySure AI account?",
    slug: "how-do-i-create-a-propertysure-ai-account",
  },
];

const basePath =
  "/settings/support-help/help-center/getting-started";

const gettingStartedPath =
  "/settings/support-help/help-center/getting-started";

export default function WhatIsPropertySureAIArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /* =========================================================
     CURRENT ARTICLE
  ========================================================= */

  const currentIndex = 0;

  const currentArticle =
    gettingStartedArticles[currentIndex];

  const nextArticle =
    gettingStartedArticles[currentIndex + 1];

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goToGettingStarted = () => {
    router.push(gettingStartedPath);
  };

  const goToArticle = (article: Article) => {
    router.push(`${basePath}/${article.slug}`);
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
      return gettingStartedArticles;
    }

    return gettingStartedArticles.filter((article) =>
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
            aria-label="Search Getting Started help articles"
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
              Learn what PropertySure AI is, what it does,
              and how it helps you review property information
              and verification activity.
            </p>

            {/* BACK TO GETTING STARTED */}

            <button
              type="button"
              className={styles.backButton}
              onClick={goToGettingStarted}
            >
              <ArrowLeft size={17} />
              Back to Getting Started
            </button>
          </header>

          <div className={styles.divider} />

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <section
            id="what-is-propertysure-ai"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                PropertySure AI is a property verification and
                due-diligence platform designed to help people
                review property documents and verification
                information before making important real estate
                decisions.
              </p>

              <p>
                The platform brings property document review,
                verification findings, verification history,
                and related property risk information into one
                place so users can better understand the
                information available about a property.
              </p>

              <p>
                PropertySure AI is designed to support buyers,
                property owners, investors, agents, and other
                users who want additional information when
                evaluating property documents and verification
                activity.
              </p>

              {/* =================================================
                  WHAT PROPERTYSURE AI DOES
              ================================================= */}

              <h2>
                What PropertySure AI Does
              </h2>

              <div
                id="what-it-does"
                className={styles.processList}
              >
                {/* STEP 1 */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    1
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Reviews Property Documents
                    </h3>

                    <p>
                      PropertySure AI helps process and review
                      submitted property documents as part of
                      a verification request. Depending on the
                      verification, documents may include title,
                      ownership, survey, allocation, or other
                      relevant property records.
                    </p>
                  </div>
                </div>

                {/* STEP 2 */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    2
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Identifies Verification Findings
                    </h3>

                    <p>
                      The platform presents available
                      verification findings and information
                      identified during the review process,
                      helping users understand areas that may
                      require further attention.
                    </p>
                  </div>
                </div>

                {/* STEP 3 */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    3
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Organizes Verification Activity
                    </h3>

                    <p>
                      Verification requests, reports, statuses,
                      and related activity can be organized so
                      users can return to previous verification
                      records when needed.
                    </p>
                  </div>
                </div>

                {/* STEP 4 */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    4
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Provides Verification Reports
                    </h3>

                    <p>
                      Completed verification activity can
                      provide a report containing the available
                      results and findings associated with the
                      submitted property information.
                    </p>
                  </div>
                </div>

                {/* STEP 5 */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    5
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Helps Users Make Informed Decisions
                    </h3>

                    <p>
                      By bringing relevant verification
                      information together, PropertySure AI
                      helps users identify information they
                      should review before proceeding with a
                      property transaction.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  DUE DILIGENCE
              ================================================= */}

              <div
                id="due-diligence"
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <Building2
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Built for property due diligence.
                  </strong>{" "}
                  PropertySure AI is designed to help users
                  review available property documentation and
                  verification findings before making a
                  property decision.
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

                  PropertySure AI is a verification and
                  due-diligence platform, not a substitute for
                  qualified legal or professional advice.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Verification findings are based on the
                  information and documents available during
                  the verification process.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Users should review verification reports and
                  findings carefully before making property
                  decisions.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Additional searches, documentation, or
                  professional advice may be appropriate for
                  higher-value or complex property transactions.
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
                  PropertySure AI does not guarantee that a
                  property is completely safe, legally perfect,
                  or fraud-free. Verification results should be
                  considered as part of a broader due-diligence
                  process, and qualified legal or professional
                  advice should be obtained when necessary.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              BOTTOM ARTICLE NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>
            {/* BACK TO GETTING STARTED */}

            <button
              type="button"
              className={styles.previousBottom}
              onClick={goToGettingStarted}
            >
              <ArrowLeft
                className={styles.bottomPreviousArrow}
                size={19}
              />

              <span>
                <small>Back</small>

                <strong>
                  Getting Started
                </strong>
              </span>
            </button>

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
                  scrollToSection(
                    "what-is-propertysure-ai"
                  )
                }
              >
                <span className={styles.activeDot} />

                What is PropertySure AI?
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("what-it-does")
                }
              >
                <span className={styles.articleDot} />

                What PropertySure AI Does
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("due-diligence")
                }
              >
                <span className={styles.articleDot} />

                Built for Property Due Diligence
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
              <div className={styles.feedbackMessage}>
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
            {/* BACK */}

            <button
              type="button"
              className={styles.previousArticle}
              onClick={goToGettingStarted}
            >
              <ArrowLeft
                className={styles.sidebarPreviousArrow}
                size={16}
              />

              <span>
                <small>Back</small>

                <strong>
                  Getting Started
                </strong>
              </span>
            </button>

            {/* DIVIDER */}

            {nextArticle && (
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