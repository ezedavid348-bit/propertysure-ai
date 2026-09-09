"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import AppShell from "../AppShell/AppShell";
import styles from "./reports.module.css";

/*
============================================================
REPORTS CONFIGURATION
============================================================
*/

const REPORTS_TABLE = "verifications";

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

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [loadingReports, setLoadingReports] =
    useState(true);

  const [reports, setReports] =
    useState<Report[]>([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      | "All Reports"
      | "Verified"
      | "Pending"
      | "Flagged"
    >("All Reports");

  const [filterOpen, setFilterOpen] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const navigateTo = (path: string) => {
    setFilterOpen(false);
    router.push(path);
  };

  /*
  ============================================================
  AUTHENTICATION
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    async function checkAuthentication() {
      try {
        setLoadingUser(true);

        const {
          data,
          error,
        } =
          await supabase.auth.getUser();

        if (error) {
          console.warn(
            "Reports auth error:",
            error
          );

          return;
        }

        if (!data.user) {
          router.replace("/signin");
          return;
        }
      } catch (error) {
        console.warn(
          "Reports authentication warning:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, [router]);

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
                hint:
                  error.hint,
                code:
                  error.code,
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
  FILTER OPTIONS
  ============================================================
  */

  const filterOptions: {
    value:
      | "All Reports"
      | "Verified"
      | "Pending"
      | "Flagged";
    label: string;
    description: string;
  }[] = [
    {
      value: "All Reports",
      label: "All Reports",
      description:
        "View all verification reports",
    },
    {
      value: "Verified",
      label: "Verified",
      description:
        "Successfully verified reports",
    },
    {
      value: "Pending",
      label: "In Progress",
      description:
        "Reports still under verification",
    },
    {
      value: "Flagged",
      label: "Flagged",
      description:
        "Reports requiring attention",
    },
  ];

  /*
  ============================================================
  LOADING SCREEN
  ============================================================
  */

  if (
    loadingUser ||
    loadingReports
  ) {
    return (
      <main
        className={
          styles.loadingPage
        }
      >
        <div
          className={
            styles.loadingBrand
          }
        >
          <span
            className={
              styles.loadingDiamond
            }
          />

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <div
          className={
            styles.loadingIndicator
          }
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>

        <p
          className={
            styles.loadingText
          }
        >
          Loading...
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
    <AppShell activePath="/reports">
      <main
        className={styles.page}
      >
        <div
          className={
            styles.pageInner
          }
        >
          {/* PAGE HEADER */}

          <header
            className={
              styles.pageHeader
            }
          >
            <div>
              <div
                className={
                  styles.eyebrow
                }
              >
                REPORTS
              </div>

              <h1>
                Verification Reports
              </h1>

              <p>
                Access and manage your
                PropertySure AI property
                verification reports.
              </p>
            </div>
          </header>

          {/* SEARCH + FILTER */}

          <section
            className={
              styles.filterPanel
            }
          >
            <div
              className={
                styles.searchBox
              }
            >
              <span
                className={
                  styles.searchIcon
                }
              >
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
                aria-label="Search reports"
              />

              {search && (
                <button
                  className={
                    styles.clearSearch
                  }
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div
              className={
                styles.filterDropdown
              }
            >
              <button
                className={`${styles.filterTrigger} ${
                  filterOpen
                    ? styles.filterTriggerOpen
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
                <div
                  className={
                    styles.filterTriggerLeft
                  }
                >
                  <div
                    className={`${styles.filterStatusIcon} ${
                      filter ===
                      "Verified"
                        ? styles.verified
                        : filter ===
                            "Pending"
                          ? styles.pending
                          : filter ===
                              "Flagged"
                            ? styles.flagged
                            : styles.all
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

                  <div
                    className={
                      styles.filterTriggerText
                    }
                  >
                    <span>
                      FILTER REPORTS
                    </span>

                    <strong>
                      {
                        filterOptions.find(
                          (option) =>
                            option.value ===
                            filter
                        )?.label
                      }
                    </strong>
                  </div>
                </div>

                <span
                  className={
                    styles.filterChevron
                  }
                >
                  ⌄
                </span>
              </button>

              {filterOpen && (
                <>
                  <button
                    className={
                      styles.filterBackdrop
                    }
                    aria-label="Close filter"
                    onClick={() =>
                      setFilterOpen(
                        false
                      )
                    }
                  />

                  <div
                    className={
                      styles.filterMenu
                    }
                    role="listbox"
                    aria-label="Filter reports"
                  >
                    {filterOptions.map(
                      (option) => (
                        <button
                          key={
                            option.value
                          }
                          className={`${styles.filterOption} ${
                            filter ===
                            option.value
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => {
                            setFilter(
                              option.value
                            );

                            setFilterOpen(
                              false
                            );
                          }}
                          role="option"
                          aria-selected={
                            filter ===
                            option.value
                          }
                        >
                          <div
                            className={`${styles.filterStatusIcon} ${
                              option.value ===
                              "Verified"
                                ? styles.verified
                                : option.value ===
                                    "Pending"
                                  ? styles.pending
                                  : option.value ===
                                      "Flagged"
                                    ? styles.flagged
                                    : styles.all
                            }`}
                          >
                            {option.value ===
                            "Verified"
                              ? "✓"
                              : option.value ===
                                  "Pending"
                                ? "◷"
                                : option.value ===
                                    "Flagged"
                                  ? "!"
                                  : "▤"}
                          </div>

                          <div
                            className={
                              styles.filterOptionText
                            }
                          >
                            <strong>
                              {
                                option.label
                              }
                            </strong>

                            <span>
                              {
                                option.description
                              }
                            </span>
                          </div>

                          {filter ===
                            option.value && (
                            <span
                              className={
                                styles.selectedCheck
                              }
                            >
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

          {/* DATABASE NOTICE */}

          {errorMessage && (
            <div
              className={
                styles.databaseNotice
              }
            >
              <div
                className={
                  styles.databaseNoticeIcon
                }
              >
                !
              </div>

              <div
                className={
                  styles.databaseNoticeContent
                }
              >
                <strong>
                  Reports are temporarily
                  unavailable
                </strong>

                <p>
                  {errorMessage}
                </p>
              </div>

              <button
                onClick={
                  loadReports
                }
              >
                Retry
              </button>
            </div>
          )}

          {/* SUMMARY */}

          <section
            className={
              styles.statsGrid
            }
          >
            <div
              className={
                styles.statCard
              }
            >
              <div
                className={`${styles.statIcon} ${styles.statBlue}`}
              >
                ▤
              </div>

              <div>
                <span
                  className={
                    styles.statLabel
                  }
                >
                  TOTAL REPORTS
                </span>

                <strong
                  className={
                    styles.statNumber
                  }
                >
                  {totalReports}
                </strong>

                <span
                  className={
                    styles.statSubtext
                  }
                >
                  All reports
                </span>
              </div>
            </div>

            <div
              className={
                styles.statCard
              }
            >
              <div
                className={`${styles.statIcon} ${styles.statGreen}`}
              >
                ✓
              </div>

              <div>
                <span
                  className={
                    styles.statLabel
                  }
                >
                  VERIFIED
                </span>

                <strong
                  className={
                    styles.statNumber
                  }
                >
                  {verifiedReports}
                </strong>

                <span
                  className={
                    styles.statSubtext
                  }
                >
                  Completed
                </span>
              </div>
            </div>

            <div
              className={
                styles.statCard
              }
            >
              <div
                className={`${styles.statIcon} ${styles.statOrange}`}
              >
                ◷
              </div>

              <div>
                <span
                  className={
                    styles.statLabel
                  }
                >
                  IN PROGRESS
                </span>

                <strong
                  className={
                    styles.statNumber
                  }
                >
                  {pendingReports}
                </strong>

                <span
                  className={
                    styles.statSubtext
                  }
                >
                  Under verification
                </span>
              </div>
            </div>

            <div
              className={
                styles.statCard
              }
            >
              <div
                className={`${styles.statIcon} ${styles.statRed}`}
              >
                !
              </div>

              <div>
                <span
                  className={
                    styles.statLabel
                  }
                >
                  FLAGGED
                </span>

                <strong
                  className={
                    styles.statNumber
                  }
                >
                  {flaggedReports}
                </strong>

                <span
                  className={
                    styles.statSubtext
                  }
                >
                  Needs attention
                </span>
              </div>
            </div>
          </section>

          {/* REPORTS HEADER */}

          <div
            className={
              styles.reportsSectionHeader
            }
          >
            <div>
              <h2>
                Verification Reports
              </h2>

              <p>
                Your property due-diligence
                verification records
              </p>
            </div>

            <span>
              {filteredReports.length}{" "}
              {filteredReports.length ===
              1
                ? "report"
                : "reports"}
            </span>
          </div>

          {/* REPORTS */}

          <section
            className={
              styles.reportsContainer
            }
          >
            {loadingReports ? (
              <div
                className={
                  styles.loadingReportsCard
                }
              >
                <div
                  className={
                    styles.loadingSpinner
                  }
                />

                <h3>
                  Loading reports
                </h3>

                <p>
                  Retrieving your
                  verification reports...
                </p>
              </div>
            ) : filteredReports.length ===
              0 ? (
              <div
                className={
                  styles.emptyReportCard
                }
              >
                <div
                  className={
                    styles.emptyReportIcon
                  }
                >
                  ▤
                </div>

                <h3>
                  {search ||
                  filter !==
                    "All Reports"
                    ? "No matching reports"
                    : "No reports yet"}
                </h3>

                <p>
                  {search ||
                  filter !==
                    "All Reports"
                    ? "Try changing your search or filter to find another verification report."
                    : "Your completed property verification reports will appear here automatically after a verification is completed."}
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}

                <div
                  className={
                    styles.desktopTable
                  }
                >
                  <div
                    className={
                      styles.tableHeader
                    }
                  >
                    <span>
                      PROPERTY
                    </span>

                    <span>
                      LOCATION
                    </span>

                    <span>
                      STATUS
                    </span>

                    <span>
                      REPORT DATE
                    </span>

                    <span>
                      ACTION
                    </span>
                  </div>

                  {filteredReports.map(
                    (report) => (
                      <article
                        className={
                          styles.tableRow
                        }
                        key={report.id}
                      >
                        <div
                          className={
                            styles.propertyCell
                          }
                        >
                          <div
                            className={`${styles.propertyIcon} ${
                              report.status ===
                              "Verified"
                                ? styles.propertyGreen
                                : report.status ===
                                    "Pending"
                                  ? styles.propertyOrange
                                  : styles.propertyRed
                            }`}
                          >
                            ⌂
                          </div>

                          <div
                            className={
                              styles.propertyCellText
                            }
                          >
                            <strong>
                              {
                                report.propertyName
                              }
                            </strong>

                            <span>
                              Report ID:{" "}
                              {
                                report.reportId
                              }
                            </span>
                          </div>
                        </div>

                        <div
                          className={
                            styles.locationCell
                          }
                        >
                          <span
                            className={
                              styles.locationDot
                            }
                          />

                          {
                            report.location
                          }
                        </div>

                        <div>
                          <span
                            className={`${styles.statusBadge} ${
                              report.status ===
                              "Verified"
                                ? styles.verifiedBadge
                                : report.status ===
                                    "Pending"
                                  ? styles.pendingBadge
                                  : styles.flaggedBadge
                            }`}
                          >
                            <span>
                              {report.status ===
                              "Verified"
                                ? "✓"
                                : report.status ===
                                    "Pending"
                                  ? "◷"
                                  : "!"}
                            </span>

                            {report.status ===
                            "Pending"
                              ? "Verification in Progress"
                              : report.status}
                          </span>
                        </div>

                        <div
                          className={
                            styles.dateCell
                          }
                        >
                          {
                            formatDate(
                              report.createdAt,
                              report.status
                            )
                          }
                        </div>

                        <div
                          className={
                            styles.actionCell
                          }
                        >
                          <button
                            className={
                              styles.viewButton
                            }
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

                            <span>
                              →
                            </span>
                          </button>

                          <button
                            className={`${styles.pdfButton} ${
                              !report.pdfUrl
                                ? styles.disabledPdf
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
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>

                {/* MOBILE CARDS */}

                <div
                  className={
                    styles.mobileReports
                  }
                >
                  {filteredReports.map(
                    (report) => (
                      <article
                        className={
                          styles.mobileReportCard
                        }
                        key={report.id}
                      >
                        <div
                          className={
                            styles.mobileReportTop
                          }
                        >
                          <div
                            className={`${styles.propertyIcon} ${
                              report.status ===
                              "Verified"
                                ? styles.propertyGreen
                                : report.status ===
                                    "Pending"
                                  ? styles.propertyOrange
                                  : styles.propertyRed
                            }`}
                          >
                            ⌂
                          </div>

                          <div
                            className={
                              styles.mobilePropertyInfo
                            }
                          >
                            <strong>
                              {
                                report.propertyName
                              }
                            </strong>

                            <span>
                              Report ID:{" "}
                              {
                                report.reportId
                              }
                            </span>
                          </div>
                        </div>

                        <div
                          className={
                            styles.mobileStatusRow
                          }
                        >
                          <span>
                            <span
                              className={
                                styles.locationDot
                              }
                            />

                            {
                              report.location
                            }
                          </span>

                          <span
                            className={`${styles.statusBadge} ${
                              report.status ===
                              "Verified"
                                ? styles.verifiedBadge
                                : report.status ===
                                    "Pending"
                                  ? styles.pendingBadge
                                  : styles.flaggedBadge
                            }`}
                          >
                            <span>
                              {report.status ===
                              "Verified"
                                ? "✓"
                                : report.status ===
                                    "Pending"
                                  ? "◷"
                                  : "!"}
                            </span>

                            {report.status ===
                            "Pending"
                              ? "In Progress"
                              : report.status}
                          </span>
                        </div>

                        <div
                          className={
                            styles.mobileMeta
                          }
                        >
                          <div>
                            <span>
                              {report.status ===
                              "Verified"
                                ? "Generated"
                                : "Started"}
                            </span>

                            <strong>
                              {
                                formatDate(
                                  report.createdAt,
                                  report.status
                                )
                              }
                            </strong>
                          </div>

                          <div>
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
                        </div>

                        <div
                          className={
                            styles.mobileActions
                          }
                        >
                          <button
                            className={
                              styles.mobileViewButton
                            }
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

                            <span>
                              →
                            </span>
                          </button>

                          <button
                            className={`${styles.mobilePdfButton} ${
                              !report.pdfUrl
                                ? styles.disabledPdf
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
                            aria-label={
                              report.pdfUrl
                                ? "Download PDF"
                                : "PDF pending"
                            }
                          >
                            ↓
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </>
            )}
          </section>

          {/* INFORMATION */}

          <div
            className={
              styles.infoBar
            }
          >
            <div
              className={
                styles.infoIcon
              }
            >
              ⓘ
            </div>

            <div>
              <strong>
                Verification reports
              </strong>

              <p>
                Reports are generated from the
                complete property verification
                package, including document analysis
                and verification results.
              </p>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}