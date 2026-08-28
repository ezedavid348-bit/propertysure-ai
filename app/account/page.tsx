"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

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

  const metadata =
    user.user_metadata || {};

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
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        );
    }
  }

  return "User";
}

function getInitials(
  name: string
): string {
  const parts =
    name
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

  return (
    typeof avatar === "string" &&
    avatar.trim()
  )
    ? avatar
    : null;
}

function getPhone(
  user: AccountUser | null
): string {
  if (!user) {
    return "Not provided";
  }

  const metadata =
    user.user_metadata || {};

  return (
    user.phone ||
    metadata.phone ||
    metadata.phone_number ||
    "Not provided"
  );
}

function getLocation(
  user: AccountUser | null
): string {
  if (!user) {
    return "Not provided";
  }

  const metadata =
    user.user_metadata || {};

  const city =
    metadata.city ||
    metadata.location ||
    metadata.address_city;

  const country =
    metadata.country ||
    metadata.address_country;

  if (city && country) {
    return `${city}, ${country}`;
  }

  if (city) {
    return String(city);
  }

  if (country) {
    return String(country);
  }

  return "Not provided";
}

function getPlanName(
  user: AccountUser | null
): string {
  if (!user) {
    return "Free Plan";
  }

  const metadata =
    user.user_metadata || {};

  const plan =
    metadata.plan ||
    metadata.plan_name ||
    metadata.subscription_plan ||
    metadata.account_plan;

  if (
    typeof plan === "string" &&
    plan.trim()
  ) {
    return plan.trim();
  }

  return "Free Plan";
}

function formatDate(
  dateString?: string | null
): string {
  if (!dateString) {
    return "Not available";
  }

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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

IMPORTANT:
Email confirmation is NOT treated as KYC verification.
We look for explicit KYC / identity verification
metadata instead.
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

  const [
    user,
    setUser,
  ] =
    useState<AccountUser | null>(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    pageError,
    setPageError,
  ] =
    useState("");

  const [
    isUploadingAvatar,
    setIsUploadingAvatar,
  ] =
    useState(false);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] =
    useState(false);

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

        if (
          currentUser.is_anonymous
        ) {
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
      data:
        authListener,
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

  const fullName =
    useMemo(
      () =>
        getUserName(user),
      [user]
    );

  const email =
    user?.email ||
    "Not provided";

  const initials =
    useMemo(
      () =>
        getInitials(
          fullName
        ),
      [fullName]
    );

  const avatarUrl =
    getAvatarUrl(user);

  const phone =
    getPhone(user);

  const location =
    getLocation(user);

  const planName =
    getPlanName(user);

  const memberSince =
    formatDate(
      user?.created_at
    );

  /*
  ------------------------------------------------------------
  IMPORTANT:
  This is KYC / identity verification,
  NOT email verification.
  ------------------------------------------------------------
  */

  const isKycVerified =
    getKycStatus(user);

  /*
  ============================================================
  DYNAMIC RECENT ACTIVITY
  ============================================================
  */

  const activities =
    useMemo<ActivityItem[]>(
      () => {
        const items: ActivityItem[] =
          [];

        if (
          user?.last_sign_in_at
        ) {
          items.push({
            icon: "✓",
            type: "success",
            title:
              "Successful login",
            description:
              "Your most recent authenticated session",
            date:
              formatDate(
                user.last_sign_in_at
              ),
            time:
              formatTime(
                user.last_sign_in_at
              ),
          });
        }

        if (
          user?.created_at
        ) {
          items.push({
            icon: "●",
            type: "info",
            title:
              "Account created",
            description:
              "Your PropertySure AI account was created",
            date:
              formatDate(
                user.created_at
              ),
            time:
              formatTime(
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
  AVATAR
  ============================================================
  */

  function openAvatarPicker() {
    if (
      isUploadingAvatar
    ) {
      return;
    }

    avatarInputRef.current?.click();
  }

  async function handleAvatarChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (
      !file ||
      !user
    ) {
      return;
    }

    setPageError("");

    if (
      !file.type.startsWith(
        "image/"
      )
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

    setIsUploadingAvatar(
      true
    );

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
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            AVATAR_BUCKET
          )
          .upload(
            filePath,
            file,
            {
              cacheControl:
                "3600",
              upsert:
                true,
              contentType:
                file.type,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data:
          publicUrlData,
      } =
        supabase.storage
          .from(
            AVATAR_BUCKET
          )
          .getPublicUrl(
            filePath
          );

      const newAvatarUrl =
        `${publicUrlData.publicUrl}?t=${Date.now()}`;

      const {
        data:
          updatedUserData,
        error:
          updateError,
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
      setIsUploadingAvatar(
        false
      );
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
    provider:
      | "google"
      | "azure"
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
  NAVIGATION
  ============================================================
  */

  function navigate(
    path: string
  ) {
    window.location.href =
      path;
  }

  /*
  ============================================================
  SIGN OUT
  ============================================================
  */

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();

      window.location.href =
        "/signin";
    } catch (error) {
      console.error(
        "SIGN OUT ERROR:",
        error
      );
    }
  }

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <main className="account-loading-page">
        <div className="loading-brand">
          <div className="loading-logo">
            ◆
          </div>

          <div>
            PropertySure
            <strong> AI</strong>
          </div>
        </div>

        <div className="loading-spinner" />

        <p>
          Loading your account...
        </p>

        <style jsx>{`
          .account-loading-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            background:
              radial-gradient(
                circle at 70% 0%,
                rgba(0, 123, 255, 0.18),
                transparent 30%
              ),
              #06152f;
            color: #f8fafc;
            font-family:
              Inter,
              Arial,
              Helvetica,
              sans-serif;
          }

          .loading-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 21px;
            font-weight: 700;
          }

          .loading-brand strong {
            color: #168eff;
          }

          .loading-logo {
            color: #168eff;
            font-size: 29px;
            line-height: 1;
          }

          .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(
              255,
              255,
              255,
              0.12
            );
            border-top-color: #168eff;
            border-radius: 50%;
            animation:
              spin 0.8s linear infinite;
          }

          .account-loading-page p {
            margin: 0;
            color: #8198b2;
            font-size: 12px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  /*
  ============================================================
  MAIN UI
  ============================================================
  */

  return (
    <main className="account-page">

      {/* ======================================================
          MOBILE MENU
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        >
          <div
            className="mobile-menu"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="mobileMenuHeader">
              <div>
                <div className="mobileMenuLogo">
                  <span>
                    ◆
                  </span>

                  <div>
                    PropertySure
                    <strong> AI</strong>
                  </div>
                </div>

                <div className="mobileMenuSubtitle">
                  AI-Powered Property Due Diligence
                </div>
              </div>

              <button
                type="button"
                className="closeMenu"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              >
                ×
              </button>
            </div>

            <nav className="mobileMenuNav">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/dashboard");
                }}
              >
                <span className="navIcon">
                  ▦
                </span>
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/verify");
                }}
              >
                <span className="navIcon">
                  ⇧
                </span>
                Verify Property
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/my-properties");
                }}
              >
                <span className="navIcon">
                  ⌂
                </span>
                My Properties
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(
                    "/verification-history"
                  );
                }}
              >
                <span className="navIcon">
                  ◷
                </span>
                Verification History
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/fraud-watch");
                }}
              >
                <span className="navIcon">
                  ◈
                </span>
                Fraud Watch
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/reports");
                }}
              >
                <span className="navIcon">
                  ▤
                </span>
                Reports
              </button>
            </nav>

            <div className="mobileAccountLabel">
              ACCOUNT
            </div>

            <button
              type="button"
              className="mobileNavItem active"
            >
              <span className="navIcon">
                ◯
              </span>
              Account
            </button>

            <button
              type="button"
              className="mobileNavItem"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/settings");
              }}
            >
              <span className="navIcon">
                ⚙
              </span>
              Settings
            </button>

            <button
              type="button"
              className="mobileNavItem logoutItem"
              onClick={handleSignOut}
            >
              <span className="navIcon">
                ↪
              </span>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <header className="mobile-header">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setMobileMenuOpen(true)
          }
          aria-label="Open navigation"
        >
          ☰
        </button>

        <button
          type="button"
          className="mobile-header-logo"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <span className="mobile-logo-diamond">
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </button>

        <button
          type="button"
          className="mobile-notification"
          onClick={() =>
            navigate(
              "/account/notifications"
            )
          }
          aria-label="Notifications"
        >
          <span className="bell-icon">
            🔔
          </span>

          <span className="notification-dot" />
        </button>
      </header>

      {/* ======================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside className="sidebar">
        <button
          type="button"
          className="brandButton"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <div className="brandName">
            <span className="brandLogoDiamond">
              ◆
            </span>

            <span>
              PropertySure
              <strong> AI</strong>
            </span>
          </div>

          <div className="brandSubtitle">
            AI-Powered Property
            <br />
            Due Diligence
          </div>
        </button>

        <nav className="sidebarNav">
          <button
            type="button"
            className="navItem"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span className="navIcon">
              ▦
            </span>

            <span>
              Dashboard
            </span>
          </button>

          <button
            type="button"
            className="navItem"
            onClick={() =>
              navigate("/verify")
            }
          >
            <span className="navIcon">
              ⇧
            </span>

            <span>
              Verify Property
            </span>
          </button>

          <button
            type="button"
            className="navItem"
            onClick={() =>
              navigate("/my-properties")
            }
          >
            <span className="navIcon">
              ⌂
            </span>

            <span>
              My Properties
            </span>
          </button>

          <button
            type="button"
            className="navItem"
            onClick={() =>
              navigate(
                "/verification-history"
              )
            }
          >
            <span className="navIcon">
              ◷
            </span>

            <span>
              Verification History
            </span>
          </button>

          <button
            type="button"
            className="navItem"
            onClick={() =>
              navigate("/fraud-watch")
            }
          >
            <span className="navIcon">
              ◈
            </span>

            <span>
              Fraud Watch
            </span>
          </button>

          <button
            type="button"
            className="navItem"
            onClick={() =>
              navigate("/reports")
            }
          >
            <span className="navIcon">
              ▤
            </span>

            <span>
              Reports
            </span>
          </button>
        </nav>

        <div className="accountLabel">
          ACCOUNT
        </div>

        <button
          type="button"
          className="navItem active"
          onClick={() =>
            navigate("/account")
          }
        >
          <span className="navIcon">
            ◯
          </span>

          <span>
            Account
          </span>
        </button>

        <button
          type="button"
          className="navItem"
          onClick={() =>
            navigate("/settings")
          }
        >
          <span className="navIcon">
            ⚙
          </span>

          <span>
            Settings
          </span>
        </button>

        {/* SUPPORT */}

        <div className="helpBox">
          <div className="helpTitle">
            Need Help?
          </div>

          <div className="helpText">
            Our support team is ready to assist you.
          </div>

          <button
            type="button"
            className="supportButton"
            onClick={() =>
              navigate("/account")
            }
          >
            Contact Support
          </button>
        </div>

        {/* USER */}

        <button
          type="button"
          className="sidebarUser"
          onClick={() =>
            navigate("/account")
          }
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${fullName} profile`}
              className="avatar avatar-image"
            />
          ) : (
            <div className="avatar">
              {initials}
            </div>
          )}

          <div>
            <div className="userName">
              {fullName}
            </div>

            <div className="userPlan">
              {planName}
            </div>
          </div>
        </button>
      </aside>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="main-content">

        {/* DESKTOP TOP BAR */}

        <header className="desktop-topbar">
          <div>
            <div className="eyebrow">
              PROPERTYSURE AI
            </div>

            <h1>
              Account
            </h1>

            <p>
              Manage your PropertySure AI account,
              security and preferences.
            </p>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
              onClick={() =>
                navigate(
                  "/account/notifications"
                )
              }
            >
              <span className="bell-icon">
                🔔
              </span>

              <span className="notification-dot" />
            </button>

            <button
              type="button"
              className="top-profile"
              onClick={() =>
                navigate("/account")
              }
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${fullName} profile`}
                  className="avatar tiny avatar-image"
                />
              ) : (
                <div className="avatar tiny">
                  {initials}
                </div>
              )}

              <div>
                <div className="top-profile-name">
                  {fullName}
                </div>

                <div className="top-profile-plan">
                  {planName}
                </div>
              </div>

              <span className="chevron">
                ⌄
              </span>
            </button>
          </div>
        </header>

        {/* MOBILE HEADING */}

        <div className="mobile-page-heading">
          <div className="eyebrow">
            PROPERTYSURE AI
          </div>

          <h1>
            Account
          </h1>

          <p>
            Manage your account,
            security and preferences.
          </p>
        </div>

        {/* ERROR */}

        {pageError && (
          <div className="page-error">
            <span>
              !
            </span>

            <div>
              {pageError}
            </div>

            <button
              type="button"
              onClick={() =>
                setPageError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {/* ====================================================
            PROFILE
        ==================================================== */}

        <section className="profile-card">
          <div className="profile-left">
            <div className="profile-avatar-wrapper">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${fullName} profile`}
                  className="profile-avatar avatar-image"
                />
              ) : (
                <div className="profile-avatar">
                  {initials}
                </div>
              )}

              {/* =================================================
                  CLEAR PROFILE PHOTO CONTROL
              ================================================= */}

              <button
                type="button"
                className="camera-button"
                aria-label={
                  avatarUrl
                    ? "Change profile photo"
                    : "Add profile photo"
                }
                onClick={
                  openAvatarPicker
                }
                disabled={
                  isUploadingAvatar
                }
              >
                <span
                  className="camera-icon"
                  aria-hidden="true"
                >
                  {isUploadingAvatar
                    ? "..."
                    : "📷"}
                </span>

                <span className="camera-label">
                  {isUploadingAvatar
                    ? "Uploading..."
                    : avatarUrl
                      ? "Change Photo"
                      : "Add Photo"}
                </span>
              </button>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={
                  handleAvatarChange
                }
              />
            </div>

            <div className="profile-photo-hint">
              <strong>
                Profile Photo
              </strong>

              <span>
                Click the button on your photo to upload or change it.
              </span>
            </div>

            <div className="profile-main-info">
              <h2>
                {fullName}
              </h2>

              <p>
                {email}
              </p>

              {/* =================================================
                  DYNAMIC KYC STATUS
              ================================================= */}

              <span
                className={`verified-badge ${
                  isKycVerified
                    ? "verified"
                    : "unverified"
                }`}
              >
                {isKycVerified
                  ? "✓ Identity Verified"
                  : "○ Identity Not Verified"}
              </span>

              <small>
                {isKycVerified
                  ? "Your identity has been verified."
                  : "Complete identity verification to become verified."}
              </small>

              <small>
                Member since{" "}
                {memberSince}
              </small>
            </div>
          </div>

          <button
            type="button"
            className="edit-profile-button"
            onClick={() =>
              navigate(
                "/account/profile"
              )
            }
          >
            ✎ Edit Profile
          </button>
        </section>

        {/* ====================================================
            CARDS
        ==================================================== */}

        <section className="cards-grid">

          {/* ==================================================
              PLAN INFORMATION
          ================================================== */}

          <article className="account-card">
            <div className="card-title">
              <div className="title-icon purple">
                ✦
              </div>

              <div>
                <h3>
                  Plan Information
                </h3>

                <span>
                  Your current PropertySure plan
                </span>
              </div>
            </div>

            <div className="plan-name">
              {planName}
            </div>

            <ul className="feature-list">
              <li>
                <span>
                  ✓
                </span>
                Property verification access
              </li>

              <li>
                <span>
                  ✓
                </span>
                AI-powered document analysis
              </li>

              <li>
                <span>
                  ✓
                </span>
                Verification reports
              </li>

              <li>
                <span>
                  ✓
                </span>
                Property risk insights
              </li>
            </ul>

            <button
              type="button"
              className="outline-button"
              onClick={() =>
                navigate(
                  "/account/plan"
                )
              }
            >
              Manage Plan
            </button>
          </article>

          {/* ==================================================
              ACCOUNT SECURITY
          ================================================== */}

          <article className="account-card">
            <div className="card-title">
              <div className="title-icon green">
                ♢
              </div>

              <div>
                <h3>
                  Account Security
                </h3>

                <span>
                  Manage your password, 2FA and active sessions
                </span>
              </div>
            </div>

            <div className="security-summary">
              <p>
                Security controls are managed from the dedicated security page.
              </p>

              <span>
                Password • Two-Factor Authentication • Active Sessions
              </span>
            </div>

            <button
              type="button"
              className="outline-button"
              onClick={() =>
                navigate(
                  "/security"
                )
              }
            >
              Manage Security
            </button>
          </article>

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <article className="account-card">
            <div className="card-title">
              <div className="title-icon blue">
                ♙
              </div>

              <div>
                <h3>
                  Personal Information
                </h3>

                <span>
                  Your personal details
                </span>
              </div>
            </div>

            <div className="personal-list">
              <div>
                <span>
                  Full Name
                </span>

                <strong>
                  {fullName}
                </strong>
              </div>

              <div>
                <span>
                  Email Address
                </span>

                <strong>
                  {email}
                </strong>
              </div>

              <div>
                <span>
                  Phone Number
                </span>

                <strong>
                  {phone}
                </strong>
              </div>

              <div>
                <span>
                  Location
                </span>

                <strong>
                  {location}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="outline-button"
              onClick={() =>
                navigate(
                  "/account/profile"
                )
              }
            >
              Update Information
            </button>
          </article>

          {/* ==================================================
              CONNECTED ACCOUNTS
          ================================================== */}

          <article className="account-card">
            <div className="card-title">
              <div className="title-icon blue">
                ◎
              </div>

              <div>
                <h3>
                  Connected Accounts
                </h3>

                <span>
                  Manage external sign-in providers
                </span>
              </div>
            </div>

            <div className="connected-list">
              <div className="connected-row">
                <div className="provider-left">
                  <div className="provider-icon google">
                    G
                  </div>

                  <div>
                    <strong>
                      Google
                    </strong>

                    <small>
                      Sign in with Google
                    </small>
                  </div>
                </div>

                {isProviderConnected(
                  "google"
                ) ? (
                  <span className="connected">
                    Connected
                  </span>
                ) : (
                  <button
                    type="button"
                    className="connect-link"
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

              <div className="connected-row">
                <div className="provider-left">
                  <div className="provider-icon microsoft">
                    M
                  </div>

                  <div>
                    <strong>
                      Microsoft
                    </strong>

                    <small>
                      Sign in with Microsoft
                    </small>
                  </div>
                </div>

                {isProviderConnected(
                  "azure"
                ) ? (
                  <span className="connected">
                    Connected
                  </span>
                ) : (
                  <button
                    type="button"
                    className="connect-link"
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
          </article>
        </section>

        {/* ====================================================
            RECENT ACCOUNT ACTIVITY
        ==================================================== */}

        <section className="activity-card">
          <div className="activity-heading">
            <div className="card-title activity-title">
              <div className="title-icon blue">
                ◷
              </div>

              <div>
                <h3>
                  Recent Account Activity
                </h3>

                <span>
                  Recent activity on your account
                </span>
              </div>
            </div>

            <button
              type="button"
              className="view-all-button"
              onClick={() =>
                navigate(
                  "/verification-history"
                )
              }
            >
              View History
            </button>
          </div>

          {activities.length > 0 ? (
            <div className="activity-list">
              {activities.map(
                (
                  activity,
                  index
                ) => (
                  <div
                    className="activity-row"
                    key={`${activity.title}-${index}`}
                  >
                    <div
                      className={`activity-icon ${
                        activity.type
                      }`}
                    >
                      {activity.icon}
                    </div>

                    <div className="activity-info">
                      <strong>
                        {activity.title}
                      </strong>

                      <span>
                        {activity.description}
                      </span>
                    </div>

                    <div className="activity-time">
                      <strong>
                        {activity.date}
                      </strong>

                      <span>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="empty-activity">
              No recent account activity.
            </div>
          )}
        </section>
      </section>

      {/* ======================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}

      <nav className="mobile-bottom-nav">
        <button
          type="button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <span>
            ▦
          </span>

          <small>
            Dashboard
          </small>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/verify")
          }
        >
          <span>
            ⇧
          </span>

          <small>
            Verify
          </small>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/my-properties")
          }
        >
          <span>
            ⌂
          </span>

          <small>
            Properties
          </small>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/reports")
          }
        >
          <span>
            ▤
          </span>

          <small>
            Reports
          </small>
        </button>

        <button
          type="button"
          className="selected"
          onClick={() =>
            navigate("/account")
          }
        >
          <span>
            ◯
          </span>

          <small>
            Account
          </small>
        </button>
      </nav>

      {/* ======================================================
          STYLES
      ====================================================== */}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        button {
          font-family: inherit;
        }

        .account-page {
          min-height: 100vh;
          display: flex;
          background:
            radial-gradient(
              circle at 70% 0%,
              rgba(0, 123, 255, 0.18),
              transparent 30%
            ),
            #06152f;
          color: #ffffff;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        /* ====================================================
           SIDEBAR
        ==================================================== */

        .sidebar {
          width: 245px;
          min-width: 245px;
          min-height: 100vh;
          padding: 28px 20px;
          background: rgba(
            4,
            20,
            47,
            0.96
          );
          border-right: 1px solid
            rgba(
              83,
              157,
              255,
              0.18
            );
          display: flex;
          flex-direction: column;
        }

        .brandButton {
          border: none;
          background: transparent;
          color: white;
          padding: 0;
          text-align: left;
          cursor: pointer;
        }

        .brandName {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.35px;
          white-space: nowrap;
        }

        .brandName strong {
          color: #168eff;
        }

        .brandLogoDiamond {
          color: #168eff;
          font-size: 25px;
          line-height: 1;
        }

        .brandSubtitle {
          margin-top: 10px;
          padding-left: 2px;
          color: #8ea4c3;
          font-size: 12px;
          line-height: 1.5;
        }

        .sidebarNav {
          margin-top: 28px;
        }

        .navItem {
          width: 100%;
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 14px;
          margin-bottom: 5px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #aebed4;
          font-size: 14px;
          cursor: pointer;
          text-align: left;
          transition:
            background 0.2s,
            color 0.2s;
        }

        .navItem:hover {
          background: rgba(
            24,
            112,
            200,
            0.14
          );
          color: white;
        }

        .navItem.active {
          color: white;
          background: linear-gradient(
            90deg,
            #0879df,
            #1268b7
          );
          box-shadow:
            0 5px 20px
              rgba(
                0,
                120,
                255,
                0.2
              );
        }

        .navIcon {
          width: 20px;
          min-width: 20px;
          text-align: center;
          color: #82b9f2;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .navItem.active .navIcon {
          color: white;
        }

        .accountLabel {
          color: #5f789a;
          font-size: 10px;
          letter-spacing: 1.5px;
          margin: 28px 14px 10px;
        }

        /* ====================================================
           SUPPORT
        ==================================================== */

        .helpBox {
          margin-top: auto;
          padding: 16px;
          border: 1px solid
            rgba(
              71,
              151,
              255,
              0.25
            );
          border-radius: 12px;
          background: rgba(
            16,
            88,
            170,
            0.08
          );
        }

        .helpTitle {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 7px;
        }

        .helpText {
          color: #849ab8;
          font-size: 11px;
          line-height: 1.5;
        }

        .supportButton {
          width: 100%;
          margin-top: 12px;
          padding: 9px;
          border-radius: 7px;
          border: 1px solid #1678df;
          background: transparent;
          color: #7eb9f5;
          cursor: pointer;
        }

        /* ====================================================
           SIDEBAR USER
        ==================================================== */

        .sidebarUser {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
          padding: 5px;
          border: none;
          background: transparent;
          color: white;
          text-align: left;
          cursor: pointer;
        }

        .avatar {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #0879d8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          object-fit: cover;
        }

        .avatar-image {
          object-fit: cover;
        }

        .avatar.tiny {
          width: 40px;
          height: 40px;
          font-size: 13px;
        }

        .userName {
          font-size: 13px;
          font-weight: 600;
        }

        .userPlan {
          color: #7f96b4;
          font-size: 11px;
          margin-top: 3px;
        }

        /* ====================================================
           MAIN
        ==================================================== */

        .main-content {
          flex: 1;
          min-width: 0;
          padding: 30px 34px 60px;
          overflow-x: hidden;
        }

        .desktop-topbar {
          min-height: 76px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 25px;
          padding-bottom: 22px;
          border-bottom: 1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
        }

        .eyebrow {
          color: #7791b3;
          font-size: 11px;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }

        .desktop-topbar h1,
        .mobile-page-heading h1 {
          margin: 0;
          font-size: clamp(
            25px,
            3vw,
            32px
          );
          line-height: 1.2;
          font-weight: 600;
        }

        .desktop-topbar p,
        .mobile-page-heading p {
          margin: 8px 0 0;
          color: #91a7c3;
          font-size: 13px;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        /* ====================================================
           NOTIFICATION
        ==================================================== */

        .notification-button {
          width: 40px;
          height: 40px;
          border: 1px solid
            rgba(
              60,
              143,
              232,
              0.35
            );
          border-radius: 50%;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          padding: 0;
        }

        .bell-icon {
          font-size: 17px;
          line-height: 1;
        }

        .notification-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          top: 5px;
          right: 3px;
          border-radius: 50%;
          background: #168eff;
          box-shadow:
            0 0 8px
              rgba(
                22,
                142,
                255,
                0.6
              );
        }

        .notification-button:hover {
          border-color: rgba(
            22,
            142,
            255,
            0.65
          );
          background: rgba(
            22,
            142,
            255,
            0.06
          );
        }

        .top-profile {
          border: none;
          background: transparent;
          color: white;
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
          text-align: left;
          padding: 0;
        }

        .top-profile-name {
          font-size: 13px;
          font-weight: 600;
        }

        .top-profile-plan {
          color: #7f96b4;
          font-size: 11px;
          margin-top: 3px;
        }

        .chevron {
          color: #8aa0bb;
          margin-left: 3px;
        }

        .mobile-page-heading {
          display: none;
        }

        /* ====================================================
           ERROR
        ==================================================== */

        .page-error {
          margin: 18px 0;
          padding: 12px 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid
            rgba(
              255,
              82,
              97,
              0.3
            );
          background: rgba(
            255,
            82,
            97,
            0.08
          );
          color: #ff9ca4;
          border-radius: 10px;
          font-size: 12px;
        }

        .page-error > span {
          width: 23px;
          height: 23px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(
            255,
            82,
            97,
            0.18
          );
          color: #ff5964;
          font-weight: 700;
          flex-shrink: 0;
        }

        .page-error div {
          flex: 1;
        }

        .page-error button {
          border: none;
          background: transparent;
          color: #ff9ca4;
          font-size: 20px;
          cursor: pointer;
        }

        /* ====================================================
           PROFILE
        ==================================================== */

        .profile-card {
          margin-top: 22px;
          min-height: 120px;
          padding: 18px 20px;
          border: 1px solid
            rgba(
              76,
              149,
              235,
              0.23
            );
          border-radius: 12px;
          background: rgba(
            7,
            31,
            63,
            0.8
          );
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .profile-left {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
        }

        .profile-avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .profile-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            #168eff,
            #0866d1
          );
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          object-fit: cover;
          border: 2px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
        }

        /* ========================================================
           PROFILE PHOTO BUTTON
        ======================================================== */

        .camera-button {
          position: absolute;
          left: 50%;
          bottom: -12px;
          transform: translateX(-50%);
          min-width: 92px;
          height: 30px;
          padding: 0 9px;
          border: 2px solid #06152f;
          border-radius: 999px;
          background: #168eff;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          box-shadow:
            0 4px 12px
              rgba(
                0,
                110,
                255,
                0.35
              );
        }

        .camera-button:hover {
          transform: translateX(-50%)
            scale(1.03);
          background: #0879df;
        }

        .camera-button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .camera-icon {
          font-size: 11px;
          line-height: 1;
        }

        .camera-label {
          line-height: 1;
        }

        .profile-photo-hint {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 105px;
          max-width: 150px;
          margin-left: 2px;
          margin-right: 2px;
          color: #91a7c3;
        }

        .profile-photo-hint strong {
          color: #ffffff;
          font-size: 10px;
          font-weight: 600;
        }

        .profile-photo-hint span {
          color: #7188a5;
          font-size: 8px;
          line-height: 1.45;
        }

        .profile-main-info {
          min-width: 0;
        }

        .profile-main-info h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .profile-main-info p {
          margin: 5px 0 8px;
          color: #8299b6;
          font-size: 11px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 9px;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 600;
        }

        .verified-badge.verified {
          color: #39d995;
          background: rgba(
            30,
            190,
            125,
            0.12
          );
        }

        .verified-badge.unverified {
          color: #ffad28;
          background: rgba(
            255,
            173,
            40,
            0.12
          );
        }

        .profile-main-info small {
          display: block;
          margin-top: 7px;
          color: #7188a5;
          font-size: 9px;
        }

        .edit-profile-button {
          border: 1px solid #1678df;
          border-radius: 8px;
          padding: 10px 15px;
          background: rgba(
            22,
            120,
            223,
            0.04
          );
          color: #70b9ff;
          font-size: 11px;
          cursor: pointer;
          white-space: nowrap;
        }

        .edit-profile-button:hover {
          background: rgba(
            22,
            120,
            223,
            0.12
          );
        }

        /* ====================================================
           CARDS
        ==================================================== */

        .cards-grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 14px;
        }

        .account-card {
          min-width: 0;
          padding: 19px;
          border: 1px solid
            rgba(
              76,
              149,
              235,
              0.23
            );
          border-radius: 12px;
          background: rgba(
            7,
            31,
            63,
            0.8
          );
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .title-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
        }

        .title-icon.purple {
          color: #a875ff;
          background: rgba(
            168,
            117,
            255,
            0.12
          );
        }

        .title-icon.green {
          color: #39d995;
          background: rgba(
            57,
            217,
            149,
            0.12
          );
        }

        .title-icon.blue {
          color: #48aaff;
          background: rgba(
            72,
            170,
            255,
            0.12
          );
        }

        .card-title h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
        }

        .card-title span {
          display: block;
          margin-top: 4px;
          color: #7188a5;
          font-size: 9px;
        }

        .plan-name {
          margin: 20px 0 15px;
          font-size: 23px;
          font-weight: 600;
        }

        .feature-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 9px;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8ea4c3;
          font-size: 10px;
        }

        .feature-list li span {
          color: #39d995;
          font-weight: 700;
        }

        .outline-button {
          width: 100%;
          height: 42px;
          margin-top: 17px;
          border: 1px solid #1678df;
          border-radius: 8px;
          background: transparent;
          color: #70b9ff;
          font-size: 10px;
          cursor: pointer;
        }

        .outline-button:hover {
          background: rgba(
            22,
            120,
            223,
            0.1
          );
        }

        /* ====================================================
           SECURITY
        ==================================================== */

        .security-summary {
          margin-top: 18px;
          padding: 13px 14px;
          border: 1px solid
            rgba(
              83,
              157,
              255,
              0.14
            );
          border-radius: 9px;
          background: rgba(
            8,
            46,
            92,
            0.22
          );
        }

        .security-summary p {
          margin: 0;
          color: #a7bad1;
          font-size: 9px;
          line-height: 1.5;
        }

        .security-summary span {
          display: block;
          margin-top: 7px;
          color: #6f9ed0;
          font-size: 8px;
          line-height: 1.45;
        }

        /* ====================================================
           PERSONAL
        ==================================================== */

        .personal-list {
          margin-top: 19px;
          display: grid;
          gap: 13px;
        }

        .personal-list > div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid
            rgba(
              255,
              255,
              255,
              0.055
            );
        }

        .personal-list > div:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .personal-list span {
          color: #7188a5;
          font-size: 9px;
        }

        .personal-list strong {
          max-width: 65%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #dbe7f5;
          font-size: 10px;
          font-weight: 500;
          text-align: right;
        }

        /* ====================================================
           CONNECTED ACCOUNTS
        ==================================================== */

        .connected-list {
          margin-top: 17px;
        }

        .connected-row {
          min-height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid
            rgba(
              255,
              255,
              255,
              0.055
            );
        }

        .connected-row:last-child {
          border-bottom: none;
        }

        .provider-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .provider-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .provider-icon.google {
          background: rgba(
            66,
            133,
            244,
            0.12
          );
          color: #66a3ff;
        }

        .provider-icon.microsoft {
          background: rgba(
            38,
            151,
            255,
            0.12
          );
          color: #48aaff;
        }

        .connected-row strong {
          display: block;
          font-size: 10px;
        }

        .connected-row small {
          display: block;
          margin-top: 3px;
          color: #7188a5;
          font-size: 8px;
        }

        .connected {
          color: #39d995;
          font-size: 9px;
          font-weight: 600;
        }

        .connect-link {
          border: none;
          background: transparent;
          color: #48aaff;
          font-size: 9px;
          cursor: pointer;
        }

        .connect-link:hover {
          text-decoration: underline;
        }

        /* ====================================================
           ACTIVITY
        ==================================================== */

        .activity-card {
          margin-top: 14px;
          padding: 19px;
          border: 1px solid
            rgba(
              76,
              149,
              235,
              0.23
            );
          border-radius: 12px;
          background: rgba(
            7,
            31,
            63,
            0.8
          );
        }

        .activity-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid
            rgba(
              255,
              255,
              255,
              0.055
            );
        }

        .activity-title {
          margin: 0;
        }

        .view-all-button {
          border: none;
          background: transparent;
          color: #48aaff;
          font-size: 9px;
          cursor: pointer;
        }

        .activity-row {
          min-height: 68px;
          display: grid;
          grid-template-columns:
            36px
            minmax(0, 1fr)
            auto;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid
            rgba(
              255,
              255,
              255,
              0.055
            );
        }

        .activity-row:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
        }

        .activity-icon.success {
          background: rgba(
            57,
            217,
            149,
            0.12
          );
          color: #39d995;
        }

        .activity-icon.info {
          background: rgba(
            72,
            170,
            255,
            0.12
          );
          color: #48aaff;
        }

        .activity-info {
          min-width: 0;
        }

        .activity-info strong {
          display: block;
          font-size: 10px;
          font-weight: 600;
        }

        .activity-info span {
          display: block;
          margin-top: 4px;
          color: #7188a5;
          font-size: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .activity-time {
          text-align: right;
        }

        .activity-time strong {
          display: block;
          color: #b6c8dc;
          font-size: 8px;
          font-weight: 500;
        }

        .activity-time span {
          display: block;
          margin-top: 3px;
          color: #7188a5;
          font-size: 7px;
        }

        .empty-activity {
          padding: 22px 0 5px;
          color: #7188a5;
          font-size: 10px;
        }

        /* ====================================================
           MOBILE
        ==================================================== */

        .mobile-header,
        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 1050px) {
          .sidebar {
            width: 210px;
            min-width: 210px;
          }

          .main-content {
            padding: 25px 22px 50px;
          }

          .cards-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .account-page {
            display: block;
            min-height: 100vh;
            padding-bottom: 74px;
          }

          .sidebar {
            display: none;
          }

          .mobile-header {
            position: sticky;
            top: 0;
            z-index: 100;
            height: 72px;
            padding: 0 14px;
            display: grid;
            grid-template-columns:
              44px
              minmax(0, 1fr)
              44px;
            align-items: center;
            background: rgba(
              3,
              18,
              40,
              0.98
            );
            border-bottom: 1px solid #193650;
          }

          .mobile-menu-button {
            width: 40px;
            height: 40px;
            border: none;
            background: transparent;
            color: white;
            font-size: 23px;
            cursor: pointer;
          }

          .mobile-header-logo {
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            border: none;
            background: transparent;
            color: white;
            font-size: 17px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
          }

          .mobile-header-logo strong {
            color: #168eff;
          }

          .mobile-logo-diamond {
            color: #168eff;
            font-size: 23px;
            line-height: 1;
          }

          .mobile-notification {
            width: 40px;
            height: 40px;
            border: none;
            background: transparent;
            color: white;
            position: relative;
            display: grid;
            place-items: center;
            cursor: pointer;
            padding: 0;
          }

          .mobile-menu-overlay {
            position: fixed;
            inset: 0;
            z-index: 300;
            background: rgba(
              0,
              0,
              0,
              0.52
            );
            backdrop-filter: blur(4px);
          }

          .mobile-menu {
            width: min(
              300px,
              84vw
            );
            min-height: 100%;
            padding: 25px 16px;
            background: #06152f;
            border-right: 1px solid
              rgba(
                83,
                157,
                255,
                0.18
              );
            overflow-y: auto;
          }

          .mobileMenuHeader {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
          }

          .mobileMenuLogo {
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
            font-size: 20px;
            font-weight: 700;
          }

          .mobileMenuLogo > span {
            color: #168eff;
            font-size: 25px;
          }

          .mobileMenuLogo strong {
            color: #168eff;
          }

          .mobileMenuSubtitle {
            color: #8fa5c2;
            font-size: 11px;
            margin-top: 8px;
          }

          .closeMenu {
            border: none;
            background: transparent;
            color: white;
            font-size: 30px;
            cursor: pointer;
          }

          .mobileMenuNav {
            margin-top: 35px;
          }

          .mobileMenuNav button,
          .mobileNavItem {
            width: 100%;
            min-height: 48px;
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 0 14px;
            margin-bottom: 5px;
            border: none;
            border-radius: 10px;
            background: transparent;
            color: #b3c3d8;
            font-size: 15px;
            text-align: left;
            cursor: pointer;
          }

          .mobileMenuNav button:hover,
          .mobileNavItem:hover {
            background: rgba(
              25,
              111,
              200,
              0.14
            );
          }

          .mobileMenuNav button.active,
          .mobileNavItem.active {
            background: linear-gradient(
              90deg,
              #0879df,
              #1268b7
            );
            color: white;
          }

          .mobileAccountLabel {
            color: #617996;
            font-size: 10px;
            letter-spacing: 1.5px;
            margin: 28px 14px 10px;
          }

          .logoutItem {
            color: #ff8b91 !important;
          }

          .main-content {
            width: 100%;
            padding: 20px 14px 30px;
          }

          .desktop-topbar {
            display: none;
          }

          .mobile-page-heading {
            display: block;
            padding: 6px 2px 12px;
          }

          .mobile-page-heading h1 {
            font-size: 25px;
          }

          .mobile-page-heading p {
            font-size: 11px;
            line-height: 1.5;
          }

          .page-error {
            margin: 10px 0;
            font-size: 10px;
          }

          .profile-card {
            min-height: 105px;
            padding: 13px;
            margin-top: 6px;
            border-radius: 10px;
          }

          .profile-left {
            gap: 11px;
          }

          .profile-avatar {
            width: 58px;
            height: 58px;
            font-size: 18px;
          }

          .profile-main-info h2 {
            font-size: 15px;
          }

          .profile-main-info p {
            max-width: 180px;
            font-size: 8px;
          }

          .verified-badge {
            font-size: 7px;
          }

          .profile-main-info small {
            font-size: 6px;
          }

          .edit-profile-button {
            display: none;
          }

          .camera-button {
            width: 23px;
            height: 23px;
            right: -3px;
            bottom: -3px;
            font-size: 10px;
          }

          .cards-grid {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 10px;
          }

          .account-card {
            padding: 15px;
            border-radius: 10px;
          }

          .card-title h3 {
            font-size: 13px;
          }

          .card-title span {
            font-size: 8px;
          }

          .title-icon {
            width: 31px;
            height: 31px;
            font-size: 15px;
          }

          .plan-name {
            font-size: 18px;
            margin-top: 16px;
          }

          .feature-list {
            gap: 8px;
          }

          .feature-list li {
            font-size: 9px;
          }

          .outline-button {
            height: 40px;
            font-size: 9px;
            margin-top: 13px;
          }

          .personal-list {
            gap: 12px;
          }

          .personal-list span {
            font-size: 8px;
          }

          .personal-list strong {
            font-size: 9px;
            max-width: 57%;
          }

          .connected-row {
            min-height: 54px;
          }

          .connected-row strong {
            font-size: 9px;
          }

          .connected-row small {
            font-size: 7px;
          }

          .connected {
            font-size: 8px;
          }

          .connect-link {
            font-size: 8px;
          }

          .activity-card {
            margin-top: 10px;
            padding: 15px;
          }

          .activity-heading {
            align-items: flex-start;
          }

          .view-all-button {
            font-size: 8px;
          }

          .activity-row {
            min-height: 58px;
            grid-template-columns:
              29px
              minmax(0, 1fr)
              auto;
          }

          .activity-info strong {
            font-size: 9px;
          }

          .activity-info span {
            font-size: 7px;
          }

          .activity-time strong {
            font-size: 7px;
          }

          .activity-time span {
            font-size: 6px;
          }

          .mobile-bottom-nav {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 150;
            height: 74px;
            display: grid;
            grid-template-columns:
              repeat(
                5,
                minmax(0, 1fr)
              );
            align-items: center;
            background: rgba(
              3,
              18,
              40,
              0.98
            );
            border-top: 1px solid #193650;
            backdrop-filter: blur(15px);
          }

          .mobile-bottom-nav button {
            height: 55px;
            border: none;
            background: transparent;
            color: #7d91a8;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            cursor: pointer;
          }

          .mobile-bottom-nav button span {
            font-size: 20px;
            line-height: 1;
          }

          .mobile-bottom-nav button small {
            font-size: 8px;
          }

          .mobile-bottom-nav button.selected {
            color: #168eff;
          }
        }

        @media (max-width: 700px) {
          .profile-photo-hint {
            min-width: 90px;
            max-width: 120px;
          }

          .profile-photo-hint span {
            font-size: 7px;
          }

          .camera-button {
            min-width: 84px;
            height: 28px;
            font-size: 8px;
          }
        }

        @media (max-width: 380px) {
          .main-content {
            padding-left: 10px;
            padding-right: 10px;
          }

          .mobile-header-logo {
            font-size: 15px;
          }

          .mobile-logo-diamond {
            font-size: 21px;
          }

          .mobile-page-heading h1 {
            font-size: 23px;
          }

          .profile-main-info h2 {
            font-size: 14px;
          }

          .profile-main-info p {
            max-width: 145px;
          }

          .account-card {
            padding: 13px;
          }

          .card-title h3 {
            font-size: 12px;
          }

          .personal-list strong {
            max-width: 55%;
          }
        }
      `}</style>
    </main>
  );
}