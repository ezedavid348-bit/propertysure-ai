"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./help-center.module.css";
import { supabase } from "../../../lib/supabase";

/*
============================================================
ICON SYSTEM
============================================================
IMPORTANT:
The existing navigation icon system is preserved.
DO NOT CHANGE navigation icons, notification bell,
header icons, mobile navigation, or sidebar navigation.
============================================================
*/

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
  | "search"
  | "home"
  | "shield"
  | "lock"
  | "creditCard"
  | "privacy"
  | "chevron"
  | "headset"
  | "warning"
  | "lightbulb"
  | "check"
  | "menu"
  | "close"
  | "arrow"
  | "user"
  | "logout";

function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const icons: Record<IconName, string> = {
    /*
    --------------------------------------------------------
    EXISTING NAVIGATION ICONS
    DO NOT CHANGE
    --------------------------------------------------------
    */

    dashboard: "▦",
    verify: "⇧",
    properties: "⌂",
    history: "◷",
    fraud: "◈",
    reports: "▤",
    account: "◯",
    settings: "⚙",
    bell: "🔔",

    /*
    --------------------------------------------------------
    EXISTING GENERAL ICONS
    --------------------------------------------------------
    */

    search: "⌕",
    home: "⌂",
    shield: "♢",
    lock: "▣",
    creditCard: "▭",
    privacy: "♙",
    chevron: "›",

    /*
    HEADSET IS RENDERED AS A REAL SVG BELOW.
    --------------------------------------------------------
    */

    headset: "",

    warning: "!",
    lightbulb: "♧",
    check: "✓",
    menu: "☰",
    close: "×",
    arrow: "→",
    user: "◯",
    logout: "↪",
  };

  /*
  ==========================================================
  REAL HEADSET / SUPPORT ICON
  ==========================================================
  Used for:
  - Contact Support
  - Help Center Tips
  ==========================================================
  */

  if (name === "headset") {
    return (
      <span
        className={`${styles.icon} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 14a8 8 0 0 1 16 0" />

          <path d="M4 14v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" />

          <path d="M20 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />

          <path d="M17 19c0 1.1-.9 2-2 2h-2" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={`${styles.icon} ${className}`}
      style={{
        fontSize: `${size}px`,
      }}
      aria-hidden="true"
    >
      {icons[name]}
    </span>
  );
}

/*
============================================================
HELP CENTER CATEGORY ICON SYSTEM
============================================================
These icons are ONLY for the Browse by Category cards.

They are completely separate from the existing navigation
icon system.
============================================================
*/

type CategoryIconName =
  | "property"
  | "fraud"
  | "security"
  | "reports"
  | "gettingStarted"
  | "payment"
  | "privacy";

function CategoryIcon({
  name,
}: {
  name: CategoryIconName;
}) {
  /*
  ----------------------------------------------------------
  PROPERTY VERIFICATION
  ----------------------------------------------------------
  */

  if (name === "property") {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 10.5 12 3l9 7.5" />

        <path d="M5.5 9.5V21h13V9.5" />

        <path d="M9 21v-5.5h6V21" />

        <path d="M8.5 11.5h.01" />

        <path d="M15.5 11.5h.01" />

        <path d="m15.5 6.5 2 2" />
      </svg>
    );
  }

  /*
  ----------------------------------------------------------
  FRAUD WATCH
  ----------------------------------------------------------
  */

  if (name === "fraud") {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3 20 6v5.2c0 4.7-3.1 7.8-8 9.8-4.9-2-8-5.1-8-9.8V6l8-3Z" />

        <path d="M12 8v4" />

        <path d="M12 16h.01" />
      </svg>
    );
  }

  /*
  ----------------------------------------------------------
  ACCOUNT & SECURITY
  ----------------------------------------------------------
  */

  if (name === "security") {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect
          x="5"
          y="10"
          width="14"
          height="10"
          rx="2"
        />

        <path d="M8 10V7a4 4 0 0 1 8 0v3" />

        <path d="M12 14v2" />

        <path d="M12 14h.01" />
      </svg>
    );
  }

  /*
  ----------------------------------------------------------
  REPORTS & HISTORY
  ----------------------------------------------------------
  */

  if (name === "reports") {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 3h9l3 3v15H6z" />

        <path d="M15 3v4h3" />

        <path d="M9 12h6" />

        <path d="M9 16h6" />

        <path d="M9 8h2" />
      </svg>
    );
  }

  /*
  ----------------------------------------------------------
  GETTING STARTED
  ----------------------------------------------------------
  */

  if (name === "gettingStarted") {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.5 4.5c2.5-.8 4.4-.8 5-.3.5.6.5 2.5-.3 5-1.2 3.8-4.7 7.1-8.5 8.4l-2.8-2.8c1.3-3.8 4.6-7.3 8.4-8.5Z" />

        <circle
          cx="15.5"
          cy="8.5"
          r="1.5"
        />

        <path d="m7.9 15.9-3.2 3.2" />

        <path d="m5.8 13.8-2.3 1" />

        <path d="m8.2 18.2-1 2.3" />
      </svg>
    );
  }

  /*
  ----------------------------------------------------------
  PAYMENTS & SUBSCRIPTIONS
  ----------------------------------------------------------
  */

  if (name === "payment") {
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2.5"
        />

        <path d="M3 9h18" />

        <path d="M7 14h3" />

        <path d="M15 14h2" />

        <path d="M7 16.5h5" />
      </svg>
    );
  }

  /*
  ----------------------------------------------------------
  PRIVACY & DATA
  ----------------------------------------------------------
  */

  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 20 7v5c0 4.4-2.8 7.3-8 9-5.2-1.7-8-4.6-8-9V7l8-4Z" />

      <path d="m8.7 12.2 2.2 2.2 4.5-4.6" />
    </svg>
  );
}

/*
============================================================
NAVIGATION
============================================================
UNCHANGED
============================================================
*/

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard" as IconName,
  },

  {
    label: "Verify Property",
    href: "/verify",
    icon: "verify" as IconName,
  },

  {
    label: "My Properties",
    href: "/my-properties",
    icon: "properties" as IconName,
  },

  {
    label: "Verification History",
    href: "/verification-history",
    icon: "history" as IconName,
  },

  {
    label: "Fraud Watch",
    href: "/fraud-watch",
    icon: "fraud" as IconName,
  },

  {
    label: "Reports",
    href: "/reports",
    icon: "reports" as IconName,
  },
];

/*
============================================================
HELP CATEGORIES
============================================================
============================================================
*/

const categories = [
  {
    title: "Property Verification",

    description:
      "Learn how to verify properties and understand verification reports.",

    articles: "8 articles",

    icon: "property" as CategoryIconName,

    color: "blue",

    href:
      "/settings/support-help/help-center/property-verification",
  },

  {
    title: "Fraud Watch",

    description:
      "Understand fraud risk alerts, monitoring, and protecting yourself.",

    articles: "8 articles",

    icon: "fraud" as CategoryIconName,

    color: "green",

    href:
      "/settings/support-help/help-center/fraud-watch",
  },

  {
    title: "Account & Security",

    description:
      "Manage your account, password, and security settings.",

    articles: "8 articles",

    icon: "security" as CategoryIconName,

    color: "purple",

    href:
      "/settings/support-help/help-center/account-security",
  },

  {
    title: "Reports & History",

    description:
      "Generate, download, and understand your reports and verification history.",

    articles: "10 articles",

    icon: "reports" as CategoryIconName,

    color: "yellow",

    href:
      "/settings/support-help/help-center/reports-history",
  },

  {
    title: "Getting Started",

    description:
      "Learn the basics of PropertySure AI and how to get started.",

    articles: "11 articles",

    icon: "gettingStarted" as CategoryIconName,

    color: "blue",

    href:
      "/settings/support-help/help-center/getting-started",
  },

  {
    title: "Payments & Subscriptions",

    description:
      "Manage your plan, billing, payments, and invoices.",

    articles: "8 articles",

    icon: "payment" as CategoryIconName,

    color: "pink",

    href:
      "/settings/support-help/help-center/payments-subscriptions",
  },

  {
    title: "Privacy & Data",

    description:
      "Learn how we protect your data and your privacy rights.",

    articles: "7 articles",

    icon: "privacy" as CategoryIconName,

    color: "cyan",

    href:
      "/settings/support-help/help-center/privacy-data",
  },
];

/*
============================================================
POPULAR SEARCHES
============================================================
*/

const popularSearches = [
  "verify property",
  "fraud watch",
  "2FA",
  "reports",
  "getting started",
];

/*
============================================================
CATEGORY CARD
============================================================
*/

function CategoryCard({
  title,
  description,
  articles,
  icon,
  color,
  href,
  onClick,
}: {
  title: string;
  description: string;
  articles: string;
  icon: CategoryIconName;
  color: string;
  href: string;
  onClick: (href: string) => void;
}) {
  return (
    <button
      type="button"
      className={styles.categoryCard}
      onClick={() => onClick(href)}
    >
      <div
        className={`${styles.categoryIcon} ${styles[color]}`}
      >
        <CategoryIcon
          name={icon}
        />
      </div>

      <div className={styles.categoryTitle}>
        {title}
      </div>

      <div className={styles.categoryDescription}>
        {description}
      </div>

      <div className={styles.categoryFooter}>
        <span>
          {articles}
        </span>

        <Icon
          name="chevron"
          size={21}
        />
      </div>
    </button>
  );
}

/*
============================================================
HELP CENTER PAGE
============================================================
*/

export default function HelpCenterPage() {
  const router = useRouter();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    user,
    setUser,
  ] = useState({
    fullName: "User",
    initial: "U",
    plan: "Free Plan",
  });

  /*
  ============================================================
  LOAD USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data: { user: authUser },
        } =
          await supabase.auth.getUser();

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
              .replace(
                /[._-]+/g,
                " "
              )
              .replace(
                /\b\w/g,
                (letter: string) =>
                  letter.toUpperCase()
              )
          : "User";

        const fullName =
          String(metadataName).trim() ||
          fallbackName;

        const initial =
          fullName
            .trim()
            .charAt(0)
            .toUpperCase() ||
          "U";

        const plan =
          metadata.plan ||
          metadata.subscription_plan ||
          metadata.account_plan ||
          "Free Plan";

        setUser({
          fullName,
          initial,
          plan: String(plan),
        });
      } catch (error) {
        console.error(
          "Help Center user loading error:",
          error
        );
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
  ============================================================
  NAVIGATION
  ============================================================
  EXISTING NAVIGATION LOGIC — UNCHANGED
  ============================================================
  */

  const navigateTo = (
    href: string
  ) => {
    setMenuOpen(false);
    router.push(href);
  };

  /*
  ============================================================
  NOTIFICATIONS
  ============================================================
  UNCHANGED
  ============================================================
  */

  const openNotifications = () => {
    navigateTo(
      "/settings/notifications"
    );
  };

  /*
  ============================================================
  BACK TO SETTINGS
  ============================================================
  */

  const backToSettings = () => {
    navigateTo("/settings");
  };

  /*
  ============================================================
  SIGN OUT
  ============================================================
  */

  const signOut = async () => {
    try {
      await supabase.auth.signOut();

      router.replace(
        "/signin"
      );
    } catch (error) {
      console.error(
        "Sign out error:",
        error
      );
    }
  };

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <main
      className={styles.page}
    >
      {/* =====================================================
          DESKTOP SIDEBAR
          DO NOT CHANGE
      ===================================================== */}

      <aside
        className={styles.sidebar}
      >
        <button
          type="button"
          className={styles.brandButton}
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >
          <div
            className={styles.brandName}
          >
            <span
              className={
                styles.brandLogoDiamond
              }
            >
              ◆
            </span>

            <span>
              PropertySure
              <strong>
                {" "}
                AI
              </strong>
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
          className={styles.sidebarNav}
        >
          {navItems.map(
            (item) => (
              <button
                key={
                  item.href
                }
                type="button"
                className={
                  styles.navItem
                }
                onClick={() =>
                  navigateTo(
                    item.href
                  )
                }
              >
                <span
                  className={
                    styles.navIcon
                  }
                >
                  <Icon
                    name={
                      item.icon
                    }
                    size={18}
                  />
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

        <button
          type="button"
          className={
            styles.navItem
          }
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >
          <span
            className={
              styles.navIcon
            }
          >
            <Icon
              name="account"
              size={18}
            />
          </span>

          <span>
            Account
          </span>
        </button>

        <button
          type="button"
          className={`${styles.navItem} ${styles.navActive}`}
          onClick={() =>
            navigateTo(
              "/settings"
            )
          }
        >
          <span
            className={
              styles.navIcon
            }
          >
            <Icon
              name="settings"
              size={18}
            />
          </span>

          <span>
            Settings
          </span>
        </button>

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

          <div
            className={
              styles.helpText
            }
          >
            Our support team is
            ready to assist you.
          </div>

          <button
            type="button"
            className={
              styles.supportButton
            }
            onClick={() =>
              navigateTo(
                "/settings/support-help"
              )
            }
          >
            <Icon
              name="headset"
              size={15}
            />

            Contact Support
          </button>
        </div>

        <button
          type="button"
          className={
            styles.sidebarUser
          }
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >
          <div
            className={
              styles.avatar
            }
          >
            {user.initial}
          </div>

          <div
            className={
              styles.userInfo
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
              {user.plan}
            </div>
          </div>

          <Icon
            name="chevron"
            size={21}
          />
        </button>
      </aside>

      {/* =====================================================
          MOBILE HEADER
          DO NOT CHANGE
      ===================================================== */}

      <header
        className={
          styles.mobileHeader
        }
      >
        <button
          type="button"
          className={
            styles.mobileMenuButton
          }
          onClick={() =>
            setMenuOpen(true)
          }
          aria-label="Open navigation"
        >
          <Icon
            name="menu"
            size={23}
          />
        </button>

        <button
          type="button"
          className={
            styles.mobileLogo
          }
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >
          <span>
            ◆
          </span>

          <span>
            PropertySure
            <strong>
              {" "}
              AI
            </strong>
          </span>
        </button>

        <button
          type="button"
          className={
            styles.mobileBell
          }
          onClick={
            openNotifications
          }
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            size={20}
          />

          <span
            className={
              styles.notificationDot
            }
          />
        </button>
      </header>

      {/* =====================================================
          MOBILE MENU
          DO NOT CHANGE
      ===================================================== */}

      {menuOpen && (
        <div
          className={
            styles.mobileMenu
          }
        >
          <div
            className={
              styles.mobileMenuTop
            }
          >
            <div>
              <div
                className={
                  styles.mobileMenuBrand
                }
              >
                <span>
                  ◆
                </span>

                <span>
                  PropertySure
                  <strong>
                    {" "}
                    AI
                  </strong>
                </span>
              </div>

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
              type="button"
              className={
                styles.closeButton
              }
              onClick={() =>
                setMenuOpen(
                  false
                )
              }
              aria-label="Close navigation"
            >
              <Icon
                name="close"
                size={28}
              />
            </button>
          </div>

          <nav
            className={
              styles.mobileMenuNav
            }
          >
            {navItems.map(
              (item) => (
                <button
                  key={
                    item.href
                  }
                  type="button"
                  className={
                    styles.mobileNavItem
                  }
                  onClick={() =>
                    navigateTo(
                      item.href
                    )
                  }
                >
                  <Icon
                    name={
                      item.icon
                    }
                    size={18}
                  />

                  <span>
                    {item.label}
                  </span>
                </button>
              )
            )}
          </nav>

          <div
            className={
              styles.mobileAccountLabel
            }
          >
            ACCOUNT
          </div>

          <button
            type="button"
            className={
              styles.mobileNavItem
            }
            onClick={() =>
              navigateTo(
                "/account"
              )
            }
          >
            <Icon
              name="account"
              size={18}
            />

            <span>
              Account
            </span>
          </button>

          <button
            type="button"
            className={`${styles.mobileNavItem} ${styles.mobileActive}`}
            onClick={() =>
              navigateTo(
                "/settings"
              )
            }
          >
            <Icon
              name="settings"
              size={18}
            />

            <span>
              Settings
            </span>
          </button>

          <button
            type="button"
            className={`${styles.mobileNavItem} ${styles.mobileLogout}`}
            onClick={
              signOut
            }
          >
            <Icon
              name="logout"
              size={18}
            />

            <span>
              Sign Out
            </span>
          </button>
        </div>
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section
        className={styles.main}
      >
        {/* ===================================================
            TOP BAR
            DO NOT CHANGE
        =================================================== */}

        <header
          className={
            styles.topBar
          }
        >
          <div
            className={
              styles.breadcrumbs
            }
          >
            <button
              type="button"
              onClick={() =>
                navigateTo(
                  "/settings"
                )
              }
            >
              Settings
            </button>

            <Icon
              name="chevron"
              size={17}
            />

            <button
              type="button"
              onClick={() =>
                navigateTo(
                  "/settings/support-help"
                )
              }
            >
              Support & Help
            </button>

            <Icon
              name="chevron"
              size={17}
            />

            <span>
              Help Center
            </span>
          </div>

          <div
            className={
              styles.topActions
            }
          >
            <button
              type="button"
              className={
                styles.topNotification
              }
              onClick={
                openNotifications
              }
              aria-label="Notifications"
            >
              <Icon
                name="bell"
                size={20}
              />

              <span
                className={
                  styles.topNotificationDot
                }
              />
            </button>

            <button
              type="button"
              className={
                styles.topAvatar
              }
              onClick={() =>
                navigateTo(
                  "/account"
                )
              }
            >
              {user.initial}
            </button>
          </div>
        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div
          className={
            styles.content
          }
        >
          <div
            className={
              styles.contentHeader
            }
          >
            <h1>
              Help Center
            </h1>

            <p>
              Find answers, browse guides,
              and learn how to get the most
              out of PropertySure AI.
            </p>

            <button
              type="button"
              className={
                styles.backButton
              }
              onClick={
                backToSettings
              }
            >
              ‹ Back to Settings
            </button>
          </div>

          <div
            className={
              styles.layout
            }
          >
            {/* ===============================================
                LEFT / MAIN COLUMN
            =============================================== */}

            <div
              className={
                styles.primaryColumn
              }
            >
              {/* SEARCH */}

              <section
                className={
                  styles.searchCard
                }
              >
                <div
                  className={
                    styles.searchBox
                  }
                >
                  <Icon
                    name="search"
                    size={25}
                  />

                  <input
                    type="text"
                    value={
                      search
                    }
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search for articles, guides, and topics..."
                    aria-label="Search Help Center"
                  />
                </div>

                <div
                  className={
                    styles.popularSearches
                  }
                >
                  <span>
                    Popular searches:
                  </span>

                  {popularSearches.map(
                    (item) => (
                      <button
                        type="button"
                        key={
                          item
                        }
                        onClick={() =>
                          setSearch(
                            item
                          )
                        }
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </section>

              {/* =================================================
                  BROWSE BY CATEGORY
                  
                  No Matching Category section.
                  No Popular Articles section.
              ================================================= */}

              <section
                className={
                  styles.categorySection
                }
              >
                <h2>
                  Browse by Category
                </h2>

                <div
                  className={
                    styles.categoryGrid
                  }
                >
                  {categories.map(
                    (
                      category
                    ) => (
                      <CategoryCard
                        key={
                          category.title
                        }
                        {...category}
                        onClick={
                          navigateTo
                        }
                      />
                    )
                  )}
                </div>
              </section>
            </div>

            {/* ===============================================
                RIGHT COLUMN
            =============================================== */}

            <aside
              className={
                styles.rightColumn
              }
            >
              {/* =================================================
                  POPULAR ARTICLES
                  
                  INTENTIONALLY REMOVED.
                  
                  Popular Articles will only be added when the
                  titles correspond to actual article pages.
              ================================================= */}

              {/* NEED MORE HELP */}

              <section
                className={
                  styles.sideCard
                }
              >
                <h2>
                  Need more help?
                </h2>

                <p
                  className={
                    styles.sideDescription
                  }
                >
                  Can't find what you're
                  looking for? Our support
                  team is here to help.
                </p>

                <button
                  type="button"
                  className={
                    styles.primarySupportButton
                  }
                  onClick={() =>
                    navigateTo(
                      "/settings/support-help/contact-support"
                    )
                  }
                >
                  <Icon
                    name="headset"
                    size={16}
                  />

                  Contact Support
                </button>

                <button
                  type="button"
                  className={
                    styles.secondarySupportButton
                  }
                  onClick={() =>
                    navigateTo(
                      "/settings/support-help/report-issue"
                    )
                  }
                >
                  <Icon
                    name="warning"
                    size={16}
                  />

                  Report an Issue
                </button>
              </section>

              {/* TIPS */}

              <section
                className={`${styles.sideCard} ${styles.tipsCard}`}
              >
                <div
                  className={
                    styles.tipsTitle
                  }
                >
                  <span
                    className={
                      styles.tipIcon
                    }
                  >
                    <Icon
                      name="headset"
                      size={18}
                    />
                  </span>

                  <h2>
                    Help Center Tips
                  </h2>
                </div>

                <div
                  className={
                    styles.tipList
                  }
                >
                  <div>
                    <Icon
                      name="check"
                      size={14}
                    />

                    <span>
                      Use keywords for
                      faster results
                    </span>
                  </div>

                  <div>
                    <Icon
                      name="check"
                      size={14}
                    />

                    <span>
                      Browse by category
                    </span>
                  </div>

                  <div>
                    <Icon
                      name="check"
                      size={14}
                    />

                    <span>
                      Read the relevant
                      guide carefully
                    </span>
                  </div>

                  <div>
                    <Icon
                      name="check"
                      size={14}
                    />

                    <span>
                      Still need help?
                      Contact us
                    </span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>

      {/* =====================================================
          MOBILE BOTTOM NAV
          DO NOT CHANGE
      ===================================================== */}

      <nav
        className={
          styles.mobileBottomNav
        }
      >
        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >
          <Icon
            name="dashboard"
            size={20}
          />

          <span>
            Dashboard
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/verify"
            )
          }
        >
          <Icon
            name="verify"
            size={20}
          />

          <span>
            Verify
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/my-properties"
            )
          }
        >
          <Icon
            name="properties"
            size={20}
          />

          <span>
            Properties
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/reports"
            )
          }
        >
          <Icon
            name="reports"
            size={20}
          />

          <span>
            Reports
          </span>
        </button>

        <button
          type="button"
          className={
            styles.bottomActive
          }
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >
          <Icon
            name="account"
            size={20}
          />

          <span>
            Account
          </span>
        </button>
      </nav>
    </main>
  );
}