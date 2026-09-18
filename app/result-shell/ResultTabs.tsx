"use client";

import styles from "./result-shell.module.css";

export type ResultTab = {
  id: string;
  label: string;
  icon: string;
};

type Props = {
  tabs: ResultTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
};

export default function ResultTabs({
  tabs,
  activeTab,
  onChange,
}: Props) {
  return (
    <nav
      className={styles.tabs}
      aria-label="Verification result sections"
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={
              active ? styles.activeTab : undefined
            }
            aria-current={
              active ? "page" : undefined
            }
            onClick={() => onChange(tab.id)}
          >
            <span aria-hidden="true">
              {tab.icon}
            </span>

            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}