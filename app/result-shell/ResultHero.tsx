"use client";

import styles from "./result-shell.module.css";

export type ResultHeroData = {
  badge?: string;
  badgeIcon?: string;
  title: string;
  description: string;
  subtext?: string;
  verificationId: string | number;
  completedAt?: string;
  plan: string;
  documentsAnalyzed: number;
};

type Props = ResultHeroData;

export default function ResultHero({
  badge = "AI ASSESSMENT COMPLETE",
  badgeIcon = "✓",
  title,
  description,
  subtext = "Here is your property verification report.",
  verificationId,
  completedAt = "—",
  plan,
  documentsAnalyzed,
}: Props) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroWatermark} aria-hidden="true">
        <img
          src="/result-header-verification.png"
          alt=""
          className={styles.heroWatermarkImage}
        />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.completeBadge}>
          <span aria-hidden="true">{badgeIcon}</span>
          {badge}
        </div>

        <h1>{title}</h1>

        <p>{description}</p>

        {subtext ? (
          <p className={styles.heroSubtext}>{subtext}</p>
        ) : null}

        <div className={styles.heroMeta}>
          <div className={styles.heroMetaItem}>
            <span className={styles.metaIcon} aria-hidden="true">
              ◉
            </span>

            <div>
              <small>Verification ID</small>
              <strong>#{verificationId}</strong>
            </div>
          </div>

          <div className={styles.heroMetaItem}>
            <span className={styles.metaIcon} aria-hidden="true">
              ◫
            </span>

            <div>
              <small>Completed</small>
              <strong>{completedAt}</strong>
            </div>
          </div>

          <div className={styles.heroMetaItem}>
            <span className={styles.metaIcon} aria-hidden="true">
              ▣
            </span>

            <div>
              <small>Plan</small>
              <strong>{plan}</strong>
            </div>
          </div>

          <div className={styles.heroMetaItem}>
            <span className={styles.metaIcon} aria-hidden="true">
              ▱
            </span>

            <div>
              <small>Documents Analyzed</small>

              <strong>
                {documentsAnalyzed} document
                {documentsAnalyzed === 1 ? "" : "s"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}