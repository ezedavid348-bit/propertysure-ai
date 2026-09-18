 "use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../AppShell/AppShell";
import LoadingScreen from "../AppShell/LoadingScreen";
import { supabase } from "../lib/supabase";
import styles from "./fraud-watch.module.css";

type RiskLevel = "high" | "medium";
type AlertFilter = "all" | RiskLevel;

type VerificationRow = {
  id: string | number;
  doc_name?: string | null;
  doc_type?: string | null;
  status?: string | null;
  review_status?: string | null;
  risk?: string | null;
  findings?: unknown;
  created_at?: string | null;
  property_id?: string | null;
};

type FraudAlert = {
  id: string;
  verificationId: string;
  documentName: string;
  propertyName: string;
  location: string;
  risk: RiskLevel;
  reason: string;
  detectedAt: string;
  detectedAtValue: number;
  plan: string;
  reviewSignal: boolean;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === "object" && !Array.isArray(item),
      )
    : [];
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((item) => typeof item === "string" && item.trim())
        .map((item) => item.trim())
    : [];
}

function firstString(
  source: Record<string, unknown>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "";
}

function cleanText(value: string): string {
  return value.replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
}

function titleCase(value: string): string {
  return cleanText(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeRisk(value: unknown): RiskLevel {
  const risk = String(value ?? "").trim().toLowerCase();

  if (
    risk === "high" ||
    risk === "critical" ||
    risk === "severe" ||
    risk === "high risk"
  ) {
    return "high";
  }

  return "medium";
}

function isFlagged(value: unknown): boolean {
  const valueText = String(value ?? "").trim().toLowerCase();

  return [
    "flagged",
    "attention",
    "attention_required",
    "attention required",
    "rejected",
    "suspicious",
    "fraud",
  ].includes(valueText);
}

function isReviewSignal(value: unknown): boolean {
  const valueText = String(value ?? "").trim().toLowerCase();

  return [
    "review",
    "under_review",
    "under review",
    "pending_review",
    "pending review",
    "inconclusive",
    "needs_review",
    "needs review",
  ].includes(valueText);
}

function getPlan(findings: Record<string, unknown>): string {
  const premium = asRecord(findings.premium);
  const essential = asRecord(findings.essential);

  const value =
    firstString(premium, ["plan"]) ||
    firstString(essential, ["plan"]) ||
    firstString(findings, [
      "plan",
      "verificationPlan",
      "verification_plan",
      "verificationLevel",
      "verification_level",
      "package",
      "tier",
    ]);

  return value ? titleCase(value) : "Verification";
}

function getDocumentResults(
  findings: Record<string, unknown>,
): Record<string, unknown>[] {
  const premium = asRecord(findings.premium);
  const essential = asRecord(findings.essential);

  const candidates = [
    ...asArray(premium.document_results),
    ...asArray(essential.document_results),
    ...asArray(findings.document_results),
    ...asArray(findings.documentResults),
  ];

  if (candidates.length > 0) return candidates;

  const packageItems = asArray(findings.document_package);
  if (packageItems.length > 0) return packageItems;

  const documents = asArray(findings.documents);
  if (documents.length > 0) return documents;

  return [];
}

function getDocumentName(
  document: Record<string, unknown>,
  row: VerificationRow,
): string {
  return (
    firstString(document, [
      "documentName",
      "document_name",
      "documentTitle",
      "document_title",
      "documentType",
      "document_type",
      "documentTypeDetected",
      "document_type_detected",
      "name",
      "fileName",
      "file_name",
      "filename",
    ]) ||
    String(row.doc_type || "").trim() ||
    String(row.doc_name || "").trim() ||
    "Property Document"
  );
}

function getPropertyName(
  document: Record<string, unknown>,
  findings: Record<string, unknown>,
  row: VerificationRow,
): string {
  const property = asRecord(findings.property);
  const premium = asRecord(findings.premium);
  const premiumProperty = asRecord(premium.property);

  return (
    firstString(document, [
      "propertyName",
      "property_name",
      "propertyTitle",
      "property_title",
    ]) ||
    firstString(property, ["name", "title", "property_name", "property_title"]) ||
    firstString(premiumProperty, [
      "name",
      "title",
      "property_name",
      "property_title",
    ]) ||
    firstString(findings, [
      "propertyName",
      "property_name",
      "propertyTitle",
      "property_title",
    ]) ||
    (row.property_id ? `Property ${row.property_id}` : "Property verification")
  );
}

function getLocation(
  document: Record<string, unknown>,
  findings: Record<string, unknown>,
): string {
  const premium = asRecord(findings.premium);
  const property = asRecord(findings.property);
  const premiumProperty = asRecord(premium.property);
  const location = asRecord(findings.location);
  const premiumLocation = asRecord(premium.location);
  const cross = asRecord(premium.cross_document_analysis);
  const documentLocation = asRecord(document.location);

  return (
    firstString(document, [
      "location",
      "address",
      "propertyLocation",
      "property_location",
    ]) ||
    firstString(documentLocation, ["address", "location", "name"]) ||
    firstString(property, ["location", "address", "state", "city"]) ||
    firstString(premiumProperty, [
      "location",
      "address",
      "state",
      "city",
    ]) ||
    firstString(premiumLocation, ["location", "address", "name"]) ||
    firstString(cross, ["location", "address"]) ||
    firstString(location, ["location", "address", "name"]) ||
    firstString(findings, [
      "location",
      "propertyLocation",
      "property_location",
      "address",
    ]) ||
    "Location unavailable"
  );
}

function getFailedChecks(document: Record<string, unknown>): string[] {
  const checks = asRecord(document.checks);

  const labels: Record<string, string> = {
    documentStructure: "Document structure inconsistency",
    dataConsistency: "Data consistency issue",
    signatureValid: "Signature validation issue",
    stampValid: "Stamp validation issue",
    noForgery: "Possible document forgery",
    noDuplicate: "Possible duplicate document",
    documentCompleteness: "Document completeness issue",
  };

  return Object.entries(checks)
    .filter(([, value]) => value === false)
    .map(([key]) => labels[key] || `${cleanText(key)} issue`);
}

function getReason(
  document: Record<string, unknown>,
  findings: Record<string, unknown>,
): string {
  const failedChecks = getFailedChecks(document);

  if (failedChecks.length > 0) return failedChecks[0];

  const manipulation = stringArray(document.manipulationIndicators);
  if (manipulation.length > 0) return manipulation[0];

  const keyFindings = stringArray(document.keyFindings);
  if (keyFindings.length > 0) return keyFindings[0];

  const reason =
    firstString(document, [
      "reason",
      "issue",
      "detectedIssue",
      "detected_issue",
      "finding",
      "warning",
      "message",
      "summary",
    ]) ||
    firstString(findings, [
      "fraudReason",
      "fraud_reason",
      "riskReason",
      "risk_reason",
      "reason",
      "issue",
      "warning",
    ]);

  return reason
    ? cleanText(reason)
    : "Suspicious verification signal detected";
}

function buildFraudAlerts(rows: VerificationRow[]): FraudAlert[] {
  const alerts: FraudAlert[] = [];

  for (const row of rows) {
    const findings = asRecord(row.findings);
    const plan = getPlan(findings);
    const documentResults = getDocumentResults(findings);

    const rowFlagged =
      isFlagged(row.status) || isFlagged(row.review_status);

    /*
     * Important:
     * A Premium verification with status="review" is NOT automatically
     * a Fraud Watch alert. Premium review can simply mean that external
     * due-diligence steps are still pending.
     *
     * Fraud Watch only surfaces actual suspicious document signals.
     */

    for (const document of documentResults) {
      const premiumStatus = firstString(document, ["premiumStatus"]);
      const assessmentStatus = firstString(document, [
        "assessmentStatus",
        "assessment_status",
      ]);
      const syntheticRisk = firstString(document, [
        "syntheticDocumentRisk",
        "synthetic_document_risk",
      ]);

      const manipulationIndicators = stringArray(
        document.manipulationIndicators,
      );

      const failedChecks = getFailedChecks(document);

      const documentHighRisk =
        syntheticRisk.toLowerCase() === "high" ||
        premiumStatus.toLowerCase() === "attention" ||
        assessmentStatus.toLowerCase() === "attention_required" ||
        failedChecks.length > 0 ||
        manipulationIndicators.length > 0;

      const documentReview =
        premiumStatus.toLowerCase() === "inconclusive" ||
        assessmentStatus.toLowerCase() === "inconclusive" ||
        isReviewSignal(premiumStatus) ||
        isReviewSignal(assessmentStatus) ||
        syntheticRisk.toLowerCase() === "medium";

      if (!rowFlagged && !documentHighRisk && !documentReview) continue;

      const risk: RiskLevel =
        rowFlagged || documentHighRisk ? "high" : "medium";

      const detectedAt =
        firstString(document, [
          "detectedAt",
          "detected_at",
          "created_at",
          "date",
        ]) ||
        row.created_at ||
        "";

      const date = detectedAt ? new Date(detectedAt) : null;
      const detectedAtValue =
        date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;

      alerts.push({
        id: `${row.id}-${alerts.length}`,
        verificationId: String(row.id),
        documentName: getDocumentName(document, row),
        propertyName: getPropertyName(document, findings, row),
        location: getLocation(document, findings),
        risk,
        reason: getReason(document, findings),
        detectedAt,
        detectedAtValue,
        plan,
        reviewSignal: documentReview,
      });
    }

    /*
     * If a verification is explicitly flagged but the stored findings
     * do not contain document_results, still show the verification as
     * a document-level Fraud Watch alert rather than silently hiding it.
     */
    if (rowFlagged && documentResults.length === 0) {
      const detectedAt = row.created_at || "";
      const date = detectedAt ? new Date(detectedAt) : null;

      alerts.push({
        id: String(row.id),
        verificationId: String(row.id),
        documentName: getDocumentName({}, row),
        propertyName: getPropertyName({}, findings, row),
        location: getLocation({}, findings),
        risk: "high",
        reason: getReason({}, findings),
        detectedAt,
        detectedAtValue:
          date && !Number.isNaN(date.getTime()) ? date.getTime() : 0,
        plan,
        reviewSignal: false,
      });
    }
  }

  const unique = new Map<string, FraudAlert>();

  for (const alert of alerts) {
    const key = [
      alert.verificationId,
      alert.documentName.toLowerCase(),
      alert.reason.toLowerCase(),
    ].join("|");

    if (!unique.has(key)) {
      unique.set(key, alert);
    }
  }

  return Array.from(unique.values()).sort(
    (a, b) => b.detectedAtValue - a.detectedAtValue,
  );
}

function formatDate(value: string): string {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isWithinLastSevenDays(value: string): boolean {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  return date.getTime() >= now - sevenDays && date.getTime() <= now;
}

function issueKey(reason: string): string {
  const text = reason.toLowerCase();

  if (text.includes("duplicate")) return "Duplicate documents";
  if (text.includes("alter") || text.includes("manipulat")) {
    return "Document alteration";
  }
  if (text.includes("name mismatch") || text.includes("mismatch")) {
    return "Name mismatch";
  }
  if (text.includes("fake") || text.includes("forg")) {
    return "Possible fake documents";
  }
  if (text.includes("ownership")) return "Ownership inconsistency";
  if (text.includes("signature")) return "Signature issue";
  if (text.includes("stamp")) return "Stamp issue";
  if (text.includes("template") || text.includes("format")) {
    return "Suspicious document format";
  }

  return "Other suspicious signal";
}

export default function FraudWatchPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AlertFilter>("all");
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);

  const loadFraudWatch = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        router.replace("/signin");
        return;
      }

      const { data, error } = await supabase
        .from("verifications")
        .select(
          "id,doc_name,doc_type,status,review_status,risk,findings,created_at,property_id",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAlerts(buildFraudAlerts((data || []) as VerificationRow[]));
    } catch (error) {
      console.error("FRAUD WATCH LOAD ERROR:", error);
      setErrorMessage("Unable to load Fraud Watch right now.");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadFraudWatch();
  }, [loadFraudWatch]);

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesSearch =
        !query ||
        alert.documentName.toLowerCase().includes(query) ||
        alert.propertyName.toLowerCase().includes(query) ||
        alert.location.toLowerCase().includes(query) ||
        alert.reason.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" || alert.risk === filter;

      return matchesSearch && matchesFilter;
    });
  }, [alerts, filter, search]);

  const highRiskCount = alerts.filter(
    (alert) => alert.risk === "high",
  ).length;

  const reviewCount = alerts.filter((alert) => alert.reviewSignal).length;

  const newThisWeek = alerts.filter((alert) =>
    isWithinLastSevenDays(alert.detectedAt),
  ).length;

  const locationCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const alert of alerts) {
      if (alert.location === "Location unavailable") continue;

      counts.set(
        alert.location,
        (counts.get(alert.location) || 0) + 1,
      );
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [alerts]);

  const issueCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const alert of alerts) {
      const key = issueKey(alert.reason);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [alerts]);

  const issueTotal = issueCounts.reduce(
    (sum, [, count]) => sum + count,
    0,
  );

  const donutBackground = useMemo(() => {
    if (issueTotal === 0) {
      return "conic-gradient(#dbe7f2 0deg 360deg)";
    }

    const segmentColors = [
      "#ef4444",
      "#f59e0b",
      "#3b82f6",
      "#94a3b8",
    ];

    let start = 0;

    const stops = issueCounts.map(([, count], index) => {
      const end = start + (count / issueTotal) * 360;

      const result = `${segmentColors[index]} ${start}deg ${end}deg`;

      start = end;
      return result;
    });

    return `conic-gradient(${stops.join(", ")})`;
  }, [issueCounts, issueTotal]);

  const openDetails = (alert: FraudAlert) => {
    const plan = alert.plan.toLowerCase();

    if (plan.includes("premium")) {
      router.push(`/premium-report?id=${encodeURIComponent(alert.verificationId)}`);
      return;
    }

    if (plan.includes("professional")) {
      router.push(
        `/professional-report?id=${encodeURIComponent(alert.verificationId)}`,
      );
      return;
    }

    router.push(`/result?id=${encodeURIComponent(alert.verificationId)}`);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AppShell activePath="/fraud-watch">
      <main className={styles.page}>
        <div className={styles.pageInner}>
          {errorMessage && (
            <div className={styles.errorBanner} role="alert">
              {errorMessage}
            </div>
          )}

          <section className={styles.hero}>
            <div className={styles.heroIcon}>!</div>

            <div className={styles.heroCopy}>
              <div className={styles.heroEyebrow}>FRAUD WATCH</div>

              <h2>
                {alerts.length > 0
                  ? "Potential fraud signals detected"
                  : "No suspicious signals detected"}
              </h2>

              <p>
                Fraud Watch identifies individual documents with suspicious
                signals, manipulation indicators, inconsistencies or other
                findings that may require closer attention.
              </p>

              <button
                type="button"
                className={styles.reportButton}
                onClick={() => router.push("/report-suspicious")}
              >
                Report Suspicious Document <span>→</span>
              </button>
            </div>

            <div className={styles.heroSide}>
              <strong>Use Fraud Watch as an early warning</strong>
              <span>
                A flagged signal is not, by itself, a legal finding of fraud.
                Review the detailed verification result and use appropriate
                professional due diligence.
              </span>
            </div>
          </section>

          <section className={styles.statsGrid}>
            <article className={`${styles.statCard} ${styles.statDanger}`}>
              <div className={styles.statIcon}>▤</div>
              <div>
                <span>Flagged Documents</span>
                <strong>{alerts.length}</strong>
                <small>{newThisWeek} detected in the last 7 days</small>
              </div>
            </article>

            <article className={`${styles.statCard} ${styles.statReview}`}>
              <div className={styles.statIcon}>◷</div>
              <div>
                <span>Under Review</span>
                <strong>{reviewCount}</strong>
                <small>Documents with review-level signals</small>
              </div>
            </article>

            <article className={`${styles.statCard} ${styles.statHigh}`}>
              <div className={styles.statIcon}>!</div>
              <div>
                <span>High-Risk Documents</span>
                <strong>{highRiskCount}</strong>
                <small>Strong suspicious signals detected</small>
              </div>
            </article>

            <article className={`${styles.statCard} ${styles.statLocation}`}>
              <div className={styles.statIcon}>⌖</div>
              <div>
                <span>Flagged Locations</span>
                <strong>{locationCounts.length}</strong>
                <small>Property locations with flagged documents</small>
              </div>
            </article>
          </section>

          <div className={styles.refreshRow}>
            <button
              type="button"
              className={styles.refreshButton}
              onClick={loadFraudWatch}
            >
              ↻ Refresh
            </button>
          </div>

          <section className={styles.contentGrid}>
            <article className={styles.alertPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.sectionEyebrow}>
                    FLAGGED DOCUMENTS
                  </div>

                  <h2>Documents Requiring Attention</h2>

                  <p>
                    Only documents carrying an actual suspicious or review
                    signal appear in Fraud Watch.
                  </p>
                </div>

                <div className={styles.controls}>
                  <div className={styles.searchBox}>
                    <span>⌕</span>

                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search flagged documents..."
                      aria-label="Search flagged documents"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <select
                    className={styles.filterSelect}
                    value={filter}
                    onChange={(event) =>
                      setFilter(event.target.value as AlertFilter)
                    }
                    aria-label="Filter fraud alerts"
                  >
                    <option value="all">All alerts</option>
                    <option value="high">High risk</option>
                    <option value="medium">Under review</option>
                  </select>
                </div>
              </div>

              {filteredAlerts.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>✓</div>

                  <h3>
                    {alerts.length === 0
                      ? "No suspicious documents detected"
                      : "No matching fraud alerts"}
                  </h3>

                  <p>
                    {alerts.length === 0
                      ? "Fraud Watch will populate automatically when verification findings contain a suspicious signal."
                      : "Try another search term or change the alert filter."}
                  </p>
                </div>
              ) : (
                <div className={styles.alertList}>
                  {filteredAlerts.map((alert) => (
                    <article key={alert.id} className={styles.alertRow}>
                      <div
                        className={`${styles.documentIcon} ${
                          alert.risk === "high"
                            ? styles.documentIconHigh
                            : styles.documentIconReview
                        }`}
                      >
                        ▤
                      </div>

                      <div className={styles.documentInfo}>
                        <strong>{alert.documentName}</strong>
                        <span>{alert.propertyName}</span>
                        <small>{alert.location}</small>
                      </div>

                      <div
                        className={`${styles.riskBadge} ${
                          alert.risk === "high"
                            ? styles.riskHigh
                            : styles.riskMedium
                        }`}
                      >
                        <i />
                        {alert.risk === "high"
                          ? "High Risk"
                          : "Under Review"}
                      </div>

                      <div className={styles.reason}>
                        <span>Reason</span>
                        <strong>{alert.reason}</strong>
                      </div>

                      <div className={styles.detected}>
                        <span>Detected</span>
                        <strong>{formatDate(alert.detectedAt)}</strong>
                      </div>

                      <button
                        type="button"
                        className={styles.detailsButton}
                        onClick={() => openDetails(alert)}
                      >
                        View Details <span>→</span>
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </article>

            <aside className={styles.sideColumn}>
              <article className={styles.insightCard}>
                <div className={styles.sectionEyebrow}>
                  FRAUD RISK INSIGHTS
                </div>

                <h2>Common Fraud Issues</h2>

                {issueCounts.length > 0 ? (
                  <div className={styles.donutLayout}>
                    <div
                      className={styles.donut}
                      style={{ background: donutBackground }}
                    >
                      <div className={styles.donutHole}>
                        <strong>{alerts.length}</strong>
                        <span>Flagged</span>
                      </div>
                    </div>

                    <div className={styles.legend}>
                      {issueCounts.map(([name, count], index) => (
                        <div key={name}>
                          <i
                            className={styles.legendDot}
                            style={{
                              background:
                                [
                                  "#ef4444",
                                  "#f59e0b",
                                  "#3b82f6",
                                  "#94a3b8",
                                ][index],
                            }}
                          />
                          <span>{name}</span>
                          <strong>
                            {issueTotal
                              ? Math.round((count / issueTotal) * 100)
                              : 0}
                            %
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.noInsight}>
                    No fraud issue pattern has been recorded yet.
                  </div>
                )}
              </article>

              <article className={styles.locationCard}>
                <div className={styles.sectionEyebrow}>
                  FLAGGED LOCATIONS
                </div>

                <h2>Locations Requiring Attention</h2>

                {locationCounts.length > 0 ? (
                  <div className={styles.locationList}>
                    {locationCounts.map(([location, count]) => (
                      <div key={location}>
                        <span className={styles.locationPin}>●</span>
                        <strong>{location}</strong>
                        <small>
                          {count} {count === 1 ? "flagged document" : "flagged documents"}
                        </small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noInsight}>
                    Location information will appear when available.
                  </div>
                )}
              </article>

              <article className={styles.helpCard}>
                <div className={styles.helpIcon}>⚑</div>

                <div>
                  <h2>See Something Suspicious?</h2>

                  <p>
                    Report suspicious property documents or activity for
                    further investigation.
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push("/report-suspicious")}
                  >
                    Report Now <span>→</span>
                  </button>
                </div>
              </article>
            </aside>
          </section>

          <section className={styles.bottomBanner}>
            <div className={styles.bottomIcon}>✓</div>

            <div>
              <strong>Fraud Watch is an early-warning layer</strong>
              <span>
                It surfaces suspicious signals from verification findings. It
                does not independently establish legal fraud, ownership or
                government authenticity.
              </span>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
