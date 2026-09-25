"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AppShell from "../AppShell/AppShell";
import LoadingScreen from "../AppShell/LoadingScreen";
import { supabase } from "../lib/supabase";

import styles from "./account.module.css";

/*
============================================================
TYPES
============================================================
*/

type AccountUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  created_at?: string;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, any>;
  identities?: Array<{
    id: string;
    provider?: string;
  }>;
  is_anonymous?: boolean;
};

type ActivityItem = {
  icon: string;
  type: "success" | "info";
  title: string;
  description: string;
  date: string;
  time: string;
};

/*
============================================================
CONSTANTS
============================================================
*/

const AVATAR_BUCKET = "avatars";

/*
============================================================
HELPERS
============================================================
*/

function getUserName(
  user: AccountUser | null
): string {
  if (!user) {
    return "User";
  }

  const metadata = user.user_metadata || {};

  const name =
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    metadata.username;

  if (
    typeof name === "string" &&
    name.trim()
  ) {
    return name.trim();
  }

  if (user.email) {
    const emailName =
      user.email.split("@")[0];

    if (emailName) {
      return emailName
        .replace(/[._-]+/g, " ")
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        );
    }
  }

  return "User";
}

function getInitials(
  name: string
): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function getAvatarUrl(
  user: AccountUser | null
): string | null {
  if (!user) {
    return null;
  }

  const metadata =
    user.user_metadata || {};

  const avatar =
    metadata.avatar_url ||
    metadata.picture ||
    metadata.avatar;

  return typeof avatar === "string" &&
    avatar.trim()
    ? avatar
    : null;
}

function formatDate(
  dateString?: string | null
): string {
  if (!dateString) {
    return "Not available";
  }

  const date = new Date(
    dateString
  );

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatTime(
  dateString?: string | null
): string {
  if (!dateString) {
    return "";
  }

  const date = new Date(
    dateString
  );

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

/*
============================================================
KYC / IDENTITY VERIFICATION

Email confirmation is NOT treated as KYC verification.
============================================================
*/

function getKycStatus(
  user: AccountUser | null
): boolean {
  if (!user) {
    return false;
  }

  const metadata =
    user.user_metadata || {};

  const explicitBooleanValues = [
    metadata.kyc_verified,
    metadata.identity_verified,
    metadata.is_kyc_verified,
    metadata.is_identity_verified,
  ];

  if (
    explicitBooleanValues.some(
      (value) => value === true
    )
  ) {
    return true;
  }

  const statusValues = [
    metadata.kyc_status,
    metadata.identity_status,
    metadata.verification_status,
  ];

  return statusValues.some(
    (value) =>
      typeof value === "string" &&
      [
        "verified",
        "approved",
        "complete",
        "completed",
      ].includes(
        value.toLowerCase()
      )
  );
}

/*
============================================================
ACCOUNT PAGE
============================================================
*/

export default function AccountPage() {
  const avatarInputRef =
    useRef<HTMLInputElement>(null);

  const [user, setUser] =
    useState<AccountUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [
    isUploadingAvatar,
    setIsUploadingAvatar,
  ] = useState(false);

  /*
  ============================================================
  LOAD USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      try {
        setLoading(true);
        setPageError("");

        const {
          data,
          error,
        } =
          await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!data.user) {
          window.location.href =
            "/signin";
          return;
        }

        const currentUser =
          data.user as AccountUser;

        if (currentUser.is_anonymous) {
          window.location.href =
            "/signin";
          return;
        }

        if (!mounted) {
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error(
          "ACCOUNT LOAD ERROR:",
          error
        );

        if (!mounted) {
          return;
        }

        setPageError(
          error instanceof Error
            ? error.message
            : "Could not load your account."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          session
        ) => {
          if (!mounted) {
            return;
          }

          if (
            event ===
              "SIGNED_OUT" ||
            !session?.user
          ) {
            window.location.href =
              "/signin";
            return;
          }

          setUser(
            session.user as AccountUser
          );
        }
      );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  /*
  ============================================================
  DERIVED VALUES
  ============================================================
  */

  const fullName = useMemo(
    () => getUserName(user),
    [user]
  );

  const email =
    user?.email || "Not provided";

  const initials = useMemo(
    () => getInitials(fullName),
    [fullName]
  );

  const avatarUrl =
    getAvatarUrl(user);

  const isKycVerified =
    getKycStatus(user);

  /*
  ============================================================
  RECENT ACCOUNT ACTIVITY
  ============================================================
  */

  const activities =
    useMemo<ActivityItem[]>(
      () => {
        const items: ActivityItem[] =
          [];

        if (user?.last_sign_in_at) {
          items.push({
            icon: "✓",
            type: "success",
            title: "Successful login",
            description:
              "Your most recent authenticated session",
            date: formatDate(
              user.last_sign_in_at
            ),
            time: formatTime(
              user.last_sign_in_at
            ),
          });
        }

        if (user?.created_at) {
          items.push({
            icon: "•",
            type: "info",
            title: "Account created",
            description:
              "Your PropertySure AI account was created",
            date: formatDate(
              user.created_at
            ),
            time: formatTime(
              user.created_at
            ),
          });
        }

        return items;
      },
      [
        user?.last_sign_in_at,
        user?.created_at,
      ]
    );

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  function navigate(path: string) {
    window.location.href = path;
  }

  /*
  ============================================================
  AVATAR
  ============================================================
  */

  function openAvatarPicker() {
    if (isUploadingAvatar) {
      return;
    }

    avatarInputRef.current?.click();
  }

  async function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file || !user) {
      return;
    }

    setPageError("");

    if (
      !file.type.startsWith("image/")
    ) {
      setPageError(
        "Please select an image file."
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setPageError(
        "Profile photos must be 5 MB or smaller."
      );
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const filePath =
        `${user.id}/avatar.${extension}`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(
            filePath,
            file,
            {
              cacheControl: "3600",
              upsert: true,
              contentType: file.type,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from(AVATAR_BUCKET)
          .getPublicUrl(
            filePath
          );

      const newAvatarUrl =
        `${publicUrlData.publicUrl}?t=${Date.now()}`;

      const {
        data: updatedUserData,
        error: updateError,
      } =
        await supabase.auth.updateUser(
          {
            data: {
              avatar_url:
                newAvatarUrl,
            },
          }
        );

      if (updateError) {
        throw updateError;
      }

      if (
        updatedUserData.user
      ) {
        setUser(
          updatedUserData.user as AccountUser
        );
      }
    } catch (error) {
      console.error(
        "AVATAR UPLOAD ERROR:",
        error
      );

      setPageError(
        error instanceof Error
          ? error.message
          : "Could not upload your profile photo."
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  /*
  ============================================================
  OAUTH
  ============================================================
  */

  function isProviderConnected(
    provider: string
  ): boolean {
    return Boolean(
      user?.identities?.some(
        (identity) =>
          identity.provider ===
          provider
      )
    );
  }

  async function connectProvider(
    provider: "google" | "azure"
  ) {
    setPageError("");

    try {
      const {
        error,
      } =
        await supabase.auth.signInWithOAuth(
          {
            provider,
            options: {
              redirectTo:
                `${window.location.origin}/account`,
            },
          }
        );

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(
        "OAUTH CONNECTION ERROR:",
        error
      );

      setPageError(
        error instanceof Error
          ? error.message
          : "Could not connect this account."
      );
    }
  }

  /*
  ============================================================
  SHARED LOADING SCREEN
  ============================================================
  */

  if (loading) {
    return <LoadingScreen />;
  }

  /*
  ============================================================
  MAIN UI
  ============================================================
  */

  return (
    <AppShell
      activePath="/account"
      headerPath="/account"
    >
      <main className={styles.page}>
        <div
          className={styles.container}
        >

          {/* ==================================================
              DESKTOP PAGE HEADER

              Hidden on mobile so the profile card
              becomes the first Account content.
          ================================================== */}

          <header
            className={styles.pageHeader}
          >
            <div>
              <div
                className={
                  styles.eyebrow
                }
              >
                PROPERTYSURE AI
              </div>

              <h1>Account</h1>

              <p>
                Manage your account,
                profile and preferences.
              </p>
            </div>
          </header>

          {/* ==================================================
              ERROR
          ================================================== */}

          {pageError && (
            <div
              className={
                styles.pageError
              }
            >
              <span
                className={
                  styles.errorIcon
                }
              >
                !
              </span>

              <div
                className={
                  styles.errorMessage
                }
              >
                {pageError}
              </div>

              <button
                type="button"
                className={
                  styles.errorClose
                }
                onClick={() =>
                  setPageError("")
                }
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* ==================================================
              PROFILE
          ================================================== */}

          <section
            className={
              styles.profileCard
            }
          >
            <div
              className={
                styles.profileIdentity
              }
            >
              <div
                className={
                  styles.profileAvatarWrap
                }
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${fullName} profile`}
                    className={
                      styles.profileAvatar
                    }
                  />
                ) : (
                  <div
                    className={
                      styles.profileAvatar
                    }
                  >
                    {initials}
                  </div>
                )}

                <button
                  type="button"
                  className={
                    styles.avatarCamera
                  }
                  onClick={
                    openAvatarPicker
                  }
                  disabled={
                    isUploadingAvatar
                  }
                  aria-label={
                    avatarUrl
                      ? "Change profile photo"
                      : "Add profile photo"
                  }
                >
                  {isUploadingAvatar
                    ? "..."
                    : "⌕"}
                </button>

                <input
                  ref={
                    avatarInputRef
                  }
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={
                    handleAvatarChange
                  }
                />
              </div>

              <div
                className={
                  styles.profileInfo
                }
              >
                <h2>
                  {fullName}
                </h2>

                <p>
                  {email}
                </p>
              </div>
            </div>

            <div
              className={
                styles.profileActions
              }
            >
              <span
                className={
                  styles.photoHint
                }
              >
                {isUploadingAvatar
                  ? "Uploading photo..."
                  : "Profile photo"}
              </span>

              <button
                type="button"
                className={
                  styles.primaryOutlineButton
                }
                onClick={
                  openAvatarPicker
                }
                disabled={
                  isUploadingAvatar
                }
              >
                <span>⌾</span>

                {isUploadingAvatar
                  ? "Uploading..."
                  : "Change Photo"}
              </button>

              <button
                type="button"
                className={
                  styles.secondaryTextButton
                }
                onClick={() =>
                  navigate(
                    "/account/profile"
                  )
                }
              >
                Edit Profile
              </button>
            </div>
          </section>

          {/* ==================================================
              IDENTITY VERIFICATION
          ================================================== */}

          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeader
              }
            >
              <div
                className={
                  styles.cardTitleGroup
                }
              >
                <div
                  className={`${styles.cardIcon} ${styles.blueIcon}`}
                >
                  ✓
                </div>

                <div>
                  <h2>
                    Identity Verification
                  </h2>

                  <p>
                    Verify your identity and secure your account
                  </p>
                </div>
              </div>

              <span
                className={
                  isKycVerified
                    ? styles.kycVerified
                    : styles.kycPending
                }
              >
                <span>
                  {isKycVerified
                    ? "✓"
                    : "!"}
                </span>

                {isKycVerified
                  ? "Verified"
                  : "Not Verified"}
              </span>
            </div>

            <div
              className={
                styles.kycContent
              }
            >
              <div>
                <strong>
                  Identity Verification (KYC)
                </strong>

                <p>
                  Complete identity
                  verification to help
                  protect your account,
                  prevent fraud, and
                  build trust when using
                  PropertySure AI.
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.kycButton
                }
                onClick={() =>
                  navigate(
                    "/account/identity-verification"
                  )
                }
              >
                {isKycVerified
                  ? "View Verification"
                  : "Start Verification"}

                <span>→</span>
              </button>
            </div>
          </section>

          {/* ==================================================
              CONNECTED ACCOUNTS
          ================================================== */}

          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeader
              }
            >
              <div
                className={
                  styles.cardTitleGroup
                }
              >
                <div
                  className={`${styles.cardIcon} ${styles.blueIcon}`}
                >
                  ◉
                </div>

                <div>
                  <h2>
                    Connected Accounts
                  </h2>

                  <p>
                    Manage external sign-in providers
                  </p>
                </div>
              </div>
            </div>

            <div
              className={
                styles.connectedList
              }
            >
              {/* GOOGLE */}

              <div
                className={
                  styles.connectedRow
                }
              >
                <div
                  className={
                    styles.providerLeft
                  }
                >
                  <div
                    className={`${styles.providerIcon} ${styles.googleIcon}`}
                  >
                    G
                  </div>

                  <div>
                    <strong>
                      Google
                    </strong>

                    <span>
                      Sign in with Google
                    </span>
                  </div>
                </div>

                {isProviderConnected(
                  "google"
                ) ? (
                  <span
                    className={
                      styles.connectedStatus
                    }
                  >
                    <span>
                      ✓
                    </span>

                    Connected
                  </span>
                ) : (
                  <button
                    type="button"
                    className={
                      styles.connectButton
                    }
                    onClick={() =>
                      connectProvider(
                        "google"
                      )
                    }
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* MICROSOFT */}

              <div
                className={
                  styles.connectedRow
                }
              >
                <div
                  className={
                    styles.providerLeft
                  }
                >
                  <div
                    className={`${styles.providerIcon} ${styles.microsoftIcon}`}
                  >
                    M
                  </div>

                  <div>
                    <strong>
                      Microsoft
                    </strong>

                    <span>
                      Sign in with Microsoft
                    </span>
                  </div>
                </div>

                {isProviderConnected(
                  "azure"
                ) ? (
                  <span
                    className={
                      styles.connectedStatus
                    }
                  >
                    <span>
                      ✓
                    </span>

                    Connected
                  </span>
                ) : (
                  <button
                    type="button"
                    className={
                      styles.connectButton
                    }
                    onClick={() =>
                      connectProvider(
                        "azure"
                      )
                    }
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ==================================================
              RECENT ACTIVITY
          ================================================== */}

          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeader
              }
            >
              <div
                className={
                  styles.cardTitleGroup
                }
              >
                <div
                  className={`${styles.cardIcon} ${styles.blueIcon}`}
                >
                  ◷
                </div>

                <div>
                  <h2>
                    Recent Account Activity
                  </h2>

                  <p>
                    Recent activity on your account
                  </p>
                </div>
              </div>
            </div>

            {activities.length >
            0 ? (
              <div
                className={
                  styles.activityList
                }
              >
                {activities.map(
                  (
                    activity,
                    index
                  ) => (
                    <div
                      className={
                        styles.activityRow
                      }
                      key={`${activity.title}-${index}`}
                    >
                      <div
                        className={
                          activity.type ===
                          "success"
                            ? styles.activityIconSuccess
                            : styles.activityIconInfo
                        }
                      >
                        {activity.icon}
                      </div>

                      <div
                        className={
                          styles.activityInfo
                        }
                      >
                        <strong>
                          {
                            activity.title
                          }
                        </strong>

                        <span>
                          {
                            activity.description
                          }
                        </span>
                      </div>

                      <div
                        className={
                          styles.activityTime
                        }
                      >
                        <strong>
                          {
                            activity.date
                          }
                        </strong>

                        <span>
                          {
                            activity.time
                          }
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div
                className={
                  styles.emptyActivity
                }
              >
                No recent account activity.
              </div>
            )}
          </section>

          {/* ==================================================
              ACCOUNT FOOTER
          ================================================== */}

          <footer
            className={
              styles.accountFooter
            }
          >
            <div>
              <strong>
                PropertySure AI
              </strong>

              <span>
                Secure Properties.
                <br />
                Stronger Tomorrows.
              </span>
            </div>

            <div
              className={
                styles.footerLinks
              }
            >
              <button type="button">
                Privacy Policy
              </button>

              <button type="button">
                Terms of Service
              </button>

              <button type="button">
                Help
              </button>

              <span>
                ©️ 2026 PropertySure AI.
                All rights reserved.
              </span>
            </div>
          </footer>

        </div>
      </main>
    </AppShell>
  );
}