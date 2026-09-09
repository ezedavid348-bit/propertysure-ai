"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Database,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./how-do-i-request-access-to-or-delete-my-data.module.css";

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

export default function RequestAccessOrDeleteDataArticle() {
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

  const currentIndex = 4;

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
              Learn how to request access
              to your personal information
              or request deletion of your
              data from PropertySure AI.
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
            id="data-requests"
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
                Depending on applicable
                privacy laws and the services
                you use, you may have rights
                relating to the personal
                information PropertySure AI
                holds about you. These may
                include requesting access to
                your information or requesting
                deletion of eligible personal
                information.
              </p>

              <p>
                PropertySure AI may need to
                verify your identity and review
                your request before taking
                action. This helps protect
                personal information from
                unauthorized access or
                deletion.
              </p>

              {/* =================================================
                  HOW TO MAKE A REQUEST
              ================================================= */}

              <h2>
                How to Request Access or
                Deletion
              </h2>

              <div
                id="request-steps"
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
                      Review Your Available
                      Account Information
                    </h3>

                    <p>
                      Before submitting a
                      request, review the
                      information and account
                      controls available to you
                      through PropertySure AI.
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
                      Identify the Request
                      You Want to Make
                    </h3>

                    <p>
                      Clearly identify whether
                      you are requesting access
                      to your personal information,
                      requesting deletion, or
                      asking about another
                      applicable data right.
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
                      Contact PropertySure AI
                      Support
                    </h3>

                    <p>
                      Submit your privacy or
                      data request through the
                      support channel provided
                      by PropertySure AI. Include
                      enough information for the
                      support team to understand
                      the request.
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
                      Complete Identity
                      Verification
                    </h3>

                    <p>
                      PropertySure AI may ask
                      for additional information
                      to verify that you are the
                      account holder or otherwise
                      authorized to make the
                      request.
                    </p>
                  </div>
                </div>

                {/* STEP 5 */}

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
                    5
                  </div>

                  <div
                    className={
                      styles.processContent
                    }
                  >
                    <h3>
                      Allow the Request to Be
                      Reviewed
                    </h3>

                    <p>
                      Your request may need to
                      be reviewed to determine
                      what information can be
                      provided or deleted under
                      applicable laws and
                      PropertySure AI's
                      obligations.
                    </p>
                  </div>
                </div>

                {/* STEP 6 */}

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
                    6
                  </div>

                  <div
                    className={
                      styles.processContent
                    }
                  >
                    <h3>
                      Receive a Response
                    </h3>

                    <p>
                      PropertySure AI will
                      respond to your request
                      through the applicable
                      support or communication
                      channel and explain any
                      action taken or information
                      that can be provided.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  DATA REQUEST INFORMATION
              ================================================= */}

              <div
                id="data-request-info"
                className={
                  styles.successBox
                }
              >
                <div
                  className={
                    styles.successIcon
                  }
                >
                  <Database
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Data request:
                  </strong>{" "}
                  When submitting a request,
                  provide accurate information
                  and clearly explain what you
                  are requesting. This can help
                  PropertySure AI identify the
                  relevant account or information
                  and process your request
                  efficiently.
                </p>
              </div>

              {/* =================================================
                  ACCESS REQUEST
              ================================================= */}

              <h2 id="access-request">
                Requesting Access to Your Data
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
                      strokeWidth={
                        2.5
                      }
                    />
                  </span>

                  Clearly state that you are
                  requesting access to your
                  personal information.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={
                        2.5
                      }
                    />
                  </span>

                  Provide the account
                  information needed to help
                  identify your account.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={
                        2.5
                      }
                    />
                  </span>

                  Complete any identity
                  verification requested by
                  PropertySure AI.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={
                        2.5
                      }
                    />
                  </span>

                  Allow reasonable time for the
                  request to be reviewed and
                  processed.
                </li>
              </ul>

              {/* =================================================
                  DELETION REQUEST
              ================================================= */}

              <h2 id="deletion-request">
                Requesting Deletion of Your Data
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
                      strokeWidth={
                        2.5
                      }
                    />
                  </span>

                  Clearly state that you are
                  requesting deletion of your
                  personal information.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={
                        2.5
                      }
                    />
                  </span>

                  Provide the information
                  necessary to identify your
                  account or relevant data.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={
                        2.5
                      }
                    />
                  </span>

                  Complete any identity
                  verification required to
                  protect your information.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={
                        2.5
                      }
                    />
                  </span>

                  Understand that some
                  information may need to be
                  retained where required by
                  law, regulation, security,
                  dispute resolution, or other
                  legitimate obligations.
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
                  A request to access or delete
                  data does not necessarily mean
                  that all information can be
                  immediately provided or deleted.
                  PropertySure AI may need to
                  verify your identity and may
                  retain certain information when
                  required or permitted by
                  applicable law, regulatory
                  obligations, security
                  requirements, legitimate
                  business purposes, or other
                  applicable exceptions.
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
                    {
                      nextArticle.title
                    }
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
                    "data-requests"
                  )
                }
              >
                <span
                  className={
                    styles.activeDot
                  }
                />

                Data Requests
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "request-steps"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Request Steps
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "data-request-info"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Data Request Information
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "access-request"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Access Request
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "deletion-request"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Deletion Request
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
                    {
                      nextArticle.title
                    }
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