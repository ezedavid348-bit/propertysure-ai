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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Unable to get authenticated user:",
          userError,
        );

        setErrorMessage(
          "We could not verify your account. Please sign in again and try again.",
        );

        setSubmitting(false);
        return;
      }

      if (!user) {
        router.push("/signin");
        return;
      }

      const trimmedDocumentName =
        documentName.trim();

      const trimmedPropertyLocation =
        propertyLocation.trim();

      const trimmedDescription =
        description.trim();

      const trimmedContact =
        contact.trim();

      if (
        !trimmedDocumentName ||
        !trimmedPropertyLocation ||
        !issueType ||
        !trimmedDescription ||
        !trimmedContact
      ) {
        setErrorMessage(
          "Please complete all required fields before submitting your report.",
        );

        setSubmitting(false);
        return;
      }

      const { error: insertError } =
        await supabase
          .from("fraud_reports")
          .insert({
            user_id: user.id,
            document_name:
              trimmedDocumentName,
            property_location:
              trimmedPropertyLocation,
            issue_type: issueType,
            description:
              trimmedDescription,
            contact: trimmedContact,
            status: "pending",
          });

      if (insertError) {
        console.error(
          "Fraud report submission failed:",
          insertError,
        );

        setErrorMessage(
          "We could not submit your report right now. Please try again.",
        );

        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setSubmitting(false);
    } catch (error) {
      console.error(
        "Unexpected fraud report error:",
        error,
      );

      setErrorMessage(
        "Something went wrong while submitting your report. Please try again.",
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
            <button
              type="button"
              className={styles.backButton}
              onClick={() =>
                router.push("/fraud-watch")
              }
            >
              <span>←</span>
              Back to Fraud Watch
            </button>

            <section
              className={styles.successCard}
            >
              <div
                className={
                  styles.successIcon
                }
              >
                ✓
              </div>

              <div
                className={
                  styles.successContent
                }
              >
                <div
                  className={
                    styles.eyebrow
                  }
                >
                  REPORT RECEIVED
                </div>

                <h1>
                  Thank you for your
                  report
                </h1>

                <p>
                  Your suspicious-activity
                  report has been submitted
                  successfully. PropertySure
                  AI can use the information
                  provided to help identify
                  documents or activity that
                  may require further
                  attention.
                </p>

                <div
                  className={
                    styles.notice
                  }
                >
                  <div
                    className={
                      styles.noticeIcon
                    }
                  >
                    i
                  </div>

                  <div>
                    <strong>
                      Important
                    </strong>

                    <span>
                      A report is an alert
                      for further review. It
                      does not by itself
                      establish that a
                      property or document is
                      fraudulent.
                    </span>
                  </div>
                </div>

                <div
                  className={
                    styles.successActions
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.primaryButton
                    }
                    onClick={() =>
                      router.push(
                        "/fraud-watch",
                      )
                    }
                  >
                    <span>←</span>
                    Back to Fraud Watch
                  </button>

                  <button
                    type="button"
                    className={
                      styles.secondaryButton
                    }
                    onClick={resetForm}
                  >
                    Submit Another
                    Report
                    <span>→</span>
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
   *
   * IMPORTANT:
   * The old "Fraud Watch / Report Suspicious Activity"
   * hero card has intentionally been removed.
   * ============================================================
   */

  return (
    <AppShell activePath="/fraud-watch">
      <main className={styles.page}>
        <div className={styles.pageInner}>

          {/* ==================================================
              BACK NAVIGATION
              ================================================== */}

          <div
            className={styles.topBar}
          >
            <button
              type="button"
              className={styles.backButton}
              onClick={() =>
                router.push("/fraud-watch")
              }
            >
              <span>←</span>
              Back to Fraud Watch
            </button>
          </div>

          {/* ==================================================
              MAIN REPORT LAYOUT
              ================================================== */}

          <div className={styles.layout}>

            {/* =================================================
                REPORT DETAILS
                ================================================= */}

            <section
              className={styles.formCard}
            >
              <div
                className={
                  styles.cardHeader
                }
              >
                <div
                  className={
                    styles.cardHeaderTop
                  }
                >
                  <div
                    className={
                      styles.cardHeaderIcon
                    }
                  >
                    ⚑
                  </div>

                  <div>
                    <div
                      className={
                        styles.sectionEyebrow
                      }
                    >
                      REPORT DETAILS
                    </div>

                    <h1>
                      What would you
                      like to report?
                    </h1>

                    <p>
                      Provide the details
                      below so PropertySure
                      AI can understand the
                      suspicious document or
                      activity you observed.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.headerRule
                  }
                />
              </div>

              <form
                onSubmit={handleSubmit}
                className={styles.form}
              >

                {/* ===========================================
                    PROPERTY INFORMATION
                    =========================================== */}

                <div
                  className={
                    styles.formSection
                  }
                >
                  <div
                    className={
                      styles.formSectionHeading
                    }
                  >
                    <span>
                      01
                    </span>

                    <div>
                      <strong>
                        Property information
                      </strong>

                      <small>
                        Tell us which
                        property or
                        document is involved.
                      </small>
                    </div>
                  </div>

                  <div
                    className={
                      styles.fieldGrid
                    }
                  >
                    <label
                      className={
                        styles.field
                      }
                    >
                      <span>
                        Document or
                        property name
                        <b>*</b>
                      </span>

                      <div
                        className={
                          styles.inputWrap
                        }
                      >
                        <span
                          className={
                            styles.inputIcon
                          }
                        >
                          ▤
                        </span>

                        <input
                          value={
                            documentName
                          }
                          onChange={(
                            event,
                          ) =>
                            setDocumentName(
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="e.g. Certificate of Occupancy"
                          required
                          disabled={
                            submitting
                          }
                        />
                      </div>
                    </label>

                    <label
                      className={
                        styles.field
                      }
                    >
                      <span>
                        Property location
                        <b>*</b>
                      </span>

                      <div
                        className={
                          styles.inputWrap
                        }
                      >
                        <span
                          className={
                            styles.inputIcon
                          }
                        >
                          ⌖
                        </span>

                        <input
                          value={
                            propertyLocation
                          }
                          onChange={(
                            event,
                          ) =>
                            setPropertyLocation(
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="City, state or full property location"
                          required
                          disabled={
                            submitting
                          }
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {/* ===========================================
                    ISSUE INFORMATION
                    =========================================== */}

                <div
                  className={
                    styles.formSection
                  }
                >
                  <div
                    className={
                      styles.formSectionHeading
                    }
                  >
                    <span>
                      02
                    </span>

                    <div>
                      <strong>
                        Suspicious activity
                      </strong>

                      <small>
                        Identify the type
                        of concern you
                        observed.
                      </small>
                    </div>
                  </div>

                  <label
                    className={
                      styles.field
                    }
                  >
                    <span>
                      What appears
                      suspicious?
                      <b>*</b>
                    </span>

                    <div
                      className={
                        styles.selectWrap
                      }
                    >
                      <span
                        className={
                          styles.inputIcon
                        }
                      >
                        !
                      </span>

                      <select
                        value={
                          issueType
                        }
                        onChange={(
                          event,
                        ) =>
                          setIssueType(
                            event
                              .target
                              .value,
                          )
                        }
                        required
                        disabled={
                          submitting
                        }
                      >
                        <option value="">
                          Select an issue
                        </option>

                        <option value="possible-forgery">
                          Possible document
                          forgery
                        </option>

                        <option value="possible-manipulation">
                          Possible document
                          manipulation
                        </option>

                        <option value="information-mismatch">
                          Information does
                          not match
                        </option>

                        <option value="duplicate-document">
                          Possible duplicate
                          document
                        </option>

                        <option value="ownership-concern">
                          Ownership information
                          concern
                        </option>

                        <option value="suspicious-activity">
                          Other suspicious
                          activity
                        </option>
                      </select>
                    </div>
                  </label>

                  <label
                    className={
                      styles.field
                    }
                  >
                    <span>
                      Describe what you
                      noticed
                      <b>*</b>
                    </span>

                    <textarea
                      value={
                        description
                      }
                      onChange={(
                        event,
                      ) =>
                        setDescription(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="Explain what you noticed and why you believe it requires attention."
                      rows={7}
                      required
                      disabled={
                        submitting
                      }
                    />

                    <small>
                      Stick to facts you
                      observed. Do not include
                      passwords, banking PINs
                      or other sensitive
                      credentials.
                    </small>
                  </label>
                </div>

                {/* ===========================================
                    CONTACT
                    =========================================== */}

                <div
                  className={
                    styles.formSection
                  }
                >
                  <div
                    className={
                      styles.formSectionHeading
                    }
                  >
                    <span>
                      03
                    </span>

                    <div>
                      <strong>
                        Contact information
                      </strong>

                      <small>
                        Give us a way to
                        contact you if more
                        information is needed.
                      </small>
                    </div>
                  </div>

                  <label
                    className={
                      styles.field
                    }
                  >
                    <span>
                      Contact information
                      <b>*</b>
                    </span>

                    <div
                      className={
                        styles.inputWrap
                      }
                    >
                      <span
                        className={
                          styles.inputIcon
                        }
                      >
                        @
                      </span>

                      <input
                        value={contact}
                        onChange={(
                          event,
                        ) =>
                          setContact(
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="Email address or phone number"
                        required
                        disabled={
                          submitting
                        }
                      />
                    </div>

                    <small>
                      We will only use this
                      information if additional
                      clarification is required.
                    </small>
                  </label>
                </div>

                {/* ===========================================
                    BEFORE SUBMIT
                    =========================================== */}

                <div
                  className={
                    styles.infoBox
                  }
                >
                  <div
                    className={
                      styles.infoIcon
                    }
                  >
                    i
                  </div>

                  <div>
                    <strong>
                      Before you submit
                    </strong>

                    <p>
                      Only report information
                      you believe is accurate.
                      A suspicious-activity
                      report is an
                      early-warning signal and
                      is not a legal determination
                      of fraud.
                    </p>
                  </div>
                </div>

                {errorMessage && (
                  <div
                    className={
                      styles.errorMessage
                    }
                    role="alert"
                  >
                    <span>!</span>

                    <p>
                      {errorMessage}
                    </p>
                  </div>
                )}

                {/* ===========================================
                    ACTIONS
                    =========================================== */}

                <div
                  className={
                    styles.formActions
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.secondaryButton
                    }
                    onClick={() =>
                      router.push(
                        "/fraud-watch",
                      )
                    }
                    disabled={
                      submitting
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={
                      styles.primaryButton
                    }
                    disabled={
                      submitting
                    }
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Report"}

                    {!submitting && (
                      <span>→</span>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* =================================================
                RIGHT INFORMATION COLUMN
                ================================================= */}

            <aside
              className={
                styles.sideColumn
              }
            >

              {/* ===============================================
                  WHAT TO REPORT
                  =============================================== */}

              <section
                className={
                  styles.sideCard
                }
              >
                <div
                  className={
                    styles.sideCardTop
                  }
                >
                  <div
                    className={
                      styles.sideIcon
                    }
                  >
                    !
                  </div>

                  <div>
                    <div
                      className={
                        styles.sectionEyebrow
                      }
                    >
                      WHEN TO REPORT
                    </div>

                    <h2>
                      What should you
                      report?
                    </h2>
                  </div>
                </div>

                <div
                  className={
                    styles.sideDivider
                  }
                />

                <ul>
                  <li>
                    <span>✓</span>
                    <p>
                      Documents that appear
                      altered or manipulated.
                    </p>
                  </li>

                  <li>
                    <span>✓</span>
                    <p>
                      Information that
                      conflicts across
                      property documents.
                    </p>
                  </li>

                  <li>
                    <span>✓</span>
                    <p>
                      Possible duplicate or
                      suspicious property
                      documents.
                    </p>
                  </li>

                  <li>
                    <span>✓</span>
                    <p>
                      Other activity that
                      appears unusual or
                      misleading.
                    </p>
                  </li>
                </ul>
              </section>

              {/* ===============================================
                  IMPORTANT INFORMATION
                  =============================================== */}

              <section
                className={
                  styles.trustCard
                }
              >
                <div
                  className={
                    styles.trustCardHeader
                  }
                >
                  <div
                    className={
                      styles.trustIcon
                    }
                  >
                    ✓
                  </div>

                  <div>
                    <div
                      className={
                        styles.sectionEyebrow
                      }
                    >
                      GOOD TO KNOW
                    </div>

                    <h2>
                      Reporting is not a
                      fraud verdict
                    </h2>
                  </div>
                </div>

                <p>
                  PropertySure AI uses
                  reports as information that
                  may require further attention.
                  A report alone does not
                  establish ownership, government
                  authenticity or legal fraud.
                </p>

                <div
                  className={
                    styles.trustFooter
                  }
                >
                  <span>
                    PropertySure AI
                  </span>

                  <span>
                    Early-warning layer
                  </span>
                </div>
              </section>

              {/* ===============================================
                  PROCESS CARD
                  =============================================== */}

              <section
                className={
                  styles.processCard
                }
              >
                <div
                  className={
                    styles.sectionEyebrow
                  }
                >
                  AFTER YOU SUBMIT
                </div>

                <h2>
                  What happens next?
                </h2>

                <div
                  className={
                    styles.processSteps
                  }
                >
                  <div
                    className={
                      styles.processStep
                    }
                  >
                    <span>01</span>

                    <div>
                      <strong>
                        Report received
                      </strong>

                      <p>
                        Your information is
                        securely recorded for
                        review.
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      styles.processLine
                    }
                  />

                  <div
                    className={
                      styles.processStep
                    }
                  >
                    <span>02</span>

                    <div>
                      <strong>
                        Information reviewed
                      </strong>

                      <p>
                        The reported details
                        can be assessed for
                        further attention.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </AppShell>
  );
}