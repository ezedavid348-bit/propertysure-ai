"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Search,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./how-do-i-start-a-property-verification.module.css";

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

export default function StartPropertyVerificationArticle() {
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
              Learn how to start a property verification with
              PropertySure AI and submit the information needed
              to begin the verification process.
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
            id="start-verification"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                PropertySure AI allows you to begin a property
                verification by submitting the information and
                documents required for the property you want
                to verify.
              </p>

              <p>
                A verification helps you review available
                property information and identify findings
                that may require further attention before you
                make a property-related decision.
              </p>

              <h2>
                How to Start a Property Verification
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
                      Open Your Dashboard
                    </h3>

                    <p>
                      Sign in to your PropertySure AI account
                      and open your dashboard to access the
                      property verification tools available to
                      you.
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
                      Select Property Verification
                    </h3>

                    <p>
                      Select the option for starting or
                      creating a property verification request
                      from the available dashboard features.
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
                      Provide the Property Information
                    </h3>

                    <p>
                      Enter the available information about
                      the property you want to verify. Provide
                      accurate details so the verification can
                      be associated with the correct property.
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
                      Prepare Your Property Documents
                    </h3>

                    <p>
                      Gather the relevant property documents
                      required for the verification. These may
                      include title, ownership, survey, or
                      allocation documents depending on the
                      property and verification requirements.
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
                      Upload the Required Documents
                    </h3>

                    <p>
                      Upload the available property documents
                      through the verification process. Make
                      sure the documents are clear and belong
                      to the property being submitted.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    STEP 6
                ================================================= */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    6
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Review Your Submission
                    </h3>

                    <p>
                      Review the property information and
                      documents you have provided before
                      submitting the verification request.
                      Correct any errors or missing information
                      where necessary.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    STEP 7
                ================================================= */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    7
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Submit the Verification
                    </h3>

                    <p>
                      Submit the completed verification request
                      to begin the PropertySure AI verification
                      process.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  VERIFICATION STARTED
              ================================================= */}

              <div
                id="verification-started"
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <Search
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Verification submitted.
                  </strong>{" "}
                  Once your verification request has been
                  submitted, PropertySure AI can begin
                  processing the information and documents
                  provided for the property.
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

                  Make sure the property information you
                  provide is accurate.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Submit documents that relate to the property
                  being verified.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Make sure uploaded documents are clear and
                  readable.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Review your submission carefully before
                  starting the verification.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Keep copies of important property documents
                  for your own records.
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
                  Starting a verification does not by itself
                  guarantee that a property is safe, legally
                  valid, or free from fraud. Review the
                  completed verification findings carefully
                  and seek qualified legal or professional
                  advice when necessary.
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
                  scrollToSection(
                    "start-verification"
                  )
                }
              >
                <span className={styles.activeDot} />

                How to Start a Verification
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("steps")
                }
              >
                <span className={styles.articleDot} />

                Verification Steps
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "verification-started"
                  )
                }
              >
                <span className={styles.articleDot} />

                Verification Submitted
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

            {/* DIVIDER */}

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