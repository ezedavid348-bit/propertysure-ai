"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileText,
  Gavel,
  Info,
  Search,
  Shield,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react";

import styles from "./verification-results.module.css";

export default function VerificationResultsArticle() {
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
      "/settings/support-help/help-center/property-verification/what-you-cant-verify"
    );
  };

  const goToNextArticle = () => {
    router.push(
      "/settings/support-help/help-center/property-verification/need-more-help"
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
            ARTICLE
        =================================================== */}

        <article className={styles.article}>
          {/* =================================================
              HEADER
          ================================================= */}

          <header className={styles.articleHeader}>
            <h1>Verification Results</h1>

            <p>
              Your verification report provides a clear summary
              of our findings. It helps you understand the
              results and take confident next steps.
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
            id="verification-report"
            className={styles.introSection}
          >
            <div className={styles.introIcon}>
              <FileText size={34} strokeWidth={1.8} />
            </div>

            <div className={styles.introContent}>
              <h2>Clear. Accurate. Actionable.</h2>

              <p>
                We present our findings in an easy-to-understand
                report so you can make informed property
                decisions with confidence.
              </p>
            </div>
          </section>

          {/* =================================================
              WHAT'S IN YOUR VERIFICATION REPORT
          ================================================= */}

          <section
            id="report-sections"
            className={styles.contentSection}
          >
            <h2>What&apos;s in Your Verification Report</h2>

            <p className={styles.sectionDescription}>
              Your report is designed to be simple,
              transparent, and useful.
            </p>

            <div className={styles.resultsGrid}>
              {/* =================================================
                  VERIFICATION SUMMARY
              ================================================= */}

              <div className={styles.resultCard}>
                <div
                  className={`${styles.resultIcon} ${styles.blueIcon}`}
                >
                  <ClipboardList size={25} />
                </div>

                <div className={styles.resultContent}>
                  <h3>Verification Summary</h3>

                  <p>
                    A quick overview of the verification status
                    and overall result.
                  </p>
                </div>
              </div>

              {/* =================================================
                  FINDINGS & DETAILS
              ================================================= */}

              <div className={styles.resultCard}>
                <div
                  className={`${styles.resultIcon} ${styles.greenIcon}`}
                >
                  <Shield size={25} />
                </div>

                <div className={styles.resultContent}>
                  <h3>Findings &amp; Details</h3>

                  <p>
                    Verified information with supporting
                    details and data sources.
                  </p>
                </div>
              </div>

              {/* =================================================
                  ISSUES IDENTIFIED
              ================================================= */}

              <div className={styles.resultCard}>
                <div
                  className={`${styles.resultIcon} ${styles.yellowIcon}`}
                >
                  <TriangleAlert size={25} />
                </div>

                <div className={styles.resultContent}>
                  <h3>Issues Identified</h3>

                  <p>
                    Any discrepancies, risks, or concerns found
                    during verification.
                  </p>
                </div>
              </div>

              {/* =================================================
                  DOCUMENTS CHECKED
              ================================================= */}

              <div className={styles.resultCard}>
                <div
                  className={`${styles.resultIcon} ${styles.purpleIcon}`}
                >
                  <FileCheck2 size={25} />
                </div>

                <div className={styles.resultContent}>
                  <h3>Documents Checked</h3>

                  <p>
                    A list of documents reviewed and their
                    verification status.
                  </p>
                </div>
              </div>

              {/* =================================================
                  LEGAL & COMPLIANCE
              ================================================= */}

              <div className={styles.resultCard}>
                <div
                  className={`${styles.resultIcon} ${styles.cyanIcon}`}
                >
                  <Gavel size={25} />
                </div>

                <div className={styles.resultContent}>
                  <h3>Legal &amp; Compliance</h3>

                  <p>
                    Compliance checks, encumbrances, liens, and
                    legal considerations.
                  </p>
                </div>
              </div>

              {/* =================================================
                  IMPORTANT NOTES
              ================================================= */}

              <div className={styles.resultCard}>
                <div
                  className={`${styles.resultIcon} ${styles.lightBlueIcon}`}
                >
                  <Info size={25} />
                </div>

                <div className={styles.resultContent}>
                  <h3>Important Notes</h3>

                  <p>
                    Key notes, limitations, and important
                    reminders.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              UNDERSTANDING YOUR RESULTS
          ================================================= */}

          <section
            id="understanding-results"
            className={styles.contentSection}
          >
            <h2>Understanding Your Results</h2>

            <p className={styles.sectionDescription}>
              Your verification result summarizes the
              information that was checked and the findings
              available at the time of verification.
            </p>

            <div className={styles.resultExplanation}>
              <div
                className={`${styles.explanationItem} ${styles.explanationBlue}`}
              >
                <CheckCircle2 size={21} />

                <div>
                  <h3>Verified Information</h3>

                  <p>
                    Information supported by the records,
                    documents, and sources available for the
                    verification.
                  </p>
                </div>
              </div>

              <div
                className={`${styles.explanationItem} ${styles.explanationYellow}`}
              >
                <TriangleAlert size={21} />

                <div>
                  <h3>Issues or Discrepancies</h3>

                  <p>
                    Any identified concerns or inconsistencies
                    are clearly presented in the report.
                  </p>
                </div>
              </div>

              <div
                className={`${styles.explanationItem} ${styles.explanationGreen}`}
              >
                <Info size={21} />

                <div>
                  <h3>Information That Could Not Be Confirmed</h3>

                  <p>
                    If certain information cannot be verified
                    from available sources, the report will
                    clearly state that limitation.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              WHAT TO DO NEXT
          ================================================= */}

          <section
            id="what-to-do-next"
            className={styles.contentSection}
          >
            <h2>What to Do Next</h2>

            <p className={styles.sectionDescription}>
              Review your report carefully and use the findings
              to guide your next property decision.
            </p>

            <div className={styles.nextSteps}>
              <div className={styles.nextStep}>
                <span>1</span>

                <div>
                  <h3>Review the Verification Summary</h3>

                  <p>
                    Start with the overall verification status
                    and summary of findings.
                  </p>
                </div>
              </div>

              <div className={styles.nextStep}>
                <span>2</span>

                <div>
                  <h3>Review Any Issues Identified</h3>

                  <p>
                    Pay attention to discrepancies,
                    limitations, or concerns highlighted in
                    your report.
                  </p>
                </div>
              </div>

              <div className={styles.nextStep}>
                <span>3</span>

                <div>
                  <h3>Seek Professional Advice Where Appropriate</h3>

                  <p>
                    For legal, surveying, engineering, or other
                    specialist matters, consult a qualified
                    professional.
                  </p>
                </div>
              </div>
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
              <Info size={23} />
            </div>

            <p>
              <strong>Important:</strong>{" "}
              A verification report reflects the information
              and official sources available at the time of
              verification. It does not guarantee future events,
              market performance, or eliminate every possible
              property risk.
            </p>
          </div>

          {/* =================================================
              DATA SECURITY
          ================================================= */}

          <div className={styles.securityBox}>
            <div className={styles.securityIcon}>
              <Shield size={25} />
            </div>

            <div>
              <strong>Your data is secure.</strong>

              <p>
                Your verification information is handled
                securely and is available only to you through
                your account.
              </p>
            </div>
          </div>

          {/* =================================================
              BOTTOM NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>
            <button
              type="button"
              className={styles.previousBottom}
              onClick={goToPreviousArticle}
            >
              <ArrowLeft size={19} />

              <span>
                <small>Previous Article</small>

                <strong>What You Can&apos;t Verify</strong>
              </span>
            </button>

            <button
              type="button"
              className={styles.nextBottom}
              onClick={goToNextArticle}
            >
              <span>
                <small>Next Article</small>

                <strong>Need more help?</strong>
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
                className={styles.activeArticle}
                onClick={() =>
                  scrollToSection("verification-report")
                }
              >
                <span className={styles.activeDot} />
                What&apos;s in Your Verification Report
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("understanding-results")
                }
              >
                <span />
                Understanding Your Results
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("what-to-do-next")
                }
              >
                <span />
                What to Do Next
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

                <strong>What You Can&apos;t Verify</strong>
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

                <strong>Need more help?</strong>
              </span>

              <ArrowRight size={17} />
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}