/**
 * PropertySure AI
 * Embeddings layer
 *
 * Converts text into numerical vectors that can later be used
 * for semantic search against the PropertySure AI knowledge base.
 *
 * The actual embedding provider is kept behind these functions
 * so it can be changed without rewriting the rest of the AI system.
 */

const DEFAULT_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ||
  "text-embedding-3-small";

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
 * Generate an embedding for one piece of text.
 */
export async function generateEmbedding(
  text: string,
): Promise<number[]> {
  const cleanedText = text.trim();

  if (!cleanedText) {
    throw new Error(
      "Cannot generate an embedding from empty text.",
    );
  }

  const response = await fetch(
    "https://api.openai.com/v1/embeddings",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getOpenAIKey()}`,
      },
      body: JSON.stringify({
        model: DEFAULT_EMBEDDING_MODEL,
        input: cleanedText,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenAI embedding request failed: ${response.status} ${errorText}`,
    );
  }

  const data = await response.json();

  const embedding = data?.data?.[0]?.embedding;

  if (!Array.isArray(embedding)) {
    throw new Error(
      "OpenAI returned an invalid embedding response.",
    );
  }

  return embedding;
}

/**
 * Generate embeddings for multiple text chunks.
 *
 * This will later be used when we ingest reference documents
 * into the PropertySure AI knowledge base.
 */
export async function generateEmbeddings(
  texts: string[],
): Promise<number[][]> {
  const cleanedTexts = texts
    .map((text) => text.trim())
    .filter(Boolean);

  if (cleanedTexts.length === 0) {
    return [];
  }

  const response = await fetch(
    "https://api.openai.com/v1/embeddings",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getOpenAIKey()}`,
      },
      body: JSON.stringify({
        model: DEFAULT_EMBEDDING_MODEL,
        input: cleanedTexts,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenAI embedding request failed: ${response.status} ${errorText}`,
    );
  }

  const data = await response.json();

  if (!Array.isArray(data?.data)) {
    throw new Error(
      "OpenAI returned an invalid embeddings response.",
    );
  }

  return data.data
    .sort(
      (
        a: { index?: number },
        b: { index?: number },
      ) => (a.index ?? 0) - (b.index ?? 0),
    )
    .map(
      (item: { embedding?: number[] }) =>
        item.embedding ?? [],
    );
}