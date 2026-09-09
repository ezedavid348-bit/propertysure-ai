"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Cookie,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./how-does-propertysure-ai-handle-cookies-and-similar-technologies.module.css";

type Article = {
  title: string;
  slug: string;
};

/*
============================================================
PRIVACY & DATA ARTICLES
============================================================
*/

const privacyArticles: Article[] = [
  {
    title:
      "What information does PropertySure AI collect?",
    slug:
      "what-information-does-propertysure-ai-collect",
  },
  {
    title:
      "How does PropertySure AI use my information?",
    slug:
      "how-does-propertysure-ai-use-my-information",
  },
  {
    title:
      "How does PropertySure AI protect my data?",
    slug:
      "how-does-propertysure-ai-protect-my-data",
  },
  {
    title:
      "How do I manage my privacy settings?",
    slug:
      "how-do-i-manage-my-privacy-settings",
  },
  {
    title:
      "How do I request access to or delete my data?",
    slug:
      "how-do-i-request-access-to-or-delete-my-data",
  },
  {
    title:
      "How does PropertySure AI handle cookies and similar technologies?",
    slug:
      "how-does-propertysure-ai-handle-cookies-and-similar-technologies",
  },
  {
    title:
      "Need More Help?",
    slug:
      "need-more-help",
  },
];

/*
============================================================
PATHS
============================================================
*/

const basePath =
  "/settings/support-help/help-center/privacy-and-data";

const privacyDataPath =
  "/settings/support-help/help-center/privacy-and-data";

/*
============================================================
PAGE
============================================================
*/

export default function CookiesAndSimilarTechnologiesArticle() {
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
    privacyArticles[currentIndex];

  const previousArticle =
    privacyArticles[currentIndex - 1];

  const nextArticle =
    privacyArticles[currentIndex + 1];

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const goToPrivacyData = () => {
    router.push(privacyDataPath);
  };

  const goToArticle = (
    article: Article
  ) => {
    router.push(
      `${basePath}/${article.slug}`
    );
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

  const scrollToSection = (
    sectionId: string
  ) => {
    const section =
      document.getElementById(
        sectionId
      );

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

  const filteredArticles =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return privacyArticles;
      }

      return privacyArticles.filter(
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

      <header
        className={
          styles.topHeader
        }
      >
        <div
          className={
            styles.searchBox
          }
        >
          <svg
            className={
              styles.searchIcon
            }
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
              setSearch(
                event.target.value
              )
            }
            placeholder="Search for articles, guides, and topics"
            aria-label="Search Privacy and Data help articles"
          />
        </div>

        {search.trim() && (
          <div
            className={
              styles.searchResults
            }
          >
            {filteredArticles.length >
            0 ? (
              filteredArticles.map(
                (article) => (
                  <button
                    key={
                      article.slug
                    }
                    type="button"
                    onClick={() =>
                      goToArticle(
                        article
                      )
                    }
                  >
                    {article.title}
                  </button>
                )
              )
            ) : (
              <span>
                No matching articles
                found.
              </span>
            )}
          </div>
        )}
      </header>

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div
        className={
          styles.layout
        }
      >

        {/* ===================================================
            MAIN ARTICLE
        =================================================== */}

        <article
          className={
            styles.article
          }
        >

          {/* =================================================
              ARTICLE HEADER
          ================================================= */}

          <header
            className={
              styles.articleHeader
            }
          >
            <h1>
              {currentArticle.title}
            </h1>

            <p>
              Learn how PropertySure AI
              may use cookies and similar
              technologies to operate,
              secure, improve, and understand
              use of the platform.
            </p>

            {/* =================================================
                BACK TO PRIVACY & DATA
            ================================================= */}

            <button
              type="button"
              className={
                styles.backButton
              }
              onClick={
                goToPrivacyData
              }
            >
              <ArrowLeft
                size={17}
              />

              Back to Privacy & Data
            </button>
          </header>

          <div
            className={
              styles.divider
            }
          />

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <section
            id="cookies"
            className={
              styles.contentCard
            }
          >
            <div
              className={
                styles.contentText
              }
            >

              <p
                className={
                  styles.mainParagraph
                }
              >
                PropertySure AI may use
                cookies and similar
                technologies when you access
                or use the platform. These
                technologies can help the
                service function properly,
                remember certain preferences,
                maintain security, and
                understand how users interact
                with the platform.
              </p>

              <p>
                The specific technologies used
                may depend on the features and
                services available on
                PropertySure AI and how you
                interact with the platform.
              </p>

              {/* =================================================
                  WHAT ARE COOKIES
              ================================================= */}

              <h2>
                What Are Cookies?
              </h2>

              <div
                id="what-are-cookies"
                className={
                  styles.processList
                }
              >

                {/* STEP 1 */}

                <div
                  className={
                    styles.processItem
                  }
                >
                  <div
                    className={
                      styles.processNumber
                    }
                  >
                    1
                  </div>

                  <div
                    className={
                      styles.processContent
                    }
                  >
                    <h3>
                      Small Data Files
                    </h3>

                    <p>
                      Cookies are small pieces
                      of information that may be
                      stored on your device by a
                      website or online service.
                      They can help a service
                      recognize a browser or
                      remember information between
                      visits.
                    </p>
                  </div>
                </div>

                {/* STEP 2 */}

                <div
                  className={
                    styles.processItem
                  }
                >
                  <div
                    className={
                      styles.processNumber
                    }
                  >
                    2
                  </div>

                  <div
                    className={
                      styles.processContent
                    }
                  >
                    <h3>
                      Similar Technologies
                    </h3>

                    <p>
                      Similar technologies may
                      include tools or technical
                      methods that perform
                      functions comparable to
                      cookies, such as helping
                      maintain sessions, measure
                      usage, or support security
                      and platform functionality.
                    </p>
                  </div>
                </div>

                {/* STEP 3 */}

                <div
                  className={
                    styles.processItem
                  }
                >
                  <div
                    className={
                      styles.processNumber
                    }
                  >
                    3
                  </div>

                  <div
                    className={
                      styles.processContent
                    }
                  >
                    <h3>
                      Browser and Device
                      Storage
                    </h3>

                    <p>
                      Depending on the technology
                      and your device, information
                      may be stored or accessed
                      through your browser or
                      device to support the
                      operation and security of
                      PropertySure AI.
                    </p>
                  </div>
                </div>

              </div>

              {/* =================================================
                  HOW COOKIES MAY BE USED
              ================================================= */}

              <h2
                id="how-cookies-are-used"
              >
                How Cookies and Similar
                Technologies May Be Used
              </h2>

              <div
                id="uses"
                className={
                  styles.processList
                }
              >

                {/* STEP 1 */}

                <div
                  className={
                    styles.processItem
                  }
                >
                  <div
                    className={
                      styles.processNumber
                    }
                  >
                    1
                  </div>

                  <div
                    className={
                      styles.processContent
                    }
                  >
                    <h3>
                      Essential Platform
                      Functions
                    </h3>

                    <p>
                      Some cookies or similar
                      technologies may be
                      necessary for the platform
                      to operate correctly,
                      including maintaining
                      sessions, supporting
                      authentication, and
                      enabling requested features.
                    </p>
                  </div>
                </div>

                {/* STEP 2 */}

                <div
                  className={
                    styles.processItem
                  }
                >
                  <div
                    className={
                      styles.processNumber
                    }
                  >
                    2
                  </div>

                  <div
                    className={
                      styles.processContent
                    }
                  >
                    <h3>
                      Security
                    </h3>

                    <p>
                      Technologies may be used
                      to help protect accounts,
                      detect suspicious activity,
                      maintain platform security,
                      and prevent unauthorized
                      access or misuse.
                    </p>
                  </div>
                </div>

                {/* STEP 3 */}

                <div
                  className={
                    styles.processItem
                  }
                >
                  <div
                    className={
                      styles.processNumber
                    }
                  >
                    3
                  </div>

                  <div
                    className={
                      styles.processContent
                    }
                  >
                    <h3>
                      Preferences
                    </h3>

                    <p>
                      Certain technologies may
                      help remember preferences
                      or settings so that you do
                      not have to provide the same
                      information repeatedly.
                    </p>
                  </div>
                </div>

                {/* STEP 4 */}

                <div
                  className={
                    styles.processItem
                  }
                >
                  <div
                    className={
                      styles.processNumber
                    }
                  >
                    4
                  </div>

                  <div
                    className={
                      styles.processContent
                    }
                  >
                    <h3>
                      Performance and Usage
                    </h3>

                    <p>
                      Where applicable, cookies
                      or similar technologies may
                      help PropertySure AI
                      understand how the platform
                      is used, identify technical
                      issues, and improve the
                      performance and user
                      experience of the service.
                    </p>
                  </div>
                </div>

              </div>

              {/* =================================================
                  COOKIE TYPES
              ================================================= */}

              <div
                id="cookie-types"
                className={
                  styles.successBox
                }
              >
                <div
                  className={
                    styles.successIcon
                  }
                >
                  <Cookie
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Different purposes:
                  </strong>{" "}
                  Cookies and similar
                  technologies may serve
                  different purposes. Some may
                  be necessary for core
                  functionality or security,
                  while others may support
                  preferences, performance,
                  analytics, or other permitted
                  functions.
                </p>
              </div>

              {/* =================================================
                  MANAGING COOKIES
              ================================================= */}

              <h2
                id="managing-cookies"
              >
                Managing Cookies
              </h2>

              <ul
                className={
                  styles.checkList
                }
              >
                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Your browser may provide
                  controls that allow you to
                  manage or delete cookies.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Some browser settings may
                  allow you to block cookies
                  entirely or restrict certain
                  types of storage.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Disabling certain cookies may
                  affect the availability or
                  functionality of some platform
                  features.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Where PropertySure AI provides
                  privacy or cookie controls,
                  those controls can be used to
                  manage the available choices.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  You should review your browser
                  and device settings to
                  understand the controls
                  available to you.
                </li>
              </ul>

              {/* =================================================
                  IMPORTANT NOTE
              ================================================= */}

              <div
                id="important-note"
                className={
                  styles.noteBox
                }
              >
                <div
                  className={
                    styles.noteIcon
                  }
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
                  The cookies and similar
                  technologies used by
                  PropertySure AI may change as
                  the platform develops. The
                  availability and purpose of
                  particular technologies may
                  also depend on the services and
                  features you use. PropertySure
                  AI should use these technologies
                  in accordance with applicable
                  privacy and data-protection
                  requirements.
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
                  size={20}
                />
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
                    "cookies"
                  )
                }
              >
                <span
                  className={
                    styles.activeDot
                  }
                />

                Cookies &amp; Similar
                Technologies
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "what-are-cookies"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                What Are Cookies?
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "how-cookies-are-used"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                How They May Be Used
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "cookie-types"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Cookie Types
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "managing-cookies"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Managing Cookies
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
                    handleFeedback(
                      "yes"
                    )
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
                    handleFeedback(
                      "no"
                    )
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
                  Thanks for your
                  feedback.
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