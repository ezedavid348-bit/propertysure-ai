"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import styles from "./two-factor.module.css";

type MFAFactor = {
  id: string;
  friendly_name?: string | null;
  factor_type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

type EnrollmentData = {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
  friendlyName: string;
};

function getInitials(name: string) {
  const cleaned = name.trim();

  if (!cleaned) {
    return "U";
  }

  const parts = cleaned
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function getDisplayName(
  user: {
    user_metadata?: Record<
      string,
      unknown
    >;
    email?: string;
  } | null
) {
  if (!user) {
    return "Account Holder";
  }

  const metadata =
    user.user_metadata || {};

  const possibleNames = [
    metadata.full_name,
    metadata.fullName,
    metadata.name,
    metadata.display_name,
    metadata.displayName,
  ];

  for (const value of possibleNames) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  if (user.email) {
    const emailName =
      user.email.split("@")[0];

    if (emailName) {
      return emailName;
    }
  }

  return "Account Holder";
}

function getPlanName(
  user: {
    user_metadata?: Record<
      string,
      unknown
    >;
  } | null
) {
  if (!user) {
    return "Free Plan";
  }

  const metadata =
    user.user_metadata || {};

  const possiblePlans = [
    metadata.plan,
    metadata.plan_name,
    metadata.planName,
    metadata.subscription_plan,
    metadata.subscriptionPlan,
  ];

  for (const value of possiblePlans) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "Free Plan";
}

export default function TwoFactorAuthenticationPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [userName, setUserName] =
    useState("Account Holder");

  const [planName, setPlanName] =
    useState("Free Plan");

  const [userEmail, setUserEmail] =
    useState("");

  const [userInitials, setUserInitials] =
    useState("U");

  const [factors, setFactors] =
    useState<MFAFactor[]>([]);

  const [loadingFactors, setLoadingFactors] =
    useState(false);

  const [enrollment, setEnrollment] =
    useState<EnrollmentData | null>(null);

  const [verificationCode, setVerificationCode] =
    useState("");

  const [loadingEnrollment, setLoadingEnrollment] =
    useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [disabling, setDisabling] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [showSecret, setShowSecret] =
    useState(false);

  /*
  ============================================================
  LOAD USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        setLoading(true);

        const {
          data,
          error,
        } =
          await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!data.user) {
          router.replace("/signin");
          return;
        }

        if (!mounted) {
          return;
        }

        const name =
          getDisplayName(data.user);

        setUserName(name);

        setUserInitials(
          getInitials(name)
        );

        setUserEmail(
          data.user.email || ""
        );

        setPlanName(
          getPlanName(data.user)
        );

        await loadFactors();
      } catch (error) {
        console.error(
          "2FA USER LOAD ERROR:",
          error
        );

        if (!mounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not load your security settings."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function loadFactors() {
      setLoadingFactors(true);

      try {
        const {
          data,
          error,
        } =
          await supabase.auth.mfa.listFactors();

        if (error) {
          throw error;
        }

        if (!mounted) {
          return;
        }

        const verifiedTotp =
          (data?.totp || []).filter(
            (factor) =>
              factor.status ===
              "verified"
          );

        const unverifiedTotp =
          (data?.totp || []).filter(
            (factor) =>
              factor.status !==
              "verified"
          );

        setFactors([
          ...verifiedTotp,
          ...unverifiedTotp,
        ]);
      } catch (error) {
        console.error(
          "2FA FACTOR LOAD ERROR:",
          error
        );

        if (!mounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not load your two-factor authentication status."
        );
      } finally {
        if (mounted) {
          setLoadingFactors(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
  ============================================================
  FACTOR STATUS
  ============================================================
  */

  const verifiedTotpFactors =
    useMemo(
      () =>
        factors.filter(
          (factor) =>
            factor.factor_type ===
              "totp" &&
            factor.status ===
              "verified"
        ),
      [factors]
    );

  const unverifiedTotpFactors =
    useMemo(
      () =>
        factors.filter(
          (factor) =>
            factor.factor_type ===
              "totp" &&
            factor.status !==
              "verified"
        ),
      [factors]
    );

  const twoFactorEnabled =
    verifiedTotpFactors.length >
    0;

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  function goBackToSecurity() {
    router.push("/security");
  }

  function goToAccount() {
    router.push("/account");
  }

  function goToNotifications() {
    router.push(
      "/account/notifications"
    );
  }

  /*
  ============================================================
  START TOTP ENROLLMENT
  ============================================================
  */

  async function startEnrollment() {
    setErrorMessage("");
    setSuccessMessage("");
    setVerificationCode("");
    setShowSecret(false);

    setLoadingEnrollment(true);

    try {
      /*
      --------------------------------------------------------
      If there is an old unverified factor, remove it first.
      --------------------------------------------------------
      */

      for (const factor of unverifiedTotpFactors) {
        const {
          error,
        } =
          await supabase.auth.mfa.unenroll(
            {
              factorId:
                factor.id,
            }
          );

        if (error) {
          console.warn(
            "Could not remove previous unverified factor:",
            error
          );
        }
      }

      /*
      --------------------------------------------------------
      Create a real TOTP factor through Supabase.
      --------------------------------------------------------
      */

      const {
        data,
        error,
      } =
        await supabase.auth.mfa.enroll(
          {
            factorType: "totp",
            friendlyName:
              "PropertySure AI Authenticator",
          }
        );

      if (error) {
        throw error;
      }

      if (
        !data ||
        !data.totp
      ) {
        throw new Error(
          "Supabase did not return the authenticator setup information."
        );
      }

      setEnrollment({
        factorId: data.id,
        qrCode:
          data.totp.qr_code,
        secret:
          data.totp.secret,
        uri:
          data.totp.uri,
        friendlyName:
          data.friendly_name ||
          "PropertySure AI Authenticator",
      });
    } catch (error) {
      console.error(
        "2FA ENROLLMENT ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not start two-factor authentication setup."
      );
    } finally {
      setLoadingEnrollment(false);
    }
  }

  /*
  ============================================================
  VERIFY TOTP
  ============================================================
  */

  async function verifyEnrollment() {
    setErrorMessage("");
    setSuccessMessage("");

    const code =
      verificationCode
        .replace(/\D/g, "")
        .slice(0, 6);

    if (code.length !== 6) {
      setErrorMessage(
        "Please enter the 6-digit code from your authenticator app."
      );
      return;
    }

    if (!enrollment) {
      setErrorMessage(
        "The authenticator setup session is no longer available. Please start again."
      );
      return;
    }

    setVerifying(true);

    try {
      /*
      --------------------------------------------------------
      Create a challenge for the newly enrolled factor.
      --------------------------------------------------------
      */

      const {
        data: challengeData,
        error: challengeError,
      } =
        await supabase.auth.mfa.challenge(
          {
            factorId:
              enrollment.factorId,
          }
        );

      if (challengeError) {
        throw challengeError;
      }

      if (!challengeData?.id) {
        throw new Error(
          "Could not create the authentication challenge."
        );
      }

      /*
      --------------------------------------------------------
      Verify the authenticator code.
      --------------------------------------------------------
      */

      const {
        error: verifyError,
      } =
        await supabase.auth.mfa.verify(
          {
            factorId:
              enrollment.factorId,
            challengeId:
              challengeData.id,
            code,
          }
        );

      if (verifyError) {
        throw verifyError;
      }

      /*
      --------------------------------------------------------
      Refresh session after successful MFA enrollment.
      --------------------------------------------------------
      */

      await supabase.auth.refreshSession();

      setEnrollment(null);
      setVerificationCode("");
      setShowSecret(false);

      setSuccessMessage(
        "Two-factor authentication has been enabled successfully."
      );

      await refreshFactors();
    } catch (error) {
      console.error(
        "2FA VERIFICATION ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The verification code is incorrect. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  }

  /*
  ============================================================
  REFRESH FACTORS
  ============================================================
  */

  async function refreshFactors() {
    try {
      const {
        data,
        error,
      } =
        await supabase.auth.mfa.listFactors();

      if (error) {
        throw error;
      }

      const verifiedTotp =
        (data?.totp || []).filter(
          (factor) =>
            factor.status ===
            "verified"
        );

      const unverifiedTotp =
        (data?.totp || []).filter(
          (factor) =>
            factor.status !==
            "verified"
        );

      setFactors([
        ...verifiedTotp,
        ...unverifiedTotp,
      ]);
    } catch (error) {
      console.error(
        "2FA FACTOR REFRESH ERROR:",
        error
      );
    }
  }

  /*
  ============================================================
  DISABLE 2FA
  ============================================================
  */

  async function disableTwoFactor() {
    if (
      verifiedTotpFactors.length ===
      0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to disable two-factor authentication? Your account will return to password-only protection."
      );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setDisabling(true);

    try {
      for (const factor of verifiedTotpFactors) {
        const {
          error,
        } =
          await supabase.auth.mfa.unenroll(
            {
              factorId:
                factor.id,
            }
          );

        if (error) {
          throw error;
        }
      }

      await supabase.auth.refreshSession();

      setSuccessMessage(
        "Two-factor authentication has been disabled."
      );

      await refreshFactors();
    } catch (error) {
      console.error(
        "2FA DISABLE ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not disable two-factor authentication."
      );
    } finally {
      setDisabling(false);
    }
  }

  /*
  ============================================================
  CANCEL ENROLLMENT
  ============================================================
  */

  async function cancelEnrollment() {
    if (enrollment) {
      try {
        await supabase.auth.mfa.unenroll(
          {
            factorId:
              enrollment.factorId,
          }
        );
      } catch (error) {
        console.warn(
          "Could not remove cancelled MFA factor:",
          error
        );
      }
    }

    setEnrollment(null);
    setVerificationCode("");
    setShowSecret(false);
    setErrorMessage("");
  }

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <main
        className={
          styles.loadingPage
        }
      >
        <div
          className={
            styles.loadingLogo
          }
        >
          ◆
        </div>

        <div
          className={
            styles.loadingBrand
          }
        >
          PropertySure
          <strong> AI</strong>
        </div>

        <div
          className={
            styles.loadingSpinner
          }
        />

        <p>
          Loading security settings...
        </p>
      </main>
    );
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <main
      className={
        styles.page
      }
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={
          styles.sidebar
        }
      >
        <button
          type="button"
          className={
            styles.brandButton
          }
          onClick={
            goToAccount
          }
        >
          <div
            className={
              styles.brandName
            }
          >
            <span
              className={
                styles.brandDiamond
              }
            >
              ◆
            </span>

            <span>
              PropertySure
              <strong> AI</strong>
            </span>
          </div>

          <div
            className={
              styles.brandSubtitle
            }
          >
            AI-Powered Property
            <br />
            Due Diligence
          </div>
        </button>

        <nav
          className={
            styles.sidebarNav
          }
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/verify"
              )
            }
          >
            <span>⇧</span>
            Verify Property
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/my-properties"
              )
            }
          >
            <span>⌂</span>
            My Properties
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/verification-history"
              )
            }
          >
            <span>◷</span>
            Verification History
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/fraud-watch"
              )
            }
          >
            <span>◇</span>
            Fraud Watch
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/reports"
              )
            }
          >
            <span>▤</span>
            Reports
          </button>
        </nav>

        <div
          className={
            styles.accountLabel
          }
        >
          ACCOUNT
        </div>

        <button
          type="button"
          className={
            styles.accountNav
          }
          onClick={
            goToAccount
          }
        >
          <span>◯</span>
          Account
        </button>

        <button
          type="button"
          className={
            styles.settingsNav
          }
          onClick={() =>
            router.push(
              "/settings"
            )
          }
        >
          <span>⚙</span>
          Settings
        </button>

        <div
          className={
            styles.helpBox
          }
        >
          <h3>
            Need Help?
          </h3>

          <p>
            Our support team is ready
            to assist you.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/account"
              )
            }
          >
            Contact Support
          </button>
        </div>

        <button
          type="button"
          className={
            styles.sidebarUser
          }
          onClick={
            goToAccount
          }
        >
          <div
            className={
              styles.userAvatar
            }
          >
            {userInitials}
          </div>

          <div
            className={
              styles.sidebarUserInfo
            }
          >
            <strong>
              {userName}
            </strong>

            <span>
              {planName}
            </span>
          </div>

          <span
            className={
              styles.userChevron
            }
          >
            ⌄
          </span>
        </button>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section
        className={
          styles.main
        }
      >
        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header
          className={
            styles.topbar
          }
        >
          <button
            type="button"
            className={
              styles.backButton
            }
            onClick={
              goBackToSecurity
            }
          >
            <span>←</span>
            Back to Security
          </button>

          <div
            className={
              styles.topbarRight
            }
          >
            {/* =================================================
                SAME NOTIFICATION BELL AS SECURITY PAGE
            ================================================= */}

            <button
              type="button"
              className={
                styles.notificationButton
              }
              aria-label="Notifications"
              onClick={
                goToNotifications
              }
            >
              <span
                className={
                  styles.notificationBell
                }
              >
                🔔
              </span>

              <i />
            </button>

            <button
              type="button"
              className={
                styles.topProfile
              }
              onClick={
                goToAccount
              }
            >
              <div
                className={
                  styles.topAvatar
                }
              >
                {userInitials}
              </div>

              <div
                className={
                  styles.topProfileInfo
                }
              >
                <strong>
                  {userName}
                </strong>

                <span>
                  {planName}
                </span>
              </div>

              <span
                className={
                  styles.profileChevron
                }
              >
                ⌄
              </span>
            </button>
          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <div
          className={
            styles.pageContent
          }
        >
          <div
            className={
              styles.pageIntro
            }
          >
            <h1>
              Two-Factor Authentication
            </h1>

            <p>
              Add an extra layer of
              protection to your account.
            </p>
          </div>

          {/* =================================================
              ERROR / SUCCESS
          ================================================= */}

          {errorMessage && (
            <div
              className={
                styles.errorMessage
              }
            >
              <span>!</span>

              <div>
                {errorMessage}
              </div>

              <button
                type="button"
                aria-label="Close error"
                onClick={() =>
                  setErrorMessage("")
                }
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
            >
              <span>✓</span>

              <div>
                {successMessage}
              </div>

              <button
                type="button"
                aria-label="Close success message"
                onClick={() =>
                  setSuccessMessage("")
                }
              >
                ×
              </button>
            </div>
          )}

          {/* =================================================
              ENROLLMENT PANEL
          ================================================= */}

          {enrollment ? (
            <section
              className={
                styles.enrollmentCard
              }
            >
              <div
                className={
                  styles.enrollmentHeader
                }
              >
                <div>
                  <h2>
                    Set Up Your Authenticator
                  </h2>

                  <p>
                    Scan the QR code with
                    Google Authenticator,
                    Microsoft Authenticator,
                    Authy, or another
                    compatible authenticator
                    app.
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    styles.closeEnrollment
                  }
                  onClick={
                    cancelEnrollment
                  }
                  disabled={
                    verifying
                  }
                >
                  ×
                </button>
              </div>

              <div
                className={
                  styles.enrollmentBody
                }
              >
                <div
                  className={
                    styles.qrSection
                  }
                >
                  <div
                    className={
                      styles.qrWrapper
                    }
                  >
                    <img
                      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                        enrollment.qrCode
                      )}`}
                      alt="Scan this QR code with your authenticator app"
                      className={
                        styles.qrCode
                      }
                    />
                  </div>

                  <p
                    className={
                      styles.qrHelp
                    }
                  >
                    Open your authenticator
                    app and scan this QR
                    code.
                  </p>
                </div>

                <div
                  className={
                    styles.setupSteps
                  }
                >
                  <div
                    className={
                      styles.setupStep
                    }
                  >
                    <span>
                      1
                    </span>

                    <div>
                      <strong>
                        Open your authenticator
                        app
                      </strong>

                      <p>
                        Use Google
                        Authenticator,
                        Microsoft
                        Authenticator, Authy,
                        or another TOTP
                        authenticator.
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      styles.setupStep
                    }
                  >
                    <span>
                      2
                    </span>

                    <div>
                      <strong>
                        Scan the QR code
                      </strong>

                      <p>
                        Your authenticator
                        will create a
                        PropertySure AI
                        account entry.
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      styles.setupStep
                    }
                  >
                    <span>
                      3
                    </span>

                    <div>
                      <strong>
                        Enter the 6-digit code
                      </strong>

                      <p>
                        Enter the current
                        verification code
                        generated by your
                        authenticator.
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      styles.secretSection
                    }
                  >
                    <button
                      type="button"
                      className={
                        styles.secretToggle
                      }
                      onClick={() =>
                        setShowSecret(
                          (value) =>
                            !value
                        )
                      }
                    >
                      {showSecret
                        ? "Hide setup key"
                        : "Can't scan? Show setup key"}
                    </button>

                    {showSecret && (
                      <div
                        className={
                          styles.secretBox
                        }
                      >
                        <span>
                          {enrollment.secret}
                        </span>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                enrollment.secret
                              );

                              setSuccessMessage(
                                "Setup key copied to your clipboard."
                              );
                            } catch {
                              setErrorMessage(
                                "Could not copy the setup key."
                              );
                            }
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.verificationArea
                }
              >
                <label
                  htmlFor="verificationCode"
                >
                  Verification Code
                </label>

                <div
                  className={
                    styles.codeRow
                  }
                >
                  <input
                    id="verificationCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={
                      verificationCode
                    }
                    onChange={(event) =>
                      setVerificationCode(
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 6)
                      )
                    }
                    placeholder="000000"
                    disabled={
                      verifying
                    }
                  />

                  <button
                    type="button"
                    className={
                      styles.verifyButton
                    }
                    onClick={
                      verifyEnrollment
                    }
                    disabled={
                      verifying ||
                      verificationCode.length !==
                        6
                    }
                  >
                    {verifying ? (
                      <>
                        <span
                          className={
                            styles.buttonSpinner
                          }
                        />

                        Verifying...
                      </>
                    ) : (
                      "Enable 2FA"
                    )}
                  </button>
                </div>

                <p>
                  Enter the code currently
                  shown in your authenticator
                  app.
                </p>
              </div>

              <div
                className={
                  styles.enrollmentActions
                }
              >
                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  onClick={
                    cancelEnrollment
                  }
                  disabled={
                    verifying
                  }
                >
                  Cancel
                </button>
              </div>
            </section>
          ) : (
            <>
              {/* ============================================
                  STATUS CARD
              ============================================ */}

              <section
                className={
                  twoFactorEnabled
                    ? styles.statusCardEnabled
                    : styles.statusCard
                }
              >
                <div
                  className={
                    twoFactorEnabled
                      ? styles.statusIconEnabled
                      : styles.statusIcon
                  }
                >
                  {twoFactorEnabled
                    ? "✓"
                    : "♢"}
                </div>

                <div
                  className={
                    styles.statusText
                  }
                >
                  <h2>
                    {twoFactorEnabled
                      ? "Two-Factor Authentication is enabled"
                      : "Two-Factor Authentication is not enabled"}
                  </h2>

                  <p>
                    {twoFactorEnabled
                      ? "Your account is protected by your password and an authenticator app."
                      : "Your account is currently protected by your password only."}
                  </p>
                </div>

                {twoFactorEnabled ? (
                  <button
                    type="button"
                    className={
                      styles.disableButton
                    }
                    onClick={
                      disableTwoFactor
                    }
                    disabled={
                      disabling
                    }
                  >
                    {disabling
                      ? "Disabling..."
                      : "Disable 2FA"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={
                      styles.setupButton
                    }
                    onClick={
                      startEnrollment
                    }
                    disabled={
                      loadingEnrollment ||
                      loadingFactors
                    }
                  >
                    {loadingEnrollment
                      ? "Preparing..."
                      : "Set Up 2FA"}
                  </button>
                )}
              </section>

              {/* ============================================
                  INFORMATION GRID
              ============================================ */}

              <div
                className={
                  styles.infoGrid
                }
              >
                {/* HOW IT WORKS */}

                <section
                  className={
                    styles.howCard
                  }
                >
                  <h2>
                    How Two-Factor Authentication
                    Works
                  </h2>

                  <p
                    className={
                      styles.cardIntro
                    }
                  >
                    When 2FA is enabled,
                    you'll sign in using two
                    steps:
                  </p>

                  <div
                    className={
                      styles.workStep
                    }
                  >
                    <span
                      className={
                        styles.stepNumber
                      }
                    >
                      1
                    </span>

                    <div
                      className={
                        styles.stepIcon
                      }
                    >
                      ♙
                    </div>

                    <div>
                      <h3>
                        Enter your password
                      </h3>

                      <p>
                        You'll enter your
                        account password as
                        usual.
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      styles.workStep
                    }
                  >
                    <span
                      className={
                        styles.stepNumber
                      }
                    >
                      2
                    </span>

                    <div
                      className={
                        styles.stepIcon
                      }
                    >
                      ▣
                    </div>

                    <div>
                      <h3>
                        Enter verification code
                      </h3>

                      <p>
                        You'll enter the
                        current code generated
                        by your authenticator
                        app.
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      styles.strongerSecurity
                    }
                  >
                    <div
                      className={
                        styles.strongerIcon
                      }
                    >
                      ✓
                    </div>

                    <div>
                      <h3>
                        Stronger account security
                      </h3>

                      <p>
                        Even if someone knows
                        your password, they
                        can't access your
                        account without your
                        verification code.
                      </p>
                    </div>
                  </div>
                </section>

                {/* SUPPORTED METHODS */}

                <div
                  className={
                    styles.rightCards
                  }
                >
                  <section
                    className={
                      styles.supportCard
                    }
                  >
                    <h2>
                      Supported Methods
                    </h2>

                    <p>
                      Use an authenticator
                      app to generate
                      verification codes.
                    </p>

                    <ul>
                      <li>
                        <span>✓</span>
                        Authenticator apps
                        (recommended)
                      </li>

                      <li>
                        <span>✓</span>
                        Time-based one-time
                        codes (TOTP)
                      </li>

                      <li>
                        <span>✓</span>
                        Works offline
                      </li>

                      <li>
                        <span>✓</span>
                        More secure than SMS
                      </li>
                    </ul>
                  </section>

                  <section
                    className={
                      styles.supportCard
                    }
                  >
                    <h2>
                      Recommended Authenticator
                      Apps
                    </h2>

                    <p>
                      You can use any compatible
                      TOTP authenticator app.
                    </p>

                    <div
                      className={
                        styles.appList
                      }
                    >
                      <div>
                        <span
                          className={
                            styles.appMark
                          }
                        >
                          G
                        </span>

                        Google Authenticator
                      </div>

                      <div>
                        <span
                          className={
                            styles.appMark
                          }
                        >
                          M
                        </span>

                        Microsoft Authenticator
                      </div>

                      <div>
                        <span
                          className={
                            styles.appMark
                          }
                        >
                          A
                        </span>

                        Authy
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* ============================================
                  IMPORTANT
              ============================================ */}

              <section
                className={
                  styles.importantCard
                }
              >
                <div
                  className={
                    styles.importantIcon
                  }
                >
                  ♙
                </div>

                <div>
                  <h2>
                    Important
                  </h2>

                  <p>
                    Keep access to the
                    authenticator device you
                    use for PropertySure AI.
                    If you lose that device,
                    you may not be able to
                    complete the second
                    authentication step.
                  </p>
                </div>

                <span
                  className={
                    styles.importantLabel
                  }
                >
                  Protect your authenticator
                  device
                </span>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}