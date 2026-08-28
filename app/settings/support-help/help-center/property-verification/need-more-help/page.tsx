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
} from "lucide-react";

import styles from "./need-more-help.module.css";

export default function NeedMoreHelpArticle() {
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

  const goToHelpCenter = () => {
    router.push("/settings/support-help/help-center");
  };

  const goToVerificationResults = () => {
    router.push(
      "/settings/support-help/help-center/property-verification/verification-results"
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

    goToHelpCenter();
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
            placeholder="Search for articles, guides, and topics"
            aria-label="Search help articles"
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
            <h1>Need More Help?</h1>

            <p>
              We&apos;re here to support you. If you have any
              questions or need personalized assistance, our
              team is ready to help.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={goToHelpCenter}
            >
              <ArrowLeft size={16} />
              Back to Help Center
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
              <h2>We&apos;re Here for You</h2>

              <p>
                Whether you have a question about verification,
                your report, or your account, our support team
                is here to make things easier.
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
              Choose the option that works best for you.
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
                  Get help from our support team for questions
                  about verification, reports, or your account.
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

              {/* HELP CENTER */}

              <div className={styles.helpCard}>
                <div
                  className={`${styles.helpIcon} ${styles.greenIcon}`}
                >
                  <BookOpen size={27} />
                </div>

                <h3>Browse Help Center</h3>

                <p>
                  Explore articles and guides for step-by-step
                  help and answers to common questions.
                </p>

                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={goToHelpCenter}
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
                  PropertySure AI verification.
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
                    PropertySure AI verification.
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
                    How does PropertySure AI verification work?
                  </summary>

                  <p>
                    PropertySure AI reviews the submitted
                    property information and document package,
                    performs applicable checks, and presents
                    the findings in a verification report.
                  </p>
                </details>

                <details>
                  <summary>
                    What happens if some information cannot be
                    verified?
                  </summary>

                  <p>
                    Information that cannot be confirmed from
                    available sources is clearly identified as a
                    limitation in the verification report.
                  </p>
                </details>

                <details>
                  <summary>
                    Can I review my verification report again?
                  </summary>

                  <p>
                    Your verification information and report are
                    made available through your account so you
                    can review the findings.
                  </p>
                </details>

                <details>
                  <summary>
                    Does verification replace professional
                    legal or surveying advice?
                  </summary>

                  <p>
                    No. Property verification is a
                    due-diligence service and does not replace
                    appropriate professional legal, surveying,
                    engineering, or other specialist advice.
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
              These quick tips can help us assist you faster.
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
                    Include your verification report or
                    reference number, if available.
                  </span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>
                    Provide as much detail as possible about
                    your question.
                  </span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>
                    Screenshots or supporting documents can help
                    us understand better.
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
              We take your privacy seriously. Your information
              will only be used to assist you and will not be
              shared without your permission.
            </p>
          </section>

          {/* =================================================
              BOTTOM NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>
            <button
              type="button"
              className={styles.previousBottom}
              onClick={goToVerificationResults}
            >
              <ArrowLeft size={20} />

              <span>
                <small>Previous Article</small>

                <strong>Verification Results</strong>
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
              onClick={goToVerificationResults}
            >
              <ArrowLeft size={16} />

              <span>
                <small>Previous Article</small>

                <strong>Verification Results</strong>
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
                Our support team is available to help with your
                questions.
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
                onClick={goToHelpCenter}
              >
                <span>Property Verification Overview</span>
                <ExternalLink size={14} />
              </button>

              <button
                type="button"
                onClick={goToVerificationResults}
              >
                <span>Understanding Your Report</span>
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
                  Tell us what you need help with and provide
                  as much detail as possible.
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
                      placeholder="Describe your question or issue..."
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