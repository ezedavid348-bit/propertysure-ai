"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./settings.module.css";
import { supabase } from "../lib/supabase";

/*
============================================================
ICON SYSTEM
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
  | "general"
  | "security"
  | "notifications"
  | "appearance"
  | "language"
  | "privacy"
  | "support"
  | "calendar"
  | "clock"
  | "ruler"
  | "refresh"
  | "compact"
  | "trash"
  | "chevron"
  | "menu"
  | "plus"
  | "logout"
  | "user";

function Icon({
  name,
  size,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
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

    general: "▦",
    security: "◈",
    notifications: "🔔",
    appearance: "◌",
    language: "◎",
    privacy: "▤",
    support: "?",

    calendar: "▣",
    clock: "◷",
    ruler: "◇",
    refresh: "↻",
    compact: "▣",
    trash: "⌫",
    chevron: "›",
    menu: "☰",
    plus: "+",
    logout: "↪",
    user: "◯",
  };

  return (
    <span
      className={`${styles.icon} ${className}`}
      style={{
        fontSize: size
          ? `${size}px`
          : undefined,
      }}
      aria-hidden="true"
    >
      {icons[name]}
    </span>
  );
}

/*
============================================================
CATEGORIES
============================================================
*/

const categories = [
  {
    id: "general",
    label: "General",
    description:
      "Basic preferences and settings",
    icon: "general" as IconName,
    color: "green",
  },
  {
    id: "security",
    label: "Security & Privacy",
    description:
      "Password, 2FA, and privacy",
    icon: "security" as IconName,
    color: "blue",
  },
  {
    id: "notifications",
    label: "Notifications",
    description:
      "Email, SMS and push preferences",
    icon: "notifications" as IconName,
    color: "yellow",
  },
  {
    id: "appearance",
    label: "Appearance",
    description:
      "Theme, colors and display",
    icon: "appearance" as IconName,
    color: "cyan",
  },
  {
    id: "language",
    label: "Language & Region",
    description:
      "Language and regional settings",
    icon: "language" as IconName,
    color: "blue",
  },
  {
    id: "privacy",
    label: "Data & Privacy",
    description:
      "Your data and privacy controls",
    icon: "privacy" as IconName,
    color: "gray",
  },
  {
    id: "support",
    label: "Support & Help",
    description:
      "Help center and support",
    icon: "support" as IconName,
    color: "gray",
  },
];

/*
============================================================
SETTING ROUTES
============================================================

These routes correspond to the folders/pages inside:

app/settings/

Current structure:

app/settings/
├── page.tsx
├── general/
├── security/
├── notifications/
├── appearance/
├── language-region/
├── data-privacy/
└── support-help/

============================================================
*/

const settingRoutes: Record<string, string> = {
  general: "/settings/general",

  security: "/settings/security",

  notifications:
    "/settings/notifications",

  appearance:
    "/settings/appearance",

  language:
    "/settings/language-region",

  privacy:
    "/settings/data-privacy",

  // UPDATED SUPPORT ROUTE
  support:
    "/settings/support-help",
};

/*
============================================================
SUPPORT ROUTES
============================================================

These are the pages that belong INSIDE Support & Help.

The Support & Help landing page will contain cards for:

1. Help Center
2. Contact Support
3. Report an Issue
4. Feature Request

============================================================
*/

const supportRoutes = {
  helpCenter:
    "/settings/support-help/help-center",

  contactSupport:
    "/settings/support-help/contact-support",

  reportIssue:
    "/settings/support-help/report-issue",

  featureRequest:
    "/settings/support-help/feature-request",
};

/*
============================================================
DASHBOARD NAVIGATION
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
SETTING ROW
============================================================
*/

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={
        enabled
          ? "Turn setting off"
          : "Turn setting on"
      }
      aria-pressed={enabled}
      onClick={onChange}
      className={`${styles.toggle} ${
        enabled
          ? styles.toggleOn
          : ""
      }`}
    >
      <span />
    </button>
  );
}

function SettingRow({
  icon,
  title,
  description,
  children,
  color = "green",
}: {
  icon: IconName;
  title: string;
  description: string;
  children: ReactNode;
  color?: string;
}) {
  return (
    <div className={styles.settingRow}>
      <div
        className={`${styles.settingIcon} ${
          styles[color]
        }`}
      >
        <Icon
          name={icon}
          size={18}
        />
      </div>

      <div className={styles.settingText}>
        <div
          className={
            styles.settingTitle
          }
        >
          {title}
        </div>

        <div
          className={
            styles.settingDescription
          }
        >
          {description}
        </div>
      </div>

      <div
        className={
          styles.settingControl
        }
      >
        {children}
      </div>
    </div>
  );
}

/*
============================================================
CATEGORY ITEM
============================================================
*/

function CategoryItem({
  category,
  active,
  onClick,
}: {
  category: (typeof categories)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.categoryItem} ${
        active
          ? styles.categoryActive
          : ""
      }`}
    >
      <span
        className={`${styles.categoryIcon} ${
          styles[category.color]
        }`}
      >
        <Icon
          name={category.icon}
          size={18}
        />
      </span>

      <span
        className={
          styles.categoryText
        }
      >
        <strong>
          {category.label}
        </strong>

        <small>
          {category.description}
        </small>
      </span>

      <span
        className={
          styles.categoryChevron
        }
      >
        <Icon
          name="chevron"
          size={17}
        />
      </span>
    </button>
  );
}

/*
============================================================
SETTINGS PAGE
============================================================
*/

export default function SettingsPage() {
  const router = useRouter();

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("general");

  const [
    autoRefresh,
    setAutoRefresh,
  ] = useState(true);

  const [
    compactMode,
    setCompactMode,
  ] = useState(false);

  const [
    deleteModal,
    setDeleteModal,
  ] = useState(false);

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    loadingUser,
    setLoadingUser,
  ] = useState(true);

  const [user, setUser] =
    useState({
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
        setLoadingUser(true);

        const {
          data: { user: authUser },
          error,
        } =
          await supabase.auth.getUser();

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
              .replace(
                /[._-]+/g,
                " "
              )
              .replace(
                /\b\w/g,
                (
                  letter: string
                ) =>
                  letter.toUpperCase()
              )
          : "User";

        const fullName =
          String(metadataName).trim() ||
          fallbackName;

        const firstInitial =
          fullName
            .trim()
            .charAt(0)
            .toUpperCase() ||
          "U";

        const metadataPlan =
          metadata.plan ||
          metadata.subscription_plan ||
          metadata.account_plan ||
          "Free Plan";

        setUser({
          fullName,
          initial: firstInitial,
          plan: String(
            metadataPlan
          ),
        });
      } catch (error) {
        console.error(
          "Settings user loading error:",
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
  ============================================================
  NAVIGATION
  ============================================================
  */

  const navigateTo = (
    path: string
  ) => {
    setMenuOpen(false);
    router.push(path);
  };

  /*
  ============================================================
  SUPPORT NAVIGATION
  ============================================================
  */

  const openSupportHelp = () => {
    setMenuOpen(false);

    router.push(
      "/settings/support-help"
    );
  };

  const openHelpCenter = () => {
    setMenuOpen(false);

    router.push(
      supportRoutes.helpCenter
    );
  };

  const openContactSupport = () => {
    setMenuOpen(false);

    router.push(
      supportRoutes.contactSupport
    );
  };

  const openReportIssue = () => {
    setMenuOpen(false);

    router.push(
      supportRoutes.reportIssue
    );
  };

  const openFeatureRequest = () => {
    setMenuOpen(false);

    router.push(
      supportRoutes.featureRequest
    );
  };

  /*
  ============================================================
  NOTIFICATIONS
  ============================================================
  */

  const openNotifications = () => {
    setMenuOpen(false);

    router.push(
      "/settings/notifications"
    );
  };

  /*
  ============================================================
  APPEARANCE
  ============================================================
  */

  const openAppearance = () => {
    setMenuOpen(false);

    router.push(
      "/settings/appearance"
    );
  };

  /*
  ============================================================
  CATEGORY NAVIGATION
  ============================================================
  */

  const handleCategoryClick = (
    categoryId: string
  ) => {
    const route =
      settingRoutes[categoryId];

    if (route) {
      setActiveCategory(
        categoryId
      );

      setMenuOpen(false);

      router.push(route);

      return;
    }

    setActiveCategory(
      categoryId
    );
  };

  /*
  ============================================================
  SIGN OUT
  ============================================================
  */

  const signOut = async () => {
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
  ============================================================
  LOADING
  ============================================================
  */

  if (loadingUser) {
    return (
      <main className={styles.loading}>
        <div
          className={
            styles.loadingBrand
          }
        >
          <span
            className={
              styles.loadingLogo
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
            styles.loadingText
          }
        >
          Loading your settings...
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

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
          <Icon
            name="menu"
            size={24}
          />
        </button>

        <button
          type="button"
          className={
            styles.mobileLogoButton
          }
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >
          <span
            className={
              styles.mobileLogoDiamond
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
            size={17}
          />

          <span
            className={
              styles.mobileNotificationDot
            }
          />
        </button>
      </header>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

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
                type="button"
                className={
                  styles.mobileMenuLogo
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

                <div>
                  PropertySure
                  <strong>
                    {" "}
                    AI
                  </strong>
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
              type="button"
              className={
                styles.closeMenu
              }
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close navigation"
            >
              ×
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
                  key={item.href}
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
            className={`${styles.mobileNavItem} ${styles.mobileNavActive}`}
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

          <button
            type="button"
            className={`${styles.mobileNavItem} ${styles.logoutItem}`}
            onClick={
              signOut
            }
          >
            <span
              className={
                styles.navIcon
              }
            >
              <Icon
                name="logout"
                size={18}
              />
            </span>

            <span>
              Sign Out
            </span>
          </button>
        </div>
      )}

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className={
          styles.sidebar
        }
      >
        <button
          type="button"
          className={
            styles.brandButton
          }
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >
          <div
            className={
              styles.brandName
            }
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
          className={
            styles.sidebarNav
          }
        >
          {navItems.map(
            (item) => (
              <button
                key={item.href}
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

        {/* ===================================================
            SUPPORT BOX
        =================================================== */}

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
            onClick={
              openContactSupport
            }
          >
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
        </button>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section
        className={styles.main}
      >
        {/* ===================================================
            DESKTOP HEADER
        =================================================== */}

        <header
          className={
            styles.desktopHeader
          }
        >
          <div>
            <div
              className={
                styles.eyebrow
              }
            >
              PROPERTYSURE AI
            </div>

            <h1>
              Settings
            </h1>

            <p>
              Manage your
              preferences,
              security, and
              application
              settings.
            </p>
          </div>

          <button
            type="button"
            className={
              styles.notification
            }
            onClick={
              openNotifications
            }
            aria-label="Notifications"
          >
            <Icon
              name="bell"
              size={17}
            />

            <span
              className={
                styles.notificationDot
              }
            />
          </button>
        </header>

        {/* ===================================================
            DESKTOP CONTENT
        =================================================== */}

        <div
          className={
            styles.contentGrid
          }
        >
          <aside
            className={
              styles.categoriesCard
            }
          >
            <div
              className={
                styles.cardLabel
              }
            >
              CATEGORIES
            </div>

            <div
              className={
                styles.categoryList
              }
            >
              {categories.map(
                (category) => (
                  <CategoryItem
                    key={
                      category.id
                    }
                    category={
                      category
                    }
                    active={
                      activeCategory ===
                      category.id
                    }
                    onClick={() =>
                      handleCategoryClick(
                        category.id
                      )
                    }
                  />
                )
              )}
            </div>

            <button
              type="button"
              className={
                styles.signOutCategory
              }
              onClick={
                signOut
              }
            >
              <span
                className={
                  styles.signOutIcon
                }
              >
                <Icon
                  name="logout"
                  size={18}
                />
              </span>

              <span
                className={
                  styles.signOutText
                }
              >
                <strong>
                  Sign Out
                </strong>

                <small>
                  Sign out of
                  your account
                </small>
              </span>
            </button>
          </aside>

          <div
            className={
              styles.settingsContent
            }
          >
            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>
                  General Settings
                </h2>

                <p>
                  Manage your
                  general
                  preferences and
                  basic
                  application
                  settings.
                </p>
              </div>

              <div
                className={
                  styles.settingsRows
                }
              >
                <SettingRow
                  icon="user"
                  title="Profile Information"
                  description="Manage your profile information and how it's displayed."
                  color="green"
                >
                  <button
                    type="button"
                    className={
                      styles.profileButton
                    }
                    onClick={() =>
                      navigateTo(
                        "/account"
                      )
                    }
                  >
                    Update Profile
                  </button>
                </SettingRow>

                <SettingRow
                  icon="dashboard"
                  title="Default Dashboard"
                  description="Choose which dashboard you see when you log in."
                  color="blue"
                >
                  <select
                    className={
                      styles.select
                    }
                    defaultValue="Overview"
                  >
                    <option>
                      Overview
                    </option>

                    <option>
                      My Properties
                    </option>

                    <option>
                      Fraud Watch
                    </option>
                  </select>
                </SettingRow>

                <SettingRow
                  icon="calendar"
                  title="Date Format"
                  description="Choose your preferred date format."
                  color="purple"
                >
                  <select
                    className={
                      styles.select
                    }
                    defaultValue="MM DD, YYYY"
                  >
                    <option>
                      MM DD, YYYY
                    </option>

                    <option>
                      DD MM, YYYY
                    </option>

                    <option>
                      YYYY MM DD
                    </option>
                  </select>
                </SettingRow>

                <SettingRow
                  icon="clock"
                  title="Time Zone"
                  description="Choose your current time zone."
                  color="yellow"
                >
                  <select
                    className={`${styles.select} ${styles.timezone}`}
                    defaultValue="(GMT+01:00) West Africa Time"
                  >
                    <option>
                      (GMT+01:00)
                      West Africa
                      Time
                    </option>

                    <option>
                      (GMT+00:00)
                      Greenwich
                      Mean Time
                    </option>

                    <option>
                      (GMT+02:00)
                      Central
                      Africa Time
                    </option>
                  </select>
                </SettingRow>

                <SettingRow
                  icon="ruler"
                  title="Measurement System"
                  description="Choose your preferred measurement system."
                  color="cyan"
                >
                  <select
                    className={
                      styles.select
                    }
                    defaultValue="Metric (m, kg, °C)"
                  >
                    <option>
                      Metric (m, kg,
                      °C)
                    </option>

                    <option>
                      Imperial (ft,
                      lb, °F)
                    </option>
                  </select>
                </SettingRow>

                <SettingRow
                  icon="refresh"
                  title="Auto-refresh Dashboard"
                  description="Automatically refresh dashboard data."
                  color="green"
                >
                  <Toggle
                    enabled={
                      autoRefresh
                    }
                    onChange={() =>
                      setAutoRefresh(
                        (value) =>
                          !value
                      )
                    }
                  />
                </SettingRow>

                <SettingRow
                  icon="compact"
                  title="Compact Mode"
                  description="Display more content in less space."
                  color="blue"
                >
                  <Toggle
                    enabled={
                      compactMode
                    }
                    onChange={() =>
                      setCompactMode(
                        (value) =>
                          !value
                      )
                    }
                  />
                </SettingRow>
              </div>
            </section>

            <section
              className={
                styles.dangerCard
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>
                  Danger Zone
                </h2>

                <p>
                  Irreversible and
                  sensitive actions.
                </p>
              </div>

              <div
                className={
                  styles.dangerRow
                }
              >
                <div
                  className={
                    styles.dangerIcon
                  }
                >
                  <Icon
                    name="trash"
                    size={20}
                  />
                </div>

                <div
                  className={
                    styles.dangerText
                  }
                >
                  <strong>
                    Delete Account
                  </strong>

                  <span>
                    Permanently
                    delete your
                    account and
                    all associated
                    data.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    styles.deleteButton
                  }
                  onClick={() =>
                    setDeleteModal(
                      true
                    )
                  }
                >
                  Delete My Account
                </button>
              </div>
            </section>

            <div
              className={
                styles.saveNotice
              }
            >
              <div
                className={
                  styles.saveIcon
                }
              >
                <Icon
                  name="security"
                  size={20}
                />
              </div>

              <div>
                <strong>
                  Your settings are
                  automatically
                  saved
                </strong>

                <p>
                  All changes you
                  make to your
                  settings are
                  saved
                  automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            MOBILE CONTENT
        =================================================== */}

        <div
          className={
            styles.mobileContent
          }
        >
          <div
            className={
              styles.mobilePageHeader
            }
          >
            <h1>
              Settings
            </h1>

            <p>
              Manage your
              preferences,
              security, and
              application
              settings.
            </p>
          </div>

          <section
            className={
              styles.mobileCategoriesCard
            }
          >
            {categories.map(
              (category) => (
                <CategoryItem
                  key={
                    category.id
                  }
                  category={
                    category
                  }
                  active={
                    activeCategory ===
                    category.id
                  }
                  onClick={() =>
                    handleCategoryClick(
                      category.id
                    )
                  }
                />
              )
            )}

            <button
              type="button"
              className={
                styles.mobileSignOut
              }
              onClick={
                signOut
              }
            >
              <span
                className={
                  styles.signOutIcon
                }
              >
                <Icon
                  name="logout"
                  size={18}
                />
              </span>

              <span
                className={
                  styles.signOutText
                }
              >
                <strong>
                  Sign Out
                </strong>

                <small>
                  Sign out of
                  your account
                </small>
              </span>

              <Icon
                name="chevron"
                size={18}
              />
            </button>
          </section>

          <div
            className={
              styles.quickLabel
            }
          >
            QUICK SETTINGS
          </div>

          <section
            className={
              styles.quickCard
            }
          >
            <SettingRow
              icon="refresh"
              title="Auto-refresh Dashboard"
              description="Automatically refresh dashboard data."
              color="green"
            >
              <Toggle
                enabled={
                  autoRefresh
                }
                onChange={() =>
                  setAutoRefresh(
                    (value) =>
                      !value
                  )
                }
              />
            </SettingRow>

            <SettingRow
              icon="compact"
              title="Compact Mode"
              description="Display more content in less space."
              color="blue"
            >
              <Toggle
                enabled={
                  compactMode
                }
                onChange={() =>
                  setCompactMode(
                    (value) =>
                      !value
                  )
                }
              />
            </SettingRow>

            <button
              type="button"
              className={
                styles.themeRow
              }
              onClick={
                openAppearance
              }
              aria-label="Open Appearance settings"
            >
              <span
                className={`${styles.settingIcon} ${styles.cyan}`}
              >
                <Icon
                  name="appearance"
                  size={18}
                />
              </span>

              <span
                className={
                  styles.themeText
                }
              >
                <strong>
                  Theme
                </strong>

                <small>
                  Choose your
                  preferred
                  theme
                </small>
              </span>

              <span
                className={
                  styles.themeValue
                }
              >
                Dark
              </span>

              <Icon
                name="chevron"
                size={18}
              />
            </button>
          </section>

          <section
            className={
              styles.mobileDanger
            }
          >
            <div
              className={
                styles.sectionHeader
              }
            >
              <h2>
                Danger Zone
              </h2>

              <p>
                Irreversible and
                sensitive actions.
              </p>
            </div>

            <div
              className={
                styles.mobileDangerInfo
              }
            >
              <div
                className={
                  styles.dangerIcon
                }
              >
                <Icon
                  name="trash"
                  size={20}
                />
              </div>

              <div
                className={
                  styles.dangerText
                }
              >
                <strong>
                  Delete Account
                </strong>

                <span>
                  Permanently
                  delete your
                  account and
                  all associated
                  data.
                </span>
              </div>
            </div>

            <button
              type="button"
              className={
                styles.mobileDeleteButton
              }
              onClick={() =>
                setDeleteModal(
                  true
                )
              }
            >
              Delete My Account
            </button>
          </section>
        </div>
      </section>

      {/* =====================================================
          MOBILE BOTTOM NAV
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
            styles.activeBottom
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

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteModal && (
        <div
          className={
            styles.modalBackdrop
          }
          onClick={() =>
            setDeleteModal(
              false
            )
          }
        >
          <div
            className={
              styles.modal
            }
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className={
                styles.modalIcon
              }
            >
              <Icon
                name="trash"
                size={25}
              />
            </div>

            <h3>
              Delete your
              account?
            </h3>

            <p>
              This action is
              permanent. Your
              account and all
              associated data
              will be deleted
              and cannot be
              recovered.
            </p>

            <div
              className={
                styles.modalActions
              }
            >
              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={() =>
                  setDeleteModal(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  styles.confirmDelete
                }
                onClick={() => {
                  setDeleteModal(
                    false
                  );

                  alert(
                    "Account deletion would be processed here."
                  );
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}