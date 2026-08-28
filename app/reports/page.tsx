"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

/*
============================================================
REPORTS CONFIGURATION
============================================================
*/

const REPORTS_TABLE = "verification_reports";

type ReportStatus =
  | "Verified"
  | "Pending"
  | "Flagged";

type VerificationLevel =
  | "Basic"
  | "Professional"
  | "Premium"
  | "Unknown";

type Report = {
  id: string;
  propertyName: string;
  reportId: string;
  status: ReportStatus;
  createdAt: string;
  documents: number;
  location: string;
  verificationLevel: VerificationLevel;
  verifiedBy: string;
  pdfUrl: string | null;
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
============================================================
BRAND
============================================================
*/

/*
 * Dashboard is the MASTER reference.
 *
 * Brand:
 * PropertySure AI
 *
 * PropertySure = white
 * AI = #168eff
 * Diamond = #168eff
 */

const BRAND_BLUE = "#168eff";

/*
============================================================
HELPERS
============================================================
*/

function stringValue(
  row: Record<string, unknown>,
  keys: string[],
  fallback = ""
): string {
  for (const key of keys) {
    const value = row[key];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return String(value);
    }
  }

  return fallback;
}

function numberValue(
  row: Record<string, unknown>,
  keys: string[],
  fallback = 0
): number {
  for (const key of keys) {
    const value = row[key];

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return fallback;
}

function normalizeStatus(
  value: string
): ReportStatus {
  const normalized = value
    .trim()
    .toLowerCase();

  if (
    normalized.includes("flag") ||
    normalized.includes("fraud") ||
    normalized.includes("risk") ||
    normalized.includes("reject")
  ) {
    return "Flagged";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("progress") ||
    normalized.includes("processing") ||
    normalized.includes("review") ||
    normalized.includes("started")
  ) {
    return "Pending";
  }

  return "Verified";
}

function normalizeVerificationLevel(
  row: Record<string, unknown>
): VerificationLevel {
  const raw = stringValue(row, [
    "verification_level",
    "verification_tier",
    "service_level",
    "service_tier",
    "plan_type",
    "package",
    "package_type",
    "verification_package",
  ]).toLowerCase();

  if (
    raw.includes("premium") ||
    raw.includes("legal") ||
    raw.includes("lawyer")
  ) {
    return "Premium";
  }

  if (
    raw.includes("professional") ||
    raw.includes("human")
  ) {
    return "Professional";
  }

  if (
    raw.includes("basic") ||
    raw.includes("ai")
  ) {
    return "Basic";
  }

  return "Unknown";
}

function verificationMethod(
  level: VerificationLevel
): string {
  switch (level) {
    case "Basic":
      return "AI Verification";

    case "Professional":
      return "AI + Human Verification";

    case "Premium":
      return "AI + Human + Legal & Professional Review";

    default:
      return "Verification";
  }
}

function formatDate(
  date: string,
  status: ReportStatus
): string {
  if (!date) {
    return status === "Pending"
      ? "Awaiting date"
      : "Date unavailable";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(parsed);
}

function mapReport(
  row: Record<string, unknown>
): Report {
  const status = normalizeStatus(
    stringValue(
      row,
      [
        "status",
        "verification_status",
        "report_status",
        "result_status",
      ],
      "Pending"
    )
  );

  const createdAt = stringValue(
    row,
    [
      "created_at",
      "generated_at",
      "completed_at",
      "updated_at",
      "started_at",
    ],
    ""
  );

  const verificationLevel =
    normalizeVerificationLevel(row);

  const documents = numberValue(
    row,
    [
      "documents_count",
      "document_count",
      "documents",
      "file_count",
      "total_documents",
    ],
    0
  );

  const reportId = stringValue(
    row,
    [
      "report_id",
      "verification_id",
      "reference_id",
      "report_reference",
      "id",
    ],
    "Pending"
  );

  const pdfUrl = stringValue(
    row,
    [
      "pdf_url",
      "report_url",
      "report_link",
      "pdf_link",
      "download_url",
    ],
    ""
  );

  const rawId = stringValue(
    row,
    [
      "id",
      "verification_id",
      "report_id",
    ],
    ""
  );

  return {
    id:
      rawId ||
      `${reportId}-${createdAt}`,

    propertyName: stringValue(
      row,
      [
        "property_name",
        "propertyName",
        "name",
        "property",
        "property_title",
      ],
      "Property Verification"
    ),

    reportId,

    status,

    createdAt,

    documents,

    location: stringValue(
      row,
      [
        "location",
        "property_location",
        "address",
        "property_address",
        "state",
        "property_state",
      ],
      "Location unavailable"
    ),

    verificationLevel,

    verifiedBy:
      status === "Pending"
        ? "Verification in progress"
        : verificationMethod(
            verificationLevel
          ),

    pdfUrl: pdfUrl || null,
  };
}

/*
============================================================
REPORTS PAGE
============================================================
*/

export default function ReportsPage() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [loadingReports, setLoadingReports] =
    useState(true);

  const [reports, setReports] =
    useState<Report[]>([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All Reports");

  const [filterOpen, setFilterOpen] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [user, setUser] =
    useState<DashboardUser>({
      fullName: "User",
      firstName: "User",
      email: "",
      initial: "U",
      plan: "Free Plan",
    });

  /*
  ============================================================
  DASHBOARD MASTER NAVIGATION
  ============================================================
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
            .split(/\s+/)[0] ||
          "User";

        const initial =
          firstName.charAt(0).toUpperCase() ||
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
          plan: String(metadataPlan),
        });
      } catch (error) {
        console.error(
          "Reports user loading error:",
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
    setFilterOpen(false);
    router.push(path);
  };

  /*
  ============================================================
  SIGN OUT
  ============================================================
  */

  const handleSignOut = async () => {
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
  PLAN
  ============================================================
  */

  const planName =
    user.plan || "Free Plan";

  const isPremium =
    planName
      .toLowerCase()
      .includes("premium");

  /*
  ============================================================
  LOAD REPORTS
  ============================================================
  */

  const loadReports =
    useCallback(
      async () => {
        setLoadingReports(true);
        setErrorMessage("");

        try {
          const {
            data: authData,
            error: authError,
          } =
            await supabase.auth.getUser();

          if (authError) {
            console.warn(
              "Reports authentication warning:",
              authError
            );

            setReports([]);

            setErrorMessage(
              "Unable to authenticate your account."
            );

            return;
          }

          const authUser =
            authData.user;

          if (!authUser) {
            router.replace("/signin");
            return;
          }

          const {
            data,
            error,
          } = await supabase
            .from(REPORTS_TABLE)
            .select("*")
            .eq(
              "user_id",
              authUser.id
            );

          if (error) {
            console.warn(
              "Could not load verification reports.",
              {
                message:
                  error.message,
                details:
                  error.details,
                hint: error.hint,
                code: error.code,
              }
            );

            setReports([]);

            setErrorMessage(
              "We couldn't connect to your reports data right now."
            );

            return;
          }

          const mappedReports =
            (
              (data || []) as Record<
                string,
                unknown
              >[]
            ).map(mapReport);

          mappedReports.sort(
            (a, b) => {
              const aTime =
                a.createdAt
                  ? new Date(
                      a.createdAt
                    ).getTime()
                  : 0;

              const bTime =
                b.createdAt
                  ? new Date(
                      b.createdAt
                    ).getTime()
                  : 0;

              return (
                bTime - aTime
              );
            }
          );

          setReports(
            mappedReports
          );
          setErrorMessage("");
        } catch (error) {
          console.warn(
            "Reports loading warning:",
            error
          );

          setReports([]);

          setErrorMessage(
            "Something went wrong while loading your reports."
          );
        } finally {
          setLoadingReports(false);
        }
      },
      [router]
    );

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  /*
  ============================================================
  REALTIME
  ============================================================
  */

  useEffect(() => {
    let channel:
      | ReturnType<
          typeof supabase.channel
        >
      | null = null;

    let cancelled = false;

    async function setupRealtime() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getUser();

        if (error) {
          console.warn(
            "Realtime auth warning:",
            error
          );

          return;
        }

        const authUser =
          data.user;

        if (
          !authUser ||
          cancelled
        ) {
          return;
        }

        channel = supabase
          .channel(
            `reports-page-${authUser.id}`
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: REPORTS_TABLE,
              filter: `user_id=eq.${authUser.id}`,
            },
            () => {
              loadReports();
            }
          )
          .subscribe(
            (status) => {
              if (
                status ===
                "CHANNEL_ERROR"
              ) {
                console.warn(
                  "Reports realtime channel warning."
                );
              }
            }
          );
      } catch (error) {
        console.warn(
          "Realtime setup warning:",
          error
        );
      }
    }

    setupRealtime();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(
          channel
        );
      }
    };
  }, [loadReports]);

  /*
  ============================================================
  FILTERING
  ============================================================
  */

  const filteredReports =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return reports.filter(
        (report) => {
          const matchesSearch =
            !searchText ||
            report.propertyName
              .toLowerCase()
              .includes(
                searchText
              ) ||
            report.reportId
              .toLowerCase()
              .includes(
                searchText
              ) ||
            report.location
              .toLowerCase()
              .includes(
                searchText
              );

          const matchesFilter =
            filter ===
              "All Reports" ||
            report.status ===
              filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      reports,
      search,
      filter,
    ]);

  const totalReports =
    reports.length;

  const verifiedReports =
    reports.filter(
      (report) =>
        report.status ===
        "Verified"
    ).length;

  const pendingReports =
    reports.filter(
      (report) =>
        report.status ===
        "Pending"
    ).length;

  const flaggedReports =
    reports.filter(
      (report) =>
        report.status ===
        "Flagged"
    ).length;

  /*
  ============================================================
  LOADING SCREEN
  ============================================================
  */

  if (loadingUser) {
    return (
      <main className="reportsLoading">

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
          Loading your reports...
        </div>

        <style jsx>{`

          .reportsLoading {
            min-height: 100vh;

            background:
              radial-gradient(
                circle at 70% 0%,
                rgba(0, 123, 255, 0.18),
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

  return (
    <main className="reports">

      {/* ========================================================
          MOBILE HEADER
      ======================================================== */}

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
            <strong> AI</strong>
          </span>

        </button>

        {/* EXACT DASHBOARD NOTIFICATION */}

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

      {/* ========================================================
          MOBILE MENU
      ======================================================== */}

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
                  <strong> AI</strong>
                </div>

              </div>

              <div className="mobileMenuSubtitle">
                AI-Powered Property Due Diligence
              </div>

            </div>

            <button
              className="closeMenu"
              onClick={() =>
                setMenuOpen(false)
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
                    "/reports"
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

      {/* ========================================================
          DESKTOP SIDEBAR
      ======================================================== */}

      <aside className="sidebar">

        {/* MASTER DASHBOARD BRAND */}

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
              <strong> AI</strong>
            </span>

          </div>

          <div className="brandSubtitle">
            AI-Powered Property
            <br />
            Due Diligence
          </div>

        </button>

        {/* MASTER DASHBOARD NAVIGATION */}

        <nav className="sidebarNav">

          {navItems.map(
            (item) => (

              <button
                key={item.label}
                className={`navItem ${
                  item.path ===
                  "/reports"
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

        {/* ======================================================
            EXACT DASHBOARD NEED HELP
            ====================================================== */}

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

        {/* ======================================================
            EXACT DASHBOARD USER
            ====================================================== */}

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

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <section className="content">

        {/* ======================================================
            DESKTOP TOP BAR
        ====================================================== */}

        <header className="topBar">

          <div>

            <div className="eyebrow">
              PROPERTYSURE AI
            </div>

            <h1>
              Reports
            </h1>

            <p>
              Access and manage your
              property verification reports.
            </p>

          </div>

          <div className="topActions">

            {/* EXACT DASHBOARD NOTIFICATION */}

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

              {/* BLUE DOT RESTORED */}

              <span className="notificationDot" />

            </button>

            {/* EXACT DASHBOARD PROFILE */}

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

        {/* ======================================================
            MOBILE REPORTS HEADING
        ====================================================== */}

        <div className="mobileReportsHeading">

          <div className="eyebrow">
            PROPERTYSURE AI
          </div>

          <h1>
            Reports
          </h1>

          <p>
            Access and manage your
            property verification reports.
          </p>

        </div>

        {/* ======================================================
            DATABASE NOTICE
        ====================================================== */}

        {errorMessage && (

          <div className="databaseNotice">

            <div className="databaseNoticeIcon">
              !
            </div>

            <div className="databaseNoticeContent">

              <strong>
                Reports are temporarily unavailable
              </strong>

              <p>
                {errorMessage}
              </p>

            </div>

            <button
              onClick={() =>
                loadReports()
              }
            >
              Retry
            </button>

          </div>

        )}

        {/* ======================================================
            STATS
        ====================================================== */}

        <section className="statsGrid">

          <div className="statCard">

            <div className="statIcon blue">
              ▤
            </div>

            <div>

              <div className="statLabel">
                Total Reports
              </div>

              <div className="statNumber">
                {totalReports}
              </div>

            </div>

          </div>

          <div className="statCard">

            <div className="statIcon green">
              ✓
            </div>

            <div>

              <div className="statLabel">
                Verified
              </div>

              <div className="statNumber">
                {verifiedReports}
              </div>

            </div>

          </div>

          <div className="statCard">

            <div className="statIcon orange">
              ◷
            </div>

            <div>

              <div className="statLabel">
                Pending
              </div>

              <div className="statNumber">
                {pendingReports}
              </div>

            </div>

          </div>

          <div className="statCard">

            <div className="statIcon red">
              !
            </div>

            <div>

              <div className="statLabel">
                Flagged
              </div>

              <div className="statNumber">
                {flaggedReports}
              </div>

            </div>

          </div>

        </section>

        {/* ======================================================
            SEARCH + FILTER
        ====================================================== */}

        <section className="filterRow">

          <div className="searchBox">

            <span className="searchIcon">
              ⌕
            </span>

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by property, report ID or location"
            />

          </div>

          <div className="filterDropdown">

            <button
              className={`filterTrigger ${
                filterOpen
                  ? "filterTriggerOpen"
                  : ""
              }`}
              onClick={() =>
                setFilterOpen(
                  (current) =>
                    !current
                )
              }
              aria-expanded={
                filterOpen
              }
              aria-haspopup="listbox"
            >

              <div className="filterTriggerLeft">

                <div
                  className={`filterStatusIcon ${
                    filter ===
                    "Verified"
                      ? "verified"
                      : filter ===
                          "Pending"
                        ? "pending"
                        : filter ===
                            "Flagged"
                          ? "flagged"
                          : "all"
                  }`}
                >
                  {filter ===
                  "Verified"
                    ? "✓"
                    : filter ===
                        "Pending"
                      ? "◷"
                      : filter ===
                          "Flagged"
                        ? "!"
                        : "▤"}
                </div>

                <div className="filterTriggerText">

                  <span className="filterSmallLabel">
                    FILTER REPORTS
                  </span>

                  <strong>
                    {filter}
                  </strong>

                </div>

              </div>

              <span className="filterChevron">
                ⌄
              </span>

            </button>

            {filterOpen && (

              <>

                <button
                  className="filterBackdrop"
                  aria-label="Close filter"
                  onClick={() =>
                    setFilterOpen(
                      false
                    )
                  }
                />

                <div
                  className="filterMenu"
                  role="listbox"
                  aria-label="Filter reports"
                >

                  {[
                    "All Reports",
                    "Verified",
                    "Pending",
                    "Flagged",
                  ].map(
                    (option) => (

                      <button
                        key={option}
                        className={`filterOption ${
                          filter ===
                          option
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => {
                          setFilter(
                            option
                          );

                          setFilterOpen(
                            false
                          );
                        }}
                        role="option"
                        aria-selected={
                          filter ===
                          option
                        }
                      >

                        <div
                          className={`filterStatusIcon ${
                            option ===
                            "Verified"
                              ? "verified"
                              : option ===
                                  "Pending"
                                ? "pending"
                                : option ===
                                    "Flagged"
                                  ? "flagged"
                                  : "all"
                          }`}
                        >
                          {option ===
                          "Verified"
                            ? "✓"
                            : option ===
                                "Pending"
                              ? "◷"
                              : option ===
                                  "Flagged"
                                ? "!"
                                : "▤"}
                        </div>

                        <div className="filterOptionText">

                          <strong>
                            {option}
                          </strong>

                          <span>
                            {option ===
                              "All Reports" &&
                              "View all verification reports"}

                            {option ===
                              "Verified" &&
                              "Successfully verified reports"}

                            {option ===
                              "Pending" &&
                              "Reports still under verification"}

                            {option ===
                              "Flagged" &&
                              "Reports requiring attention"}
                          </span>

                        </div>

                        {filter ===
                          option && (

                          <span className="selectedCheck">
                            ✓
                          </span>

                        )}

                      </button>

                    )
                  )}

                </div>

              </>

            )}

          </div>

        </section>

        {/* ======================================================
            REPORT HEADER
        ====================================================== */}

        <div className="reportsSectionHeader">

          <h2>
            Verification Reports
          </h2>

          <span>
            {filteredReports.length}{" "}
            {filteredReports.length ===
            1
              ? "report"
              : "reports"}
          </span>

        </div>

        {/* ======================================================
            REPORTS
        ====================================================== */}

        <section className="reportsGrid">

          {loadingReports ? (

            <div className="loadingReportsCard">

              <div className="loadingSpinner" />

              <h3>
                Loading reports
              </h3>

              <p>
                Retrieving your verification
                reports...
              </p>

            </div>

          ) : filteredReports.length ===
            0 ? (

            <div className="emptyReportCard">

              <div className="emptyReportIcon">
                ▤
              </div>

              <h3>
                No reports yet
              </h3>

              <p>
                Your completed property
                verification reports will
                appear here automatically
                after a verification is completed.
              </p>

            </div>

          ) : (

            filteredReports.map(
              (report) => (

                <article
                  className="reportCard"
                  key={report.id}
                >

                  <div className="reportCardHeader">

                    <div
                      className={`propertyReportIcon ${
                        report.status ===
                        "Verified"
                          ? "propertyGreen"
                          : report.status ===
                              "Pending"
                            ? "propertyOrange"
                            : "propertyRed"
                      }`}
                    >
                      ⌂
                    </div>

                    <div className="reportTitle">

                      <div className="titleStatusRow">

                        <h3>
                          {report.propertyName}
                        </h3>

                        <span
                          className={`statusBadge ${
                            report.status ===
                            "Verified"
                              ? "verifiedBadge"
                              : report.status ===
                                  "Pending"
                                ? "pendingBadge"
                                : "flaggedBadge"
                          }`}
                        >

                          {report.status ===
                            "Verified" &&
                            "✓ "}

                          {report.status ===
                            "Pending" &&
                            "◷ "}

                          {report.status ===
                            "Flagged" &&
                            "! "}

                          {report.status}

                        </span>

                      </div>

                      <span className="reportId">
                        Report ID:{" "}
                        {report.reportId}
                      </span>

                    </div>

                  </div>

                  <div className="cardDivider" />

                  <div className="reportDetails">

                    <div className="detailRow">

                      <span className="detailIcon">
                        ◷
                      </span>

                      <span>
                        {report.status ===
                        "Verified"
                          ? "Generated"
                          : "Started"}
                      </span>

                      <strong>
                        {formatDate(
                          report.createdAt,
                          report.status
                        )}
                      </strong>

                    </div>

                    <div className="detailRow">

                      <span className="detailIcon">
                        ▤
                      </span>

                      <span>
                        Documents
                      </span>

                      <strong>
                        {report.documents >
                        0
                          ? `${report.documents} ${
                              report.documents ===
                              1
                                ? "document"
                                : "documents"
                            }`
                          : "Package pending"}
                      </strong>

                    </div>

                    <div className="detailRow">

                      <span className="detailIcon">
                        ◉
                      </span>

                      <span>
                        Location
                      </span>

                      <strong>
                        {report.location}
                      </strong>

                    </div>

                    <div className="detailRow">

                      <span className="detailIcon">
                        ◯
                      </span>

                      <span>
                        Verified By
                      </span>

                      <strong>
                        {report.verifiedBy}
                      </strong>

                    </div>

                  </div>

                  <div className="reportActions">

                    <button
                      className="viewReportButton"
                      onClick={() =>
                        navigateTo(
                          `/verification-details?report=${encodeURIComponent(
                            report.reportId
                          )}`
                        )
                      }
                    >
                      {report.status ===
                      "Verified"
                        ? "View Report"
                        : "View Status"}
                    </button>

                    <button
                      className={`downloadButton ${
                        !report.pdfUrl
                          ? "disabledDownload"
                          : ""
                      }`}
                      disabled={
                        !report.pdfUrl
                      }
                      onClick={() => {

                        if (
                          report.pdfUrl
                        ) {

                          window.open(
                            report.pdfUrl,
                            "_blank",
                            "noopener,noreferrer"
                          );

                        }

                      }}
                    >

                      ↓

                      {report.pdfUrl
                        ? "Download PDF"
                        : "PDF Pending"}

                    </button>

                  </div>

                </article>

              )
            )

          )}

        </section>

        {/* ======================================================
            INFO
        ====================================================== */}

        <div className="infoBar">

          <div className="infoIcon">
            ⓘ
          </div>

          <p>
            Reports are generated from the
            complete property verification package,
            including document analysis and
            verification results.
          </p>

        </div>

      </section>

      {/* ========================================================
          MOBILE BOTTOM NAVIGATION
      ======================================================== */}

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
              "/reports"
            )
          }
        >

          <span>
            ▤
          </span>

          <small>
            Reports
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

      {/* ========================================================
          STYLES
      ======================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .reports {
          min-height: 100vh;

          background:
            radial-gradient(
              circle at 70% 0%,
              rgba(0, 123, 255, 0.18),
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
        input {
          font-family: inherit;
        }

        button {
          cursor: pointer;
        }

        /* ======================================================
           SIDEBAR
           EXACT DASHBOARD VALUES
           ====================================================== */

        .sidebar {
          width: 245px;

          min-width: 245px;

          min-height: 100vh;

          padding:
            28px 20px;

          background:
            rgba(4, 20, 47, 0.96);

          border-right:
            1px solid
            rgba(83, 157, 255, 0.18);

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
            rgba(24, 112, 200, 0.14);

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
            rgba(0, 120, 255, 0.2);
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
           NEED HELP
           EXACT DASHBOARD VALUES
           ====================================================== */

        .helpBox {
          margin-top: auto;

          padding: 16px;

          border:
            1px solid
            rgba(71, 151, 255, 0.25);

          border-radius: 12px;

          background:
            rgba(16, 88, 170, 0.08);
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
            1px solid #1678df;

          background: transparent;

          color: #7eb9f5;

          cursor: pointer;
        }

        /* ======================================================
           SIDEBAR USER
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
            rgba(255, 255, 255, 0.08);
        }

        .eyebrow {
          color: #7791b3;

          font-size: 11px;

          letter-spacing: 1.5px;

          margin-bottom: 8px;
        }

        .topBar h1,
        .mobileReportsHeading h1 {
          margin: 0;

          font-size:
            clamp(24px, 3vw, 32px);

          font-weight: 600;
        }

        .topBar p,
        .mobileReportsHeading p {
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
           DASHBOARD NOTIFICATION
           BLUE DOT INCLUDED
           ====================================================== */

        .notification {
          width: 40px;

          height: 40px;

          border:
            1px solid
            rgba(60, 143, 232, 0.35);

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
            rgba(22, 142, 255, 0.6);
        }

        .notification:hover {
          border-color:
            rgba(22, 142, 255, 0.65);

          background:
            rgba(22, 142, 255, 0.06);
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
           DATABASE NOTICE
           ====================================================== */

        .databaseNotice {
          margin-top: 22px;

          padding:
            14px 16px;

          display: flex;

          align-items: center;

          gap: 13px;

          border:
            1px solid
            rgba(255, 99, 108, 0.25);

          border-radius: 10px;

          background:
            rgba(120, 28, 36, 0.16);
        }

        .databaseNoticeIcon {
          width: 31px;

          height: 31px;

          flex-shrink: 0;

          border-radius: 50%;

          display: flex;

          align-items: center;

          justify-content: center;

          background:
            rgba(255, 80, 90, 0.17);

          color: #ff6971;

          font-weight: 700;
        }

        .databaseNoticeContent {
          min-width: 0;
        }

        .databaseNotice strong {
          display: block;

          font-size: 13px;
        }

        .databaseNotice p {
          margin:
            3px 0 0;

          color: #b88e93;

          font-size: 11px;
        }

        .databaseNotice button {
          margin-left: auto;

          height: 35px;

          padding: 0 13px;

          flex-shrink: 0;

          border:
            1px solid
            rgba(255, 100, 110, 0.35);

          border-radius: 6px;

          background: transparent;

          color: #ff7b83;

          font-size: 11px;
        }

        /* ======================================================
           STATS
           ====================================================== */

        .statsGrid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap: 12px;

          margin-top: 28px;
        }

        .statCard {
          min-width: 0;

          padding: 18px;

          border-radius: 12px;

          border:
            1px solid
            rgba(76, 149, 235, 0.23);

          background:
            rgba(7, 33, 68, 0.78);

          display: flex;

          align-items: center;

          gap: 13px;
        }

        .statIcon {
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

        .green {
          background:
            rgba(30, 190, 125, 0.2);

          color: #39d995;
        }

        .orange {
          background:
            rgba(255, 160, 20, 0.2);

          color: #ffad28;
        }

        .red {
          background:
            rgba(240, 50, 65, 0.2);

          color: #ff5261;
        }

        .blue {
          background:
            rgba(35, 135, 255, 0.2);

          color: #48a0ff;
        }

        .statLabel {
          color: #91a6c0;

          font-size: 11px;

          white-space: nowrap;
        }

        .statNumber {
          font-size: 25px;

          font-weight: 600;

          margin:
            2px 0;
        }

        /* ======================================================
           FILTER
           ====================================================== */

        .filterRow {
          display: grid;

          grid-template-columns:
            minmax(0, 2fr)
            minmax(250px, 1fr);

          gap: 16px;

          margin-top: 24px;
        }

        .searchBox {
          height: 56px;

          border:
            1px solid
            rgba(72, 147, 234, 0.24);

          border-radius: 9px;

          background:
            rgba(6, 27, 56, 0.75);

          display: flex;

          align-items: center;

          padding:
            0 17px;

          gap: 12px;

          color: #8ea5c0;
        }

        .searchIcon {
          font-size: 25px;

          line-height: 1;

          color: #8ea5c0;

          transform:
            rotate(-20deg);
        }

        .searchBox input {
          width: 100%;

          min-width: 0;

          border: 0;

          outline: 0;

          background: transparent;

          color: #ffffff;

          font-size: 14px;
        }

        .searchBox input::placeholder {
          color: #7189a8;
        }

        .filterDropdown {
          position: relative;

          z-index: 40;
        }

        .filterTrigger {
          position: relative;

          z-index: 42;

          width: 100%;

          height: 56px;

          padding:
            7px 15px;

          border:
            1px solid
            rgba(72, 147, 234, 0.24);

          border-radius: 10px;

          background:
            rgba(6, 27, 56, 0.82);

          color: #ffffff;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 12px;

          text-align: left;
        }

        .filterTrigger:hover,
        .filterTriggerOpen {
          border-color:
            rgba(42, 143, 255, 0.55);

          background:
            rgba(8, 34, 68, 0.95);
        }

        .filterTriggerLeft {
          min-width: 0;

          display: flex;

          align-items: center;

          gap: 11px;
        }

        .filterTriggerText {
          min-width: 0;

          display: flex;

          flex-direction: column;
        }

        .filterSmallLabel {
          color: #617d9e;

          font-size: 8px;

          letter-spacing: 1.1px;

          font-weight: 700;

          margin-bottom: 3px;
        }

        .filterTriggerText strong {
          color: #e7eef7;

          font-size: 13px;

          font-weight: 600;
        }

        .filterChevron {
          color: #8ca5c2;

          font-size: 20px;

          line-height: 1;

          flex-shrink: 0;
        }

        .filterTriggerOpen .filterChevron {
          transform:
            rotate(180deg);

          color: #48a2ff;
        }

        .filterStatusIcon {
          width: 34px;

          height: 34px;

          flex-shrink: 0;

          border-radius: 9px;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 16px;

          font-weight: 700;
        }

        .filterStatusIcon.all {
          color: #4aa0ff;

          background:
            rgba(39, 127, 239, 0.14);
        }

        .filterStatusIcon.verified {
          color: #3bdd99;

          background:
            rgba(25, 190, 119, 0.12);
        }

        .filterStatusIcon.pending {
          color: #ffb13d;

          background:
            rgba(247, 151, 24, 0.12);
        }

        .filterStatusIcon.flagged {
          color: #ff6871;

          background:
            rgba(237, 57, 67, 0.12);
        }

        .filterBackdrop {
          position: fixed;

          inset: 0;

          z-index: 39;

          width: 100%;

          height: 100%;

          border: 0;

          background: transparent;

          cursor: default;
        }

        .filterMenu {
          position: absolute;

          z-index: 50;

          top:
            calc(100% + 9px);

          left: 0;

          right: 0;

          padding: 7px;

          border:
            1px solid
            rgba(67, 145, 235, 0.28);

          border-radius: 13px;

          background:
            linear-gradient(
              145deg,
              rgba(8, 34, 68, 0.99),
              rgba(5, 24, 51, 0.99)
            );

          box-shadow:
            0 18px 45px
            rgba(0, 0, 0, 0.42);

          overflow: hidden;
        }

        .filterOption {
          position: relative;

          width: 100%;

          min-height: 62px;

          padding:
            8px 10px;

          display: flex;

          align-items: center;

          gap: 11px;

          border: 0;

          border-radius: 9px;

          background: transparent;

          color: #ffffff;

          text-align: left;
        }

        .filterOption:hover {
          background:
            rgba(32, 121, 224, 0.13);
        }

        .filterOption.selected {
          background:
            rgba(29, 119, 224, 0.17);
        }

        .filterOptionText {
          min-width: 0;

          flex: 1;

          display: flex;

          flex-direction: column;
        }

        .filterOptionText strong {
          color: #edf4fc;

          font-size: 12px;

          font-weight: 600;
        }

        .filterOptionText span {
          margin-top: 3px;

          color: #718aa9;

          font-size: 9px;

          line-height: 1.3;
        }

        .selectedCheck {
          width: 25px;

          height: 25px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #1378ed;

          color: #ffffff;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 14px;

          font-weight: 700;
        }

        /* ======================================================
           REPORT SECTION
           ====================================================== */

        .reportsSectionHeader {
          display: flex;

          justify-content: space-between;

          align-items: center;

          margin:
            35px 4px 17px;
        }

        .reportsSectionHeader h2 {
          margin: 0;

          font-size: 20px;
        }

        .reportsSectionHeader span {
          color: #9aacc2;

          font-size: 13px;
        }

        .reportsGrid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 18px;
        }

        .reportCard,
        .emptyReportCard,
        .loadingReportsCard {
          min-width: 0;

          border:
            1px solid
            rgba(70, 145, 230, 0.22);

          border-radius: 12px;

          background:
            linear-gradient(
              145deg,
              rgba(7, 31, 65, 0.88),
              rgba(5, 24, 51, 0.9)
            );
        }

        .reportCard {
          min-height: 390px;

          padding: 21px;
        }

        .reportCardHeader {
          display: flex;

          align-items: flex-start;

          gap: 15px;
        }

        .propertyReportIcon {
          width: 48px;

          height: 48px;

          flex-shrink: 0;

          border-radius: 11px;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 24px;
        }

        .propertyGreen {
          color: #3cda97;

          background:
            rgba(25, 188, 118, 0.18);
        }

        .propertyOrange {
          color: #ffa737;

          background:
            rgba(244, 145, 20, 0.18);
        }

        .propertyRed {
          color: #ff5b65;

          background:
            rgba(237, 57, 67, 0.18);
        }

        .reportTitle {
          min-width: 0;

          flex: 1;
        }

        .titleStatusRow {
          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 7px;
        }

        .reportTitle h3 {
          margin:
            1px 0 7px;

          font-size: 16px;

          line-height: 1.25;
        }

        .reportId {
          display: block;

          color: #91a6c0;

          font-size: 11px;
        }

        .statusBadge {
          flex-shrink: 0;

          padding:
            5px 8px;

          border-radius: 7px;

          font-size: 10px;

          white-space: nowrap;

          border:
            1px solid transparent;
        }

        .verifiedBadge {
          color: #39dc96;

          background:
            rgba(24, 188, 117, 0.1);

          border-color:
            rgba(24, 188, 117, 0.25);
        }

        .pendingBadge {
          color: #ffad36;

          background:
            rgba(245, 148, 22, 0.1);

          border-color:
            rgba(245, 148, 22, 0.25);
        }

        .flaggedBadge {
          color: #ff626b;

          background:
            rgba(237, 57, 67, 0.1);

          border-color:
            rgba(237, 57, 67, 0.25);
        }

        .cardDivider {
          height: 1px;

          background:
            rgba(255,255,255,0.07);

          margin:
            19px 0;
        }

        .reportDetails {
          display: flex;

          flex-direction: column;

          gap: 18px;
        }

        .detailRow {
          display: grid;

          grid-template-columns:
            20px 1fr auto;

          align-items: center;

          gap: 11px;

          color: #9db0c8;

          font-size: 12px;
        }

        .detailIcon {
          color: #9bb2cc;

          width: 20px;

          text-align: center;
        }

        .detailRow strong {
          color: #e5ecf5;

          font-size: 13px;

          font-weight: 500;

          text-align: right;

          max-width: 180px;

          overflow-wrap: anywhere;
        }

        .reportActions {
          display: grid;

          grid-template-columns:
            1fr 1.2fr;

          gap: 11px;

          margin-top: 24px;
        }

        .viewReportButton,
        .downloadButton {
          height: 42px;

          border-radius: 7px;

          font-size: 12px;

          font-weight: 600;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;
        }

        .viewReportButton {
          border:
            1px solid
            #1775d9;

          background: transparent;

          color: #56aaff;
        }

        .downloadButton {
          border:
            1px solid
            #1678ef;

          background: #1478ef;

          color: #ffffff;
        }

        .disabledDownload {
          opacity: 0.4;

          cursor: not-allowed;

          border-color: #34516f;

          background: #1a2c44;
        }

        /* ======================================================
           EMPTY / LOADING
           ====================================================== */

        .emptyReportCard {
          min-height: 390px;

          padding:
            35px 25px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;
        }

        .emptyReportIcon {
          width: 78px;

          height: 78px;

          border-radius: 50%;

          background:
            rgba(30, 115, 226, 0.12);

          color: #3d91ff;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 21px;

          font-size: 28px;
        }

        .emptyReportCard h3 {
          margin: 0;

          font-size: 18px;
        }

        .emptyReportCard p {
          max-width: 300px;

          margin:
            10px 0 0;

          color: #8da3bf;

          font-size: 12px;

          line-height: 1.65;
        }

        .loadingReportsCard {
          min-height: 390px;

          padding: 35px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;
        }

        .loadingSpinner {
          width: 34px;

          height: 34px;

          border:
            3px solid
            rgba(255,255,255,0.12);

          border-top-color: #2389ff;

          border-radius: 50%;

          animation:
            spin 0.8s linear infinite;

          margin-bottom: 18px;
        }

        .loadingReportsCard h3 {
          margin: 0;

          font-size: 17px;
        }

        .loadingReportsCard p {
          margin:
            8px 0 0;

          color: #8298b5;

          font-size: 12px;
        }

        @keyframes spin {
          to {
            transform:
              rotate(360deg);
          }
        }

        /* ======================================================
           INFO BAR
           ====================================================== */

        .infoBar {
          margin-top: 35px;

          min-height: 68px;

          padding:
            15px 19px;

          display: flex;

          align-items: center;

          gap: 14px;

          border:
            1px solid
            rgba(67, 143, 231, 0.19);

          border-radius: 9px;

          background:
            rgba(10, 44, 88, 0.45);
        }

        .infoIcon {
          color: #4ca2ff;

          flex-shrink: 0;

          font-size: 21px;
        }

        .infoBar p {
          margin: 0;

          color: #9badc4;

          font-size: 12px;

          line-height: 1.55;
        }

        /* ======================================================
           MOBILE ELEMENTS
           ====================================================== */

        .mobileHeader,
        .mobileMenu,
        .mobileReportsHeading,
        .bottomNav {
          display: none;
        }

        /* ======================================================
           TABLET
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

          .statsGrid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .reportsGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

        }

        /* ======================================================
           PHONE
           ====================================================== */

        @media (max-width: 700px) {

          .reports {
            display: block;

            min-height: 100vh;

            padding-bottom: 75px;
          }

          .sidebar {
            display: none;
          }

          /* ==================================================
             EXACT DASHBOARD MOBILE HEADER
             ================================================== */

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
              rgba(3, 18, 40, 0.98);

            border-bottom:
              1px solid #193650;
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

          /* ==================================================
             EXACT DASHBOARD MOBILE BELL + BLUE DOT
             ================================================== */

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

            line-height: 1;
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
              rgba(22, 142, 255, 0.6);
          }

          .mobileBell:hover {
            background:
              rgba(22, 142, 255, 0.05);

            border-radius: 50%;
          }

          /* ==================================================
             MOBILE MENU
             ================================================== */

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
              rgba(25, 111, 200, 0.14);
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

          /* ==================================================
             CONTENT
             ================================================== */

          .content {
            width: 100%;

            padding:
              22px 15px 30px;
          }

          .topBar {
            display: none;
          }

          .mobileReportsHeading {
            display: block;

            padding:
              8px 2px 16px;
          }

          .mobileReportsHeading h1 {
            font-size: 25px;

            line-height: 1.25;
          }

          .mobileReportsHeading p {
            font-size: 12px;

            line-height: 1.5;
          }

          /* ==================================================
             DATABASE NOTICE
             ================================================== */

          .databaseNotice {
            margin-top: 4px;

            align-items: flex-start;
          }

          .databaseNotice p {
            line-height: 1.4;
          }

          /* ==================================================
             STATS
             ================================================== */

          .statsGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

            gap: 9px;

            margin-top: 4px;
          }

          .statCard {
            padding: 12px;

            gap: 9px;

            min-height: 102px;
          }

          .statIcon {
            width: 34px;

            height: 34px;

            font-size: 15px;
          }

          .statLabel {
            white-space: normal;

            font-size: 9px;
          }

          .statNumber {
            font-size: 20px;
          }

          /* ==================================================
             FILTER
             ================================================== */

          .filterRow {
            grid-template-columns: 1fr;

            gap: 9px;

            margin-top: 18px;
          }

          .searchBox {
            height: 46px;
          }

          .filterTrigger {
            height: 52px;
          }

          .searchBox input {
            font-size: 11px;
          }

          .filterTriggerText strong {
            font-size: 12px;
          }

          .filterSmallLabel {
            font-size: 7px;
          }

          .filterOption {
            min-height: 58px;
          }

          .filterOptionText strong {
            font-size: 11px;
          }

          .filterOptionText span {
            font-size: 8px;
          }

          /* ==================================================
             REPORTS
             ================================================== */

          .reportsSectionHeader {
            margin-top: 23px;

            margin-bottom: 12px;
          }

          .reportsSectionHeader h2 {
            font-size: 16px;
          }

          .reportsSectionHeader span {
            font-size: 10px;
          }

          .reportsGrid {
            grid-template-columns: 1fr;

            gap: 11px;
          }

          .reportCard {
            min-height: 0;

            padding: 15px;
          }

          .propertyReportIcon {
            width: 42px;

            height: 42px;

            font-size: 20px;
          }

          .reportTitle h3 {
            font-size: 14px;
          }

          .reportId {
            font-size: 9px;
          }

          .statusBadge {
            padding:
              4px 6px;

            font-size: 8px;
          }

          .cardDivider {
            margin:
              15px 0;
          }

          .reportDetails {
            gap: 13px;
          }

          .detailRow {
            grid-template-columns:
              18px 1fr auto;

            font-size: 10px;

            gap: 8px;
          }

          .detailRow strong {
            font-size: 10px;

            max-width: 150px;
          }

          .reportActions {
            margin-top: 18px;

            gap: 7px;
          }

          .viewReportButton,
          .downloadButton {
            height: 37px;

            font-size: 10px;
          }

          .emptyReportCard,
          .loadingReportsCard {
            min-height: 300px;
          }

          .infoBar {
            margin-top: 16px;

            padding: 13px;
          }

          .infoBar p {
            font-size: 9px;
          }

          /* ==================================================
             BOTTOM NAV
             EXACT DASHBOARD STRUCTURE
             ================================================== */

          .bottomNav {
            position: fixed;

            display: flex;

            left: 0;

            right: 0;

            bottom: 0;

            height: 74px;

            z-index: 150;

            background:
              rgba(3, 18, 40, 0.98);

            border-top:
              1px solid #193650;

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

          .mobileReportsHeading h1 {
            font-size: 22px;
          }

          .statCard {
            padding: 10px;
          }

          .statIcon {
            display: none;
          }

          .statNumber {
            font-size: 18px;
          }

          .reportTitle h3 {
            font-size: 13px;
          }

          .filterOptionText span {
            display: none;
          }

        }

      `}</style>

    </main>
  );
}