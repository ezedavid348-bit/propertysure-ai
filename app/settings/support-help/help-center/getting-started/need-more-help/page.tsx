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
  Rocket,
} from "lucide-react";

import styles from "./need-more-help.module.css";

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
  {
    title: "How do I reset my PropertySure AI password?",
    slug: "how-do-i-reset-my-propertysure-ai-password",
  },
  {
    title: "How do I navigate my dashboard?",
    slug: "how-do-i-navigate-my-dashboard",
  },
  {
    title: "How do I start a property verification?",
    slug: "how-do-i-start-a-property-verification",
  },
  {
    title: "What documents do I need for verification?",
    slug: "what-documents-do-i-need-for-verification",
  },
  {
    title: "How do I upload property documents?",
    slug: "how-do-i-upload-property-documents",
  },
  {
    title: "How do I provide property location details?",
    slug: "how-do-i-provide-property-location-details",
  },
  {
    title: "What happens after I submit a verification?",
    slug: "what-happens-after-i-submit-a-verification",
  },
  {
    title: "Need More Help?",
    slug: "need-more-help",
  },
];

const basePath =
  "/settings/support-help/help-center/getting-started";

export default function GettingStartedNeedMoreHelpPage() {
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

  const currentIndex = gettingStartedArticles.length - 1;

  const previousArticle =
    gettingStartedArticles[currentIndex - 1];

  /* =========================================================
     ROUTES
  ========================================================= */

  const goToGettingStarted = () => {
    router.push(basePath);
  };

  const goToArticle = (article: Article) => {
    router.push(`${basePath}/${article.slug}`);
  };

  const goToPreviousArticle = () => {
    if (previousArticle) {
      goToArticle(previousArticle);
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
     FEEDBACK
  ========================================================= */

  const handleFeedback = (value: "yes" | "no") => {
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
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return gettingStartedArticles;
    }

    return gettingStartedArticles.filter((article) =>
      article.title.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSearchSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const query = searchQuery.trim().toLowerCase();

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

    const matchingArticle = filteredArticles[0];

    if (matchingArticle) {
      goToArticle(matchingArticle);
    } else {
      goToGettingStarted();
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
              setSearchQuery(event.target.value)
            }
            placeholder="Search Getting Started articles, guides, and topics"
            aria-label="Search Getting Started help articles"
          />

          {searchQuery.trim() && (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </form>

        {searchQuery.trim() && (
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
              HEADER
          ================================================= */}

          <header className={styles.articleHeader}>
            <div className={styles.categoryLabel}>
              <Rocket size={15} />
              Getting Started Support
            </div>

            <h1>Need More Help?</h1>

            <p>
              We&apos;re here to help you get started with
              PropertySure AI, understand the platform, and
              begin your property verification journey with
              confidence.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={goToGettingStarted}
            >
              <ArrowLeft size={16} />
              Back to Getting Started
            </button>
          </header>

          <div className={styles.divider} />

          {/* =================================================
              INTRO
          ================================================= */}

          <section
            id="what-you-can-do"
            className={styles.introSection}
          >
            <div className={styles.introIcon}>
              <Headphones
                size={38}
                strokeWidth={1.8}
              />
            </div>

            <div className={styles.introContent}>
              <h2>We&apos;re Here to Help</h2>

              <p>
                If you need help creating or accessing your
                account, navigating the dashboard, starting a
                property verification, uploading documents,
                providing property information, or
                understanding what happens after submission,
                our support team is ready to assist you.
              </p>
            </div>
          </section>

          {/* =================================================
              WAYS WE CAN HELP
          ================================================= */}

          <section
            id="ways-we-can-help"
            className={styles.contentSection}
          >
            <h2>Ways We Can Help</h2>

            <p className={styles.sectionDescription}>
              Choose the option that best matches what you need.
            </p>

            <div className={styles.helpGrid}>
              {/* CONTACT SUPPORT */}

              <div className={styles.helpCard}>
                <div
                  className={`${styles.helpIcon} ${styles.blueIcon}`}
                >
                  <MessageSquare size={27} />
                </div>

                <h3>Contact Support</h3>

                <p>
                  Get help with your account, dashboard,
                  property verification, documents, location
                  information, or another Getting Started
                  concern.
                </p>

                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={openContactModal}
                >
                  Contact Us
                  <ArrowRight size={17} />
                </button>
              </div>

              {/* GETTING STARTED */}

              <div className={styles.helpCard}>
                <div
                  className={`${styles.helpIcon} ${styles.blueIcon}`}
                >
                  <BookOpen size={27} />
                </div>

                <h3>Browse Getting Started</h3>

                <p>
                  Review guides covering your account,
                  dashboard, property verification, required
                  documents, uploads, location details, and
                  verification submission.
                </p>

                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={goToGettingStarted}
                >
                  Explore Articles
                  <ArrowRight size={17} />
                </button>
              </div>

              {/* FAQ */}

              <div className={styles.helpCard}>
                <div
                  className={`${styles.helpIcon} ${styles.purpleIcon}`}
                >
                  <CircleHelp size={27} />
                </div>

                <h3>FAQs</h3>

                <p>
                  Find quick answers to common questions about
                  getting started, your account, property
                  verification, documents, and submitting a
                  verification request.
                </p>

                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={toggleFaqs}
                  aria-expanded={showFaqs}
                >
                  {showFaqs ? "Hide FAQs" : "View FAQs"}
                  <ArrowRight size={17} />
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
              className={styles.faqSection}
            >
              <div className={styles.faqHeader}>
                <div>
                  <h2>
                    Frequently Asked Questions
                  </h2>

                  <p>
                    Here are some common questions about
                    getting started with PropertySure AI.
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.closeFaqButton}
                  onClick={() => setShowFaqs(false)}
                  aria-label="Close FAQs"
                >
                  <X size={18} />
                </button>
              </div>

              <div className={styles.faqList}>
                <details>
                  <summary>
                    How do I create a PropertySure AI
                    account?
                  </summary>

                  <p>
                    Open the PropertySure AI platform, select
                    the account creation option, and follow the
                    registration instructions to provide the
                    required account information.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I sign in to my PropertySure AI
                    account?
                  </summary>

                  <p>
                    Open PropertySure AI and use the sign-in
                    option to enter the email address and
                    password associated with your account.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I reset my PropertySure AI
                    password?
                  </summary>

                  <p>
                    Use the password recovery option on the
                    PropertySure AI sign-in page and follow the
                    instructions provided to create a new
                    password.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I navigate my dashboard?
                  </summary>

                  <p>
                    After signing in, use your PropertySure AI
                    dashboard to access the available account,
                    verification, document, report, and other
                    platform features.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I start a property verification?
                  </summary>

                  <p>
                    Open the property verification feature from
                    your account and follow the instructions to
                    provide the required property information
                    and documents.
                  </p>
                </details>

                <details>
                  <summary>
                    What documents do I need for verification?
                  </summary>

                  <p>
                    The documents required can depend on the
                    property and verification request. Follow
                    the instructions shown during the
                    verification process and provide the
                    relevant property documents requested.
                  </p>
                </details>

                <details>
                  <summary>
                    What happens after I submit a
                    verification?
                  </summary>

                  <p>
                    After submission, PropertySure AI processes
                    the verification request. You can follow
                    the available status and review the
                    resulting information when the verification
                    is completed.
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
            className={styles.contentSection}
          >
            <h2>Before You Reach Out</h2>

            <p className={styles.sectionDescription}>
              Having the right information ready can help us
              understand your Getting Started concern faster.
            </p>

            <div className={styles.preContactBox}>
              <div className={styles.preContactIcon}>
                <BookOpen size={30} />
              </div>

              <div className={styles.checkList}>
                <div>
                  <CheckCircle2 size={17} />

                  <span>
                    Have the account, property, or verification
                    information you need help with ready.
                  </span>
                </div>

                <div>
                  <CheckCircle2 size={17} />

                  <span>
                    Explain which part of Getting Started you
                    need help with.
                  </span>
                </div>

                <div>
                  <CheckCircle2 size={17} />

                  <span>
                    Describe what you were trying to do and
                    what happened.
                  </span>
                </div>

                <div>
                  <CheckCircle2 size={17} />

                  <span>
                    Screenshots or relevant information may
                    help us understand the issue.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              PRIVACY
          ================================================= */}

          <section className={styles.privacyBox}>
            <div className={styles.privacyIcon}>
              <ShieldCheck size={28} />
            </div>

            <p>
              <strong>
                Your information is safe with us.
              </strong>{" "}
              Avoid sharing passwords, authentication codes,
              or other sensitive account credentials when
              contacting support. Only provide the information
              necessary to help resolve your request.
            </p>
          </section>

          {/* =================================================
              BOTTOM NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>
            {/* PREVIOUS ARTICLE */}

            {previousArticle && (
              <button
                type="button"
                className={styles.previousBottom}
                onClick={goToPreviousArticle}
              >
                <ArrowLeft size={20} />

                <span>
                  <small>Previous Article</small>

                  <strong>
                    {previousArticle.title}
                  </strong>
                </span>
              </button>
            )}

            {/* LAST ARTICLE — NO NEXT ARTICLE */}

            <div className={styles.endArticle}>
              <div>
                <small>
                  This is the last article
                </small>

                <strong>
                  You&apos;ve reached the end
                </strong>
              </div>

              <CheckCircle2 size={25} />
            </div>
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
                  scrollToSection("what-you-can-do")
                }
              >
                <span className={styles.activeDot} />

                What You Can Do
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("ways-we-can-help")
                }
              >
                <span />

                Ways We Can Help
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("before-you-reach-out")
                }
              >
                <span />

                Before You Reach Out
              </button>

              <button
                type="button"
                onClick={toggleFaqs}
              >
                <span />

                FAQs
              </button>
            </nav>
          </section>

          {/* =================================================
              FEEDBACK
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
                  <ThumbsUp size={18} />

                  Yes
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleFeedback("no")
                  }
                >
                  <ThumbsDown size={18} />

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
            {previousArticle && (
              <button
                type="button"
                className={styles.sidePrevious}
                onClick={goToPreviousArticle}
              >
                <ArrowLeft size={16} />

                <span>
                  <small>Previous Article</small>

                  <strong>
                    {previousArticle.title}
                  </strong>
                </span>
              </button>
            )}

            <div className={styles.sideDivider} />

            {/* IMPORTANT:
                This is intentionally NOT a clickable
                next article because Need More Help is
                the final Getting Started article.
            */}

            <div className={styles.lastArticle}>
              <small>Next Article</small>

              <strong>—</strong>
            </div>
          </section>

          {/* =================================================
              SUPPORT CARD
          ================================================= */}

          <section className={styles.supportCard}>
            <div className={styles.supportIcon}>
              <Headphones size={27} />
            </div>

            <div>
              <h3>Still need help?</h3>

              <p>
                Our support team is available to help with
                your PropertySure AI account, dashboard,
                property verification, documents, location
                details, and other Getting Started concerns.
              </p>
            </div>

            <button
              type="button"
              onClick={openContactModal}
            >
              <MessageSquare size={17} />

              Contact Support
            </button>
          </section>

          {/* =================================================
              HELPFUL RESOURCES
          ================================================= */}

          <section className={styles.sideCard}>
            <h3>Helpful Resources</h3>

            <div className={styles.resourceList}>
              <button
                type="button"
                onClick={goToGettingStarted}
              >
                <span>
                  Getting Started Overview
                </span>

                <ExternalLink size={14} />
              </button>

              <button
                type="button"
                onClick={goToGettingStarted}
              >
                <span>
                  Browse Getting Started Articles
                </span>

                <ExternalLink size={14} />
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
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-support-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeContactModal();
            }
          }}
        >
          <div className={styles.modal}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={closeContactModal}
              aria-label="Close contact form"
            >
              <X size={19} />
            </button>

            {!messageSent ? (
              <>
                <div className={styles.modalIcon}>
                  <MessageSquare size={25} />
                </div>

                <h2 id="contact-support-title">
                  Contact Support
                </h2>

                <p
                  className={
                    styles.modalDescription
                  }
                >
                  Tell us what you need help with regarding
                  your PropertySure AI account, dashboard,
                  property verification, documents, or other
                  Getting Started questions.
                </p>

                <form
                  className={styles.contactForm}
                  onSubmit={handleContactSubmit}
                >
                  <label>
                    Name

                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(event) =>
                        setContactForm({
                          ...contactForm,
                          name: event.target.value,
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
                      value={contactForm.email}
                      onChange={(event) =>
                        setContactForm({
                          ...contactForm,
                          email: event.target.value,
                        })
                      }
                      required
                      placeholder="you@example.com"
                    />
                  </label>

                  <label>
                    How can we help?

                    <textarea
                      value={contactForm.message}
                      onChange={(event) =>
                        setContactForm({
                          ...contactForm,
                          message: event.target.value,
                        })
                      }
                      required
                      rows={5}
                      placeholder="Describe your account, dashboard, verification, document, or other issue..."
                    />
                  </label>

                  <button
                    type="submit"
                    className={styles.sendButton}
                  >
                    <Send size={17} />

                    Send Request
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.successState}>
                <div className={styles.successIcon}>
                  <CheckCircle2 size={32} />
                </div>

                <h2>Request Received</h2>

                <p>
                  Thank you for contacting PropertySure AI
                  support. Your request has been recorded.
                </p>

                <button
                  type="button"
                  className={styles.sendButton}
                  onClick={closeContactModal}
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