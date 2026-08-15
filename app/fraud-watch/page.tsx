"use client";

import React from "react";

const alerts = [
  {
    title: "Multiple Sale Detected",
    property: "Lekki Phase 1 Property",
    location: "Lekki, Lagos State",
    type: "Multiple Sale",
    risk: "High",
    status: "Active",
    date: "May 22, 2024",
    time: "10:24 AM",
    icon: "⚠",
    image: "/properties/lekki-property.jpg",
  },
  {
    title: "Document Mismatch",
    property: "Victoria Island Property",
    location: "Victoria Island, Lagos",
    type: "Document Issue",
    risk: "Medium",
    status: "Under Review",
    date: "May 21, 2024",
    time: "02:15 PM",
    icon: "▤",
    image: "/properties/lekki-property.jpg",
  },
  {
    title: "Owner Dispute",
    property: "Ikoyi Residential Plot",
    location: "Ikoyi, Lagos State",
    type: "Ownership Dispute",
    risk: "High",
    status: "Active",
    date: "May 20, 2024",
    time: "11:45 AM",
    icon: "⚠",
    image: "/properties/lekki-property.jpg",
  },
  {
    title: "Fake Document Detected",
    property: "Ajah Land Parcel",
    location: "Ajah, Lagos State",
    type: "Fake Document",
    risk: "Medium",
    status: "Under Review",
    date: "May 19, 2024",
    time: "09:30 AM",
    icon: "▤",
    image: "/properties/lekki-property.jpg",
  },
  {
    title: "Watchlist Match Cleared",
    property: "Surulere Building",
    location: "Surulere, Lagos State",
    type: "Watchlist Match",
    risk: "Low",
    status: "Cleared",
    date: "May 18, 2024",
    time: "04:20 PM",
    icon: "✓",
    image: "/properties/lekki-property.jpg",
  },
];

const stats = [
  {
    title: "High Risk Alerts",
    value: "12",
    change: "↑ 20% this week",
    icon: "⚠",
    type: "danger",
  },
  {
    title: "Properties Monitored",
    value: "24",
    change: "↑ 8% this week",
    icon: "⌂",
    type: "orange",
  },
  {
    title: "Watchlist Matches",
    value: "7",
    change: "↑ 16% this week",
    icon: "◇",
    type: "yellow",
  },
  {
    title: "Cleared Alerts",
    value: "18",
    change: "↑ 25% this week",
    icon: "✓",
    type: "green",
  },
];

function MiniChart({ type }: { type: string }) {
  return (
    <div className={`mini-chart ${type}`}>
      <svg
        viewBox="0 0 180 45"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
          points="0,35 15,31 27,34 40,27 54,30 67,22 82,25 97,17 112,20 128,12 142,18 156,8 168,13 180,5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export default function FraudWatchPage() {
  return (
    <main className="fraud-page">

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
              PropertySure <span>AI</span>
            </div>

            <div className="brand-tagline">
              Verify with Confidence
            </div>
          </div>

        </div>


        <nav className="sidebar-nav">

          <a href="/fraud-watch">
            <span className="nav-icon">⌂</span>
            Dashboard
          </a>

          <a href="/verification-history">
            <span className="nav-icon">◷</span>
            Verification History
          </a>

          <a href="/my-properties">
            <span className="nav-icon">⌂</span>
            My Properties
          </a>

          <a href="/verification-details">
            <span className="nav-icon">◉</span>
            Verification Details
          </a>

          <a
            href="/fraud-watch"
            className="active"
          >
            <span className="nav-icon">♢</span>
            Fraud Watch
          </a>

          <a href="/reports">
            <span className="nav-icon">▣</span>
            Reports
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


        <div className="sidebar-profile">

          <div className="avatar">
            EK
          </div>

          <div>
            <strong>
              Eze Ked
            </strong>

            <span>
              Premium Plan
            </span>
          </div>

          <span className="profile-arrow">
            ⌄
          </span>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <section className="main-content">


        {/* DESKTOP HEADER */}

        <header className="desktop-header">

          <div className="header-spacer" />

          <div className="header-actions">

            <div className="notification">
              ♧
              <span>3</span>
            </div>

            <div className="header-profile">

              <div className="avatar small">
                EK
              </div>

              <div>
                <strong>
                  Eze Ked
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


        {/* MOBILE HEADER */}

        <header className="mobile-header">

          <button
            type="button"
            aria-label="Open menu"
          >
            ☰
          </button>

          <strong>
            Fraud Watch
          </strong>

          <button
            type="button"
            className="mobile-notification"
            aria-label="Notifications"
          >
            ♧
            <span>3</span>
          </button>

        </header>


        <div className="page-container">


          {/* =================================================
              PAGE HEADING
          ================================================== */}

          <div className="page-heading">

            <div>

              <h1>
                Fraud Watch
              </h1>

              <p>
                AI-powered monitoring and alerts to help you
                avoid property fraud and scams.
              </p>

            </div>

          </div>


          {/* =================================================
              STAT CARDS
          ================================================== */}

          <section className="stats-grid">

            {stats.map((stat) => (

              <div
                className={`stat-card ${stat.type}`}
                key={stat.title}
              >

                <div className="stat-top">

                  <div className="stat-icon">
                    {stat.icon}
                  </div>

                  <div>

                    <span className="stat-title">
                      {stat.title}
                    </span>

                    <strong className="stat-value">
                      {stat.value}
                    </strong>

                    <span className="stat-change">
                      {stat.change}
                    </span>

                  </div>

                </div>


                <MiniChart type={stat.type} />

              </div>

            ))}

          </section>


          {/* =================================================
              SEARCH + FILTERS
          ================================================== */}

          <section className="filter-bar">

            <div className="search-input">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search by property, location, name, phone or document..."
                aria-label="Search fraud alerts"
              />

            </div>


            <button
              type="button"
              className="filter-button"
            >
              All Alert Types
              <span>⌄</span>
            </button>


            <button
              type="button"
              className="filter-button"
            >
              All Risk Levels
              <span>⌄</span>
            </button>


            <button
              type="button"
              className="filter-button"
            >
              All Status
              <span>⌄</span>
            </button>


            <button
              type="button"
              className="date-button"
            >
              ▣ &nbsp; May 1, 2024 - May 22, 2024
            </button>

          </section>


          {/* =================================================
              RECENT ALERTS
          ================================================== */}

          <section className="alerts-card">

            <div className="section-header">

              <div>

                <h2>
                  Recent Fraud Alerts
                </h2>

                <p>
                  Stay informed about potential fraud and
                  suspicious activities.
                </p>

              </div>


              <button
                type="button"
                className="view-all"
              >
                View All Alerts
                <span>→</span>
              </button>

            </div>


            {/* DESKTOP TABLE */}

            <div className="desktop-alert-list">

              <div className="alert-header">

                <span>Alert</span>
                <span>Type</span>
                <span>Risk Level</span>
                <span>Detected</span>
                <span>Status</span>
                <span />

              </div>


              {alerts.map((alert) => (

                <div
                  className="alert-row"
                  key={alert.title}
                >

                  <div className="alert-property">

                    <div
                      className={`alert-icon ${
                        alert.risk.toLowerCase()
                      }`}
                    >
                      {alert.icon}
                    </div>

                    <img
                      src={alert.image}
                      alt=""
                    />

                    <div>

                      <strong>
                        {alert.title}
                      </strong>

                      <span>
                        {alert.property}
                      </span>

                      <small>
                        {alert.location}
                      </small>

                    </div>

                  </div>


                  <div className="alert-type">
                    {alert.type}
                  </div>


                  <div>

                    <span
                      className={`risk-pill ${alert.risk.toLowerCase()}`}
                    >
                      {alert.risk}
                    </span>

                  </div>


                  <div className="detected">

                    <strong>
                      {alert.date}
                    </strong>

                    <span>
                      {alert.time}
                    </span>

                  </div>


                  <div>

                    <span
                      className={`status-pill ${alert.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {alert.status}
                    </span>

                  </div>


                  <button
                    type="button"
                    className="details-button"
                  >
                    View Details
                  </button>

                </div>

              ))}

            </div>


            {/* MOBILE ALERT LIST */}

            <div className="mobile-alert-list">

              {alerts.map((alert) => (

                <button
                  type="button"
                  className="mobile-alert-row"
                  key={alert.title}
                >

                  <div
                    className={`mobile-alert-icon ${
                      alert.risk.toLowerCase()
                    }`}
                  >
                    {alert.icon}
                  </div>


                  <div className="mobile-alert-info">

                    <strong>
                      {alert.title}
                    </strong>

                    <span>
                      {alert.property}
                    </span>


                    <div className="mobile-alert-meta">

                      <span
                        className={`risk-pill ${alert.risk.toLowerCase()}`}
                      >
                        {alert.risk}
                      </span>

                      <span>
                        {alert.time}
                      </span>

                    </div>

                  </div>


                  <span className="mobile-arrow">
                    ›
                  </span>

                </button>

              ))}

            </div>

          </section>


          {/* =================================================
              AI FRAUD DETECTION
          ================================================== */}

          <section className="ai-fraud-card">

            <div className="ai-introduction">

              <div className="ai-main-icon">
                ✦
              </div>

              <div>

                <h2>
                  AI Fraud Detection
                </h2>

                <p>
                  Our AI continuously scans multiple data
                  sources to identify fraud patterns and
                  protect you from property scams.
                </p>

                <button
                  type="button"
                  className="learn-more"
                >
                  Learn more
                  <span>→</span>
                </button>

              </div>

            </div>


            <div className="ai-feature">

              <div className="feature-icon purple">
                ◷
              </div>

              <strong>
                24/7 Monitoring
              </strong>

              <span>
                Continuous monitoring
                across data sources
              </span>

            </div>


            <div className="ai-feature">

              <div className="feature-icon yellow">
                ♧
              </div>

              <strong>
                Smart Alerts
              </strong>

              <span>
                Real-time alerts on
                suspicious activities
              </span>

            </div>


            <div className="ai-feature">

              <div className="feature-icon green">
                ✣
              </div>

              <strong>
                Data Intelligence
              </strong>

              <span>
                AI-powered analysis
                and risk detection
              </span>

            </div>


            <div className="ai-feature">

              <div className="feature-icon blue">
                ♢
              </div>

              <strong>
                Protect Your Investment
              </strong>

              <span>
                Stay safe and invest
                with confidence
              </span>

            </div>

          </section>

        </div>


        {/* =====================================================
            MOBILE BOTTOM NAV
        ====================================================== */}

        <nav className="mobile-bottom-nav">

          <a href="/dashboard">

            <span>⌂</span>
            Dashboard

          </a>


          <a href="/verification-history">

            <span>◷</span>
            History

          </a>


          <a href="/my-properties">

            <span>⌂</span>
            Properties

          </a>


          <a
            href="/fraud-watch"
            className="selected"
          >

            <span>♢</span>
            Fraud Watch

          </a>


          <a href="/account">

            <span>♙</span>
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

        :global(html),
        :global(body) {
          margin: 0;
          padding: 0;
          background: #030c17;
        }

        button,
        input {
          font-family: inherit;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }

        .fraud-page {
          --bg: #030c17;
          --sidebar: #071321;
          --card: #091827;
          --card-2: #0b1c2e;
          --border: #19324b;
          --border-light: #21405e;
          --text: #f4f7fb;
          --muted: #8297ad;
          --muted-2: #647b94;
          --blue: #3b91ff;
          --green: #28e58f;
          --red: #ff4d4d;
          --orange: #ff951f;
          --yellow: #e9c61d;

          min-height: 100vh;
          display: flex;
          background:
            radial-gradient(
              circle at 70% 0%,
              rgba(30, 88, 140, 0.08),
              transparent 30%
            ),
            var(--bg);
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
          width: 220px;
          min-width: 220px;
          min-height: 100vh;
          background: var(--sidebar);
          border-right: 1px solid #142a40;
          padding: 24px 14px 18px;
          display: flex;
          flex-direction: column;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 8px;
          margin-bottom: 34px;
        }

        .brand-logo {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: #123a36;
          color: var(--green);
          display: grid;
          place-items: center;
          font-size: 19px;
          box-shadow:
            0 0 20px rgba(40, 229, 143, 0.08);
        }

        .brand-name {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.2px;
        }

        .brand-name span {
          color: var(--green);
        }

        .brand-tagline {
          color: #7890a8;
          font-size: 8px;
          margin-top: 3px;
        }

        .sidebar-nav {
          display: grid;
          gap: 5px;
        }

        .sidebar-nav a {
          display: flex;
          align-items: center;
          min-height: 40px;
          padding: 0 10px;
          border-radius: 7px;
          color: #91a4b9;
          text-decoration: none;
          font-size: 11px;
          transition: 0.2s ease;
        }

        .sidebar-nav a:hover {
          background: #0c2339;
          color: white;
        }

        .sidebar-nav a.active {
          background: #0b382f;
          color: var(--green);
          box-shadow:
            inset 2px 0 0 var(--green);
        }

        .nav-icon {
          width: 27px;
          color: #7189a1;
          font-size: 15px;
        }

        .sidebar-nav a.active .nav-icon {
          color: var(--green);
        }

        .sidebar-divider {
          height: 1px;
          background: #162c42;
          margin: 20px 7px;
        }

        .sidebar-profile {
          margin-top: auto;
          border: 1px solid #1a3249;
          background: #091a2b;
          border-radius: 9px;
          padding: 11px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #18563e;
          color: var(--green);
          display: grid;
          place-items: center;
          font-size: 10px;
          font-weight: 700;
        }

        .avatar.small {
          width: 28px;
          height: 28px;
          font-size: 8px;
        }

        .sidebar-profile strong,
        .header-profile strong {
          display: block;
          font-size: 10px;
        }

        .sidebar-profile span,
        .header-profile small {
          display: block;
          color: #7890a8;
          font-size: 8px;
          margin-top: 2px;
        }

        .profile-arrow {
          margin-left: auto;
          color: #758ba2 !important;
          font-size: 14px !important;
        }


        /* =====================================================
           MAIN HEADER
        ====================================================== */

        .main-content {
          flex: 1;
          min-width: 0;
        }

        .desktop-header {
          height: 64px;
          border-bottom: 1px solid #142a40;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 24px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notification {
          position: relative;
          color: #8da0b4;
          font-size: 17px;
        }

        .notification span,
        .mobile-notification span {
          position: absolute;
          top: -7px;
          right: -8px;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #ed4040;
          color: white;
          display: grid;
          place-items: center;
          font-size: 8px;
        }

        .header-profile {
          display: flex;
          align-items: center;
          gap: 7px;
        }


        /* =====================================================
           PAGE
        ====================================================== */

        .page-container {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
          padding: 27px 28px 35px;
        }

        .page-heading {
          margin-bottom: 22px;
        }

        .page-heading h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.7px;
        }

        .page-heading p {
          margin: 5px 0 0;
          color: var(--muted);
          font-size: 10px;
        }


        /* =====================================================
           STAT CARDS
        ====================================================== */

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 13px;
        }

        .stat-card {
          min-width: 0;
          height: 150px;
          padding: 16px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 9px;
          overflow: hidden;
        }

        .stat-top {
          display: flex;
          gap: 11px;
          align-items: flex-start;
        }

        .stat-icon {
          width: 39px;
          height: 39px;
          min-width: 39px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 18px;
        }

        .stat-card.danger .stat-icon {
          background: rgba(255, 77, 77, 0.14);
          color: var(--red);
        }

        .stat-card.orange .stat-icon {
          background: rgba(255, 149, 31, 0.14);
          color: var(--orange);
        }

        .stat-card.yellow .stat-icon {
          background: rgba(233, 198, 29, 0.14);
          color: var(--yellow);
        }

        .stat-card.green .stat-icon {
          background: rgba(40, 229, 143, 0.12);
          color: var(--green);
        }

        .stat-title {
          display: block;
          color: #a0b1c3;
          font-size: 9px;
        }

        .stat-value {
          display: block;
          margin-top: 4px;
          font-size: 23px;
          line-height: 1;
        }

        .stat-change {
          display: block;
          margin-top: 7px;
          font-size: 8px;
        }

        .danger .stat-change {
          color: var(--red);
        }

        .orange .stat-change {
          color: var(--orange);
        }

        .yellow .stat-change {
          color: var(--yellow);
        }

        .green .stat-change {
          color: var(--green);
        }

        .mini-chart {
          height: 40px;
          margin-top: 8px;
          opacity: 0.9;
        }

        .mini-chart svg {
          width: 100%;
          height: 100%;
        }

        .mini-chart.danger {
          color: var(--red);
        }

        .mini-chart.orange {
          color: var(--orange);
        }

        .mini-chart.yellow {
          color: var(--yellow);
        }

        .mini-chart.green {
          color: var(--green);
        }


        /* =====================================================
           FILTERS
        ====================================================== */

        .filter-bar {
          display: grid;
          grid-template-columns:
            minmax(230px, 1fr)
            auto
            auto
            auto
            auto;
          gap: 8px;
          margin-bottom: 12px;
        }

        .search-input,
        .filter-button,
        .date-button {
          height: 36px;
          border: 1px solid #1c3852;
          background: #081727;
          border-radius: 6px;
          color: #91a5b9;
        }

        .search-input {
          display: flex;
          align-items: center;
          padding: 0 10px;
        }

        .search-input span {
          font-size: 15px;
          color: #6d8399;
        }

        .search-input input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: white;
          font-size: 9px;
          margin-left: 7px;
        }

        .search-input input::placeholder {
          color: #687e94;
        }

        .filter-button,
        .date-button {
          padding: 0 11px;
          font-size: 8px;
          cursor: pointer;
          white-space: nowrap;
        }

        .filter-button span {
          margin-left: 10px;
        }

        .date-button {
          color: #a0b0c1;
        }


        /* =====================================================
           ALERT CARD
        ====================================================== */

        .alerts-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 9px;
          overflow: hidden;
        }

        .section-header {
          padding: 17px 16px 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #162f47;
        }

        .section-header h2 {
          margin: 0;
          font-size: 13px;
        }

        .section-header p {
          margin: 4px 0 0;
          color: #71869d;
          font-size: 8px;
        }

        .view-all {
          height: 32px;
          padding: 0 11px;
          border: 1px solid #25435d;
          border-radius: 6px;
          background: transparent;
          color: #a3b5c7;
          font-size: 8px;
          cursor: pointer;
        }

        .view-all span {
          color: var(--green);
          margin-left: 6px;
        }


        /* ALERT TABLE */

        .alert-header,
        .alert-row {
          display: grid;
          grid-template-columns:
            minmax(250px, 2.2fr)
            1fr
            0.8fr
            1fr
            0.8fr
            0.9fr;
          align-items: center;
          gap: 12px;
        }

        .alert-header {
          min-height: 35px;
          padding: 0 16px;
          color: #60768d;
          font-size: 7px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          border-bottom: 1px solid #162f47;
        }

        .alert-row {
          min-height: 78px;
          padding: 8px 16px;
          border-bottom: 1px solid #142c43;
        }

        .alert-row:last-child {
          border-bottom: 0;
        }

        .alert-property {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .alert-property img {
          width: 42px;
          height: 42px;
          object-fit: cover;
          border-radius: 5px;
          flex-shrink: 0;
        }

        .alert-property > div:last-child {
          min-width: 0;
        }

        .alert-property strong {
          display: block;
          font-size: 9px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .alert-property span {
          display: block;
          margin-top: 3px;
          font-size: 8px;
          color: #c1ccd7;
        }

        .alert-property small {
          display: block;
          margin-top: 2px;
          font-size: 7px;
          color: #6f849a;
        }

        .alert-icon {
          width: 25px;
          height: 25px;
          min-width: 25px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 12px;
        }

        .alert-icon.high {
          color: var(--red);
          background: rgba(255, 77, 77, 0.1);
        }

        .alert-icon.medium {
          color: var(--orange);
          background: rgba(255, 149, 31, 0.1);
        }

        .alert-icon.low {
          color: var(--green);
          background: rgba(40, 229, 143, 0.1);
        }

        .alert-type {
          color: #a5b5c4;
          font-size: 8px;
        }

        .risk-pill,
        .status-pill {
          display: inline-block;
          border-radius: 5px;
          padding: 5px 7px;
          font-size: 7px;
          white-space: nowrap;
        }

        .risk-pill.high {
          color: #ff6464;
          background: rgba(255, 77, 77, 0.1);
          border: 1px solid rgba(255, 77, 77, 0.25);
        }

        .risk-pill.medium {
          color: #ffab3b;
          background: rgba(255, 149, 31, 0.1);
          border: 1px solid rgba(255, 149, 31, 0.25);
        }

        .risk-pill.low {
          color: var(--green);
          background: rgba(40, 229, 143, 0.1);
          border: 1px solid rgba(40, 229, 143, 0.25);
        }

        .status-pill.active {
          color: #ff6464;
          background: rgba(255, 77, 77, 0.08);
          border: 1px solid rgba(255, 77, 77, 0.2);
        }

        .status-pill.under-review {
          color: #ffab3b;
          background: rgba(255, 149, 31, 0.08);
          border: 1px solid rgba(255, 149, 31, 0.2);
        }

        .status-pill.cleared {
          color: var(--green);
          background: rgba(40, 229, 143, 0.08);
          border: 1px solid rgba(40, 229, 143, 0.2);
        }

        .detected strong {
          display: block;
          font-size: 7px;
          color: #d1dbe5;
        }

        .detected span {
          display: block;
          margin-top: 3px;
          font-size: 7px;
          color: #73899f;
        }

        .details-button {
          height: 31px;
          border: 1px solid #24425d;
          background: transparent;
          border-radius: 6px;
          color: #9bb0c3;
          font-size: 7px;
          cursor: pointer;
        }

        .details-button:hover {
          border-color: var(--blue);
          color: #64a7ff;
        }


        /* =====================================================
           AI FRAUD SECTION
        ====================================================== */

        .ai-fraud-card {
          margin-top: 12px;
          min-height: 135px;
          padding: 18px 16px;
          display: grid;
          grid-template-columns:
            1.4fr
            repeat(4, 1fr);
          gap: 12px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 9px;
        }

        .ai-introduction {
          display: flex;
          gap: 10px;
          padding-right: 10px;
          border-right: 1px solid #193149;
        }

        .ai-main-icon {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 8px;
          background: #1c244a;
          color: #7783ff;
          display: grid;
          place-items: center;
          font-size: 17px;
        }

        .ai-introduction h2 {
          margin: 0;
          font-size: 12px;
        }

        .ai-introduction p {
          color: #7f94aa;
          font-size: 7px;
          line-height: 1.5;
          margin: 6px 0;
        }

        .learn-more {
          border: 0;
          padding: 0;
          background: transparent;
          color: #50a1ff;
          font-size: 7px;
          cursor: pointer;
        }

        .learn-more span {
          margin-left: 5px;
        }

        .ai-feature {
          text-align: center;
          padding: 0 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .feature-icon {
          width: 31px;
          height: 31px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .feature-icon.purple {
          color: #b26aff;
          background: rgba(178, 106, 255, 0.1);
        }

        .feature-icon.yellow {
          color: var(--yellow);
          background: rgba(233, 198, 29, 0.1);
        }

        .feature-icon.green {
          color: var(--green);
          background: rgba(40, 229, 143, 0.1);
        }

        .feature-icon.blue {
          color: #4f9cff;
          background: rgba(79, 156, 255, 0.1);
        }

        .ai-feature strong {
          font-size: 8px;
        }

        .ai-feature span {
          color: #758aa0;
          font-size: 7px;
          line-height: 1.4;
          margin-top: 4px;
        }


        /* =====================================================
           MOBILE
        ====================================================== */

        .mobile-header,
        .mobile-alert-list,
        .mobile-bottom-nav {
          display: none;
        }


        /* =====================================================
           TABLET
        ====================================================== */

        @media (max-width: 1000px) {

          .sidebar {
            width: 190px;
            min-width: 190px;
          }

          .stats-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .filter-bar {
            grid-template-columns:
              1fr
              1fr
              1fr;
          }

          .search-input {
            grid-column: 1 / 4;
          }

          .ai-fraud-card {
            grid-template-columns:
              1fr
              1fr;
              1fr;
          }

          .ai-introduction {
            grid-column: 1 / 4;
            border-right: 0;
            border-bottom: 1px solid #193149;
            padding-bottom: 14px;
          }
        }


        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 700px) {

          .fraud-page {
            display: block;
            width: 100%;
            min-height: 100vh;
            padding-bottom:
              calc(76px + env(safe-area-inset-bottom));
          }


          .sidebar,
          .desktop-header {
            display: none;
          }


          .main-content {
            width: 100%;
          }


          /* MOBILE HEADER */

          .mobile-header {
            width: 100%;
            height: 62px;
            padding: 0 15px;
            display: grid;
            grid-template-columns:
              40px
              1fr
              40px;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 30;
            background: #061321;
            border-bottom: 1px solid #172c42;
          }

          .mobile-header button {
            width: 38px;
            height: 38px;
            border: 0;
            background: transparent;
            color: #dbe4ec;
            font-size: 21px;
            display: grid;
            place-items: center;
          }

          .mobile-header strong {
            text-align: center;
            font-size: 14px;
          }

          .mobile-notification {
            position: relative;
          }


          /* PAGE */

          .page-container {
            width: 100%;
            max-width: none;
            padding: 18px 12px 90px;
          }

          .page-heading {
            margin-bottom: 16px;
          }

          .page-heading h1 {
            font-size: 24px;
          }

          .page-heading p {
            max-width: 340px;
            font-size: 9px;
            line-height: 1.5;
          }


          /* STAT CARDS */

          .stats-grid {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .stat-card {
            height: 137px;
            padding: 12px;
          }

          .stat-icon {
            width: 34px;
            height: 34px;
            min-width: 34px;
            font-size: 15px;
          }

          .stat-title {
            font-size: 8px;
          }

          .stat-value {
            font-size: 20px;
          }

          .stat-change {
            font-size: 7px;
          }

          .mini-chart {
            height: 34px;
            margin-top: 5px;
          }


          /* FILTER */

          .filter-bar {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr)
              42px;
            gap: 8px;
            margin-top: 11px;
          }

          .search-input {
            grid-column: auto;
            height: 38px;
          }

          .search-input input {
            font-size: 9px;
          }

          .filter-button,
          .date-button {
            display: none;
          }

          .filter-bar::after {
            content: "☷";
            height: 38px;
            border: 1px solid #1c3852;
            border-radius: 6px;
            background: #081727;
            color: #6fa8df;
            display: grid;
            place-items: center;
            font-size: 17px;
          }


          /* ALERTS */

          .alerts-card {
            margin-top: 11px;
          }

          .section-header {
            padding: 14px 13px;
          }

          .section-header h2 {
            font-size: 13px;
          }

          .section-header p {
            max-width: 240px;
            line-height: 1.4;
          }

          .view-all {
            border: 0;
            padding: 0;
            background: transparent;
            color: var(--green);
          }


          .desktop-alert-list {
            display: none;
          }

          .mobile-alert-list {
            display: block;
          }

          .mobile-alert-row {
            width: 100%;
            min-height: 74px;
            padding: 10px 12px;
            border: 0;
            border-bottom: 1px solid #142c43;
            background: transparent;
            color: white;
            display: grid;
            grid-template-columns:
              30px
              minmax(0, 1fr)
              15px;
            align-items: center;
            gap: 9px;
            text-align: left;
          }

          .mobile-alert-row:last-child {
            border-bottom: 0;
          }

          .mobile-alert-icon {
            width: 29px;
            height: 29px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            font-size: 13px;
          }

          .mobile-alert-icon.high {
            color: var(--red);
            background: rgba(255, 77, 77, 0.1);
          }

          .mobile-alert-icon.medium {
            color: var(--orange);
            background: rgba(255, 149, 31, 0.1);
          }

          .mobile-alert-icon.low {
            color: var(--green);
            background: rgba(40, 229, 143, 0.1);
          }

          .mobile-alert-info {
            min-width: 0;
          }

          .mobile-alert-info strong {
            display: block;
            font-size: 9px;
          }

          .mobile-alert-info > span {
            display: block;
            color: #899db1;
            font-size: 8px;
            margin-top: 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .mobile-alert-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 5px;
          }

          .mobile-alert-meta > span:last-child {
            color: #647a90;
            font-size: 7px;
          }

          .mobile-alert-meta .risk-pill {
            padding: 3px 6px;
            font-size: 6px;
          }

          .mobile-arrow {
            color: #667e95;
            font-size: 22px;
          }


          /* AI SECTION */

          .ai-fraud-card {
            margin-top: 11px;
            padding: 15px;
            display: grid;
            grid-template-columns:
              1fr
              1fr;
            gap: 14px;
          }

          .ai-introduction {
            grid-column: 1 / 3;
            border-right: 0;
            border-bottom: 1px solid #193149;
            padding-bottom: 14px;
          }

          .ai-main-icon {
            width: 38px;
            height: 38px;
            min-width: 38px;
          }

          .ai-introduction h2 {
            font-size: 13px;
          }

          .ai-introduction p {
            font-size: 8px;
            line-height: 1.5;
          }

          .learn-more {
            font-size: 8px;
          }

          .ai-feature {
            padding: 4px;
          }

          .feature-icon {
            width: 34px;
            height: 34px;
          }

          .ai-feature strong {
            font-size: 8px;
          }

          .ai-feature span {
            font-size: 7px;
          }


          /* BOTTOM NAV */

          .mobile-bottom-nav {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            height:
              calc(74px + env(safe-area-inset-bottom));
            padding-bottom: env(safe-area-inset-bottom);
            display: grid;
            grid-template-columns:
              repeat(5, minmax(0, 1fr));
            align-items: center;
            background: #071522;
            border-top: 1px solid #1a334b;
            z-index: 50;
          }

          .mobile-bottom-nav a {
            height: 55px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 4px;
            color: #73899f;
            text-decoration: none;
            font-size: 6px;
          }

          .mobile-bottom-nav a span {
            font-size: 18px;
            line-height: 1;
          }

          .mobile-bottom-nav a.selected {
            color: var(--green);
          }

        }


        /* =====================================================
           VERY SMALL PHONES
        ====================================================== */

        @media (max-width: 380px) {

          .page-container {
            padding-left: 9px;
            padding-right: 9px;
          }

          .stat-card {
            padding: 10px;
          }

          .stat-title {
            font-size: 7px;
          }

          .stat-value {
            font-size: 18px;
          }

          .stat-change {
            font-size: 6px;
          }

          .page-heading h1 {
            font-size: 22px;
          }

          .mobile-alert-info strong {
            font-size: 8px;
          }

          .mobile-alert-info > span {
            font-size: 7px;
          }

        }

      `}</style>

    </main>
  );
}