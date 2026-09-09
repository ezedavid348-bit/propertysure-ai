"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertTriangle,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./what-happens-after.module.css";

type Article = {
  title: string;
  slug: string;
};

/*
============================================================
PROPERTY VERIFICATION ARTICLES
============================================================
*/

const propertyVerificationArticles: Article[] = [
  {
    title: "What Is Property Verification?",
    slug: "what-is-property-verification",
  },
  {
    title: "Why Verify a Property?",
    slug: "why-verify",
  },
  {
    title: "What You Can Verify",
    slug: "what-you-can-verify",
  },
  {
    title: "What You Can't Verify",
    slug: "what-you-cant-verify",
  },
  {
    title: "What Happens After You Verify?",
    slug: "what-happens-after",
  },
  {
    title: "Verification Results",
    slug: "verification-results",
  },
  {
    title: "How It Works (Overview)",
    slug: "how-it-works",
  },
  {
    title: "Need More Help?",
    slug: "need-more-help",
  },
];

/*
============================================================
PATHS
============================================================
*/

const basePath =
  "/settings/support-help/help-center/property-verification";

const propertyVerificationPath =
  "/settings/support-help/help-center/property-verification";

/*
============================================================
PAGE
============================================================
*/

export default function WhatHappensAfterArticle() {
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

  const currentIndex = 4;

  const currentArticle =
    propertyVerificationArticles[currentIndex];

  const previousArticle =
    propertyVerificationArticles[currentIndex - 1];

  const nextArticle =
    propertyVerificationArticles[currentIndex + 1];

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const goToPropertyVerification = () => {
    router.push(propertyVerificationPath);
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
  ============================================================
  SECTION NAVIGATION
  ============================================================
  */

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);

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
    const query = search.trim().toLowerCase();

    if (!query) {
      return propertyVerificationArticles;
    }

    return propertyVerificationArticles.filter((article) =>
      article.title.toLowerCase().includes(query)
    );
  }, [search]);

  /*
  ============================================================
  FEEDBACK
  ============================================================
  */

  const handleFeedback = (value: "yes" | "no") => {
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
            aria-label="Search Property Verification help articles"
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
              Learn what happens after a property verification
              is completed and how to understand and use the
              information provided.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={goToPropertyVerification}
            >
              <ArrowLeft size={17} />

              Back to Property Verification
            </button>
          </header>

          <div className={styles.divider} />

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <section
            id="verification-complete"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                Once PropertySure AI completes the available
                verification checks, you can review the
                information generated from the documents and
                checks submitted for the property.
              </p>

              <p>
                The verification outcome is intended to help
                you identify information that may require
                further attention before making a property
                decision.
              </p>

              {/* =================================================
                  REVIEW RESULTS
              ================================================= */}

              <h2 id="review-results">
                Review Your Verification Results
              </h2>

              <p>
                Start by reviewing the verification results
                presented for your property. The results may
                highlight information that appears consistent,
                information that requires attention, or areas
                where additional verification may be needed.
              </p>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Review the overall verification status.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Review the documents included in the
                  verification.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Review any issues, inconsistencies, or
                  warnings identified.
                </li>
              </ul>

              {/* =================================================
                  DOCUMENT RESULTS
              ================================================= */}

              <h2 id="document-results">
                Review Individual Document Results
              </h2>

              <p>
                A property verification may involve multiple
                documents. Where individual document results
                are available, review each document separately
                rather than relying only on the overall
                verification status.
              </p>

              <p>
                This can help you understand which documents
                were reviewed and whether any particular
                document requires additional attention.
              </p>

              {/* =================================================
                  IDENTIFIED ISSUES
              ================================================= */}

              <h2 id="identified-issues">
                Pay Attention to Identified Issues
              </h2>

              <p>
                If the verification identifies an
                inconsistency, missing information, unusual
                detail, or other warning, do not ignore it.
                Consider obtaining additional information or
                professional assistance before proceeding with
                the transaction.
              </p>

              <div
                id="warning"
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <AlertTriangle
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Important:
                  </strong>{" "}
                  A verification result is not a guarantee
                  that a property is completely free from
                  fraud, disputes, restrictions, or other
                  risks. A result should be considered as
                  part of your wider due-diligence process.
                </p>
              </div>

              {/* =================================================
                  NEXT STEPS
              ================================================= */}

              <h2 id="next-steps">
                Decide on Your Next Steps
              </h2>

              <p>
                After reviewing the results, you can decide
                whether further investigation is appropriate
                before continuing with the property
                transaction.
              </p>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Request additional information from the
                  seller or relevant party.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Seek an official government or registry
                  search where necessary.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Consult a property lawyer or other
                  appropriate professional.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Arrange a physical inspection or survey
                  where appropriate.
                </li>
              </ul>

              {/* =================================================
                  SAVE / RECORD
              ================================================= */}

              <h2 id="keep-record">
                Keep Your Verification Record
              </h2>

              <p>
                Keep your verification results and related
                property documents available for your records.
                They may be useful when discussing the
                property with a lawyer, surveyor, seller,
                agent, lender, or other professional.
              </p>

              {/* =================================================
                  PROFESSIONAL REVIEW
              ================================================= */}

              <h2 id="professional-review">
                Seek Professional Advice When Necessary
              </h2>

              <p>
                If the verification results identify concerns,
                or if the transaction involves significant
                financial or legal commitments, consider
                obtaining appropriate professional advice
                before proceeding.
              </p>

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
                  <strong>
                    Important:
                  </strong>{" "}
                  PropertySure AI verification is designed to
                  support your property due-diligence
                  process. It does not replace official
                  searches, legal advice, surveying,
                  valuation, physical inspection, or other
                  professional services that may be necessary.
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
                  <small>
                    Previous Article
                  </small>

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
            <h3>
              In this article
            </h3>

            <nav className={styles.articleNav}>
              <button
                type="button"
                className={styles.activeArticle}
                onClick={() =>
                  scrollToSection(
                    "verification-complete"
                  )
                }
              >
                <span className={styles.activeDot} />

                What Happens After Verification
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("review-results")
                }
              >
                <span className={styles.articleDot} />

                Review Your Results
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("document-results")
                }
              >
                <span className={styles.articleDot} />

                Individual Document Results
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("identified-issues")
                }
              >
                <span className={styles.articleDot} />

                Identified Issues
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("next-steps")
                }
              >
                <span className={styles.articleDot} />

                Next Steps
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("keep-record")
                }
              >
                <span className={styles.articleDot} />

                Keep Your Verification Record
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("professional-review")
                }
              >
                <span className={styles.articleDot} />

                Professional Advice
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
                  <small>
                    Previous Article
                  </small>

                  <strong>
                    {previousArticle.title}
                  </strong>
                </span>
              </button>
            )}

            {/* DIVIDER */}

            {previousArticle &&
              nextArticle && (
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
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}