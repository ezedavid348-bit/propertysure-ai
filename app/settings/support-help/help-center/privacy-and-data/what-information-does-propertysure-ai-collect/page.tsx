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

import styles from "./what-information-does-propertysure-ai-collect.module.css";

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

export default function WhatInformationDoesPropertySureAICollectArticle() {
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

  const currentIndex = 0;

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
              Learn what types of
              information PropertySure AI
              may collect when you use the
              platform and its services.
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
            id="information-collected"
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
                PropertySure AI may collect
                information that is necessary
                to provide its property
                verification, account,
                security, support, and other
                platform services.
              </p>

              <p>
                The information collected may
                depend on how you use
                PropertySure AI, the services
                you request, and the information
                you choose to provide.
              </p>

              {/* =================================================
                  TYPES OF INFORMATION
              ================================================= */}

              <h2>
                Types of Information We May
                Collect
              </h2>

              <div
                id="types-of-information"
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
                      Account Information
                    </h3>

                    <p>
                      When you create or
                      maintain a PropertySure AI
                      account, we may collect
                      information such as your
                      name, email address, account
                      details, and other information
                      you provide during registration
                      or account management.
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
                      Property Information
                    </h3>

                    <p>
                      When you use PropertySure AI
                      to verify a property, you may
                      provide property-related
                      information such as property
                      details, location information,
                      identification references,
                      and other information required
                      for the requested verification.
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
                      Property Documents
                    </h3>

                    <p>
                      If you submit documents for
                      verification, PropertySure AI
                      may process the documents and
                      information contained in them
                      for the purpose of providing
                      the requested verification or
                      related services.
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
                      Verification Information
                    </h3>

                    <p>
                      Information generated during
                      a property verification may
                      include verification results,
                      document status, verification
                      history, property references,
                      risk indicators, and other
                      information associated with
                      the requested service.
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
                      Payment and Transaction
                      Information
                    </h3>

                    <p>
                      When you purchase a
                      subscription or paid service,
                      information relating to the
                      transaction may be processed,
                      including payment status,
                      transaction references,
                      billing information, and
                      related records. Payment
                      credentials may be handled by
                      the applicable payment provider.
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
                      Technical and Usage
                      Information
                    </h3>

                    <p>
                      When you use the platform,
                      certain technical or usage
                      information may be collected,
                      such as device information,
                      browser information, IP address,
                      security logs, access times,
                      and information about how the
                      service is used.
                    </p>
                  </div>
                </div>

                {/* STEP 7 */}

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
                    7
                  </div>

                  <div
                    className={
                      styles.processContent
                    }
                  >
                    <h3>
                      Support and Communications
                    </h3>

                    <p>
                      If you contact PropertySure AI
                      support or communicate with us,
                      we may collect the information
                      you provide, including your
                      messages, support requests,
                      account references, and other
                      information needed to respond
                      to you.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  INFORMATION YOU PROVIDE
              ================================================= */}

              <div
                id="information-you-provide"
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
                    Information you provide:
                  </strong>{" "}
                  Some information is provided
                  directly by you when you create
                  an account, submit property
                  information or documents,
                  purchase a service, contact
                  support, or otherwise interact
                  with PropertySure AI.
                </p>
              </div>

              {/* =================================================
                  WHY INFORMATION IS NEEDED
              ================================================= */}

              <h2
                id="why-information-is-needed"
              >
                Why This Information May Be
                Needed
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

                  To create and manage your
                  PropertySure AI account.
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

                  To provide requested property
                  verification and due-diligence
                  services.
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

                  To maintain verification
                  records and service history.
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

                  To process payments and
                  subscriptions where applicable.
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

                  To protect accounts, systems,
                  and services from unauthorized
                  activity.
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

                  To provide customer support
                  and respond to requests.
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
                  The specific information
                  PropertySure AI collects may
                  depend on the services you use,
                  the information you provide, and
                  applicable legal or regulatory
                  requirements. PropertySure AI
                  should only collect and process
                  information for legitimate
                  purposes connected with providing
                  its services and operating the
                  platform.
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
                    "information-collected"
                  )
                }
              >
                <span
                  className={
                    styles.activeDot
                  }
                />

                Information We Collect
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "types-of-information"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Types of Information
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "information-you-provide"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Information You Provide
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "why-information-is-needed"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Why Information Is Needed
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