"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  coordinates: string;
  risk: RiskLevel;
  reason: string;
  detectedAt: string;
  detectedAtValue: number;
  plan: string;
  reviewSignal: boolean;
};

type LocationGroup = {
  location: string;
  count: number;
  alerts: FraudAlert[];
};

function asRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

function asArray(
  value: unknown,
): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (
      item,
    ): item is Record<string, unknown> =>
      !!item &&
      typeof item === "object" &&
      !Array.isArray(item),
  );
}

function stringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item) =>
        typeof item === "string" &&
        item.trim().length > 0,
    )
    .map((item) => item.trim());
}

function firstString(
  source: Record<string, unknown>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = source[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim().length > 0
    ) {
      return String(value).trim();
    }
  }

  return "";
}

function cleanText(value: string): string {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: string): string {
  return cleanText(value).replace(
    /\b\w/g,
    (letter) => letter.toUpperCase(),
  );
}

function isFlagged(value: unknown): boolean {
  const valueText = String(value ?? "")
    .trim()
    .toLowerCase();

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
  const valueText = String(value ?? "")
    .trim()
    .toLowerCase();

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

function getPlan(
  findings: Record<string, unknown>,
): string {
  const premium = asRecord(
    findings.premium,
  );

  const essential = asRecord(
    findings.essential,
  );

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

  return value
    ? titleCase(value)
    : "Verification";
}

function getDocumentResults(
  findings: Record<string, unknown>,
): Record<string, unknown>[] {
  const premium = asRecord(
    findings.premium,
  );

  const essential = asRecord(
    findings.essential,
  );

  const candidates = [
    ...asArray(
      premium.document_results,
    ),
    ...asArray(
      essential.document_results,
    ),
    ...asArray(
      findings.document_results,
    ),
    ...asArray(
      findings.documentResults,
    ),
  ];

  if (candidates.length > 0) {
    return candidates;
  }

  const packageItems = asArray(
    findings.document_package,
  );

  if (packageItems.length > 0) {
    return packageItems;
  }

  const documents = asArray(
    findings.documents,
  );

  if (documents.length > 0) {
    return documents;
  }

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
  const property = asRecord(
    findings.property,
  );

  const premium = asRecord(
    findings.premium,
  );

  const premiumProperty = asRecord(
    premium.property,
  );

  return (
    firstString(document, [
      "propertyName",
      "property_name",
      "propertyTitle",
      "property_title",
    ]) ||
    firstString(property, [
      "name",
      "title",
      "property_name",
      "property_title",
    ]) ||
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
    (row.property_id
      ? `Property ${row.property_id}`
      : "Property verification")
  );
}

function getLocation(
  document: Record<string, unknown>,
  findings: Record<string, unknown>,
): string {
  const premium = asRecord(
    findings.premium,
  );

  const property = asRecord(
    findings.property,
  );

  const premiumProperty = asRecord(
    premium.property,
  );

  const location = asRecord(
    findings.location,
  );

  const premiumLocation = asRecord(
    premium.location,
  );

  const cross = asRecord(
    premium.cross_document_analysis,
  );

  const documentLocation = asRecord(
    document.location,
  );

  return (
    firstString(document, [
      "location",
      "address",
      "propertyLocation",
      "property_location",
    ]) ||
    firstString(documentLocation, [
      "address",
      "location",
      "name",
    ]) ||
    firstString(property, [
      "location",
      "address",
      "state",
      "city",
    ]) ||
    firstString(premiumProperty, [
      "location",
      "address",
      "state",
      "city",
    ]) ||
    firstString(premiumLocation, [
      "location",
      "address",
      "name",
    ]) ||
    firstString(cross, [
      "location",
      "address",
    ]) ||
    firstString(location, [
      "location",
      "address",
      "name",
    ]) ||
    firstString(findings, [
      "location",
      "propertyLocation",
      "property_location",
      "address",
    ]) ||
    "Location unavailable"
  );
}

/* =========================================================
   GPS / COORDINATE EXTRACTION

   This does NOT invent GPS coordinates.

   It checks the existing verification findings for
   common coordinate/location fields. If no coordinates
   are stored, the UI will say that GPS data is unavailable.
   ========================================================= */

function getCoordinates(
  document: Record<string, unknown>,
  findings: Record<string, unknown>,
): string {
  const premium = asRecord(
    findings.premium,
  );

  const essential = asRecord(
    findings.essential,
  );

  const property = asRecord(
    findings.property,
  );

  const location = asRecord(
    findings.location,
  );

  const premiumLocation = asRecord(
    premium.location,
  );

  const gps = asRecord(
    findings.gps,
  );

  const coordinates = asRecord(
    findings.coordinates,
  );

  const documentLocation = asRecord(
    document.location,
  );

  const documentGps = asRecord(
    document.gps,
  );

  const documentCoordinates = asRecord(
    document.coordinates,
  );

  const directValue =
    firstString(document, [
      "coordinates",
      "coordinate",
      "gps",
      "gpsCoordinates",
      "gps_coordinates",
      "propertyCoordinates",
      "property_coordinates",
      "latitudeLongitude",
      "latitude_longitude",
    ]) ||
    firstString(
      documentLocation,
      [
        "coordinates",
        "coordinate",
        "gps",
        "gpsCoordinates",
        "gps_coordinates",
      ],
    ) ||
    firstString(
      documentGps,
      [
        "coordinates",
        "coordinate",
        "value",
      ],
    ) ||
    firstString(
      documentCoordinates,
      [
        "coordinates",
        "coordinate",
        "value",
      ],
    ) ||
    firstString(findings, [
      "coordinates",
      "coordinate",
      "gps",
      "gpsCoordinates",
      "gps_coordinates",
      "propertyCoordinates",
      "property_coordinates",
      "latitudeLongitude",
      "latitude_longitude",
    ]) ||
    firstString(
      location,
      [
        "coordinates",
        "coordinate",
        "gps",
        "gpsCoordinates",
        "gps_coordinates",
      ],
    ) ||
    firstString(
      premiumLocation,
      [
        "coordinates",
        "coordinate",
        "gps",
        "gpsCoordinates",
        "gps_coordinates",
      ],
    ) ||
    firstString(
      property,
      [
        "coordinates",
        "coordinate",
        "gps",
        "gpsCoordinates",
        "gps_coordinates",
      ],
    ) ||
    firstString(
      essential,
      [
        "coordinates",
        "coordinate",
        "gps",
        "gpsCoordinates",
        "gps_coordinates",
      ],
    ) ||
    firstString(
      premium,
      [
        "coordinates",
        "coordinate",
        "gps",
        "gpsCoordinates",
        "gps_coordinates",
      ],
    );

  if (directValue) {
    return cleanText(directValue);
  }

  const latitude =
    firstString(document, [
      "latitude",
      "lat",
    ]) ||
    firstString(documentLocation, [
      "latitude",
      "lat",
    ]) ||
    firstString(findings, [
      "latitude",
      "lat",
    ]) ||
    firstString(location, [
      "latitude",
      "lat",
    ]) ||
    firstString(premiumLocation, [
      "latitude",
      "lat",
    ]) ||
    firstString(property, [
      "latitude",
      "lat",
    ]);

  const longitude =
    firstString(document, [
      "longitude",
      "lng",
      "lon",
    ]) ||
    firstString(documentLocation, [
      "longitude",
      "lng",
      "lon",
    ]) ||
    firstString(findings, [
      "longitude",
      "lng",
      "lon",
    ]) ||
    firstString(location, [
      "longitude",
      "lng",
      "lon",
    ]) ||
    firstString(premiumLocation, [
      "longitude",
      "lng",
      "lon",
    ]) ||
    firstString(property, [
      "longitude",
      "lng",
      "lon",
    ]);

  if (latitude && longitude) {
    return `${latitude}°, ${longitude}°`;
  }

  return "";
}

function getFailedChecks(
  document: Record<string, unknown>,
): string[] {
  const checks = asRecord(
    document.checks,
  );

  const labels: Record<string, string> = {
    documentStructure:
      "Document structure inconsistency",
    dataConsistency:
      "Data consistency issue",
    signatureValid:
      "Signature validation issue",
    stampValid:
      "Stamp validation issue",
    noForgery:
      "Possible document forgery",
    noDuplicate:
      "Possible duplicate document",
    documentCompleteness:
      "Document completeness issue",
  };

  return Object.entries(checks)
    .filter(
      ([, value]) => value === false,
    )
    .map(
      ([key]) =>
        labels[key] ||
        `${cleanText(key)} issue`,
    );
}

function getReason(
  document: Record<string, unknown>,
  findings: Record<string, unknown>,
): string {
  const failedChecks =
    getFailedChecks(document);

  if (failedChecks.length > 0) {
    return failedChecks[0];
  }

  const manipulation =
    stringArray(
      document.manipulationIndicators,
    );

  if (manipulation.length > 0) {
    return manipulation[0];
  }

  const keyFindings =
    stringArray(
      document.keyFindings,
    );

  if (keyFindings.length > 0) {
    return keyFindings[0];
  }

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

function buildFraudAlerts(
  rows: VerificationRow[],
): FraudAlert[] {
  const alerts: FraudAlert[] = [];

  for (const row of rows) {
    const findings = asRecord(
      row.findings,
    );

    const plan = getPlan(findings);

    const documentResults =
      getDocumentResults(findings);

    const rowFlagged =
      isFlagged(row.status) ||
      isFlagged(row.review_status);

    for (const document of documentResults) {
      const premiumStatus =
        firstString(document, [
          "premiumStatus",
        ]);

      const assessmentStatus =
        firstString(document, [
          "assessmentStatus",
          "assessment_status",
        ]);

      const syntheticRisk =
        firstString(document, [
          "syntheticDocumentRisk",
          "synthetic_document_risk",
        ]);

      const manipulationIndicators =
        stringArray(
          document.manipulationIndicators,
        );

      const failedChecks =
        getFailedChecks(document);

      const documentHighRisk =
        syntheticRisk.toLowerCase() ===
          "high" ||
        premiumStatus.toLowerCase() ===
          "attention" ||
        assessmentStatus.toLowerCase() ===
          "attention_required" ||
        failedChecks.length > 0 ||
        manipulationIndicators.length > 0;

      const documentReview =
        premiumStatus.toLowerCase() ===
          "inconclusive" ||
        assessmentStatus.toLowerCase() ===
          "inconclusive" ||
        isReviewSignal(
          premiumStatus,
        ) ||
        isReviewSignal(
          assessmentStatus,
        ) ||
        syntheticRisk.toLowerCase() ===
          "medium";

      if (
        !rowFlagged &&
        !documentHighRisk &&
        !documentReview
      ) {
        continue;
      }

      const risk: RiskLevel =
        rowFlagged || documentHighRisk
          ? "high"
          : "medium";

      const detectedAt =
        firstString(document, [
          "detectedAt",
          "detected_at",
          "created_at",
          "date",
        ]) ||
        row.created_at ||
        "";

      const date = detectedAt
        ? new Date(detectedAt)
        : null;

      const detectedAtValue =
        date &&
        !Number.isNaN(
          date.getTime(),
        )
          ? date.getTime()
          : 0;

      alerts.push({
        id: `${row.id}-${alerts.length}`,
        verificationId: String(row.id),
        documentName:
          getDocumentName(
            document,
            row,
          ),
        propertyName:
          getPropertyName(
            document,
            findings,
            row,
          ),
        location:
          getLocation(
            document,
            findings,
          ),
        coordinates:
          getCoordinates(
            document,
            findings,
          ),
        risk,
        reason:
          getReason(
            document,
            findings,
          ),
        detectedAt,
        detectedAtValue,
        plan,
        reviewSignal:
          documentReview,
      });
    }

    if (
      rowFlagged &&
      documentResults.length === 0
    ) {
      const detectedAt =
        row.created_at || "";

      const date = detectedAt
        ? new Date(detectedAt)
        : null;

      alerts.push({
        id: String(row.id),
        verificationId: String(row.id),
        documentName:
          getDocumentName(
            {},
            row,
          ),
        propertyName:
          getPropertyName(
            {},
            findings,
            row,
          ),
        location:
          getLocation(
            {},
            findings,
          ),
        coordinates:
          getCoordinates(
            {},
            findings,
          ),
        risk: "high",
        reason:
          getReason(
            {},
            findings,
          ),
        detectedAt,
        detectedAtValue:
          date &&
          !Number.isNaN(
            date.getTime(),
          )
            ? date.getTime()
            : 0,
        plan,
        reviewSignal: false,
      });
    }
  }

  const unique =
    new Map<string, FraudAlert>();

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

  return Array.from(
    unique.values(),
  ).sort(
    (a, b) =>
      b.detectedAtValue -
      a.detectedAtValue,
  );
}

function formatDate(
  value: string,
): string {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function isWithinLastSevenDays(
  value: string,
): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const sevenDays =
    7 * 24 * 60 * 60 * 1000;

  return (
    date.getTime() >=
      Date.now() - sevenDays &&
    date.getTime() <= Date.now()
  );
}

function issueKey(
  reason: string,
): string {
  const text =
    reason.toLowerCase();

  if (text.includes("duplicate")) {
    return "Duplicate documents";
  }

  if (
    text.includes("alter") ||
    text.includes("manipulat")
  ) {
    return "Document alteration";
  }

  if (
    text.includes("name mismatch") ||
    text.includes("mismatch")
  ) {
    return "Name mismatch";
  }

  if (
    text.includes("fake") ||
    text.includes("forg")
  ) {
    return "Possible fake documents";
  }

  if (text.includes("ownership")) {
    return "Ownership inconsistency";
  }

  if (text.includes("signature")) {
    return "Signature issue";
  }

  if (text.includes("stamp")) {
    return "Stamp issue";
  }

  if (
    text.includes("template") ||
    text.includes("format")
  ) {
    return "Suspicious document format";
  }

  return "Other suspicious signal";
}

export default function FraudWatchPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<AlertFilter>("all");

  const [alerts, setAlerts] =
    useState<FraudAlert[]>([]);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [showAllLocations, setShowAllLocations] =
    useState(false);

  const itemsPerPage = 5;

  const loadFraudWatch =
    useCallback(async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: { user },
          error: authError,
        } =
          await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          router.replace("/signin");
          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("verifications")
          .select(
            "id,doc_name,doc_type,status,review_status,risk,findings,created_at,property_id",
          )
          .eq(
            "user_id",
            user.id,
          )
          .order(
            "created_at",
            {
              ascending: false,
            },
          );

        if (error) {
          throw error;
        }

        setAlerts(
          buildFraudAlerts(
            (data ||
              []) as VerificationRow[],
          ),
        );
      } catch (error) {
        console.error(
          "FRAUD WATCH LOAD ERROR:",
          error,
        );

        setErrorMessage(
          "Unable to load Fraud Watch right now.",
        );

        setAlerts([]);
      } finally {
        setLoading(false);
      }
    }, [router]);

  useEffect(() => {
    loadFraudWatch();
  }, [loadFraudWatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const filteredAlerts =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return alerts.filter(
        (alert) => {
          const matchesSearch =
            !query ||
            alert.documentName
              .toLowerCase()
              .includes(query) ||
            alert.propertyName
              .toLowerCase()
              .includes(query) ||
            alert.location
              .toLowerCase()
              .includes(query) ||
            alert.reason
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            filter === "all" ||
            alert.risk === filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        },
      );
    }, [
      alerts,
      filter,
      search,
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAlerts.length /
        itemsPerPage,
    ),
  );

  const safePage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedAlerts =
    useMemo(() => {
      const start =
        (safePage - 1) *
        itemsPerPage;

      return filteredAlerts.slice(
        start,
        start + itemsPerPage,
      );
    }, [
      filteredAlerts,
      safePage,
    ]);

  const highRiskCount =
    alerts.filter(
      (alert) =>
        alert.risk === "high",
    ).length;

  const reviewCount =
    alerts.filter(
      (alert) =>
        alert.reviewSignal,
    ).length;

  const newThisWeek =
    alerts.filter(
      (alert) =>
        isWithinLastSevenDays(
          alert.detectedAt,
        ),
    ).length;

  /* =========================================================
     LOCATION GROUPS

     Each unique location keeps its actual individual
     FraudAlert objects.

     Example:

     Location A
       ├── Report 1
       └── Report 2

     Location B
       └── Report 3

     Therefore:

     2 unique locations
     3 location-linked reports
     ========================================================= */

  const locationGroups =
    useMemo<LocationGroup[]>(() => {
      const groups =
        new Map<
          string,
          FraudAlert[]
        >();

      for (const alert of alerts) {
        if (
          alert.location ===
          "Location unavailable"
        ) {
          continue;
        }

        const key =
          alert.location.trim();

        if (!groups.has(key)) {
          groups.set(key, []);
        }

        groups
          .get(key)!
          .push(alert);
      }

      return Array.from(
        groups.entries(),
      )
        .map(
          ([
            location,
            locationAlerts,
          ]) => ({
            location,
            count:
              locationAlerts.length,
            alerts:
              locationAlerts,
          }),
        )
        .sort(
          (a, b) =>
            b.count - a.count,
        );
    }, [alerts]);

  /* =========================================================
     IMPORTANT:
     This is NOT alerts.length.

     alerts.length = ALL flagged reports.

     locationLinkedReportCount =
     ONLY flagged reports that have a usable location
     and therefore appear inside Flagged Locations.
     ========================================================= */

  const locationLinkedReportCount =
    useMemo(() => {
      return locationGroups.reduce(
        (total, group) =>
          total + group.alerts.length,
        0,
      );
    }, [locationGroups]);

  /*
   * Dashboard preview:
   * show the top four locations.

   * Expanded:
   * show every location.
   */
  const visibleLocationGroups =
    showAllLocations
      ? locationGroups
      : locationGroups.slice(0, 4);

  const locationCounts =
    locationGroups.slice(0, 4).map(
      (group) => [
        group.location,
        group.count,
      ] as [string, number],
    );

  const issueCounts =
    useMemo(() => {
      const counts =
        new Map<string, number>();

      for (const alert of alerts) {
        const key =
          issueKey(alert.reason);

        counts.set(
          key,
          (counts.get(key) ||
            0) + 1,
        );
      }

      return Array.from(
        counts.entries(),
      )
        .sort(
          (a, b) =>
            b[1] - a[1],
        )
        .slice(0, 4);
    }, [alerts]);

  const issueTotal =
    issueCounts.reduce(
      (sum, [, count]) =>
        sum + count,
      0,
    );

  const donutBackground =
    useMemo(() => {
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

      const stops =
        issueCounts.map(
          ([, count], index) => {
            const end =
              start +
              (count /
                issueTotal) *
                360;

            const result =
              `${segmentColors[index]} ${start}deg ${end}deg`;

            start = end;

            return result;
          },
        );

      return `conic-gradient(${stops.join(
        ", ",
      )})`;
    }, [
      issueCounts,
      issueTotal,
    ]);

  const openDetails = (
    alert: FraudAlert,
  ) => {
    const plan =
      alert.plan.toLowerCase();

    const id = encodeURIComponent(
      alert.verificationId,
    );

    if (plan.includes("premium")) {
      router.push(
        `/premium-report?id=${id}`,
      );

      return;
    }

    if (
      plan.includes("professional")
    ) {
      router.push(
        `/professional-report?id=${id}`,
      );

      return;
    }

    router.push(
      `/result?id=${id}`,
    );
  };

  const openReportSuspicious =
    () => {
      router.push(
        "/report-suspicious",
      );
    };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AppShell activePath="/fraud-watch">
      <main className={styles.page}>
        <div className={styles.pageInner}>

          {errorMessage && (
            <div
              className={
                styles.errorBanner
              }
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          {/* =====================================================
              DESKTOP PAGE TITLE
              ===================================================== */}

          <section
            className={
              styles.pageHeading
            }
          >
            <div
              className={
                styles.pageHeadingIcon
              }
            >
              !
            </div>

            <div>
              <h1>
                Fraud Watch
              </h1>

              <p>
                Monitor suspicious
                property documents
                and activities
              </p>
            </div>
          </section>

          {/* =====================================================
              DESKTOP HERO
              ===================================================== */}

          <section
            className={
              styles.desktopHero
            }
          >
            <div
              className={
                styles.desktopHeroMain
              }
            >
              <div
                className={
                  styles.heroIcon
                }
              >
                !
              </div>

              <div
                className={
                  styles.heroCopy
                }
              >
                <div
                  className={
                    styles.alertLabel
                  }
                >
                  <span>●</span>
                  Alert
                </div>

                <h2>
                  {alerts.length > 0
                    ? "Potential fraud signals detected"
                    : "No suspicious signals detected"}
                </h2>

                <p>
                  Fraud Watch identifies
                  individual documents
                  with suspicious signals,
                  manipulation indicators,
                  inconsistencies or other
                  findings that may require
                  closer attention.
                </p>

                <div
                  className={
                    styles.heroActions
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.reportButton
                    }
                    onClick={
                      openReportSuspicious
                    }
                  >
                    Report Suspicious
                    Document
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    className={
                      styles.learnButton
                    }
                    onClick={() =>
                      document
                        .getElementById(
                          "fraud-watch-info",
                        )
                        ?.scrollIntoView({
                          behavior:
                            "smooth",
                        })
                    }
                  >
                    <span>ⓘ</span>
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            <div
              className={
                styles.desktopHeroSide
              }
            >
              <div
                className={
                  styles.heroSideIcon
                }
              >
                ⌕
              </div>

              <div>
                <strong>
                  Use Fraud Watch as
                  an early warning
                </strong>

                <p>
                  A flagged signal is
                  not, by itself, a
                  legal finding of fraud.
                  Review the detailed
                  verification result
                  and use appropriate
                  professional due
                  diligence.
                </p>
              </div>
            </div>
          </section>

          {/* =====================================================
              MOBILE SUMMARY
              ===================================================== */}

          <section
            className={
              styles.mobileSummary
            }
          >
            <div
              className={
                styles.mobileSummaryTop
              }
            >
              <div
                className={
                  styles.mobileAlertIcon
                }
              >
                !
              </div>

              <div>
                <span
                  className={
                    styles.mobileAlertLabel
                  }
                >
                  FRAUD WATCH
                </span>

                <h2>
                  {alerts.length > 0
                    ? "Potential fraud signals detected"
                    : "No suspicious signals detected"}
                </h2>

                <p>
                  Suspicious signals
                  identified in your
                  verification results.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={
                styles.mobileReportButton
              }
              onClick={
                openReportSuspicious
              }
            >
              Report Suspicious
              <span>→</span>
            </button>
          </section>

          {/* =====================================================
              OVERVIEW STATS
              ===================================================== */}

          <section
            className={
              styles.statsGrid
            }
          >
            <article
              className={`${styles.statCard} ${styles.statDanger}`}
            >
              <div
                className={
                  styles.statIcon
                }
              >
                ▤
              </div>

              <div>
                <span>
                  Flagged Documents
                </span>

                <strong>
                  {alerts.length}
                </strong>

                <small>
                  <b>
                    ↑ {newThisWeek}
                  </b>{" "}
                  in last 7 days
                </small>
              </div>
            </article>

            <article
              className={`${styles.statCard} ${styles.statReview}`}
            >
              <div
                className={
                  styles.statIcon
                }
              >
                ◷
              </div>

              <div>
                <span>
                  Under Review
                </span>

                <strong>
                  {reviewCount}
                </strong>

                <small>
                  Needs further check
                </small>
              </div>
            </article>

            <article
              className={`${styles.statCard} ${styles.statHigh}`}
            >
              <div
                className={
                  styles.statIcon
                }
              >
                !
              </div>

              <div>
                <span>
                  High-Risk Documents
                </span>

                <strong>
                  {highRiskCount}
                </strong>

                <small>
                  Strong suspicious
                  signals
                </small>
              </div>
            </article>

            <article
              className={`${styles.statCard} ${styles.statLocation}`}
            >
              <div
                className={
                  styles.statIcon
                }
              >
                ⌖
              </div>

              <div>
                <span>
                  Flagged Locations
                </span>

                <strong>
                  {locationGroups.length}
                </strong>

                <small>
                  Across property
                  locations
                </small>
              </div>
            </article>
          </section>

          {/* =====================================================
              MAIN CONTENT
              ===================================================== */}

          <section
            className={
              styles.contentGrid
            }
          >

            {/* ===================================================
                FLAGGED DOCUMENTS
                =================================================== */}

            <article
              className={
                styles.alertPanel
              }
            >
              <div
                className={
                  styles.panelHeader
                }
              >
                <div
                  className={
                    styles.panelTitleBlock
                  }
                >
                  <div
                    className={
                      styles.panelTitleRow
                    }
                  >
                    <h2>
                      Flagged Documents
                    </h2>

                    <span
                      className={
                        styles.countBadge
                      }
                    >
                      {filteredAlerts.length}
                    </span>
                  </div>

                  <p>
                    Documents with
                    suspicious or review
                    signals from your
                    verification results.
                  </p>
                </div>

                <div
                  className={
                    styles.controls
                  }
                >
                  <div
                    className={
                      styles.searchBox
                    }
                  >
                    <span>⌕</span>

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value,
                        )
                      }
                      placeholder="Search documents, properties..."
                      aria-label="Search fraud alerts"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch("")
                        }
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <select
                    className={
                      styles.filterSelect
                    }
                    value={filter}
                    onChange={(event) =>
                      setFilter(
                        event.target
                          .value as AlertFilter,
                      )
                    }
                    aria-label="Filter fraud alerts"
                  >
                    <option value="all">
                      All Alerts
                    </option>

                    <option value="high">
                      High Risk
                    </option>

                    <option value="medium">
                      Under Review
                    </option>
                  </select>
                </div>
              </div>

              <div
                className={
                  styles.mobileFilters
                }
              >
                <button
                  type="button"
                  className={
                    filter === "all"
                      ? styles.mobileFilterActive
                      : styles.mobileFilter
                  }
                  onClick={() =>
                    setFilter("all")
                  }
                >
                  All ({alerts.length})
                </button>

                <button
                  type="button"
                  className={
                    filter === "high"
                      ? styles.mobileFilterActive
                      : styles.mobileFilter
                  }
                  onClick={() =>
                    setFilter("high")
                  }
                >
                  High Risk ({highRiskCount})
                </button>

                <button
                  type="button"
                  className={
                    filter === "medium"
                      ? styles.mobileFilterActive
                      : styles.mobileFilter
                  }
                  onClick={() =>
                    setFilter("medium")
                  }
                >
                  Under Review ({reviewCount})
                </button>
              </div>

              {filteredAlerts.length ===
              0 ? (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  <div
                    className={
                      styles.emptyIcon
                    }
                  >
                    ✓
                  </div>

                  <h3>
                    {alerts.length ===
                    0
                      ? "No suspicious documents detected"
                      : "No matching fraud alerts"}
                  </h3>

                  <p>
                    {alerts.length ===
                    0
                      ? "Fraud Watch will populate automatically when verification findings contain a suspicious signal."
                      : "Try another search term or change the alert filter."}
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className={
                      styles.tableHeader
                    }
                  >
                    <span>
                      Document
                    </span>

                    <span>
                      Property / Location
                    </span>

                    <span>
                      Issue
                    </span>

                    <span>
                      Status
                    </span>

                    <span>
                      Date
                    </span>

                    <span>
                      Action
                    </span>
                  </div>

                  <div
                    className={
                      styles.alertList
                    }
                  >
                    {paginatedAlerts.map(
                      (alert) => (
                        <article
                          key={alert.id}
                          className={
                            styles.alertRow
                          }
                        >
                          <div
                            className={`${styles.documentIcon} ${
                              alert.risk ===
                              "high"
                                ? styles.documentIconHigh
                                : styles.documentIconReview
                            }`}
                          >
                            ▤
                          </div>

                          <div
                            className={
                              styles.documentInfo
                            }
                          >
                            <strong>
                              {
                                alert.documentName
                              }
                            </strong>

                            <span>
                              {
                                alert.propertyName
                              }
                            </span>

                            <small>
                              {
                                alert.location
                              }
                            </small>
                          </div>

                          <div
                            className={
                              styles.reason
                            }
                          >
                            <span>
                              {alert.reason}
                            </span>
                          </div>

                          <div
                            className={`${styles.riskBadge} ${
                              alert.risk ===
                              "high"
                                ? styles.riskHigh
                                : styles.riskMedium
                            }`}
                          >
                            <i />

                            {alert.risk ===
                            "high"
                              ? "High Risk"
                              : "Under Review"}
                          </div>

                          <div
                            className={
                              styles.detected
                            }
                          >
                            {formatDate(
                              alert.detectedAt,
                            )}
                          </div>

                          <button
                            type="button"
                            className={
                              styles.detailsButton
                            }
                            onClick={() =>
                              openDetails(
                                alert,
                              )
                            }
                          >
                            <span>
                              View
                            </span>

                            <b>
                              →
                            </b>
                          </button>

                          <button
                            type="button"
                            className={
                              styles.mobileAlertAction
                            }
                            onClick={() =>
                              openDetails(
                                alert,
                              )
                            }
                            aria-label={`View details for ${alert.documentName}`}
                          >
                            →
                          </button>
                        </article>
                      ),
                    )}
                  </div>

                  <div
                    className={
                      styles.pagination
                    }
                  >
                    <span>
                      Showing{" "}
                      {Math.min(
                        (safePage - 1) *
                          itemsPerPage +
                          1,
                        filteredAlerts.length,
                      )}{" "}
                      -{" "}
                      {Math.min(
                        safePage *
                          itemsPerPage,
                        filteredAlerts.length,
                      )}{" "}
                      of{" "}
                      {filteredAlerts.length}
                    </span>

                    <div
                      className={
                        styles.paginationButtons
                      }
                    >
                      <button
                        type="button"
                        disabled={
                          safePage === 1
                        }
                        onClick={() =>
                          setCurrentPage(
                            (page) =>
                              Math.max(
                                1,
                                page - 1,
                              ),
                          )
                        }
                        aria-label="Previous page"
                      >
                        ‹
                      </button>

                      {Array.from(
                        {
                          length: totalPages,
                        },
                        (_, index) =>
                          index + 1,
                      )
                        .slice(0, 5)
                        .map((page) => (
                          <button
                            key={page}
                            type="button"
                            className={
                              page ===
                              safePage
                                ? styles.paginationActive
                                : ""
                            }
                            onClick={() =>
                              setCurrentPage(
                                page,
                              )
                            }
                          >
                            {page}
                          </button>
                        ))}

                      <button
                        type="button"
                        disabled={
                          safePage ===
                          totalPages
                        }
                        onClick={() =>
                          setCurrentPage(
                            (page) =>
                              Math.min(
                                totalPages,
                                page + 1,
                              ),
                          )
                        }
                        aria-label="Next page"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </>
              )}
            </article>

            {/* ===================================================
                RIGHT SIDE INSIGHTS
                =================================================== */}

            <aside
              className={
                styles.sideColumn
              }
            >

              {/* =================================================
                  FRAUD RISK INSIGHTS
                  ================================================= */}

              <article
                className={
                  styles.insightCard
                }
              >
                <div
                  className={
                    styles.insightHeader
                  }
                >
                  <div
                    className={
                      styles.insightIcon
                    }
                  >
                    ▥
                  </div>

                  <div>
                    <h2>
                      Fraud Risk Insights
                    </h2>

                    <p>
                      Common issues
                      detected in your
                      reports
                    </p>
                  </div>
                </div>

                {issueCounts.length >
                0 ? (
                  <div
                    className={
                      styles.donutLayout
                    }
                  >
                    <div
                      className={
                        styles.donut
                      }
                      style={{
                        background:
                          donutBackground,
                      }}
                    >
                      <div
                        className={
                          styles.donutHole
                        }
                      >
                        <strong>
                          {alerts.length}
                        </strong>

                        <span>
                          Flagged
                        </span>
                      </div>
                    </div>

                    <div
                      className={
                        styles.legend
                      }
                    >
                      {issueCounts.map(
                        (
                          [
                            name,
                            count,
                          ],
                          index,
                        ) => {
                          const colors = [
                            "#ef4444",
                            "#f59e0b",
                            "#3b82f6",
                            "#94a3b8",
                          ];

                          const percentage =
                            issueTotal
                              ? Math.round(
                                  (count /
                                    issueTotal) *
                                    100,
                                )
                              : 0;

                          return (
                            <div
                              key={name}
                            >
                              <i
                                className={
                                  styles.legendDot
                                }
                                style={{
                                  background:
                                    colors[
                                      index
                                    ],
                                }}
                              />

                              <span>
                                {name}
                              </span>

                              <strong>
                                {
                                  percentage
                                }
                                %
                              </strong>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={
                      styles.noInsight
                    }
                  >
                    No fraud issue
                    pattern has been
                    recorded yet.
                  </div>
                )}
              </article>

              {/* =================================================
                  FLAGGED LOCATIONS
                  ================================================= */}

              <article
                className={
                  styles.locationCard
                }
              >
                <div
                  className={
                    styles.insightHeader
                  }
                >
                  <div
                    className={`${styles.insightIcon} ${styles.locationInsightIcon}`}
                  >
                    ⌖
                  </div>

                  <div className={styles.locationHeaderContent}>
                    <div
                      className={
                        styles.locationTitleRow
                      }
                    >
                      <h2>
                        Flagged Locations
                      </h2>

                      {locationGroups.length >
                        4 && (
                        <button
                          type="button"
                          className={
                            styles.locationViewButton
                          }
                          onClick={() =>
                            setShowAllLocations(
                              (current) =>
                                !current,
                            )
                          }
                          aria-expanded={
                            showAllLocations
                          }
                        >
                          {showAllLocations
                            ? "Show Less"
                            : "View All"}
                          <span>
                            {showAllLocations
                              ? "↑"
                              : "→"}
                          </span>
                        </button>
                      )}
                    </div>

                    <p>
                      Unique property
                      locations connected
                      to flagged reports
                    </p>
                  </div>
                </div>

                {/* =================================================
                    DYNAMIC LOCATION SUMMARY

                    IMPORTANT:
                    Do NOT use alerts.length here.

                    alerts.length = all flagged reports.

                    locationLinkedReportCount =
                    only reports that are actually
                    associated with a location.
                    ================================================= */}

                <div
                  className={
                    styles.locationSummary
                  }
                >
                  <span>
                    {locationGroups.length}{" "}
                    {locationGroups.length ===
                    1
                      ? "location"
                      : "locations"}{" "}
                    linked to{" "}
                    {locationLinkedReportCount}{" "}
                    individual flagged{" "}
                    {locationLinkedReportCount ===
                    1
                      ? "report"
                      : "reports"}
                  </span>
                </div>

                <div
                  id="flagged-locations"
                  className={
                    styles.locationList
                  }
                >
                  {visibleLocationGroups.length >
                  0 ? (
                    visibleLocationGroups.map(
                      (group) => {
                        const maxCount =
                          Math.max(
                            ...locationGroups.map(
                              (
                                item,
                              ) =>
                                item.count,
                            ),
                          );

                        const width =
                          Math.max(
                            18,
                            Math.round(
                              (group.count /
                                maxCount) *
                                100,
                            ),
                          );

                        return (
                          <div
                            key={
                              group.location
                            }
                            className={
                              styles.locationGroup
                            }
                          >
                            {/* LOCATION HEADER */}

                            <div
                              className={
                                styles.locationName
                              }
                            >
                              <div
                                className={
                                  styles.locationNameMain
                                }
                              >
                                <span
                                  className={
                                    styles.locationPin
                                  }
                                >
                                  ⌖
                                </span>

                                <strong>
                                  {
                                    group.location
                                  }
                                </strong>
                              </div>

                              <span
                                className={
                                  styles.locationCount
                                }
                              >
                                {group.count}
                              </span>
                            </div>

                            <div
                              className={
                                styles.locationBarTrack
                              }
                            >
                              <div
                                className={
                                  styles.locationBar
                                }
                                style={{
                                  width: `${width}%`,
                                }}
                              />
                            </div>

                            {/* ASSOCIATED REPORTS */}

                            <div
                              className={
                                styles.locationReports
                              }
                            >
                              <div
                                className={
                                  styles.locationReportsHeader
                                }
                              >
                                <span>
                                  Individual
                                  reports
                                </span>

                                <span>
                                  {
                                    group.count
                                  }
                                </span>
                              </div>

                              {group.alerts.map(
                                (
                                  alert,
                                  index,
                                ) => (
                                  <div
                                    key={
                                      alert.id
                                    }
                                    className={
                                      styles.locationReport
                                    }
                                  >
                                    <div
                                      className={
                                        styles.locationReportIcon
                                      }
                                    >
                                      ▤
                                    </div>

                                    <div
                                      className={
                                        styles.locationReportInfo
                                      }
                                    >
                                      <div
                                        style={{
                                          display:
                                            "flex",
                                          alignItems:
                                            "center",
                                          gap: "7px",
                                          marginBottom:
                                            "2px",
                                          flexWrap:
                                            "wrap",
                                        }}
                                      >
                                        <span
                                          style={{
                                            margin: 0,
                                            color:
                                              "#6b7f97",
                                            fontSize:
                                              "7px",
                                            fontWeight:
                                              800,
                                            textTransform:
                                              "uppercase",
                                            letterSpacing:
                                              "0.45px",
                                          }}
                                        >
                                          Report{" "}
                                          {index +
                                            1}
                                        </span>

                                        <span
                                          style={{
                                            margin: 0,
                                            color:
                                              alert.risk ===
                                              "high"
                                                ? "#cf2635"
                                                : "#aa7100",
                                            fontSize:
                                              "7px",
                                            fontWeight:
                                              800,
                                            textTransform:
                                              "uppercase",
                                          }}
                                        >
                                          {alert.risk ===
                                          "high"
                                            ? "High Risk"
                                            : "Under Review"}
                                        </span>
                                      </div>

                                      <strong>
                                        {
                                          alert.documentName
                                        }
                                      </strong>

                                      <span>
                                        {
                                          alert.propertyName
                                        }
                                      </span>

                                      <small>
                                        {
                                          alert.reason
                                        }
                                        {" • "}
                                        {formatDate(
                                          alert.detectedAt,
                                        )}
                                      </small>

                                      {alert.coordinates ? (
                                        <small
                                          className={
                                            styles.locationCoordinates
                                          }
                                        >
                                          GPS:{" "}
                                          {
                                            alert.coordinates
                                          }
                                        </small>
                                      ) : (
                                        <small
                                          className={
                                            styles.locationCoordinatesUnavailable
                                          }
                                        >
                                          GPS data not
                                          available
                                          for this
                                          verification
                                        </small>
                                      )}
                                    </div>

                                    <button
                                      type="button"
                                      className={
                                        styles.locationReportButton
                                      }
                                      onClick={() =>
                                        openDetails(
                                          alert,
                                        )
                                      }
                                      aria-label={`View report for ${alert.documentName}`}
                                    >
                                      <span>
                                        View
                                      </span>

                                      <b>
                                        →
                                      </b>
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        );
                      },
                    )
                  ) : (
                    <div
                      className={
                        styles.noInsight
                      }
                    >
                      Location information
                      will appear when
                      available.
                    </div>
                  )}
                </div>

                {locationGroups.length >
                  4 &&
                  !showAllLocations && (
                    <button
                      type="button"
                      className={
                        styles.mobileLocationExpand
                      }
                      onClick={() =>
                        setShowAllLocations(
                          true,
                        )
                      }
                    >
                      View all{" "}
                      {locationGroups.length}{" "}
                      locations
                      <span>
                        →
                      </span>
                    </button>
                  )}
              </article>

              {/* =================================================
                  REPORT CARD
                  ================================================= */}

              <article
                className={
                  styles.helpCard
                }
              >
                <div
                  className={
                    styles.helpIcon
                  }
                >
                  ⚑
                </div>

                <div>
                  <h2>
                    See Something
                    Suspicious?
                  </h2>

                  <p>
                    Report suspicious
                    property documents
                    or activity for
                    further
                    investigation.
                  </p>

                  <button
                    type="button"
                    onClick={
                      openReportSuspicious
                    }
                  >
                    Report Now
                    <span>→</span>
                  </button>
                </div>
              </article>
            </aside>
          </section>

          {/* =====================================================
              EARLY WARNING INFORMATION
              ===================================================== */}

          <section
            id="fraud-watch-info"
            className={
              styles.bottomBanner
            }
          >
            <div
              className={
                styles.bottomIcon
              }
            >
              i
            </div>

            <div>
              <strong>
                Fraud Watch is an
                early-warning layer
              </strong>

              <span>
                A flagged signal is
                not, by itself, a legal
                finding of fraud. Review
                the detailed verification
                result and use appropriate
                professional due
                diligence.
              </span>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}