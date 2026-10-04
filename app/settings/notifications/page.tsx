"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import AppShell from "../../AppShell/AppShell";
import LoadingScreen from "../../AppShell/LoadingScreen";
import styles from "./notifications.module.css";
import { supabase } from "../../lib/supabase";

/*
============================================================
PROPERTYsure AI
NOTIFICATION PREFERENCES

Route:
    /settings/notifications

Shared application shell:
    - AppShell desktop sidebar
    - AppShell desktop header
    - AppShell mobile header
    - AppShell mobile bottom navigation
    - Shared LoadingScreen

Notification preferences:
    - Delivery channels
    - Verification notifications
    - Property & fraud alerts
    - Account & security alerts
============================================================
*/

type NotificationSettings = {
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;

  verificationCompleted: boolean;
  verificationAttention: boolean;
  verificationFailed: boolean;
  verificationReportReady: boolean;

  fraudWatchAlerts: boolean;
  propertyStatusChanges: boolean;
  propertyWarnings: boolean;
  savedPropertyActivity: boolean;

  newLogin: boolean;
  passwordSecurity: boolean;
  twoFactorSecurity: boolean;
  accountChanges: boolean;
};

const STORAGE_KEY =
  "propertysure-notification-settings";

const DEFAULT_SETTINGS: NotificationSettings = {
  notificationsEnabled: true,
  emailNotifications: true,
  smsNotifications: true,
  pushNotifications: true,

  verificationCompleted: true,
  verificationAttention: true,
  verificationFailed: true,
  verificationReportReady: true,

  fraudWatchAlerts: true,
  propertyStatusChanges: true,
  propertyWarnings: true,
  savedPropertyActivity: true,

  newLogin: true,
  passwordSecurity: true,
  twoFactorSecurity: true,
  accountChanges: true,
};

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "bell"
  | "email"
  | "sms"
  | "push"
  | "check";

function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  if (name === "bell") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
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

  const icons: Record<
    Exclude<IconName, "bell">,
    string
  > = {
    email: "✉",
    sms: "▣",
    push: "▯",
    check: "✓",
  };

  return (
    <span
      className={`${styles.icon} ${className}`}
      style={{
        fontSize: `${size}px`,
      }}
      aria-hidden="true"
    >
      {icons[name]}
    </span>
  );
}

/*
============================================================
TOGGLE
============================================================
*/

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
    <button
      type="button"
      className={`${styles.toggle} ${
        enabled ? styles.toggleOn : ""
      }`}
      onClick={onChange}
      aria-label={`${label}: ${
        enabled ? "On" : "Off"
      }`}
      aria-pressed={enabled}
    >
      <span className={styles.toggleKnob} />
    </button>
  );
}

/*
============================================================
CHECKBOX
============================================================
*/

function CheckBox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.checkboxButton} ${
        checked
          ? styles.checkboxChecked
          : ""
      }`}
      onClick={onChange}
      aria-label={`${label}: ${
        checked ? "On" : "Off"
      }`}
      aria-pressed={checked}
    >
      <span className={styles.checkbox}>
        {checked && (
          <Icon
            name="check"
            size={10}
          />
        )}
      </span>
    </button>
  );
}

/*
============================================================
NOTIFICATION SECTION
============================================================
*/

function NotificationSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      className={
        styles.notificationSection
      }
    >
      <div
        className={styles.sectionLabel}
      >
        {title.toUpperCase()}
      </div>

      <div
        className={
          styles.notificationCard
        }
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div
            className={
              styles.sectionHeaderText
            }
          >
            <h2>{title}</h2>

            <p>{description}</p>
          </div>
        </div>

        <div
          className={
            styles.sectionRows
          }
        >
          {children}
        </div>
      </div>
    </section>
  );
}

/*
============================================================
CHANNEL ROW
============================================================
*/

function ChannelRow({
  icon,
  color,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: IconName;
  color:
    | "green"
    | "yellow"
    | "purple";
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className={styles.channelRow}>
      <div
        className={`${styles.channelIcon} ${
          styles[color]
        }`}
      >
        <Icon
          name={icon}
          size={16}
        />
      </div>

      <div
        className={styles.rowText}
      >
        <strong>{title}</strong>

        <span>{description}</span>
      </div>

      <Toggle
        enabled={enabled}
        onChange={onChange}
        label={title}
      />
    </div>
  );
}

/*
============================================================
CHECK ROW
============================================================
*/

function CheckRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className={styles.checkRow}>
      <CheckBox
        checked={checked}
        onChange={onChange}
        label={title}
      />

      <div
        className={styles.checkText}
      >
        <strong>{title}</strong>

        <span>{description}</span>
      </div>
    </div>
  );
}

/*
============================================================
PAGE
============================================================
*/

export default function NotificationsPage() {
  const [loading, setLoading] =
    useState(true);

  const [settings, setSettings] =
    useState<NotificationSettings>(
      DEFAULT_SETTINGS,
    );

  /*
  ==========================================================
  LOAD USER + SAVED NOTIFICATION SETTINGS
  ==========================================================
  */

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

        if (stored && mounted) {
          try {
            const parsed =
              JSON.parse(
                stored,
              ) as Partial<NotificationSettings>;

            setSettings({
              ...DEFAULT_SETTINGS,
              ...parsed,
            });
          } catch {
            window.localStorage.removeItem(
              STORAGE_KEY,
            );
          }
        }
      } catch (error) {
        console.error(
          "Notification settings loading error:",
          error,
        );
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

  /*
  ==========================================================
  SAVE SETTINGS
  ==========================================================
  */

  useEffect(() => {
    if (loading) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings),
    );

    /*
     * Notify the rest of PropertySure AI
     * that notification preferences changed.
     */
    window.dispatchEvent(
      new CustomEvent(
        "propertysure-notification-settings-changed",
        {
          detail: settings,
        },
      ),
    );
  }, [settings, loading]);

  /*
  ==========================================================
  UPDATE ONE SETTING
  ==========================================================
  */

  const updateSetting = <
    K extends keyof NotificationSettings
  >(
    key: K,
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  /*
  ==========================================================
  LOADING
  ==========================================================
  */

  if (loading) {
    return <LoadingScreen />;
  }

  /*
  ==========================================================
  PAGE
  ==========================================================
  */

  return (
    <AppShell
      activePath="/settings"
      headerPath="/settings"
    >
      <main
        className={styles.page}
      >
        <section
          className={styles.main}
        >
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <header
            className={
              styles.pageHeader
            }
          >
            <h1>
              Notification Preferences
            </h1>

            <p>
              Choose which alerts you
              receive for verification,
              fraud monitoring, account
              security, and property
              activity.
            </p>

            <Link
              href="/settings"
              className={
                styles.backButton
              }
            >
              <span
                className={
                  styles.backArrow
                }
                aria-hidden="true"
              >
                ←
              </span>

              <span>
                Back to Settings
              </span>
            </Link>
          </header>

          <div
            className={
              styles.content
            }
          >
            {/* ================================================
                DELIVERY CHANNELS
            ================================================= */}

            <NotificationSection
              title="Delivery Channels"
              description="Control how PropertySure AI delivers your notifications."
            >
              <ChannelRow
                icon="bell"
                color="green"
                title="Enable Notifications"
                description="Master switch for all notifications."
                enabled={
                  settings.notificationsEnabled
                }
                onChange={() =>
                  updateSetting(
                    "notificationsEnabled",
                  )
                }
              />

              <ChannelRow
                icon="email"
                color="green"
                title="Email Notifications"
                description="Receive notifications via email."
                enabled={
                  settings.emailNotifications
                }
                onChange={() =>
                  updateSetting(
                    "emailNotifications",
                  )
                }
              />

              <ChannelRow
                icon="sms"
                color="yellow"
                title="SMS Notifications"
                description="Receive important alerts via SMS."
                enabled={
                  settings.smsNotifications
                }
                onChange={() =>
                  updateSetting(
                    "smsNotifications",
                  )
                }
              />

              <ChannelRow
                icon="push"
                color="purple"
                title="Push Notifications"
                description="Receive push notifications in your browser."
                enabled={
                  settings.pushNotifications
                }
                onChange={() =>
                  updateSetting(
                    "pushNotifications",
                  )
                }
              />
            </NotificationSection>

            {/* ================================================
                VERIFICATION
            ================================================= */}

            <NotificationSection
              title="Verification Notifications"
              description="Receive updates about verification activities."
            >
              <CheckRow
                title="Verification Completed"
                description="Get notified when a verification is completed."
                checked={
                  settings.verificationCompleted
                }
                onChange={() =>
                  updateSetting(
                    "verificationCompleted",
                  )
                }
              />

              <CheckRow
                title="Verification Requires Attention"
                description="Get notified when verification requires your attention."
                checked={
                  settings.verificationAttention
                }
                onChange={() =>
                  updateSetting(
                    "verificationAttention",
                  )
                }
              />

              <CheckRow
                title="Verification Failed / Flagged"
                description="Get notified when verification fails or is flagged."
                checked={
                  settings.verificationFailed
                }
                onChange={() =>
                  updateSetting(
                    "verificationFailed",
                  )
                }
              />

              <CheckRow
                title="Verification Report Ready"
                description="Get notified when your verification report is ready to view."
                checked={
                  settings.verificationReportReady
                }
                onChange={() =>
                  updateSetting(
                    "verificationReportReady",
                  )
                }
              />
            </NotificationSection>

            {/* ================================================
                PROPERTY & FRAUD
            ================================================= */}

            <NotificationSection
              title="Property & Fraud Alerts"
              description="Important alerts about your properties and fraud watch."
            >
              <CheckRow
                title="Fraud Watch Alerts"
                description="Get notified about potential fraud activities."
                checked={
                  settings.fraudWatchAlerts
                }
                onChange={() =>
                  updateSetting(
                    "fraudWatchAlerts",
                  )
                }
              />

              <CheckRow
                title="Property Status Changes"
                description="Get notified when property status changes."
                checked={
                  settings.propertyStatusChanges
                }
                onChange={() =>
                  updateSetting(
                    "propertyStatusChanges",
                  )
                }
              />

              <CheckRow
                title="Important Property Warnings"
                description="Get notified about important property warnings."
                checked={
                  settings.propertyWarnings
                }
                onChange={() =>
                  updateSetting(
                    "propertyWarnings",
                  )
                }
              />

              <CheckRow
                title="New Activity on Saved Properties"
                description="Get notified about new activity on your saved properties."
                checked={
                  settings.savedPropertyActivity
                }
                onChange={() =>
                  updateSetting(
                    "savedPropertyActivity",
                  )
                }
              />
            </NotificationSection>

            {/* ================================================
                ACCOUNT & SECURITY
            ================================================= */}

            <NotificationSection
              title="Account & Security Alerts"
              description="Critical alerts about your account and security."
            >
              <CheckRow
                title="New Login"
                description="Get notified when someone logs in to your account."
                checked={
                  settings.newLogin
                }
                onChange={() =>
                  updateSetting(
                    "newLogin",
                  )
                }
              />

              <CheckRow
                title="Password / Security Changes"
                description="Get notified when password or security settings change."
                checked={
                  settings.passwordSecurity
                }
                onChange={() =>
                  updateSetting(
                    "passwordSecurity",
                  )
                }
              />

              <CheckRow
                title="2FA / Security Events"
                description="Get notified about 2FA or other security events."
                checked={
                  settings.twoFactorSecurity
                }
                onChange={() =>
                  updateSetting(
                    "twoFactorSecurity",
                  )
                }
              />

              <CheckRow
                title="Account Changes"
                description="Get notified about important account changes."
                checked={
                  settings.accountChanges
                }
                onChange={() =>
                  updateSetting(
                    "accountChanges",
                  )
                }
              />
            </NotificationSection>

            {/* ================================================
                NOTIFICATION DELIVERY
            ================================================= */}

            <section
              className={
                styles.deliverySection
              }
            >
              <div
                className={
                  styles.sectionLabel
                }
              >
                NOTIFICATION DELIVERY
              </div>

              <div
                className={
                  styles.deliveryCard
                }
              >
                <div
                  className={
                    styles.deliveryItem
                  }
                >
                  <div
                    className={`${styles.deliveryIcon} ${styles.deliveryBlue}`}
                  >
                    <Icon
                      name="email"
                      size={16}
                    />
                  </div>

                  <div>
                    <strong>
                      Email
                    </strong>

                    <span>
                      Account email
                    </span>

                    <small>
                      ✓ Verified
                    </small>
                  </div>
                </div>

                <div
                  className={
                    styles.deliveryItem
                  }
                >
                  <div
                    className={`${styles.deliveryIcon} ${styles.deliveryOrange}`}
                  >
                    <Icon
                      name="sms"
                      size={16}
                    />
                  </div>

                  <div>
                    <strong>
                      Phone (SMS)
                    </strong>

                    <span>
                      Account phone
                    </span>

                    <small>
                      ✓ Verified
                    </small>
                  </div>
                </div>

                <div
                  className={
                    styles.deliveryItem
                  }
                >
                  <div
                    className={`${styles.deliveryIcon} ${styles.deliveryPurple}`}
                  >
                    <Icon
                      name="push"
                      size={16}
                    />
                  </div>

                  <div>
                    <strong>
                      Push Notifications
                    </strong>

                    <span>
                      This browser
                    </span>

                    <small>
                      ✓ Enabled
                    </small>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </AppShell>
  );
}