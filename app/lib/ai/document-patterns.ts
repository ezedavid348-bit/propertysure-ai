import type { PropertyDocumentType } from "./types";

/**
 * PropertySure AI
 * Expected document patterns
 *
 * These patterns describe the kinds of information the AI should
 * expect to find in different Nigerian property documents.
 *
 * They are NOT templates for creating documents.
 * They are reference structures for document analysis.
 */

export interface DocumentPattern {
  documentType: PropertyDocumentType;
  name: string;
  description: string;

  expectedFields: string[];

  importantFields: string[];

  consistencyFields: string[];

  visualIndicators: string[];
}

export const DOCUMENT_PATTERNS: DocumentPattern[] = [
  {
    documentType: "certificate-of-occupancy",
    name: "Certificate of Occupancy",
    description:
      "A government-issued land title document showing an interest or right of occupancy over identified land, subject to the applicable jurisdiction and legal framework.",

    expectedFields: [
      "owner or holder name",
      "property location",
      "plot or parcel identification",
      "land area or dimensions",
      "document or file reference",
      "issuing authority",
      "issue or grant date",
      "property description",
    ],

    importantFields: [
      "owner or holder name",
      "property location",
      "plot or parcel identification",
      "issuing authority",
      "document reference",
    ],

    consistencyFields: [
      "owner or holder name",
      "property location",
      "plot or parcel identification",
      "land area",
      "document reference",
    ],

    visualIndicators: [
      "official document heading",
      "government or issuing authority identification",
      "document reference information",
      "structured property information",
      "official signatures or authorization where applicable",
      "official stamps, seals, or other security features where applicable",
    ],
  },

  {
    documentType: "deed-of-assignment",
    name: "Deed of Assignment",
    description:
      "A legal instrument used to document the assignment or transfer of an interest in property between identified parties.",

    expectedFields: [
      "assignor name",
      "assignee name",
      "property description",
      "property location",
      "consideration or transaction details",
      "execution date",
      "signatures",
      "witness information",
    ],

    importantFields: [
      "assignor name",
      "assignee name",
      "property description",
      "property location",
      "execution information",
    ],

    consistencyFields: [
      "assignor name",
      "assignee name",
      "property location",
      "plot or parcel identification",
      "survey reference",
      "transaction dates",
    ],

    visualIndicators: [
      "deed title",
      "identified parties",
      "property description",
      "execution clauses",
      "signature sections",
      "witness sections where applicable",
    ],
  },

  {
    documentType: "survey-plan",
    name: "Survey Plan",
    description:
      "A survey document containing information used to identify and describe a surveyed parcel of land.",

    expectedFields: [
      "survey plan number",
      "property location",
      "plot or parcel number",
      "land area",
      "coordinates or survey information",
      "surveyor information",
      "date",
      "boundary information",
    ],

    importantFields: [
      "survey plan number",
      "property location",
      "plot or parcel identification",
      "survey information",
      "land area",
    ],

    consistencyFields: [
      "survey plan number",
      "plot or parcel identification",
      "property location",
      "land area",
      "coordinates",
    ],

    visualIndicators: [
      "survey drawing or plan",
      "boundary lines",
      "dimensions",
      "coordinates or bearing information",
      "survey plan reference",
      "surveyor information",
    ],
  },

  {
    documentType: "allocation-letter",
    name: "Allocation Letter",
    description:
      "A document used by an applicable authority or organization to communicate the allocation of identified land or property to an allottee.",

    expectedFields: [
      "allottee name",
      "property identification",
      "allocation reference",
      "property location",
      "issuing authority",
      "allocation date",
    ],

    importantFields: [
      "allottee name",
      "property identification",
      "allocation reference",
      "issuing authority",
    ],

    consistencyFields: [
      "allottee name",
      "property location",
      "plot or parcel identification",
      "allocation reference",
      "dates",
    ],

    visualIndicators: [
      "issuing authority identification",
      "allocation reference",
      "formal letter structure",
      "property details",
      "official authorization where applicable",
    ],
  },

  {
    documentType: "governors-consent",
    name: "Governor's Consent",
    description:
      "A document or instrument relating to the required consent of the relevant state authority for a transaction or disposition involving an interest in land, where applicable.",

    expectedFields: [
      "grantor or transferor information",
      "transferee information",
      "property description",
      "property location",
      "transaction reference",
      "consent information",
      "relevant authority",
      "date",
    ],

    importantFields: [
      "parties",
      "property description",
      "property location",
      "consent information",
      "relevant authority",
    ],

    consistencyFields: [
      "party names",
      "property location",
      "plot or parcel identification",
      "transaction reference",
      "dates",
    ],

    visualIndicators: [
      "government authority identification",
      "formal consent language",
      "property information",
      "official authorization",
      "reference or registration information",
    ],
  },

  {
    documentType: "power-of-attorney",
    name: "Power of Attorney",
    description:
      "A legal instrument through which a principal grants specified authority to another person to act on the principal's behalf.",

    expectedFields: [
      "principal name",
      "attorney name",
      "powers granted",
      "property description where applicable",
      "property location where applicable",
      "execution date",
      "signatures",
      "witness information",
    ],

    importantFields: [
      "principal name",
      "attorney name",
      "powers granted",
      "property or transaction covered",
      "execution information",
    ],

    consistencyFields: [
      "principal name",
      "attorney name",
      "property location",
      "property identification",
      "dates",
    ],

    visualIndicators: [
      "power of attorney title",
      "principal identification",
      "attorney identification",
      "authority clauses",
      "signature sections",
      "witness or execution information where applicable",
    ],
  },

  {
    documentType: "receipt-payment",
    name: "Receipt / Evidence of Payment",
    description:
      "A document or record providing evidence of a payment or transaction relating to property.",

    expectedFields: [
      "payer name",
      "payee name",
      "amount",
      "payment date",
      "transaction reference",
      "payment purpose",
      "property information where applicable",
    ],

    importantFields: [
      "payer name",
      "payee name",
      "amount",
      "payment date",
      "transaction reference",
    ],

    consistencyFields: [
      "payer name",
      "payee name",
      "amount",
      "payment date",
      "property reference",
      "transaction reference",
    ],

    visualIndicators: [
      "receipt or payment heading",
      "amount information",
      "transaction reference",
      "payment date",
      "payer or payee information",
    ],
  },

  {
    documentType: "building-planning",
    name: "Building Approval / Planning Document",
    description:
      "A planning, development, building, or related approval document issued or referenced by the applicable authority.",

    expectedFields: [
      "applicant or owner name",
      "property location",
      "plot or parcel identification",
      "approval reference",
      "issuing authority",
      "development description",
      "approval date",
    ],

    importantFields: [
      "applicant or owner name",
      "property location",
      "approval reference",
      "issuing authority",
      "development description",
    ],

    consistencyFields: [
      "owner or applicant name",
      "property location",
      "plot or parcel identification",
      "approval reference",
      "dates",
    ],

    visualIndicators: [
      "planning or building authority identification",
      "approval reference",
      "development information",
      "property information",
      "official authorization where applicable",
    ],
  },

  {
    documentType: "other",
    name: "Other Property Document",
    description:
      "A property-related document that does not yet match one of the defined PropertySure AI document categories.",

    expectedFields: [
      "document title",
      "relevant parties",
      "property information",
      "issuing authority where applicable",
      "date where applicable",
      "document reference where applicable",
    ],

    importantFields: [
      "document title",
      "relevant parties",
      "property information",
    ],

    consistencyFields: [
      "names",
      "property location",
      "property identifiers",
      "dates",
      "document references",
    ],

    visualIndicators: [
      "document title",
      "formal document structure",
      "property-related information",
      "authority or issuer information where applicable",
    ],
  },
];

/**
 * Get the expected pattern for a document type.
 */
export function getDocumentPattern(
  documentType: PropertyDocumentType,
): DocumentPattern | undefined {
  return DOCUMENT_PATTERNS.find(
    (pattern) => pattern.documentType === documentType,
  );
}

/**
 * Get all available document patterns.
 */
export function getAllDocumentPatterns(): DocumentPattern[] {
  return DOCUMENT_PATTERNS;
}