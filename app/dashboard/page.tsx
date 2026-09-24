"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../lib/supabase";
import AppShell from "../AppShell/AppShell";
import LoadingScreen from "../AppShell/LoadingScreen";

import styles from "./dashboard.module.css";

type DashboardUser = {
  fullName: string;
  firstName: string;
  email: string;
  initial: string;
  plan: string;
};

type IconName =
  | "calendar"
  | "check"
  | "clock"
  | "warning"
  | "document"
  | "shield"
  | "crown"
  | "arrow";

function Icon({ name }: { name: IconName }) {
  const icons: Record<IconName, string> = {
    calendar: "▣",
    check: "✓",
    clock: "◷",
    warning: "!",
    document: "▤",
    shield: "◇",
    crown: "♛",
    arrow: "→",
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

  const [currentDate, setCurrentDate] =
    useState<Date | null>(null);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    setCurrentDate(new Date());

    const timeInterval = window.setInterval(() => {
      setCurrentDate(new Date());
    }, 60 * 1000);

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
              .replace(/[.\_-]+/g, " ")
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
      window.clearInterval(timeInterval);
    };
  }, [router]);

  const planName =
    user.plan || "Free Plan";

  const planLabel =
    getPlanLabel(planName);

  const isFree =
    planName
      .toLowerCase()
      .includes("free");

  const isPaid =
    !isFree;

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
   * TIME-BASED DASHBOARD GREETING
   * =========================================================
   *
   * Before 12:00 PM  -> Good morning
   * 12:00 PM–5:59 PM -> Good afternoon
   * 6:00 PM onward    -> Good evening
   *
   * The current time is refreshed every 60 seconds
   * so the greeting automatically changes while the
   * Dashboard remains open.
   *
   * Falls back to "Hello" while currentDate
   * has not yet been initialized.
   */

  const greeting = currentDate
    ? currentDate.getHours() < 12
      ? "Good morning"
      : currentDate.getHours() < 18
        ? "Good afternoon"
        : "Good evening"
    : "Hello";

  /*
   * =========================================================
   * SHARED DASHBOARD LOADING SCREEN
   * =========================================================
   *
   * Uses the same shared LoadingScreen component
   * used by the other AppShell pages.
   */

  if (loadingUser) {
    return <LoadingScreen />;
  }

  /*
   * =========================================================
   * SHARED APP SHELL
   * =========================================================
   *
   * AppShell now provides:
   *
   * Desktop:
   * - Sidebar
   * - Top header
   * - Account section
   * - Settings
   * - Support
   * - User/profile area
   *
   * Mobile:
   * - Mobile header
   * - Mobile menu
   * - Bottom navigation
   *
   * The Dashboard content below remains unchanged.
   */

  return (
    <AppShell activePath="/dashboard">
      {/* ==================================================
          DESKTOP CONTENT
      ================================================== */}

      <section className={styles.content}>
        <div
          className={
            styles.mainContent
          }
        >
          {/* ==================================================
              DESKTOP WELCOME
          ================================================== */}

          <section
            className={
              styles.welcomeSection
            }
          >
            <div>
              <h2>
                {greeting},{" "}
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
                  navigateTo(
                    "/verify/property-details"
                  )
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
            {/* ==================================================
                FRAUD WATCH
            ================================================== */}

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
                PLAN CARD
            ================================================== */}

            <div
              className={`${styles.dashboardCard} ${
                styles.planCard
              } ${
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
                  You’re on{" "}
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
                  navigateTo(
                    "/verify/property-details"
                  )
                }
              >
                + Verify Property
              </button>
            </div>
          </section>
        </div>
      </section>

      {/* ==================================================
          MOBILE DASHBOARD CONTENT
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
              {greeting},{" "}
              {user.firstName} 👋
            </h1>
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
                navigateTo(
                  "/verify/property-details"
                )
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
              You’re on{" "}
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
                navigateTo(
                  "/verify/property-details"
                )
              }
            >
              + Verify Property
            </button>
          </div>
        </section>
      </section>
    </AppShell>
  );
}