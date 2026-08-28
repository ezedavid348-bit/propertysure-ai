"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

/*
 * ============================================================
 * FRAUD WATCH
 * ============================================================
 *
 * PURPOSE
 *
 * Fraud Watch is the monitoring area of PropertySure AI.
 *
 * Its job is to show the user:
 *
 * 1. Active fraud alerts
 * 2. Properties currently being monitored
 * 3. Watchlist/risk matches
 * 4. Recently cleared alerts
 * 5. What caused an alert
 * 6. The current status of an alert
 *
 *
 * IMPORTANT
 * ============================================================
 *
 * The old version of this page contained hardcoded demo data:
 *
 * - Lekki Phase 1 Property
 * - Victoria Island Property
 * - Ikoyi Residential Plot
 * - Ajah Land Parcel
 * - Surulere Building
 * - 12 High Risk Alerts
 * - 24 Properties Monitored
 * - 7 Watchlist Matches
 * - 18 Cleared Alerts
 * - May 2024 dates
 *
 * Those values MUST NOT be treated as real production data.
 *
 * The page below is structured so that the alert information
 * can come from Supabase.
 *
 * ============================================================
 */


/*
 * ============================================================
 * CONFIGURATION
 * ============================================================
 */

/*
 * IMPORTANT:
 *
 * This is the table we expect to use for Fraud Watch alerts.
 *
 * If your actual Supabase table has another name, change this
 * single constant.
 *
 * I am intentionally not assuming the exact database schema
 * beyond this point.
 */
const FRAUD_ALERTS_TABLE = "fraud_alerts";


/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type FraudRisk =
  | "High"
  | "Medium"
  | "Low";

type FraudStatus =
  | "Active"
  | "Under Review"
  | "Cleared";

type FraudAlert = {
  id: string;

  title: string;

  propertyName: string;

  location: string;

  type: string;

  risk: FraudRisk;

  status: FraudStatus;

  detectedAt: string | null;

  description?: string;

  propertyId?: string | null;
};


type DashboardUser = {
  fullName: string;
  firstName: string;
  email: string;
  initial: string;
  plan: string;
};


type NavItem = {
  icon: string;
  label: string;
  path: string;
};


/*
 * ============================================================
 * NAVIGATION
 * ============================================================
 *
 * This is intentionally kept consistent with DashboardPage.
 */

const navItems: NavItem[] = [
  {
    icon: "▦",
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: "⇧",
    label: "Verify Property",
    path: "/verify",
  },
  {
    icon: "⌂",
    label: "My Properties",
    path: "/my-properties",
  },
  {
    icon: "◷",
    label: "Verification History",
    path: "/verification-history",
  },
  {
    icon: "◈",
    label: "Fraud Watch",
    path: "/fraud-watch",
  },
  {
    icon: "▤",
    label: "Reports",
    path: "/reports",
  },
];


/*
 * ============================================================
 * HELPER FUNCTIONS
 * ============================================================
 */

function getRiskIcon(risk: FraudRisk) {
  if (risk === "High") {
    return "!";
  }

  if (risk === "Medium") {
    return "▤";
  }

  return "✓";
}


function formatDetectedDate(
  value: string | null
) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


function formatDetectedTime(
  value: string | null
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}


/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default function FraudWatchPage() {

  const router = useRouter();


  /*
   * ==========================================================
   * UI STATE
   * ==========================================================
   */

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [loadingAlerts, setLoadingAlerts] =
    useState(true);

  const [alerts, setAlerts] =
    useState<FraudAlert[]>([]);

  const [search, setSearch] =
    useState("");

  const [riskFilter, setRiskFilter] =
    useState<"All" | FraudRisk>("All");

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | FraudStatus
    >("All");

  const [errorMessage, setErrorMessage] =
    useState("");


  /*
   * ==========================================================
   * USER
   * ==========================================================
   *
   * This follows the Dashboard authentication pattern.
   */

  const [user, setUser] =
    useState<DashboardUser>({
      fullName: "User",
      firstName: "User",
      email: "",
      initial: "U",
      plan: "Free Plan",
    });


  /*
   * ==========================================================
   * BRAND
   * ==========================================================
   *
   * Same PropertySure AI brand color used by Dashboard.
   */

  const BRAND_BLUE = "#168eff";


  /*
   * ==========================================================
   * LOAD USER
   * ==========================================================
   */

  useEffect(() => {

    let mounted = true;


    const loadUser = async () => {

      try {

        setLoadingUser(true);


        const {
          data: {
            user: authUser,
          },
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

          router.replace(
            "/signin"
          );

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


        const fallbackName =
          email
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
          String(
            metadataName
          ).trim() ||
          fallbackName;


        const firstName =
          fullName
            .trim()
            .split(/\s+/)[0] ||
          "User";


        const initial =
          firstName
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
          firstName,
          email,
          initial,
          plan: String(
            metadataPlan
          ),
        });

      } catch (error) {

        console.error(
          "Fraud Watch user loading error:",
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
   * ==========================================================
   * LOAD FRAUD ALERTS
   * ==========================================================
   *
   * IMPORTANT
   *
   * This is the database connection point.
   *
   * The exact select statement may need to be adjusted once
   * we confirm your real fraud_alerts table columns.
   *
   * The page will NOT display fake alerts if the database
   * returns no records.
   */

  useEffect(() => {

    let mounted = true;


    const loadAlerts = async () => {

      try {

        setLoadingAlerts(true);

        setErrorMessage("");


        const {
          data: {
            user: authUser,
          },
          error: authError,
        } =
          await supabase.auth.getUser();


        if (authError) {

          console.error(
            "Fraud Watch authentication error:",
            authError
          );

          return;
        }


        if (!authUser) {
          return;
        }


        /*
         * ======================================================
         * DATABASE QUERY
         * ======================================================
         *
         * IMPORTANT:
         *
         * We are intentionally selecting the fields using
         * aliases that map into the UI model.
         *
         * If your table uses different column names, this is
         * the ONE area we should update after checking the
         * actual Supabase schema.
         */

        const {
          data,
          error,
        } =
          await supabase
            .from(
              FRAUD_ALERTS_TABLE
            )
            .select(
              `
                id,
                title,
                property_name,
                location,
                type,
                risk,
                status,
                detected_at,
                description,
                property_id
              `
            )
            .eq(
              "user_id",
              authUser.id
            )
            .order(
              "detected_at",
              {
                ascending: false,
              }
            );


        if (error) {

          /*
           * During development, the table may not exist yet.
           *
           * We therefore don't crash the page.
           */

          console.error(
            "Fraud Watch alert loading error:",
            error
          );


          if (mounted) {

            setAlerts([]);

            setErrorMessage(
              "Fraud monitoring data is not available yet."
            );

          }

          return;
        }


        if (!mounted) {
          return;
        }


        /*
         * ======================================================
         * NORMALIZE DATABASE DATA
         * ======================================================
         */

        const normalizedAlerts: FraudAlert[] =
          (data || []).map(
            (item: any) => {

              const risk =
                String(
                  item.risk || "Low"
                );


              const status =
                String(
                  item.status || "Active"
                );


              return {

                id:
                  String(
                    item.id
                  ),

                title:
                  String(
                    item.title ||
                    "Fraud Alert"
                  ),

                propertyName:
                  String(
                    item.property_name ||
                    "Property"
                  ),

                location:
                  String(
                    item.location ||
                    "Location unavailable"
                  ),

                type:
                  String(
                    item.type ||
                    "Risk Alert"
                  ),

                risk:
                  risk === "High" ||
                  risk === "Medium"
                    ? risk
                    : "Low",

                status:
                  status ===
                    "Under Review"
                    ? "Under Review"
                    : status ===
                      "Cleared"
                      ? "Cleared"
                      : "Active",

                detectedAt:
                  item.detected_at ||
                  null,

                description:
                  item.description ||
                  "",

                propertyId:
                  item.property_id ||
                  null,

              };

            }
          );


        setAlerts(
          normalizedAlerts
        );

      } catch (error) {

        console.error(
          "Fraud Watch loading error:",
          error
        );

        if (mounted) {

          setAlerts([]);

          setErrorMessage(
            "Unable to load fraud monitoring data."
          );

        }

      } finally {

        if (mounted) {
          setLoadingAlerts(false);
        }

      }

    };


    loadAlerts();


    return () => {
      mounted = false;
    };

  }, []);


  /*
   * ==========================================================
   * NAVIGATION
   * ==========================================================
   */

  const navigateTo = (
    path: string
  ) => {

    setMenuOpen(false);

    router.push(path);

  };


  /*
   * ==========================================================
   * SIGN OUT
   * ==========================================================
   */

  const handleSignOut =
    async () => {

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
   * ==========================================================
   * PLAN
   * ==========================================================
   */

  const planName =
    user.plan ||
    "Free Plan";


  const isPremium =
    planName
      .toLowerCase()
      .includes(
        "premium"
      );


  /*
   * ==========================================================
   * DYNAMIC FRAUD STATISTICS
   * ==========================================================
   *
   * These are calculated from the loaded alert data.
   *
   * They are NOT hardcoded.
   */

  const highRiskAlerts =
    useMemo(
      () =>
        alerts.filter(
          (alert) =>
            alert.risk ===
            "High" &&
            alert.status !==
            "Cleared"
        ).length,
      [alerts]
    );


  const watchlistMatches =
    useMemo(
      () =>
        alerts.filter(
          (alert) =>
            alert.type
              .toLowerCase()
              .includes(
                "watchlist"
              )
        ).length,
      [alerts]
    );


  const clearedAlerts =
    useMemo(
      () =>
        alerts.filter(
          (alert) =>
            alert.status ===
            "Cleared"
        ).length,
      [alerts]
    );


  /*
   * ==========================================================
   * MONITORED PROPERTIES
   * ==========================================================
   *
   * IMPORTANT:
   *
   * This is currently derived from the distinct property IDs
   * appearing in Fraud Watch records.
   *
   * Once we connect the actual user's properties/monitoring
   * table, this should be replaced with the true monitored
   * property count.
   */

  const monitoredProperties =
    useMemo(() => {

      const ids =
        alerts
          .map(
            (alert) =>
              alert.propertyId
          )
          .filter(Boolean);


      return new Set(
        ids
      ).size;

    }, [alerts]);


  /*
   * ==========================================================
   * FILTER ALERTS
   * ==========================================================
   */

  const filteredAlerts =
    useMemo(() => {

      const searchValue =
        search
          .trim()
          .toLowerCase();


      return alerts.filter(
        (alert) => {

          const matchesSearch =
            !searchValue ||
            alert.title
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            alert.propertyName
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            alert.location
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            alert.type
              .toLowerCase()
              .includes(
                searchValue
              );


          const matchesRisk =
            riskFilter ===
              "All" ||
            alert.risk ===
              riskFilter;


          const matchesStatus =
            statusFilter ===
              "All" ||
            alert.status ===
              statusFilter;


          return (
            matchesSearch &&
            matchesRisk &&
            matchesStatus
          );

        }
      );

    }, [
      alerts,
      search,
      riskFilter,
      statusFilter,
    ]);


  /*
   * ==========================================================
   * LOADING STATE
   * ==========================================================
   */

  if (loadingUser) {

    return (

      <main className="dashboardLoading">

        <div className="loadingBrand">

          <div className="loadingLogo">
            ◆
          </div>

          <div className="loadingTitle">
            PropertySure
            <strong> AI</strong>
          </div>

        </div>

        <div className="loadingText">
          Loading Fraud Watch...
        </div>


        <style jsx>{`

          .dashboardLoading {
            min-height: 100vh;

            background:
              radial-gradient(
                circle at 70% 0%,
                rgba(
                  0,
                  123,
                  255,
                  0.18
                ),
                transparent 30%
              ),
              #06152f;

            color: #ffffff;

            font-family:
              Inter,
              Arial,
              Helvetica,
              sans-serif;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            gap: 10px;
          }

          .loadingBrand {
            display: flex;

            align-items: center;

            gap: 8px;
          }

          .loadingLogo {
            color: #168eff;

            font-size: 42px;

            line-height: 1;
          }

          .loadingTitle {
            font-size: 22px;

            font-weight: 700;
          }

          .loadingTitle strong {
            color: #168eff;
          }

          .loadingText {
            color: #8ea4c3;

            font-size: 14px;
          }

        `}</style>

      </main>

    );

  }


  /*
   * ==========================================================
   * MAIN PAGE
   * ==========================================================
   */

  return (

    <main className="dashboard">


      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <header className="mobileHeader">

        <button
          className="menuButton"
          onClick={() =>
            setMenuOpen(
              !menuOpen
            )
          }
          aria-label="Open navigation"
        >
          ☰
        </button>


        <button
          className="mobileLogoButton"
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >

          <span className="mobileLogoDiamond">
            ◆
          </span>

          <span className="mobileBrandName">

            PropertySure
            <strong>
              {" "}AI
            </strong>

          </span>

        </button>


        <button
          className="mobileBell"
          onClick={() =>
            navigateTo(
              "/account/notifications"
            )
          }
          aria-label="Notifications"
        >

          <span className="bellIcon">
            🔔
          </span>

          <span className="mobileNotificationDot" />

        </button>

      </header>


      {/* ======================================================
          MOBILE MENU
      ====================================================== */}

      {menuOpen && (

        <div className="mobileMenu">

          <div className="mobileMenuHeader">

            <div>

              <div className="mobileMenuLogo">

                <span>
                  ◆
                </span>

                <div>
                  PropertySure
                  <strong>
                    {" "}AI
                  </strong>
                </div>

              </div>


              <div className="mobileMenuSubtitle">
                AI-Powered Property Due Diligence
              </div>

            </div>


            <button
              className="closeMenu"
              onClick={() =>
                setMenuOpen(
                  false
                )
              }
              aria-label="Close navigation"
            >
              ×
            </button>

          </div>


          <nav className="mobileMenuNav">

            {navItems.map(
              (item) => (

                <button
                  key={item.label}
                  className={`mobileNavItem ${
                    item.path ===
                    "/fraud-watch"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    navigateTo(
                      item.path
                    )
                  }
                >

                  <span className="navIcon">
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>

                </button>

              )
            )}

          </nav>


          <div className="mobileAccountLabel">
            ACCOUNT
          </div>


          <button
            className="mobileNavItem"
            onClick={() =>
              navigateTo(
                "/account"
              )
            }
          >

            <span className="navIcon">
              ◯
            </span>

            Account

          </button>


          <button
            className="mobileNavItem"
            onClick={() =>
              navigateTo(
                "/settings"
              )
            }
          >

            <span className="navIcon">
              ⚙
            </span>

            Settings

          </button>


          <button
            className="mobileNavItem logoutItem"
            onClick={
              handleSignOut
            }
          >

            <span className="navIcon">
              ↪
            </span>

            Sign Out

          </button>

        </div>

      )}


      {/* ======================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside className="sidebar">

        <button
          className="brandButton"
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >

          <div className="brandName">

            <span className="brandLogoDiamond">
              ◆
            </span>

            <span>
              PropertySure
              <strong>
                {" "}AI
              </strong>
            </span>

          </div>


          <div className="brandSubtitle">
            AI-Powered Property
            <br />
            Due Diligence
          </div>

        </button>


        <nav className="sidebarNav">

          {navItems.map(
            (item) => (

              <button
                key={item.label}
                className={`navItem ${
                  item.path ===
                  "/fraud-watch"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  navigateTo(
                    item.path
                  )
                }
              >

                <span className="navIcon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>

              </button>

            )
          )}

        </nav>


        <div className="accountLabel">
          ACCOUNT
        </div>


        <button
          className="navItem"
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >

          <span className="navIcon">
            ◯
          </span>

          Account

        </button>


        <button
          className="navItem"
          onClick={() =>
            navigateTo(
              "/settings"
            )
          }
        >

          <span className="navIcon">
            ⚙
          </span>

          Settings

        </button>


        {/* ====================================================
            SUPPORT
        ===================================================== */}

        <div className="helpBox">

          <div className="helpTitle">
            Need Help?
          </div>

          <div className="helpText">
            Our support team is ready to assist you.
          </div>

          <button
            className="supportButton"
            onClick={() =>
              navigateTo(
                "/account"
              )
            }
          >
            Contact Support
          </button>

        </div>


        {/* ====================================================
            USER
        ===================================================== */}

        <button
          className="sidebarUser"
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >

          <div className="avatar">
            {user.initial}
          </div>


          <div>

            <div className="userName">
              {user.fullName}
            </div>

            <div className="userPlan">
              {isPremium
                ? "♛ Premium Plan"
                : planName}
            </div>

          </div>

        </button>

      </aside>


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="content">


        {/* ====================================================
            DESKTOP TOP BAR
        ===================================================== */}

        <header className="topBar">

          <div>

            <div className="eyebrow">
              PROPERTYSURE AI
            </div>


            <h1>
              Fraud Watch
            </h1>


            <p>
              Monitor your properties for suspicious activity
              and potential fraud risks.
            </p>

          </div>


          <div className="topActions">

            <button
              className="notification"
              onClick={() =>
                navigateTo(
                  "/account/notifications"
                )
              }
              aria-label="Notifications"
            >

              <span className="bellIcon">
                🔔
              </span>

              <span className="notificationDot" />

            </button>


            <button
              className="profile"
              onClick={() =>
                navigateTo(
                  "/account"
                )
              }
            >

              <div className="avatar large">
                {user.initial}
              </div>


              <div>

                <div className="userName">
                  {user.fullName}
                </div>

                <div className="userPlan">
                  {planName}
                </div>

              </div>


              <span className="chevron">
                ⌄
              </span>

            </button>

          </div>

        </header>


        {/* ====================================================
            MOBILE WELCOME
        ===================================================== */}

        <div className="mobileWelcome">

          <div className="eyebrow">
            PROPERTYSURE AI
          </div>


          <h1>
            Fraud Watch
          </h1>


          <p>
            Monitor your properties for suspicious activity
            and potential fraud risks.
          </p>

        </div>


        {/* ====================================================
            SUMMARY
        ===================================================== */}

        <section className="summaryGrid">


          {/* ACTIVE ALERTS */}

          <div className="summaryCard">

            <div className="summaryIcon red">
              !
            </div>


            <div>

              <div className="summaryLabel">
                Active Alerts
              </div>

              <div className="summaryNumber">
                {loadingAlerts
                  ? "—"
                  : alerts.filter(
                      (alert) =>
                        alert.status !==
                        "Cleared"
                    ).length}
              </div>

              <div
                className={
                  highRiskAlerts > 0
                    ? "summaryWarning"
                    : "summaryLink"
                }
              >
                {highRiskAlerts > 0
                  ? `${highRiskAlerts} high-risk`
                  : "No high-risk alerts"}
              </div>

            </div>

          </div>


          {/* MONITORED PROPERTIES */}

          <div className="summaryCard">

            <div className="summaryIcon blue">
              ⌂
            </div>


            <div>

              <div className="summaryLabel">
                Properties Monitored
              </div>

              <div className="summaryNumber">
                {loadingAlerts
                  ? "—"
                  : monitoredProperties}
              </div>

              <div className="summaryLink">
                Currently monitored
              </div>

            </div>

          </div>


          {/* WATCHLIST */}

          <div className="summaryCard">

            <div className="summaryIcon yellow">
              ◇
            </div>


            <div>

              <div className="summaryLabel">
                Watchlist Matches
              </div>

              <div className="summaryNumber">
                {loadingAlerts
                  ? "—"
                  : watchlistMatches}
              </div>

              <div className="summaryLink">
                Matches detected
              </div>

            </div>

          </div>


          {/* CLEARED */}

          <div className="summaryCard">

            <div className="summaryIcon green">
              ✓
            </div>


            <div>

              <div className="summaryLabel">
                Cleared Alerts
              </div>

              <div className="summaryNumber">
                {loadingAlerts
                  ? "—"
                  : clearedAlerts}
              </div>

              <div className="summaryLink">
                Successfully resolved
              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            SEARCH + FILTER
        ===================================================== */}

        <section className="filterBar">

          <div className="searchInput">

            <span>
              ⌕
            </span>


            <input
              type="text"
              value={search}
              onChange={(
                event: ChangeEvent<HTMLInputElement>
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search alerts, properties or locations..."
              aria-label="Search fraud alerts"
            />

          </div>


          <select
            className="filterSelect"
            value={riskFilter}
            onChange={(event) =>
              setRiskFilter(
                event.target.value as
                  | "All"
                  | FraudRisk
              )
            }
            aria-label="Filter by risk"
          >

            <option value="All">
              All Risk Levels
            </option>

            <option value="High">
              High Risk
            </option>

            <option value="Medium">
              Medium Risk
            </option>

            <option value="Low">
              Low Risk
            </option>

          </select>


          <select
            className="filterSelect"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "All"
                  | FraudStatus
              )
            }
            aria-label="Filter by status"
          >

            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Under Review">
              Under Review
            </option>

            <option value="Cleared">
              Cleared
            </option>

          </select>

        </section>


        {/* ====================================================
            ERROR / DATABASE NOTICE
        ===================================================== */}

        {errorMessage && (

          <div className="dataNotice">

            <span>
              ◇
            </span>

            <div>

              <strong>
                Fraud monitoring data
              </strong>

              <p>
                {errorMessage}
              </p>

            </div>

          </div>

        )}


        {/* ====================================================
            RECENT ALERTS
        ===================================================== */}

        <section className="alertsPanel">


          <div className="panelHeader">

            <div>

              <h2>
                Recent Fraud Alerts
              </h2>

              <p>
                Review suspicious activity detected across
                your monitored properties.
              </p>

            </div>


            <button
              className="viewAllButton"
              onClick={() => {
                setSearch("");
                setRiskFilter("All");
                setStatusFilter("All");
              }}
            >
              Clear Filters
              <span>
                ↻
              </span>
            </button>

          </div>


          {/* ==================================================
              LOADING
          =================================================== */}

          {loadingAlerts && (

            <div className="alertEmpty">

              <div className="emptyIcon loadingIcon">
                ◌
              </div>

              <div>

                <h3>
                  Checking for alerts...
                </h3>

                <p>
                  PropertySure AI is loading your fraud
                  monitoring data.
                </p>

              </div>

            </div>

          )}


          {/* ==================================================
              EMPTY STATE
          =================================================== */}

          {!loadingAlerts &&
            filteredAlerts.length === 0 && (

              <div className="alertEmpty">

                <div className="emptyIcon">
                  ✓
                </div>


                <div>

                  <h3>
                    {alerts.length === 0
                      ? "No fraud alerts"
                      : "No matching alerts"}
                  </h3>


                  <p>
                    {alerts.length === 0
                      ? "There are currently no fraud alerts associated with your monitored properties."
                      : "Try changing your search or filters to see other alerts."}
                  </p>

                </div>

              </div>

            )}


          {/* ==================================================
              DESKTOP ALERT LIST
          =================================================== */}

          {!loadingAlerts &&
            filteredAlerts.length > 0 && (

              <div className="desktopAlertList">

                <div className="alertHeader">

                  <span>
                    Alert
                  </span>

                  <span>
                    Risk
                  </span>

                  <span>
                    Detected
                  </span>

                  <span>
                    Status
                  </span>

                  <span />

                </div>


                {filteredAlerts.map(
                  (alert) => (

                    <div
                      className="alertRow"
                      key={alert.id}
                    >

                      <div className="alertProperty">

                        <div
                          className={`alertIcon ${
                            alert.risk.toLowerCase()
                          }`}
                        >
                          {getRiskIcon(
                            alert.risk
                          )}
                        </div>


                        <div>

                          <strong>
                            {alert.title}
                          </strong>

                          <span>
                            {alert.propertyName}
                          </span>

                          <small>
                            {alert.location}
                          </small>

                        </div>

                      </div>


                      <div>

                        <span
                          className={`riskPill ${
                            alert.risk.toLowerCase()
                          }`}
                        >
                          {alert.risk}
                        </span>

                      </div>


                      <div className="detected">

                        <strong>
                          {formatDetectedDate(
                            alert.detectedAt
                          )}
                        </strong>

                        <span>
                          {formatDetectedTime(
                            alert.detectedAt
                          )}
                        </span>

                      </div>


                      <div>

                        <span
                          className={`statusPill ${
                            alert.status
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )
                          }`}
                        >
                          {alert.status}
                        </span>

                      </div>


                      <button
                        className="detailsButton"
                        type="button"
                        onClick={() =>
                          router.push(
                            `/fraud-watch/${alert.id}`
                          )
                        }
                      >
                        View
                        <span>
                          →
                        </span>
                      </button>

                    </div>

                  )
                )}

              </div>

            )}


          {/* ==================================================
              MOBILE ALERT LIST
          =================================================== */}

          {!loadingAlerts &&
            filteredAlerts.length > 0 && (

              <div className="mobileAlertList">

                {filteredAlerts.map(
                  (alert) => (

                    <button
                      type="button"
                      className="mobileAlertRow"
                      key={alert.id}
                      onClick={() =>
                        router.push(
                          `/fraud-watch/${alert.id}`
                        )
                      }
                    >

                      <div
                        className={`mobileAlertIcon ${
                          alert.risk.toLowerCase()
                        }`}
                      >
                        {getRiskIcon(
                          alert.risk
                        )}
                      </div>


                      <div className="mobileAlertInfo">

                        <strong>
                          {alert.title}
                        </strong>

                        <span>
                          {alert.propertyName}
                        </span>


                        <div className="mobileAlertMeta">

                          <span
                            className={`riskPill ${
                              alert.risk.toLowerCase()
                            }`}
                          >
                            {alert.risk}
                          </span>


                          <span>
                            {formatDetectedDate(
                              alert.detectedAt
                            )}
                          </span>

                        </div>

                      </div>


                      <span className="mobileArrow">
                        ›
                      </span>

                    </button>

                  )
                )}

              </div>

            )}

        </section>


        {/* ====================================================
            HOW FRAUD WATCH WORKS
        ===================================================== */}

        <section className="howItWorks">

          <div className="howHeader">

            <div className="howIcon">
              ✦
            </div>

            <div>

              <h2>
                How Fraud Watch works
              </h2>

              <p>
                PropertySure AI helps you identify potential
                property risks so you can investigate them before
                they become costly problems.
              </p>

            </div>

          </div>


          <div className="howSteps">

            <div className="howStep">

              <div className="stepIcon blue">
                1
              </div>

              <div>

                <strong>
                  Monitor
                </strong>

                <span>
                  Your verified properties are monitored
                  for relevant risk signals.
                </span>

              </div>

            </div>


            <div className="stepArrow">
              →
            </div>


            <div className="howStep">

              <div className="stepIcon purple">
                2
              </div>

              <div>

                <strong>
                  Detect
                </strong>

                <span>
                  Suspicious activity or matching risk signals
                  can generate an alert.
                </span>

              </div>

            </div>


            <div className="stepArrow">
              →
            </div>


            <div className="howStep">

              <div className="stepIcon orange">
                3
              </div>

              <div>

                <strong>
                  Review
                </strong>

                <span>
                  Review the alert and decide whether further
                  investigation is required.
                </span>

              </div>

            </div>

          </div>

        </section>

      </section>


      {/* ======================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}

      <nav className="bottomNav">

        <button
          className="bottomItem"
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >

          <span>
            ▦
          </span>

          <small>
            Dashboard
          </small>

        </button>


        <button
          className="bottomItem"
          onClick={() =>
            navigateTo(
              "/verify"
            )
          }
        >

          <span>
            ⇧
          </span>

          <small>
            Verify
          </small>

        </button>


        <button
          className="bottomItem"
          onClick={() =>
            navigateTo(
              "/my-properties"
            )
          }
        >

          <span>
            ⌂
          </span>

          <small>
            Properties
          </small>

        </button>


        <button
          className="bottomItem active"
          onClick={() =>
            navigateTo(
              "/fraud-watch"
            )
          }
        >

          <span>
            ◈
          </span>

          <small>
            Fraud Watch
          </small>

        </button>


        <button
          className="bottomItem"
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >

          <span>
            ◯
          </span>

          <small>
            Account
          </small>

        </button>

      </nav>


      {/* ======================================================
          RESPONSIVE CSS
      ====================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }


        .dashboard {
          min-height: 100vh;

          background:
            radial-gradient(
              circle at 70% 0%,
              rgba(
                0,
                123,
                255,
                0.18
              ),
              transparent 30%
            ),
            #06152f;

          color: #ffffff;

          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;

          display: flex;
        }


        button,
        input,
        select {
          font-family: inherit;
        }


        button {
          -webkit-tap-highlight-color: transparent;
        }


        /* ======================================================
           SIDEBAR
        ====================================================== */

        .sidebar {
          width: 245px;

          min-width: 245px;

          min-height: 100vh;

          padding:
            28px 20px;

          background:
            rgba(
              4,
              20,
              47,
              0.96
            );

          border-right:
            1px solid
            rgba(
              83,
              157,
              255,
              0.18
            );

          display: flex;

          flex-direction: column;
        }


        .brandButton {
          border: none;

          background: transparent;

          color: white;

          padding: 0;

          text-align: left;

          cursor: pointer;
        }


        .brandName {
          display: flex;

          align-items: center;

          gap: 7px;

          font-size: 22px;

          font-weight: 700;

          letter-spacing: -0.35px;

          white-space: nowrap;
        }


        .brandName strong {
          color: #168eff;
        }


        .brandLogoDiamond {
          color: #168eff;

          font-size: 25px;

          line-height: 1;
        }


        .brandSubtitle {
          margin-top: 10px;

          padding-left: 2px;

          color: #8ea4c3;

          font-size: 12px;

          line-height: 1.5;
        }


        .sidebarNav {
          margin-top: 28px;
        }


        .navItem {
          width: 100%;

          min-height: 48px;

          display: flex;

          align-items: center;

          gap: 14px;

          padding:
            0 14px;

          margin-bottom: 5px;

          border: none;

          border-radius: 10px;

          background: transparent;

          color: #aebed4;

          font-size: 14px;

          cursor: pointer;

          text-align: left;

          transition:
            background 0.2s,
            color 0.2s;
        }


        .navItem:hover {
          background:
            rgba(
              24,
              112,
              200,
              0.14
            );

          color: white;
        }


        .navItem.active {
          color: white;

          background:
            linear-gradient(
              90deg,
              #0879df,
              #1268b7
            );

          box-shadow:
            0 5px 20px
            rgba(
              0,
              120,
              255,
              0.2
            );
        }


        .navIcon {
          width: 20px;

          text-align: center;

          color: #82b9f2;

          flex-shrink: 0;
        }


        .accountLabel {
          color: #5f789a;

          font-size: 10px;

          letter-spacing: 1.5px;

          margin:
            28px 14px 10px;
        }


        /* ======================================================
           SUPPORT
        ====================================================== */

        .helpBox {
          margin-top: auto;

          padding: 16px;

          border:
            1px solid
            rgba(
              71,
              151,
              255,
              0.25
            );

          border-radius: 12px;

          background:
            rgba(
              16,
              88,
              170,
              0.08
            );
        }


        .helpTitle {
          font-size: 13px;

          font-weight: 600;

          margin-bottom: 7px;
        }


        .helpText {
          color: #849ab8;

          font-size: 11px;

          line-height: 1.5;
        }


        .supportButton {
          width: 100%;

          margin-top: 12px;

          padding: 9px;

          border-radius: 7px;

          border:
            1px solid
            #1678df;

          background: transparent;

          color: #7eb9f5;

          cursor: pointer;
        }


        /* ======================================================
           USER
        ====================================================== */

        .sidebarUser {
          width: 100%;

          display: flex;

          align-items: center;

          gap: 10px;

          margin-top: 20px;

          padding: 5px;

          border: none;

          background: transparent;

          color: white;

          text-align: left;

          cursor: pointer;
        }


        .avatar {
          width: 36px;

          height: 36px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #0879d8;

          display: flex;

          align-items: center;

          justify-content: center;

          font-weight: 700;
        }


        .avatar.large {
          width: 40px;

          height: 40px;
        }


        .userName {
          font-size: 13px;

          font-weight: 600;
        }


        .userPlan {
          color: #7f96b4;

          font-size: 11px;

          margin-top: 3px;
        }


        /* ======================================================
           CONTENT
        ====================================================== */

        .content {
          flex: 1;

          min-width: 0;

          padding:
            30px 34px 50px;

          overflow-x: hidden;
        }


        /* ======================================================
           TOP BAR
        ====================================================== */

        .topBar {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 25px;

          padding-bottom: 22px;

          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
        }


        .eyebrow {
          color: #7791b3;

          font-size: 11px;

          letter-spacing: 1.5px;

          margin-bottom: 8px;
        }


        .topBar h1,
        .mobileWelcome h1 {
          margin: 0;

          font-size:
            clamp(
              24px,
              3vw,
              32px
            );

          font-weight: 600;
        }


        .topBar p,
        .mobileWelcome p {
          color: #91a7c3;

          margin:
            8px 0 0;

          font-size: 13px;
        }


        .topActions {
          display: flex;

          align-items: center;

          gap: 20px;
        }


        /* ======================================================
           NOTIFICATION
        ====================================================== */

        .notification {
          width: 40px;

          height: 40px;

          border:
            1px solid
            rgba(
              60,
              143,
              232,
              0.35
            );

          border-radius: 50%;

          background: transparent;

          display: flex;

          align-items: center;

          justify-content: center;

          position: relative;

          cursor: pointer;

          padding: 0;
        }


        .bellIcon {
          font-size: 17px;

          line-height: 1;

          display: block;
        }


        .notificationDot {
          position: absolute;

          width: 8px;

          height: 8px;

          top: 5px;

          right: 3px;

          border-radius: 50%;

          background: #168eff;

          box-shadow:
            0 0 8px
            rgba(
              22,
              142,
              255,
              0.6
            );
        }


        .notification:hover {
          border-color:
            rgba(
              22,
              142,
              255,
              0.65
            );

          background:
            rgba(
              22,
              142,
              255,
              0.06
            );
        }


        .profile {
          display: flex;

          align-items: center;

          gap: 9px;

          border: none;

          background: transparent;

          color: white;

          cursor: pointer;

          text-align: left;
        }


        .chevron {
          color: #8aa0bb;

          margin-left: 4px;
        }


        /* ======================================================
           MOBILE WELCOME
        ====================================================== */

        .mobileHeader,
        .mobileMenu,
        .mobileWelcome,
        .bottomNav {
          display: none;
        }


        /* ======================================================
           FRAUD SUMMARY
        ====================================================== */

        .summaryGrid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap: 12px;

          margin-top: 20px;
        }


        .summaryCard {
          min-width: 0;

          padding: 18px;

          border-radius: 12px;

          border:
            1px solid
            rgba(
              76,
              149,
              235,
              0.23
            );

          background:
            rgba(
              7,
              33,
              68,
              0.78
            );

          display: flex;

          align-items: center;

          gap: 13px;
        }


        .summaryIcon {
          width: 40px;

          height: 40px;

          flex-shrink: 0;

          border-radius: 50%;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 18px;

          font-weight: 700;
        }


        .summaryIcon.red {
          background:
            rgba(
              240,
              50,
              65,
              0.2
            );

          color: #ff5261;
        }


        .summaryIcon.blue {
          background:
            rgba(
              35,
              135,
              255,
              0.2
            );

          color: #48a0ff;
        }


        .summaryIcon.yellow {
          background:
            rgba(
              255,
              190,
              30,
              0.18
            );

          color: #ffca3c;
        }


        .summaryIcon.green {
          background:
            rgba(
              30,
              190,
              125,
              0.2
            );

          color: #39d995;
        }


        .summaryLabel {
          color: #91a6c0;

          font-size: 11px;
        }


        .summaryNumber {
          font-size: 25px;

          font-weight: 600;

          margin:
            2px 0;
        }


        .summaryLink {
          color: #48b2ff;

          font-size: 10px;
        }


        .summaryWarning {
          color: #ff5965;

          font-size: 10px;
        }


        /* ======================================================
           FILTER BAR
        ====================================================== */

        .filterBar {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            160px
            160px;

          gap: 9px;

          margin-top: 14px;
        }


        .searchInput,
        .filterSelect {
          height: 42px;

          border:
            1px solid
            rgba(
              76,
              149,
              235,
              0.23
            );

          background:
            rgba(
              7,
              33,
              68,
              0.72
            );

          border-radius: 9px;

          color: #91a5bd;
        }


        .searchInput {
          display: flex;

          align-items: center;

          padding:
            0 13px;
        }


        .searchInput span {
          color: #6f88a5;

          font-size: 17px;
        }


        .searchInput input {
          width: 100%;

          min-width: 0;

          border: none;

          outline: none;

          background: transparent;

          color: white;

          font-size: 12px;

          margin-left: 8px;
        }


        .searchInput input::placeholder {
          color: #7189a5;
        }


        .filterSelect {
          width: 100%;

          padding:
            0 11px;

          outline: none;

          cursor: pointer;

          font-size: 11px;
        }


        .filterSelect option {
          background: #06152f;

          color: white;
        }


        /* ======================================================
           DATA NOTICE
        ====================================================== */

        .dataNotice {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-top: 12px;

          padding:
            13px 15px;

          border:
            1px solid
            rgba(
              255,
              170,
              40,
              0.22
            );

          border-radius: 10px;

          background:
            rgba(
              255,
              170,
              40,
              0.05
            );
        }


        .dataNotice > span {
          color: #ffb52e;

          font-size: 22px;
        }


        .dataNotice strong {
          display: block;

          font-size: 12px;
        }


        .dataNotice p {
          margin:
            3px 0 0;

          color: #8da2ba;

          font-size: 10px;
        }


        /* ======================================================
           ALERTS PANEL
        ====================================================== */

        .alertsPanel {
          margin-top: 14px;

          border:
            1px solid
            rgba(
              76,
              149,
              235,
              0.23
            );

          background:
            rgba(
              7,
              31,
              63,
              0.8
            );

          border-radius: 12px;

          overflow: hidden;
        }


        .panelHeader {
          display: flex;

          justify-content: space-between;

          align-items: center;

          padding:
            17px 18px;

          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );
        }


        .panelHeader h2 {
          margin: 0;

          font-size: 15px;
        }


        .panelHeader p {
          margin:
            5px 0 0;

          color: #8299b6;

          font-size: 11px;
        }


        .viewAllButton {
          border: none;

          background: transparent;

          color: #48aaff;

          font-size: 11px;

          cursor: pointer;
        }


        .viewAllButton span {
          margin-left: 5px;
        }


        /* ======================================================
           EMPTY STATE
        ====================================================== */

        .alertEmpty {
          min-height: 160px;

          padding:
            25px 20px;

          display: flex;

          align-items: center;

          gap: 16px;
        }


        .emptyIcon {
          width: 52px;

          height: 52px;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            rgba(
              30,
              190,
              125,
              0.16
            );

          color: #39d995;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 23px;

          font-weight: 700;
        }


        .loadingIcon {
          background:
            rgba(
              35,
              135,
              255,
              0.12
            );

          color: #48a0ff;
        }


        .alertEmpty h3 {
          margin:
            0 0 6px;

          font-size: 15px;
        }


        .alertEmpty p {
          margin: 0;

          color: #8299b6;

          font-size: 11px;

          line-height: 1.6;

          max-width: 500px;
        }


        /* ======================================================
           DESKTOP ALERT LIST
        ====================================================== */

        .mobileAlertList {
          display: none;
        }


        .alertHeader,
        .alertRow {
          display: grid;

          grid-template-columns:
            minmax(
              300px,
              2.2fr
            )
            0.7fr
            1fr
            0.9fr
            0.65fr;

          gap: 14px;

          align-items: center;
        }


        .alertHeader {
          min-height: 38px;

          padding:
            0 18px;

          color: #637a96;

          font-size: 9px;

          text-transform: uppercase;

          letter-spacing: 0.5px;

          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.05
            );
        }


        .alertRow {
          min-height: 78px;

          padding:
            9px 18px;

          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.05
            );
        }


        .alertRow:last-child {
          border-bottom: none;
        }


        .alertProperty {
          display: flex;

          align-items: center;

          gap: 11px;

          min-width: 0;
        }


        .alertIcon {
          width: 35px;

          height: 35px;

          flex-shrink: 0;

          border-radius: 50%;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 15px;

          font-weight: 700;
        }


        .alertIcon.high {
          background:
            rgba(
              255,
              77,
              77,
              0.12
            );

          color: #ff5965;
        }


        .alertIcon.medium {
          background:
            rgba(
              255,
              160,
              20,
              0.12
            );

          color: #ffad28;
        }


        .alertIcon.low {
          background:
            rgba(
              30,
              190,
              125,
              0.12
            );

          color: #39d995;
        }


        .alertProperty > div:last-child {
          min-width: 0;
        }


        .alertProperty strong {
          display: block;

          font-size: 11px;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }


        .alertProperty span {
          display: block;

          margin-top: 3px;

          color: #c0cede;

          font-size: 10px;
        }


        .alertProperty small {
          display: block;

          margin-top: 2px;

          color: #7188a4;

          font-size: 9px;
        }


        .riskPill,
        .statusPill {
          display: inline-flex;

          align-items: center;

          padding:
            5px 8px;

          border-radius: 6px;

          font-size: 9px;

          white-space: nowrap;
        }


        .riskPill.high {
          color: #ff6464;

          background:
            rgba(
              255,
              77,
              77,
              0.1
            );

          border:
            1px solid
            rgba(
              255,
              77,
              77,
              0.24
            );
        }


        .riskPill.medium {
          color: #ffab3b;

          background:
            rgba(
              255,
              149,
              31,
              0.1
            );

          border:
            1px solid
            rgba(
              255,
              149,
              31,
              0.24
            );
        }


        .riskPill.low {
          color: #39d995;

          background:
            rgba(
              40,
              229,
              143,
              0.1
            );

          border:
            1px solid
            rgba(
              40,
              229,
              143,
              0.24
            );
        }


        .statusPill.active {
          color: #ff6464;

          background:
            rgba(
              255,
              77,
              77,
              0.08
            );

          border:
            1px solid
            rgba(
              255,
              77,
              77,
              0.2
            );
        }


        .statusPill.under-review {
          color: #ffab3b;

          background:
            rgba(
              255,
              149,
              31,
              0.08
            );

          border:
            1px solid
            rgba(
              255,
              149,
              31,
              0.2
            );
        }


        .statusPill.cleared {
          color: #39d995;

          background:
            rgba(
              40,
              229,
              143,
              0.08
            );

          border:
            1px solid
            rgba(
              40,
              229,
              143,
              0.2
            );
        }


        .detected strong {
          display: block;

          color: #d1dbe5;

          font-size: 9px;
        }


        .detected span {
          display: block;

          margin-top: 3px;

          color: #7389a0;

          font-size: 9px;
        }


        .detailsButton {
          height: 32px;

          border:
            1px solid
            #24425d;

          background: transparent;

          border-radius: 7px;

          color: #9bb0c3;

          font-size: 10px;

          cursor: pointer;
        }


        .detailsButton span {
          margin-left: 4px;

          color: #48aaff;
        }


        .detailsButton:hover {
          border-color: #168eff;

          color: #ffffff;
        }


        /* ======================================================
           HOW IT WORKS
        ====================================================== */

        .howItWorks {
          margin-top: 14px;

          padding:
            18px;

          border:
            1px solid
            rgba(
              76,
              149,
              235,
              0.23
            );

          border-radius: 12px;

          background:
            rgba(
              7,
              31,
              63,
              0.72
            );
        }


        .howHeader {
          display: flex;

          align-items: flex-start;

          gap: 12px;
        }


        .howIcon {
          width: 38px;

          height: 38px;

          flex-shrink: 0;

          border-radius: 10px;

          display: flex;

          align-items: center;

          justify-content: center;

          background:
            rgba(
              90,
              80,
              255,
              0.14
            );

          color: #7584ff;

          font-size: 18px;
        }


        .howHeader h2 {
          margin: 0;

          font-size: 14px;
        }


        .howHeader p {
          margin:
            5px 0 0;

          color: #8299b6;

          font-size: 10px;

          line-height: 1.5;

          max-width: 600px;
        }


        .howSteps {
          margin-top: 20px;

          display: grid;

          grid-template-columns:
            1fr
            auto
            1fr
            auto
            1fr;

          align-items: center;

          gap: 12px;
        }


        .howStep {
          display: flex;

          align-items: flex-start;

          gap: 10px;
        }


        .stepIcon {
          width: 30px;

          height: 30px;

          flex-shrink: 0;

          border-radius: 50%;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 11px;

          font-weight: 700;
        }


        .stepIcon.blue {
          color: #48a0ff;

          background:
            rgba(
              35,
              135,
              255,
              0.14
            );
        }


        .stepIcon.purple {
          color: #a36cff;

          background:
            rgba(
              163,
              108,
              255,
              0.14
            );
        }


        .stepIcon.orange {
          color: #ffad28;

          background:
            rgba(
              255,
              173,
              40,
              0.14
            );
        }


        .howStep strong {
          display: block;

          font-size: 11px;
        }


        .howStep span {
          display: block;

          margin-top: 3px;

          color: #778ea8;

          font-size: 9px;

          line-height: 1.45;
        }


        .stepArrow {
          color: #416383;

          font-size: 18px;
        }


        /* ======================================================
           MOBILE HEADER
        ====================================================== */

        @media (max-width: 1050px) {

          .sidebar {
            width: 210px;

            min-width: 210px;
          }


          .content {
            padding:
              25px 22px;
          }


          .summaryGrid {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }


          .howSteps {
            grid-template-columns:
              1fr
              1fr
              1fr;
          }


          .stepArrow {
            display: none;
          }

        }


        /* ======================================================
           PHONE
        ====================================================== */

        @media (max-width: 700px) {

          .dashboard {
            display: block;

            min-height: 100vh;

            padding-bottom: 75px;
          }


          .sidebar {
            display: none;
          }


          .mobileHeader {
            position: sticky;

            top: 0;

            z-index: 100;

            height: 72px;

            padding:
              0 14px;

            display: grid;

            grid-template-columns:
              44px
              minmax(0, 1fr)
              44px;

            align-items: center;

            background:
              rgba(
                3,
                18,
                40,
                0.98
              );

            border-bottom:
              1px solid
              #193650;
          }


          .menuButton {
            width: 40px;

            height: 40px;

            border: 0;

            background: transparent;

            color: white;

            font-size: 24px;

            padding: 5px;

            cursor: pointer;
          }


          .mobileLogoButton {
            height: 40px;

            border: none;

            background: transparent;

            color: white;

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 7px;

            font-size: 17px;

            font-weight: 700;

            letter-spacing: -0.2px;

            cursor: pointer;

            min-width: 0;
          }


          .mobileLogoDiamond {
            color: #168eff;

            font-size: 23px;

            line-height: 1;

            flex-shrink: 0;
          }


          .mobileBrandName {
            white-space: nowrap;
          }


          .mobileBrandName strong {
            color: #168eff;
          }


          .mobileBell {
            width: 40px;

            height: 40px;

            border: 0;

            background: transparent;

            color: white;

            position: relative;

            display: grid;

            place-items: center;

            cursor: pointer;

            padding: 0;
          }


          .mobileBell .bellIcon {
            font-size: 17px;
          }


          .mobileNotificationDot {
            position: absolute;

            width: 8px;

            height: 8px;

            top: 5px;

            right: 3px;

            border-radius: 50%;

            background: #168eff;

            box-shadow:
              0 0 8px
              rgba(
                22,
                142,
                255,
                0.6
              );
          }


          /* ====================================================
             MOBILE MENU
          ===================================================== */

          .mobileMenu {
            position: fixed;

            inset: 0;

            z-index: 200;

            display: block;

            background: #06152f;

            padding: 22px;

            overflow-y: auto;
          }


          .mobileMenuHeader {
            display: flex;

            justify-content: space-between;

            align-items: flex-start;
          }


          .mobileMenuLogo {
            display: flex;

            align-items: center;

            gap: 8px;

            font-size: 20px;

            font-weight: 700;
          }


          .mobileMenuLogo > span {
            color: #168eff;

            font-size: 25px;

            line-height: 1;
          }


          .mobileMenuLogo strong {
            color: #168eff;
          }


          .mobileMenuSubtitle {
            color: #8fa5c2;

            font-size: 11px;

            line-height: 1.5;

            margin-top: 8px;
          }


          .closeMenu {
            border: 0;

            background: transparent;

            color: white;

            font-size: 30px;

            cursor: pointer;
          }


          .mobileMenuNav {
            margin-top: 35px;
          }


          .mobileNavItem {
            width: 100%;

            display: flex;

            align-items: center;

            gap: 15px;

            padding:
              16px 14px;

            border-radius: 10px;

            border: none;

            background: transparent;

            color: #b3c3d8;

            font-size: 15px;

            margin-bottom: 5px;

            cursor: pointer;

            text-align: left;
          }


          .mobileNavItem:hover {
            background:
              rgba(
                25,
                111,
                200,
                0.14
              );
          }


          .mobileNavItem.active {
            background: #0c64bd;

            color: white;
          }


          .logoutItem {
            color: #ff8b91;
          }


          .mobileAccountLabel {
            color: #617996;

            font-size: 10px;

            letter-spacing: 1.5px;

            margin:
              28px 14px 10px;
          }


          /* ====================================================
             CONTENT
          ===================================================== */

          .content {
            width: 100%;

            padding:
              22px 15px 30px;
          }


          .topBar {
            display: none;
          }


          .mobileWelcome {
            display: block;

            padding:
              8px 2px 16px;
          }


          .mobileWelcome h1 {
            font-size: 25px;

            line-height: 1.25;
          }


          .mobileWelcome p {
            font-size: 12px;

            line-height: 1.5;
          }


          /* ====================================================
             SUMMARY
          ===================================================== */

          .summaryGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

            gap: 9px;

            margin-top: 4px;
          }


          .summaryCard {
            padding: 12px;

            gap: 9px;

            min-height: 106px;
          }


          .summaryIcon {
            width: 34px;

            height: 34px;

            font-size: 15px;
          }


          .summaryLabel {
            white-space: normal;

            font-size: 9px;
          }


          .summaryNumber {
            font-size: 20px;
          }


          .summaryLink,
          .summaryWarning {
            font-size: 9px;
          }


          /* ====================================================
             FILTER
          ===================================================== */

          .filterBar {
            grid-template-columns:
              minmax(0, 1fr)
              42px;

            gap: 8px;

            margin-top: 11px;
          }


          .searchInput {
            height: 38px;
          }


          .searchInput input {
            font-size: 9px;
          }


          .filterSelect {
            height: 38px;

            width: 42px;

            padding: 0;

            color: transparent;

            font-size: 0;

            text-indent: -9999px;

            appearance: none;

            background:
              rgba(
                7,
                33,
                68,
                0.72
              )
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%2348a0ff' stroke-width='2'%3E%3Cpath d='M4 6h16M7 12h10M10 18h4'/%3E%3C/svg%3E")
              center
              no-repeat;
          }


          .filterSelect + .filterSelect {
            display: none;
          }


          /* ====================================================
             NOTICE
          ===================================================== */

          .dataNotice {
            padding:
              11px 12px;
          }


          .dataNotice > span {
            font-size: 18px;
          }


          .dataNotice strong {
            font-size: 10px;
          }


          .dataNotice p {
            font-size: 9px;
          }


          /* ====================================================
             ALERTS
          ===================================================== */

          .alertsPanel {
            margin-top: 11px;
          }


          .panelHeader {
            padding:
              14px;
          }


          .panelHeader h2 {
            font-size: 14px;
          }


          .panelHeader p {
            max-width: 240px;

            font-size: 9px;

            line-height: 1.4;
          }


          .viewAllButton {
            font-size: 9px;
          }


          .desktopAlertList {
            display: none;
          }


          .mobileAlertList {
            display: block;
          }


          .mobileAlertRow {
            width: 100%;

            min-height: 74px;

            padding:
              10px 12px;

            border: 0;

            border-bottom:
              1px solid
              #142c43;

            background: transparent;

            color: white;

            display: grid;

            grid-template-columns:
              30px
              minmax(0, 1fr)
              15px;

            align-items: center;

            gap: 9px;

            text-align: left;
          }


          .mobileAlertRow:last-child {
            border-bottom: none;
          }


          .mobileAlertIcon {
            width: 29px;

            height: 29px;

            border-radius: 50%;

            display: grid;

            place-items: center;

            font-size: 13px;
          }


          .mobileAlertIcon.high {
            color: #ff5965;

            background:
              rgba(
                255,
                77,
                77,
                0.1
              );
          }


          .mobileAlertIcon.medium {
            color: #ffad28;

            background:
              rgba(
                255,
                149,
                31,
                0.1
              );
          }


          .mobileAlertIcon.low {
            color: #39d995;

            background:
              rgba(
                40,
                229,
                143,
                0.1
              );
          }


          .mobileAlertInfo {
            min-width: 0;
          }


          .mobileAlertInfo strong {
            display: block;

            font-size: 10px;
          }


          .mobileAlertInfo > span {
            display: block;

            color: #899db1;

            font-size: 8px;

            margin-top: 3px;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;
          }


          .mobileAlertMeta {
            display: flex;

            align-items: center;

            gap: 8px;

            margin-top: 5px;
          }


          .mobileAlertMeta > span:last-child {
            color: #647a90;

            font-size: 7px;
          }


          .mobileAlertMeta .riskPill {
            padding:
              3px 6px;

            font-size: 6px;
          }


          .mobileArrow {
            color: #667e95;

            font-size: 22px;
          }


          /* ====================================================
             EMPTY STATE
          ===================================================== */

          .alertEmpty {
            min-height: 145px;

            padding:
              20px 14px;

            gap: 13px;
          }


          .emptyIcon {
            width: 46px;

            height: 46px;

            font-size: 20px;
          }


          .alertEmpty h3 {
            font-size: 13px;
          }


          .alertEmpty p {
            font-size: 9px;

            line-height: 1.5;
          }


          /* ====================================================
             HOW IT WORKS
          ===================================================== */

          .howItWorks {
            padding:
              15px;

            margin-top: 11px;
          }


          .howHeader p {
            font-size: 9px;
          }


          .howSteps {
            grid-template-columns:
              1fr
              1fr;

            gap: 12px;

            margin-top: 16px;
          }


          .howStep {
            gap: 8px;
          }


          .stepIcon {
            width: 28px;

            height: 28px;
          }


          .howStep strong {
            font-size: 10px;
          }


          .howStep span {
            font-size: 8px;
          }


          .stepArrow {
            display: none;
          }


          /* ====================================================
             BOTTOM NAV
          ===================================================== */

          .bottomNav {
            position: fixed;

            display: flex;

            left: 0;

            right: 0;

            bottom: 0;

            height: 74px;

            z-index: 150;

            background:
              rgba(
                3,
                18,
                40,
                0.98
              );

            border-top:
              1px solid
              #193650;

            justify-content:
              space-around;

            align-items: center;

            backdrop-filter:
              blur(15px);
          }


          .bottomItem {
            flex: 1;

            height: 100%;

            border: none;

            background: transparent;

            text-align: center;

            color: #7990ad;

            font-size: 17px;

            cursor: pointer;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            gap: 4px;
          }


          .bottomItem span {
            display: block;

            line-height: 1;

            font-size: 20px;
          }


          .bottomItem small {
            font-size: 8px;
          }


          .bottomItem.active {
            color: #168eff;
          }

        }


        /* ======================================================
           VERY SMALL PHONES
        ====================================================== */

        @media (max-width: 380px) {

          .content {
            padding-left: 12px;

            padding-right: 12px;
          }


          .mobileLogoButton {
            font-size: 15px;
          }


          .mobileLogoDiamond {
            font-size: 21px;
          }


          .mobileWelcome h1 {
            font-size: 22px;
          }


          .summaryCard {
            padding: 10px;
          }


          .summaryIcon {
            display: none;
          }


          .summaryNumber {
            font-size: 18px;
          }


          .howSteps {
            grid-template-columns:
              1fr;
          }

        }

      `}</style>

    </main>

  );
}