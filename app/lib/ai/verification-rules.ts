import type {
  PropertyDocumentType,
  VerificationRule,
} from "./types";

/**
 * PropertySure AI
 * Core verification rules.
 *
 * These are the baseline rules the AI will use when
 * analyzing Nigerian property documents.
 *
 * They are deliberately kept separate from the AI model
 * so that the rules can be updated without retraining the model.
 */

export const VERIFICATION_RULES: VerificationRule[] = [
  {
    id: "coo-001",
    name: "Certificate of Occupancy identity check",
    description:
      "Check that the Certificate of Occupancy contains identifiable ownership, property, issuing-authority, and document-reference information.",
    documentTypes: ["certificate-of-occupancy"],
    severity: "high",
    enabled: true,
  },

  {
    id: "coo-002",
    name: "Certificate of Occupancy issuing authority",
    description:
      "Check that the stated issuing authority is present and consistent with the stated jurisdiction.",
    documentTypes: ["certificate-of-occupancy"],
    severity: "high",
    enabled: true,
  },

  {
    id: "coo-003",
    name: "Certificate of Occupancy property details",
    description:
      "Check that the property description, location, plot or parcel information, and other identifying details are present where applicable.",
    documentTypes: ["certificate-of-occupancy"],
    severity: "high",
    enabled: true,
  },

  {
    id: "deed-001",
    name: "Deed of Assignment parties",
    description:
      "Check that the assignor and assignee are identifiable and that the parties are clearly stated.",
    documentTypes: ["deed-of-assignment"],
    severity: "high",
    enabled: true,
  },

  {
    id: "deed-002",
    name: "Deed of Assignment property description",
    description:
      "Check that the property being assigned is sufficiently identified by its relevant description, location, plot, parcel, survey, or other identifiers.",
    documentTypes: ["deed-of-assignment"],
    severity: "high",
    enabled: true,
  },

  {
    id: "deed-003",
    name: "Deed of Assignment execution",
    description:
      "Check for execution information, dates, signatures, witnesses, and other relevant execution details where applicable.",
    documentTypes: ["deed-of-assignment"],
    severity: "medium",
    enabled: true,
  },

  {
    id: "survey-001",
    name: "Survey plan identification",
    description:
      "Check for identifiable survey information such as survey plan number, property location, parcel or plot information, and relevant survey details.",
    documentTypes: ["survey-plan"],
    severity: "high",
    enabled: true,
  },

  {
    id: "survey-002",
    name: "Survey plan consistency",
    description:
      "Check whether the property identifiers and location information appear consistent with information found elsewhere in the submitted document package.",
    documentTypes: ["survey-plan"],
    severity: "high",
    enabled: true,
  },

  {
    id: "allocation-001",
    name: "Allocation letter identity",
    description:
      "Check that the allottee, property identification, allocation details, and issuing authority are identifiable where applicable.",
    documentTypes: ["allocation-letter"],
    severity: "high",
    enabled: true,
  },

  {
    id: "consent-001",
    name: "Governor's Consent parties",
    description:
      "Check that the relevant parties and property details are identifiable in the document.",
    documentTypes: ["governors-consent"],
    severity: "high",
    enabled: true,
  },

  {
    id: "consent-002",
    name: "Governor's Consent authority",
    description:
      "Check that the relevant government authority and consent information are identifiable.",
    documentTypes: ["governors-consent"],
    severity: "high",
    enabled: true,
  },

  {
    id: "poa-001",
    name: "Power of Attorney parties",
    description:
      "Check that the principal and attorney are clearly identifiable.",
    documentTypes: ["power-of-attorney"],
    severity: "high",
    enabled: true,
  },

  {
    id: "poa-002",
    name: "Power of Attorney authority",
    description:
      "Check whether the powers granted and the property or transaction covered by the authority are sufficiently described.",
    documentTypes: ["power-of-attorney"],
    severity: "high",
    enabled: true,
  },

  {
    id: "receipt-001",
    name: "Payment evidence details",
    description:
      "Check for identifiable payer, payee, amount, date, transaction reference, and stated purpose where applicable.",
    documentTypes: ["receipt-payment"],
    severity: "medium",
    enabled: true,
  },

  {
    id: "planning-001",
    name: "Planning document authority",
    description:
      "Check that the relevant planning or development authority and property information are identifiable where applicable.",
    documentTypes: ["building-planning"],
    severity: "high",
    enabled: true,
  },

  {
    id: "general-001",
    name: "Document identity consistency",
    description:
      "Check whether names, property identifiers, dates, document numbers, and other important details are internally consistent.",
    documentTypes: [
      "certificate-of-occupancy",
      "deed-of-assignment",
      "survey-plan",
      "allocation-letter",
      "governors-consent",
      "power-of-attorney",
      "receipt-payment",
      "building-planning",
      "other",
      "unknown",
    ],
    severity: "high",
    enabled: true,
  },

  {
    id: "general-002",
    name: "Missing critical information",
    description:
      "Identify important information that appears to be missing, unreadable, incomplete, or inconsistent with the expected document structure.",
    documentTypes: [
      "certificate-of-occupancy",
      "deed-of-assignment",
      "survey-plan",
      "allocation-letter",
      "governors-consent",
      "power-of-attorney",
      "receipt-payment",
      "building-planning",
      "other",
      "unknown",
    ],
    severity: "medium",
    enabled: true,
  },

  {
    id: "general-003",
    name: "Cross-document consistency",
    description:
      "Compare important information across the submitted document package and flag material inconsistencies.",
    documentTypes: [
      "certificate-of-occupancy",
      "deed-of-assignment",
      "survey-plan",
      "allocation-letter",
      "governors-consent",
      "power-of-attorney",
      "receipt-payment",
      "building-planning",
      "other",
      "unknown",
    ],
    severity: "high",
    enabled: true,
  },
];

/**
 * Return all enabled rules applicable to a document type.
 */
export function getVerificationRules(
  documentType: PropertyDocumentType,
): VerificationRule[] {
  return VERIFICATION_RULES.filter(
    (rule) =>
      rule.enabled &&
      rule.documentTypes.includes(documentType),
  );
}

/**
 * Return a single rule by ID.
 */
export function getVerificationRule(
  ruleId: string,
): VerificationRule | undefined {
  return VERIFICATION_RULES.find(
    (rule) => rule.id === ruleId,
  );
}