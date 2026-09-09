"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import "./signup.css";

type IconProps = {
  size?: number;
};

function LogoMark({ size = 23 }: IconProps) {
  return (
    <span
      className="brandDiamondMark"
      style={{ fontSize: `${size}px` }}
      aria-hidden="true"
    >
      ◆
    </span>
  );
}

function UserIcon({ size = 21 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M5 20C5.8 15.9 8.1 14 12 14C15.9 14 18.2 15.9 19 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneIcon({ size = 21 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.2 3.5L10 6.2L8.2 9.1C9.2 11.3 11 13.1 13.2 14.1L16.1 12.3L18.8 15.1C19.5 15.8 19.5 16.9 18.8 17.6L17.5 18.9C16.8 19.6 15.7 19.8 14.8 19.4C8.9 16.9 5.1 13.1 2.6 7.2C2.2 6.3 2.4 5.2 3.1 4.5L4.4 3.2C5.1 2.5 6.2 2.5 7.2 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ size = 21 }: IconProps) {
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

function LockIcon({ size = 21 }: IconProps) {
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

function EyeIcon({ size = 20 }: IconProps) {
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
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
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
        d="M6.58 13.87C6.39 13.32 6.28 12.73 6.28 12.12C6.28 11.51 6.39 10.92 6.58 10.37V7.85H3.36C2.7 9.16 2.33 10.64 2.33 12.12C2.33 13.6 2.7 15.08 3.36 16.39L6.58 13.87Z"
        fill="#FBBC05"
      />

      <path
        d="M12 6.38C13.42 6.38 14.7 6.87 15.7 7.82L18.42 5.1C16.8 3.59 14.61 2.65 12 2.65C8.08 2.65 4.9 4.73 3.36 7.85L6.58 10.37C7.34 8.08 9.48 6.38 12 6.38Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M13 6L19 12L13 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
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

function ShieldCheckIcon({ size = 25 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3L19 6V11.5C19 16.2 16.2 19.5 12 21C7.8 19.5 5 16.2 5 11.5V6L12 3Z"
        stroke="#168EFF"
        strokeWidth="1.7"
      />

      <path
        d="M8.5 12L10.8 14.3L15.5 9.6"
        stroke="#168EFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="#EAF5FF"
        stroke="#168EFF"
        strokeWidth="1.5"
      />

      <path
        d="M8 12.2L10.6 14.8L16.2 9.3"
        stroke="#168EFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InputBox({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="fieldGroup">
      <label>{label}</label>

      <div className="inputBox">
        <div className="fieldIcon">
          {icon}
        </div>

        {children}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreedToTerms, setAgreedToTerms] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showVerification, setShowVerification] =
    useState(false);

  const [verificationCode, setVerificationCode] =
    useState("");

  const [verifying, setVerifying] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  // ============================================================
  // CREATE ACCOUNT
  // ============================================================

  const handleSignUp = async () => {
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Your password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      setError(
        "Please agree to the Terms of Service and Privacy Policy."
      );
      return;
    }

    try {
      setLoading(true);

      const cleanEmail =
        email.trim().toLowerCase();

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user && !data.session) {
        setVerificationCode("");
        setShowVerification(true);

        setSuccess(
          "An 8-digit verification code has been sent to your email."
        );

        return;
      }

      if (data.session) {
        router.push("/dashboard");
        return;
      }

      throw new Error(
        "Account created, but we could not start your session."
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "We couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VERIFY EMAIL
  // ============================================================

  const handleVerifyEmail = async (
    codeOverride?: string
  ) => {
    setError("");
    setSuccess("");

    const code =
      codeOverride ?? verificationCode;

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

      const { data, error: verifyError } =
        await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: code,
          type: "signup",
        });

      if (verifyError) {
        throw verifyError;
      }

      if (data.session) {
        router.push("/dashboard");
        return;
      }

      setError(
        "Your email was verified, but we couldn't start your session. Please sign in."
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Invalid verification code. Please check your email and try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  // ============================================================
  // OTP INPUT
  // ============================================================

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

    const digit = digits[0];

    const code =
      verificationCode.split("");

    code[index] = digit;

    const newCode =
      code.join("").slice(0, 8);

    setVerificationCode(newCode);

    if (index < 7) {
      document
        .getElementById(`otp-${index + 1}`)
        ?.focus();
    }

    if (
      newCode.length === 8 &&
      /^\d{8}$/.test(newCode)
    ) {
      void handleVerifyEmail(newCode);
    }
  };

  // ============================================================
  // OTP PASTE
  // ============================================================

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

    setVerificationCode(pastedCode);

    const nextIndex =
      Math.min(pastedCode.length, 7);

    document
      .getElementById(`otp-${nextIndex}`)
      ?.focus();

    if (
      pastedCode.length === 8 &&
      /^\d{8}$/.test(pastedCode)
    ) {
      void handleVerifyEmail(pastedCode);
    }
  };

  // ============================================================
  // OTP KEYBOARD
  // ============================================================

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
        .getElementById(`otp-${index - 1}`)
        ?.focus();
    }

    if (
      e.key === "ArrowLeft" &&
      index > 0
    ) {
      document
        .getElementById(`otp-${index - 1}`)
        ?.focus();
    }

    if (
      e.key === "ArrowRight" &&
      index < 7
    ) {
      document
        .getElementById(`otp-${index + 1}`)
        ?.focus();
    }
  };

  // ============================================================
  // RESEND
  // ============================================================

  const handleResendCode = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(
        "We couldn't determine your email address."
      );
      return;
    }

    try {
      setResending(true);

      const cleanEmail =
        email.trim().toLowerCase();

      const { error: resendError } =
        await supabase.auth.resend({
          type: "signup",
          email: cleanEmail,
        });

      if (resendError) {
        throw resendError;
      }

      setVerificationCode("");

      setSuccess(
        "A new 8-digit verification code has been sent to your email."
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "We couldn't resend the verification code. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  // ============================================================
  // GOOGLE SIGNUP
  // ============================================================

  const handleGoogleSignUp = async () => {
    setError("");
    setSuccess("");

    if (!agreedToTerms) {
      setError(
        "Please agree to the Terms of Service and Privacy Policy before continuing with Google."
      );
      return;
    }

    try {
      setGoogleLoading(true);

      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",

          options: {
            redirectTo:
              `${window.location.origin}/dashboard`,
          },
        });

      if (googleError) {
        throw googleError;
      }
    } catch (err: any) {
      setError(
        err?.message ||
          "Google sign-up could not be started. Please try again."
      );

      setGoogleLoading(false);
    }
  };

  // ============================================================
  // MASK EMAIL
  // ============================================================

  const emailParts =
    email.trim().split("@");

  const maskedEmail =
    emailParts.length === 2
      ? `${emailParts[0].slice(
          0,
          Math.min(3, emailParts[0].length)
        )}***@${emailParts[1]}`
      : "your email address";

  // ============================================================
  // EMAIL VERIFICATION SCREEN
  // ============================================================

  if (showVerification) {
    return (
      <main className="page verificationPage">

        <header className="topHeader">

          <button
            type="button"
            className="topBrand"
            onClick={() => router.push("/")}
            aria-label="PropertySure AI home"
          >
            <LogoMark size={39} />

            <span className="topBrandText">
              <span>
                PropertySure
                <strong> AI</strong>
              </span>

              <small>
                AI-POWERED PROPERTY DUE DILIGENCE
              </small>
            </span>
          </button>

          <div className="topSignup">
            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                router.push("/signin")
              }
            >
              Sign In
            </button>
          </div>

        </header>

        <div className="verificationCard">

          <button
            type="button"
            className="backButton"
            onClick={() => {
              setShowVerification(false);
              setError("");
              setSuccess("");
            }}
            aria-label="Back to account creation"
          >
            <ArrowLeftIcon />
          </button>

          <div className="verificationContent">

            <div className="verificationLogo">
              <LogoMark size={72} />
            </div>

            <div className="verificationEyebrow">
              EMAIL VERIFICATION
            </div>

            <h1>
              Verify your email
            </h1>

            <p className="verificationText">
              We've sent an 8-digit verification code to
            </p>

            <div className="verificationEmail">
              {maskedEmail}
            </div>

            <div className="otpContainer">

              {[0, 1, 2, 3, 4, 5, 6, 7].map(
                (index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }
                    maxLength={1}
                    value={
                      verificationCode[index] ||
                      ""
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
                    disabled={verifying}
                  />
                )
              )}

            </div>

            <div className="verificationHint">

              <div className="verificationHintIcon">
                <ShieldCheckIcon />
              </div>

              <span>
                Enter the 8-digit code to verify
                <br />
                your email address securely.
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
                verificationCode.length !== 8
              }
            >
              {verifying
                ? "Verifying..."
                : "Verify Email"}

              {!verifying && (
                <ArrowRightIcon />
              )}
            </button>

            <div className="resendText">

              Didn't receive the code?{" "}

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
              >
                {resending
                  ? "Sending..."
                  : "Resend code"}
              </button>

            </div>

            <div className="secureText">

              <LockIcon size={16} />

              <span>
                Your information is secure with
                PropertySure AI
              </span>

            </div>

          </div>

        </div>

      </main>
    );
  }

  // ============================================================
  // SIGN-UP SCREEN
  // ============================================================

  return (
    <main className="page">

      {/* ======================================================
          TOP HEADER
      ====================================================== */}

      <header className="topHeader">

        <button
          type="button"
          className="topBrand"
          onClick={() => router.push("/")}
          aria-label="PropertySure AI home"
        >

          <LogoMark size={39} />

          <span className="topBrandText">

            <span>
              PropertySure
              <strong> AI</strong>
            </span>

            <small>
              AI-POWERED PROPERTY DUE DILIGENCE
            </small>

          </span>

        </button>

        <div className="topSignup">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              router.push("/signin")
            }
          >
            Sign In
          </button>

        </div>

      </header>

      {/* ======================================================
          MAIN LAYOUT
      ====================================================== */}

      <div className="mainLayout">

        {/* ====================================================
            LEFT HERO
        ==================================================== */}

        <section className="heroPanel">

          <div className="heroEyebrow">
            PROPERTY VERIFICATION
          </div>

          <h1>
            Build With
            <br />
            <span>Greater Confidence</span>
          </h1>

          <p className="heroDescription">
            Create your PropertySure AI account and
            verify property documents with secure,
            AI-powered due diligence.
          </p>

          <div className="heroFeatures">

            <div className="heroFeature">

              <div className="heroFeatureIcon">
                <ShieldCheckIcon size={28} />
              </div>

              <div>
                <strong>
                  Secure Verification
                </strong>

                <span>
                  Your property documents stay protected.
                </span>
              </div>

            </div>

            <div className="heroFeature">

              <div className="heroFeatureIcon">
                <CheckCircleIcon />
              </div>

              <div>
                <strong>
                  Smarter Decisions
                </strong>

                <span>
                  AI-powered insights for better confidence.
                </span>
              </div>

            </div>

            <div className="heroFeature">

              <div className="heroFeatureIcon">
                <LogoMark size={28} />
              </div>

              <div>
                <strong>
                  Property Due Diligence
                </strong>

                <span>
                  Verify important property information.
                </span>
              </div>

            </div>

          </div>

          <div className="propertyVisual">

            <img
              src="/land-verification.png"
              alt="Property verification"
              className="propertyImage"
            />

            <div className="propertyBadge">

              <div className="propertyBadgeIcon">
                <ShieldCheckIcon size={22} />
              </div>

              <div>
                <strong>
                  Verified Property
                </strong>

                <span>
                  Greater confidence before you buy
                </span>
              </div>

              <div className="badgeLine" />

            </div>

          </div>

        </section>

        {/* ====================================================
            SIGNUP CARD
        ==================================================== */}

        <section className="signupCard">

          <div className="cardHeader">

            <div className="cardEyebrow">
              GET STARTED
            </div>

            <h1>
              Create your account
            </h1>

            <p>
              Join PropertySure AI to verify property
              documents with greater confidence.
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

          {/* FULL NAME */}

          <InputBox
            label="Full Name"
            icon={<UserIcon />}
          >
            <input
              type="text"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              placeholder="Enter your full name"
              className="fieldInput"
              autoComplete="name"
            />
          </InputBox>

          {/* PHONE */}

          <div className="fieldGroup">

            <label>
              Phone Number
            </label>

            <div className="phoneBox">

              <div className="phoneCountry">

                <PhoneIcon size={20} />

                <span className="flag">
                  🇳🇬
                </span>

                <span>
                  +234
                </span>

                <span className="chevron">
                  ▾
                </span>

              </div>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="Enter your phone number"
                className="phoneInput"
                autoComplete="tel"
              />

            </div>

          </div>

          {/* EMAIL */}

          <InputBox
            label="Email Address"
            icon={<MailIcon />}
          >
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email address"
              className="fieldInput"
              autoComplete="email"
            />
          </InputBox>

          {/* PASSWORD */}

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
                  setPassword(e.target.value)
                }
                placeholder="Create a password"
                className="passwordInput"
                autoComplete="new-password"
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

          {/* CONFIRM PASSWORD */}

          <div className="fieldGroup">

            <label>
              Confirm Password
            </label>

            <div className="passwordBox">

              <div className="fieldIcon">
                <LockIcon />
              </div>

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm your password"
                className="passwordInput"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="eyeButton"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <EyeIcon />
              </button>

            </div>

          </div>

          {/* TERMS */}

          <label className="terms">

            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) =>
                setAgreedToTerms(
                  e.target.checked
                )
              }
            />

            <span>
              I agree to the{" "}
              <span className="blueText">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="blueText">
                Privacy Policy
              </span>
              .
            </span>

          </label>

          {/* CREATE ACCOUNT */}

          <button
            type="button"
            className="primaryButton"
            onClick={handleSignUp}
            disabled={
              loading ||
              googleLoading
            }
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}

            {!loading && (
              <ArrowRightIcon />
            )}
          </button>

          {/* DIVIDER */}

          <div className="divider">

            <span />

            <div>
              or
            </div>

            <span />

          </div>

          {/* GOOGLE */}

          <button
            type="button"
            className="googleButton"
            onClick={handleGoogleSignUp}
            disabled={
              loading ||
              googleLoading
            }
          >

            <GoogleIcon />

            <span>
              {googleLoading
                ? "Connecting..."
                : "Sign up with Google"}
            </span>

          </button>

          {/* SIGN IN */}

          <div className="signinText">

            Already have an account?{" "}

            <button
              type="button"
              onClick={() =>
                router.push("/signin")
              }
            >
              Sign In
            </button>

          </div>

        </section>

      </div>

      {/* ======================================================
          TRUST STRIP
      ====================================================== */}

      <div className="trustFeatures">

        <div className="trustFeature">

          <div className="trustIcon">
            <ShieldCheckIcon size={21} />
          </div>

          <div>
            <strong>
              Secure &amp; Protected
            </strong>

            <span>
              Your information stays protected
            </span>
          </div>

        </div>

        <div className="trustDivider" />

        <div className="trustFeature">

          <div className="trustIcon">
            <CheckCircleIcon />
          </div>

          <div>
            <strong>
              AI-Powered Insights
            </strong>

            <span>
              Smarter property decisions
            </span>
          </div>

        </div>

        <div className="trustDivider" />

        <div className="trustFeature">

          <div className="trustIcon">
            <LogoMark size={24} />
          </div>

          <div>
            <strong>
              Property Due Diligence
            </strong>

            <span>
              Confidence before you commit
            </span>
          </div>

        </div>

      </div>

      
    </main>
  );
}
