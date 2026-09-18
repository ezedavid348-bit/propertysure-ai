"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../AppShell/AppShell";
import { supabase } from "../lib/supabase";
import styles from "./report-suspicious.module.css";

export default function ReportSuspiciousPage() {
  const router = useRouter();

  const [documentName, setDocumentName] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      /*
       * ============================================================
       * GET CURRENT AUTHENTICATED USER
       * ============================================================
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Unable to get authenticated user:", userError);

        setErrorMessage(
          "We could not verify your account. Please sign in again and try again."
        );

        setSubmitting(false);
        return;
      }

      if (!user) {
        router.push("/signin");
        return;
      }

      /*
       * ============================================================
       * VALIDATE REQUIRED INFORMATION
       * ============================================================
       */

      const trimmedDocumentName = documentName.trim();
      const trimmedPropertyLocation = propertyLocation.trim();
      const trimmedDescription = description.trim();
      const trimmedContact = contact.trim();

      if (
        !trimmedDocumentName ||
        !trimmedPropertyLocation ||
        !issueType ||
        !trimmedDescription ||
        !trimmedContact
      ) {
        setErrorMessage(
          "Please complete all required fields before submitting your report."
        );

        setSubmitting(false);
        return;
      }

      /*
       * ============================================================
       * SAVE REPORT TO SUPABASE
       * ============================================================
       *
       * The report is connected to the authenticated user through
       * user_id.
       *
       * Every new report starts as "pending".
       * ============================================================
       */

      const { error: insertError } = await supabase
        .from("fraud_reports")
        .insert({
          user_id: user.id,
          document_name: trimmedDocumentName,
          property_location: trimmedPropertyLocation,
          issue_type: issueType,
          description: trimmedDescription,
          contact: trimmedContact,
          status: "pending",
        });

      if (insertError) {
        console.error("Fraud report submission failed:", insertError);

        setErrorMessage(
          "We could not submit your report right now. Please try again."
        );

        setSubmitting(false);
        return;
      }

      /*
       * ============================================================
       * SUCCESS
       * ============================================================
       */

      setSubmitted(true);
      setSubmitting(false);
    } catch (error) {
      console.error("Unexpected fraud report error:", error);

      setErrorMessage(
        "Something went wrong while submitting your report. Please try again."
      );

      setSubmitting(false);
    }
  }

  function resetForm() {
    setSubmitted(false);
    setDocumentName("");
    setPropertyLocation("");
    setIssueType("");
    setDescription("");
    setContact("");
    setErrorMessage("");
    setSubmitting(false);
  }

  /*
   * ============================================================
   * SUCCESS SCREEN
   * ============================================================
   */

  if (submitted) {
    return (
      <AppShell activePath="/fraud-watch">
        <main className={styles.page}>
          <div className={styles.pageInner}>
            <section className={styles.successCard}>
              <div className={styles.successIcon}>✓</div>

              <div>
                <div className={styles.eyebrow}>REPORT RECEIVED</div>

                <h1>Thank you for your report</h1>

                <p>
                  Your suspicious-activity report has been submitted
                  successfully. PropertySure AI can use the information
                  provided to help identify documents or activity that may
                  require further attention.
                </p>

                <div className={styles.notice}>
                  <strong>Important</strong>

                  <span>
                    A report is an alert for further review. It does not by
                    itself establish that a property or document is fraudulent.
                  </span>
                </div>

                <div className={styles.successActions}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => router.push("/fraud-watch")}
                  >
                    <span>←</span>
                    Back to Fraud Watch
                  </button>

                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={resetForm}
                  >
                    Submit Another Report <span>→</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </AppShell>
    );
  }

  /*
   * ============================================================
   * REPORT FORM
   * ============================================================
   */

  return (
    <AppShell activePath="/fraud-watch">
      <main className={styles.page}>
        <div className={styles.pageInner}>
          <div className={styles.topBar}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => router.push("/fraud-watch")}
            >
              ← Back to Fraud Watch
            </button>
          </div>

          <section className={styles.hero}>
            <div className={styles.heroIcon}>⚑</div>

            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>FRAUD WATCH</div>

              <h1>Report Suspicious Activity</h1>

              <p>
                Tell us about a property document or activity that you believe
                requires attention. Provide as much accurate information as
                possible so the report can be properly reviewed.
              </p>
            </div>
          </section>

          <div className={styles.layout}>
            <section className={styles.formCard}>
              <div className={styles.cardHeader}>
                <div className={styles.sectionEyebrow}>
                  REPORT DETAILS
                </div>

                <h2>What would you like to report?</h2>

                <p>
                  This information helps PropertySure AI understand the
                  suspicious activity you are reporting.
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.fieldGrid}>
                  <label className={styles.field}>
                    <span>Document or property name</span>

                    <input
                      value={documentName}
                      onChange={(event) =>
                        setDocumentName(event.target.value)
                      }
                      placeholder="e.g. Certificate of Occupancy"
                      required
                      disabled={submitting}
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Property location</span>

                    <input
                      value={propertyLocation}
                      onChange={(event) =>
                        setPropertyLocation(event.target.value)
                      }
                      placeholder="City, state or full property location"
                      required
                      disabled={submitting}
                    />
                  </label>
                </div>

                <label className={styles.field}>
                  <span>What appears suspicious?</span>

                  <select
                    value={issueType}
                    onChange={(event) => setIssueType(event.target.value)}
                    required
                    disabled={submitting}
                  >
                    <option value="">Select an issue</option>

                    <option value="possible-forgery">
                      Possible document forgery
                    </option>

                    <option value="possible-manipulation">
                      Possible document manipulation
                    </option>

                    <option value="information-mismatch">
                      Information does not match
                    </option>

                    <option value="duplicate-document">
                      Possible duplicate document
                    </option>

                    <option value="ownership-concern">
                      Ownership information concern
                    </option>

                    <option value="suspicious-activity">
                      Other suspicious activity
                    </option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Describe what you noticed</span>

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Explain what you noticed and why you believe it requires attention."
                    rows={7}
                    required
                    disabled={submitting}
                  />

                  <small>
                    Stick to facts you observed. Do not include passwords,
                    banking PINs or other sensitive credentials.
                  </small>
                </label>

                <label className={styles.field}>
                  <span>Contact information</span>

                  <input
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    placeholder="Email address or phone number"
                    required
                    disabled={submitting}
                  />

                  <small>
                    Provide a way to contact you if additional information is
                    needed.
                  </small>
                </label>

                <div className={styles.infoBox}>
                  <div className={styles.infoIcon}>i</div>

                  <div>
                    <strong>Before you submit</strong>

                    <p>
                      Only report information you believe is accurate. A
                      suspicious-activity report is an early-warning signal and
                      is not a legal determination of fraud.
                    </p>
                  </div>
                </div>

                {errorMessage && (
                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "12px 14px",
                      border: "1px solid #f0caca",
                      borderRadius: "9px",
                      background: "#fff6f6",
                      color: "#b4232d",
                      fontSize: "12px",
                      lineHeight: 1.5,
                    }}
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                )}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => router.push("/fraud-watch")}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Report"}

                    {!submitting && <span>→</span>}
                  </button>
                </div>
              </form>
            </section>

            <aside className={styles.sideColumn}>
              <section className={styles.sideCard}>
                <div className={styles.sideIcon}>!</div>

                <div className={styles.sectionEyebrow}>
                  WHEN TO REPORT
                </div>

                <h2>What should you report?</h2>

                <ul>
                  <li>
                    Documents that appear altered or manipulated.
                  </li>

                  <li>
                    Information that conflicts across property documents.
                  </li>

                  <li>
                    Possible duplicate or suspicious property documents.
                  </li>

                  <li>
                    Other activity that appears unusual or misleading.
                  </li>
                </ul>
              </section>

              <section className={styles.sideCard}>
                <div className={styles.sectionEyebrow}>
                  GOOD TO KNOW
                </div>

                <h2>Reporting is not a fraud verdict</h2>

                <p>
                  PropertySure AI uses reports as information that may require
                  further attention. A report alone does not establish
                  ownership, government authenticity or legal fraud.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </AppShell>
  );
}