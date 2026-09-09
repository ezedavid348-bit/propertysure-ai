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

import styles from "./how-does-propertysure-ai-use-my-information.module.css";

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

export default function HowDoesPropertySureAIUseMyInformationArticle() {
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

  const currentIndex = 1;

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
              Learn how PropertySure AI may
              use your account, property,
              verification, and other
              information to provide its
              services.
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
            id="information-use"
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
                PropertySure AI may use the
                information it collects to
                provide, maintain, secure,
                and improve its property
                verification and other
                platform services.
              </p>

              <p>
                How information is used may
                depend on the services you
                request, how you interact with
                PropertySure AI, the information
                you provide, and applicable
                legal or regulatory requirements.
              </p>

              {/* =================================================
                  HOW INFORMATION MAY BE USED
              ================================================= */}

              <h2>
                How PropertySure AI May Use
                Your Information
              </h2>

              <div
                id="how-information-is-used"
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
                      Provide Property
                      Verification Services
                    </h3>

                    <p>
                      PropertySure AI may use
                      property information,
                      submitted documents, and
                      related information to
                      provide requested property
                      verification and
                      due-diligence services.
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
                      Manage Your Account
                    </h3>

                    <p>
                      Account information may be
                      used to create, maintain,
                      authenticate, and manage
                      your PropertySure AI account
                      and provide account-related
                      services.
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
                      Process Transactions
                    </h3>

                    <p>
                      Where applicable,
                      transaction and billing
                      information may be used to
                      process subscriptions,
                      payments, invoices, and
                      other requested paid
                      services.
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
                      Maintain Security
                    </h3>

                    <p>
                      Technical, account, and
                      usage information may be
                      used to help protect
                      PropertySure AI accounts,
                      systems, services, and
                      users against unauthorized
                      access, misuse, fraud, or
                      other security threats.
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
                      Maintain Verification
                      Records
                    </h3>

                    <p>
                      PropertySure AI may use
                      information associated with
                      completed or ongoing
                      verification requests to
                      maintain verification
                      records, service history,
                      reports, and related
                      account information.
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
                      Provide Customer Support
                    </h3>

                    <p>
                      Information you provide
                      when contacting support may
                      be used to understand your
                      request, investigate issues,
                      communicate with you, and
                      provide appropriate
                      assistance.
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
                      Improve the Platform
                    </h3>

                    <p>
                      Where appropriate,
                      information about platform
                      usage and service performance
                      may be used to understand
                      how PropertySure AI is used
                      and to improve functionality,
                      reliability, security, and
                      user experience.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  VERIFICATION INFORMATION
              ================================================= */}

              <div
                id="verification-information"
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
                    Property verification:
                  </strong>{" "}
                  Information submitted or
                  generated during a
                  verification request may be
                  used to provide the requested
                  verification service and
                  maintain the related
                  verification record.
                </p>
              </div>

              {/* =================================================
                  PURPOSES OF USE
              ================================================= */}

              <h2
                id="purposes-of-use"
              >
                Purposes for Using
                Information
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

                  To provide and operate
                  PropertySure AI services.
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

                  To process and respond to
                  property verification
                  requests.
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

                  To manage accounts,
                  subscriptions, and
                  transactions where applicable.
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

                  To maintain platform,
                  account, and verification
                  security.
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

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={
                        2.5
                      }
                    />
                  </span>

                  To maintain records and
                  improve the reliability and
                  functionality of the platform.
                </li>
              </ul>

              {/* =================================================
                  INFORMATION SHARING
              ================================================= */}

              <h2
                id="information-sharing"
              >
                When Information May Be
                Shared
              </h2>

              <p>
                PropertySure AI may need to
                share or disclose certain
                information with service
                providers or other parties
                where necessary to operate the
                platform, process requested
                services, maintain security,
                comply with applicable
                requirements, or fulfill a
                legitimate business or legal
                purpose.
              </p>

              <p>
                Where third-party services are
                used, the information shared
                should be limited to what is
                reasonably necessary for the
                relevant service or purpose.
              </p>

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
                  PropertySure AI should use
                  personal and property-related
                  information only for legitimate
                  purposes connected with providing
                  its services, operating and
                  securing the platform, responding
                  to users, and meeting applicable
                  legal or regulatory obligations.
                  The specific use of information
                  may depend on the service you use
                  and the information involved.
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
                    "information-use"
                  )
                }
              >
                <span
                  className={
                    styles.activeDot
                  }
                />

                How We Use Your
                Information
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "how-information-is-used"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                How Information Is Used
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "verification-information"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Property Verification
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "purposes-of-use"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Purposes of Use
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "information-sharing"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                When Information May Be
                Shared
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