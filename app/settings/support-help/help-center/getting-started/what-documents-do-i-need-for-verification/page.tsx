"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "../../account-security/how-do-i-update-my-account-information/how-do-i-update-my-account-information.module.css";

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
  {
    title: "How do I sign in to my account?",
    slug: "how-do-i-sign-in-to-my-account",
  },
  {
    title: "How do I navigate my dashboard?",
    slug: "how-do-i-navigate-my-dashboard",
  },
  {
    title: "How do I start a property verification?",
    slug: "how-do-i-start-a-property-verification",
  },
  {
    title: "What documents do I need for verification?",
    slug: "what-documents-do-i-need-for-verification",
  },
  {
    title: "How do I upload property documents?",
    slug: "how-do-i-upload-property-documents",
  },
  {
    title: "How do I provide property location details?",
    slug: "how-do-i-provide-property-location-details",
  },
  {
    title: "What happens after I submit a verification?",
    slug: "what-happens-after-i-submit-a-verification",
  },
  {
    title: "Need More Help?",
    slug: "need-more-help",
  },
];

const basePath =
  "/settings/support-help/help-center/getting-started";

const gettingStartedPath =
  "/settings/support-help/help-center/getting-started";

export default function DocumentsNeededForVerificationArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /* =========================================================
     CURRENT ARTICLE
  ========================================================= */

  const currentIndex = 5;

  const currentArticle =
    gettingStartedArticles[currentIndex];

  const previousArticle =
    gettingStartedArticles[currentIndex - 1];

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
              Learn which property documents you may need
              to provide when submitting a verification
              request through PropertySure AI.
            </p>

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
            id="documents"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                PropertySure AI verifies the available
                information and documents submitted for a
                property verification. The documents you
                provide help establish the property's
                ownership, title, location, and other
                relevant information.
              </p>

              <p>
                The exact documents required can vary
                depending on the property, transaction,
                location, and type of verification being
                requested. You should provide clear and
                authentic copies of the relevant documents
                available to you.
              </p>

              <h2>
                Common Documents Used for Verification
              </h2>

              <div
                id="document-types"
                className={styles.processList}
              >
                {/* =================================================
                    DOCUMENT 1
                ================================================= */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    1
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Certificate of Occupancy (C of O)
                    </h3>

                    <p>
                      Where applicable, provide the
                      Certificate of Occupancy or other
                      relevant title document showing the
                      recognized interest or title associated
                      with the property.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    DOCUMENT 2
                ================================================= */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    2
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Deed of Assignment
                    </h3>

                    <p>
                      A Deed of Assignment may provide
                      information about the transfer of
                      ownership or interest in the property
                      between the parties involved.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    DOCUMENT 3
                ================================================= */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    3
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Survey Plan
                    </h3>

                    <p>
                      A Survey Plan can provide information
                      about the property's location,
                      boundaries, measurements, and survey
                      reference details.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    DOCUMENT 4
                ================================================= */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    4
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Allocation Letter or Allocation
                      Document
                    </h3>

                    <p>
                      Where applicable, an allocation letter
                      or related allocation document may
                      provide information about how the
                      property or land was allocated to the
                      relevant party.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    DOCUMENT 5
                ================================================= */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    5
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Other Relevant Property Documents
                    </h3>

                    <p>
                      Depending on the property and
                      verification request, additional
                      documents may be relevant, including
                      approved building documents, purchase
                      agreements, court documents, or other
                      supporting title and ownership records.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  DOCUMENT PACKAGE
              ================================================= */}

              <div
                id="document-package"
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <FileText
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Submit the relevant document package.
                  </strong>{" "}
                  PropertySure AI treats a property
                  verification as a review of the relevant
                  document package submitted for that
                  property. Providing the available
                  supporting documents can help produce a
                  more complete verification assessment.
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

                  Provide clear and readable copies of your
                  property documents.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Make sure the documents relate to the
                  property being submitted for verification.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Provide the relevant supporting documents
                  available to you rather than relying on a
                  single document where additional records
                  exist.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Do not edit, alter, or manipulate property
                  documents before submitting them.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Additional documents may be requested
                  depending on the verification requirements.
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
                  The presence of a document does not
                  automatically prove that a property is
                  genuine, legally clear, or free from
                  disputes. PropertySure AI verification
                  results should be reviewed together with
                  the available findings, and qualified legal
                  or professional advice should be obtained
                  where necessary.
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
                  scrollToSection("documents")
                }
              >
                <span className={styles.activeDot} />

                Documents for Verification
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("document-types")
                }
              >
                <span className={styles.articleDot} />

                Common Document Types
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("document-package")
                }
              >
                <span className={styles.articleDot} />

                Document Package
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
            {/* =================================================
                PREVIOUS
            ================================================= */}

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

            {/* =================================================
                DIVIDER
            ================================================= */}

            {previousArticle && nextArticle && (
              <div className={styles.sideDivider} />
            )}

            {/* =================================================
                NEXT
            ================================================= */}

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