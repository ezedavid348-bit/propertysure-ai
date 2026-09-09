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

import styles from "./how-do-i-manage-or-cancel-my-subscription.module.css";

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

export default function ManageCancelSubscriptionArticle() {
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

  const currentIndex = 6;

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
              Learn how to manage your
              PropertySure AI
              subscription, review your
              plan, and cancel your
              subscription when
              necessary.
            </p>

            {/* =================================================
                BACK TO PAYMENT & SUBSCRIPTIONS
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
            id="manage-subscription"
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
                Your PropertySure AI
                subscription can be
                managed through the
                account or subscription
                area available on the
                platform. Depending on
                the options available to
                your account, you may be
                able to review your plan,
                change your subscription,
                or cancel a subscription.
              </p>

              <p>
                Before making a change,
                review your current plan
                and any billing information
                associated with your
                account. This helps you
                understand the change you
                are making and avoid
                unexpected billing issues.
              </p>

              <h2>
                How to Manage or Cancel
                Your Subscription
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
                      Open Your Account
                      or Settings Area
                    </h3>

                    <p>
                      Open the account or
                      settings area where
                      your subscription and
                      billing information is
                      managed.
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
                      Open Subscription
                      Management
                    </h3>

                    <p>
                      Select the relevant
                      subscription or
                      payment section to
                      view the management
                      options available for
                      your account.
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
                      Review Your Current
                      Subscription
                    </h3>

                    <p>
                      Review your current
                      plan, subscription
                      status, billing
                      information, and any
                      available renewal or
                      plan-management
                      options.
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
                      Choose the Action
                      You Need
                    </h3>

                    <p>
                      If available, choose
                      the appropriate option
                      to change, upgrade,
                      downgrade, or otherwise
                      manage your subscription.
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
                      Cancel Your
                      Subscription
                    </h3>

                    <p>
                      If you want to cancel,
                      select the cancellation
                      option and carefully
                      follow the instructions
                      displayed by PropertySure
                      AI.
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
                      Confirm the Change
                    </h3>

                    <p>
                      Complete any
                      confirmation step
                      required to finalize
                      your subscription
                      change or cancellation.
                    </p>
                  </div>
                </div>

                {/* STEP 8 */}

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
                    8
                  </div>

                  <div
                    className={
                      styles.processContent
                    }
                  >
                    <h3>
                      Check Your
                      Subscription Status
                    </h3>

                    <p>
                      After making a
                      change, return to your
                      subscription information
                      and confirm that the
                      displayed status reflects
                      the action you completed.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  SUBSCRIPTION MANAGEMENT
              ================================================= */}

              <div
                id="subscription-management"
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
                    Review before you
                    confirm:
                  </strong>{" "}
                  Before changing or
                  cancelling your
                  subscription, carefully
                  review the plan,
                  subscription status, and
                  any information shown on
                  the confirmation screen.
                </p>
              </div>

              {/* =================================================
                  BEFORE CANCELLING
              ================================================= */}

              <h2 id="before-cancelling">
                Before Cancelling
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

                  Review your current
                  subscription plan.
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

                  Check your current
                  subscription status.
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

                  Review any available
                  billing or renewal
                  information.
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

                  Make sure you understand
                  what happens after
                  cancellation.
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

                  Save any important
                  billing or subscription
                  records you may need.
                </li>
              </ul>

              {/* =================================================
                  AFTER CANCELLATION
              ================================================= */}

              <h2 id="after-cancellation">
                After Cancelling
              </h2>

              <p>
                After completing the
                cancellation process,
                check your subscription
                information to confirm
                that the cancellation has
                been recorded. If your
                account continues to show
                an active subscription
                when you expected it to be
                cancelled, review the
                available billing
                information and contact
                PropertySure AI support if
                necessary.
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
                  Do not assume that closing
                  your account automatically
                  cancels a subscription.
                  Always use the available
                  subscription cancellation
                  process and confirm that
                  your subscription status has
                  been updated.
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
                    "manage-subscription"
                  )
                }
              >
                <span
                  className={
                    styles.activeDot
                  }
                />

                How to Manage or Cancel
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

                Subscription Steps
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "subscription-management"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Subscription Management
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "before-cancelling"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Before Cancelling
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "after-cancellation"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                After Cancelling
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