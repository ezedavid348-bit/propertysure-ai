"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "../lib/supabase";

import styles from "./signin.module.css";

/* ============================================================
   TYPES
============================================================ */

type IconProps = {
  size?: number;
};

/* ============================================================
   PROPERTYSURE AI LOGO
============================================================ */

function PropertySureLogo({
  size = 25,
}: IconProps) {
  return (
    <span
      className={styles.propertyLogo}
      style={{
        fontSize: `${size}px`,
      }}
      aria-hidden="true"
    >
      ◆
    </span>
  );
}

/* ============================================================
   ICONS
============================================================ */

function MailIcon({
  size = 22,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M4 7L12 13L20 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({
  size = 22,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({
  size = 21,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 12C4.7 7.8 8 5.7 12 5.7C16 5.7 19.3 7.8 21.5 12C19.3 16.2 16 18.3 12 18.3C8 18.3 4.7 16.2 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <circle
        cx="12"
        cy="12"
        r="2.7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.35 12.23C21.35 11.57 21.29 10.93 21.17 10.32H12V14.05H17.1C16.88 15.25 16.2 16.27 15.23 16.94V19.38H18.35C20.18 17.69 21.35 15.2 21.35 12.23Z"
        fill="#4285F4"
      />

      <path
        d="M12 21.5C14.61 21.5 16.8 20.64 18.35 19.38L15.23 16.94C14.37 17.52 13.27 17.86 12 17.86C9.48 17.86 7.34 16.16 6.58 13.87H3.36V16.39C4.9 19.42 8.08 21.5 12 21.5Z"
        fill="#34A853"
      />

      <path
        d="M6.58 13.87C6.39 13.32 6.28 12.73 6.58 10.37V7.85H3.36C2.7 9.16 2.33 10.64 3.36 16.39L6.58 13.87Z"
        fill="#FBBC05"
      />

      <path
        d="M12 6.38C13.42 6.38 14.7 6.87 15.7 7.82L18.42 5.1C16.8 3.59 14.61 2.65 12 2.65C8.08 2.65 4.9 4.73 3.36 7.85L6.58 10.37C7.34 8.08 9.48 6.38 12 6.38Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 12H5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M11 6L5 12L11 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldCheckIcon({
  size = 27,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3L19 6V11.5C19 16.2 16.2 19.5 12 21C7.8 19.5 5 16.2 5 11.5V6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M8.5 12L10.8 14.3L15.5 9.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon({
  size = 25,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 20V18.5C16 16.57 14.43 15 12.5 15H6.5C4.57 15 3 16.57 3 18.5V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle
        cx="9.5"
        cy="8"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M17 11C18.66 11 20 9.66 20 8C20 6.34 18.66 5 17 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M17 15.5C19.21 15.5 21 17.29 21 19.5V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRightIcon({
  size = 19,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />

      <path
        d="M13 6L19 12L13 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================
   SIGN IN PAGE
============================================================ */

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ==========================================================
     OTP STATE
  ========================================================== */

  const [
    showVerification,
    setShowVerification,
  ] = useState(false);

  const [
    verificationCode,
    setVerificationCode,
  ] = useState("");

  const [
    verifying,
    setVerifying,
  ] = useState(false);

  const [
    resending,
    setResending,
  ] = useState(false);

  /* ==========================================================
     AUTH STATE LISTENER
  ========================================================== */

  useEffect(() => {
    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log(
            "AUTH STATE:",
            event,
            session?.user?.email ||
              "NO SESSION"
          );
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* ==========================================================
     SIGN IN
  ========================================================== */

  const handleSignIn = async () => {
    setError("");
    setSuccess("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data,
        error: signInError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email: cleanEmail,
            password,
          }
        );

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error(
          "We couldn't verify your account."
        );
      }

      const {
        error: otpError,
      } =
        await supabase.auth.signInWithOtp({
          email: cleanEmail,

          options: {
            shouldCreateUser: false,
          },
        });

      if (otpError) {
        throw otpError;
      }

      setVerificationCode("");

      setShowVerification(true);

      setSuccess(
        "Your account was verified. An 8-digit security code has been sent to your email."
      );
    } catch (err: any) {
      console.error(
        "SIGN IN ERROR:",
        err
      );

      setError(
        err?.message ||
          "We couldn't sign you in. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     VERIFY EMAIL CODE
  ========================================================== */

  const handleVerifyEmail = async (
    codeOverride?: string
  ) => {
    setError("");
    setSuccess("");

    const code =
      codeOverride ??
      verificationCode;

    if (!/^\d{8}$/.test(code)) {
      setError(
        "Please enter the 8-digit verification code."
      );
      return;
    }

    try {
      setVerifying(true);

      const cleanEmail =
        email.trim().toLowerCase();

      const {
        data,
        error: verifyError,
      } =
        await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: code,
          type: "email",
        });

      if (verifyError) {
        throw verifyError;
      }

      console.log(
        "OTP VERIFIED:",
        data.user?.email
      );

      if (!data.session) {
        throw new Error(
          "Your code was accepted, but Supabase did not create an authenticated session."
        );
      }

      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.session) {
        throw new Error(
          "Your session could not be saved in this browser. Please try signing in again."
        );
      }

      const {
        data: userData,
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!userData.user) {
        throw new Error(
          "Your session was created, but the authenticated user could not be loaded."
        );
      }

      console.log(
        "AUTHENTICATED SESSION CONFIRMED:",
        userData.user.email
      );

      setSuccess(
        "Verification successful. Signing you in..."
      );

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 250)
      );

      router.replace(
        "/dashboard"
      );

    } catch (err: any) {
      console.error(
        "OTP VERIFICATION ERROR:",
        err
      );

      setError(
        err?.message ||
          "Invalid verification code. Please check your email and try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  /* ==========================================================
     OTP INPUT
  ========================================================== */

  const handleOtpChange = (
    index: number,
    value: string
  ) => {
    const digits =
      value.replace(/\D/g, "");

    if (!digits) {
      const code =
        verificationCode.split("");

      code[index] = "";

      setVerificationCode(
        code.join("").slice(0, 8)
      );

      return;
    }

    const digit =
      digits[0];

    const code =
      verificationCode.split("");

    code[index] = digit;

    const newCode =
      code.join("").slice(0, 8);

    setVerificationCode(
      newCode
    );

    if (index < 7) {
      document
        .getElementById(
          `signin-otp-${index + 1}`
        )
        ?.focus();
    }

    if (
      newCode.length === 8 &&
      /^\d{8}$/.test(newCode)
    ) {
      void handleVerifyEmail(
        newCode
      );
    }
  };

  /* ==========================================================
     OTP PASTE
  ========================================================== */

  const handleOtpPaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pastedCode =
      e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 8);

    if (!pastedCode) {
      return;
    }

    setVerificationCode(
      pastedCode
    );

    const nextIndex =
      Math.min(
        pastedCode.length,
        7
      );

    document
      .getElementById(
        `signin-otp-${nextIndex}`
      )
      ?.focus();

    if (
      pastedCode.length === 8 &&
      /^\d{8}$/.test(
        pastedCode
      )
    ) {
      void handleVerifyEmail(
        pastedCode
      );
    }
  };

  /* ==========================================================
     OTP KEYBOARD NAVIGATION
  ========================================================== */

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (
      e.key === "Backspace" &&
      !verificationCode[index] &&
      index > 0
    ) {
      document
        .getElementById(
          `signin-otp-${index - 1}`
        )
        ?.focus();
    }

    if (
      e.key === "ArrowLeft" &&
      index > 0
    ) {
      document
        .getElementById(
          `signin-otp-${index - 1}`
        )
        ?.focus();
    }

    if (
      e.key === "ArrowRight" &&
      index < 7
    ) {
      document
        .getElementById(
          `signin-otp-${index + 1}`
        )
        ?.focus();
    }
  };

  /* ==========================================================
     RESEND CODE
  ========================================================== */

  const handleResendCode =
    async () => {
      setError("");
      setSuccess("");

      const cleanEmail =
        email.trim().toLowerCase();

      if (!cleanEmail) {
        setError(
          "We couldn't determine your email address."
        );
        return;
      }

      try {
        setResending(true);

        const {
          error: resendError,
        } =
          await supabase.auth.signInWithOtp({
            email: cleanEmail,

            options: {
              shouldCreateUser:
                false,
            },
          });

        if (resendError) {
          throw resendError;
        }

        setVerificationCode("");

        setSuccess(
          "A new 8-digit security code has been sent to your email."
        );
      } catch (err: any) {
        console.error(
          "RESEND OTP ERROR:",
          err
        );

        setError(
          err?.message ||
            "We couldn't resend the verification code. Please try again."
        );
      } finally {
        setResending(false);
      }
    };

  /* ==========================================================
     GOOGLE SIGN IN
  ========================================================== */

  const handleGoogleSignIn =
    async () => {
      setError("");
      setSuccess("");

      try {
        setGoogleLoading(true);

        const {
          error: googleError,
        } =
          await supabase.auth.signInWithOAuth(
            {
              provider: "google",

              options: {
                redirectTo:
                  `${window.location.origin}/dashboard`,
              },
            }
          );

        if (googleError) {
          throw googleError;
        }
      } catch (err: any) {
        console.error(
          "GOOGLE SIGN IN ERROR:",
          err
        );

        setError(
          err?.message ||
            "Google sign-in could not be started. Please try again."
        );

        setGoogleLoading(false);
      }
    };

  /* ==========================================================
     FORGOT PASSWORD
  ========================================================== */

  const handleForgotPassword =
    async () => {
      setError("");
      setSuccess("");

      const cleanEmail =
        email.trim().toLowerCase();

      if (!cleanEmail) {
        setError(
          "Enter your email address first, then select Forgot password."
        );
        return;
      }

      try {
        setLoading(true);

        const {
          error: resetError,
        } =
          await supabase.auth.resetPasswordForEmail(
            cleanEmail,
            {
              redirectTo:
                `${window.location.origin}/reset-password`,
            }
          );

        if (resetError) {
          throw resetError;
        }

        setSuccess(
          "If an account exists for this email, a password reset link has been sent."
        );
      } catch (err: any) {
        console.error(
          "PASSWORD RESET ERROR:",
          err
        );

        setError(
          err?.message ||
            "We couldn't send the password reset email."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ==========================================================
     MASK EMAIL
  ========================================================== */

  const emailParts =
    email.trim().split("@");

  const maskedEmail =
    emailParts.length === 2
      ? `${emailParts[0].slice(
          0,
          Math.min(
            3,
            emailParts[0].length
          )
        )}***@${emailParts[1]}`
      : "your email address";

  /* ==========================================================
     OTP VERIFICATION SCREEN
  ========================================================== */

  if (showVerification) {
    return (
      <main
        className={
          styles.page
        }
      >

        <div
          className={
            styles.verificationCard
          }
        >

          <button
            type="button"
            className={
              styles.backButton
            }
            onClick={() => {
              setShowVerification(
                false
              );

              setVerificationCode("");

              setError("");
              setSuccess("");
            }}
            aria-label="Back to sign in"
          >
            <ArrowLeftIcon />
          </button>

          <div
            className={
              styles.verificationContent
            }
          >

            <div
              className={
                styles.verificationBrand
              }
            >

              <PropertySureLogo
                size={38}
              />

              <div
                className={
                  styles.verificationBrandName
                }
              >
                PropertySure
                <strong>
                  {" "}AI
                </strong>
              </div>

            </div>

            <div
              className={
                styles.verificationBrandSubtitle
              }
            >
              AI-POWERED PROPERTY DUE DILIGENCE
            </div>

            <div
              className={
                styles.verificationEyebrow
              }
            >
              SECURE SIGN IN
            </div>

            <h1>
              Verify your email
            </h1>

            <p
              className={
                styles.verificationText
              }
            >
              We've sent an 8-digit
              security code to
            </p>

            <div
              className={
                styles.verificationEmail
              }
            >
              {maskedEmail}
            </div>

            <div
              className={
                styles.otpContainer
              }
            >

              {[
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
              ].map(
                (index) => (
                  <input
                    key={index}
                    id={`signin-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }
                    maxLength={1}
                    value={
                      verificationCode[
                        index
                      ] || ""
                    }
                    onChange={(e) =>
                      handleOtpChange(
                        index,
                        e.target.value
                      )
                    }
                    onPaste={
                      index === 0
                        ? handleOtpPaste
                        : undefined
                    }
                    onKeyDown={(e) =>
                      handleOtpKeyDown(
                        e,
                        index
                      )
                    }
                    className={
                      styles.otpInput
                    }
                    disabled={
                      verifying
                    }
                    aria-label={`Verification digit ${index + 1}`}
                  />
                )
              )}

            </div>

            <div
              className={
                styles.verificationHint
              }
            >

              <div
                className={
                  styles.verificationHintIcon
                }
              >
                <ShieldCheckIcon
                  size={24}
                />
              </div>

              <span>
                Enter the 8-digit code
                to complete your
                secure sign-in.
              </span>

            </div>

            {error && (
              <div
                className={
                  styles.errorBox
                }
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className={
                  styles.successBox
                }
              >
                {success}
              </div>
            )}

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={() =>
                handleVerifyEmail()
              }
              disabled={
                verifying ||
                verificationCode.length !==
                  8
              }
            >
              <span>
                {verifying
                  ? "Verifying..."
                  : "Verify & Sign In"}
              </span>

              {!verifying && (
                <ArrowRightIcon />
              )}
            </button>

            <div
              className={
                styles.resendText
              }
            >
              Didn't receive the code?{" "}

              <button
                type="button"
                onClick={
                  handleResendCode
                }
                disabled={
                  resending
                }
              >
                {resending
                  ? "Sending..."
                  : "Resend code"}
              </button>

            </div>

            <div
              className={
                styles.secureText
              }
            >

              <LockIcon size={16} />

              <span>
                Your account is protected
                by PropertySure AI
              </span>

            </div>

          </div>

        </div>

      </main>
    );
  }

  /* ==========================================================
     MAIN SIGN-IN SCREEN
  ========================================================== */

  return (
    <main
      className={
        styles.page
      }
    >

      {/* ======================================================
          TOP BRAND / CREATE ACCOUNT
      ====================================================== */}

      <header
        className={
          styles.topHeader
        }
      >

        <button
          type="button"
          className={
            styles.topBrand
          }
          onClick={() =>
            router.push("/")
          }
          aria-label="Go to PropertySure AI home"
        >

          <PropertySureLogo
            size={39}
          />

          <div
            className={
              styles.topBrandText
            }
          >
            <span>
              PropertySure
              <strong>
                {" "}AI
              </strong>
            </span>

            <small>
              AI-POWERED PROPERTY DUE DILIGENCE
            </small>
          </div>

        </button>

        <div
          className={
            styles.topSignup
          }
        >

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/signup"
              )
            }
          >
            Create an account
          </button>

        </div>

      </header>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <section
        className={
          styles.mainLayout
        }
      >

        {/* ====================================================
            LEFT SIDE
        ==================================================== */}

        <div
          className={
            styles.heroPanel
          }
        >

          <div
            className={
              styles.heroEyebrow
            }
          >
            PROPERTY VERIFICATION
          </div>

          <h1>
            Make Smarter
            <br />

            <span>
              Property Decisions
            </span>
          </h1>

          <p
            className={
              styles.heroDescription
            }
          >
            AI-powered insights, verified data,
            and complete confidence — all in one
            place.
          </p>

          {/* ==================================================
              PROPERTY VISUAL

              REAL PROPERTY IMAGE

              DESKTOP:
              Appears directly below the hero description.

              MOBILE:
              Hidden through the existing mobile CSS.
          ================================================== */}

          <div
            className={
              styles.propertyVisual
            }
          >

            <img
              src="/property-visual.png"
              alt="Property verification and safer property decisions"
              className={
                styles.propertyImage
              }
            />

          </div>

        </div>

        {/* ====================================================
            SIGN-IN CARD
        ==================================================== */}

        <div
          className={
            styles.signinCard
          }
        >

          <div
            className={
              styles.cardBrand
            }
          >

            <PropertySureLogo
              size={38}
            />

            <div>
              <div
                className={
                  styles.cardBrandName
                }
              >
                PropertySure
                <strong>
                  {" "}AI
                </strong>
              </div>

              <div
                className={
                  styles.cardBrandTagline
                }
              >
                AI-POWERED PROPERTY DUE DILIGENCE
              </div>
            </div>

          </div>

          <div
            className={
              styles.header
            }
          >

            <div
              className={
                styles.eyebrow
              }
            >
              WELCOME BACK
            </div>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Continue your property verification
              journey with secure access to your
              dashboard.
            </p>

          </div>

          {error && (
            <div
              className={
                styles.errorBox
              }
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className={
                styles.successBox
              }
            >
              {success}
            </div>
          )}

          {/* ==================================================
              EMAIL
          ================================================== */}

          <div
            className={
              styles.fieldGroup
            }
          >

            <label>
              Email Address
            </label>

            <div
              className={
                styles.inputBox
              }
            >

              <div
                className={
                  styles.fieldIcon
                }
              >
                <MailIcon />
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="Enter your email address"
                className={
                  styles.fieldInput
                }
                autoComplete="email"
                disabled={
                  loading
                }
              />

            </div>

          </div>

          {/* ==================================================
              PASSWORD
          ================================================== */}

          <div
            className={
              styles.fieldGroup
            }
          >

            <label>
              Password
            </label>

            <div
              className={
                styles.passwordBox
              }
            >

              <div
                className={
                  styles.fieldIcon
                }
              >
                <LockIcon />
              </div>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter your password"
                className={
                  styles.passwordInput
                }
                autoComplete="current-password"
                disabled={
                  loading
                }
              />

              <button
                type="button"
                className={
                  styles.eyeButton
                }
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <EyeIcon />
              </button>

            </div>

          </div>

          {/* ==================================================
              ACCOUNT OPTIONS
          ================================================== */}

          <div
            className={
              styles.accountOptions
            }
          >

            <label
              className={
                styles.remember
              }
            >

              <input
                type="checkbox"
                checked={
                  rememberMe
                }
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
              />

              <span>
                Remember me
              </span>

            </label>

            <button
              type="button"
              className={
                styles.forgotButton
              }
              onClick={
                handleForgotPassword
              }
              disabled={
                loading
              }
            >
              Forgot password?
            </button>

          </div>

          {/* ==================================================
              SIGN IN BUTTON
          ================================================== */}

          <button
            type="button"
            className={
              styles.primaryButton
            }
            onClick={
              handleSignIn
            }
            disabled={
              loading ||
              googleLoading
            }
          >

            <span>
              {loading
                ? "Checking Account..."
                : "Continue to Sign In"}
            </span>

            {!loading && (
              <ArrowRightIcon />
            )}

          </button>

          {/* ==================================================
              SECURITY MESSAGE
          ================================================== */}

          <div
            className={
              styles.securityMessage
            }
          >

            <div
              className={
                styles.securityIcon
              }
            >
              <ShieldCheckIcon
                size={23}
              />
            </div>

            <span>
              After your password is verified,
              we'll send a security code to
              your email.
            </span>

          </div>

          {/* ==================================================
              DIVIDER
          ================================================== */}

          <div
            className={
              styles.divider
            }
          >

            <span />

            <div>
              or
            </div>

            <span />

          </div>

          {/* ==================================================
              GOOGLE
          ================================================== */}

          <button
            type="button"
            className={
              styles.googleButton
            }
            onClick={
              handleGoogleSignIn
            }
            disabled={
              loading ||
              googleLoading
            }
          >

            <GoogleIcon />

            <span>
              {googleLoading
                ? "Connecting..."
                : "Continue with Google"}
            </span>

          </button>

          {/* ==================================================
              MOBILE SIGN UP
          ================================================== */}

          <div
            className={
              styles.signupText
            }
          >

            Don't have an account?{" "}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/signup"
                )
              }
            >
              Create an account
            </button>

          </div>

        </div>

      </section>

      {/* ======================================================
          TRUST STRIP
      ====================================================== */}

      <section
        className={
          styles.trustFeatures
        }
      >

        <div
          className={
            styles.trustFeature
          }
        >

          <div
            className={
              styles.trustIcon
            }
          >
            <ShieldCheckIcon
              size={24}
            />
          </div>

          <div>
            <strong>
              Trusted by Professionals
            </strong>

            <span>
              Across the property industry
            </span>
          </div>

        </div>

        <div
          className={
            styles.trustDivider
          }
        />

        <div
          className={
            styles.trustFeature
          }
        >

          <div
            className={
              styles.trustIcon
            }
          >
            <UsersIcon
              size={24}
            />
          </div>

          <div>
            <strong>
              Built for Your Confidence
            </strong>

            <span>
              Smarter tools. Safer decisions.
            </span>
          </div>

        </div>

        <div
          className={
            styles.trustDivider
          }
        />

        <div
          className={
            styles.trustFeature
          }
        >

          <div
            className={
              styles.trustIcon
            }
          >
            <span>
              ⚡
            </span>
          </div>

          <div>
            <strong>
              A Brighter Property Future
            </strong>

            <span>
              Powered by AI
            </span>
          </div>

        </div>

      </section>

    </main>
  );
}