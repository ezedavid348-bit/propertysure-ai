"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Search,
  Headphones,
  MessageSquare,
  CircleHelp,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  X,
  Send,
  Shield,
} from "lucide-react";

import styles from "./need-more-help.module.css";

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
    title: "Need More Help?",
    slug: "need-more-help",
  },
];

/*
============================================================
BASE PATH
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

export default function PrivacyNeedMoreHelpPage() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [showContactModal, setShowContactModal] =
    useState(false);

  const [showFaqs, setShowFaqs] = useState(false);

  const [messageSent, setMessageSent] = useState(false);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  /* =========================================================
     CURRENT ARTICLE
  ========================================================= */

  const currentIndex =
    privacyArticles.length - 1;

  const previousArticle =
    privacyArticles[currentIndex - 1];

  /* =========================================================
     ROUTES
  ========================================================= */

  const goToPrivacyData = () => {
    router.push(privacyDataPath);
  };

  const goToArticle = (article: Article) => {
    router.push(
      `${basePath}/${article.slug}`
    );
  };

  const goToPreviousArticle = () => {
    if (previousArticle) {
      goToArticle(previousArticle);
    }
  };

  /* =========================================================
     SECTION NAVIGATION
  ========================================================= */

  const scrollToSection = (
    sectionId: string
  ) => {
    const section =
      document.getElementById(sectionId);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* =========================================================
     FEEDBACK
  ========================================================= */

  const handleFeedback = (
    value: "yes" | "no"
  ) => {
    setFeedback(value);
  };

  /* =========================================================
     CONTACT SUPPORT
  ========================================================= */

  const openContactModal = () => {
    setMessageSent(false);
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
  };

  const handleContactSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessageSent(true);

    setContactForm({
      name: "",
      email: "",
      message: "",
    });
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredArticles = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    if (!query) {
      return privacyArticles;
    }

    return privacyArticles.filter(
      (article) =>
        article.title
          .toLowerCase()
          .includes(query)
    );
  }, [searchQuery]);

  const handleSearchSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const query =
      searchQuery.trim().toLowerCase();

    if (!query) return;

    if (
      query.includes("faq") ||
      query.includes("question") ||
      query.includes("frequently")
    ) {
      setShowFaqs(true);

      setTimeout(() => {
        scrollToSection("faqs");
      }, 50);

      return;
    }

    if (
      query.includes("contact") ||
      query.includes("support") ||
      query.includes("help")
    ) {
      openContactModal();
      return;
    }

    const matchingArticle =
      filteredArticles[0];

    if (matchingArticle) {
      goToArticle(matchingArticle);
    } else {
      goToPrivacyData();
    }
  };

  /* =========================================================
     FAQ
  ========================================================= */

  const toggleFaqs = () => {
    setShowFaqs((current) => {
      const next = !current;

      if (next) {
        setTimeout(() => {
          scrollToSection("faqs");
        }, 50);
      }

      return next;
    });
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
        <form
          className={styles.searchBox}
          onSubmit={handleSearchSubmit}
        >
          <Search
            size={21}
            strokeWidth={2}
            className={styles.searchIcon}
            aria-hidden="true"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            placeholder="Search Privacy & Data articles, guides, and topics"
            aria-label="Search Privacy and Data help articles"
          />

          {searchQuery.trim() && (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={() =>
                setSearchQuery("")
              }
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </form>

        {searchQuery.trim() && (
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
              HEADER
          ================================================= */}

          <header
            className={
              styles.articleHeader
            }
          >
            <div
              className={
                styles.categoryLabel
              }
            >
              <Shield size={15} />

              Privacy &amp; Data Support
            </div>

            <h1>
              Need More Help?
            </h1>

            <p>
              We&apos;re here to help you
              understand your privacy,
              personal information, data
              protection, privacy settings,
              and your rights when using
              PropertySure AI.
            </p>

            {/* =================================================
                BACK BUTTON
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
              <ArrowLeft size={16} />

              Back to Privacy &amp; Data
            </button>
          </header>

          <div
            className={
              styles.divider
            }
          />

          {/* =================================================
              INTRO
          ================================================= */}

          <section
            id="what-you-can-do"
            className={
              styles.introSection
            }
          >
            <div
              className={
                styles.introIcon
              }
            >
              <Headphones
                size={38}
                strokeWidth={1.8}
              />
            </div>

            <div
              className={
                styles.introContent
              }
            >
              <h2>
                We&apos;re Here to Help
              </h2>

              <p>
                If you have questions about
                the information PropertySure
                AI collects, how your
                information is used or
                protected, privacy settings,
                data requests, cookies, or
                other privacy-related
                concerns, our support team
                is ready to assist you.
              </p>
            </div>
          </section>

          {/* =================================================
              WAYS WE CAN HELP
          ================================================= */}

          <section
            id="ways-we-can-help"
            className={
              styles.contentSection
            }
          >
            <h2>
              Ways We Can Help
            </h2>

            <p
              className={
                styles.sectionDescription
              }
            >
              Choose the option that best
              matches what you need help
              with.
            </p>

            <div
              className={
                styles.helpGrid
              }
            >
              {/* CONTACT SUPPORT */}

              <div
                className={
                  styles.helpCard
                }
              >
                <div
                  className={`${styles.helpIcon} ${styles.blueIcon}`}
                >
                  <MessageSquare
                    size={27}
                  />
                </div>

                <h3>
                  Contact Support
                </h3>

                <p>
                  Get help with privacy
                  questions, personal
                  information, data
                  protection, privacy
                  settings, data requests,
                  or another privacy-related
                  concern.
                </p>

                <button
                  type="button"
                  className={
                    styles.outlineButton
                  }
                  onClick={
                    openContactModal
                  }
                >
                  Contact Us

                  <ArrowRight
                    size={17}
                  />
                </button>
              </div>

              {/* PRIVACY ARTICLES */}

              <div
                className={
                  styles.helpCard
                }
              >
                <div
                  className={`${styles.helpIcon} ${styles.blueIcon}`}
                >
                  <BookOpen
                    size={27}
                  />
                </div>

                <h3>
                  Browse Privacy Articles
                </h3>

                <p>
                  Review guides covering
                  information collection,
                  data use, data protection,
                  privacy settings, data
                  rights, cookies, and
                  similar technologies.
                </p>

                <button
                  type="button"
                  className={
                    styles.outlineButton
                  }
                  onClick={
                    goToPrivacyData
                  }
                >
                  Explore Articles

                  <ArrowRight
                    size={17}
                  />
                </button>
              </div>

              {/* FAQ */}

              <div
                className={
                  styles.helpCard
                }
              >
                <div
                  className={`${styles.helpIcon} ${styles.purpleIcon}`}
                >
                  <CircleHelp
                    size={27}
                  />
                </div>

                <h3>
                  FAQs
                </h3>

                <p>
                  Find quick answers to
                  common questions about
                  PropertySure AI privacy,
                  personal information,
                  data protection, privacy
                  settings, cookies, and
                  data rights.
                </p>

                <button
                  type="button"
                  className={
                    styles.outlineButton
                  }
                  onClick={
                    toggleFaqs
                  }
                  aria-expanded={
                    showFaqs
                  }
                >
                  {showFaqs
                    ? "Hide FAQs"
                    : "View FAQs"}

                  <ArrowRight
                    size={17}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              FAQ
          ================================================= */}

          {showFaqs && (
            <section
              id="faqs"
              className={
                styles.faqSection
              }
            >
              <div
                className={
                  styles.faqHeader
                }
              >
                <div>
                  <h2>
                    Frequently Asked
                    Questions
                  </h2>

                  <p>
                    Here are some common
                    questions about Privacy
                    &amp; Data.
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    styles.closeFaqButton
                  }
                  onClick={() =>
                    setShowFaqs(false)
                  }
                  aria-label="Close FAQs"
                >
                  <X size={18} />
                </button>
              </div>

              <div
                className={
                  styles.faqList
                }
              >
                <details>
                  <summary>
                    What information does
                    PropertySure AI collect?
                  </summary>

                  <p>
                    PropertySure AI may
                    collect information
                    needed to provide account,
                    property verification,
                    security, support, and
                    other platform services.
                    The information collected
                    may depend on how you use
                    the platform and the
                    information you provide.
                  </p>
                </details>

                <details>
                  <summary>
                    How does PropertySure AI
                    use my information?
                  </summary>

                  <p>
                    Information may be used
                    to provide requested
                    services, manage your
                    account, support property
                    verification, maintain
                    security, communicate
                    with you, and operate and
                    improve the platform.
                  </p>
                </details>

                <details>
                  <summary>
                    How does PropertySure AI
                    protect my data?
                  </summary>

                  <p>
                    PropertySure AI may use
                    appropriate technical,
                    organizational, and
                    security measures to help
                    protect information from
                    unauthorized access,
                    misuse, alteration, or
                    loss.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I manage my
                    privacy settings?
                  </summary>

                  <p>
                    Privacy controls may be
                    available through your
                    account, browser, device,
                    or other applicable
                    settings. Review the
                    available controls to
                    understand and manage the
                    choices available to you.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I request access
                    to or delete my data?
                  </summary>

                  <p>
                    If you want to request
                    access to, correction of,
                    or deletion of applicable
                    personal information,
                    contact PropertySure AI
                    through the available
                    support or privacy request
                    channels.
                  </p>
                </details>

                <details>
                  <summary>
                    How does PropertySure AI
                    handle cookies and
                    similar technologies?
                  </summary>

                  <p>
                    PropertySure AI may use
                    cookies and similar
                    technologies to support
                    platform functionality,
                    security, preferences,
                    performance, and other
                    permitted purposes.
                  </p>
                </details>

                <details>
                  <summary>
                    Who can I contact about
                    a privacy concern?
                  </summary>

                  <p>
                    You can contact PropertySure
                    AI support with your privacy
                    or data-related question.
                    Provide enough information
                    to help us understand your
                    request, but do not include
                    unnecessary sensitive
                    information.
                  </p>
                </details>
              </div>
            </section>
          )}

          {/* =================================================
              BEFORE YOU REACH OUT
          ================================================= */}

          <section
            id="before-you-reach-out"
            className={
              styles.contentSection
            }
          >
            <h2>
              Before You Reach Out
            </h2>

            <p
              className={
                styles.sectionDescription
              }
            >
              Having the right information
              ready can help us understand
              your privacy or data-related
              concern more efficiently.
            </p>

            <div
              className={
                styles.preContactBox
              }
            >
              <div
                className={
                  styles.preContactIcon
                }
              >
                <ShieldCheck
                  size={30}
                />
              </div>

              <div
                className={
                  styles.checkList
                }
              >
                <div>
                  <CheckCircle2
                    size={17}
                  />

                  <span>
                    Have your PropertySure
                    AI account information
                    available where relevant.
                  </span>
                </div>

                <div>
                  <CheckCircle2
                    size={17}
                  />

                  <span>
                    Explain whether your
                    question concerns
                    information collection,
                    data use, protection,
                    settings, cookies, or
                    your data rights.
                  </span>
                </div>

                <div>
                  <CheckCircle2
                    size={17}
                  />

                  <span>
                    Clearly describe what
                    you would like PropertySure
                    AI to help you with.
                  </span>
                </div>

                <div>
                  <CheckCircle2
                    size={17}
                  />

                  <span>
                    Provide relevant details
                    only when necessary to
                    process your request.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              PRIVACY / SECURITY
          ================================================= */}

          <section
            className={
              styles.privacyBox
            }
          >
            <div
              className={
                styles.privacyIcon
              }
            >
              <ShieldCheck
                size={28}
              />
            </div>

            <p>
              <strong>
                Protect your information.
              </strong>{" "}
              Do not include passwords,
              authentication codes, payment
              credentials, or other
              unnecessary sensitive
              information when contacting
              support. Only provide the
              information needed to help
              resolve your privacy or data
              request.
            </p>
          </section>

          {/* =================================================
              BOTTOM NAVIGATION
          ================================================= */}

          <div
            className={
              styles.bottomNavigation
            }
          >
            {/* PREVIOUS ARTICLE */}

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
                <ArrowLeft size={20} />

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

            {/* LAST ARTICLE */}

            <div
              className={
                styles.endArticle
              }
            >
              <div>
                <small>
                  This is the last article
                </small>

                <strong>
                  You&apos;ve reached the
                  end
                </strong>
              </div>

              <CheckCircle2
                size={25}
              />
            </div>
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
                    "what-you-can-do"
                  )
                }
              >
                <span
                  className={
                    styles.activeDot
                  }
                />

                What You Can Do
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "ways-we-can-help"
                  )
                }
              >
                <span />

                Ways We Can Help
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "before-you-reach-out"
                  )
                }
              >
                <span />

                Before You Reach Out
              </button>

              <button
                type="button"
                onClick={
                  toggleFaqs
                }
              >
                <span />

                FAQs
              </button>
            </nav>
          </section>

          {/* =================================================
              FEEDBACK
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
            {previousArticle && (
              <button
                type="button"
                className={
                  styles.sidePrevious
                }
                onClick={
                  goToPreviousArticle
                }
              >
                <ArrowLeft size={16} />

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

            <div
              className={
                styles.sideDivider
              }
            />

            <div
              className={
                styles.lastArticle
              }
            >
              <small>
                Next Article
              </small>

              <strong>—</strong>
            </div>
          </section>

          {/* =================================================
              SUPPORT CARD
          ================================================= */}

          <section
            className={
              styles.supportCard
            }
          >
            <div
              className={
                styles.supportIcon
              }
            >
              <Headphones size={27} />
            </div>

            <div>
              <h3>
                Still need help?
              </h3>

              <p>
                Our support team is
                available to help with
                privacy questions, personal
                information, data protection,
                privacy settings, data
                requests, cookies, or other
                privacy-related concerns.
              </p>
            </div>

            <button
              type="button"
              onClick={
                openContactModal
              }
            >
              <MessageSquare
                size={17}
              />

              Contact Support
            </button>
          </section>

          {/* =================================================
              HELPFUL RESOURCES
          ================================================= */}

          <section
            className={
              styles.sideCard
            }
          >
            <h3>
              Helpful Resources
            </h3>

            <div
              className={
                styles.resourceList
              }
            >
              <button
                type="button"
                onClick={
                  goToPrivacyData
                }
              >
                <span>
                  Privacy &amp; Data
                  Overview
                </span>

                <ExternalLink
                  size={14}
                />
              </button>

              <button
                type="button"
                onClick={
                  goToPrivacyData
                }
              >
                <span>
                  Browse Privacy Articles
                </span>

                <ExternalLink
                  size={14}
                />
              </button>
            </div>
          </section>
        </aside>
      </div>

      {/* =====================================================
          CONTACT SUPPORT MODAL
      ===================================================== */}

      {showContactModal && (
        <div
          className={
            styles.modalOverlay
          }
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-support-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeContactModal();
            }
          }}
        >
          <div
            className={
              styles.modal
            }
          >
            <button
              type="button"
              className={
                styles.modalClose
              }
              onClick={
                closeContactModal
              }
              aria-label="Close contact form"
            >
              <X size={19} />
            </button>

            {!messageSent ? (
              <>
                <div
                  className={
                    styles.modalIcon
                  }
                >
                  <MessageSquare
                    size={25}
                  />
                </div>

                <h2 id="contact-support-title">
                  Contact Support
                </h2>

                <p
                  className={
                    styles.modalDescription
                  }
                >
                  Tell us what you need help
                  with regarding your
                  privacy, personal
                  information, data
                  protection, privacy
                  settings, cookies, or data
                  rights.
                </p>

                <form
                  className={
                    styles.contactForm
                  }
                  onSubmit={
                    handleContactSubmit
                  }
                >
                  <label>
                    Name

                    <input
                      type="text"
                      value={
                        contactForm.name
                      }
                      onChange={(event) =>
                        setContactForm({
                          ...contactForm,
                          name:
                            event.target
                              .value,
                        })
                      }
                      required
                      placeholder="Your name"
                    />
                  </label>

                  <label>
                    Email

                    <input
                      type="email"
                      value={
                        contactForm.email
                      }
                      onChange={(event) =>
                        setContactForm({
                          ...contactForm,
                          email:
                            event.target
                              .value,
                        })
                      }
                      required
                      placeholder="you@example.com"
                    />
                  </label>

                  <label>
                    How can we help?

                    <textarea
                      value={
                        contactForm.message
                      }
                      onChange={(event) =>
                        setContactForm({
                          ...contactForm,
                          message:
                            event.target
                              .value,
                        })
                      }
                      required
                      rows={5}
                      placeholder="Describe your privacy, data, settings, cookies, or data-rights question..."
                    />
                  </label>

                  <button
                    type="submit"
                    className={
                      styles.sendButton
                    }
                  >
                    <Send size={17} />

                    Send Request
                  </button>
                </form>
              </>
            ) : (
              <div
                className={
                  styles.successState
                }
              >
                <div
                  className={
                    styles.successIcon
                  }
                >
                  <CheckCircle2
                    size={32}
                  />
                </div>

                <h2>
                  Request Received
                </h2>

                <p>
                  Thank you for contacting
                  PropertySure AI support.
                  Your privacy or data
                  request has been recorded.
                </p>

                <button
                  type="button"
                  className={
                    styles.sendButton
                  }
                  onClick={
                    closeContactModal
                  }
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}