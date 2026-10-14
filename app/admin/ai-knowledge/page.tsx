"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type KnowledgeDocument = {
  id: string;
  title?: string | null;
  document_type?: string | null;
  source_type?: string | null;
  approval_status?: string | null;
  content?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
};

type Filter =
  | "all"
  | "pending"
  | "approved"
  | "rejected";

export default function AIKnowledgePage() {
  const [documents, setDocuments] = useState<
    KnowledgeDocument[]
  >([]);
  const [filter, setFilter] =
    useState<Filter>("all");
  const [loading, setLoading] =
    useState(true);
  const [approvingId, setApprovingId] =
    useState<string | null>(null);
  const [message, setMessage] =
    useState("");
  const [error, setError] =
    useState("");

  async function getAccessToken() {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (
      sessionError ||
      !session?.access_token
    ) {
      throw new Error(
        "Your admin session could not be verified. Please log in again.",
      );
    }

    return session.access_token;
  }

  async function loadKnowledge() {
    try {
      setLoading(true);
      setError("");

      const accessToken =
        await getAccessToken();

      const response = await fetch(
        "/api/admin/ai/knowledge",
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to load AI knowledge.",
        );
      }

      setDocuments(
        data.documents || [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load AI knowledge.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function approveKnowledge(
    id: string,
  ) {
    try {
      setApprovingId(id);
      setMessage("");
      setError("");

      const accessToken =
        await getAccessToken();

      const response = await fetch(
        `/api/admin/ai/knowledge/${id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to approve knowledge.",
        );
      }

      setMessage(
        "Knowledge approved and added to the AI knowledge base.",
      );

      await loadKnowledge();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to approve knowledge.",
      );
    } finally {
      setApprovingId(null);
    }
  }

  useEffect(() => {
    loadKnowledge();
  }, []);

  const filteredDocuments =
    filter === "all"
      ? documents
      : documents.filter(
          (document) =>
            document.approval_status ===
            filter,
        );

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#f7f8fa",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#666",
            }}
          >
            PropertySure AI
          </p>

          <h1
            style={{
              margin: "8px 0",
              fontSize: "32px",
            }}
          >
            AI Knowledge
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
            }}
          >
            Review and manage the
            knowledge used by
            PropertySure AI's
            verification engine.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          {(
            [
              ["all", "All"],
              ["pending", "Pending"],
              ["approved", "Approved"],
              ["rejected", "Rejected"],
            ] as const
          ).map(
            ([value, label]) => (
              <button
                key={value}
                onClick={() =>
                  setFilter(value)
                }
                style={{
                  padding:
                    "10px 16px",
                  borderRadius: "8px",
                  border:
                    "1px solid #ddd",
                  cursor: "pointer",
                  background:
                    filter === value
                      ? "#111"
                      : "#fff",
                  color:
                    filter === value
                      ? "#fff"
                      : "#111",
                }}
              >
                {label}
              </button>
            ),
          )}
        </div>

        {message && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px",
              borderRadius: "8px",
              background: "#eaf7ee",
              color: "#176b36",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px",
              borderRadius: "8px",
              background: "#fff0f0",
              color: "#a32020",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              padding: "40px",
              background: "#fff",
              borderRadius: "12px",
            }}
          >
            Loading AI knowledge...
          </div>
        ) : filteredDocuments.length ===
          0 ? (
          <div
            style={{
              padding: "40px",
              background: "#fff",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            No knowledge documents found.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            {filteredDocuments.map(
              (document) => (
                <article
                  key={document.id}
                  style={{
                    padding: "22px",
                    background: "#fff",
                    borderRadius: "12px",
                    border:
                      "1px solid #e5e5e5",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "20px",
                      alignItems:
                        "flex-start",
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          margin:
                            "0 0 8px",
                          fontSize:
                            "19px",
                        }}
                      >
                        {document.title ||
                          "Untitled knowledge document"}
                      </h2>

                      <p
                        style={{
                          margin:
                            "4px 0",
                          color:
                            "#666",
                        }}
                      >
                        Type:{" "}
                        {document.document_type ||
                          "Not specified"}
                      </p>

                      <p
                        style={{
                          margin:
                            "4px 0",
                          color:
                            "#666",
                        }}
                      >
                        Source:{" "}
                        {document.source_type ||
                          "Not specified"}
                      </p>

                      <p
                        style={{
                          margin:
                            "4px 0",
                          color:
                            "#666",
                        }}
                      >
                        Status:{" "}
                        {document.approval_status ||
                          "Unknown"}
                      </p>
                    </div>

                    {document.approval_status ===
                      "pending" && (
                      <button
                        onClick={() =>
                          approveKnowledge(
                            document.id,
                          )
                        }
                        disabled={
                          approvingId ===
                          document.id
                        }
                        style={{
                          padding:
                            "11px 18px",
                          border: "none",
                          borderRadius:
                            "8px",
                          background:
                            "#111",
                          color:
                            "#fff",
                          cursor:
                            approvingId ===
                            document.id
                              ? "wait"
                              : "pointer",
                          opacity:
                            approvingId ===
                            document.id
                              ? 0.6
                              : 1,
                        }}
                      >
                        {approvingId ===
                        document.id
                          ? "Approving..."
                          : "Approve"}
                      </button>
                    )}
                  </div>

                  {document.content && (
                    <div
                      style={{
                        marginTop:
                          "18px",
                        padding:
                          "15px",
                        background:
                          "#f7f7f7",
                        borderRadius:
                          "8px",
                        whiteSpace:
                          "pre-wrap",
                        fontSize:
                          "14px",
                        lineHeight:
                          1.6,
                        maxHeight:
                          "220px",
                        overflow:
                          "auto",
                      }}
                    >
                      {
                        document.content
                      }
                    </div>
                  )}
                </article>
              ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}
