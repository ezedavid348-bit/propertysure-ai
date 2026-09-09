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
  AlertTriangle,
} from "lucide-react";

import styles from "./what-should-i-do-if-my-payment-fails.module.css";

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

export default function PaymentFailedArticle() {
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

  const currentIndex = 5;

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
              Learn what to do when a
              PropertySure AI payment
              fails and how to safely
              check the payment status
              before trying again.
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
            id="payment-failed"
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
                A payment may sometimes
                fail because of an issue
                with the payment method,
                insufficient funds, incorrect
                payment information, a
                temporary issue with the
                payment processor, or another
                reason affecting the
                transaction.
              </p>

              <p>
                If your payment fails, do
                not immediately make another
                payment. First check the
                payment status and review
                the information provided
                during the transaction.
              </p>

              <h2>
                What to Do When a Payment
                Fails
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
                      Check the Payment
                      Status
                    </h3>

                    <p>
                      Check your account,
                      payment page, or
                      transaction history to
                      determine whether the
                      payment is marked as
                      failed, pending, or
                      completed.
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
                      Review the Payment
                      Information
                    </h3>

                    <p>
                      Check the payment
                      information you entered
                      and make sure the
                      relevant details are
                      correct.
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
                      Check Your Payment
                      Method
                    </h3>

                    <p>
                      Make sure your selected
                      payment method is
                      available and can be
                      used for the transaction.
                      Check with your bank or
                      payment provider if
                      necessary.
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
                      Check for a Temporary
                      Payment Issue
                    </h3>

                    <p>
                      A payment may fail
                      because of a temporary
                      issue with the payment
                      processor or your
                      financial institution.
                      If appropriate, wait a
                      short period before
                      attempting the transaction
                      again.
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
                      Confirm That No
                      Successful Payment
                      Was Made
                    </h3>

                    <p>
                      Before trying again,
                      review your transaction
                      history or payment
                      confirmation to make
                      sure the previous
                      transaction was not
                      successfully completed.
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
                      Try the Payment Again
                      When Appropriate
                    </h3>

                    <p>
                      If the transaction was
                      confirmed as unsuccessful
                      and the issue has been
                      resolved, you may try the
                      payment again using the
                      available payment process.
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
                      Contact Support if the
                      Problem Continues
                    </h3>

                    <p>
                      If your payment continues
                      to fail or the payment
                      status remains unclear,
                      contact PropertySure AI
                      support for assistance.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  PAYMENT FAILED
              ================================================= */}

              <div
                id="payment-status"
                className={
                  styles.successBox
                }
              >
                <div
                  className={
                    styles.successIcon
                  }
                >
                  <AlertTriangle
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Check the status first:
                  </strong>{" "}
                  A failed payment does not
                  always mean you should
                  immediately try again.
                  Confirm the transaction
                  status before making another
                  payment.
                </p>
              </div>

              {/* =================================================
                  COMMON REASONS
              ================================================= */}

              <h2 id="common-reasons">
                Common Reasons a Payment
                May Fail
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

                  Incorrect or incomplete
                  payment information.
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

                  Insufficient funds or
                  another restriction from
                  the payment provider.
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

                  A payment method that
                  cannot complete the
                  transaction.
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

                  A temporary issue with
                  the payment processor or
                  financial institution.
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

                  A transaction that
                  requires additional
                  verification or
                  authorisation.
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
                  Never make repeated
                  payments simply because
                  the first payment appears
                  to have failed. Always
                  confirm the transaction
                  status first. If money has
                  been deducted but the
                  payment is not reflected in
                  your PropertySure AI account,
                  contact support before making
                  another payment.
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
                    "payment-failed"
                  )
                }
              >
                <span
                  className={
                    styles.activeDot
                  }
                />

                What to Do When Payment
                Fails
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

                Payment Failure Steps
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "payment-status"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Check Payment Status
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "common-reasons"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Common Reasons
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