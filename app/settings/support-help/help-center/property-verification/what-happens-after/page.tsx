"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleCheck,
  FileCheck2,
  FileText,
  Info,
  Search,
  Shield,
  ThumbsDown,
  ThumbsUp,
  Eye,
  ListChecks,
  Flag,
} from "lucide-react";

import styles from "./what-happens-after.module.css";

export default function WhatHappensAfterArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  /* =========================================================
     ARTICLE ROUTES
  ========================================================= */

  const goToHelpCenter = () => {
    router.push("/settings/support-help/help-center");
  };

  const goToPreviousArticle = () => {
    router.push(
      "/settings/support-help/help-center/property-verification/what-you-can-verify"
    );
  };

  const goToNextArticle = () => {
    router.push(
      "/settings/support-help/help-center/property-verification/what-you-cant-verify"
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
     PAGE
  ========================================================= */

  return (
    <main className={styles.page}>
      {/* =====================================================
          TOP SEARCH
      ===================================================== */}

      <header className={styles.topHeader}>
        <div className={styles.searchBox}>
          <Search
            size={21}
            strokeWidth={2}
            className={styles.searchIcon}
            aria-hidden="true"
          />

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
            MAIN ARTICLE
        =================================================== */}

        <article className={styles.article}>
          {/* =================================================
              HEADER
          ================================================= */}

          <header className={styles.articleHeader}>
            <h1>What Happens After You Verify</h1>

            <p>
              Once your property verification is complete,
              PropertySure AI organizes the findings and
              provides you with a clear verification report to
              help you understand the information checked and
              make informed decisions.
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
              INTRODUCTION
          ================================================= */}

          <section
            id="verification-journey"
            className={styles.introSection}
          >
            <div className={styles.introIcon}>
              <Shield size={38} strokeWidth={1.8} />
            </div>

            <div className={styles.introContent}>
              <h2>Your Verification Journey Continues</h2>

              <p>
                After we complete our verification process, we
                organize the results and deliver them in a
                clear, easy-to-understand report so you can move
                forward with confidence.
              </p>
            </div>
          </section>

          {/* =================================================
              STEP 1
          ================================================= */}

          <section
            id="verification-completed"
            className={styles.processCard}
          >
            <div className={styles.processIconWrap}>
              <div
                className={`${styles.processIcon} ${styles.blueIcon}`}
              >
                <CheckCircle2 size={30} />
              </div>
            </div>

            <div className={styles.processNumber}>
              1
            </div>

            <div className={styles.processContent}>
              <h2>Your Verification Is Completed</h2>

              <p>
                We receive and process the property information
                and document package you submitted. Our system
                confirms that your verification request has been
                successfully completed.
              </p>
            </div>
          </section>

          {/* =================================================
              STEP 2
          ================================================= */}

          <section
            id="results-reviewed"
            className={styles.processCard}
          >
            <div className={styles.processIconWrap}>
              <div
                className={`${styles.processIcon} ${styles.greenIcon}`}
              >
                <Search size={30} />
              </div>
            </div>

            <div className={styles.processNumber}>
              2
            </div>

            <div className={styles.processContent}>
              <h2>Your Results Are Reviewed</h2>

              <p>
                Your information is assessed against available
                official records, trusted databases, and other
                reliable sources. Our AI and verification
                processes analyze the information for accuracy,
                consistency, and potential issues.
              </p>
            </div>
          </section>

          {/* =================================================
              STEP 3
          ================================================= */}

          <section
            id="verification-report"
            className={styles.processCard}
          >
            <div className={styles.processIconWrap}>
              <div
                className={`${styles.processIcon} ${styles.purpleIcon}`}
              >
                <FileText size={30} />
              </div>
            </div>

            <div className={styles.processNumber}>
              3
            </div>

            <div className={styles.processContent}>
              <h2>Your Verification Report Is Generated</h2>

              <p>
                You receive a detailed verification report that
                brings together the findings from the verification
                process.
              </p>

              <div className={styles.reportTags}>
                <span className={styles.reportTag}>
                  <CircleCheck size={13} />
                  Verification Status
                </span>

                <span className={styles.reportTag}>
                  <ListChecks size={13} />
                  Findings
                </span>

                <span className={styles.reportTag}>
                  <FileCheck2 size={13} />
                  Documents Checked
                </span>

                <span className={styles.reportTag}>
                  <Flag size={13} />
                  Issues Identified
                </span>

                <span className={styles.reportTag}>
                  <Info size={13} />
                  Important Notes
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              STEP 4
          ================================================= */}

          <section
            id="review-findings"
            className={styles.processCard}
          >
            <div className={styles.processIconWrap}>
              <div
                className={`${styles.processIcon} ${styles.yellowIcon}`}
              >
                <Eye size={30} />
              </div>
            </div>

            <div className={styles.processNumber}>
              4
            </div>

            <div className={styles.processContent}>
              <h2>Review Your Findings</h2>

              <p>
                Carefully review the sections of your report
                covering ownership and title, document
                authenticity, property details, encumbrances,
                disputes or claims, and compliance checks to
                understand the available information about the
                property.
              </p>
            </div>
          </section>

          {/* =================================================
              STEP 5
          ================================================= */}

          <section
            id="decide-next-step"
            className={styles.processCard}
          >
            <div className={styles.processIconWrap}>
              <div
                className={`${styles.processIcon} ${styles.tealIcon}`}
              >
                <ArrowRight size={30} />
              </div>
            </div>

            <div className={styles.processNumber}>
              5
            </div>

            <div className={styles.processContent}>
              <h2>Decide Your Next Step</h2>

              <p>
                Use the verified information to make informed
                property decisions. PropertySure AI provides
                verification and due-diligence information;
                you remain responsible for your final decisions
                and may seek professional legal, surveying, or
                other expert advice where appropriate.
              </p>
            </div>
          </section>

          {/* =================================================
              IMPORTANT NOTE
          ================================================= */}

          <div
            id="important-note"
            className={styles.tipBox}
          >
            <div className={styles.tipIcon}>
              <Info size={25} />
            </div>

            <p>
              <strong>Important Note:</strong>{" "}
              A verification report reflects the information
              and official sources available at the time of
              verification. It does not guarantee future events,
              market performance, or eliminate every possible
              property risk.
            </p>
          </div>

          {/* =================================================
              BOTTOM ARTICLE NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>
            {/* PREVIOUS ARTICLE */}

            <button
              type="button"
              className={styles.previousBottom}
              onClick={goToPreviousArticle}
            >
              <ArrowLeft size={18} />

              <span>
                <small>Previous Article</small>

                <strong>
                  What You Can Verify
                </strong>
              </span>
            </button>

            {/* NEXT ARTICLE */}

            <button
              type="button"
              className={styles.nextBottom}
              onClick={goToNextArticle}
            >
              <span>
                <small>Next Article</small>

                <strong>
                  What You Can’t Verify
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
            <h3>In this article</h3>

            <nav className={styles.articleNav}>
              <button
                type="button"
                onClick={() =>
                  scrollToSection("verification-completed")
                }
              >
                <span />
                Your Verification Is Completed
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("results-reviewed")
                }
              >
                <span />
                Your Results Are Reviewed
              </button>

              <button
                type="button"
                className={styles.activeArticle}
                onClick={() =>
                  scrollToSection("verification-report")
                }
              >
                <span className={styles.activeDot} />
                Your Verification Report Is Generated
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("review-findings")
                }
              >
                <span />
                Review Your Findings
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("decide-next-step")
                }
              >
                <span />
                Decide Your Next Step
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("important-note")
                }
              >
                <span />
                Important Note
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
              onClick={goToPreviousArticle}
            >
              <ArrowLeft size={16} />

              <span>
                <small>Previous Article</small>

                <strong>
                  What You Can Verify
                </strong>
              </span>
            </button>

            <div className={styles.sideDivider} />

            <button
              type="button"
              className={styles.sideNext}
              onClick={goToNextArticle}
            >
              <span>
                <small>Next Article</small>

                <strong>
                  What You Can’t Verify
                </strong>
              </span>

              <ArrowRight size={17} />
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}