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

import styles from "./how-do-i-choose-a-propertysure-ai-plan.module.css";

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

export default function ChoosePropertySureAIPlanArticle() {
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

  const currentIndex = 1;

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
              Learn about choosing a
              PropertySure AI plan and
              selecting the option that
              best suits your verification
              needs.
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
            id="choose-plan"
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
                PropertySure AI may offer
                different subscription
                options designed for
                different verification
                and due-diligence needs.
                Choosing the right plan
                helps you access the
                services and features that
                are appropriate for how you
                intend to use the platform.
              </p>

              <p>
                Before selecting a plan,
                review the available
                options carefully and
                consider the type of
                property verification
                activity you expect to
                perform.
              </p>

              <h2>
                How to Choose a
                PropertySure AI Plan
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
                      Open the Plans or
                      Subscription Area
                    </h3>

                    <p>
                      Navigate to the
                      section where available
                      PropertySure AI plans
                      and subscription
                      information are displayed.
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
                      Review the Available
                      Plans
                    </h3>

                    <p>
                      Compare the available
                      plans and review the
                      services, features,
                      verification limits,
                      billing information,
                      and other details shown
                      for each option.
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
                      Consider Your
                      Verification Needs
                    </h3>

                    <p>
                      Consider how frequently
                      you expect to verify
                      properties and which
                      PropertySure AI features
                      or services you are likely
                      to use.
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
                      Select the Plan That
                      Fits Your Needs
                    </h3>

                    <p>
                      Choose the available
                      plan that provides the
                      services and features
                      that best match your
                      expected property
                      verification activity.
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
                      Review Before
                      Continuing
                    </h3>

                    <p>
                      Before continuing to
                      payment or activation,
                      review the selected plan,
                      pricing, billing terms,
                      and included services to
                      make sure they match your
                      expectations.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  PLAN SELECTION
              ================================================= */}

              <div
                id="plan-selection"
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
                    Choose carefully:
                  </strong>{" "}
                  Select a PropertySure AI
                  plan based on the services
                  and features you actually
                  need. Review the plan
                  information before
                  continuing to payment or
                  subscription activation.
                </p>
              </div>

              {/* =================================================
                  WHAT TO COMPARE
              ================================================= */}

              <h2 id="what-to-compare">
                What to Compare
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

                  Review the price or
                  subscription cost shown
                  for each available plan.
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

                  Compare the services and
                  features included with each
                  plan.
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

                  Check any verification
                  limits or usage allowances
                  associated with the plan.
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

                  Review billing frequency
                  and any applicable renewal
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

                  Make sure the selected plan
                  matches your expected
                  property verification needs.
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
                  Plan availability, pricing,
                  features, limits, and
                  billing terms may change.
                  Always review the information
                  displayed by PropertySure AI
                  at the time you select a plan
                  before completing your
                  subscription.
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
                    "choose-plan"
                  )
                }
              >
                <span
                  className={
                    styles.activeDot
                  }
                />

                How to Choose Your
                Plan
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

                Plan Selection Steps
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "plan-selection"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Plan Selection
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "what-to-compare"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                What to Compare
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