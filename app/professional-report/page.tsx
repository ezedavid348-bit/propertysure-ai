"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "../AppShell/AppShell";
import { supabase } from "../lib/supabase";
import styles from "./professional-report.module.css";

type RiskLevel = "Low" | "Medium" | "High" | "Not Conclusive";

type AssessmentStatus =
  | "Reviewed"
  | "Attention Required"
  | "Verified"
  | "Partially Verified"
  | "Pending External Confirmation"
  | "High Risk"
  | "Pending";

type LocationStatus =
  | "Location Consistent"
  | "Location Mismatch"
  | "Location Not Conclusive";

type PackageDocument = {
  name?: string;
  path?: string;
  type?: string;
  document_type?: string;
  reference?: string;
  document_reference?: string;
  confidence?: number | null;
  ai_confidence?: number | null;
  status?: string;
  result?: string;
  summary?: string;
  findings?: Record<string, unknown>;
};

type VerificationRecord = {
  id: number | string;
  user_id?: string;
  doc_name?: string | null;
  file_url?: string | null;
  doc_type?: string | null;
  status?: string | null;
  trust_score?: number | null;
  confidence?: number | null;
  risk?: string | null;
  findings?: Record<string, unknown> | null;
};

type PaymentRecord = {
  plan?: string | null;
  status?: string | null;
  amount?: number | null;
  paid_at?: string | null;
};

const PROFESSIONAL_PRICE = 549999;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function firstValue(...values: unknown[]): unknown {
  return values.find(
    (value) => value !== undefined && value !== null && value !== "",
  );
}

function stringValue(...values: unknown[]): string {
  const value = firstValue(...values);

  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function numberValue(...values: unknown[]): number | null {
  const value = firstValue(...values);

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function clampScore(value: number | null): number | null {
  if (value === null) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(amount: number | null): string {
  if (amount === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getRiskClass(level: RiskLevel): string {
  if (level === "Low") {
    return styles.riskLow;
  }

  if (level === "High") {
    return styles.riskHigh;
  }

  if (level === "Medium") {
    return styles.riskMedium;
  }

  return styles.riskNeutral;
}

function normalizeRisk(value: unknown): RiskLevel {
  const normalized = stringValue(value).toLowerCase();

  if (normalized.includes("high")) {
    return "High";
  }

  if (normalized.includes("medium")) {
    return "Medium";
  }

  if (normalized.includes("low")) {
    return "Low";
  }

  return "Not Conclusive";
}

function getPlanFromPayment(payment: PaymentRecord | null): string {
  return stringValue(payment?.plan).toLowerCase();
}

function getNested(
  record: Record<string, unknown>,
  ...keys: string[]
): unknown {
  let current: unknown = record;

  for (const key of keys) {
    const object = asRecord(current);
    current = object[key];
  }

  return current;
}

function getPackageDocuments(
  findings: Record<string, unknown>,
): PackageDocument[] {
  const packageValue = firstValue(
    findings.document_package,
    findings.documents,
    getNested(findings, "professional", "documents"),
    getNested(findings, "professional", "document_results"),
  );

  if (!Array.isArray(packageValue)) {
    return [];
  }

  return packageValue.filter(
    (item): item is PackageDocument =>
      !!item && typeof item === "object" && !Array.isArray(item),
  );
}

function getLocationData(findings: Record<string, unknown>) {
  const location = asRecord(
    firstValue(
      findings.location,
      findings.gps,
      findings.property_location,
      getNested(findings, "professional", "location"),
      getNested(findings, "professional", "gps"),
    ),
  );

  const latitude = numberValue(
    location.latitude,
    location.lat,
    findings.latitude,
    findings.lat,
  );

  const longitude = numberValue(
    location.longitude,
    location.lng,
    location.lon,
    findings.longitude,
    findings.lng,
    findings.lon,
  );

  const documentLocation = stringValue(
    location.document_location,
    location.documentLocation,
    findings.document_location,
    getNested(findings, "property", "location"),
  );

  const detectedLocation = stringValue(
    location.detected_location,
    location.detectedLocation,
    location.address,
    findings.detected_location,
  );

  const confidence = clampScore(
    numberValue(
      location.confidence,
      location.location_confidence,
      findings.location_confidence,
    ),
  );

  const explicitStatus = stringValue(
    location.status,
    findings.location_status,
    getNested(findings, "professional", "location_status"),
  ).toLowerCase();

  let status: LocationStatus = "Location Not Conclusive";

  if (
    explicitStatus.includes("mismatch") ||
    explicitStatus.includes("discrepancy")
  ) {
    status = "Location Mismatch";
  } else if (
    explicitStatus.includes("consistent") ||
    explicitStatus.includes("match")
  ) {
    status = "Location Consistent";
  } else if (
    latitude !== null &&
    longitude !== null &&
    documentLocation &&
    detectedLocation
  ) {
    status =
      documentLocation.toLowerCase() === detectedLocation.toLowerCase()
        ? "Location Consistent"
        : "Location Not Conclusive";
  }

  return {
    latitude,
    longitude,
    documentLocation,
    detectedLocation,
    confidence,
    status,
    distance: numberValue(
      location.distance_meters,
      location.distance,
      findings.location_distance,
    ),
    source:
      stringValue(location.source, findings.location_source) ||
      "Available property location data",
    discrepancy: stringValue(
      location.discrepancy,
      location.notes,
      findings.location_discrepancy,
    ),
  };
}

function getRiskAssessment(
  findings: Record<string, unknown>,
): Array<[string, RiskLevel]> {
  const risk = asRecord(
    firstValue(
      findings.risk_assessment,
      getNested(findings, "professional", "risk_assessment"),
    ),
  );

  return [
    [
      "Document Risk",
      normalizeRisk(firstValue(risk.document_risk, findings.document_risk)),
    ],
    [
      "Ownership Risk",
      normalizeRisk(firstValue(risk.ownership_risk, findings.ownership_risk)),
    ],
    [
      "Title Risk",
      normalizeRisk(firstValue(risk.title_risk, findings.title_risk)),
    ],
    [
      "Consistency Risk",
      normalizeRisk(
        firstValue(risk.consistency_risk, findings.consistency_risk),
      ),
    ],
    [
      "Fraud / Manipulation Risk",
      normalizeRisk(
        firstValue(
          risk.fraud_risk,
          risk.manipulation_risk,
          findings.fraud_risk,
        ),
      ),
    ],
    [
      "Location / Property Risk",
      normalizeRisk(
        firstValue(
          risk.location_risk,
          risk.property_risk,
          findings.location_risk,
        ),
      ),
    ],
    [
      "Transaction Risk",
      normalizeRisk(
        firstValue(risk.transaction_risk, findings.transaction_risk),
      ),
    ],
  ];
}

function getAssessment(
  findings: Record<string, unknown>,
  verification: VerificationRecord,
): AssessmentStatus {
  const explicit = stringValue(
    getNested(findings, "professional", "assessment", "status"),
    getNested(findings, "professional", "status"),
    findings.overall_status,
    findings.assessment_status,
  );

  if (explicit) {
    const normalized = explicit.toLowerCase();

    if (normalized.includes("high risk")) {
      return "High Risk";
    }

    if (normalized.includes("attention")) {
      return "Attention Required";
    }

    /*
     * Check partially verified BEFORE verified.
     * "Partially Verified" contains the word "verified".
     */
    if (normalized.includes("partially")) {
      return "Partially Verified";
    }

    if (normalized.includes("external")) {
      return "Pending External Confirmation";
    }

    if (normalized.includes("verified")) {
      return "Verified";
    }

    if (normalized.includes("review")) {
      return "Reviewed";
    }
  }

  const risk = normalizeRisk(
    firstValue(
      getNested(findings, "professional", "risk"),
      findings.risk,
      verification.risk,
    ),
  );

  if (risk === "High") {
    return "High Risk";
  }

  if (risk === "Medium") {
    return "Attention Required";
  }

  if (verification.status === "processed") {
    return "Reviewed";
  }

  return "Pending";
}

function getRecommendation(
  findings: Record<string, unknown>,
  assessment: AssessmentStatus,
): string {
  const explicit = stringValue(
    getNested(findings, "professional", "recommendation", "status"),
    getNested(findings, "professional", "recommendation"),
    findings.recommendation,
  );

  if (explicit) {
    return explicit;
  }

  if (assessment === "Verified") {
    return "Proceed";
  }

  if (assessment === "High Risk") {
    return "Do Not Proceed Until Resolved";
  }

  if (
    assessment === "Attention Required" ||
    assessment === "Partially Verified"
  ) {
    return "Proceed With Caution";
  }

  return "Further Verification Required";
}

function getCoordinatesString(
  latitude: number | null,
  longitude: number | null,
): string {
  if (latitude === null || longitude === null) {
    return "Not available";
  }

  return `${Math.abs(latitude).toFixed(6)}° ${
    latitude >= 0 ? "N" : "S"
  }, ${Math.abs(longitude).toFixed(6)}° ${
    longitude >= 0 ? "E" : "W"
  }`;
}

function getMapUrl(latitude: number, longitude: number): string {
  const delta = 0.015;

  const bbox = `${longitude - delta},${latitude - delta},${
    longitude + delta
  },${latitude + delta}`;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

function getMapsLink(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${latitude},${longitude}`,
  )}`;
}

function ProfessionalReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verificationId = searchParams.get("id") || "";

  const [verification, setVerification] =
    useState<VerificationRecord | null>(null);

  const [payment, setPayment] = useState<PaymentRecord | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] =
    useState("executive-summary");

  useEffect(() => {
    let mounted = true;

    async function loadReport() {
      if (!verificationId) {
        setError("Verification ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const numericId = Number(verificationId);

        const query = Number.isFinite(numericId)
          ? supabase
              .from("verifications")
              .select("*")
              .eq("id", numericId)
              .single()
          : supabase
              .from("verifications")
              .select("*")
              .eq("id", verificationId)
              .single();

        const {
          data,
          error: verificationError,
        } = await query;

        if (verificationError) {
          throw verificationError;
        }

        if (!data) {
          throw new Error(
            "Verification record could not be found.",
          );
        }

        const {
          data: paymentData,
          error: paymentError,
        } = await supabase
          .from("payments")
          .select("plan,status,amount,paid_at")
          .eq("verification_id", data.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (paymentError) {
          console.warn(
            "PAYMENT LOOKUP WARNING:",
            paymentError,
          );
        }

        if (mounted) {
          setVerification(data as VerificationRecord);
          setPayment(
            (paymentData || null) as PaymentRecord | null,
          );
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load the Professional report.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      mounted = false;
    };
  }, [verificationId]);

  const findings = useMemo(
    () => asRecord(verification?.findings),
    [verification],
  );

  const documents = useMemo(
    () => getPackageDocuments(findings),
    [findings],
  );

  const location = useMemo(
    () => getLocationData(findings),
    [findings],
  );

  const risks = useMemo(
    () => getRiskAssessment(findings),
    [findings],
  );

  const assessment = useMemo(
    () =>
      verification
        ? getAssessment(findings, verification)
        : "Pending",
    [findings, verification],
  );

  const recommendation = useMemo(
    () => getRecommendation(findings, assessment),
    [findings, assessment],
  );

  const confidence = clampScore(
    numberValue(
      getNested(findings, "professional", "confidence"),
      findings.confidence,
      verification?.confidence,
    ),
  );

  const trustScore = clampScore(
    numberValue(
      getNested(findings, "professional", "trust_score"),
      findings.trust_score,
      verification?.trust_score,
    ),
  );

  const overallRisk = normalizeRisk(
    firstValue(
      getNested(findings, "professional", "risk"),
      findings.risk,
      verification?.risk,
    ),
  );

  const property = asRecord(
    firstValue(
      findings.property,
      getNested(findings, "professional", "property"),
    ),
  );

  const ownership = asRecord(
    firstValue(
      findings.ownership,
      getNested(findings, "professional", "ownership"),
      getNested(findings, "professional", "title"),
    ),
  );

  const crossDocument = asRecord(
    firstValue(
      findings.cross_document_analysis,
      getNested(
        findings,
        "professional",
        "cross_document_analysis",
      ),
    ),
  );

  const propertyType =
    stringValue(
      property.property_type,
      property.type,
      findings.property_type,
    ) || "Not conclusive";

  const propertyLocation =
    stringValue(
      property.location,
      property.address,
      findings.property_location,
      location.detectedLocation,
    ) || "Not conclusive";

  /*
   * verifications does not reliably contain created_at / updated_at.
   * Payment paid_at is therefore the safe report completion timestamp.
   */
  const reportDate = formatDate(payment?.paid_at);

  const sections = [
    ["executive-summary", "Executive Summary"],
    ["documents-reviewed", "Documents Reviewed"],
    ["document-findings", "Document Findings"],
    ["cross-document", "Cross-Document Analysis"],
    ["ownership-title", "Ownership & Title"],
    ["property-details", "Property Details"],
    ["location-gps", "Location & GPS"],
    ["risk-assessment", "Risk Assessment"],
    ["outstanding-issues", "Outstanding Issues"],
    ["recommendation", "Professional Recommendation"],
    ["scope-limitations", "Scope & Limitations"],
  ] as const;

  function scrollToSection(id: string) {
    setActiveSection(id);

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function downloadReport() {
    if (!verification) {
      return;
    }

    window.open(
      `/api/report?id=${encodeURIComponent(
        String(verification.id),
      )}`,
      "_blank",
    );
  }

  async function shareReport() {
    try {
      if (navigator.share) {
        await navigator.share({
          title:
            "PropertySure AI Professional Verification Report",
          url: window.location.href,
        });

        return;
      }

      await navigator.clipboard.writeText(
        window.location.href,
      );
    } catch (shareError) {
      if (
        shareError instanceof DOMException &&
        shareError.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "REPORT SHARE ERROR:",
        shareError,
      );
    }
  }

  if (loading) {
    return (
      <AppShell
        activePath="/verify"
        headerPath="/professional-report"
      >
        <div className={styles.loadingPage}>
          <div className={styles.loadingCard}>
            <div className={styles.spinner} />

            <h2>Loading Professional report</h2>

            <p>
              Retrieving the completed property
              verification data...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !verification) {
    return (
      <AppShell
        activePath="/verify"
        headerPath="/professional-report"
      >
        <div className={styles.loadingPage}>
          <div className={styles.loadingCard}>
            <div className={styles.errorIcon}>!</div>

            <h2>Unable to load report</h2>

            <p>
              {error ||
                "The Professional verification report could not be loaded."}
            </p>

            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const paymentIsProfessional =
    getPlanFromPayment(payment) === "professional";

  const paymentIsPaid =
    String(payment?.status || "").toLowerCase() ===
    "paid";

  const attentionCount = risks.filter(
    ([, risk]) =>
      risk === "Medium" || risk === "High",
  ).length;

  return (
    <AppShell
      activePath="/verify"
      headerPath="/professional-report"
    >
      <main className={styles.page}>
        {/* =====================================================
            HERO
        ====================================================== */}

        <section className={styles.hero}>
          <div
            className={styles.heroVisual}
            aria-hidden="true"
          >
            <div className={styles.heroGlow} />

            <div className={styles.heroPin}>
              ⌖
            </div>

            <div className={styles.heroBuilding}>
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className={styles.heroShield}>
              ✓
            </div>
          </div>

          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              PROFESSIONAL VERIFICATION REPORT
            </div>

            <h1>
              Property Verification Report
            </h1>

            <p>
              Comprehensive analysis of the submitted
              property document package, including
              document consistency, property information,
              ownership indicators, risk factors, location
              data, and professional verification findings.
            </p>

            <div className={styles.heroActions}>
              <button
                type="button"
                onClick={shareReport}
                className={
                  styles.secondaryHeroButton
                }
              >
                ⤴ Share Report
              </button>

              <button
                type="button"
                onClick={downloadReport}
                className={styles.primaryHeroButton}
              >
                ⇩ Download Report
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            REPORT META
        ====================================================== */}

        <section className={styles.metaBar}>
          <div>
            <span>Verification ID</span>

            <strong>
              #{String(verification.id)}
            </strong>
          </div>

          <div>
            <span>Plan</span>

            <strong>
              ♛ Professional
            </strong>
          </div>

          <div>
            <span>Report Status</span>

            <strong
              className={
                verification.status === "processed"
                  ? styles.successText
                  : styles.textNeutral
              }
            >
              {verification.status === "processed"
                ? "✓ Completed"
                : "◷ In Progress"}
            </strong>
          </div>

          <div>
            <span>Documents Reviewed</span>

            <strong>
              {documents.length || "—"}{" "}
              {documents.length === 1
                ? "document"
                : "documents"}
            </strong>
          </div>

          <div>
            <span>Completed</span>

            <strong>
              {formatDateTime(payment?.paid_at)}
            </strong>
          </div>
        </section>

        {/* =====================================================
            OVERALL ASSESSMENT
        ====================================================== */}

        <section className={styles.assessmentCard}>
          <div className={styles.assessmentMain}>
            <div className={styles.sectionEyebrow}>
              OVERALL VERIFICATION ASSESSMENT
            </div>

            <div className={styles.assessmentRow}>
              <div
                className={`${styles.assessmentIcon} ${
                  assessment === "High Risk"
                    ? styles.iconDanger
                    : styles.iconSuccess
                }`}
              >
                {assessment === "High Risk"
                  ? "!"
                  : "✓"}
              </div>

              <div>
                <h2>
                  {assessment.toUpperCase()}
                </h2>

                <p>
                  {assessment === "Pending"
                    ? "The Professional verification data is not yet complete."
                    : assessment === "High Risk"
                      ? "The submitted property package contains material risk indicators that should be resolved before relying on the verification."
                      : assessment ===
                          "Attention Required"
                        ? "The submitted property package contains findings that require additional review or confirmation."
                        : assessment ===
                            "Partially Verified"
                          ? "The available information supports some verification conclusions, but additional confirmation remains necessary."
                          : "The submitted property package has been reviewed using the available Professional verification data. Findings requiring further confirmation are identified below."}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.overallRiskBox}>
            <span>Overall Risk</span>

            <strong
              className={getRiskClass(
                overallRisk,
              )}
            >
              {overallRisk}
            </strong>

            <p>
              Risk reflects the available findings and
              should be considered together with outstanding
              issues and scope limitations.
            </p>
          </div>
        </section>

        {/* =====================================================
            METRICS
        ====================================================== */}

        <section className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span>◒ Overall Risk</span>

            <strong
              className={getRiskClass(
                overallRisk,
              )}
            >
              {overallRisk}
            </strong>
          </div>

          <div className={styles.metricCard}>
            <span>
              ◈ Verification Confidence
            </span>

            <strong>
              {confidence !== null
                ? `${confidence}%`
                : "—"}
            </strong>
          </div>

          <div className={styles.metricCard}>
            <span>▤ Documents Reviewed</span>

            <strong>
              {documents.length || "—"}
            </strong>
          </div>

          <div className={styles.metricCard}>
            <span>⚠ Attention Items</span>

            <strong
              className={
                styles.attentionNumber
              }
            >
              {attentionCount}
            </strong>
          </div>
        </section>

        {/* =====================================================
            SECTION NAVIGATION
        ====================================================== */}

        <nav
          className={styles.sectionNav}
          aria-label="Professional report sections"
        >
          {sections.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={
                activeSection === id
                  ? styles.navActive
                  : ""
              }
              onClick={() =>
                scrollToSection(id)
              }
            >
              {label}
            </button>
          ))}
        </nav>

        {/* =====================================================
            EXECUTIVE SUMMARY
        ====================================================== */}

        <section
          id="executive-summary"
          className={styles.card}
        >
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardIcon}>
                ▤
              </span>

              <div>
                <h2>
                  Executive Summary
                </h2>

                <p>
                  High-level assessment of the submitted
                  property package.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryText}>
              <p>
                {stringValue(
                  getNested(
                    findings,
                    "professional",
                    "executive_summary",
                  ),
                  findings.executive_summary,
                ) ||
                  "The Professional report will present the consolidated assessment once the Professional verification engine has supplied its findings."}
              </p>

              <div
                className={styles.summaryStats}
              >
                <div>
                  <span>
                    Documents Reviewed
                  </span>

                  <strong>
                    {documents.length ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Property Type
                  </span>

                  <strong>
                    {propertyType}
                  </strong>
                </div>

                <div>
                  <span>Location</span>

                  <strong>
                    {propertyLocation}
                  </strong>
                </div>

                <div>
                  <span>Report Date</span>

                  <strong>
                    {reportDate}
                  </strong>
                </div>
              </div>
            </div>

            <div
              className={
                styles.recommendationMini
              }
            >
              <span>
                Professional Recommendation
              </span>

              <strong>
                {recommendation}
              </strong>

              <p>
                {stringValue(
                  getNested(
                    findings,
                    "professional",
                    "recommendation",
                    "reason",
                  ),
                  findings.recommendation_reason,
                ) ||
                  "The recommendation is based on the available verification findings and outstanding issues."}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            DOCUMENTS REVIEWED
        ====================================================== */}

        <section
          id="documents-reviewed"
          className={styles.card}
        >
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardIcon}>
                ▤
              </span>

              <div>
                <h2>
                  Documents Reviewed
                </h2>

                <p>
                  {documents.length || 0}{" "}
                  documents available in this
                  verification package.
                </p>
              </div>
            </div>

            <span
              className={styles.countBadge}
            >
              {documents.length}
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    Document Type
                  </th>
                  <th>
                    Document Reference
                  </th>
                  <th>
                    AI Confidence
                  </th>
                  <th>
                    Professional Status
                  </th>
                  <th>
                    Key Finding
                  </th>
                </tr>
              </thead>

              <tbody>
                {documents.map(
                  (document, index) => {
                    const confidenceValue =
                      clampScore(
                        numberValue(
                          document.ai_confidence,
                          document.confidence,
                        ),
                      );

                    const status =
                      stringValue(
                        document.status,
                        document.result,
                      ) || "Pending";

                    const documentFinding =
                      stringValue(
                        document.summary,
                        getNested(
                          document.findings || {},
                          "summary",
                        ),
                      ) ||
                      "No professional finding supplied yet.";

                    const statusLower =
                      status.toLowerCase();

                    const statusClass =
                      statusLower.includes(
                        "attention",
                      )
                        ? styles.pillAttention
                        : styles.pillReviewed;

                    return (
                      <tr
                        key={`${document.path || document.name || "document"}-${index}`}
                      >
                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <strong>
                            {stringValue(
                              document.document_type,
                              document.type,
                            ) ||
                              "Document"}
                          </strong>
                        </td>

                        <td>
                          {stringValue(
                            document.document_reference,
                            document.reference,
                          ) || "—"}
                        </td>

                        <td>
                          {confidenceValue !==
                          null
                            ? `${confidenceValue}%`
                            : "—"}
                        </td>

                        <td>
                          <span
                            className={`${styles.statusPill} ${statusClass}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          {documentFinding}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>

          {documents.length === 0 && (
            <div
              className={styles.emptyState}
            >
              Professional document findings are not
              available yet.
            </div>
          )}
        </section>

        {/* =====================================================
            DOCUMENT FINDINGS
        ====================================================== */}

        <section
          id="document-findings"
          className={styles.card}
        >
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardIcon}>
                ▣
              </span>

              <div>
                <h2>
                  Document Findings
                </h2>

                <p>
                  Individual document-level findings
                  supplied by the verification engine.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.findingsGrid}>
            {documents.map(
              (document, index) => {
                const documentFindings =
                  asRecord(
                    document.findings,
                  );

                const checks = asRecord(
                  firstValue(
                    documentFindings.checks,
                    documentFindings.verification_checks,
                  ),
                );

                const entries =
                  Object.entries(checks).slice(
                    0,
                    6,
                  );

                return (
                  <article
                    className={
                      styles.findingCard
                    }
                    key={`${document.name || "doc"}-${index}`}
                  >
                    <div
                      className={
                        styles.findingTitle
                      }
                    >
                      <span>
                        {String(index + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      <div>
                        <strong>
                          {stringValue(
                            document.document_type,
                            document.type,
                          ) ||
                            "Document"}
                        </strong>

                        <small>
                          {stringValue(
                            document.document_reference,
                            document.reference,
                          ) ||
                            "No reference"}
                        </small>
                      </div>
                    </div>

                    <p>
                      {stringValue(
                        document.summary,
                      ) ||
                        "No document-level professional summary is available yet."}
                    </p>

                    {entries.length > 0 && (
                      <div
                        className={
                          styles.checkList
                        }
                      >
                        {entries.map(
                          ([key, value]) => {
                            const booleanValue =
                              typeof value ===
                              "boolean"
                                ? value
                                : null;

                            const displayValue =
                              booleanValue ===
                              true
                                ? "No Issue Detected"
                                : booleanValue ===
                                    false
                                  ? "Attention"
                                  : "Not Conclusive";

                            const valueClass =
                              booleanValue ===
                              false
                                ? styles.textDanger
                                : booleanValue ===
                                    true
                                  ? styles.textSuccess
                                  : styles.textNeutral;

                            return (
                              <div
                                key={key}
                              >
                                <span>
                                  {titleCase(
                                    key,
                                  )}
                                </span>

                                <strong
                                  className={
                                    valueClass
                                  }
                                >
                                  {displayValue}
                                </strong>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                  </article>
                );
              },
            )}

            {documents.length === 0 && (
              <div
                className={
                  styles.emptyState
                }
              >
                No document-level Professional findings
                are available yet.
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            CROSS DOCUMENT ANALYSIS
        ====================================================== */}

        <section
          id="cross-document"
          className={styles.card}
        >
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardIcon}>
                ⇄
              </span>

              <div>
                <h2>
                  Cross-Document Analysis
                </h2>

                <p>
                  Comparison of property information across
                  the submitted document package.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.detailGrid}>
            {[
              [
                "Owner / Applicant Name",
                firstValue(
                  crossDocument.owner_name,
                  crossDocument.ownerName,
                  ownership.owner_name,
                  ownership.name,
                  findings.owner_name,
                ),
              ],
              [
                "Property Description",
                firstValue(
                  crossDocument.property_description,
                  property.description,
                  findings.property_description,
                ),
              ],
              [
                "Plot / Block",
                firstValue(
                  crossDocument.plot_block,
                  crossDocument.plot,
                  property.plot,
                  property.block,
                  findings.plot_number,
                ),
              ],
              [
                "Survey Information",
                firstValue(
                  crossDocument.survey_reference,
                  property.survey_reference,
                  findings.survey_reference,
                ),
              ],
              [
                "Location",
                firstValue(
                  crossDocument.location,
                  propertyLocation,
                ),
              ],
              [
                "Land Size",
                firstValue(
                  crossDocument.land_size,
                  property.land_size,
                  property.area,
                  findings.land_size,
                ),
              ],
              [
                "Title Reference",
                firstValue(
                  crossDocument.title_reference,
                  ownership.title_reference,
                  findings.title_reference,
                ),
              ],
              [
                "Relevant Dates",
                firstValue(
                  crossDocument.dates,
                  property.date,
                  findings.relevant_dates,
                ),
              ],
            ].map(([label, value]) => (
              <div
                className={styles.detailBox}
                key={String(label)}
              >
                <span>
                  {String(label)}
                </span>

                <strong>
                  {stringValue(value) ||
                    "Not Conclusive"}
                </strong>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            OWNERSHIP + PROPERTY DETAILS
        ====================================================== */}

        <section
          id="ownership-title"
          className={styles.twoColumn}
        >
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span
                  className={styles.cardIcon}
                >
                  ♙
                </span>

                <div>
                  <h2>
                    Ownership & Title Analysis
                  </h2>

                  <p>
                    Consistency indicators for ownership
                    and title information.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.detailGrid}>
              {[
                [
                  "Named Owner",
                  firstValue(
                    ownership.owner_name,
                    ownership.name,
                    findings.owner_name,
                  ),
                ],
                [
                  "Title Reference",
                  firstValue(
                    ownership.title_reference,
                    ownership.reference,
                    findings.title_reference,
                  ),
                ],
                [
                  "Ownership Status",
                  firstValue(
                    ownership.status,
                    findings.ownership_status,
                  ),
                ],
                [
                  "Registry Search",
                  firstValue(
                    ownership.registry_search,
                    getNested(
                      findings,
                      "professional",
                      "registry_search",
                    ),
                  ),
                ],
              ].map(([label, value]) => (
                <div
                  className={styles.detailBox}
                  key={String(label)}
                >
                  <span>
                    {String(label)}
                  </span>

                  <strong>
                    {stringValue(value) ||
                      "Not Conclusive"}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div
            id="property-details"
            className={styles.card}
          >
            <div className={styles.cardHeader}>
              <div>
                <span
                  className={styles.cardIcon}
                >
                  ⌖
                </span>

                <div>
                  <h2>
                    Property Details
                  </h2>

                  <p>
                    Property information extracted and
                    assessed from available data.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.detailGrid}>
              {[
                [
                  "Property Type",
                  propertyType,
                ],
                [
                  "Location",
                  propertyLocation,
                ],
                [
                  "Land Size",
                  firstValue(
                    property.land_size,
                    property.area,
                    findings.land_size,
                  ),
                ],
                [
                  "Property Description",
                  firstValue(
                    property.description,
                    findings.property_description,
                  ),
                ],
              ].map(([label, value]) => (
                <div
                  className={styles.detailBox}
                  key={String(label)}
                >
                  <span>
                    {String(label)}
                  </span>

                  <strong>
                    {stringValue(value) ||
                      "Not Conclusive"}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            LOCATION + GPS
        ====================================================== */}

        <section
          id="location-gps"
          className={styles.card}
        >
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardIcon}>
                ⌖
              </span>

              <div>
                <h2>
                  Property Location & GPS Verification
                </h2>

                <p>
                  Geographic consistency analysis using
                  available property-location data.
                </p>
              </div>
            </div>

            <span
              className={`${styles.locationPill} ${
                location.status ===
                "Location Consistent"
                  ? styles.locationGood
                  : location.status ===
                      "Location Mismatch"
                    ? styles.locationBad
                    : styles.locationNeutral
              }`}
            >
              {location.status}
            </span>
          </div>

          <div className={styles.locationGrid}>
            <div
              className={
                styles.locationStatusCard
              }
            >
              <span>
                Location Status
              </span>

              <strong>
                {location.status}
              </strong>

              <p>
                {location.status ===
                "Location Consistent"
                  ? "The available geographic information is consistent with the property location stated in the submitted documents."
                  : location.status ===
                      "Location Mismatch"
                    ? "A geographic discrepancy was identified. This should be reviewed before relying on the property information."
                    : "The available location information is not sufficient to establish geographic consistency."}
              </p>
            </div>

            <div
              className={
                styles.locationDetails
              }
            >
              <div>
                <span>
                  GPS Coordinates
                </span>

                <strong>
                  {getCoordinatesString(
                    location.latitude,
                    location.longitude,
                  )}
                </strong>

                {location.latitude !== null &&
                  location.longitude !==
                    null && (
                    <a
                      href={getMapsLink(
                        location.latitude,
                        location.longitude,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Maps →
                    </a>
                  )}
              </div>

              <div>
                <span>
                  Document Location
                </span>

                <strong>
                  {location.documentLocation ||
                    "Not Conclusive"}
                </strong>
              </div>

              <div>
                <span>
                  Detected Location
                </span>

                <strong>
                  {location.detectedLocation ||
                    "Not Conclusive"}
                </strong>
              </div>

              <div>
                <span>
                  Location Confidence
                </span>

                <strong>
                  {location.confidence !== null
                    ? `${location.confidence}%`
                    : "—"}
                </strong>

                {location.confidence !== null && (
                  <div
                    className={styles.progress}
                  >
                    <span
                      style={{
                        width: `${location.confidence}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <span>
                  Location Source
                </span>

                <strong>
                  {location.source}
                </strong>
              </div>

              <div>
                <span>
                  Distance / Discrepancy
                </span>

                <strong>
                  {location.distance !== null
                    ? `${Math.round(
                        location.distance,
                      )} m`
                    : location.discrepancy ||
                      "Not Conclusive"}
                </strong>
              </div>
            </div>

            <div
              className={styles.mapPanel}
            >
              {location.latitude !== null &&
              location.longitude !== null ? (
                <>
                  <iframe
                    title="Property location map"
                    src={getMapUrl(
                      location.latitude,
                      location.longitude,
                    )}
                    loading="lazy"
                  />

                  <a
                    className={styles.mapButton}
                    href={getMapsLink(
                      location.latitude,
                      location.longitude,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Larger Map ↗
                  </a>
                </>
              ) : (
                <div
                  className={
                    styles.mapUnavailable
                  }
                >
                  <span>⌖</span>

                  <strong>
                    Location data unavailable
                  </strong>

                  <p>
                    The map will appear automatically when
                    usable property coordinates are supplied.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className={
              styles.locationDisclaimer
            }
          >
            GPS provides an additional geographic
            verification signal. It does not independently
            prove document authenticity, ownership, or
            government issuance.
          </div>
        </section>

        {/* =====================================================
            RISK ASSESSMENT
        ====================================================== */}

        <section
          id="risk-assessment"
          className={styles.card}
        >
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardIcon}>
                ◈
              </span>

              <div>
                <h2>
                  Risk Assessment Overview
                </h2>

                <p>
                  Risk categories derived from the available
                  Professional verification findings.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.riskGrid}>
            {risks.map(
              ([label, risk]) => (
                <div
                  className={styles.riskCard}
                  key={label}
                >
                  <span>
                    {label}
                  </span>

                  <strong
                    className={getRiskClass(
                      risk,
                    )}
                  >
                    {risk}
                  </strong>
                </div>
              ),
            )}
          </div>
        </section>

        {/* =====================================================
            OUTSTANDING ISSUES
        ====================================================== */}

        <section
          id="outstanding-issues"
          className={styles.card}
        >
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardIcon}>
                !
              </span>

              <div>
                <h2>
                  Outstanding Issues
                </h2>

                <p>
                  Items requiring clarification, confirmation,
                  or additional verification.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.issueList}>
            {(() => {
              const issues = firstValue(
                getNested(
                  findings,
                  "professional",
                  "outstanding_issues",
                ),
                findings.outstanding_issues,
                findings.issues,
              );

              if (
                Array.isArray(issues) &&
                issues.length > 0
              ) {
                return issues.map(
                  (issue, index) => {
                    let issueText =
                      "Not Conclusive";

                    if (
                      typeof issue ===
                      "string"
                    ) {
                      issueText = issue;
                    } else {
                      try {
                        issueText =
                          JSON.stringify(
                            issue,
                          );
                      } catch {
                        issueText =
                          "Issue details unavailable.";
                      }
                    }

                    return (
                      <div
                        className={
                          styles.issueRow
                        }
                        key={index}
                      >
                        <span>
                          {index + 1}
                        </span>

                        <p>
                          {issueText}
                        </p>
                      </div>
                    );
                  },
                );
              }

              return (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  No outstanding issues have been supplied
                  by the Professional verification engine yet.
                </div>
              );
            })()}
          </div>
        </section>

        {/* =====================================================
            RECOMMENDATION
        ====================================================== */}

        <section
          id="recommendation"
          className={
            styles.recommendationCard
          }
        >
          <div>
            <span
              className={
                styles.sectionEyebrow
              }
            >
              PROFESSIONAL RECOMMENDATION
            </span>

            <h2>
              {recommendation}
            </h2>

            <p>
              {stringValue(
                getNested(
                  findings,
                  "professional",
                  "recommendation",
                  "text",
                ),
                findings.recommendation_text,
              ) ||
                "This recommendation is based on the available document, property, ownership, location, risk, and external verification findings."}
            </p>
          </div>

          <div
            className={styles.nextSteps}
          >
            <strong>
              Recommended Next Steps
            </strong>

            <ol>
              <li>
                Resolve outstanding issues identified
                in this report.
              </li>

              <li>
                Confirm ownership and title information
                through the relevant authority where
                required.
              </li>

              <li>
                Obtain any additional professional or
                physical verification required for the
                transaction.
              </li>
            </ol>
          </div>
        </section>

        {/* =====================================================
            SCOPE + LIMITATIONS
        ====================================================== */}

        <section
          id="scope-limitations"
          className={styles.card}
        >
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardIcon}>
                ⓘ
              </span>

              <div>
                <h2>
                  Verification Scope & Limitations
                </h2>

                <p>
                  The report distinguishes completed checks
                  from services not yet performed.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.scopeGrid}>
            {[
              [
                "AI Document Analysis",
                true,
              ],
              [
                "Cross-Document Analysis",
                Object.keys(crossDocument)
                  .length > 0,
              ],
              [
                "Ownership Consistency Analysis",
                Object.keys(ownership)
                  .length > 0,
              ],
              [
                "Property Information Analysis",
                Object.keys(property)
                  .length > 0,
              ],
              [
                "Property Location / GPS Analysis",
                location.latitude !== null &&
                  location.longitude !==
                    null,
              ],
              [
                "External Registry Search",
                stringValue(
                  getNested(
                    findings,
                    "professional",
                    "registry_search",
                    "status",
                  ),
                  ownership.registry_search,
                ) !== "",
              ],
              [
                "Physical Property Inspection",
                Boolean(
                  getNested(
                    findings,
                    "professional",
                    "physical_inspection",
                  ),
                ),
              ],
              [
                "Legal Opinion",
                Boolean(
                  getNested(
                    findings,
                    "professional",
                    "legal_opinion",
                  ),
                ),
              ],
            ].map(([label, complete]) => {
              const isComplete =
                Boolean(complete);

              return (
                <div
                  className={
                    styles.scopeRow
                  }
                  key={String(label)}
                >
                  <span>
                    {String(label)}
                  </span>

                  <strong
                    className={
                      isComplete
                        ? styles.textSuccess
                        : styles.textNeutral
                    }
                  >
                    {isComplete
                      ? "Available"
                      : "Not Included / Not Conclusive"}
                  </strong>
                </div>
              );
            })}
          </div>

          <div
            className={styles.disclaimer}
          >
            PropertySure AI provides technology-assisted
            verification and due-diligence analysis. A
            Professional report should not be treated as a
            legal opinion, title certificate, or guarantee
            of ownership or government issuance. Where an
            authority search, physical inspection, surveyor
            confirmation, lawyer review, or other external
            check has not been completed, the report will
            identify that limitation.
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className={styles.footer}>
          <div>
            <strong>
              PropertySure AI
            </strong>

            <span>
              Professional Property Verification Report
            </span>
          </div>

          <div>
            <span>
              Verification ID #
              {String(verification.id)}
            </span>

            <span>
              Plan: Professional
            </span>

            {paymentIsProfessional &&
              paymentIsPaid && (
                <span>
                  Payment:{" "}
                  {formatCurrency(
                    payment?.amount ||
                      PROFESSIONAL_PRICE,
                  )}
                </span>
              )}
          </div>
        </footer>
      </main>
    </AppShell>
  );
}

function ProfessionalReportFallback() {
  return (
    <AppShell
      activePath="/verify"
      headerPath="/professional-report"
    >
      <div className={styles.loadingPage}>
        <div className={styles.loadingCard}>
          <div className={styles.spinner} />

          <h2>
            Loading Professional report
          </h2>

          <p>
            Preparing your property verification
            report...
          </p>
        </div>
      </div>
    </AppShell>
  );
}

export default function ProfessionalReportPage() {
  return (
    <Suspense
      fallback={
        <ProfessionalReportFallback />
      }
    >
      <ProfessionalReportContent />
    </Suspense>
  );
}