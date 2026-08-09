"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { icon: "▦", label: "Dashboard" },
    { icon: "⇧", label: "Verify Property" },
    { icon: "⌂", label: "My Properties" },
    { icon: "◷", label: "Verification History" },
    { icon: "◈", label: "Fraud Watch" },
    { icon: "▤", label: "Reports" },
  ];

  return (
    <main className="dashboard">
      {/* MOBILE HEADER */}
      <header className="mobileHeader">
        <button
          className="menuButton"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div className="mobileLogo">
          <span>◆</span> PropertySure AI
        </div>

        <div className="mobileBell">🔔</div>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mobileMenu">
          <div className="mobileMenuHeader">
            <div>
              <div className="mobileMenuLogo">
                <span>◆</span> PropertySure AI
              </div>

              <div className="mobileMenuSubtitle">
                AI-Powered Property Due Diligence
              </div>
            </div>

            <button
              className="closeMenu"
              onClick={() => setMenuOpen(false)}
            >
              ×
            </button>
          </div>

          <nav className="mobileMenuNav">
            {navItems.map((item, index) => (
              <div
                key={item.label}
                className={`mobileNavItem ${
                  index === 0 ? "active" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="navIcon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="mobileAccountLabel">ACCOUNT</div>

          <div className="mobileNavItem">
            <span className="navIcon">◯</span>
            Account
          </div>

          <div className="mobileNavItem">
            <span className="navIcon">⚙</span>
            Settings
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brandName">
            <span>◆</span> PropertySure AI
          </div>

          <div className="brandSubtitle">
            AI-Powered Property
            <br />
            Due Diligence
          </div>
        </div>

        <nav className="sidebarNav">
          {navItems.map((item, index) => (
            <div
              key={item.label}
              className={`navItem ${index === 0 ? "active" : ""}`}
            >
              <span className="navIcon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="accountLabel">ACCOUNT</div>

        <div className="navItem">
          <span className="navIcon">◯</span>
          Account
        </div>

        <div className="navItem">
          <span className="navIcon">⚙</span>
          Settings
        </div>

        <div className="helpBox">
          <div className="helpTitle">Need Help?</div>

          <div className="helpText">
            Our support team is ready to assist you.
          </div>

          <button className="supportButton">
            Contact Support
          </button>
        </div>

        <div className="sidebarUser">
          <div className="avatar">D</div>

          <div>
            <div className="userName">David Eze</div>
            <div className="userPlan">♛ Premium Plan</div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="content">
        {/* DESKTOP TOP BAR */}
        <header className="topBar">
          <div>
            <div className="eyebrow">PROPERTYSURE AI</div>

            <h1>Welcome back, David 👋</h1>

            <p>
              Stay ahead of property risks with AI-powered due diligence.
            </p>
          </div>

          <div className="topActions">
            <div className="notification">🔔</div>

            <div className="profile">
              <div className="avatar large">D</div>

              <div>
                <div className="userName">David Eze</div>
                <div className="userPlan">Premium Account</div>
              </div>

              <span className="chevron">⌄</span>
            </div>
          </div>
        </header>

        {/* MOBILE WELCOME */}
        <div className="mobileWelcome">
          <div className="eyebrow">PROPERTYSURE AI</div>

          <h1>Welcome back, David 👋</h1>

          <p>
            Stay ahead of property risks with AI-powered due diligence.
          </p>
        </div>

        {/* VERIFY BUTTON */}
        <div className="verifyArea">
          <button className="verifyButton">
            <span>＋</span> Verify Property
          </button>

          <div className="verifyHint">
            Start a new verification
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="statsGrid">
          <div className="statCard">
            <div className="statIcon green">✓</div>

            <div>
              <div className="statLabel">Verified Properties</div>
              <div className="statNumber">12</div>
              <div className="statChange">+3 this month</div>
            </div>
          </div>

          <div className="statCard">
            <div className="statIcon orange">◷</div>

            <div>
              <div className="statLabel">Pending Verification</div>
              <div className="statNumber">2</div>
              <div className="statLink">View all</div>
            </div>
          </div>

          <div className="statCard">
            <div className="statIcon red">!</div>

            <div>
              <div className="statLabel">Fraud Alerts</div>
              <div className="statNumber">1</div>
              <div className="statWarning">Needs attention</div>
            </div>
          </div>

          <div className="statCard">
            <div className="statIcon blue">▤</div>

            <div>
              <div className="statLabel">Reports Available</div>
              <div className="statNumber">10</div>
              <div className="statLink">View reports</div>
            </div>
          </div>
        </div>

        {/* LOWER DASHBOARD */}
        <div className="dashboardGrid">
          {/* RECENT VERIFICATIONS */}
          <div className="panel recentPanel">
            <div className="panelHeader">
              <h2>Recent Verifications</h2>
              <span>View all</span>
            </div>

            <div className="verificationList">
              <Verification
                property="Lekki Phase 1 Property"
                location="Lagos State"
                document="Certificate of Occupancy (C of O)"
                status="Verified"
                statusType="verified"
                date="Aug 8, 2026"
              />

              <Verification
                property="Maitama Residence"
                location="Abuja FCT"
                document="Survey Plan"
                status="Review Required"
                statusType="review"
                date="Aug 6, 2026"
              />

              <Verification
                property="Asokoro Plot 45"
                location="Abuja FCT"
                document="Deed of Assignment"
                status="Verified"
                statusType="verified"
                date="Aug 4, 2026"
              />

              <Verification
                property="Enugu Property"
                location="Enugu State"
                document="Governor's Consent"
                status="Processing"
                statusType="processing"
                date="Aug 3, 2026"
              />
            </div>
          </div>

          {/* FRAUD WATCH */}
          <div className="panel fraudPanel">
            <div className="panelHeader">
              <h2>Fraud Watch</h2>
              <span>View all</span>
            </div>

            <div className="fraudAlert">
              <div className="fraudIcon">!</div>

              <div>
                <div className="fraudLabel">REVIEW REQUIRED</div>

                <h3>Abuja – Plot 124, Maitama</h3>

                <p>
                  Potential document inconsistency detected.
                  Further review recommended.
                </p>

                <button>View Investigation</button>
              </div>
            </div>

            <div className="otherAlerts">
              <div>
                Duplicate Document Detected
                <span>›</span>
              </div>

              <div>
                Ownership Conflict
                <span>›</span>
              </div>
            </div>
          </div>

          {/* PREMIUM PLAN */}
          <div className="premiumCard">
            <div className="premiumShield">⌂</div>

            <div>
              <div className="premiumTitle">
                You're on <strong>Premium Plan ♛</strong>
              </div>

              <p>
                Enjoy priority support, advanced fraud detection,
                and professional verification.
              </p>
            </div>

            <div className="premiumFeatures">
              <div>✓ AI + Human Verification</div>
              <div>✓ Fraud Watch Monitoring</div>
              <div>✓ Priority Report Delivery</div>
              <div>✓ On-site Inspection</div>
            </div>
          </div>

          {/* REPORTS */}
          <div className="panel reportsPanel">
            <div className="panelHeader">
              <h2>Recent Reports</h2>
              <span>View all</span>
            </div>

            <div className="reportItem">
              <div className="pdf">PDF</div>

              <div>
                <strong>Lekki Phase 1 Property</strong>
                <span>Verification Report</span>
              </div>

              <div className="download">↓</div>
            </div>

            <div className="reportItem">
              <div className="pdf">PDF</div>

              <div>
                <strong>Maitama Residence</strong>
                <span>Verification Report</span>
              </div>

              <div className="download">↓</div>
            </div>

            <div className="reportItem">
              <div className="pdf">PDF</div>

              <div>
                <strong>Asokoro Plot 45</strong>
                <span>Verification Report</span>
              </div>

              <div className="download">↓</div>
            </div>

            <button className="viewReports">
              View All Reports
            </button>
          </div>
        </div>
      </section>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="bottomNav">
        <div className="bottomItem active">
          <span>▦</span>
          <small>Dashboard</small>
        </div>

        <div className="bottomItem">
          <span>⇧</span>
          <small>Verify</small>
        </div>

        <div className="bottomItem">
          <span>⌂</span>
          <small>Properties</small>
        </div>

        <div className="bottomItem">
          <span>▤</span>
          <small>Reports</small>
        </div>

        <div className="bottomItem">
          <span>◯</span>
          <small>Account</small>
        </div>
      </nav>

      {/* RESPONSIVE CSS */}
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .dashboard {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 70% 0%,
              rgba(0, 123, 255, 0.18),
              transparent 30%
            ),
            #06152f;
          color: #ffffff;
          font-family: Arial, sans-serif;
          display: flex;
        }

        /* SIDEBAR */

        .sidebar {
          width: 245px;
          min-width: 245px;
          min-height: 100vh;
          padding: 28px 20px;
          background: rgba(4, 20, 47, 0.96);
          border-right: 1px solid rgba(83, 157, 255, 0.18);
          display: flex;
          flex-direction: column;
        }

        .brandName {
          font-size: 21px;
          font-weight: 700;
          white-space: nowrap;
        }

        .brandName span,
        .mobileLogo span,
        .mobileMenuLogo span {
          color: #2196ff;
          margin-right: 5px;
        }

        .brandSubtitle {
          margin-top: 10px;
          padding-left: 2px;
          color: #8ea4c3;
          font-size: 12px;
          line-height: 1.5;
        }

        .sidebarNav {
          margin-top: 28px;
        }

        .navItem {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 14px;
          margin-bottom: 5px;
          border-radius: 10px;
          color: #aebed4;
          font-size: 14px;
          cursor: pointer;
        }

        .navItem.active {
          color: white;
          background: linear-gradient(
            90deg,
            #0879df,
            #1268b7
          );
          box-shadow: 0 5px 20px rgba(0, 120, 255, 0.2);
        }

        .navIcon {
          width: 20px;
          text-align: center;
          color: #82b9f2;
        }

        .accountLabel {
          color: #5f789a;
          font-size: 10px;
          letter-spacing: 1.5px;
          margin: 28px 14px 10px;
        }

        .helpBox {
          margin-top: auto;
          padding: 16px;
          border: 1px solid rgba(71, 151, 255, 0.25);
          border-radius: 12px;
          background: rgba(16, 88, 170, 0.08);
        }

        .helpTitle {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 7px;
        }

        .helpText {
          color: #849ab8;
          font-size: 11px;
          line-height: 1.5;
        }

        .supportButton {
          width: 100%;
          margin-top: 12px;
          padding: 9px;
          border-radius: 7px;
          border: 1px solid #1678df;
          background: transparent;
          color: #7eb9f5;
          cursor: pointer;
        }

        .sidebarUser {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
          padding: 5px;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #0879d8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .avatar.large {
          width: 40px;
          height: 40px;
        }

        .userName {
          font-size: 13px;
          font-weight: 600;
        }

        .userPlan {
          color: #7f96b4;
          font-size: 11px;
          margin-top: 3px;
        }

        /* CONTENT */

        .content {
          flex: 1;
          min-width: 0;
          padding: 30px 34px 50px;
          overflow-x: hidden;
        }

        .topBar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 25px;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .eyebrow {
          color: #7791b3;
          font-size: 11px;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }

        .topBar h1,
        .mobileWelcome h1 {
          margin: 0;
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 600;
        }

        .topBar p,
        .mobileWelcome p {
          color: #91a7c3;
          margin: 8px 0 0;
          font-size: 13px;
        }

        .topActions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .notification {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(60, 143, 232, 0.35);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .chevron {
          color: #8aa0bb;
          margin-left: 4px;
        }

        /* VERIFY */

        .verifyArea {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 15px;
          margin: 20px 0;
        }

        .verifyButton {
          border: 0;
          border-radius: 8px;
          padding: 13px 24px;
          background: linear-gradient(
            135deg,
            #168bff,
            #0866d1
          );
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(0, 110, 255, 0.2);
        }

        .verifyButton span {
          font-size: 19px;
          margin-right: 5px;
        }

        .verifyHint {
          color: #7f96b4;
          font-size: 11px;
        }

        /* STATS */

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .statCard {
          min-width: 0;
          padding: 18px;
          border-radius: 12px;
          border: 1px solid rgba(76, 149, 235, 0.23);
          background: rgba(7, 33, 68, 0.78);
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .statIcon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
        }

        .green {
          background: rgba(30, 190, 125, 0.2);
          color: #39d995;
        }

        .orange {
          background: rgba(255, 160, 20, 0.2);
          color: #ffad28;
        }

        .red {
          background: rgba(240, 50, 65, 0.2);
          color: #ff5261;
        }

        .blue {
          background: rgba(35, 135, 255, 0.2);
          color: #48a0ff;
        }

        .statLabel {
          color: #91a6c0;
          font-size: 11px;
          white-space: nowrap;
        }

        .statNumber {
          font-size: 25px;
          font-weight: 600;
          margin: 2px 0;
        }

        .statChange,
        .statLink {
          color: #48b2ff;
          font-size: 10px;
        }

        .statWarning {
          color: #ff5965;
          font-size: 10px;
        }

        /* LOWER CONTENT */

        .dashboardGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
          gap: 14px;
          margin-top: 14px;
        }

        .panel,
        .premiumCard {
          border: 1px solid rgba(76, 149, 235, 0.23);
          background: rgba(7, 31, 63, 0.8);
          border-radius: 12px;
          overflow: hidden;
        }

        .panelHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .panelHeader h2 {
          margin: 0;
          font-size: 15px;
        }

        .panelHeader span {
          color: #48aaff;
          font-size: 11px;
        }

        .verificationList {
          padding: 0 16px;
        }

        .verification {
          display: grid;
          grid-template-columns: 1.3fr 1.2fr 100px 85px;
          align-items: center;
          gap: 12px;
          min-height: 65px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .propertyName {
          font-size: 12px;
          font-weight: 600;
        }

        .propertyLocation,
        .document,
        .date {
          color: #8299b6;
          font-size: 10px;
          margin-top: 3px;
        }

        .status {
          display: inline-block;
          width: fit-content;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 9px;
        }

        .status.verified {
          background: rgba(38, 200, 130, 0.13);
          color: #48df9c;
        }

        .status.review {
          background: rgba(255, 169, 36, 0.13);
          color: #ffb340;
        }

        .status.processing {
          background: rgba(40, 130, 255, 0.13);
          color: #5ba9ff;
        }

        /* FRAUD */

        .fraudPanel {
          padding-bottom: 16px;
        }

        .fraudAlert {
          margin: 15px;
          padding: 15px;
          display: flex;
          gap: 12px;
          border: 1px solid rgba(255, 68, 80, 0.5);
          border-radius: 10px;
          background: rgba(130, 20, 30, 0.12);
        }

        .fraudIcon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 50%;
          background: rgba(255, 65, 75, 0.2);
          color: #ff5965;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .fraudLabel {
          color: #ff5965;
          font-size: 8px;
          letter-spacing: 1px;
        }

        .fraudAlert h3 {
          font-size: 12px;
          margin: 5px 0;
        }

        .fraudAlert p {
          color: #9aabc0;
          font-size: 10px;
          line-height: 1.5;
          margin: 0 0 10px;
        }

        .fraudAlert button {
          padding: 7px 10px;
          border: 1px solid rgba(255, 80, 90, 0.4);
          background: rgba(255, 60, 70, 0.12);
          color: #ff8b91;
          border-radius: 6px;
          font-size: 9px;
        }

        .otherAlerts {
          padding: 0 16px;
        }

        .otherAlerts div {
          display: flex;
          justify-content: space-between;
          padding: 11px 0;
          color: #9aacc2;
          font-size: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* PREMIUM */

        .premiumCard {
          padding: 20px;
          display: grid;
          grid-template-columns: 60px 1fr auto;
          gap: 18px;
          align-items: center;
          background: linear-gradient(
            135deg,
            rgba(5, 55, 108, 0.9),
            rgba(7, 31, 63, 0.9)
          );
        }

        .premiumShield {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          border: 1px solid rgba(58, 160, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #52aaff;
          font-size: 27px;
        }

        .premiumTitle {
          font-size: 14px;
        }

        .premiumTitle strong {
          color: #ffca55;
        }

        .premiumCard p {
          color: #8fa4be;
          font-size: 10px;
          line-height: 1.5;
          max-width: 400px;
        }

        .premiumFeatures {
          color: #7fc0ff;
          font-size: 10px;
          line-height: 2;
          white-space: nowrap;
        }

        /* REPORTS */

        .reportsPanel {
          padding-bottom: 14px;
        }

        .reportItem {
          display: grid;
          grid-template-columns: 32px 1fr 20px;
          align-items: center;
          gap: 10px;
          margin: 0 16px;
          padding: 11px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .pdf {
          font-size: 8px;
          color: #62aaff;
          border: 1px solid #286db0;
          padding: 5px 3px;
          border-radius: 4px;
          text-align: center;
        }

        .reportItem strong,
        .reportItem span {
          display: block;
        }

        .reportItem strong {
          font-size: 10px;
        }

        .reportItem span {
          color: #7f95b1;
          font-size: 9px;
          margin-top: 2px;
        }

        .download {
          color: #5aaeff;
        }

        .viewReports {
          margin: 13px 16px 0;
          width: calc(100% - 32px);
          padding: 9px;
          border: 1px solid #1c71c7;
          background: transparent;
          border-radius: 7px;
          color: #6eb7ff;
          font-size: 10px;
        }

        /* MOBILE */

        .mobileHeader,
        .mobileMenu,
        .mobileWelcome,
        .bottomNav {
          display: none;
        }

        /* TABLET */

        @media (max-width: 1050px) {
          .sidebar {
            width: 210px;
            min-width: 210px;
          }

          .content {
            padding: 25px 22px;
          }

          .statsGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboardGrid {
            grid-template-columns: 1fr;
          }

          .premiumCard {
            grid-column: auto;
          }

          .verification {
            grid-template-columns: 1.3fr 1fr 90px;
          }

          .verification .date {
            display: none;
          }
        }

        /* PHONE */

        @media (max-width: 700px) {
          .dashboard {
            display: block;
            min-height: 100vh;
            padding-bottom: 75px;
          }

          .sidebar {
            display: none;
          }

          .mobileHeader {
            position: sticky;
            top: 0;
            z-index: 100;
            height: 62px;
            padding: 0 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(5, 21, 47, 0.97);
            border-bottom: 1px solid rgba(70, 145, 230, 0.15);
          }

          .menuButton {
            border: 0;
            background: transparent;
            color: white;
            font-size: 24px;
            padding: 5px;
          }

          .mobileLogo {
            font-size: 15px;
            font-weight: 700;
          }

          .mobileBell {
            font-size: 17px;
          }

          .mobileMenu {
            position: fixed;
            inset: 0;
            z-index: 200;
            display: block;
            background: #06152f;
            padding: 22px;
            overflow-y: auto;
          }

          .mobileMenuHeader {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .mobileMenuLogo {
            font-size: 20px;
            font-weight: 700;
          }

          .mobileMenuSubtitle {
            color: #8fa5c2;
            font-size: 11px;
            line-height: 1.5;
            margin-top: 8px;
          }

          .closeMenu {
            border: 0;
            background: transparent;
            color: white;
            font-size: 30px;
          }

          .mobileMenuNav {
            margin-top: 35px;
          }

          .mobileNavItem {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 16px 14px;
            border-radius: 10px;
            color: #b3c3d8;
            font-size: 15px;
            margin-bottom: 5px;
          }

          .mobileNavItem.active {
            background: #0c64bd;
            color: white;
          }

          .mobileAccountLabel {
            color: #617996;
            font-size: 10px;
            letter-spacing: 1.5px;
            margin: 28px 14px 10px;
          }

          .content {
            width: 100%;
            padding: 22px 15px 30px;
          }

          .topBar {
            display: none;
          }

          .mobileWelcome {
            display: block;
            padding: 8px 2px 16px;
          }

          .mobileWelcome h1 {
            font-size: 25px;
            line-height: 1.25;
          }

          .mobileWelcome p {
            font-size: 12px;
            line-height: 1.5;
          }

          .verifyArea {
            display: block;
            margin: 10px 0 18px;
          }

          .verifyButton {
            width: 100%;
            padding: 14px;
          }

          .verifyHint {
            display: none;
          }

          .statsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
          }

          .statCard {
            padding: 12px;
            gap: 9px;
          }

          .statIcon {
            width: 34px;
            height: 34px;
            font-size: 15px;
          }

          .statLabel {
            white-space: normal;
            font-size: 9px;
          }

          .statNumber {
            font-size: 20px;
          }

          .dashboardGrid {
            display: block;
            margin-top: 12px;
          }

          .panel {
            margin-bottom: 12px;
          }

          .panelHeader {
            padding: 14px;
          }

          .panelHeader h2 {
            font-size: 14px;
          }

          .verificationList {
            padding: 0 12px;
          }

          .verification {
            grid-template-columns: 1fr auto;
            gap: 8px;
            padding: 12px 0;
          }

          .verification .document,
          .verification .date {
            display: none;
          }

          .verification .status {
            grid-column: 2;
            grid-row: 1;
          }

          .propertyName {
            font-size: 11px;
          }

          .propertyLocation {
            font-size: 9px;
          }

          .premiumCard {
            display: block;
            padding: 18px;
            margin-bottom: 12px;
          }

          .premiumShield {
            margin-bottom: 12px;
          }

          .premiumFeatures {
            margin-top: 12px;
            white-space: normal;
          }

          .fraudAlert {
            margin: 12px;
          }

          .bottomNav {
            position: fixed;
            display: flex;
            left: 0;
            right: 0;
            bottom: 0;
            height: 68px;
            z-index: 150;
            background: rgba(4, 18, 42, 0.98);
            border-top: 1px solid rgba(76, 149, 235, 0.18);
            justify-content: space-around;
            align-items: center;
          }

          .bottomItem {
            flex: 1;
            text-align: center;
            color: #7990ad;
            font-size: 17px;
          }

          .bottomItem span {
            display: block;
            margin-bottom: 4px;
          }

          .bottomItem small {
            font-size: 8px;
          }

          .bottomItem.active {
            color: #42a5ff;
          }
        }

        /* VERY SMALL PHONES */

        @media (max-width: 380px) {
          .content {
            padding-left: 12px;
            padding-right: 12px;
          }

          .mobileLogo {
            font-size: 13px;
          }

          .mobileWelcome h1 {
            font-size: 22px;
          }

          .statCard {
            padding: 10px;
          }

          .statIcon {
            display: none;
          }

          .statNumber {
            font-size: 18px;
          }
        }
      `}</style>
    </main>
  );
}

/* VERIFICATION ROW COMPONENT */

function Verification({
  property,
  location,
  document,
  status,
  statusType,
  date,
}: {
  property: string;
  location: string;
  document: string;
  status: string;
  statusType: "verified" | "review" | "processing";
  date: string;
}) {
  return (
    <div className="verification">
      <div>
        <div className="propertyName">{property}</div>
        <div className="propertyLocation">{location}</div>
      </div>

      <div className="document">{document}</div>

      <div>
        <span className={`status ${statusType}`}>
          {status}
        </span>
      </div>

      <div className="date">{date}</div>
    </div>
  );
}