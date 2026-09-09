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

import styles from "./how-does-propertysure-ai-protect-my-data.module.css";

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

export default function HowDoesPropertySureAIProtectMyDataArticle() {
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

  const currentIndex = 2;

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
              Learn about the measures
              PropertySure AI may use to
              protect your personal,
              property, verification, and
              account information.
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
            id="data-protection"
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
                PropertySure AI recognizes
                that protecting personal and
                property-related information
                is an important part of
                providing a trusted property
                verification service.
              </p>

              <p>
                PropertySure AI may use
                administrative, technical,
                and organizational measures
                designed to protect information
                against unauthorized access,
                misuse, loss, alteration, or
                disclosure.
              </p>

              {/* =================================================
                  DATA PROTECTION MEASURES
              ================================================= */}

              <h2>
                How PropertySure AI May
                Protect Your Data
              </h2>

              <div
                id="protection-measures"
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
                      Account Security
                    </h3>

                    <p>
                      PropertySure AI may use
                      authentication and account
                      security controls to help
                      prevent unauthorized
                      access to user accounts
                      and account-related
                      information.
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
                      Secure Data Transmission
                    </h3>

                    <p>
                      Where appropriate,
                      PropertySure AI may use
                      security technologies
                      designed to protect
                      information while it is
                      transmitted between your
                      device and the platform.
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
                      Access Controls
                    </h3>

                    <p>
                      Access to information
                      may be restricted based
                      on roles, responsibilities,
                      operational requirements,
                      and other appropriate
                      access-control measures.
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
                      Security Monitoring
                    </h3>

                    <p>
                      Technical and security
                      logs may be used to
                      identify suspicious
                      activity, investigate
                      security events, and
                      help protect PropertySure
                      AI systems and accounts.
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
                      Protection of Property
                      Documents
                    </h3>

                    <p>
                      Property documents and
                      related verification
                      information may be
                      handled using security
                      measures designed to
                      reduce unauthorized
                      access, alteration, or
                      misuse.
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
                      Secure Service Providers
                    </h3>

                    <p>
                      Where third-party
                      service providers are
                      used to support PropertySure
                      AI services, appropriate
                      measures may be taken to
                      help ensure information is
                      handled for legitimate
                      purposes and protected
                      appropriately.
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
                      Ongoing Security
                      Improvements
                    </h3>

                    <p>
                      PropertySure AI may
                      periodically review and
                      improve its security
                      practices as its platform,
                      services, technology,
                      and potential security
                      risks evolve.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  SECURITY BOX
              ================================================= */}

              <div
                id="security-controls"
                className={
                  styles.successBox
                }
              >
                <div
                  className={
                    styles.successIcon
                  }
                >
                  <ShieldCheck
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Data security:
                  </strong>{" "}
                  PropertySure AI may use
                  appropriate security
                  safeguards to help protect
                  information against
                  unauthorized access,
                  disclosure, alteration,
                  destruction, or other
                  inappropriate use.
                </p>
              </div>

              {/* =================================================
                  WHAT USERS CAN DO
              ================================================= */}

              <h2
                id="protect-your-account"
              >
                How You Can Help Protect
                Your Information
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

                  Use a strong and unique
                  password for your account.
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

                  Keep your account
                  credentials confidential.
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

                  Use additional account
                  security features when
                  available.
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

                  Avoid sharing sensitive
                  account information with
                  unauthorized persons.
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

                  Contact PropertySure AI
                  support if you suspect
                  unauthorized activity on
                  your account.
                </li>
              </ul>

              {/* =================================================
                  SECURITY LIMITATIONS
              ================================================= */}

              <h2
                id="security-limitations"
              >
                Security Limitations
              </h2>

              <p>
                No online platform,
                electronic transmission,
                storage system, or security
                measure can guarantee absolute
                security. PropertySure AI
                should therefore continuously
                review reasonable safeguards
                and respond appropriately to
                identified security risks.
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
                  PropertySure AI takes data
                  protection seriously and
                  should apply reasonable
                  safeguards appropriate to
                  the nature of the information
                  it processes. Users should
                  also take reasonable steps to
                  protect their account
                  credentials and promptly
                  report suspected unauthorized
                  access or security incidents.
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
                    "data-protection"
                  )
                }
              >
                <span
                  className={
                    styles.activeDot
                  }
                />

                Data Protection
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "protection-measures"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Protection Measures
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "security-controls"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Security Controls
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "protect-your-account"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Protect Your Account
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "security-limitations"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Security Limitations
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