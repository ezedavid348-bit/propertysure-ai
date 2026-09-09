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
  CreditCard,
} from "lucide-react";

import styles from "./need-more-help.module.css";

type Article = {
  title: string;
  slug: string;
};

/*
============================================================
PAYMENT & SUBSCRIPTIONS ARTICLES
============================================================
*/

const paymentArticles: Article[] = [
  {
    title: "How do I view my subscription plan?",
    slug: "how-do-i-view-my-subscription-plan",
  },
  {
    title: "How do I choose a PropertySure AI plan?",
    slug: "how-do-i-choose-a-propertysure-ai-plan",
  },
  {
    title: "How do I subscribe to a PropertySure AI plan?",
    slug: "how-do-i-subscribe-to-a-propertysure-ai-plan",
  },
  {
    title: "How do I make a payment?",
    slug: "how-do-i-make-a-payment",
  },
  {
    title: "How do I view my payment and billing history?",
    slug: "how-do-i-view-my-payment-and-billing-history",
  },
  {
    title: "What should I do if my payment fails?",
    slug: "what-should-i-do-if-my-payment-fails",
  },
  {
    title: "How do I manage or cancel my subscription?",
    slug: "how-do-i-manage-or-cancel-my-subscription",
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
  "/settings/support-help/help-center/payment-and-subscriptions";

/*
============================================================
PAGE
============================================================
*/

export default function PaymentNeedMoreHelpPage() {
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
    paymentArticles.length - 1;

  const previousArticle =
    paymentArticles[currentIndex - 1];

  /* =========================================================
     ROUTES
  ========================================================= */

  const goToPaymentSubscriptions = () => {
    router.push(basePath);
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
      return paymentArticles;
    }

    return paymentArticles.filter(
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
      goToPaymentSubscriptions();
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
            placeholder="Search Payment & Subscriptions articles, guides, and topics"
            aria-label="Search Payment and Subscriptions help articles"
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
              <CreditCard size={15} />

              Payment &amp;
              Subscriptions Support
            </div>

            <h1>
              Need More Help?
            </h1>

            <p>
              We&apos;re here to help you
              manage your PropertySure AI
              subscription, understand
              payments and billing, and
              resolve issues that may occur
              during your payment journey.
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
                goToPaymentSubscriptions
              }
            >
              <ArrowLeft size={16} />

              Back to Payment &amp;
              Subscriptions
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
                If you need help choosing
                a plan, subscribing,
                making a payment, checking
                your billing history,
                managing your subscription,
                or resolving a failed
                payment, our support team
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
                  Get help with your
                  subscription, payment,
                  billing history, failed
                  payment, plan selection,
                  or another payment-related
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

              {/* PAYMENT ARTICLES */}

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
                  Browse Payment Articles
                </h3>

                <p>
                  Review guides covering
                  subscription plans,
                  payments, billing history,
                  failed payments, and
                  subscription management.
                </p>

                <button
                  type="button"
                  className={
                    styles.outlineButton
                  }
                  onClick={
                    goToPaymentSubscriptions
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
                  PropertySure AI plans,
                  payments, billing,
                  subscriptions, and
                  cancellations.
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
                    questions about Payment
                    &amp; Subscriptions.
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
                    How do I view my
                    subscription plan?
                  </summary>

                  <p>
                    Sign in to your
                    PropertySure AI account
                    and open the area where
                    your subscription and
                    billing information is
                    managed. You can review
                    your current plan and
                    available subscription
                    details there.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I choose a
                    PropertySure AI plan?
                  </summary>

                  <p>
                    Review the available
                    PropertySure AI plans
                    and compare the services
                    and features included
                    with each plan before
                    selecting the option that
                    best meets your needs.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I subscribe to a
                    PropertySure AI plan?
                  </summary>

                  <p>
                    Select your preferred
                    plan and follow the
                    subscription and payment
                    instructions displayed
                    by PropertySure AI.
                  </p>
                </details>

                <details>
                  <summary>
                    What should I do if my
                    payment fails?
                  </summary>

                  <p>
                    Check the payment details
                    you provided and make sure
                    the payment method is
                    available for use. If the
                    payment continues to fail,
                    contact PropertySure AI
                    support for assistance.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I view my payment
                    and billing history?
                  </summary>

                  <p>
                    Open the payment or
                    billing section of your
                    PropertySure AI account
                    to review the payment and
                    billing information
                    available to you.
                  </p>
                </details>

                <details>
                  <summary>
                    How do I manage or cancel
                    my subscription?
                  </summary>

                  <p>
                    Open your subscription
                    management area and review
                    the available options.
                    Follow the displayed
                    instructions if you want
                    to change or cancel your
                    subscription.
                  </p>
                </details>

                <details>
                  <summary>
                    Will cancelling my
                    subscription automatically
                    close my account?
                  </summary>

                  <p>
                    Subscription cancellation
                    and account closure are
                    separate actions unless
                    PropertySure AI explicitly
                    states otherwise. Always
                    review your subscription
                    status after completing a
                    cancellation.
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
              your payment or subscription
              concern faster.
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
                <CreditCard
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
                    available.
                  </span>
                </div>

                <div>
                  <CheckCircle2
                    size={17}
                  />

                  <span>
                    Explain whether the
                    issue concerns your
                    plan, payment, billing,
                    or subscription.
                  </span>
                </div>

                <div>
                  <CheckCircle2
                    size={17}
                  />

                  <span>
                    Describe what you were
                    trying to do and what
                    happened.
                  </span>
                </div>

                <div>
                  <CheckCircle2
                    size={17}
                  />

                  <span>
                    Provide relevant payment
                    or subscription
                    information when
                    requested.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              PRIVACY
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
                Protect your account.
              </strong>{" "}
              Never share your password,
              authentication codes, card
              PIN, or other sensitive
              security credentials when
              contacting support. Only
              provide the information
              necessary to help resolve your
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
                your PropertySure AI plan,
                payments, billing history,
                subscription, or other
                payment-related concerns.
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
                  goToPaymentSubscriptions
                }
              >
                <span>
                  Payment &amp;
                  Subscriptions Overview
                </span>

                <ExternalLink
                  size={14}
                />
              </button>

              <button
                type="button"
                onClick={
                  goToPaymentSubscriptions
                }
              >
                <span>
                  Browse Payment Articles
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
                  PropertySure AI plan,
                  payment, billing,
                  subscription, or
                  cancellation.
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
                      placeholder="Describe your payment, billing, subscription, or account issue..."
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
                  Your request has been
                  recorded.
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