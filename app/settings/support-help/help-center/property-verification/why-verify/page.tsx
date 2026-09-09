"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ShieldCheck,
  FileWarning,
  UserX,
  Users,
  AlertTriangle,
  Home,
  Scale,
  Landmark,
  BadgeCheck,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./why-verify.module.css";

/*
============================================================
PAGE
============================================================
*/

export default function WhyVerifyPropertyArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const goToPropertyVerification = () => {
    router.push(
      "/settings/support-help/help-center/property-verification"
    );
  };

  const goToPreviousArticle = () => {
    router.push(
      "/settings/support-help/help-center/property-verification"
    );
  };

  const goToNextArticle = () => {
    router.push(
      "/settings/support-help/help-center/property-verification/how-it-works"
    );
  };

  /*
  ============================================================
  SECTION NAVIGATION
  ============================================================
  */

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /*
  ============================================================
  FEEDBACK
  ============================================================
  */

  const handleFeedback = (value: "yes" | "no") => {
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

      <header className={styles.topHeader}>
        <div className={styles.searchBox}>

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
            placeholder="Search for articles, guides, and topics"
            aria-label="Search help articles"
          />

        </div>
      </header>

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div className={styles.layout}>

        {/* ===================================================
            ARTICLE
        =================================================== */}

        <article className={styles.article}>

          {/* =================================================
              ARTICLE HEADER
          ================================================= */}

          <header className={styles.articleHeader}>

            <h1>
              Why Verify a Property?
            </h1>

            <p>
              Property verification helps you
              identify potential problems before
              you commit your money, time, or
              legal interests to a property.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={goToPropertyVerification}
            >
              <ArrowLeft size={17} />

              Back to Property Verification
            </button>

          </header>

          <div className={styles.divider} />

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <section
            id="why-verify"
            className={styles.contentCard}
          >

            <div className={styles.contentText}>

              {/* =================================================
                  INTRODUCTION
              ================================================= */}

              <p className={styles.mainParagraph}>
                A property can appear legitimate
                while important problems remain
                hidden in its documents, ownership
                history, or legal status.
              </p>

              <p>
                Verification gives you an
                additional layer of due diligence
                before you make a major property
                decision. It helps you understand
                what has been submitted, identify
                inconsistencies, and determine
                whether further professional
                investigation may be necessary.
              </p>

              {/* =================================================
                  WHAT COULD GO WRONG
              ================================================= */}

              <h2 id="what-could-go-wrong">
                What Could Go Wrong Without Verification?
              </h2>

              <p>
                Property transactions can involve
                significant financial and legal
                commitments. Failing to perform
                appropriate checks can expose you
                to avoidable risks.
              </p>

              <div
                id="verification-risks"
                className={styles.processList}
              >

                {/* RISK 1 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <FileWarning
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      Fake or Altered Documents
                    </h3>

                    <p>
                      A document may be forged,
                      altered, fabricated, or contain
                      information that does not match
                      available records.
                    </p>

                  </div>

                </div>

                {/* RISK 2 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <UserX
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      Unverified Ownership
                    </h3>

                    <p>
                      The person offering a property
                      for sale may not have the legal
                      authority or ownership rights
                      they claim to have.
                    </p>

                  </div>

                </div>

                {/* RISK 3 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <Users
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      Ownership Disputes
                    </h3>

                    <p>
                      Another individual, family,
                      organization, or party may have
                      competing claims over the same
                      property.
                    </p>

                  </div>

                </div>

                {/* RISK 4 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <AlertTriangle
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      Inconsistent Information
                    </h3>

                    <p>
                      Names, locations, measurements,
                      reference numbers, dates, or
                      other property details may not
                      agree across documents or
                      available records.
                    </p>

                  </div>

                </div>

                {/* RISK 5 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <Scale
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      Legal or Property Restrictions
                    </h3>

                    <p>
                      A property may be affected by
                      restrictions, disputes, liens,
                      court matters, or other
                      circumstances that could affect
                      a transaction.
                    </p>

                  </div>

                </div>

                {/* RISK 6 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <Users
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      Fraudulent Sellers or Agents
                    </h3>

                    <p>
                      Fraudsters may use genuine-looking
                      documents, false identities, or
                      misleading property information
                      to convince buyers to make
                      payments.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  WHAT VERIFICATION GIVES YOU
              ================================================= */}

              <h2 id="what-verification-gives-you">
                What Verification Gives You
              </h2>

              <p>
                Property verification does not
                guarantee that every possible issue
                has been eliminated. Instead, it
                provides a structured due-diligence
                process that can help you make a more
                informed decision.
              </p>

              <ul className={styles.checkList}>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  A clearer understanding of the
                  information and documents submitted
                  for the property.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Identification of inconsistencies
                  or potential warning signs that may
                  require further investigation.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Greater visibility into ownership,
                  property details, and available
                  verification information.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  A verification report that helps
                  you understand the findings before
                  making a major commitment.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  A documented verification record
                  that can be retained for your
                  records.
                </li>

              </ul>

              {/* =================================================
                  WHEN SHOULD YOU VERIFY
              ================================================= */}

              <h2 id="when-should-you-verify">
                When Should You Verify?
              </h2>

              <p>
                The best time to verify a property
                is before you make a significant
                financial or legal commitment.
              </p>

              <div
                id="verification-timing"
                className={styles.processList}
              >

                {/* TIMING 1 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <Home
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      Before Paying for a Property
                    </h3>

                    <p>
                      Verify the available property
                      information before transferring
                      money or committing to a purchase.
                    </p>

                  </div>

                </div>

                {/* TIMING 2 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <Landmark
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      Before Making a Major Investment
                    </h3>

                    <p>
                      Verify the available information
                      before committing substantial
                      funds to a property or development
                      project.
                    </p>

                  </div>

                </div>

                {/* TIMING 3 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <BadgeCheck
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      Before Signing an Agreement
                    </h3>

                    <p>
                      Review the property information
                      before signing a purchase,
                      assignment, or other property
                      agreement.
                    </p>

                  </div>

                </div>

                {/* TIMING 4 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <ShieldCheck
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      When Buying From an Unfamiliar Seller
                    </h3>

                    <p>
                      Additional due diligence is
                      particularly important when you
                      have limited knowledge of the
                      seller, agent, or property history.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  PROPERTYSURE AI
              ================================================= */}

              <div
                id="propertysure-protection"
                className={styles.successBox}
              >

                <div className={styles.successIcon}>
                  <ShieldCheck
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    PropertySure AI:
                  </strong>{" "}
                  PropertySure AI helps organize
                  property due diligence by analyzing
                  submitted information and documents,
                  identifying potential inconsistencies,
                  and presenting verification findings
                  in a structured report.
                </p>

              </div>

              {/* =================================================
                  IMPORTANT NOTE
              ================================================= */}

              <div
                id="important-note"
                className={styles.noteBox}
              >

                <div className={styles.noteIcon}>
                  <CheckCircle2
                    size={22}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Important:
                  </strong>{" "}
                  Property verification is a
                  due-diligence step and does not
                  replace professional legal, survey,
                  valuation, engineering, or other
                  expert advice. Where necessary,
                  seek qualified professionals and
                  conduct appropriate official checks
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
            className={styles.bottomNavigation}
          >

            <button
              type="button"
              className={styles.previousBottom}
              onClick={goToPreviousArticle}
            >

              <ArrowLeft
                className={styles.bottomPreviousArrow}
                size={19}
              />

              <span>

                <small>
                  Previous Article
                </small>

                <strong>
                  What is Property Verification?
                </strong>

              </span>

            </button>

            <button
              type="button"
              className={styles.nextBottom}
              onClick={goToNextArticle}
            >

              <span>

                <small>
                  Next Article
                </small>

                <strong>
                  How It Works (Overview)
                </strong>

              </span>

              <ArrowRight size={20} />

            </button>

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

            <h3>
              In this article
            </h3>

            <nav className={styles.articleNav}>

              <button
                type="button"
                className={styles.activeArticle}
                onClick={() =>
                  scrollToSection(
                    "why-verify"
                  )
                }
              >
                <span
                  className={styles.activeDot}
                />

                Why Verify
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "what-could-go-wrong"
                  )
                }
              >
                <span
                  className={styles.articleDot}
                />

                What Could Go Wrong?
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "what-verification-gives-you"
                  )
                }
              >
                <span
                  className={styles.articleDot}
                />

                What Verification Gives You
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "when-should-you-verify"
                  )
                }
              >
                <span
                  className={styles.articleDot}
                />

                When Should You Verify?
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
                  className={styles.articleDot}
                />

                Important Note
              </button>

            </nav>

          </section>

          {/* =================================================
              WAS THIS HELPFUL?
          ================================================= */}

          <section className={styles.sideCard}>

            <h3>
              Was this helpful?
            </h3>

            {feedback === null ? (

              <div className={styles.feedback}>

                <button
                  type="button"
                  onClick={() =>
                    handleFeedback("yes")
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
                    handleFeedback("no")
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
              className={styles.previousArticle}
              onClick={goToPreviousArticle}
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
                  What is Property Verification?
                </strong>

              </span>

            </button>

            <div
              className={
                styles.sideDivider
              }
            />

            <button
              type="button"
              className={styles.nextArticle}
              onClick={goToNextArticle}
            >

              <span>

                <small>
                  Next Article
                </small>

                <strong>
                  How It Works (Overview)
                </strong>

              </span>

              <ArrowRight
                className={
                  styles.sidebarNextArrow
                }
                size={17}
              />

            </button>

          </section>

        </aside>

      </div>

    </main>
  );
}