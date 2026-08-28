"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

/*
============================================================
TYPES
============================================================
*/

type RawVerification = {
  id: number;
  created_at: string | null;
  doc_name: string | null;
  file_url: string | null;
  status: string | null;
  trust_score: number | null;
  confidence: number | null;
  risk: string | null;
  findings: unknown;
  property_id: string | null;
  report_url: string | null;
  created_by: string | null;
  doc_type: string | null;
  user_id: string | null;
  document_paths: string[] | null;
  review_status: string | null;
  report_path: string | null;
  report_generated_at: string | null;
};

type Status =
  | "complete"
  | "review"
  | "processing"
  | "failed";

type Verification = {
  id: string;
  property: string;
  location: string;
  documents: string[];
  documentCount: number;
  verifiedCount: number;
  status: Status;
  date: string;
  time: string;
  propertyId: string | null;
  reportUrl: string | null;
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
HELPERS
============================================================
*/

function getStatus(row: RawVerification): Status {
  const value = (
    row.review_status ||
    row.status ||
    row.risk ||
    ""
  )
    .toLowerCase()
    .trim();

  if (
    value.includes("failed") ||
    value.includes("fraud")
  ) {
    return "failed";
  }

  if (
    value.includes("review") ||
    value.includes("flag")
  ) {
    return "review";
  }

  if (
    value.includes("processing") ||
    value.includes("pending") ||
    value.includes("uploaded")
  ) {
    return "processing";
  }

  if (
    value.includes("complete") ||
    value.includes("verified") ||
    value.includes("approved")
  ) {
    return "complete";
  }

  /*
   * A trust score of 100 with no obvious failure/review
   * is treated as complete.
   */
  if (
    typeof row.trust_score === "number" &&
    row.trust_score >= 90
  ) {
    return "complete";
  }

  return "processing";
}

function statusLabel(status: Status) {
  switch (status) {
    case "complete":
      return "Verification Complete";

    case "review":
      return "Review Required";

    case "processing":
      return "Processing";

    case "failed":
      return "Failed";

    default:
      return "Processing";
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function getDocumentName(
  row: RawVerification
) {
  if (row.doc_type?.trim()) {
    return row.doc_type.trim();
  }

  if (row.doc_name?.trim()) {
    return row.doc_name.trim();
  }

  return "Property Document";
}

function getPropertyName(
  row: RawVerification
) {
  /*
   * The current verifications table shown in Supabase does
   * not contain a dedicated property_name column.
   *
   * Therefore we use property_id when available and fall
   * back to the document name.
   */
  if (row.property_id?.trim()) {
    return `Property ${row.property_id}`;
  }

  if (row.doc_name?.trim()) {
    return row.doc_name
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]+/g, " ")
      .trim();
  }

  return "Property Verification";
}

function getLocation(
  row: RawVerification
) {
  /*
   * No location column is currently present in the
   * verifications table shown in Supabase.
   */
  if (row.property_id) {
    return `Property ID: ${row.property_id}`;
  }

  return "Location not provided";
}

function getDocumentKey(
  row: RawVerification
) {
  /*
   * If property_id exists, it is the best available
   * package/group identifier in the current schema.
   */
  if (row.property_id) {
    return `property:${row.property_id}`;
  }

  /*
   * Legacy rows without property_id are kept separate.
   */
  return `verification:${row.id}`;
}

function buildVerificationGroups(
  rows: RawVerification[]
): Verification[] {
  const groups = new Map<
    string,
    RawVerification[]
  >();

  for (const row of rows) {
    const key = getDocumentKey(row);

    const existing =
      groups.get(key) || [];

    existing.push(row);

    groups.set(key, existing);
  }

  return Array.from(
    groups.entries()
  ).map(
    ([groupKey, groupRows]) => {
      const newest = [...groupRows].sort(
        (a, b) => {
          const aTime =
            new Date(
              a.created_at || 0
            ).getTime();

          const bTime =
            new Date(
              b.created_at || 0
            ).getTime();

          return bTime - aTime;
        }
      )[0];

      const statuses =
        groupRows.map(getStatus);

      let status: Status =
        "processing";

      if (
        statuses.includes("failed")
      ) {
        status = "failed";
      } else if (
        statuses.includes("review")
      ) {
        status = "review";
      } else if (
        statuses.every(
          (item) =>
            item === "complete"
        )
      ) {
        status = "complete";
      } else if (
        statuses.includes("processing")
      ) {
        status = "processing";
      }

      const documentNames =
        groupRows.map(
          getDocumentName
        );

      const uniqueDocuments =
        Array.from(
          new Set(documentNames)
        );

      const verifiedCount =
        groupRows.filter(
          (row) =>
            getStatus(row) ===
            "complete"
        ).length;

      const propertyName =
        getPropertyName(newest);

      const location =
        getLocation(newest);

      return {
        id:
          newest.property_id ||
          String(newest.id),

        property:
          propertyName,

        location,

        documents:
          uniqueDocuments,

        documentCount:
          groupRows.length,

        verifiedCount,

        status,

        date:
          formatDate(
            newest.created_at
          ),

        time:
          formatTime(
            newest.created_at
          ),

        propertyId:
          newest.property_id,

        reportUrl:
          newest.report_url ||
          newest.report_path ||
          null,
      };
    }
  );
}

/*
============================================================
STATUS BADGE
============================================================
*/

function StatusBadge({
  status,
}: {
  status: Status;
}) {
  return (
    <span
      className={`statusBadge ${status}`}
    >
      <span className="statusDot" />

      {statusLabel(status)}
    </span>
  );
}

/*
============================================================
PAGE
============================================================
*/

export default function VerificationHistoryPage() {
  const router = useRouter();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    loadingUser,
    setLoadingUser,
  ] = useState(true);

  const [
    loadingHistory,
    setLoadingHistory,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<
    Status | "all"
  >("all");

  const [
    sortNewest,
    setSortNewest,
  ] = useState(true);

  const [
    verifications,
    setVerifications,
  ] = useState<
    Verification[]
  >([]);

  /*
  ============================================================
  USER
  ============================================================
  */

  const [
    user,
    setUser,
  ] = useState<DashboardUser>({
    fullName: "User",
    firstName: "User",
    email: "",
    initial: "U",
    plan: "Free Plan",
  });

  /*
  ============================================================
  NAVIGATION
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

    const loadUser =
      async () => {
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
            authUser.user_metadata ||
            {};

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
            plan:
              String(
                metadataPlan
              ),
          });

          /*
           * Load history after authentication is confirmed.
           */
          await loadVerificationHistory(
            authUser.id
          );
        } catch (error) {
          console.error(
            "Verification history user loading error:",
            error
          );
        } finally {
          if (mounted) {
            setLoadingUser(false);
          }
        }
      };

    const loadVerificationHistory =
      async (
        userId: string
      ) => {
        setLoadingHistory(true);
        setErrorMessage("");

        try {
          /*
           * IMPORTANT:
           *
           * This uses the actual Supabase table shown
           * in your screenshots:
           *
           * public.verifications
           */
          const {
            data,
            error,
          } =
            await supabase
              .from(
                "verifications"
              )
              .select(
                `
                  id,
                  created_at,
                  doc_name,
                  file_url,
                  status,
                  trust_score,
                  confidence,
                  risk,
                  findings,
                  property_id,
                  report_url,
                  created_by,
                  doc_type,
                  user_id,
                  document_paths,
                  review_status,
                  report_path,
                  report_generated_at
                `
              )
              .eq(
                "user_id",
                userId
              )
              .order(
                "created_at",
                {
                  ascending:
                    false,
                }
              );

          if (error) {
            console.error(
              "Could not load verification history:",
              error
            );

            setErrorMessage(
              error.message ||
                "Could not load verification history."
            );

            setVerifications(
              []
            );

            return;
          }

          const rows =
            (data ||
              []) as RawVerification[];

          setVerifications(
            buildVerificationGroups(
              rows
            )
          );
        } catch (error) {
          console.error(
            "Verification history database error:",
            error
          );

          setErrorMessage(
            "Unable to load verification history right now."
          );
        } finally {
          setLoadingHistory(false);
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
  SIGN OUT
  ============================================================
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
  ============================================================
  COUNTS
  ============================================================
  */

  const counts =
    useMemo(() => {
      return {
        all:
          verifications.length,

        complete:
          verifications.filter(
            (item) =>
              item.status ===
              "complete"
          ).length,

        review:
          verifications.filter(
            (item) =>
              item.status ===
              "review"
          ).length,

        processing:
          verifications.filter(
            (item) =>
              item.status ===
              "processing"
          ).length,

        failed:
          verifications.filter(
            (item) =>
              item.status ===
              "failed"
          ).length,
      };
    }, [verifications]);

  /*
  ============================================================
  FILTERED DATA
  ============================================================
  */

  const filteredVerifications =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let result =
        verifications.filter(
          (item) => {
            const matchesSearch =
              !query ||
              item.property
                .toLowerCase()
                .includes(query) ||
              item.location
                .toLowerCase()
                .includes(query) ||
              item.id
                .toLowerCase()
                .includes(query) ||
              item.documents.some(
                (document) =>
                  document
                    .toLowerCase()
                    .includes(query)
              );

            const matchesStatus =
              activeFilter ===
                "all" ||
              item.status ===
                activeFilter;

            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );

      result = [...result].sort(
        (a, b) => {
          const aDate =
            new Date(
              `${a.date} ${a.time}`
            ).getTime();

          const bDate =
            new Date(
              `${b.date} ${b.time}`
            ).getTime();

          return sortNewest
            ? bDate - aDate
            : aDate - bDate;
        }
      );

      return result;
    }, [
      verifications,
      search,
      activeFilter,
      sortNewest,
    ]);

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
  LOADING SCREEN
  ============================================================
  */

  if (loadingUser) {
    return (
      <main className="historyLoading">
        <div className="loadingBrand">
          <span className="loadingDiamond">
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

        <div className="loadingText">
          Loading verification history...
        </div>

        <style jsx>{`
          .historyLoading {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at 70% 0%,
                rgba(0, 123, 255, 0.18),
                transparent 30%
              ),
              #06152f;
            color: white;
            font-family:
              Inter,
              Arial,
              Helvetica,
              sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
          }

          .loadingBrand {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 22px;
            font-weight: 700;
          }

          .loadingDiamond {
            color: #168eff;
            font-size: 28px;
          }

          .loadingBrand strong {
            color: #168eff;
          }

          .loadingText {
            color: #8ea4c3;
            font-size: 13px;
          }
        `}</style>
      </main>
    );
  }

  /*
  ============================================================
  MAIN
  ============================================================
  */

  return (
    <main className="historyPage">

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
              {" "}
              AI
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
            ●
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
                    {" "}
                    AI
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
                  key={
                    item.label
                  }
                  className={`mobileNavItem ${
                    item.path ===
                    "/verification-history"
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
                    {
                      item.icon
                    }
                  </span>

                  <span>
                    {
                      item.label
                    }
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
                {" "}
                AI
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
                key={
                  item.label
                }
                className={`navItem ${
                  item.path ===
                  "/verification-history"
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
                  {
                    item.icon
                  }
                </span>

                <span>
                  {
                    item.label
                  }
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

        <button
          className="sidebarUser"
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >
          <div className="avatar">
            {
              user.initial
            }
          </div>

          <div>
            <div className="userName">
              {
                user.fullName
              }
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
            DESKTOP HEADER
        ==================================================== */}

        <header className="topBar">

          <div className="pageHeading">

            <div className="eyebrow">
              PROPERTYSURE AI
            </div>

            <h1>
              Verification History
            </h1>

            <p>
              View and track all your property verifications.
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
                ●
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
                {
                  user.initial
                }
              </div>

              <div>
                <div className="userName">
                  {
                    user.fullName
                  }
                </div>

                <div className="userPlan">
                  {
                    planName
                  }
                </div>
              </div>

              <span className="chevron">
                ⌄
              </span>

            </button>

          </div>

        </header>

        {/* ====================================================
            MOBILE PAGE HEADING
        ==================================================== */}

        <div className="mobileWelcome">

          <div className="eyebrow">
            PROPERTYSURE AI
          </div>

          <h1>
            Verification History
          </h1>

          <p>
            View and track all your property verifications.
          </p>

        </div>

        {/* ====================================================
            NEW VERIFICATION
        ==================================================== */}

        <div className="verificationAction">

          <button
            className="newVerification"
            onClick={() =>
              navigateTo(
                "/verify"
              )
            }
          >
            <span>
              ＋
            </span>

            New Verification
          </button>

        </div>

        {/* ====================================================
            DATABASE ERROR
        ==================================================== */}

        {errorMessage && (
          <div className="errorBanner">

            <div className="errorContent">

              <div className="errorIcon">
                !
              </div>

              <div>
                <strong>
                  Unable to load verification history
                </strong>

                <span>
                  {errorMessage}
                </span>
              </div>

            </div>

            <button
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>
        )}

        {/* ====================================================
            FILTER PANEL
        ==================================================== */}

        <section className="filterPanel">

          <div className="filterRow">

            <div className="historySearch">

              <span className="searchIcon">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search by property name, location, ID or document..."
              />

            </div>

            <button
              className="selectButton"
              onClick={() => {
                const statuses: (
                  | Status
                  | "all"
                )[] = [
                  "all",
                  "complete",
                  "review",
                  "processing",
                  "failed",
                ];

                const index =
                  statuses.indexOf(
                    activeFilter
                  );

                const next =
                  statuses[
                    (index +
                      1) %
                      statuses.length
                  ];

                setActiveFilter(
                  next
                );
              }}
            >

              <span className="filterIcon">
                ≡
              </span>

              {activeFilter ===
              "all"
                ? "All Status"
                : statusLabel(
                    activeFilter
                  )}

              <span className="selectArrow">
                ⌄
              </span>

            </button>

            <button
              className="selectButton"
              onClick={() =>
                setSortNewest(
                  !sortNewest
                )
              }
            >

              <span className="sortIcon">
                ⇅
              </span>

              {sortNewest
                ? "Newest First"
                : "Oldest First"}

              <span className="selectArrow">
                ⌄
              </span>

            </button>

          </div>

          <div className="statusFilters">

            <button
              className={`filterChip ${
                activeFilter ===
                "all"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setActiveFilter(
                  "all"
                )
              }
            >
              All

              <span>
                {
                  counts.all
                }
              </span>
            </button>

            <button
              className={`filterChip complete ${
                activeFilter ===
                "complete"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setActiveFilter(
                  "complete"
                )
              }
            >
              <span className="chipDot" />

              Verification Complete

              <span>
                {
                  counts.complete
                }
              </span>
            </button>

            <button
              className={`filterChip review ${
                activeFilter ===
                "review"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setActiveFilter(
                  "review"
                )
              }
            >
              <span className="chipDot" />

              Review Required

              <span>
                {
                  counts.review
                }
              </span>
            </button>

            <button
              className={`filterChip processing ${
                activeFilter ===
                "processing"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setActiveFilter(
                  "processing"
                )
              }
            >
              <span className="chipDot" />

              Processing

              <span>
                {
                  counts.processing
                }
              </span>
            </button>

            <button
              className={`filterChip failed ${
                activeFilter ===
                "failed"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setActiveFilter(
                  "failed"
                )
              }
            >
              <span className="chipDot" />

              Failed

              <span>
                {
                  counts.failed
                }
              </span>
            </button>

          </div>

        </section>

        {/* ====================================================
            HISTORY
        ==================================================== */}

        <section className="historyTable">

          <div className="historySectionHeader">

            <h2>
              Verification History
            </h2>

            <span>
              {
                filteredVerifications.length
              }{" "}
              verification
              {
                filteredVerifications.length ===
                1
                  ? ""
                  : "s"
              }
            </span>

          </div>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loadingHistory && (
            <div className="historyLoadingState">

              <div className="spinner" />

              <h2>
                Loading verification history...
              </h2>

              <p>
                Retrieving your verification records.
              </p>

            </div>
          )}

          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {!loadingHistory &&
            filteredVerifications.length ===
              0 && (
              <div className="emptyState">

                <div className="emptyIcon">
                  ◷
                </div>

                <h2>
                  No verification history yet
                </h2>

                <p>
                  {search ||
                  activeFilter !==
                    "all"
                    ? "No verification records match your current search or filter."
                    : "Once you submit a property for verification, your verification history will appear here."}
                </p>

              </div>
            )}

          {/* ==================================================
              DESKTOP TABLE HEADER
          ================================================== */}

          {!loadingHistory &&
            filteredVerifications.length >
              0 && (
              <>
                <div className="tableHeader">

                  <div>
                    Property
                  </div>

                  <div>
                    Documents Summary
                  </div>

                  <div>
                    Overall Status
                  </div>

                  <div>
                    Date
                  </div>

                  <div>
                    Action
                  </div>

                </div>

                {/* ==================================================
                    ROWS
                ================================================== */}

                {filteredVerifications.map(
                  (item) => (
                    <article
                      className="historyRow"
                      key={
                        item.id
                      }
                    >

                      <div className="propertyCell">

                        <div className="propertyImage">
                          <div className="propertyImageIcon">
                            ◆
                          </div>
                        </div>

                        <div className="propertyInfo">

                          <strong>
                            {
                              item.property
                            }
                          </strong>

                          <span>
                            {
                              item.location
                            }
                          </span>

                          <small>
                            ID:{" "}
                            {
                              item.id
                            }
                          </small>

                        </div>

                      </div>

                      <div className="documentsCell">

                        <div className="documentCount">

                          <span className="documentIcon">
                            ▤
                          </span>

                          <strong>
                            {
                              item.verifiedCount >
                                0
                                ? `${item.verifiedCount} of ${item.documentCount} Documents Verified`
                                : `${item.documentCount} Documents Submitted`
                            }
                          </strong>

                          {item.verifiedCount >
                            0 && (
                            <span className="tinyCheck">
                              ✓
                            </span>
                          )}

                        </div>

                        <p>
                          {item.documents.join(
                            ", "
                          )}
                        </p>

                        <button
                          className="viewDocuments"
                          onClick={() =>
                            navigateTo(
                              `/verification-details?id=${encodeURIComponent(
                                item.id
                              )}`
                            )
                          }
                        >
                          View Documents (
                          {
                            item.documentCount
                          }
                          )
                        </button>

                      </div>

                      <div className="overallStatus">
                        <StatusBadge
                          status={
                            item.status
                          }
                        />
                      </div>

                      <div className="dateCell">

                        <span>
                          {
                            item.date
                          }
                        </span>

                        <small>
                          {
                            item.time
                          }
                        </small>

                      </div>

                      <div className="actionCell">

                        <button
                          className="viewDetails"
                          onClick={() =>
                            navigateTo(
                              `/verification-details?id=${encodeURIComponent(
                                item.id
                              )}`
                            )
                          }
                        >
                          View Details
                        </button>

                        <button
                          className="moreButton"
                          aria-label="More options"
                        >
                          ⋮
                        </button>

                      </div>

                    </article>
                  )
                )}

                {/* ==================================================
                    PAGINATION
                ================================================== */}

                <div className="pagination">

                  <span>
                    Showing 1 to{" "}
                    {
                      filteredVerifications.length
                    }{" "}
                    of{" "}
                    {
                      filteredVerifications.length
                    }{" "}
                    results
                  </span>

                  <div className="pageButtons">

                    <button
                      disabled
                    >
                      ‹
                    </button>

                    <button className="current">
                      1
                    </button>

                    <button
                      disabled
                    >
                      ›
                    </button>

                  </div>

                </div>
              </>
            )}

        </section>

      </section>

      {/* ======================================================
          MOBILE BOTTOM NAV
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
          className="bottomItem"
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

      {/* ======================================================
          STYLES
      ====================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .historyPage {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 72% 0%,
              rgba(
                0,
                91,
                255,
                0.25
              ),
              transparent 31%
            ),
            radial-gradient(
              circle at 40% 25%,
              rgba(
                20,
                74,
                180,
                0.10
              ),
              transparent 35%
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

        button {
          font-family: inherit;
        }

        /* ====================================================
           SIDEBAR
        ==================================================== */

        .sidebar {
          width: 245px;
          min-width: 245px;
          min-height: 100vh;
          padding:
            27px 18px 20px;
          background:
            rgba(
              4,
              20,
              47,
              0.97
            );
          border-right:
            1px solid
            rgba(
              83,
              157,
              255,
              0.16
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
          font-size: 21px;
          font-weight: 700;
          letter-spacing:
            -0.35px;
          white-space: nowrap;
        }

        .brandName strong {
          color: #168eff;
        }

        .brandLogoDiamond {
          color: #168eff;
          font-size: 23px;
          line-height: 1;
        }

        .brandSubtitle {
          margin-top: 9px;
          padding-left: 1px;
          color: #8ea4c3;
          font-size: 11px;
          line-height: 1.45;
        }

        .sidebarNav {
          margin-top: 27px;
        }

        .navItem {
          width: 100%;
          min-height: 45px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding:
            0 13px;
          margin-bottom: 4px;
          border: none;
          border-radius: 9px;
          background: transparent;
          color: #aebed4;
          font-size: 13px;
          cursor: pointer;
          text-align: left;
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
              0.22
            );
        }

        .navIcon {
          width: 20px;
          text-align: center;
          color: #82b9f2;
          flex-shrink: 0;
        }

        .navItem.active
          .navIcon {
          color: white;
        }

        .accountLabel {
          color: #607a9a;
          font-size: 9px;
          letter-spacing:
            1.6px;
          margin:
            25px 13px 9px;
        }

        /* ====================================================
           SUPPORT
        ==================================================== */

        .helpBox {
          margin-top: auto;
          padding: 15px;
          border:
            1px solid
            rgba(
              71,
              151,
              255,
              0.22
            );
          border-radius: 11px;
          background:
            rgba(
              16,
              88,
              170,
              0.08
            );
        }

        .helpTitle {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .helpText {
          color: #849ab8;
          font-size: 10px;
          line-height: 1.5;
        }

        .supportButton {
          width: 100%;
          margin-top: 11px;
          padding: 8px;
          border-radius: 7px;
          border:
            1px solid
            #1678df;
          background: transparent;
          color: #7eb9f5;
          font-size: 10px;
          cursor: pointer;
        }

        /* ====================================================
           SIDEBAR USER
        ==================================================== */

        .sidebarUser {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 17px;
          padding: 4px;
          border: none;
          background: transparent;
          color: white;
          text-align: left;
          cursor: pointer;
        }

        .avatar {
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          border-radius: 50%;
          background:
            #0879d8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
        }

        .avatar.large {
          width: 39px;
          height: 39px;
        }

        .userName {
          font-size: 12px;
          font-weight: 600;
        }

        .userPlan {
          color: #7f96b4;
          font-size: 10px;
          margin-top: 3px;
        }

        /* ====================================================
           CONTENT
        ==================================================== */

        .content {
          flex: 1;
          min-width: 0;
          padding:
            28px 32px 50px;
          overflow-x: hidden;
        }

        /* ====================================================
           HEADER
        ==================================================== */

        .topBar {
          min-height: 103px;
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
          font-size: 10px;
          letter-spacing:
            1.5px;
          margin-bottom: 7px;
        }

        .topBar h1,
        .mobileWelcome h1 {
          margin: 0;
          font-size:
            clamp(
              24px,
              3vw,
              31px
            );
          font-weight: 600;
        }

        .topBar p,
        .mobileWelcome p {
          color: #91a7c3;
          margin:
            7px 0 0;
          font-size: 12px;
        }

        .topActions {
          display: flex;
          align-items: center;
          gap: 17px;
        }

        /* ====================================================
           REPORTS-STYLE NOTIFICATION
        ==================================================== */

        .notification {
          width: 38px;
          height: 38px;
          border:
            1px solid
            rgba(
              74,
              148,
              234,
              0.28
            );
          border-radius: 50%;
          background:
            rgba(
              255,
              255,
              255,
              0.025
            );
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          padding: 0;
        }

        .bellIcon {
          width: 13px;
          height: 13px;
          border-radius:
            50% 50% 45% 45%;
          background:
            #ffc62b;
          display: block;
          font-size: 0;
          position: relative;
          box-shadow:
            0 0 10px
            rgba(
              255,
              198,
              43,
              0.24
            );
        }

        .bellIcon::after {
          content: "";
          position: absolute;
          width: 5px;
          height: 2px;
          border-radius: 50%;
          background:
            #ffc62b;
          bottom: -3px;
          left: 4px;
        }

        .notificationDot {
          position: absolute;
          width: 7px;
          height: 7px;
          top: 4px;
          right: 3px;
          border-radius: 50%;
          background: #168eff;
          box-shadow:
            0 0 8px
            rgba(
              22,
              142,
              255,
              0.65
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
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: transparent;
          color: white;
          cursor: pointer;
          text-align: left;
        }

        .chevron {
          color: #8aa0bb;
          margin-left: 3px;
        }

        /* ====================================================
           NEW VERIFICATION
        ==================================================== */

        .verificationAction {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin:
            17px 0 15px;
        }

        .newVerification {
          border: 0;
          border-radius: 8px;
          padding:
            12px 21px;
          background:
            linear-gradient(
              135deg,
              #168bff,
              #0866d1
            );
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow:
            0 8px 25px
            rgba(
              0,
              110,
              255,
              0.2
            );
        }

        .newVerification:hover {
          transform:
            translateY(-1px);
        }

        .newVerification span {
          font-size: 17px;
          margin-right: 5px;
        }

        /* ====================================================
           ERROR
        ==================================================== */

        .errorBanner {
          min-height: 57px;
          border:
            1px solid
            rgba(
              255,
              72,
              72,
              0.5
            );
          border-radius: 9px;
          background:
            rgba(
              100,
              20,
              30,
              0.16
            );
          padding:
            9px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 10px;
        }

        .errorContent {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .errorIcon {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background:
            rgba(
              255,
              73,
              73,
              0.16
            );
          color: #ff525d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .errorContent > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .errorContent strong {
          color: #ff8b8f;
          font-size: 11px;
        }

        .errorContent span {
          color: #c58d91;
          font-size: 10px;
        }

        .errorBanner button {
          border:
            1px solid
            #d75b61;
          background:
            transparent;
          color: #ff8b8f;
          border-radius: 6px;
          padding:
            7px 12px;
          cursor: pointer;
          flex-shrink: 0;
          font-size: 10px;
        }

        /* ====================================================
           FILTER PANEL
        ==================================================== */

        .filterPanel {
          width: 100%;
          border:
            1px solid
            rgba(
              76,
              149,
              235,
              0.23
            );
          border-radius:
            10px;
          background:
            rgba(
              7,
              33,
              68,
              0.55
            );
          padding: 13px;
        }

        .filterRow {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            180px;
            gap: 10px;
        }

        .historySearch,
        .selectButton {
          min-height: 42px;
          border:
            1px solid
            rgba(
              76,
              149,
              235,
              0.23
            );
          border-radius: 7px;
          background:
            rgba(
              3,
              18,
              40,
              0.75
            );
          color: #b8c9dc;
        }

        .historySearch {
          display: flex;
          align-items: center;
          gap: 9px;
          padding:
            0 12px;
        }

        .searchIcon {
          color: #7d98b8;
          font-size: 18px;
        }

        .historySearch input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: white;
          font-size: 11px;
        }

        .historySearch input::placeholder {
          color: #667e9d;
        }

        .selectButton {
          display: flex;
          align-items: center;
          gap: 8px;
          padding:
            0 11px;
          cursor: pointer;
          font-size: 11px;
          text-align: left;
        }

        .filterIcon,
        .sortIcon {
          color: #82b9f2;
          font-size: 15px;
        }

        .selectArrow {
          margin-left: auto;
          color: #7d94b1;
        }

        /* ====================================================
           STATUS CHIPS
        ==================================================== */

        .statusFilters {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          overflow-x: auto;
          padding-bottom: 1px;
        }

        .filterChip {
          height: 34px;
          padding:
            0 11px;
          border-radius: 7px;
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
              3,
              24,
              48,
              0.8
            );
          color: #b8c9dc;
          white-space: nowrap;
          font-size: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .filterChip
          > span:last-child {
          background:
            rgba(
              255,
              255,
              255,
              0.06
            );
          padding:
            2px 5px;
          border-radius: 4px;
        }

        .filterChip.selected {
          background: #0c64bd;
          border-color: #168eff;
          color: white;
        }

        .chipDot,
        .statusDot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background:
            currentColor;
          display: inline-block;
        }

        .filterChip.complete {
          color: #39d995;
        }

        .filterChip.review {
          color: #ffad28;
        }

        .filterChip.processing {
          color: #48a0ff;
        }

        .filterChip.failed {
          color: #ff5261;
        }

        .filterChip.selected.complete,
        .filterChip.selected.review,
        .filterChip.selected.processing,
        .filterChip.selected.failed {
          color: white;
        }

        /* ====================================================
           HISTORY TABLE
        ==================================================== */

        .historyTable {
          width: 100%;
          margin-top: 12px;
          border:
            1px solid
            rgba(
              76,
              149,
              235,
              0.23
            );
          border-radius: 10px;
          overflow: hidden;
          background:
            rgba(
              4,
              20,
              47,
              0.78
            );
        }

        .historySectionHeader {
          min-height: 55px;
          padding:
            0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );
        }

        .historySectionHeader h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .historySectionHeader span {
          color: #8299b6;
          font-size: 10px;
        }

        .tableHeader,
        .historyRow {
          display: grid;
          grid-template-columns:
            1.35fr
            1.25fr
            0.9fr
            0.72fr
            0.72fr;
          column-gap: 15px;
          align-items: center;
        }

        .tableHeader {
          min-height: 45px;
          padding:
            0 16px;
          color: #7791b3;
          font-size: 10px;
          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );
        }

        .historyRow {
          min-height: 110px;
          padding:
            11px 16px;
          border-bottom:
            1px solid
            rgba(
              76,
              149,
              235,
              0.13
            );
        }

        .historyRow:last-of-type {
          border-bottom: none;
        }

        /* ====================================================
           PROPERTY
        ==================================================== */

        .propertyCell {
          display: flex;
          gap: 10px;
          min-width: 0;
        }

        .propertyImage {
          width: 59px;
          height: 66px;
          flex-shrink: 0;
          border-radius: 7px;
          overflow: hidden;
          background:
            linear-gradient(
              145deg,
              #0e4174,
              #09254a
            );
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .propertyImageIcon {
          color: #39a2ff;
          font-size: 21px;
          opacity: 0.75;
        }

        .propertyInfo {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .propertyInfo strong {
          font-size: 12px;
          margin-bottom: 4px;
        }

        .propertyInfo span {
          color: #91a6c0;
          font-size: 9px;
          margin-bottom: 5px;
        }

        .propertyInfo small {
          color: #5f789a;
          font-size: 8px;
        }

        /* ====================================================
           DOCUMENTS
        ==================================================== */

        .documentsCell {
          min-width: 0;
        }

        .documentCount {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #e1e9f2;
          font-size: 10px;
        }

        .documentIcon {
          color: #82b9f2;
          font-size: 15px;
        }

        .documentsCell p {
          color: #91a6c0;
          font-size: 9px;
          line-height: 1.5;
          margin:
            6px 0 3px;
        }

        .tinyCheck {
          color: #39d995;
        }

        .viewDocuments {
          background: none;
          border: none;
          color: #48aaff;
          font-size: 8px;
          padding: 0;
          cursor: pointer;
        }

        /* ====================================================
           STATUS
        ==================================================== */

        .statusBadge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border:
            1px solid
            currentColor;
          padding:
            7px 9px;
          border-radius: 6px;
          font-size: 9px;
          white-space: nowrap;
          background:
            rgba(
              255,
              255,
              255,
              0.025
            );
        }

        .statusBadge.complete {
          color: #16d97b;
        }

        .statusBadge.review {
          color: #ffac00;
        }

        .statusBadge.processing {
          color: #1689ff;
        }

        .statusBadge.failed {
          color: #ff3f47;
        }

        /* ====================================================
           DATE
        ==================================================== */

        .dateCell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: #bac8d9;
          font-size: 9px;
        }

        .dateCell small {
          color: #8499b4;
        }

        /* ====================================================
           ACTION
        ==================================================== */

        .actionCell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .viewDetails {
          min-height: 33px;
          border:
            1px solid
            #1678df;
          background:
            rgba(
              11,
              78,
              150,
              0.12
            );
          color: #48aaff;
          border-radius: 6px;
          padding:
            0 9px;
          font-size: 9px;
          cursor: pointer;
        }

        .moreButton {
          border: none;
          background: transparent;
          color: #8ea3bd;
          cursor: pointer;
          padding: 3px;
          font-size: 17px;
        }

        /* ====================================================
           EMPTY
        ==================================================== */

        .emptyState {
          min-height: 275px;
          padding:
            50px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .emptyIcon {
          width: 55px;
          height: 55px;
          border-radius: 15px;
          border:
            1px solid
            rgba(
              22,
              142,
              255,
              0.35
            );
          background:
            rgba(
              22,
              142,
              255,
              0.08
            );
          color: #48aaff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 14px;
        }

        .emptyState h2 {
          margin:
            0 0 7px;
          font-size: 15px;
        }

        .emptyState p {
          margin: 0;
          max-width: 420px;
          color: #8299b6;
          font-size: 10px;
          line-height: 1.6;
        }

        /* ====================================================
           LOADING
        ==================================================== */

        .historyLoadingState {
          min-height: 275px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .spinner {
          width: 34px;
          height: 34px;
          border:
            3px solid
            rgba(
              22,
              142,
              255,
              0.16
            );
          border-top-color:
            #168eff;
          border-radius: 50%;
          animation:
            spin 0.8s linear infinite;
          margin-bottom: 12px;
        }

        .historyLoadingState h2 {
          margin: 0 0 5px;
          font-size: 14px;
        }

        .historyLoadingState p {
          margin: 0;
          color: #8299b6;
          font-size: 10px;
        }

        @keyframes spin {
          to {
            transform:
              rotate(360deg);
          }
        }

        /* ====================================================
           PAGINATION
        ==================================================== */

        .pagination {
          min-height: 54px;
          padding:
            0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #8298b4;
          font-size: 9px;
        }

        .pageButtons {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pageButtons button {
          width: 29px;
          height: 29px;
          background: transparent;
          border:
            1px solid
            rgba(
              80,
              140,
              200,
              0.2
            );
          border-radius: 5px;
          color: #c4d2e2;
          cursor: pointer;
        }

        .pageButtons button.current {
          background: #176ff1;
          border-color: #176ff1;
          color: white;
        }

        .pageButtons button:disabled {
          opacity: 0.35;
          cursor: default;
        }

        /* ====================================================
           MOBILE
        ==================================================== */

        .mobileHeader,
        .mobileMenu,
        .mobileWelcome,
        .bottomNav {
          display: none;
        }

        /* ====================================================
           TABLET
        ==================================================== */

        @media (max-width: 1050px) {

          .sidebar {
            width: 210px;
            min-width: 210px;
          }

          .content {
            padding:
              24px 21px 45px;
          }

          .filterRow {
            grid-template-columns:
              minmax(0, 1fr)
              165px
              150px;
          }

          .tableHeader,
          .historyRow {
            grid-template-columns:
              1.25fr
              1.15fr
              0.85fr
              0.65fr
              0.7fr;
            column-gap: 9px;
          }

        }

        /* ====================================================
           PHONE
        ==================================================== */

        @media (max-width: 700px) {

          .historyPage {
            display: block;
            min-height: 100vh;
            padding-bottom: 74px;
          }

          .sidebar {
            display: none;
          }

          .mobileHeader {
            position: sticky;
            top: 0;
            z-index: 100;
            height: 68px;
            padding:
              0 13px;
            display: grid;
            grid-template-columns:
              42px
              minmax(0, 1fr)
              42px;
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
            width: 38px;
            height: 38px;
            border: 0;
            background: transparent;
            color: white;
            font-size: 23px;
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
            gap: 6px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            min-width: 0;
          }

          .mobileLogoDiamond {
            color: #168eff;
            font-size: 22px;
            line-height: 1;
          }

          .mobileBrandName {
            white-space: nowrap;
          }

          .mobileBrandName strong {
            color: #168eff;
          }

          .mobileBell {
            width: 38px;
            height: 38px;
            border: 0;
            background: transparent;
            position: relative;
            display: grid;
            place-items: center;
            cursor: pointer;
          }

          .mobileBell
            .bellIcon {
            width: 13px;
            height: 13px;
          }

          .mobileNotificationDot {
            position: absolute;
            width: 7px;
            height: 7px;
            top: 4px;
            right: 3px;
            border-radius: 50%;
            background: #168eff;
          }

          .mobileMenu {
            position: fixed;
            inset: 0;
            z-index: 200;
            display: block;
            background: #06152f;
            padding: 21px;
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
            font-size: 24px;
          }

          .mobileMenuLogo strong {
            color: #168eff;
          }

          .mobileMenuSubtitle {
            color: #8fa5c2;
            font-size: 10px;
            line-height: 1.5;
            margin-top: 7px;
          }

          .closeMenu {
            border: 0;
            background: transparent;
            color: white;
            font-size: 29px;
            cursor: pointer;
          }

          .mobileMenuNav {
            margin-top: 32px;
          }

          .mobileNavItem {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 14px;
            padding:
              15px 13px;
            border-radius: 9px;
            border: none;
            background: transparent;
            color: #b3c3d8;
            font-size: 14px;
            margin-bottom: 4px;
            cursor: pointer;
            text-align: left;
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
            font-size: 9px;
            letter-spacing: 1.5px;
            margin:
              26px 13px 9px;
          }

          .content {
            width: 100%;
            padding:
              19px 13px 30px;
          }

          .topBar {
            display: none;
          }

          .mobileWelcome {
            display: block;
            padding:
              7px 2px 12px;
          }

          .mobileWelcome h1 {
            font-size: 24px;
            line-height: 1.25;
          }

          .mobileWelcome p {
            font-size: 11px;
            line-height: 1.5;
          }

          .verificationAction {
            display: block;
            margin:
              7px 0 12px;
          }

          .newVerification {
            width: 100%;
            padding: 14px;
          }

          .errorBanner {
            align-items: flex-start;
          }

          .errorContent span {
            line-height: 1.4;
          }

          .filterPanel {
            padding: 10px;
            border-radius: 9px;
          }

          .filterRow {
            grid-template-columns:
              1fr 1fr;
            gap: 7px;
          }

          .historySearch {
            grid-column:
              1 / -1;
            min-height: 40px;
          }

          .historySearch input {
            font-size: 10px;
          }

          .selectButton {
            min-height: 39px;
            font-size: 9px;
            padding:
              0 8px;
          }

          .statusFilters {
            gap: 6px;
            margin-top: 9px;
          }

          .filterChip {
            height: 32px;
            padding:
              0 9px;
            font-size: 8px;
          }

          .historyTable {
            margin-top: 10px;
            border-radius: 9px;
          }

          .historySectionHeader {
            min-height: 48px;
            padding:
              0 12px;
          }

          .historySectionHeader h2 {
            font-size: 13px;
          }

          .tableHeader {
            display: none;
          }

          .historyRow {
            display: block;
            min-height: 0;
            padding:
              13px 12px;
          }

          .propertyCell {
            margin-bottom: 11px;
          }

          .propertyImage {
            width: 58px;
            height: 64px;
          }

          .propertyInfo strong {
            font-size: 11px;
          }

          .propertyInfo span {
            font-size: 8px;
          }

          .propertyInfo small {
            font-size: 7px;
          }

          .documentsCell {
            padding:
              9px 0;
            border-top:
              1px solid
              rgba(
                76,
                149,
                235,
                0.1
              );
          }

          .documentCount {
            font-size: 9px;
          }

          .documentsCell p {
            font-size: 8px;
          }

          .overallStatus {
            margin:
              5px 0 9px;
          }

          .statusBadge {
            font-size: 8px;
            padding:
              5px 7px;
          }

          .dateCell {
            margin-bottom: 9px;
            font-size: 8px;
          }

          .actionCell {
            justify-content: space-between;
            padding-top: 3px;
          }

          .viewDetails {
            flex: 1;
            min-height: 37px;
          }

          .emptyState {
            min-height: 235px;
            padding:
              38px 16px;
          }

          .emptyState h2 {
            font-size: 14px;
          }

          .emptyState p {
            font-size: 9px;
          }

          .pagination {
            padding:
              9px 12px;
            min-height: 48px;
          }

          .pagination > span {
            font-size: 8px;
          }

          .pageButtons button {
            width: 26px;
            height: 26px;
          }

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
            font-size: 19px;
          }

          .bottomItem small {
            font-size: 7px;
          }

        }

        /* ====================================================
           VERY SMALL PHONES
        ==================================================== */

        @media (max-width: 380px) {

          .content {
            padding-left: 11px;
            padding-right: 11px;
          }

          .mobileLogoButton {
            font-size: 14px;
          }

          .mobileLogoDiamond {
            font-size: 20px;
          }

          .mobileWelcome h1 {
            font-size: 22px;
          }

        }

      `}</style>

    </main>
  );
}