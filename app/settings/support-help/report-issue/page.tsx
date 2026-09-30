"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../../AppShell/AppShell";
import LoadingScreen from "../../../AppShell/LoadingScreen";
import styles from "./report-issue.module.css";
import { supabase } from "../../../lib/supabase";

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "issue"
  | "document"
  | "check"
  | "shield";

function Icon({
  name,
  size = 22,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  if (name === "issue") {
    return (
      <span
        className={`${styles.icon} ${className}`}
        style={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.3 3.2 2.7 17a2 2 0 0 0 1.75 3h15.1a2 2 0 0 0 1.75-3L13.7 3.2a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      </span>
    );
  }

  if (name === "check") {
    return (
      <span
        className={`${styles.icon} ${className}`}
        style={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
      </span>
    );
  }

  if (name === "shield") {
    return (
      <span
        className={`${styles.icon} ${className}`}
        style={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={`${styles.icon} ${className}`}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h9l3 3v15H6V3Z" />
        <path d="M14 3v4h4" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    </span>
  );
}

/*
============================================================
ISSUE CATEGORIES
============================================================
*/

const issueCategories = [
  "Property Verification",
  "Fraud Watch",
  "Payment Problem",
  "Account Problem",
  "Technical / Website Problem",
  "Security Concern",
  "Report / History Problem",
  "Other",
];

/*
============================================================
AFFECTED FEATURES
============================================================
*/

const affectedFeatures = [
  "Property Verification",
  "Document Upload",
  "Verification Report",
  "Fraud Watch",
  "Properties",
  "Reports & History",
  "Payments & Subscriptions",
  "Account & Security",
  "Notifications",
  "Dashboard",
  "Other",
];

/*
============================================================
PAGE
============================================================
*/

export default function ReportIssuePage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [affectedFeature, setAffectedFeature] =
    useState("");

  const [priority, setPriority] = useState("Normal");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /*
  ============================================================
  LOAD USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        setLoadingUser(true);

        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error(
            "Could not load authenticated user:",
            error
          );
          return;
        }

        if (!authUser) {
          router.replace("/signin");
          return;
        }

        if (mounted) {
          const metadata = authUser.user_metadata ?? {};

          const name =
            metadata.full_name ||
            metadata.name ||
            "";

          setFullName(name);
          setEmail(authUser.email || "");
        }
      } catch (error) {
        console.error(
          "Report issue user loading error:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const backToSupportHelp = () => {
    router.push("/settings/support-help");
  };

  /*
  ============================================================
  SUBMIT ISSUE
  ============================================================
  */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !fullName.trim() ||
      !email.trim() ||
      !category ||
      !subject.trim() ||
      !description.trim()
    ) {
      return;
    }

    setSubmitting(true);

    /*
    ----------------------------------------------------------
    BACKEND CONNECTION
    ----------------------------------------------------------

    The form is currently prepared for the issue-reporting
    backend.

    When the Supabase issue/ticket table is ready, this is
    where the submitted report will be inserted.
    ----------------------------------------------------------
    */

    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    setSubmitting(false);
    setSubmitted(true);
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loadingUser) {
    return <LoadingScreen />;
  }

  /*
  ============================================================
  SUCCESS STATE
  ============================================================
  */

  if (submitted) {
    return (
      <AppShell
        activePath="/settings"
        headerPath="/settings"
      >
        <main className={styles.page}>
          <div className={styles.mainInner}>
            <button
              type="button"
              className={styles.backButton}
              onClick={backToSupportHelp}
            >
              <span
                className={styles.backArrow}
                aria-hidden="true"
              >
                ←
              </span>

              Back to Support & Help
            </button>

            <section className={styles.successCard}>
              <div className={styles.successIcon}>
                <Icon
                  name="check"
                  size={34}
                />
              </div>

              <span className={styles.successEyebrow}>
                REPORT RECEIVED
              </span>

              <h1>
                Thank you for reporting this issue.
              </h1>

              <p>
                Your report has been prepared for
                review. Our support team can
                investigate the issue and follow up
                with you through your registered
                account.
              </p>

              <div className={styles.successReference}>
                <Icon
                  name="document"
                  size={20}
                />

                <div>
                  <strong>
                    Issue category
                  </strong>

                  <span>{category}</span>
                </div>
              </div>

              <div className={styles.successActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={backToSupportHelp}
                >
                  Back to Support & Help
                </button>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setSubmitted(false);
                    setSubject("");
                    setDescription("");
                    setReference("");
                    setCategory("");
                    setAffectedFeature("");
                    setPriority("Normal");
                  }}
                >
                  Report Another Issue
                </button>
              </div>
            </section>
          </div>
        </main>
      </AppShell>
    );
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <AppShell
      activePath="/settings"
      headerPath="/settings"
    >
      <main className={styles.page}>
        <div className={styles.mainInner}>

          {/* ==================================================
              BACK BUTTON
          ================================================== */}

          <button
            type="button"
            className={styles.backButton}
            onClick={backToSupportHelp}
          >
            <span
              className={styles.backArrow}
              aria-hidden="true"
            >
              ←
            </span>

            Back to Support & Help
          </button>

          {/* ==================================================
              HERO
          ================================================== */}

          <section className={styles.heroCard}>
            <div className={styles.heroIcon}>
              <Icon
                name="issue"
                size={42}
              />
            </div>

            <span className={styles.eyebrow}>
              ISSUE REPORTING
            </span>

            <h1>Report an Issue</h1>

            <p>
              Something not working as expected?
              Tell us what happened and help us
              improve the PropertySure AI experience.
            </p>
          </section>

          {/* ==================================================
              FORM
          ================================================== */}

          <form
            className={styles.formCard}
            onSubmit={handleSubmit}
          >
            <div className={styles.formHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  ISSUE DETAILS
                </span>

                <h2>
                  Tell us what happened
                </h2>

                <p>
                  Give us enough information to
                  understand the problem and
                  investigate it properly.
                </p>
              </div>

              <div className={styles.issueBadge}>
                <Icon
                  name="document"
                  size={17}
                />
                Issue report
              </div>
            </div>

            {/* ==================================================
                PERSONAL INFORMATION
            ================================================== */}

            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>
                Your information
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="fullName">
                    Full name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="email">
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ==================================================
                ISSUE CATEGORY
            ================================================== */}

            <div className={styles.formSection}>
              <div className={styles.field}>
                <label htmlFor="category">
                  Issue category
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select an issue category
                  </option>

                  {issueCategories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="subject">
                    Subject
                  </label>

                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(event) =>
                      setSubject(event.target.value)
                    }
                    placeholder="Briefly describe the issue"
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="affectedFeature">
                    Affected feature
                  </label>

                  <select
                    id="affectedFeature"
                    value={affectedFeature}
                    onChange={(event) =>
                      setAffectedFeature(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select a feature
                    </option>

                    {affectedFeatures.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* ==================================================
                PRIORITY
            ================================================== */}

            <div className={styles.formSection}>
              <div className={styles.field}>
                <label>
                  Priority
                </label>

                <div className={styles.priorityGrid}>
                  {["Low", "Normal", "High"].map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        className={`${styles.priorityOption} ${
                          priority === item
                            ? styles.priorityActive
                            : ""
                        }`}
                        onClick={() =>
                          setPriority(item)
                        }
                      >
                        <span
                          className={`${styles.priorityDot} ${
                            priority === item
                              ? styles.priorityDotActive
                              : ""
                          }`}
                        />

                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <div className={styles.formSection}>
              <div className={styles.field}>
                <label htmlFor="description">
                  Describe the issue
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Tell us what happened, what you expected to happen, and what happened instead..."
                  rows={8}
                  required
                />

                <span
                  className={styles.fieldHint}
                >
                  If possible, include the steps
                  that caused the problem and any
                  relevant error message.
                </span>
              </div>
            </div>

            {/* ==================================================
                REFERENCE
            ================================================== */}

            <div className={styles.formSection}>
              <div className={styles.field}>
                <label htmlFor="reference">
                  Verification or report reference
                  <span className={styles.optional}>
                    Optional
                  </span>
                </label>

                <input
                  id="reference"
                  type="text"
                  value={reference}
                  onChange={(event) =>
                    setReference(
                      event.target.value
                    )
                  }
                  placeholder="e.g. verification ID or report reference"
                />

                <span
                  className={styles.fieldHint}
                >
                  Add a reference if the issue is
                  related to a specific verification,
                  payment, or report.
                </span>
              </div>
            </div>

            {/* ==================================================
                PRIVACY NOTE
            ================================================== */}

            <div className={styles.privacyNote}>
              <div className={styles.privacyIcon}>
                <Icon
                  name="shield"
                  size={19}
                />
              </div>

              <div>
                <strong>
                  Your information is protected
                </strong>

                <span>
                  Only provide information relevant
                  to your support request. Never
                  include passwords, authentication
                  codes, or other sensitive security
                  credentials.
                </span>
              </div>
            </div>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={backToSupportHelp}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={
                  submitting ||
                  !fullName.trim() ||
                  !email.trim() ||
                  !category ||
                  !subject.trim() ||
                  !description.trim()
                }
              >
                {submitting
                  ? "Preparing Report..."
                  : "Submit Issue Report"}

                {!submitting && (
                  <span aria-hidden="true">
                    →
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* ==================================================
              WHAT HAPPENS NEXT
          ================================================== */}

          <section className={styles.footerNote}>
            <div className={styles.footerIcon}>
              <Icon
                name="check"
                size={18}
              />
            </div>

            <div>
              <strong>
                What happens next?
              </strong>

              <p>
                Our support team will review the
                information you provide and use it
                to investigate the issue. If more
                information is required, we can
                follow up through your registered
                account.
              </p>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}