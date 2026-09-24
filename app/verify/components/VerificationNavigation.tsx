"use client";

import styles from "./VerificationNavigation.module.css";

type VerificationNavigationProps = {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  backLabel: string;
  backPath: string;
  disabled?: boolean;
};

const steps = [
  {
    number: 1,
    title: "Property Details",
    description: "Tell us about the property",
  },
  {
    number: 2,
    title: "Document Guide",
    description: "Recommended documents",
  },
  {
    number: 3,
    title: "Upload Documents",
    description: "Add your documents",
  },
  {
    number: 4,
    title: "Review Package",
    description: "Confirm your documents",
  },
  {
    number: 5,
    title: "Select Plan",
    description: "Choose your service",
  },
  {
    number: 6,
    title: "Secure Checkout",
    description: "Complete payment",
  },
  {
    number: 7,
    title: "Verification",
    description: "AI analysis and results",
  },
] as const;

export default function VerificationNavigation({
  currentStep,
  backLabel,
  backPath,
  disabled = false,
}: VerificationNavigationProps) {
  function handleBack(): void {
    if (disabled) {
      return;
    }

    window.location.href = backPath;
  }

  return (
    <>
      <button
        type="button"
        className={styles.backLink}
        disabled={disabled}
        onClick={handleBack}
      >
        <span>←</span>
        {backLabel}
      </button>

      <section className={styles.workflow}>
        {steps.map((step, index) => {
          const completed =
            step.number < currentStep;

          const active =
            step.number === currentStep;

          return (
            <div
              key={step.number}
              className={styles.workflowGroup}
            >
              <div
                className={`${styles.workflowStep} ${
                  active
                    ? styles.workflowActive
                    : ""
                } ${
                  completed
                    ? styles.workflowComplete
                    : ""
                }`}
              >
                <div
                  className={
                    styles.workflowNumber
                  }
                >
                  {completed
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
              </div>

              {index <
                steps.length - 1 && (
                <div
                  className={
                    styles.workflowLine
                  }
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </section>
    </>
  );
}