"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import AppShell from "../../AppShell/AppShell";
import LoadingScreen from "../../AppShell/LoadingScreen";
import { supabase } from "../../lib/supabase";
import "./general.css";

/*
============================================================
GENERAL SETTINGS PAGE
PropertySure AI

Route:
    /settings/general

Shared application shell:
    - AppShell desktop sidebar
    - AppShell desktop header
    - AppShell mobile header
    - AppShell mobile bottom navigation
    - Shared LoadingScreen

General preferences:
    - Auto-refresh Dashboard
    - Default Landing Page
    - Save Verification Progress
    - Verification Reminders
    - Remember Last Location
    - Reset General Settings
============================================================
*/

type ToggleState = {
  autoRefresh: boolean;
  saveProgress: boolean;
  verificationReminders: boolean;
  rememberLocation: boolean;
};

type GeneralSettings = {
  toggles: ToggleState;
  landingPage: string;
};

const STORAGE_KEY =
  "propertysure-general-settings";

const DEFAULT_TOGGLES: ToggleState = {
  autoRefresh: true,
  saveProgress: true,
  verificationReminders: true,
  rememberLocation: true,
};

const DEFAULT_LANDING_PAGE =
  "Dashboard";

const DEFAULT_SETTINGS: GeneralSettings = {
  toggles: DEFAULT_TOGGLES,
  landingPage: DEFAULT_LANDING_PAGE,
};

const LANDING_PAGE_OPTIONS = [
  "Dashboard",
  "Verify",
  "Properties",
  "Reports",
  "Account",
];

/* =========================================================
   ICONS
========================================================= */

function RefreshIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 42 42"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M34 16C31.9 11.1 27.2 8 21.8 8C15.3 8 9.8 12.6 8.2 18.8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M8 11V19H16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 26C10.1 30.9 14.8 34 20.2 34C26.7 34 32.2 29.4 33.8 23.2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M34 31V23H26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 42 42"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 19.5L21 7L35 19.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10.5 18V34H31.5V18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <path
        d="M17 34V25H25V34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VerificationIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 42 42"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 6.5H25L31 12.5V34.5H11V6.5Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <path
        d="M24 6.5V13H30.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <path
        d="M16 19H25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M16 24H21"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <circle
        cx="27"
        cy="28"
        r="4"
        fill="currentColor"
      />

      <path
        d="M25.2 28L26.5 29.3L29 26.8"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 4C8.8 4 6.7 6.6 6.7 9.8V13.5L4.8 16.5H19.2L17.3 13.5V9.8C17.3 6.6 15.2 4 12 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M9.9 19C10.3 20 11 20.5 12 20.5C13 20.5 13.7 20 14.1 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 42 42"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="21"
        cy="21"
        r="13"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      <path
        d="M21 13V21L26 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 9V16H15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 42 42"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M34 16C31.9 11.1 27.2 8 21.8 8C15.3 8 9.8 12.6 8.2 18.8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M8 11V19H16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 26C10.1 30.9 14.8 34 20.2 34C26.7 34 32.2 29.4 33.8 23.2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M34 31V23H26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <div className="general-control">
      <button
        type="button"
        onClick={onChange}
        aria-pressed={enabled}
        aria-label={`${label}: ${
          enabled ? "On" : "Off"
        }`}
        className={`general-toggle ${
          enabled
            ? "general-toggle-on"
            : ""
        }`}
      >
        <span className="general-toggle-knob" />
      </button>

      <span
        className={`general-status ${
          enabled
            ? "general-status-on"
            : "general-status-off"
        }`}
      >
        {enabled ? "On" : "Off"}
      </span>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function GeneralSettingsPage() {
  const [loading, setLoading] =
    useState(true);

  const [toggles, setToggles] =
    useState<ToggleState>(
      DEFAULT_TOGGLES,
    );

  const [landingPage, setLandingPage] =
    useState(
      DEFAULT_LANDING_PAGE,
    );

  const [landingOpen, setLandingOpen] =
    useState(false);

  const [resetMessage, setResetMessage] =
    useState(false);

  const landingDropdownRef =
    useRef<HTMLDivElement | null>(null);

  /* =======================================================
     AUTH + LOAD SAVED SETTINGS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href =
            "/signin";
          return;
        }

        const stored =
          window.localStorage.getItem(
            STORAGE_KEY,
          );

        if (stored) {
          try {
            const parsed =
              JSON.parse(
                stored,
              ) as Partial<GeneralSettings>;

            if (mounted) {
              setToggles({
                ...DEFAULT_TOGGLES,
                ...(parsed.toggles ?? {}),
              });

              setLandingPage(
                parsed.landingPage ||
                  DEFAULT_LANDING_PAGE,
              );
            }
          } catch {
            window.localStorage.removeItem(
              STORAGE_KEY,
            );
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     SAVE SETTINGS
  ======================================================= */

  useEffect(() => {
    if (loading) {
      return;
    }

    const settings: GeneralSettings = {
      toggles,
      landingPage,
    };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings),
    );

    /*
     * Notify other PropertySure pages that
     * General Settings have changed.
     *
     * Dashboard and other pages can listen
     * to this event when their functionality
     * is connected to these preferences.
     */
    window.dispatchEvent(
      new CustomEvent(
        "propertysure-general-settings-changed",
        {
          detail: settings,
        },
      ),
    );
  }, [
    toggles,
    landingPage,
    loading,
  ]);

  /* =======================================================
     CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      if (
        landingDropdownRef.current &&
        !landingDropdownRef.current.contains(
          event.target as Node,
        )
      ) {
        setLandingOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  /* =======================================================
     TOGGLE SETTING
  ======================================================= */

  const toggleSetting = (
    key: keyof ToggleState,
  ) => {
    setToggles((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetPreferences = () => {
    setToggles({
      ...DEFAULT_TOGGLES,
    });

    setLandingPage(
      DEFAULT_LANDING_PAGE,
    );

    setLandingOpen(false);

    window.localStorage.removeItem(
      STORAGE_KEY,
    );

    setResetMessage(true);

    window.setTimeout(() => {
      setResetMessage(false);
    }, 2500);
  };

  /* =======================================================
     LANDING PAGE
  ======================================================= */

  const selectLandingPage = (
    page: string,
  ) => {
    setLandingPage(page);
    setLandingOpen(false);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <LoadingScreen />;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AppShell
      activePath="/settings"
      headerPath="/settings"
    >
      <main className="general-page">
        <section className="general-content">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="general-page-heading">
            <h1>
              General
            </h1>

            <p className="general-description">
              Manage your basic preferences and
              application behavior.
            </p>

            <Link
              href="/settings"
              className="general-back-link"
            >
              <span
                className="general-back-arrow"
                aria-hidden="true"
              >
                ←
              </span>

              <span>
                Back to Settings
              </span>
            </Link>
          </div>

          {/* =================================================
              DASHBOARD PREFERENCES
          ================================================= */}

          <section className="general-card">
            <div className="general-section-label">
              DASHBOARD PREFERENCES
            </div>

            <div className="general-setting-row">
              <div className="general-icon-box general-icon-blue">
                <RefreshIcon />
              </div>

              <div className="general-setting-content">
                <h2>
                  Auto-refresh Dashboard
                </h2>

                <p>
                  Automatically refresh dashboard
                  information when new data is
                  available.
                </p>
              </div>

              <Toggle
                enabled={
                  toggles.autoRefresh
                }
                onChange={() =>
                  toggleSetting(
                    "autoRefresh",
                  )
                }
                label="Auto-refresh Dashboard"
              />
            </div>
          </section>

          {/* =================================================
              DEFAULT PAGE
          ================================================= */}

          <section className="general-card">
            <div className="general-section-label">
              DEFAULT PAGE
            </div>

            <div className="general-setting-row general-landing-row">
              <div className="general-icon-box general-icon-green">
                <HomeIcon />
              </div>

              <div className="general-setting-content">
                <h2>
                  Default Landing Page
                </h2>

                <p>
                  Choose the page you see when
                  you sign in to PropertySure AI.
                </p>
              </div>

              <div
                className={`general-select-wrapper ${
                  landingOpen
                    ? "general-select-open"
                    : ""
                }`}
                ref={landingDropdownRef}
              >
                <button
                  type="button"
                  className={`general-select ${
                    landingOpen
                      ? "general-select-focused"
                      : ""
                  }`}
                  onClick={() =>
                    setLandingOpen(
                      (current) =>
                        !current,
                    )
                  }
                  aria-haspopup="listbox"
                  aria-expanded={
                    landingOpen
                  }
                >
                  <span>
                    {landingPage}
                  </span>

                  <span
                    className={`general-select-arrow ${
                      landingOpen
                        ? "general-select-arrow-open"
                        : ""
                    }`}
                    aria-hidden="true"
                  >
                    ⌄
                  </span>
                </button>

                {landingOpen && (
                  <div
                    className="general-select-menu"
                    role="listbox"
                    aria-label="Default Landing Page"
                  >
                    {LANDING_PAGE_OPTIONS.map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          role="option"
                          aria-selected={
                            landingPage ===
                            option
                          }
                          className={`general-select-option ${
                            landingPage ===
                            option
                              ? "general-select-option-active"
                              : ""
                          }`}
                          onClick={() =>
                            selectLandingPage(
                              option,
                            )
                          }
                        >
                          <span>
                            {option}
                          </span>

                          {landingPage ===
                            option && (
                            <span
                              className="general-select-check"
                              aria-hidden="true"
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              VERIFICATION PREFERENCES
          ================================================= */}

          <section className="general-card">
            <div className="general-section-label">
              VERIFICATION PREFERENCES
            </div>

            <div className="general-setting-row general-divider">
              <div className="general-icon-box general-icon-purple">
                <VerificationIcon />
              </div>

              <div className="general-setting-content">
                <h2>
                  Save verification progress
                </h2>

                <p>
                  Automatically save your progress
                  while completing a verification.
                </p>
              </div>

              <Toggle
                enabled={
                  toggles.saveProgress
                }
                onChange={() =>
                  toggleSetting(
                    "saveProgress",
                  )
                }
                label="Save verification progress"
              />
            </div>

            <div className="general-setting-row">
              <div className="general-icon-box general-icon-yellow">
                <BellIcon />
              </div>

              <div className="general-setting-content">
                <h2>
                  Verification reminders
                </h2>

                <p>
                  Remind me when a verification
                  has incomplete information.
                </p>
              </div>

              <Toggle
                enabled={
                  toggles.verificationReminders
                }
                onChange={() =>
                  toggleSetting(
                    "verificationReminders",
                  )
                }
                label="Verification reminders"
              />
            </div>
          </section>

          {/* =================================================
              INTERFACE BEHAVIOR
          ================================================= */}

          <section className="general-card">
            <div className="general-section-label">
              INTERFACE BEHAVIOR
            </div>

            <div className="general-setting-row">
              <div className="general-icon-box general-icon-cyan">
                <ClockIcon />
              </div>

              <div className="general-setting-content">
                <h2>
                  Remember my last location
                </h2>

                <p>
                  Return me to the last section
                  I was viewing when possible.
                </p>
              </div>

              <Toggle
                enabled={
                  toggles.rememberLocation
                }
                onChange={() =>
                  toggleSetting(
                    "rememberLocation",
                  )
                }
                label="Remember my last location"
              />
            </div>
          </section>

          {/* =================================================
              RESET
          ================================================= */}

          <section className="general-card general-reset-card">
            <div className="general-section-label general-reset-label">
              RESET PREFERENCES
            </div>

            <div className="general-setting-row general-reset-row">
              <div className="general-icon-box general-icon-red">
                <ResetIcon />
              </div>

              <div className="general-setting-content">
                <h2>
                  Reset General Settings
                </h2>

                <p>
                  Restore your general preferences
                  to their default values.
                </p>
              </div>

              <button
                type="button"
                className="general-reset-button"
                onClick={
                  resetPreferences
                }
              >
                Reset Preferences
              </button>
            </div>

            {resetMessage && (
              <div
                className="general-reset-message"
                role="status"
              >
                General preferences have
                been reset.
              </div>
            )}
          </section>

        </section>
      </main>
    </AppShell>
  );
}