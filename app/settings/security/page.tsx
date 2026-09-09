"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./security.module.css";
import { supabase } from "../../lib/supabase";

/* =========================================================
   MASTER MENU ICON
========================================================= */

function MenuIcon() {
  return (
    <span
      className={styles["security-master-menu-icon"]}
      aria-hidden="true"
    >
      ☰
    </span>
  );
}

/* =========================================================
   MASTER NATIVE NOTIFICATION BELL
========================================================= */

function NotificationBellIcon() {
  return (
    <span
      className={styles["security-master-bell"]}
      role="img"
      aria-label="Notifications"
    >
      🔔️
    </span>
  );
}

/* =========================================================
   MASTER BOTTOM NAV ICONS
========================================================= */

function DashboardNavIcon() {
  return (
    <span
      className={styles["security-master-nav-icon"]}
      aria-hidden="true"
    >
      ▦
    </span>
  );
}

function VerifyNavIcon() {
  return (
    <span
      className={styles["security-master-nav-icon"]}
      aria-hidden="true"
    >
      ⇧
    </span>
  );
}

function PropertiesNavIcon() {
  return (
    <span
      className={styles["security-master-nav-icon"]}
      aria-hidden="true"
    >
      ⌂
    </span>
  );
}

function ReportsNavIcon() {
  return (
    <span
      className={styles["security-master-nav-icon"]}
      aria-hidden="true"
    >
      ▤
    </span>
  );
}

function AccountNavIcon() {
  return (
    <span
      className={styles["security-master-nav-icon"]}
      aria-hidden="true"
    >
      ◯
    </span>
  );
}

/* =========================================================
   SECURITY ICONS
   ONLY THESE ICONS HAVE BEEN UPDATED
========================================================= */

/* ---------------------------------------------------------
   PASSWORD
   Clean professional padlock
--------------------------------------------------------- */

function LockIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="9"
        y="20"
        width="30"
        height="23"
        rx="5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      <path
        d="M15 20V14.5C15 9.53 19.03 5.5 24 5.5C28.97 5.5 33 9.53 33 14.5V20"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <circle
        cx="24"
        cy="30"
        r="2.6"
        fill="currentColor"
      />

      <path
        d="M24 32.8V37"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------------------------------------------------------
   TWO-FACTOR AUTHENTICATION
   Professional shield with check
--------------------------------------------------------- */

function ShieldIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M24 5.5L39 11V21.2C39 30.8 32.8 38.4 24 42C15.2 38.4 9 30.8 9 21.2V11L24 5.5Z"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      <path
        d="M16.5 23.5L21.5 28.5L31.8 18"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------------------------------------------------
   ACTIVE SESSIONS
   Proper computer monitor / device icon
--------------------------------------------------------- */

function MonitorIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5.5"
        y="7"
        width="37"
        height="27"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      <path
        d="M17 41H31"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <path
        d="M24 34V41"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <path
        d="M12 28H36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

/* ---------------------------------------------------------
   EMAIL VERIFICATION
   Real recognizable envelope
--------------------------------------------------------- */

function MailIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5.5"
        y="10"
        width="37"
        height="28"
        rx="4.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      <path
        d="M7.5 13L24 26.5L40.5 13"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M7.5 35L18.5 25.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.9"
      />

      <path
        d="M40.5 35L29.5 25.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

/* ---------------------------------------------------------
   PHONE NUMBER
   Real telephone handset
--------------------------------------------------------- */

function PhoneIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14.2 6.5C15.4 5.8 16.9 6.1 17.8 7.2L22.3 12.7C23.1 13.7 23.2 15.1 22.5 16.2L19.2 20.8C21.4 25.2 24.8 28.6 29.2 30.8L33.8 27.5C34.9 26.8 36.3 26.9 37.3 27.7L42.8 32.2C43.9 33.1 44.2 34.6 43.5 35.8L40.7 40.5C39.8 42 38.1 42.8 36.4 42.5C18.9 39.5 8.5 29.1 5.5 11.6C5.2 9.9 6 8.2 7.5 7.3L12.2 4.5C12.8 4.1 13.5 4.1 14.2 4.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------------------------------------------------
   SECURITY NOTICE
   Shield + lock combination
--------------------------------------------------------- */

function SecurityNoticeIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M24 5.5L39 11V21.2C39 30.8 32.8 38.4 24 42C15.2 38.4 9 30.8 9 21.2V11L24 5.5Z"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      <rect
        x="16.5"
        y="21"
        width="15"
        height="12"
        rx="2.8"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      <path
        d="M20 21V17.8C20 15.6 21.8 13.8 24 13.8C26.2 13.8 28 15.6 28 17.8V21"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <circle
        cx="24"
        cy="26.5"
        r="1.7"
        fill="currentColor"
      />

      <path
        d="M24 28.3V30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   CHEVRON
========================================================= */

function ChevronIcon() {
  return (
    <span
      className={styles["security-chevron"]}
      aria-hidden="true"
    >
      ›
    </span>
  );
}

/* =========================================================
   STATUS ICON
========================================================= */

function StatusIcon({
  enabled,
}: {
  enabled: boolean;
}) {
  return (
    <span
      className={styles["security-status-circle"]}
      aria-hidden="true"
    >
      {enabled ? "✓" : "!"}
    </span>
  );
}

/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

function BottomNavigation() {
  return (
    <nav className={styles["security-bottom-nav"]}>
      <Link
        href="/dashboard"
        className={styles["security-nav-item"]}
      >
        <DashboardNavIcon />
        <span>Dashboard</span>
      </Link>

      <Link
        href="/verify"
        className={styles["security-nav-item"]}
      >
        <VerifyNavIcon />
        <span>Verify</span>
      </Link>

      <Link
        href="/my-properties"
        className={styles["security-nav-item"]}
      >
        <PropertiesNavIcon />
        <span>Properties</span>
      </Link>

      <Link
        href="/reports"
        className={styles["security-nav-item"]}
      >
        <ReportsNavIcon />
        <span>Reports</span>
      </Link>

      <Link
        href="/account"
        className={`${styles["security-nav-item"]} ${styles["security-nav-active"]}`}
      >
        <AccountNavIcon />
        <span>Account</span>
      </Link>
    </nav>
  );
}

/* =========================================================
   USER TYPE
========================================================= */

type SecurityUser = {
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
};

/* =========================================================
   PAGE
========================================================= */

export default function SecurityPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState<SecurityUser>({
    email: "",
    emailVerified: false,
    phone: "",
    phoneVerified: false,
  });

  const [twoFactor, setTwoFactor] = useState({
    enabled: false,
    loading: true,
    method: "",
  });

  /* =======================================================
     LOAD SECURITY DATA
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadSecurityData = async () => {
      try {
        setLoading(true);

        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser();

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

        setUser({
          email: authUser.email || "",
          emailVerified: Boolean(
            authUser.email_confirmed_at
          ),
          phone: authUser.phone || "",
          phoneVerified: Boolean(
            authUser.phone_confirmed_at
          ),
        });

        /* =================================================
           SUPABASE MFA
        ================================================= */

        const {
          data: factorsData,
          error: factorsError,
        } = await supabase.auth.mfa.listFactors();

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

          return;
        }

        const allFactors = Array.isArray(
          factorsData?.all
        )
          ? factorsData.all
          : [];

        const verifiedFactors = allFactors.filter(
          (factor) => factor.status === "verified"
        );

        const verifiedTypes = Array.from(
          new Set(
            verifiedFactors.map(
              (factor) => factor.factor_type
            )
          )
        );

        let method = "";

        if (
          verifiedTypes.includes("totp") &&
          verifiedTypes.includes("phone")
        ) {
          method = "Authenticator app & phone";
        } else if (
          verifiedTypes.includes("totp")
        ) {
          method = "Authenticator app";
        } else if (
          verifiedTypes.includes("phone")
        ) {
          method = "Phone";
        }

        if (mounted) {
          setTwoFactor({
            enabled:
              verifiedFactors.length > 0,
            loading: false,
            method,
          });
        }
      } catch (error) {
        console.error(
          "Security data loading error:",
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
          setLoading(false);
        }
      }
    };

    loadSecurityData();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className={styles["security-loading"]}>
        <div
          className={styles["security-loading-brand"]}
        >
          <span>◆</span>

          <strong>
            PropertySure
            <em> AI</em>
          </strong>
        </div>

        <p>
          Loading security settings...
        </p>
      </main>
    );
  }

  return (
    <main className={styles["security-page"]}>

      {/* ===================================================
          MASTER HEADER
      =================================================== */}

      <header className={styles["security-header"]}>

        <button
          type="button"
          className={styles["security-menu-button"]}
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>

        <Link
          href="/dashboard"
          className={styles["security-brand"]}
          aria-label="PropertySure AI Dashboard"
        >
          <span
            className={
              styles["security-brand-diamond"]
            }
            aria-hidden="true"
          >
            ◆
          </span>

          <span
            className={styles["security-brand-text"]}
          >
            <span>PropertySure</span>{" "}
            <span
              className={
                styles["security-brand-ai"]
              }
            >
              AI
            </span>
          </span>
        </Link>

        <button
          type="button"
          className={
            styles["security-notification-button"]
          }
          aria-label="Notifications"
          onClick={() =>
            navigateTo(
              "/settings/notifications"
            )
          }
        >
          <NotificationBellIcon />

          <span
            className={
              styles["security-notification-dot"]
            }
          />
        </button>
      </header>

      {/* ===================================================
          MOBILE MENU
      =================================================== */}

      {menuOpen && (
        <div
          className={
            styles["security-mobile-menu"]
          }
        >
          <div
            className={
              styles[
                "security-mobile-menu-header"
              ]
            }
          >
            <Link
              href="/dashboard"
              className={
                styles[
                  "security-mobile-menu-brand"
                ]
              }
              onClick={() =>
                setMenuOpen(false)
              }
            >
              <span>◆</span>

              <strong>
                PropertySure
                <em> AI</em>
              </strong>
            </Link>

            <button
              type="button"
              className={
                styles["security-mobile-close"]
              }
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div
            className={
              styles[
                "security-mobile-menu-subtitle"
              ]
            }
          >
            AI-Powered Property Due Diligence
          </div>

          <nav
            className={
              styles[
                "security-mobile-menu-nav"
              ]
            }
          >
            <button
              type="button"
              onClick={() =>
                navigateTo("/dashboard")
              }
            >
              <DashboardNavIcon />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigateTo("/verify")
              }
            >
              <VerifyNavIcon />
              <span>Verify Property</span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigateTo("/my-properties")
              }
            >
              <PropertiesNavIcon />
              <span>My Properties</span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigateTo(
                  "/verification-history"
                )
              }
            >
              <span>◷</span>
              <span>
                Verification History
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigateTo("/fraud-watch")
              }
            >
              <span>◇</span>
              <span>Fraud Watch</span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigateTo("/reports")
              }
            >
              <ReportsNavIcon />
              <span>Reports</span>
            </button>

            <div
              className={
                styles[
                  "security-mobile-account-label"
                ]
              }
            >
              ACCOUNT
            </div>

            <button
              type="button"
              onClick={() =>
                navigateTo("/account")
              }
            >
              <AccountNavIcon />
              <span>Account</span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigateTo("/settings")
              }
            >
              <span>⚙</span>
              <span>Settings</span>
            </button>
          </nav>
        </div>
      )}

      {/* ===================================================
          CONTENT
      =================================================== */}

      <section
        className={styles["security-content"]}
      >
        <h1>
          Security &amp; Privacy
        </h1>

        <p
          className={
            styles["security-description"]
          }
        >
          Manage your account security settings
          and keep your information safe.
        </p>

        <Link
          href="/settings"
          className={
            styles["security-back-link"]
          }
        >
          <span
            className={
              styles["security-back-arrow"]
            }
          >
            ‹
          </span>

          <span>Back to Settings</span>
        </Link>

        {/* =================================================
            AUTHENTICATION
        ================================================= */}

        <section
          className={
            styles["security-card"]
          }
        >
          <div
            className={
              styles["security-section-label"]
            }
          >
            AUTHENTICATION
          </div>

          {/* PASSWORD */}

          <div
            className={
              styles["security-setting-row"]
            }
          >
            <div
              className={`${styles["security-icon-box"]} ${styles["security-icon-blue"]}`}
            >
              <LockIcon />
            </div>

            <div
              className={
                styles[
                  "security-setting-content"
                ]
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
                styles[
                  "security-action-button"
                ]
              }
              onClick={() =>
                navigateTo(
                  "/change-password"
                )
              }
            >
              <span>Change Password</span>
              <ChevronIcon />
            </button>
          </div>

          <div
            className={
              styles["security-row-divider"]
            }
          />

          {/* TWO FACTOR */}

          <div
            className={
              styles["security-setting-row"]
            }
          >
            <div
              className={`${styles["security-icon-box"]} ${styles["security-icon-green"]}`}
            >
              <ShieldIcon />
            </div>

            <div
              className={
                styles[
                  "security-setting-content"
                ]
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
                styles[
                  "security-status-action"
                ]
              }
            >
              {!twoFactor.loading && (
                <div
                  className={
                    twoFactor.enabled
                      ? `${styles["security-status"]} ${styles["security-status-enabled"]}`
                      : `${styles["security-status"]} ${styles["security-status-warning"]}`
                  }
                >
                  <StatusIcon
                    enabled={
                      twoFactor.enabled
                    }
                  />

                  <span>
                    {twoFactor.enabled
                      ? "Enabled"
                      : "Not enabled"}
                  </span>
                </div>
              )}

              {twoFactor.loading && (
                <div
                  className={
                    styles[
                      "security-loading-status"
                    ]
                  }
                >
                  Checking...
                </div>
              )}

              <button
                type="button"
                className={
                  styles[
                    "security-action-button"
                  ]
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

                <ChevronIcon />
              </button>
            </div>
          </div>

          <div
            className={
              styles["security-row-divider"]
            }
          />

          {/* ACTIVE SESSIONS */}

          <div
            className={
              styles["security-setting-row"]
            }
          >
            <div
              className={`${styles["security-icon-box"]} ${styles["security-icon-purple"]}`}
            >
              <MonitorIcon />
            </div>

            <div
              className={
                styles[
                  "security-setting-content"
                ]
              }
            >
              <h2>Active Sessions</h2>

              <p>
                View and manage devices
                currently signed in to your
                account.
              </p>
            </div>

            <button
              type="button"
              className={
                styles[
                  "security-action-button"
                ]
              }
              onClick={() =>
                navigateTo(
                  "/active-sessions"
                )
              }
            >
              <span>View Sessions</span>
              <ChevronIcon />
            </button>
          </div>
        </section>

        {/* =================================================
            ACCOUNT SECURITY
        ================================================= */}

        <section
          className={
            styles["security-card"]
          }
        >
          <div
            className={
              styles["security-section-label"]
            }
          >
            ACCOUNT SECURITY
          </div>

          {/* EMAIL */}

          <div
            className={
              styles["security-setting-row"]
            }
          >
            <div
              className={`${styles["security-icon-box"]} ${styles["security-icon-green"]}`}
            >
              <MailIcon />
            </div>

            <div
              className={
                styles[
                  "security-setting-content"
                ]
              }
            >
              <h2>
                Email Verification
              </h2>

              <p>
                {user.email ||
                  "No email address found."}
              </p>
            </div>

            <div
              className={
                user.emailVerified
                  ? `${styles["security-status"]} ${styles["security-status-enabled"]}`
                  : `${styles["security-status"]} ${styles["security-status-warning"]}`
              }
            >
              <StatusIcon
                enabled={
                  user.emailVerified
                }
              />

              <span>
                {user.emailVerified
                  ? "Verified"
                  : "Not verified"}
              </span>
            </div>
          </div>

          <div
            className={
              styles["security-row-divider"]
            }
          />

          {/* PHONE */}

          <div
            className={
              styles["security-setting-row"]
            }
          >
            <div
              className={`${styles["security-icon-box"]} ${styles["security-icon-yellow"]}`}
            >
              <PhoneIcon />
            </div>

            <div
              className={
                styles[
                  "security-setting-content"
                ]
              }
            >
              <h2>Phone Number</h2>

              <p>
                {user.phone
                  ? user.phone
                  : "No phone number has been added to your account."}
              </p>
            </div>

            <div
              className={
                user.phoneVerified
                  ? `${styles["security-status"]} ${styles["security-status-enabled"]}`
                  : `${styles["security-status"]} ${styles["security-status-warning"]}`
              }
            >
              <StatusIcon
                enabled={
                  user.phoneVerified
                }
              />

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
                styles[
                  "security-action-button"
                ]
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

              <ChevronIcon />
            </button>
          </div>
        </section>

        {/* =================================================
            SECURITY NOTICE
        ================================================= */}

        <section
          className={
            styles["security-notice"]
          }
        >
          <div
            className={
              styles[
                "security-notice-icon"
              ]
            }
          >
            <SecurityNoticeIcon />
          </div>

          <div
            className={
              styles[
                "security-notice-content"
              ]
            }
          >
            <h3>
              Your security is important to us
            </h3>

            <p>
              We use industry-standard
              encryption to protect your data
              and keep your account secure.
            </p>
          </div>

          <div
            className={
              styles[
                "security-notice-watermark"
              ]
            }
            aria-hidden="true"
          >
            <ShieldIcon />
          </div>
        </section>
      </section>

      {/* ===================================================
          MOBILE BOTTOM NAV
      =================================================== */}

      <BottomNavigation />
    </main>
  );
}