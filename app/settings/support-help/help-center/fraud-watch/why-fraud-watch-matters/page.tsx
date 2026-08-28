"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Lightbulb,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./fraud-watch.module.css";

type Article = {
  title: string;
  slug: string;
};

const fraudWatchArticles: Article[] = [
  {
    title: "What is Fraud Watch?",
    slug: "what-is-fraud-watch",
  },
  {
    title: "Why Fraud Watch Matters",
    slug: "why-fraud-watch-matters",
  },
  {
    title: "How Fraud Watch Works",
    slug: "how-fraud-watch-works",
  },
  {
    title: "What Fraud Watch Can Detect",
    slug: "what-fraud-watch-can-detect",
  },
  {
    title: "What Happens When Fraud is Detected",
    slug: "what-happens-when-fraud-is-detected",
  },
  {
    title: "What Fraud Watch Can't Detect",
    slug: "what-fraud-watch-cant-detect",
  },
  {
    title: "Understanding Fraud Watch Results",
    slug: "understanding-fraud-watch-results",
  },
  {
    title: "Need More Help?",
    slug: "need-more-help",
  },
];

const basePath =
  "/settings/support-help/help-center/fraud-watch";

export default function FraudWatchArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [search, setSearch] = useState("");

  /* =========================================================
     CURRENT ARTICLE
  ========================================================= */

  const currentIndex = 1;

  const currentArticle = fraudWatchArticles[currentIndex];

  const previousArticle =
    fraudWatchArticles[currentIndex - 1];

  const nextArticle =
    fraudWatchArticles[currentIndex + 1];

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goToHelpCenter = () => {
    router.push("/settings/support-help/help-center");
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
     SEARCH
  ========================================================= */

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return fraudWatchArticles;
    }

    return fraudWatchArticles.filter((article) =>
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
              Understand why monitoring fraud risks and
              suspicious activity is essential before making
              property decisions.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={goToHelpCenter}
            >
              <ArrowLeft size={17} />
              Back to Help Center
            </button>
          </header>

          <div className={styles.divider} />

          {/* =================================================
              MAIN CONTENT CARD
          ================================================= */}

          <section className={styles.contentCard}>
            <div className={styles.contentText}>
              <p>
                Real estate fraud is on the rise, and scammers
                are using more sophisticated methods to target
                property buyers, investors, and homeowners.
              </p>

              <p>
                Fraud Watch helps you stay one step ahead by
                identifying potential risks and warning signs
                before they turn into serious problems.
              </p>

              <h2>Why it matters:</h2>

              <ul className={styles.checkList}>
                <li>
                  <span>
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                  Protect your money and property from fraud
                </li>

                <li>
                  <span>
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                  Avoid costly mistakes and legal complications
                </li>

                <li>
                  <span>
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                  Detect scams and fraudulent activity early
                </li>

                <li>
                  <span>
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                  Make informed and confident property decisions
                </li>

                <li>
                  <span>
                    <Check size={11} strokeWidth={2.5} />
                  </span>
                  Stay protected in an increasingly digital world
                </li>
              </ul>

              {/* =================================================
                  TIP
              ================================================= */}

              <div className={styles.tipBox}>
                <div className={styles.tipIcon}>
                  <Lightbulb
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>Tip:</strong> Fraud can happen to
                  anyone. Staying informed and vigilant is your
                  best defense.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              BOTTOM ARTICLE NAVIGATION
              MASTER HELP CENTER ARTICLE TEMPLATE
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
                  <small>Previous Article</small>

                  <strong>{previousArticle.title}</strong>
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
                  <small>Next Article</small>

                  <strong>{nextArticle.title}</strong>
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
              {fraudWatchArticles.map((article, index) => {
                const isActive =
                  index === currentIndex;

                return (
                  <button
                    key={article.slug}
                    type="button"
                    className={
                      isActive
                        ? styles.activeArticle
                        : undefined
                    }
                    onClick={() => {
                      if (!isActive) {
                        goToArticle(article);
                      }
                    }}
                  >
                    <span
                      className={
                        isActive
                          ? styles.activeDot
                          : styles.articleDot
                      }
                    />

                    {article.title}
                  </button>
                );
              })}
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
                  onClick={() => handleFeedback("yes")}
                >
                  <ThumbsUp
                    size={18}
                    strokeWidth={1.8}
                  />
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => handleFeedback("no")}
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
              SIDEBAR ARTICLE NAVIGATION
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
                  className={styles.sidebarPreviousArrow}
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