"use client";

import {
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

import { supabase } from "../lib/supabase";

import styles from "./AppShell.module.css";

type NavItem = {
  label: string;
  path: string;
  icon: string;
};

const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "▦",
  },
  {
    label: "Verify Property",
    path: "/verify",
    icon: "⇧",
  },
  {
    label: "My Properties",
    path: "/my-properties",
    icon: "⌂",
  },
  {
    label: "Verification History",
    path: "/verification-history",
    icon: "◷",
  },
  {
    label: "Fraud Watch",
    path: "/fraud-watch",
    icon: "◈",
  },
  {
    label: "Reports",
    path: "/reports",
    icon: "▤",
  },
];

const accountNavItems: NavItem[] = [
  {
    label: "Account",
    path: "/account",
    icon: "◯",
  },
  {
    label: "Settings",
    path: "/settings",
    icon: "⚙",
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "▦",
  },
  {
    label: "Verify",
    path: "/verify",
    icon: "⇧",
  },
  {
    label: "Properties",
    path: "/my-properties",
    icon: "⌂",
  },
  {
    label: "Reports",
    path: "/reports",
    icon: "▤",
  },
  {
    label: "Account",
    path: "/account",
    icon: "◯",
  },
];

type AppShellProps = {
  children: ReactNode;
  activePath: string;

  /*
   * Optional header route.
   *
   * Example:
   *
   * activePath="/verify"
   * headerPath="/verify/review"
   *
   * This means:
   *
   * - Verify Property stays active in navigation
   * - Header can display "Review Package"
   */
  headerPath?: string;
};

type PageHeader = {
  title: string;
  description: string;
};

const pageHeaders: Record<
  string,
  PageHeader
> = {
  "/dashboard": {
    title: "Dashboard",
    description:
      "Stay ahead of property risks with AI-powered due diligence.",
  },

  "/verify": {
    title: "Verify Property",
    description:
      "Upload and verify property documents with AI-powered due diligence.",
  },

  /*
   * REVIEW PACKAGE
   *
   * Verify Property remains active in navigation
   * while the desktop header displays Review Package.
   */
  "/verify/review": {
    title: "Review Package",
    description:
      "Review the property document package before AI verification analysis begins.",
  },

  /*
   * SELECT PLAN
   *
   * Verify Property remains active in navigation
   * while the desktop header displays Select Plan.
   */
  "/verify/select-plan": {
    title: "Select Plan",
    description:
      "Choose the verification service that best fits your property transaction.",
  },

  /*
   * SECURE CHECKOUT
   *
   * Verify Property remains active in navigation
   * while the desktop header displays Secure Checkout.
   */
  "/verify/checkout": {
    title: "Secure Checkout",
    description:
      "Complete your payment securely to begin property verification.",
  },

  /*
   * VERIFICATION
   *
   * Step 5 of the verification workflow.
   *
   * The /processing route is the active verification
   * stage after checkout and payment confirmation.
   *
   * Verify Property remains active in navigation
   * while the desktop header displays Verification.
   */
  "/processing": {
    title: "Verification",
    description:
      "AI-powered verification analysis is being performed on your property document package.",
  },

  /*
   * VERIFICATION RESULT
   *
   * Verify Property remains active in navigation
   * while the desktop header displays Verification Result.
   */
  "/result": {
    title: "Verification Result",
    description:
      "Review the findings and verification outcome for your property document package.",
  },

  "/my-properties": {
    title: "My Properties",
    description:
      "Manage and review your verified property records.",
  },

  "/verification-history": {
    title: "Verification History",
    description:
      "Review your previous property verification activities.",
  },

  "/fraud-watch": {
    title: "Fraud Watch",
    description:
      "Monitor verified properties for potential fraud risks.",
  },

  "/reports": {
    title: "Reports",
    description:
      "Access and manage your property verification reports.",
  },

  "/account": {
    title: "Account",
    description:
      "Manage your account information and preferences.",
  },

  "/settings": {
    title: "Settings",
    description:
      "Manage your PropertySure AI settings.",
  },

  /*
   * SIGN OUT
   *
   * The Sign Out page is a proper page inside the
   * shared AppShell.
   *
   * The AppShell Sign Out button only navigates to
   * /sign-out.
   *
   * The actual Supabase sign-out happens on the
   * dedicated Sign Out confirmation page.
   */
  "/sign-out": {
    title: "Sign Out",
    description:
      "Sign out of your PropertySure AI account on this device.",
  },

  "/settings/general": {
    title: "General Settings",
    description:
      "Manage your general account preferences.",
  },

  "/settings/security": {
    title: "Security & Privacy",
    description:
      "Manage your account security and privacy settings.",
  },

  "/settings/notifications": {
    title: "Notifications",
    description:
      "Manage your notification preferences.",
  },

  "/settings/appearance": {
    title: "Appearance",
    description:
      "Customize how PropertySure AI looks.",
  },

  "/settings/language-region": {
    title: "Language & Region",
    description:
      "Manage your language and regional preferences.",
  },

  "/settings/data-privacy": {
    title: "Data & Privacy",
    description:
      "Manage your data and privacy preferences.",
  },

  "/settings/support-help": {
    title: "Support & Help",
    description:
      "Find help and contact the PropertySure AI support team.",
  },
};

export default function AppShell({
  children,
  activePath,
  headerPath,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [userName, setUserName] =
    useState("User");

  const [userPlan, setUserPlan] =
    useState("Free Plan");

  const [userInitial, setUserInitial] =
    useState("U");

  const [currentDate, setCurrentDate] =
    useState("");

  const [currentTime, setCurrentTime] =
    useState("");

  const isDashboard =
    activePath === "/dashboard";

  /*
   * IMPORTANT:
   *
   * Navigation state is controlled by activePath.
   *
   * Header display can independently use
   * headerPath when supplied.
   */
  const header =
    pageHeaders[
      headerPath || activePath
    ] ||
    pageHeaders["/dashboard"];

  /* ==========================================================
     LOAD AUTHENTICATED USER
     ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        return;
      }

      const metadata =
        user.user_metadata || {};

      const fullName =
        metadata.full_name ||
        metadata.name ||
        metadata.display_name ||
        "User";

      const firstLetter =
        String(fullName)
          .trim()
          .charAt(0)
          .toUpperCase() || "U";

      const plan =
        metadata.plan ||
        metadata.subscription_plan ||
        metadata.account_plan ||
        "Free Plan";

      setUserName(fullName);
      setUserInitial(firstLetter);
      setUserPlan(plan);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     DASHBOARD DATE + TIME

     Date and time ONLY appear on Dashboard.
     ========================================================== */

  useEffect(() => {
    if (!isDashboard) {
      return;
    }

    function updateDateTime() {
      const now = new Date();

      const date =
        new Intl.DateTimeFormat(
          "en-GB",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        ).format(now);

      const time =
        new Intl.DateTimeFormat(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }
        ).format(now);

      setCurrentDate(date);
      setCurrentTime(time);
    }

    updateDateTime();

    const interval =
      window.setInterval(
        updateDateTime,
        30000
      );

    return () =>
      window.clearInterval(interval);
  }, [isDashboard]);

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  function navigateTo(path: string) {
    setMenuOpen(false);

    window.location.href = path;
  }

  /*
   * IMPORTANT SIGN-OUT FLOW
   *
   * DO NOT sign the user out here.
   *
   * The AppShell Sign Out button first takes the user
   * to the dedicated /sign-out confirmation page.
   *
   * The actual authentication sign-out happens only
   * after the user confirms on that page.
   */
  function handleSignOut() {
    setMenuOpen(false);

    window.location.href = "/sign-out";
  }

  function isActive(path: string) {
    return path === activePath;
  }

  return (
    <main className={styles.shell}>

      {/* ======================================================
          MOBILE HEADER
          ====================================================== */}

      <header
        className={
          styles.mobileHeader
        }
      >
        <button
          type="button"
          className={
            styles.menuButton
          }
          onClick={() =>
            setMenuOpen(true)
          }
          aria-label="Open navigation"
        >
          ☰
        </button>

        <button
          type="button"
          className={
            styles.mobileBrand
          }
          onClick={() =>
            navigateTo("/dashboard")
          }
          aria-label="Go to Dashboard"
        >
          <span
            className={
              styles.mobileDiamond
            }
          >
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </button>

        <button
          type="button"
          className={
            styles.mobileBell
          }
          onClick={() =>
            navigateTo(
              "/settings/notifications"
            )
          }
          aria-label="Notifications"
        >
          <span
            className={
              styles.bellIcon
            }
          >
            🔔
          </span>

          <span
            className={
              styles.notificationDot
            }
          />
        </button>
      </header>

      {/* ======================================================
          MOBILE MENU
          ====================================================== */}

      {menuOpen && (
        <div
          className={
            styles.mobileMenu
          }
        >
          <div
            className={
              styles.mobileMenuHeader
            }
          >
            <button
              type="button"
              className={
                styles.mobileMenuBrand
              }
              onClick={() =>
                navigateTo("/dashboard")
              }
            >
              <span
                className={
                  styles.mobileMenuDiamond
                }
              >
                ◆
              </span>

              <span>
                PropertySure
                <strong> AI</strong>
              </span>
            </button>

            <button
              type="button"
              className={
                styles.closeButton
              }
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close navigation"
            >
              ×
            </button>
          </div>

          <div
            className={
              styles.mobileSubtitle
            }
          >
            AI-Powered Property
            <br />
            Due Diligence
          </div>

          <nav
            className={
              styles.mobileNav
            }
          >
            {mainNavItems.map(
              (item) => (
                <button
                  type="button"
                  key={item.path}
                  className={`${styles.mobileNavItem} ${
                    isActive(
                      item.path
                    )
                      ? styles.active
                      : ""
                  }`}
                  onClick={() =>
                    navigateTo(
                      item.path
                    )
                  }
                >
                  <span
                    className={
                      styles.navIcon
                    }
                  >
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>
                </button>
              )
            )}
          </nav>

          <div
            className={
              styles.accountLabel
            }
          >
            ACCOUNT
          </div>

          {accountNavItems.map(
            (item) => (
              <button
                type="button"
                key={item.path}
                className={`${styles.mobileNavItem} ${
                  isActive(
                    item.path
                  )
                    ? styles.active
                    : ""
                }`}
                onClick={() =>
                  navigateTo(
                    item.path
                  )
                }
              >
                <span
                  className={
                    styles.navIcon
                  }
                >
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>
              </button>
            )
          )}

          {/* ==================================================
              MOBILE SIGN OUT
              ================================================== */}

          <button
            type="button"
            className={`${styles.mobileNavItem} ${styles.logoutItem}`}
            onClick={
              handleSignOut
            }
          >
            <span
              className={
                styles.navIcon
              }
            >
              ↪
            </span>

            <span>
              Sign Out
            </span>
          </button>

          {/* NEED HELP IS LAST */}

          <div
            className={
              styles.helpBox
            }
          >
            <div
              className={
                styles.helpTitle
              }
            >
              Need Help?
            </div>

            <p
              className={
                styles.helpText
              }
            >
              Our support team is ready
              to assist you.
            </p>

            <button
              type="button"
              className={
                styles.supportButton
              }
              onClick={() =>
                navigateTo(
                  "/settings/support-help/contact-support"
                )
              }
            >
              Contact Support
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          DESKTOP APP SHELL
          ====================================================== */}

      <div
        className={
          styles.desktopShell
        }
      >

        {/* ====================================================
            SIDEBAR
            ==================================================== */}

        <aside
          className={
            styles.sidebar
          }
        >
          <button
            type="button"
            className={
              styles.sidebarBrand
            }
            onClick={() =>
              navigateTo("/dashboard")
            }
          >
            <div
              className={
                styles.brandRow
              }
            >
              <span
                className={
                  styles.brandDiamond
                }
              >
                ◆
              </span>

              <span
                className={
                  styles.brandText
                }
              >
                PropertySure
                <strong> AI</strong>
              </span>
            </div>

            <div
              className={
                styles.brandSubtitle
              }
            >
              AI-Powered Property
              <br />
              Due Diligence
            </div>
          </button>

          <nav
            className={
              styles.sidebarNav
            }
          >
            {mainNavItems.map(
              (item) => (
                <button
                  type="button"
                  key={item.path}
                  className={`${styles.navItem} ${
                    isActive(
                      item.path
                    )
                      ? styles.active
                      : ""
                  }`}
                  onClick={() =>
                    navigateTo(
                      item.path
                    )
                  }
                >
                  <span
                    className={
                      styles.navIcon
                    }
                  >
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>
                </button>
              )
            )}
          </nav>

          <div
            className={
              styles.accountLabel
            }
          >
            ACCOUNT
          </div>

          {accountNavItems.map(
            (item) => (
              <button
                type="button"
                key={item.path}
                className={`${styles.navItem} ${
                  isActive(
                    item.path
                  )
                    ? styles.active
                    : ""
                }`}
                onClick={() =>
                  navigateTo(
                    item.path
                  )
                }
              >
                <span
                  className={
                    styles.navIcon
                  }
                >
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>
              </button>
            )
          )}

          {/* ==================================================
              DESKTOP SIGN OUT
              ================================================== */}

          <button
            type="button"
            className={`${styles.navItem} ${styles.logoutItem}`}
            onClick={
              handleSignOut
            }
          >
            <span
              className={
                styles.navIcon
              }
            >
              ↪
            </span>

            <span>
              Sign Out
            </span>
          </button>

          {/* NEED HELP IS LAST */}

          <div
            className={
              styles.helpBox
            }
          >
            <div
              className={
                styles.helpTitle
              }
            >
              Need Help?
            </div>

            <p
              className={
                styles.helpText
              }
            >
              Our support team is ready
              to assist you.
            </p>

            <button
              type="button"
              className={
                styles.supportButton
              }
              onClick={() =>
                navigateTo(
                  "/settings/support-help/contact-support"
                )
              }
            >
              Contact Support
            </button>
          </div>
        </aside>

        {/* ====================================================
            MAIN AREA
            ==================================================== */}

        <section
          className={
            styles.mainArea
          }
        >
          <header
            className={
              styles.topHeader
            }
          >
            <div
              className={
                styles.headerTitleBlock
              }
            >
              <div
                className={
                  styles.headerEyebrow
                }
              >
                PROPERTYSURE AI
              </div>

              <div
                className={
                  styles.headerTitle
                }
              >
                {header.title}
              </div>

              <div
                className={
                  styles.headerDescription
                }
              >
                {header.description}
              </div>
            </div>

            <div
              className={
                styles.headerRight
              }
            >

              {/* DATE/TIME — DASHBOARD ONLY */}

              {isDashboard && (
                <div
                  className={
                    styles.dateTime
                  }
                >
                  <div
                    className={
                      styles.dateText
                    }
                  >
                    {currentDate}
                  </div>

                  <div
                    className={
                      styles.timeText
                    }
                  >
                    {currentTime}
                  </div>
                </div>
              )}

              {/* NOTIFICATION */}

              <button
                type="button"
                className={
                  styles.desktopBell
                }
                onClick={() =>
                  navigateTo(
                    "/settings/notifications"
                  )
                }
                aria-label="Notifications"
              >
                <span>
                  🔔
                </span>

                <i
                  className={
                    styles.desktopNotificationDot
                  }
                />
              </button>

              {/* USER */}

              <button
                type="button"
                className={
                  styles.userMenu
                }
                onClick={() =>
                  navigateTo(
                    "/account"
                  )
                }
                aria-label="Open account"
              >
                <span
                  className={
                    styles.userAvatar
                  }
                >
                  {userInitial}
                </span>

                <span
                  className={
                    styles.userDetails
                  }
                >
                  <strong>
                    {userName}
                  </strong>

                  <small>
                    {userPlan}
                  </small>
                </span>

                <span
                  className={
                    styles.userArrow
                  }
                >
                  ˅
                </span>
              </button>
            </div>
          </header>

          <div
            className={
              styles.pageContent
            }
          >
            {children}
          </div>
        </section>
      </div>

      {/* ======================================================
          MOBILE BOTTOM NAVIGATION
          ====================================================== */}

      <nav
        className={
          styles.bottomNav
        }
      >
        {bottomNavItems.map(
          (item) => (
            <button
              type="button"
              key={item.path}
              className={`${styles.bottomNavItem} ${
                isActive(
                  item.path
                )
                  ? styles.bottomActive
                  : ""
              }`}
              onClick={() =>
                navigateTo(
                  item.path
                )
              }
            >
              <span
                className={
                  styles.bottomIcon
                }
              >
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </button>
          )
        )}
      </nav>

    </main>
  );
}