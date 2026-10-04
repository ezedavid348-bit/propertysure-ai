import type {
  DocumentClassification,
  ExtractedDocumentData,
} from "./types";
import { buildExtractionPrompt } from "./prompts";

/**
 * PropertySure AI
 * Document Extraction Layer
 *
 * This layer sends extracted document text to the AI and asks
 * it to convert unstructured text into structured property data.
 *
 * It does NOT decide whether a document is genuine.
 */

const OPENAI_MODEL =
  process.env.OPENAI_MODEL || "gpt-4.1-mini";

function getOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not configured.",
    );
  }

  return key;
}

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
 * Extract structured information from document text.
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

  const prompt = buildExtractionPrompt(
    classification,
    extractedText,
  );

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
              "You are a structured document extraction engine. Return valid JSON only.",
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

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenAI extraction request failed: ${response.status} ${errorText}`,
    );
  }

  const data = await response.json();

  const content =
    data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      "OpenAI returned no extraction result.",
    );
  }

  try {
    const parsed = JSON.parse(
      cleanJsonResponse(content),
    );

    return {
      documentType:
        parsed.documentType ||
        classification.documentType,

      documentTitle:
        parsed.documentTitle || undefined,

      ownerName:
        parsed.ownerName || undefined,

      propertyAddress:
        parsed.propertyAddress || undefined,

      propertyDescription:
        parsed.propertyDescription || undefined,

      documentNumber:
        parsed.documentNumber || undefined,

      plotNumber:
        parsed.plotNumber || undefined,

      blockNumber:
        parsed.blockNumber || undefined,

      district:
        parsed.district || undefined,

      location:
        parsed.location || undefined,

      issueDate:
        parsed.issueDate || undefined,

      executionDate:
        parsed.executionDate || undefined,

      surveyPlanNumber:
        parsed.surveyPlanNumber || undefined,

      fileNumber:
        parsed.fileNumber || undefined,

      issuingAuthority:
        parsed.issuingAuthority || undefined,

      registrationAuthority:
        parsed.registrationAuthority || undefined,

      rawText: extractedText,

      fields:
        parsed.fields &&
        typeof parsed.fields === "object"
          ? parsed.fields
          : undefined,
    };
  } catch {
    throw new Error(
      "The AI returned an invalid structured extraction result.",
    );
  }
}