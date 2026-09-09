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

import styles from "./what-you-cant-verify.module.css";

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

export default function WhatYouCantVerifyArticle() {
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

  const currentIndex = 3;

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
              Property verification can identify important
              issues, but some matters require official
              records, professional review, or physical
              inspection.
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
            id="what-you-cant-verify"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                PropertySure AI is designed to provide an
                additional layer of due diligence when
                reviewing property documentation. However,
                document verification alone cannot confirm
                every legal, physical, financial, or
                government-related aspect of a property.
              </p>

              <p>
                Some information requires access to official
                records, direct confirmation from relevant
                authorities, professional assessment, or
                inspection of the property itself.
              </p>

              {/* =================================================
                  LEGAL OWNERSHIP
              ================================================= */}

              <h2 id="legal-ownership">
                Final Legal Ownership
              </h2>

              <p>
                PropertySure AI cannot independently make a
                final legal determination that a person is
                the lawful owner of a property simply because
                ownership information appears consistent in
                submitted documents.
              </p>

              <p>
                Legal ownership may require an official
                search, examination of government records,
                review of the property's chain of title, and
                professional legal assessment.
              </p>

              {/* =================================================
                  GOVERNMENT RECORDS
              ================================================= */}

              <h2 id="government-records">
                Official Government Records
              </h2>

              <p>
                A document submitted for verification does
                not automatically establish that the
                document matches the latest records held by
                a government authority.
              </p>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Official title records may require a
                  government or institutional search.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Registration status may require
                  confirmation from the relevant authority.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Outstanding interests or restrictions may
                  require an official search.
                </li>
              </ul>

              {/* =================================================
                  PHYSICAL PROPERTY
              ================================================= */}

              <h2 id="physical-property">
                Physical Condition of the Property
              </h2>

              <p>
                Document verification cannot determine the
                complete physical condition of land,
                buildings, structures, boundaries, or other
                physical features of a property.
              </p>

              <p>
                Where necessary, a physical inspection by
                an appropriate professional may be required
                to assess the actual condition of the
                property.
              </p>

              {/* =================================================
                  BOUNDARIES
              ================================================= */}

              <h2 id="boundaries">
                Physical Boundaries and Location
              </h2>

              <p>
                Property documents may contain survey or
                location information, but document review
                alone should not be treated as a complete
                physical confirmation of the property's
                boundaries or exact condition on the ground.
              </p>

              <p>
                Boundary confirmation may require a licensed
                surveyor or other appropriate professional.
              </p>

              {/* =================================================
                  MARKET VALUE
              ================================================= */}

              <h2 id="market-value">
                Property Value or Investment Returns
              </h2>

              <p>
                PropertySure AI verification does not
                guarantee that a property is fairly priced,
                profitable, or likely to increase in value.
              </p>

              <p>
                Property valuation and investment decisions
                involve additional factors such as location,
                market conditions, development, demand,
                comparable properties, and other economic
                considerations.
              </p>

              {/* =================================================
                  IMPORTANT WARNING
              ================================================= */}

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
                  A document that appears consistent or
                  passes available verification checks should
                  not automatically be interpreted as proof
                  that the property is completely free from
                  fraud, disputes, restrictions, or other
                  risks.
                </p>
              </div>

              {/* =================================================
                  PROFESSIONAL REVIEW
              ================================================= */}

              <h2 id="professional-review">
                Matters That May Require Professional Review
              </h2>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Legal title and ownership confirmation.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Government registry and official searches.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Physical property and structural
                  inspection.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Survey and boundary confirmation.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Property valuation and investment advice.
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
                  <strong>
                    Important:
                  </strong>{" "}
                  PropertySure AI verification is an
                  additional due-diligence tool. It does not
                  replace legal advice, official government
                  searches, surveying, valuation, engineering
                  inspection, or other professional services
                  that may be necessary for a property
                  transaction.
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
                  <small>
                    Previous Article
                  </small>

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
                    "what-you-cant-verify"
                  )
                }
              >
                <span className={styles.activeDot} />

                What You Can't Verify
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("legal-ownership")
                }
              >
                <span className={styles.articleDot} />

                Final Legal Ownership
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("government-records")
                }
              >
                <span className={styles.articleDot} />

                Official Government Records
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("physical-property")
                }
              >
                <span className={styles.articleDot} />

                Physical Condition
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("boundaries")
                }
              >
                <span className={styles.articleDot} />

                Physical Boundaries and Location
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("market-value")
                }
              >
                <span className={styles.articleDot} />

                Property Value
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("warning")
                }
              >
                <span className={styles.articleDot} />

                Important Warning
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("professional-review")
                }
              >
                <span className={styles.articleDot} />

                Professional Review
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