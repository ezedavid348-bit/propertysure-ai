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
      style={{
        fontSize: `${size}px`,
        color: "#168eff",
        lineHeight: 1,
      }}
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

/* =========================================================
   PHONE HELPERS
========================================================= */

function normalizeNigeriaPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("234")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+234${digits.slice(1)}`;
  }

  return `+234${digits}`;
}

function isValidNigeriaPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  let localNumber = digits;

  if (localNumber.startsWith("234")) {
    localNumber = localNumber.slice(3);
  }

  if (localNumber.startsWith("0")) {
    localNumber = localNumber.slice(1);
  }

  return localNumber.length === 10;
}

function maskPhone(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length < 7) {
    return phoneNumber;
  }

  return `+234 ${digits.slice(3, 6)}***${digits.slice(-2)}`;
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

  /* =========================================================
     EMAIL VERIFICATION STATE
     KEEPING ORIGINAL FLOW
  ========================================================= */

  const [showVerification, setShowVerification] =
    useState(false);

  const [verificationCode, setVerificationCode] =
    useState("");

  const [verifying, setVerifying] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  /* =========================================================
     PHONE VERIFICATION STATE
  ========================================================= */

  const [showPhoneVerification, setShowPhoneVerification] =
    useState(false);

  const [phoneVerificationNumber, setPhoneVerificationNumber] =
    useState("");

  const [phoneVerificationOtpId, setPhoneVerificationOtpId] =
    useState("");

  const [phoneVerificationCode, setPhoneVerificationCode] =
    useState("");

  const [phoneVerifying, setPhoneVerifying] =
    useState(false);

  const [phoneResending, setPhoneResending] =
    useState(false);

  /* =========================================================
     START PHONE VERIFICATION
     
     IMPORTANT:
     This is ONLY called after successful email verification.
     
     Robase is now responsible for generating and sending
     the 6-digit SMS verification code.
  ========================================================= */

  const startPhoneVerification = async (
    normalizedPhone: string
  ) => {
    setError("");
    setSuccess("");

    setPhoneVerificationNumber(
      normalizedPhone
    );

    setPhoneVerificationOtpId("");
    setPhoneVerificationCode("");

    /*
     * Show the phone screen BEFORE attempting the SMS
     * request so any SMS-provider error appears on
     * the phone verification screen.
     */
    setShowVerification(false);
    setShowPhoneVerification(true);

    try {
      const response =
        await fetch(
          "/api/phone-verification",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action: "send",
              phone: normalizedPhone,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.error ||
            "We couldn't send the phone verification code. Please try again."
        );
      }

      /*
       * Store the Robase OTP ID.
       *
       * This ID is required later when the user
       * enters the 6-digit code.
       */
      setPhoneVerificationOtpId(
        result.otpId
      );

      /*
       * Use the phone returned by our server so
       * the displayed number is the normalized number.
       */
      if (result.phone) {
        setPhoneVerificationNumber(
          result.phone
        );
      }

      setSuccess(
        "A 6-digit verification code has been sent to your phone."
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "We couldn't send the phone verification code. Please try again."
      );
    }
  };

  /* =========================================================
     SIGN UP
     
     ORIGINAL EMAIL SIGNUP LOGIC PRESERVED.
  ========================================================= */

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

    if (!isValidNigeriaPhone(phone)) {
      setError(
        "Please enter a valid Nigerian phone number."
      );
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

      const normalizedPhone =
        normalizeNigeriaPhone(phone);

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: normalizedPhone,
              phone_verified: false,
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      /*
       * ORIGINAL EMAIL VERIFICATION FLOW.
       *
       * We do NOT send SMS here.
       * Email verification must happen first.
       */
      if (data.user && !data.session) {
        setVerificationCode("");
        setShowPhoneVerification(false);
        setShowVerification(true);

        setSuccess(
          "An 8-digit verification code has been sent to your email."
        );

        return;
      }

      /*
       * If Supabase immediately gives us a session,
       * we still require phone verification before
       * entering the dashboard.
       */
      if (data.session) {
        await startPhoneVerification(
          normalizedPhone
        );

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

  /* =========================================================
     VERIFY EMAIL
     
     EMAIL REMAINS 8 DIGITS.
     
     After successful email verification,
     Robase phone verification starts.
  ========================================================= */

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

      /*
       * ORIGINAL WORKING EMAIL VERIFICATION CALL.
       */
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
       * EMAIL IS NOW VERIFIED.
       *
       * Move directly to Robase phone verification.
       */
      if (data.session) {
        if (!isValidNigeriaPhone(phone)) {
          setError(
            "Your email was verified, but your phone number is invalid. Please contact support."
          );
          return;
        }

        const normalizedPhone =
          normalizeNigeriaPhone(phone);

        await startPhoneVerification(
          normalizedPhone
        );

        return;
      }

      setError(
        "Your email was verified, but we couldn't start your session. Please sign in."
      );
    } catch (err: any) {
      /*
       * Only email verification errors arrive here.
       */
      setError(
        err?.message ||
          "Invalid verification code. Please check your email and try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  /* =========================================================
     EMAIL OTP INPUT
     
     ORIGINAL 8-DIGIT FLOW PRESERVED
  ========================================================= */

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

  /* =========================================================
     EMAIL RESEND
     
     ORIGINAL LOGIC PRESERVED
  ========================================================= */

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

  /* =========================================================
     PHONE OTP VERIFICATION
     
     ROB﻿ASE HANDLES THE ACTUAL OTP VERIFICATION.
     
     Supabase phone_change verification is NO LONGER USED.
  ========================================================= */

  const handleVerifyPhone = async (
    codeOverride?: string
  ) => {
    setError("");
    setSuccess("");

    const code =
      codeOverride ?? phoneVerificationCode;

    if (!/^\d{6}$/.test(code)) {
      setError(
        "Please enter the 6-digit phone verification code."
      );
      return;
    }

    if (!phoneVerificationNumber) {
      setError(
        "We couldn't determine your phone number. Please start again."
      );
      return;
    }

    if (!phoneVerificationOtpId) {
      setError(
        "Your phone verification session has expired. Please request a new code."
      );
      return;
    }

    try {
      setPhoneVerifying(true);

      /*
       * Send the OTP ID and 6-digit code to our
       * server-side Robase route.
       */
      const response =
        await fetch(
          "/api/phone-verification",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action: "verify",
              otpId:
                phoneVerificationOtpId,
              code,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result?.success ||
        result?.verified !== true
      ) {
        throw new Error(
          result?.error ||
            "Invalid or expired phone verification code."
        );
      }

      /*
       * Robase has successfully verified the phone.
       *
       * Store the verified state in the authenticated
       * Supabase user's metadata.
       */
      const { error: updateUserError } =
        await supabase.auth.updateUser({
          data: {
            phone:
              phoneVerificationNumber,
            phone_verified: true,
          },
        });

      if (updateUserError) {
        throw updateUserError;
      }

      /*
       * Confirm that an authenticated session still exists.
       */
      const { data: sessionData } =
        await supabase.auth.getSession();

      if (!sessionData.session) {
        throw new Error(
          "Your phone was verified, but we couldn't start your session."
        );
      }

      setSuccess(
        "Your email and phone have both been verified."
      );

      router.replace("/dashboard");
    } catch (err: any) {
      setError(
        err?.message ||
          "Invalid phone verification code. Please check the SMS and try again."
      );
    } finally {
      setPhoneVerifying(false);
    }
  };

  /* =========================================================
     PHONE OTP INPUT
     
     6 DIGITS
  ========================================================= */

  const handlePhoneOtpChange = (
    index: number,
    value: string
  ) => {
    const digits =
      value.replace(/\D/g, "");

    if (!digits) {
      const code =
        phoneVerificationCode.split("");

      code[index] = "";

      setPhoneVerificationCode(
        code.join("").slice(0, 6)
      );

      return;
    }

    const digit = digits[0];

    const code =
      phoneVerificationCode.split("");

    code[index] = digit;

    const newCode =
      code.join("").slice(0, 6);

    setPhoneVerificationCode(newCode);

    if (index < 5) {
      document
        .getElementById(
          `phone-otp-${index + 1}`
        )
        ?.focus();
    }

    if (
      newCode.length === 6 &&
      /^\d{6}$/.test(newCode)
    ) {
      void handleVerifyPhone(newCode);
    }
  };

  const handlePhoneOtpPaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pastedCode =
      e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    if (!pastedCode) {
      return;
    }

    setPhoneVerificationCode(
      pastedCode
    );

    const nextIndex =
      Math.min(pastedCode.length, 5);

    document
      .getElementById(
        `phone-otp-${nextIndex}`
      )
      ?.focus();

    if (
      pastedCode.length === 6 &&
      /^\d{6}$/.test(pastedCode)
    ) {
      void handleVerifyPhone(pastedCode);
    }
  };

  const handlePhoneOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (
      e.key === "Backspace" &&
      !phoneVerificationCode[index] &&
      index > 0
    ) {
      document
        .getElementById(
          `phone-otp-${index - 1}`
        )
        ?.focus();
    }

    if (
      e.key === "ArrowLeft" &&
      index > 0
    ) {
      document
        .getElementById(
          `phone-otp-${index - 1}`
        )
        ?.focus();
    }

    if (
      e.key === "ArrowRight" &&
      index < 5
    ) {
      document
        .getElementById(
          `phone-otp-${index + 1}`
        )
        ?.focus();
    }
  };

  /* =========================================================
     PHONE RESEND
     
     ROB﻿ASE SENDS A NEW OTP.
  ========================================================= */

  const handleResendPhoneCode = async () => {
    setError("");
    setSuccess("");

    if (!phoneVerificationNumber) {
      setError(
        "We couldn't determine your phone number."
      );
      return;
    }

    try {
      setPhoneResending(true);

      /*
       * Ask our server to request a new Robase OTP.
       */
      const response =
        await fetch(
          "/api/phone-verification",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action: "send",
              phone:
                phoneVerificationNumber,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.error ||
            "We couldn't resend the phone verification code. Please try again."
        );
      }

      /*
       * A new OTP has a new Robase OTP ID.
       * Replace the previous ID.
       */
      setPhoneVerificationOtpId(
        result.otpId
      );

      if (result.phone) {
        setPhoneVerificationNumber(
          result.phone
        );
      }

      setPhoneVerificationCode("");

      setSuccess(
        "A new 6-digit verification code has been sent to your phone."
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "We couldn't resend the phone verification code. Please try again."
      );
    } finally {
      setPhoneResending(false);
    }
  };

  /* =========================================================
     GOOGLE SIGNUP
     
     ORIGINAL FLOW PRESERVED
  ========================================================= */

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

  const emailParts =
    email.trim().split("@");

  const maskedEmail =
    emailParts.length === 2
      ? `${emailParts[0].slice(
          0,
          Math.min(3, emailParts[0].length)
        )}***@${emailParts[1]}`
      : "your email address";

  /* ============================================================
     PHONE VERIFICATION SCREEN
  ============================================================ */

  if (showPhoneVerification) {
    return (
      <main className="page verificationPage">

        <header className="topHeader">
          <button
            type="button"
            className="topBrand"
            onClick={() => router.push("/")}
            aria-label="PropertySure AI home"
          >
            <LogoMark size={20} />

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

        <div className="backRow">
          <div className="backRowInner">
            <button
              type="button"
              className="backButton"
              onClick={() => router.push("/")}
              aria-label="Back to PropertySure AI home"
            >
              <span className="backArrow">
                ←
              </span>

              <span>Back to Home</span>
            </button>
          </div>
        </div>

        <div className="verificationCard">

          <div className="verificationContent">

            <div className="verificationLogo">
              <LogoMark size={48} />
            </div>

            <div className="verificationEyebrow">
              PHONE VERIFICATION
            </div>

            <h1>
              Verify your phone
            </h1>

            <p className="verificationText">
              We've sent a 6-digit verification code to
            </p>

            <div className="verificationEmail">
              {maskPhone(
                phoneVerificationNumber
              )}
            </div>

            <div className="otpContainer phoneOtpContainer">

              {[0, 1, 2, 3, 4, 5].map(
                (index) => (
                  <input
                    key={index}
                    id={`phone-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }
                    maxLength={1}
                    value={
                      phoneVerificationCode[
                        index
                      ] || ""
                    }
                    onChange={(e) =>
                      handlePhoneOtpChange(
                        index,
                        e.target.value
                      )
                    }
                    onPaste={
                      index === 0
                        ? handlePhoneOtpPaste
                        : undefined
                    }
                    onKeyDown={(e) =>
                      handlePhoneOtpKeyDown(
                        e,
                        index
                      )
                    }
                    className="otpInput"
                    disabled={
                      phoneVerifying
                    }
                  />
                )
              )}

            </div>

            <div className="verificationHint">

              <div className="verificationHintIcon">
                <ShieldCheckIcon />
              </div>

              <span>
                Enter the 6-digit code sent to
                <br />
                your phone number securely.
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
                handleVerifyPhone()
              }
              disabled={
                phoneVerifying ||
                phoneVerificationCode.length !==
                  6
              }
            >
              {phoneVerifying
                ? "Verifying..."
                : "Verify Phone"}

              {!phoneVerifying && (
                <ArrowRightIcon />
              )}
            </button>

            <div className="resendText">

              Didn't receive the code?{" "}

              <button
                type="button"
                onClick={
                  handleResendPhoneCode
                }
                disabled={phoneResending}
              >
                {phoneResending
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

  /* ============================================================
     EMAIL VERIFICATION SCREEN
     
     ORIGINAL SCREEN PRESERVED
  ============================================================ */

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
            <LogoMark size={20} />

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

        <div className="backRow">
          <div className="backRowInner">
            <button
              type="button"
              className="backButton"
              onClick={() => router.push("/")}
              aria-label="Back to PropertySure AI home"
            >
              <span className="backArrow">
                ←
              </span>

              <span>Back to Home</span>
            </button>
          </div>
        </div>

        <div className="verificationCard">

          <div className="verificationContent">

            <div className="verificationLogo">
              <LogoMark size={48} />
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

  /* ============================================================
     SIGN-UP SCREEN
  ============================================================ */

  return (
    <main className="page">

      <header className="topHeader">

        <button
          type="button"
          className="topBrand"
          onClick={() => router.push("/")}
          aria-label="PropertySure AI home"
        >

          <LogoMark size={20} />

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

      <div className="backRow">
        <div className="backRowInner">
          <button
            type="button"
            className="backButton"
            onClick={() => router.push("/")}
            aria-label="Back to PropertySure AI home"
          >
            <span className="backArrow">
              ←
            </span>

            <span>Back to Home</span>
          </button>
        </div>
      </div>

      <div className="mainLayout">

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
                <LogoMark size={20} />
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

          <div className="divider">

            <span />

            <div>
              or
            </div>

            <span />

          </div>

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
            <LogoMark size={20} />
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