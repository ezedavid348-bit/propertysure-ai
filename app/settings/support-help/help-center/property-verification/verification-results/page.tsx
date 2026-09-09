"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Check,
  CheckCircle2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./verification-results.module.css";

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

export default function VerificationResultsArticle() {
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

  const currentIndex = 5;

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
    const query = search.trim().toLowerCase();

    if (!query) {
      return propertyVerificationArticles;
    }

    return propertyVerificationArticles.filter(
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
            <h1>
              {currentArticle.title}
            </h1>

            <p>
              Understand your PropertySure AI
              verification result and what the
              outcome means for your property
              due-diligence process.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={
                goToPropertyVerification
              }
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
            id="verification-results"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p
                className={
                  styles.mainParagraph
                }
              >
                After PropertySure AI completes
                the available verification checks,
                you will receive a verification
                result based on the documents and
                information submitted for the
                property.
              </p>

              <p>
                The result is designed to help you
                understand whether the submitted
                information appears consistent with
                the checks performed and whether any
                areas may require further
                investigation.
              </p>

              {/* =================================================
                  UNDERSTANDING RESULT
              ================================================= */}

              <h2 id="understanding-result">
                Understanding Your Verification
                Result
              </h2>

              <p>
                A verification result should be
                read as an assessment of the
                information and checks available to
                PropertySure AI at the time of
                verification.
              </p>

              <p>
                It should not be interpreted as an
                absolute guarantee that a property is
                free from every possible legal,
                ownership, physical, or financial
                risk.
              </p>

              {/* =================================================
                  WHAT THE RESULT MAY SHOW
              ================================================= */}

              <h2 id="result-information">
                What the Result May Show
              </h2>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  The overall status of the
                  verification.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Documents that were included in
                  the verification.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Information that appears
                  consistent across the submitted
                  documents.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Potential inconsistencies,
                  warnings, or areas requiring
                  further review.
                </li>
              </ul>

              {/* =================================================
                  DOCUMENT RESULTS
              ================================================= */}

              <h2 id="document-status">
                Document-Level Results
              </h2>

              <p>
                PropertySure AI may evaluate the
                documents submitted as part of a
                property verification package.
                Where individual document results
                are provided, each document should
                be reviewed carefully.
              </p>

              <p>
                A property package may contain
                several documents, such as a
                Certificate of Occupancy, Deed of
                Assignment, Survey Plan, Allocation
                Letter, or other relevant property
                documents.
              </p>

              {/* =================================================
                  POSITIVE RESULT
              ================================================= */}

              <h2 id="positive-result">
                If the Result Shows No Immediate
                Issues
              </h2>

              <p>
                A result indicating that no
                immediate issues were identified
                means that the available checks did
                not identify a specific problem
                within the information reviewed.
              </p>

              <p>
                You should still complete any
                additional due-diligence that may
                be appropriate for the property and
                transaction.
              </p>

              {/* =================================================
                  WARNING RESULT
              ================================================= */}

              <h2 id="warning-result">
                If the Result Identifies a Warning
              </h2>

              <p>
                If the verification identifies an
                inconsistency, warning, missing
                information, or other concern,
                review the issue carefully before
                proceeding.
              </p>

              <div
                id="warning"
                className={styles.successBox}
              >
                <div
                  className={styles.successIcon}
                >
                  <AlertTriangle
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Important:
                  </strong>{" "}
                  A warning does not necessarily
                  mean that a property is
                  fraudulent. It means that the
                  identified information may require
                  further investigation or
                  professional review.
                </p>
              </div>

              {/* =================================================
                  WHAT TO DO NEXT
              ================================================= */}

              <h2 id="next-steps">
                What to Do After Reviewing the
                Result
              </h2>

              <p>
                If the result raises concerns,
                avoid making irreversible financial
                or legal commitments until you
                understand the issue and have
                completed the appropriate additional
                checks.
              </p>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Ask the seller or relevant party
                  for clarification or additional
                  documents.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Confirm relevant information
                  through official records where
                  necessary.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Seek legal advice where ownership
                  or title concerns exist.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Arrange surveying, valuation, or
                  physical inspection when
                  appropriate.
                </li>
              </ul>

              {/* =================================================
                  KEEP RECORD
              ================================================= */}

              <h2 id="verification-record">
                Keep Your Verification Record
              </h2>

              <p>
                Keep your verification result
                together with the property documents
                and other due-diligence records
                related to the transaction.
              </p>

              <p>
                Having a clear record can make it
                easier to review the property later
                or share relevant information with
                your lawyer, surveyor, property
                professional, or other authorised
                party.
              </p>

              {/* =================================================
                  PROFESSIONAL REVIEW
              ================================================= */}

              <h2 id="professional-review">
                When Professional Review May Be
                Necessary
              </h2>

              <p>
                Some property matters cannot be
                resolved by document verification
                alone. If the result identifies a
                significant concern, appropriate
                professional assistance may be
                necessary.
              </p>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Property lawyer for legal title
                  or ownership concerns.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Licensed surveyor for boundary or
                  survey concerns.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Valuer for property valuation
                  matters.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Engineer or other qualified
                  professional for physical or
                  structural concerns.
                </li>
              </ul>

              {/* =================================================
                  IMPORTANT NOTE
              ================================================= */}

              <div
                id="important-note"
                className={styles.noteBox}
              >
                <div
                  className={styles.noteIcon}
                >
                  <CheckCircle2
                    size={22}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Important:
                  </strong>{" "}
                  PropertySure AI verification
                  results are intended to support
                  your due-diligence process. They do
                  not replace official government
                  searches, legal advice, surveying,
                  valuation, physical inspection, or
                  other professional services that may
                  be required before completing a
                  property transaction.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              BOTTOM ARTICLE NAVIGATION
          ================================================= */}

          <div
            className={
              styles.bottomNavigation
            }
          >
            {/* PREVIOUS */}

            {previousArticle && (
              <button
                type="button"
                className={
                  styles.previousBottom
                }
                onClick={
                  goToPreviousArticle
                }
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
                    {
                      previousArticle.title
                    }
                  </strong>
                </span>
              </button>
            )}

            {/* NEXT */}

            {nextArticle && (
              <button
                type="button"
                className={
                  styles.nextBottom
                }
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

        <aside
          className={
            styles.rightSidebar
          }
        >
          {/* =================================================
              IN THIS ARTICLE
          ================================================= */}

          <section
            className={
              styles.sideCard
            }
          >
            <h3>
              In this article
            </h3>

            <nav
              className={
                styles.articleNav
              }
            >
              <button
                type="button"
                className={
                  styles.activeArticle
                }
                onClick={() =>
                  scrollToSection(
                    "verification-results"
                  )
                }
              >
                <span
                  className={
                    styles.activeDot
                  }
                />

                Verification Results
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "understanding-result"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Understanding Your Result
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "result-information"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                What the Result May Show
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "document-status"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Document-Level Results
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "positive-result"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                No Immediate Issues
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "warning-result"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Verification Warning
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("warning")
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Important Warning
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "next-steps"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                What to Do Next
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "verification-record"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Verification Record
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "professional-review"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Professional Review
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
                  className={
                    styles.articleDot
                  }
                />

                Important Note
              </button>
            </nav>
          </section>

          {/* =================================================
              WAS THIS HELPFUL?
          ================================================= */}

          <section
            className={
              styles.sideCard
            }
          >
            <h3>
              Was this helpful?
            </h3>

            {feedback === null ? (
              <div
                className={
                  styles.feedback
                }
              >
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
                <CheckCircle2
                  size={18}
                />

                <span>
                  Thanks for your feedback.
                </span>
              </div>
            )}
          </section>

          {/* =================================================
              ARTICLE NAVIGATION
          ================================================= */}

          <section
            className={
              styles.sideCard
            }
          >
            {/* PREVIOUS */}

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
                    {
                      previousArticle.title
                    }
                  </strong>
                </span>
              </button>
            )}

            {/* DIVIDER */}

            {previousArticle &&
              nextArticle && (
                <div
                  className={
                    styles.sideDivider
                  }
                />
              )}

            {/* NEXT */}

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