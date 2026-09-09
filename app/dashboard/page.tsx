"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../lib/supabase";
import styles from "./dashboard.module.css";

type DashboardUser = {
  fullName: string;
  firstName: string;
  email: string;
  initial: string;
  plan: string;
};

type IconName =
  | "dashboard"
  | "verify"
  | "properties"
  | "history"
  | "fraud"
  | "reports"
  | "account"
  | "settings"
  | "bell"
  | "calendar"
  | "check"
  | "clock"
  | "warning"
  | "document"
  | "shield"
  | "crown"
  | "arrow"
  | "menu"
  | "close";

function Icon({ name }: { name: IconName }) {
  const icons: Record<IconName, string> = {
    dashboard: "▦",
    verify: "⇧",
    properties: "⌂",
    history: "◷",
    fraud: "◈",
    reports: "▤",
    account: "◯",
    settings: "⚙",
    bell: "🔔",
    calendar: "▣",
    check: "✓",
    clock: "◷",
    warning: "!",
    document: "▤",
    shield: "◇",
    crown: "♛",
    arrow: "→",
    menu: "☰",
    close: "×",
  };

  return (
    <span
      aria-hidden="true"
      className={styles.icon}
    >
      {icons[name]}
    </span>
  );
}

function normalizePlanName(value: unknown): string {
  if (!value) {
    return "Free Plan";
  }

  const raw = String(value)
    .trim()
    .replace(/\s+/g, " ");

  if (!raw) {
    return "Free Plan";
  }

  const lower = raw.toLowerCase();

  if (
    lower === "free" ||
    lower === "free plan"
  ) {
    return "Free Plan";
  }

  if (
    lower === "basic" ||
    lower === "basic plan"
  ) {
    return "Basic Plan";
  }

  if (
    lower === "professional" ||
    lower === "professional plan" ||
    lower === "pro" ||
    lower === "pro plan"
  ) {
    return "Professional Plan";
  }

  if (
    lower === "premium" ||
    lower === "premium plan"
  ) {
    return "Premium Plan";
  }

  return raw;
}

function getPlanLabel(plan: string): string {
  const cleaned = plan
    .replace(/\s+plan$/i, "")
    .trim();

  return cleaned || "Free";
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<DashboardUser>({
      fullName: "User",
      firstName: "User",
      email: "",
      initial: "U",
      plan: "Free Plan",
    });

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [currentDate, setCurrentDate] =
    useState<Date | null>(null);

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const navItems = [
    {
      icon: "dashboard" as IconName,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: "verify" as IconName,
      label: "Verify Property",
      path: "/verify",
    },
    {
      icon: "properties" as IconName,
      label: "My Properties",
      path: "/my-properties",
    },
    {
      icon: "history" as IconName,
      label: "Verification History",
      path: "/verification-history",
    },
    {
      icon: "fraud" as IconName,
      label: "Fraud Watch",
      path: "/fraud-watch",
    },
    {
      icon: "reports" as IconName,
      label: "Reports",
      path: "/reports",
    },
  ];

  useEffect(() => {
    setCurrentDate(new Date());

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

        const metadata =
          authUser.user_metadata || {};

        const metadataName =
          metadata.full_name ||
          metadata.name ||
          metadata.display_name ||
          "";

        const email =
          authUser.email || "";

        const fallbackName = email
          ? email
              .split("@")[0]
              .replace(/[._-]+/g, " ")
              .replace(
                /\b\w/g,
                (letter: string) =>
                  letter.toUpperCase()
              )
          : "User";

        const fullName =
          String(metadataName).trim() ||
          fallbackName;

        const firstName =
          fullName
            .trim()
            .split(/\s+/)[0] || "User";

        const initial =
          firstName
            .charAt(0)
            .toUpperCase() || "U";

        const metadataPlan =
          metadata.plan ||
          metadata.subscription_plan ||
          metadata.account_plan ||
          "Free Plan";

        const plan =
          normalizePlanName(metadataPlan);

        setUser({
          fullName,
          firstName,
          email,
          initial,
          plan,
        });
      } catch (error) {
        console.error(
          "User loading error:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    void loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      setMenuOpen(false);

      await supabase.auth.signOut();

      router.replace("/signin");
    } catch (error) {
      console.error(
        "Sign out error:",
        error
      );
    }
  };

  const planName =
    user.plan || "Free Plan";

  const planLabel =
    getPlanLabel(planName);

  const isFree =
    planName
      .toLowerCase()
      .includes("free");

  const isPremium =
    planName
      .toLowerCase()
      .includes("premium");

  const isPaid =
    !isFree;

  const desktopDate = currentDate
    ? new Intl.DateTimeFormat(
        "en-GB",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      ).format(currentDate)
    : "";

  const mobileDate = currentDate
    ? new Intl.DateTimeFormat(
        "en-GB",
        {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      ).format(currentDate)
    : "";

  /*
   * =========================================================
   * LOADING SCREEN
   * =========================================================
   *
   * This is intentionally simple and branded.
   * The same loading pattern can be reused on other pages.
   */

  if (loadingUser) {
    return (
      <main
        className={
          styles.loadingPage
        }
      >
        <div
          className={
            styles.loadingBrand
          }
        >
          <span
            className={
              styles.loadingDiamond
            }
          />

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <div
          className={
            styles.loadingIndicator
          }
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>

        <p className={styles.loadingText}>
          Loading...
        </p>
      </main>
    );
  }

  return (
    <main className={styles.dashboard}>

      {/* ==================================================
          DESKTOP SIDEBAR
      ================================================== */}

      <aside className={styles.sidebar}>
        <button
          className={styles.brand}
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <div
            className={
              styles.brandDiamond
            }
          >
            ◆
          </div>

          <div>
            <div
              className={
                styles.brandName
              }
            >
              PropertySure
              <strong> AI</strong>
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
          </div>
        </button>

        <nav
          className={
            styles.sidebarNav
          }
        >
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`${
                styles.navItem
              } ${
                item.path ===
                "/dashboard"
                  ? styles.active
                  : ""
              }`}
              onClick={() =>
                navigateTo(item.path)
              }
            >
              <span
                className={
                  styles.navIcon
                }
              >
                <Icon
                  name={item.icon}
                />
              </span>

              <span>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div
          className={
            styles.accountLabel
          }
        >
          ACCOUNT
        </div>

        <button
          className={styles.navItem}
          onClick={() =>
            navigateTo("/account")
          }
        >
          <span
            className={
              styles.navIcon
            }
          >
            <Icon name="account" />
          </span>

          <span>Account</span>
        </button>

        <button
          className={styles.navItem}
          onClick={() =>
            navigateTo("/settings")
          }
        >
          <span
            className={
              styles.navIcon
            }
          >
            <Icon name="settings" />
          </span>

          <span>Settings</span>
        </button>

        <div className={styles.helpBox}>
          <div
            className={
              styles.helpTitle
            }
          >
            Need Help?
          </div>

          <div
            className={
              styles.helpText
            }
          >
            Our support team is
            ready to assist you.
          </div>

          <button
            className={
              styles.supportButton
            }
            onClick={() =>
              navigateTo("/account")
            }
          >
            Contact Support
          </button>
        </div>

        <button
          className={
            styles.sidebarUser
          }
          onClick={() =>
            navigateTo("/account")
          }
        >
          <div className={styles.avatar}>
            {user.initial}
          </div>

          <div
            className={
              styles.sidebarUserInfo
            }
          >
            <div
              className={
                styles.userName
              }
            >
              {user.fullName}
            </div>

            <div
              className={
                styles.userPlan
              }
            >
              {isPremium
                ? "♛ Premium Plan"
                : planName}
            </div>
          </div>
        </button>
      </aside>

      {/* ==================================================
          DESKTOP CONTENT
      ================================================== */}

      <section className={styles.content}>
        <header className={styles.topBar}>
          <div
            className={
              styles.topBarLeft
            }
          >
            <div
              className={
                styles.eyebrow
              }
            >
              PROPERTYSURE AI
            </div>

            <div
              className={
                styles.headerPageTitle
              }
            >
              Dashboard
            </div>

            <div
              className={
                styles.headerDescription
              }
            >
              Stay ahead of property
              risks with AI-powered
              due diligence.
            </div>
          </div>

          <div
            className={
              styles.topActions
            }
          >
            <div
              className={
                styles.headerDate
              }
            >
              <Icon name="calendar" />

              <span>
                {desktopDate}
              </span>
            </div>

            <button
              className={
                styles.notificationButton
              }
              onClick={() =>
                navigateTo(
                  "/account/notifications"
                )
              }
              aria-label="Notifications"
            >
              <Icon name="bell" />

              <span
                className={
                  styles.notificationDot
                }
              />
            </button>

            <button
              className={
                styles.profileButton
              }
              onClick={() =>
                navigateTo("/account")
              }
            >
              <div
                className={
                  styles.profileAvatar
                }
              >
                {user.initial}
              </div>

              <div
                className={
                  styles.profileInfo
                }
              >
                <div
                  className={
                    styles.profileName
                  }
                >
                  {user.fullName}
                </div>

                <div
                  className={
                    styles.profilePlan
                  }
                >
                  {planName}
                </div>
              </div>

              <span
                className={
                  styles.profileChevron
                }
              >
                ⌄
              </span>
            </button>
          </div>
        </header>

        {/* ==================================================
            DESKTOP MAIN CONTENT
        ================================================== */}

        <div
          className={
            styles.mainContent
          }
        >
          <section
            className={
              styles.welcomeSection
            }
          >
            <div>
              <h2>
                Hello,{" "}
                {user.firstName} 👋
              </h2>
            </div>
          </section>

          {/* ==================================================
              DESKTOP VERIFY PROPERTY HERO
          ================================================== */}

          <section
            className={
              styles.heroCard
            }
          >
            <div
              className={
                styles.heroText
              }
            >
              <div
                className={
                  styles.heroEyebrow
                }
              >
                START A NEW VERIFICATION
              </div>

              <h3>
                Verify a Property
              </h3>

              <p>
                Upload your property
                documents and get a
                comprehensive AI-powered
                risk analysis in minutes.
              </p>

              <button
                className={
                  styles.primaryButton
                }
                onClick={() =>
                  navigateTo("/verify")
                }
              >
                <span>+</span>

                Verify Property

                <Icon name="arrow" />
              </button>
            </div>

            <div
              className={
                styles.heroVisual
              }
            >
              <img
                src="/modern-house.png"
                alt="Modern residential property"
                className={
                  styles.heroHouseImage
                }
              />

              <div
                className={
                  styles.heroImageOverlay
                }
              />

              <div
                className={
                  styles.verificationChecklist
                }
              >
                <div>
                  <span>✓</span>
                  Document Analysis
                </div>

                <div>
                  <span>✓</span>
                  Fraud Detection
                </div>

                <div>
                  <span>✓</span>
                  Ownership Validation
                </div>

                <div>
                  <span>✓</span>
                  Risk Assessment
                </div>
              </div>

              <div
                className={
                  styles.heroSlogan
                }
              >
                Safer
                <br />
                Properties
                <br />
                Brighter
                <br />
                Futures
              </div>
            </div>
          </section>

          {/* ==================================================
              DESKTOP STATISTICS
          ================================================== */}

          <section
            className={
              styles.statsGrid
            }
          >
            <button
              className={
                styles.statCard
              }
              onClick={() =>
                navigateTo(
                  "/my-properties"
                )
              }
            >
              <div
                className={`${styles.statIcon} ${styles.green}`}
              >
                <Icon name="check" />
              </div>

              <div
                className={
                  styles.statTitle
                }
              >
                Verified Properties
              </div>

              <div
                className={
                  styles.statNumber
                }
              >
                0
              </div>

              <div
                className={
                  styles.statLink
                }
              >
                View properties
                <span>→</span>
              </div>
            </button>

            <button
              className={
                styles.statCard
              }
              onClick={() =>
                navigateTo(
                  "/my-properties"
                )
              }
            >
              <div
                className={`${styles.statIcon} ${styles.orange}`}
              >
                <Icon name="clock" />
              </div>

              <div
                className={
                  styles.statTitle
                }
              >
                Pending Verification
              </div>

              <div
                className={
                  styles.statNumber
                }
              >
                0
              </div>

              <div
                className={
                  styles.statLink
                }
              >
                View properties
                <span>→</span>
              </div>
            </button>

            <button
              className={
                styles.statCard
              }
              onClick={() =>
                navigateTo(
                  "/fraud-watch"
                )
              }
            >
              <div
                className={`${styles.statIcon} ${styles.red}`}
              >
                <Icon name="warning" />
              </div>

              <div
                className={
                  styles.statTitle
                }
              >
                Fraud Alerts
              </div>

              <div
                className={
                  styles.statNumber
                }
              >
                0
              </div>

              <div
                className={
                  styles.statSubtext
                }
              >
                No active alerts
              </div>

              <div
                className={
                  styles.statLink
                }
              >
                View fraud watch
                <span>→</span>
              </div>
            </button>

            <button
              className={
                styles.statCard
              }
              onClick={() =>
                navigateTo("/reports")
              }
            >
              <div
                className={`${styles.statIcon} ${styles.blue}`}
              >
                <Icon name="document" />
              </div>

              <div
                className={
                  styles.statTitle
                }
              >
                Reports Available
              </div>

              <div
                className={
                  styles.statNumber
                }
              >
                0
              </div>

              <div
                className={
                  styles.statLink
                }
              >
                View reports
                <span>→</span>
              </div>
            </button>
          </section>

          {/* ==================================================
              LOWER GRID
          ================================================== */}

          <section
            className={
              styles.lowerGrid
            }
          >
            <div
              className={
                styles.dashboardCard
              }
            >
              <div
                className={
                  styles.cardHeader
                }
              >
                <div
                  className={
                    styles.cardTitleGroup
                  }
                >
                  <div
                    className={`${styles.cardIcon} ${styles.blueIcon}`}
                  >
                    <Icon name="shield" />
                  </div>

                  <h3>
                    Fraud Watch
                  </h3>
                </div>

                <button
                  className={
                    styles.cardLink
                  }
                  onClick={() =>
                    navigateTo(
                      "/fraud-watch"
                    )
                  }
                >
                  View all →
                </button>
              </div>

              <div
                className={
                  styles.fraudEmpty
                }
              >
                <div
                  className={
                    styles.fraudCheck
                  }
                >
                  <Icon name="check" />
                </div>

                <div>
                  <strong>
                    No active fraud alerts
                  </strong>

                  <p>
                    You currently have no
                    unresolved fraud
                    investigations. We
                    continuously monitor
                    verified properties for
                    suspicious activity.
                  </p>
                </div>

                <div
                  className={
                    styles.fraudShield
                  }
                >
                  ◈
                </div>
              </div>
            </div>

            {/* ==================================================
                PREMIUM PLAN CARD
            ================================================== */}

            <div
              className={`${styles.dashboardCard} ${styles.planCard} ${
                isPaid
                  ? styles.paidPlanCard
                  : styles.freePlanCard
              }`}
            >
              <div
                className={
                  styles.cardHeader
                }
              >
                <div
                  className={
                    styles.cardTitleGroup
                  }
                >
                  <div
                    className={`${styles.cardIcon} ${styles.crownIcon}`}
                  >
                    <Icon name="crown" />
                  </div>

                  <h3>
                    Your Plan
                  </h3>
                </div>

                <span
                  className={
                    styles.planBadge
                  }
                >
                  {isFree
                    ? "FREE PLAN"
                    : `${planLabel.toUpperCase()} PLAN`}
                </span>
              </div>

              <div
                className={
                  styles.planContent
                }
              >
                <h4>
                  You’re on the{" "}
                  {planName}
                </h4>

                <p>
                  {isFree
                    ? "Choose a PropertySure AI plan that matches your property verification needs."
                    : `Your ${planLabel} plan is active. Manage your subscription and verification needs from your plan settings.`}
                </p>

                <button
                  className={
                    styles.managePlanButton
                  }
                  onClick={() =>
                    navigateTo("/pricing")
                  }
                >
                  Manage Plan
                  <span>→</span>
                </button>
              </div>

              <div
                className={
                  styles.planDecoration
                }
              >
                <span />
                <span />
                <span />
              </div>
            </div>
          </section>

          {/* ==================================================
              RECENT ACTIVITY
          ================================================== */}

          <section
            className={
              styles.activityCard
            }
          >
            <div
              className={
                styles.cardHeader
              }
            >
              <div
                className={
                  styles.cardTitleGroup
                }
              >
                <div
                  className={`${styles.cardIcon} ${styles.blueIcon}`}
                >
                  <Icon name="clock" />
                </div>

                <h3>
                  Recent Verification
                  Activity
                </h3>
              </div>

              <button
                className={
                  styles.cardLink
                }
                onClick={() =>
                  navigateTo(
                    "/verification-history"
                  )
                }
              >
                View all →
              </button>
            </div>

            <div
              className={
                styles.activityEmpty
              }
            >
              <div
                className={
                  styles.emptyDocument
                }
              >
                <Icon name="document" />
              </div>

              <h4>
                No verification
                activity yet
              </h4>

              <p>
                Start by verifying
                your first property
                to see your activity
                here.
              </p>

              <button
                className={
                  styles.emptyVerifyButton
                }
                onClick={() =>
                  navigateTo("/verify")
                }
              >
                + Verify Property
              </button>
            </div>
          </section>
        </div>
      </section>

      {/* ==================================================
          MOBILE HEADER
      ================================================== */}

      <header
        className={
          styles.mobileHeader
        }
      >
        <button
          className={
            styles.mobileMenuButton
          }
          onClick={() =>
            setMenuOpen(true)
          }
          aria-label="Open navigation"
        >
          <Icon name="menu" />
        </button>

        <button
          className={
            styles.mobileBrand
          }
          onClick={() =>
            navigateTo("/dashboard")
          }
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
          className={
            styles.mobileNotificationButton
          }
          onClick={() =>
            navigateTo(
              "/account/notifications"
            )
          }
          aria-label="Notifications"
        >
          <Icon name="bell" />

          <span
            className={
              styles.mobileNotificationDot
            }
          />
        </button>
      </header>

      {/* ==================================================
          MOBILE MENU
      ================================================== */}

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
            <div>
              <button
                className={
                  styles.mobileMenuBrand
                }
                onClick={() =>
                  navigateTo(
                    "/dashboard"
                  )
                }
              >
                <span>◆</span>

                <div>
                  PropertySure
                  <strong> AI</strong>
                </div>
              </button>

              <div
                className={
                  styles.mobileMenuSubtitle
                }
              >
                AI-Powered Property
                Due Diligence
              </div>
            </div>

            <button
              className={
                styles.closeMenu
              }
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close navigation"
            >
              <Icon name="close" />
            </button>
          </div>

          <nav
            className={
              styles.mobileMenuNav
            }
          >
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`${
                  styles.mobileNavItem
                } ${
                  item.path ===
                  "/dashboard"
                    ? styles.active
                    : ""
                }`}
                onClick={() =>
                  navigateTo(item.path)
                }
              >
                <span
                  className={
                    styles.mobileNavIcon
                  }
                >
                  <Icon
                    name={item.icon}
                  />
                </span>

                <span>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div
            className={
              styles.mobileAccountLabel
            }
          >
            ACCOUNT
          </div>

          <button
            className={
              styles.mobileNavItem
            }
            onClick={() =>
              navigateTo("/account")
            }
          >
            <span
              className={
                styles.mobileNavIcon
              }
            >
              <Icon name="account" />
            </span>

            <span>Account</span>
          </button>

          <button
            className={
              styles.mobileNavItem
            }
            onClick={() =>
              navigateTo("/settings")
            }
          >
            <span
              className={
                styles.mobileNavIcon
              }
            >
              <Icon name="settings" />
            </span>

            <span>Settings</span>
          </button>

          <div
            className={
              styles.mobileHelpBox
            }
          >
            <div
              className={
                styles.mobileHelpTitle
              }
            >
              Need Help?
            </div>

            <div
              className={
                styles.mobileHelpText
              }
            >
              Our support team is
              ready to assist you.
            </div>

            <button
              onClick={() =>
                navigateTo("/account")
              }
            >
              Contact Support
            </button>
          </div>

          <button
            className={
              styles.mobileUser
            }
            onClick={() =>
              navigateTo("/account")
            }
          >
            <div
              className={
                styles.mobileAvatar
              }
            >
              {user.initial}
            </div>

            <div>
              <strong>
                {user.fullName}
              </strong>

              <span>
                {planName}
              </span>
            </div>
          </button>

          <button
            className={
              styles.mobileSignOut
            }
            onClick={handleSignOut}
          >
            <Icon name="arrow" />
            Sign Out
          </button>
        </div>
      )}

      {/* ==================================================
          MOBILE CONTENT
      ================================================== */}

      <section
        className={
          styles.mobileContent
        }
      >

        {/* ==================================================
            MOBILE WELCOME
        ================================================== */}

        <section
          className={
            styles.mobileWelcomeHeader
          }
        >
          <div
            className={
              styles.mobileWelcomeText
            }
          >
            <h1>
              Hello,{" "}
              {user.firstName} 👋
            </h1>

            <p>
              Stay ahead of property
              risks with AI-powered
              due diligence.
            </p>
          </div>

          <div
            className={
              styles.mobileHeaderDate
            }
          >
            <Icon name="calendar" />

            <span>
              {mobileDate}
            </span>
          </div>
        </section>

        {/* ==================================================
            MOBILE VERIFY PROPERTY
        ================================================== */}

        <section
          className={
            styles.mobileHeroCard
          }
        >
          <div
            className={
              styles.mobileHeroText
            }
          >
            <div
              className={
                styles.mobileHeroEyebrow
              }
            >
              START A NEW VERIFICATION
            </div>

            <h2>
              Verify a Property
            </h2>

            <p>
              Upload your property
              documents and get a
              comprehensive AI-powered
              risk analysis in minutes.
            </p>

            <button
              className={
                styles.mobileHeroButton
              }
              onClick={() =>
                navigateTo("/verify")
              }
            >
              <span>+</span>

              Verify Property

              <Icon name="arrow" />
            </button>
          </div>

          <div
            className={
              styles.mobileHeroVisual
            }
          >
            <img
              src="/modern-house.png"
              alt="Modern residential property"
              className={
                styles.mobileHeroHouseImage
              }
            />

            <div
              className={
                styles.mobileHeroImageOverlay
              }
            />

            <div
              className={
                styles.mobileVerificationChecklist
              }
            >
              <div>
                <span>✓</span>
                Document Analysis
              </div>

              <div>
                <span>✓</span>
                Fraud Detection
              </div>

              <div>
                <span>✓</span>
                Ownership Validation
              </div>

              <div>
                <span>✓</span>
                Risk Assessment
              </div>
            </div>

            <div
              className={
                styles.mobileHeroSlogan
              }
            >
              Safer
              <br />
              Properties
              <br />
              Brighter
              <br />
              Futures
            </div>
          </div>
        </section>

        {/* ==================================================
            MOBILE STATS
        ================================================== */}

        <section
          className={
            styles.mobileStats
          }
        >
          <button
            onClick={() =>
              navigateTo(
                "/my-properties"
              )
            }
          >
            <div
              className={`${styles.mobileStatIcon} ${styles.green}`}
            >
              <Icon name="check" />
            </div>

            <span>
              Verified
            </span>

            <strong>0</strong>

            <small>
              View properties →
            </small>
          </button>

          <button
            onClick={() =>
              navigateTo(
                "/my-properties"
              )
            }
          >
            <div
              className={`${styles.mobileStatIcon} ${styles.orange}`}
            >
              <Icon name="clock" />
            </div>

            <span>
              Pending
            </span>

            <strong>0</strong>

            <small>
              View properties →
            </small>
          </button>

          <button
            onClick={() =>
              navigateTo(
                "/fraud-watch"
              )
            }
          >
            <div
              className={`${styles.mobileStatIcon} ${styles.red}`}
            >
              <Icon name="warning" />
            </div>

            <span>
              Fraud Alerts
            </span>

            <strong>0</strong>

            <small>
              No active alerts
            </small>
          </button>

          <button
            onClick={() =>
              navigateTo("/reports")
            }
          >
            <div
              className={`${styles.mobileStatIcon} ${styles.blue}`}
            >
              <Icon name="document" />
            </div>

            <span>
              Reports
            </span>

            <strong>0</strong>

            <small>
              View reports →
            </small>
          </button>
        </section>

        {/* ==================================================
            MOBILE FRAUD WATCH
        ================================================== */}

        <section
          className={
            styles.mobileCard
          }
        >
          <div
            className={
              styles.mobileCardHeader
            }
          >
            <div>
              <span
                className={
                  styles.mobileCardIcon
                }
              >
                <Icon name="shield" />
              </span>

              <h2>
                Fraud Watch
              </h2>
            </div>

            <button
              onClick={() =>
                navigateTo(
                  "/fraud-watch"
                )
              }
            >
              View all →
            </button>
          </div>

          <div
            className={
              styles.mobileFraudEmpty
            }
          >
            <div
              className={
                styles.mobileFraudCheck
              }
            >
              <Icon name="check" />
            </div>

            <div>
              <strong>
                No active fraud alerts
              </strong>

              <p>
                You currently have no
                unresolved fraud
                investigations. We
                continuously monitor
                verified properties
                for suspicious
                activity.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================
            MOBILE PLAN
        ================================================== */}

        <section
          className={`${styles.mobileCard} ${
            isPaid
              ? styles.mobilePaidPlanCard
              : styles.mobileFreePlanCard
          }`}
        >
          <div
            className={
              styles.mobileCardHeader
            }
          >
            <div>
              <span
                className={`${styles.mobileCardIcon} ${styles.crown}`}
              >
                <Icon name="crown" />
              </span>

              <h2>
                Your Plan
              </h2>
            </div>

            <span
              className={
                styles.mobilePlanBadge
              }
            >
              {isFree
                ? "FREE"
                : planLabel.toUpperCase()}
            </span>
          </div>

          <div
            className={
              styles.mobilePlanContent
            }
          >
            <h3>
              You’re on the{" "}
              {planName}
            </h3>

            <p>
              {isFree
                ? "Choose a PropertySure AI plan that matches your property verification needs."
                : `Your ${planLabel} plan is active. Manage your subscription and verification needs from your plan settings.`}
            </p>

            <button
              onClick={() =>
                navigateTo("/pricing")
              }
            >
              Manage Plan →
            </button>
          </div>
        </section>

        {/* ==================================================
            MOBILE RECENT ACTIVITY
        ================================================== */}

        <section
          className={
            styles.mobileCard
          }
        >
          <div
            className={
              styles.mobileCardHeader
            }
          >
            <div>
              <span
                className={
                  styles.mobileCardIcon
                }
              >
                <Icon name="clock" />
              </span>

              <h2>
                Recent Verification
                Activity
              </h2>
            </div>

            <button
              onClick={() =>
                navigateTo(
                  "/verification-history"
                )
              }
            >
              View all →
            </button>
          </div>

          <div
            className={
              styles.mobileActivityEmpty
            }
          >
            <div
              className={
                styles.mobileEmptyIcon
              }
            >
              <Icon name="document" />
            </div>

            <h3>
              No verification
              activity yet
            </h3>

            <p>
              Start by verifying
              your first property
              to see your activity
              here.
            </p>

            <button
              onClick={() =>
                navigateTo("/verify")
              }
            >
              + Verify Property
            </button>
          </div>
        </section>
      </section>

      {/* ==================================================
          MOBILE BOTTOM NAV
      ================================================== */}

      <nav
        className={
          styles.bottomNav
        }
      >
        <button
          className={`${styles.bottomNavItem} ${styles.active}`}
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <Icon name="dashboard" />
          <span>
            Dashboard
          </span>
        </button>

        <button
          className={
            styles.bottomNavItem
          }
          onClick={() =>
            navigateTo("/verify")
          }
        >
          <Icon name="verify" />
          <span>
            Verify
          </span>
        </button>

        <button
          className={
            styles.bottomNavItem
          }
          onClick={() =>
            navigateTo(
              "/my-properties"
            )
          }
        >
          <Icon name="properties" />
          <span>
            Properties
          </span>
        </button>

        <button
          className={
            styles.bottomNavItem
          }
          onClick={() =>
            navigateTo("/reports")
          }
        >
          <Icon name="reports" />
          <span>
            Reports
          </span>
        </button>

        <button
          className={
            styles.bottomNavItem
          }
          onClick={() =>
            navigateTo("/account")
          }
        >
          <Icon name="account" />
          <span>
            Account
          </span>
        </button>
      </nav>
    </main>
  );
}