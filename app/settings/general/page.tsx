"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import "./general.css";

/*
============================================================
GENERAL SETTINGS PAGE
PropertySure AI

Route:
    /settings/general

MASTER UI REFERENCE:
    PropertySure AI Settings page

Shared master elements reused:
    - PropertySure AI logo
    - Logo sizing
    - Mobile header
    - Three-dash menu icon
    - Native notification bell emoji
    - Notification dot
    - Header colors
    - Bottom navigation icons
============================================================
*/

type ToggleState = {
  autoRefresh: boolean;
  saveProgress: boolean;
  verificationReminders: boolean;
  rememberLocation: boolean;
};

const DEFAULT_TOGGLES: ToggleState = {
  autoRefresh: true,
  saveProgress: true,
  verificationReminders: true,
  rememberLocation: true,
};

const DEFAULT_LANDING_PAGE = "Dashboard";

const LANDING_PAGE_OPTIONS = [
  "Dashboard",
  "Verify",
  "Properties",
  "Reports",
  "Account",
];

/* =========================================================
   MASTER HEADER MENU ICON
========================================================= */

function MenuIcon() {
  return (
    <span
      className="general-master-menu-icon"
      aria-hidden="true"
    >
      ☰
    </span>
  );
}

/*
============================================================
MASTER NOTIFICATION BELL
============================================================

IMPORTANT:

The bell uses the native emoji presentation:

    🔔️

The second character is the emoji variation selector.

This intentionally keeps the native iOS/Apple Color Emoji
appearance used by the master Settings page.

DO NOT:
    - replace with SVG
    - add a CSS filter
    - add grayscale
    - add sepia
    - add hue-rotate
    - force the emoji color with CSS
============================================================
*/

function NotificationBellIcon() {
  return (
    <span
      className="general-master-bell"
      role="img"
      aria-label="Notifications"
    >
      🔔️
    </span>
  );
}

/*
============================================================
GENERAL SETTING BELL

Separate from the master header bell.

Color:
    #D79A13
============================================================
*/

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

/* =========================================================
   GENERAL SETTING ICONS
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
   MASTER NAVIGATION ICONS
========================================================= */

function DashboardNavIcon() {
  return (
    <span
      className="general-master-nav-icon"
      aria-hidden="true"
    >
      ▦
    </span>
  );
}

function VerifyNavIcon() {
  return (
    <span
      className="general-master-nav-icon"
      aria-hidden="true"
    >
      ⇧
    </span>
  );
}

function PropertiesNavIcon() {
  return (
    <span
      className="general-master-nav-icon"
      aria-hidden="true"
    >
      ⌂
    </span>
  );
}

function ReportsNavIcon() {
  return (
    <span
      className="general-master-nav-icon"
      aria-hidden="true"
    >
      ▤
    </span>
  );
}

function AccountNavIcon() {
  return (
    <span
      className="general-master-nav-icon"
      aria-hidden="true"
    >
      ◯
    </span>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={enabled}
      aria-label={
        enabled ? "Turn off" : "Turn on"
      }
      className={`general-toggle ${
        enabled
          ? "general-toggle-on"
          : ""
      }`}
    >
      <span className="general-toggle-knob" />
    </button>
  );
}

/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

function BottomNavigation() {
  return (
    <nav className="general-bottom-nav">

      <Link
        href="/dashboard"
        className="general-nav-item"
      >
        <DashboardNavIcon />

        <span>
          Dashboard
        </span>
      </Link>

      <Link
        href="/verify"
        className="general-nav-item"
      >
        <VerifyNavIcon />

        <span>
          Verify
        </span>
      </Link>

      <Link
        href="/my-properties"
        className="general-nav-item"
      >
        <PropertiesNavIcon />

        <span>
          Properties
        </span>
      </Link>

      <Link
        href="/reports"
        className="general-nav-item"
      >
        <ReportsNavIcon />

        <span>
          Reports
        </span>
      </Link>

      <Link
        href="/account"
        className="general-nav-item general-nav-active"
      >
        <AccountNavIcon />

        <span>
          Account
        </span>
      </Link>

    </nav>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function GeneralSettingsPage() {
  const [toggles, setToggles] =
    useState<ToggleState>(
      DEFAULT_TOGGLES
    );

  const [landingPage, setLandingPage] =
    useState(
      DEFAULT_LANDING_PAGE
    );

  const [landingOpen, setLandingOpen] =
    useState(false);

  const [resetMessage, setResetMessage] =
    useState(false);

  const landingDropdownRef =
    useRef<HTMLDivElement | null>(null);

  /* =======================================================
     CLOSE LANDING DROPDOWN WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        landingDropdownRef.current &&
        !landingDropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setLandingOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const toggleSetting = (
    key: keyof ToggleState
  ) => {
    setToggles((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const resetPreferences = () => {
    setToggles(
      DEFAULT_TOGGLES
    );

    setLandingPage(
      DEFAULT_LANDING_PAGE
    );

    setLandingOpen(false);

    setResetMessage(true);

    window.setTimeout(() => {
      setResetMessage(false);
    }, 2500);
  };

  const selectLandingPage = (
    page: string
  ) => {
    setLandingPage(page);
    setLandingOpen(false);
  };

  return (
    <main className="general-page">

      {/* =====================================================
          MASTER HEADER
      ===================================================== */}

      <header className="general-header">

        <button
          type="button"
          className="general-menu-button"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>

        <Link
          href="/dashboard"
          className="general-brand"
          aria-label="PropertySure AI Dashboard"
        >
          <span
            className="general-brand-diamond"
            aria-hidden="true"
          >
            ◆
          </span>

          <span className="general-brand-text">
            <span>
              PropertySure
            </span>{" "}

            <span className="general-brand-ai">
              AI
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="general-notification-button"
          aria-label="Notifications"
        >
          <NotificationBellIcon />

          <span
            className="general-notification-dot"
          />
        </button>

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="general-content">

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
          <span className="general-back-arrow">
            ‹
          </span>

          <span>
            Back to Settings
          </span>
        </Link>

        {/* ===================================================
            DASHBOARD PREFERENCES
        =================================================== */}

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

            <div className="general-control">

              <Toggle
                enabled={
                  toggles.autoRefresh
                }
                onChange={() =>
                  toggleSetting(
                    "autoRefresh"
                  )
                }
              />

              <span
                className={`general-status ${
                  toggles.autoRefresh
                    ? "general-status-on"
                    : "general-status-off"
                }`}
              >
                {toggles.autoRefresh
                  ? "On"
                  : "Off"}
              </span>

            </div>

          </div>

        </section>

        {/* ===================================================
            DEFAULT PAGE
        =================================================== */}

        <section className="general-card">

          <div className="general-section-label">
            DEFAULT PAGE
          </div>

          <div className="general-setting-row">

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
                    (current) => !current
                  )
                }
                aria-haspopup="listbox"
                aria-expanded={landingOpen}
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
                            option
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
                    )
                  )}
                </div>
              )}
            </div>

          </div>

        </section>

        {/* ===================================================
            VERIFICATION PREFERENCES
        =================================================== */}

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

            <div className="general-control">

              <Toggle
                enabled={
                  toggles.saveProgress
                }
                onChange={() =>
                  toggleSetting(
                    "saveProgress"
                  )
                }
              />

              <span
                className={`general-status ${
                  toggles.saveProgress
                    ? "general-status-on"
                    : "general-status-off"
                }`}
              >
                {toggles.saveProgress
                  ? "On"
                  : "Off"}
              </span>

            </div>

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

            <div className="general-control">

              <Toggle
                enabled={
                  toggles.verificationReminders
                }
                onChange={() =>
                  toggleSetting(
                    "verificationReminders"
                  )
                }
              />

              <span
                className={`general-status ${
                  toggles.verificationReminders
                    ? "general-status-on"
                    : "general-status-off"
                }`}
              >
                {toggles.verificationReminders
                  ? "On"
                  : "Off"}
              </span>

            </div>

          </div>

        </section>

        {/* ===================================================
            INTERFACE BEHAVIOR
        =================================================== */}

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

            <div className="general-control">

              <Toggle
                enabled={
                  toggles.rememberLocation
                }
                onChange={() =>
                  toggleSetting(
                    "rememberLocation"
                  )
                }
              />

              <span
                className={`general-status ${
                  toggles.rememberLocation
                    ? "general-status-on"
                    : "general-status-off"
                }`}
              >
                {toggles.rememberLocation
                  ? "On"
                  : "Off"}
              </span>

            </div>

          </div>

        </section>

        {/* ===================================================
            RESET
        =================================================== */}

        <section className="general-card general-reset-card">

          <div className="general-section-label general-reset-label">
            RESET PREFERENCES
          </div>

          <div className="general-setting-row">

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
            <div className="general-reset-message">
              General preferences have
              been reset.
            </div>
          )}

        </section>

      </section>

      {/* =====================================================
          BOTTOM NAVIGATION
      ===================================================== */}

      <BottomNavigation />

    </main>
  );
}