"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./data-privacy.module.css";
import { supabase } from "../../lib/supabase";

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "dashboard"
  | "verify"
  | "properties"
  | "history"
  | "fraud"
  | "reports"
  | "account"
  | "settings"
  | "bell"
  | "document"
  | "database"
  | "historyData"
  | "download"
  | "trash"
  | "shield"
  | "lock"
  | "chevron"
  | "menu"
  | "logout"
  | "back";

function Icon({
  name,
  size,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const icons: Record<IconName, string> = {
    dashboard: "▦",
    verify: "⇧",
    properties: "⌂",
    history: "◷",
    fraud: "◈",
    reports: "▤",
    account: "◯",
    settings: "⚙",
    bell: "🔔",

    document: "▤",
    database: "▦",
    historyData: "◷",
    download: "↓",
    trash: "⌫",
    shield: "◇",
    lock: "▣",
    chevron: "›",
    menu: "☰",
    logout: "↪",
    back: "‹",
  };

  return (
    <span
      className={`${styles.icon} ${className}`}
      style={{
        fontSize: size ? `${size}px` : undefined,
      }}
      aria-hidden="true"
    >
      {icons[name]}
    </span>
  );
}

/*
============================================================
MOBILE NAVIGATION
============================================================
*/

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard" as IconName,
  },
  {
    label: "Verify Property",
    href: "/verify",
    icon: "verify" as IconName,
  },
  {
    label: "My Properties",
    href: "/my-properties",
    icon: "properties" as IconName,
  },
  {
    label: "Verification History",
    href: "/verification-history",
    icon: "history" as IconName,
  },
  {
    label: "Fraud Watch",
    href: "/fraud-watch",
    icon: "fraud" as IconName,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "reports" as IconName,
  },
];

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
      aria-label={label}
      aria-pressed={enabled}
    >
      <span />
    </button>
  );
}

/*
============================================================
SETTING ROW
============================================================
*/

function SettingRow({
  icon,
  title,
  description,
  children,
  color = "blue",
}: {
  icon: IconName;
  title: string;
  description: string;
  children: ReactNode;
  color?: string;
}) {
  return (
    <div className={styles.settingRow}>
      <div
        className={`${styles.settingIcon} ${styles[color]}`}
      >
        <Icon name={icon} size={18} />
      </div>

      <div className={styles.settingText}>
        <div className={styles.settingTitle}>
          {title}
        </div>

        <div className={styles.settingDescription}>
          {description}
        </div>
      </div>

      <div className={styles.settingControl}>
        {children}
      </div>
    </div>
  );
}

/*
============================================================
ACTION ROW
============================================================
*/

function ActionRow({
  icon = "trash",
  title,
  description,
  buttonLabel,
  onClick,
}: {
  icon?: IconName;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className={styles.actionRow}>
      <div
        className={`${styles.settingIcon} ${styles.gray}`}
      >
        <Icon name={icon} size={18} />
      </div>

      <div className={styles.settingText}>
        <div className={styles.settingTitle}>
          {title}
        </div>

        <div className={styles.settingDescription}>
          {description}
        </div>
      </div>

      <button
        type="button"
        className={styles.outlineDanger}
        onClick={onClick}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

/*
============================================================
PAGE
============================================================
*/

export default function DataPrivacyPage() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [documentRetention, setDocumentRetention] =
    useState(true);

  const [verificationHistory, setVerificationHistory] =
    useState(true);

  const [serviceImprovement, setServiceImprovement] =
    useState(true);

  const [thirdPartyProcessing, setThirdPartyProcessing] =
    useState(false);

  /*
  ============================================================
  DELETE MODAL
  ============================================================
  */

  const [deleteModal, setDeleteModal] =
    useState<
      "documents" | "history" | "account" | null
    >(null);

  /*
  ============================================================
  EXPORT MODAL

  confirm = first confirmation screen
  success = request successfully submitted
  null    = closed
  ============================================================
  */

  const [exportModal, setExportModal] =
    useState<
      "confirm" | "success" | null
    >(null);

  const [user, setUser] = useState({
    fullName: "User",
    initial: "U",
    plan: "Free Plan",
  });

  /*
  ============================================================
  LOAD USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        setLoadingUser(true);

        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error(
            "Could not load authenticated user:",
            error
          );

          return;
        }

        if (!authUser) {
          router.replace("/signin");
          return;
        }

        if (!mounted) {
          return;
        }

        const metadata =
          authUser.user_metadata || {};

        const metadataName =
          metadata.full_name ||
          metadata.name ||
          metadata.display_name ||
          "";

        const email = authUser.email || "";

        const fallbackName = email
          ? email
              .split("@")[0]
              .replace(/[._-]+/g, " ")
              .replace(
                /\b\w/g,
                (letter: string) =>
                  letter.toUpperCase()
              )
          : "User";

        const fullName =
          String(metadataName).trim() ||
          fallbackName;

        const initial =
          fullName
            .trim()
            .charAt(0)
            .toUpperCase() || "U";

        const metadataPlan =
          metadata.plan ||
          metadata.subscription_plan ||
          metadata.account_plan ||
          "Free Plan";

        setUser({
          fullName,
          initial,
          plan: String(metadataPlan),
        });
      } catch (error) {
        console.error(
          "Privacy page user loading error:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const openNotifications = () => {
    setMenuOpen(false);

    router.push(
      "/settings/notifications"
    );
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();

      router.replace("/signin");
    } catch (error) {
      console.error(
        "Sign out error:",
        error
      );
    }
  };

  /*
  ============================================================
  DATA ACTIONS
  ============================================================
  */

  /*
  ------------------------------------------------------------
  OPEN EXPORT CONFIRMATION
  ------------------------------------------------------------
  */

  const handleExportData = () => {
    setExportModal("confirm");
  };

  /*
  ------------------------------------------------------------
  CONFIRM EXPORT REQUEST

  This currently confirms the request in the UI only.
  The real export backend can be connected later.
  ------------------------------------------------------------
  */

  const confirmExportRequest = () => {
    setExportModal("success");
  };

  /*
  ------------------------------------------------------------
  DELETE ACTIONS
  ------------------------------------------------------------
  */

  const handleDeleteAction = () => {
    if (deleteModal === "documents") {
      alert(
        "Document deletion will be processed here."
      );
    }

    if (deleteModal === "history") {
      alert(
        "Verification history deletion will be processed here."
      );
    }

    if (deleteModal === "account") {
      alert(
        "Account deletion will be processed through the secure account deletion process."
      );
    }

    setDeleteModal(null);
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loadingUser) {
    return (
      <main className={styles.loading}>
        <div className={styles.loadingBrand}>
          <span className={styles.loadingLogo}>
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <div className={styles.loadingText}>
          Loading your privacy settings...
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {/* =====================================================
          DESKTOP TOP HEADER
      ===================================================== */}

      <header className={styles.desktopTopHeader}>
        <button
          type="button"
          className={styles.desktopBrand}
          onClick={() =>
            navigateTo("/dashboard")
          }
          aria-label="PropertySure AI Dashboard"
        >
          <span
            className={
              styles.desktopBrandDiamond
            }
          >
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </button>

        <button
          type="button"
          className={styles.desktopNotification}
          onClick={openNotifications}
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            size={17}
          />

          <span
            className={
              styles.desktopNotificationDot
            }
          />
        </button>
      </header>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation"
        >
          <Icon name="menu" size={24} />
        </button>

        <button
          type="button"
          className={styles.mobileLogoButton}
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <span
            className={
              styles.mobileLogoDiamond
            }
          >
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </button>

        <button
          type="button"
          className={styles.mobileBell}
          onClick={openNotifications}
          aria-label="Notifications"
        >
          <Icon name="bell" size={17} />

          <span
            className={
              styles.mobileNotificationDot
            }
          />
        </button>
      </header>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuHeader}>
            <div>
              <button
                type="button"
                className={styles.mobileMenuLogo}
                onClick={() =>
                  navigateTo("/dashboard")
                }
              >
                <span>◆</span>

                <div>
                  PropertySure
                  <strong> AI</strong>
                </div>
              </button>

              <div
                className={
                  styles.mobileMenuSubtitle
                }
              >
                AI-Powered Property
                Due Diligence
              </div>
            </div>

            <button
              type="button"
              className={styles.closeMenu}
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close navigation"
            >
              ×
            </button>
          </div>

          <nav
            className={styles.mobileMenuNav}
          >
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                className={styles.mobileNavItem}
                onClick={() =>
                  navigateTo(item.href)
                }
              >
                <span
                  className={styles.navIcon}
                >
                  <Icon
                    name={item.icon}
                    size={18}
                  />
                </span>

                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div
            className={
              styles.mobileAccountLabel
            }
          >
            ACCOUNT
          </div>

          <button
            type="button"
            className={styles.mobileNavItem}
            onClick={() =>
              navigateTo("/account")
            }
          >
            <span
              className={styles.navIcon}
            >
              <Icon
                name="account"
                size={18}
              />
            </span>

            <span>Account</span>
          </button>

          <button
            type="button"
            className={`${styles.mobileNavItem} ${styles.mobileNavActive}`}
            onClick={() =>
              navigateTo("/settings")
            }
          >
            <span
              className={styles.navIcon}
            >
              <Icon
                name="settings"
                size={18}
              />
            </span>

            <span>Settings</span>
          </button>

          <button
            type="button"
            className={`${styles.mobileNavItem} ${styles.logoutItem}`}
            onClick={signOut}
          >
            <span
              className={styles.navIcon}
            >
              <Icon
                name="logout"
                size={18}
              />
            </span>

            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className={styles.main}>
        {/* ===================================================
            DESKTOP PAGE HEADER
        =================================================== */}

        <header
          className={styles.desktopPageHeader}
        >
          <div
            className={
              styles.desktopPageHeaderInner
            }
          >
            <h1>Data & Privacy</h1>

            <p>
              Manage how your data is
              stored, used, and
              controlled within
              PropertySure AI.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={() =>
                navigateTo("/settings")
              }
            >
              <Icon
                name="back"
                size={20}
              />

              <span>
                Back to Settings
              </span>
            </button>
          </div>
        </header>

        {/* ===================================================
            DESKTOP CONTENT
        =================================================== */}

        <div className={styles.contentGrid}>
          <div className={styles.settingsContent}>
            {/* =================================================
                YOUR DATA
            ================================================= */}

            <section className={styles.card}>
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>Your Data</h2>

                <p>
                  Understand the information
                  PropertySure AI stores as
                  part of your account and
                  property verification
                  activity.
                </p>
              </div>

              <div
                className={
                  styles.dataOverview
                }
              >
                <div className={styles.dataItem}>
                  <div
                    className={`${styles.dataIcon} ${styles.blue}`}
                  >
                    <Icon
                      name="document"
                      size={18}
                    />
                  </div>

                  <div>
                    <strong>
                      Property Documents
                    </strong>

                    <span>
                      Documents you submit
                      for verification.
                    </span>
                  </div>
                </div>

                <div className={styles.dataItem}>
                  <div
                    className={`${styles.dataIcon} ${styles.green}`}
                  >
                    <Icon
                      name="reports"
                      size={18}
                    />
                  </div>

                  <div>
                    <strong>
                      Verification Reports
                    </strong>

                    <span>
                      Reports generated from
                      your verification
                      requests.
                    </span>
                  </div>
                </div>

                <div className={styles.dataItem}>
                  <div
                    className={`${styles.dataIcon} ${styles.purple}`}
                  >
                    <Icon
                      name="properties"
                      size={18}
                    />
                  </div>

                  <div>
                    <strong>
                      Property Information
                    </strong>

                    <span>
                      Information associated
                      with properties you
                      verify.
                    </span>
                  </div>
                </div>

                <div className={styles.dataItem}>
                  <div
                    className={`${styles.dataIcon} ${styles.yellow}`}
                  >
                    <Icon
                      name="account"
                      size={18}
                    />
                  </div>

                  <div>
                    <strong>
                      Account Information
                    </strong>

                    <span>
                      Information associated
                      with your PropertySure
                      account.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                DOCUMENT STORAGE
            ================================================= */}

            <section className={styles.card}>
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>Document Storage</h2>

                <p>
                  Control how long
                  documents submitted for
                  verification remain
                  available.
                </p>
              </div>

              <div
                className={
                  styles.settingsRows
                }
              >
                <SettingRow
                  icon="database"
                  title="Document Retention"
                  description="Keep submitted property documents available in your verification records."
                  color="blue"
                >
                  <Toggle
                    enabled={
                      documentRetention
                    }
                    onChange={() =>
                      setDocumentRetention(
                        (value) => !value
                      )
                    }
                    label="Toggle document retention"
                  />
                </SettingRow>

                <ActionRow
                  title="Delete Stored Documents"
                  description="Permanently remove documents stored in your account."
                  buttonLabel="Delete Documents"
                  onClick={() =>
                    setDeleteModal(
                      "documents"
                    )
                  }
                />
              </div>
            </section>

            {/* =================================================
                VERIFICATION HISTORY
            ================================================= */}

            <section className={styles.card}>
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>
                  Verification History
                </h2>

                <p>
                  Control how your previous
                  property verification
                  activity is retained.
                </p>
              </div>

              <div
                className={
                  styles.settingsRows
                }
              >
                <SettingRow
                  icon="historyData"
                  title="Keep Verification History"
                  description="Keep completed verification records available in your account."
                  color="cyan"
                >
                  <Toggle
                    enabled={
                      verificationHistory
                    }
                    onChange={() =>
                      setVerificationHistory(
                        (value) => !value
                      )
                    }
                    label="Toggle verification history"
                  />
                </SettingRow>

                <ActionRow
                  title="Clear Verification History"
                  description="Remove your previous verification records from your account."
                  buttonLabel="Clear History"
                  onClick={() =>
                    setDeleteModal("history")
                  }
                />
              </div>
            </section>

            {/* =================================================
                PRIVACY PREFERENCES
            ================================================= */}

            <section className={styles.card}>
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>
                  Privacy Preferences
                </h2>

                <p>
                  Choose how PropertySure AI
                  may use information to
                  improve the service.
                </p>
              </div>

              <div
                className={
                  styles.settingsRows
                }
              >
                <SettingRow
                  icon="shield"
                  title="Service Improvement"
                  description="Allow information about how you use PropertySure AI to help improve the service."
                  color="green"
                >
                  <Toggle
                    enabled={
                      serviceImprovement
                    }
                    onChange={() =>
                      setServiceImprovement(
                        (value) => !value
                      )
                    }
                    label="Toggle service improvement"
                  />
                </SettingRow>

                <SettingRow
                  icon="lock"
                  title="Third-Party Processing"
                  description="Allow approved third-party services to process information when required to provide verification services."
                  color="purple"
                >
                  <Toggle
                    enabled={
                      thirdPartyProcessing
                    }
                    onChange={() =>
                      setThirdPartyProcessing(
                        (value) => !value
                      )
                    }
                    label="Toggle third-party processing"
                  />
                </SettingRow>
              </div>
            </section>

            {/* =================================================
                EXPORT DATA
            ================================================= */}

            <section className={styles.card}>
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>Export Your Data</h2>

                <p>
                  Request a copy of
                  information associated
                  with your PropertySure AI
                  account.
                </p>
              </div>

              <div
                className={styles.exportBox}
              >
                <div
                  className={`${styles.exportIcon} ${styles.blue}`}
                >
                  <Icon
                    name="download"
                    size={20}
                  />
                </div>

                <div
                  className={styles.exportText}
                >
                  <strong>
                    Request Data Export
                  </strong>

                  <span>
                    Your export can include
                    your account,
                    verification history,
                    and available property
                    data.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    styles.exportButton
                  }
                  onClick={
                    handleExportData
                  }
                >
                  Request Export
                </button>
              </div>
            </section>

            {/* =================================================
                DANGER ZONE
            ================================================= */}

            <section
              className={
                styles.dangerCard
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>Danger Zone</h2>

                <p>
                  Irreversible and
                  sensitive actions.
                </p>
              </div>

              <div
                className={styles.dangerRow}
              >
                <div
                  className={
                    styles.dangerIcon
                  }
                >
                  <Icon
                    name="trash"
                    size={20}
                  />
                </div>

                <div
                  className={
                    styles.dangerText
                  }
                >
                  <strong>
                    Delete Account
                  </strong>

                  <span>
                    Permanently delete your
                    PropertySure AI account
                    and associated data.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    styles.deleteButton
                  }
                  onClick={() =>
                    setDeleteModal(
                      "account"
                    )
                  }
                >
                  Delete My Account
                </button>
              </div>
            </section>

            {/* =================================================
                PRIVACY NOTICE
            ================================================= */}

            <div
              className={
                styles.saveNotice
              }
            >
              <div
                className={
                  styles.saveIcon
                }
              >
                <Icon
                  name="shield"
                  size={20}
                />
              </div>

              <div>
                <strong>
                  Your privacy settings
                  are automatically saved
                </strong>

                <p>
                  Changes to your privacy
                  preferences are saved
                  automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            MOBILE CONTENT
        =================================================== */}

        <div className={styles.mobileContent}>
          <div
            className={
              styles.mobilePageHeader
            }
          >
            <button
              type="button"
              className={
                styles.mobileBackButton
              }
              onClick={() =>
                navigateTo("/settings")
              }
            >
              <Icon
                name="back"
                size={20}
              />

              <span>Settings</span>
            </button>

            <div
              className={
                styles.mobileEyebrow
              }
            >
              DATA & PRIVACY
            </div>

            <h1>Data & Privacy</h1>

            <p>
              Manage how your data is
              stored, used, and
              controlled.
            </p>
          </div>

          {/* =================================================
              MOBILE YOUR DATA
          ================================================= */}

          <div
            className={
              styles.mobileSectionLabel
            }
          >
            YOUR DATA
          </div>

          <section
            className={
              styles.mobileCard
            }
          >
            <div
              className={
                styles.mobileDataItem
              }
            >
              <div
                className={`${styles.dataIcon} ${styles.blue}`}
              >
                <Icon
                  name="document"
                  size={18}
                />
              </div>

              <div>
                <strong>
                  Property Documents
                </strong>

                <span>
                  Documents submitted for
                  verification.
                </span>
              </div>
            </div>

            <div
              className={
                styles.mobileDataItem
              }
            >
              <div
                className={`${styles.dataIcon} ${styles.green}`}
              >
                <Icon
                  name="reports"
                  size={18}
                />
              </div>

              <div>
                <strong>
                  Verification Reports
                </strong>

                <span>
                  Reports generated from
                  your verification
                  requests.
                </span>
              </div>
            </div>

            <div
              className={
                styles.mobileDataItem
              }
            >
              <div
                className={`${styles.dataIcon} ${styles.purple}`}
              >
                <Icon
                  name="properties"
                  size={18}
                />
              </div>

              <div>
                <strong>
                  Property Information
                </strong>

                <span>
                  Information connected to
                  verified properties.
                </span>
              </div>
            </div>

            <div
              className={
                styles.mobileDataItem
              }
            >
              <div
                className={`${styles.dataIcon} ${styles.yellow}`}
              >
                <Icon
                  name="account"
                  size={18}
                />
              </div>

              <div>
                <strong>
                  Account Information
                </strong>

                <span>
                  Information associated
                  with your PropertySure
                  account.
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              MOBILE DOCUMENT STORAGE
          ================================================= */}

          <div
            className={
              styles.mobileSectionLabel
            }
          >
            DOCUMENT STORAGE
          </div>

          <section
            className={
              styles.mobileCard
            }
          >
            <SettingRow
              icon="database"
              title="Document Retention"
              description="Keep submitted property documents available."
              color="blue"
            >
              <Toggle
                enabled={
                  documentRetention
                }
                onChange={() =>
                  setDocumentRetention(
                    (value) => !value
                  )
                }
                label="Toggle document retention"
              />
            </SettingRow>

            <div
              className={
                styles.mobileActionRow
              }
            >
              <div
                className={`${styles.settingIcon} ${styles.gray}`}
              >
                <Icon
                  name="trash"
                  size={18}
                />
              </div>

              <div
                className={
                  styles.settingText
                }
              >
                <div
                  className={
                    styles.settingTitle
                  }
                >
                  Delete Stored Documents
                </div>

                <div
                  className={
                    styles.settingDescription
                  }
                >
                  Permanently remove
                  documents stored in
                  your account.
                </div>
              </div>

              <button
                type="button"
                className={
                  styles.mobileActionButton
                }
                onClick={() =>
                  setDeleteModal(
                    "documents"
                  )
                }
              >
                Delete
              </button>
            </div>
          </section>

          {/* =================================================
              MOBILE VERIFICATION HISTORY
          ================================================= */}

          <div
            className={
              styles.mobileSectionLabel
            }
          >
            VERIFICATION HISTORY
          </div>

          <section
            className={
              styles.mobileCard
            }
          >
            <SettingRow
              icon="historyData"
              title="Keep Verification History"
              description="Keep completed verification records."
              color="cyan"
            >
              <Toggle
                enabled={
                  verificationHistory
                }
                onChange={() =>
                  setVerificationHistory(
                    (value) => !value
                  )
                }
                label="Toggle verification history"
              />
            </SettingRow>

            <div
              className={
                styles.mobileActionRow
              }
            >
              <div
                className={`${styles.settingIcon} ${styles.gray}`}
              >
                <Icon
                  name="trash"
                  size={18}
                />
              </div>

              <div
                className={
                  styles.settingText
                }
              >
                <div
                  className={
                    styles.settingTitle
                  }
                >
                  Clear Verification
                  History
                </div>

                <div
                  className={
                    styles.settingDescription
                  }
                >
                  Remove your previous
                  verification records
                  from your account.
                </div>
              </div>

              <button
                type="button"
                className={
                  styles.mobileActionButton
                }
                onClick={() =>
                  setDeleteModal(
                    "history"
                  )
                }
              >
                Clear
              </button>
            </div>
          </section>

          {/* =================================================
              MOBILE PRIVACY CONTROLS
          ================================================= */}

          <div
            className={
              styles.mobileSectionLabel
            }
          >
            PRIVACY CONTROLS
          </div>

          <section
            className={
              styles.mobileCard
            }
          >
            <SettingRow
              icon="shield"
              title="Service Improvement"
              description="Help improve PropertySure AI."
              color="green"
            >
              <Toggle
                enabled={
                  serviceImprovement
                }
                onChange={() =>
                  setServiceImprovement(
                    (value) => !value
                  )
                }
                label="Toggle service improvement"
              />
            </SettingRow>

            <SettingRow
              icon="lock"
              title="Third-Party Processing"
              description="Allow approved services when required."
              color="purple"
            >
              <Toggle
                enabled={
                  thirdPartyProcessing
                }
                onChange={() =>
                  setThirdPartyProcessing(
                    (value) => !value
                  )
                }
                label="Toggle third-party processing"
              />
            </SettingRow>
          </section>

          {/* =================================================
              MOBILE EXPORT
          ================================================= */}

          <div
            className={
              styles.mobileSectionLabel
            }
          >
            YOUR INFORMATION
          </div>

          <section
            className={
              styles.mobileCard
            }
          >
            <div
              className={
                styles.mobileExport
              }
            >
              <div
                className={`${styles.dataIcon} ${styles.blue}`}
              >
                <Icon
                  name="download"
                  size={19}
                />
              </div>

              <div
                className={
                  styles.mobileExportText
                }
              >
                <strong>
                  Request Data Export
                </strong>

                <span>
                  Request a copy of your
                  available account data.
                </span>
              </div>
            </div>

            <button
              type="button"
              className={
                styles.mobileExportButton
              }
              onClick={
                handleExportData
              }
            >
              Request Data Export
            </button>
          </section>

          {/* =================================================
              MOBILE DANGER
          ================================================= */}

          <section
            className={
              styles.mobileDanger
            }
          >
            <div
              className={
                styles.sectionHeader
              }
            >
              <h2>Danger Zone</h2>

              <p>
                Irreversible and
                sensitive actions.
              </p>
            </div>

            <div
              className={
                styles.mobileDangerInfo
              }
            >
              <div
                className={
                  styles.dangerIcon
                }
              >
                <Icon
                  name="trash"
                  size={20}
                />
              </div>

              <div
                className={
                  styles.dangerText
                }
              >
                <strong>
                  Delete Account
                </strong>

                <span>
                  Permanently delete your
                  account and associated
                  data.
                </span>
              </div>
            </div>

            <button
              type="button"
              className={
                styles.mobileDeleteButton
              }
              onClick={() =>
                setDeleteModal("account")
              }
            >
              Delete My Account
            </button>
          </section>

          {/* =================================================
              MOBILE PRIVACY NOTICE
          ================================================= */}

          <div
            className={
              styles.mobilePrivacyNotice
            }
          >
            <Icon
              name="shield"
              size={18}
            />

            <div>
              <strong>
                Your privacy settings are
                automatically saved.
              </strong>

              <span>
                Changes are saved
                automatically.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ===================================================== */}

      <nav
        className={
          styles.mobileBottomNav
        }
      >
        <button
          type="button"
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <Icon
            name="dashboard"
            size={20}
          />

          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/verify")
          }
        >
          <Icon
            name="verify"
            size={20}
          />

          <span>Verify</span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/my-properties")
          }
        >
          <Icon
            name="properties"
            size={20}
          />

          <span>Properties</span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/reports")
          }
        >
          <Icon
            name="reports"
            size={20}
          />

          <span>Reports</span>
        </button>

        <button
          type="button"
          className={styles.activeBottom}
          onClick={() =>
            navigateTo("/settings")
          }
        >
          <Icon
            name="settings"
            size={20}
          />

          <span>Settings</span>
        </button>
      </nav>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteModal && (
        <div
          className={
            styles.modalBackdrop
          }
          onClick={() =>
            setDeleteModal(null)
          }
        >
          <div
            className={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className={
                styles.modalIcon
              }
            >
              <Icon
                name="trash"
                size={25}
              />
            </div>

            <h3>
              {deleteModal ===
              "documents"
                ? "Delete stored documents?"
                : deleteModal ===
                  "history"
                ? "Clear verification history?"
                : "Delete your account?"}
            </h3>

            <p>
              {deleteModal ===
              "documents"
                ? "This will permanently remove the selected stored documents from your account."
                : deleteModal ===
                  "history"
                ? "This will permanently remove your previous verification history."
                : "This action is permanent. Your PropertySure AI account and associated data may be deleted and cannot be recovered."}
            </p>

            <div
              className={
                styles.modalActions
              }
            >
              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={() =>
                  setDeleteModal(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  styles.confirmDelete
                }
                onClick={
                  handleDeleteAction
                }
              >
                {deleteModal ===
                "account"
                  ? "Delete Account"
                  : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EXPORT DATA MODAL
      ===================================================== */}

      {exportModal && (
        <div
          className={
            styles.modalBackdrop
          }
          onClick={() =>
            setExportModal(null)
          }
        >
          <div
            className={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {exportModal === "confirm" ? (
              <>
                <div
                  className={
                    styles.saveIcon
                  }
                >
                  <Icon
                    name="download"
                    size={22}
                  />
                </div>

                <h3>
                  Request Your Data Export
                </h3>

                <p>
                  Request a copy of the
                  information associated
                  with your PropertySure AI
                  account.
                </p>

                <div
                  style={{
                    marginTop: "16px",
                    padding: "13px",
                    borderRadius: "8px",
                    background:
                      "#f6f9fc",
                    border:
                      "1px solid #e1e8f0",
                  }}
                >
                  <div
                    style={{
                      color: "#18253a",
                      fontSize: "11px",
                      fontWeight: 700,
                      marginBottom:
                        "8px",
                    }}
                  >
                    Your export may include:
                  </div>

                  <div
                    style={{
                      color: "#71849e",
                      fontSize: "9px",
                      lineHeight: 1.7,
                    }}
                  >
                    • Account information
                    <br />
                    • Property information
                    <br />
                    • Verification history
                    <br />
                    • Verification reports
                    <br />
                    • Other available
                    account data
                  </div>
                </div>

                <p
                  style={{
                    marginTop: "12px",
                  }}
                >
                  Your information will be
                  prepared securely. You
                  will be notified when the
                  export is ready.
                </p>

                <div
                  className={
                    styles.modalActions
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.cancelButton
                    }
                    onClick={() =>
                      setExportModal(null)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className={
                      styles.exportButton
                    }
                    onClick={
                      confirmExportRequest
                    }
                  >
                    Request Data Export
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  className={
                    styles.saveIcon
                  }
                >
                  <Icon
                    name="shield"
                    size={22}
                  />
                </div>

                <h3>
                  Export Request Received
                </h3>

                <p>
                  Your data export request
                  has been received
                  successfully.
                </p>

                <div
                  style={{
                    marginTop: "16px",
                    padding: "13px",
                    borderRadius: "8px",
                    background:
                      "#f6f9fc",
                    border:
                      "1px solid #e1e8f0",
                  }}
                >
                  <div
                    style={{
                      color: "#18253a",
                      fontSize: "10px",
                      fontWeight: 600,
                      lineHeight: 1.5,
                    }}
                  >
                    We will prepare the
                    available data associated
                    with your account and
                    notify you when your export
                    is ready.
                  </div>
                </div>

                <div
                  className={
                    styles.modalActions
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.exportButton
                    }
                    onClick={() =>
                      setExportModal(null)
                    }
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}