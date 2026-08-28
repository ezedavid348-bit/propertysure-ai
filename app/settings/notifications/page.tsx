"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./notifications.module.css";
import { supabase } from "../../lib/supabase";

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
  | "email"
  | "sms"
  | "push"
  | "verification"
  | "fraudAlert"
  | "lock"
  | "delivery"
  | "logout"
  | "menu"
  | "chevron"
  | "check";

function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  /*
  ==========================================================
  MASTER VERIFY ICON
  ==========================================================

  This is copied from the General Settings page.

  Source:
      General Settings Page

  SVG:
      viewBox 0 0 42 42

  This is intentionally NOT the old:
      ⇧

  The Verify icon now uses the same document +
  verification badge design from General Settings.
  ==========================================================
  */

  if (name === "verify") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 42 42"
        fill="none"
        className={`${styles.verifyMasterIcon} ${className}`}
        aria-hidden="true"
      >
        <path
          d="M11 6.5H25L31 12.5V34.5H11V6.5Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        <path
          d="M24 6.5V13H30.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        <path
          d="M16 19H25"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <path
          d="M16 24H21"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <circle
          cx="27"
          cy="28"
          r="4"
          fill="currentColor"
        />

        <path
          d="M25.2 28L26.5 29.3L29 26.8"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  const icons: Record<
    Exclude<IconName, "verify">,
    string
  > = {
    dashboard: "▦",
    properties: "⌂",
    history: "◷",
    fraud: "◈",
    reports: "▤",
    account: "◯",
    settings: "⚙",
    bell: "🔔",
    email: "✉",
    sms: "▣",
    push: "▯",
    verification: "▤",
    fraudAlert: "⬟",
    lock: "▣",
    delivery: "✉",
    logout: "↪",
    menu: "☰",
    chevron: "›",
    check: "✓",
  };

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
TOGGLE
============================================================
*/

function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.toggle} ${
        enabled ? styles.toggleOn : ""
      }`}
      onClick={onChange}
      aria-label={label}
      aria-pressed={enabled}
    >
      <span className={styles.toggleKnob} />
    </button>
  );
}

/*
============================================================
CHECKBOX
============================================================
*/

function CheckBox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.checkboxButton} ${
        checked ? styles.checkboxChecked : ""
      }`}
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
    >
      <span className={styles.checkbox}>
        {checked && (
          <Icon
            name="check"
            size={10}
          />
        )}
      </span>
    </button>
  );
}

/*
============================================================
NOTIFICATION SECTION
============================================================
*/

function NotificationSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.notificationSection}>
      <div className={styles.sectionLabel}>
        {title.toUpperCase()}
      </div>

      <div className={styles.notificationCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderText}>
            <h2>{title}</h2>

            <p>{description}</p>
          </div>
        </div>

        <div className={styles.sectionRows}>
          {children}
        </div>
      </div>
    </section>
  );
}

/*
============================================================
CHANNEL ROW
============================================================
*/

function ChannelRow({
  icon,
  color,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: IconName;
  color:
    | "green"
    | "yellow"
    | "purple";
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className={styles.channelRow}>
      <div
        className={`${styles.channelIcon} ${styles[color]}`}
      >
        <Icon
          name={icon}
          size={16}
        />
      </div>

      <div className={styles.rowText}>
        <strong>{title}</strong>

        <span>{description}</span>
      </div>

      <Toggle
        enabled={enabled}
        onChange={onChange}
        label={`${
          enabled ? "Disable" : "Enable"
        } ${title}`}
      />
    </div>
  );
}

/*
============================================================
CHECK ROW
============================================================
*/

function CheckRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className={styles.checkRow}>
      <CheckBox
        checked={checked}
        onChange={onChange}
        label={title}
      />

      <div className={styles.checkText}>
        <strong>{title}</strong>

        <span>{description}</span>
      </div>
    </div>
  );
}

/*
============================================================
PAGE
============================================================
*/

export default function NotificationsPage() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [user, setUser] = useState({
    fullName: "User",
    initial: "U",
    plan: "Free Plan",
  });

  /*
  ============================================================
  NOTIFICATION CHANNELS
  ============================================================
  */

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(true);

  const [
    emailNotifications,
    setEmailNotifications,
  ] = useState(true);

  const [
    smsNotifications,
    setSmsNotifications,
  ] = useState(true);

  const [
    pushNotifications,
    setPushNotifications,
  ] = useState(true);

  /*
  ============================================================
  VERIFICATION
  ============================================================
  */

  const [
    verificationCompleted,
    setVerificationCompleted,
  ] = useState(true);

  const [
    verificationAttention,
    setVerificationAttention,
  ] = useState(true);

  const [
    verificationFailed,
    setVerificationFailed,
  ] = useState(true);

  const [
    verificationReportReady,
    setVerificationReportReady,
  ] = useState(true);

  /*
  ============================================================
  PROPERTY / FRAUD
  ============================================================
  */

  const [
    fraudWatchAlerts,
    setFraudWatchAlerts,
  ] = useState(true);

  const [
    propertyStatusChanges,
    setPropertyStatusChanges,
  ] = useState(true);

  const [
    propertyWarnings,
    setPropertyWarnings,
  ] = useState(true);

  const [
    savedPropertyActivity,
    setSavedPropertyActivity,
  ] = useState(true);

  /*
  ============================================================
  SECURITY
  ============================================================
  */

  const [newLogin, setNewLogin] =
    useState(true);

  const [
    passwordSecurity,
    setPasswordSecurity,
  ] = useState(true);

  const [
    twoFactorSecurity,
    setTwoFactorSecurity,
  ] = useState(true);

  const [
    accountChanges,
    setAccountChanges,
  ] = useState(true);

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
                (letter: string) =>
                  letter.toUpperCase()
              )
          : "User";

        const fullName =
          String(
            metadataName
          ).trim() ||
          fallbackName;

        const initial =
          fullName
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
          "Notification user loading error:",
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
          <span
            className={
              styles.loadingDiamond
            }
          >
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <p>
          Loading notifications...
        </p>
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

      {/* ====================================================
          DESKTOP / TABLET TOP BAR
      ==================================================== */}

      <header className={styles.topBar}>
        <button
          type="button"
          className={styles.topBrand}
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <span
            className={styles.topDiamond}
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
          className={styles.topBell}
          onClick={() =>
            navigateTo(
              "/settings/notifications"
            )
          }
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            size={20}
          />

          <span
            className={
              styles.topBellDot
            }
          />
        </button>
      </header>

      {/* ====================================================
          MOBILE HEADER
      ==================================================== */}

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
            styles.mobileLogo
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
          <Icon
            name="bell"
            size={19}
          />

          <span
            className={
              styles.mobileBellDot
            }
          />
        </button>
      </header>

      {/* ====================================================
          MOBILE MENU
      ==================================================== */}

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
              <span>◆</span>

              <strong>
                PropertySure
                <b> AI</b>
              </strong>
            </button>

            <button
              type="button"
              className={
                styles.closeButton
              }
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <p
            className={
              styles.mobileMenuSubtitle
            }
          >
            AI-Powered Property
            <br />
            Due Diligence
          </p>

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
                  onClick={() =>
                    navigateTo(
                      item.href
                    )
                  }
                >
                  <Icon
                    name={item.icon}
                    size={
                      item.icon === "verify"
                        ? 20
                        : 19
                    }
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
              styles.mobileMenuLabel
            }
          >
            ACCOUNT
          </div>

          <button
            type="button"
            className={
              styles.mobileMenuItem
            }
            onClick={() =>
              navigateTo(
                "/account"
              )
            }
          >
            <Icon
              name="account"
              size={19}
            />

            <span>Account</span>
          </button>

          <button
            type="button"
            className={
              styles.mobileMenuItem
            }
            onClick={() =>
              navigateTo(
                "/settings"
              )
            }
          >
            <Icon
              name="settings"
              size={19}
            />

            <span>Settings</span>
          </button>

          <button
            type="button"
            className={`${styles.mobileMenuItem} ${styles.logoutItem}`}
            onClick={signOut}
          >
            <Icon
              name="logout"
              size={19}
            />

            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* ====================================================
          MAIN CONTENT
      ==================================================== */}

      <section
        className={styles.main}
      >
        <header
          className={
            styles.pageHeader
          }
        >
          <h1>Notifications</h1>

          <p>
            Manage how and when you
            receive notifications.
          </p>

          <button
            type="button"
            className={
              styles.backButton
            }
            onClick={backToSettings}
          >
            ‹ Back to Settings
          </button>
        </header>

        <div
          className={
            styles.content
          }
        >
          {/* ==================================================
              NOTIFICATION PREFERENCES
          ================================================== */}

          <NotificationSection
            title="Notification Preferences"
            description="Control your notification channels."
          >
            <ChannelRow
              icon="bell"
              color="green"
              title="Enable Notifications"
              description="Master switch for all notifications."
              enabled={
                notificationsEnabled
              }
              onChange={() =>
                setNotificationsEnabled(
                  (value) => !value
                )
              }
            />

            <ChannelRow
              icon="email"
              color="green"
              title="Email Notifications"
              description="Receive notifications via email."
              enabled={
                emailNotifications
              }
              onChange={() =>
                setEmailNotifications(
                  (value) => !value
                )
              }
            />

            <ChannelRow
              icon="sms"
              color="yellow"
              title="SMS Notifications"
              description="Receive important alerts via SMS."
              enabled={
                smsNotifications
              }
              onChange={() =>
                setSmsNotifications(
                  (value) => !value
                )
              }
            />

            <ChannelRow
              icon="push"
              color="purple"
              title="Push Notifications"
              description="Receive push notifications in your browser."
              enabled={
                pushNotifications
              }
              onChange={() =>
                setPushNotifications(
                  (value) => !value
                )
              }
            />
          </NotificationSection>

          {/* ==================================================
              VERIFICATION NOTIFICATIONS
          ================================================== */}

          <NotificationSection
            title="Verification Notifications"
            description="Receive updates about verification activities."
          >
            <CheckRow
              title="Verification Completed"
              description="Get notified when a verification is completed."
              checked={
                verificationCompleted
              }
              onChange={() =>
                setVerificationCompleted(
                  (value) => !value
                )
              }
            />

            <CheckRow
              title="Verification Requires Attention"
              description="Get notified when verification requires your attention."
              checked={
                verificationAttention
              }
              onChange={() =>
                setVerificationAttention(
                  (value) => !value
                )
              }
            />

            <CheckRow
              title="Verification Failed / Flagged"
              description="Get notified when verification fails or is flagged."
              checked={
                verificationFailed
              }
              onChange={() =>
                setVerificationFailed(
                  (value) => !value
                )
              }
            />

            <CheckRow
              title="Verification Report Ready"
              description="Get notified when your verification report is ready to view."
              checked={
                verificationReportReady
              }
              onChange={() =>
                setVerificationReportReady(
                  (value) => !value
                )
              }
            />
          </NotificationSection>

          {/* ==================================================
              PROPERTY & FRAUD
          ================================================== */}

          <NotificationSection
            title="Property & Fraud Alerts"
            description="Important alerts about your properties and fraud watch."
          >
            <CheckRow
              title="Fraud Watch Alerts"
              description="Get notified about potential fraud activities."
              checked={
                fraudWatchAlerts
              }
              onChange={() =>
                setFraudWatchAlerts(
                  (value) => !value
                )
              }
            />

            <CheckRow
              title="Property Status Changes"
              description="Get notified when property status changes."
              checked={
                propertyStatusChanges
              }
              onChange={() =>
                setPropertyStatusChanges(
                  (value) => !value
                )
              }
            />

            <CheckRow
              title="Important Property Warnings"
              description="Get notified about important property warnings."
              checked={
                propertyWarnings
              }
              onChange={() =>
                setPropertyWarnings(
                  (value) => !value
                )
              }
            />

            <CheckRow
              title="New Activity on Saved Properties"
              description="Get notified about new activity on your saved properties."
              checked={
                savedPropertyActivity
              }
              onChange={() =>
                setSavedPropertyActivity(
                  (value) => !value
                )
              }
            />
          </NotificationSection>

          {/* ==================================================
              ACCOUNT & SECURITY
          ================================================== */}

          <NotificationSection
            title="Account & Security Alerts"
            description="Critical alerts about your account and security."
          >
            <CheckRow
              title="New Login"
              description="Get notified when someone logs in to your account."
              checked={newLogin}
              onChange={() =>
                setNewLogin(
                  (value) => !value
                )
              }
            />

            <CheckRow
              title="Password / Security Changes"
              description="Get notified when password or security settings change."
              checked={
                passwordSecurity
              }
              onChange={() =>
                setPasswordSecurity(
                  (value) => !value
                )
              }
            />

            <CheckRow
              title="2FA / Security Events"
              description="Get notified about 2FA or other security events."
              checked={
                twoFactorSecurity
              }
              onChange={() =>
                setTwoFactorSecurity(
                  (value) => !value
                )
              }
            />

            <CheckRow
              title="Account Changes"
              description="Get notified about important account changes."
              checked={
                accountChanges
              }
              onChange={() =>
                setAccountChanges(
                  (value) => !value
                )
              }
            />
          </NotificationSection>

          {/* ==================================================
              NOTIFICATION DELIVERY
          ================================================== */}

          <section
            className={
              styles.deliverySection
            }
          >
            <div
              className={
                styles.sectionLabel
              }
            >
              NOTIFICATION DELIVERY
            </div>

            <div
              className={
                styles.deliveryCard
              }
            >
              <div
                className={
                  styles.deliveryItem
                }
              >
                <div
                  className={`${styles.deliveryIcon} ${styles.deliveryBlue}`}
                >
                  <Icon
                    name="email"
                    size={16}
                  />
                </div>

                <div>
                  <strong>
                    Email
                  </strong>

                  <span>
                    Account email
                  </span>

                  <small>
                    ✓ Verified
                  </small>
                </div>
              </div>

              <div
                className={
                  styles.deliveryItem
                }
              >
                <div
                  className={`${styles.deliveryIcon} ${styles.deliveryOrange}`}
                >
                  <Icon
                    name="sms"
                    size={16}
                  />
                </div>

                <div>
                  <strong>
                    Phone (SMS)
                  </strong>

                  <span>
                    Account phone
                  </span>

                  <small>
                    ✓ Verified
                  </small>
                </div>
              </div>

              <div
                className={
                  styles.deliveryItem
                }
              >
                <div
                  className={`${styles.deliveryIcon} ${styles.deliveryPurple}`}
                >
                  <Icon
                    name="push"
                    size={16}
                  />
                </div>

                <div>
                  <strong>
                    Push Notifications
                  </strong>

                  <span>
                    This browser
                  </span>

                  <small>
                    ✓ Enabled
                  </small>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* ====================================================
          MOBILE BOTTOM NAV
      ==================================================== */}

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
            styles.bottomActive
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