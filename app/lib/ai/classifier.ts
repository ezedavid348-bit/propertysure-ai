import type {
  DocumentClassification,
  PropertyDocumentType,
} from "./types";
import { buildClassificationPrompt } from "./prompts";

/**
 * PropertySure AI
 * Document Classification Engine
 *
 * Determines the most likely type of a property document.
 *
 * This is classification only.
 * It does not determine authenticity or legal validity.
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

function normalizeDocumentType(
  value: unknown,
): PropertyDocumentType {
  if (typeof value !== "string") {
    return "unknown";
  }

  const normalized = value
    .trim()
    .toLowerCase();

  const aliases: Record<
    string,
    PropertyDocumentType
  > = {
    "certificate of occupancy":
      "certificate-of-occupancy",

    "c of o":
      "certificate-of-occupancy",

    "coo":
      "certificate-of-occupancy",

    "deed of assignment":
      "deed-of-assignment",

    "survey plan":
      "survey-plan",

    "allocation letter":
      "allocation-letter",

    "governor's consent":
      "governors-consent",

    "governors consent":
      "governors-consent",

    "power of attorney":
      "power-of-attorney",

    "receipt":
      "receipt-payment",

    "evidence of payment":
      "receipt-payment",

    "receipt / evidence of payment":
      "receipt-payment",

    "building approval":
      "building-planning",

    "planning document":
      "building-planning",

    "building approval / planning document":
      "building-planning",

    other: "other",
  };

  return (
    aliases[normalized] ||
    ([
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
    ].includes(normalized)
      ? (normalized as PropertyDocumentType)
      : "unknown")
  );
}

function normalizeConfidence(
  value: unknown,
): number {
  const confidence =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(confidence)) {
    return 0;
  }

  /*
   * The classifier works with percentages from 0–100.
   */
  if (
    confidence >= 0 &&
    confidence <= 1
  ) {
    return Math.round(
      confidence * 100,
    );
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(confidence),
    ),
  );
}

/**
 * Classify a property document using its filename
 * and extracted text.
 */
export async function classifyDocument(
  input: {
    fileName: string;
    extractedText?: string;
  },
): Promise<DocumentClassification> {
  const prompt =
    buildClassificationPrompt(
      input.fileName,
      input.extractedText,
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
              "You are a document classification engine. Return valid JSON only.",
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
    const errorText =
      await response.text();

    throw new Error(
      `OpenAI classification request failed: ${response.status} ${errorText}`,
    );
  }

  const data =
    await response.json();

  const content =
    data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      "OpenAI returned no classification result.",
    );
  }

  try {
    const parsed = JSON.parse(
      cleanJsonResponse(content),
    );

    const documentType =
      normalizeDocumentType(
        parsed.documentType,
      );

    const confidence =
      normalizeConfidence(
        parsed.confidence,
      );

    let status:
      | "identified"
      | "uncertain"
      | "failed";

    if (
      documentType === "unknown"
    ) {
      status = "uncertain";
    } else if (
      confidence >= 75
    ) {
      status = "identified";
    } else {
      status = "uncertain";
    }

    return {
      documentType,

      confidence,

      status,

      message:
        typeof parsed.message ===
        "string"
          ? parsed.message
          : undefined,

      documentTitleDetected:
        typeof parsed.documentTitleDetected ===
        "string"
          ? parsed.documentTitleDetected
          : undefined,

      nameDetected:
        typeof parsed.nameDetected ===
        "string"
          ? parsed.nameDetected
          : undefined,

      reasoning:
        Array.isArray(
          parsed.reasoning,
        )
          ? parsed.reasoning.filter(
              (item: unknown) =>
                typeof item ===
                "string",
            )
          : undefined,
    };
  } catch {
    throw new Error(
      "The AI returned an invalid classification result.",
    );
  }
}