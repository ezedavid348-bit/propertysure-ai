"use client";

import styles from "./VerificationWorkflow.module.css";

type VerificationWorkflowProps = {
  activeStep: number;

  backHref?: string;
  backLabel?: string;

  continueHref?: string;
  continueLabel?: string;

  isContinuing?: boolean;
  continueDisabled?: boolean;

  showTopBack?: boolean;
  showBottomActions?: boolean;
  showSecurityNote?: boolean;
};

type WorkflowStep = {
  number: number;
  title: string;
  description: string;
  href: string;
};

const workflowSteps: WorkflowStep[] = [
  {
    number: 1,
    title: "Property Details",
    description: "Tell us about the property",
    href: "/verify/property-details",
  },
  {
    number: 2,
    title: "Document Guide",
    description: "Recommended documents",
    href: "/verify/document-guide",
  },
  {
    number: 3,
    title: "Upload Documents",
    description: "Add your documents",
    href: "/verify",
  },
  {
    number: 4,
    title: "Review Package",
    description: "Confirm your documents",
    href: "/verify/review",
  },
  {
    number: 5,
    title: "Select Plan",
    description: "Choose your service",
    href: "/verify/select-plan",
  },
  {
    number: 6,
    title: "Secure Checkout",
    description: "Complete payment",
    href: "/verify/checkout",
  },
  {
    number: 7,
    title: "Verification",
    description: "AI analysis and results",
    href: "/processing",
  },
];

export default function VerificationWorkflow({
  activeStep,
  backHref,
  backLabel = "Back to Property Details",
  continueHref,
  continueLabel = "Continue",
  isContinuing = false,
  continueDisabled = false,
  showTopBack = true,
  showBottomActions = true,
  showSecurityNote = true,
}: VerificationWorkflowProps) {
  function navigateTo(href: string) {
    window.location.href = href;
  }

  function handleBack() {
    if (!backHref) {
      return;
    }

    navigateTo(backHref);
  }

  function handleContinue() {
    if (
      !continueHref ||
      isContinuing ||
      continueDisabled
    ) {
      return;
    }

    navigateTo(continueHref);
  }

  function handleStepClick(step: WorkflowStep) {
    /*
     * Only completed steps are directly
     * clickable from the workflow.
     *
     * The current step and future steps
     * are not clickable.
     */
    if (step.number < activeStep) {
      navigateTo(step.href);
    }
  }

  return (
    <>
      {/* ==================================================
          TOP BACK LINK
      ================================================== */}

      {showTopBack && backHref && (
        <button
          type="button"
          className={styles.backLink}
          onClick={handleBack}
        >
          <span>←</span>

          {backLabel}
        </button>
      )}

      {/* ==================================================
          SEVEN-STEP VERIFICATION WORKFLOW
      ================================================== */}

      <section
        className={styles.workflowCard}
        aria-label="Verification progress"
      >
        {workflowSteps.map((step, index) => {
          const isComplete =
            step.number < activeStep;

          const isActive =
            step.number === activeStep;

          const stepClassName = [
            styles.workflowStep,
            isComplete
              ? styles.workflowComplete
              : "",
            isActive
              ? styles.workflowActive
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={step.number}
              className={stepClassName}
            >
              <button
                type="button"
                className={styles.workflowStepButton}
                onClick={() =>
                  handleStepClick(step)
                }
                disabled={!isComplete}
                aria-current={
                  isActive
                    ? "step"
                    : undefined
                }
                aria-label={`${step.number}. ${step.title}`}
              >
                <div
                  className={
                    styles.workflowNumber
                  }
                >
                  {isComplete
                    ? "✓"
                    : step.number}
                </div>

                <div>
                  <strong>
                    {step.title}
                  </strong>

                  <span>
                    {step.description}
                  </span>
                </div>
              </button>

              {index <
                workflowSteps.length - 1 && (
                <div
                  className={
                    styles.workflowLine
                  }
                />
              )}
            </div>
          );
        })}
      </section>

      {/* ==================================================
          BOTTOM ACTIONS
      ================================================== */}

      {showBottomActions && (
        <div className={styles.actions}>
          {backHref ? (
            <button
              type="button"
              className={styles.backButton}
              onClick={handleBack}
            >
              <span>←</span>

              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            className={
              styles.continueButton
            }
            onClick={handleContinue}
            disabled={
              isContinuing ||
              continueDisabled ||
              !continueHref
            }
          >
            <span>
              {isContinuing
                ? "Loading..."
                : continueLabel}
            </span>

            {!isContinuing && (
              <b>→</b>
            )}
          </button>
        </div>
      )}

      {/* ==================================================
          SECURITY NOTE
      ================================================== */}

      {showSecurityNote && (
        <div
          className={
            styles.securityNote
          }
        >
          <span>🔒</span>

          Your documents remain securely
          stored while your verification is
          being processed.
        </div>
      )}
    </>
  );
}