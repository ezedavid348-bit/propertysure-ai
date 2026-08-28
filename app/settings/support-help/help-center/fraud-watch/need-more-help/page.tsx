"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Headphones,
  MessageSquare,
  BookOpen,
  CircleHelp,
  ClipboardList,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  X,
  Send,
  AlertTriangle,
  Eye,
} from "lucide-react";

import styles from "./need-more-help.module.css";

export default function FraudWatchNeedMoreHelpPage() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [showContactModal, setShowContactModal] = useState(false);

  const [showFaqs, setShowFaqs] = useState(false);

  const [messageSent, setMessageSent] = useState(false);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  /* =========================================================
     ARTICLE ROUTES
  ========================================================= */

  const goToFraudWatch = () => {
    router.push(
      "/settings/support-help/help-center/fraud-watch"
    );
  };

  const goToFraudWatchArticles = () => {
    router.push(
      "/settings/support-help/help-center/fraud-watch"
    );
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

    goToFraudWatchArticles();
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
            placeholder="Search Fraud Watch articles, guides, and topics"
            aria-label="Search Fraud Watch help articles"
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
              <AlertTriangle size={15} />
              Fraud Watch Support
            </div>

            <h1>Need More Help?</h1>

            <p>
              We&apos;re here to help you understand Fraud Watch
              alerts, suspicious property activity, and the
              information available through your PropertySure AI
              account.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={goToFraudWatch}
            >
              <ArrowLeft size={16} />
              Back to Fraud Watch
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
                If you need assistance understanding a Fraud
                Watch alert, reviewing suspicious activity, or
                navigating your account, our support team is
                ready to assist you.
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
                  Get help understanding a Fraud Watch alert,
                  suspicious activity, or an issue with your
                  account.
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

              {/* FRAUD WATCH */}

              <div className={styles.helpCard}>
                <div
                  className={`${styles.helpIcon} ${styles.redIcon}`}
                >
                  <Eye size={27} />
                </div>

                <h3>Browse Fraud Watch</h3>

                <p>
                  Learn how Fraud Watch works, how alerts are
                  presented, and how to understand suspicious
                  property activity.
                </p>

                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={goToFraudWatchArticles}
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
                  Fraud Watch alerts and suspicious activity.
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
              FAQ SECTION
          ================================================= */}

          {showFaqs && (
            <section
              id="faqs"
              className={styles.faqSection}
            >
              <div className={styles.faqHeader}>
                <div>
                  <h2>Frequently Asked Questions</h2>

                  <p>
                    Here are some common questions about
                    PropertySure AI Fraud Watch.
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
                    What is Fraud Watch?
                  </summary>

                  <p>
                    Fraud Watch is designed to help identify and
                    surface property-related information or
                    activity that may require further attention
                    or investigation.
                  </p>
                </details>

                <details>
                  <summary>
                    What should I do when I receive an alert?
                  </summary>

                  <p>
                    Review the information provided in the alert
                    and examine the available details carefully.
                    If you need clarification, you can contact
                    the PropertySure AI support team.
                  </p>
                </details>

                <details>
                  <summary>
                    Does a Fraud Watch alert automatically mean
                    a property is fraudulent?
                  </summary>

                  <p>
                    No. An alert should be treated as a signal
                    that may require further review or
                    investigation. It should not by itself be
                    treated as a final determination of fraud.
                  </p>
                </details>

                <details>
                  <summary>
                    Can I get help understanding an alert?
                  </summary>

                  <p>
                    Yes. If you are unsure about an alert or the
                    information associated with it, contact our
                    support team and provide the relevant details
                    so we can assist you.
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
              understand your concern faster.
            </p>

            <div className={styles.preContactBox}>
              <div className={styles.preContactIcon}>
                <ClipboardList size={30} />
              </div>

              <div className={styles.checkList}>
                <div>
                  <CheckCircle2 size={17} />

                  <span>
                    Have your PropertySure account email ready.
                  </span>
                </div>

                <div>
                  <CheckCircle2 size={17} />

                  <span>
                    Include the Fraud Watch alert or reference
                    number, if available.
                  </span>
                </div>

                <div>
                  <CheckCircle2 size={17} />

                  <span>
                    Explain what you noticed and why you need
                    assistance.
                  </span>
                </div>

                <div>
                  <CheckCircle2 size={17} />

                  <span>
                    Screenshots or relevant supporting
                    information may help us understand the
                    issue.
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
              <strong>Your information is safe with us.</strong>{" "}
              We take your privacy seriously. Information you
              provide to support is used to assist with your
              request and handled in accordance with our
              privacy practices.
            </p>
          </section>

          {/* =================================================
              BOTTOM NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>
            <button
              type="button"
              className={styles.previousBottom}
              onClick={goToFraudWatch}
            >
              <ArrowLeft size={20} />

              <span>
                <small>Previous Article</small>

                <strong>Fraud Watch</strong>
              </span>
            </button>

            <div className={styles.endArticle}>
              <div>
                <small>This is the last article</small>

                <strong>You&apos;ve reached the end</strong>
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
                  onClick={() => handleFeedback("yes")}
                >
                  <ThumbsUp size={18} />
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => handleFeedback("no")}
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
            <button
              type="button"
              className={styles.sidePrevious}
              onClick={goToFraudWatch}
            >
              <ArrowLeft size={16} />

              <span>
                <small>Previous Article</small>

                <strong>Fraud Watch</strong>
              </span>
            </button>

            <div className={styles.sideDivider} />

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
                Our support team is available to help with Fraud
                Watch questions and account-related concerns.
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
                onClick={goToFraudWatch}
              >
                <span>Fraud Watch Overview</span>
                <ExternalLink size={14} />
              </button>

              <button
                type="button"
                onClick={goToFraudWatchArticles}
              >
                <span>Browse Fraud Watch Articles</span>
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

                <p className={styles.modalDescription}>
                  Tell us what you need help with regarding Fraud
                  Watch and provide as much detail as possible.
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
                      placeholder="Describe your Fraud Watch question or issue..."
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