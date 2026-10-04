"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./active-sessions.module.css";
import { supabase } from "../lib/supabase";
import AppShell from "../AppShell/AppShell";
import LoadingScreen from "../AppShell/LoadingScreen";

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
    router.push(path);
  };

  /*
  ============================================================
  BACK TO SECURITY & PRIVACY
  ============================================================
  */

  const goBackToSecurity = () => {
    router.push("/settings/security");
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
  SHARED LOADING SCREEN
  ============================================================
  */

  if (loading) {
    return <LoadingScreen />;
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <AppShell
      activePath="/account"
      headerPath="/account"
    >
      <main className={styles.page}>
        <div className={styles.content}>

          {/* =================================================
              PAGE INTRO
          ================================================= */}

          <div className={styles.pageIntro}>
            <h1>
              Active Sessions
            </h1>

            <p>
              View and manage devices that
              are currently signed in to
              your account.
            </p>

            {/* =================================================
                BACK TO SECURITY & PRIVACY
            ================================================= */}

            <button
              type="button"
              className={styles.backButton}
              onClick={goBackToSecurity}
            >
              <span
                className={styles.backArrow}
                aria-hidden="true"
              >
                ←
              </span>

              <span>
                Back to Security &amp; Privacy
              </span>
            </button>
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

                  <span
                    className={
                      styles.dotSeparator
                    }
                  >
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
      </main>
    </AppShell>
  );
}