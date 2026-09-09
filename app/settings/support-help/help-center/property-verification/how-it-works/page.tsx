"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Upload,
  FileSearch,
  ShieldCheck,
  SearchCheck,
  FileCheck2,
  AlertTriangle,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./how-it-works.module.css";

/*
============================================================
PAGE
============================================================
*/

export default function HowItWorksArticle() {
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
      "/settings/support-help/help-center/property-verification/why-verify"
    );
  };

  const goToNextArticle = () => {
    router.push(
      "/settings/support-help/help-center/property-verification/what-you-can-verify"
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
              How It Works (Overview)
            </h1>

            <p>
              Learn how PropertySure AI's property
              verification process works from
              document submission to verification
              findings.
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
            id="how-it-works"
            className={styles.contentCard}
          >

            <div className={styles.contentText}>

              {/* =================================================
                  INTRODUCTION
              ================================================= */}

              <p className={styles.mainParagraph}>
                PropertySure AI is designed to help
                organize and simplify the property
                due-diligence process.
              </p>

              <p>
                You submit the available property
                information and document package,
                and the platform processes the
                information through a structured
                verification workflow. The result
                is a report that helps you understand
                the findings and identify areas that
                may require further investigation.
              </p>

              {/* =================================================
                  OVERVIEW
              ================================================= */}

              <h2 id="verification-process">
                The Verification Process
              </h2>

              <div
                id="verification-steps"
                className={styles.processList}
              >

                {/* STEP 1 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <Upload
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      1. Submit the Property Information
                    </h3>

                    <p>
                      Provide the relevant property
                      information and upload the available
                      document package for the property.
                      Depending on the verification
                      service, this may include documents
                      such as title documents, survey
                      information, allocation documents,
                      or other supporting records.
                    </p>

                  </div>

                </div>

                {/* STEP 2 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <FileSearch
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      2. Document Review and Analysis
                    </h3>

                    <p>
                      The submitted documents are
                      reviewed for relevant information,
                      consistency, completeness, and
                      potential warning signs. PropertySure
                      AI can help identify information that
                      may require closer attention.
                    </p>

                  </div>

                </div>

                {/* STEP 3 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <ShieldCheck
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      3. Verification Checks
                    </h3>

                    <p>
                      Where applicable, the submitted
                      information can be compared with
                      available records, sources, or
                      verification checks relevant to
                      the property and the service
                      requested.
                    </p>

                  </div>

                </div>

                {/* STEP 4 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <SearchCheck
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      4. Identify Potential Issues
                    </h3>

                    <p>
                      Potential inconsistencies,
                      missing information, unusual
                      details, or other warning signs
                      identified during the verification
                      process are highlighted for review.
                    </p>

                  </div>

                </div>

                {/* STEP 5 */}

                <div className={styles.processItem}>

                  <div className={styles.processNumber}>
                    <FileCheck2
                      size={17}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className={styles.processContent}>

                    <h3>
                      5. Verification Report
                    </h3>

                    <p>
                      The findings are organized into
                      a verification report that presents
                      relevant information, observations,
                      and identified issues in a clear
                      format.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  WHAT THE PROCESS HELPS WITH
              ================================================= */}

              <h2 id="what-we-check">
                What the Process Helps You Understand
              </h2>

              <ul className={styles.checkList}>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Whether the submitted property
                  information is consistent across the
                  available documents.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Whether important information appears
                  to be missing or requires further review.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  Whether potential inconsistencies or
                  warning signs have been identified.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  What information may require additional
                  professional or official investigation.
                </li>

                <li>
                  <span>
                    <Check
                      size={11}
                      strokeWidth={2.5}
                    />
                  </span>

                  The overall findings available from
                  the verification process.
                </li>

              </ul>

              {/* =================================================
                  DOCUMENT PACKAGE
              ================================================= */}

              <h2 id="document-package">
                The Property Document Package
              </h2>

              <p>
                Property verification should be
                considered across the relevant
                document package rather than relying
                on a single document alone.
              </p>

              <p>
                Depending on the property and the
                verification service requested, the
                package may contain multiple documents,
                such as a Deed of Assignment, Certificate
                of Occupancy, Survey Plan, Allocation
                Letter or other supporting property
                records.
              </p>

              {/* =================================================
                  IMPORTANT VERIFICATION PRINCIPLE
              ================================================= */}

              <div
                id="verification-principle"
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
                    Important verification principle:
                  </strong>{" "}
                  PropertySure AI considers the
                  information available across the
                  submitted property package. Reviewing
                  multiple documents together can provide
                  a more useful picture than examining one
                  document in isolation.
                </p>

              </div>

              {/* =================================================
                  WHAT HAPPENS AFTER VERIFICATION
              ================================================= */}

              <h2 id="after-verification">
                What Happens After Verification?
              </h2>

              <p>
                After the verification process is
                completed, you receive the available
                findings in a structured verification
                report.
              </p>

              <p>
                The report is intended to help you
                understand what was reviewed, what
                information was identified, and whether
                any issues or areas requiring further
                investigation were found.
              </p>

              {/* =================================================
                  WARNING
              ================================================= */}

              <div
                id="review-findings"
                className={styles.noteBox}
              >

                <div className={styles.noteIcon}>
                  <AlertTriangle
                    size={22}
                    strokeWidth={1.8}
                  />
                </div>

                <p>
                  <strong>
                    Review the findings carefully:
                  </strong>{" "}
                  A verification result should not be
                  treated as a guarantee that a property
                  is completely free from every possible
                  legal, ownership, structural, financial,
                  or other risk. Where necessary, obtain
                  professional advice and conduct
                  appropriate official checks before
                  completing a transaction.
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              BOTTOM ARTICLE NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>

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
                  Why Verify a Property?
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
                  What You Can Verify
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
                    "how-it-works"
                  )
                }
              >

                <span
                  className={styles.activeDot}
                />

                How It Works

              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "verification-process"
                  )
                }
              >

                <span
                  className={styles.articleDot}
                />

                Verification Process

              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "what-we-check"
                  )
                }
              >

                <span
                  className={styles.articleDot}
                />

                What the Process Helps You Understand

              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "document-package"
                  )
                }
              >

                <span
                  className={styles.articleDot}
                />

                Property Document Package

              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "after-verification"
                  )
                }
              >

                <span
                  className={styles.articleDot}
                />

                What Happens After Verification?

              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "review-findings"
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
                  Why Verify a Property?
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
                  What You Can Verify
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