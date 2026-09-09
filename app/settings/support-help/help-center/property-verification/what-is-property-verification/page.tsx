"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./what-is-property-verification.module.css";

type Article = {
  title: string;
  slug: string;
};

/*
============================================================
PROPERTY VERIFICATION ARTICLES
============================================================

The Property Verification landing page is NOT included
inside this article list because it is the category page.

The first actual article is:
What is Property Verification?

============================================================
*/

const verificationArticles: Article[] = [
  {
    title: "What is Property Verification?",
    slug: "what-is-property-verification",
  },
  {
    title: "Why Verify a Property?",
    slug: "why-verify",
  },
  {
    title: "How It Works (Overview)",
    slug: "how-it-works",
  },
  {
    title: "What You Can Verify",
    slug: "what-you-can-verify",
  },
  {
    title: "What Happens After You Verify",
    slug: "what-happens-after-you-verify",
  },
  {
    title: "What You Can't Verify",
    slug: "what-you-cant-verify",
  },
  {
    title: "Verification Results",
    slug: "verification-results",
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
  "/settings/support-help/help-center/property-verification";

const helpCenterPath =
  "/settings/support-help/help-center";

/*
============================================================
CATEGORY LANDING PAGE
============================================================

This is the page that comes BEFORE the first article.

URL:

/settings/support-help/help-center/property-verification

============================================================
*/

const categoryPage: Article = {
  title: "Property Verification",
  slug: "",
};

/*
============================================================
PAGE
============================================================
*/

export default function WhatIsPropertyVerificationArticle() {
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

  const currentIndex = 0;

  const currentArticle =
    verificationArticles[currentIndex];

  /*
  ============================================================
  PREVIOUS / NEXT
  ============================================================

  IMPORTANT:

  The first article has no previous ARTICLE inside the
  article list.

  However, the Property Verification category landing page
  comes immediately before it.

  Therefore:

  Previous = Property Verification category page
  Next = Why Verify a Property?

  ============================================================
  */

  const previousArticle =
    currentIndex === 0
      ? categoryPage
      : verificationArticles[currentIndex - 1];

  const nextArticle =
    verificationArticles[currentIndex + 1];

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const goToHelpCenter = () => {
    router.push(helpCenterPath);
  };

  const goToPropertyVerification = () => {
    router.push(basePath);
  };

  const goToArticle = (article: Article) => {
    /*
    The category landing page has an empty slug.

    When the slug is empty, go directly to:

    /property-verification

    instead of creating:

    /property-verification/
    */

    if (!article.slug) {
      router.push(basePath);
      return;
    }

    router.push(
      `${basePath}/${article.slug}`
    );
  };

  const goToPreviousArticle = () => {
    if (!previousArticle) return;

    goToArticle(previousArticle);
  };

  const goToNextArticle = () => {
    if (!nextArticle) return;

    goToArticle(nextArticle);
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
      document.getElementById(sectionId);

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

  const filteredArticles = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return verificationArticles;
    }

    return verificationArticles.filter(
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
        className={styles.topHeader}
      >
        <div
          className={styles.searchBox}
        >
          <svg
            className={styles.searchIcon}
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
            aria-label="Search Property Verification help articles"
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
        className={styles.layout}
      >
        {/* ===================================================
            MAIN ARTICLE
        =================================================== */}

        <article
          className={styles.article}
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
              Learn what PropertySure AI
              Property Verification is, why
              it matters, and how it helps
              you make more informed property
              decisions.
            </p>

            {/* =================================================
                BACK TO PROPERTY VERIFICATION
            ================================================= */}

            <button
              type="button"
              className={
                styles.backButton
              }
              onClick={
                goToPropertyVerification
              }
            >
              <ArrowLeft
                size={17}
              />

              Back to Property Verification
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
            id="property-verification"
            className={
              styles.contentCard
            }
          >
            <div
              className={
                styles.contentText
              }
            >
              {/* =================================================
                  INTRODUCTION
              ================================================= */}

              <p
                className={
                  styles.mainParagraph
                }
              >
                Property Verification is
                PropertySure AI&apos;s core
                service for helping users
                assess property documents and
                information before making an
                important real estate decision.
              </p>

              <p>
                When you submit a property for
                verification, PropertySure AI
                evaluates the information and
                documents provided through its
                verification process. The goal
                is to help identify potential
                inconsistencies, authenticity
                concerns, ownership risks, and
                other issues that may require
                further investigation.
              </p>

              <p>
                Property verification is
                particularly important because
                property transactions can involve
                significant financial commitments.
                Reviewing the available information
                before proceeding can help you make
                a more informed decision.
              </p>

              {/* =================================================
                  WHAT PROPERTY VERIFICATION HELPS WITH
              ================================================= */}

              <h2 id="what-it-does">
                What Does Property Verification
                Help With?
              </h2>

              <div
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
                      Document Review
                    </h3>

                    <p>
                      PropertySure AI reviews
                      the property documents
                      submitted as part of the
                      verification request and
                      checks them for relevant
                      information, consistency,
                      and potential warning
                      signs.
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
                      Risk Identification
                    </h3>

                    <p>
                      The verification process
                      can help identify potential
                      fraud indicators,
                      inconsistencies, missing
                      information, or other
                      issues that may require
                      additional attention.
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
                      Verification Assessment
                    </h3>

                    <p>
                      The information available
                      from the verification process
                      is assessed to help provide
                      a clearer picture of the
                      property and the risks that
                      may be associated with the
                      submitted information.
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
                      Verification Report
                    </h3>

                    <p>
                      The results of the
                      verification process can be
                      presented in a structured
                      verification report that
                      helps you understand the
                      findings before proceeding
                      with a property transaction.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  WHY IT MATTERS
              ================================================= */}

              <div
                id="why-it-matters"
                className={
                  styles.successBox
                }
              >
                <div
                  className={
                    styles.successIcon
                  }
                >
                  <ShieldCheck
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Why it matters:
                  </strong>{" "}
                  Property verification can
                  help reduce uncertainty before
                  you commit money to a property.
                  It provides a structured way to
                  review available information
                  and identify issues that may
                  deserve further investigation.
                </p>
              </div>

              {/* =================================================
                  WHO CAN USE PROPERTY VERIFICATION
              ================================================= */}

              <h2 id="who-can-use">
                Who Can Use Property
                Verification?
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

                  Property buyers who want
                  to perform due diligence
                  before purchasing.
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

                  Investors assessing a
                  property before committing
                  funds.
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

                  Diaspora buyers who need
                  additional confidence when
                  evaluating property remotely.
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

                  Property sellers and
                  professionals who want
                  supporting verification
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

                  Real estate professionals
                  conducting property
                  due-diligence activities.
                </li>
              </ul>

              {/* =================================================
                  DOCUMENT PACKAGE
              ================================================= */}

              <h2 id="documents">
                What Can Be Submitted?
              </h2>

              <p>
                A property verification request
                may involve a complete document
                package rather than a single
                document. Depending on the
                property and the information
                available, the package may include
                documents such as a Certificate of
                Occupancy, Deed of Assignment,
                Survey Plan, Allocation Letter, or
                other supporting ownership and
                property documents.
              </p>

              <p>
                Providing the relevant documents
                and information available to you
                can help create a more complete
                basis for the verification process.
              </p>

              {/* =================================================
                  WHAT VERIFICATION DOES NOT MEAN
              ================================================= */}

              <h2 id="limitations">
                What Property Verification
                Does Not Mean
              </h2>

              <p>
                A verification result should not
                be interpreted as a guarantee that
                a property transaction is completely
                free from risk. Property transactions
                can involve legal, governmental,
                physical, financial, and other
                considerations that may require
                additional professional due diligence.
              </p>

              <p>
                Where appropriate, users should
                obtain independent advice from
                qualified property lawyers,
                surveyors, engineers, or other
                relevant professionals.
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
                  PropertySure AI&apos;s
                  verification process is
                  designed to support property
                  due diligence and informed
                  decision-making. Always review
                  the verification report carefully
                  and seek additional professional
                  or legal advice where necessary
                  before completing a property
                  transaction.
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
                PREVIOUS
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
                NEXT
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
                    "property-verification"
                  )
                }
              >
                <span
                  className={
                    styles.activeDot
                  }
                />

                Property Verification
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "what-it-does"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                What It Helps With
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "why-it-matters"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Why It Matters
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "who-can-use"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                Who Can Use It?
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "documents"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                What Can Be Submitted?
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "limitations"
                  )
                }
              >
                <span
                  className={
                    styles.articleDot
                  }
                />

                What It Does Not Mean
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
                  aria-label="Yes, this article was helpful"
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
                  aria-label="No, this article was not helpful"
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
            {/* =================================================
                PREVIOUS
            ================================================= */}

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

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div
              className={
                styles.sideDivider
              }
            />

            {/* =================================================
                NEXT
            ================================================= */}

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