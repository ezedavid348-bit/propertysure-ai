"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./what-you-can-verify.module.css";

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
    title: "What You Can't Verify?",
    slug: "what-you-cant-verify",
  },
  {
    title: "How It Works (Overview)",
    slug: "how-it-works",
  },
  {
    title: "Verification Results",
    slug: "verification-results",
  },
  {
    title: "What Happens After Verification?",
    slug: "what-happens-after",
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

export default function WhatYouCanVerifyArticle() {
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

  const currentIndex = 2;

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
              PropertySure AI helps you review important
              property documents and identify information
              that may require further verification.
            </p>

            {/* =================================================
                BACK TO PROPERTY VERIFICATION
            ================================================= */}

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
            id="what-you-can-verify"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                PropertySure AI can help you review
                information contained in property
                documents and identify areas that may
                require additional attention before you
                make an important property decision.
              </p>

              <p>
                The verification process is designed to
                examine the documents and information
                submitted for a property rather than
                relying on a single document in isolation.
              </p>

              {/* =================================================
                  DOCUMENTS
              ================================================= */}

              <h2 id="documents">
                Property Documents
              </h2>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Certificate of Occupancy (C of O) and
                  other relevant title documents.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Deed of Assignment and related
                  ownership documents.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Survey Plans and property identification
                  information.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Allocation letters or other relevant
                  property documentation.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Other supporting documents submitted as
                  part of the property's verification
                  package.
                </li>
              </ul>

              {/* =================================================
                  INFORMATION CHECKS
              ================================================= */}

              <h2 id="information-checks">
                Information We Can Review
              </h2>

              <div className={styles.processList}>
                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    1
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Document Consistency
                    </h3>

                    <p>
                      Review information across submitted
                      documents to identify inconsistencies
                      in names, dates, property descriptions,
                      reference numbers, or other relevant
                      details.
                    </p>
                  </div>
                </div>

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    2
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Document Authenticity Indicators
                    </h3>

                    <p>
                      Examine available document features
                      and information for indicators that
                      may suggest alteration, fabrication,
                      inconsistency, or other concerns.
                    </p>
                  </div>
                </div>

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    3
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Property Identification
                    </h3>

                    <p>
                      Review available property
                      identifiers, descriptions, survey
                      information, and other details
                      supplied for the verification.
                    </p>
                  </div>
                </div>

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    4
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Ownership-Related Information
                    </h3>

                    <p>
                      Review ownership information contained
                      in the submitted documentation and
                      identify issues that may require
                      further professional or official
                      investigation.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  IMPORTANT LIMITATION
              ================================================= */}

              <div
                id="verification-limits"
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <FileCheck2
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Important:
                  </strong>{" "}
                  A PropertySure AI verification does not
                  automatically mean that every aspect of a
                  property has been legally or physically
                  confirmed. Some matters require official
                  searches, professional inspection, or
                  advice from qualified property
                  professionals.
                </p>
              </div>

              {/* =================================================
                  WHAT VERIFICATION CAN HELP IDENTIFY
              ================================================= */}

              <h2 id="issues">
                What Verification Can Help Identify
              </h2>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Potential inconsistencies between
                  submitted documents.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Possible signs that a document requires
                  additional scrutiny.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Missing or incomplete information in the
                  submitted verification package.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Conflicting property or ownership
                  information.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Issues that may justify additional
                  investigation before proceeding.
                </li>
              </ul>

              {/* =================================================
                  PROFESSIONAL REVIEW
              ================================================= */}

              <h2 id="professional-review">
                When Further Review May Be Needed
              </h2>

              <p>
                If the verification process identifies
                inconsistencies, missing information, or
                other potential concerns, the result may
                indicate that additional investigation is
                appropriate.
              </p>

              <p>
                Depending on the property and the issue
                identified, further review may involve a
                property lawyer, licensed surveyor, relevant
                government authority, or physical property
                inspection.
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
                  PropertySure AI is designed to provide an
                  additional layer of property due diligence.
                  A verification result should not be
                  interpreted as a substitute for legal
                  advice, official government searches,
                  professional surveying, valuation, or
                  physical inspection where those services
                  are appropriate.
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
                    "what-you-can-verify"
                  )
                }
              >
                <span
                  className={styles.activeDot}
                />

                What You Can Verify
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("documents")
                }
              >
                <span
                  className={styles.articleDot}
                />

                Property Documents
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "information-checks"
                  )
                }
              >
                <span
                  className={styles.articleDot}
                />

                Information We Can Review
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "verification-limits"
                  )
                }
              >
                <span
                  className={styles.articleDot}
                />

                Verification Limits
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("issues")
                }
              >
                <span
                  className={styles.articleDot}
                />

                What Verification Can Help
                Identify
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
                  className={styles.articleDot}
                />

                When Further Review May
                Be Needed
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
                className={
                  styles.previousArticle
                }
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