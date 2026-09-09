"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppShell from "../AppShell/AppShell";
import styles from "./report-details.module.css";

/* =========================================================
   DOCUMENT PACKAGE
   ========================================================= */

const documents = [
  {
    name: "Certificate of Occupancy",
    status: "Verified",
    type: "Primary Document",
  },
  {
    name: "Deed of Assignment",
    status: "Verified",
    type: "Primary Document",
  },
  {
    name: "Survey Plan",
    status: "Verified",
    type: "Primary Document",
  },
  {
    name: "Allocation Letter",
    status: "Verified",
    type: "Primary Document",
  },
];

const additionalDocuments = [
  {
    name: "Receipt of Purchase",
    status: "Verified",
  },
  {
    name: "Site Plan",
    status: "Verified",
  },
];

/* =========================================================
   VERIFICATION TIMELINE
   ========================================================= */

const timeline = [
  {
    title: "Verification Submitted",
    date: "May 20, 2024 · 10:24 AM",
    description:
      "Property verification request and document package submitted.",
    first: true,
  },
  {
    title: "AI Document Analysis",
    date: "May 20, 2024 · 10:26 AM",
    description:
      "Submitted documents scanned for authenticity, alterations and inconsistencies.",
  },
  {
    title: "Legal Verification",
    date: "May 21, 2024 · 02:15 PM",
    description:
      "Property records reviewed against relevant authority records.",
  },
  {
    title: "On-site Inspection",
    date: "May 21, 2024 · 04:30 PM",
    description:
      "Property location physically inspected and observations recorded.",
  },
  {
    title: "Verification Completed",
    date: "May 22, 2024 · 11:45 AM",
    description:
      "All required verification checks completed and verification package issued.",
    last: true,
  },
];

/* =========================================================
   PAGE
   ========================================================= */

export default function VerificationDetailsPage() {
  const router = useRouter();

  /* =======================================================
     SHARE
     ======================================================= */

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "PropertySure AI Verification",
          text:
            "Property verification result — Lekki Phase 1 Property",
          url: window.location.href,
        });
      } catch {
        // User cancelled share.
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard unavailable.
    }
  };

  /* =======================================================
     DOWNLOAD
     ======================================================= */

  const handleDownload = () => {
    window.print();
  };

  return (
    <AppShell activePath="/reports">
      <main className={styles.page}>
        <div className={styles.pageContainer}>

          {/* =================================================
              PAGE HEADING
          ================================================== */}

          <section className={styles.pageHeading}>
            <div>
              <div className={styles.eyebrow}>
                PROPERTY DUE DILIGENCE
              </div>

              <h1>Verification Details</h1>

              <p>
                Full details of your property verification
                package
              </p>
            </div>

            <div className={styles.headingActions}>
              <button
                type="button"
                className={styles.downloadOutline}
                onClick={handleDownload}
              >
                <span className={styles.buttonIcon}>
                  ↓
                </span>
                Download Report
              </button>

              <button
                type="button"
                className={styles.shareOutline}
                onClick={handleShare}
              >
                <span className={styles.buttonIcon}>
                  ↗
                </span>
                Share
              </button>
            </div>
          </section>

          {/* =================================================
              PROPERTY SUMMARY
          ================================================== */}

          <section className={styles.summaryGrid}>

            {/* PROPERTY INFORMATION */}

            <article className={styles.propertyCard}>
              <div className={styles.propertyImageWrap}>
                <img
                  src="/properties/lekki-property.jpg"
                  alt="Lekki Phase 1 property"
                  className={styles.propertyImage}
                />
              </div>

              <div className={styles.propertyInformation}>
                <div className={styles.verificationBadge}>
                  <span className={styles.statusDot} />
                  VERIFICATION COMPLETE
                </div>

                <h2>Lekki Phase 1 Property</h2>

                <p className={styles.location}>
                  Lekki, Lagos State
                </p>

                <div className={styles.propertyMeta}>
                  <div>
                    <span>Verification ID</span>
                    <strong>VER-2024-000256</strong>
                  </div>

                  <div>
                    <span>Date Submitted</span>
                    <strong>May 20, 2024</strong>
                  </div>

                  <div>
                    <span>Date Completed</span>
                    <strong>May 22, 2024</strong>
                  </div>
                </div>

                <div className={styles.propertyFooter}>
                  <div>
                    <span>Verification Team</span>
                    <strong>
                      PropertySure AI + Legal Team
                    </strong>
                  </div>

                  <div>
                    <span>Package Status</span>
                    <strong className={styles.greenText}>
                      All documents verified
                    </strong>
                  </div>
                </div>

                <div className={styles.verificationScope}>
                  <div className={styles.scopeIcon}>
                    ✓
                  </div>

                  <div>
                    <strong>
                      Full Package Verification
                    </strong>

                    <p>
                      Verification covers the submitted
                      property document package and
                      associated verification checks.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* OVERALL SCORE */}

            <article className={styles.scoreCard}>
              <div className={styles.scoreCardHeader}>
                <h3>Overall Verification Score</h3>

                <span className={styles.trustedLabel}>
                  TRUSTED
                </span>
              </div>

              <div className={styles.scoreRing}>
                <div className={styles.scoreInner}>
                  <strong>92%</strong>
                  <span>Trusted</span>
                </div>
              </div>

              <p className={styles.scoreDescription}>
                Strong verification result based on the
                checks completed for this property package.
              </p>

              <div className={styles.scoreLines}>
                <div>
                  <span className={styles.scoreBullet}>●</span>
                  <span>Document Authenticity</span>
                  <strong>95%</strong>
                </div>

                <div>
                  <span className={styles.scoreBullet}>●</span>
                  <span>Ownership Check</span>
                  <strong>90%</strong>
                </div>

                <div>
                  <span className={styles.scoreBullet}>●</span>
                  <span>Legal Compliance</span>
                  <strong>92%</strong>
                </div>

                <div>
                  <span className={styles.scoreBullet}>●</span>
                  <span>Risk Assessment</span>
                  <strong>89%</strong>
                </div>
              </div>
            </article>
          </section>

          {/* =================================================
              LOWER CONTENT
          ================================================== */}

          <section className={styles.dashboardGrid}>

            {/* DOCUMENT PACKAGE */}

            <article
              className={`${styles.card} ${styles.documentCard}`}
            >
              <div className={styles.cardHeading}>
                <div>
                  <h3>Document Package</h3>

                  <p>
                    Documents submitted for this verification
                  </p>
                </div>

                <span className={styles.documentCount}>
                  6 Documents
                </span>
              </div>

              <div className={styles.packageStatusBar}>
                <div className={styles.packageCheck}>
                  ✓
                </div>

                <div>
                  <strong>Package Verified</strong>

                  <small>
                    All submitted documents passed the
                    verification checks.
                  </small>
                </div>
              </div>

              <div className={styles.documentList}>
                {documents.map((document) => (
                  <div
                    className={styles.documentRow}
                    key={document.name}
                  >
                    <div className={styles.documentIcon}>
                      <span>▤</span>
                    </div>

                    <div className={styles.documentInformation}>
                      <strong>{document.name}</strong>

                      <span className={styles.documentStatus}>
                        {document.status}
                      </span>

                      <small>
                        Document authenticity and
                        consistency checks completed
                      </small>
                    </div>

                    <button
                      type="button"
                      className={styles.viewButton}
                    >
                      View
                    </button>

                    <div
                      className={styles.documentCheck}
                      aria-label="Verified"
                    >
                      ✓
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={styles.additionalButton}
              >
                <span>⌄</span>
                View 2 Additional Documents
              </button>

              <div className={styles.additionalDocuments}>
                {additionalDocuments.map((document) => (
                  <div
                    className={styles.additionalDocument}
                    key={document.name}
                  >
                    <span>{document.name}</span>
                    <strong>✓ {document.status}</strong>
                  </div>
                ))}
              </div>
            </article>

            {/* VERIFICATION TIMELINE */}

            <article
              className={`${styles.card} ${styles.timelineCard}`}
            >
              <div className={styles.cardHeading}>
                <div>
                  <h3>Verification Timeline</h3>

                  <p>
                    Complete verification activity
                  </p>
                </div>

                <span className={styles.timelineComplete}>
                  COMPLETE
                </span>
              </div>

              <div className={styles.timeline}>
                {timeline.map((item) => (
                  <div
                    className={`${styles.timelineItem} ${
                      item.last
                        ? styles.timelineLast
                        : ""
                    }`}
                    key={item.title}
                  >
                    <div
                      className={`${styles.timelineDot} ${
                        item.first
                          ? styles.timelineFirst
                          : ""
                      }`}
                    >
                      {item.first ? "●" : "✓"}
                    </div>

                    <div className={styles.timelineContent}>
                      <strong>{item.title}</strong>

                      <span>{item.date}</span>

                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* RIGHT COLUMN */}

            <aside className={styles.rightColumn}>

              {/* RISK */}

              <article
                className={`${styles.card} ${styles.riskCard}`}
              >
                <div className={styles.cardTitleRow}>
                  <h3>Risk Assessment</h3>

                  <span className={styles.statusMini}>
                    CLEAR
                  </span>
                </div>

                <div className={styles.riskResult}>
                  <div className={styles.shield}>
                    ✓
                  </div>

                  <div>
                    <strong>Low Risk</strong>

                    <span>
                      No significant risk indicators
                      identified.
                    </span>
                  </div>
                </div>

                <div className={styles.riskNote}>
                  Based on the verification checks completed
                  for this property package.
                </div>
              </article>

              {/* IMPORTANT NOTES */}

              <article
                className={`${styles.card} ${styles.notesCard}`}
              >
                <h3>Important Notes</h3>

                <ul>
                  <li>
                    Submitted documents passed the
                    authenticity checks.
                  </li>

                  <li>
                    Ownership information was reviewed
                    as part of the verification process.
                  </li>

                  <li>
                    No material legal dispute was
                    identified in the checks performed.
                  </li>

                  <li>
                    Government acquisition status was
                    checked as part of the verification.
                  </li>
                </ul>
              </article>

              {/* ACTIONS */}

              <article
                className={`${styles.card} ${styles.actionsCard}`}
              >
                <h3>Actions</h3>

                <button
                  type="button"
                  className={styles.downloadButton}
                  onClick={handleDownload}
                >
                  <span>↓</span>
                  Download Report
                </button>

                <button
                  type="button"
                  className={styles.shareButton}
                  onClick={handleShare}
                >
                  <span>↗</span>
                  Share Result
                </button>

                <button
                  type="button"
                  className={styles.historyButton}
                  onClick={() =>
                    router.push("/verification-history")
                  }
                >
                  <span>◷</span>
                  View Verification History
                </button>
              </article>
            </aside>

            {/* AI SUMMARY */}

            <article
              className={`${styles.card} ${styles.aiSummary}`}
            >
              <div className={styles.aiIcon}>
                ✦
              </div>

              <div className={styles.aiSummaryContent}>
                <div className={styles.aiSummaryHeading}>
                  <div>
                    <h3>
                      AI Verification Summary
                    </h3>

                    <span className={styles.aiLabel}>
                      AI ANALYSIS COMPLETE
                    </span>
                  </div>

                  <span className={styles.aiStatusDot}>
                    ●
                  </span>
                </div>

                <p>
                  PropertySure AI analyzed the submitted
                  document package for apparent forgery,
                  alterations, inconsistencies and
                  cross-document discrepancies. The
                  documents reviewed in this verification
                  returned a genuine result.
                </p>

                <div className={styles.aiSummaryFooter}>
                  <span className={styles.genuineBadge}>
                    Result: Genuine ✓
                  </span>

                  <span className={styles.aiDisclaimer}>
                    AI-assisted verification
                  </span>
                </div>
              </div>
            </article>

            {/* VERIFICATION NOTICE */}

            <article className={styles.verificationNotice}>
              <div className={styles.noticeIcon}>
                i
              </div>

              <div>
                <strong>Verification Notice</strong>

                <p>
                  This verification report reflects the
                  checks performed by PropertySure AI and
                  its verification team at the time of
                  assessment. It is not, by itself, a
                  transfer of ownership or a substitute for
                  independent legal advice.
                </p>
              </div>
            </article>
          </section>
        </div>
      </main>
    </AppShell>
  );
}