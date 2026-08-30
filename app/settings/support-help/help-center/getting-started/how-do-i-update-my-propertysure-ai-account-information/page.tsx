"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  UserRound,
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
    title: "How do I sign into my PropertySure AI account?",
    slug: "how-do-i-sign-into-my-propertysure-ai-account",
  },
  {
    title: "How do I update my PropertySure AI account information?",
    slug: "how-do-i-update-my-propertysure-ai-account-information",
  },
  {
    title: "How do I reset my PropertySure AI password?",
    slug: "how-do-i-reset-my-propertysure-ai-password",
  },
  {
    title: "How do I manage my PropertySure AI account settings?",
    slug: "how-do-i-manage-my-propertysure-ai-account-settings",
  },
  {
    title: "How do I secure my PropertySure AI account?",
    slug: "how-do-i-secure-my-propertysure-ai-account",
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

export default function UpdatePropertySureAIAccountInformationArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /* =========================================================
     CURRENT ARTICLE
  ========================================================= */

  const currentIndex = 3;

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
              Learn how to update and maintain your
              PropertySure AI account information.
            </p>

            {/* IMPORTANT:
                THIS IS THE BACK BUTTON TO GETTING STARTED
            */}

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
            id="account-information"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                PropertySure AI allows you to keep your account
                information up to date so that your profile
                remains accurate and your account can be managed
                effectively.
              </p>

              <p>
                Depending on the information available in your
                account settings, you may be able to update
                details such as your name, email address, phone
                number, or other profile information.
              </p>

              <h2>
                How to Update Your Account Information
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
                      Sign in to Your PropertySure AI Account
                    </h3>

                    <p>
                      Sign in to your PropertySure AI account
                      using your registered account credentials.
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
                      Open Your Account Settings
                    </h3>

                    <p>
                      Navigate to your account settings or
                      profile area where your available account
                      information is displayed.
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
                      Select the Information You Want to Update
                    </h3>

                    <p>
                      Review the available account fields and
                      select the information you need to change,
                      such as your name, phone number, or other
                      editable profile details.
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
                      Enter Your Updated Information
                    </h3>

                    <p>
                      Enter the correct information in the
                      relevant field. Check the information
                      carefully before saving your changes.
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
                      Save Your Changes
                    </h3>

                    <p>
                      Select the available Save or Update
                      option to apply your changes. If
                      additional verification is required,
                      follow the instructions provided.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  UPDATED INFORMATION
              ================================================= */}

              <div
                id="updated-information"
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <UserRound
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>Keep your information accurate.</strong>{" "}
                  Keeping your account information current can
                  help you maintain accurate records and receive
                  important account-related communications.
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

                  Make sure the information you enter is
                  accurate before saving your changes.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Use an email address and phone number that
                  you can access when required.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Some account information may require
                  additional verification before it can be
                  changed.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Do not share your password or authentication
                  codes with another person.
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
                  If you cannot update certain account
                  information or the change requires additional
                  verification, follow the instructions shown
                  in your account or contact PropertySure AI
                  support for assistance.
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

                How to Update Your Account Information
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "updated-information"
                  )
                }
              >
                <span className={styles.articleDot} />

                Updated Information
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
                className={styles.feedbackMessage}
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