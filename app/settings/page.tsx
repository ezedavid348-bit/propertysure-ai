"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import styles from "./settings.module.css";

type IconName =
  | "home"
  | "history"
  | "properties"
  | "shield"
  | "database"
  | "account"
  | "settings"
  | "grid"
  | "bell"
  | "palette"
  | "globe"
  | "help"
  | "logout"
  | "user"
  | "calendar"
  | "clock"
  | "ruler"
  | "refresh"
  | "compact"
  | "trash"
  | "chevron"
  | "menu"
  | "plus";

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3.5 10.5 12 3l8.5 7.5" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      );

    case "history":
      return (
        <svg {...common}>
          <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
          <path d="M3.5 4.5v5h5" />
          <path d="M12 7.5v4.8l3.2 2" />
        </svg>
      );

    case "properties":
      return (
        <svg {...common}>
          <path d="M4 20V9.5L12 4l8 5.5V20" />
          <path d="M8 20v-6h8v6" />
          <path d="M9.5 10h5" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "database":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="7" ry="3" />
          <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
          <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
        </svg>
      );

    case "account":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 20c.9-3.3 3.2-5 7-5s6.1 1.7 7 5" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
          <path d="m19.4 15 .2.2a1.8 1.8 0 0 1-2.5 2.5l-.2-.2" />
          <path d="m4.6 9-.2-.2a1.8 1.8 0 0 1 2.5-2.5l.2.2" />
          <path d="M9 4.6a1.8 1.8 0 0 1 3.6 0v.3" />
          <path d="M15 19.4a1.8 1.8 0 0 1-3.6 0v-.3" />
          <path d="M19.4 9a1.8 1.8 0 0 1 0 3.6h-.3" />
          <path d="M4.6 15a1.8 1.8 0 0 1 0-3.6h.3" />
        </svg>
      );

    case "grid":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      );

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "palette":
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 5-5c0-2.2-4-5-9-5Z" />
          <circle cx="7.5" cy="11" r=".7" />
          <circle cx="9" cy="7.5" r=".7" />
          <circle cx="13" cy="6.5" r=".7" />
        </svg>
      );

    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z" />
        </svg>
      );

    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.7 9a2.4 2.4 0 0 1 4.6 1c0 1.8-2.3 2-2.3 3.5" />
          <circle cx="12" cy="16.5" r=".5" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 5H5v14h5" />
          <path d="m14 8 4 4-4 4" />
          <path d="M8 12h10" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c.8-3.2 3.2-5 7-5s6.2 1.8 7 5" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "ruler":
      return (
        <svg {...common}>
          <path d="m5 19 14-14" />
          <path d="m7 21-4-4L17 3l4 4L7 21Z" />
          <path d="m8 10 2 2M11 7l2 2M14 4l2 2" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 0 0-14-5L4 8" />
          <path d="M4 4v4h4" />
          <path d="M4 13a8 8 0 0 0 14 5l2-2" />
          <path d="M20 20v-4h-4" />
        </svg>
      );

    case "compact":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 9h8M8 12h8M8 15h5" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M9 7V4h6v3" />
          <path d="M7 7l1 13h8l1-13" />
          <path d="M10 11v5M14 11v5" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 5 7 7-7 7" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    default:
      return null;
  }
}

const categories = [
  {
    id: "general",
    label: "General",
    description: "Basic preferences and settings",
    icon: "grid" as IconName,
    color: "green",
  },
  {
    id: "security",
    label: "Security & Privacy",
    description: "Password, 2FA, and privacy",
    icon: "shield" as IconName,
    color: "blue",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Email, SMS and push preferences",
    icon: "bell" as IconName,
    color: "yellow",
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme, colors and display",
    icon: "palette" as IconName,
    color: "cyan",
  },
  {
    id: "language",
    label: "Language & Region",
    description: "Language and regional settings",
    icon: "globe" as IconName,
    color: "blue",
  },
  {
    id: "privacy",
    label: "Data & Privacy",
    description: "Your data and privacy controls",
    icon: "database" as IconName,
    color: "gray",
  },
  {
    id: "support",
    label: "Support & Help",
    description: "Help center and support",
    icon: "help" as IconName,
    color: "gray",
  },
];

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "home" as IconName },
  {
    label: "Verification History",
    href: "/verification-history",
    icon: "history" as IconName,
  },
  {
    label: "My Properties",
    href: "/my-properties",
    icon: "properties" as IconName,
  },
  {
    label: "Verification Details",
    href: "/verification-details",
    icon: "database" as IconName,
  },
  {
    label: "Fraud Watch",
    href: "/fraud-watch",
    icon: "shield" as IconName,
  },
  { label: "Reports", href: "/reports", icon: "database" as IconName },
  { label: "Account", href: "/account", icon: "account" as IconName },
  { label: "Settings", href: "/settings", icon: "settings" as IconName },
];

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
      aria-label="Toggle setting"
      aria-pressed={enabled}
      onClick={onChange}
      className={`${styles.toggle} ${enabled ? styles.toggleOn : ""}`}
    >
      <span />
    </button>
  );
}

function SettingRow({
  icon,
  title,
  description,
  children,
  color = "green",
}: {
  icon: IconName;
  title: string;
  description: string;
  children: ReactNode;
  color?: string;
}) {
  return (
    <div className={styles.settingRow}>
      <div className={`${styles.settingIcon} ${styles[color]}`}>
        <Icon name={icon} size={18} />
      </div>

      <div className={styles.settingText}>
        <div className={styles.settingTitle}>{title}</div>
        <div className={styles.settingDescription}>{description}</div>
      </div>

      <div className={styles.settingControl}>{children}</div>
    </div>
  );
}

function CategoryItem({
  category,
  active,
  onClick,
}: {
  category: (typeof categories)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.categoryItem} ${
        active ? styles.categoryActive : ""
      }`}
    >
      <span
        className={`${styles.categoryIcon} ${
          styles[category.color]
        }`}
      >
        <Icon name={category.icon} size={18} />
      </span>

      <span className={styles.categoryText}>
        <strong>{category.label}</strong>
        <small>{category.description}</small>
      </span>

      <span className={styles.categoryChevron}>
        <Icon name="chevron" size={17} />
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const signOut = () => {
    alert("Sign out action");
  };

  return (
    <main className={styles.page}>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Icon name="shield" size={28} />
          </div>

          <div>
            <div className={styles.brandName}>
              PropertySure <span>AI</span>
            </div>

            <div className={styles.brandTagline}>
              Verify with Confidence
            </div>
          </div>
        </div>

        <nav className={styles.sideNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${
                item.href === "/settings" ? styles.navActive : ""
              }`}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.profileCard}>
          <div className={styles.avatar}>EK</div>

          <div className={styles.profileInfo}>
            <strong>Eze Ked</strong>
            <small>Premium Plan</small>
          </div>

          <Icon name="chevron" size={15} />
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <section className={styles.main}>
        {/* DESKTOP HEADER */}
        <header className={styles.desktopHeader}>
          <div>
            <h1>Settings</h1>
            <p>
              Manage your preferences, security, and application settings.
            </p>
          </div>

          <div className={styles.notification}>
            <Icon name="bell" size={23} />
            <span>3</span>
          </div>
        </header>

        {/* MOBILE HEADER */}
        <header className={styles.mobileHeader}>
          <button type="button" className={styles.menuButton}>
            <Icon name="menu" size={25} />
          </button>

          <h1>Settings</h1>

          <div className={styles.notification}>
            <Icon name="bell" size={23} />
            <span>3</span>
          </div>
        </header>

        <div className={styles.contentGrid}>
          {/* ================= CATEGORIES ================= */}
          <aside className={styles.categoriesCard}>
            <div className={styles.cardLabel}>CATEGORIES</div>

            <div className={styles.categoryList}>
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  active={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                />
              ))}
            </div>

            <button
              type="button"
              className={styles.signOutCategory}
              onClick={signOut}
            >
              <span className={styles.signOutIcon}>
                <Icon name="logout" size={19} />
              </span>

              <span className={styles.signOutText}>
                <strong>Sign Out</strong>
                <small>Sign out of your account</small>
              </span>
            </button>
          </aside>

          {/* ================= SETTINGS CONTENT ================= */}
          <div className={styles.settingsContent}>
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <h2>General Settings</h2>
                <p>
                  Manage your general preferences and basic application
                  settings.
                </p>
              </div>

              <div className={styles.settingsRows}>
                <SettingRow
                  icon="user"
                  title="Profile Information"
                  description="Manage your profile information and how it's displayed."
                  color="green"
                >
                  <button
                    type="button"
                    className={styles.profileButton}
                    onClick={() => alert("Profile settings")}
                  >
                    Update Profile
                  </button>
                </SettingRow>

                <SettingRow
                  icon="grid"
                  title="Default Dashboard"
                  description="Choose which dashboard you see when you log in."
                  color="blue"
                >
                  <select
                    className={styles.select}
                    defaultValue="Overview"
                  >
                    <option>Overview</option>
                    <option>My Properties</option>
                    <option>Fraud Watch</option>
                  </select>
                </SettingRow>

                <SettingRow
                  icon="calendar"
                  title="Date Format"
                  description="Choose your preferred date format."
                  color="purple"
                >
                  <select
                    className={styles.select}
                    defaultValue="MM DD, YYYY"
                  >
                    <option>MM DD, YYYY</option>
                    <option>DD MM, YYYY</option>
                    <option>YYYY MM DD</option>
                  </select>
                </SettingRow>

                <SettingRow
                  icon="clock"
                  title="Time Zone"
                  description="Choose your current time zone."
                  color="yellow"
                >
                  <select
                    className={`${styles.select} ${styles.timezone}`}
                    defaultValue="(GMT+01:00) West Africa Time"
                  >
                    <option>
                      (GMT+01:00) West Africa Time
                    </option>
                    <option>
                      (GMT+00:00) Greenwich Mean Time
                    </option>
                    <option>
                      (GMT+02:00) Central Africa Time
                    </option>
                  </select>
                </SettingRow>

                <SettingRow
                  icon="ruler"
                  title="Measurement System"
                  description="Choose your preferred measurement system."
                  color="cyan"
                >
                  <select
                    className={styles.select}
                    defaultValue="Metric (m, kg, °C)"
                  >
                    <option>Metric (m, kg, °C)</option>
                    <option>Imperial (ft, lb, °F)</option>
                  </select>
                </SettingRow>

                <SettingRow
                  icon="refresh"
                  title="Auto-refresh Dashboard"
                  description="Automatically refresh dashboard data."
                  color="green"
                >
                  <Toggle
                    enabled={autoRefresh}
                    onChange={() => setAutoRefresh((v) => !v)}
                  />
                </SettingRow>

                <SettingRow
                  icon="compact"
                  title="Compact Mode"
                  description="Display more content in less space."
                  color="blue"
                >
                  <Toggle
                    enabled={compactMode}
                    onChange={() => setCompactMode((v) => !v)}
                  />
                </SettingRow>
              </div>
            </section>

            {/* DANGER ZONE */}
            <section className={styles.dangerCard}>
              <div className={styles.sectionHeader}>
                <h2>Danger Zone</h2>
                <p>Irreversible and sensitive actions.</p>
              </div>

              <div className={styles.dangerRow}>
                <div className={styles.dangerIcon}>
                  <Icon name="trash" size={20} />
                </div>

                <div className={styles.dangerText}>
                  <strong>Delete Account</strong>
                  <span>
                    Permanently delete your account and all associated data.
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => setDeleteModal(true)}
                >
                  Delete My Account
                </button>
              </div>
            </section>

            {/* SAVE NOTICE */}
            <div className={styles.saveNotice}>
              <div className={styles.saveIcon}>
                <Icon name="shield" size={21} />
              </div>

              <div>
                <strong>Your settings are automatically saved</strong>
                <p>
                  All changes you make to your settings are saved
                  automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MOBILE CONTENT ================= */}
        <div className={styles.mobileContent}>
          <div className={styles.mobileLabel}>SETTINGS CATEGORIES</div>

          <section className={styles.mobileCategoriesCard}>
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}

            <button
              type="button"
              className={styles.mobileSignOut}
              onClick={signOut}
            >
              <span className={styles.signOutIcon}>
                <Icon name="logout" size={19} />
              </span>

              <span className={styles.signOutText}>
                <strong>Sign Out</strong>
                <small>Sign out of your account</small>
              </span>

              <Icon name="chevron" size={18} />
            </button>
          </section>

          {/* QUICK SETTINGS */}
          <div className={styles.quickLabel}>QUICK SETTINGS</div>

          <section className={styles.quickCard}>
            <SettingRow
              icon="refresh"
              title="Auto-refresh Dashboard"
              description="Automatically refresh dashboard data."
              color="green"
            >
              <Toggle
                enabled={autoRefresh}
                onChange={() => setAutoRefresh((v) => !v)}
              />
            </SettingRow>

            <SettingRow
              icon="compact"
              title="Compact Mode"
              description="Display more content in less space."
              color="blue"
            >
              <Toggle
                enabled={compactMode}
                onChange={() => setCompactMode((v) => !v)}
              />
            </SettingRow>

            <button type="button" className={styles.themeRow}>
              <span className={`${styles.settingIcon} ${styles.cyan}`}>
                <Icon name="palette" size={18} />
              </span>

              <span className={styles.themeText}>
                <strong>Theme</strong>
                <small>Choose your preferred theme</small>
              </span>

              <span className={styles.themeValue}>Dark</span>

              <Icon name="chevron" size={18} />
            </button>
          </section>

          {/* MOBILE DANGER */}
          <section className={styles.mobileDanger}>
            <div className={styles.sectionHeader}>
              <h2>Danger Zone</h2>
              <p>Irreversible and sensitive actions.</p>
            </div>

            <div className={styles.mobileDangerInfo}>
              <div className={styles.dangerIcon}>
                <Icon name="trash" size={20} />
              </div>

              <div className={styles.dangerText}>
                <strong>Delete Account</strong>
                <span>
                  Permanently delete your account and all associated data.
                </span>
              </div>
            </div>

            <button
              type="button"
              className={styles.mobileDeleteButton}
              onClick={() => setDeleteModal(true)}
            >
              Delete My Account
            </button>
          </section>
        </div>
      </section>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className={styles.mobileBottomNav}>
        <Link href="/dashboard">
          <Icon name="home" size={21} />
          <span>Dashboard</span>
        </Link>

        <Link href="/verification-history">
          <Icon name="history" size={21} />
          <span>History</span>
        </Link>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => alert("Start new verification")}
        >
          <Icon name="plus" size={30} />
        </button>

        <Link href="/my-properties">
          <Icon name="properties" size={21} />
          <span>Properties</span>
        </Link>

        <Link href="/account" className={styles.activeBottom}>
          <Icon name="account" size={21} />
          <span>Account</span>
        </Link>
      </nav>

      {/* ================= DELETE MODAL ================= */}
      {deleteModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setDeleteModal(false)}
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalIcon}>
              <Icon name="trash" size={25} />
            </div>

            <h3>Delete your account?</h3>

            <p>
              This action is permanent. Your account and all associated
              data will be deleted and cannot be recovered.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmDelete}
                onClick={() => {
                  setDeleteModal(false);
                  alert("Account deletion would be processed here.");
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}