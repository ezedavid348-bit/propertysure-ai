"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./active-sessions.module.css";
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
  | "monitor"
  | "arrow"
  | "menu"
  | "chevron"
  | "logout"
  | "shield"
  | "lock"
  | "phone";

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const icons: Record<IconName, string> = {
    dashboard: "▦",
    verify: "⇧",
    properties: "⌂",
    history: "◷",
    fraud: "◇",
    reports: "▤",
    account: "◯",
    settings: "⚙",

    /*
    ========================================================
    EXACT NOTIFICATION BELL FROM SECURITY PAGE
    ========================================================
    */
    bell: "🔔",

    monitor: "▣",
    arrow: "←",
    menu: "☰",
    chevron: "›",
    logout: "↪",
    shield: "♢",
    lock: "▣",
    phone: "☎",
  };

  return (
    <span
      className={styles.icon}
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
NAVIGATION
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
SESSION DATA
============================================================
*/

type SessionInfo = {
  email: string;
  fullName: string;
  initial: string;
  plan: string;
  lastSignIn: string;
  device: string;
  browser: string;
};

/*
============================================================
DEVICE DETECTION
============================================================
*/

function detectDevice() {
  if (typeof navigator === "undefined") {
    return {
      device: "Current Device",
      browser: "Browser",
    };
  }

  const userAgent =
    navigator.userAgent.toLowerCase();

  let device = "Desktop";

  if (
    /iphone|ipad|ipod/.test(userAgent)
  ) {
    device = "iPhone / iPad";
  } else if (
    /android/.test(userAgent)
  ) {
    device = "Android Device";
  } else if (
    /macintosh|mac os x/.test(userAgent)
  ) {
    device = "Mac";
  } else if (
    /windows/.test(userAgent)
  ) {
    device = "Windows";
  } else if (
    /linux/.test(userAgent)
  ) {
    device = "Linux";
  }

  let browser = "Browser";

  if (/edg\//.test(userAgent)) {
    browser = "Microsoft Edge";
  } else if (/chrome\//.test(userAgent)) {
    browser = "Chrome";
  } else if (/firefox\//.test(userAgent)) {
    browser = "Firefox";
  } else if (
    /safari\//.test(userAgent) &&
    !/chrome\//.test(userAgent)
  ) {
    browser = "Safari";
  }

  return {
    device,
    browser,
  };
}

/*
============================================================
ACTIVE SESSIONS PAGE
============================================================
*/

export default function ActiveSessionsPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [session, setSession] =
    useState<SessionInfo | null>(null);

  /*
  ============================================================
  LOAD CURRENT SESSION
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          router.replace("/signin");
          return;
        }

        const {
          data: sessionData,
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!mounted) {
          return;
        }

        const metadata =
          user.user_metadata || {};

        const metadataName =
          metadata.full_name ||
          metadata.name ||
          metadata.display_name ||
          "";

        const email =
          user.email || "";

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

        const initial =
          fullName
            .trim()
            .charAt(0)
            .toUpperCase() || "U";

        const plan =
          metadata.plan ||
          metadata.subscription_plan ||
          metadata.account_plan ||
          "Free Plan";

        const lastSignIn =
          user.last_sign_in_at ||
          sessionData.session?.user
            ?.last_sign_in_at ||
          "";

        const deviceInfo =
          detectDevice();

        setSession({
          email,
          fullName,
          initial,
          plan: String(plan),
          lastSignIn,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
        });
      } catch (error) {
        console.error(
          "Active session loading error:",
          error
        );

        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
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
  FORMAT DATE
  ============================================================
  */

  const formatDate = (
    value: string
  ) => {
    if (!value) {
      return "Not available";
    }

    try {
      return new Intl.DateTimeFormat(
        undefined,
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      ).format(new Date(value));
    } catch {
      return "Not available";
    }
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <main className={styles.loading}>
        <div className={styles.loadingBrand}>
          <span
            className={styles.loadingLogo}
          >
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <div className={styles.loadingText}>
          Loading active sessions...
        </div>
      </main>
    );
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <main className={styles.page}>
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className={styles.sidebar}>
        <button
          type="button"
          className={styles.brandButton}
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <div className={styles.brandName}>
            <span
              className={
                styles.brandLogoDiamond
              }
            >
              ◆
            </span>

            <span>
              PropertySure
              <strong> AI</strong>
            </span>
          </div>

          <div className={styles.brandSubtitle}>
            AI-Powered Property
            <br />
            Due Diligence
          </div>
        </button>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              className={styles.navItem}
              onClick={() =>
                navigateTo(item.href)
              }
            >
              <span
                className={
                  styles.navIcon
                }
              >
                <Icon
                  name={item.icon}
                  size={18}
                />
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.accountLabel}>
          ACCOUNT
        </div>

        <button
          type="button"
          className={styles.navItem}
          onClick={() =>
            navigateTo("/account")
          }
        >
          <span
            className={styles.navIcon}
          >
            <Icon
              name="account"
              size={18}
            />
          </span>

          <span>Account</span>
        </button>

        <button
          type="button"
          className={styles.navItem}
          onClick={() =>
            navigateTo("/settings")
          }
        >
          <span
            className={styles.navIcon}
          >
            <Icon
              name="settings"
              size={18}
            />
          </span>

          <span>Settings</span>
        </button>

        <div className={styles.helpBox}>
          <div className={styles.helpTitle}>
            Need Help?
          </div>

          <div className={styles.helpText}>
            Our support team is ready
            <br />
            to assist you.
          </div>

          <button
            type="button"
            className={styles.supportButton}
            onClick={() =>
              navigateTo("/account")
            }
          >
            Contact Support
          </button>
        </div>

        {session && (
          <button
            type="button"
            className={styles.sidebarUser}
            onClick={() =>
              navigateTo("/account")
            }
          >
            <div className={styles.avatar}>
              {session.initial}
            </div>

            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {session.fullName}
              </div>

              <div className={styles.userPlan}>
                {session.plan}
              </div>
            </div>

            <span
              className={
                styles.userChevron
              }
            >
              ⌄
            </span>
          </button>
        )}
      </aside>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header
        className={styles.mobileHeader}
      >
        <button
          type="button"
          className={styles.menuButton}
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
            styles.mobileLogoButton
          }
          onClick={() =>
            navigateTo("/dashboard")
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
            <strong> AI</strong>
          </span>
        </button>

        {/* =================================================
            EXACT NOTIFICATION BELL
            SAME AS SECURITY PAGE
        ================================================= */}

        <button
          type="button"
          className={styles.mobileBell}
          onClick={() =>
            navigateTo(
              "/account/notifications"
            )
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
        <div className={styles.mobileMenu}>
          <div
            className={
              styles.mobileMenuHeader
            }
          >
            <button
              type="button"
              className={
                styles.mobileMenuLogo
              }
              onClick={() =>
                navigateTo("/dashboard")
              }
            >
              <span>◆</span>

              <div>
                PropertySure
                <strong> AI</strong>
              </div>
            </button>

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

          <div
            className={
              styles.mobileMenuSubtitle
            }
          >
            AI-Powered Property Due
            Diligence
          </div>

          <nav
            className={
              styles.mobileMenuNav
            }
          >
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                className={
                  styles.mobileNavItem
                }
                onClick={() =>
                  navigateTo(item.href)
                }
              >
                <span
                  className={
                    styles.navIcon
                  }
                >
                  <Icon
                    name={item.icon}
                    size={18}
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
            type="button"
            className={
              styles.mobileNavItem
            }
            onClick={() =>
              navigateTo("/account")
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

            <span>Account</span>
          </button>

          <button
            type="button"
            className={
              styles.mobileNavItem
            }
            onClick={() =>
              navigateTo("/settings")
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

            <span>Settings</span>
          </button>

          <button
            type="button"
            className={`${styles.mobileNavItem} ${styles.logoutItem}`}
            onClick={signOut}
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

            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section className={styles.main}>
        {/* TOP BAR */}

        <header className={styles.topBar}>
          <div
            className={
              styles.topBarTitle
            }
          >
            Active Sessions
          </div>

          <div
            className={
              styles.topBarRight
            }
          >
            {/* =================================================
                EXACT NOTIFICATION BELL
                SAME AS SECURITY PAGE
            ================================================= */}

            <button
              type="button"
              className={
                styles.topNotification
              }
              onClick={() =>
                navigateTo(
                  "/account/notifications"
                )
              }
              aria-label="Notifications"
            >
              <Icon
                name="bell"
                size={18}
              />

              <span
                className={
                  styles.topNotificationDot
                }
              />
            </button>

            {session && (
              <button
                type="button"
                className={styles.topUser}
                onClick={() =>
                  navigateTo("/account")
                }
              >
                <div
                  className={
                    styles.topAvatar
                  }
                >
                  {session.initial}
                </div>

                <div
                  className={
                    styles.topUserText
                  }
                >
                  <strong>
                    {session.fullName}
                  </strong>

                  <span>
                    {session.plan}
                  </span>
                </div>

                <span
                  className={
                    styles.topChevron
                  }
                >
                  ⌄
                </span>
              </button>
            )}
          </div>
        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className={styles.content}>
          <div className={styles.pageIntro}>
            <h1>
              Active Sessions
            </h1>

            <p>
              View and manage devices that
              are currently signed in to
              your account.
            </p>

            <Link
              href="/security"
              className={
                styles.backLink
              }
            >
              <Icon
                name="arrow"
                size={18}
              />

              <span>
                Back to Security
              </span>
            </Link>
          </div>

          {/* =================================================
              SECURITY HERO
          ================================================= */}

          <section
            className={
              styles.securityBanner
            }
          >
            <div
              className={
                styles.securityBannerIcon
              }
            >
              <Icon
                name="shield"
                size={32}
              />
            </div>

            <div
              className={
                styles.securityBannerText
              }
            >
              <h2>
                Keep your account secure
              </h2>

              <p>
                If you see any unfamiliar
                device or location, please
                sign out of that session
                immediately.
              </p>
            </div>

            <div
              className={
                styles.securityBannerDecoration
              }
            >
              <div
                className={
                  styles.bannerMonitor
                }
              >
                <Icon
                  name="lock"
                  size={30}
                />
              </div>

              <div
                className={
                  styles.bannerPhone
                }
              >
                <Icon
                  name="shield"
                  size={17}
                />
              </div>
            </div>
          </section>

          {/* =================================================
              CURRENT SESSION
          ================================================= */}

          <section
            className={
              styles.currentSessionCard
            }
          >
            <div
              className={
                styles.currentHeader
              }
            >
              <h2>
                Current Session
              </h2>

              <span
                className={
                  styles.youBadge
                }
              >
                This is you
              </span>
            </div>

            <div
              className={
                styles.currentSessionBody
              }
            >
              <div
                className={`${styles.deviceIcon} ${styles.deviceBlue}`}
              >
                <Icon
                  name="monitor"
                  size={29}
                />
              </div>

              <div
                className={
                  styles.deviceInformation
                }
              >
                <h3>
                  {session?.device ||
                    "Current Device"}

                  <span className={styles.dotSeparator}>
                    •
                  </span>

                  {session?.browser ||
                    "Browser"}
                </h3>

                <p>
                  Current browser session
                </p>

                {session?.email && (
                  <span
                    className={
                      styles.emailMeta
                    }
                  >
                    {session.email}
                  </span>
                )}
              </div>

              <div
                className={
                  styles.currentActivity
                }
              >
                <strong>
                  Last active
                </strong>

                <span
                  className={
                    styles.nowStatus
                  }
                >
                  <span
                    className={
                      styles.greenDot
                    }
                  />

                  Now
                </span>

                <small>
                  Last sign-in:{" "}
                  {formatDate(
                    session?.lastSignIn || ""
                  )}
                </small>
              </div>

              <span
                className={
                  styles.currentSessionBadge
                }
              >
                Current Session
              </span>
            </div>
          </section>

          {/* =================================================
              OTHER ACTIVE SESSIONS
          ================================================= */}

          <section
            className={
              styles.otherSessionsCard
            }
          >
            <div
              className={
                styles.otherSessionsHeader
              }
            >
              <h2>
                Other Active Sessions
              </h2>

              <button
                type="button"
                className={
                  styles.signOutAllButton
                }
                onClick={() =>
                  alert(
                    "Other session management will be connected when session tracking is enabled."
                  )
                }
              >
                <Icon
                  name="logout"
                  size={17}
                />

                <span>
                  Sign out all other
                  sessions
                </span>
              </button>
            </div>

            <div
              className={
                styles.noOtherSessions
              }
            >
              <div
                className={
                  styles.noOtherIcon
                }
              >
                <Icon
                  name="monitor"
                  size={25}
                />
              </div>

              <div>
                <h3>
                  No other sessions
                  detected
                </h3>

                <p>
                  PropertySure AI currently
                  recognizes the browser
                  session you are using.
                  Other-device session
                  tracking can be enabled
                  as the authentication
                  system is expanded.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              LOST ACCESS
          ================================================= */}

          <section
            className={
              styles.lostAccessCard
            }
          >
            <div
              className={
                styles.lostAccessIcon
              }
            >
              <Icon
                name="shield"
                size={28}
              />
            </div>

            <div
              className={
                styles.lostAccessText
              }
            >
              <h2>
                Lost access to a device?
              </h2>

              <p>
                If you no longer have access
                to a device, we recommend
                signing out of all other
                sessions and changing your
                password.
              </p>
            </div>

            <button
              type="button"
              className={
                styles.changePasswordButton
              }
              onClick={() =>
                navigateTo(
                  "/change-password"
                )
              }
            >
              Change Password
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
            navigateTo("/dashboard")
          }
        >
          <Icon
            name="dashboard"
            size={20}
          />

          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/verify")
          }
        >
          <Icon
            name="verify"
            size={20}
          />

          <span>Verify</span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/my-properties")
          }
        >
          <Icon
            name="properties"
            size={20}
          />

          <span>Properties</span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/reports")
          }
        >
          <Icon
            name="reports"
            size={20}
          />

          <span>Reports</span>
        </button>

        <button
          type="button"
          className={
            styles.activeBottom
          }
          onClick={() =>
            navigateTo("/account")
          }
        >
          <Icon
            name="account"
            size={20}
          />

          <span>Account</span>
        </button>
      </nav>
    </main>
  );
}