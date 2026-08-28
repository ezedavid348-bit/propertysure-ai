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
 * ============================================================
 * MY PROPERTIES
 * ============================================================
 *
 * AUTHENTICATION FIX
 *
 * The page waits for Supabase authentication before deciding
 * whether the user should be redirected to /signin.
 *
 * ============================================================
 */

const PROPERTIES_TABLE = "properties";

type PropertyStatus =
  | "Verified"
  | "Pending"
  | "Flagged"
  | "Unknown";

type Property = {
  id: string;
  propertyName: string;
  location: string;
  status: PropertyStatus;
  documents: number;
  createdAt: string;
  reportId: string;
  verificationLevel: string;
};

type PropertiesUser = {
  fullName: string;
  firstName: string;
  initial: string;
  plan: string;
};

/*
 * ============================================================
 * BRAND
 * ============================================================
 */

const BRAND_BLUE = "#168eff";

/*
 * ============================================================
 * HELPERS
 * ============================================================
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
): PropertyStatus {
  const normalized =
    value.trim().toLowerCase();

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

  if (
    normalized.includes("verif") ||
    normalized.includes("complete") ||
    normalized.includes("approved") ||
    normalized.includes("success")
  ) {
    return "Verified";
  }

  return "Unknown";
}

function formatDate(
  value: string
): string {
  if (!value) {
    return "Date unavailable";
  }

  const parsed = new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return value;
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

function mapProperty(
  row: Record<string, unknown>
): Property {
  const status =
    normalizeStatus(
      stringValue(
        row,
        [
          "status",
          "verification_status",
          "property_status",
          "result_status",
        ],
        "Pending"
      )
    );

  const rawId =
    stringValue(
      row,
      [
        "id",
        "property_id",
        "verification_id",
      ],
      ""
    );

  const reportId =
    stringValue(
      row,
      [
        "report_id",
        "verification_id",
        "reference_id",
        "report_reference",
      ],
      ""
    );

  return {
    id:
      rawId ||
      `${stringValue(
        row,
        ["property_name", "name"],
        "property"
      )}-${stringValue(
        row,
        ["created_at"],
        ""
      )}`,

    propertyName:
      stringValue(
        row,
        [
          "property_name",
          "propertyName",
          "name",
          "property_title",
          "title",
        ],
        "Property"
      ),

    location:
      stringValue(
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

    status,

    documents:
      numberValue(
        row,
        [
          "documents_count",
          "document_count",
          "documents",
          "file_count",
          "total_documents",
        ],
        0
      ),

    createdAt:
      stringValue(
        row,
        [
          "created_at",
          "updated_at",
          "verified_at",
          "completed_at",
        ],
        ""
      ),

    reportId,

    verificationLevel:
      stringValue(
        row,
        [
          "verification_level",
          "verification_tier",
          "service_level",
          "service_tier",
          "plan_type",
          "package",
        ],
        "Verification"
      ),
  };
}

/*
 * ============================================================
 * MY PROPERTIES PAGE
 * ============================================================
 */

export default function MyPropertiesPage() {
  const router = useRouter();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState("All Properties");

  const [
    filterOpen,
    setFilterOpen,
  ] = useState(false);

  const [
    loadingUser,
    setLoadingUser,
  ] = useState(true);

  const [
    loadingProperties,
    setLoadingProperties,
  ] = useState(true);

  const [
    properties,
    setProperties,
  ] = useState<Property[]>([]);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    user,
    setUser,
  ] = useState<PropertiesUser>({
    fullName: "User",
    firstName: "User",
    initial: "U",
    plan: "Free Plan",
  });

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   *
   * Matches Dashboard navigation structure.
   */

  const navItems = [
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
   * LOAD USER
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        setLoadingUser(true);

        const {
          data,
          error,
        } =
          await supabase.auth.getUser();

        if (error) {
          console.warn(
            "My Properties auth error:",
            error
          );

          return;
        }

        const authUser =
          data.user;

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
          initial,
          plan:
            String(
              metadataPlan
            ),
        });
      } catch (error) {
        console.warn(
          "My Properties user loading warning:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
   * ============================================================
   * LOAD PROPERTIES
   * ============================================================
   */

  const loadProperties =
    useCallback(
      async () => {
        setLoadingProperties(
          true
        );

        setErrorMessage("");

        try {
          const {
            data: authData,
            error: authError,
          } =
            await supabase.auth.getUser();

          if (authError) {
            console.warn(
              "My Properties authentication warning:",
              authError
            );

            setProperties([]);

            setErrorMessage(
              "Unable to authenticate your account."
            );

            return;
          }

          const authUser =
            authData.user;

          if (!authUser) {
            router.replace(
              "/signin"
            );

            return;
          }

          const {
            data,
            error,
          } =
            await supabase
              .from(
                PROPERTIES_TABLE
              )
              .select("*")
              .eq(
                "user_id",
                authUser.id
              );

          if (error) {
            console.warn(
              "Could not load properties.",
              {
                message:
                  error.message,
                details:
                  error.details,
                hint:
                  error.hint,
                code:
                  error.code,
              }
            );

            setProperties([]);

            setErrorMessage(
              "We couldn't connect to your properties data right now."
            );

            return;
          }

          const mappedProperties =
            (
              (data ||
                []) as Record<
                string,
                unknown
              >[]
            ).map(
              mapProperty
            );

          mappedProperties.sort(
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

          setProperties(
            mappedProperties
          );

          setErrorMessage("");
        } catch (error) {
          console.warn(
            "Properties loading warning:",
            error
          );

          setProperties([]);

          setErrorMessage(
            "Something went wrong while loading your properties."
          );
        } finally {
          setLoadingProperties(
            false
          );
        }
      },
      [router]
    );

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  /*
   * ============================================================
   * REALTIME
   * ============================================================
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
            "Properties realtime auth warning:",
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

        channel =
          supabase
            .channel(
              `properties-page-${authUser.id}`
            )
            .on(
              "postgres_changes",
              {
                event: "*",
                schema:
                  "public",
                table:
                  PROPERTIES_TABLE,
                filter:
                  `user_id=eq.${authUser.id}`,
              },
              () => {
                loadProperties();
              }
            )
            .subscribe(
              (status) => {
                if (
                  status ===
                  "CHANNEL_ERROR"
                ) {
                  console.warn(
                    "Properties realtime channel warning."
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
  }, [loadProperties]);

  /*
   * ============================================================
   * NAVIGATION HANDLER
   * ============================================================
   */

  function navigateTo(
    path: string
  ) {
    setMenuOpen(false);
    setFilterOpen(false);

    router.push(path);
  }

  /*
   * ============================================================
   * SIGN OUT
   * ============================================================
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
   * ============================================================
   * FILTER
   * ============================================================
   */

  const filteredProperties =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return properties.filter(
        (property) => {
          const matchesSearch =
            !searchText ||
            property.propertyName
              .toLowerCase()
              .includes(
                searchText
              ) ||
            property.location
              .toLowerCase()
              .includes(
                searchText
              ) ||
            property.reportId
              .toLowerCase()
              .includes(
                searchText
              );

          const matchesFilter =
            filter ===
              "All Properties" ||
            property.status ===
              filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      properties,
      search,
      filter,
    ]);

  const totalProperties =
    properties.length;

  const verifiedProperties =
    properties.filter(
      (property) =>
        property.status ===
        "Verified"
    ).length;

  const pendingProperties =
    properties.filter(
      (property) =>
        property.status ===
        "Pending"
    ).length;

  const flaggedProperties =
    properties.filter(
      (property) =>
        property.status ===
        "Flagged"
    ).length;

  /*
   * ============================================================
   * LOADING SCREEN
   * ============================================================
   */

  if (loadingUser) {
    return (
      <main className="propertiesLoading">

        <div className="loadingBrand">

          <span className="loadingLogo">
            ◆
          </span>

          <span className="loadingTitle">
            PropertySure
            <strong> AI</strong>
          </span>

        </div>

        <div className="loadingText">
          Loading your properties...
        </div>

        <style jsx>{`

          .propertiesLoading {
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

  return (
    <main className="propertiesPage">

      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <header className="mobileHeader">

        <button
          className="menuButton"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          aria-label="Open navigation"
        >
          ☰
        </button>

        <button
          className="mobileLogoButton"
          onClick={() =>
            navigateTo("/dashboard")
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
                    "/my-properties"
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
              navigateTo("/account")
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
              navigateTo("/settings")
            }
          >

            <span className="navIcon">
              ⚙
            </span>

            Settings

          </button>

          <button
            className="mobileNavItem logoutItem"
            onClick={handleSignOut}
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
            navigateTo("/dashboard")
          }
          aria-label="PropertySure AI Dashboard"
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

        <nav className="sidebarNav">

          {navItems.map(
            (item) => (
              <button
                key={item.label}
                className={`navItem ${
                  item.path ===
                  "/my-properties"
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
            navigateTo("/account")
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
            navigateTo("/settings")
          }
        >

          <span className="navIcon">
            ⚙
          </span>

          Settings

        </button>

        {/* ====================================================
            SUPPORT
            ==================================================== */}

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
              navigateTo("/account")
            }
          >
            Contact Support
          </button>

        </div>

        {/* ====================================================
            USER
            ==================================================== */}

        <button
          className="sidebarUser"
          onClick={() =>
            navigateTo("/account")
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
              {user.plan}
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
        ==================================================== */}

        <header className="topBar">

          <div>

            <div className="eyebrow">
              PROPERTYSURE AI
            </div>

            <h1>
              My Properties
            </h1>

            <p>
              View and manage your verified property portfolio.
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
                navigateTo("/account")
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
                  {user.plan}
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

        <div className="mobilePageHeading">

          <div className="eyebrow">
            PROPERTYSURE AI
          </div>

          <h1>
            My Properties
          </h1>

          <p>
            View and manage your verified property portfolio.
          </p>

        </div>

        {/* ====================================================
            DATABASE NOTICE
        ==================================================== */}

        {errorMessage && (
          <div className="databaseNotice">

            <div className="databaseNoticeIcon">
              !
            </div>

            <div className="databaseNoticeContent">

              <strong>
                Properties are temporarily unavailable
              </strong>

              <p>
                {errorMessage}
              </p>

            </div>

            <button
              onClick={() =>
                loadProperties()
              }
            >
              Retry
            </button>

          </div>
        )}

        {/* ====================================================
            STATISTICS
        ==================================================== */}

        <section className="statsGrid">

          <div className="statCard">

            <div className="statIcon blue">
              ⌂
            </div>

            <div>

              <span className="statLabel">
                Total Properties
              </span>

              <strong className="statNumber">
                {totalProperties}
              </strong>

            </div>

          </div>

          <div className="statCard">

            <div className="statIcon green">
              ✓
            </div>

            <div>

              <span className="statLabel">
                Verified
              </span>

              <strong className="statNumber">
                {verifiedProperties}
              </strong>

            </div>

          </div>

          <div className="statCard">

            <div className="statIcon orange">
              ◷
            </div>

            <div>

              <span className="statLabel">
                Pending
              </span>

              <strong className="statNumber">
                {pendingProperties}
              </strong>

            </div>

          </div>

          <div className="statCard">

            <div className="statIcon red">
              !
            </div>

            <div>

              <span className="statLabel">
                Flagged
              </span>

              <strong className="statNumber">
                {flaggedProperties}
              </strong>

            </div>

          </div>

        </section>

        {/* ====================================================
            SEARCH / FILTER
        ==================================================== */}

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
              placeholder="Search by property, location or report ID"
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

                <div className="filterStatusIcon all">
                  ⌂
                </div>

                <div className="filterTriggerText">

                  <span className="filterSmallLabel">
                    FILTER PROPERTIES
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
                    setFilterOpen(false)
                  }
                />

                <div
                  className="filterMenu"
                  role="listbox"
                  aria-label="Filter properties"
                >

                  {[
                    "All Properties",
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
                            "Verified" &&
                            "✓"}

                          {option ===
                            "Pending" &&
                            "◷"}

                          {option ===
                            "Flagged" &&
                            "!"}

                          {option ===
                            "All Properties" &&
                            "⌂"}

                        </div>

                        <div className="filterOptionText">

                          <strong>
                            {option}
                          </strong>

                          <span>
                            {option ===
                              "All Properties" &&
                              "View all properties"}

                            {option ===
                              "Verified" &&
                              "Successfully verified properties"}

                            {option ===
                              "Pending" &&
                              "Properties still under verification"}

                            {option ===
                              "Flagged" &&
                              "Properties requiring attention"}
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

        {/* ====================================================
            SECTION HEADER
        ==================================================== */}

        <div className="propertiesSectionHeader">

          <h2>
            My Properties
          </h2>

          <span>
            {filteredProperties.length}{" "}
            {filteredProperties.length ===
            1
              ? "property"
              : "properties"}
          </span>

        </div>

        {/* ====================================================
            PROPERTY GRID
        ==================================================== */}

        <section className="propertiesGrid">

          {loadingProperties ? (
            <div className="loadingPropertiesCard">

              <div className="loadingSpinner" />

              <h3>
                Loading properties
              </h3>

              <p>
                Retrieving your property portfolio...
              </p>

            </div>
          ) : filteredProperties.length ===
            0 ? (

            <div className="emptyPropertyCard">

              <div className="emptyPropertyIcon">
                ⌂
              </div>

              <h3>
                No properties yet
              </h3>

              <p>
                Properties you submit for verification
                will appear here automatically after
                they are added to your account.
              </p>

              <button
                className="emptyAddPropertyButton"
                onClick={() =>
                  navigateTo("/verify")
                }
              >
                ＋ Add Property
              </button>

            </div>

          ) : (

            filteredProperties.map(
              (property) => (
                <article
                  className="propertyCard"
                  key={
                    property.id
                  }
                >

                  <div className="propertyCardHeader">

                    <div
                      className={`propertyIcon ${
                        property.status ===
                        "Verified"
                          ? "propertyGreen"
                          : property.status ===
                              "Pending"
                            ? "propertyOrange"
                            : property.status ===
                                "Flagged"
                              ? "propertyRed"
                              : "propertyBlue"
                      }`}
                    >
                      ⌂
                    </div>

                    <div className="propertyTitle">

                      <div className="propertyTitleRow">

                        <h3>
                          {
                            property.propertyName
                          }
                        </h3>

                        <span
                          className={`statusBadge ${
                            property.status ===
                            "Verified"
                              ? "verifiedBadge"
                              : property.status ===
                                  "Pending"
                                ? "pendingBadge"
                                : property.status ===
                                    "Flagged"
                                  ? "flaggedBadge"
                                  : "unknownBadge"
                          }`}
                        >

                          {property.status ===
                            "Verified" &&
                            "✓ "}

                          {property.status ===
                            "Pending" &&
                            "⌛ "}

                          {property.status ===
                            "Flagged" &&
                            "! "}

                          {
                            property.status
                          }

                        </span>

                      </div>

                      {property.reportId && (
                        <span className="reportId">
                          Report ID:{" "}
                          {
                            property.reportId
                          }
                        </span>
                      )}

                    </div>

                  </div>

                  <div className="cardDivider" />

                  <div className="propertyDetails">

                    <div className="detailRow">

                      <span className="detailIcon">
                        ⌖
                      </span>

                      <span>
                        Location
                      </span>

                      <strong>
                        {
                          property.location
                        }
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
                        {property.documents >
                        0
                          ? `${property.documents} ${
                              property.documents ===
                              1
                                ? "document"
                                : "documents"
                            }`
                          : "Package pending"}
                      </strong>

                    </div>

                    <div className="detailRow">

                      <span className="detailIcon">
                        ◷
                      </span>

                      <span>
                        Added
                      </span>

                      <strong>
                        {formatDate(
                          property.createdAt
                        )}
                      </strong>

                    </div>

                    <div className="detailRow">

                      <span className="detailIcon">
                        ✓
                      </span>

                      <span>
                        Verification
                      </span>

                      <strong>
                        {
                          property.verificationLevel
                        }
                      </strong>

                    </div>

                  </div>

                  <div className="propertyActions">

                    <button
                      className="viewPropertyButton"
                      onClick={() =>
                        navigateTo(
                          `/verification-details?property=${encodeURIComponent(
                            property.id
                          )}`
                        )
                      }
                    >
                      View Property
                    </button>

                    <button
                      className="historyButton"
                      onClick={() =>
                        navigateTo(
                          "/verification-history"
                        )
                      }
                    >
                      History
                    </button>

                  </div>

                </article>
              )
            )

          )}

        </section>

        {/* ====================================================
            INFO BAR
        ==================================================== */}

        <div className="infoBar">

          <div className="infoBarIcon">
            ✓
          </div>

          <p>
            Your property portfolio represents
            properties submitted through PropertySure AI
            and their latest verification status.
          </p>

        </div>

      </section>

      {/* ======================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}

      <nav className="bottomNav">

        <button
          className="bottomItem"
          onClick={() =>
            navigateTo("/dashboard")
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
            navigateTo("/verify")
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
          className="bottomItem active"
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
            navigateTo("/reports")
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
            navigateTo("/account")
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

        .propertiesPage {
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
        input {
          font-family: inherit;
        }

        button {
          cursor: pointer;
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

          font-size: 17px;
        }

        .navItem.active .navIcon {
          color: #ffffff;
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
            1px solid #1678df;

          background: transparent;

          color: #7eb9f5;

          cursor: pointer;
        }

        .supportButton:hover {
          background:
            rgba(
              22,
              120,
              223,
              0.1
            );
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

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
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
        .mobilePageHeading h1 {
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
        .mobilePageHeading p {
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
           MOBILE PAGE HEADING
        ====================================================== */

        .mobilePageHeading {
          display: none;
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
            rgba(
              255,
              99,
              108,
              0.25
            );

          border-radius: 10px;

          background:
            rgba(
              120,
              28,
              36,
              0.16
            );
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
            rgba(
              255,
              80,
              90,
              0.17
            );

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

          padding:
            0 13px;

          flex-shrink: 0;

          border:
            1px solid
            rgba(
              255,
              100,
              110,
              0.35
            );

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
              minmax(
                0,
                1fr
              )
            );

          gap: 12px;

          margin-top: 24px;
        }

        .statCard {
          min-height: 105px;

          padding: 18px;

          display: flex;

          align-items: center;

          gap: 13px;

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
              33,
              68,
              0.78
            );
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

        .statIcon.blue {
          background:
            rgba(
              35,
              135,
              255,
              0.2
            );

          color: #48a0ff;
        }

        .statIcon.green {
          background:
            rgba(
              30,
              190,
              125,
              0.2
            );

          color: #39d995;
        }

        .statIcon.orange {
          background:
            rgba(
              255,
              160,
              20,
              0.2
            );

          color: #ffad28;
        }

        .statIcon.red {
          background:
            rgba(
              240,
              50,
              65,
              0.2
            );

          color: #ff5261;
        }

        .statLabel {
          display: block;

          color: #91a6c0;

          font-size: 11px;

          margin-bottom: 2px;
        }

        .statNumber {
          display: block;

          font-size: 25px;

          line-height: 1;

          font-weight: 600;
        }

        /* ======================================================
           FILTER
        ====================================================== */

        .filterRow {
          display: grid;

          grid-template-columns:
            minmax(
              0,
              2fr
            )
            minmax(
              250px,
              1fr
            );

          gap: 16px;

          margin-top: 24px;
        }

        .searchBox {
          height: 56px;

          border:
            1px solid
            rgba(
              72,
              147,
              234,
              0.24
            );

          border-radius: 9px;

          background:
            rgba(
              6,
              27,
              56,
              0.75
            );

          display: flex;

          align-items: center;

          padding:
            0 17px;

          gap: 12px;

          color: #8ea5c0;
        }

        .searchIcon {
          font-size: 22px;

          line-height: 1;

          color: #8ea5c0;
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
            rgba(
              72,
              147,
              234,
              0.24
            );

          border-radius: 10px;

          background:
            rgba(
              6,
              27,
              56,
              0.82
            );

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
            rgba(
              42,
              143,
              255,
              0.55
            );

          background:
            rgba(
              8,
              34,
              68,
              0.95
            );
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

          font-size: 18px;

          transition:
            transform 0.2s;
        }

        .filterTriggerOpen
          .filterChevron {
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

          font-size: 17px;

          font-weight: 700;
        }

        .filterStatusIcon.all {
          color: #4aa0ff;

          background:
            rgba(
              39,
              127,
              239,
              0.14
            );
        }

        .filterStatusIcon.verified {
          color: #3bdd99;

          background:
            rgba(
              25,
              190,
              119,
              0.12
            );
        }

        .filterStatusIcon.pending {
          color: #ffb13d;

          background:
            rgba(
              247,
              151,
              24,
              0.12
            );
        }

        .filterStatusIcon.flagged {
          color: #ff6871;

          background:
            rgba(
              237,
              57,
              67,
              0.12
            );
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
            calc(
              100% + 9px
            );

          left: 0;

          right: 0;

          padding: 7px;

          border:
            1px solid
            rgba(
              67,
              145,
              235,
              0.28
            );

          border-radius: 13px;

          background:
            linear-gradient(
              145deg,
              rgba(
                8,
                34,
                68,
                0.99
              ),
              rgba(
                5,
                24,
                51,
                0.99
              )
            );

          box-shadow:
            0 18px 45px
            rgba(
              0,
              0,
              0,
              0.42
            );

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
            rgba(
              32,
              121,
              224,
              0.13
            );
        }

        .filterOption.selected {
          background:
            rgba(
              29,
              119,
              224,
              0.17
            );
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

          font-weight: 700;
        }

        /* ======================================================
           SECTION HEADER
        ====================================================== */

        .propertiesSectionHeader {
          display: flex;

          justify-content: space-between;

          align-items: center;

          margin:
            35px 4px 17px;
        }

        .propertiesSectionHeader h2 {
          margin: 0;

          font-size: 20px;
        }

        .propertiesSectionHeader span {
          color: #9aacc2;

          font-size: 13px;
        }

        /* ======================================================
           PROPERTY GRID
        ====================================================== */

        .propertiesGrid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap: 18px;
        }

        .propertyCard,
        .emptyPropertyCard,
        .loadingPropertiesCard {
          min-width: 0;

          border:
            1px solid
            rgba(
              70,
              145,
              230,
              0.22
            );

          border-radius: 12px;

          background:
            linear-gradient(
              145deg,
              rgba(
                7,
                31,
                65,
                0.88
              ),
              rgba(
                5,
                24,
                51,
                0.9
              )
            );
        }

        .propertyCard {
          min-height: 375px;

          padding: 21px;

          transition:
            transform 0.15s,
            border-color 0.15s;
        }

        .propertyCard:hover {
          transform:
            translateY(-1px);

          border-color:
            rgba(
              76,
              149,
              235,
              0.4
            );
        }

        .propertyCardHeader {
          display: flex;

          align-items: flex-start;

          gap: 15px;
        }

        .propertyIcon {
          width: 48px;

          height: 48px;

          flex-shrink: 0;

          border-radius: 11px;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 21px;

          font-weight: 700;
        }

        .propertyGreen {
          color: #3cda97;

          background:
            rgba(
              25,
              188,
              118,
              0.18
            );
        }

        .propertyOrange {
          color: #ffa737;

          background:
            rgba(
              244,
              145,
              20,
              0.18
            );
        }

        .propertyRed {
          color: #ff5b65;

          background:
            rgba(
              237,
              57,
              67,
              0.18
            );
        }

        .propertyBlue {
          color: #48a0ff;

          background:
            rgba(
              35,
              135,
              255,
              0.18
            );
        }

        .propertyTitle {
          min-width: 0;

          flex: 1;
        }

        .propertyTitleRow {
          display: flex;

          align-items: flex-start;

          justify-content:
            space-between;

          gap: 7px;
        }

        .propertyTitle h3 {
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
            1px solid
            transparent;
        }

        .verifiedBadge {
          color: #39dc96;

          background:
            rgba(
              24,
              188,
              117,
              0.1
            );

          border-color:
            rgba(
              24,
              188,
              117,
              0.25
            );
        }

        .pendingBadge {
          color: #ffad36;

          background:
            rgba(
              245,
              148,
              22,
              0.1
            );

          border-color:
            rgba(
              245,
              148,
              22,
              0.25
            );
        }

        .flaggedBadge {
          color: #ff626b;

          background:
            rgba(
              237,
              57,
              67,
              0.1
            );

          border-color:
            rgba(
              237,
              57,
              67,
              0.25
            );
        }

        .unknownBadge {
          color: #8ca5c2;

          background:
            rgba(
              120,
              145,
              175,
              0.1
            );

          border-color:
            rgba(
              120,
              145,
              175,
              0.2
            );
        }

        .cardDivider {
          height: 1px;

          background:
            rgba(
              255,
              255,
              255,
              0.07
            );

          margin:
            19px 0;
        }

        .propertyDetails {
          display: flex;

          flex-direction: column;

          gap: 18px;
        }

        .detailRow {
          display: grid;

          grid-template-columns:
            20px
            1fr
            auto;

          align-items: center;

          gap: 11px;

          color: #9db0c8;

          font-size: 12px;
        }

        .detailIcon {
          width: 20px;

          color: #9bb2cc;

          text-align: center;

          font-size: 16px;
        }

        .detailRow strong {
          color: #e5ecf5;

          font-size: 13px;

          font-weight: 500;

          text-align: right;

          max-width: 180px;

          overflow-wrap: anywhere;
        }

        .propertyActions {
          display: grid;

          grid-template-columns:
            1.3fr 1fr;

          gap: 11px;

          margin-top: 24px;
        }

        .viewPropertyButton,
        .historyButton {
          height: 42px;

          border-radius: 7px;

          font-size: 12px;

          font-weight: 600;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;
        }

        .viewPropertyButton {
          border:
            1px solid
            #1775d9;

          background: transparent;

          color: #56aaff;
        }

        .viewPropertyButton:hover {
          background:
            rgba(
              23,
              117,
              217,
              0.1
            );
        }

        .historyButton {
          border:
            1px solid
            #1678ef;

          background: #1478ef;

          color: #ffffff;
        }

        .historyButton:hover {
          background: #1685ff;
        }

        /* ======================================================
           EMPTY / LOADING
        ====================================================== */

        .emptyPropertyCard {
          min-height: 390px;

          padding:
            35px 25px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          grid-column:
            1 / -1;
        }

        .emptyPropertyIcon {
          width: 78px;

          height: 78px;

          border-radius: 50%;

          background:
            rgba(
              30,
              115,
              226,
              0.12
            );

          color: #3d91ff;

          display: flex;

          align-items: center;

          justify-content: center;

          margin-bottom: 21px;

          font-size: 30px;

          font-weight: 700;
        }

        .emptyPropertyCard h3 {
          margin: 0;

          font-size: 18px;
        }

        .emptyPropertyCard p {
          max-width: 320px;

          margin:
            10px 0 0;

          color: #8da3bf;

          font-size: 12px;

          line-height: 1.65;
        }

        .emptyAddPropertyButton {
          margin-top: 18px;

          height: 42px;

          padding:
            0 20px;

          border: 0;

          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              #168bff,
              #0866d1
            );

          color: #ffffff;

          font-size: 12px;

          font-weight: 600;

          box-shadow:
            0 8px 25px
            rgba(
              0,
              110,
              255,
              0.2
            );

          transition:
            transform 0.15s,
            box-shadow 0.15s;
        }

        .emptyAddPropertyButton:hover {
          transform:
            translateY(-1px);

          box-shadow:
            0 12px 30px
            rgba(
              0,
              110,
              255,
              0.3
            );
        }

        .loadingPropertiesCard {
          min-height: 390px;

          padding: 35px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          grid-column:
            1 / -1;
        }

        .loadingSpinner {
          width: 34px;

          height: 34px;

          border:
            3px solid
            rgba(
              255,
              255,
              255,
              0.12
            );

          border-top-color:
            #2389ff;

          border-radius: 50%;

          animation:
            spin
            0.8s
            linear
            infinite;

          margin-bottom: 18px;
        }

        .loadingPropertiesCard h3 {
          margin: 0;

          font-size: 17px;
        }

        .loadingPropertiesCard p {
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
            rgba(
              67,
              143,
              231,
              0.19
            );

          border-radius: 9px;

          background:
            rgba(
              10,
              44,
              88,
              0.45
            );
        }

        .infoBarIcon {
          color: #4ca2ff;

          flex-shrink: 0;

          font-size: 18px;

          font-weight: 700;
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
        .bottomNav {
          display: none;
        }

        /* ======================================================
           TABLET
        ====================================================== */

        @media (max-width: 1150px) {

          .sidebar {
            width: 230px;

            min-width: 230px;
          }

          .content {
            padding-left: 23px;

            padding-right: 23px;
          }

          .propertiesGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }

          .statsGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }

        }

        /* ======================================================
           PHONE
        ====================================================== */

        @media (max-width: 700px) {

          .propertiesPage {
            display: block;

            min-height: 100vh;

            padding-bottom: 75px;
          }

          .sidebar {
            display: none;
          }

          /* ==================================================
             MOBILE HEADER
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
              minmax(
                0,
                1fr
              )
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

          /* ==================================================
             MOBILE NOTIFICATION
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
              rgba(
                22,
                142,
                255,
                0.6
              );
          }

          .mobileBell:hover {
            background:
              rgba(
                22,
                142,
                255,
                0.05
              );

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

            justify-content:
              space-between;

            align-items:
              flex-start;
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

          .mobileNavItem.active
            .navIcon {
            color: white;
          }

          .mobileNavItem .navIcon {
            width: 20px;

            min-width: 20px;

            text-align: center;

            color: #82b9f2;
          }

          .logoutItem {
            color: #ff8b91;
          }

          .logoutItem .navIcon {
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

          .mobilePageHeading {
            display: block;

            padding:
              8px 2px 16px;
          }

          .mobilePageHeading h1 {
            font-size: 25px;

            line-height: 1.25;
          }

          .mobilePageHeading p {
            font-size: 12px;

            line-height: 1.5;
          }

          /* ==================================================
             NOTICE
          ================================================== */

          .databaseNotice {
            margin-top: 4px;

            align-items:
              flex-start;
          }

          .databaseNotice p {
            line-height: 1.4;
          }

          .databaseNotice button {
            margin-left: auto;
          }

          /* ==================================================
             STATS
          ================================================== */

          .statsGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            gap: 9px;

            margin-top: 4px;
          }

          .statCard {
            min-height: 102px;

            padding: 13px;

            gap: 10px;
          }

          .statIcon {
            width: 34px;

            height: 34px;

            font-size: 15px;
          }

          .statLabel {
            font-size: 9px;
          }

          .statNumber {
            font-size: 22px;
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
             PROPERTY SECTION
          ================================================== */

          .propertiesSectionHeader {
            margin-top: 23px;

            margin-bottom: 12px;
          }

          .propertiesSectionHeader h2 {
            font-size: 16px;
          }

          .propertiesSectionHeader span {
            font-size: 10px;
          }

          .propertiesGrid {
            grid-template-columns: 1fr;

            gap: 11px;
          }

          .propertyCard {
            min-height: 0;

            padding: 15px;
          }

          .propertyIcon {
            width: 42px;

            height: 42px;

            font-size: 18px;
          }

          .propertyTitle h3 {
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

          .propertyDetails {
            gap: 13px;
          }

          .detailRow {
            grid-template-columns:
              18px
              1fr
              auto;

            font-size: 10px;

            gap: 8px;
          }

          .detailIcon {
            width: 18px;

            font-size: 14px;
          }

          .detailRow strong {
            font-size: 10px;

            max-width: 150px;
          }

          .propertyActions {
            margin-top: 18px;

            gap: 7px;
          }

          .viewPropertyButton,
          .historyButton {
            height: 37px;

            font-size: 10px;
          }

          .emptyPropertyCard,
          .loadingPropertiesCard {
            min-height: 300px;
          }

          .emptyPropertyIcon {
            width: 65px;

            height: 65px;

            font-size: 25px;
          }

          .emptyPropertyCard h3 {
            font-size: 16px;
          }

          .emptyPropertyCard p {
            font-size: 10px;

            max-width: 290px;
          }

          .emptyAddPropertyButton {
            height: 40px;

            font-size: 11px;
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

          .mobilePageHeading h1 {
            font-size: 22px;
          }

          .statCard {
            padding: 10px;
          }

          .statIcon {
            display: none;
          }

          .statNumber {
            font-size: 20px;
          }

          .propertyTitle h3 {
            font-size: 13px;
          }

          .filterOptionText span {
            display: none;
          }

          .emptyPropertyCard {
            padding-left: 15px;

            padding-right: 15px;
          }

        }

      `}</style>

    </main>
  );
}