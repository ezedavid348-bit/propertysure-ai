"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../lib/supabase";

import AppShell from "../AppShell/AppShell";
import LoadingScreen from "../AppShell/LoadingScreen";

import styles from "./two-factor.module.css";

/* ============================================================
   TYPES
============================================================ */

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

/* ============================================================
   PAGE
============================================================ */

export default function TwoFactorAuthenticationPage() {
  const router = useRouter();

  /* ==========================================================
     PAGE LOADING
  ========================================================== */

  const [loading, setLoading] =
    useState(true);

  /* ==========================================================
     MFA STATE
  ========================================================== */

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

  /* ==========================================================
     MESSAGES
  ========================================================== */

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [showSecret, setShowSecret] =
    useState(false);

  /* ==========================================================
     LOAD MFA FACTORS
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadSecurityData() {
      try {
        setLoading(true);
        setLoadingFactors(true);

        /*
         * Make sure the user is authenticated.
         */

        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!userData.user) {
          router.replace("/signin");
          return;
        }

        /*
         * Load MFA factors.
         */

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
          "2FA LOAD ERROR:",
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
          setLoadingFactors(false);
          setLoading(false);
        }
      }
    }

    loadSecurityData();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* ==========================================================
     FACTOR STATUS
  ========================================================== */

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

  /* ==========================================================
     BACK TO SECURITY & PRIVACY
  ========================================================== */

  function goBackToSecurity() {
    router.push(
      "/settings/security"
    );
  }

  /* ==========================================================
     START TOTP ENROLLMENT
  ========================================================== */

  async function startEnrollment() {
    setErrorMessage("");
    setSuccessMessage("");
    setVerificationCode("");
    setShowSecret(false);
    setLoadingEnrollment(true);

    try {
      /*
       * Remove previous unverified factors.
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
       * Create a new Supabase TOTP factor.
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

  /* ==========================================================
     VERIFY TOTP ENROLLMENT
  ========================================================== */

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
       * Create challenge.
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
       * Verify code.
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
       * Refresh Supabase session.
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

  /* ==========================================================
     REFRESH MFA FACTORS
  ========================================================== */

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

  /* ==========================================================
     DISABLE 2FA
  ========================================================== */

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

  /* ==========================================================
     CANCEL ENROLLMENT
  ========================================================== */

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

  /* ==========================================================
     SHARED APP-SHELL LOADING SCREEN
  ========================================================== */

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <AppShell
      activePath="/settings"
      headerPath="/settings"
    >
      <main
        className={
          styles.page
        }
      >
        <div
          className={
            styles.content
          }
        >
          {/* ==================================================
              TITLE
          ================================================== */}

          <section
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

            {/* BACK BUTTON IS NOW BELOW THE
                TITLE AND DESCRIPTION */}

            <button
              type="button"
              className={
                styles.backButton
              }
              onClick={
                goBackToSecurity
              }
            >
              <span
                className={
                  styles.backArrow
                }
              >
                ←
              </span>

              Back to Security &amp; Privacy
            </button>
          </section>

          {/* ==================================================
              ERROR
          ================================================== */}

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

          {/* ==================================================
              SUCCESS
          ================================================== */}

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

          {/* ==================================================
              ENROLLMENT PANEL
          ================================================== */}

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
                {/* QR */}

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

                {/* SETUP STEPS */}

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

                  {/* SECRET */}

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

              {/* VERIFICATION */}

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

              {/* CANCEL */}

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
              {/* =================================================
                  STATUS
              ================================================= */}

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

              {/* =================================================
                  INFORMATION GRID
              ================================================= */}

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

                {/* RIGHT SIDE */}

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

              {/* =================================================
                  IMPORTANT
              ================================================= */}

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
      </main>
    </AppShell>
  );
}