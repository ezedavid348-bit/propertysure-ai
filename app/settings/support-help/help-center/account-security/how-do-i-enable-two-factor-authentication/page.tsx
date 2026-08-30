"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./how-do-i-enable-two-factor-authentication.module.css";

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

export default function EnableTwoFactorAuthenticationArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /* =========================================================
     CURRENT ARTICLE
  ========================================================= */

  const currentIndex = 2;

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
            onChange={(e) => setSearch(e.target.value)}
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
              Learn how to enable two-factor authentication
              and add an extra layer of security to your
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
            id="two-factor-authentication"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              {/* =================================================
                  INTRODUCTION
              ================================================= */}

              <p className={styles.mainParagraph}>
                Two-factor authentication adds an additional
                layer of protection to your PropertySure AI
                account by requiring another verification
                step when you sign in.
              </p>

              <p>
                Enabling two-factor authentication can help
                protect your account even if your password
                becomes known to someone else.
              </p>

              {/* =================================================
                  STEPS HEADING
              ================================================= */}

              <h2>
                Steps to Enable Two-Factor Authentication
              </h2>

              {/* =================================================
                  PROCESS LIST
              ================================================= */}

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
                      Go to Account Settings
                    </h3>

                    <p>
                      Open your account menu and select
                      Account Settings to access your
                      security options.
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
                      Open Security Settings
                    </h3>

                    <p>
                      Select the security section where
                      account protection and authentication
                      settings are managed.
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
                      Select Two-Factor Authentication
                    </h3>

                    <p>
                      Find the two-factor authentication
                      option and select it to begin the
                      setup process.
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
                      Complete the Verification Setup
                    </h3>

                    <p>
                      Follow the instructions provided by
                      PropertySure AI to complete the
                      additional authentication step.
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
                      Confirm Two-Factor Authentication
                    </h3>

                    <p>
                      Complete the final verification step
                      to confirm that two-factor
                      authentication has been successfully
                      enabled.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  SUCCESS BOX
              ================================================= */}

              <div
                id="authentication-enabled"
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <CheckCircle2
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Two-factor authentication enabled.
                  </strong>{" "}
                  Your account now has an additional
                  authentication layer to help protect
                  your account.
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

                  Keep your authentication method secure
                  and accessible to you.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Never share authentication codes with
                  another person.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Make sure you can access your selected
                  authentication method when signing in.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Contact support if you lose access to
                  your authentication method.
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
                  <ShieldCheck
                    size={22}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>Important:</strong>{" "}
                  Never share your verification codes,
                  authentication credentials, or other
                  security information with anyone.
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

                Steps to Enable Two-Factor Authentication
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
            {/* =================================================
                PREVIOUS ARTICLE
            ================================================= */}

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

            <div className={styles.sideDivider} />

            {/* =================================================
                NEXT ARTICLE
            ================================================= */}

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