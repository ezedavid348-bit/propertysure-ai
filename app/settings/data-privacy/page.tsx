"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import AppShell from "../../AppShell/AppShell";
import LoadingScreen from "../../AppShell/LoadingScreen";
import { supabase } from "../../lib/supabase";

import styles from "./data-privacy.module.css";

/*
============================================================
TYPES
============================================================
*/

type PrivacyPreferences = {
  documentRetention: boolean;
  verificationHistory: boolean;
  serviceImprovement: boolean;
  thirdPartyProcessing: boolean;
};

type ModalType =
  | "documents"
  | "history"
  | "account"
  | "export"
  | null;

/*
============================================================
CONSTANTS
============================================================
*/

const STORAGE_BUCKET = "property-documents";

const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  documentRetention: true,
  verificationHistory: true,
  serviceImprovement: true,
  thirdPartyProcessing: false,
};

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "document"
  | "database"
  | "history"
  | "download"
  | "trash"
  | "shield"
  | "lock"
  | "chevron"
  | "back"
  | "check"
  | "close"
  | "warning";

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const icons: Record<IconName, string> = {
    document: "▤",
    database: "▦",
    history: "◷",
    download: "↓",
    trash: "⌫",
    shield: "◇",
    lock: "▣",
    chevron: "›",
    back: "←",
    check: "✓",
    close: "×",
    warning: "!",
  };

  return (
    <span
      className={styles.icon}
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
HELPERS
============================================================
*/

function asPrivacyPreferences(
  value: unknown,
): PrivacyPreferences {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return DEFAULT_PRIVACY_PREFERENCES;
  }

  const source =
    value as Partial<PrivacyPreferences>;

  return {
    documentRetention:
      typeof source.documentRetention ===
      "boolean"
        ? source.documentRetention
        : DEFAULT_PRIVACY_PREFERENCES.documentRetention,

    verificationHistory:
      typeof source.verificationHistory ===
      "boolean"
        ? source.verificationHistory
        : DEFAULT_PRIVACY_PREFERENCES.verificationHistory,

    serviceImprovement:
      typeof source.serviceImprovement ===
      "boolean"
        ? source.serviceImprovement
        : DEFAULT_PRIVACY_PREFERENCES.serviceImprovement,

    thirdPartyProcessing:
      typeof source.thirdPartyProcessing ===
      "boolean"
        ? source.thirdPartyProcessing
        : DEFAULT_PRIVACY_PREFERENCES.thirdPartyProcessing,
  };
}

function chunkArray<T>(
  items: T[],
  size: number,
): T[][] {
  const chunks: T[][] = [];

  for (
    let index = 0;
    index < items.length;
    index += size
  ) {
    chunks.push(
      items.slice(index, index + size),
    );
  }

  return chunks;
}

/*
============================================================
PAGE
============================================================
*/

export default function DataPrivacyPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [preferences, setPreferences] =
    useState<PrivacyPreferences>(
      DEFAULT_PRIVACY_PREFERENCES,
    );

  const [savingPreference, setSavingPreference] =
    useState<keyof PrivacyPreferences | null>(
      null,
    );

  const [modal, setModal] =
    useState<ModalType>(null);

  const [processingAction, setProcessingAction] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /*
  ============================================================
  LOAD USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      setLoadingUser(true);
      setErrorMessage("");

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!user) {
          router.replace("/signin");
          return;
        }

        if (!mounted) {
          return;
        }

        const metadata =
          user.user_metadata || {};

        setPreferences(
          asPrivacyPreferences(
            metadata.privacy_preferences,
          ),
        );
      } catch (error) {
        console.error(
          "DATA PRIVACY LOAD ERROR:",
          error,
        );

        if (mounted) {
          setErrorMessage(
            "Unable to load your privacy preferences.",
          );
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    void loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
  ============================================================
  UPDATE PRIVACY PREFERENCE
  ============================================================
  */

  const updatePreference = async (
    key: keyof PrivacyPreferences,
  ) => {
    if (savingPreference) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const nextPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    setPreferences(nextPreferences);
    setSavingPreference(key);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.replace("/signin");
        return;
      }

      const existingMetadata =
        user.user_metadata || {};

      const {
        error: updateError,
      } = await supabase.auth.updateUser({
        data: {
          ...existingMetadata,
          privacy_preferences:
            nextPreferences,
        },
      });

      if (updateError) {
        throw updateError;
      }

      setSuccessMessage(
        "Privacy preference updated.",
      );
    } catch (error) {
      console.error(
        "PRIVACY PREFERENCE UPDATE ERROR:",
        error,
      );

      setPreferences(preferences);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save this privacy preference.",
      );
    } finally {
      setSavingPreference(null);
    }
  };

  /*
  ============================================================
  STORAGE FILE COLLECTION
  ============================================================
  */

  const collectStoredFiles = useCallback(
    async (
      folderPath: string,
    ): Promise<string[]> => {
      const paths: string[] = [];

      const {
        data,
        error,
      } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(folderPath, {
          limit: 1000,
          offset: 0,
        });

      if (error) {
        throw error;
      }

      for (const item of data || []) {
        if (!item?.name) {
          continue;
        }

        const itemPath = folderPath
          ? `${folderPath}/${item.name}`
          : item.name;

        /*
         * Supabase Storage folders have no file id.
         * Actual files have an id.
         */
        if (item.id) {
          paths.push(itemPath);
        } else {
          const nestedFiles =
            await collectStoredFiles(
              itemPath,
            );

          paths.push(...nestedFiles);
        }
      }

      return paths;
    },
    [],
  );

  /*
  ============================================================
  DELETE STORED DOCUMENTS
  ============================================================
  */

  const deleteStoredDocuments =
    async () => {
      if (processingAction) {
        return;
      }

      setProcessingAction(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          router.replace("/signin");
          return;
        }

        const rootPath =
          `${user.id}/verification-uploads`;

        const filePaths =
          await collectStoredFiles(
            rootPath,
          );

        if (filePaths.length === 0) {
          setSuccessMessage(
            "There are no stored property documents to delete.",
          );

          setModal(null);
          return;
        }

        /*
         * Supabase Storage remove operations
         * are processed in batches.
         */
        const batches = chunkArray(
          filePaths,
          1000,
        );

        for (const batch of batches) {
          const {
            error: deleteError,
          } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove(batch);

          if (deleteError) {
            throw deleteError;
          }
        }

        setSuccessMessage(
          "Stored property documents have been deleted.",
        );

        setModal(null);
      } catch (error) {
        console.error(
          "DELETE STORED DOCUMENTS ERROR:",
          error,
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to delete the stored property documents.",
        );
      } finally {
        setProcessingAction(false);
      }
    };

  /*
  ============================================================
  CLEAR VERIFICATION HISTORY
  ============================================================
  */

  const clearVerificationHistory =
    async () => {
      if (processingAction) {
        return;
      }

      setProcessingAction(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          router.replace("/signin");
          return;
        }

        const {
          error: deleteError,
        } = await supabase
          .from("verifications")
          .delete()
          .eq("user_id", user.id);

        if (deleteError) {
          throw deleteError;
        }

        setSuccessMessage(
          "Your verification history has been cleared.",
        );

        setModal(null);
      } catch (error) {
        console.error(
          "CLEAR VERIFICATION HISTORY ERROR:",
          error,
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to clear your verification history.",
        );
      } finally {
        setProcessingAction(false);
      }
    };

  /*
  ============================================================
  EXPORT USER DATA
  ============================================================
  */

  const exportUserData = async () => {
    if (processingAction) {
      return;
    }

    setProcessingAction(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.replace("/signin");
        return;
      }

      const {
        data: verifications,
        error: verificationError,
      } = await supabase
        .from("verifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (verificationError) {
        throw verificationError;
      }

      const metadata = {
        ...(user.user_metadata || {}),
      };

      /*
       * Do not include session tokens,
       * access tokens or refresh tokens.
       */
      delete metadata.access_token;
      delete metadata.refresh_token;

      const exportPayload = {
        exported_at:
          new Date().toISOString(),

        product:
          "PropertySure AI",

        account: {
          id: user.id,
          email: user.email || null,
          phone: user.phone || null,
          created_at:
            user.created_at || null,
          email_confirmed_at:
            user.email_confirmed_at ||
            null,
          last_sign_in_at:
            user.last_sign_in_at ||
            null,
          metadata,
        },

        privacy_preferences:
          preferences,

        verification_records:
          verifications || [],

        note:
          "Uploaded document files are not included in this JSON export.",
      };

      const json = JSON.stringify(
        exportPayload,
        null,
        2,
      );

      const blob = new Blob(
        [json],
        {
          type: "application/json",
        },
      );

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      const date =
        new Date()
          .toISOString()
          .slice(0, 10);

      anchor.href = url;

      anchor.download =
        `propertysure-data-export-${date}.json`;

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(url);

      setSuccessMessage(
        "Your data export has been downloaded.",
      );

      setModal(null);
    } catch (error) {
      console.error(
        "DATA EXPORT ERROR:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to export your data.",
      );
    } finally {
      setProcessingAction(false);
    }
  };

  /*
  ============================================================
  CLOSE MODAL
  ============================================================
  */

  const closeModal = () => {
    if (processingAction) {
      return;
    }

    setModal(null);
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loadingUser) {
    return <LoadingScreen />;
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <AppShell
      activePath="/settings"
      headerPath="/settings"
    >
      <main className={styles.page}>
        <div className={styles.content}>
          {/* ==================================================
              PAGE INTRO
          ================================================== */}

          <section
            className={styles.pageIntro}
          >
            <h1>Data &amp; Privacy</h1>

            <p>
              Manage how your information
              is stored, retained, used,
              and controlled within
              PropertySure AI.
            </p>

            <button
              type="button"
              className={styles.backButton}
              onClick={() =>
                router.push("/settings")
              }
            >
              <span
                className={styles.backArrow}
                aria-hidden="true"
              >
                ←
              </span>

              <span>
                Back to Settings
              </span>
            </button>
          </section>

          {/* ==================================================
              STATUS MESSAGES
          ================================================== */}

          {errorMessage && (
            <div
              className={styles.errorMessage}
              role="alert"
            >
              <span
                className={
                  styles.messageIcon
                }
              >
                !
              </span>

              <span>
                {errorMessage}
              </span>

              <button
                type="button"
                onClick={() =>
                  setErrorMessage("")
                }
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {successMessage && (
            <div
              className={
                styles.successMessage
              }
              role="status"
            >
              <span
                className={
                  styles.messageIcon
                }
              >
                ✓
              </span>

              <span>
                {successMessage}
              </span>

              <button
                type="button"
                onClick={() =>
                  setSuccessMessage("")
                }
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          {/* ==================================================
              DOCUMENT STORAGE
          ================================================== */}

          <section
            className={styles.sectionCard}
          >
            <div
              className={styles.sectionHeader}
            >
              <div
                className={
                  styles.sectionIcon
                }
              >
                <Icon
                  name="database"
                  size={21}
                />
              </div>

              <div>
                <h2>
                  Document Storage
                </h2>

                <p>
                  Control whether submitted
                  property documents are
                  intended to remain available
                  after verification.
                </p>
              </div>
            </div>

            <div
              className={styles.settingList}
            >
              {/* DOCUMENT RETENTION */}

              <div
                className={
                  styles.settingRow
                }
              >
                <div
                  className={
                    styles.settingIcon
                  }
                >
                  <Icon
                    name="document"
                    size={20}
                  />
                </div>

                <div
                  className={
                    styles.settingText
                  }
                >
                  <strong>
                    Document Retention
                  </strong>

                  <span>
                    Keep submitted property
                    documents available in
                    your verification records.
                  </span>
                </div>

                <button
                  type="button"
                  className={`${styles.toggle} ${
                    preferences.documentRetention
                      ? styles.toggleOn
                      : ""
                  }`}
                  onClick={() =>
                    void updatePreference(
                      "documentRetention",
                    )
                  }
                  disabled={
                    savingPreference !==
                    null
                  }
                  aria-label="Toggle document retention"
                  aria-pressed={
                    preferences.documentRetention
                  }
                >
                  <span />
                </button>
              </div>

              {/* DELETE DOCUMENTS */}

              <div
                className={
                  styles.settingRow
                }
              >
                <div
                  className={`${styles.settingIcon} ${styles.dangerIcon}`}
                >
                  <Icon
                    name="trash"
                    size={20}
                  />
                </div>

                <div
                  className={
                    styles.settingText
                  }
                >
                  <strong>
                    Delete Stored Documents
                  </strong>

                  <span>
                    Permanently remove property
                    document files currently
                    stored in your account.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    styles.outlineDangerButton
                  }
                  onClick={() =>
                    setModal("documents")
                  }
                >
                  Delete Documents
                </button>
              </div>
            </div>
          </section>

          {/* ==================================================
              VERIFICATION HISTORY
          ================================================== */}

          <section
            className={styles.sectionCard}
          >
            <div
              className={styles.sectionHeader}
            >
              <div
                className={
                  styles.sectionIcon
                }
              >
                <Icon
                  name="history"
                  size={21}
                />
              </div>

              <div>
                <h2>
                  Verification History
                </h2>

                <p>
                  Control how completed
                  verification records remain
                  available in your account.
                </p>
              </div>
            </div>

            <div
              className={styles.settingList}
            >
              {/* KEEP HISTORY */}

              <div
                className={
                  styles.settingRow
                }
              >
                <div
                  className={
                    styles.settingIcon
                  }
                >
                  <Icon
                    name="history"
                    size={20}
                  />
                </div>

                <div
                  className={
                    styles.settingText
                  }
                >
                  <strong>
                    Keep Verification History
                  </strong>

                  <span>
                    Keep completed verification
                    records available in your
                    account.
                  </span>
                </div>

                <button
                  type="button"
                  className={`${styles.toggle} ${
                    preferences.verificationHistory
                      ? styles.toggleOn
                      : ""
                  }`}
                  onClick={() =>
                    void updatePreference(
                      "verificationHistory",
                    )
                  }
                  disabled={
                    savingPreference !==
                    null
                  }
                  aria-label="Toggle verification history"
                  aria-pressed={
                    preferences.verificationHistory
                  }
                >
                  <span />
                </button>
              </div>

              {/* CLEAR HISTORY */}

              <div
                className={
                  styles.settingRow
                }
              >
                <div
                  className={`${styles.settingIcon} ${styles.dangerIcon}`}
                >
                  <Icon
                    name="trash"
                    size={20}
                  />
                </div>

                <div
                  className={
                    styles.settingText
                  }
                >
                  <strong>
                    Clear Verification History
                  </strong>

                  <span>
                    Permanently remove your
                    previous verification
                    history.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    styles.outlineDangerButton
                  }
                  onClick={() =>
                    setModal("history")
                  }
                >
                  Clear History
                </button>
              </div>
            </div>
          </section>

          {/* ==================================================
              PRIVACY PREFERENCES
          ================================================== */}

          <section
            className={styles.sectionCard}
          >
            <div
              className={styles.sectionHeader}
            >
              <div
                className={
                  styles.sectionIcon
                }
              >
                <Icon
                  name="shield"
                  size={21}
                />
              </div>

              <div>
                <h2>
                  Privacy Preferences
                </h2>

                <p>
                  Control how information may
                  be used to operate and improve
                  PropertySure AI.
                </p>
              </div>
            </div>

            <div
              className={styles.settingList}
            >
              {/* SERVICE IMPROVEMENT */}

              <div
                className={
                  styles.settingRow
                }
              >
                <div
                  className={
                    styles.settingIcon
                  }
                >
                  <Icon
                    name="database"
                    size={20}
                  />
                </div>

                <div
                  className={
                    styles.settingText
                  }
                >
                  <strong>
                    Service Improvement
                  </strong>

                  <span>
                    Allow information about how
                    you use PropertySure AI to
                    help improve the service.
                  </span>
                </div>

                <button
                  type="button"
                  className={`${styles.toggle} ${
                    preferences.serviceImprovement
                      ? styles.toggleOn
                      : ""
                  }`}
                  onClick={() =>
                    void updatePreference(
                      "serviceImprovement",
                    )
                  }
                  disabled={
                    savingPreference !==
                    null
                  }
                  aria-label="Toggle service improvement"
                  aria-pressed={
                    preferences.serviceImprovement
                  }
                >
                  <span />
                </button>
              </div>

              {/* THIRD PARTY PROCESSING */}

              <div
                className={
                  styles.settingRow
                }
              >
                <div
                  className={
                    styles.settingIcon
                  }
                >
                  <Icon
                    name="shield"
                    size={20}
                  />
                </div>

                <div
                  className={
                    styles.settingText
                  }
                >
                  <strong>
                    Third-Party Processing
                  </strong>

                  <span>
                    Allow approved service
                    providers to process
                    information when required
                    for document analysis or
                    external verification
                    services.
                  </span>
                </div>

                <button
                  type="button"
                  className={`${styles.toggle} ${
                    preferences.thirdPartyProcessing
                      ? styles.toggleOn
                      : ""
                  }`}
                  onClick={() =>
                    void updatePreference(
                      "thirdPartyProcessing",
                    )
                  }
                  disabled={
                    savingPreference !==
                    null
                  }
                  aria-label="Toggle third-party processing"
                  aria-pressed={
                    preferences.thirdPartyProcessing
                  }
                >
                  <span />
                </button>
              </div>
            </div>
          </section>

          {/* ==================================================
              EXPORT YOUR DATA
          ================================================== */}

          <section
            className={styles.sectionCard}
          >
            <div
              className={styles.sectionHeader}
            >
              <div
                className={
                  styles.sectionIcon
                }
              >
                <Icon
                  name="download"
                  size={21}
                />
              </div>

              <div>
                <h2>
                  Export Your Data
                </h2>

                <p>
                  Download a copy of the
                  information associated with
                  your PropertySure AI account.
                </p>
              </div>
            </div>

            <div
              className={
                styles.singleActionRow
              }
            >
              <div>
                <strong>
                  Download Data Export
                </strong>

                <span>
                  Your export contains your
                  account metadata, privacy
                  preferences and verification
                  records. Uploaded document
                  files are not included.
                </span>
              </div>

              <button
                type="button"
                className={
                  styles.primaryButton
                }
                onClick={() =>
                  setModal("export")
                }
              >
                <Icon
                  name="download"
                  size={17}
                />

                <span>
                  Export Data
                </span>
              </button>
            </div>
          </section>

          {/* ==================================================
              DANGER ZONE
          ================================================== */}

          <section
            className={`${styles.sectionCard} ${styles.dangerCard}`}
          >
            <div
              className={styles.sectionHeader}
            >
              <div
                className={`${styles.sectionIcon} ${styles.dangerSectionIcon}`}
              >
                <Icon
                  name="warning"
                  size={21}
                />
              </div>

              <div>
                <h2>
                  Danger Zone
                </h2>

                <p>
                  Actions in this section may
                  permanently affect your
                  account data.
                </p>
              </div>
            </div>

            <div
              className={
                styles.singleActionRow
              }
            >
              <div>
                <strong>
                  Delete Account
                </strong>

                <span>
                  Permanently delete your
                  PropertySure AI account and
                  associated data.
                </span>
              </div>

              <button
                type="button"
                className={
                  styles.outlineDangerButton
                }
                onClick={() =>
                  setModal("account")
                }
              >
                Delete Account
              </button>
            </div>
          </section>

          {/* ==================================================
              PRIVACY NOTICE
          ================================================== */}

          <section
            className={styles.privacyCard}
          >
            <div
              className={styles.privacyIcon}
            >
              <Icon
                name="lock"
                size={24}
              />
            </div>

            <div
              className={styles.privacyText}
            >
              <h3>
                Your privacy is important
                to us
              </h3>

              <p>
                PropertySure AI uses your
                information to provide property
                verification services, maintain
                your account and operate the
                platform. You can manage the
                preferences available on this
                page at any time.
              </p>
            </div>
          </section>
        </div>

        {/* ==================================================
            CONFIRMATION MODAL
        ================================================== */}

        {modal && (
          <div
            className={styles.modalOverlay}
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }}
          >
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="privacy-modal-title"
            >
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeModal}
                disabled={
                  processingAction
                }
                aria-label="Close dialog"
              >
                <Icon
                  name="close"
                  size={22}
                />
              </button>

              {modal ===
                "export" && (
                <>
                  <div
                    className={`${styles.modalIcon} ${styles.modalIconBlue}`}
                  >
                    <Icon
                      name="download"
                      size={24}
                    />
                  </div>

                  <h2
                    id="privacy-modal-title"
                  >
                    Export Your Data
                  </h2>

                  <p>
                    A JSON file containing
                    your account information,
                    privacy preferences and
                    verification records will
                    be downloaded to your
                    device.
                  </p>

                  <div
                    className={
                      styles.modalActions
                    }
                  >
                    <button
                      type="button"
                      className={
                        styles.modalCancel
                      }
                      onClick={
                        closeModal
                      }
                      disabled={
                        processingAction
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className={
                        styles.modalPrimary
                      }
                      onClick={() =>
                        void exportUserData()
                      }
                      disabled={
                        processingAction
                      }
                    >
                      {processingAction
                        ? "Preparing..."
                        : "Download Data Export"}
                    </button>
                  </div>
                </>
              )}

              {modal ===
                "documents" && (
                <>
                  <div
                    className={`${styles.modalIcon} ${styles.modalIconDanger}`}
                  >
                    <Icon
                      name="trash"
                      size={24}
                    />
                  </div>

                  <h2
                    id="privacy-modal-title"
                  >
                    Delete Stored Documents?
                  </h2>

                  <p>
                    This will permanently
                    remove property document
                    files currently stored in
                    your account. Your
                    verification history is
                    not deleted by this action.
                  </p>

                  <div
                    className={
                      styles.modalWarning
                    }
                  >
                    <Icon
                      name="warning"
                      size={17}
                    />

                    <span>
                      This action cannot be
                      undone.
                    </span>
                  </div>

                  <div
                    className={
                      styles.modalActions
                    }
                  >
                    <button
                      type="button"
                      className={
                        styles.modalCancel
                      }
                      onClick={
                        closeModal
                      }
                      disabled={
                        processingAction
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className={
                        styles.modalDanger
                      }
                      onClick={() =>
                        void deleteStoredDocuments()
                      }
                      disabled={
                        processingAction
                      }
                    >
                      {processingAction
                        ? "Deleting..."
                        : "Delete Documents"}
                    </button>
                  </div>
                </>
              )}

              {modal ===
                "history" && (
                <>
                  <div
                    className={`${styles.modalIcon} ${styles.modalIconDanger}`}
                  >
                    <Icon
                      name="history"
                      size={24}
                    />
                  </div>

                  <h2
                    id="privacy-modal-title"
                  >
                    Clear Verification History?
                  </h2>

                  <p>
                    This will permanently
                    remove your previous
                    verification records from
                    your account.
                  </p>

                  <div
                    className={
                      styles.modalWarning
                    }
                  >
                    <Icon
                      name="warning"
                      size={17}
                    />

                    <span>
                      Stored document files
                      are not deleted by this
                      action.
                    </span>
                  </div>

                  <div
                    className={
                      styles.modalActions
                    }
                  >
                    <button
                      type="button"
                      className={
                        styles.modalCancel
                      }
                      onClick={
                        closeModal
                      }
                      disabled={
                        processingAction
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className={
                        styles.modalDanger
                      }
                      onClick={() =>
                        void clearVerificationHistory()
                      }
                      disabled={
                        processingAction
                      }
                    >
                      {processingAction
                        ? "Clearing..."
                        : "Clear History"}
                    </button>
                  </div>
                </>
              )}

              {modal ===
                "account" && (
                <>
                  <div
                    className={`${styles.modalIcon} ${styles.modalIconDanger}`}
                  >
                    <Icon
                      name="warning"
                      size={24}
                    />
                  </div>

                  <h2
                    id="privacy-modal-title"
                  >
                    Delete Account
                  </h2>

                  <p>
                    Account deletion requires
                    secure server-side account
                    administration. This action
                    is not performed directly
                    from the browser.
                  </p>

                  <div
                    className={
                      styles.modalInfo
                    }
                  >
                    <Icon
                      name="shield"
                      size={18}
                    />

                    <span>
                      Contact PropertySure AI
                      support to request
                      permanent account
                      deletion.
                    </span>
                  </div>

                  <div
                    className={
                      styles.modalActions
                    }
                  >
                    <button
                      type="button"
                      className={
                        styles.modalCancel
                      }
                      onClick={
                        closeModal
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className={
                        styles.modalPrimary
                      }
                      onClick={() => {
                        closeModal();
                        router.push(
                          "/settings/support-help",
                        );
                      }}
                    >
                      Contact Support
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}