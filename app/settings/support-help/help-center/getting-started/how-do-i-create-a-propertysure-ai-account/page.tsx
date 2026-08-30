"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  UserPlus,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./how-do-i-create-a-propertysure-ai-account.module.css";

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
    title: "How do I sign in to my PropertySure AI account?",
    slug: "how-do-i-sign-in-to-my-propertysure-ai-account",
  },
];

const basePath =
  "/settings/support-help/help-center/getting-started";

const gettingStartedPath =
  "/settings/support-help/help-center/getting-started";

export default function CreatePropertySureAIAccountArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /* =========================================================
     CURRENT ARTICLE
  ========================================================= */

  const currentIndex = 1;

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
              Learn how to create your PropertySure AI
              account and get started with the platform.
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
            id="create-account"
            className={styles.contentCard}
          >
            <div className={styles.contentText}>
              <p className={styles.mainParagraph}>
                Creating a PropertySure AI account gives you
                access to the platform&apos;s property
                verification and due-diligence features. Your
                account allows you to manage your verification
                activity, review available reports, and keep
                track of your property verification history.
              </p>

              <p>
                Before creating an account, make sure you have
                access to an email address that you can use to
                receive account-related communications and
                complete any required verification steps.
              </p>

              <h2>
                How to Create Your PropertySure AI Account
              </h2>

              <div
                id="steps"
                className={styles.processList}
              >
                {/* STEP 1 */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    1
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Open PropertySure AI
                    </h3>

                    <p>
                      Open the PropertySure AI platform and
                      select the option to create a new account.
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
                      Select Create Account
                    </h3>

                    <p>
                      Choose the account creation or sign-up
                      option to begin registering your
                      PropertySure AI account.
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
                      Enter Your Account Information
                    </h3>

                    <p>
                      Provide the information requested by the
                      registration form, such as your name,
                      email address, and other required account
                      information.
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
                      Create a Secure Password
                    </h3>

                    <p>
                      Create a strong password for your account.
                      Avoid using passwords that are easy to
                      guess or that you use for other services.
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
                      Complete Any Required Verification
                    </h3>

                    <p>
                      Follow any verification instructions
                      provided during registration. This may
                      include confirming your email address or
                      completing another account verification
                      step.
                    </p>
                  </div>
                </div>

                {/* STEP 6 */}

                <div className={styles.processItem}>
                  <div className={styles.processNumber}>
                    6
                  </div>

                  <div className={styles.processContent}>
                    <h3>
                      Sign In to Your Account
                    </h3>

                    <p>
                      Once registration is complete, sign in
                      using your account credentials to access
                      your PropertySure AI account.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  ACCOUNT READY
              ================================================= */}

              <div
                id="account-ready"
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <UserPlus
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Your account is ready.
                  </strong>{" "}
                  After completing registration and any
                  required verification steps, you can use
                  your PropertySure AI account to access the
                  available platform features and begin
                  managing your property verification activity.
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

                  Use an email address that you can access
                  regularly.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Create a strong and unique password for your
                  PropertySure AI account.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Keep your account credentials private and do
                  not share your password with other people.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Complete any account verification steps
                  required before using restricted or
                  verification-related features.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Make sure the information you provide during
                  registration is accurate.
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
                  Never share your password, authentication
                  codes, or other sensitive account credentials
                  with anyone claiming to provide support.
                  PropertySure AI support should not require you
                  to disclose your private login credentials.
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
                  scrollToSection("create-account")
                }
              >
                <span className={styles.activeDot} />

                How to Create Your Account
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("steps")
                }
              >
                <span className={styles.articleDot} />

                Account Creation Steps
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("account-ready")
                }
              >
                <span className={styles.articleDot} />

                Account Ready
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