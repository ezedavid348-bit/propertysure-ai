"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileText,
  Landmark,
  Scale,
  Search,
  Shield,
  ThumbsDown,
  ThumbsUp,
  UserRound,
  BadgeCheck,
  Info,
} from "lucide-react";

import styles from "./what-you-can-verify.module.css";

export default function WhatYouCanVerifyArticle() {
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
      "/settings/support-help/help-center/property-verification/how-it-works"
    );
  };

  const goToNextArticle = () => {
    router.push(
      "/settings/support-help/help-center/property-verification/what-happens-after"
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
            <h1>What You Can Verify</h1>

            <p>
              PropertySure AI verifies real information using
              official sources, reliable data, and advanced
              technology. Here are the key things we can verify
              for you.
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
              <Shield size={38} strokeWidth={1.8} />
            </div>

            <div className={styles.introContent}>
              <h2>We Verify Facts You Can Trust</h2>

              <p>
                Our verification process is built on official
                records, trusted data sources, and proven
                technology to give you accurate, reliable
                results.
              </p>
            </div>
          </section>

          {/* =================================================
              WHAT WE CAN VERIFY
          ================================================= */}

          <section
            id="what-we-can-verify"
            className={styles.contentSection}
          >
            <h2>What We Can Verify</h2>

            <p className={styles.sectionDescription}>
              Our verification covers key areas that help you
              make informed property decisions.
            </p>

            <div className={styles.verifyGrid}>
              {/* =================================================
                  OWNERSHIP & TITLE
              ================================================= */}

              <div className={styles.verifyCard}>
                <div
                  className={`${styles.verifyIcon} ${styles.blueIcon}`}
                >
                  <UserRound size={28} />

                  <span className={styles.iconBadge}>
                    <BadgeCheck size={13} />
                  </span>
                </div>

                <h3>Ownership &amp; Title</h3>

                <p>
                  We verify rightful ownership and title
                  information through official records and
                  registries.
                </p>

                <div
                  className={`${styles.sourceTag} ${styles.blueTag}`}
                >
                  <Landmark size={13} />
                  Official Records
                </div>
              </div>

              {/* =================================================
                  DOCUMENT AUTHENTICITY
              ================================================= */}

              <div className={styles.verifyCard}>
                <div
                  className={`${styles.verifyIcon} ${styles.greenIcon}`}
                >
                  <FileCheck2 size={29} />
                </div>

                <h3>Document Authenticity</h3>

                <p>
                  We check the authenticity, legitimacy, and
                  validity of submitted documents.
                </p>

                <div
                  className={`${styles.sourceTag} ${styles.greenTag}`}
                >
                  <Search size={13} />
                  AI + Official Checks
                </div>
              </div>

              {/* =================================================
                  PROPERTY DETAILS & LOCATION
              ================================================= */}

              <div className={styles.verifyCard}>
                <div
                  className={`${styles.verifyIcon} ${styles.yellowIcon}`}
                >
                  <Landmark size={29} />
                </div>

                <h3>Property Details &amp; Location</h3>

                <p>
                  We confirm property details, address,
                  boundaries, and location accuracy.
                </p>

                <div
                  className={`${styles.sourceTag} ${styles.yellowTag}`}
                >
                  <Landmark size={13} />
                  Verified Data Sources
                </div>
              </div>

              {/* =================================================
                  ENCUMBRANCES & LIENS
              ================================================= */}

              <div className={styles.verifyCard}>
                <div
                  className={`${styles.verifyIcon} ${styles.purpleIcon}`}
                >
                  <Scale size={29} />
                </div>

                <h3>Encumbrances &amp; Liens</h3>

                <p>
                  We check for any liens, legal restrictions,
                  mortgages, or encumbrances on the property.
                </p>

                <div
                  className={`${styles.sourceTag} ${styles.purpleTag}`}
                >
                  <FileText size={13} />
                  Official Databases
                </div>
              </div>

              {/* =================================================
                  DISPUTES & CLAIMS
              ================================================= */}

              <div className={styles.verifyCard}>
                <div
                  className={`${styles.verifyIcon} ${styles.blueIcon}`}
                >
                  <Shield size={29} />
                </div>

                <h3>Disputes &amp; Claims</h3>

                <p>
                  We identify any disputes, claims, or legal
                  cases related to the property.
                </p>

                <div
                  className={`${styles.sourceTag} ${styles.blueTag}`}
                >
                  <Landmark size={13} />
                  Court &amp; Public Records
                </div>
              </div>

              {/* =================================================
                  COMPLIANCE CHECKS
              ================================================= */}

              <div className={styles.verifyCard}>
                <div
                  className={`${styles.verifyIcon} ${styles.greenIcon}`}
                >
                  <BadgeCheck size={29} />
                </div>

                <h3>Compliance Checks</h3>

                <p>
                  We verify compliance with applicable
                  regulations, approvals, and permits.
                </p>

                <div
                  className={`${styles.sourceTag} ${styles.greenTag}`}
                >
                  <CheckCircle2 size={13} />
                  Regulatory Sources
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              WHY THIS MATTERS
          ================================================= */}

          <section
            id="why-this-matters"
            className={styles.contentSection}
          >
            <h2>Why This Matters</h2>

            <p className={styles.sectionDescription}>
              Knowing what we can verify helps you understand
              the reliability and scope of your verification
              report.
            </p>

            <div className={styles.benefitsGrid}>
              {/* =================================================
                  BENEFIT 1
              ================================================= */}

              <div className={styles.benefitItem}>
                <div
                  className={`${styles.benefitIcon} ${styles.benefitBlue}`}
                >
                  <Shield size={23} />
                </div>

                <div>
                  <h3>Accurate &amp; Reliable</h3>

                  <p>
                    We focus on verifiable facts, not
                    assumptions or opinions.
                  </p>
                </div>
              </div>

              {/* =================================================
                  BENEFIT 2
              ================================================= */}

              <div className={styles.benefitItem}>
                <div
                  className={`${styles.benefitIcon} ${styles.benefitGreen}`}
                >
                  <CheckCircle2 size={23} />
                </div>

                <div>
                  <h3>Decision Confidence</h3>

                  <p>
                    Verified information helps you make better
                    property decisions.
                  </p>
                </div>
              </div>

              {/* =================================================
                  BENEFIT 3
              ================================================= */}

              <div className={styles.benefitItem}>
                <div
                  className={`${styles.benefitIcon} ${styles.benefitYellow}`}
                >
                  <Shield size={23} />
                </div>

                <div>
                  <h3>Secure &amp; Private</h3>

                  <p>
                    Your data is encrypted and handled with
                    the highest security.
                  </p>
                </div>
              </div>

              {/* =================================================
                  BENEFIT 4
              ================================================= */}

              <div className={styles.benefitItem}>
                <div
                  className={`${styles.benefitIcon} ${styles.benefitPurple}`}
                >
                  <Search size={23} />
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
              IMPORTANT NOTE / TIP
          ================================================= */}

          <div
            id="important-note"
            className={styles.tipBox}
          >
            <div className={styles.tipIcon}>
              <Info size={23} />
            </div>

            <p>
              <strong>Tip:</strong>{" "}
              The more accurate and complete the information
              and documents you provide, the more accurate and
              comprehensive your verification report will be.
            </p>
          </div>

          {/* =================================================
              BOTTOM ARTICLE NAVIGATION
          ================================================= */}

          <div className={styles.bottomNavigation}>
            {/* PREVIOUS */}

            <button
              type="button"
              className={styles.previousBottom}
              onClick={goToPreviousArticle}
            >
              <ArrowLeft size={18} />

              <span>
                <small>Previous Article</small>

                <strong>
                  How It Works (Overview)
                </strong>
              </span>
            </button>

            {/* NEXT */}

            <button
              type="button"
              className={styles.nextBottom}
              onClick={goToNextArticle}
            >
              <span>
                <small>Next Article</small>

                <strong>
                  What Happens After You Verify
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
              {/* INTRO */}

              <button
                type="button"
                onClick={() =>
                  scrollToSection("verification-scope")
                }
              >
                <span />
                We Verify Facts You Can Trust
              </button>

              {/* ACTIVE SECTION */}

              <button
                type="button"
                className={styles.activeArticle}
                onClick={() =>
                  scrollToSection("what-we-can-verify")
                }
              >
                <span className={styles.activeDot} />
                What We Can Verify
              </button>

              {/* WHY THIS MATTERS */}

              <button
                type="button"
                onClick={() =>
                  scrollToSection("why-this-matters")
                }
              >
                <span />
                Why This Matters
              </button>

              {/* IMPORTANT NOTE */}

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
            {/* PREVIOUS ARTICLE */}

            <button
              type="button"
              className={styles.sidePrevious}
              onClick={goToPreviousArticle}
            >
              <ArrowLeft size={16} />

              <span>
                <small>Previous Article</small>

                <strong>
                  How It Works (Overview)
                </strong>
              </span>
            </button>

            <div className={styles.sideDivider} />

            {/* NEXT ARTICLE */}

            <button
              type="button"
              className={styles.sideNext}
              onClick={goToNextArticle}
            >
              <span>
                <small>Next Article</small>

                <strong>
                  What Happens After You Verify
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