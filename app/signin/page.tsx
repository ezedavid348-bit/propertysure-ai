"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "../lib/supabase";

/* ============================================================
   TYPES
============================================================ */

type IconProps = {
  size?: number;
};

/* ============================================================
   PROPERTYSURE AI BRAND
   ============================================================
   This matches the branding currently used on the Dashboard:

   ◆ PropertySure AI

   AI uses the Dashboard blue:
   #168eff
============================================================ */

function PropertySureLogo({
  size = 25,
}: IconProps) {
  return (
    <span
      className="propertyLogo"
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
        d="M6.58 13.87C6.39 13.32 6.28 12.73 6.58 10.37V7.85H3.36C2.7 9.16 2.33 10.64 2.33 12.12C2.33 13.6 2.7 15.08 3.36 16.39L6.58 13.87Z"
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

function ShieldCheckIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3L19 6V11.5C19 16.2 16.2 19.5 12 21C7.8 19.5 5 16.2 5 11.5V6L12 3Z"
        stroke="#168eff"
        strokeWidth="1.7"
      />

      <path
        d="M8.5 12L10.8 14.3L15.5 9.6"
        stroke="#168eff"
        strokeWidth="1.8"
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
  ==========================================================
     Keep this page synchronized with the Supabase browser
     authentication session.
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

      /*
       * ======================================================
       * STEP 1
       * ======================================================
       * Verify email + password.
       *
       * IMPORTANT:
       *
       * We DO NOT call signOut() afterwards.
       *
       * The previous implementation created a valid session
       * and immediately destroyed it before starting the OTP
       * flow.
       */

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

      /*
       * ======================================================
       * STEP 2
       * ======================================================
       * Send the 8-digit email OTP.
       *
       * The OTP is now the second security step.
       */

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

      /*
       * ======================================================
       * STEP 3
       * ======================================================
       * Show OTP verification screen.
       */

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

      /*
       * ======================================================
       * STEP 1
       * ======================================================
       * Verify the email OTP.
       *
       * Supabase should create the authenticated session here.
       */

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

      /*
       * ======================================================
       * STEP 2
       * ======================================================
       * First confirmation:
       *
       * Did verifyOtp return a session?
       */

      if (!data.session) {
        throw new Error(
          "Your code was accepted, but Supabase did not create an authenticated session."
        );
      }

      /*
       * ======================================================
       * STEP 3
       * ======================================================
       * Second confirmation:
       *
       * Is the session actually available from the browser
       * Supabase client?
       */

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

      /*
       * ======================================================
       * STEP 4
       * ======================================================
       * Third confirmation:
       *
       * Can Supabase identify the authenticated user?
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
        throw new Error(
          "Your session was created, but the authenticated user could not be loaded."
        );
      }

      /*
       * ======================================================
       * SESSION IS DEFINITELY READY
       * ======================================================
       */

      console.log(
        "AUTHENTICATED SESSION CONFIRMED:",
        userData.user.email
      );

      setSuccess(
        "Verification successful. Signing you in..."
      );

      /*
       * Give Supabase's auth state listener a moment to
       * finish propagating the session before navigation.
       */

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 250)
      );

      /*
       * IMPORTANT:
       *
       * replace() prevents the user from going back to the
       * OTP/sign-in page with browser history.
       */

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
          await supabase.auth.signInWithOtp(
            {
              email:
                cleanEmail,

              options: {
                shouldCreateUser:
                  false,
              },
            }
          );

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
      <main className="page">

        <div className="verificationCard">

          <button
            type="button"
            className="backButton"
            onClick={() => {
              setShowVerification(
                false
              );

              setVerificationCode(
                ""
              );

              setError("");
              setSuccess("");
            }}
          >
            <ArrowLeftIcon />
          </button>

          <div className="verificationContent">

            {/* DASHBOARD BRAND */}

            <div className="verificationBrand">

              <PropertySureLogo
                size={42}
              />

              <div className="verificationBrandName">
                PropertySure
                <strong>
                  {" "}
                  AI
                </strong>
              </div>

            </div>

            <div className="verificationBrandSubtitle">
              AI-Powered Property Due Diligence
            </div>

            <div className="verificationEyebrow">
              SECURE SIGN IN
            </div>

            <h1>
              Verify your email
            </h1>

            <p className="verificationText">
              We've sent an 8-digit
              security code to
            </p>

            <div className="verificationEmail">
              {maskedEmail}
            </div>

            <div className="otpContainer">

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
                    className="otpInput"
                    disabled={
                      verifying
                    }
                  />
                )
              )}

            </div>

            <div className="verificationHint">

              <ShieldCheckIcon />

              <span>
                Enter the 8-digit code
                to complete
                <br />
                your secure sign-in.
              </span>

            </div>

            {error && (
              <div className="errorBox">
                {error}
              </div>
            )}

            {success && (
              <div className="successBox">
                {success}
              </div>
            )}

            <button
              type="button"
              className="primaryButton"
              onClick={() =>
                handleVerifyEmail()
              }
              disabled={
                verifying ||
                verificationCode.length !==
                  8
              }
            >
              {verifying
                ? "Verifying..."
                : "Verify & Sign In"}
            </button>

            <div className="resendText">

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

            <div className="secureText">

              <LockIcon size={17} />

              <span>
                Your account is protected by
                <br />
                PropertySure AI
              </span>

            </div>

          </div>
        </div>

        <style jsx>
          {styles}
        </style>

      </main>
    );
  }

  /* ==========================================================
     MAIN SIGN-IN SCREEN
  ========================================================== */

  return (
    <main className="page">

      <div className="signinCard">

        {/* ====================================================
            DASHBOARD BRAND
        ==================================================== */}

        <div className="brand">

          <div className="brandLogoRow">

            <PropertySureLogo
              size={25}
            />

            <div className="brandName">
              PropertySure
              <strong>
                {" "}
                AI
              </strong>
            </div>

          </div>

          <div className="brandTagline">
            AI-POWERED PROPERTY DUE DILIGENCE
          </div>

        </div>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="header">

          <div className="eyebrow">
            PROPERTY VERIFICATION
          </div>

          <p>
            Sign in to continue managing
            your property verification
            journey.
          </p>

        </div>

        {error && (
          <div className="errorBox">
            {error}
          </div>
        )}

        {success && (
          <div className="successBox">
            {success}
          </div>
        )}

        {/* ====================================================
            EMAIL
        ==================================================== */}

        <div className="fieldGroup">

          <label>
            Email Address
          </label>

          <div className="inputBox">

            <div className="fieldIcon">
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
              className="fieldInput"
              autoComplete="email"
              disabled={
                loading
              }
            />

          </div>

        </div>

        {/* ====================================================
            PASSWORD
        ==================================================== */}

        <div className="fieldGroup">

          <label>
            Password
          </label>

          <div className="passwordBox">

            <div className="fieldIcon">
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
              className="passwordInput"
              autoComplete="current-password"
              disabled={
                loading
              }
            />

            <button
              type="button"
              className="eyeButton"
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

        {/* ====================================================
            ACCOUNT OPTIONS
        ==================================================== */}

        <div className="accountOptions">

          <label className="remember">

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
            className="forgotButton"
            onClick={
              handleForgotPassword
            }
            disabled={loading}
          >
            Forgot password?
          </button>

        </div>

        {/* ====================================================
            SIGN IN BUTTON
        ==================================================== */}

        <button
          type="button"
          className="primaryButton"
          onClick={
            handleSignIn
          }
          disabled={
            loading ||
            googleLoading
          }
        >
          {loading
            ? "Checking Account..."
            : "Continue to Sign In"}
        </button>

        {/* ====================================================
            SECURITY MESSAGE
        ==================================================== */}

        <div className="securityMessage">

          <ShieldCheckIcon />

          <span>
            After your password is verified,
            <br />
            we'll send a security code to
            your email.
          </span>

        </div>

        {/* ====================================================
            DIVIDER
        ==================================================== */}

        <div className="divider">

          <span />

          <div>
            or
          </div>

          <span />

        </div>

        {/* ====================================================
            GOOGLE
        ==================================================== */}

        <button
          type="button"
          className="googleButton"
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

        {/* ====================================================
            SIGN UP
        ==================================================== */}

        <div className="signupText">

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

      {/* ======================================================
          TRUST FEATURES
      ====================================================== */}

      <div className="trustFeatures">

        <div className="trustFeature">

          <div className="trustIcon">
            <ShieldCheckIcon />
          </div>

          <strong>
            AI-Powered
          </strong>

          <span>
            Advanced property
            <br />
            verification
          </span>

        </div>

        <div className="trustDivider" />

        <div className="trustFeature">

          <div className="trustIcon">
            <LockIcon />
          </div>

          <strong>
            Secure & Private
          </strong>

          <span>
            Your information is
            <br />
            protected
          </span>

        </div>

        <div className="trustDivider" />

        <div className="trustFeature">

          <div className="trustIcon">
            ✓
          </div>

          <strong>
            Trusted Results
          </strong>

          <span>
            Verification designed
            <br />
            for confidence
          </span>

        </div>

      </div>

      <style jsx>
        {styles}
      </style>

    </main>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = `

  * {
    box-sizing: border-box;
  }

  .page {
    min-height: 100vh;

    width: 100%;

    background:
      radial-gradient(
        circle at 75% 5%,
        rgba(0, 103, 255, 0.25),
        transparent 28%
      ),
      radial-gradient(
        circle at 15% 85%,
        rgba(0, 70, 180, 0.13),
        transparent 30%
      ),
      linear-gradient(
        145deg,
        #020A18 0%,
        #06152f 48%,
        #020A18 100%
      );

    color: #FFFFFF;

    font-family:
      Inter,
      Arial,
      Helvetica,
      sans-serif;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    padding:
      35px 18px 45px;

    position: relative;

    overflow-x: hidden;
  }

  /* ==========================================================
     BRAND
  ========================================================== */

  .brand {
    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    margin-bottom: 27px;
  }

  .brandLogoRow {
    display: flex;

    align-items: center;

    justify-content: center;

    gap: 8px;
  }

  .propertyLogo {
    color: #168eff;

    line-height: 1;

    display: inline-block;
  }

  .brandName {
    font-size: 27px;

    line-height: 1;

    font-weight: 700;

    letter-spacing:
      -0.5px;
  }

  .brandName strong {
    color: #168eff;
  }

  .brandTagline {
    margin-top: 10px;

    color: #7186A2;

    font-size: 9px;

    font-weight: 700;

    letter-spacing: 1.7px;

    text-align: center;
  }

  /* ==========================================================
     SIGN IN CARD
  ========================================================== */

  .signinCard {
    width: 100%;

    max-width: 825px;

    padding:
      40px
      90px
      42px;

    border-radius: 25px;

    background:
      radial-gradient(
        circle at 85% 0%,
        rgba(0, 99, 255, 0.17),
        transparent 33%
      ),
      linear-gradient(
        145deg,
        rgba(5, 18, 39, 0.98),
        rgba(3, 13, 28, 0.99)
      );

    border:
      1px solid
      rgba(82, 135, 205, 0.55);

    box-shadow:
      0 35px 100px
      rgba(0, 0, 0, 0.48),

      inset 0 1px 0
      rgba(255, 255, 255, 0.04);
  }

  /* ==========================================================
     HEADER
  ========================================================== */

  .header {
    text-align: center;

    margin-bottom: 32px;
  }

  .eyebrow {
    color: #168eff;

    font-size: 13px;

    font-weight: 800;

    letter-spacing: 2.3px;

    margin-bottom: 15px;
  }

  .header p {
    max-width: 600px;

    margin:
      15px auto 0;

    color: #C3CEDD;

    font-size: 16px;

    line-height: 1.65;
  }

  /* ==========================================================
     FIELDS
  ========================================================== */

  .fieldGroup {
    margin-bottom: 20px;
  }

  .fieldGroup label {
    display: block;

    margin-bottom: 9px;

    color: #F7F9FC;

    font-size: 15px;

    font-weight: 600;
  }

  .inputBox,
  .passwordBox {
    width: 100%;

    height: 68px;

    display: flex;

    align-items: center;

    border:
      1px solid
      rgba(92, 130, 177, 0.48);

    border-radius: 13px;

    background:
      rgba(7, 19, 38, 0.72);

    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }

  .inputBox:focus-within,
  .passwordBox:focus-within {
    border-color: #168eff;

    box-shadow:
      0 0 0 3px
      rgba(22, 142, 255, 0.08);
  }

  .fieldIcon {
    width: 63px;

    height: 100%;

    flex-shrink: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    color: #A9B7CA;
  }

  .fieldInput,
  .passwordInput {
    width: 100%;

    min-width: 0;

    height: 100%;

    border: none;

    outline: none;

    background: transparent;

    color: #FFFFFF;

    font-size: 16px;
  }

  .fieldInput::placeholder,
  .passwordInput::placeholder {
    color: #8493A8;
  }

  .passwordInput {
    padding: 0 5px;
  }

  .eyeButton {
    width: 58px;

    height: 100%;

    flex-shrink: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    border: none;

    background: transparent;

    color: #A7B4C8;

    cursor: pointer;
  }

  .eyeButton:hover {
    color: #FFFFFF;
  }

  /* ==========================================================
     ACCOUNT OPTIONS
  ========================================================== */

  .accountOptions {
    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 15px;

    margin:
      5px 0 25px;
  }

  .remember {
    display: flex;

    align-items: center;

    gap: 9px;

    color: #C7D1DF;

    font-size: 14px;

    cursor: pointer;
  }

  .remember input {
    width: 19px;

    height: 19px;

    accent-color: #168eff;

    cursor: pointer;
  }

  .forgotButton {
    border: none;

    background: transparent;

    color: #168eff;

    font-size: 14px;

    font-weight: 600;

    cursor: pointer;

    padding: 0;
  }

  .forgotButton:disabled {
    opacity: 0.55;

    cursor: not-allowed;
  }

  /* ==========================================================
     PRIMARY BUTTON
  ========================================================== */

  .primaryButton {
    width: 100%;

    height: 66px;

    border: none;

    border-radius: 13px;

    background:
      linear-gradient(
        135deg,
        #168bff,
        #0866d1
      );

    color: #FFFFFF;

    font-size: 19px;

    font-weight: 800;

    cursor: pointer;

    box-shadow:
      0 15px 35px
      rgba(0, 91, 235, 0.25);

    transition:
      transform 0.15s,
      box-shadow 0.15s,
      opacity 0.15s;
  }

  .primaryButton:hover:not(:disabled) {
    transform:
      translateY(-1px);

    box-shadow:
      0 18px 40px
      rgba(0, 105, 255, 0.32);
  }

  .primaryButton:disabled {
    opacity: 0.55;

    cursor: not-allowed;
  }

  /* ==========================================================
     SECURITY
  ========================================================== */

  .securityMessage {
    display: flex;

    align-items: center;

    justify-content: center;

    gap: 10px;

    margin-top: 19px;

    color: #8FA2BA;

    font-size: 12px;

    line-height: 1.5;

    text-align: center;
  }

  /* ==========================================================
     DIVIDER
  ========================================================== */

  .divider {
    display: flex;

    align-items: center;

    gap: 18px;

    margin:
      27px 0;
  }

  .divider span {
    flex: 1;

    height: 1px;

    background:
      rgba(117, 145, 180, 0.35);
  }

  .divider div {
    color: #D1D9E5;

    font-size: 15px;
  }

  /* ==========================================================
     GOOGLE
  ========================================================== */

  .googleButton {
    width: 100%;

    height: 62px;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 13px;

    border:
      1px solid
      rgba(21, 126, 255, 0.62);

    border-radius: 13px;

    background:
      rgba(5, 18, 38, 0.7);

    color: #FFFFFF;

    font-size: 17px;

    font-weight: 600;

    cursor: pointer;
  }

  .googleButton:hover:not(:disabled) {
    background:
      rgba(13, 44, 82, 0.72);
  }

  .googleButton:disabled {
    opacity: 0.55;

    cursor: not-allowed;
  }

  /* ==========================================================
     SIGN UP
  ========================================================== */

  .signupText {
    text-align: center;

    margin-top: 29px;

    color: #C3CDDB;

    font-size: 15px;
  }

  .signupText button {
    border: none;

    background: transparent;

    color: #168eff;

    font-size: inherit;

    font-weight: 700;

    cursor: pointer;

    padding: 0;
  }

  /* ==========================================================
     ALERTS
  ========================================================== */

  .errorBox,
  .successBox {
    padding:
      13px 15px;

    margin-bottom: 20px;

    border-radius: 10px;

    font-size: 14px;

    line-height: 1.5;
  }

  .errorBox {
    color: #FF9C9C;

    background:
      rgba(239, 68, 68, 0.09);

    border:
      1px solid
      rgba(239, 68, 68, 0.3);
  }

  .successBox {
    color: #72E6A0;

    background:
      rgba(34, 197, 94, 0.09);

    border:
      1px solid
      rgba(34, 197, 94, 0.3);
  }

  /* ==========================================================
     TRUST FEATURES
  ========================================================== */

  .trustFeatures {
    width: 100%;

    max-width: 825px;

    display: grid;

    grid-template-columns:
      1fr auto
      1fr auto
      1fr;

    align-items: center;

    margin-top: 32px;

    padding:
      22px 15px;

    border:
      1px solid
      rgba(82, 135, 205, 0.25);

    border-radius: 17px;

    background:
      rgba(4, 19, 38, 0.65);
  }

  .trustFeature {
    display: flex;

    flex-direction: column;

    align-items: center;

    text-align: center;

    padding:
      4px 15px;
  }

  .trustIcon {
    width: 47px;

    height: 47px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 50%;

    margin-bottom: 9px;

    background:
      rgba(22, 142, 255, 0.08);

    border:
      1px solid
      rgba(22, 142, 255, 0.25);

    color: #168eff;
  }

  .trustFeature strong {
    color: #F5F8FC;

    font-size: 13px;

    margin-bottom: 5px;
  }

  .trustFeature span {
    color: #7F93AD;

    font-size: 10px;

    line-height: 1.5;
  }

  .trustDivider {
    width: 1px;

    height: 58px;

    background:
      rgba(132, 157, 187, 0.16);
  }

  /* ==========================================================
     VERIFICATION CARD
  ========================================================== */

  .verificationCard {
    width: 100%;

    max-width: 825px;

    min-height: 700px;

    position: relative;

    display: flex;

    align-items: center;

    justify-content: center;

    padding:
      55px 90px;

    border-radius: 24px;

    background:
      radial-gradient(
        circle at 80% 0%,
        rgba(0, 99, 255, 0.2),
        transparent 32%
      ),
      linear-gradient(
        145deg,
        rgba(5, 18, 39, 0.97),
        rgba(3, 13, 28, 0.98)
      );

    border:
      1px solid
      rgba(82, 135, 205, 0.55);

    box-shadow:
      0 35px 100px
      rgba(0, 0, 0, 0.45);
  }

  .backButton {
    position: absolute;

    top: 35px;

    left: 35px;

    width: 48px;

    height: 48px;

    display: flex;

    align-items: center;

    justify-content: center;

    border: none;

    background: transparent;

    color: #FFFFFF;

    cursor: pointer;
  }

  .verificationContent {
    width: 100%;

    max-width: 650px;

    display: flex;

    flex-direction: column;

    align-items: center;

    text-align: center;
  }

  .verificationBrand {
    display: flex;

    align-items: center;

    justify-content: center;

    gap: 8px;
  }

  .verificationBrandName {
    font-size: 25px;

    font-weight: 700;

    letter-spacing:
      -0.4px;
  }

  .verificationBrandName strong {
    color: #168eff;
  }

  .verificationBrandSubtitle {
    margin-top: 8px;

    color: #7186A2;

    font-size: 9px;

    letter-spacing: 1.3px;
  }

  .verificationEyebrow {
    margin-top: 22px;

    color: #168eff;

    font-size: 12px;

    font-weight: 800;

    letter-spacing: 2px;
  }

  .verificationContent h1 {
    margin:
      14px 0 12px;

    font-size: 39px;

    letter-spacing:
      -1.4px;
  }

  .verificationText {
    margin: 0;

    color: #CBD4E0;

    font-size: 17px;
  }

  .verificationEmail {
    margin-top: 13px;

    color: #168eff;

    font-size: 22px;

    font-weight: 600;

    word-break: break-word;
  }

  /* ==========================================================
     OTP
  ========================================================== */

  .otpContainer {
    width: 100%;

    display: grid;

    grid-template-columns:
      repeat(8, 1fr);

    gap: 13px;

    margin:
      50px 0 45px;
  }

  .otpInput {
    width: 100%;

    height: 78px;

    border:
      1px solid
      rgba(92, 130, 177, 0.48);

    border-radius: 13px;

    background:
      rgba(7, 19, 38, 0.72);

    color: #FFFFFF;

    text-align: center;

    font-size: 28px;

    font-weight: 700;

    outline: none;
  }

  .otpInput:focus {
    border-color: #168eff;

    box-shadow:
      0 0 0 3px
      rgba(22, 142, 255, 0.1);
  }

  .verificationHint {
    width: 100%;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 15px;

    margin-bottom: 30px;

    color: #CBD5E2;

    font-size: 16px;

    line-height: 1.55;

    text-align: left;
  }

  .verificationHint svg {
    flex-shrink: 0;
  }

  .resendText {
    margin-top: 24px;

    color: #CBD5E2;

    font-size: 16px;
  }

  .resendText button {
    border: none;

    background: transparent;

    color: #168eff;

    font-size: inherit;

    font-weight: 600;

    cursor: pointer;

    padding: 0;
  }

  .resendText button:disabled {
    opacity: 0.55;

    cursor: not-allowed;
  }

  .secureText {
    display: flex;

    align-items: center;

    justify-content: center;

    gap: 9px;

    margin-top: 38px;

    color: #9EABBD;

    font-size: 14px;

    line-height: 1.55;

    text-align: center;
  }

  /* ==========================================================
     MOBILE
  ========================================================== */

  @media (max-width: 700px) {

    .page {
      padding:
        15px 14px 30px;

      justify-content:
        flex-start;
    }

    .signinCard {
      margin-top: 5px;

      padding:
        30px 22px 32px;

      border-radius: 20px;
    }

    .brandName {
      font-size: 23px;
    }

    .brandTagline {
      font-size: 7px;

      letter-spacing: 1.3px;
    }

    .header p {
      font-size: 14px;
    }

    .eyebrow {
      font-size: 11px;
    }

    .inputBox,
    .passwordBox {
      height: 62px;
    }

    .fieldIcon {
      width: 53px;
    }

    .primaryButton {
      height: 60px;

      font-size: 17px;
    }

    .googleButton {
      height: 58px;
    }

    .accountOptions {
      font-size: 12px;
    }

    .forgotButton {
      font-size: 12px;
    }

    .trustFeatures {
      grid-template-columns:
        1fr auto
        1fr auto
        1fr;

      margin-top: 20px;

      padding:
        15px 4px;
    }

    .trustFeature {
      padding:
        4px 3px;
    }

    .trustFeature strong {
      font-size: 10px;
    }

    .trustFeature span {
      font-size: 8px;
    }

    .trustDivider {
      height: 48px;
    }

    .trustIcon {
      width: 39px;

      height: 39px;
    }

    .verificationCard {
      min-height: 680px;

      padding:
        45px 18px;
    }

    .verificationBrandName {
      font-size: 21px;
    }

    .verificationBrandSubtitle {
      font-size: 7px;
    }

    .verificationContent h1 {
      font-size: 31px;
    }

    .verificationText {
      font-size: 14px;
    }

    .verificationEmail {
      font-size: 17px;
    }

    .otpContainer {
      gap: 6px;

      margin:
        40px 0 35px;
    }

    .otpInput {
      height: 57px;

      border-radius: 9px;

      font-size: 21px;
    }

    .verificationHint {
      font-size: 13px;

      gap: 9px;
    }

    .backButton {
      top: 20px;

      left: 15px;
    }
  }

  /* ==========================================================
     VERY SMALL PHONES
  ========================================================== */

  @media (max-width: 420px) {

    .signinCard {
      padding:
        25px 16px 28px;
    }

    .header p {
      font-size: 13px;
    }

    .brandName {
      font-size: 21px;
    }

    .accountOptions {
      flex-direction: column;

      align-items:
        flex-start;

      gap: 12px;
    }

    .trustFeature strong {
      font-size: 9px;
    }

    .trustFeature span {
      font-size: 7px;
    }

    .otpContainer {
      gap: 4px;
    }

    .otpInput {
      height: 51px;

      border-radius: 8px;

      font-size: 19px;
    }

    .verificationCard {
      padding:
        45px 14px;
    }
  }
`;