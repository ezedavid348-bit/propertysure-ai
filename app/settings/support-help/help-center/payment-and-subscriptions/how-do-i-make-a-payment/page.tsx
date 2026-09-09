"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./how-do-i-make-a-payment.module.css";

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
PATHS
============================================================
*/

const basePath =
  "/settings/support-help/help-center/payment-and-subscriptions";

const paymentSubscriptionsPath =
  "/settings/support-help/help-center/payment-and-subscriptions";

/*
============================================================
PAGE
============================================================
*/

export default function MakePaymentArticle() {
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

  const currentIndex = 3;

  const currentArticle =
    paymentArticles[currentIndex];

  const previousArticle =
    paymentArticles[currentIndex - 1];

  const nextArticle =
    paymentArticles[currentIndex + 1];

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const goToPaymentSubscriptions = () => {
    router.push(
      paymentSubscriptionsPath
    );
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
        return paymentArticles;
      }

      return paymentArticles.filter(
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
            aria-label="Search Payment and Subscriptions help articles"
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
              Learn how to make a
              payment for PropertySure
              AI services and review
              important payment
              information before
              completing a transaction.
            </p>

            <button
              type="button"
              className={
                styles.backButton
              }
              onClick={
                goToPaymentSubscriptions
              }
            >
              <ArrowLeft
                size={17}
              />

              Back to Payment &
              Subscriptions
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
            id="make-payment"
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
                Making a payment on
                PropertySure AI allows
                you to pay for available
                subscriptions, property
                verification services, or
                other applicable services
                provided through the
                platform.
              </p>

              <p>
                Before completing a
                payment, make sure you
                have selected the correct
                service or subscription
                and reviewed the amount
                and payment information
                displayed during checkout.
              </p>

              <h2>
                How to Make a Payment
              </h2>

              <div
                id="steps"
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
                      Sign In to
                      PropertySure AI
                    </h3>

                    <p>
                      Sign in to your
                      PropertySure AI
                      account using your
                      registered account
                      credentials.
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
                      Select the Service
                      or Subscription
                    </h3>

                    <p>
                      Choose the PropertySure
                      AI subscription,
                      property verification
                      service, or other
                      applicable service you
                      want to pay for.
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
                      Review the Payment
                      Details
                    </h3>

                    <p>
                      Review the selected
                      service, subscription
                      plan, amount, and any
                      other payment details
                      displayed before
                      continuing.
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
                      Continue to
                      Checkout
                    </h3>

                    <p>
                      Select the payment
                      or checkout option to
                      continue with the
                      transaction.
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
                      Enter Your Payment
                      Information
                    </h3>

                    <p>
                      Provide the payment
                      information requested
                      by the available
                      payment processor and
                      follow the instructions
                      shown on the checkout
                      page.
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
                      Confirm the Payment
                    </h3>

                    <p>
                      Review the transaction
                      details one more time
                      and confirm the payment
                      when you are satisfied
                      that the information is
                      correct.
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
                      Check Your Payment
                      Status
                    </h3>

                    <p>
                      After completing the
                      transaction, check the
                      payment confirmation or
                      payment status displayed
                      by PropertySure AI.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  PAYMENT CONFIRMATION
              ================================================= */}

              <div
                id="payment-confirmation"
                className={
                  styles.successBox
                }
              >
                <div
                  className={
                    styles.successIcon
                  }
                >
                  <CreditCard
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Payment completed:
                  </strong>{" "}
                  When a payment is
                  successfully processed,
                  keep the confirmation or
                  transaction information
                  provided by PropertySure AI
                  for your records.
                </p>
              </div>

              {/* =================================================
                  WHAT TO CHECK
              ================================================= */}

              <h2 id="what-to-check">
                What to Check Before
                Paying
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

                  Confirm that you have
                  selected the correct
                  subscription or service.
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

                  Review the amount
                  displayed before
                  confirming the payment.
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

                  Make sure your payment
                  information is entered
                  correctly.
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

                  Use only the official
                  PropertySure AI payment
                  or checkout process.
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

                  Keep your payment
                  confirmation or
                  transaction reference
                  after completing the
                  payment.
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
                  Do not make repeated
                  payments if your payment
                  appears delayed or the
                  status is unclear. First
                  check your payment status
                  and transaction information
                  before attempting another
                  payment.
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
            {/* =================================================
                PREVIOUS ARTICLE
            ================================================= */}

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

            {/* =================================================
                NEXT ARTICLE
            ================================================= */}

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
                    "make-payment"
                  )
                }
              >
                <span
                  className={
                    styles.activeDot
                  }
                />

                How to Make a Payment
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "steps"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Payment Steps
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "payment-confirmation"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Payment Confirmation
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "what-to-check"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                What to Check
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