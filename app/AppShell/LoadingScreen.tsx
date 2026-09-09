"use client";

import styles from "./AppShell.module.css";

export default function LoadingScreen() {
  return (
    <main className={styles.loadingPage}>
      <div className={styles.loadingBrand}>
        <span className={styles.loadingDiamond} />

        <span>
          PropertySure
          <strong> AI</strong>
        </span>
      </div>

      <div
        className={styles.loadingIndicator}
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
      </div>

      <p className={styles.loadingText}>
        Loading...
      </p>
    </main>
  );
}