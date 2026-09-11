import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/*
 * ============================================================
 * PROPERTYSURE AI — ESSENTIAL VERIFICATION ENGINE
 * ============================================================
 *
 * Essential performs AI-based assessment of the submitted
 * property document package.
 *
 * IMPORTANT:
 * Essential does NOT independently authenticate a document.
 *
 * It can assess:
 * - visible/document structure
 * - internal consistency
 * - apparent manipulation indicators
 * - visible signature/stamp characteristics
 * - package/document completeness
 * - suspicious or synthetic-document indicators
 *
 * It does NOT perform:
 * - Government registry searches
 * - Ownership confirmation from government records
 * - Physical inspection
 * - GPS boundary verification
 * - Lawyer/litigation review
 *
 * Those belong to Professional/Premium.
 *
 * AUTHENTICITY RULE:
 * A document that merely looks official MUST NOT be represented
 * as government-authenticated or legally genuine.
 * ============================================================
 */

type CheckValue = boolean | null;

type VerificationChecks = {
  documentStructure: CheckValue;
  dataConsistency: CheckValue;
  signatureValid: CheckValue;
  stampValid: CheckValue;
  noForgery: CheckValue;
  noDuplicate: CheckValue;
  documentCompleteness: CheckValue;
};

type DocumentAssessmentStatus =
  | "no_significant_issues_detected"
  | "attention_required"
  | "inconclusive";

type DocumentPackageItem = {
  name?: string;
  path?: string;
  type?: string;
  documentType?: string;
  documentTitleDetected?: string;
  nameDetected?: string;
};

type DocumentAIResult = {
  documentName: string;
  documentType: string;
  confidence: number;
  summary: string;
  assessmentStatus: DocumentAssessmentStatus;
  authenticityStatus: "not_independently_verified";
  checks: VerificationChecks;
  syntheticDocumentRisk?: "low" | "medium" | "high" | "inconclusive";
  manipulationIndicators?: string[];
};

type VerificationFindings = {
  document_package?: DocumentPackageItem[];
  document_count?: number;
  checks?: VerificationChecks;
  essential?: {
    plan: "essential";
    completed_at?: string;
    document_results?: DocumentAIResult[];
    summary?: string;

    /*
     * This is deliberately explicit so downstream UI/API logic
     * cannot mistake AI analysis for independent authentication.
     */
    authenticity_status?:
      "not_independently_verified";

    verification_scope?:
      "ai_document_assessment_only";
  };
  processing?: {
    stage?: string;
    progress?: number;
    message?: string;
  };
};

const STORAGE_BUCKET = "property-documents";

const EMPTY_CHECKS: VerificationChecks = {
  documentStructure: null,
  dataConsistency: null,
  signatureValid: null,
  stampValid: null,
  noForgery: null,
  noDuplicate: null,
  documentCompleteness: null,
};

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseSecret =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecret) {
    throw new Error(
      "Supabase server configuration is missing.",
    );
  }

  return createClient(
    supabaseUrl,
    supabaseSecret,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/*
 * ============================================================
 * NORMALIZE DOCUMENT MIME TYPE
 * ============================================================
 */

function normalizeMimeType(
  value: unknown,
  fileName?: string,
  fileType?: string,
): string {
  const rawValue =
    typeof value === "string"
      ? value.trim().toLowerCase()
      : "";

  const rawFileType =
    typeof fileType === "string"
      ? fileType.trim().toLowerCase()
      : "";

  const rawFileName =
    typeof fileName === "string"
      ? fileName.trim().toLowerCase()
      : "";

  if (
    rawValue === "application/pdf" ||
    rawFileType === "application/pdf"
  ) {
    return "application/pdf";
  }

  if (
    rawValue === "image/jpeg" ||
    rawFileType === "image/jpeg"
  ) {
    return "image/jpeg";
  }

  if (
    rawValue === "image/png" ||
    rawFileType === "image/png"
  ) {
    return "image/png";
  }

  if (
    rawValue === "jpeg" ||
    rawValue === "jpg" ||
    rawValue === ".jpeg" ||
    rawValue === ".jpg"
  ) {
    return "image/jpeg";
  }

  if (
    rawValue === "png" ||
    rawValue === ".png"
  ) {
    return "image/png";
  }

  if (
    rawValue === "pdf" ||
    rawValue === ".pdf"
  ) {
    return "application/pdf";
  }

  if (
    rawFileName.endsWith(".jpg") ||
    rawFileName.endsWith(".jpeg")
  ) {
    return "image/jpeg";
  }

  if (
    rawFileName.endsWith(".png")
  ) {
    return "image/png";
  }

  if (
    rawFileName.endsWith(".pdf")
  ) {
    return "application/pdf";
  }

  if (
    rawFileType.startsWith("image/")
  ) {
    return rawFileType;
  }

  if (rawFileType) {
    return rawFileType;
  }

  return "application/octet-stream";
}

/*
 * ============================================================
 * RESOLVE SUPABASE STORAGE PATH
 * ============================================================
 */

function resolveStoragePath(
  value: string,
): string {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  try {
    const url =
      new URL(trimmed);

    const marker =
      "/storage/v1/object/";

    const markerIndex =
      url.pathname.indexOf(
        marker,
      );

    if (
      markerIndex === -1
    ) {
      return trimmed;
    }

    const remainder =
      url.pathname.slice(
        markerIndex +
          marker.length,
      );

    const prefixes = [
      "public/",
      "authenticated/",
      "sign/",
      "download/",
    ];

    for (
      const prefix of prefixes
    ) {
      if (
        remainder.startsWith(
          prefix,
        )
      ) {
        return decodeURIComponent(
          remainder.slice(
            prefix.length,
          ),
        );
      }
    }

    return decodeURIComponent(
      remainder,
    );
  } catch {
    return trimmed;
  }
}

function normalizeCheckValue(
  value: unknown,
): CheckValue {
  if (value === true) {
    return true;
  }

  if (value === false) {
    return false;
  }

  if (
    typeof value === "string"
  ) {
    const normalized =
      value
        .trim()
        .toLowerCase();

    if (
      normalized === "passed" ||
      normalized === "pass" ||
      normalized === "true" ||
      normalized === "yes"
    ) {
      return true;
    }

    if (
      normalized === "failed" ||
      normalized === "fail" ||
      normalized === "false" ||
      normalized === "no"
    ) {
      return false;
    }
  }

  return null;
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.max(
    minimum,
    Math.min(
      maximum,
      value,
    ),
  );
}

function calculateTrustScore(
  checks: VerificationChecks,
) {
  const values =
    Object.values(
      checks,
    ).filter(
      (
        value,
      ): value is boolean =>
        value !== null,
    );

  if (
    values.length === 0
  ) {
    return 0;
  }

  const passed =
    values.filter(
      (value) =>
        value === true,
    ).length;

  const score =
    Math.round(
      (passed /
        values.length) *
        100,
    );

  return clamp(
    score,
    0,
    100,
  );
}

function calculateConfidence(
  documentResults: Array<{
    confidence?: number;
  }>,
) {
  const values =
    documentResults
      .map((item) =>
        Number(
          item.confidence,
        ),
      )
      .filter((value) =>
        Number.isFinite(
          value,
        ),
      );

  if (
    values.length === 0
  ) {
    return 0;
  }

  const average =
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) / values.length;

  return Math.round(
    clamp(
      average,
      0,
      100,
    ),
  );
}

function calculateRisk(
  trustScore: number,
  checks: VerificationChecks,
) {
  if (
    valuesContainFalse(
      checks,
    )
  ) {
    if (
      trustScore >= 80
    ) {
      return "medium";
    }

    return "high";
  }

  const values =
    Object.values(
      checks,
    );

  if (
    values.some(
      (value) =>
        value === null,
    )
  ) {
    if (
      trustScore >= 80
    ) {
      return "medium";
    }

    return "incomplete";
  }

  /*
   * Even a strong AI document assessment is not equivalent to
   * independent authenticity verification. Therefore Essential
   * should not assign "low" risk solely because the document
   * looks good.
   */
  if (
    trustScore >= 85
  ) {
    return "medium";
  }

  if (
    trustScore >= 60
  ) {
    return "medium";
  }

  return "high";
}

function valuesContainFalse(
  checks: VerificationChecks,
) {
  return Object.values(
    checks,
  ).some(
    (value) =>
      value === false,
  );
}

/*
 * ============================================================
 * DERIVE DOCUMENT ASSESSMENT
 * ============================================================
 *
 * This is deliberately NOT called "authenticity".
 *
 * A document may have no visible issues and still be fake.
 * ============================================================
 */

function deriveDocumentAssessment(
  checks: VerificationChecks,
): DocumentAssessmentStatus {
  const failedChecks =
    Object.values(
      checks,
    ).filter(
      (value) =>
        value === false,
    ).length;

  if (
    failedChecks > 0
  ) {
    return "attention_required";
  }

  const assessedChecks =
    Object.values(
      checks,
    ).filter(
      (value) =>
        value !== null,
    ).length;

  if (
    assessedChecks === 0
  ) {
    return "inconclusive";
  }

  /*
   * "No significant issues detected" means only that the AI
   * did not detect significant problems in the supplied content.
   * It never means "genuine".
   */
  return "no_significant_issues_detected";
}

/*
 * ============================================================
 * EXTRACT TEXT FROM OPENAI RESPONSES API RESPONSE
 * ============================================================
 */

function extractAIOutputText(
  payload: any,
): string {
  if (
    typeof payload?.output_text ===
      "string" &&
    payload.output_text.trim()
      .length > 0
  ) {
    return payload.output_text.trim();
  }

  const output =
    Array.isArray(
      payload?.output,
    )
      ? payload.output
      : [];

  const textParts: string[] = [];

  for (
    const outputItem of output
  ) {
    const content =
      Array.isArray(
        outputItem?.content,
      )
        ? outputItem.content
        : [];

    for (
      const contentItem of content
    ) {
      if (
        typeof contentItem?.text ===
        "string"
      ) {
        const text =
          contentItem.text.trim();

        if (text) {
          textParts.push(
            text,
          );
        }
      } else if (
        typeof contentItem?.text
          ?.value ===
        "string"
      ) {
        const text =
          contentItem.text.value.trim();

        if (text) {
          textParts.push(
            text,
          );
        }
      }
    }
  }

  return textParts
    .join("\n")
    .trim();
}

/*
 * ============================================================
 * EXTRACT JSON FROM AI RESPONSE
 * ============================================================
 */

function parseAIJson(
  outputText: string,
) {
  try {
    return JSON.parse(
      outputText,
    );
  } catch {
    const match =
      outputText.match(
        /\{[\s\S]*\}/,
      );

    if (!match) {
      throw new Error(
        "AI returned unreadable verification data.",
      );
    }

    return JSON.parse(
      match[0],
    );
  }
}

/*
 * ============================================================
 * NORMALIZE AI STRING ARRAY
 * ============================================================
 */

function normalizeStringArray(
  value: unknown,
): string[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return value
    .filter(
      (item) =>
        typeof item ===
        "string",
    )
    .map(
      (item) =>
        item.trim(),
    )
    .filter(
      (item) =>
        item.length > 0,
    )
    .slice(
      0,
      12,
    );
}

/*
 * ============================================================
 * NORMALIZE SYNTHETIC DOCUMENT RISK
 * ============================================================
 */

function normalizeSyntheticRisk(
  value: unknown,
):
  | "low"
  | "medium"
  | "high"
  | "inconclusive" {
  if (
    typeof value !==
    "string"
  ) {
    return "inconclusive";
  }

  const normalized =
    value
      .trim()
      .toLowerCase();

  if (
    normalized === "low" ||
    normalized === "medium" ||
    normalized === "high"
  ) {
    return normalized;
  }

  return "inconclusive";
}

/*
 * ============================================================
 * ANALYZE ONE DOCUMENT
 * ============================================================
 */

async function analyzeDocument(
  file: Blob,
  fileName: string,
  mimeType: string,
  documentType?: string,
) {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured.",
    );
  }

  const bytes =
    Buffer.from(
      await file.arrayBuffer(),
    );

  const base64 =
    bytes.toString(
      "base64",
    );

  const actualMimeType =
    normalizeMimeType(
      mimeType,
      fileName,
      file.type,
    );

  const dataUrl =
    `data:${actualMimeType};base64,${base64}`;

  const prompt = `
You are PropertySure AI's Essential property-document verification engine.

Analyze the ACTUAL CONTENT and visible appearance of the supplied Nigerian property document.

The filename is metadata only. Never use the filename as proof of authenticity or document identity.

Document type identified during package review:
${documentType || "Unknown"}

============================================================
CRITICAL AUTHENTICITY RULE
============================================================

A document can be professionally designed, visually convincing,
internally consistent, and still be completely fabricated.

Therefore:

- Do NOT conclude that the document is genuine merely because it looks official.
- Do NOT treat a government-looking logo, seal, stamp, signature, letterhead, numbering format, or layout as proof of issuance.
- Do NOT claim that a government authority issued the document unless independent government records were supplied and actually verified.
- Do NOT claim ownership is legally confirmed.
- Do NOT claim the document exists in a government registry.
- Do NOT claim litigation clearance.
- Do NOT claim physical inspection.
- Do NOT claim GPS/boundary confirmation.

Essential is an AI document assessment, NOT independent authentication.

============================================================
ADVERSARIAL / FRAUD ANALYSIS
============================================================

Actively inspect the supplied document for characteristics that
could indicate fabrication, editing, compositing, synthetic
generation, or suspicious reconstruction.

Look for, where visible and reasonably assessable:

- inconsistent fonts, typography, or text rendering
- inconsistent spacing or alignment
- pasted/composited text
- inconsistent image quality between document elements
- suspiciously clean or digitally reconstructed stamps/seals
- suspicious signature placement or rendering
- repeated visual elements
- inconsistent dates, numbers, names, plot references, locations,
  parcel identifiers, or other document data
- formatting that does not match the apparent document type
- altered or overwritten values
- unnatural borders, tables, logos, seals, or signatures
- suspicious document numbering patterns
- contradictory information within the document
- contradictory information between visible sections
- signs that an apparently official document may have been
  digitally fabricated or reconstructed

IMPORTANT:
Absence of visible manipulation is NOT proof of authenticity.

If there are suspicious indicators, explain them specifically in
the summary and return them in manipulationIndicators.

============================================================
CHECK DEFINITIONS
============================================================

1. documentStructure

Does the document have a coherent structure, expected sections,
headings, fields and formatting for its apparent document type?

2. dataConsistency

Are important names, dates, property references, locations, plot
numbers and other visible details internally consistent?

3. signatureValid

This does NOT mean legally authenticated.

Return true only if a visible signature/signature area is present
and there are reasonable document-level indicators supporting that
the signature section is properly presented.

If there is no visible signature or it cannot reasonably be
assessed, return null.

4. stampValid

This does NOT mean government-authenticated.

Return true only if visible stamps, seals or official markings are
present and their presentation is reasonably consistent with the
document.

If there is no visible stamp/seal or it cannot reasonably be
assessed, return null.

5. noForgery

This is specifically about visible/content-based indicators of
manipulation, alteration, fabrication, compositing, or suspicious
digital reconstruction.

Return true only when there is reasonable evidence that no
significant visible manipulation indicators are present.

Return false when there are meaningful suspicious indicators.

If the document quality prevents reasonable assessment, return null.

6. noDuplicate

Does this document appear internally duplicated or suspiciously
repeated?

7. documentCompleteness

Based only on the package information available to this request,
does the submitted package appear reasonably complete for the
documents actually provided?

Do not invent missing government records.

============================================================
CONFIDENCE
============================================================

"confidence" is the AI's confidence in the QUALITY OF ITS OWN
DOCUMENT ANALYSIS.

It is NOT:
- probability that the document is genuine
- probability that the document was issued by government
- probability that ownership is valid
- probability that the property is safe to buy

A visually convincing fake can receive high analysis confidence
if the AI is confident about what it sees. Do not convert
confidence into authenticity.

============================================================
REQUIRED JSON
============================================================

Return JSON only:

{
  "documentType": "string",
  "documentTitle": "string",
  "confidence": 0,
  "summary": "string",
  "syntheticDocumentRisk": "low",
  "manipulationIndicators": [],
  "checks": {
    "documentStructure": true,
    "dataConsistency": true,
    "signatureValid": null,
    "stampValid": null,
    "noForgery": true,
    "noDuplicate": true,
    "documentCompleteness": null
  }
}

Rules:
- confidence must be an integer from 0 to 100.
- syntheticDocumentRisk must be "low", "medium", "high", or "inconclusive".
- manipulationIndicators must be an array of concise strings.
- Do not invent facts that are not visible in the document.
- If an issue is visible, describe it specifically.
- Never state that the document is genuine merely because it appears authentic.
- Never state that government authenticity has been confirmed.
`;

  const content: Array<
    Record<string, unknown>
  > = [
    {
      type: "input_text",
      text: prompt,
    },
  ];

  if (
    actualMimeType ===
    "application/pdf"
  ) {
    content.push({
      type: "input_file",
      filename:
        fileName ||
        "property-document.pdf",
      file_data:
        dataUrl,
    });
  } else if (
    actualMimeType ===
    "image/jpeg"
  ) {
    content.push({
      type: "input_image",
      image_url:
        dataUrl,
      detail: "high",
    });
  } else if (
    actualMimeType ===
    "image/png"
  ) {
    content.push({
      type: "input_image",
      image_url:
        dataUrl,
      detail: "high",
    });
  } else {
    throw new Error(
      `Unsupported document type: ${mimeType}`,
    );
  }

  const model =
    process.env.OPENAI_DOCUMENT_MODEL ||
    "gpt-5.6";

  const openAIResponse =
    await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${apiKey}`,
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            model,
            input: [
              {
                role: "user",
                content,
              },
            ],
            max_output_tokens:
              2500,
          }),
        cache: "no-store",
      },
    );

  const payload =
    await openAIResponse.json();

  if (
    !openAIResponse.ok
  ) {
    console.error(
      "ESSENTIAL OPENAI ERROR:",
      payload,
    );

    throw new Error(
      payload?.error?.message ||
        "OpenAI verification analysis failed.",
    );
  }

  const outputText =
    extractAIOutputText(
      payload,
    );

  if (!outputText) {
    console.error(
      "ESSENTIAL AI EMPTY RESPONSE:",
      JSON.stringify(
        payload,
        null,
        2,
      ),
    );

    throw new Error(
      "AI returned no verification result.",
    );
  }

  console.log(
    "ESSENTIAL AI OUTPUT:",
    outputText,
  );

  const parsed =
    parseAIJson(
      outputText,
    );

  const checks: VerificationChecks = {
    documentStructure:
      normalizeCheckValue(
        parsed.checks
          ?.documentStructure,
      ),

    dataConsistency:
      normalizeCheckValue(
        parsed.checks
          ?.dataConsistency,
      ),

    signatureValid:
      normalizeCheckValue(
        parsed.checks
          ?.signatureValid,
      ),

    stampValid:
      normalizeCheckValue(
        parsed.checks
          ?.stampValid,
      ),

    noForgery:
      normalizeCheckValue(
        parsed.checks
          ?.noForgery,
      ),

    noDuplicate:
      normalizeCheckValue(
        parsed.checks
          ?.noDuplicate,
      ),

    documentCompleteness:
      normalizeCheckValue(
        parsed.checks
          ?.documentCompleteness,
      ),
  };

  const manipulationIndicators =
    normalizeStringArray(
      parsed.manipulationIndicators,
    );

  const syntheticDocumentRisk =
    normalizeSyntheticRisk(
      parsed.syntheticDocumentRisk,
    );

  /*
   * If the AI itself reports meaningful manipulation indicators,
   * do not allow the normalized result to be represented as clean.
   *
   * This is still not a legal authenticity determination.
   */
  if (
    manipulationIndicators.length >
      0 &&
    checks.noForgery !==
      false
  ) {
    checks.noForgery =
      false;
  }

  const assessmentStatus =
    deriveDocumentAssessment(
      checks,
    );

  let summary =
    String(
      parsed.summary ||
        "AI document assessment completed.",
    ).trim();

  /*
   * Make the scope explicit in every individual document result.
   */
  summary =
    `${summary} This is an AI document assessment only; authenticity has not been independently verified.`;

  return {
    documentType:
      String(
        parsed.documentType ||
          documentType ||
          "Other Property Document",
      ),

    documentTitle:
      String(
        parsed.documentTitle ||
          parsed.documentType ||
          documentType ||
          fileName ||
          "Property Document",
      ),

    confidence:
      clamp(
        Number(
          parsed.confidence,
        ) || 0,
        0,
        100,
      ),

    summary,

    assessmentStatus,

    /*
     * HARD RULE:
     * Essential never returns an independently authenticated
     * document.
     */
    authenticityStatus:
      "not_independently_verified" as const,

    checks,

    syntheticDocumentRisk,

    manipulationIndicators,
  };
}

/*
 * ============================================================
 * MERGE DOCUMENT RESULTS
 * ============================================================
 */

function mergeChecks(
  documentResults: Array<{
    checks: VerificationChecks;
  }>,
): VerificationChecks {
  if (
    documentResults.length ===
    0
  ) {
    return {
      ...EMPTY_CHECKS,
    };
  }

  const keys: Array<
    keyof VerificationChecks
  > = [
    "documentStructure",
    "dataConsistency",
    "signatureValid",
    "stampValid",
    "noForgery",
    "noDuplicate",
    "documentCompleteness",
  ];

  const merged = {
    ...EMPTY_CHECKS,
  };

  for (
    const key of keys
  ) {
    const values =
      documentResults
        .map(
          (result) =>
            result.checks[key],
        );

    if (
      values.some(
        (value) =>
          value === false,
      )
    ) {
      merged[key] =
        false;
      continue;
    }

    if (
      values.every(
        (value) =>
          value === true,
      )
    ) {
      merged[key] =
        true;
      continue;
    }

    merged[key] =
      null;
  }

  return merged;
}

/*
 * ============================================================
 * PACKAGE SUMMARY
 * ============================================================
 */

function buildPackageSummary(
  documentResults: DocumentAIResult[],
  checks: VerificationChecks,
) {
  const attentionCount =
    documentResults.filter(
      (result) =>
        result.assessmentStatus ===
        "attention_required",
    ).length;

  const inconclusiveCount =
    documentResults.filter(
      (result) =>
        result.assessmentStatus ===
        "inconclusive",
    ).length;

  const highSyntheticRiskCount =
    documentResults.filter(
      (result) =>
        result.syntheticDocumentRisk ===
        "high",
    ).length;

  const mediumSyntheticRiskCount =
    documentResults.filter(
      (result) =>
        result.syntheticDocumentRisk ===
        "medium",
    ).length;

  const failedChecks =
    Object.values(
      checks,
    ).filter(
      (value) =>
        value === false,
    ).length;

  if (
    highSyntheticRiskCount > 0
  ) {
    return `AI analysis identified a high synthetic/fabrication risk in ${highSyntheticRiskCount} document${highSyntheticRiskCount === 1 ? "" : "s"}. Further verification is required.`;
  }

  if (
    attentionCount > 0 ||
    failedChecks > 0
  ) {
    return `AI document assessment identified ${Math.max(attentionCount, 1)} document${Math.max(attentionCount, 1) === 1 ? "" : "s"} requiring attention. Independent authenticity verification has not been performed.`;
  }

  if (
    mediumSyntheticRiskCount > 0
  ) {
    return `AI analysis did not establish government authenticity and identified medium synthetic-document risk in ${mediumSyntheticRiskCount} document${mediumSyntheticRiskCount === 1 ? "" : "s"}. Further verification is recommended.`;
  }

  if (
    inconclusiveCount > 0
  ) {
    return `AI document assessment completed, but ${inconclusiveCount} document${inconclusiveCount === 1 ? "" : "s"} could not be conclusively assessed. Independent authenticity verification has not been performed.`;
  }

  return "AI document assessment found no significant visible issues in the submitted package. This does not establish that the documents are genuine or government-issued; independent authenticity verification has not been performed.";
}

/*
 * ============================================================
 * POST
 * ============================================================
 */

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const verificationId =
      String(
        body?.verificationId ||
          "",
      ).trim();

    if (
      !verificationId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Verification ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    /*
     * ----------------------------------------------------------
     * LOAD VERIFICATION
     * ----------------------------------------------------------
     */

    const {
      data: verification,
      error:
        verificationError,
    } =
      await supabaseAdmin
        .from(
          "verifications",
        )
        .select(
          "id,doc_name,file_url,doc_type,status,findings",
        )
        .eq(
          "id",
          verificationId,
        )
        .maybeSingle();

    if (
      verificationError
    ) {
      console.error(
        "ESSENTIAL VERIFICATION LOAD ERROR:",
        verificationError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Verification record could not be loaded.",
        },
        {
          status: 500,
        },
      );
    }

    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Verification record was not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * ----------------------------------------------------------
     * PAYMENT CHECK
     * ----------------------------------------------------------
     */

    const {
      data: payment,
      error:
        paymentError,
    } =
      await supabaseAdmin
        .from(
          "payments",
        )
        .select(
          "id,plan,status,amount,currency,provider",
        )
        .eq(
          "verification_id",
          verificationId,
        )
        .eq(
          "provider",
          "paystack",
        )
        .eq(
          "plan",
          "essential",
        )
        .eq(
          "status",
          "paid",
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          },
        )
        .limit(1)
        .maybeSingle();

    if (
      paymentError
    ) {
      console.error(
        "ESSENTIAL PAYMENT LOOKUP ERROR:",
        paymentError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment record could not be checked.",
        },
        {
          status: 500,
        },
      );
    }

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A confirmed Essential payment is required before verification can begin.",
        },
        {
          status: 402,
        },
      );
    }

    /*
     * ----------------------------------------------------------
     * DOCUMENT PACKAGE
     * ----------------------------------------------------------
     */

    const storedFindings =
      (
        verification.findings ||
        {}
      ) as VerificationFindings;

    let documentPackage =
      Array.isArray(
        storedFindings.document_package,
      )
        ? storedFindings.document_package
        : [];

    if (
      documentPackage.length ===
        0 &&
      verification.file_url
    ) {
      documentPackage = [
        {
          name:
            verification.doc_name ||
            "Property Document",

          path:
            verification.file_url,

          type:
            verification.doc_type ||
            "application/pdf",

          documentType:
            undefined,
        },
      ];
    }

    if (
      documentPackage.length ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No property documents were found for this verification.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ----------------------------------------------------------
     * MARK PROCESSING
     * ----------------------------------------------------------
     */

    await supabaseAdmin
      .from(
        "verifications",
      )
      .update({
        status:
          "processing",

        findings: {
          ...storedFindings,

          document_package:
            documentPackage,

          document_count:
            documentPackage.length,

          checks: {
            ...EMPTY_CHECKS,
          },

          processing: {
            stage:
              "structure",

            progress:
              22,

            message:
              "AI is analyzing your property documents.",
          },
        },
      })
      .eq(
        "id",
        verificationId,
      );

    /*
     * ----------------------------------------------------------
     * ANALYZE EVERY DOCUMENT
     * ----------------------------------------------------------
     */

    const documentResults:
      DocumentAIResult[] = [];

    for (
      let index = 0;
      index <
      documentPackage.length;
      index++
    ) {
      const document =
        documentPackage[index];

      if (
        !document.path
      ) {
        continue;
      }

      const progress =
        Math.round(
          25 +
            (index /
              documentPackage.length) *
              55,
        );

      await supabaseAdmin
        .from(
          "verifications",
        )
        .update({
          findings: {
            ...storedFindings,

            document_package:
              documentPackage,

            document_count:
              documentPackage.length,

            checks: {
              ...EMPTY_CHECKS,
            },

            processing: {
              stage:
                "authenticity",

              progress,

              message:
                `Analyzing document ${index + 1} of ${documentPackage.length}.`,
            },
          },
        })
        .eq(
          "id",
          verificationId,
        );

      const storagePath =
        resolveStoragePath(
          document.path,
        );

      if (
        !storagePath
      ) {
        throw new Error(
          `Could not determine the storage path for ${document.name || "property document"}.`,
        );
      }

      const {
        data: fileBlob,
        error:
          downloadError,
      } =
        await supabaseAdmin
          .storage
          .from(
            STORAGE_BUCKET,
          )
          .download(
            storagePath,
          );

      if (
        downloadError ||
        !fileBlob
      ) {
        throw new Error(
          `Could not retrieve ${document.name || "property document"} from secure storage.`,
        );
      }

      const actualDocumentMimeType =
        normalizeMimeType(
          document.type,
          document.name,
          fileBlob.type,
        );

      console.log(
        "ESSENTIAL DOCUMENT TYPE:",
        {
          name:
            document.name,

          storedType:
            document.type,

          blobType:
            fileBlob.type,

          normalizedType:
            actualDocumentMimeType,

          storagePath,
        },
      );

      const result =
        await analyzeDocument(
          fileBlob,

          document.name ||
            "property-document",

          actualDocumentMimeType,

          document.documentType,
        );

      documentResults.push({
        documentName:
          document.name ||
          "Property Document",

        documentType:
          result.documentType,

        confidence:
          result.confidence,

        summary:
          result.summary,

        assessmentStatus:
          result.assessmentStatus,

        authenticityStatus:
          "not_independently_verified",

        checks:
          result.checks,

        syntheticDocumentRisk:
          result.syntheticDocumentRisk,

        manipulationIndicators:
          result.manipulationIndicators,
      });
    }

    if (
      documentResults.length ===
      0
    ) {
      throw new Error(
        "No documents could be analyzed.",
      );
    }

    /*
     * ----------------------------------------------------------
     * MERGE RESULTS
     * ----------------------------------------------------------
     */

    const checks =
      mergeChecks(
        documentResults,
      );

    /*
     * Package completeness must reflect the actual document
     * results after all documents have been analyzed.
     */

    const completenessValues =
      documentResults.map(
        (result) =>
          result.checks
            .documentCompleteness,
      );

    if (
      completenessValues.length >
      0
    ) {
      if (
        completenessValues.every(
          (value) =>
            value === true,
        )
      ) {
        checks.documentCompleteness =
          true;
      } else if (
        completenessValues.some(
          (value) =>
            value === false,
        )
      ) {
        checks.documentCompleteness =
          false;
      } else {
        checks.documentCompleteness =
          null;
      }
    }

    const trustScore =
      calculateTrustScore(
        checks,
      );

    const confidence =
      calculateConfidence(
        documentResults,
      );

    const risk =
      calculateRisk(
        trustScore,
        checks,
      );

    /*
     * ----------------------------------------------------------
     * SUMMARY
     * ----------------------------------------------------------
     */

    const summary =
      buildPackageSummary(
        documentResults,
        checks,
      );

    /*
     * ----------------------------------------------------------
     * SAVE FINAL RESULT
     * ----------------------------------------------------------
     *
     * The explicit authenticity_status and verification_scope
     * fields are intentional. They create a hard downstream
     * distinction between AI assessment and independent
     * authentication.
     * ----------------------------------------------------------
     */

    const finalFindings:
      VerificationFindings = {
      ...storedFindings,

      document_package:
        documentPackage,

      document_count:
        documentPackage.length,

      checks,

      essential: {
        plan:
          "essential",

        completed_at:
          new Date().toISOString(),

        document_results:
          documentResults,

        summary,

        authenticity_status:
          "not_independently_verified",

        verification_scope:
          "ai_document_assessment_only",
      },

      processing: {
        stage:
          "complete",

        progress:
          100,

        message:
          "Essential AI document assessment completed.",
      },
    };

    const {
      error:
        updateError,
    } =
      await supabaseAdmin
        .from(
          "verifications",
        )
        .update({
          status:
            "processed",

          trust_score:
            trustScore,

          confidence:
            confidence,

          risk:
            risk,

          findings:
            finalFindings,
        })
        .eq(
          "id",
          verificationId,
        );

    if (
      updateError
    ) {
      console.error(
        "ESSENTIAL FINAL UPDATE ERROR:",
        updateError,
      );

      throw new Error(
        `Essential verification result could not be saved: ${updateError.message}`,
      );
    }

    return NextResponse.json({
      success: true,

      plan:
        "essential",

      verificationId,

      documentCount:
        documentPackage.length,

      trustScore,

      confidence,

      risk,

      checks,

      summary,

      /*
       * Explicitly expose scope to the Processing/Result layers.
       */
      authenticityStatus:
        "not_independently_verified",

      verificationScope:
        "ai_document_assessment_only",

      documentResults,
    });
  } catch (
    error
  ) {
    console.error(
      "ESSENTIAL VERIFICATION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Essential verification failed.",
      },
      {
        status: 500,
      },
    );
  }
}
