import { NextResponse } from "next/server";

import {
  ingestKnowledgeDocument,
} from "@/app/lib/ai/knowledge-ingestion";

import {
  supabaseServer,
} from "@/app/lib/ai/supabase-server";

import {
  NIGERIAN_JURISDICTIONS,
  type KnowledgeSourceType,
  type KnowledgeVerificationOutcome,
  type NigerianJurisdiction,
  type PropertyDocumentType,
} from "@/app/lib/ai/types";

/**
 * ============================================================
 * PROPERTYSURE AI
 * KNOWLEDGE LEARNING API
 * ============================================================
 *
 * Only authenticated administrators may submit knowledge.
 *
 * Every submitted document enters the knowledge database
 * with approval_status = "pending".
 *
 * Knowledge approval is separate from verification outcome.
 *
 * A document can be:
 * - verified-legitimate
 * - confirmed-fraud
 * - unverified
 *
 * These labels must be supported by verification evidence.
 *
 * The AI must not automatically approve customer documents.
 * ============================================================
 */

const VALID_SOURCE_TYPES: KnowledgeSourceType[] = [
  "reference-document",
  "approved-example",
  "fraud-pattern",
  "verification-rule",
  "verified-case",
];

const VALID_DOCUMENT_TYPES: PropertyDocumentType[] = [
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
];

const VALID_VERIFICATION_OUTCOMES:
  KnowledgeVerificationOutcome[] = [
    "verified-legitimate",
    "confirmed-fraud",
    "unverified",
  ];

/**
 * ============================================================
 * NORMALIZE JURISDICTION
 * ============================================================
 *
 * Accept canonical state names and FCT.
 *
 * Also accepts case differences and common forms:
 * - "lagos" -> "Lagos"
 * - "Lagos State" -> "Lagos"
 * - "Abuja" -> "FCT"
 * - "Federal Capital Territory" -> "FCT"
 *
 * We do not infer a state from a city such as Port Harcourt
 * here. The issuing jurisdiction must be explicitly supplied
 * or established from verified document evidence.
 * ============================================================
 */

function normalizeJurisdiction(
  value: unknown,
): NigerianJurisdiction | null {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  const cleaned =
    value.trim().toLowerCase();

  if (
    cleaned === "abuja" ||
    cleaned === "fct" ||
    cleaned === "f.c.t." ||
    cleaned === "federal capital territory" ||
    cleaned === "federal capital territory abuja"
  ) {
    return "FCT";
  }

  const withoutStateSuffix =
    cleaned.replace(
      /\s+state$/,
      "",
    );

  const match =
    NIGERIAN_JURISDICTIONS.find(
      (jurisdiction) =>
        jurisdiction.toLowerCase() ===
        withoutStateSuffix,
    );

  return match ?? null;
}

/**
 * ============================================================
 * READ OPTIONAL TEXT
 * ============================================================
 */

function optionalText(
  value: unknown,
): string | undefined {
  return typeof value === "string"
    ? value.trim() || undefined
    : undefined;
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
     * STEP 1: Require bearer token.
     */

    const authorization =
      request.headers.get("authorization");

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    const accessToken =
      authorization.slice(7).trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    /**
     * STEP 2: Validate Supabase user.
     */

    const {
      data: { user },
      error: userError,
    } =
      await supabaseServer.auth.getUser(
        accessToken,
      );

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid authentication.",
        },
        {
          status: 401,
        },
      );
    }

    /**
     * STEP 3: Require admin role.
     */

    const {
      data: admin,
      error: adminError,
    } =
      await supabaseServer
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

    if (adminError) {
      console.error(
        "PropertySure AI admin verification error:",
        adminError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify administrator access.",
        },
        {
          status: 500,
        },
      );
    }

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access required.",
        },
        {
          status: 403,
        },
      );
    }

    /**
     * STEP 4: Read request body.
     */

    const body =
      await request.json();

    /**
     * STEP 5: Read existing fields.
     */

    const title =
      optionalText(body?.title) ?? "";

    const documentType =
      optionalText(body?.documentType) ?? "";

    const sourceType =
      optionalText(body?.sourceType) ?? "";

    const content =
      optionalText(body?.content) ?? "";

    const description =
      optionalText(body?.description);

    const sourcePath =
      optionalText(body?.sourcePath);

    const sourceUrl =
      optionalText(body?.sourceUrl);

    const metadata =
      body?.metadata &&
      typeof body.metadata === "object" &&
      !Array.isArray(body.metadata)
        ? body.metadata as Record<string, unknown>
        : undefined;

    const chunkSize =
      typeof body?.chunkSize === "number"
        ? body.chunkSize
        : undefined;

    const chunkOverlap =
      typeof body?.chunkOverlap === "number"
        ? body.chunkOverlap
        : undefined;

    /**
     * STEP 6: Read jurisdiction fields.
     */

    const jurisdictionInput =
      optionalText(body?.jurisdiction);

    const jurisdiction =
      normalizeJurisdiction(
        jurisdictionInput,
      );

    const localGovernmentArea =
      optionalText(
        body?.localGovernmentArea,
      );

    const issuingAuthority =
      optionalText(
        body?.issuingAuthority,
      );

    const documentYear =
      body?.documentYear == null
        ? undefined
        : body.documentYear;

    /**
     * STEP 7: Read verification fields.
     */

    const verificationOutcomeInput =
      optionalText(
        body?.verificationOutcome,
      ) ?? "unverified";

    const verificationEvidence =
      optionalText(
        body?.verificationEvidence,
      );

    /**
     * STEP 8: Validate required fields.
     */

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Knowledge document title is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !VALID_DOCUMENT_TYPES.includes(
        documentType as PropertyDocumentType,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid property document type is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !VALID_SOURCE_TYPES.includes(
        sourceType as KnowledgeSourceType,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid knowledge source type is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Knowledge document content is required.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * STEP 9: Validate jurisdiction.
     *
     * Do not silently discard an invalid jurisdiction.
     */

    if (
      jurisdictionInput &&
      !jurisdiction
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid jurisdiction. Provide one of Nigeria's 36 states or FCT.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * A Certificate of Occupancy requires a known
     * jurisdiction for jurisdiction-specific reference use.
     */

    if (
      documentType ===
        "certificate-of-occupancy" &&
      !jurisdiction
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Jurisdiction is required for a Certificate of Occupancy knowledge record.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * STEP 10: Validate document year.
     */

    if (
      documentYear !== undefined &&
      (
        typeof documentYear !== "number" ||
        !Number.isInteger(documentYear) ||
        documentYear < 1800 ||
        documentYear > 2200
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "documentYear must be a valid four-digit year.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * STEP 11: Validate verification outcome.
     */

    if (
      !VALID_VERIFICATION_OUTCOMES.includes(
        verificationOutcomeInput as
          KnowledgeVerificationOutcome,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid verification outcome.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      verificationOutcomeInput !==
        "unverified" &&
      !verificationEvidence
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Verification evidence is required for verified-legitimate or confirmed-fraud knowledge.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * STEP 12: Validate chunk settings.
     */

    if (
      chunkSize !== undefined &&
      (
        !Number.isInteger(chunkSize) ||
        chunkSize <= 0
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "chunkSize must be a positive integer.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      chunkOverlap !== undefined &&
      (
        !Number.isInteger(chunkOverlap) ||
        chunkOverlap < 0
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "chunkOverlap must be a non-negative integer.",
        },
        {
          status: 400,
        },
      );
    }

    const effectiveChunkSize =
      chunkSize ?? 1200;

    const effectiveChunkOverlap =
      chunkOverlap ?? 150;

    if (
      effectiveChunkOverlap >=
      effectiveChunkSize
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "chunkOverlap must be smaller than chunkSize.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * STEP 13: Ingest pending knowledge.
     *
     * The ingestion engine saves the parent record,
     * generates embeddings, and stores vector chunks.
     *
     * It does not approve the document.
     */

    const result =
      await ingestKnowledgeDocument({
        title,

        documentType:
          documentType as PropertyDocumentType,

        sourceType:
          sourceType as KnowledgeSourceType,

        content,

        description,

        sourcePath,

        sourceUrl,

        jurisdiction,

        localGovernmentArea,

        issuingAuthority,

        documentYear:
          documentYear as number | undefined,

        verificationOutcome:
          verificationOutcomeInput as
            KnowledgeVerificationOutcome,

        verificationEvidence,

        metadata,

        chunkSize,

        chunkOverlap,
      });

    /**
     * STEP 14: Return result.
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "Knowledge document ingested successfully and is awaiting approval.",

        knowledgeDocument:
          result.knowledgeDocument,

        chunkCount:
          result.chunkCount,

        embeddingCount:
          result.embeddingCount,

        approvalStatus:
          result.approvalStatus,

        requiresApproval:
          result.approvalStatus !== "approved",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "PropertySure AI knowledge learning error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Knowledge learning failed.",
      },
      {
        status: 500,
      },
    );
  }
}