"use client";

import type { ReactNode } from "react";

import AppShell from "../AppShell/AppShell";

import ResultHero, {
  type ResultHeroData,
} from "./ResultHero";

import ResultLocation, {
  type ResultLocationData,
} from "./ResultLocation";

import ResultMetrics, {
  type ResultMetric,
} from "./ResultMetrics";

import ResultTabs, {
  type ResultTab,
} from "./ResultTabs";

import styles from "./result-shell.module.css";

export type ResultShellProps = {
  hero: ResultHeroData;

  metrics: ResultMetric[];

  tabs: ResultTab[];

  activeTab: string;

  onTabChange: (tabId: string) => void;

  location?: ResultLocationData;

  children: ReactNode;
};

export default function ResultShell({
  hero,
  metrics,
  tabs,
  activeTab,
  onTabChange,
  location,
  children,
}: ResultShellProps) {
  return (
    <AppShell activePath="/result">
      <main className={styles.resultShell}>
        <ResultHero {...hero} />

        <ResultMetrics metrics={metrics} />

        {location ? (
          <ResultLocation data={location} />
        ) : null}

        <ResultTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={onTabChange}
        />

        <section className={styles.shellContent}>
          {children}
        </section>
      </main>
    </AppShell>
  );
}