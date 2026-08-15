"use client";

import React from "react";

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
   MAIN PAGE
   ========================================================= */

export default function VerificationDetailsPage() {

  /* =======================================================
     SHARE FUNCTION
     ======================================================= */

  const handleShare = async () => {
    if (navigator.share) {
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
    } else {
      try {
        await navigator.clipboard.writeText(
          window.location.href
        );
      } catch {
        // Clipboard unavailable.
      }
    }
  };


  /* =======================================================
     DOWNLOAD / REPORT PLACEHOLDER
     ======================================================= */

  const handleDownload = () => {
    /*
      Later this button can be connected to your
      generated PropertySure AI PDF report.

      Example future implementation:

      window.open(
        `/api/reports/VER-2024-000256`,
        "_blank"
      );
    */

    window.print();
  };


  return (
    <main className="verification-page">

      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">
            ◆
          </div>

          <div>
            <div className="brand-name">
              PropertySure AI
            </div>

            <div className="brand-tagline">
              Verify. Trust. Invest.
            </div>
          </div>

        </div>


        <nav className="sidebar-nav">

        <a href="/dashboard">
            <span className="nav-icon">⌂</span>
            Dashboard
          </a>

          <a href="/verification-history">
            <span className="nav-icon">◷</span>
            Verification History
          </a>

          <a
            href="/my-properties"
            className="active"
          >
            <span className="nav-icon">⌂</span>
            My Properties
          </a>

          <a href="/reports">
            <span className="nav-icon">▣</span>
            Reports
          </a>

          <a href="/fraud-watch">
            <span className="nav-icon">♢</span>
            Fraud Watch
          </a>

        </nav>


        <div className="sidebar-divider" />


        <nav className="sidebar-nav">

          <a href="/account">
            <span className="nav-icon">♙</span>
            Account
          </a>

          <a href="/settings">
            <span className="nav-icon">⚙</span>
            Settings
          </a>

        </nav>


        <div className="help-card">

          <h4>
            Need Help?
          </h4>

          <p>
            Our support team is here to assist you.
          </p>

          <button type="button">
            Contact Support
          </button>

        </div>


        <div className="profile-card">

          <div className="avatar">
            D
          </div>

          <div className="profile-info">

            <strong>
              David Eze
            </strong>

            <span>
              Premium Plan
            </span>

          </div>

          <span className="profile-menu">
            ⋮
          </span>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="main-content">


        {/* ===================================================
            DESKTOP TOP BAR
        ==================================================== */}

        <header className="desktop-topbar">

          <a
            href="/my-properties"
            className="back-link"
          >
            ‹ Back to My Properties
          </a>


          <div className="topbar-right">

            <div className="search-box">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search anything..."
                aria-label="Search"
              />

              <kbd>
                Ctrl K
              </kbd>

            </div>


            <div className="notification">

              ♧

              <span>
                3
              </span>

            </div>


            <div className="top-profile">

              <div className="avatar">
                D
              </div>

              <div>

                <strong>
                  David Eze
                </strong>

                <small>
                  Premium Plan
                </small>

              </div>

              <span>
                ⌄
              </span>

            </div>

          </div>

        </header>


        {/* ===================================================
            MOBILE HEADER
        ==================================================== */}

        <header className="mobile-header">

          <button
            type="button"
            onClick={() => window.history.back()}
            aria-label="Go back"
          >
            ‹
          </button>


          <strong>
            Verification Details
          </strong>


          <button
            type="button"
            onClick={handleShare}
            aria-label="Share verification"
          >
            ⇧
          </button>

        </header>


        <div className="page-container">


          {/* =================================================
              PAGE HEADING
          ================================================== */}

          <div className="page-heading">

            <div>

              <div className="heading-eyebrow">
                PROPERTY DUE DILIGENCE
              </div>

              <h1>
                Verification Details
              </h1>

              <p>
                Full details of your property verification
                package
              </p>

            </div>


            <div className="heading-actions">

              <button
                type="button"
                className="download-outline"
                onClick={handleDownload}
              >
                ⇩ Download Report
              </button>


              <button
                type="button"
                className="share-outline"
                onClick={handleShare}
              >
                ♧ Share
              </button>

            </div>

          </div>


          {/* =================================================
              PROPERTY SUMMARY
          ================================================== */}

          <section className="summary-grid">


            {/* PROPERTY INFORMATION */}

            <div className="property-card">

              <img
                src="/properties/lekki-property.jpg"
                alt="Lekki Phase 1 property"
                className="property-image"
              />


              <div className="property-information">

                <div className="verification-badge">
                  <span>●</span>
                  VERIFICATION COMPLETE
                </div>


                <h2>
                  Lekki Phase 1 Property
                </h2>


                <p className="location">
                  Lekki, Lagos State
                </p>


                <div className="property-meta">

                  <div>

                    <span>
                      Verification ID
                    </span>

                    <strong>
                      VER-2024-000256
                    </strong>

                  </div>


                  <div>

                    <span>
                      Date Submitted
                    </span>

                    <strong>
                      May 20, 2024
                    </strong>

                  </div>


                  <div>

                    <span>
                      Date Completed
                    </span>

                    <strong>
                      May 22, 2024
                    </strong>

                  </div>

                </div>


                <div className="property-footer">

                  <div>

                    <span>
                      Verification Team
                    </span>

                    <strong>
                      PropertySure AI + Legal Team
                    </strong>

                  </div>


                  <div>

                    <span>
                      Package Status
                    </span>

                    <strong className="green-text">
                      All documents verified
                    </strong>

                  </div>

                </div>


                <div className="verification-scope">

                  <span className="scope-icon">
                    ✓
                  </span>

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

            </div>


            {/* =================================================
                OVERALL SCORE
            ================================================== */}

            <div className="score-card">

              <div className="score-card-header">

                <h3>
                  Overall Verification Score
                </h3>

                <span className="trusted-label">
                  TRUSTED
                </span>

              </div>


              <div className="score-ring">

                <div className="score-inner">

                  <strong>
                    92%
                  </strong>

                  <span>
                    Trusted
                  </span>

                </div>

              </div>


              <p className="score-description">
                Strong verification result based on the
                checks completed for this property package.
              </p>


              <div className="score-lines">

                <div>

                  <span>
                    ●
                  </span>

                  Document Authenticity

                  <strong>
                    95%
                  </strong>

                </div>


                <div>

                  <span>
                    ●
                  </span>

                  Ownership Check

                  <strong>
                    90%
                  </strong>

                </div>


                <div>

                  <span>
                    ●
                  </span>

                  Legal Compliance

                  <strong>
                    92%
                  </strong>

                </div>


                <div>

                  <span>
                    ●
                  </span>

                  Risk Assessment

                  <strong>
                    89%
                  </strong>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              LOWER DASHBOARD
          ================================================== */}

          <section className="dashboard-grid">


            {/* =================================================
                DOCUMENT PACKAGE
            ================================================== */}

            <div className="card document-card">

              <div className="card-heading">

                <div>

                  <h3>
                    Document Package
                  </h3>

                  <p className="card-subtitle">
                    Documents submitted for this verification
                  </p>

                </div>


                <span>
                  6 Documents
                </span>

              </div>


              <div className="package-status-bar">

                <span className="package-check">
                  ✓
                </span>

                <div>

                  <strong>
                    Package Verified
                  </strong>

                  <small>
                    All submitted documents passed the
                    verification checks.
                  </small>

                </div>

              </div>


              <div className="document-list">

                {documents.map((document) => (

                  <div
                    className="document-row"
                    key={document.name}
                  >

                    <div className="document-thumbnail">
                      ▤
                    </div>


                    <div className="document-information">

                      <strong>
                        {document.name}
                      </strong>

                      <span>
                        {document.status}
                      </span>

                      <small>
                        Document authenticity and
                        consistency checks completed
                      </small>

                    </div>


                    <button
                      type="button"
                      className="view-button"
                    >
                      View
                    </button>


                    <div
                      className="check"
                      aria-label="Verified"
                    >
                      ✓
                    </div>

                  </div>

                ))}

              </div>


              <button
                type="button"
                className="additional-button"
              >
                ⌄ View 2 Additional Documents
              </button>

            </div>


            {/* =================================================
                VERIFICATION TIMELINE
            ================================================== */}

            <div className="card timeline-card">

              <div className="card-heading">

                <div>

                  <h3>
                    Verification Timeline
                  </h3>

                  <p className="card-subtitle">
                    Complete verification activity
                  </p>

                </div>

                <span className="timeline-complete">
                  COMPLETE
                </span>

              </div>


              <div className="timeline">

                {timeline.map((item) => (

                  <div
                    className={`timeline-item ${
                      item.last ? "last" : ""
                    }`}
                    key={item.title}
                  >

                    <div
                      className={`timeline-dot ${
                        item.first ? "first" : ""
                      }`}
                    >
                      {item.first ? "●" : "✓"}
                    </div>


                    <div className="timeline-content">

                      <strong>
                        {item.title}
                      </strong>

                      <span>
                        {item.date}
                      </span>

                      <p>
                        {item.description}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>


            {/* =================================================
                RIGHT COLUMN
            ================================================== */}

            <div className="right-column">


              {/* RISK */}

              <div className="card risk-card">

                <div className="card-title-row">

                  <h3>
                    Risk Assessment
                  </h3>

                  <span className="status-mini">
                    CLEAR
                  </span>

                </div>


                <div className="risk-result">

                  <div className="shield">
                    ✓
                  </div>


                  <div>

                    <strong>
                      Low Risk
                    </strong>

                    <span>
                      No significant risk indicators
                      identified.
                    </span>

                  </div>

                </div>


                <div className="risk-note">
                  Based on the verification checks completed
                  for this property package.
                </div>

              </div>


              {/* IMPORTANT NOTES */}

              <div className="card notes-card">

                <h3>
                  Important Notes
                </h3>


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

              </div>


              {/* ACTIONS */}

              <div className="card actions-card">

                <h3>
                  Actions
                </h3>


                <button
                  type="button"
                  className="download-button"
                  onClick={handleDownload}
                >
                  ⇩ Download Report
                </button>


                <button
                  type="button"
                  className="share-button"
                  onClick={handleShare}
                >
                  ♧ Share Result
                </button>

              </div>

            </div>


            {/* =================================================
                AI SUMMARY
            ================================================== */}

            <div className="card ai-summary">

              <div className="ai-icon">
                ✦
              </div>


              <div className="ai-summary-content">

                <div className="ai-summary-heading">

                  <div>

                    <h3>
                      AI Verification Summary
                    </h3>

                    <span className="ai-label">
                      AI ANALYSIS COMPLETE
                    </span>

                  </div>


                  <span className="ai-status-dot">
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


                <div className="ai-summary-footer">

                  <span className="genuine-badge">
                    Result: Genuine ✓
                  </span>

                  <span className="ai-disclaimer">
                    AI-assisted verification
                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                VERIFICATION NOTICE
            ================================================== */}

            <div className="verification-notice">

              <span className="notice-icon">
                i
              </span>

              <div>

                <strong>
                  Verification Notice
                </strong>

                <p>
                  This verification report reflects the
                  checks performed by PropertySure AI and
                  its verification team at the time of
                  assessment. It is not, by itself, a
                  transfer of ownership or a substitute for
                  independent legal advice.
                </p>

              </div>

            </div>

          </section>

        </div>


        {/* =====================================================
            MOBILE BOTTOM NAVIGATION
        ====================================================== */}

        <nav className="mobile-bottom-nav">

          <a href="/dashboard">

            <span>
              ⌂
            </span>

            Dashboard

          </a>


          <a href="/verification-history">

            <span>
              ◷
            </span>

            History

          </a>


          <button
            type="button"
            className="add-button"
            aria-label="Add new verification"
          >
            +
          </button>


          <a
            href="/my-properties"
            className="selected"
          >

            <span>
              ⌂
            </span>

            Properties

          </a>


          <a href="/account">

            <span>
              ♙
            </span>

            Account

          </a>

        </nav>

      </section>


      {/* =====================================================
          STYLES
      ====================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }


        html,
        body {
          margin: 0;
          padding: 0;
        }


        :global(body) {
          margin: 0;
          background: #061a36;
        }


        button,
        input {
          font-family: inherit;
        }


        button {
          -webkit-tap-highlight-color: transparent;
        }


        .verification-page {

          --bg: #061a36;
          --sidebar: #06172f;
          --card: #081f3d;
          --card-soft: #0a294f;

          --border: #1b4778;
          --border-soft: #193c63;

          --text: #f4f7fc;
          --muted: #8ea5c2;
          --muted-2: #7892b1;

          --blue: #2f86ff;
          --green: #25df8b;

          min-height: 100vh;

          display: flex;

          background: var(--bg);

          color: var(--text);

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }


        /* =====================================================
           SIDEBAR
        ====================================================== */

        .sidebar {

          width: 210px;
          min-width: 210px;

          min-height: 100vh;

          background: var(--sidebar);

          border-right: 1px solid #173b66;

          padding: 22px 14px;

          display: flex;
          flex-direction: column;
        }


        .brand {

          display: flex;
          align-items: center;

          gap: 9px;

          margin-bottom: 28px;
        }


        .brand-logo {

          width: 32px;
          height: 32px;

          border-radius: 9px;

          background: #173d6b;

          display: grid;
          place-items: center;

          color: #31e39a;

          font-size: 20px;
        }


        .brand-name {

          font-weight: 700;
          font-size: 15px;
        }


        .brand-tagline {

          color: var(--muted);

          font-size: 8px;

          margin-top: 2px;
        }


        .sidebar-nav {

          display: grid;
          gap: 5px;
        }


        .sidebar-nav a {

          padding: 11px 10px;

          border-radius: 7px;

          color: #9eb2cc;

          text-decoration: none;

          font-size: 11px;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }


        .sidebar-nav a:hover {

          background: #0d2c52;

          color: white;
        }


        .sidebar-nav a.active {

          background: #123b74;

          color: #ffffff;
        }


        .nav-icon {

          display: inline-block;

          width: 22px;

          color: #7fa4cf;
        }


        .sidebar-divider {

          height: 1px;

          background: #173b66;

          margin: 18px 6px;
        }


        .help-card {

          margin-top: auto;

          border: 1px solid #173e6c;

          background: #081d39;

          border-radius: 8px;

          padding: 13px;
        }


        .help-card h4 {

          margin: 0;

          font-size: 11px;
        }


        .help-card p {

          color: var(--muted);

          font-size: 9px;

          line-height: 1.45;

          margin: 8px 0 12px;
        }


        .help-card button {

          width: 100%;

          background: transparent;

          color: #58a0ff;

          border: 1px solid var(--blue);

          border-radius: 5px;

          padding: 7px;

          font-size: 9px;

          cursor: pointer;
        }


        .help-card button:hover {

          background: rgba(47, 134, 255, 0.1);
        }


        .profile-card {

          margin-top: 12px;

          border: 1px solid #173b66;

          border-radius: 8px;

          padding: 9px;

          display: flex;

          align-items: center;

          gap: 8px;
        }


        .avatar {

          width: 27px;
          height: 27px;

          border-radius: 50%;

          background: #435b77;

          display: grid;
          place-items: center;

          font-size: 10px;

          font-weight: 700;
        }


        .profile-info strong {

          display: block;

          font-size: 9px;
        }


        .profile-info span {

          color: var(--muted);

          font-size: 8px;
        }


        .profile-menu {

          margin-left: auto;

          color: var(--muted);
        }


        /* =====================================================
           MAIN
        ====================================================== */

        .main-content {

          flex: 1;

          min-width: 0;
        }


        .desktop-topbar {

          height: 64px;

          border-bottom: 1px solid #173b66;

          display: flex;

          justify-content: space-between;

          align-items: center;

          padding: 0 24px;
        }


        .back-link {

          color: #4093ff;

          text-decoration: none;

          font-size: 11px;
        }


        .back-link:hover {

          text-decoration: underline;
        }


        .topbar-right {

          display: flex;

          align-items: center;

          gap: 18px;
        }


        .search-box {

          width: 230px;
          height: 32px;

          border: 1px solid #244a72;

          border-radius: 6px;

          display: flex;

          align-items: center;

          padding: 0 9px;

          color: var(--muted);

          font-size: 10px;
        }


        .search-box input {

          flex: 1;

          min-width: 0;

          border: 0;

          outline: 0;

          background: transparent;

          color: white;

          margin-left: 6px;
        }


        .search-box input::placeholder {

          color: #728baa;
        }


        .search-box kbd {

          font-size: 8px;

          color: #728baa;

          border: 0;

          background: transparent;
        }


        .notification {

          position: relative;
        }


        .notification span {

          position: absolute;

          top: -8px;
          right: -8px;

          width: 15px;
          height: 15px;

          border-radius: 50%;

          background: #ef4444;

          display: grid;

          place-items: center;

          font-size: 8px;
        }


        .top-profile {

          display: flex;

          align-items: center;

          gap: 7px;
        }


        .top-profile strong {

          display: block;

          font-size: 10px;
        }


        .top-profile small {

          display: block;

          color: var(--muted);

          font-size: 8px;
        }


        /* =====================================================
           PAGE
        ====================================================== */

        .page-container {

          width: 100%;

          max-width: 1250px;

          margin: auto;

          padding: 22px 25px;
        }


        .page-heading {

          display: flex;

          justify-content: space-between;

          align-items: flex-end;

          margin-bottom: 16px;
        }


        .heading-eyebrow {

          color: #4c9cff;

          font-size: 7px;

          font-weight: 700;

          letter-spacing: 1px;

          margin-bottom: 5px;
        }


        .page-heading h1 {

          margin: 0;

          font-size: 25px;

          letter-spacing: -0.4px;
        }


        .page-heading p {

          margin: 4px 0 0;

          color: var(--muted);

          font-size: 10px;
        }


        .heading-actions {

          display: flex;

          gap: 8px;
        }


        .heading-actions button {

          height: 34px;

          padding: 0 13px;

          border-radius: 6px;

          font-size: 10px;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.15s ease;
        }


        .heading-actions button:active,
        .actions-card button:active {

          transform: translateY(1px);
        }


        .download-outline {

          background: transparent;

          color: #55a0ff;

          border: 1px solid var(--blue);
        }


        .download-outline:hover {

          background: rgba(47, 134, 255, 0.1);
        }


        .share-outline {

          background: transparent;

          color: #b2c2d5;

          border: 1px solid #315273;
        }


        .share-outline:hover {

          background: rgba(255, 255, 255, 0.04);
        }


        /* =====================================================
           PROPERTY SUMMARY
        ====================================================== */

        .summary-grid {

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            270px;

          gap: 11px;

          margin-bottom: 11px;
        }


        .property-card,
        .score-card,
        .card {

          background: var(--card);

          border: 1px solid var(--border);

          border-radius: 9px;
        }


        .property-card {

          min-height: 250px;

          padding: 9px;

          display: grid;

          grid-template-columns:
            245px
            minmax(0, 1fr);

          gap: 17px;
        }


        .property-image {

          width: 245px;

          height: 230px;

          object-fit: cover;

          border-radius: 6px;

          display: block;
        }


        .property-information {

          padding: 6px 4px;

          min-width: 0;
        }


        .verification-badge {

          display: inline-flex;

          align-items: center;

          gap: 5px;

          color: var(--green);

          border: 1px solid #146d55;

          background: #0b3c34;

          border-radius: 20px;

          padding: 4px 7px;

          font-size: 7px;

          font-weight: 700;
        }


        .property-information h2 {

          font-size: 22px;

          margin: 12px 0 3px;

          line-height: 1.2;
        }


        .location {

          margin: 0;

          color: var(--muted);

          font-size: 10px;
        }


        .property-meta {

          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 14px;

          margin-top: 25px;

          padding-bottom: 15px;

          border-bottom: 1px solid var(--border-soft);
        }


        .property-meta span,
        .property-footer span {

          display: block;

          color: var(--muted-2);

          font-size: 8px;
        }


        .property-meta strong {

          display: block;

          font-size: 9px;

          margin-top: 4px;
        }


        .property-footer {

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);

          gap: 15px;

          margin-top: 14px;
        }


        .property-footer strong {

          display: block;

          font-size: 9px;

          margin-top: 4px;

          line-height: 1.35;
        }


        .green-text {

          color: var(--green);
        }


        /* =====================================================
           VERIFICATION SCOPE
        ====================================================== */

        .verification-scope {

          display: flex;

          align-items: flex-start;

          gap: 8px;

          margin-top: 13px;

          padding: 9px;

          background: #0a2948;

          border: 1px solid #163e68;

          border-radius: 6px;
        }


        .scope-icon {

          width: 19px;

          height: 19px;

          min-width: 19px;

          border-radius: 50%;

          display: grid;

          place-items: center;

          background: #0b3c34;

          color: var(--green);

          font-size: 9px;
        }


        .verification-scope strong {

          display: block;

          color: #dce8f6;

          font-size: 8px;
        }


        .verification-scope p {

          color: #7892b1;

          font-size: 7px;

          line-height: 1.4;

          margin: 3px 0 0;
        }


        /* =====================================================
           SCORE
        ====================================================== */

        .score-card {

          padding: 15px;
        }


        .score-card-header {

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 8px;
        }


        .score-card h3,
        .card h3 {

          margin: 0;

          font-size: 12px;
        }


        .trusted-label {

          color: var(--green);

          font-size: 6px;

          font-weight: 700;

          letter-spacing: 0.6px;
        }


        .score-ring {

          width: 110px;

          height: 110px;

          border-radius: 50%;

          margin: 17px auto 10px;

          background:
            conic-gradient(
              var(--green) 0deg 331deg,
              #1a395c 331deg 360deg
            );

          display: grid;

          place-items: center;
        }


        .score-inner {

          width: 87px;

          height: 87px;

          border-radius: 50%;

          background: var(--card);

          display: grid;

          place-items: center;

          align-content: center;
        }


        .score-inner strong {

          font-size: 23px;
        }


        .score-inner span {

          color: var(--green);

          font-size: 8px;

          margin-top: 2px;
        }


        .score-description {

          text-align: center;

          color: var(--muted);

          font-size: 8px;

          line-height: 1.45;

          margin: 0 0 15px;
        }


        .score-lines {

          display: grid;

          gap: 8px;
        }


        .score-lines div {

          color: #b5c4d7;

          font-size: 8px;

          line-height: 1.3;
        }


        .score-lines span {

          color: var(--green);

          margin-right: 5px;
        }


        .score-lines strong {

          float: right;

          color: #fff;
        }


        /* =====================================================
           LOWER GRID
        ====================================================== */

        .dashboard-grid {

          width: 100%;

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr)
            270px;

          gap: 11px;

          align-items: start;
        }


        .card {

          padding: 15px;

          min-width: 0;
        }


        .card-heading {

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 10px;

          padding-bottom: 9px;

          border-bottom: 1px solid var(--border-soft);
        }


        .card-heading h3 {

          font-size: 12px;
        }


        .card-subtitle {

          margin: 3px 0 0;

          color: #7189a7;

          font-size: 7px;
        }


        .card-heading > span {

          flex-shrink: 0;

          color: #9eb1c8;

          border: 1px solid #315071;

          border-radius: 12px;

          padding: 4px 7px;

          font-size: 8px;
        }


        .timeline-complete {

          color: var(--green) !important;

          border-color: #12654e !important;

          background: #0a3b31;
        }


        /* =====================================================
           PACKAGE STATUS
        ====================================================== */

        .package-status-bar {

          display: flex;

          align-items: center;

          gap: 8px;

          margin: 10px 0 3px;

          padding: 8px;

          background: #092b4b;

          border-radius: 6px;
        }


        .package-check {

          width: 21px;

          height: 21px;

          border-radius: 50%;

          background: #0b3c34;

          color: var(--green);

          display: grid;

          place-items: center;

          font-size: 10px;
        }


        .package-status-bar strong {

          display: block;

          color: #dce8f6;

          font-size: 8px;
        }


        .package-status-bar small {

          display: block;

          color: #728aa7;

          font-size: 6px;

          margin-top: 2px;
        }


        /* =====================================================
           DOCUMENTS
        ====================================================== */

        .document-row {

          min-height: 62px;

          display: grid;

          grid-template-columns:
            32px
            minmax(0, 1fr)
            auto
            auto;

          align-items: center;

          gap: 8px;

          border-bottom: 1px solid #17375c;
        }


        .document-row:last-child {

          border-bottom: 0;
        }


        .document-thumbnail {

          width: 32px;

          height: 40px;

          border-radius: 3px;

          background: #e8edf2;

          color: #405168;

          display: grid;

          place-items: center;

          font-size: 15px;
        }


        .document-information {

          min-width: 0;
        }


        .document-information strong {

          display: block;

          font-size: 9px;

          line-height: 1.3;
        }


        .document-information span {

          display: block;

          color: var(--green);

          font-size: 8px;

          margin-top: 3px;
        }


        .document-information small {

          display: block;

          color: #8299b5;

          font-size: 7px;

          margin-top: 3px;

          line-height: 1.3;
        }


        .view-button {

          background: transparent;

          border: 1px solid var(--blue);

          color: #52a0ff;

          border-radius: 5px;

          padding: 6px 10px;

          font-size: 8px;

          cursor: pointer;
        }


        .view-button:hover {

          background: rgba(47, 134, 255, 0.1);
        }


        .check {

          color: var(--green);

          font-size: 14px;
        }


        .additional-button {

          width: 100%;

          margin-top: 10px;

          padding: 9px;

          background: var(--card-soft);

          border: 1px solid #173b64;

          border-radius: 5px;

          color: #9db2cb;

          font-size: 8px;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }


        .additional-button:hover {

          background: #0d315b;

          border-color: #285b8d;
        }


        /* =====================================================
           TIMELINE
        ====================================================== */

        .timeline {

          margin-top: 7px;
        }


        .timeline-item {

          position: relative;

          display: grid;

          grid-template-columns:
            22px
            minmax(0, 1fr);

          gap: 9px;

          padding: 10px 0;
        }


        .timeline-item:not(.last)::after {

          content: "";

          position: absolute;

          left: 8px;

          top: 28px;

          bottom: -4px;

          width: 1px;

          background: #2375d6;
        }


        .timeline-dot {

          width: 18px;

          height: 18px;

          border-radius: 50%;

          background: var(--green);

          color: #05203a;

          display: grid;

          place-items: center;

          font-size: 9px;

          z-index: 2;
        }


        .timeline-dot.first {

          background: var(--blue);

          color: white;
        }


        .timeline-content {

          min-width: 0;
        }


        .timeline-item strong {

          display: block;

          font-size: 9px;

          line-height: 1.3;
        }


        .timeline-item span {

          display: block;

          color: #829ab7;

          font-size: 7px;

          margin-top: 3px;
        }


        .timeline-item p {

          color: #9eb1c7;

          font-size: 7px;

          margin: 4px 0 0;

          line-height: 1.45;
        }


        /* =====================================================
           RIGHT COLUMN
        ====================================================== */

        .right-column {

          display: grid;

          gap: 11px;

          min-width: 0;
        }


        .card-title-row {

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 8px;
        }


        .status-mini {

          color: var(--green);

          background: #0a3b31;

          border: 1px solid #12654e;

          border-radius: 10px;

          padding: 3px 6px;

          font-size: 6px;

          font-weight: 700;

          letter-spacing: 0.5px;
        }


        .risk-result {

          display: flex;

          align-items: center;

          gap: 10px;

          margin-top: 14px;
        }


        .shield {

          width: 37px;

          height: 37px;

          min-width: 37px;

          border: 2px solid var(--green);

          border-radius: 8px;

          display: grid;

          place-items: center;

          color: var(--green);

          font-size: 17px;
        }


        .risk-result strong {

          display: block;

          color: var(--green);

          font-size: 14px;
        }


        .risk-result span {

          display: block;

          color: #849ab5;

          font-size: 7px;

          margin-top: 3px;

          line-height: 1.35;
        }


        .risk-note {

          margin-top: 12px;

          padding-top: 9px;

          border-top: 1px solid #17375c;

          color: #7189a7;

          font-size: 7px;

          line-height: 1.45;
        }


        .notes-card ul {

          margin: 13px 0 0;

          padding-left: 14px;
        }


        .notes-card li {

          color: #9eb1c7;

          font-size: 8px;

          margin-bottom: 7px;

          line-height: 1.45;
        }


        .notes-card li:last-child {

          margin-bottom: 0;
        }


        .actions-card {

          display: flex;

          flex-direction: column;
        }


        .download-button,
        .share-button {

          width: 100%;

          height: 35px;

          border-radius: 5px;

          font-size: 9px;

          margin-top: 9px;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }


        .download-button {

          background: #1977f5;

          color: white;

          border: 1px solid #3d93ff;
        }


        .download-button:hover {

          background: #2683ff;
        }


        .share-button {

          background: transparent;

          color: #4e9aff;

          border: 1px solid #267cf1;
        }


        .share-button:hover {

          background: rgba(47, 134, 255, 0.1);
        }


        /* =====================================================
           AI SUMMARY
        ====================================================== */

        .ai-summary {

          grid-column: 1 / 3;

          display: flex;

          gap: 12px;

          align-items: flex-start;

          min-width: 0;
        }


        .ai-icon {

          width: 38px;

          height: 38px;

          min-width: 38px;

          border-radius: 7px;

          background: #102f58;

          color: #55a4ff;

          display: grid;

          place-items: center;

          font-size: 18px;
        }


        .ai-summary-content {

          min-width: 0;

          flex: 1;
        }


        .ai-summary-heading {

          display: flex;

          justify-content: space-between;

          align-items: flex-start;
        }


        .ai-summary p {

          color: #91a6c0;

          font-size: 8px;

          line-height: 1.55;

          margin: 7px 0;
        }


        .ai-label {

          display: block;

          color: #5e8fbd;

          font-size: 6px;

          margin-top: 3px;

          letter-spacing: 0.5px;
        }


        .ai-status-dot {

          color: var(--green);

          font-size: 8px;
        }


        .ai-summary-footer {

          display: flex;

          align-items: center;

          gap: 9px;

          flex-wrap: wrap;
        }


        .genuine-badge {

          display: inline-block;

          color: var(--green);

          border: 1px solid #12654e;

          background: #0a3b31;

          border-radius: 14px;

          padding: 5px 8px;

          font-size: 8px;
        }


        .ai-disclaimer {

          color: #637d9d;

          font-size: 7px;
        }


        /* =====================================================
           VERIFICATION NOTICE
        ====================================================== */

        .verification-notice {

          grid-column: 1 / 4;

          display: flex;

          align-items: flex-start;

          gap: 10px;

          padding: 11px 13px;

          background: #071d38;

          border: 1px solid #163c64;

          border-radius: 8px;
        }


        .notice-icon {

          width: 20px;

          height: 20px;

          min-width: 20px;

          border-radius: 50%;

          border: 1px solid #52759b;

          color: #86a4c4;

          display: grid;

          place-items: center;

          font-size: 10px;

          font-weight: 700;
        }


        .verification-notice strong {

          display: block;

          color: #b7c9dc;

          font-size: 8px;
        }


        .verification-notice p {

          margin: 3px 0 0;

          color: #6f88a6;

          font-size: 7px;

          line-height: 1.5;
        }


        /* =====================================================
           MOBILE
        ====================================================== */

        .mobile-header {

          display: none;
        }


        .mobile-bottom-nav {

          display: none;
        }


        /* =====================================================
           TABLET
        ====================================================== */

        @media (max-width: 900px) {

          .sidebar {

            width: 185px;

            min-width: 185px;
          }


          .dashboard-grid {

            grid-template-columns:
              minmax(0, 1fr)
              minmax(0, 1fr);
          }


          .right-column {

            grid-column: 1 / 3;

            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }


          .ai-summary {

            grid-column: 1 / 3;
          }


          .verification-notice {

            grid-column: 1 / 3;
          }

        }


        /* =====================================================
           MOBILE PHONE
        ====================================================== */

        @media (max-width: 700px) {

          .verification-page {

            display: block;

            width: 100%;

            min-width: 0;

            padding-bottom:
              calc(
                82px +
                env(safe-area-inset-bottom)
              );
          }


          .sidebar,
          .desktop-topbar {

            display: none;
          }


          .main-content {

            width: 100%;

            min-width: 0;
          }


          /* MOBILE HEADER */

          .mobile-header {

            width: 100%;

            height: 64px;

            display: grid;

            grid-template-columns:
              40px
              minmax(0, 1fr)
              40px;

            align-items: center;

            background: #061a36;

            border-bottom: 1px solid #173b66;

            padding: 0 14px;

            position: sticky;

            top: 0;

            z-index: 20;
          }


          .mobile-header button {

            width: 40px;

            height: 40px;

            border: 0;

            background: transparent;

            color: white;

            font-size: 27px;

            cursor: pointer;

            display: grid;

            place-items: center;
          }


          .mobile-header strong {

            text-align: center;

            font-size: 14px;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;
          }


          /* PAGE */

          .page-container {

            width: 100%;

            max-width: none;

            margin: 0;

            padding: 18px 14px 95px;
          }


          .page-heading {

            display: block;

            width: 100%;

            margin-bottom: 14px;
          }


          .heading-eyebrow {

            font-size: 7px;

            margin-bottom: 5px;
          }


          .page-heading h1 {

            font-size: 24px;

            line-height: 1.2;
          }


          .page-heading p {

            font-size: 10px;

            line-height: 1.4;
          }


          .heading-actions {

            width: 100%;

            margin-top: 14px;

            display: grid;

            grid-template-columns:
              minmax(0, 1fr)
              minmax(0, 1fr);

            gap: 8px;
          }


          .heading-actions button {

            width: 100%;

            min-width: 0;

            height: 42px;

            padding: 0 8px;
          }


          /* PROPERTY */

          .summary-grid {

            width: 100%;

            display: block;

            margin-bottom: 12px;
          }


          .property-card {

            width: 100%;

            min-width: 0;

            display: block;

            padding: 9px;
          }


          .property-image {

            width: 100%;

            height: 220px;

            border-radius: 7px;
          }


          .property-information {

            width: 100%;

            padding: 15px 5px 6px;
          }


          .verification-badge {

            font-size: 7px;

            padding: 5px 8px;
          }


          .property-information h2 {

            font-size: 21px;

            line-height: 1.2;

            margin-top: 13px;
          }


          .location {

            font-size: 10px;
          }


          .property-meta {

            grid-template-columns:
              minmax(0, 1fr);

            gap: 13px;

            margin-top: 20px;

            padding-bottom: 14px;
          }


          .property-meta span,
          .property-footer span {

            font-size: 8px;
          }


          .property-meta strong,
          .property-footer strong {

            font-size: 10px;
          }


          .property-footer {

            grid-template-columns:
              minmax(0, 1fr);

            gap: 13px;

            margin-top: 13px;
          }


          .verification-scope {

            margin-top: 14px;

            padding: 10px;
          }


          .verification-scope strong {

            font-size: 9px;
          }


          .verification-scope p {

            font-size: 7px;

            line-height: 1.5;
          }


          /* SCORE */

          .score-card {

            width: 100%;

            min-width: 0;

            margin-top: 12px;

            padding: 16px;
          }


          .score-card h3 {

            font-size: 14px;
          }


          .trusted-label {

            font-size: 7px;
          }


          .score-ring {

            width: 122px;

            height: 122px;

            margin-top: 18px;
          }


          .score-inner {

            width: 96px;

            height: 96px;
          }


          .score-inner strong {

            font-size: 26px;
          }


          .score-inner span {

            font-size: 9px;
          }


          .score-description {

            font-size: 9px;

            margin: 0 0 17px;
          }


          .score-lines {

            gap: 11px;
          }


          .score-lines div {

            font-size: 10px;
          }


          /* MOBILE DASHBOARD */

          .dashboard-grid {

            width: 100%;

            min-width: 0;

            display: flex;

            flex-direction: column;

            align-items: stretch;

            gap: 12px;
          }


          .document-card,
          .timeline-card,
          .right-column,
          .ai-summary,
          .verification-notice {

            width: 100%;

            max-width: none;

            min-width: 0;

            flex: 0 0 auto;
          }


          .right-column {

            display: flex;

            flex-direction: column;

            align-items: stretch;

            gap: 12px;
          }


          .right-column > .card {

            width: 100%;

            min-width: 0;
          }


          .card {

            padding: 15px;

            border-radius: 10px;
          }


          .card-heading h3,
          .card-title-row h3 {

            font-size: 14px;
          }


          .card-subtitle {

            font-size: 7px;
          }


          /* PACKAGE STATUS */

          .package-status-bar {

            margin-top: 11px;

            padding: 9px;
          }


          .package-status-bar strong {

            font-size: 9px;
          }


          .package-status-bar small {

            font-size: 7px;
          }


          /* DOCUMENT PACKAGE */

          .document-row {

            width: 100%;

            min-width: 0;

            min-height: 70px;

            grid-template-columns:
              40px
              minmax(0, 1fr)
              auto;

            gap: 10px;
          }


          .document-thumbnail {

            width: 40px;

            height: 48px;

            font-size: 16px;
          }


          .document-information {

            min-width: 0;
          }


          .document-information strong {

            font-size: 10px;

            line-height: 1.35;
          }


          .document-information span {

            font-size: 9px;

            margin-top: 3px;
          }


          .document-information small {

            font-size: 8px;

            line-height: 1.35;

            margin-top: 3px;
          }


          .view-button {

            display: none;
          }


          .check {

            display: flex;

            align-items: center;

            justify-content: center;

            width: 22px;

            font-size: 18px;
          }


          .additional-button {

            width: 100%;

            height: 44px;

            font-size: 9px;

            margin-top: 12px;
          }


          /* TIMELINE */

          .timeline-card {

            width: 100%;
          }


          .timeline {

            width: 100%;

            margin-top: 8px;
          }


          .timeline-item {

            width: 100%;

            grid-template-columns:
              22px
              minmax(0, 1fr);

            gap: 10px;

            padding: 11px 0;
          }


          .timeline-item:not(.last)::after {

            left: 8px;

            top: 30px;

            bottom: -5px;
          }


          .timeline-item strong {

            font-size: 10px;

            line-height: 1.35;
          }


          .timeline-item span {

            font-size: 8px;

            margin-top: 4px;
          }


          .timeline-item p {

            font-size: 8px;

            line-height: 1.45;

            margin-top: 5px;
          }


          /* RISK */

          .risk-card {

            padding: 16px;
          }


          .risk-result {

            margin-top: 13px;

            gap: 11px;
          }


          .shield {

            width: 48px;

            height: 48px;

            min-width: 48px;

            border-radius: 9px;

            font-size: 21px;
          }


          .risk-result strong {

            font-size: 17px;
          }


          .risk-result span {

            font-size: 8px;

            margin-top: 4px;
          }


          .risk-note {

            font-size: 8px;

            line-height: 1.5;
          }


          .status-mini {

            font-size: 7px;

            padding: 4px 7px;
          }


          /* NOTES */

          .notes-card {

            padding: 16px;
          }


          .notes-card ul {

            margin-top: 13px;

            padding-left: 17px;
          }


          .notes-card li {

            font-size: 9px;

            margin-bottom: 9px;

            line-height: 1.45;
          }


          /* ACTIONS */

          .actions-card {

            padding: 16px;
          }


          .actions-card h3 {

            font-size: 14px;
          }


          .download-button,
          .share-button {

            height: 46px;

            font-size: 10px;

            border-radius: 7px;

            margin-top: 10px;
          }


          /* AI SUMMARY */

          .ai-summary {

            display: flex;

            align-items: flex-start;

            gap: 12px;

            grid-column: auto;

            padding: 16px;
          }


          .ai-icon {

            width: 44px;

            height: 44px;

            min-width: 44px;

            border-radius: 9px;

            font-size: 19px;
          }


          .ai-summary-content {

            min-width: 0;

            flex: 1;
          }


          .ai-summary h3 {

            font-size: 14px;

            line-height: 1.3;
          }


          .ai-label {

            font-size: 6px;
          }


          .ai-summary p {

            font-size: 9px;

            line-height: 1.55;

            margin: 8px 0 10px;
          }


          .genuine-badge {

            font-size: 8px;

            padding: 6px 9px;
          }


          .ai-disclaimer {

            font-size: 7px;
          }


          /* VERIFICATION NOTICE */

          .verification-notice {

            display: flex;

            padding: 12px;

            gap: 9px;

            grid-column: auto;
          }


          .verification-notice strong {

            font-size: 9px;
          }


          .verification-notice p {

            font-size: 7px;

            line-height: 1.55;
          }


          /* MOBILE BOTTOM NAV */

          .mobile-bottom-nav {

            position: fixed;

            left: 0;

            right: 0;

            bottom: 0;

            width: 100%;

            min-height: 74px;

            height:
              calc(
                74px +
                env(safe-area-inset-bottom)
              );

            padding-bottom:
              env(safe-area-inset-bottom);

            background: #071b37;

            border-top: 1px solid #1a3d66;

            z-index: 50;

            display: grid;

            grid-template-columns:
              minmax(0, 1fr)
              minmax(0, 1fr)
              minmax(0, 1fr)
              minmax(0, 1fr)
              minmax(0, 1fr);

            align-items: center;
          }


          .mobile-bottom-nav a {

            height: 54px;

            color: #8ba0ba;

            text-decoration: none;

            font-size: 8px;

            text-align: center;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            gap: 3px;
          }


          .mobile-bottom-nav a span {

            display: block;

            font-size: 19px;

            line-height: 1;
          }


          .mobile-bottom-nav a.selected {

            color: #3d94ff;
          }


          .add-button {

            width: 56px;

            height: 56px;

            border-radius: 50%;

            border: 0;

            background: #287ff3;

            color: white;

            font-size: 30px;

            margin: auto;

            cursor: pointer;

            box-shadow:
              0 6px 18px rgba(0, 0, 0, 0.25);
          }


          .add-button:active {

            transform: scale(0.96);
          }

        }


        /* =====================================================
           VERY SMALL PHONES
        ====================================================== */

        @media (max-width: 380px) {

          .page-container {

            padding-left: 10px;

            padding-right: 10px;
          }


          .page-heading h1 {

            font-size: 22px;
          }


          .property-image {

            height: 200px;
          }


          .card {

            padding: 13px;
          }


          .document-row {

            grid-template-columns:
              36px
              minmax(0, 1fr)
              auto;

            gap: 8px;
          }


          .document-thumbnail {

            width: 36px;

            height: 44px;
          }


          .document-information strong {

            font-size: 9px;
          }


          .document-information small {

            font-size: 7px;
          }


          .card-heading h3,
          .card-title-row h3 {

            font-size: 12px;
          }


          .score-ring {

            width: 112px;

            height: 112px;
          }


          .score-inner {

            width: 88px;

            height: 88px;
          }


          .score-lines div {

            font-size: 9px;
          }


          .ai-summary {

            gap: 9px;
          }


          .ai-icon {

            width: 40px;

            height: 40px;

            min-width: 40px;
          }


          .ai-summary h3 {

            font-size: 12px;
          }


          .verification-scope {

            padding: 8px;
          }

        }


        /* =====================================================
           PRINT
        ====================================================== */

        @media print {

          .sidebar,
          .desktop-topbar,
          .mobile-header,
          .mobile-bottom-nav,
          .heading-actions {

            display: none !important;
          }


          .verification-page {

            display: block;

            background: white;

            color: black;
          }


          .main-content {

            width: 100%;
          }


          .page-container {

            max-width: none;

            padding: 20px;
          }


          .property-card,
          .score-card,
          .card,
          .verification-notice {

            break-inside: avoid;

            border-color: #ccc;

            background: white;

            color: black;
          }


          .verification-notice {

            display: flex;
          }

        }

      `}</style>

    </main>
  );
}