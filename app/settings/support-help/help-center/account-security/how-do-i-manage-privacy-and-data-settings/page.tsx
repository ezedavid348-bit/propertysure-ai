"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./how-do-i-manage-privacy-and-data-settings.module.css";

type Article = {
  title: string;
  slug: string;
};

const accountSecurityArticles: Article[] = [
  {
    title: "How do I update my account information?",
    slug: "how-do-i-update-my-account-information",
  },
  {
    title: "How do I change my password?",
    slug: "how-do-i-change-my-password",
  },
  {
    title: "How do I enable two-factor authentication?",
    slug: "how-do-i-enable-two-factor-authentication",
  },
  {
    title: "How do I manage my active sessions?",
    slug: "how-do-i-manage-my-active-sessions",
  },
  {
    title: "How do I update my notification preferences?",
    slug: "how-do-i-update-my-notification-preferences",
  },
  {
    title: "How do I manage privacy and data settings?",
    slug: "how-do-i-manage-privacy-and-data-settings",
  },
  {
    title: "How do I export my data?",
    slug: "how-do-i-export-my-data",
  },
  {
    title: "Need More Help?",
    slug: "need-more-help",
  },
];

const basePath =
  "/settings/support-help/help-center/account-security";

const accountSecurityPath =
  "/settings/support-help/help-center/account-security";

export default function ManagePrivacyAndDataSettingsArticle() {
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
    accountSecurityArticles[currentIndex];

  const previousArticle =
    accountSecurityArticles[currentIndex - 1];

  const nextArticle =
    accountSecurityArticles[currentIndex + 1];

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goToAccountSecurity = () => {
    router.push(accountSecurityPath);
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
      return accountSecurityArticles;
    }

    return accountSecurityArticles.filter((article) =>
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
            onChange={(e) =>
              setSearch(e.target.value)
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
              Learn how to manage your privacy preferences,
              understand how your information is handled, and
              control available data settings on your
              PropertySure AI account.
            </p>

            {/* =================================================
                BACK TO ACCOUNT & SECURITY
            ================================================= */}

            <button
              type="button"
              className={styles.backButton}
              onClick={goToAccountSecurity}
            >
              <ArrowLeft size={17} />
              Back to Account & Security
            </button>
          </header>

          <div className={styles.divider} />

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <section
            id="privacy-data"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                Your privacy and data settings help you
                understand and manage how information
                associated with your PropertySure AI account
                is handled.
              </p>

              <p>
                Keeping these settings up to date helps you
                maintain control over your account information
                and understand the choices available to you.
              </p>

              <h2>
                Managing Your Privacy and Data Settings
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
                      Open Account Settings
                    </h3>

                    <p>
                      Open your account menu and select
                      Account Settings to access the
                      settings associated with your
                      PropertySure AI account.
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
                      Open Privacy and Data Settings
                    </h3>

                    <p>
                      Locate the Privacy and Data section
                      to review the available privacy
                      preferences and information associated
                      with your account.
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
                      Review Your Available Settings
                    </h3>

                    <p>
                      Review the available options for
                      managing your privacy preferences,
                      account information, and data-related
                      settings.
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
                      Save Any Changes
                    </h3>

                    <p>
                      If you change an available setting,
                      review your selection and save the
                      changes before leaving the page.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  SETTINGS UPDATED
              ================================================= */}

              <div
                id="settings-updated"
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <CheckCircle2
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>Settings updated.</strong>{" "}
                  Your selected privacy and data preferences
                  will be reflected in your account. Some
                  settings may require additional steps or
                  verification.
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
                    <CheckCircle2
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Review your privacy and data settings
                  regularly.
                </li>

                <li>
                  <span>
                    <CheckCircle2
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Only provide information that is accurate
                  and necessary for your account.
                </li>

                <li>
                  <span>
                    <CheckCircle2
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Some information may be required to
                  provide PropertySure AI services and
                  verification features.
                </li>

                <li>
                  <span>
                    <CheckCircle2
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Contact support if you have questions
                  about a privacy or data setting.
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
                  <Database
                    size={22}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>Important:</strong>{" "}
                  Available privacy and data controls may
                  depend on your account, the services you
                  use, and applicable requirements. Some
                  information may need to be retained when
                  required for security, verification, legal,
                  or operational purposes.
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

                Managing Your Privacy and Data Settings
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
              BACK / NEXT ARTICLE NAVIGATION
          ================================================= */}

          <section className={styles.sideCard}>
            {/* PREVIOUS ARTICLE */}

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

            <div className={styles.sideDivider} />

            {/* NEXT ARTICLE */}

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