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

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const OPENAI_MODEL =
  "gpt-5.6";

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

type DocumentType =
  (typeof VALID_DOCUMENT_TYPES)[number];

type ClassificationStatus =
  | "identified"
  | "uncertain";

/*
 * ============================================================
 * CLASSIFICATION RESULT
 * ============================================================
 */

type ClassificationResult = {
  documentType: DocumentType;

  documentTypeConfidence: number;

  documentTitleDetected: string;

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

  risk:
    | "very_low"
    | "low"
    | "medium"
    | "high"
    | "critical"
    | "unknown";

  summary: string;

  findings: {
    category: string;

    severity:
      | "info"
      | "low"
      | "medium"
      | "high"
      | "critical";

    title: string;

    description: string;

    evidence: string;
  }[];

  missingInformation: string[];

  verificationLimitations: string[];
};

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

/**
 * Normalize scores to 0–100.
 *
 * The AI is instructed to return 0–100.
 * This helper also protects the application if the model
 * returns something outside the expected range.
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

/**
 * Determine whether a MIME type is supported.
 */
function isAllowedMimeType(
  mimeType: string
): boolean {
  return (
    ALLOWED_MIME_TYPES.includes(
      mimeType as
        (typeof ALLOWED_MIME_TYPES)[number]
    )
  );
}

/**
 * Normalize MIME type.
 */
function normalizeMimeType(
  mimeType?: string
): string {
  return String(
    mimeType || ""
  )
    .trim()
    .toLowerCase();
}

/**
 * Determine MIME type from filename when the MIME type is
 * missing or unreliable.
 */
function inferMimeTypeFromName(
  fileName?: string
): string {
  const name =
    String(
      fileName || ""
    ).toLowerCase();

  if (
    name.endsWith(
      ".pdf"
    )
  ) {
    return "application/pdf";
  }

  if (
    name.endsWith(
      ".jpg"
    ) ||
    name.endsWith(
      ".jpeg"
    )
  ) {
    return "image/jpeg";
  }

  if (
    name.endsWith(
      ".png"
    )
  ) {
    return "image/png";
  }

  return "";
}

/**
 * Validate supported PropertySure AI document type.
 */
function isValidDocumentType(
  value: unknown
): value is DocumentType {
  return Boolean(
    value &&
      VALID_DOCUMENT_TYPES.includes(
        value as DocumentType
      )
  );
}

/**
 * Normalize a document type.
 */
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

  return "Other Property Document";
}

/**
 * Determine classification status from the AI result.
 */
function determineClassificationStatus(
  result: ClassificationResult
): ClassificationStatus {
  const hasValidType =
    isValidDocumentType(
      result.documentType
    );

  if (
    !hasValidType
  ) {
    return "uncertain";
  }

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

/**
 * Safely ensure an object exists.
 */
function ensureObject<
  T extends object
>(
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

/**
 * Safely ensure an array exists.
 */
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
 * PROPERTY DOCUMENT CLASSIFICATION INSTRUCTIONS
 * ============================================================
 */

const CLASSIFICATION_INSTRUCTIONS = `
You are PropertySure AI's property-document identification and
preliminary document-analysis engine.

Your PRIMARY TASK is to identify the ACTUAL TYPE of the supplied
property document.

You MUST inspect the actual document content.

Do NOT classify primarily from the filename.

The filename is only metadata and is NEVER sufficient evidence
for document classification.

============================================================
SUPPORTED DOCUMENT TYPES
============================================================

You may classify the document only as one of:

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
PRIMARY IDENTIFICATION RULE
============================================================

Look FIRST for the actual visible title, heading, caption,
certificate heading, government heading, legal heading, or
other unmistakable document identifier.

Examples:

If the document visibly says:

"CERTIFICATE OF OCCUPANCY"

classify it as:

"Certificate of Occupancy (C of O)"

If the document visibly says:

"DEED OF ASSIGNMENT"

classify it as:

"Deed of Assignment"

If the document visibly says:

"SURVEY PLAN"

classify it as:

"Survey Plan"

If the document visibly says:

"ALLOCATION LETTER"

classify it as:

"Allocation Letter"

If the document visibly says:

"GOVERNOR'S CONSENT"

classify it as:

"Governor's Consent"

If the document visibly says:

"POWER OF ATTORNEY"

classify it as:

"Power of Attorney"

If the document visibly says:

"RECEIPT"

"PAYMENT RECEIPT"

"RECEIPT FOR PAYMENT"

or similar property-payment wording,

classify it as:

"Receipt / Evidence of Payment"

If the document visibly contains a planning/building approval
heading or clearly represents development/planning approval,

classify it as:

"Building Approval / Planning Document"

============================================================
DO NOT RELY ON FILENAME
============================================================

The filename may be:

- a UUID
- a random identifier
- a camera filename
- a generated storage filename
- an abbreviated filename
- a timestamp
- or completely unrelated to the document.

For example:

"c74f2be3-ee7f-4d4f-a5c8-f4ee072a9802.jpeg"

does NOT tell you what the document is.

Ignore the filename when determining document type.

============================================================
VISUAL INSPECTION
============================================================

For IMAGE documents:

Inspect the entire image.

Look for:

- document headings
- large titles
- government insignia
- government names
- seals
- stamps
- certificate headings
- legal wording
- survey diagrams
- plot information
- block numbers
- survey numbers
- certificate numbers
- registration numbers
- parties
- property descriptions
- issuing authorities
- signatures
- dates
- handwritten annotations
- official references

For PDF documents:

Inspect the actual PDF content/pages.

Do not classify the PDF based only on its filename.

============================================================
DOCUMENT TYPE VS FIELD READABILITY
============================================================

This distinction is extremely important.

A document can have a clearly identifiable type even if some
individual fields are unreadable.

For example:

If the visible heading clearly says:

"DEED OF ASSIGNMENT"

then classify:

documentType:

"Deed of Assignment"

even if:

- names are blurry
- dates are unreadable
- some paragraphs cannot be read
- signatures are unclear
- some fields are missing

Do NOT downgrade the document to:

"Other Property Document"

merely because some fields cannot be read.

============================================================
WHEN TO USE OTHER PROPERTY DOCUMENT
============================================================

Use:

"Other Property Document"

ONLY when the actual document genuinely cannot be reliably
classified into one of the supported categories.

Examples:

- completely unreadable image
- severely cropped document
- insufficient visual evidence
- generic property correspondence
- document type genuinely outside the supported categories
- document where no reliable classification can be made

Do NOT use "Other Property Document" simply because one or
more individual fields are unreadable.

============================================================
DOCUMENT TITLE
============================================================

"documentTitleDetected" must contain the actual visible
document heading/title when one exists.

Examples:

"DEED OF ASSIGNMENT"

"CERTIFICATE OF OCCUPANCY"

"SURVEY PLAN"

"GOVERNOR'S CONSENT"

If there is no clearly visible title, return:

""

Do NOT invent a title.

============================================================
DOCUMENT TYPE CONFIDENCE
============================================================

documentTypeConfidence represents confidence in the DOCUMENT
TYPE ONLY.

It does NOT represent legal authenticity.

Use:

90–100:
The visible title/heading or unmistakable document structure
clearly identifies the document.

75–89:
Strong evidence identifies the document, although the title
may be partially obscured or the structure is somewhat unclear.

50–74:
There is reasonable evidence but meaningful uncertainty.

0–49:
The document cannot be reliably classified.

If the document title is clearly visible, confidence should
normally be at least 90.

============================================================
IMPORTANT: CLASSIFICATION CONFIDENCE IS NOT AUTHENTICITY
============================================================

A document can have:

documentTypeConfidence = 98

without being legally authentic.

Example:

A forged document may still visibly look like a Deed of
Assignment.

Therefore:

DO NOT interpret documentTypeConfidence as proof of authenticity.

============================================================
DO NOT INVENT INFORMATION
============================================================

Never invent:

- names
- certificate numbers
- registration numbers
- plot numbers
- block numbers
- survey numbers
- dates
- issuing authorities
- property locations
- signatures
- stamps
- government confirmation
- ownership
- legal validity

If information cannot be reliably read from the supplied
document, return an empty string or null where appropriate.

============================================================
TEXT EXTRACTION
============================================================

When readable, extract information exactly or as faithfully
as possible from the document.

Do not silently "correct" names.

Do not silently change numbers.

Do not guess missing characters.

If a field is partially readable, include only what can be
reasonably supported.

============================================================
PARTIES
============================================================

For legal documents:

grantor:
The party transferring/granting the interest, if visible.

grantee:
The party receiving the interest, if visible.

owner:
Use only when the document explicitly identifies an owner.

otherParties:
Include other clearly identified parties.

Do not infer ownership merely because a person appears in
the document.

============================================================
PROPERTY DETAILS
============================================================

Extract only visible information.

Possible information includes:

- location
- estate
- district
- local government
- state
- plot number
- block number
- survey number
- parcel number
- property description
- dimensions
- boundaries

Do not invent missing values.

============================================================
DATES
============================================================

Extract only dates that are visibly present.

Possible fields:

documentDate
executionDate
registrationDate

If a date cannot be identified confidently:

return an empty string.

============================================================
APPARENT SIGNATURE / STAMP ANALYSIS
============================================================

You are performing visual/document analysis only.

You are NOT a government authentication service.

You CANNOT legally certify:

- signature authenticity
- stamp authenticity
- seal authenticity
- government issuance
- title validity
- ownership
- registration validity
- legal enforceability

Therefore:

signatureValid:
Use true only when the supplied document visibly contains an
apparently valid signature/approval element that can reasonably
be assessed visually.

Use false only when there is clear visual evidence of an
obvious problem.

Otherwise use null.

stampValid:
Same principle.

noForgery:
This field is NOT a definitive forensic determination.

Use null unless the visual evidence supports a cautious
preliminary assessment.

Do NOT state that a document is legally genuine merely from
visual inspection.

============================================================
DATA CONSISTENCY
============================================================

dataConsistent should represent ONLY apparent consistency
within the supplied document.

For example:

- same property location repeated consistently
- same plot number repeated consistently
- same party names repeated consistently
- same certificate/reference number repeated consistently

This is NOT external verification.

Use null when there is insufficient evidence.

============================================================
DUPLICATE DETECTION
============================================================

You do NOT have access to PropertySure AI's complete historical
document database unless explicitly supplied.

Therefore duplicateDetected should normally be:

false

unless the supplied input itself clearly contains duplicate
content or duplicate references.

Do NOT claim that a document is unique across all PropertySure
AI users.

============================================================
OWNERSHIP VALIDITY
============================================================

Do NOT determine legal ownership merely from visual document
inspection.

Use null unless the supplied document itself provides enough
internal evidence for a limited preliminary assessment.

External land registry verification is required for actual
ownership confirmation.

============================================================
DOCUMENT COMPLETENESS
============================================================

documentComplete means apparent completeness of the supplied
document, NOT legal completeness.

If the document is visibly complete and contains its expected
major sections, it may be true.

If clearly incomplete, cropped, or missing major sections,
it may be false.

If uncertain, use null.

============================================================
TRUST SCORE
============================================================

trustScore is a PRELIMINARY DOCUMENT-QUALITY SCORE based on the
visible evidence available in the supplied document.

It is NOT a legal authenticity score.

It must not be presented as proof of title authenticity.

============================================================
OVERALL CONFIDENCE
============================================================

confidence represents confidence in the overall preliminary
analysis.

It must NOT be interpreted as legal certainty.

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

Risk should reflect apparent document-analysis concerns.

Do not assign high risk simply because a field is unreadable.

Do not assign critical risk unless there is a significant
visible concern.

============================================================
FINDINGS
============================================================

Findings should contain evidence-based observations.

Each finding must include:

category
severity
title
description
evidence

Do not invent evidence.

If there are no meaningful findings, return an empty array.

============================================================
MISSING INFORMATION
============================================================

List information that appears important but could not be read
or was not present.

Do not list every minor unreadable word.

============================================================
VERIFICATION LIMITATIONS
============================================================

Clearly state limitations such as:

- visual inspection only
- no government registry confirmation
- no independent ownership search
- no forensic signature examination
- no external title search
- no physical inspection

============================================================
CRITICAL OUTPUT RULE
============================================================

The MOST IMPORTANT fields for the Review page are:

documentType
documentTypeConfidence
documentTitleDetected

If the visible title clearly identifies the document, preserve
that classification even when other fields are uncertain.

Return only the requested structured JSON.
`;

/*
 * ============================================================
 * JSON SCHEMA
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
 * FILE UPLOAD TO OPENAI
 * ============================================================
 *
 * ReviewPage sends:
 *
 * FormData:
 *   file = File
 *
 * We upload that file server-side to OpenAI.
 *
 * This keeps OPENAI_API_KEY on the server.
 * ============================================================
 */

async function uploadFileToOpenAI(
  file: File
) {
  /*
   * Convert the Web File into an OpenAI-compatible file.
   *
   * `OpenAI.toFile` is used because this route runs in the
   * Next.js server environment.
   */

  const openAIFile =
    await OpenAI.toFile(
      file,
      file.name,
      {
        type:
          file.type ||
          "application/octet-stream",
      }
    );

  const uploaded =
    await openai.files.create({
      file:
        openAIFile,

      purpose:
        "user_data",
    });

  return uploaded;
}

/*
 * ============================================================
 * BUILD OPENAI DOCUMENT INPUT
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

  /*
   * Upload to OpenAI.
   */

  const uploadedFile =
    await uploadFileToOpenAI(
      file
    );

  /*
   * Images are supplied as input_image.
   *
   * PDFs are supplied as input_file.
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

Original filename:
${file.name}

IMPORTANT:
The filename is NOT evidence of the document type.

Inspect the actual image carefully.

Identify the actual property document type from the visible
document content.
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

  return [
    {
      type:
        "input_text",

      text: `
DOCUMENT ${documentNumber}

Original filename:
${file.name}

IMPORTANT:
The filename is NOT evidence of the document type.

Inspect the actual PDF content and pages.

Identify the actual property document type from the visible
document content.
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
 * BUILD LEGACY URL INPUT
 * ============================================================
 *
 * This keeps compatibility with the older JSON API format.
 * ============================================================
 */

function buildLegacyUrlInput(
  document: RequestDocument,
  documentNumber = 1
): any[] {
  const documentUrl =
    document.url;

  if (
    !documentUrl
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

  const filename =
    document.name ||
    `property-document-${documentNumber}`;

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

Original filename:
${filename}

The filename is NOT evidence of document type.

Inspect the actual image.
        `,
      },

      {
        type:
          "input_image",

        image_url:
          documentUrl,

        detail:
          "high",
      },
    ];
  }

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

Original filename:
${filename}

Inspect the actual PDF pages.
Do not classify it from the filename.
        `,
      },

      {
        type:
          "input_file",

        file_url:
          documentUrl,
      },
    ];
  }

  return [
    {
      type:
        "input_text",

      text: `
DOCUMENT ${documentNumber}

Original filename:
${filename}

Inspect the supplied file if readable.

Do not classify it from the filename.
      `,
    },

    {
      type:
        "input_file",

      file_url:
        documentUrl,
    },
  ];
}

/*
 * ============================================================
 * NORMALIZE AI RESULT
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
        location:
          "",
        plotNumber:
          "",
        blockNumber:
          "",
        surveyNumber:
          "",
        propertyDescription:
          "",
      }
    );

  /*
   * Parties
   */

  result.parties =
    ensureObject(
      result.parties,
      {
        grantor:
          "",
        grantee:
          "",
        owner:
          "",
        otherParties:
          [],
      }
    );

  result.parties.otherParties =
    ensureArray<string>(
      result.parties
        .otherParties
    );

  /*
   * Dates
   */

  result.dates =
    ensureObject(
      result.dates,
      {
        documentDate:
          "",
        executionDate:
          "",
        registrationDate:
          "",
      }
    );

  /*
   * Findings
   */

  result.findings =
    ensureArray(
      result.findings
    );

  /*
   * Missing information
   */

  result.missingInformation =
    ensureArray<string>(
      result.missingInformation
    );

  /*
   * Limitations
   */

  result.verificationLimitations =
    ensureArray<string>(
      result.verificationLimitations
    );

  /*
   * Risk fallback
   */

  const validRisks = [
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
   * IMPORTANT:
   *
   * Do not convert a clearly identified document into
   * "Other Property Document" merely because another field
   * is missing.
   */

  return result;
}

/*
 * ============================================================
 * CREATE CLASSIFICATION RESPONSE
 * ============================================================
 *
 * This is deliberately shaped to match the ReviewPage.
 *
 * ReviewPage expects:
 *
 * classification.documentType
 * classification.confidence
 * classification.status
 * classification.message
 * ============================================================
 */

function createClassificationResponse(
  result: ClassificationResult
) {
  const status =
    determineClassificationStatus(
      result
    );

  const documentType =
    result.documentType;

  let message =
    "";

  if (
    status ===
    "identified"
  ) {
    message =
      `${documentType} identified with ${result.documentTypeConfidence}% confidence.`;
  } else {
    message =
      "The document type could not be confidently identified.";
  }

  return {
    success:
      true,

    documentType,

    confidence:
      result.documentTypeConfidence,

    status,

    message,

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
     * 1. VALIDATE OPENAI CONFIGURATION
     * ========================================================
     */

    if (
      !process.env
        .OPENAI_API_KEY
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
     * 2. DETERMINE REQUEST TYPE
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
     * 3. CLASSIFICATION INSTRUCTIONS
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
     * This is the request format currently used by your
     * ReviewPage:
     *
     * const formData = new FormData();
     * formData.append("file", file);
     *
     * fetch("/api/classify-document", {
     *   method: "POST",
     *   body: formData
     * })
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

      /*
       * Support "files" too in case the frontend later sends
       * multiple documents under that name.
       */

      const additionalFiles =
        formData.getAll(
          "files"
        );

      const allFiles = [
        ...files,
        ...additionalFiles,
      ].filter(
        (value): value is File =>
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
       * Current ReviewPage sends ONE document at a time.
       *
       * We nevertheless support multiple files here so the
       * endpoint can evolve later.
       */

      for (
        let index = 0;
        index <
        allFiles.length;
        index++
      ) {
        const file =
          allFiles[index];

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
     *
     * This preserves the older API format.
     *
     * Supported:
     *
     * {
     *   documentText
     * }
     *
     * {
     *   document
     * }
     *
     * {
     *   documents
     * }
     *
     * {
     *   fileUrl,
     *   fileName,
     *   mimeType
     * }
     * ========================================================
     */

    else if (
      contentType.includes(
        "application/json"
      )
    ) {
      const body =
        (await request.json()) as RequestBody;

      /*
       * Normalize documents.
       */

      let documents:
        RequestDocument[] =
        [];

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

      if (
        documents.length ===
          0 &&
        body.document
      ) {
        documents = [
          body.document,
        ];
      }

      if (
        documents.length ===
          0 &&
        body.fileUrl
      ) {
        documents = [
          {
            url:
              body.fileUrl,

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
            } has no usable URL.`,
            {
              name:
                document.name,

              path:
                document.path,
            }
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
       * Legacy text support.
       */

      if (
        documentText
      ) {
        content.push({
          type:
            "input_text",

          text: `
LEGACY DOCUMENT TEXT

Use this text as supporting evidence.

Do not assume that this text is complete.

Do not classify solely from this text if an actual document
image/file is also available.

DOCUMENT TEXT:

${documentText}
          `,
        });
      }

      /*
       * Validate that something useful was supplied.
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
     * 6. UNSUPPORTED REQUEST TYPE
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
     * 7. OPENAI REQUEST
     * ========================================================
     */

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
     * 9. PARSE STRUCTURED OUTPUT
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

          rawResult:
            rawOutput,
        },
        {
          status:
            502,
        }
      );
    }

    /*
     * ========================================================
     * 10. NORMALIZE RESULT
     * ========================================================
     */

    result =
      normalizeClassificationResult(
        result
      );

    /*
     * ========================================================
     * 11. DETERMINE CLASSIFICATION STATUS
     * ========================================================
     */

    const status =
      determineClassificationStatus(
        result
      );

    /*
     * ========================================================
     * 12. CREATE FRONTEND-COMPATIBLE RESPONSE
     * ========================================================
     *
     * Your ReviewPage expects:
     *
     * result.documentType
     * result.confidence
     * result.status
     * result.message
     *
     * We therefore expose those fields at the top level.
     * ========================================================
     */

    const classificationResponse =
      createClassificationResponse(
        result
      );

    /*
     * ========================================================
     * 13. RETURN
     * ========================================================
     */

    return NextResponse.json({
      ...classificationResponse,

      /*
       * Explicit status is included again for clarity.
       */

      status,

      /*
       * Development / debugging metadata.
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

        classificationStatus:
          status,
      },

      /*
       * Keep the raw structured result during development.
       *
       * You can remove this later if you do not want to
       * return the complete duplicate JSON payload.
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

    /*
     * OpenAI/API errors can expose useful information through
     * message, but we keep the client-facing response concise.
     */

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