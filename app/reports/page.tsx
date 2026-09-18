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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function nestedValue(
  source: Record<string, unknown>,
  paths: string[][]
): unknown {
  for (const path of paths) {
    let current: unknown = source;
    for (const key of path) {
      const record = asRecord(current);
      if (!(key in record)) {
        current = undefined;
        break;
      }
      current = record[key];
    }
    if (
      current !== undefined &&
      current !== null &&
      String(current).trim() !== ""
    ) {
      return current;
    }
  }
  return undefined;
}

function getNested(
  source: Record<string, unknown>,
  ...keys: string[]
): unknown {
  let current: unknown = source;

  for (const key of keys) {
    const record = asRecord(current);
    if (!(key in record)) return undefined;
    current = record[key];
  }

  return current;
}

function firstValue(...values: unknown[]): unknown {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== "",
  );
}

function normalizeReportStatus(value: unknown): ReportStatus | null {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (!normalized) return null;

  // Canonical verification status values.
  if (
    normalized === "pending" ||
    normalized === "processing" ||
    normalized === "in progress" ||
    normalized === "in_progress" ||
    normalized === "queued" ||
    normalized === "running" ||
    normalized === "started" ||
    normalized === "inconclusive" ||
    normalized === "not started" ||
    normalized === "not_conclusive"
  ) {
    return "Pending";
  }

  if (
    normalized === "flagged" ||
    normalized === "attention" ||
    normalized === "attention required" ||
    normalized === "attention_required" ||
    normalized === "rejected"
  ) {
    return "Flagged";
  }

  if (
    normalized === "verified" ||
    normalized === "complete" ||
    normalized === "completed" ||
    normalized === "processed" ||
    normalized === "reviewed" ||
    normalized === "generated" ||
    normalized === "ready"
  ) {
    return "Verified";
  }

  return null;
}

function resolveReportStatus(
  row: Record<string, unknown>,
  paymentPlan = ""
): ReportStatus {
  // Essential/Basic uses review_status for its final AI outcome.
  // status remains the processing lifecycle value (for example, "processed"),
  // so it must not be used as the final Essential report status.
  const verificationLevel = normalizeVerificationLevel(row, paymentPlan);

  if (verificationLevel === "Basic") {
    const reviewStatus = normalizeReportStatus(row.review_status);

    if (reviewStatus) return reviewStatus;

    // An Essential verification without a final review_status has not yet
    // recorded its final outcome. Do not infer one from risk/findings/status.
    return "Pending";
  }

  // Professional/Premium continue to use their existing canonical status.
  // Their "processed" lifecycle state must not be reinterpreted through
  // Essential's review_status field.
  const databaseStatus = normalizeReportStatus(row.status);

  if (databaseStatus) return databaseStatus;

  // Older records may use a legacy status value. Keep the fallback explicit
  // and status-based only; never calculate a status from risk/findings.
  return "Pending";
}

function normalizeVerificationLevel(
  row: Record<string, unknown>,
  paymentPlan = ""
): VerificationLevel {
  const findings = asRecord(row.findings);
  const raw = [
    paymentPlan,
    stringValue(row, [
      "plan",
      "selected_plan",
      "verification_plan",
      "verification_level",
      "verification_tier",
      "service_level",
      "service_tier",
      "plan_type",
      "package",
      "package_type",
      "verification_package",
    ]),
    String(findings.plan ?? ""),
    String(findings.verification_level ?? ""),
    String(findings.verification_tier ?? ""),
  ].filter(Boolean).join(" ").toLowerCase();

  // If payment/row plan metadata is unavailable, infer the plan from the
  // same Result-page findings branch that contains the document results.
  // This keeps the report linked to the correct Essential/Professional/
  // Premium Result page without using risk or findings to invent status.
  if (getNested(findings, "premium") !== undefined) {
    return "Premium";
  }

  if (getNested(findings, "professional") !== undefined) {
    return "Professional";
  }

  if (getNested(findings, "essential") !== undefined) {
    return "Basic";
  }

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
    raw.includes("essential") ||
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
  row: Record<string, unknown>,
  paymentPlan = "",
  paymentDate = ""
): Report {
  const status = resolveReportStatus(row, paymentPlan);
  const findings = asRecord(row.findings);
  const property = asRecord(
    nestedValue(findings, [
      ["property"],
      ["professional", "property"],
      ["premium", "property"],
    ])
  );

  const createdAt = stringValue(
    row,
    [
      "completed_at",
      "generated_at",
      "created_at",
      "updated_at",
      "started_at",
    ],
    paymentDate
  );

  const verificationLevel = normalizeVerificationLevel(row, paymentPlan);

  const packageDocuments = Array.isArray(
    findings.documents
  )
    ? findings.documents.length
    : Array.isArray(findings.document_package)
      ? findings.document_package.length
      : 0;

  const documents = numberValue(
    row,
    [
      "documents_count",
      "document_count",
      "documents",
      "file_count",
      "total_documents",
    ],
    packageDocuments
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
    ["id", "verification_id", "report_id"],
    ""
  );

  const propertyName =
    stringValue(
      property,
      ["name", "property_name", "title", "property_title"],
      ""
    ) ||
    stringValue(
      row,
      [
        "property_name",
        "propertyName",
        "name",
        "property",
        "property_title",
      ],
      "Property Verification"
    );

  const location =
    stringValue(
      property,
      ["location", "address", "property_location"],
      ""
    ) ||
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
    );

  return {
    id: rawId || `${reportId}-${createdAt}`,
    propertyName,
    reportId,
    status,
    createdAt,
    documents,
    location,
    verificationLevel,
    verifiedBy:
      status === "Pending"
        ? "Verification in progress"
        : verificationMethod(verificationLevel),
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

  const REPORTS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] =
    useState(1);

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

          const rows =
            (data || []) as Record<string, unknown>[];

          const verificationIds = rows
            .map((row) => row.id)
            .filter(
              (id): id is string | number =>
                typeof id === "string" || typeof id === "number"
            );

          const paymentByVerificationId =
            new Map<string, { plan: string; date: string }>();

          if (verificationIds.length > 0) {
            const { data: paymentsData } = await supabase
              .from("payments")
              .select(
                "verification_id,plan,status,paid_at,created_at"
              )
              .in("verification_id", verificationIds)
              .order("created_at", { ascending: false });

            for (const payment of paymentsData || []) {
              const key = String(payment.verification_id);
              if (!paymentByVerificationId.has(key)) {
                paymentByVerificationId.set(key, {
                  plan: String(payment.plan || ""),
                  date: String(
                    payment.paid_at ||
                      payment.created_at ||
                      ""
                  ),
                });
              }
            }
          }

          const mappedReports = rows.map((row) => {
            const payment =
              paymentByVerificationId.get(
                String(row.id ?? "")
              );

            return mapReport(
              row,
              payment?.plan || "",
              payment?.date || ""
            );
          });

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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredReports.length / REPORTS_PER_PAGE
    )
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedReports = useMemo(() => {
    const start =
      (currentPage - 1) * REPORTS_PER_PAGE;

    return filteredReports.slice(
      start,
      start + REPORTS_PER_PAGE
    );
  }, [filteredReports, currentPage]);

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
      label: "Pending",
      description:
        "Reports awaiting verification completion",
    },
    {
      value: "Flagged",
      label: "Flagged",
      description:
        "Reports requiring attention",
    },
  ];

  function getReportDestination(report: Report): string {
    const id = encodeURIComponent(report.id);

    // Always open the Result page belonging to the report's plan.
    // Pending is a valid Result-page status, so it must not be sent to
    // /processing, which can lose the original verification context.
    if (report.verificationLevel === "Premium") {
      return `/premium-report?id=${id}`;
    }

    if (report.verificationLevel === "Professional") {
      return `/professional-report?id=${id}`;
    }

    return `/result?id=${id}`;
  }

  function reportActionLabel(report: Report): string {
    if (report.status === "Pending") return "View Status";
    if (report.status === "Flagged") return "Review Report";
    return "View Report";
  }

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
                  PENDING
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
                  Awaiting completion
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

                  {paginatedReports.map(
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
                              ? "Pending"
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
                                `${getReportDestination(report)}`
                              )
                            }
                          >
                            {reportActionLabel(report)}

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
                  {paginatedReports.map(
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
                              ? "Pending"
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
                                `${getReportDestination(report)}`
                              )
                            }
                          >
                            {reportActionLabel(report)}

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


          {/* PAGINATION */}

          {filteredReports.length > REPORTS_PER_PAGE && (
            <nav
              className={styles.paginationBar}
              aria-label="Reports pagination"
            >
              <span className={styles.paginationSummary}>
                Showing{" "}
                {(currentPage - 1) * REPORTS_PER_PAGE + 1}
                {" "}to{" "}
                {Math.min(
                  currentPage * REPORTS_PER_PAGE,
                  filteredReports.length
                )}
                {" "}of{" "}
                {filteredReports.length} reports
              </span>

              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.paginationArrow}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(1, page - 1)
                    )
                  }
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  ←
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={`${styles.paginationNumber} ${
                      page === currentPage
                        ? styles.paginationNumberActive
                        : ""
                    }`}
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    aria-current={
                      page === currentPage
                        ? "page"
                        : undefined
                    }
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className={styles.paginationArrow}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                  disabled={
                    currentPage === totalPages
                  }
                  aria-label="Next page"
                >
                  →
                </button>
              </div>
            </nav>
          )}

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