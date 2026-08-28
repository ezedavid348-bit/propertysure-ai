"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type IconProps = {
  size?: number;
};

function LogoMark({ size = 72 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 5L84 18V48C84 70 70 87 50 96C30 87 16 70 16 48V18L50 5Z"
        fill="#07172F"
        stroke="#159BFF"
        strokeWidth="4"
      />

      <path
        d="M50 12L77 22V47C77 64 66 78 50 86C34 78 23 64 23 47V22L50 12Z"
        stroke="#FFFFFF"
        strokeWidth="3"
      />

      <path
        d="M30 47L50 30L70 47"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M36 45V68H64V45"
        fill="#FFFFFF"
      />

      <path
        d="M46 68V54H54V68"
        fill="#159BFF"
      />
    </svg>
  );
}

function UserIcon({ size = 22 }: IconProps) {
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

function PhoneIcon({ size = 22 }: IconProps) {
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

function MailIcon({ size = 22 }: IconProps) {
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

function LockIcon({ size = 22 }: IconProps) {
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

function EyeIcon({ size = 21 }: IconProps) {
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
        stroke="#159BFF"
        strokeWidth="1.7"
      />

      <path
        d="M8.5 12L10.8 14.3L15.5 9.6"
        stroke="#159BFF"
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
        <div className="fieldIcon">{icon}</div>
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

  // ============================================================
  // EMAIL VERIFICATION STATE
  // ============================================================

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

      /*
       * Supabase sends an 8-digit verification code
       * when email confirmation is required.
       */

      if (data.user && !data.session) {
        setVerificationCode("");
        setShowVerification(true);

        setSuccess(
          "An 8-digit verification code has been sent to your email."
        );

        return;
      }

      /*
       * If email confirmation is disabled,
       * Supabase gives us a session immediately.
       */

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
  // VERIFY EMAIL — 8 DIGITS
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

      /*
       * Successful OTP verification should
       * create the authenticated session.
       */

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
  // 8-DIGIT OTP INPUT
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

    /*
     * If more than one digit enters a box,
     * use only the first digit.
     */

    const digit = digits[0];

    const code =
      verificationCode.split("");

    code[index] = digit;

    const newCode =
      code.join("").slice(0, 8);

    setVerificationCode(newCode);

    /*
     * Move automatically to the next box.
     */

    if (index < 7) {
      document
        .getElementById(`otp-${index + 1}`)
        ?.focus();
    }

    /*
     * Automatically verify when all
     * eight digits have been entered.
     */

    if (
      newCode.length === 8 &&
      /^\d{8}$/.test(newCode)
    ) {
      void handleVerifyEmail(newCode);
    }
  };

  // ============================================================
  // PASTE 8-DIGIT OTP
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

    /*
     * Focus the next available box.
     */

    const nextIndex =
      Math.min(pastedCode.length, 7);

    document
      .getElementById(`otp-${nextIndex}`)
      ?.focus();

    /*
     * If all eight digits were pasted,
     * verify immediately.
     */

    if (
      pastedCode.length === 8 &&
      /^\d{8}$/.test(pastedCode)
    ) {
      void handleVerifyEmail(pastedCode);
    }
  };

  // ============================================================
  // OTP KEYBOARD NAVIGATION
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
  // RESEND CODE
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
      <main className="page">

        <div className="verificationCard">

          <button
            type="button"
            className="backButton"
            onClick={() => {
              setShowVerification(false);
              setError("");
              setSuccess("");
            }}
          >
            <ArrowLeftIcon />
          </button>

          <div className="verificationContent">

            <LogoMark size={78} />

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

              <ShieldCheckIcon />

              <span>
                Enter the 8-digit code to verify
                <br />
                your email address.
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

              <LockIcon size={17} />

              <span>
                Your information is secure with
                <br />
                PropertySure AI
              </span>

            </div>

          </div>
        </div>

        <style jsx>{styles}</style>
      </main>
    );
  }

  // ============================================================
  // SIGN-UP SCREEN
  // ============================================================

  return (
    <main className="page">

      <div className="signupCard">

        {/* LOGO + BRAND */}

        <div className="brand">

          <LogoMark size={76} />

          <div className="brandName">
            <span>
              PropertySure
            </span>{" "}
            <span className="brandAI">
              AI
            </span>
          </div>

        </div>

        {/* HEADER */}

        <div className="header">

          <div className="eyebrow">
            PROPERTY VERIFICATION
          </div>

          <h1>
            Create your account
          </h1>

          <p>
            Join PropertySure AI to verify property
            documents with greater confidence.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="errorBox">
            {error}
          </div>
        )}

        {/* SUCCESS */}

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

              <PhoneIcon size={21} />

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

      </div>

      <style jsx>{styles}</style>

    </main>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .page {
    min-height: 100vh;
    width: 100%;
    background:
      radial-gradient(
        circle at 75% 8%,
        rgba(0, 103, 255, 0.28),
        transparent 28%
      ),
      radial-gradient(
        circle at 15% 80%,
        rgba(0, 70, 180, 0.12),
        transparent 30%
      ),
      #020A18;

    color: #FFFFFF;

    font-family:
      Inter,
      Arial,
      Helvetica,
      sans-serif;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 30px 18px;
  }

  .signupCard {
    width: 100%;
    max-width: 825px;

    padding:
      38px
      90px
      40px;

    border-radius: 24px;

    background:
      radial-gradient(
        circle at 80% 0%,
        rgba(0, 99, 255, 0.16),
        transparent 32%
      ),
      linear-gradient(
        145deg,
        rgba(5, 18, 39, 0.97),
        rgba(3, 13, 28, 0.98)
      );

    border:
      1px solid rgba(82, 135, 205, 0.55);

    box-shadow:
      0 35px 100px rgba(0, 0, 0, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    margin-bottom: 28px;
  }

  .brandName {
    margin-top: 7px;

    font-size: 25px;
    line-height: 1;

    font-weight: 800;

    letter-spacing: -0.7px;
  }

  .brandAI {
    color: #159BFF;
  }

  .header {
    text-align: center;
    margin-bottom: 32px;
  }

  .eyebrow {
    color: #159BFF;

    font-size: 14px;
    font-weight: 800;

    letter-spacing: 2.3px;

    margin-bottom: 18px;
  }

  .header h1 {
    margin: 0;

    font-size: 43px;
    line-height: 1.1;

    font-weight: 800;

    letter-spacing: -1.8px;
  }

  .header p {
    max-width: 600px;

    margin:
      16px auto
      0;

    color: #C3CEDD;

    font-size: 17px;
    line-height: 1.65;
  }

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

  .inputBox {
    width: 100%;
    height: 68px;

    display: flex;
    align-items: center;

    border:
      1px solid rgba(92, 130, 177, 0.48);

    border-radius: 13px;

    background:
      rgba(7, 19, 38, 0.72);

    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }

  .inputBox:focus-within,
  .phoneBox:focus-within,
  .passwordBox:focus-within {
    border-color: #159BFF;

    box-shadow:
      0 0 0 3px rgba(21, 155, 255, 0.08);
  }

  .fieldIcon {
    width: 63px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    color: #A9B7CA;
  }

  .fieldInput,
  .phoneInput,
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
  .phoneInput::placeholder,
  .passwordInput::placeholder {
    color: #8493A8;
  }

  .phoneBox {
    width: 100%;
    height: 68px;

    display: flex;
    align-items: center;

    border:
      1px solid rgba(92, 130, 177, 0.48);

    border-radius: 13px;

    background:
      rgba(7, 19, 38, 0.72);

    overflow: hidden;
  }

  .phoneCountry {
    height: 100%;

    display: flex;
    align-items: center;

    gap: 10px;

    padding: 0 18px;

    border-right:
      1px solid rgba(92, 130, 177, 0.35);

    color: #F1F5FA;

    flex-shrink: 0;
  }

  .phoneCountry svg {
    color: #A9B7CA;
  }

  .flag {
    font-size: 20px;
    line-height: 1;
  }

  .chevron {
    color: #A6B3C5;
    font-size: 13px;
  }

  .phoneInput {
    padding: 0 17px;
  }

  .passwordBox {
    width: 100%;
    height: 68px;

    display: flex;
    align-items: center;

    border:
      1px solid rgba(92, 130, 177, 0.48);

    border-radius: 13px;

    background:
      rgba(7, 19, 38, 0.72);

    overflow: hidden;
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

  .terms {
    display: flex;
    align-items: center;

    gap: 12px;

    margin:
      25px
      0
      24px;

    color: #CBD5E2;

    font-size: 14px;

    cursor: pointer;
  }

  .terms input {
    width: 25px;
    height: 25px;

    flex-shrink: 0;

    appearance: none;

    border:
      2px solid #6380A4;

    border-radius: 5px;

    background: transparent;

    cursor: pointer;

    position: relative;
  }

  .terms input:checked {
    background: #159BFF;
    border-color: #159BFF;
  }

  .terms input:checked::after {
    content: "✓";

    position: absolute;

    left: 50%;
    top: 50%;

    transform:
      translate(-50%, -53%);

    color: #FFFFFF;

    font-size: 17px;
    font-weight: 800;
  }

  .blueText {
    color: #159BFF;
  }

  .primaryButton {
    width: 100%;
    height: 66px;

    border: none;
    border-radius: 13px;

    background:
      linear-gradient(
        135deg,
        #147CFF,
        #075CEB
      );

    color: #FFFFFF;

    font-size: 20px;
    font-weight: 800;

    cursor: pointer;

    box-shadow:
      0 15px 35px rgba(0, 91, 235, 0.25);

    transition:
      transform 0.15s,
      box-shadow 0.15s,
      opacity 0.15s;
  }

  .primaryButton:hover:not(:disabled) {
    transform: translateY(-1px);

    box-shadow:
      0 18px 40px rgba(0, 105, 255, 0.32);
  }

  .primaryButton:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .divider {
    display: flex;
    align-items: center;

    gap: 18px;

    margin:
      28px
      0;
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

  .googleButton {
    width: 100%;
    height: 62px;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 13px;

    border:
      1px solid rgba(21, 126, 255, 0.62);

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

  .signinText {
    text-align: center;

    margin-top: 30px;

    color: #C3CDDB;

    font-size: 16px;
  }

  .signinText button,
  .resendText button {
    border: none;
    background: transparent;

    color: #159BFF;

    font-size: inherit;
    font-weight: 600;

    cursor: pointer;

    padding: 0;
  }

  .errorBox,
  .successBox {
    padding: 13px 15px;

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
      1px solid rgba(239, 68, 68, 0.3);
  }

  .successBox {
    color: #72E6A0;

    background:
      rgba(34, 197, 94, 0.09);

    border:
      1px solid rgba(34, 197, 94, 0.3);
  }

  /* =========================================================
     VERIFICATION SCREEN
  ========================================================= */

  .verificationCard {
    width: 100%;
    max-width: 825px;
    min-height: 760px;

    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 55px 90px;

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
      1px solid rgba(82, 135, 205, 0.55);

    box-shadow:
      0 35px 100px rgba(0, 0, 0, 0.45);
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

  .verificationContent h1 {
    margin:
      30px
      0
      12px;

    font-size: 39px;

    letter-spacing: -1.4px;
  }

  .verificationText {
    margin: 0;

    color: #CBD4E0;

    font-size: 17px;
  }

  .verificationEmail {
    margin-top: 13px;

    color: #159BFF;

    font-size: 22px;
    font-weight: 600;
  }

  .otpContainer {
    width: 100%;

    display: grid;

    grid-template-columns:
      repeat(8, 1fr);

    gap: 13px;

    margin:
      55px
      0
      48px;
  }

  .otpInput {
    width: 100%;
    height: 78px;

    border:
      1px solid rgba(92, 130, 177, 0.48);

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
    border-color: #159BFF;

    box-shadow:
      0 0 0 3px rgba(21, 155, 255, 0.1);
  }

  .verificationHint {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 15px;

    margin-bottom: 35px;

    color: #CBD5E2;

    font-size: 16px;
    line-height: 1.55;

    text-align: left;
  }

  .verificationHint svg {
    flex-shrink: 0;
  }

  .resendText {
    margin-top: 25px;

    color: #CBD5E2;

    font-size: 16px;
  }

  .secureText {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 9px;

    margin-top: 42px;

    color: #9EABBD;

    font-size: 14px;

    line-height: 1.55;

    text-align: center;
  }

  @media (max-width: 700px) {

    .page {
      padding: 15px;
      align-items: flex-start;
    }

    .signupCard {
      margin-top: 5px;

      padding:
        30px
        22px
        32px;

      border-radius: 20px;
    }

    .verificationCard {
      min-height: 700px;

      padding:
        45px
        22px;
    }

    .header h1 {
      font-size: 34px;
    }

    .header p {
      font-size: 15px;
    }

    .eyebrow {
      font-size: 12px;
    }

    .brandName {
      font-size: 23px;
    }

    .inputBox,
    .phoneBox,
    .passwordBox {
      height: 62px;
    }

    .phoneCountry {
      padding: 0 11px;
      gap: 7px;
    }

    .fieldIcon {
      width: 53px;
    }

    .primaryButton {
      height: 60px;
      font-size: 18px;
    }

    .googleButton {
      height: 58px;
    }

    .otpContainer {
      gap: 7px;
      margin-top: 40px;
    }

    .otpInput {
      height: 58px;
      font-size: 22px;
    }

    .verificationContent h1 {
      font-size: 32px;
    }

    .verificationEmail {
      font-size: 18px;
    }

    .backButton {
      top: 20px;
      left: 20px;
    }
  }

  @media (max-width: 420px) {

    .signupCard {
      padding:
        25px
        16px
        28px;
    }

    .header h1 {
      font-size: 31px;
    }

    .phoneCountry {
      padding: 0 8px;
    }

    .phoneCountry .flag {
      font-size: 17px;
    }

    .otpInput {
      height: 52px;
      border-radius: 9px;
    }
  }
`;