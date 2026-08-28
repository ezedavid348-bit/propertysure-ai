"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./why-verify.module.css";

/* =========================================================
   ICONS
========================================================= */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <path d="M12 3l7 3v5c0 4.5-2.8 8.1-7 10-4.2-1.9-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v5h4M9 13h6M9 17h6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.6-4 3-6 7-6s6.4 2 7 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12l2.3 2.3 4.7-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 018 0v3" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <path d="M12 4l9 16H3L12 4z" />
      <path d="M12 9v5M12 17h.01" />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <path d="M4 11l8-7 8 7v9H4z" />
      <path d="M9 20v-5h6v5" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <path d="M6 5h12v14H6z" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <circle cx="9" cy="9" r="3" />
      <circle cx="16" cy="10" r="2.5" />
      <path d="M3.5 20c.5-3.5 2.4-5.5 5.5-5.5s5 2 5.5 5.5" />
      <path d="M14 15c3.2-.2 5.3 1.5 6 5" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <path d="M5 21V5h10v16M15 9h4v12M8 8h4M8 12h4M8 16h4" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <rect x="6" y="5" width="12" height="16" rx="2" />
      <path d="M9 5V3h6v2M9 10h6M9 14h6M9 18h4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <path d="M12 16V5M8 9l4-4 4 4" />
      <path d="M5 15v4h14v-4" />
    </svg>
  );
}

function AnalysisIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5M8 10.5h5M10.5 8v5" />
    </svg>
  );
}

function OfficialIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <path d="M4 20h16M6 20V9h12v11M4 9l8-5 8 5M9 12v5M12 12v5M15 12v5" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.svgIcon}
    >
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.arrowIcon}
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.arrowIcon}
    >
      <path d="M19 12H6M11 6l-6 6 6 6" />
    </svg>
  );
}

function ThumbsUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.feedbackIcon}
    >
      <path d="M8 10v10H5a2 2 0 01-2-2v-6a2 2 0 012-2h3z" />
      <path d="M8 20h7a3 3 0 003-2.3l1.1-5A2 2 0 0017.2 10H14l.7-3.2A2.3 2.3 0 0012.5 4L8 10" />
    </svg>
  );
}

function ThumbsDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={styles.feedbackIcon}
    >
      <path d="M8 14V4H5a2 2 0 00-2 2v6a2 2 0 002 2h3z" />
      <path d="M8 4h7a3 3 0 013 2.3l1.1 5A2 2 0 0117.2 14H14l.7 3.2a2.3 2.3 0 01-2.2 2.8L8 14" />
    </svg>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function WhyVerifyArticle() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<
    "yes" | "no" | null
  >(null);

  /* =======================================================
     ROUTES
  ======================================================= */

  const goToHelpCenter = () => {
    router.push(
      "/settings/support-help/help-center"
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

  /* =======================================================
     SECTION NAVIGATION
  ======================================================= */

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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className={styles.page}>

      {/* ===================================================
          TOP SEARCH
      =================================================== */}

      <header className={styles.topHeader}>
        <div className={styles.searchBox}>
          <SearchIcon />

          <input
            type="text"
            placeholder="Search for articles, guides, and topics"
            aria-label="Search help articles"
          />
        </div>
      </header>

      {/* ===================================================
          MAIN LAYOUT
      =================================================== */}

      <div className={styles.layout}>

        {/* =================================================
            ARTICLE
        ================================================= */}

        <article className={styles.article}>

          {/* =================================================
              ARTICLE HEADER
          ================================================= */}

          <header className={styles.articleHeader}>
            <h1>Why Verify a Property?</h1>

            <p>
              Real estate fraud is on the rise.
              Verifying a property helps you
              protect your money, your investment,
              and your peace of mind.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={goToHelpCenter}
            >
              <ArrowLeft />
              <span>Back to Help Center</span>
            </button>
          </header>

          <div className={styles.divider} />

          {/* =================================================
              WHY PROPERTY VERIFICATION MATTERS
          ================================================= */}

          <section
            id="why-property-verification-matters"
            className={styles.introSection}
          >
            <div className={`${styles.largeIcon} ${styles.greenIcon}`}>
              <ShieldIcon />
            </div>

            <div>
              <h2>
                Why Property Verification Matters
              </h2>

              <p>
                A property may look legitimate on
                the surface, but problems with
                documents, ownership, or property
                claims can turn your dream investment
                into a costly problem.
              </p>

              <p>
                Property verification gives you an
                independent layer of due diligence
                so you can make informed, confident,
                and secure property decisions.
              </p>
            </div>
          </section>

          {/* =================================================
              RISKS
          ================================================= */}

          <section
            id="risks"
            className={styles.contentSection}
          >
            <h2>
              The Risks of Not Verifying a Property
            </h2>

            <p className={styles.sectionIntro}>
              Buying or investing in property without
              proper verification can expose you to
              serious financial and legal risks.
            </p>

            <div className={styles.riskGrid}>

              <div className={styles.riskCard}>
                <div className={`${styles.cardIcon} ${styles.redIcon}`}>
                  <DocumentIcon />
                </div>

                <h3>
                  Fake or Altered Documents
                </h3>

                <p>
                  Documents may be falsified,
                  tampered with, or completely fake.
                </p>
              </div>

              <div className={styles.riskCard}>
                <div className={`${styles.cardIcon} ${styles.orangeIcon}`}>
                  <UserIcon />
                </div>

                <h3>
                  No Valid Ownership Rights
                </h3>

                <p>
                  The seller may not be the legal
                  owner of the property.
                </p>
              </div>

              <div className={styles.riskCard}>
                <div className={`${styles.cardIcon} ${styles.yellowIcon}`}>
                  <UsersIcon />
                </div>

                <h3>
                  Multiple Claims or Disputes
                </h3>

                <p>
                  More than one party may be claiming
                  rights to the same property.
                </p>
              </div>

              <div className={styles.riskCard}>
                <div className={`${styles.cardIcon} ${styles.blueIcon}`}>
                  <AlertIcon />
                </div>

                <h3>
                  Incorrect or Incomplete Info
                </h3>

                <p>
                  Wrong or incomplete details can lead
                  to serious problems later.
                </p>
              </div>

              <div className={styles.riskCard}>
                <div className={`${styles.cardIcon} ${styles.purpleIcon}`}>
                  <UsersIcon />
                </div>

                <h3>
                  Fraudulent Agents or Sellers
                </h3>

                <p>
                  Unscrupulous agents or sellers may
                  try to deceive you.
                </p>
              </div>

              <div className={styles.riskCard}>
                <div className={`${styles.cardIcon} ${styles.tealIcon}`}>
                  <AlertIcon />
                </div>

                <h3>
                  Hidden Restrictions
                </h3>

                <p>
                  The property may have court orders,
                  liens, or other encumbrances.
                </p>
              </div>

            </div>
          </section>

          <div className={styles.divider} />

          {/* =================================================
              HOW PROPERTYSURE AI HELPS
          ================================================= */}

          <section
            id="how-propertysure-helps"
            className={styles.contentSection}
          >
            <h2>
              How PropertySure AI Helps Protect You
            </h2>

            <p className={styles.sectionIntro}>
              PropertySure AI helps organize and
              strengthen your property due-diligence
              process before you make a major decision.
            </p>

            <div className={styles.benefitGrid}>

              <div className={styles.benefitCard}>
                <div className={`${styles.cardIcon} ${styles.blueIcon}`}>
                  <ShieldIcon />
                </div>

                <div>
                  <h3>Avoid Fraud</h3>

                  <p>
                    We analyze documents and data to
                    identify inconsistencies, forged
                    information, and potential fraud
                    before you commit.
                  </p>
                </div>
              </div>

              <div className={styles.benefitCard}>
                <div className={`${styles.cardIcon} ${styles.greenIcon}`}>
                  <UserIcon />
                </div>

                <div>
                  <h3>
                    Confirm Ownership &amp; Details
                  </h3>

                  <p>
                    We verify ownership, property
                    details, and key information using
                    available official sources and
                    checks.
                  </p>
                </div>
              </div>

              <div className={styles.benefitCard}>
                <div className={`${styles.cardIcon} ${styles.orangeIcon}`}>
                  <ClockIcon />
                </div>

                <div>
                  <h3>Save Time &amp; Effort</h3>

                  <p>
                    We do the heavy work for you, so
                    you do not have to visit multiple
                    offices or chase different sources.
                  </p>
                </div>
              </div>

              <div className={styles.benefitCard}>
                <div className={`${styles.cardIcon} ${styles.purpleIcon}`}>
                  <CheckCircleIcon />
                </div>

                <div>
                  <h3>Make Confident Decisions</h3>

                  <p>
                    You receive a clear verification
                    report that helps you decide with
                    greater clarity and confidence.
                  </p>
                </div>
              </div>

              <div className={styles.benefitCard}>
                <div className={`${styles.cardIcon} ${styles.redIcon}`}>
                  <ShieldIcon />
                </div>

                <div>
                  <h3>Reduce Financial Risk</h3>

                  <p>
                    Identify issues early and avoid
                    costly mistakes, hidden liabilities,
                    and future legal problems.
                  </p>
                </div>
              </div>

              <div className={styles.benefitCard}>
                <div className={`${styles.cardIcon} ${styles.tealIcon}`}>
                  <DocumentIcon />
                </div>

                <div>
                  <h3>Create a Verifiable Record</h3>

                  <p>
                    Keep a verified record of the
                    property and the verification report
                    for your protection.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* =================================================
              WHAT HAPPENS WHEN YOU VERIFY
          ================================================= */}

          <section
            id="what-happens"
            className={styles.contentSection}
          >
            <h2>
              What Happens When You Verify
            </h2>

            <p className={styles.sectionIntro}>
              PropertySure AI follows a structured
              verification process designed to help
              you understand the information submitted
              about a property.
            </p>

            <div className={styles.processGrid}>

              <div className={styles.processCard}>
                <div className={styles.processTop}>
                  <div className={`${styles.processIcon} ${styles.blueIcon}`}>
                    <UploadIcon />
                  </div>

                  <span className={styles.stepBadge}>
                    1
                  </span>
                </div>

                <h3>
                  Submit Information
                </h3>

                <p>
                  You provide the property information
                  and the required document package.
                </p>
              </div>

              <div className={styles.processArrow}>
                <ArrowRight />
              </div>

              <div className={styles.processCard}>
                <div className={styles.processTop}>
                  <div className={`${styles.processIcon} ${styles.blueIcon}`}>
                    <AnalysisIcon />
                  </div>

                  <span className={styles.stepBadge}>
                    2
                  </span>
                </div>

                <h3>
                  AI Analysis
                </h3>

                <p>
                  Our AI reviews and analyzes the
                  submitted documents for accuracy,
                  consistency, and potential issues.
                </p>
              </div>

              <div className={styles.processArrow}>
                <ArrowRight />
              </div>

              <div className={styles.processCard}>
                <div className={styles.processTop}>
                  <div className={`${styles.processIcon} ${styles.blueIcon}`}>
                    <OfficialIcon />
                  </div>

                  <span className={styles.stepBadge}>
                    3
                  </span>
                </div>

                <h3>
                  Official Checks
                </h3>

                <p>
                  Available official records and
                  sources are checked where applicable.
                </p>
              </div>

              <div className={styles.processArrow}>
                <ArrowRight />
              </div>

              <div className={styles.processCard}>
                <div className={styles.processTop}>
                  <div className={`${styles.processIcon} ${styles.blueIcon}`}>
                    <ReportIcon />
                  </div>

                  <span className={styles.stepBadge}>
                    4
                  </span>
                </div>

                <h3>
                  Verification Report
                </h3>

                <p>
                  You receive a verification report
                  containing findings and relevant
                  information.
                </p>
              </div>

            </div>
          </section>

          <div className={styles.divider} />

          {/* =================================================
              WHEN SHOULD YOU VERIFY
          ================================================= */}

          <section
            id="when-to-verify"
            className={styles.contentSection}
          >
            <h2>
              When Should You Verify a Property?
            </h2>

            <p className={styles.sectionIntro}>
              Verification is most valuable before
              you make a financial or legal commitment
              involving a property.
            </p>

            <div className={styles.whenGrid}>

              <div className={styles.whenCard}>
                <div className={`${styles.whenIcon} ${styles.greenIcon}`}>
                  <HouseIcon />
                </div>

                <strong>
                  Before paying for a property
                </strong>
              </div>

              <div className={styles.whenCard}>
                <div className={`${styles.whenIcon} ${styles.blueIcon}`}>
                  <DocumentIcon />
                </div>

                <strong>
                  Before signing a purchase agreement
                </strong>
              </div>

              <div className={styles.whenCard}>
                <div className={`${styles.whenIcon} ${styles.orangeIcon}`}>
                  <MoneyIcon />
                </div>

                <strong>
                  Before transferring a large deposit
                  or payment
                </strong>
              </div>

              <div className={styles.whenCard}>
                <div className={`${styles.whenIcon} ${styles.purpleIcon}`}>
                  <BuildingIcon />
                </div>

                <strong>
                  Before investing in a property
                  project
                </strong>
              </div>

              <div className={styles.whenCard}>
                <div className={`${styles.whenIcon} ${styles.tealIcon}`}>
                  <ShieldIcon />
                </div>

                <strong>
                  Before accepting property as
                  collateral
                </strong>
              </div>

              <div className={styles.whenCard}>
                <div className={`${styles.whenIcon} ${styles.redIcon}`}>
                  <UsersIcon />
                </div>

                <strong>
                  When buying from an unfamiliar
                  seller or agent
                </strong>
              </div>

            </div>
          </section>

          {/* =================================================
              IMPORTANT NOTE
          ================================================= */}

          <section
            id="important-note"
            className={styles.importantNote}
          >
            <div className={styles.noteIcon}>
              <AlertIcon />
            </div>

            <div>
              <strong>Important:</strong>

              <p>
                Property verification is a
                due-diligence step and does not
                replace professional legal, survey,
                or other expert advice. Always seek
                qualified professional guidance before
                completing any property transaction.
              </p>
            </div>
          </section>

          {/* =================================================
              BOTTOM NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>

            <button
              type="button"
              className={styles.previousBottom}
              onClick={goToPreviousArticle}
            >
              <ArrowLeft />

              <span>
                <small>Previous Article</small>

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
                <small>Next Article</small>

                <strong>
                  How It Works (Overview)
                </strong>
              </span>

              <ArrowRight />
            </button>

          </div>

        </article>

        {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

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
                    "why-property-verification-matters"
                  )
                }
              >
                <span className={styles.activeDot} />

                Why Verify a Property?
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("risks")
                }
              >
                <span />

                The Risks of Not Verifying
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "how-propertysure-helps"
                  )
                }
              >
                <span />

                How PropertySure AI Helps
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("what-happens")
                }
              >
                <span />

                What Happens When You Verify
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("when-to-verify")
                }
              >
                <span />

                When Should You Verify?
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
                  onClick={() =>
                    setFeedback("yes")
                  }
                >
                  <ThumbsUpIcon />
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFeedback("no")
                  }
                >
                  <ThumbsDownIcon />
                  No
                </button>

              </div>
            ) : (
              <div className={styles.feedbackMessage}>
                {feedback === "yes" ? (
                  <>
                    <span className={styles.successCheck}>
                      ✓
                    </span>

                    Thanks for your feedback.
                  </>
                ) : (
                  <>
                    <span className={styles.warningMark}>
                      !
                    </span>

                    Sorry this wasn't helpful.
                  </>
                )}
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
              <ArrowLeft />

              <span>
                <strong>
                  Previous Article
                </strong>

                <small>
                  What is Property Verification?
                </small>
              </span>
            </button>

            <div className={styles.sideDivider} />

            <button
              type="button"
              className={styles.sideNext}
              onClick={goToNextArticle}
            >
              <span>
                <strong>
                  Next Article
                </strong>

                <small>
                  How It Works (Overview)
                </small>
              </span>

              <ArrowRight />
            </button>

          </section>

        </aside>

      </div>
    </main>
  );
}