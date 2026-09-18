"use client";

import styles from "./result-shell.module.css";

export type ResultMetricTone =
  | "green"
  | "blue"
  | "neutral"
  | "warning";

export type ResultMetric = {
  label: string;
  value: string | number;
  suffix?: string;
  description: string;
  icon: string;
  tone?: ResultMetricTone;
};

type Props = {
  metrics: ResultMetric[];
};

export default function ResultMetrics({ metrics }: Props) {
  return (
    <section
      className={styles.metricsGrid}
      aria-label="Result summary"
    >
      {metrics.map((metric, index) => {
        const tone =
          metric.tone ??
          (index % 2 === 0 ? "green" : "blue");

        const toneClass =
          tone === "green"
            ? styles.metricGreen
            : tone === "blue"
              ? styles.metricBlue
              : tone === "warning"
                ? styles.metricWarning
                : styles.metricNeutral;

        return (
          <article
            key={`${metric.label}-${index}`}
            className={`${styles.metricCard} ${toneClass}`}
          >
            <div
              className={styles.metricIcon}
              aria-hidden="true"
            >
              {metric.icon}
            </div>

            <div className={styles.metricBody}>
              <span>{metric.label}</span>

              <strong>
                {metric.value}

                {metric.suffix ? (
                  <small>{metric.suffix}</small>
                ) : null}
              </strong>

              <p>{metric.description}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}