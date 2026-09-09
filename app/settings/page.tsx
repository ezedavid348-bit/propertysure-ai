"use client";

import {
  useEffect,
} from "react";

import { useRouter } from "next/navigation";

import AppShell from "../AppShell/AppShell";
import { supabase } from "../lib/supabase";

import styles from "./settings.module.css";

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "general"
  | "security"
  | "notifications"
  | "appearance"
  | "language"
  | "privacy"
  | "support"
  | "chevron";

function Icon({
  name,
  size,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const icons: Record<
    IconName,
    string
  > = {
    general: "▦",
    security: "◈",
    notifications: "🔔",
    appearance: "◌",
    language: "◎",
    privacy: "▤",
    support: "?",

    chevron: "⌄",
  };

  return (
    <span
      className={`${styles.icon} ${className}`}
      style={{
        fontSize: size
          ? `${size}px`
          : undefined,
      }}
      aria-hidden="true"
    >
      {icons[name]}
    </span>
  );
}

/*
============================================================
SETTINGS CATEGORIES
============================================================
*/

const categories = [
  {
    id: "general",
    label: "General",
    description:
      "Basic preferences and settings",
    icon: "general" as IconName,
    color: "green",
    route: "/settings/general",
  },
  {
    id: "security",
    label: "Security & Privacy",
    description:
      "Password, 2FA, and privacy",
    icon: "security" as IconName,
    color: "blue",
    route: "/settings/security",
  },
  {
    id: "notifications",
    label: "Notifications",
    description:
      "Email, SMS and push preferences",
    icon: "notifications" as IconName,
    color: "yellow",
    route: "/settings/notifications",
  },
  {
    id: "appearance",
    label: "Appearance",
    description:
      "Theme, colors and display",
    icon: "appearance" as IconName,
    color: "cyan",
    route: "/settings/appearance",
  },
  {
    id: "language",
    label: "Language & Region",
    description:
      "Language and regional settings",
    icon: "language" as IconName,
    color: "blue",
    route: "/settings/language-region",
  },
  {
    id: "privacy",
    label: "Data & Privacy",
    description:
      "Your data and privacy controls",
    icon: "privacy" as IconName,
    color: "gray",
    route: "/settings/data-privacy",
  },
  {
    id: "support",
    label: "Support & Help",
    description:
      "Help center and support",
    icon: "support" as IconName,
    color: "gray",
    route: "/settings/support-help",
  },
];

/*
============================================================
SETTINGS ROW
============================================================
*/

function SettingsRow({
  category,
  onClick,
}: {
  category: (typeof categories)[number];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.settingsRow}
      onClick={onClick}
    >
      <span
        className={`${styles.settingsRowIcon} ${
          styles[category.color]
        }`}
      >
        <Icon
          name={category.icon}
          size={19}
        />
      </span>

      <span
        className={styles.settingsRowText}
      >
        <strong>
          {category.label}
        </strong>

        <small>
          {category.description}
        </small>
      </span>

      <span
        className={
          styles.settingsRowArrow
        }
      >
        <Icon
          name="chevron"
          size={20}
        />
      </span>
    </button>
  );
}

/*
============================================================
SETTINGS PAGE
============================================================
*/

export default function SettingsPage() {
  const router = useRouter();

  /*
  ============================================================
  AUTH CHECK
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      try {
        const {
          data: { user },
          error,
        } =
          await supabase.auth.getUser();

        if (error) {
          console.error(
            "Could not load authenticated user:",
            error
          );

          return;
        }

        if (!mounted) {
          return;
        }

        if (!user) {
          router.replace("/signin");
        }
      } catch (error) {
        console.error(
          "Settings authentication error:",
          error
        );
      }
    }

    checkUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
  ============================================================
  OPEN SETTINGS CATEGORY
  ============================================================
  */

  function openCategory(
    route: string
  ) {
    router.push(route);
  }

  /*
  ============================================================
  UI
  ============================================================
  */

  return (
    <AppShell
      activePath="/settings"
      headerPath="/settings"
    >
      <main
        className={styles.page}
      >
        <div
          className={styles.content}
        >

          {/* ==================================================
              MOBILE PAGE INTRODUCTION
              AppShell supplies the desktop header.
          ================================================== */}

          <div
            className={
              styles.mobilePageHeader
            }
          >
            <div
              className={
                styles.mobileEyebrow
              }
            >
              PROPERTYSURE AI
            </div>

            <h1>
              Settings
            </h1>

            <p>
              Manage your preferences,
              security, and application
              settings.
            </p>
          </div>

          {/* ==================================================
              SETTINGS CARD
          ================================================== */}

          <section
            className={
              styles.settingsCard
            }
          >

            <div
              className={
                styles.settingsCardHeader
              }
            >
              <div
                className={
                  styles.cardEyebrow
                }
              >
                ACCOUNT PREFERENCES
              </div>

              <h1>
                Settings
              </h1>

              <p>
                Configure your
                PropertySure AI
                account and
                application
                preferences.
              </p>
            </div>

            <div
              className={
                styles.settingsList
              }
            >
              {categories.map(
                (category) => (
                  <SettingsRow
                    key={
                      category.id
                    }
                    category={
                      category
                    }
                    onClick={() =>
                      openCategory(
                        category.route
                      )
                    }
                  />
                )
              )}
            </div>

          </section>

        </div>
      </main>
    </AppShell>
  );
}