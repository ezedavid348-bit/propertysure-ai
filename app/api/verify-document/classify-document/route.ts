import OpenAI from "openai";
import { NextResponse } from "next/server";

/*
 * ============================================================
 * OPENAI CLIENT
 * ============================================================
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type RequestDocument = {
  name?: string;
  path?: string;
  type?: string;
  mime_type?: string;
  size?: number;
  url?: string;
};

type RequestBody = {
  documentText?: string;
  document?: RequestDocument;
  documents?: RequestDocument[];
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
};

type DocumentType =
  | "Certificate of Occupancy (C of O)"
  | "Deed of Assignment"
  | "Survey Plan"
  | "Allocation Letter"
  | "Governor's Consent"
  | "Power of Attorney"
  | "Receipt / Evidence of Payment"
  | "Building Approval / Planning Document"
  | "Other Property Document";

type ClassificationStatus =
  | "identified"
  | "uncertain";

type RiskLevel =
  | "very_low"
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

type FindingSeverity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

type ClassificationResult = {
  documentType: DocumentType;

  documentTypeConfidence: number;

  documentTitleDetected: string;

  /*
   * MUST come from actual document content.
   *
   * NEVER populate from filename.
   */
  nameDetected: string;

  documentNumber: string;

  issuingAuthority: string;

  propertyDetails: {
    location: string;
    plotNumber: string;
    blockNumber: string;
    surveyNumber: string;
    propertyDescription: string;
  };

  parties: {
    grantor: string;
    grantee: string;
    owner: string;
    otherParties: string[];
  };

  dates: {
    documentDate: string;
    executionDate: string;
    registrationDate: string;
  };

  noForgery: boolean | null;

  stampValid: boolean | null;

  signatureValid: boolean | null;

  dataConsistent: boolean | null;

  duplicateDetected: boolean;

  ownershipValid: boolean | null;

  documentComplete: boolean | null;

  trustScore: number;

  confidence: number;

  risk: RiskLevel;

  summary: string;

  findings: {
    category: string;
    severity: FindingSeverity;
    title: string;
    description: string;
    evidence: string;
  }[];

  missingInformation: string[];

  verificationLimitations: string[];
};

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const OPENAI_MODEL = "gpt-5.6";

const MAX_FILE_SIZE =
  20 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;

const VALID_DOCUMENT_TYPES = [
  "Certificate of Occupancy (C of O)",
  "Deed of Assignment",
  "Survey Plan",
  "Allocation Letter",
  "Governor's Consent",
  "Power of Attorney",
  "Receipt / Evidence of Payment",
  "Building Approval / Planning Document",
  "Other Property Document",
] as const;

/*
 * ============================================================
 * CLASSIFICATION INSTRUCTIONS
 * ============================================================
 */

const CLASSIFICATION_INSTRUCTIONS = `
You are PropertySure AI's property-document classification
and preliminary document-analysis engine.

Your FIRST responsibility is to inspect the ACTUAL CONTENT
of the supplied document.

The uploaded filename is NOT evidence.

The filename must never be used to determine:

- document type
- person's name
- owner
- proprietor
- purchaser
- buyer
- grantee
- assignee
- assignor
- applicant
- allottee
- beneficiary
- property owner

============================================================
PRIMARY OBJECTIVE
============================================================

Inspect the actual document and determine:

1. What type of property document is this?
2. What is the actual visible title or heading?
3. What relevant person's name is actually visible?
4. What important property/document information is visible?
5. What preliminary findings can safely be made?

============================================================
SUPPORTED DOCUMENT TYPES
============================================================

Classify the document as exactly ONE of:

1. Certificate of Occupancy (C of O)
2. Deed of Assignment
3. Survey Plan
4. Allocation Letter
5. Governor's Consent
6. Power of Attorney
7. Receipt / Evidence of Payment
8. Building Approval / Planning Document
9. Other Property Document

============================================================
DOCUMENT TYPE IDENTIFICATION
============================================================

Look first for the actual visible:

- document title
- heading
- caption
- certificate heading
- legal heading
- government heading
- document identifier

Examples:

"CERTIFICATE OF OCCUPANCY"
→ Certificate of Occupancy (C of O)

"DEED OF ASSIGNMENT"
→ Deed of Assignment

"SURVEY PLAN"
→ Survey Plan

"ALLOCATION LETTER"
→ Allocation Letter

"GOVERNOR'S CONSENT"
→ Governor's Consent

"POWER OF ATTORNEY"
→ Power of Attorney

"RECEIPT"
"PAYMENT RECEIPT"
"RECEIPT FOR PAYMENT"
→ Receipt / Evidence of Payment

A building/development/planning approval
→ Building Approval / Planning Document

============================================================
DOCUMENT TYPE PRIORITY
============================================================

If the document title clearly identifies the document type,
preserve that classification even when:

- names are blurry
- dates are blurry
- signatures are unclear
- stamps are unclear
- some text is unreadable
- some numbers are unreadable

For example:

If the document clearly says:

"DEED OF ASSIGNMENT"

return:

"Deed of Assignment"

Do NOT downgrade the document type merely because other
fields cannot be read.

============================================================
NAME EXTRACTION — CRITICAL
============================================================

"nameDetected" MUST come from the ACTUAL DOCUMENT.

It must be based on visible document content.

Look throughout the document for names associated with:

- Owner
- Proprietor
- Applicant
- Grantee
- Purchaser
- Buyer
- Assignee
- Assignor
- Vendor
- Beneficiary
- Allottee
- Lessee
- Attorney
- Donor
- Principal
- Party
- Prepared for
- Issued to
- Granted to
- Name of Applicant
- Name of Proprietor
- Name of Purchaser
- Name of Allottee

Also inspect legal sentences where a person's name is clearly
associated with the property.

============================================================
NAME PRIORITY
============================================================

When multiple names appear, choose the strongest primary
property-related person.

Generally prioritize:

1. Property owner / proprietor
2. Grantee / allottee / beneficiary
3. Purchaser / buyer / assignee
4. Applicant
5. Other primary property-related party

Do NOT simply choose the first name appearing on the page.

Do NOT choose:

- lawyer
- surveyor
- witness
- typist
- commissioner for oaths
- government official
- registrar

unless the document explicitly identifies that person as the
property-related primary party.

============================================================
DEED OF ASSIGNMENT
============================================================

For a Deed of Assignment:

If:

ASSIGNOR:
John Doe

ASSIGNEE:
Jane Doe

then generally:

nameDetected:
Jane Doe

because the assignee is the acquiring party.

However, follow the actual document wording if another person
is clearly identified as the property holder.

============================================================
CERTIFICATE OF OCCUPANCY
============================================================

Prioritize the person identified as:

- Proprietor
- Owner
- Grantee
- Lessee
- Holder

or equivalent official wording.

============================================================
ALLOCATION LETTER
============================================================

Prioritize the person to whom the property was allocated.

============================================================
SURVEY PLAN
============================================================

Prioritize the owner, proprietor or client if clearly identified.

Do NOT treat the surveyor's name as the owner unless the document
explicitly says that the surveyor is the owner/proprietor/client.

============================================================
POWER OF ATTORNEY
============================================================

Distinguish carefully between:

- Donor
- Principal
- Attorney
- Agent

Do NOT automatically assume the attorney is the property owner.

Choose the strongest property-related party based on the actual
document wording.

============================================================
NAME ACCURACY
============================================================

Copy the name from the actual document.

Preserve:

- spelling
- initials
- middle names
- surname
- meaningful capitalization where clear

Do NOT:

- correct spelling
- invent missing letters
- guess missing names
- combine unrelated names
- use the filename
- use metadata
- infer a name from a path
- infer a name from a URL

Example:

If the document visibly says:

"MR. JOHN CHUKWU OKAFOR"

return:

"John Chukwu Okafor"

If it visibly says:

"CHUKWU OKAFOR"

return:

"Chukwu Okafor"

Do not add a first name that is not visible.

============================================================
NO RELIABLE NAME
============================================================

If no relevant person's name can be reliably read:

return:

""

for nameDetected.

This is correct.

Do NOT return:

- filename
- "Unknown"
- "Not available"
- guessed name
- inferred name

============================================================
DOCUMENT TITLE
============================================================

documentTitleDetected must contain the strongest actual visible
document title or heading.

Examples:

"DEED OF ASSIGNMENT"

"CERTIFICATE OF OCCUPANCY"

"SURVEY PLAN"

"ALLOCATION LETTER"

If no reliable title exists:

return:

""

Do NOT invent a title.

============================================================
DOCUMENT NUMBER
============================================================

Extract only clearly visible document numbers.

Possible examples:

- Certificate number
- File number
- Registration number
- Survey number
- Reference number

Never guess.

============================================================
ISSUING AUTHORITY
============================================================

Extract the visible issuing authority only when clearly shown.

Examples may include:

- State Government
- Ministry
- Land Registry
- Planning Authority
- Survey Authority

Do not infer an issuing authority from the filename.

============================================================
PROPERTY DETAILS
============================================================

Extract only information visibly supported by the document.

Possible fields:

- location
- plot number
- block number
- survey number
- parcel number
- property description
- estate
- district
- local government
- state
- dimensions
- boundaries

Do not invent missing values.

============================================================
PARTIES
============================================================

For legal documents:

grantor:
Party transferring or granting the interest.

grantee:
Party receiving the interest.

owner:
Use only when the document explicitly identifies an owner.

otherParties:
Other clearly identified parties.

Do not infer legal ownership merely because a person appears.

============================================================
DATES
============================================================

Extract only dates actually visible.

Possible fields:

documentDate
executionDate
registrationDate

If a date cannot be reliably identified:

return:

""

============================================================
VISUAL AUTHENTICITY LIMITATIONS
============================================================

This is preliminary visual/document analysis.

You are NOT a government authentication service.

You cannot legally certify:

- signature authenticity
- stamp authenticity
- seal authenticity
- government issuance
- title validity
- ownership
- registration validity
- legal enforceability
- absence of forgery

Therefore:

signatureValid:
Use true only when there is visible evidence supporting a
preliminary visual assessment.

Use false only when there is clear visible evidence of an
obvious problem.

Otherwise use null.

stampValid:
Use the same principle.

noForgery:
Do NOT make a definitive forensic determination.

Use null unless the visual evidence supports a cautious
preliminary assessment.

============================================================
DATA CONSISTENCY
============================================================

dataConsistent means apparent INTERNAL consistency within the
supplied document.

Examples:

- same property location repeated consistently
- same plot number repeated consistently
- same party names repeated consistently
- same reference numbers repeated consistently

This is NOT external verification.

Use null when insufficient evidence exists.

============================================================
DUPLICATE DETECTION
============================================================

You do not have access to the complete PropertySure AI database
unless it is explicitly supplied.

Therefore:

duplicateDetected should normally be false.

Do not claim that the document is unique across PropertySure AI.

============================================================
OWNERSHIP VALIDITY
============================================================

Do not determine legal ownership merely from visual inspection.

Use null unless the supplied document itself provides sufficient
internal evidence for a limited preliminary assessment.

Actual ownership confirmation requires an independent title/
land-registry search.

============================================================
DOCUMENT COMPLETENESS
============================================================

documentComplete refers to apparent completeness of the supplied
document.

It does NOT mean legal completeness.

Use true if visibly complete.

Use false if clearly cropped, incomplete, or missing major
sections.

Use null if uncertain.

============================================================
TRUST SCORE
============================================================

trustScore is a PRELIMINARY DOCUMENT-QUALITY score.

It is NOT:

- an authenticity guarantee
- proof of ownership
- proof of government issuance
- proof that the document is genuine

============================================================
CONFIDENCE
============================================================

confidence represents confidence in the preliminary analysis.

It is NOT legal certainty.

============================================================
RISK
============================================================

Use:

very_low
low
medium
high
critical
unknown

Risk should reflect visible document-analysis concerns.

Do not assign high risk merely because a field is unreadable.

Do not assign critical risk without a significant visible
concern.

============================================================
FINDINGS
============================================================

Every finding must be evidence-based.

Each finding contains:

category
severity
title
description
evidence

Do not invent evidence.

If there are no meaningful findings:

return an empty array.

============================================================
MISSING INFORMATION
============================================================

List important information that appears missing or unreadable.

Do not list every tiny unreadable word.

============================================================
VERIFICATION LIMITATIONS
============================================================

Clearly state relevant limitations, such as:

- visual inspection only
- no government registry confirmation
- no independent ownership search
- no forensic signature examination
- no external title search
- no physical inspection

============================================================
MOST IMPORTANT FIELDS
============================================================

The most important fields for PropertySure AI's ReviewPage are:

documentType
documentTypeConfidence
documentTitleDetected
nameDetected

============================================================
ABSOLUTE FINAL RULE
============================================================

"nameDetected" MUST be based on the actual visible document.

NEVER use:

- filename
- file path
- URL
- storage path
- metadata

as the person's name.

If the actual person's name cannot be reliably read:

"nameDetected": ""

Return ONLY structured JSON.
`;

/*
 * ============================================================
 * STRUCTURED JSON SCHEMA
 * ============================================================
 */

const CLASSIFICATION_SCHEMA = {
  type: "object",

  additionalProperties: false,

  properties: {
    documentType: {
      type: "string",
      enum: VALID_DOCUMENT_TYPES,
    },

    documentTypeConfidence: {
      type: "number",
    },

    documentTitleDetected: {
      type: "string",
    },

    nameDetected: {
      type: "string",
    },

    documentNumber: {
      type: "string",
    },

    issuingAuthority: {
      type: "string",
    },

    propertyDetails: {
      type: "object",

      additionalProperties: false,

      properties: {
        location: {
          type: "string",
        },

        plotNumber: {
          type: "string",
        },

        blockNumber: {
          type: "string",
        },

        surveyNumber: {
          type: "string",
        },

        propertyDescription: {
          type: "string",
        },
      },

      required: [
        "location",
        "plotNumber",
        "blockNumber",
        "surveyNumber",
        "propertyDescription",
      ],
    },

    parties: {
      type: "object",

      additionalProperties: false,

      properties: {
        grantor: {
          type: "string",
        },

        grantee: {
          type: "string",
        },

        owner: {
          type: "string",
        },

        otherParties: {
          type: "array",

          items: {
            type: "string",
          },
        },
      },

      required: [
        "grantor",
        "grantee",
        "owner",
        "otherParties",
      ],
    },

    dates: {
      type: "object",

      additionalProperties: false,

      properties: {
        documentDate: {
          type: "string",
        },

        executionDate: {
          type: "string",
        },

        registrationDate: {
          type: "string",
        },
      },

      required: [
        "documentDate",
        "executionDate",
        "registrationDate",
      ],
    },

    noForgery: {
      type: [
        "boolean",
        "null",
      ],
    },

    stampValid: {
      type: [
        "boolean",
        "null",
      ],
    },

    signatureValid: {
      type: [
        "boolean",
        "null",
      ],
    },

    dataConsistent: {
      type: [
        "boolean",
        "null",
      ],
    },

    duplicateDetected: {
      type: "boolean",
    },

    ownershipValid: {
      type: [
        "boolean",
        "null",
      ],
    },

    documentComplete: {
      type: [
        "boolean",
        "null",
      ],
    },

    trustScore: {
      type: "number",
    },

    confidence: {
      type: "number",
    },

    risk: {
      type: "string",

      enum: [
        "very_low",
        "low",
        "medium",
        "high",
        "critical",
        "unknown",
      ],
    },

    summary: {
      type: "string",
    },

    findings: {
      type: "array",

      items: {
        type: "object",

        additionalProperties: false,

        properties: {
          category: {
            type: "string",
          },

          severity: {
            type: "string",

            enum: [
              "info",
              "low",
              "medium",
              "high",
              "critical",
            ],
          },

          title: {
            type: "string",
          },

          description: {
            type: "string",
          },

          evidence: {
            type: "string",
          },
        },

        required: [
          "category",
          "severity",
          "title",
          "description",
          "evidence",
        ],
      },
    },

    missingInformation: {
      type: "array",

      items: {
        type: "string",
      },
    },

    verificationLimitations: {
      type: "array",

      items: {
        type: "string",
      },
    },
  },

  required: [
    "documentType",
    "documentTypeConfidence",
    "documentTitleDetected",
    "nameDetected",
    "documentNumber",
    "issuingAuthority",
    "propertyDetails",
    "parties",
    "dates",
    "noForgery",
    "stampValid",
    "signatureValid",
    "dataConsistent",
    "duplicateDetected",
    "ownershipValid",
    "documentComplete",
    "trustScore",
    "confidence",
    "risk",
    "summary",
    "findings",
    "missingInformation",
    "verificationLimitations",
  ],
};

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function normalizeScore(
  value: unknown
): number {
  const numberValue =
    Number(value);

  if (
    !Number.isFinite(
      numberValue
    )
  ) {
    return 0;
  }

  /*
   * If AI accidentally returns 0–1,
   * convert it to 0–100.
   */

  if (
    numberValue >= 0 &&
    numberValue <= 1
  ) {
    return Math.round(
      numberValue * 100
    );
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        numberValue
      )
    )
  );
}

function normalizeMimeType(
  mimeType?: string
): string {
  return String(
    mimeType || ""
  )
    .trim()
    .toLowerCase();
}

function inferMimeTypeFromName(
  fileName?: string
): string {
  const name =
    String(
      fileName || ""
    ).toLowerCase();

  if (
    name.endsWith(".pdf")
  ) {
    return "application/pdf";
  }

  if (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg")
  ) {
    return "image/jpeg";
  }

  if (
    name.endsWith(".png")
  ) {
    return "image/png";
  }

  return "";
}

function isAllowedMimeType(
  mimeType: string
): boolean {
  return ALLOWED_MIME_TYPES.includes(
    mimeType as
      (typeof ALLOWED_MIME_TYPES)[number]
  );
}

function isValidDocumentType(
  value: unknown
): value is DocumentType {
  return (
    typeof value === "string" &&
    VALID_DOCUMENT_TYPES.includes(
      value as DocumentType
    )
  );
}

function normalizeDocumentType(
  value: unknown
): DocumentType {
  if (
    isValidDocumentType(
      value
    )
  ) {
    return value;
  }

  const lower =
    String(
      value || ""
    )
      .trim()
      .toLowerCase();

  if (
    lower.includes(
      "certificate of occupancy"
    ) ||
    lower === "c of o" ||
    lower === "c.o."
  ) {
    return "Certificate of Occupancy (C of O)";
  }

  if (
    lower.includes(
      "deed of assignment"
    )
  ) {
    return "Deed of Assignment";
  }

  if (
    lower.includes("survey") &&
    lower.includes("plan")
  ) {
    return "Survey Plan";
  }

  if (
    lower.includes(
      "allocation letter"
    ) ||
    lower.includes(
      "allocation document"
    )
  ) {
    return "Allocation Letter";
  }

  if (
    lower.includes("governor") &&
    lower.includes("consent")
  ) {
    return "Governor's Consent";
  }

  if (
    lower.includes(
      "power of attorney"
    )
  ) {
    return "Power of Attorney";
  }

  if (
    lower.includes("receipt") ||
    lower.includes(
      "evidence of payment"
    ) ||
    lower.includes("payment")
  ) {
    return "Receipt / Evidence of Payment";
  }

  if (
    lower.includes(
      "building approval"
    ) ||
    lower.includes(
      "planning approval"
    ) ||
    lower.includes(
      "planning document"
    )
  ) {
    return "Building Approval / Planning Document";
  }

  return "Other Property Document";
}

function determineClassificationStatus(
  result: ClassificationResult
): ClassificationStatus {
  if (
    result.documentType ===
    "Other Property Document"
  ) {
    return "uncertain";
  }

  if (
    result.documentTypeConfidence <
    75
  ) {
    return "uncertain";
  }

  return "identified";
}

function ensureObject<T extends object>(
  value: unknown,
  fallback: T
): T {
  if (
    value &&
    typeof value ===
      "object" &&
    !Array.isArray(
      value
    )
  ) {
    return value as T;
  }

  return fallback;
}

function ensureArray<T>(
  value: unknown
): T[] {
  return Array.isArray(
    value
  )
    ? (value as T[])
    : [];
}

/*
 * ============================================================
 * UPLOAD FILE TO OPENAI
 * ============================================================
 *
 * We intentionally give OpenAI a generic filename.
 *
 * This prevents the user's original filename from becoming
 * useful evidence for the model.
 * ============================================================
 */

async function uploadFileToOpenAI(
  file: File
) {
  const originalMime =
    normalizeMimeType(
      file.type
    ) ||
    inferMimeTypeFromName(
      file.name
    );

  let extension =
    ".jpg";

  if (
    originalMime ===
    "application/pdf"
  ) {
    extension =
      ".pdf";
  } else if (
    originalMime ===
    "image/png"
  ) {
    extension =
      ".png";
  }

  const safeFileName =
    `property-document${extension}`;

  const openAIFile =
    await OpenAI.toFile(
      file,
      safeFileName,
      {
        type:
          originalMime ||
          "application/octet-stream",
      }
    );

  return openai.files.create({
    file:
      openAIFile,

    purpose:
      "user_data",
  });
}

/*
 * ============================================================
 * BUILD FILE INPUT
 * ============================================================
 */

async function buildFileInput(
  file: File,
  documentNumber = 1
): Promise<any[]> {
  const mimeType =
    normalizeMimeType(
      file.type
    ) ||
    inferMimeTypeFromName(
      file.name
    );

  if (
    !isAllowedMimeType(
      mimeType
    )
  ) {
    throw new Error(
      `Unsupported document type. PropertySure AI accepts PDF, JPG, JPEG and PNG files. Received: ${
        mimeType ||
        "unknown"
      }`
    );
  }

  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      `The document exceeds the ${
        MAX_FILE_SIZE /
        (1024 * 1024)
      } MB file limit.`
    );
  }

  if (
    file.size <=
    0
  ) {
    throw new Error(
      "The supplied document is empty."
    );
  }

  const uploadedFile =
    await uploadFileToOpenAI(
      file
    );

  const isImage =
    mimeType ===
      "image/jpeg" ||
    mimeType ===
      "image/jpg" ||
    mimeType ===
      "image/png";

  /*
   * ----------------------------------------------------------
   * IMAGE
   * ----------------------------------------------------------
   */

  if (
    isImage
  ) {
    return [
      {
        type:
          "input_text",

        text: `
DOCUMENT ${documentNumber}

Inspect the ACTUAL IMAGE CONTENT.

Do not use a filename as evidence.

Determine:

1. Actual document type.
2. Actual visible document title.
3. Actual relevant person's name.

"nameDetected" MUST come from visible document content.

Look for:

Owner
Proprietor
Applicant
Grantee
Purchaser
Assignee
Allottee
Beneficiary
or equivalent wording.

If no relevant person's name can be reliably read:

return an empty string.

NEVER use a filename, file path or URL as the person's name.
        `,
      },

      {
        type:
          "input_image",

        file_id:
          uploadedFile.id,

        detail:
          "high",
      },
    ];
  }

  /*
   * ----------------------------------------------------------
   * PDF
   * ----------------------------------------------------------
   */

  return [
    {
      type:
        "input_text",

      text: `
DOCUMENT ${documentNumber}

Inspect the ACTUAL PDF CONTENT AND PAGES.

Do not use a filename as evidence.

Determine:

1. Actual document type.
2. Actual visible document title.
3. Actual relevant person's name.

"nameDetected" MUST come from visible document content.

Look for:

Owner
Proprietor
Applicant
Grantee
Purchaser
Assignee
Allottee
Beneficiary
or equivalent wording.

If no relevant person's name can be reliably read:

return an empty string.

NEVER use a filename, file path or URL as the person's name.
      `,
    },

    {
      type:
        "input_file",

      file_id:
        uploadedFile.id,
    },
  ];
}

/*
 * ============================================================
 * BUILD URL INPUT
 * ============================================================
 *
 * Used when the caller supplies a document URL.
 *
 * IMPORTANT:
 *
 * The original filename is NOT placed into the AI prompt.
 * ============================================================
 */

function buildLegacyUrlInput(
  document: RequestDocument,
  documentNumber = 1
): any[] {
  if (
    !document.url
  ) {
    return [];
  }

  const mimeType =
    normalizeMimeType(
      document.mime_type ||
        document.type
    ) ||
    inferMimeTypeFromName(
      document.name
    );

  /*
   * IMAGE URL
   */

  if (
    mimeType ===
      "image/jpeg" ||
    mimeType ===
      "image/jpg" ||
    mimeType ===
      "image/png"
  ) {
    return [
      {
        type:
          "input_text",

        text: `
DOCUMENT ${documentNumber}

Inspect the ACTUAL IMAGE.

Do not use the filename, URL or storage path as evidence.

Extract:

1. Actual document type.
2. Actual document title.
3. Actual relevant person's name.

"nameDetected" MUST come from visible document content.

If no relevant person's name can be reliably read:

return an empty string.
        `,
      },

      {
        type:
          "input_image",

        image_url:
          document.url,

        detail:
          "high",
      },
    ];
  }

  /*
   * PDF URL
   */

  if (
    mimeType ===
    "application/pdf"
  ) {
    return [
      {
        type:
          "input_text",

        text: `
DOCUMENT ${documentNumber}

Inspect the ACTUAL PDF pages.

Do not use the filename, URL or storage path as evidence.

Extract:

1. Actual document type.
2. Actual document title.
3. Actual relevant person's name.

"nameDetected" MUST come from visible document content.

If no relevant person's name can be reliably read:

return an empty string.
        `,
      },

      {
        type:
          "input_file",

        file_url:
          document.url,
      },
    ];
  }

  return [];
}

/*
 * ============================================================
 * NORMALIZE RESULT
 * ============================================================
 */

function normalizeClassificationResult(
  rawResult: ClassificationResult
): ClassificationResult {
  const result =
    rawResult;

  /*
   * Document type
   */

  result.documentType =
    normalizeDocumentType(
      result.documentType
    );

  /*
   * Scores
   */

  result.documentTypeConfidence =
    normalizeScore(
      result.documentTypeConfidence
    );

  result.trustScore =
    normalizeScore(
      result.trustScore
    );

  result.confidence =
    normalizeScore(
      result.confidence
    );

  /*
   * Strings
   */

  result.documentTitleDetected =
    typeof result.documentTitleDetected ===
    "string"
      ? result.documentTitleDetected.trim()
      : "";

  /*
   * ==========================================================
   * NAME DETECTED
   * ==========================================================
   *
   * IMPORTANT:
   *
   * We do NOT use:
   *
   * file.name
   * document.name
   * path
   * URL
   *
   * to populate this value.
   *
   * If the AI did not find a name in the actual document,
   * it remains empty.
   * ==========================================================
   */

  result.nameDetected =
    typeof result.nameDetected ===
    "string"
      ? result.nameDetected.trim()
      : "";

  result.documentNumber =
    typeof result.documentNumber ===
    "string"
      ? result.documentNumber.trim()
      : "";

  result.issuingAuthority =
    typeof result.issuingAuthority ===
    "string"
      ? result.issuingAuthority.trim()
      : "";

  result.summary =
    typeof result.summary ===
    "string"
      ? result.summary.trim()
      : "";

  /*
   * Property details
   */

  result.propertyDetails =
    ensureObject(
      result.propertyDetails,
      {
        location: "",
        plotNumber: "",
        blockNumber: "",
        surveyNumber: "",
        propertyDescription: "",
      }
    );

  /*
   * Ensure property detail strings exist.
   */

  result.propertyDetails.location =
    typeof result.propertyDetails.location ===
    "string"
      ? result.propertyDetails.location.trim()
      : "";

  result.propertyDetails.plotNumber =
    typeof result.propertyDetails.plotNumber ===
    "string"
      ? result.propertyDetails.plotNumber.trim()
      : "";

  result.propertyDetails.blockNumber =
    typeof result.propertyDetails.blockNumber ===
    "string"
      ? result.propertyDetails.blockNumber.trim()
      : "";

  result.propertyDetails.surveyNumber =
    typeof result.propertyDetails.surveyNumber ===
    "string"
      ? result.propertyDetails.surveyNumber.trim()
      : "";

  result.propertyDetails.propertyDescription =
    typeof result.propertyDetails.propertyDescription ===
    "string"
      ? result.propertyDetails.propertyDescription.trim()
      : "";

  /*
   * Parties
   */

  result.parties =
    ensureObject(
      result.parties,
      {
        grantor: "",
        grantee: "",
        owner: "",
        otherParties: [],
      }
    );

  result.parties.grantor =
    typeof result.parties.grantor ===
    "string"
      ? result.parties.grantor.trim()
      : "";

  result.parties.grantee =
    typeof result.parties.grantee ===
    "string"
      ? result.parties.grantee.trim()
      : "";

  result.parties.owner =
    typeof result.parties.owner ===
    "string"
      ? result.parties.owner.trim()
      : "";

  result.parties.otherParties =
    ensureArray<string>(
      result.parties.otherParties
    ).filter(
      (
        value
      ) =>
        typeof value ===
        "string"
    );

  /*
   * Dates
   */

  result.dates =
    ensureObject(
      result.dates,
      {
        documentDate: "",
        executionDate: "",
        registrationDate: "",
      }
    );

  result.dates.documentDate =
    typeof result.dates.documentDate ===
    "string"
      ? result.dates.documentDate.trim()
      : "";

  result.dates.executionDate =
    typeof result.dates.executionDate ===
    "string"
      ? result.dates.executionDate.trim()
      : "";

  result.dates.registrationDate =
    typeof result.dates.registrationDate ===
    "string"
      ? result.dates.registrationDate.trim()
      : "";

  /*
   * Arrays
   */

  result.findings =
    ensureArray(
      result.findings
    );

  result.missingInformation =
    ensureArray<string>(
      result.missingInformation
    );

  result.verificationLimitations =
    ensureArray<string>(
      result.verificationLimitations
    );

  /*
   * Risk
   */

  const validRisks: RiskLevel[] = [
    "very_low",
    "low",
    "medium",
    "high",
    "critical",
    "unknown",
  ];

  if (
    !validRisks.includes(
      result.risk
    )
  ) {
    result.risk =
      "unknown";
  }

  /*
   * ==========================================================
   * FINAL NAME PROTECTION
   * ==========================================================
   *
   * There is deliberately NO fallback such as:
   *
   * result.nameDetected = fileName
   *
   * If AI did not find a name from the actual document,
   * the correct result is:
   *
   * ""
   * ==========================================================
   */

  return result;
}

/*
 * ============================================================
 * FRONTEND RESPONSE
 * ============================================================
 */

function createClassificationResponse(
  result: ClassificationResult
) {
  const status =
    determineClassificationStatus(
      result
    );

  let message =
    "";

  if (
    status ===
    "identified"
  ) {
    message =
      `${result.documentType} identified with ${result.documentTypeConfidence}% confidence.`;
  } else {
    message =
      "The document type could not be confidently identified.";
  }

  return {
    success:
      true,

    documentType:
      result.documentType,

    confidence:
      result.documentTypeConfidence,

    status,

    message,

    /*
     * IMPORTANT:
     *
     * These are exposed directly for the ReviewPage.
     */

    nameDetected:
      result.nameDetected,

    documentTitleDetected:
      result.documentTitleDetected,

    result,
  };
}

/*
 * ============================================================
 * POST
 * ============================================================
 */

export async function POST(
  request: Request
) {
  try {
    /*
     * ========================================================
     * 1. OPENAI CONFIGURATION
     * ========================================================
     */

    if (
      !process.env.OPENAI_API_KEY
    ) {
      console.error(
        "OPENAI_API_KEY is missing."
      );

      return NextResponse.json(
        {
          success:
            false,

          error:
            "OpenAI API configuration is missing on the server.",
        },
        {
          status:
            500,
        }
      );
    }

    /*
     * ========================================================
     * 2. REQUEST TYPE
     * ========================================================
     */

    const contentType =
      request.headers.get(
        "content-type"
      ) || "";

    const content: any[] =
      [];

    let documentsReceived =
      0;

    let documentsSentToAI =
      0;

    /*
     * ========================================================
     * 3. SYSTEM INSTRUCTIONS
     * ========================================================
     */

    content.push({
      type:
        "input_text",

      text:
        CLASSIFICATION_INSTRUCTIONS,
    });

    /*
     * ========================================================
     * 4. MULTIPART FORM DATA
     * ========================================================
     *
     * Expected:
     *
     * FormData:
     *   file = File
     *
     * Multiple files are also supported.
     * ========================================================
     */

    if (
      contentType.includes(
        "multipart/form-data"
      )
    ) {
      const formData =
        await request.formData();

      const files =
        formData.getAll(
          "file"
        );

      const additionalFiles =
        formData.getAll(
          "files"
        );

      const allFiles = [
        ...files,
        ...additionalFiles,
      ].filter(
        (
          value
        ): value is File =>
          value instanceof File
      );

      documentsReceived =
        allFiles.length;

      if (
        allFiles.length ===
        0
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              "No document file was supplied.",
          },
          {
            status:
              400,
          }
        );
      }

      /*
       * Process every supplied document.
       */

      for (
        let index = 0;
        index <
        allFiles.length;
        index++
      ) {
        const file =
          allFiles[index];

        /*
         * Size check.
         */

        if (
          file.size >
          MAX_FILE_SIZE
        ) {
          return NextResponse.json(
            {
              success:
                false,

              error:
                `"${file.name}" exceeds the 20 MB file limit.`,
            },
            {
              status:
                400,
            }
          );
        }

        /*
         * Empty file.
         */

        if (
          file.size <=
          0
        ) {
          return NextResponse.json(
            {
              success:
                false,

              error:
                `"${file.name}" is empty.`,
            },
            {
              status:
                400,
            }
          );
        }

        /*
         * MIME type.
         */

        const fileMimeType =
          normalizeMimeType(
            file.type
          ) ||
          inferMimeTypeFromName(
            file.name
          );

        if (
          !isAllowedMimeType(
            fileMimeType
          )
        ) {
          return NextResponse.json(
            {
              success:
                false,

              error:
                `"${file.name}" is not supported. Please upload PDF, JPG or PNG.`,
            },
            {
              status:
                400,
            }
          );
        }

        /*
         * Upload actual file content to OpenAI.
         */

        const documentInput =
          await buildFileInput(
            file,
            index + 1
          );

        content.push(
          ...documentInput
        );

        documentsSentToAI++;
      }
    }

    /*
     * ========================================================
     * 5. JSON REQUEST
     * ========================================================
     */

    else if (
      contentType.includes(
        "application/json"
      )
    ) {
      const body =
        (await request.json()) as RequestBody;

      let documents:
        RequestDocument[] =
        [];

      /*
       * Multiple documents.
       */

      if (
        Array.isArray(
          body.documents
        )
      ) {
        documents =
          body.documents.filter(
            Boolean
          );
      }

      /*
       * Single document.
       */

      if (
        documents.length ===
          0 &&
        body.document
      ) {
        documents = [
          body.document,
        ];
      }

      /*
       * Legacy file URL.
       */

      if (
        documents.length ===
          0 &&
        body.fileUrl
      ) {
        documents = [
          {
            url:
              body.fileUrl,

            /*
             * These fields are retained for MIME detection only.
             *
             * They are NOT passed to the AI as evidence.
             */

            name:
              body.fileName ||
              "property-document",

            mime_type:
              body.mimeType,
          },
        ];
      }

      const documentText =
        body.documentText?.trim();

      documentsReceived =
        documents.length;

      /*
       * Add supplied document URLs.
       */

      for (
        let index = 0;
        index <
        documents.length;
        index++
      ) {
        const document =
          documents[index];

        if (
          !document.url
        ) {
          console.warn(
            `Document ${
              index + 1
            } has no usable URL.`
          );

          continue;
        }

        const documentInput =
          buildLegacyUrlInput(
            document,
            index + 1
          );

        content.push(
          ...documentInput
        );

        if (
          documentInput.length >
          0
        ) {
          documentsSentToAI++;
        }
      }

      /*
       * Legacy extracted text support.
       *
       * This is only supporting evidence.
       */

      if (
        documentText
      ) {
        content.push({
          type:
            "input_text",

          text: `
LEGACY DOCUMENT TEXT

Use this text only as supporting evidence.

Do not assume that this text is complete.

If an actual document image/file is supplied,
prioritize the actual document.

DOCUMENT TEXT:

${documentText}
          `,
        });
      }

      /*
       * Nothing supplied.
       */

      if (
        documents.length ===
          0 &&
        !documentText
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              "No document or document content was provided.",
          },
          {
            status:
              400,
          }
        );
      }

      /*
       * Nothing usable supplied.
       */

      if (
        documentsSentToAI ===
          0 &&
        !documentText
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              "The document was received, but no usable document URL was supplied for AI analysis.",
          },
          {
            status:
              400,
          }
        );
      }
    }

    /*
     * ========================================================
     * 6. UNSUPPORTED REQUEST
     * ========================================================
     */

    else {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "Unsupported request format. Use multipart/form-data with a file or application/json.",
        },
        {
          status:
            415,
        }
      );
    }

    /*
     * ========================================================
     * 7. CALL OPENAI
     * ========================================================
     */

    console.log(
      "PROPERTY SURE AI: Starting document classification."
    );

    const response =
      await openai.responses.create({
        model:
          OPENAI_MODEL,

        input: [
          {
            role:
              "user",

            content,
          },
        ],

        text: {
          format: {
            type:
              "json_schema",

            name:
              "property_document_analysis",

            strict:
              true,

            schema:
              CLASSIFICATION_SCHEMA,
          },
        },
      });

    /*
     * ========================================================
     * 8. READ STRUCTURED OUTPUT
     * ========================================================
     */

    const rawOutput =
      response.output_text?.trim();

    console.log(
      "PROPERTY SURE AI: Structured output received."
    );

    if (
      !rawOutput
    ) {
      console.error(
        "OPENAI EMPTY OUTPUT:",
        response
      );

      throw new Error(
        "OpenAI returned an empty response."
      );
    }

    /*
     * ========================================================
     * 9. PARSE JSON
     * ========================================================
     */

    let result:
      ClassificationResult;

    try {
      result =
        JSON.parse(
          rawOutput
        ) as ClassificationResult;
    } catch (
      parseError
    ) {
      console.error(
        "OPENAI STRUCTURED OUTPUT PARSE ERROR:",
        parseError
      );

      console.error(
        "RAW AI OUTPUT:",
        rawOutput
      );

      return NextResponse.json(
        {
          success:
            false,

          error:
            "AI returned an invalid structured verification result.",
        },
        {
          status:
            502,
        }
      );
    }

    /*
     * ========================================================
     * 10. NORMALIZE
     * ========================================================
     */

    result =
      normalizeClassificationResult(
        result
      );

    /*
     * ========================================================
     * 11. CLASSIFICATION STATUS
     * ========================================================
     */

    const status =
      determineClassificationStatus(
        result
      );

    /*
     * ========================================================
     * 12. CREATE FRONTEND RESPONSE
     * ========================================================
     */

    const classificationResponse =
      createClassificationResponse(
        result
      );

    /*
     * ========================================================
     * 13. DEVELOPMENT LOG
     * ========================================================
     */

    console.log(
      "PROPERTY SURE AI: FINAL CLASSIFICATION:",
      {
        documentType:
          result.documentType,

        documentTypeConfidence:
          result.documentTypeConfidence,

        documentTitleDetected:
          result.documentTitleDetected,

        nameDetected:
          result.nameDetected,

        status,
      }
    );

    /*
     * ========================================================
     * 14. RETURN
     * ========================================================
     */

    return NextResponse.json({
      ...classificationResponse,

      /*
       * Explicit classification status.
       */

      status,

      /*
       * Metadata.
       */

      meta: {
        model:
          OPENAI_MODEL,

        documentsReceived,

        documentsSentToAI,

        documentTypeConfidence:
          result.documentTypeConfidence,

        documentTitleDetected:
          result.documentTitleDetected,

        nameDetected:
          result.nameDetected,

        classificationStatus:
          status,
      },

      /*
       * Keep the structured result available.
       */

      rawResult:
        rawOutput,
    });
  } catch (
    error
  ) {
    /*
     * ========================================================
     * ERROR HANDLING
     * ========================================================
     */

    console.error(
      "PROPERTY SURE AI DOCUMENT CLASSIFICATION ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "AI document classification failed.";

    return NextResponse.json(
      {
        success:
          false,

        error:
          message,
      },
      {
        status:
          500,
      }
    );
  }
}