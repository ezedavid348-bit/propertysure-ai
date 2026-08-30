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
  FileText,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  X,
  Send,
  ClipboardList,
} from "lucide-react";

import styles from "../../account-security/need-more-help/need-more-help.module.css";

type Article = {
  title: string;
  slug: string;
};

const reportsHistoryArticles: Article[] = [
  {
    title: "How do I view my verification reports?",
    slug: "how-do-i-view-my-verification-reports",
  },
  {
    title: "How do I download a verification report?",
    slug: "how-do-i-download-a-verification-report",
  },
  {
    title: "How do I understand my verification report?",
    slug: "how-do-i-understand-my-verification-report",
  },
  {
    title: "How do I view my verification history?",
    slug: "how-do-i-view-my-verification-history",
  },
  {
    title: "How do I search my verification history?",
    slug: "how-do-i-search-my-verification-history",
  },
  {
    title: "How do I check the status of a verification?",
    slug: "how-do-i-check-the-status-of-a-verification",
  },
  {
    title: "How do I review verification findings?",
    slug: "how-do-i-review-verification-findings",
  },
  {
    title: "How do I view verification statistics?",
    slug: "how-do-i-view-verification-statistics",
  },
  {
    title: "How do I verify a report is complete?",
    slug: "how-do-i-verify-a-report-is-complete",
  },
  {
    title: "Need More Help?",
    slug: "need-more-help",
  },
];

const basePath =
  "/settings/support-help/help-center/reports-history";

export default function ReportsHistoryNeedMoreHelpPage() {
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

  const currentIndex = reportsHistoryArticles.length - 1;

  const previousArticle =
    reportsHistoryArticles[currentIndex - 1];

  /* =========================================================
     ROUTES
  ========================================================= */

  const goToReportsHistory = () => {
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
      return reportsHistoryArticles;
    }

    return reportsHistoryArticles.filter((article) =>
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
      goToReportsHistory();
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
            placeholder="Search Reports & History articles, guides, and topics"
            aria-label="Search Reports & History help articles"
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
        <article className={styles.article}>
          {/* =================================================
              HEADER
          ================================================= */}

          <header className={styles.articleHeader}>
            <div className={styles.categoryLabel}>
              <ClipboardList size={15} />
              Reports &amp; History Support
            </div>

            <h1>Need More Help?</h1>

            <p>
              We&apos;re here to help you understand,
              review, and manage your PropertySure AI
              verification reports and history.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={goToReportsHistory}
            >
              <ArrowLeft size={16} />
              Back to Reports &amp; History
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
                If you need assistance finding a verification
                report, understanding verification findings,
                checking verification status, or reviewing
                your Reports &amp; History activity, our
                support team is ready to assist you.
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
                  Get help with a verification report,
                  verification status, findings, history, or
                  another Reports &amp; History concern.
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

              {/* REPORTS & HISTORY */}

              <div className={styles.helpCard}>
                <div
                  className={`${styles.helpIcon} ${styles.blueIcon}`}
                >
                  <FileText size={27} />
                </div>

                <h3>Browse Reports &amp; History</h3>

                <p>
                  Review articles about verification reports,
                  downloads, verification history, status,
                  findings, and statistics.
                </p>

                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={goToReportsHistory}
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
                  verification reports, findings, status, and
                  your verification history.
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
                    PropertySure AI Reports &amp; History.
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
                    How do I view my verification reports?
                  </summary>

                  <p>
                    Open Reports &amp; History from your
                    PropertySure AI account and select the
                    verification record you want to review.
                    Completed verifications can provide access
                    to the available report.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I check the status of a verification?
                  </summary>

                  <p>
                    Open the relevant verification in Reports
                    &amp; History and review the status shown
                    for that verification. The status indicates
                    the current stage of the verification
                    process.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I review verification findings?
                  </summary>

                  <p>
                    Open the completed verification report and
                    review the findings and supporting
                    information provided in the report. If a
                    finding requires clarification, consider
                    obtaining additional documentation or
                    qualified professional advice.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I download a verification report?
                  </summary>

                  <p>
                    Open the completed verification from
                    Reports &amp; History and use the available
                    Download option on the report view to save
                    a copy for your records.
                  </p>
                </details>

                <details>
                  <summary>
                    What should I do if a report appears
                    incomplete?
                  </summary>

                  <p>
                    First confirm that the verification has
                    completed and review the report for any
                    missing or unclear information. If the
                    report still appears incomplete, contact
                    PropertySure AI support for assistance.
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
              understand your Reports &amp; History concern
              faster.
            </p>

            <div className={styles.preContactBox}>
              <div className={styles.preContactIcon}>
                <BookOpen size={30} />
              </div>

              <div className={styles.checkList}>
                <div>
                  <CheckCircle2 size={17} />

                  <span>
                    Have the property verification or report
                    you need help with ready.
                  </span>
                </div>

                <div>
                  <CheckCircle2 size={17} />

                  <span>
                    Explain whether your concern relates to a
                    report, status, finding, history, or
                    download.
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
                    Screenshots or relevant report information
                    may help us understand the issue.
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
              contacting support. Only provide the report or
              verification information necessary to help
              resolve your request.
            </p>
          </section>

          {/* =================================================
              BOTTOM NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>
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

        {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

        <aside className={styles.rightSidebar}>
          {/* IN THIS ARTICLE */}

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

          {/* FEEDBACK */}

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

          {/* ARTICLE NAVIGATION */}

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

            <div className={styles.lastArticle}>
              <small>Next Article</small>

              <strong>—</strong>
            </div>
          </section>

          {/* SUPPORT CARD */}

          <section className={styles.supportCard}>
            <div className={styles.supportIcon}>
              <Headphones size={27} />
            </div>

            <div>
              <h3>Still need help?</h3>

              <p>
                Our support team is available to help with
                verification reports, findings, status,
                history, and other Reports &amp; History
                concerns.
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

          {/* HELPFUL RESOURCES */}

          <section className={styles.sideCard}>
            <h3>Helpful Resources</h3>

            <div className={styles.resourceList}>
              <button
                type="button"
                onClick={goToReportsHistory}
              >
                <span>
                  Reports &amp; History Overview
                </span>

                <ExternalLink size={14} />
              </button>

              <button
                type="button"
                onClick={goToReportsHistory}
              >
                <span>
                  Browse Reports &amp; History Articles
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
                  className={styles.modalDescription}
                >
                  Tell us what you need help with regarding
                  your PropertySure AI verification reports,
                  history, status, or findings.
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
                      placeholder="Describe your report, verification status, finding, history, or other issue..."
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