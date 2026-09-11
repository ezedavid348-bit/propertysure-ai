"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();

  const [message, setMessage] = useState(
    "Confirming your payment...",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const reference =
      searchParams.get("reference") ||
      searchParams.get("trxref");

    if (!reference) {
      setError("Payment reference was not provided.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `/api/payments/paystack/verify?reference=${encodeURIComponent(
            reference,
          )}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to confirm payment.",
          );
        }

        setMessage("Payment confirmed. Starting verification...");

        // Essential is our first complete end-to-end workflow.
        window.location.href =
          `/processing?id=${encodeURIComponent(
            data.verificationId,
          )}`;
      } catch (err) {
        console.error("Payment callback error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to confirm your payment.",
        );
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "linear-gradient(135deg, #07111f 0%, #0b1728 100%)",
        color: "#ffffff",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "520px" }}>
        {!error ? (
          <>
            <div
              style={{
                width: "52px",
                height: "52px",
                margin: "0 auto 24px",
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.2)",
                borderTopColor: "#ffffff",
                animation: "spin 1s linear infinite",
              }}
            />

            <h1
              style={{
                marginBottom: "12px",
                fontSize: "28px",
              }}
            >
              Payment Confirmed
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "16px",
              }}
            >
              {message}
            </p>
          </>
        ) : (
          <>
            <h1
              style={{
                marginBottom: "12px",
                fontSize: "28px",
              }}
            >
              Payment Verification Issue
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "16px",
                lineHeight: 1.6,
              }}
            >
              {error}
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}