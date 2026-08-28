"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type DashboardUser = {
  fullName: string;
  firstName: string;
  email: string;
  initial: string;
  plan: string;
};

type NavItem = {
  icon: string;
  label: string;
  path: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  /*
   * ============================================================
   * ACCOUNT-PAGE MASTER BRAND / NOTIFICATION VALUES
   * These values are extracted from the Account page and should
   * remain consistent across Dashboard, Verify and Reports.
   * ============================================================
   */

  const BRAND_BLUE = "#168eff";

  const [user, setUser] = useState<DashboardUser>({
    fullName: "User",
    firstName: "User",
    email: "",
    initial: "U",
    plan: "Free Plan",
  });

  const [stats] = useState({
    verifiedProperties: 0,
    pendingVerification: 0,
    fraudAlerts: 0,
    reportsAvailable: 0,
  });

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  const navItems: NavItem[] = [
    {
      icon: "▦",
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: "⇧",
      label: "Verify Property",
      path: "/verify",
    },
    {
      icon: "⌂",
      label: "My Properties",
      path: "/my-properties",
    },
    {
      icon: "◷",
      label: "Verification History",
      path: "/verification-history",
    },
    {
      icon: "◈",
      label: "Fraud Watch",
      path: "/fraud-watch",
    },
    {
      icon: "▤",
      label: "Reports",
      path: "/reports",
    },
  ];

  /*
   * ============================================================
   * GET LOGGED-IN USER
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        setLoadingUser(true);

        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error(
            "Could not load authenticated user:",
            error
          );

          return;
        }

        if (!authUser) {
          router.replace("/signin");
          return;
        }

        if (!mounted) {
          return;
        }

        const metadata = authUser.user_metadata || {};

        const metadataName =
          metadata.full_name ||
          metadata.name ||
          metadata.display_name ||
          "";

        const email = authUser.email || "";

        const fallbackName = email
          ? email
              .split("@")[0]
              .replace(/[._-]+/g, " ")
              .replace(/\b\w/g, (letter: string) =>
                letter.toUpperCase()
              )
          : "User";

        const fullName =
          String(metadataName).trim() ||
          fallbackName;

        const firstName =
          fullName.trim().split(/\s+/)[0] ||
          "User";

        const initial =
          firstName.charAt(0).toUpperCase() ||
          "U";

        const metadataPlan =
          metadata.plan ||
          metadata.subscription_plan ||
          metadata.account_plan ||
          "Free Plan";

        setUser({
          fullName,
          firstName,
          email,
          initial,
          plan: String(metadataPlan),
        });
      } catch (error) {
        console.error(
          "Dashboard user loading error:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
   * ============================================================
   * NAVIGATION HANDLER
   * ============================================================
   */

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  /*
   * ============================================================
   * SIGN OUT
   * ============================================================
   */

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();

      router.replace("/signin");
    } catch (error) {
      console.error(
        "Sign out error:",
        error
      );
    }
  };

  /*
   * ============================================================
   * PLAN DISPLAY
   * ============================================================
   */

  const planName =
    user.plan || "Free Plan";

  const isPremium =
    planName.toLowerCase().includes("premium");

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */

  if (loadingUser) {
    return (
      <main className="dashboardLoading">

        <div className="loadingBrand">

          <div className="loadingLogo">
            ◆
          </div>

          <div className="loadingTitle">
            PropertySure
            <strong> AI</strong>
          </div>

        </div>

        <div className="loadingText">
          Loading your dashboard...
        </div>

        <style jsx>{`

          .dashboardLoading {
            min-height: 100vh;

            background:
              radial-gradient(
                circle at 70% 0%,
                rgba(0, 123, 255, 0.18),
                transparent 30%
              ),
              #06152f;

            color: #ffffff;

            font-family:
              Inter,
              Arial,
              Helvetica,
              sans-serif;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            gap: 10px;
          }

          .loadingBrand {
            display: flex;

            align-items: center;

            gap: 8px;
          }

          .loadingLogo {
            color: #168eff;

            font-size: 42px;

            line-height: 1;
          }

          .loadingTitle {
            font-size: 22px;

            font-weight: 700;
          }

          .loadingTitle strong {
            color: #168eff;
          }

          .loadingText {
            color: #8ea4c3;

            font-size: 14px;
          }

        `}</style>

      </main>
    );
  }

  return (
    <main className="dashboard">

      {/* ========================================================
          MOBILE HEADER
      ======================================================== */}

      <header className="mobileHeader">

        <button
          className="menuButton"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          aria-label="Open navigation"
        >
          ☰
        </button>

        <button
          className="mobileLogoButton"
          onClick={() =>
            navigateTo("/dashboard")
          }
        >

          <span className="mobileLogoDiamond">
            ◆
          </span>

          <span className="mobileBrandName">
            PropertySure
            <strong> AI</strong>
          </span>

        </button>

        <button
          className="mobileBell"
          onClick={() =>
            navigateTo(
              "/account/notifications"
            )
          }
          aria-label="Notifications"
        >

          <span className="bellIcon">
            🔔
          </span>

          <span className="mobileNotificationDot" />

        </button>

      </header>

      {/* ========================================================
          MOBILE MENU
      ======================================================== */}

      {menuOpen && (

        <div className="mobileMenu">

          <div className="mobileMenuHeader">

            <div>

              <div className="mobileMenuLogo">

                <span>
                  ◆
                </span>

                <div>
                  PropertySure
                  <strong> AI</strong>
                </div>

              </div>

              <div className="mobileMenuSubtitle">
                AI-Powered Property Due Diligence
              </div>

            </div>

            <button
              className="closeMenu"
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close navigation"
            >
              ×
            </button>

          </div>

          <nav className="mobileMenuNav">

            {navItems.map(
              (item) => (

                <button
                  key={item.label}
                  className={`mobileNavItem ${
                    item.path === "/dashboard"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    navigateTo(item.path)
                  }
                >

                  <span className="navIcon">
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>

                </button>

              )
            )}

          </nav>

          <div className="mobileAccountLabel">
            ACCOUNT
          </div>

          <button
            className="mobileNavItem"
            onClick={() =>
              navigateTo("/account")
            }
          >

            <span className="navIcon">
              ◯
            </span>

            Account

          </button>

          <button
            className="mobileNavItem"
            onClick={() =>
              navigateTo("/settings")
            }
          >

            <span className="navIcon">
              ⚙
            </span>

            Settings

          </button>

          <button
            className="mobileNavItem logoutItem"
            onClick={handleSignOut}
          >

            <span className="navIcon">
              ↪
            </span>

            Sign Out

          </button>

        </div>

      )}

      {/* ========================================================
          DESKTOP SIDEBAR
      ======================================================== */}

      <aside className="sidebar">

        <button
          className="brandButton"
          onClick={() =>
            navigateTo("/dashboard")
          }
        >

          <div className="brandName">

            <span className="brandLogoDiamond">
              ◆
            </span>

            <span>
              PropertySure
              <strong> AI</strong>
            </span>

          </div>

          <div className="brandSubtitle">
            AI-Powered Property
            <br />
            Due Diligence
          </div>

        </button>

        <nav className="sidebarNav">

          {navItems.map(
            (item) => (

              <button
                key={item.label}
                className={`navItem ${
                  item.path === "/dashboard"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  navigateTo(item.path)
                }
              >

                <span className="navIcon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>

              </button>

            )
          )}

        </nav>

        <div className="accountLabel">
          ACCOUNT
        </div>

        <button
          className="navItem"
          onClick={() =>
            navigateTo("/account")
          }
        >

          <span className="navIcon">
            ◯
          </span>

          Account

        </button>

        <button
          className="navItem"
          onClick={() =>
            navigateTo("/settings")
          }
        >

          <span className="navIcon">
            ⚙
          </span>

          Settings

        </button>

        {/* SUPPORT */}

        <div className="helpBox">

          <div className="helpTitle">
            Need Help?
          </div>

          <div className="helpText">
            Our support team is ready to assist you.
          </div>

          <button
            className="supportButton"
            onClick={() =>
              navigateTo("/account")
            }
          >
            Contact Support
          </button>

        </div>

        {/* USER */}

        <button
          className="sidebarUser"
          onClick={() =>
            navigateTo("/account")
          }
        >

          <div className="avatar">
            {user.initial}
          </div>

          <div>

            <div className="userName">
              {user.fullName}
            </div>

            <div className="userPlan">
              {isPremium
                ? "♛ Premium Plan"
                : planName}
            </div>

          </div>

        </button>

      </aside>

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <section className="content">

        {/* ======================================================
            DESKTOP TOP BAR
        ====================================================== */}

        <header className="topBar">

          <div>

            <div className="eyebrow">
              PROPERTYSURE AI
            </div>

            <h1>
              Welcome back,{" "}
              {user.firstName} 👋
            </h1>

            <p>
              Stay ahead of property risks with
              AI-powered due diligence.
            </p>

          </div>

          <div className="topActions">

            {/* ACCOUNT-PAGE NOTIFICATION BELL */}

            <button
              className="notification"
              onClick={() =>
                navigateTo(
                  "/account/notifications"
                )
              }
              aria-label="Notifications"
            >

              <span className="bellIcon">
                🔔
              </span>

              <span className="notificationDot" />

            </button>

            <button
              className="profile"
              onClick={() =>
                navigateTo("/account")
              }
            >

              <div className="avatar large">
                {user.initial}
              </div>

              <div>

                <div className="userName">
                  {user.fullName}
                </div>

                <div className="userPlan">
                  {planName}
                </div>

              </div>

              <span className="chevron">
                ⌄
              </span>

            </button>

          </div>

        </header>

        {/* ======================================================
            MOBILE WELCOME
        ====================================================== */}

        <div className="mobileWelcome">

          <div className="eyebrow">
            PROPERTYSURE AI
          </div>

          <h1>
            Welcome back,{" "}
            {user.firstName} 👋
          </h1>

          <p>
            Stay ahead of property risks with
            AI-powered due diligence.
          </p>

        </div>

        {/* ======================================================
            VERIFY PROPERTY
        ====================================================== */}

        <div className="verifyArea">

          <button
            className="verifyButton"
            onClick={() =>
              navigateTo("/verify")
            }
          >

            <span>＋</span>

            Verify Property

          </button>

          <div className="verifyHint">
            Start a new property verification
          </div>

        </div>

        {/* ======================================================
            STAT CARDS
        ====================================================== */}

        <div className="statsGrid">

          <button
            className="statCard statButton"
            onClick={() =>
              navigateTo("/my-properties")
            }
          >

            <div className="statIcon green">
              ✓
            </div>

            <div>

              <div className="statLabel">
                Verified Properties
              </div>

              <div className="statNumber">
                {stats.verifiedProperties}
              </div>

              <div className="statLink">
                View properties
              </div>

            </div>

          </button>

          <button
            className="statCard statButton"
            onClick={() =>
              navigateTo(
                "/verification-history"
              )
            }
          >

            <div className="statIcon orange">
              ◷
            </div>

            <div>

              <div className="statLabel">
                Pending Verification
              </div>

              <div className="statNumber">
                {stats.pendingVerification}
              </div>

              <div className="statLink">
                View history
              </div>

            </div>

          </button>

          <button
            className="statCard statButton"
            onClick={() =>
              navigateTo("/fraud-watch")
            }
          >

            <div className="statIcon red">
              !
            </div>

            <div>

              <div className="statLabel">
                Fraud Alerts
              </div>

              <div
                className={
                  stats.fraudAlerts > 0
                    ? "statWarning"
                    : "statLink"
                }
              >
                {stats.fraudAlerts > 0
                  ? "Needs attention"
                  : "No active alerts"}
              </div>

              <div className="statNumber">
                {stats.fraudAlerts}
              </div>

            </div>

          </button>

          <button
            className="statCard statButton"
            onClick={() =>
              navigateTo("/reports")
            }
          >

            <div className="statIcon blue">
              ▤
            </div>

            <div>

              <div className="statLabel">
                Reports Available
              </div>

              <div className="statNumber">
                {stats.reportsAvailable}
              </div>

              <div className="statLink">
                View reports
              </div>

            </div>

          </button>

        </div>

        {/* ======================================================
            LOWER DASHBOARD
        ====================================================== */}

        <div className="dashboardGrid">

          {/* FRAUD WATCH */}

          <div className="panel fraudPanel">

            <div className="panelHeader">

              <h2>
                Fraud Watch
              </h2>

              <button
                className="viewLink"
                onClick={() =>
                  navigateTo("/fraud-watch")
                }
              >
                View all
              </button>

            </div>

            <div className="fraudEmpty">

              <div className="fraudEmptyIcon">
                ✓
              </div>

              <div className="fraudEmptyText">

                <h3>
                  No active fraud alerts
                </h3>

                <p>
                  You currently have no unresolved
                  fraud investigations.
                </p>

              </div>

              <div className="fraudShield">
                ◇
              </div>

            </div>

          </div>

          {/* PLAN */}

          <div className="premiumCard">

            <div
              className={`premiumShield ${
                isPremium
                  ? "premiumIcon"
                  : "freeIcon"
              }`}
            >
              {isPremium
                ? "♛"
                : "♕"}
            </div>

            <div className="planContent">

              <div className="premiumTitle">

                You're on{" "}

                <strong>
                  {isPremium
                    ? "Premium Plan"
                    : planName}
                </strong>

                {!isPremium && (
                  <span className="planBadge">
                    FREE
                  </span>
                )}

              </div>

              <p>
                {isPremium
                  ? "Enjoy priority support, advanced fraud detection, and professional verification."
                  : "Choose a PropertySure AI plan that matches your property verification needs."}
              </p>

              <button
                className="planButton"
                onClick={() =>
                  navigateTo("/account")
                }
              >
                Manage Plan
              </button>

            </div>

            {isPremium && (
              <div className="premiumFeatures">

                <div>
                  ✓ AI + Human Verification
                </div>

                <div>
                  ✓ Fraud Watch Monitoring
                </div>

                <div>
                  ✓ Priority Report Delivery
                </div>

                <div>
                  ✓ On-site Inspection
                </div>

              </div>
            )}

          </div>

        </div>

      </section>

      {/* ========================================================
          MOBILE BOTTOM NAVIGATION
      ======================================================== */}

      <nav className="bottomNav">

        <button
          className="bottomItem active"
          onClick={() =>
            navigateTo("/dashboard")
          }
        >

          <span>
            ▦
          </span>

          <small>
            Dashboard
          </small>

        </button>

        <button
          className="bottomItem"
          onClick={() =>
            navigateTo("/verify")
          }
        >

          <span>
            ⇧
          </span>

          <small>
            Verify
          </small>

        </button>

        <button
          className="bottomItem"
          onClick={() =>
            navigateTo("/my-properties")
          }
        >

          <span>
            ⌂
          </span>

          <small>
            Properties
          </small>

        </button>

        <button
          className="bottomItem"
          onClick={() =>
            navigateTo("/reports")
          }
        >

          <span>
            ▤
          </span>

          <small>
            Reports
          </small>

        </button>

        <button
          className="bottomItem"
          onClick={() =>
            navigateTo("/account")
          }
        >

          <span>
            ◯
          </span>

          <small>
            Account
          </small>

        </button>

      </nav>

      {/* ========================================================
          RESPONSIVE CSS
      ======================================================== */}

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

          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;

          display: flex;
        }

        button {
          font-family: inherit;
        }

        /* ======================================================
           SIDEBAR
        ====================================================== */

        .sidebar {
          width: 245px;

          min-width: 245px;

          min-height: 100vh;

          padding:
            28px 20px;

          background:
            rgba(4, 20, 47, 0.96);

          border-right:
            1px solid
            rgba(83, 157, 255, 0.18);

          display: flex;

          flex-direction: column;
        }

        .brandButton {
          border: none;

          background: transparent;

          color: white;

          padding: 0;

          text-align: left;

          cursor: pointer;
        }

        .brandName {
          display: flex;

          align-items: center;

          gap: 7px;

          font-size: 22px;

          font-weight: 700;

          letter-spacing: -0.35px;

          white-space: nowrap;
        }

        .brandName strong {
          color: #168eff;
        }

        .brandLogoDiamond {
          color: #168eff;

          font-size: 25px;

          line-height: 1;
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
          width: 100%;

          min-height: 48px;

          display: flex;

          align-items: center;

          gap: 14px;

          padding:
            0 14px;

          margin-bottom: 5px;

          border: none;

          border-radius: 10px;

          background: transparent;

          color: #aebed4;

          font-size: 14px;

          cursor: pointer;

          text-align: left;

          transition:
            background 0.2s,
            color 0.2s;
        }

        .navItem:hover {
          background:
            rgba(24, 112, 200, 0.14);

          color: white;
        }

        .navItem.active {
          color: white;

          background:
            linear-gradient(
              90deg,
              #0879df,
              #1268b7
            );

          box-shadow:
            0 5px 20px
            rgba(0, 120, 255, 0.2);
        }

        .navIcon {
          width: 20px;

          text-align: center;

          color: #82b9f2;

          flex-shrink: 0;
        }

        .accountLabel {
          color: #5f789a;

          font-size: 10px;

          letter-spacing: 1.5px;

          margin:
            28px 14px 10px;
        }

        /* ======================================================
           SUPPORT
        ====================================================== */

        .helpBox {
          margin-top: auto;

          padding: 16px;

          border:
            1px solid
            rgba(71, 151, 255, 0.25);

          border-radius: 12px;

          background:
            rgba(16, 88, 170, 0.08);
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

          border:
            1px solid #1678df;

          background: transparent;

          color: #7eb9f5;

          cursor: pointer;
        }

        /* ======================================================
           SIDEBAR USER
        ====================================================== */

        .sidebarUser {
          width: 100%;

          display: flex;

          align-items: center;

          gap: 10px;

          margin-top: 20px;

          padding: 5px;

          border: none;

          background: transparent;

          color: white;

          text-align: left;

          cursor: pointer;
        }

        .avatar {
          width: 36px;

          height: 36px;

          flex-shrink: 0;

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

        /* ======================================================
           CONTENT
        ====================================================== */

        .content {
          flex: 1;

          min-width: 0;

          padding:
            30px 34px 50px;

          overflow-x: hidden;
        }

        /* ======================================================
           TOP BAR
        ====================================================== */

        .topBar {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 25px;

          padding-bottom: 22px;

          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.08);
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

          font-size:
            clamp(24px, 3vw, 32px);

          font-weight: 600;
        }

        .topBar p,
        .mobileWelcome p {
          color: #91a7c3;

          margin:
            8px 0 0;

          font-size: 13px;
        }

        .topActions {
          display: flex;

          align-items: center;

          gap: 20px;
        }

        /* ======================================================
           ACCOUNT-PAGE NOTIFICATION BELL
           ====================================================== */

        .notification {
          width: 40px;

          height: 40px;

          border:
            1px solid
            rgba(60, 143, 232, 0.35);

          border-radius: 50%;

          background: transparent;

          display: flex;

          align-items: center;

          justify-content: center;

          position: relative;

          cursor: pointer;

          padding: 0;
        }

        .bellIcon {
          font-size: 17px;

          line-height: 1;

          display: block;
        }

        .notificationDot {
          position: absolute;

          width: 8px;

          height: 8px;

          top: 5px;

          right: 3px;

          border-radius: 50%;

          background: #168eff;

          box-shadow:
            0 0 8px
            rgba(22, 142, 255, 0.6);
        }

        .notification:hover {
          border-color:
            rgba(22, 142, 255, 0.65);

          background:
            rgba(22, 142, 255, 0.06);
        }

        .profile {
          display: flex;

          align-items: center;

          gap: 9px;

          border: none;

          background: transparent;

          color: white;

          cursor: pointer;

          text-align: left;
        }

        .chevron {
          color: #8aa0bb;

          margin-left: 4px;
        }

        /* ======================================================
           VERIFY PROPERTY
        ====================================================== */

        .verifyArea {
          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 15px;

          margin:
            20px 0;
        }

        .verifyButton {
          border: 0;

          border-radius: 8px;

          padding:
            13px 24px;

          background:
            linear-gradient(
              135deg,
              #168bff,
              #0866d1
            );

          color: white;

          font-size: 14px;

          font-weight: 600;

          cursor: pointer;

          box-shadow:
            0 8px 25px
            rgba(0, 110, 255, 0.2);

          transition:
            transform 0.15s,
            box-shadow 0.15s;
        }

        .verifyButton:hover {
          transform:
            translateY(-1px);

          box-shadow:
            0 12px 30px
            rgba(0, 110, 255, 0.3);
        }

        .verifyButton span {
          font-size: 19px;

          margin-right: 5px;
        }

        .verifyHint {
          color: #7f96b4;

          font-size: 11px;
        }

        /* ======================================================
           STATS
        ====================================================== */

        .statsGrid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap: 12px;
        }

        .statCard {
          min-width: 0;

          padding: 18px;

          border-radius: 12px;

          border:
            1px solid
            rgba(76, 149, 235, 0.23);

          background:
            rgba(7, 33, 68, 0.78);

          display: flex;

          align-items: center;

          gap: 13px;
        }

        .statButton {
          width: 100%;

          color: white;

          text-align: left;

          cursor: pointer;

          transition:
            transform 0.15s,
            border-color 0.15s;
        }

        .statButton:hover {
          transform:
            translateY(-1px);

          border-color:
            rgba(76, 149, 235, 0.5);
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
          background:
            rgba(30, 190, 125, 0.2);

          color: #39d995;
        }

        .orange {
          background:
            rgba(255, 160, 20, 0.2);

          color: #ffad28;
        }

        .red {
          background:
            rgba(240, 50, 65, 0.2);

          color: #ff5261;
        }

        .blue {
          background:
            rgba(35, 135, 255, 0.2);

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

          margin:
            2px 0;
        }

        .statLink {
          color: #48b2ff;

          font-size: 10px;
        }

        .statWarning {
          color: #ff5965;

          font-size: 10px;
        }

        /* ======================================================
           DASHBOARD GRID
        ====================================================== */

        .dashboardGrid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.4fr)
            minmax(300px, 1fr);

          gap: 14px;

          margin-top: 14px;
        }

        .panel,
        .premiumCard {
          border:
            1px solid
            rgba(76, 149, 235, 0.23);

          background:
            rgba(7, 31, 63, 0.8);

          border-radius: 12px;

          overflow: hidden;
        }

        .panelHeader {
          display: flex;

          justify-content: space-between;

          align-items: center;

          padding:
            16px 18px;

          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.06);
        }

        .panelHeader h2 {
          margin: 0;

          font-size: 15px;
        }

        .viewLink {
          border: none;

          background: transparent;

          color: #48aaff;

          font-size: 11px;

          cursor: pointer;

          padding: 0;
        }

        /* ======================================================
           FRAUD WATCH
        ====================================================== */

        .fraudPanel {
          min-height: 190px;
        }

        .fraudEmpty {
          min-height: 130px;

          padding:
            22px 20px;

          display: flex;

          align-items: center;

          gap: 16px;

          position: relative;
        }

        .fraudEmptyIcon {
          width: 54px;

          height: 54px;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            rgba(30, 190, 125, 0.16);

          color: #39d995;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 24px;

          font-weight: 700;
        }

        .fraudEmptyText {
          position: relative;

          z-index: 2;
        }

        .fraudEmpty h3 {
          margin:
            0 0 6px;

          font-size: 16px;
        }

        .fraudEmpty p {
          color: #8299b6;

          font-size: 11px;

          line-height: 1.6;

          margin: 0;

          max-width: 380px;
        }

        .fraudShield {
          margin-left: auto;

          width: 100px;

          height: 100px;

          border-radius: 50%;

          display: flex;

          align-items: center;

          justify-content: center;

          color:
            rgba(57, 150, 255, 0.3);

          font-size: 65px;

          opacity: 0.8;
        }

        /* ======================================================
           PLAN CARD
        ====================================================== */

        .premiumCard {
          padding:
            20px;

          display: flex;

          align-items: center;

          gap: 16px;

          background:
            linear-gradient(
              135deg,
              rgba(5, 55, 108, 0.9),
              rgba(7, 31, 63, 0.9)
            );
        }

        .premiumShield {
          width: 58px;

          height: 58px;

          flex-shrink: 0;

          border-radius: 16px;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 27px;
        }

        .premiumIcon {
          border:
            1px solid
            rgba(255, 196, 70, 0.4);

          background:
            rgba(255, 178, 30, 0.08);

          color: #ffca55;
        }

        .freeIcon {
          border:
            1px solid
            rgba(58, 160, 255, 0.4);

          background:
            rgba(20, 120, 220, 0.08);

          color: #52aaff;
        }

        .planContent {
          min-width: 0;

          flex: 1;
        }

        .premiumTitle {
          font-size: 15px;

          line-height: 1.4;
        }

        .premiumTitle strong {
          color: #ffca55;
        }

        .premiumCard p {
          color: #8fa4be;

          font-size: 11px;

          line-height: 1.6;

          max-width: 440px;

          margin:
            5px 0 12px;
        }

        .planBadge {
          display: inline-flex;

          align-items: center;

          margin-left: 7px;

          padding:
            3px 7px;

          border-radius: 5px;

          background:
            rgba(35, 135, 255, 0.18);

          color: #48aaff;

          font-size: 9px;

          font-weight: 700;

          vertical-align: middle;
        }

        .planButton {
          border:
            1px solid
            #1678df;

          background:
            transparent;

          color: #70b9ff;

          padding:
            9px 15px;

          border-radius: 7px;

          font-size: 11px;

          cursor: pointer;

          transition:
            background 0.2s;
        }

        .planButton:hover {
          background:
            rgba(22, 120, 223, 0.12);
        }

        .premiumFeatures {
          color: #7fc0ff;

          font-size: 10px;

          line-height: 2;

          white-space: nowrap;

          margin-left: auto;
        }

        /* ======================================================
           MOBILE ELEMENTS
        ====================================================== */

        .mobileHeader,
        .mobileMenu,
        .mobileWelcome,
        .bottomNav {
          display: none;
        }

        /* ======================================================
           TABLET
        ====================================================== */

        @media (max-width: 1050px) {

          .sidebar {
            width: 210px;

            min-width: 210px;
          }

          .content {
            padding:
              25px 22px;
          }

          .statsGrid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .dashboardGrid {
            grid-template-columns:
              1fr;
          }

        }

        /* ======================================================
           PHONE
        ====================================================== */

        @media (max-width: 700px) {

          .dashboard {
            display: block;

            min-height: 100vh;

            padding-bottom: 75px;
          }

          .sidebar {
            display: none;
          }

          /* ==================================================
             MOBILE HEADER
             ================================================== */

          .mobileHeader {
            position: sticky;

            top: 0;

            z-index: 100;

            height: 72px;

            padding:
              0 14px;

            display: grid;

            grid-template-columns:
              44px
              minmax(0, 1fr)
              44px;

            align-items: center;

            background:
              rgba(3, 18, 40, 0.98);

            border-bottom:
              1px solid #193650;
          }

          .menuButton {
            width: 40px;

            height: 40px;

            border: 0;

            background: transparent;

            color: white;

            font-size: 24px;

            padding: 5px;

            cursor: pointer;
          }

          .mobileLogoButton {
            height: 40px;

            border: none;

            background: transparent;

            color: white;

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 7px;

            font-size: 17px;

            font-weight: 700;

            letter-spacing: -0.2px;

            cursor: pointer;

            min-width: 0;
          }

          .mobileLogoDiamond {
            color: #168eff;

            font-size: 23px;

            line-height: 1;

            flex-shrink: 0;
          }

          .mobileBrandName {
            white-space: nowrap;
          }

          .mobileBrandName strong {
            color: #168eff;
          }

          /* ==================================================
             MOBILE NOTIFICATION
             ================================================== */

          .mobileBell {
            width: 40px;

            height: 40px;

            border: 0;

            background: transparent;

            color: white;

            position: relative;

            display: grid;

            place-items: center;

            cursor: pointer;

            padding: 0;
          }

          .mobileBell .bellIcon {
            font-size: 17px;

            line-height: 1;
          }

          .mobileNotificationDot {
            position: absolute;

            width: 8px;

            height: 8px;

            top: 5px;

            right: 3px;

            border-radius: 50%;

            background: #168eff;

            box-shadow:
              0 0 8px
              rgba(22, 142, 255, 0.6);
          }

          .mobileBell:hover {
            background:
              rgba(22, 142, 255, 0.05);

            border-radius: 50%;
          }

          /* ==================================================
             MOBILE MENU
             ================================================== */

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
            display: flex;

            align-items: center;

            gap: 8px;

            font-size: 20px;

            font-weight: 700;
          }

          .mobileMenuLogo > span {
            color: #168eff;

            font-size: 25px;

            line-height: 1;
          }

          .mobileMenuLogo strong {
            color: #168eff;
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

            cursor: pointer;
          }

          .mobileMenuNav {
            margin-top: 35px;
          }

          .mobileNavItem {
            width: 100%;

            display: flex;

            align-items: center;

            gap: 15px;

            padding:
              16px 14px;

            border-radius: 10px;

            border: none;

            background: transparent;

            color: #b3c3d8;

            font-size: 15px;

            margin-bottom: 5px;

            cursor: pointer;

            text-align: left;
          }

          .mobileNavItem:hover {
            background:
              rgba(25, 111, 200, 0.14);
          }

          .mobileNavItem.active {
            background: #0c64bd;

            color: white;
          }

          .logoutItem {
            color: #ff8b91;
          }

          .mobileAccountLabel {
            color: #617996;

            font-size: 10px;

            letter-spacing: 1.5px;

            margin:
              28px 14px 10px;
          }

          /* ==================================================
             CONTENT
             ================================================== */

          .content {
            width: 100%;

            padding:
              22px 15px 30px;
          }

          .topBar {
            display: none;
          }

          .mobileWelcome {
            display: block;

            padding:
              8px 2px 16px;
          }

          .mobileWelcome h1 {
            font-size: 25px;

            line-height: 1.25;
          }

          .mobileWelcome p {
            font-size: 12px;

            line-height: 1.5;
          }

          /* ==================================================
             VERIFY
             ================================================== */

          .verifyArea {
            display: block;

            margin:
              10px 0 18px;
          }

          .verifyButton {
            width: 100%;

            padding:
              15px;
          }

          .verifyHint {
            display: none;
          }

          /* ==================================================
             STATS
             ================================================== */

          .statsGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

            gap: 9px;
          }

          .statCard {
            padding: 12px;

            gap: 9px;

            min-height: 112px;
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

          .statLink,
          .statWarning {
            font-size: 10px;
          }

          /* ==================================================
             LOWER
             ================================================== */

          .dashboardGrid {
            display: block;

            margin-top: 12px;
          }

          .panel {
            margin-bottom: 12px;
          }

          .panelHeader {
            padding:
              14px;
          }

          .panelHeader h2 {
            font-size: 15px;
          }

          /* ==================================================
             FRAUD
             ================================================== */

          .fraudPanel {
            min-height: 180px;
          }

          .fraudEmpty {
            min-height: 125px;

            padding:
              20px 14px;

            gap: 14px;
          }

          .fraudEmptyIcon {
            width: 48px;

            height: 48px;

            font-size: 21px;
          }

          .fraudEmpty h3 {
            font-size: 14px;
          }

          .fraudEmpty p {
            font-size: 10px;

            max-width: 245px;
          }

          .fraudShield {
            display: none;
          }

          /* ==================================================
             PLAN
             ================================================== */

          .premiumCard {
            display: flex;

            padding:
              18px;

            margin-bottom: 12px;

            align-items: center;
          }

          .premiumShield {
            width: 50px;

            height: 50px;

            border-radius: 14px;

            font-size: 23px;
          }

          .premiumTitle {
            font-size: 14px;
          }

          .premiumCard p {
            font-size: 10px;

            margin:
              4px 0 10px;

            max-width: 320px;
          }

          .planButton {
            padding:
              9px 14px;

            font-size: 10px;
          }

          .premiumFeatures {
            display: none;
          }

          /* ==================================================
             BOTTOM NAV
             ================================================== */

          .bottomNav {
            position: fixed;

            display: flex;

            left: 0;

            right: 0;

            bottom: 0;

            height: 74px;

            z-index: 150;

            background:
              rgba(3, 18, 40, 0.98);

            border-top:
              1px solid #193650;

            justify-content:
              space-around;

            align-items: center;

            backdrop-filter:
              blur(15px);
          }

          .bottomItem {
            flex: 1;

            height: 100%;

            border: none;

            background: transparent;

            text-align: center;

            color: #7990ad;

            font-size: 17px;

            cursor: pointer;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            gap: 4px;
          }

          .bottomItem span {
            display: block;

            line-height: 1;

            font-size: 20px;
          }

          .bottomItem small {
            font-size: 8px;
          }

          .bottomItem.active {
            color: #168eff;
          }

        }

        /* ======================================================
           VERY SMALL PHONES
        ====================================================== */

        @media (max-width: 380px) {

          .content {
            padding-left: 12px;

            padding-right: 12px;
          }

          .mobileLogoButton {
            font-size: 15px;
          }

          .mobileLogoDiamond {
            font-size: 21px;
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

          .premiumCard {
            gap: 10px;
          }

          .premiumShield {
            width: 44px;

            height: 44px;
          }

        }

      `}</style>

    </main>
  );
}