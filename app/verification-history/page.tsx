"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "../AppShell/AppShell";
import LoadingScreen from "../AppShell/LoadingScreen";
import { supabase } from "../lib/supabase";
import styles from "./verification-history.module.css";

type CanonicalStatus = "verified" | "pending" | "flagged";
type DisplayStatus = CanonicalStatus | "unknown";
type Filter = "all" | CanonicalStatus;

type Verification = {
  id: string | number;
  user_id?: string | null;
  doc_name?: string | null;
  doc_type?: string | null;
  status?: string | null;
  trust_score?: number | null;
  confidence?: number | null;
  risk?: string | null;
  findings?: Record<string, unknown> | null;
  review_status?: string | null;
  created_at?: string | null;
  property_id?: string | null;
  __plan?: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * History uses the same status contract as Reports:
 *
 * - Essential/Basic: `review_status` is the final outcome.
 * - Professional/Premium: `status` is the report lifecycle/result status.
 * - `review` for Premium means AI analysis is complete and deeper review is
 *   pending, so History displays it as Pending.
 *
 * Risk/findings are never used to invent a status.
 */
function normalizeHistoryStatus(value?: string | null): DisplayStatus {
  const status = String(value || "").trim().toLowerCase();

  if (
    status === "pending" ||
    status === "processing" ||
    status === "in progress" ||
    status === "in_progress" ||
    status === "queued" ||
    status === "running" ||
    status === "started" ||
    status === "review" ||
    status === "inconclusive" ||
    status === "not started" ||
    status === "not_conclusive"
  ) {
    return "pending";
  }

  if (
    status === "flagged" ||
    status === "attention" ||
    status === "attention required" ||
    status === "attention_required" ||
    status === "rejected"
  ) {
    return "flagged";
  }

  if (
    status === "verified" ||
    status === "complete" ||
    status === "completed" ||
    status === "processed" ||
    status === "reviewed" ||
    status === "generated" ||
    status === "ready"
  ) {
    return "verified";
  }

  return "unknown";
}

function getVerificationPlan(row: Verification): "basic" | "professional" | "premium" | "unknown" {
  const findings = asRecord(row.findings);

  const raw = [
    row.__plan,
    findings.plan,
    findings.verificationPlan,
    findings.verification_plan,
    findings.verificationLevel,
    findings.verification_level,
    findings.verificationTier,
    findings.verification_tier,
    findings.package,
    findings.tier,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    raw.includes("premium") ||
    raw.includes("legal") ||
    raw.includes("lawyer")
  ) {
    return "premium";
  }

  if (raw.includes("professional") || raw.includes("human")) {
    return "professional";
  }

  if (
    raw.includes("essential") ||
    raw.includes("basic") ||
    raw.includes("ai")
  ) {
    return "basic";
  }

  return "unknown";
}

function getStatus(row: Verification): DisplayStatus {
  const plan = getVerificationPlan(row);

  // Essential/Basic final outcome is stored in review_status.
  if (plan === "basic") {
    const reviewStatus = normalizeHistoryStatus(row.review_status);
    return reviewStatus === "verified" ||
      reviewStatus === "flagged" ||
      reviewStatus === "pending"
      ? reviewStatus
      : "pending";
  }

  // Professional and Premium use the canonical lifecycle/result status.
  const databaseStatus = normalizeHistoryStatus(row.status);

  if (databaseStatus !== "unknown") {
    return databaseStatus;
  }

  // If plan metadata is unavailable, use an explicit final review status only.
  const reviewStatus = normalizeHistoryStatus(row.review_status);

  if (
    reviewStatus === "verified" ||
    reviewStatus === "flagged" ||
    reviewStatus === "pending"
  ) {
    return reviewStatus;
  }

  return "unknown";
}

function getStatusLabel(status: DisplayStatus) {
  if (status === "verified") return "Verified";
  if (status === "flagged") return "Flagged";
  if (status === "pending") return "Pending";
  return "Status unavailable";
}

type DocumentItem = {
  name: string;
  filename?: string;
};

function cleanDocumentName(value: unknown) {
  if (value === null || value === undefined) return "";

  const text = String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

function documentNameFromValue(value: unknown): string {
  if (typeof value === "string") return cleanDocumentName(value);

  const object = asRecord(value);

  const name =
    object.documentTitleDetected ||
    object.document_title_detected ||
    object.documentTitle ||
    object.document_title ||
    object.title ||
    object.documentTypeDetected ||
    object.document_type_detected ||
    object.documentType ||
    object.document_type ||
    object.type ||
    object.name ||
    object.fileName ||
    object.file_name ||
    object.filename;

  return cleanDocumentName(name);
}

function extractDocumentItems(row: Verification): DocumentItem[] {
  const findings = asRecord(row.findings);

  const candidates: unknown[] = [
    findings.documents,
    findings.documentResults,
    findings.packageDocuments,
    findings.document_results,
    findings.document_package,
    findings.documentPackage,
  ];

  const items: DocumentItem[] = [];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;

    for (const entry of candidate) {
      const object = asRecord(entry);
      const name = documentNameFromValue(entry);

      if (!name) continue;

      const filename = cleanDocumentName(
        object.fileName || object.file_name || object.filename || object.originalName
      );

      items.push({
        name,
        filename: filename && filename !== name ? filename : undefined,
      });
    }
  }

  // Some verification records store one document's classified result directly
  // instead of inside a package array.
  if (!items.length) {
    const direct = documentNameFromValue(findings);
    if (direct) {
      items.push({ name: direct });
    }
  }

  // Fall back to the canonical database fields for a single-document record.
  if (!items.length) {
    const fallback = cleanDocumentName(row.doc_type || row.doc_name);
    if (fallback) items.push({ name: fallback });
  }

  // De-duplicate while preserving the package's original order.
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getDocumentTitle(row: Verification) {
  const findings = asRecord(row.findings);
  const document = asRecord(findings.document);

  const value =
    findings.documentTitleDetected ||
    findings.document_title ||
    findings.documentTypeDetected ||
    findings.document_type ||
    document.title ||
    document.document_title ||
    document.type ||
    row.doc_type ||
    row.doc_name;

  if (!value) return "Property document";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getOwnerName(row: Verification) {
  const findings = asRecord(row.findings);

  /*
   * IMPORTANT:
   * The Results/Review flow already stores the person's extracted name as
   * `nameDetected` on the document classification result. History must use
   * that same value instead of inventing a separate owner-name source.
   *
   * We search the complete findings tree because different verification
   * versions may nest document results under different package keys.
   */
  const preferredKeys = new Set([
    "nameDetected",
    "name_detected",
    "ownerName",
    "owner_name",
    "ownerFullName",
    "owner_full_name",
    "registeredOwnerName",
    "registered_owner_name",
    "registeredOwner",
    "registered_owner",
    "titleHolderName",
    "title_holder_name",
    "titleHolder",
    "title_holder",
    "landOwnerName",
    "land_owner_name",
    "applicantName",
    "applicant_name",
    "applicantFullName",
    "applicant_full_name",
    "proprietorName",
    "proprietor_name",
    "granteeName",
    "grantee_name",
    "beneficiaryName",
    "beneficiary_name",
    "assigneeName",
    "assignee_name",
  ]);

  const ignoredNameKeys = new Set([
    "fileName",
    "file_name",
    "filename",
    "originalName",
    "original_name",
    "documentName",
    "document_name",
    "documentTitle",
    "document_title",
    "documentTitleDetected",
    "document_title_detected",
    "documentType",
    "document_type",
    "documentTypeDetected",
    "document_type_detected",
    "propertyName",
    "property_name",
    "propertyTitle",
    "property_title",
  ]);

  function findName(value: unknown, depth = 0): string {
    if (depth > 12 || value === null || value === undefined) {
      return "";
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findName(item, depth + 1);
        if (found) return found;
      }
      return "";
    }

    if (typeof value !== "object") return "";

    const object = value as Record<string, unknown>;

    // First pass: explicit extracted/owner name keys.
    for (const [key, candidate] of Object.entries(object)) {
      if (!preferredKeys.has(key)) continue;

      const text =
        typeof candidate === "string"
          ? candidate.trim()
          : "";

      if (
        text &&
        !ignoredNameKeys.has(key) &&
        text.length <= 180
      ) {
        return text;
      }
    }

    // Second pass: recursively inspect every nested document/result/package.
    for (const [key, candidate] of Object.entries(object)) {
      if (ignoredNameKeys.has(key)) continue;

      const found = findName(candidate, depth + 1);
      if (found) return found;
    }

    return "";
  }

  return findName(findings);
}

function getPropertyName(row: Verification) {
  const findings = asRecord(row.findings);
  const property = asRecord(findings.property);

  const value =
    findings.propertyName ||
    findings.property_name ||
    findings.propertyTitle ||
    findings.property_title ||
    property.name ||
    property.title ||
    property.property_name;

  if (!value) {
    const documents = extractDocumentItems(row);
    if (documents.length > 1) return "Property document package";
    if (documents.length === 1) return documents[0].name;
    return "Property verification";
  }

  return String(value).trim();
}

function getPlan(row: Verification) {
  const findings = asRecord(row.findings);

  const value =
    findings.plan ||
    findings.verificationPlan ||
    findings.verification_plan ||
    findings.package ||
    findings.tier;

  if (!value) return "Verification";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function getDocumentCount(row: Verification) {
  return extractDocumentItems(row).length || 1;
}

function getReference(row: Verification) {
  return `PS-${String(row.id).padStart(6, "0")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getActivityText(status: DisplayStatus) {
  if (status === "verified") return "Verification completed";
  if (status === "flagged") return "Verification requires attention";
  if (status === "pending") return "Verification is pending";
  return "Verification record created";
}

function getActivityDescription(status: DisplayStatus) {
  if (status === "verified") {
    return "The verification record has a final verified status.";
  }

  if (status === "flagged") {
    return "The verification record has been flagged for review.";
  }

  if (status === "pending") {
    return "The verification record has not reached a final status.";
  }

  return "The record does not contain a recognized final status.";
}

function getRecordRoute(row: Verification) {
  const findings = asRecord(row.findings);
  const plan = String(
    findings.plan ||
      findings.verificationPlan ||
      findings.verification_plan ||
      findings.package ||
      findings.tier ||
      ""
  ).toLowerCase();

  const id = encodeURIComponent(String(row.id));

  if (plan.includes("premium")) {
    return `/premium-report?id=${id}`;
  }

  if (plan.includes("professional")) {
    return `/professional-report?id=${id}`;
  }

  return `/result?id=${id}`;
}

function Icon({
  name,
}: {
  name:
    | "search"
    | "file"
    | "building"
    | "arrow"
    | "check"
    | "clock"
    | "flag"
    | "filter"
    | "sort"
    | "calendar";
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 5 5" />
      </svg>
    );
  }

  if (name === "file") {
    return (
      <svg {...common}>
        <path d="M7 3.5h7l4 4V20.5H7z" />
        <path d="M14 3.5v4h4M10 12h5M10 16h5" />
      </svg>
    );
  }

  if (name === "building") {
    return (
      <svg {...common}>
        <path d="M4 20V9l8-5 8 5v11" />
        <path d="M8 20v-6h8v6M7 9h.01M12 9h.01M17 9h.01" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "flag") {
    return (
      <svg {...common}>
        <path d="M6 21V4" />
        <path d="M6 5c4-3 7 3 12 0v9c-5 3-8-3-12 0" />
      </svg>
    );
  }

  if (name === "filter") {
    return (
      <svg {...common}>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </svg>
    );
  }

  if (name === "sort") {
    return (
      <svg {...common}>
        <path d="M8 5v14M5 8l3-3 3 3M16 19V5m-3 11 3 3 3-3" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5 12h13M13 7l5 5-5 5" />
    </svg>
  );
}

export default function VerificationHistoryPage() {
  const [rows, setRows] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [newestFirst, setNewestFirst] = useState(true);
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setRows([]);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("verifications")
        .select(
          "id,user_id,doc_name,file_url,doc_type,status,review_status,trust_score,confidence,risk,findings,created_at,property_id"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error("Verification history error:", error);
        setRows([]);
      } else {
        const verificationRows = (data || []) as Verification[];
        const verificationIds = verificationRows
          .map((row) => row.id)
          .filter(
            (id): id is string | number =>
              typeof id === "string" || typeof id === "number",
          );

        /*
         * Reports uses the payment plan to distinguish Essential/Basic from
         * Professional/Premium because their status fields have different
         * meanings. History uses the same plan resolution so its filters stay
         * in sync with Reports.
         */
        const paymentPlanByVerificationId = new Map<string, string>();

        if (verificationIds.length > 0) {
          const { data: paymentsData, error: paymentsError } = await supabase
            .from("payments")
            .select("verification_id,plan,status,paid_at,created_at")
            .in("verification_id", verificationIds)
            .order("created_at", { ascending: false });

          if (paymentsError) {
            console.warn(
              "Verification history payment-plan lookup warning:",
              paymentsError,
            );
          } else {
            for (const payment of paymentsData || []) {
              const key = String(payment.verification_id ?? "");
              if (!key || paymentPlanByVerificationId.has(key)) continue;

              paymentPlanByVerificationId.set(
                key,
                String(payment.plan || ""),
              );
            }
          }
        }

        setRows(
          verificationRows.map((row) => ({
            ...row,
            __plan:
              paymentPlanByVerificationId.get(String(row.id)) ||
              row.__plan ||
              null,
          })),
        );
      }

      setLoading(false);
    }

    void loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleRows = useMemo(() => {
    const query = search.toLowerCase().trim();

    return [...rows]
      .filter((row) => {
        const status = getStatus(row);

        const documentNames = extractDocumentItems(row).flatMap((document) => [
          document.name,
          document.filename,
        ]);

        const searchable = [
          getOwnerName(row),
          getOwnerName(row),
          getPropertyName(row),
          getDocumentTitle(row),
          row.doc_name,
          row.doc_type,
          row.property_id,
          getReference(row),
          getPlan(row),
          ...documentNames,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !query || searchable.includes(query);
        const matchesFilter =
          filter === "all" || status === filter;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const first = new Date(a.created_at || 0).getTime();
        const second = new Date(b.created_at || 0).getTime();

        return newestFirst ? second - first : first - second;
      });
  }, [rows, search, filter, newestFirst]);

  if (loading) {
    return (
      <AppShell activePath="/verification-history">
        <LoadingScreen />
      </AppShell>
    );
  }

  return (
    <AppShell activePath="/verification-history">
      <main className={styles.page}>
        <section className={styles.pageIntro}>
          <div className={styles.introIdentity}>
            <div className={styles.introIcon}>
              <Icon name="file" />
            </div>

            <div>
              <span className={styles.introEyebrow}>
                VERIFICATION ACTIVITY
              </span>
              <h1>Your verification record</h1>
              <p>
                A chronological record of property verification activity
                associated with your account.
              </p>
            </div>
          </div>

          <div className={styles.introMeta}>
            <span>RECORDS</span>
            <strong>{rows.length}</strong>
          </div>
        </section>

        <section className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Icon name="search" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search owner, property, document or reference"
              aria-label="Search verification history"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            ) : null}
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterIcon}>
              <Icon name="filter" />
            </span>

            {(["all", "verified", "pending", "flagged"] as const).map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  className={filter === item ? styles.filterActive : ""}
                  onClick={() => setFilter(item)}
                >
                  {item === "all" ? "All activity" : getStatusLabel(item)}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className={styles.sortButton}
            onClick={() => setNewestFirst((value) => !value)}
          >
            <Icon name="sort" />
            {newestFirst ? "Newest" : "Oldest"}
          </button>
        </section>

        <section className={styles.historyHeader}>
          <div>
            <span className={styles.sectionEyebrow}>ACTIVITY LOG</span>
            <h2>Verification activity</h2>
          </div>

          <div className={styles.historyCount}>
            {visibleRows.length} record{visibleRows.length === 1 ? "" : "s"}
          </div>
        </section>

        {visibleRows.length === 0 ? (
          <section className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Icon name="file" />
            </div>

            <h3>
              {rows.length
                ? "No matching records"
                : "No verification activity yet"}
            </h3>

            <p>
              {rows.length
                ? "Try a different search term or status filter."
                : "Verification records will appear here after you submit a property for verification."}
            </p>
          </section>
        ) : (
          <section className={styles.timeline}>
            {visibleRows.map((row, index) => {
              const status = getStatus(row);
              const ownerName = getOwnerName(row);
              const property = getPropertyName(row);
              const documents = extractDocumentItems(row);
              const count = documents.length || 1;
              const packageExpanded = Boolean(expandedPackages[String(row.id)]);
              const visibleDocuments = packageExpanded
                ? documents
                : documents.slice(0, 7);
              const remainingDocuments = Math.max(documents.length - 7, 0);

              return (
                <article
                  className={styles.timelineItem}
                  key={String(row.id)}
                >
                  <div className={styles.rail}>
                    <span
                      className={`${styles.railDot} ${
                        status === "unknown"
                          ? styles.unknown
                          : styles[status]
                      }`}
                    />
                    {index < visibleRows.length - 1 ? (
                      <span className={styles.railLine} />
                    ) : null}
                  </div>

                  <div className={styles.record}>
                    <div className={styles.recordTop}>
                      <div className={styles.recordDate}>
                        <Icon name="calendar" />
                        <strong>{formatDate(row.created_at)}</strong>
                        <span>{formatTime(row.created_at)}</span>
                      </div>

                      <span
                        className={`${styles.status} ${
                          status === "unknown"
                            ? styles.unknown
                            : styles[status]
                        }`}
                      >
                        <i />
                        {getStatusLabel(status)}
                      </span>
                    </div>

                    <div className={styles.recordBody}>
                      <div className={styles.recordIdentity}>
                        <div className={styles.documentIcon}>
                          <Icon name="file" />
                        </div>

                        <div className={styles.identityCopy}>
                          <span className={styles.identityLabel}>
                            VERIFICATION RECORD
                          </span>

                          <h3>
                            {ownerName || "Name not detected"}
                          </h3>

                          {ownerName && property && property !== ownerName ? (
                            <div className={styles.propertySecondary}>
                              <span>PROPERTY</span>
                              <strong>{property}</strong>
                            </div>
                          ) : null}

                          <div className={styles.documentPackage}>
                            <div className={styles.documentPackageHeading}>
                              <Icon name="file" />
                              <span>
                                {count === 1 ? "1 DOCUMENT" : `${count} DOCUMENTS`}
                              </span>
                            </div>

                            <div className={styles.documentList}>
                              {visibleDocuments.map((document, documentIndex) => (
                                <span
                                  className={styles.documentChip}
                                  key={`${String(row.id)}-${document.name}-${documentIndex}`}
                                  title={document.filename || document.name}
                                >
                                  {document.name}
                                </span>
                              ))}
                            </div>

                            {remainingDocuments > 0 ? (
                              <button
                                type="button"
                                className={styles.moreDocuments}
                                onClick={() =>
                                  setExpandedPackages((current) => ({
                                    ...current,
                                    [String(row.id)]: !packageExpanded,
                                  }))
                                }
                                aria-expanded={packageExpanded}
                              >
                                {packageExpanded
                                  ? "Show fewer documents"
                                  : `+ ${remainingDocuments} more document${
                                      remainingDocuments === 1 ? "" : "s"
                                    }`}
                              </button>
                            ) : null}
                          </div>

                          <div className={styles.reference}>
                            <span>{getReference(row)}</span>

                            {row.property_id ? (
                              <>
                                <b>•</b>
                                <span>Property {row.property_id}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className={styles.recordFacts}>
                        <div>
                          <span>DOCUMENTS</span>
                          <strong>
                            {count}{" "}
                            {count === 1 ? "Document" : "Documents"}
                          </strong>
                        </div>

                        <div>
                          <span>VERIFICATION</span>
                          <strong>{getPlan(row)}</strong>
                        </div>

                        <div>
                          <span>RECORD ID</span>
                          <strong>{getReference(row)}</strong>
                        </div>
                      </div>
                    </div>

                    <div className={styles.recordFooter}>
                      <div
                        className={`${styles.activity} ${
                          status === "unknown"
                            ? styles.unknown
                            : styles[status]
                        }`}
                      >
                        <span>
                          {status === "verified"
                            ? <Icon name="check" />
                            : status === "flagged"
                              ? <Icon name="flag" />
                              : <Icon name="clock" />}
                        </span>

                        <div>
                          <strong>{getActivityText(status)}</strong>
                          <p>{getActivityDescription(status)}</p>
                        </div>
                      </div>

                      <a
                        href={getRecordRoute(row)}
                        className={styles.viewRecord}
                      >
                        View Record
                        <Icon name="arrow" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </AppShell>
  );
}
