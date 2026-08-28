"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./security.module.css";
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
  | "lock"
  | "shield"
  | "monitor"
  | "mail"
  | "phone"
  | "menu"
  | "chevron"
  | "arrow"
  | "headset"
  | "logout";

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
    bell: "🔔",
    lock: "▣",
    shield: "♢",
    monitor: "▣",
    mail: "✉",
    phone: "☎",
    menu: "☰",
    chevron: "›",
    arrow: "←",
    headset: "♧",
    logout: "↪",
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
SECURITY PAGE
============================================================
*/

export default function SecurityPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [menuOpen, setMenuOpen] =
    useState(false);

  /*
  ============================================================
  USER DATA
  ============================================================
  */

  const [user, setUser] = useState({
    fullName: "User",
    initial: "U",
    plan: "Free Plan",
    email: "",
    emailVerified: false,
    phone: "",
    phoneVerified: false,
  });

  /*
  ============================================================
  2FA DATA
  ============================================================
  */

  const [twoFactor, setTwoFactor] =
    useState({
      enabled: false,
      loading: true,
      method: "",
    });

  /*
  ============================================================
  LOAD USER + SECURITY STATUS
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadSecurityData = async () => {
      try {
        setLoadingUser(true);

        /*
        --------------------------------------------------------
        GET AUTH USER
        --------------------------------------------------------
        */

        const {
          data: { user: authUser },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!authUser) {
          router.replace("/signin");
          return;
        }

        if (!mounted) {
          return;
        }

        /*
        --------------------------------------------------------
        USER METADATA
        --------------------------------------------------------
        */

        const metadata =
          authUser.user_metadata || {};

        const metadataName =
          metadata.full_name ||
          metadata.name ||
          metadata.display_name ||
          "";

        /*
        --------------------------------------------------------
        EMAIL
        --------------------------------------------------------
        */

        const email =
          authUser.email || "";

        /*
        --------------------------------------------------------
        FALLBACK NAME
        --------------------------------------------------------
        */

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

        /*
        --------------------------------------------------------
        INITIAL
        --------------------------------------------------------
        */

        const firstInitial =
          fullName
            .trim()
            .charAt(0)
            .toUpperCase() || "U";

        /*
        --------------------------------------------------------
        PLAN
        --------------------------------------------------------
        */

        const metadataPlan =
          metadata.plan ||
          metadata.subscription_plan ||
          metadata.account_plan ||
          "Free Plan";

        /*
        --------------------------------------------------------
        PHONE
        --------------------------------------------------------
        */

        const phone =
          authUser.phone || "";

        const phoneVerified =
          Boolean(
            authUser.phone_confirmed_at
          );

        /*
        --------------------------------------------------------
        SET USER
        --------------------------------------------------------
        */

        setUser({
          fullName,
          initial: firstInitial,
          plan: String(metadataPlan),
          email,
          emailVerified:
            Boolean(
              authUser.email_confirmed_at
            ),
          phone,
          phoneVerified,
        });

        /*
        ========================================================
        LOAD SUPABASE MFA FACTORS
        ========================================================
        */

        const {
          data: factorsData,
          error: factorsError,
        } =
          await supabase.auth.mfa.listFactors();

        if (factorsError) {
          console.error(
            "MFA FACTOR LOAD ERROR:",
            factorsError
          );

          if (mounted) {
            setTwoFactor({
              enabled: false,
              loading: false,
              method: "",
            });
          }
        } else {
          /*
          ------------------------------------------------------
          ONLY VERIFIED FACTORS COUNT AS ENABLED
          ------------------------------------------------------
          */

          const allFactors =
            Array.isArray(
              factorsData?.all
            )
              ? factorsData.all
              : [];

          const verifiedFactors =
            allFactors.filter(
              (factor) =>
                factor.status ===
                "verified"
            );

          const verifiedTypes =
            Array.from(
              new Set(
                verifiedFactors.map(
                  (factor) =>
                    factor.factor_type
                )
              )
            );

          let method = "";

          if (
            verifiedTypes.includes(
              "totp"
            ) &&
            verifiedTypes.includes(
              "phone"
            )
          ) {
            method =
              "Authenticator app & phone";
          } else if (
            verifiedTypes.includes(
              "totp"
            )
          ) {
            method =
              "Authenticator app";
          } else if (
            verifiedTypes.includes(
              "phone"
            )
          ) {
            method = "Phone";
          }

          if (mounted) {
            setTwoFactor({
              enabled:
                verifiedFactors.length >
                0,
              loading: false,
              method,
            });
          }
        }
      } catch (error) {
        console.error(
          "Security user loading error:",
          error
        );

        if (mounted) {
          setTwoFactor({
            enabled: false,
            loading: false,
            method: "",
          });
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadSecurityData();

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
  LOADING
  ============================================================
  */

  if (loadingUser) {
    return (
      <main className={styles.loading}>
        <div className={styles.loadingBrand}>
          <span className={styles.loadingLogo}>
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <div className={styles.loadingText}>
          Loading security settings...
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
              <span className={styles.navIcon}>
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
          <span className={styles.navIcon}>
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
          <span className={styles.navIcon}>
            <Icon
              name="settings"
              size={18}
            />
          </span>

          <span>Settings</span>
        </button>

        {/* SUPPORT */}

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

        {/* USER */}

        <button
          type="button"
          className={styles.sidebarUser}
          onClick={() =>
            navigateTo("/account")
          }
        >
          <div className={styles.avatar}>
            {user.initial}
          </div>

          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {user.fullName}
            </div>

            <div className={styles.userPlan}>
              {user.plan}
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
      </aside>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() =>
            setMenuOpen(true)
          }
          aria-label="Open navigation"
        >
          <Icon name="menu" size={23} />
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
            ORIGINAL MOBILE NOTIFICATION BELL
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
          <Icon name="bell" size={17} />

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
        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header className={styles.topBar}>
          <div
            className={
              styles.topBarTitle
            }
          >
            Security & Privacy
          </div>

          <div
            className={
              styles.topBarRight
            }
          >
            {/* =================================================
                ORIGINAL DESKTOP NOTIFICATION BELL
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
                {user.initial}
              </div>

              <div
                className={
                  styles.topUserText
                }
              >
                <strong>
                  {user.fullName}
                </strong>

                <span>
                  {user.plan}
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
          </div>
        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className={styles.content}>
          <div className={styles.pageIntro}>
            <h1>
              Security & Privacy
            </h1>

            <p>
              Manage your account security
              settings and keep your
              information safe.
            </p>

            <Link
              href="/account"
              className={
                styles.backLink
              }
            >
              <Icon
                name="arrow"
                size={18}
              />

              <span>
                Back to Account
              </span>
            </Link>
          </div>

          {/* =================================================
              AUTHENTICATION
          ================================================= */}

          <div
            className={
              styles.sectionLabel
            }
          >
            AUTHENTICATION
          </div>

          {/* PASSWORD */}

          <section
            className={
              styles.securityCard
            }
          >
            <div
              className={`${styles.securityIcon} ${styles.passwordIcon}`}
            >
              <Icon
                name="lock"
                size={27}
              />
            </div>

            <div
              className={
                styles.securityText
              }
            >
              <h2>Password</h2>

              <p>
                Keep your account password
                secure.
              </p>
            </div>

            <button
              type="button"
              className={
                styles.actionButton
              }
              onClick={() =>
                navigateTo(
                  "/change-password"
                )
              }
            >
              <span>
                Change Password
              </span>

              <Icon
                name="chevron"
                size={24}
              />
            </button>
          </section>

          {/* TWO-FACTOR AUTHENTICATION */}

          <section
            className={
              styles.securityCard
            }
          >
            <div
              className={`${styles.securityIcon} ${styles.twoFactorIcon}`}
            >
              <Icon
                name="shield"
                size={27}
              />
            </div>

            <div
              className={
                styles.securityText
              }
            >
              <h2>
                Two-Factor Authentication
              </h2>

              <p>
                {twoFactor.loading
                  ? "Checking your account protection..."
                  : twoFactor.enabled
                    ? twoFactor.method
                      ? `Protected with ${twoFactor.method}.`
                      : "Your account has an active second factor."
                    : "Add an extra layer of protection to your account."}
              </p>
            </div>

            <div
              className={
                styles.statusActionGroup
              }
            >
              {twoFactor.loading ? (
                <div
                  className={
                    styles.loadingStatus
                  }
                >
                  Checking...
                </div>
              ) : (
                <div
                  className={
                    twoFactor.enabled
                      ? styles.enabledStatus
                      : styles.notEnabledStatus
                  }
                >
                  <span
                    className={
                      styles.statusCircle
                    }
                  >
                    {twoFactor.enabled
                      ? "✓"
                      : "!"}
                  </span>

                  <span>
                    {twoFactor.enabled
                      ? "Enabled"
                      : "Not enabled"}
                  </span>
                </div>
              )}

              <button
                type="button"
                className={
                  styles.actionButton
                }
                onClick={() =>
                  navigateTo(
                    "/two-factor-authentication"
                  )
                }
              >
                <span>
                  {twoFactor.enabled
                    ? "Manage 2FA"
                    : "Set Up 2FA"}
                </span>

                <Icon
                  name="chevron"
                  size={24}
                />
              </button>
            </div>
          </section>

          {/* =================================================
              SESSIONS
          ================================================= */}

          <div
            className={`${styles.sectionLabel} ${styles.sessionsLabel}`}
          >
            SESSIONS
          </div>

          <section
            className={
              styles.securityCard
            }
          >
            <div
              className={`${styles.securityIcon} ${styles.sessionIcon}`}
            >
              <Icon
                name="monitor"
                size={27}
              />
            </div>

            <div
              className={
                styles.securityText
              }
            >
              <h2>
                Active Sessions
              </h2>

              <p>
                View and manage devices
                currently signed in to
                your account.
              </p>
            </div>

            {/* =================================================
                UPDATED ACTIVE SESSIONS NAVIGATION
            ================================================= */}

            <button
              type="button"
              className={
                styles.actionButton
              }
              onClick={() =>
                navigateTo(
                  "/active-sessions"
                )
              }
            >
              <span>
                View Sessions
              </span>

              <Icon
                name="chevron"
                size={24}
              />
            </button>
          </section>

          {/* =================================================
              ACCOUNT SECURITY
          ================================================= */}

          <div
            className={`${styles.sectionLabel} ${styles.accountSecurityLabel}`}
          >
            ACCOUNT SECURITY
          </div>

          {/* EMAIL */}

          <section
            className={
              styles.securityCard
            }
          >
            <div
              className={`${styles.securityIcon} ${styles.emailIcon}`}
            >
              <Icon
                name="mail"
                size={27}
              />
            </div>

            <div
              className={
                styles.securityText
              }
            >
              <h2>
                Email Verification
              </h2>

              <p>
                {user.email
                  ? user.email
                  : "No email address found."}
              </p>
            </div>

            <div
              className={
                user.emailVerified
                  ? styles.verifiedStatus
                  : styles.unverifiedStatus
              }
            >
              <span
                className={
                  styles.statusCircle
                }
              >
                {user.emailVerified
                  ? "✓"
                  : "!"}
              </span>

              <span>
                {user.emailVerified
                  ? "Verified"
                  : "Not verified"}
              </span>
            </div>
          </section>

          {/* PHONE */}

          <section
            className={
              styles.securityCard
            }
          >
            <div
              className={`${styles.securityIcon} ${styles.phoneIcon}`}
            >
              <Icon
                name="phone"
                size={27}
              />
            </div>

            <div
              className={
                styles.securityText
              }
            >
              <h2>
                Phone Number
              </h2>

              <p>
                {user.phone
                  ? user.phone
                  : "No phone number has been added to your account."}
              </p>
            </div>

            <div
              className={
                user.phoneVerified
                  ? styles.verifiedStatus
                  : styles.unverifiedStatus
              }
            >
              <span
                className={
                  styles.statusCircle
                }
              >
                {user.phoneVerified
                  ? "✓"
                  : "!"}
              </span>

              <span>
                {user.phoneVerified
                  ? "Verified"
                  : user.phone
                    ? "Not verified"
                    : "Not added"}
              </span>
            </div>

            <button
              type="button"
              className={
                styles.actionButton
              }
              onClick={() =>
                navigateTo(
                  "/account/phone-number"
                )
              }
            >
              <span>
                {user.phone
                  ? user.phoneVerified
                    ? "Manage Phone"
                    : "Verify Phone"
                  : "Add Phone Number"}
              </span>

              <Icon
                name="chevron"
                size={24}
              />
            </button>
          </section>

          {/* =================================================
              SECURITY NOTICE
          ================================================= */}

          <section
            className={
              styles.securityNotice
            }
          >
            <div
              className={
                styles.noticeIcon
              }
            >
              <Icon
                name="shield"
                size={28}
              />
            </div>

            <div
              className={
                styles.noticeText
              }
            >
              <h3>
                Your security is important
                to us
              </h3>

              <p>
                We use industry-standard
                encryption to protect your
                data and keep your account
                secure.
              </p>
            </div>

            <div
              className={
                styles.noticeDecoration
              }
            >
              <div
                className={
                  styles.noticeLock
                }
              >
                🔒
              </div>
            </div>
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

          <span>
            Dashboard
          </span>
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

          <span>
            Properties
          </span>
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