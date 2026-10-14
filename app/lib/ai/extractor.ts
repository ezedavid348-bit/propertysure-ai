import type {
  DocumentClassification,
  ExtractedDocumentData,
} from "./types";

import { buildExtractionPrompt } from "./prompts";

/**
 * ============================================================
 * PROPERTYSURE AI
 * DOCUMENT EXTRACTION LAYER
 * ============================================================
 *
 * Converts unstructured property document text into
 * structured property information.
 *
 * Supports:
 * - Document information
 * - Ownership information
 * - Property information
 * - Issuing authority
 * - Registration authority
 * - Nigerian state/FCT jurisdiction
 * - Local government area
 *
 * IMPORTANT:
 *
 * Extraction does NOT establish authenticity.
 *
 * Jurisdiction is a claim extracted from document
 * contents, not proof of official issuance.
 * ============================================================
 */

const OPENAI_MODEL =
  process.env.OPENAI_MODEL || "gpt-4.1-mini";

/**
 * Supported Nigerian jurisdictions.
 *
 * The type is derived directly from the
 * ExtractedDocumentData interface so that
 * the return value remains compatible.
 */
type NigerianJurisdiction =
  NonNullable<ExtractedDocumentData["jurisdiction"]>;

const NIGERIAN_JURISDICTIONS = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT",
] as const satisfies readonly NigerianJurisdiction[];

/**
 * ============================================================
 * OPENAI CONFIGURATION
 * ============================================================
 */

function getOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not configured.",
    );
  }

  return key;
}

/**
 * ============================================================
 * JSON CLEANUP
 * ============================================================
 */

function cleanJsonResponse(
  value: string,
): string {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/**
 * ============================================================
 * SAFE STRING EXTRACTION
 * ============================================================
 */

function optionalString(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const cleaned = value.trim();

  return cleaned || undefined;
}

/**
 * ============================================================
 * JURISDICTION NORMALIZATION
 * ============================================================
 *
 * Converts supported jurisdiction names into
 * canonical Nigerian state/FCT values.
 *
 * Examples:
 *
 * "Lagos State" -> "Lagos"
 * "Rivers State" -> "Rivers"
 * "Federal Capital Territory" -> "FCT"
 *
 * Unknown values -> null
 *
 * Does not infer jurisdiction from property addresses.
 * ============================================================
 */

function normalizeJurisdiction(
  value: unknown,
): NigerianJurisdiction | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ");

  if (!cleaned) {
    return null;
  }

  if (
    cleaned === "fct" ||
    cleaned === "f c t" ||
    cleaned === "federal capital territory" ||
    cleaned === "federal capital territory abuja" ||
    cleaned === "abuja"
  ) {
    return "FCT";
  }

  const withoutStateSuffix = cleaned.replace(
    /\s+state$/,
    "",
  );

  for (const jurisdiction of NIGERIAN_JURISDICTIONS) {
    if (
      jurisdiction.toLowerCase() ===
      withoutStateSuffix
    ) {
      return jurisdiction;
    }
  }

  return null;
}

/**
 * ============================================================
 * SAFE ADDITIONAL FIELDS
 * ============================================================
 *
 * Ensures the AI returns only field values
 * supported by ExtractedDocumentData["fields"].
 *
 * Prevents arbitrary objects and arrays from
 * being passed into the structured extraction.
 * ============================================================
 */

function normalizeAdditionalFields(
  value: unknown,
): ExtractedDocumentData["fields"] {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return undefined;
  }

  const fields: NonNullable<
    ExtractedDocumentData["fields"]
  > = {};

  for (const [key, fieldValue] of Object.entries(value)) {
    if (
      typeof fieldValue === "string" ||
      typeof fieldValue === "number" ||
      typeof fieldValue === "boolean" ||
      fieldValue === null
    ) {
      fields[key] = fieldValue;
    }
  }

  return fields;
}

/**
 * ============================================================
 * EXTRACT DOCUMENT DATA
 * ============================================================
 */

export async function extractDocumentData(
  classification: DocumentClassification,
  extractedText: string,
): Promise<ExtractedDocumentData> {
  if (!extractedText.trim()) {
    throw new Error(
      "No document text was provided for extraction.",
    );
  }

  /**
   * Build the structured extraction prompt.
   */
  const prompt = buildExtractionPrompt(
    classification,
    extractedText,
  );

  /**
   * Send the document text to OpenAI.
   */
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getOpenAIKey()}`,
      },

      body: JSON.stringify({
        model: OPENAI_MODEL,

        temperature: 0,

        messages: [
          {
            role: "system",
            content:
              "You are a structured Nigerian property-document extraction engine. Extract only information supported by the supplied document. Identify the issuing jurisdiction conservatively. Never infer jurisdiction from the filename or property location alone. Return valid JSON only.",
          },

          {
            role: "user",
            content: prompt,
          },
        ],

        response_format: {
          type: "json_object",
        },
      }),
    },
  );

  /**
   * Handle OpenAI request failures.
   */
  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenAI extraction request failed: ${response.status} ${errorText}`,
    );
  }

  /**
   * Read the model response.
   */
  const data = await response.json();

  const content =
    data?.choices?.[0]?.message?.content;

  if (
    !content ||
    typeof content !== "string"
  ) {
    throw new Error(
      "OpenAI returned no extraction result.",
    );
  }

  /**
   * Parse the JSON and build the extraction result.
   */
  try {
    const parsed: unknown = JSON.parse(
      cleanJsonResponse(content),
    );

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      throw new Error(
        "Invalid extraction response.",
      );
    }

    const result = parsed as Record<string, unknown>;

    /**
     * Jurisdiction must match a recognized
     * Nigerian state or FCT.
     */
    const jurisdiction = normalizeJurisdiction(
      result.jurisdiction,
    );

    /**
     * Preserve supported additional extracted fields.
     */
    const additionalFields = normalizeAdditionalFields(
      result.fields,
    );

    /**
     * Return structured extraction data.
     */
    return {
      /**
       * Preserve the already classified document type.
       *
       * Do not replace it with an unrestricted
       * string returned by OpenAI.
       */
      documentType: classification.documentType,

      documentTitle:
        optionalString(result.documentTitle),

      ownerName:
        optionalString(result.ownerName),

      propertyAddress:
        optionalString(result.propertyAddress),

      propertyDescription:
        optionalString(result.propertyDescription),

      documentNumber:
        optionalString(result.documentNumber),

      plotNumber:
        optionalString(result.plotNumber),

      blockNumber:
        optionalString(result.blockNumber),

      district:
        optionalString(result.district),

      location:
        optionalString(result.location),

      issueDate:
        optionalString(result.issueDate),

      executionDate:
        optionalString(result.executionDate),

      surveyPlanNumber:
        optionalString(result.surveyPlanNumber),

      fileNumber:
        optionalString(result.fileNumber),

      issuingAuthority:
        optionalString(result.issuingAuthority),

      registrationAuthority:
        optionalString(result.registrationAuthority),

      /**
       * Jurisdiction-aware RAG fields.
       */
      jurisdiction,

      localGovernmentArea:
        optionalString(result.localGovernmentArea) ??
        null,

      /**
       * Original document text.
       */
      rawText: extractedText,

      /**
       * Additional extracted properties.
       */
      fields: additionalFields,
    };
  } catch {
    throw new Error(
      "The AI returned an invalid structured extraction result.",
    );
  }
}