"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type FraudReport = {
  status: "pending" | "under_review" | "resolved" | "dismissed";
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  const [fraudLoading, setFraudLoading] = useState(true);
  const [fraudStats, setFraudStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    dismissed: 0,
  });

  const [errorMessage, setErrorMessage] = useState("");

  const checkAdmin = useCallback(async () => {
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
        console.error("Admin access check failed:", adminError);

        router.replace("/dashboard");
        return;
      }

      if (!admin) {
        router.replace("/dashboard");
        return;
      }

      setLoading(false);

      await loadFraudStats();
    } catch (error) {
      console.error("Unexpected admin access error:", error);

      router.replace("/dashboard");
    }
  }, [router]);

  const loadFraudStats = useCallback(async () => {
    try {
      setFraudLoading(true);

      const { data, error } = await supabase
        .from("fraud_reports")
        .select("status");

      if (error) {
        console.error("Unable to load Fraud Watch statistics:", error);

        setErrorMessage(
          "Fraud Watch statistics could not be loaded right now."
        );

        setFraudLoading(false);
        return;
      }

      const reports = (data ?? []) as FraudReport[];

      setFraudStats({
        total: reports.length,
        pending: reports.filter(
          (report) => report.status === "pending"
        ).length,
        underReview: reports.filter(
          (report) => report.status === "under_review"
        ).length,
        resolved: reports.filter(
          (report) => report.status === "resolved"
        ).length,
        dismissed: reports.filter(
          (report) => report.status === "dismissed"
        ).length,
      });

      setFraudLoading(false);
    } catch (error) {
      console.error("Unexpected Fraud Watch statistics error:", error);

      setErrorMessage(
        "Fraud Watch statistics could not be loaded right now."
      );

      setFraudLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f9fc",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "32px",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              color: "#102a43",
              fontSize: "24px",
            }}
          >
            PropertySure AI
          </h2>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Verifying administrator access...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f9fc",
        fontFamily: "Arial, sans-serif",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "28px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#1676c5",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            PropertySure AI
          </p>

          <h1
            style={{
              margin: "0 0 8px",
              color: "#102a43",
              fontSize: "30px",
              lineHeight: 1.2,
            }}
          >
            Admin Dashboard
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Welcome, {email}
          </p>
        </header>

        {errorMessage && (
          <div
            role="alert"
            style={{
              marginBottom: "20px",
              padding: "13px 16px",
              border: "1px solid #f0caca",
              borderRadius: "10px",
              background: "#fff6f6",
              color: "#b4232d",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            {errorMessage}
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          <AdminCard
            title="Users"
            description="View and manage registered PropertySure AI users."
            status="Open user management"
            onClick={() => router.push("/admin/users")}
            active
          />

          <AdminCard
            title="Verifications"
            description="Review property verification activity and results."
            status="Open verification center"
            onClick={() => router.push("/admin/verifications")}
            active
          />

          <AdminCard
            title="Fraud Watch"
            description="Review suspicious activity and fraud signals."
            onClick={() => router.push("/admin/fraud-watch")}
            active
            status={
              fraudLoading
                ? "Loading..."
                : `${fraudStats.total} total reports`
            }
            stat={
              fraudLoading
                ? "—"
                : String(
                    fraudStats.pending + fraudStats.underReview
                  )
            }
            statLabel="Need attention"
          />

          <AdminCard
            title="Reports"
            description="Review verification reports and administrative reports."
            status="Open reports"
            onClick={() => router.push("/admin/reports")}
            active
          />

          <AdminCard
            title="Properties"
            description="View properties submitted through PropertySure AI."
            status="Open property management"
            onClick={() => router.push("/admin/properties")}
            active
          />

          <AdminCard
            title="Payments"
            description="View payment activity and verification transactions."
            status="Open payment management"
            onClick={() => router.push("/admin/payments")}
            active
          />
        </section>

        <section
          style={{
            marginTop: "28px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  color: "#1676c5",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Fraud Watch
              </p>

              <h2
                style={{
                  margin: 0,
                  color: "#102a43",
                  fontSize: "20px",
                }}
              >
                Current Report Activity
              </h2>
            </div>

            <button
              type="button"
              onClick={async () => {
                await loadFraudStats();
              }}
              disabled={fraudLoading}
              style={{
                border: "1px solid #d8e1eb",
                background: "#ffffff",
                color: "#315878",
                borderRadius: "8px",
                padding: "9px 14px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: fraudLoading ? "default" : "pointer",
                opacity: fraudLoading ? 0.6 : 1,
              }}
            >
              {fraudLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "14px",
            }}
          >
            <StatBox
              label="Total Reports"
              value={
                fraudLoading ? "—" : String(fraudStats.total)
              }
            />

            <StatBox
              label="Pending"
              value={
                fraudLoading ? "—" : String(fraudStats.pending)
              }
            />

            <StatBox
              label="Under Review"
              value={
                fraudLoading
                  ? "—"
                  : String(fraudStats.underReview)
              }
            />

            <StatBox
              label="Resolved"
              value={
                fraudLoading
                  ? "—"
                  : String(fraudStats.resolved)
              }
            />

            <StatBox
              label="Dismissed"
              value={
                fraudLoading
                  ? "—"
                  : String(fraudStats.dismissed)
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminCard({
  title,
  description,
  status,
  onClick,
  active = false,
  stat,
  statLabel,
}: {
  title: string;
  description: string;
  status: string;
  onClick?: () => void;
  active?: boolean;
  stat?: string;
  statLabel?: string;
}) {
  const clickable = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      aria-label={`Open ${title}`}
      style={{
        width: "100%",
        textAlign: "left",
        background: "#ffffff",
        border: active
          ? "1px solid #c9dff2"
          : "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "24px",
        minHeight: "175px",
        cursor: clickable ? "pointer" : "default",
        opacity: clickable ? 1 : 0.78,
        transition:
          "border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(event) => {
        if (!clickable) return;

        event.currentTarget.style.borderColor = "#1676c5";
        event.currentTarget.style.transform =
          "translateY(-1px)";
        event.currentTarget.style.boxShadow =
          "0 8px 24px rgba(22, 118, 197, 0.08)";
      }}
      onMouseLeave={(event) => {
        if (!clickable) return;

        event.currentTarget.style.borderColor = active
          ? "#c9dff2"
          : "#e5e7eb";
        event.currentTarget.style.transform =
          "translateY(0)";
        event.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#102a43",
            fontSize: "18px",
          }}
        >
          {title}
        </h2>

        {stat !== undefined && (
          <div
            style={{
              minWidth: "38px",
              textAlign: "right",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#1676c5",
                fontSize: "22px",
                lineHeight: 1,
              }}
            >
              {stat}
            </strong>

            {statLabel && (
              <span
                style={{
                  display: "block",
                  marginTop: "4px",
                  color: "#94a3b8",
                  fontSize: "9px",
                  lineHeight: 1.2,
                }}
              >
                {statLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <p
        style={{
          margin: "0 0 18px",
          color: "#64748b",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <span
          style={{
            color: active ? "#1676c5" : "#94a3b8",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          {status}
        </span>

        {clickable && (
          <span
            style={{
              color: "#1676c5",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            Open →
          </span>
        )}
      </div>
    </button>
  );
}

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: "11px",
        padding: "16px",
      }}
    >
      <div
        style={{
          marginBottom: "7px",
          color: "#64748b",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#102a43",
          fontSize: "24px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}