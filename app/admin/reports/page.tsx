"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Verification = {
  id: string;
  created_at: string;
  doc_name: string | null;
  doc_type: string | null;
  status: string | null;
  review_status: string | null;
  risk: string | null;
  trust_score: number | null;
  confidence: number | null;
  user_id: string | null;
  property_id: string | null;
  report_url: string | null;
  report_path: string | null;
  report_generated_at: string | null;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedReport, setSelectedReport] =
    useState<Verification | null>(null);

  const loadReports = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/signin";
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminError) {
        throw new Error(adminError.message);
      }

      if (!admin) {
        window.location.href = "/dashboard";
        return;
      }

      const { data, error: reportsError } = await supabase
        .from("verifications")
        .select(
          "id,created_at,doc_name,doc_type,status,review_status,risk,trust_score,confidence,user_id,property_id,report_url,report_path,report_generated_at"
        )
        .order("created_at", { ascending: false });

      if (reportsError) {
        throw new Error(reportsError.message);
      }

      setReports((data ?? []) as Verification[]);
    } catch (err) {
      console.error("Admin reports error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const getReportStatus = (report: Verification) => {
    const reviewStatus = (
      report.review_status || ""
    ).toLowerCase();

    const status = (report.status || "").toLowerCase();

    if (
      reviewStatus === "flagged" ||
      reviewStatus === "rejected" ||
      status === "flagged" ||
      status === "rejected"
    ) {
      return "flagged";
    }

    if (
      report.report_url ||
      report.report_path ||
      report.report_generated_at
    ) {
      return "generated";
    }

    if (
      status === "processing" ||
      status === "review" ||
      status === "pending"
    ) {
      return "pending";
    }

    return "pending";
  };

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !query ||
        report.id.toLowerCase().includes(query) ||
        (report.doc_name || "").toLowerCase().includes(query) ||
        (report.doc_type || "").toLowerCase().includes(query) ||
        (report.user_id || "").toLowerCase().includes(query) ||
        (report.property_id || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        getReportStatus(report) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  const totalReports = reports.length;

  const generatedReports = reports.filter(
    (report) => getReportStatus(report) === "generated"
  ).length;

  const pendingReports = reports.filter(
    (report) => getReportStatus(report) === "pending"
  ).length;

  const flaggedReports = reports.filter(
    (report) => getReportStatus(report) === "flagged"
  ).length;

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatScore = (score: number | null) => {
    if (score === null || score === undefined) {
      return "—";
    }

    return `${score}`;
  };

  if (loading) {
    return (
      <main className="page">
        <div className="loading">
          Loading reports...
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #f7f9fc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
          }

          .loading {
            color: #64748b;
            font-size: 14px;
          }
        `}</style>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="errorCard">
          <h2>Unable to load reports</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={loadReports}
          >
            Try Again
          </button>
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #f7f9fc;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: Arial, sans-serif;
          }

          .errorCard {
            width: 100%;
            max-width: 500px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
          }

          .errorCard h2 {
            margin: 0 0 10px;
            color: #102a43;
          }

          .errorCard p {
            margin: 0 0 20px;
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
            word-break: break-word;
          }

          .errorCard button {
            border: 0;
            background: #1676c5;
            color: #ffffff;
            border-radius: 8px;
            padding: 10px 18px;
            font-weight: 700;
            cursor: pointer;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <div>
            <button
              type="button"
              className="backButton"
              onClick={() => {
                window.location.href = "/admin";
              }}
            >
              ← Admin Dashboard
            </button>

            <h1>Reports</h1>

            <p>
              Review verification reports generated by
              PropertySure AI.
            </p>
          </div>

          <button
            type="button"
            className="refreshButton"
            onClick={loadReports}
            disabled={loading}
          >
            Refresh
          </button>
        </header>

        <section className="statsGrid">
          <div className="statCard">
            <span>Total Reports</span>
            <strong>{totalReports}</strong>
          </div>

          <div className="statCard">
            <span>Generated</span>
            <strong>{generatedReports}</strong>
          </div>

          <div className="statCard">
            <span>Pending</span>
            <strong>{pendingReports}</strong>
          </div>

          <div className="statCard">
            <span>Flagged</span>
            <strong>{flaggedReports}</strong>
          </div>
        </section>

        <section className="filters">
          <input
            type="text"
            placeholder="Search report, document, user, property..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">All Reports</option>
            <option value="generated">Generated</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
          </select>
        </section>

        <section className="tableCard">
          <div className="tableHeader">
            <div>
              <h2>Verification Reports</h2>

              <p>
                Showing {filteredReports.length} of{" "}
                {reports.length} reports
              </p>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="emptyState">
              <h3>No reports found</h3>

              <p>
                There are no verification reports matching
                the current filters.
              </p>
            </div>
          ) : (
            <div className="tableWrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Risk</th>
                    <th>Trust Score</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReports.map((report) => {
                    const reportStatus =
                      getReportStatus(report);

                    return (
                      <tr key={report.id}>
                        <td>
                          <span className="date">
                            {formatDate(
                              report.created_at
                            )}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {report.doc_name || "Unnamed document"}
                          </strong>
                        </td>

                        <td>
                          {report.doc_type || "—"}
                        </td>

                        <td>
                          <span
                            className={`status status-${reportStatus}`}
                          >
                            {reportStatus}
                          </span>
                        </td>

                        <td>
                          <span className="risk">
                            {report.risk || "—"}
                          </span>
                        </td>

                        <td>
                          {formatScore(
                            report.trust_score
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="viewButton"
                            onClick={() =>
                              setSelectedReport(report)
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedReport && (
        <div
          className="modalBackdrop"
          onClick={() =>
            setSelectedReport(null)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modalHeader">
              <div>
                <span className="eyebrow">
                  VERIFICATION REPORT
                </span>

                <h2>
                  {selectedReport.doc_name ||
                    "Verification Report"}
                </h2>
              </div>

              <button
                type="button"
                className="closeButton"
                onClick={() =>
                  setSelectedReport(null)
                }
              >
                ×
              </button>
            </div>

            <div className="modalBody">
              <div className="reportStatus">
                <span
                  className={`status status-${getReportStatus(
                    selectedReport
                  )}`}
                >
                  {getReportStatus(
                    selectedReport
                  )}
                </span>
              </div>

              <div className="detailsGrid">
                <div className="detail">
                  <span>Document Type</span>
                  <strong>
                    {selectedReport.doc_type || "—"}
                  </strong>
                </div>

                <div className="detail">
                  <span>Risk</span>
                  <strong>
                    {selectedReport.risk || "—"}
                  </strong>
                </div>

                <div className="detail">
                  <span>Trust Score</span>
                  <strong>
                    {formatScore(
                      selectedReport.trust_score
                    )}
                  </strong>
                </div>

                <div className="detail">
                  <span>Confidence</span>
                  <strong>
                    {formatScore(
                      selectedReport.confidence
                    )}
                  </strong>
                </div>

                <div className="detail">
                  <span>Review Status</span>
                  <strong>
                    {selectedReport.review_status ||
                      "—"}
                  </strong>
                </div>

                <div className="detail">
                  <span>Verification Status</span>
                  <strong>
                    {selectedReport.status || "—"}
                  </strong>
                </div>

                <div className="detail full">
                  <span>Verification ID</span>
                  <strong className="break">
                    {selectedReport.id}
                  </strong>
                </div>

                <div className="detail full">
                  <span>User ID</span>
                  <strong className="break">
                    {selectedReport.user_id || "—"}
                  </strong>
                </div>

                <div className="detail full">
                  <span>Property ID</span>
                  <strong className="break">
                    {selectedReport.property_id || "—"}
                  </strong>
                </div>

                <div className="detail">
                  <span>Created</span>
                  <strong>
                    {formatDate(
                      selectedReport.created_at
                    )}
                  </strong>
                </div>

                <div className="detail">
                  <span>Report Generated</span>
                  <strong>
                    {formatDate(
                      selectedReport.report_generated_at
                    )}
                  </strong>
                </div>
              </div>

              <div className="reportActions">
                {selectedReport.report_url ? (
                  <a
                    href={selectedReport.report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primaryButton"
                  >
                    Open Report →
                  </a>
                ) : (
                  <div className="noReport">
                    No report URL is available for this
                    verification yet.
                  </div>
                )}
              </div>
            </div>

            <div className="modalFooter">
              <button
                type="button"
                onClick={() =>
                  setSelectedReport(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f7f9fc;
          color: #102a43;
          font-family: Arial, sans-serif;
          padding: 40px 24px 70px;
        }

        .container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .backButton {
          display: block;
          border: 0;
          background: transparent;
          padding: 0;
          margin-bottom: 16px;
          color: #1676c5;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        h1 {
          margin: 0 0 8px;
          font-size: 32px;
          letter-spacing: -0.5px;
        }

        .header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .refreshButton {
          border: 1px solid #d8e1eb;
          background: #ffffff;
          color: #315878;
          border-radius: 8px;
          padding: 10px 15px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 16px;
          margin-bottom: 20px;
        }

        .statCard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 20px;
        }

        .statCard span {
          display: block;
          margin-bottom: 9px;
          color: #718096;
          font-size: 12px;
        }

        .statCard strong {
          font-size: 25px;
          color: #102a43;
        }

        .filters {
          display: grid;
          grid-template-columns: 1fr 190px;
          gap: 12px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 18px;
        }

        .filters input,
        .filters select {
          width: 100%;
          height: 44px;
          box-sizing: border-box;
          border: 1px solid #dce3ea;
          border-radius: 9px;
          padding: 0 13px;
          background: #ffffff;
          color: #334155;
          font-size: 13px;
          outline: none;
        }

        .filters input:focus,
        .filters select:focus {
          border-color: #1676c5;
        }

        .tableCard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
        }

        .tableHeader {
          padding: 20px 22px;
          border-bottom: 1px solid #e8edf2;
        }

        .tableHeader h2 {
          margin: 0 0 6px;
          font-size: 18px;
        }

        .tableHeader p {
          margin: 0;
          color: #718096;
          font-size: 13px;
        }

        .tableWrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
        }

        th {
          padding: 14px 18px;
          background: #fafbfd;
          border-bottom: 1px solid #e8edf2;
          text-align: left;
          color: #69778a;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        td {
          padding: 16px 18px;
          border-bottom: 1px solid #edf1f4;
          color: #3d4c5f;
          font-size: 13px;
          vertical-align: middle;
        }

        tbody tr:hover {
          background: #fbfcfe;
        }

        .date {
          white-space: nowrap;
          color: #64748b;
        }

        .status {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .status-generated {
          background: #e9f7ef;
          color: #1b7b49;
        }

        .status-pending {
          background: #fff5df;
          color: #996400;
        }

        .status-flagged {
          background: #fdeceb;
          color: #b42318;
        }

        .risk {
          text-transform: capitalize;
        }

        .viewButton {
          border: 1px solid #d7e0e8;
          background: #ffffff;
          color: #1676c5;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .viewButton:hover {
          background: #f3f8fc;
        }

        .emptyState {
          padding: 60px 20px;
          text-align: center;
        }

        .emptyState h3 {
          margin: 0 0 8px;
        }

        .emptyState p {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }

        .modalBackdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 27, 40, 0.45);
        }

        .modal {
          width: 100%;
          max-width: 760px;
          max-height: 90vh;
          overflow-y: auto;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 25px 70px rgba(15, 27, 40, 0.2);
        }

        .modalHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding: 24px;
          border-bottom: 1px solid #e8edf2;
        }

        .eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #1676c5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .modalHeader h2 {
          margin: 0;
          font-size: 20px;
          word-break: break-word;
        }

        .closeButton {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: #f1f4f7;
          color: #536174;
          font-size: 22px;
          cursor: pointer;
        }

        .modalBody {
          padding: 24px;
        }

        .reportStatus {
          margin-bottom: 18px;
        }

        .detailsGrid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 1px;
          background: #e8edf2;
          border: 1px solid #e8edf2;
          border-radius: 10px;
          overflow: hidden;
        }

        .detail {
          background: #ffffff;
          padding: 16px;
          min-width: 0;
        }

        .detail.full {
          grid-column: 1 / -1;
        }

        .detail span {
          display: block;
          margin-bottom: 7px;
          color: #7a8798;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .detail strong {
          display: block;
          color: #263548;
          font-size: 13px;
          line-height: 1.5;
        }

        .break {
          word-break: break-all;
        }

        .reportActions {
          margin-top: 20px;
        }

        .primaryButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 8px;
          padding: 11px 16px;
          background: #1676c5;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
        }

        .noReport {
          padding: 13px;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          background: #f8fafc;
          color: #64748b;
          font-size: 13px;
        }

        .modalFooter {
          display: flex;
          justify-content: flex-end;
          padding: 18px 24px;
          border-top: 1px solid #e8edf2;
        }

        .modalFooter button {
          border: 0;
          border-radius: 8px;
          padding: 10px 18px;
          background: #1676c5;
          color: #ffffff;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 850px) {
          .statsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .header {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 650px) {
          .page {
            padding: 28px 15px 50px;
          }

          h1 {
            font-size: 28px;
          }

          .filters {
            grid-template-columns: 1fr;
          }

          .detailsGrid {
            grid-template-columns: 1fr;
          }

          .detail.full {
            grid-column: auto;
          }
        }

        @media (max-width: 450px) {
          .statsGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}