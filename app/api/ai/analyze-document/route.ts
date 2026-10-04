import { NextResponse } from "next/server";

import {
  calculateRiskScore,
  getVerificationRules,
  getDocumentPattern,
  searchKnowledge,
  type DocumentAnalysis,
  type DocumentClassification,
  type DocumentFinding,
  type ExtractedDocumentData,
  type KnowledgeReference,
} from "@/app/lib/ai";

import { buildAnalysisPrompt } from "@/app/lib/ai/prompts";

/**
 * ============================================================
 * PROPERTYsure AI
 * ANALYZE DOCUMENT API
 * ============================================================
 *
 * This is the main orchestration layer for document analysis.
 *
 * FLOW:
 *
 * document
 *    ↓
 * classification
 *    ↓
 * extraction
 *    ↓
 * document pattern
 *    ↓
 * verification rules
 *    ↓
 * SERVER-SIDE KNOWLEDGE RETRIEVAL
 *    ↓
 * approved reference knowledge
 *    ↓
 * AI analysis
 *    ↓
 * findings
 *    ↓
 * risk score
 *
 * IMPORTANT:
 *
 * The browser does NOT control the knowledge references used
 * by the AI.
 *
 * The server retrieves approved knowledge directly from the
 * PropertySure AI knowledge base.
 *
 * This protects the AI memory system from untrusted
 * client-supplied references.
 * ============================================================
 */

/**
 * ============================================================
 * OPENAI CONFIGURATION
 * ============================================================
 */

const OPENAI_MODEL =
  process.env.OPENAI_MODEL ||
  "gpt-4.1-mini";

/**
 * ============================================================
 * KNOWLEDGE RETRIEVAL CONFIGURATION
 * ============================================================
 */

const KNOWLEDGE_LIMIT = 10;

const KNOWLEDGE_MINIMUM_SIMILARITY = 0.5;

/**
 * Maximum amount of extracted text sent into the retrieval
 * query.
 *
 * This prevents an unusually large document from producing
 * an unnecessarily large embedding request.
 */
const MAX_RETRIEVAL_TEXT_LENGTH = 12000;

/**
 * ============================================================
 * OPENAI API KEY
 * ============================================================
 */

function getOpenAIKey(): string {
  const key =
    process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not configured.",
    );
  }

  return key;
}

/**
 * ============================================================
 * CLEAN JSON RESPONSE
 * ============================================================
 */

function cleanJsonResponse(
  value: string,
): string {
  return value
    .replace(
      /^```json\s*/i,
      "",
    )
    .replace(
      /^```\s*/i,
      "",
    )
    .replace(
      /\s*```$/i,
      "",
    )
    .trim();
}

/**
 * ============================================================
 * NORMALIZE SEVERITY
 * ============================================================
 */

function normalizeSeverity(
  value: unknown,
): DocumentFinding["severity"] {
  if (
    value === "critical" ||
    value === "high" ||
    value === "medium" ||
    value === "low" ||
    value === "info"
  ) {
    return value;
  }

  return "info";
}

/**
 * ============================================================
 * NORMALIZE CONFIDENCE
 * ============================================================
 *
 * Accepts:
 *
 * 0 - 1
 *
 * or:
 *
 * 0 - 100
 *
 * and always returns:
 *
 * 0 - 100
 * ============================================================
 */

function normalizeConfidence(
  value: unknown,
): number {
  const confidence =
    typeof value === "number"
      ? value
      : Number(value);

  if (
    !Number.isFinite(
      confidence,
    )
  ) {
    return 0;
  }

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
      Math.round(
        confidence,
      ),
    ),
  );
}

/**
 * ============================================================
 * NORMALIZE FINDINGS
 * ============================================================
 */

function normalizeFindings(
  value: unknown,
): DocumentFinding[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(
      (
        item,
      ): DocumentFinding | null => {
        if (
          !item ||
          typeof item !==
            "object"
        ) {
          return null;
        }

        const finding =
          item as Record<
            string,
            unknown
          >;

        const title =
          typeof finding.title ===
          "string"
            ? finding.title
            : "AI Finding";

        const description =
          typeof finding.description ===
          "string"
            ? finding.description
            : "";

        const category =
          typeof finding.category ===
          "string"
            ? finding.category
            : "general";

        const evidence =
          Array.isArray(
            finding.evidence,
          )
            ? finding.evidence.filter(
                (
                  item,
                ): item is string =>
                  typeof item ===
                  "string",
              )
            : undefined;

        return {
          category,

          title,

          description,

          severity:
            normalizeSeverity(
              finding.severity,
            ),

          confidence:
            normalizeConfidence(
              finding.confidence,
            ),

          evidence,
        };
      },
    )
    .filter(
      (
        finding,
      ): finding is DocumentFinding =>
        finding !== null,
    );
}

/**
 * ============================================================
 * BUILD KNOWLEDGE SEARCH INPUT
 * ============================================================
 *
 * Converts extracted document information into a search query.
 *
 * This is what allows PropertySure AI to ask:
 *
 * "What approved knowledge do we already have that is relevant
 * to this document?"
 * ============================================================
 */

function buildKnowledgeSearchInput(
  classification: DocumentClassification,
  extractedData: ExtractedDocumentData,
) {
  /**
   * Build useful keywords from known structured fields.
   */
  const keywords: string[] = [];

  const possibleKeywords = [
    extractedData.documentTitle,
    extractedData.issuingAuthority,
    extractedData.registrationAuthority,
    extractedData.documentNumber,
    extractedData.fileNumber,
    extractedData.surveyPlanNumber,
    extractedData.district,
    extractedData.location,
  ];

  for (
    const value of possibleKeywords
  ) {
    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      keywords.push(
        value.trim(),
      );
    }
  }

  /**
   * Add document-specific terms.
   */
  keywords.push(
    classification.documentType,
  );

  /**
   * Use the extracted raw text as additional semantic
   * retrieval context.
   */
  let text =
    typeof extractedData.rawText ===
    "string"
      ? extractedData.rawText.trim()
      : "";

  /**
   * Protect the embedding request from extremely large
   * documents.
   */
  if (
    text.length >
    MAX_RETRIEVAL_TEXT_LENGTH
  ) {
    text =
      text.slice(
        0,
        MAX_RETRIEVAL_TEXT_LENGTH,
      );
  }

  return {
    documentType:
      classification.documentType,

    text,

    keywords,
  };
}

/**
 * ============================================================
 * RETRIEVE APPROVED KNOWLEDGE
 * ============================================================
 *
 * This function performs the actual server-side memory lookup.
 *
 * IMPORTANT:
 *
 * We intentionally do NOT accept knowledge references from the
 * browser.
 *
 * The server retrieves them from the approved knowledge base.
 * ============================================================
 */

async function retrieveApprovedKnowledge(
  classification: DocumentClassification,
  extractedData: ExtractedDocumentData,
): Promise<KnowledgeReference[]> {
  const searchInput =
    buildKnowledgeSearchInput(
      classification,
      extractedData,
    );

  try {
    const references =
      await searchKnowledge(
        searchInput,
        {
          limit:
            KNOWLEDGE_LIMIT,

          minimumSimilarity:
            KNOWLEDGE_MINIMUM_SIMILARITY,
        },
      );

    return references;
  } catch (error) {
    console.error(
      "PropertySure AI knowledge retrieval error:",
      error,
    );

    /**
     * Knowledge retrieval failure should not silently
     * manufacture knowledge.
     *
     * Returning an empty reference set allows analysis to
     * continue while clearly recording that no references
     * were available.
     */
    return [];
  }
}

/**
 * ============================================================
 * RUN AI ANALYSIS
 * ============================================================
 */

async function runAIAnalysis(
  classification: DocumentClassification,

  extractedData: ExtractedDocumentData,

  knowledgeReferences: KnowledgeReference[],
): Promise<DocumentFinding[]> {
  /**
   * Get the verification rules for this document type.
   */
  const rules =
    getVerificationRules(
      classification.documentType,
    );

  /**
   * Build the final AI analysis prompt.
   *
   * The prompt now receives the knowledge references that
   * were retrieved server-side.
   */
  const prompt =
    buildAnalysisPrompt(
      classification,

      extractedData,

      rules,

      knowledgeReferences,

      [],
    );

  /**
   * Call OpenAI.
   */
  const response =
    await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${getOpenAIKey()}`,
        },

        body: JSON.stringify({
          model:
            OPENAI_MODEL,

          temperature: 0,

          messages: [
            {
              role: "system",

              content:
                "You are the PropertySure AI document analysis engine. Analyze property documents using the supplied verification rules and approved reference knowledge. Do not invent facts. Distinguish document evidence from reference information. Return valid JSON only.",
            },

            {
              role: "user",

              content:
                prompt,
            },
          ],

          response_format: {
            type: "json_object",
          },
        }),
      },
    );

  /**
   * OpenAI error.
   */
  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `OpenAI analysis request failed: ${response.status} ${errorText}`,
    );
  }

  /**
   * Parse response.
   */
  const data =
    await response.json();

  const content =
    data?.choices?.[0]
      ?.message?.content;

  if (!content) {
    throw new Error(
      "OpenAI returned no analysis result.",
    );
  }

  /**
   * Convert the model response into JSON.
   */
  const parsed =
    JSON.parse(
      cleanJsonResponse(
        content,
      ),
    );

  /**
   * Normalize the findings before they enter the
   * PropertySure AI risk engine.
   */
  return normalizeFindings(
    parsed.findings,
  );
}

/**
 * ============================================================
 * POST
 * ============================================================
 */

export async function POST(
  request: Request,
) {
  try {
    /**
     * Read request body.
     */
    const body =
      await request.json();

    /**
     * Classification is required.
     */
    const classification =
      body?.classification as
        | DocumentClassification
        | undefined;

    /**
     * Extracted document data is required.
     */
    const extractedData =
      body?.extractedData as
        | ExtractedDocumentData
        | undefined;

    /**
     * IMPORTANT:
     *
     * We intentionally ignore:
     *
     * body.knowledgeReferences
     *
     * because knowledge must be retrieved server-side from
     * the approved PropertySure AI knowledge base.
     */

    /**
     * Validate classification.
     */
    if (!classification) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Document classification is required.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * Validate extracted data.
     */
    if (!extractedData) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Extracted document data is required.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * ========================================================
     * DOCUMENT PATTERN
     * ========================================================
     */

    const pattern =
      getDocumentPattern(
        classification.documentType,
      );

    /**
     * ========================================================
     * VERIFICATION RULES
     * ========================================================
     */

    const rules =
      getVerificationRules(
        classification.documentType,
      );

    /**
     * ========================================================
     * KNOWLEDGE RETRIEVAL
     * ========================================================
     *
     * THIS IS THE IMPORTANT NEW STEP.
     *
     * The server searches the PropertySure AI memory system
     * before asking OpenAI to analyze the document.
     */
    const knowledgeReferences =
      await retrieveApprovedKnowledge(
        classification,

        extractedData,
      );

    /**
     * ========================================================
     * AI ANALYSIS
     * ========================================================
     */

    const findings =
      await runAIAnalysis(
        classification,

        extractedData,

        knowledgeReferences,
      );

    /**
     * ========================================================
     * RISK SCORING
     * ========================================================
     */

    const risk =
      calculateRiskScore(
        findings,
      );

    /**
     * ========================================================
     * FINAL DOCUMENT ANALYSIS
     * ========================================================
     */

    const result:
      DocumentAnalysis = {
      classification,

      extractedData,

      references:
        knowledgeReferences,

      findings,

      risk,

      status:
        "completed",
    };

    /**
     * ========================================================
     * RESPONSE
     * ========================================================
     */

    return NextResponse.json({
      success: true,

      result,

      metadata: {
        documentPattern:
          pattern?.name ??
          null,

        rulesApplied:
          rules.map(
            (rule) =>
              rule.id,
          ),

        referenceCount:
          knowledgeReferences.length,

        knowledgeRetrieved:
          knowledgeReferences.length >
          0,
      },
    });
  } catch (error) {
    console.error(
      "PropertySure AI analysis error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Document analysis failed.",
      },
      {
        status: 500,
      },
    );
  }
}