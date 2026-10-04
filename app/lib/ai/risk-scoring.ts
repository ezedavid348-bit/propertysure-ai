import type {
  DocumentFinding,
  RiskScore,
} from "./types";

/**
 * PropertySure AI
 * Risk Scoring Engine
 *
 * Converts document findings into a consistent risk score.
 *
 * IMPORTANT:
 * This is an internal decision-support score.
 * It does not by itself establish that a document is genuine,
 * fraudulent, or legally valid.
 */

const SEVERITY_WEIGHTS: Record<
  DocumentFinding["severity"],
  number
> = {
  info: 0,
  low: 10,
  medium: 20,
  high: 35,
  critical: 50,
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getRiskLevel(
  score: number,
): RiskScore["level"] {
  if (score >= 75) {
    return "critical";
  }

  if (score >= 50) {
    return "high";
  }

  if (score >= 25) {
    return "moderate";
  }

  return "low";
}

/**
 * Calculate the overall document risk score.
 *
 * The score is based on the severity and confidence of
 * individual findings.
 */
export function calculateRiskScore(
  findings: DocumentFinding[],
): RiskScore {
  if (findings.length === 0) {
    return {
      score: 0,
      level: "low",
      reasons: [],
    };
  }

  let totalRisk = 0;

  const reasons: string[] = [];

  for (const finding of findings) {
    const severityWeight =
      SEVERITY_WEIGHTS[finding.severity];

    const confidence =
      Math.max(0, Math.min(100, finding.confidence)) / 100;

    const weightedRisk =
      severityWeight * confidence;

    totalRisk += weightedRisk;

    if (
      finding.severity === "high" ||
      finding.severity === "critical"
    ) {
      reasons.push(finding.title);
    }
  }

  /*
   * Prevent a large number of minor findings from
   * automatically producing an extreme score.
   */
  const normalizedScore = Math.min(
    100,
    totalRisk,
  );

  const score = clampScore(normalizedScore);

  return {
    score,
    level: getRiskLevel(score),
    reasons: reasons.slice(0, 10),
  };
}

/**
 * Determine whether a finding should materially affect
 * the risk score.
 */
export function isMaterialFinding(
  finding: DocumentFinding,
): boolean {
  return (
    finding.severity === "medium" ||
    finding.severity === "high" ||
    finding.severity === "critical"
  );
}

/**
 * Convert a risk score into a human-readable label.
 */
export function getRiskLabel(
  risk: RiskScore,
): string {
  switch (risk.level) {
    case "critical":
      return "Critical Risk";

    case "high":
      return "High Risk";

    case "moderate":
      return "Moderate Risk";

    case "low":
    default:
      return "Low Risk";
  }
}