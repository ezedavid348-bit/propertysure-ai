/**
 * PropertySure AI
 * AI Intelligence Layer
 *
 * Central export point for the PropertySure AI engine.
 *
 * Other parts of the application can import AI functionality
 * from this file instead of importing individual modules one
 * by one.
 */

// ============================================================
// CORE TYPES
// ============================================================

export * from "./types";

// ============================================================
// DOCUMENT CLASSIFICATION
// ============================================================

export * from "./classifier";

// ============================================================
// DOCUMENT EXTRACTION
// ============================================================

export * from "./extractor";

// ============================================================
// EMBEDDINGS
// ============================================================

export * from "./embeddings";

// ============================================================
// KNOWLEDGE RETRIEVAL
// ============================================================

export * from "./retrieval";

// ============================================================
// KNOWLEDGE BASE
// ============================================================

export * from "./knowledge-base";

// ============================================================
// KNOWLEDGE INGESTION
// ============================================================
//
// Handles:
// - text chunking
// - embedding generation
// - knowledge document storage
// - knowledge chunk storage
// - pending knowledge creation
//
// New knowledge is NOT automatically trusted.
//

export * from "./knowledge-ingestion";

// ============================================================
// DOCUMENT PATTERNS
// ============================================================

export * from "./document-patterns";

// ============================================================
// VERIFICATION RULES
// ============================================================

export * from "./verification-rules";

// ============================================================
// RISK SCORING
// ============================================================

export * from "./risk-scoring";

// ============================================================
// PROMPT BUILDERS
// ============================================================

export * from "./prompts";