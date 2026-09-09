"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./what-happens-when-fraud-is-detected.module.css";

type Article = {
  title: string;
  slug: string;
};

/*
============================================================
FRAUD WATCH ARTICLES
============================================================
*/

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

/*
============================================================
PATH
============================================================
*/

const basePath =
  "/settings/support-help/help-center/fraud-watch";

/*
============================================================
PAGE
============================================================
*/

export default function WhatHappensWhenFraudIsDetectedArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /*
  ============================================================
  CURRENT ARTICLE
  ============================================================
  */

  const currentArticle: Article = {
    title: "What Happens When Fraud is Detected",
    slug: "what-happens-when-fraud-is-detected",
  };

  /*
  ============================================================
  PREVIOUS AND NEXT ARTICLES
  ============================================================
  */

  const previousArticle: Article = {
    title: "What Fraud Watch Can't Detect",
    slug: "what-fraud-watch-cant-detect",
  };

  const nextArticle: Article = {
    title: "Understanding Fraud Watch Results",
    slug: "understanding-fraud-watch-results",
  };

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const goToHelpCenter = () => {
    router.push(
      "/settings/support-help/help-center"
    );
  };

  const goToArticle = (article: Article) => {
    router.push(
      `${basePath}/${article.slug}`
    );
  };

  const goToPreviousArticle = () => {
    goToArticle(previousArticle);
  };

  const goToNextArticle = () => {
    goToArticle(nextArticle);
  };

  /*
  ============================================================
  SECTION NAVIGATION
  ============================================================
  */

  const scrollToSection = (
    sectionId: string
  ) => {
    const section =
      document.getElementById(sectionId);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /*
  ============================================================
  SEARCH
  ============================================================
  */

  const filteredArticles = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return fraudWatchArticles;
    }

    return fraudWatchArticles.filter(
      (article) =>
        article.title
          .toLowerCase()
          .includes(query)
    );
  }, [search]);

  /*
  ============================================================
  FEEDBACK
  ============================================================
  */

  const handleFeedback = (
    value: "yes" | "no"
  ) => {
    setFeedback(value);
  };

  /*
  ============================================================
  RENDER
  ============================================================
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
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search for articles, guides, and topics"
            aria-label="Search Fraud Watch help articles"
          />

        </div>

        {search.trim() && (

          <div className={styles.searchResults}>

            {filteredArticles.length > 0 ? (

              filteredArticles.map(
                (article) => (

                  <button
                    key={article.slug}
                    type="button"
                    onClick={() =>
                      goToArticle(article)
                    }
                  >
                    {article.title}
                  </button>

                )
              )

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

            <h1>
              {currentArticle.title}
            </h1>

            <p>
              Learn what happens when Fraud Watch
              identifies a potential warning sign
              or suspicious property-related
              activity.
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
              MAIN CONTENT CARD
          ================================================= */}

          <section
            id="fraud-detection"
            className={styles.contentCard}
          >

            <div className={styles.contentText}>

              {/* =================================================
                  INTRODUCTION
              ================================================= */}

              <div
                id="what-happens"
                className={styles.noteBox}
              >

                <div className={styles.noteIcon}>

                  <Info
                    size={22}
                    strokeWidth={1.8}
                  />

                </div>

                <p>

                  <strong>
                    A warning does not automatically
                    mean fraud.
                  </strong>{" "}

                  When Fraud Watch identifies a
                  potential risk, the information is
                  flagged for further review. This
                  gives you an opportunity to examine
                  the available information before
                  making an important property
                  decision.

                </p>

              </div>


              {/* =================================================
                  DETECTION PROCESS
              ================================================= */}

              <h2 id="detection-process">
                What Happens When a Risk is Detected
              </h2>


              <div className={styles.processList}>

                {/* STEP 1 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    1
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      A Warning is Identified
                    </h3>

                    <p>
                      Fraud Watch identifies
                      information, activity, or a
                      pattern that may require
                      additional attention.
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
                      The Risk is Flagged
                    </h3>

                    <p>
                      The potential issue is presented
                      as a warning so you can review
                      the information carefully before
                      proceeding with the transaction.
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
                      You Review the Information
                    </h3>

                    <p>
                      Review the warning and compare
                      it with the relevant property
                      documents, information provided,
                      and available official records.
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
                      You Investigate the Concern
                    </h3>

                    <p>
                      Where necessary, request
                      supporting information or
                      clarification and carry out
                      additional checks before making
                      a property decision.
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
                      You Decide What to Do
                    </h3>

                    <p>
                      After reviewing the available
                      information, you decide whether
                      to continue, request further
                      verification, seek professional
                      advice, or pause the transaction.
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  WARNING
              ================================================= */}

              <div
                id="warning-not-proof"
                className={styles.warningBox}
              >

                <div className={styles.warningIcon}>

                  <AlertTriangle
                    size={23}
                    strokeWidth={1.8}
                  />

                </div>

                <p>

                  <strong>
                    A warning is not proof of fraud.
                  </strong>{" "}

                  A Fraud Watch detection indicates
                  that something may require further
                  attention. It does not by itself
                  establish that fraud has occurred or
                  that a person or property is
                  fraudulent.

                </p>

              </div>


              {/* =================================================
                  WHAT YOU SHOULD DO
              ================================================= */}

              <h2 id="what-you-should-do">
                What You Should Do After a Warning
              </h2>

              <ul className={styles.checkList}>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Review the flagged information
                  carefully.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Compare the information with the
                  relevant property documents.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Confirm important details through
                  appropriate official sources.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Request clarification or supporting
                  documents where appropriate.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Seek professional legal or property
                  advice when necessary.
                </li>

              </ul>


              {/* =================================================
                  DUE DILIGENCE
              ================================================= */}

              <div
                id="due-diligence"
                className={styles.noteBox}
              >

                <div className={styles.noteIcon}>

                  <Info
                    size={22}
                    strokeWidth={1.8}
                  />

                </div>

                <p>

                  <strong>
                    Complete appropriate due diligence:
                  </strong>{" "}

                  Fraud Watch is an additional layer
                  of awareness and protection. It does
                  not replace official property searches,
                  legal review, surveying, physical
                  inspection, or other professional
                  due-diligence procedures.

                </p>

              </div>


              {/* =================================================
                  IMPORTANT NOTE
              ================================================= */}

              <div
                id="important-note"
                className={styles.successBox}
              >

                <div className={styles.successIcon}>

                  <CheckCircle2
                    size={22}
                    strokeWidth={1.8}
                  />

                </div>

                <p>

                  <strong>
                    Important Note:
                  </strong>{" "}

                  A Fraud Watch warning should be
                  treated as a reason to investigate,
                  not as a final determination of
                  fraud. Always consider the available
                  evidence and complete appropriate
                  due diligence before proceeding with
                  a property transaction.

                </p>

              </div>

            </div>

          </section>


          {/* =================================================
              BOTTOM ARTICLE NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>

            {/* PREVIOUS */}

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

                <small>
                  Previous Article
                </small>

                <strong>
                  {previousArticle.title}
                </strong>

              </span>

            </button>


            {/* NEXT */}

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

            <h3>
              In this article
            </h3>

            <nav className={styles.articleNav}>

              <button
                type="button"
                className={styles.activeArticle}
                onClick={() =>
                  scrollToSection(
                    "what-happens"
                  )
                }
              >

                <span className={styles.activeDot} />

                What Happens When a Risk is Detected

              </button>


              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "detection-process"
                  )
                }
              >

                <span className={styles.articleDot} />

                Detection Process

              </button>


              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "warning-not-proof"
                  )
                }
              >

                <span className={styles.articleDot} />

                Warning is Not Proof

              </button>


              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "what-you-should-do"
                  )
                }
              >

                <span className={styles.articleDot} />

                What You Should Do

              </button>


              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "due-diligence"
                  )
                }
              >

                <span className={styles.articleDot} />

                Due Diligence

              </button>


              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "important-note"
                  )
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

            <h3>
              Was this helpful?
            </h3>

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

            {/* PREVIOUS */}

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

                <small>
                  Previous Article
                </small>

                <strong>
                  {previousArticle.title}
                </strong>

              </span>

            </button>


            <div className={styles.sideDivider} />


            {/* NEXT */}

            <button
              type="button"
              className={styles.nextArticle}
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

              <ArrowRight
                className={styles.sidebarNextArrow}
                size={17}
              />

            </button>

          </section>

        </aside>

      </div>

    </main>
  );
}