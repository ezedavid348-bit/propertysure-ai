"use client";

import React from "react";

const activities = [
  {
    icon: "✓",
    type: "success",
    title: "Successful login",
    description: "Lagos, Nigeria · Chrome on Windows",
    date: "May 22, 2024",
    time: "10:24 AM",
  },
  {
    icon: "●",
    type: "info",
    title: "Password changed",
    description: "Lagos, Nigeria",
    date: "May 21, 2024",
    time: "02:15 PM",
  },
  {
    icon: "✓",
    type: "success",
    title: "Two-factor authentication enabled",
    description: "Lagos, Nigeria",
    date: "May 20, 2024",
    time: "11:45 AM",
  },
];

const planFeatures = [
  "Unlimited property verifications",
  "AI fraud detection & alerts",
  "Priority support",
  "Advanced reports & analytics",
];

export default function AccountPage() {
  const handleShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: "PropertySure AI",
        text: "My PropertySure AI account",
        url: window.location.href,
      });
    } catch {
      // User cancelled sharing.
    }
  };

  return (
    <main className="account-page">

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

          <a href="/dashboard">
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
            <span className="nav-icon">▣</span>
            Verification Details
          </a>

          <a href="/fraud-watch">
            <span className="nav-icon">♢</span>
            Fraud Watch
          </a>

          <a href="/reports">
            <span className="nav-icon">▤</span>
            Reports
          </a>

        </nav>


        <div className="sidebar-divider" />


        <nav className="sidebar-nav">

          <a
            href="/account"
            className="active"
          >
            <span className="nav-icon">♙</span>
            Account
          </a>

          <a href="/settings">
            <span className="nav-icon">⚙</span>
            Settings
          </a>

        </nav>


        <div className="sidebar-profile">

          <div className="avatar small">
            EK
          </div>

          <div className="sidebar-profile-info">
            <strong>
              Eze Ked
            </strong>

            <span>
              Premium Plan
            </span>
          </div>

          <span className="profile-chevron">
           ⌄
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

          <div />

          <div className="topbar-right">

            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
            >
              ♧
              <span>
                3
              </span>
            </button>


            <div className="top-profile">

              <div className="avatar tiny">
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


        {/* ===================================================
            MOBILE HEADER
        ==================================================== */}

        <header className="mobile-header">

          <button
            type="button"
            aria-label="Open menu"
            className="mobile-menu-button"
          >
            ☰
          </button>

          <strong>
            Account
          </strong>

          <button
            type="button"
            aria-label="Notifications"
            className="mobile-notification"
          >
            ♧
            <span>
              3
            </span>
          </button>

        </header>


        {/* ===================================================
            PAGE
        ==================================================== */}

        <div className="page-container">

          <div className="page-heading">

            <div>
              <h1>
                Account
              </h1>

              <p>
                Manage your account, security, and preferences.
              </p>
            </div>

          </div>


          {/* =================================================
              PROFILE HEADER
          ================================================== */}

          <section className="profile-card">

            <div className="profile-left">

              <div className="profile-avatar-wrapper">

                <div className="avatar profile-avatar">
                  EK
                </div>

                <button
                  type="button"
                  className="camera-button"
                  aria-label="Change profile photo"
                >
                  ◉
                </button>

              </div>


              <div className="profile-main-info">

                <h2>
                  Eze Ked
                </h2>

                <p>
                  eze.ked@example.com
                </p>

                <span className="verified-badge">
                  ● Verified
                </span>

                <small>
                  Member since May 20, 2024
                </small>

              </div>

            </div>


            <button
              type="button"
              className="edit-profile-button"
            >
              ✎ Edit Profile
            </button>

          </section>


          {/* =================================================
              FIRST ROW
          ================================================== */}

          <section className="cards-grid">


            {/* PLAN */}

            <article className="account-card">

              <div className="card-title">

                <div className="title-icon purple">
                  ✦
                </div>

                <div>
                  <h3>
                    Plan Information
                  </h3>

                  <span>
                    You are on
                  </span>
                </div>

              </div>


              <div className="plan-name">
                Premium Plan
              </div>


              <ul className="feature-list">

                {planFeatures.map((feature) => (
                  <li key={feature}>
                    <span>
                      ✓
                    </span>

                    {feature}
                  </li>
                ))}

              </ul>


              <button
                type="button"
                className="outline-button"
              >
                Manage Plan
              </button>

            </article>


            {/* SECURITY */}

            <article className="account-card">

              <div className="card-title">

                <div className="title-icon green">
                  ♢
                </div>

                <div>
                  <h3>
                    Account Security
                  </h3>

                  <span>
                    Your account is secure
                  </span>
                </div>

              </div>


              <div className="security-list">

                <div className="security-row">

                  <div>
                    <strong>
                      Two-Factor Authentication
                    </strong>
                  </div>

                  <span className="enabled">
                    Enabled
                  </span>

                </div>


                <div className="security-row clickable">

                  <div>
                    <strong>
                      ◌ Password
                    </strong>

                    <small>
                      Last changed 2 months ago
                    </small>
                  </div>

                  <span>
                    ›
                  </span>

                </div>


                <div className="security-row clickable">

                  <div>
                    <strong>
                      ◉ Active Sessions
                    </strong>

                    <small>
                      3 active sessions
                    </small>
                  </div>

                  <span>
                    ›
                  </span>

                </div>

              </div>


              <button
                type="button"
                className="outline-button"
              >
                Manage Security
              </button>

            </article>


            {/* PERSONAL INFORMATION */}

            <article className="account-card">

              <div className="card-title">

                <div className="title-icon blue">
                  ♙
                </div>

                <div>
                  <h3>
                    Personal Information
                  </h3>

                  <span>
                    Your personal details
                  </span>
                </div>

              </div>


              <div className="personal-list">

                <div>
                  <span>
                    Full Name
                  </span>

                  <strong>
                    Eze Ked
                  </strong>
                </div>


                <div>
                  <span>
                    Email Address
                  </span>

                  <strong>
                    eze.ked@example.com
                  </strong>
                </div>


                <div>
                  <span>
                    Phone Number
                  </span>

                  <strong>
                    +234 801 234 5678
                  </strong>
                </div>


                <div>
                  <span>
                    Location
                  </span>

                  <strong>
                    Lagos, Nigeria
                  </strong>
                </div>

              </div>


              <button
                type="button"
                className="outline-button"
              >
                Update Information
              </button>

            </article>


            {/* =================================================
                NOTIFICATIONS
            ================================================== */}

            <article className="account-card">

              <div className="card-title">

                <div className="title-icon yellow">
                  ♧
                </div>

                <div>
                  <h3>
                    Notification Preferences
                  </h3>

                  <span>
                    Control how we contact you
                  </span>
                </div>

              </div>


              <div className="notification-list">

                <div className="notification-row">

                  <div>
                    <strong>
                      Email Notifications
                    </strong>

                    <small>
                      Receive updates via email
                    </small>
                  </div>

                  <button
                    type="button"
                    className="toggle active"
                    aria-label="Toggle email notifications"
                  >
                    <span />
                  </button>

                </div>


                <div className="notification-row">

                  <div>
                    <strong>
                      SMS Notifications
                    </strong>

                    <small>
                      Receive important alerts via SMS
                    </small>
                  </div>

                  <button
                    type="button"
                    className="toggle active"
                    aria-label="Toggle SMS notifications"
                  >
                    <span />
                  </button>

                </div>


                <div className="notification-row">

                  <div>
                    <strong>
                      Push Notifications
                    </strong>

                    <small>
                      Receive push notifications
                    </small>
                  </div>

                  <button
                    type="button"
                    className="toggle active"
                    aria-label="Toggle push notifications"
                  >
                    <span />
                  </button>

                </div>

              </div>


              <button
                type="button"
                className="outline-button"
              >
                Manage Notifications
              </button>

            </article>


            {/* =================================================
                CONNECTED ACCOUNTS
            ================================================== */}

            <article className="account-card">

              <div className="card-title">

                <div className="title-icon red">
                  ♧
                </div>

                <div>
                  <h3>
                    Connected Accounts
                  </h3>

                  <span>
                    Manage connected accounts
                  </span>
                </div>

              </div>


              <div className="connected-list">

                <div className="connected-row">

                  <div className="service-icon google">
                    G
                  </div>

                  <div>
                    <strong>
                      Google
                    </strong>
                  </div>

                  <span className="connected">
                    Connected
                  </span>

                  <span>
                    ›
                  </span>

                </div>


                <div className="connected-row">

                  <div className="service-icon microsoft">
                    ⊞
                  </div>

                  <div>
                    <strong>
                      Microsoft
                    </strong>
                  </div>

                  <span className="not-connected">
                    Not connected
                  </span>

                  <span>
                    ›
                  </span>

                </div>

              </div>


              <button
                type="button"
                className="outline-button"
              >
                Manage Connections
              </button>

            </article>


            {/* =================================================
                DANGER ZONE
            ================================================== */}

            <article className="account-card danger-card">

              <div className="card-title">

                <div className="title-icon danger">
                  △
                </div>

                <div>
                  <h3>
                    Danger Zone
                  </h3>

                  <span>
                    Irreversible account actions
                  </span>
                </div>

              </div>


              <div className="danger-content">

                <strong>
                  Delete Account
                </strong>

                <p>
                  Once you delete your account, there is no
                  going back. Please be certain.
                </p>

              </div>


              <button
                type="button"
                className="delete-button"
              >
                Delete My Account
              </button>

            </article>

          </section>


          {/* =================================================
              ACCOUNT ACTIVITY
          ================================================== */}

          <section className="account-card activity-card">

            <div className="activity-heading">

              <div className="card-title">

                <div className="title-icon blue">
                  ◌
                </div>

                <div>
                  <h3>
                    Account Activity
                  </h3>

                  <span>
                    Review your recent account activity and
                    security events.
                  </span>
                </div>

              </div>


              <button
                type="button"
                className="view-all-button"
              >
                View All Activity →
              </button>

            </div>


            <div className="activity-list">

              {activities.map((activity) => (

                <div
                  className="activity-row"
                  key={activity.title}
                >

                  <div className={`activity-icon ${activity.type}`}>
                    {activity.icon}
                  </div>


                  <div className="activity-info">

                    <strong>
                      {activity.title}
                    </strong>

                    <span>
                      {activity.description}
                    </span>

                  </div>


                  <div className="activity-time">

                    <strong>
                      {activity.date}
                    </strong>

                    <span>
                      {activity.time}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </section>

        </div>


        {/* =====================================================
            MOBILE BOTTOM NAVIGATION
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

          <button
            type="button"
            className="mobile-add-button"
            aria-label="Add verification"
          >
            +
          </button>

          <a href="/my-properties">
            <span>⌂</span>
            Properties
          </a>

          <a
            href="/account"
            className="selected"
          >
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
          background: #061426;
        }

        :global(body) {
          min-height: 100vh;
        }

        button,
        input {
          font-family: inherit;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }


        /* =====================================================
           ROOT
        ====================================================== */

        .account-page {
          --bg: #061426;
          --sidebar: #071523;
          --card: #0a1929;
          --card-soft: #0c2034;
          --border: #1c3855;
          --border-soft: #172e47;

          --text: #f3f6fb;
          --muted: #8da1b8;
          --muted-2: #71879f;

          --blue: #4c96ff;
          --green: #29df8d;
          --purple: #a875ff;
          --yellow: #f4d532;
          --red: #ff5964;

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
          width: 218px;
          min-width: 218px;
          min-height: 100vh;

          background: var(--sidebar);
          border-right: 1px solid #18334f;

          padding: 24px 14px;

          display: flex;
          flex-direction: column;
        }


        .brand {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 30px;
          padding-left: 5px;
        }


        .brand-logo {
          width: 31px;
          height: 31px;
          border-radius: 8px;

          background: #123a31;

          display: grid;
          place-items: center;

          color: var(--green);
          font-size: 17px;

          border: 1px solid #1d654d;
        }


        .brand-name {
          font-size: 15px;
          font-weight: 750;
          letter-spacing: -0.2px;
        }


        .brand-name span {
          color: var(--green);
        }


        .brand-tagline {
          margin-top: 2px;
          color: var(--muted);
          font-size: 7px;
        }


        .sidebar-nav {
          display: grid;
          gap: 4px;
        }


        .sidebar-nav a {
          min-height: 38px;

          display: flex;
          align-items: center;

          padding: 0 10px;

          border-radius: 7px;

          color: #91a3b8;
          text-decoration: none;

          font-size: 10px;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }


        .sidebar-nav a:hover {
          background: #0d253d;
          color: white;
        }


        .sidebar-nav a.active {
          background: #0d3a31;
          color: var(--green);
        }


        .nav-icon {
          width: 26px;
          color: #8197ad;
          font-size: 14px;
        }


        .sidebar-nav a.active .nav-icon {
          color: var(--green);
        }


        .sidebar-divider {
          height: 1px;
          background: #17324e;
          margin: 18px 6px;
        }


        .sidebar-profile {
          margin-top: auto;

          min-height: 61px;

          padding: 9px;

          border: 1px solid #1a354f;
          border-radius: 8px;

          display: flex;
          align-items: center;
          gap: 8px;
        }


        .sidebar-profile-info {
          min-width: 0;
          flex: 1;
        }


        .sidebar-profile-info strong {
          display: block;
          font-size: 9px;
        }


        .sidebar-profile-info span {
          display: block;
          margin-top: 3px;

          color: var(--muted);
          font-size: 7px;
        }


        .profile-chevron {
          color: var(--muted);
          font-size: 14px;
        }


        /* =====================================================
           AVATARS
        ====================================================== */

        .avatar {
          border-radius: 50%;

          background: #0c5647;

          color: #d8fff2;

          display: grid;
          place-items: center;

          font-weight: 700;

          border: 1px solid #1a6c59;
        }


        .avatar.small {
          width: 31px;
          height: 31px;
          font-size: 9px;
        }


        .avatar.tiny {
          width: 28px;
          height: 28px;
          font-size: 8px;
        }


        .profile-avatar {
          width: 76px;
          height: 76px;
          font-size: 22px;
        }


        /* =====================================================
           MAIN
        ====================================================== */

        .main-content {
          flex: 1;
          min-width: 0;
        }


        .desktop-topbar {
          height: 62px;

          border-bottom: 1px solid #17324d;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 25px;
        }


        .topbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }


        .notification-button {
          position: relative;

          width: 30px;
          height: 30px;

          border: 0;
          background: transparent;

          color: #9aadc1;

          cursor: pointer;
          font-size: 15px;
        }


        .notification-button span,
        .mobile-notification span {
          position: absolute;

          top: -3px;
          right: -2px;

          width: 14px;
          height: 14px;

          border-radius: 50%;

          background: #ef4444;
          color: white;

          display: grid;
          place-items: center;

          font-size: 7px;
        }


        .top-profile {
          display: flex;
          align-items: center;
          gap: 8px;
        }


        .top-profile strong {
          display: block;
          font-size: 9px;
        }


        .top-profile small {
          display: block;
          margin-top: 2px;

          color: var(--muted);
          font-size: 7px;
        }


        .top-profile > span {
          color: var(--muted);
          font-size: 12px;
        }


        /* =====================================================
           PAGE
        ====================================================== */

        .page-container {
          width: 100%;
          max-width: 1220px;

          margin: 0 auto;

          padding: 23px 25px 35px;
        }


        .page-heading {
          margin-bottom: 17px;
        }


        .page-heading h1 {
          margin: 0;

          font-size: 25px;
          line-height: 1.1;

          letter-spacing: -0.5px;
        }


        .page-heading p {
          margin: 5px 0 0;

          color: var(--muted);

          font-size: 9px;
        }


        /* =====================================================
           PROFILE CARD
        ====================================================== */

        .profile-card {
          width: 100%;

          min-height: 119px;

          padding: 17px;

          background: var(--card);

          border: 1px solid var(--border);

          border-radius: 9px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 12px;
        }


        .profile-left {
          display: flex;
          align-items: center;
          gap: 15px;

          min-width: 0;
        }


        .profile-avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }


        .camera-button {
          position: absolute;

          right: -2px;
          bottom: -1px;

          width: 21px;
          height: 21px;

          border-radius: 50%;

          border: 2px solid var(--card);

          background: #172a41;

          color: #b5c5d8;

          display: grid;
          place-items: center;

          font-size: 8px;

          cursor: pointer;
        }


        .profile-main-info h2 {
          margin: 0;

          font-size: 18px;
        }


        .profile-main-info p {
          margin: 4px 0;

          color: #9db0c5;

          font-size: 9px;
        }


        .verified-badge {
          display: inline-block;

          padding: 3px 7px;

          border-radius: 10px;

          color: var(--green);

          background: #083a30;

          border: 1px solid #12634e;

          font-size: 7px;
        }


        .profile-main-info small {
          display: block;

          margin-top: 5px;

          color: var(--muted-2);

          font-size: 7px;
        }


        .edit-profile-button {
          height: 35px;

          padding: 0 17px;

          background: transparent;

          border: 1px solid #315a96;

          border-radius: 6px;

          color: #75a9ff;

          font-size: 9px;

          cursor: pointer;
        }


        .edit-profile-button:hover {
          background: rgba(76, 150, 255, 0.08);
        }


        /* =====================================================
           CARDS GRID
        ====================================================== */

        .cards-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 12px;

          align-items: stretch;
        }


        .account-card {
          min-width: 0;

          padding: 15px;

          background: var(--card);

          border: 1px solid var(--border);

          border-radius: 9px;
        }


        .card-title {
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }


        .title-icon {
          width: 27px;
          height: 27px;

          flex-shrink: 0;

          border-radius: 7px;

          display: grid;
          place-items: center;

          font-size: 14px;
        }


        .title-icon.purple {
          color: var(--purple);
          background: #241c45;
        }


        .title-icon.green {
          color: var(--green);
          background: #093a32;
        }


        .title-icon.blue {
          color: #65a5ff;
          background: #122e54;
        }


        .title-icon.yellow {
          color: var(--yellow);
          background: #393519;
        }


        .title-icon.red {
          color: #ff6a76;
          background: #3a1c2a;
        }


        .title-icon.danger {
          color: var(--red);
          background: #3a1821;
        }


        .card-title h3 {
          margin: 0;

          font-size: 11px;
          line-height: 1.25;
        }


        .card-title span {
          display: block;

          margin-top: 3px;

          color: var(--muted-2);

          font-size: 7px;
          line-height: 1.35;
        }


        /* =====================================================
           PLAN
        ====================================================== */

        .plan-name {
          margin-top: 16px;

          color: var(--purple);

          font-size: 16px;
          font-weight: 700;
        }


        .feature-list {
          margin: 10px 0 13px;
          padding: 0;

          list-style: none;

          display: grid;
          gap: 7px;
        }


        .feature-list li {
          display: flex;
          align-items: flex-start;
          gap: 6px;

          color: #9db0c4;

          font-size: 8px;

          line-height: 1.3;
        }


        .feature-list li span {
          color: var(--green);
          font-weight: 700;
        }


        /* =====================================================
           BUTTONS
        ====================================================== */

        .outline-button {
          width: 100%;

          height: 32px;

          margin-top: auto;

          background: transparent;

          border: 1px solid #1d3d5c;

          border-radius: 5px;

          color: #78a9f5;

          font-size: 8px;

          cursor: pointer;
        }


        .outline-button:hover {
          background: #0b2238;
          border-color: #315a83;
        }


        /* =====================================================
           SECURITY
        ====================================================== */

        .security-list {
          margin-top: 12px;

          display: grid;
        }


        .security-row {
          min-height: 43px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 8px;

          border-bottom: 1px solid var(--border-soft);
        }


        .security-row:last-child {
          border-bottom: 0;
        }


        .security-row strong {
          display: block;

          color: #e9eff7;

          font-size: 8px;
          font-weight: 500;
        }


        .security-row small {
          display: block;

          color: var(--muted-2);

          font-size: 7px;

          margin-top: 3px;
        }


        .security-row > span {
          color: #7d91a8;
          font-size: 13px;
        }


        .security-row .enabled {
          color: var(--green);
          font-size: 7px;
        }


        .security-row.clickable {
          cursor: pointer;
        }


        /* =====================================================
           PERSONAL INFORMATION
        ====================================================== */

        .personal-list {
          margin-top: 11px;

          display: grid;
          gap: 9px;
        }


        .personal-list > div {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;
        }


        .personal-list span {
          color: var(--muted-2);

          font-size: 7px;
        }


        .personal-list strong {
          color: #dce5ef;

          font-size: 8px;
          font-weight: 500;

          text-align: right;

          max-width: 62%;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }


        /* =====================================================
           NOTIFICATIONS
        ====================================================== */

        .notification-list {
          margin-top: 11px;

          display: grid;
        }


        .notification-row {
          min-height: 40px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 8px;

          border-bottom: 1px solid var(--border-soft);
        }


        .notification-row:last-child {
          border-bottom: 0;
        }


        .notification-row strong {
          display: block;

          color: #e1e9f3;

          font-size: 8px;
          font-weight: 500;
        }


        .notification-row small {
          display: block;

          color: var(--muted-2);

          font-size: 6px;

          margin-top: 3px;
        }


        .toggle {
          width: 27px;
          height: 15px;

          padding: 2px;

          border: 0;
          border-radius: 10px;

          background: #24384d;

          cursor: pointer;
        }


        .toggle span {
          display: block;

          width: 11px;
          height: 11px;

          border-radius: 50%;

          background: #8ca0b4;

          transition: transform 0.2s ease;
        }


        .toggle.active {
          background: #1f9c69;
        }


        .toggle.active span {
          background: white;
          transform: translateX(12px);
        }


        /* =====================================================
           CONNECTED ACCOUNTS
        ====================================================== */

        .connected-list {
          margin-top: 11px;

          display: grid;
        }


        .connected-row {
          min-height: 47px;

          display: flex;
          align-items: center;

          gap: 8px;

          border-bottom: 1px solid var(--border-soft);
        }


        .service-icon {
          width: 24px;
          height: 24px;

          border-radius: 6px;

          display: grid;
          place-items: center;

          background: #18283b;

          font-size: 10px;
          font-weight: 700;
        }


        .service-icon.google {
          color: white;
        }


        .service-icon.microsoft {
          color: #55a4ff;
        }


        .connected-row > div:nth-child(2) {
          flex: 1;
        }


        .connected-row strong {
          font-size: 8px;
          font-weight: 500;
        }


        .connected-row > span {
          color: #71869d;
          font-size: 12px;
        }


        .connected-row .connected {
          color: var(--green);
          font-size: 7px;
        }


        .connected-row .not-connected {
          color: #7389a1;
          font-size: 7px;
        }


        /* =====================================================
           DANGER
        ====================================================== */

        .danger-card {
          border-color: #49303a;
        }


        .danger-content {
          margin-top: 15px;
        }


        .danger-content strong {
          color: #ff646f;

          font-size: 9px;
        }


        .danger-content p {
          margin: 6px 0 12px;

          color: var(--muted-2);

          font-size: 7px;

          line-height: 1.5;
        }


        .delete-button {
          width: 100%;
          height: 32px;

          background: rgba(255, 66, 82, 0.04);

          border: 1px solid #8c3947;

          border-radius: 5px;

          color: #ff6872;

          font-size: 8px;

          cursor: pointer;
        }


        .delete-button:hover {
          background: rgba(255, 66, 82, 0.09);
        }


        /* =====================================================
           ACTIVITY
        ====================================================== */

        .activity-card {
          margin-top: 12px;
        }


        .activity-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 15px;

          padding-bottom: 11px;

          border-bottom: 1px solid var(--border-soft);
        }


        .view-all-button {
          border: 0;
          background: transparent;

          color: #62a4ff;

          font-size: 8px;

          white-space: nowrap;

          cursor: pointer;
        }


        .activity-list {
          display: grid;
        }


        .activity-row {
          min-height: 48px;

          display: grid;

          grid-template-columns:
            28px
            minmax(0, 1fr)
            auto;

          align-items: center;

          gap: 9px;

          border-bottom: 1px solid var(--border-soft);
        }


        .activity-row:last-child {
          border-bottom: 0;
        }


        .activity-icon {
          width: 23px;
          height: 23px;

          border-radius: 50%;

          display: grid;
          place-items: center;

          font-size: 10px;
        }


        .activity-icon.success {
          color: var(--green);
          background: #0b3b31;
        }


        .activity-icon.info {
          color: #5da3ff;
          background: #122f52;
        }


        .activity-info {
          min-width: 0;
        }


        .activity-info strong {
          display: block;

          color: #e1e9f2;

          font-size: 8px;
          font-weight: 600;
        }


        .activity-info span {
          display: block;

          color: var(--muted-2);

          font-size: 7px;

          margin-top: 3px;
        }


        .activity-time {
          text-align: right;
        }


        .activity-time strong {
          display: block;

          color: #d5dfeb;

          font-size: 7px;
        }


        .activity-time span {
          display: block;

          color: var(--muted-2);

          font-size: 6px;

          margin-top: 3px;
        }


        /* =====================================================
           MOBILE HEADER
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

        @media (max-width: 1000px) {

          .sidebar {
            width: 190px;
            min-width: 190px;
          }

          .cards-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

        }


        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 700px) {

          .account-page {
            display: block;

            width: 100%;
            min-width: 0;

            padding-bottom:
              calc(80px + env(safe-area-inset-bottom));
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
            height: 62px;

            display: grid;

            grid-template-columns:
              44px
              minmax(0, 1fr)
              44px;

            align-items: center;

            padding: 0 13px;

            background: #061426;

            border-bottom: 1px solid #193650;

            position: sticky;
            top: 0;

            z-index: 40;
          }


          .mobile-header strong {
            text-align: center;

            font-size: 15px;
          }


          .mobile-menu-button,
          .mobile-notification {
            width: 40px;
            height: 40px;

            border: 0;
            background: transparent;

            color: #e4edf6;

            display: grid;
            place-items: center;

            cursor: pointer;

            font-size: 21px;
          }


          .mobile-notification {
            position: relative;
          }


          /* PAGE */

          .page-container {
            width: 100%;
            max-width: none;

            padding: 18px 14px 94px;
          }


          .page-heading {
            margin-bottom: 14px;
          }


          .page-heading h1 {
            font-size: 24px;
          }


          .page-heading p {
            font-size: 9px;

            line-height: 1.5;
          }


          /* PROFILE */

          .profile-card {
            min-height: 106px;

            padding: 13px;

            border-radius: 10px;
          }


          .profile-left {
            gap: 11px;
          }


          .profile-avatar {
            width: 58px;
            height: 58px;

            font-size: 18px;
          }


          .profile-main-info h2 {
            font-size: 15px;
          }


          .profile-main-info p {
            font-size: 8px;

            max-width: 180px;

            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }


          .verified-badge {
            font-size: 6px;
          }


          .profile-main-info small {
            font-size: 6px;
          }


          .edit-profile-button {
            display: none;
          }


          .camera-button {
            width: 19px;
            height: 19px;

            font-size: 7px;
          }


          /* CARDS */

          .cards-grid {
            display: flex;

            flex-direction: column;

            gap: 10px;
          }


          .account-card {
            width: 100%;

            padding: 15px;

            border-radius: 10px;
          }


          .card-title h3 {
            font-size: 13px;
          }


          .card-title span {
            font-size: 8px;
          }


          .title-icon {
            width: 31px;
            height: 31px;

            font-size: 15px;
          }


          /* PLAN */

          .plan-name {
            font-size: 18px;
            margin-top: 16px;
          }


          .feature-list {
            gap: 8px;
          }


          .feature-list li {
            font-size: 9px;
          }


          .outline-button {
            height: 40px;

            font-size: 9px;

            margin-top: 13px;
          }


          /* SECURITY */

          .security-row {
            min-height: 49px;
          }


          .security-row strong {
            font-size: 9px;
          }


          .security-row small {
            font-size: 7px;
          }


          .security-row .enabled {
            font-size: 8px;
          }


          /* PERSONAL */

          .personal-list {
            gap: 12px;
          }


          .personal-list span {
            font-size: 8px;
          }


          .personal-list strong {
            font-size: 9px;
          }


          /* NOTIFICATIONS */

          .notification-row {
            min-height: 49px;
          }


          .notification-row strong {
            font-size: 9px;
          }


          .notification-row small {
            font-size: 7px;
          }


          .toggle {
            width: 31px;
            height: 17px;
          }


          .toggle span {
            width: 13px;
            height: 13px;
          }


          .toggle.active span {
            transform: translateX(13px);
          }


          /* CONNECTED */

          .connected-row {
            min-height: 54px;
          }


          .connected-row strong {
            font-size: 9px;
          }


          .connected-row .connected,
          .connected-row .not-connected {
            font-size: 8px;
          }


          /* DANGER */

          .danger-content {
            margin-top: 16px;
          }


          .danger-content strong {
            font-size: 10px;
          }


          .danger-content p {
            font-size: 8px;

            line-height: 1.5;
          }


          .delete-button {
            height: 42px;

            font-size: 9px;
          }


          /* ACTIVITY */

          .activity-card {
            margin-top: 10px;
          }


          .activity-heading {
            align-items: flex-start;
          }


          .view-all-button {
            font-size: 8px;
          }


          .activity-row {
            min-height: 58px;

            grid-template-columns:
              29px
              minmax(0, 1fr)
              auto;
          }


          .activity-info strong {
            font-size: 9px;
          }


          .activity-info span {
            font-size: 7px;
          }


          .activity-time strong {
            font-size: 7px;
          }


          .activity-time span {
            font-size: 6px;
          }


          /* =================================================
             MOBILE BOTTOM NAV
          ================================================== */

          .mobile-bottom-nav {
            position: fixed;

            left: 0;
            right: 0;
            bottom: 0;

            width: 100%;

            height:
              calc(74px + env(safe-area-inset-bottom));

            padding-bottom:
              env(safe-area-inset-bottom);

            background: #071827;

            border-top: 1px solid #193650;

            z-index: 100;

            display: grid;

            grid-template-columns:
              repeat(5, minmax(0, 1fr));

            align-items: center;
          }


          .mobile-bottom-nav a {
            height: 55px;

            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            gap: 4px;

            color: #7d91a8;

            text-decoration: none;

            font-size: 7px;
          }


          .mobile-bottom-nav a span {
            font-size: 18px;
            line-height: 1;
          }


          .mobile-bottom-nav a.selected {
            color: var(--green);
          }


          .mobile-add-button {
            width: 53px;
            height: 53px;

            margin: auto;

            border: 0;
            border-radius: 50%;

            background: #247cf0;

            color: white;

            font-size: 27px;

            cursor: pointer;

            box-shadow:
              0 5px 18px rgba(0, 0, 0, 0.25);
          }

        }


        /* =====================================================
           SMALL PHONES
        ====================================================== */

        @media (max-width: 380px) {

          .page-container {
            padding-left: 10px;
            padding-right: 10px;
          }


          .page-heading h1 {
            font-size: 22px;
          }


          .profile-main-info h2 {
            font-size: 14px;
          }


          .profile-main-info p {
            max-width: 145px;
          }


          .account-card {
            padding: 13px;
          }


          .card-title h3 {
            font-size: 12px;
          }


          .personal-list strong {
            max-width: 57%;
          }

        }

      `}</style>

    </main>
  );
}