"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Info,
  Landmark,
  Scale,
  Shield,
  UserRound,
  MessageCircle,
  Smile,
  Eye,
  Banknote,
  Lock,
  Users,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import styles from "./what-you-cant-verify.module.css";

export default function WhatYouCantVerifyArticle() {
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
      "/settings/support-help/help-center/property-verification/what-happens-after"
    );
  };

  const goToNextArticle = () => {
    router.push(
      "/settings/support-help/help-center/property-verification/verification-results"
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
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            className={styles.searchIcon}
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
              HEADER
          ================================================= */}

          <header className={styles.articleHeader}>
            <h1>What You Can’t Verify</h1>

            <p>
              To keep our verification accurate, fair, and
              compliant, there are certain things we currently
              can’t verify. This helps us focus on information
              that can be supported by reliable sources.
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
            id="verification-scope"
            className={styles.introSection}
          >
            <div className={styles.introIcon}>
              <Info size={34} strokeWidth={1.9} />
            </div>

            <div className={styles.introContent}>
              <h2>We Focus on Facts, Not Opinions</h2>

              <p>
                We verify factual information through official
                sources, reliable records, and available data.
                Subjective, personal, or predictive matters are
                outside the current scope of our verification.
              </p>
            </div>
          </section>

          {/* =================================================
              WHAT WE CANNOT VERIFY
          ================================================= */}

          <section
            id="what-we-cant-verify"
            className={styles.contentSection}
          >
            <h2>What We Can’t Verify</h2>

            <p className={styles.sectionDescription}>
              Some property-related information depends on
              personal opinions, future events, physical
              inspection, or services outside our current
              verification scope.
            </p>

            <div className={styles.cantVerifyGrid}>
              {/* =================================================
                  MARKET VALUE
              ================================================= */}

              <div className={styles.cantVerifyCard}>
                <div
                  className={`${styles.cantVerifyIcon} ${styles.blueIcon}`}
                >
                  <Banknote size={28} />
                </div>

                <h3>Market Value</h3>

                <p>
                  We currently don’t provide an independent
                  market valuation or guarantee a property’s
                  selling price. Property value can depend on
                  location, demand, comparable properties, and
                  changing market conditions.
                </p>
              </div>

              {/* =================================================
                  SELLER INTENTIONS
              ================================================= */}

              <div className={styles.cantVerifyCard}>
                <div
                  className={`${styles.cantVerifyIcon} ${styles.greenIcon}`}
                >
                  <MessageCircle size={28} />
                </div>

                <h3>Seller Intentions</h3>

                <p>
                  We can’t verify a seller’s personal
                  motivations, reasons for selling, or future
                  intentions.
                </p>
              </div>

              {/* =================================================
                  FUTURE PERFORMANCE
              ================================================= */}

              <div className={styles.cantVerifyCard}>
                <div
                  className={`${styles.cantVerifyIcon} ${styles.yellowIcon}`}
                >
                  <Smile size={28} />
                </div>

                <h3>Future Performance</h3>

                <p>
                  We can’t predict future returns, rental
                  income, appreciation, or investment
                  performance.
                </p>
              </div>

              {/* =================================================
                  PHYSICAL CONDITION
              ================================================= */}

              <div className={styles.cantVerifyCard}>
                <div
                  className={`${styles.cantVerifyIcon} ${styles.purpleIcon}`}
                >
                  <Eye size={28} />
                </div>

                <h3>Property Condition (Physical)</h3>

                <p>
                  We don’t verify physical conditions such as
                  structural issues, hidden defects, repairs,
                  or construction quality unless a separate
                  professional inspection is performed.
                </p>
              </div>

              {/* =================================================
                  LEGAL ADVICE
              ================================================= */}

              <div className={styles.cantVerifyCard}>
                <div
                  className={`${styles.cantVerifyIcon} ${styles.orangeIcon}`}
                >
                  <Scale size={28} />
                </div>

                <h3>Legal Advice</h3>

                <p>
                  We don’t provide legal advice or interpret
                  laws for your specific situation. Please
                  consult a qualified legal professional when
                  legal advice is required.
                </p>
              </div>

              {/* =================================================
                  PERSONAL AGREEMENTS
              ================================================= */}

              <div className={styles.cantVerifyCard}>
                <div
                  className={`${styles.cantVerifyIcon} ${styles.blueIcon}`}
                >
                  <FileText size={28} />
                </div>

                <h3>Personal Agreements</h3>

                <p>
                  We don’t verify private agreements between
                  parties when those agreements are not part of
                  official property records.
                </p>
              </div>

              {/* =================================================
                  FINANCING
              ================================================= */}

              <div className={styles.cantVerifyCard}>
                <div
                  className={`${styles.cantVerifyIcon} ${styles.greenIcon}`}
                >
                  <Banknote size={28} />
                </div>

                <h3>Financing &amp; Loan Approval</h3>

                <p>
                  We can’t verify loan eligibility, financing
                  terms, lender decisions, or bank approval
                  status.
                </p>
              </div>

              {/* =================================================
                  INSURANCE
              ================================================= */}

              <div className={styles.cantVerifyCard}>
                <div
                  className={`${styles.cantVerifyIcon} ${styles.blueIcon}`}
                >
                  <Shield size={28} />
                </div>

                <h3>Insurance Coverage</h3>

                <p>
                  We don’t verify insurance availability,
                  coverage details, premiums, or claim history.
                </p>
              </div>

              {/* =================================================
                  TENANTS
              ================================================= */}

              <div className={styles.cantVerifyCard}>
                <div
                  className={`${styles.cantVerifyIcon} ${styles.redIcon}`}
                >
                  <Users size={28} />
                </div>

                <h3>Tenants or Occupants</h3>

                <p>
                  We can’t verify current or future tenants,
                  occupants, rental arrangements, or private
                  tenancy agreements unless supported by
                  verifiable official records.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              IMPORTANT NOTE
          ================================================= */}

          <section
            id="important-note"
            className={styles.importantSection}
          >
            <div className={styles.importantIcon}>
              <Info size={23} />
            </div>

            <p>
              <strong>Important:</strong>{" "}
              Our verification is based on available official
              records and reliable sources. If something is not
              verifiable from the information and sources
              available to us, we will clearly state this in
              your report.
            </p>
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
              <ArrowLeft size={18} />

              <span>
                <small>Previous Article</small>

                <strong>What Happens After You Verify</strong>
              </span>
            </button>

            <button
              type="button"
              className={styles.nextBottom}
              onClick={goToNextArticle}
            >
              <span>
                <small>Next Article</small>

                <strong>Verification Results</strong>
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
                  scrollToSection("verification-scope")
                }
              >
                <span />
                We Focus on Facts, Not Opinions
              </button>

              <button
                type="button"
                className={styles.activeArticle}
                onClick={() =>
                  scrollToSection("what-we-cant-verify")
                }
              >
                <span className={styles.activeDot} />
                What We Can’t Verify
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

                <span>Thanks for your feedback.</span>
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
                  What Happens After You Verify
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

                <strong>Verification Results</strong>
              </span>

              <ArrowRight size={17} />
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}