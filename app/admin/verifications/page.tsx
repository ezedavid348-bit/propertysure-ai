"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Verification = {
  id: string;
  created_at: string;
  doc_name: string | null;
  doc_type: string | null;
  status: string | null;
  review_status: string | null;
  trust_score: number | null;
  confidence: number | null;
  risk: string | null;
  findings: unknown;
  property_id: string | null;
  user_id: string | null;
  created_by: string | null;
  report_url: string | null;
  report_path: string | null;
  report_generated_at: string | null;
};

type FilterStatus =
  | "all"
  | "processing"
  | "processed"
  | "review"
  | "flagged";

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(value: string | null) {
  if (!value) {
    return "—";
  }

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function displayValue(value: string | null) {
  if (!value) {
    return "—";
  }

  return value;
}

function statusLabel(status: string | null) {
  switch (status) {
    case "processing":
      return "Processing";

    case "processed":
      return "Processed";

    case "review":
      return "Under Review";

    case "verified":
      return "Verified";

    case "flagged":
      return "Flagged";

    case "rejected":
      return "Rejected";

    default:
      return status
        ? status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
        : "Unknown";
  }
}

function reviewStatusLabel(status: string | null) {
  switch (status) {
    case "verified":
      return "Verified";

    case "flagged":
      return "Flagged";

    case "pending":
      return "Pending";

    default:
      return status
        ? status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
        : "—";
  }
}

function statusStyle(status: string | null): React.CSSProperties {
  const normalized = status?.toLowerCase();

  if (
    normalized === "verified" ||
    normalized === "processed"
  ) {
    return {
      background: "#ecfdf3",
      color: "#137a4a",
      border: "1px solid #c9ecd9",
    };
  }

  if (
    normalized === "flagged" ||
    normalized === "rejected"
  ) {
    return {
      background: "#fff1f1",
      color: "#b4232d",
      border: "1px solid #f2cccc",
    };
  }

  if (
    normalized === "review" ||
    normalized === "pending"
  ) {
    return {
      background: "#fff8e8",
      color: "#956300",
      border: "1px solid #f1dfb0",
    };
  }

  if (normalized === "processing") {
    return {
      background: "#eef6ff",
      color: "#1676c5",
      border: "1px solid #cfe2f5",
    };
  }

  return {
    background: "#f4f6f8",
    color: "#64748b",
    border: "1px solid #e2e8f0",
  };
}

function findingsText(findings: unknown) {
  if (findings === null || findings === undefined) {
    return "No findings recorded.";
  }

  if (typeof findings === "string") {
    return findings;
  }

  try {
    return JSON.stringify(findings, null, 2);
  } catch {
    return "Findings are available but could not be displayed.";
  }
}

function isFlaggedVerification(verification: Verification) {
  return (
    verification.review_status === "flagged" ||
    verification.status === "flagged" ||
    verification.status === "rejected"
  );
}

export default function AdminVerificationsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [verifications, setVerifications] = useState<Verification[]>(
    []
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<FilterStatus>("all");

  const [selectedVerification, setSelectedVerification] =
    useState<Verification | null>(null);

  const checkAdminAndLoad = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/signin");
        return;
      }

      setEmail(user.email ?? "");

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminError) {
        console.error(
          "Admin access check failed:",
          adminError
        );

        router.replace("/dashboard");
        return;
      }

      if (!admin) {
        router.replace("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("verifications")
        .select(
          `
            id,
            created_at,
            doc_name,
            doc_type,
            status,
            review_status,
            trust_score,
            confidence,
            risk,
            findings,
            property_id,
            user_id,
            created_by,
            report_url,
            report_path,
            report_generated_at
          `
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Unable to load verifications:",
          error
        );

        setErrorMessage(
          "Verification records could not be loaded right now."
        );

        setLoading(false);
        return;
      }

      setVerifications((data ?? []) as Verification[]);
      setLoading(false);
    } catch (error) {
      console.error(
        "Unexpected admin verification error:",
        error
      );

      setErrorMessage(
        "Something went wrong while loading verification records."
      );

      setLoading(false);
    }
  }, [router]);

  async function refreshVerifications() {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/signin");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminError || !admin) {
        router.replace("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("verifications")
        .select(
          `
            id,
            created_at,
            doc_name,
            doc_type,
            status,
            review_status,
            trust_score,
            confidence,
            risk,
            findings,
            property_id,
            user_id,
            created_by,
            report_url,
            report_path,
            report_generated_at
          `
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Unable to refresh verifications:",
          error
        );

        setErrorMessage(
          "Verification records could not be refreshed."
        );

        return;
      }

      setVerifications((data ?? []) as Verification[]);
    } catch (error) {
      console.error(
        "Unexpected verification refresh error:",
        error
      );

      setErrorMessage(
        "Something went wrong while refreshing verification records."
      );
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    checkAdminAndLoad();
  }, [checkAdminAndLoad]);

  const filteredVerifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return verifications.filter((verification) => {
      const matchesSearch =
        !query ||
        (verification.doc_name ?? "")
          .toLowerCase()
          .includes(query) ||
        (verification.doc_type ?? "")
          .toLowerCase()
          .includes(query) ||
        (verification.status ?? "")
          .toLowerCase()
          .includes(query) ||
        (verification.review_status ?? "")
          .toLowerCase()
          .includes(query) ||
        (verification.risk ?? "")
          .toLowerCase()
          .includes(query) ||
        (verification.user_id ?? "")
          .toLowerCase()
          .includes(query) ||
        (verification.property_id ?? "")
          .toLowerCase()
          .includes(query);

      let matchesStatus = true;

      if (statusFilter === "processing") {
        matchesStatus =
          verification.status === "processing";
      }

      if (statusFilter === "review") {
        matchesStatus =
          verification.status === "review";
      }

      if (statusFilter === "processed") {
        matchesStatus =
          verification.status === "processed";
      }

      if (statusFilter === "flagged") {
        matchesStatus =
          isFlaggedVerification(verification);
      }

      return matchesSearch && matchesStatus;
    });
  }, [verifications, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: verifications.length,

      processing: verifications.filter(
        (verification) =>
          verification.status === "processing"
      ).length,

      review: verifications.filter(
        (verification) =>
          verification.status === "review"
      ).length,

      processed: verifications.filter(
        (verification) =>
          verification.status === "processed"
      ).length,

      flagged: verifications.filter(
        (verification) =>
          isFlaggedVerification(verification)
      ).length,
    };
  }, [verifications]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={loadingContainerStyle}>
          <h2 style={loadingTitleStyle}>
            PropertySure AI
          </h2>

          <p style={loadingTextStyle}>
            Loading verification center...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={topBarStyle}>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            style={backButtonStyle}
          >
            ← Admin Dashboard
          </button>

          <button
            type="button"
            onClick={refreshVerifications}
            disabled={refreshing}
            style={{
              ...refreshButtonStyle,
              opacity: refreshing ? 0.6 : 1,
              cursor: refreshing ? "default" : "pointer",
            }}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        <header style={headerStyle}>
          <div>
            <p style={eyebrowStyle}>
              PROPERTYSURE AI ADMINISTRATION
            </p>

            <h1 style={titleStyle}>
              Verifications
            </h1>

            <p style={subtitleStyle}>
              Review property verification activity and
              verification results across the platform.
            </p>
          </div>

          <div style={administratorStyle}>
            <span style={administratorLabelStyle}>
              ADMINISTRATOR
            </span>

            <strong style={administratorEmailStyle}>
              {email}
            </strong>
          </div>
        </header>

        {errorMessage && (
          <div
            role="alert"
            style={errorStyle}
          >
            {errorMessage}
          </div>
        )}

        <section style={statsGridStyle}>
          <AdminStat
            label="Total Verifications"
            value={stats.total}
          />

          <AdminStat
            label="Processing"
            value={stats.processing}
          />

          <AdminStat
            label="Under Review"
            value={stats.review}
          />

          <AdminStat
            label="Processed"
            value={stats.processed}
          />

          <AdminStat
            label="Flagged"
            value={stats.flagged}
          />
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <p style={sectionEyebrowStyle}>
                VERIFICATION ACTIVITY
              </p>

              <h2 style={panelTitleStyle}>
                Verification Records
              </h2>

              <p style={panelSubtitleStyle}>
                Select a verification to inspect its recorded
                details and findings.
              </p>
            </div>
          </div>

          <div style={toolbarStyle}>
            <div style={searchWrapperStyle}>
              <span style={searchIconStyle}>
                ⌕
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search verifications..."
                style={searchInputStyle}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as FilterStatus
                )
              }
              style={filterSelectStyle}
            >
              <option value="all">
                All statuses
              </option>

              <option value="processing">
                Processing
              </option>

              <option value="review">
                Under Review
              </option>

              <option value="processed">
                Processed
              </option>

              <option value="flagged">
                Flagged
              </option>
            </select>
          </div>

          {filteredVerifications.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyIconStyle}>
                ✓
              </div>

              <h3 style={emptyTitleStyle}>
                No verification records found
              </h3>

              <p style={emptyTextStyle}>
                {verifications.length === 0
                  ? "There are currently no verification records available."
                  : "No verification records match your current search or filter."}
              </p>
            </div>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      VERIFICATION
                    </th>

                    <th style={thStyle}>
                      USER
                    </th>

                    <th style={thStyle}>
                      STATUS
                    </th>

                    <th style={thStyle}>
                      RISK
                    </th>

                    <th style={thStyle}>
                      TRUST SCORE
                    </th>

                    <th style={thStyle}>
                      CREATED
                    </th>

                    <th style={thStyle}>
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVerifications.map(
                    (verification) => (
                      <tr key={verification.id}>
                        <td style={tdStyle}>
                          <div style={documentNameStyle}>
                            {displayValue(
                              verification.doc_name
                            )}
                          </div>

                          <div style={secondaryTextStyle}>
                            {displayValue(
                              verification.doc_type
                            )}
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <div style={secondaryTextStyle}>
                            {shortId(
                              verification.user_id
                            )}
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              ...statusPillStyle,
                              ...statusStyle(
                                isFlaggedVerification(
                                  verification
                                )
                                  ? "flagged"
                                  : verification.status
                              ),
                            }}
                          >
                            {isFlaggedVerification(
                              verification
                            )
                              ? "Flagged"
                              : statusLabel(
                                  verification.status
                                )}
                          </span>

                          {verification.review_status && (
                            <div
                              style={
                                reviewStatusTextStyle
                              }
                            >
                              Review:{" "}
                              {reviewStatusLabel(
                                verification.review_status
                              )}
                            </div>
                          )}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              ...riskTextStyle,
                              ...(verification.risk
                                ?.toLowerCase() ===
                              "high"
                                ? {
                                    color: "#b4232d",
                                  }
                                : {}),
                            }}
                          >
                            {displayValue(
                              verification.risk
                            )}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <strong
                            style={
                              trustScoreStyle
                            }
                          >
                            {verification.trust_score !==
                            null
                              ? `${verification.trust_score}`
                              : "—"}
                          </strong>
                        </td>

                        <td style={tdStyle}>
                          <span style={secondaryTextStyle}>
                            {formatDate(
                              verification.created_at
                            )}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedVerification(
                                verification
                              )
                            }
                            style={reviewButtonStyle}
                          >
                            Review →
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div style={panelFooterStyle}>
            Showing{" "}
            <strong>
              {filteredVerifications.length}
            </strong>{" "}
            of{" "}
            <strong>
              {verifications.length}
            </strong>{" "}
            verification records.
          </div>
        </section>
      </div>

      {selectedVerification && (
        <div
          style={modalOverlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedVerification(null);
            }
          }}
        >
          <section style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <p style={sectionEyebrowStyle}>
                  VERIFICATION DETAILS
                </p>

                <h2 style={modalTitleStyle}>
                  {displayValue(
                    selectedVerification.doc_name
                  )}
                </h2>

                <p style={modalSubtitleStyle}>
                  Created{" "}
                  {formatDate(
                    selectedVerification.created_at
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedVerification(null)
                }
                style={closeButtonStyle}
                aria-label="Close verification details"
              >
                ×
              </button>
            </div>

            <div style={modalBodyStyle}>
              <div style={detailGridStyle}>
                <DetailItem
                  label="Document Type"
                  value={displayValue(
                    selectedVerification.doc_type
                  )}
                />

                <DetailItem
                  label="Status"
                  value={
                    isFlaggedVerification(
                      selectedVerification
                    )
                      ? "Flagged"
                      : statusLabel(
                          selectedVerification.status
                        )
                  }
                />

                <DetailItem
                  label="Review Status"
                  value={reviewStatusLabel(
                    selectedVerification.review_status
                  )}
                />

                <DetailItem
                  label="Risk"
                  value={displayValue(
                    selectedVerification.risk
                  )}
                />

                <DetailItem
                  label="Trust Score"
                  value={
                    selectedVerification.trust_score !==
                    null
                      ? String(
                          selectedVerification.trust_score
                        )
                      : "—"
                  }
                />

                <DetailItem
                  label="Confidence"
                  value={
                    selectedVerification.confidence !==
                    null
                      ? String(
                          selectedVerification.confidence
                        )
                      : "—"
                  }
                />

                <DetailItem
                  label="User ID"
                  value={displayValue(
                    selectedVerification.user_id
                  )}
                  fullWidth
                />

                <DetailItem
                  label="Property ID"
                  value={displayValue(
                    selectedVerification.property_id
                  )}
                  fullWidth
                />

                <DetailItem
                  label="Verification ID"
                  value={selectedVerification.id}
                  fullWidth
                />
              </div>

              <div style={detailSectionStyle}>
                <p style={detailLabelStyle}>
                  FINDINGS
                </p>

                <pre style={findingsStyle}>
                  {findingsText(
                    selectedVerification.findings
                  )}
                </pre>
              </div>

              <div style={detailSectionStyle}>
                <p style={detailLabelStyle}>
                  REPORT INFORMATION
                </p>

                <div style={reportInfoStyle}>
                  <DetailItem
                    label="Report Generated"
                    value={formatDate(
                      selectedVerification.report_generated_at
                    )}
                  />

                  <DetailItem
                    label="Created By"
                    value={displayValue(
                      selectedVerification.created_by
                    )}
                  />

                  <DetailItem
                    label="Report Path"
                    value={displayValue(
                      selectedVerification.report_path
                    )}
                    fullWidth
                  />

                  {selectedVerification.report_url && (
                    <div
                      style={{
                        gridColumn: "1 / -1",
                      }}
                    >
                      <a
                        href={
                          selectedVerification.report_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={reportLinkStyle}
                      >
                        Open Verification Report →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={modalFooterStyle}>
              <button
                type="button"
                onClick={() =>
                  setSelectedVerification(null)
                }
                style={closeFooterButtonStyle}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function AdminStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={statCardStyle}>
      <div style={statLabelStyle}>
        {label}
      </div>

      <strong style={statValueStyle}>
        {value}
      </strong>
    </div>
  );
}

function DetailItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      style={{
        ...(fullWidth
          ? {
              gridColumn: "1 / -1",
            }
          : {}),
      }}
    >
      <p style={detailLabelStyle}>
        {label}
      </p>

      <div style={detailValueStyle}>
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f7f9fc",
  fontFamily: "Arial, sans-serif",
  padding: "36px 24px 60px",
  color: "#102a43",
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "1400px",
  margin: "0 auto",
};

const loadingContainerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const loadingTitleStyle: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#102a43",
  fontSize: "24px",
};

const loadingTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "14px",
};

const topBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  marginBottom: "18px",
};

const backButtonStyle: React.CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#1676c5",
  padding: "6px 0",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
};

const refreshButtonStyle: React.CSSProperties = {
  border: "1px solid #d8e1eb",
  background: "#ffffff",
  color: "#315878",
  borderRadius: "8px",
  padding: "9px 14px",
  fontSize: "12px",
  fontWeight: 700,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "24px",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "28px",
  marginBottom: "20px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: "0 0 8px",
  color: "#1676c5",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 8px",
  color: "#102a43",
  fontSize: "30px",
  lineHeight: 1.2,
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: "680px",
  color: "#64748b",
  fontSize: "14px",
  lineHeight: 1.6,
};

const administratorStyle: React.CSSProperties = {
  minWidth: "220px",
  padding: "14px 16px",
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
};

const administratorLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "7px",
  color: "#94a3b8",
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const administratorEmailStyle: React.CSSProperties = {
  display: "block",
  color: "#315878",
  fontSize: "12px",
  wordBreak: "break-word",
};

const errorStyle: React.CSSProperties = {
  marginBottom: "20px",
  padding: "13px 16px",
  border: "1px solid #f0caca",
  borderRadius: "10px",
  background: "#fff6f6",
  color: "#b4232d",
  fontSize: "13px",
  lineHeight: 1.5,
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
  marginBottom: "20px",
};

const statCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "13px",
  padding: "18px",
};

const statLabelStyle: React.CSSProperties = {
  marginBottom: "9px",
  color: "#64748b",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const statValueStyle: React.CSSProperties = {
  color: "#102a43",
  fontSize: "25px",
  lineHeight: 1,
};

const panelStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  overflow: "hidden",
};

const panelHeaderStyle: React.CSSProperties = {
  padding: "24px 24px 18px",
};

const sectionEyebrowStyle: React.CSSProperties = {
  margin: "0 0 7px",
  color: "#1676c5",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const panelTitleStyle: React.CSSProperties = {
  margin: "0 0 7px",
  color: "#102a43",
  fontSize: "21px",
};

const panelSubtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "12px",
  lineHeight: 1.5,
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  padding: "0 24px 20px",
  flexWrap: "wrap",
};

const searchWrapperStyle: React.CSSProperties = {
  flex: "1 1 320px",
  minWidth: "240px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  border: "1px solid #dce4ec",
  background: "#ffffff",
  borderRadius: "9px",
  padding: "0 12px",
};

const searchIconStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "16px",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  outline: 0,
  background: "transparent",
  padding: "11px 0",
  color: "#102a43",
  fontSize: "12px",
};

const filterSelectStyle: React.CSSProperties = {
  minWidth: "170px",
  border: "1px solid #dce4ec",
  background: "#ffffff",
  borderRadius: "9px",
  padding: "11px 12px",
  color: "#315878",
  fontSize: "12px",
  outline: 0,
};

const tableWrapperStyle: React.CSSProperties = {
  width: "100%",
  overflowX: "auto",
  borderTop: "1px solid #edf1f5",
  borderBottom: "1px solid #edf1f5",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  minWidth: "1050px",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  padding: "13px 16px",
  textAlign: "left",
  color: "#94a3b8",
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.07em",
  borderBottom: "1px solid #edf1f5",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "16px",
  verticalAlign: "top",
  borderBottom: "1px solid #f0f3f6",
  fontSize: "12px",
};

const documentNameStyle: React.CSSProperties = {
  marginBottom: "5px",
  color: "#102a43",
  fontSize: "12px",
  fontWeight: 700,
};

const secondaryTextStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "10px",
  lineHeight: 1.5,
};

const statusPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "999px",
  padding: "5px 8px",
  fontSize: "9px",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const reviewStatusTextStyle: React.CSSProperties = {
  marginTop: "6px",
  color: "#94a3b8",
  fontSize: "9px",
};

const riskTextStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "11px",
  fontWeight: 700,
};

const trustScoreStyle: React.CSSProperties = {
  color: "#102a43",
  fontSize: "13px",
};

const reviewButtonStyle: React.CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#1676c5",
  padding: 0,
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const panelFooterStyle: React.CSSProperties = {
  padding: "14px 24px",
  color: "#94a3b8",
  fontSize: "10px",
};

const emptyStateStyle: React.CSSProperties = {
  padding: "70px 24px",
  textAlign: "center",
  borderTop: "1px solid #edf1f5",
  borderBottom: "1px solid #edf1f5",
};

const emptyIconStyle: React.CSSProperties = {
  width: "42px",
  height: "42px",
  margin: "0 auto 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "#eef6ff",
  color: "#1676c5",
  fontSize: "18px",
  fontWeight: 700,
};

const emptyTitleStyle: React.CSSProperties = {
  margin: "0 0 7px",
  color: "#102a43",
  fontSize: "16px",
};

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "12px",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background: "rgba(15, 23, 42, 0.45)",
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "850px",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  background: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 20px 60px rgba(15, 23, 42, 0.18)",
  overflow: "hidden",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "18px",
  padding: "24px",
  borderBottom: "1px solid #edf1f5",
};

const modalTitleStyle: React.CSSProperties = {
  margin: "0 0 6px",
  color: "#102a43",
  fontSize: "21px",
};

const modalSubtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "11px",
};

const closeButtonStyle: React.CSSProperties = {
  width: "32px",
  height: "32px",
  border: "1px solid #dce4ec",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#64748b",
  fontSize: "20px",
  lineHeight: 1,
  cursor: "pointer",
};

const modalBodyStyle: React.CSSProperties = {
  padding: "24px",
  overflowY: "auto",
};

const detailGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "20px",
};

const detailLabelStyle: React.CSSProperties = {
  margin: "0 0 7px",
  color: "#94a3b8",
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
};

const detailValueStyle: React.CSSProperties = {
  color: "#315878",
  fontSize: "12px",
  lineHeight: 1.5,
  wordBreak: "break-word",
};

const detailSectionStyle: React.CSSProperties = {
  marginTop: "26px",
  paddingTop: "22px",
  borderTop: "1px solid #edf1f5",
};

const findingsStyle: React.CSSProperties = {
  margin: 0,
  padding: "16px",
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  color: "#475569",
  fontSize: "11px",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  overflowX: "auto",
};

const reportInfoStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "20px",
};

const reportLinkStyle: React.CSSProperties = {
  color: "#1676c5",
  fontSize: "11px",
  fontWeight: 700,
  textDecoration: "none",
};

const modalFooterStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  padding: "16px 24px",
  borderTop: "1px solid #edf1f5",
};

const closeFooterButtonStyle: React.CSSProperties = {
  border: "1px solid #d8e1eb",
  background: "#ffffff",
  color: "#315878",
  borderRadius: "8px",
  padding: "9px 16px",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
};