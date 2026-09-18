"use client";

import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type ReportStatus =
  | "pending"
  | "under_review"
  | "resolved"
  | "dismissed";

type FraudReport = {
  id: string;
  created_at: string;
  user_id: string;
  document_name: string | null;
  property_location: string | null;
  issue_type: string;
  description: string;
  contact: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatIssueType(value: string): string {
  const labels: Record<string, string> = {
    "possible-forgery": "Possible document forgery",
    "possible-manipulation": "Possible document manipulation",
    "information-mismatch": "Information does not match",
    "duplicate-document": "Possible duplicate document",
    "ownership-concern": "Ownership information concern",
    "suspicious-activity": "Other suspicious activity",
  };

  return (
    labels[value] ||
    value.replace(/[-_]/g, " ")
  );
}

function shortUserId(value: string): string {
  if (!value) return "Unknown user";

  if (value.length <= 14) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

function statusLabel(status: ReportStatus): string {
  switch (status) {
    case "under_review":
      return "Under Review";

    case "resolved":
      return "Resolved";

    case "dismissed":
      return "Dismissed";

    default:
      return "Pending";
  }
}

export default function AdminFraudWatchPage() {
  const router = useRouter();

  const [reports, setReports] = useState<FraudReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorizing, setAuthorizing] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | ReportStatus
  >("all");

  const [selectedReport, setSelectedReport] =
    useState<FraudReport | null>(null);

  const [selectedStatus, setSelectedStatus] =
    useState<ReportStatus>("pending");

  const [adminNotes, setAdminNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  /*
   * ============================================================
   * CHECK ADMIN ACCESS
   * ============================================================
   */

  const checkAdminAccess = useCallback(async () => {
    setAuthorizing(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.replace("/signin");
        return false;
      }

      setAdminEmail(user.email || "");

      const {
        data: adminUser,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select("id,user_id,role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError) {
        throw adminError;
      }

      if (!adminUser) {
        setErrorMessage(
          "You do not have administrator access to this area.",
        );

        setAuthorizing(false);
        return false;
      }

      setAuthorizing(false);

      return true;
    } catch (error) {
      console.error(
        "ADMIN AUTHORIZATION ERROR:",
        error,
      );

      setErrorMessage(
        "Unable to verify administrator access right now.",
      );

      setAuthorizing(false);

      return false;
    }
  }, [router]);

  /*
   * ============================================================
   * LOAD FRAUD REPORTS
   * ============================================================
   */

  const loadReports = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.replace("/signin");
        return;
      }

      const {
        data: adminUser,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select("id,user_id,role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError) {
        throw adminError;
      }

      if (!adminUser) {
        setErrorMessage(
          "You do not have administrator access to this area.",
        );

        setReports([]);

        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("fraud_reports")
        .select(
          "id,created_at,user_id,document_name,property_location,issue_type,description,contact,status,admin_notes,reviewed_at,reviewed_by",
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setReports(
        (data || []) as FraudReport[],
      );
    } catch (error) {
      console.error(
        "ADMIN FRAUD REPORT LOAD ERROR:",
        error,
      );

      setErrorMessage(
        "Unable to load suspicious-activity reports right now.",
      );

      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  /*
   * ============================================================
   * INITIALIZE ADMIN PAGE
   * ============================================================
   */

  useEffect(() => {
    let active = true;

    async function initialize() {
      const allowed =
        await checkAdminAccess();

      if (!active) {
        return;
      }

      if (!allowed) {
        setLoading(false);
        return;
      }

      await loadReports();
    }

    initialize();

    return () => {
      active = false;
    };
  }, [
    checkAdminAccess,
    loadReports,
  ]);

  /*
   * ============================================================
   * FILTER REPORTS
   * ============================================================
   */

  const filteredReports = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !query ||
        (report.document_name || "")
          .toLowerCase()
          .includes(query) ||
        (report.property_location || "")
          .toLowerCase()
          .includes(query) ||
        report.issue_type
          .toLowerCase()
          .includes(query) ||
        report.description
          .toLowerCase()
          .includes(query) ||
        (report.contact || "")
          .toLowerCase()
          .includes(query) ||
        report.user_id
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        report.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    reports,
    search,
    statusFilter,
  ]);

  /*
   * ============================================================
   * SUMMARY COUNTS
   * ============================================================
   */

  const pendingCount = reports.filter(
    (report) =>
      report.status === "pending",
  ).length;

  const underReviewCount =
    reports.filter(
      (report) =>
        report.status === "under_review",
    ).length;

  const resolvedCount = reports.filter(
    (report) =>
      report.status === "resolved",
  ).length;

  const dismissedCount =
    reports.filter(
      (report) =>
        report.status === "dismissed",
    ).length;

  /*
   * ============================================================
   * OPEN REPORT
   * ============================================================
   */

  function openReport(
    report: FraudReport,
  ) {
    setSelectedReport(report);
    setSelectedStatus(
      report.status,
    );
    setAdminNotes(
      report.admin_notes || "",
    );
    setSaveMessage("");
  }

  function closeReport() {
    if (saving) {
      return;
    }

    setSelectedReport(null);
    setAdminNotes("");
    setSaveMessage("");
  }

  /*
   * ============================================================
   * UPDATE REPORT
   * ============================================================
   */

  async function updateReport() {
    if (!selectedReport || saving) {
      return;
    }

    setSaving(true);
    setSaveMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.replace("/signin");
        return;
      }

      const {
        data: adminUser,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select("id,user_id,role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError) {
        throw adminError;
      }

      if (!adminUser) {
        throw new Error(
          "Administrator access required.",
        );
      }

      const reviewedAt =
        selectedStatus === "pending"
          ? null
          : new Date().toISOString();

      const reviewedBy =
        selectedStatus === "pending"
          ? null
          : user.id;

      const cleanedNotes =
        adminNotes.trim() || null;

      const {
        error: updateError,
      } = await supabase
        .from("fraud_reports")
        .update({
          status: selectedStatus,
          admin_notes: cleanedNotes,
          reviewed_at: reviewedAt,
          reviewed_by: reviewedBy,
        })
        .eq(
          "id",
          selectedReport.id,
        );

      if (updateError) {
        throw updateError;
      }

      const updatedReport: FraudReport =
        {
          ...selectedReport,
          status: selectedStatus,
          admin_notes: cleanedNotes,
          reviewed_at: reviewedAt,
          reviewed_by: reviewedBy,
        };

      setReports((current) =>
        current.map((report) =>
          report.id ===
          updatedReport.id
            ? updatedReport
            : report,
        ),
      );

      setSelectedReport(
        updatedReport,
      );

      setSaveMessage(
        "Report updated successfully.",
      );
    } catch (error) {
      console.error(
        "ADMIN FRAUD REPORT UPDATE ERROR:",
        error,
      );

      setSaveMessage(
        "Unable to update this report. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (authorizing || loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingSpinner}>
            <div
              style={
                styles.loadingSpinnerInner
              }
            />
          </div>

          <h2 style={styles.loadingTitle}>
            Loading Fraud Watch
          </h2>

          <p
            style={
              styles.loadingDescription
            }
          >
            {authorizing
              ? "Verifying administrator access..."
              : "Loading suspicious-activity reports..."}
          </p>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * ADMIN FRAUD WATCH
   * ============================================================
   */

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}

        <header style={styles.header}>
          <div>
            <button
              type="button"
              onClick={() =>
                router.push("/admin")
              }
              style={styles.backButton}
            >
              ← Admin Dashboard
            </button>

            <div style={styles.eyebrow}>
              PROPERTYSURE AI ADMINISTRATION
            </div>

            <h1 style={styles.title}>
              Fraud Watch
            </h1>

            <p style={styles.subtitle}>
              Review suspicious-activity
              reports submitted by
              PropertySure AI users.
            </p>
          </div>

          <div style={styles.adminBox}>
            <span
              style={styles.adminLabel}
            >
              ADMINISTRATOR
            </span>

            <strong
              style={styles.adminEmail}
            >
              {adminEmail ||
                "Authenticated admin"}
            </strong>
          </div>
        </header>

        {/* ERROR */}

        {errorMessage && (
          <div
            style={styles.errorBanner}
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {/* STATS */}

        <section style={styles.statsGrid}>
          <article
            style={styles.statCard}
          >
            <span
              style={styles.statLabel}
            >
              TOTAL REPORTS
            </span>

            <strong
              style={styles.statNumber}
            >
              {reports.length}
            </strong>

            <small
              style={
                styles.statDescription
              }
            >
              All submitted
              suspicious-activity
              reports
            </small>
          </article>

          <article
            style={styles.statCard}
          >
            <span
              style={styles.statLabel}
            >
              PENDING
            </span>

            <strong
              style={styles.statNumber}
            >
              {pendingCount}
            </strong>

            <small
              style={
                styles.statDescription
              }
            >
              Reports awaiting
              review
            </small>
          </article>

          <article
            style={styles.statCard}
          >
            <span
              style={styles.statLabel}
            >
              UNDER REVIEW
            </span>

            <strong
              style={styles.statNumber}
            >
              {underReviewCount}
            </strong>

            <small
              style={
                styles.statDescription
              }
            >
              Reports currently
              being reviewed
            </small>
          </article>

          <article
            style={styles.statCard}
          >
            <span
              style={styles.statLabel}
            >
              RESOLVED
            </span>

            <strong
              style={styles.statNumber}
            >
              {resolvedCount}
            </strong>

            <small
              style={
                styles.statDescription
              }
            >
              Reports marked
              resolved
            </small>
          </article>

          <article
            style={styles.statCard}
          >
            <span
              style={styles.statLabel}
            >
              DISMISSED
            </span>

            <strong
              style={styles.statNumber}
            >
              {dismissedCount}
            </strong>

            <small
              style={
                styles.statDescription
              }
            >
              Reports closed
              without further action
            </small>
          </article>
        </section>

        {/* REPORT PANEL */}

        <section style={styles.panel}>
          <div
            style={styles.panelHeader}
          >
            <div>
              <div
                style={
                  styles.sectionEyebrow
                }
              >
                SUSPICIOUS-ACTIVITY
                REPORTS
              </div>

              <h2
                style={styles.panelTitle}
              >
                Submitted Reports
              </h2>

              <p
                style={
                  styles.panelDescription
                }
              >
                Review reports submitted
                through the user-facing
                Fraud Watch reporting form.
              </p>
            </div>

            <button
              type="button"
              onClick={loadReports}
              style={styles.refreshButton}
            >
              ↻ Refresh
            </button>
          </div>

          {/* SEARCH + FILTER */}

          <div style={styles.controls}>
            <div
              style={
                styles.searchWrapper
              }
            >
              <span
                style={
                  styles.searchIcon
                }
              >
                ⌕
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search reports..."
                style={
                  styles.searchInput
                }
                aria-label="Search reports"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  style={
                    styles.clearSearch
                  }
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | ReportStatus,
                )
              }
              style={
                styles.filterSelect
              }
              aria-label="Filter reports by status"
            >
              <option value="all">
                All statuses
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="under_review">
                Under Review
              </option>

              <option value="resolved">
                Resolved
              </option>

              <option value="dismissed">
                Dismissed
              </option>
            </select>
          </div>

          {/* EMPTY */}

          {filteredReports.length ===
          0 ? (
            <div
              style={styles.emptyState}
            >
              <div
                style={styles.emptyIcon}
              >
                ✓
              </div>

              <h3
                style={styles.emptyTitle}
              >
                {reports.length === 0
                  ? "No suspicious-activity reports"
                  : "No matching reports"}
              </h3>

              <p
                style={
                  styles.emptyDescription
                }
              >
                {reports.length === 0
                  ? "Reports submitted through the user-facing Fraud Watch page will appear here."
                  : "Try another search term or status filter."}
              </p>
            </div>
          ) : (
            <div
              style={styles.tableWrapper}
            >
              {/* TABLE HEADER */}

              <div
                style={
                  styles.tableHeader
                }
              >
                <span>REPORT</span>
                <span>LOCATION</span>
                <span>ISSUE</span>
                <span>STATUS</span>
                <span>SUBMITTED</span>
                <span />
              </div>

              {/* REPORT ROWS */}

              {filteredReports.map(
                (report) => (
                  <article
                    key={report.id}
                    style={
                      styles.reportRow
                    }
                  >
                    <div
                      style={
                        styles.reportMain
                      }
                    >
                      <strong
                        style={
                          styles.documentName
                        }
                      >
                        {report.document_name ||
                          "Unnamed document"}
                      </strong>

                      <span
                        style={
                          styles.reporter
                        }
                      >
                        User{" "}
                        {shortUserId(
                          report.user_id,
                        )}
                      </span>

                      {report.contact && (
                        <small
                          style={
                            styles.contact
                          }
                        >
                          {report.contact}
                        </small>
                      )}
                    </div>

                    <div
                      style={
                        styles.locationCell
                      }
                    >
                      {report.property_location ||
                        "Location not provided"}
                    </div>

                    <div
                      style={
                        styles.issueCell
                      }
                    >
                      {formatIssueType(
                        report.issue_type,
                      )}
                    </div>

                    <div>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(report.status ===
                          "pending"
                            ? styles.statusPending
                            : report.status ===
                                "under_review"
                              ? styles.statusReview
                              : report.status ===
                                  "resolved"
                                ? styles.statusResolved
                                : styles.statusDismissed),
                        }}
                      >
                        {statusLabel(
                          report.status,
                        )}
                      </span>
                    </div>

                    <div
                      style={
                        styles.dateCell
                      }
                    >
                      {formatDate(
                        report.created_at,
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          openReport(
                            report,
                          )
                        }
                        style={
                          styles.viewButton
                        }
                      >
                        Review →
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>

        {/* FOOTER NOTE */}

        <div
          style={styles.footerNote}
        >
          <strong
            style={
              styles.footerNoteStrong
            }
          >
            Fraud Watch is a review
            layer.
          </strong>

          <span>
            A submitted report is an
            alert for investigation and
            does not independently
            establish that a document,
            property or person is
            fraudulent.
          </span>
        </div>
      </div>

      {/* ======================================================
          REPORT REVIEW MODAL
          ====================================================== */}

      {selectedReport && (
        <div
          style={styles.modalOverlay}
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeReport();
            }
          }}
        >
          <div style={styles.modal}>
            {/* MODAL HEADER */}

            <div
              style={
                styles.modalHeader
              }
            >
              <div>
                <div
                  style={
                    styles.sectionEyebrow
                  }
                >
                  REPORT REVIEW
                </div>

                <h2
                  style={
                    styles.modalTitle
                  }
                >
                  {selectedReport.document_name ||
                    "Suspicious Activity Report"}
                </h2>

                <p
                  style={
                    styles.modalDate
                  }
                >
                  Submitted{" "}
                  {formatDate(
                    selectedReport.created_at,
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReport}
                style={
                  styles.closeButton
                }
                disabled={saving}
                aria-label="Close report"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <div
              style={styles.modalBody}
            >
              {/* DETAILS */}

              <div
                style={
                  styles.detailGrid
                }
              >
                <div
                  style={
                    styles.detailCard
                  }
                >
                  <span
                    style={
                      styles.detailLabel
                    }
                  >
                    PROPERTY LOCATION
                  </span>

                  <strong
                    style={
                      styles.detailValue
                    }
                  >
                    {selectedReport.property_location ||
                      "Not provided"}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailCard
                  }
                >
                  <span
                    style={
                      styles.detailLabel
                    }
                  >
                    ISSUE TYPE
                  </span>

                  <strong
                    style={
                      styles.detailValue
                    }
                  >
                    {formatIssueType(
                      selectedReport.issue_type,
                    )}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailCard
                  }
                >
                  <span
                    style={
                      styles.detailLabel
                    }
                  >
                    REPORTER USER ID
                  </span>

                  <strong
                    style={{
                      ...styles.detailValue,
                      wordBreak:
                        "break-all",
                    }}
                  >
                    {selectedReport.user_id}
                  </strong>
                </div>

                <div
                  style={
                    styles.detailCard
                  }
                >
                  <span
                    style={
                      styles.detailLabel
                    }
                  >
                    CONTACT
                  </span>

                  <strong
                    style={
                      styles.detailValue
                    }
                  >
                    {selectedReport.contact ||
                      "Not provided"}
                  </strong>
                </div>
              </div>

              {/* USER DESCRIPTION */}

              <div
                style={
                  styles.descriptionBox
                }
              >
                <span
                  style={
                    styles.detailLabel
                  }
                >
                  WHAT THE USER REPORTED
                </span>

                <p
                  style={
                    styles.descriptionText
                  }
                >
                  {selectedReport.description}
                </p>
              </div>

              {/* STATUS */}

              <div
                style={
                  styles.reviewSection
                }
              >
                <label
                  style={
                    styles.fieldLabel
                  }
                  htmlFor="report-status"
                >
                  REPORT STATUS
                </label>

                <select
                  id="report-status"
                  value={
                    selectedStatus
                  }
                  onChange={(event) =>
                    setSelectedStatus(
                      event.target
                        .value as ReportStatus,
                    )
                  }
                  style={
                    styles.modalSelect
                  }
                  disabled={saving}
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="under_review">
                    Under Review
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>

                  <option value="dismissed">
                    Dismissed
                  </option>
                </select>
              </div>

              {/* ADMIN NOTES */}

              <div
                style={
                  styles.reviewSection
                }
              >
                <label
                  style={
                    styles.fieldLabel
                  }
                  htmlFor="admin-notes"
                >
                  ADMIN NOTES
                </label>

                <textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(event) =>
                    setAdminNotes(
                      event.target.value,
                    )
                  }
                  placeholder="Add internal notes about this report..."
                  style={
                    styles.notesInput
                  }
                  rows={5}
                  disabled={saving}
                />
              </div>

              {/* REVIEW METADATA */}

              {selectedReport.reviewed_at && (
                <div
                  style={
                    styles.reviewMeta
                  }
                >
                  <span>
                    Last reviewed:{" "}
                    {formatDate(
                      selectedReport.reviewed_at,
                    )}
                  </span>

                  {selectedReport.reviewed_by && (
                    <span>
                      Reviewed by:{" "}
                      {shortUserId(
                        selectedReport.reviewed_by,
                      )}
                    </span>
                  )}
                </div>
              )}

              {/* SAVE MESSAGE */}

              {saveMessage && (
                <div
                  style={{
                    ...styles.saveMessage,
                    ...(saveMessage.includes(
                      "successfully",
                    )
                      ? styles.saveSuccess
                      : styles.saveError),
                  }}
                  role="alert"
                >
                  {saveMessage}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}

            <div
              style={
                styles.modalFooter
              }
            >
              <button
                type="button"
                onClick={closeReport}
                style={
                  styles.cancelButton
                }
                disabled={saving}
              >
                Close
              </button>

              <button
                type="button"
                onClick={updateReport}
                style={
                  styles.saveButton
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          RESPONSIVE STYLE
          ====================================================== */}

      <style jsx>{`
        @media (max-width: 1100px) {
          .admin-stats {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            );
          }
        }

        @media (max-width: 760px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .admin-box {
            width: 100%;
            box-sizing: border-box;
          }

          .admin-stats {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .admin-controls {
            flex-direction: column;
          }

          .admin-filter {
            width: 100%;
          }

          .admin-modal-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 500px) {
          .admin-page {
            padding: 24px 14px 45px !important;
          }

          .admin-stats {
            grid-template-columns: 1fr;
          }

          .admin-title {
            font-size: 27px !important;
          }

          .admin-modal-overlay {
            padding: 12px !important;
          }
        }
      `}</style>
    </main>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles: Record<
  string,
  CSSProperties
> = {
  page: {
    minHeight: "100vh",
    background: "#f5f8fc",
    color: "#13294b",
    padding: "36px 24px 60px",
    boxSizing: "border-box",
  },

  container: {
    width: "min(1240px, 100%)",
    margin: "0 auto",
  },

  loadingCard: {
    width: "min(520px, 100%)",
    margin: "16vh auto 0",
    padding: "42px 30px",
    border:
      "1px solid #dce7f1",
    borderRadius: "16px",
    background: "#ffffff",
    textAlign: "center",
    boxShadow:
      "0 8px 30px rgba(24,48,78,0.05)",
  },

  loadingSpinner: {
    width: "40px",
    height: "40px",
    margin: "0 auto 18px",
    display: "grid",
    placeItems: "center",
    border:
      "3px solid #dbe8f4",
    borderTopColor: "#1676c5",
    borderRadius: "50%",
  },

  loadingSpinnerInner: {
    width: "24px",
    height: "24px",
    border:
      "3px solid transparent",
    borderTopColor: "#1676c5",
    borderRadius: "50%",
  },

  loadingTitle: {
    margin: "0 0 7px",
    color: "#18385d",
    fontSize: "18px",
  },

  loadingDescription: {
    margin: 0,
    color: "#78899c",
    fontSize: "11px",
    lineHeight: 1.6,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "26px",
  },

  backButton: {
    display: "block",
    border: 0,
    background: "transparent",
    padding: 0,
    marginBottom: "18px",
    color: "#1676c5",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  eyebrow: {
    color: "#1681d8",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.16em",
    marginBottom: "7px",
  },

  sectionEyebrow: {
    color: "#1681d8",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    marginBottom: "7px",
  },

  title: {
    margin: 0,
    color: "#132d55",
    fontSize: "32px",
    fontWeight: 700,
    letterSpacing: "-0.03em",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#697b91",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  adminBox: {
    minWidth: "230px",
    padding: "13px 16px",
    border:
      "1px solid #dce7f1",
    borderRadius: "10px",
    background: "#ffffff",
  },

  adminLabel: {
    display: "block",
    color: "#8a9aae",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    marginBottom: "4px",
  },

  adminEmail: {
    color: "#24486c",
    fontSize: "12px",
    wordBreak: "break-word",
  },

  errorBanner: {
    marginBottom: "18px",
    padding: "13px 15px",
    border:
      "1px solid #f0caca",
    borderRadius: "10px",
    background: "#fff6f6",
    color: "#b4232d",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "18px",
  },

  statCard: {
    minWidth: 0,
    padding: "17px",
    border:
      "1px solid #dce7f1",
    borderRadius: "12px",
    background: "#ffffff",
    boxShadow:
      "0 3px 13px rgba(24,48,78,0.025)",
  },

  statLabel: {
    display: "block",
    color: "#718399",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    marginBottom: "7px",
  },

  statNumber: {
    display: "block",
    color: "#132d55",
    fontSize: "26px",
    lineHeight: 1,
    marginBottom: "7px",
  },

  statDescription: {
    display: "block",
    color: "#8998aa",
    fontSize: "10px",
    lineHeight: 1.45,
  },

  panel: {
    border:
      "1px solid #dce7f1",
    borderRadius: "14px",
    background: "#ffffff",
    overflow: "hidden",
    boxShadow:
      "0 4px 18px rgba(24,48,78,0.025)",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    padding: "21px 22px",
    borderBottom:
      "1px solid #e6edf4",
  },

  panelTitle: {
    margin: 0,
    color: "#132d55",
    fontSize: "21px",
    letterSpacing: "-0.02em",
  },

  panelDescription: {
    margin: "6px 0 0",
    color: "#75869a",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  refreshButton: {
    minHeight: "37px",
    padding: "8px 13px",
    border:
      "1px solid #d5e2ef",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#1676c5",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },

  controls: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "15px 22px",
    borderBottom:
      "1px solid #edf2f7",
    background: "#fbfdff",
  },

  searchWrapper: {
    position: "relative",
    flex: 1,
    maxWidth: "470px",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform:
      "translateY(-50%)",
    color: "#8495a8",
    fontSize: "15px",
  },

  searchInput: {
    width: "100%",
    height: "38px",
    boxSizing: "border-box",
    padding:
      "8px 36px 8px 32px",
    border:
      "1px solid #d5e2ed",
    borderRadius: "8px",
    outline: 0,
    background: "#ffffff",
    color: "#19385e",
    fontSize: "11px",
  },

  clearSearch: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform:
      "translateY(-50%)",
    border: 0,
    background: "transparent",
    color: "#8292a5",
    fontSize: "17px",
    cursor: "pointer",
  },

  filterSelect: {
    minWidth: "150px",
    height: "38px",
    padding: "0 10px",
    border:
      "1px solid #d5e2ed",
    borderRadius: "8px",
    outline: 0,
    background: "#ffffff",
    color: "#315878",
    fontSize: "11px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  tableHeader: {
    minWidth: "920px",
    display: "grid",
    gridTemplateColumns:
      "1.35fr 1fr 1.2fr .8fr 1fr .65fr",
    gap: "15px",
    alignItems: "center",
    padding: "11px 22px",
    borderBottom:
      "1px solid #e6edf4",
    background: "#f8fbfe",
    color: "#8797a9",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.08em",
  },

  reportRow: {
    minWidth: "920px",
    display: "grid",
    gridTemplateColumns:
      "1.35fr 1fr 1.2fr .8fr 1fr .65fr",
    gap: "15px",
    alignItems: "center",
    padding: "17px 22px",
    borderBottom:
      "1px solid #edf2f6",
  },

  reportMain: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  documentName: {
    color: "#18385d",
    fontSize: "12px",
    lineHeight: 1.4,
  },

  reporter: {
    color: "#7c8da0",
    fontSize: "10px",
  },

  contact: {
    color: "#9aa8b8",
    fontSize: "9px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  locationCell: {
    color: "#526a83",
    fontSize: "10px",
    lineHeight: 1.45,
  },

  issueCell: {
    color: "#526a83",
    fontSize: "10px",
    lineHeight: 1.45,
  },

  dateCell: {
    color: "#72849a",
    fontSize: "10px",
    lineHeight: 1.4,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "25px",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "9px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  statusPending: {
    background: "#fff4dc",
    color: "#9b6a00",
  },

  statusReview: {
    background: "#e9f3ff",
    color: "#176cae",
  },

  statusResolved: {
    background: "#e8f7f1",
    color: "#16866c",
  },

  statusDismissed: {
    background: "#eef1f4",
    color: "#687789",
  },

  viewButton: {
    border: 0,
    background: "transparent",
    padding: "6px 0",
    color: "#1676c5",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  emptyState: {
    padding: "65px 25px",
    textAlign: "center",
  },

  emptyIcon: {
    width: "46px",
    height: "46px",
    margin: "0 auto 13px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: "#e8f7f1",
    color: "#159b7d",
    fontSize: "20px",
    fontWeight: 900,
  },

  emptyTitle: {
    margin: "0 0 6px",
    color: "#18385d",
    fontSize: "16px",
  },

  emptyDescription: {
    maxWidth: "520px",
    margin: "0 auto",
    color: "#78899c",
    fontSize: "11px",
    lineHeight: 1.6,
  },

  footerNote: {
    display: "flex",
    gap: "8px",
    marginTop: "14px",
    padding: "13px 15px",
    border:
      "1px solid #dce8f2",
    borderRadius: "10px",
    background: "#f8fbfe",
    color: "#718399",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  footerNoteStrong: {
    color: "#24486c",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background:
      "rgba(15,35,58,0.38)",
  },

  modal: {
    width: "min(760px, 100%)",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    border:
      "1px solid #d9e5ef",
    borderRadius: "15px",
    background: "#ffffff",
    boxShadow:
      "0 20px 70px rgba(15,35,58,0.18)",
    overflow: "hidden",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "21px 22px",
    borderBottom:
      "1px solid #e6edf4",
  },

  modalTitle: {
    margin: 0,
    color: "#132d55",
    fontSize: "20px",
  },

  modalDate: {
    margin: "6px 0 0",
    color: "#8494a7",
    fontSize: "10px",
  },

  closeButton: {
    width: "31px",
    height: "31px",
    flex: "0 0 31px",
    border:
      "1px solid #dce6ee",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#61758a",
    fontSize: "19px",
    lineHeight: 1,
    cursor: "pointer",
  },

  modalBody: {
    padding: "21px 22px",
    overflowY: "auto",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "10px",
    marginBottom: "15px",
  },

  detailCard: {
    padding: "13px",
    border:
      "1px solid #e1eaf2",
    borderRadius: "9px",
    background: "#f9fbfd",
  },

  detailLabel: {
    display: "block",
    marginBottom: "5px",
    color: "#8797a9",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.08em",
  },

  detailValue: {
    display: "block",
    color: "#294b6d",
    fontSize: "11px",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },

  descriptionBox: {
    marginBottom: "18px",
    padding: "15px",
    border:
      "1px solid #dce7f1",
    borderRadius: "10px",
    background: "#ffffff",
  },

  descriptionText: {
    margin: 0,
    color: "#526a83",
    fontSize: "12px",
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
  },

  reviewSection: {
    marginBottom: "16px",
  },

  fieldLabel: {
    display: "block",
    marginBottom: "7px",
    color: "#24486c",
    fontSize: "10px",
    fontWeight: 800,
  },

  modalSelect: {
    width: "100%",
    height: "40px",
    boxSizing: "border-box",
    padding: "0 10px",
    border:
      "1px solid #d5e2ed",
    borderRadius: "8px",
    outline: 0,
    background: "#ffffff",
    color: "#315878",
    fontSize: "11px",
  },

  notesInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border:
      "1px solid #d5e2ed",
    borderRadius: "8px",
    outline: 0,
    background: "#ffffff",
    color: "#315878",
    fontSize: "11px",
    lineHeight: 1.55,
    resize: "vertical",
  },

  reviewMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    padding: "11px 12px",
    borderRadius: "8px",
    background: "#f5f8fb",
    color: "#7a8b9e",
    fontSize: "9px",
  },

  saveMessage: {
    marginTop: "13px",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  saveSuccess: {
    border:
      "1px solid #cceadd",
    background: "#f0fbf6",
    color: "#16866c",
  },

  saveError: {
    border:
      "1px solid #f0caca",
    background: "#fff6f6",
    color: "#b4232d",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "9px",
    padding: "15px 22px",
    borderTop:
      "1px solid #e6edf4",
    background: "#fbfdff",
  },

  cancelButton: {
    minHeight: "38px",
    padding: "8px 14px",
    border:
      "1px solid #d5e2ef",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#315878",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },

  saveButton: {
    minHeight: "38px",
    padding: "8px 16px",
    border: 0,
    borderRadius: "8px",
    background: "#1676c5",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },
};