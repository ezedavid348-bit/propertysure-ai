const { loadEnvConfig } = require("@next/env");
const { createClient } = require("@supabase/supabase-js");

loadEnvConfig(process.cwd());

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!url || !key || !openaiKey) {
    throw new Error("Required environment configuration is missing.");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: documents, error: documentError } = await supabase
    .from("ai_knowledge_documents")
    .select("id,title,content,approval_status,jurisdiction,source_type")
    .eq("title", "PSAI TEST 001 - Lagos C of O");

  if (documentError) throw new Error(documentError.message);

  if (!documents || documents.length !== 1) {
    throw new Error("Expected exactly one Lagos test document.");
  }

  const doc = documents[0];

  if (
    doc.approval_status !== "pending" ||
    doc.jurisdiction !== "Lagos" ||
    doc.source_type !== "synthetic_test" ||
    !doc.content?.trim()
  ) {
    throw new Error("Test document safety checks failed.");
  }

  const { count, error: countError } = await supabase
    .from("ai_knowledge_chunks")
    .select("id", { count: "exact", head: true })
    .eq("knowledge_document_id", doc.id);

  if (countError) throw new Error(countError.message);

  if (count !== 0) {
    console.log("Stopped: document already has chunks:", count);
    return;
  }

  console.log("Generating embedding for existing test document...");

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: doc.content.trim(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API returned HTTP ${response.status}`);
  }

  const result = await response.json();
  const embedding = result?.data?.[0]?.embedding;

  if (
    !Array.isArray(embedding) ||
    embedding.length !== 1536 ||
    !embedding.every(Number.isFinite)
  ) {
    throw new Error("Embedding dimensions or values are invalid.");
  }

  const { error: insertError } = await supabase
    .from("ai_knowledge_chunks")
    .insert({
      knowledge_document_id: doc.id,
      content: doc.content.trim(),
      chunk_index: 0,
      embedding,
      metadata: {
        jurisdiction: "Lagos",
        source_type: "synthetic_test",
        approval_status: "pending",
        verification_outcome: "unverified",
        knowledgeDocumentId: doc.id,
        chunkIndex: 0,
      },
    });

  if (insertError) throw new Error(insertError.message);

  console.log("SUCCESS: 1 knowledge chunk and 1 embedding saved.");
  console.log("Document approval status remains pending.");
}

main().catch((error) => {
  console.error("FAILED:", error.message);
  process.exitCode = 1;
});
