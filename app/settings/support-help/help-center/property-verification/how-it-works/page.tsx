"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CloudUpload,
  FileCheck,
  FileText,
  Info,
  Landmark,
  Lock,
  Search,
  Shield,
  User,
  Scale,
  Clock3,
  CheckCircle2,
  CircleCheck,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import styles from "./how-it-works.module.css";

export default function HowItWorksArticle() {
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
      "/settings/support-help/help-center/property-verification/why-verify"
    );
  };

  const goToNextArticle = () => {
    router.push(
      "/settings/support-help/help-center/property-verification/what-you-can-verify"
    );
  };

  /* =========================================================
     ARTICLE SECTION NAVIGATION
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
            <h1>How It Works (Overview)</h1>

            <p>
              PropertySure AI follows a structured verification
              process to help you understand the information
              submitted about a property.
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
              OUR VERIFICATION PROCESS
          ================================================= */}

          <section
            id="our-verification-process"
            className={styles.introSection}
          >
            <div className={styles.introIcon}>
              <Shield size={38} strokeWidth={1.8} />
            </div>

            <div className={styles.introContent}>
              <h2>Our Verification Process in Simple Steps</h2>

              <p>
                We combine AI analysis, official data checks,
                and human review to deliver accurate, reliable
                property verification.
              </p>
            </div>
          </section>

          {/* =================================================
              4 STEP PROCESS
          ================================================= */}

          <section
            id="four-step-verification"
            className={styles.contentSection}
          >
            <h2>The 4-Step Verification Process</h2>

            <div className={styles.stepsGrid}>
              {/* STEP 1 */}

              <div className={styles.stepCard}>
                <div className={styles.stepTop}>
                  <span
                    className={`${styles.stepNumber} ${styles.stepBlue}`}
                  >
                    1
                  </span>
                </div>

                <div
                  className={`${styles.stepIcon} ${styles.blueIcon}`}
                >
                  <CloudUpload size={31} />
                </div>

                <h3>Submit Information</h3>

                <p>
                  You provide the property details and upload
                  the required document package.
                </p>

                <div
                  className={`${styles.stepTag} ${styles.blueTag}`}
                >
                  <User size={14} />
                  You
                </div>

                <ArrowRight
                  className={styles.stepArrow}
                  size={21}
                />
              </div>

              {/* STEP 2 */}

              <div className={styles.stepCard}>
                <div className={styles.stepTop}>
                  <span
                    className={`${styles.stepNumber} ${styles.greenNumber}`}
                  >
                    2
                  </span>
                </div>

                <div
                  className={`${styles.stepIcon} ${styles.greenIcon}`}
                >
                  <Search size={31} />
                </div>

                <h3>AI Analysis</h3>

                <p>
                  Our AI reviews your information and analyzes
                  documents for accuracy, consistency, and
                  potential issues.
                </p>

                <div
                  className={`${styles.stepTag} ${styles.greenTag}`}
                >
                  <Sparkles size={14} />
                  PropertySure AI
                </div>

                <ArrowRight
                  className={styles.stepArrow}
                  size={21}
                />
              </div>

              {/* STEP 3 */}

              <div className={styles.stepCard}>
                <div className={styles.stepTop}>
                  <span
                    className={`${styles.stepNumber} ${styles.yellowNumber}`}
                  >
                    3
                  </span>
                </div>

                <div
                  className={`${styles.stepIcon} ${styles.yellowIcon}`}
                >
                  <Landmark size={31} />
                </div>

                <h3>Official Checks</h3>

                <p>
                  We check available official records and
                  sources where applicable to confirm and
                  cross-verify details.
                </p>

                <div
                  className={`${styles.stepTag} ${styles.yellowTag}`}
                >
                  <Shield size={14} />
                  Official Sources
                </div>

                <ArrowRight
                  className={styles.stepArrow}
                  size={21}
                />
              </div>

              {/* STEP 4 */}

              <div className={styles.stepCard}>
                <div className={styles.stepTop}>
                  <span
                    className={`${styles.stepNumber} ${styles.purpleNumber}`}
                  >
                    4
                  </span>
                </div>

                <div
                  className={`${styles.stepIcon} ${styles.purpleIcon}`}
                >
                  <FileCheck size={31} />
                </div>

                <h3>Verification Report</h3>

                <p>
                  You receive a detailed verification report
                  with findings, status, and important
                  information.
                </p>

                <div
                  className={`${styles.stepTag} ${styles.purpleTag}`}
                >
                  <User size={14} />
                  You
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              WHY THIS PROCESS MATTERS
          ================================================= */}

          <section
            id="why-this-process-matters"
            className={styles.contentSection}
          >
            <h2>Why This Process Matters</h2>

            <div className={styles.benefitsGrid}>
              <div className={styles.benefitItem}>
                <div
                  className={`${styles.benefitIcon} ${styles.blueBenefit}`}
                >
                  <Shield size={25} />
                </div>

                <div>
                  <h3>Independent Verification</h3>

                  <p>
                    We verify information independently to help
                    you make informed property decisions.
                  </p>
                </div>
              </div>

              <div className={styles.benefitItem}>
                <div
                  className={`${styles.benefitIcon} ${styles.greenBenefit}`}
                >
                  <Check size={26} />
                </div>

                <div>
                  <h3>Multiple Layers of Checks</h3>

                  <p>
                    AI analysis, official records, and human
                    review create multiple layers of validation.
                  </p>
                </div>
              </div>

              <div className={styles.benefitItem}>
                <div
                  className={`${styles.benefitIcon} ${styles.yellowBenefit}`}
                >
                  <Lock size={24} />
                </div>

                <div>
                  <h3>Secure &amp; Private</h3>

                  <p>
                    Your data is encrypted and handled securely
                    throughout the verification process.
                  </p>
                </div>
              </div>

              <div className={styles.benefitItem}>
                <div
                  className={`${styles.benefitIcon} ${styles.purpleBenefit}`}
                >
                  <Clock3 size={25} />
                </div>

                <div>
                  <h3>Fast &amp; Efficient</h3>

                  <p>
                    Most verifications are completed in
                    minutes, not weeks.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              WHAT WE CHECK
          ================================================= */}

          <section
            id="what-we-check"
            className={styles.contentSection}
          >
            <h2>What We Check</h2>

            <p className={styles.sectionDescription}>
              Our verification covers key areas that help you
              understand the property better.
            </p>

            <div className={styles.checkGrid}>
              {/* OWNERSHIP */}

              <div className={styles.checkCard}>
                <div
                  className={`${styles.checkIcon} ${styles.checkBlue}`}
                >
                  <User size={24} />
                </div>

                <h3>Ownership &amp; Title</h3>

                <p>
                  Verify rightful ownership and title
                  information.
                </p>
              </div>

              {/* DOCUMENT */}

              <div className={styles.checkCard}>
                <div
                  className={`${styles.checkIcon} ${styles.checkGreen}`}
                >
                  <FileText size={24} />
                </div>

                <h3>Document Authenticity</h3>

                <p>
                  Check authenticity and legitimacy of
                  documents.
                </p>
              </div>

              {/* PROPERTY */}

              <div className={styles.checkCard}>
                <div
                  className={`${styles.checkIcon} ${styles.checkYellow}`}
                >
                  <Landmark size={24} />
                </div>

                <h3>Property Details &amp; Location</h3>

                <p>
                  Confirm property details and location
                  accuracy.
                </p>
              </div>

              {/* ENCUMBRANCES */}

              <div className={styles.checkCard}>
                <div
                  className={`${styles.checkIcon} ${styles.checkPurple}`}
                >
                  <Scale size={24} />
                </div>

                <h3>Encumbrances &amp; Liens</h3>

                <p>
                  Check for liens, restrictions, or legal
                  encumbrances.
                </p>
              </div>

              {/* DISPUTES */}

              <div className={styles.checkCard}>
                <div
                  className={`${styles.checkIcon} ${styles.checkBlue}`}
                >
                  <Shield size={24} />
                </div>

                <h3>Disputes &amp; Claims</h3>

                <p>
                  Identify any disputes or competing claims.
                </p>
              </div>

              {/* COMPLIANCE */}

              <div className={styles.checkCard}>
                <div
                  className={`${styles.checkIcon} ${styles.checkGreen}`}
                >
                  <CircleCheck size={24} />
                </div>

                <h3>Compliance Checks</h3>

                <p>
                  Ensure compliance with relevant regulations.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              TIP
          ================================================= */}

          <div className={styles.tipBox}>
            <div className={styles.tipIcon}>
              <Info size={23} />
            </div>

            <p>
              <strong>Tip:</strong>{" "}
              The more complete and accurate the information
              and documents you provide, the more accurate and
              comprehensive your verification report will be.
            </p>
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
              <ArrowLeft size={17} />

              <span>
                <small>Previous Article</small>

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
                <small>Next Article</small>

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
            <h3>In this article</h3>

            <nav className={styles.articleNav}>
              <button
                type="button"
                className={styles.activeArticle}
                onClick={() =>
                  scrollToSection(
                    "our-verification-process"
                  )
                }
              >
                <span className={styles.activeDot} />
                Our Verification Process
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "four-step-verification"
                  )
                }
              >
                <span />
                The 4-Step Verification Process
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "why-this-process-matters"
                  )
                }
              >
                <span />
                Why This Process Matters
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("what-we-check")
                }
              >
                <span />
                What We Check
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
                  Why Verify a Property?
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
                  What You Can Verify
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