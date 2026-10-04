"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { supabase } from "../lib/supabase";
import AppShell from "../AppShell/AppShell";
import LoadingScreen from "../AppShell/LoadingScreen";

import styles from "./password.module.css";

/*
============================================================
PASSWORD TYPES
============================================================
*/

type PasswordStrength = {
  score: number;
  label: string;
};

/*
============================================================
PASSWORD STRENGTH
============================================================
*/

function getPasswordStrength(
  password: string
): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: "",
    };
  }

  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  if (score <= 2) {
    return {
      score,
      label: "Too weak",
    };
  }

  if (score <= 4) {
    return {
      score,
      label: "Fair",
    };
  }

  if (score === 5) {
    return {
      score,
      label: "Strong",
    };
  }

  return {
    score,
    label: "Very strong",
  };
}

/*
============================================================
PASSWORD VALIDATION
============================================================
*/

function getPasswordError(
  password: string
): string {
  if (!password) {
    return "Please enter a new password.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character.";
  }

  return "";
}

/*
============================================================
PASSWORD ICONS
============================================================
*/

function LockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="10"
        width="16"
        height="11"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M7.5 10V7.5C7.5 5.57 9.07 4 11 4H13C14.93 4 16.5 5.57 16.5 7.5V10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <circle
        cx="12"
        cy="15"
        r="1.2"
        fill="currentColor"
      />

      <path
        d="M12 16.2V18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({
  visible,
}: {
  visible: boolean;
}) {
  if (visible) {
    return (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2.5 12C4.6 7.8 8 5.5 12 5.5C16 5.5 19.4 7.8 21.5 12C19.4 16.2 16 18.5 12 18.5C8 18.5 4.6 16.2 2.5 12Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />

        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M10.6 5.7C11.06 5.57 11.53 5.5 12 5.5C16 5.5 19.4 7.8 21.5 12C20.78 13.45 19.82 14.7 18.68 15.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M6.1 8.1C4.63 9.06 3.4 10.38 2.5 12C4.6 16.2 8 18.5 12 18.5C13.13 18.5 14.21 18.32 15.22 17.97"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3L19 5.6V10.4C19 14.9 16.1 18.4 12 20C7.9 18.4 5 14.9 5 10.4V5.6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M8.7 11.7L10.8 13.8L15.5 9.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TipsIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 18H15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M9.5 21H14.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M8.2 14.7C7.05 13.75 6.3 12.32 6.3 10.7C6.3 7.55 8.85 5 12 5C15.15 5 17.7 7.55 17.7 10.7C17.7 12.32 16.95 13.75 15.8 14.7C15.2 15.2 15 15.7 15 16.5H9C9 15.7 8.8 15.2 8.2 14.7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/*
============================================================
CHANGE PASSWORD PAGE
============================================================
*/

export default function ChangePasswordPage() {
  const router = useRouter();

  /*
  ============================================================
  USER
  ============================================================
  */

  const [email, setEmail] = useState("");

  /*
  ============================================================
  PASSWORD
  ============================================================
  */

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /*
  ============================================================
  PAGE STATE
  ============================================================
  */

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /*
  ============================================================
  PASSWORD STRENGTH
  ============================================================
  */

  const passwordStrength = useMemo(
    () =>
      getPasswordStrength(
        newPassword
      ),
    [newPassword]
  );

  /*
  ============================================================
  LOAD CURRENT USER
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
        } = await supabase.auth.getUser();

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

        const authUser = data.user;

        setEmail(
          authUser.email || ""
        );
      } catch (error) {
        console.error(
          "CHANGE PASSWORD USER LOAD ERROR:",
          error
        );

        if (!mounted) {
          return;
        }

        setErrorMessage(
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

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  function goBackToSecurity() {
    router.push(
      "/settings/security"
    );
  }

  /*
  ============================================================
  CHANGE PASSWORD
  ============================================================
  */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    /*
    ----------------------------------------------------------
    CURRENT PASSWORD
    ----------------------------------------------------------
    */

    if (!currentPassword) {
      setErrorMessage(
        "Please enter your current password."
      );

      return;
    }

    /*
    ----------------------------------------------------------
    NEW PASSWORD
    ----------------------------------------------------------
    */

    const passwordError =
      getPasswordError(
        newPassword
      );

    if (passwordError) {
      setErrorMessage(
        passwordError
      );

      return;
    }

    /*
    ----------------------------------------------------------
    CONFIRM PASSWORD
    ----------------------------------------------------------
    */

    if (
      newPassword !==
      confirmPassword
    ) {
      setErrorMessage(
        "New password and confirmation password do not match."
      );

      return;
    }

    /*
    ----------------------------------------------------------
    PASSWORD MUST BE DIFFERENT
    ----------------------------------------------------------
    */

    if (
      currentPassword ===
      newPassword
    ) {
      setErrorMessage(
        "Your new password must be different from your current password."
      );

      return;
    }

    /*
    ----------------------------------------------------------
    EMAIL
    ----------------------------------------------------------
    */

    if (!email) {
      setErrorMessage(
        "We could not determine the email address for this account."
      );

      return;
    }

    setSubmitting(true);

    try {
      /*
      ========================================================
      STEP 1
      VERIFY CURRENT PASSWORD
      ========================================================
      */

      const {
        error:
          verificationError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password:
              currentPassword,
          }
        );

      if (verificationError) {
        throw new Error(
          "Your current password is incorrect."
        );
      }

      /*
      ========================================================
      STEP 2
      UPDATE PASSWORD
      ========================================================
      */

      const {
        error:
          updateError,
      } =
        await supabase.auth.updateUser(
          {
            password:
              newPassword,
          }
        );

      if (updateError) {
        throw updateError;
      }

      /*
      ========================================================
      SUCCESS
      ========================================================
      */

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        "Your password has been updated successfully."
      );

      window.setTimeout(() => {
        router.push(
          "/settings/security"
        );
      }, 1800);
    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not update your password. Please try again."
      );
    } finally {
      setSubmitting(false);
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
  PAGE
  ============================================================
  */

  return (
    <AppShell
      activePath="/settings"
      headerPath="/settings"
    >
      <main className={styles.page}>
        <section className={styles.content}>

          {/* ==================================================
              PAGE INTRO
          ================================================== */}

          <header
            className={
              styles.pageIntro
            }
          >
            <h1>
              Change Password
            </h1>

            <p>
              Update your password to keep
              your PropertySure AI account
              secure.
            </p>

            <Link
              href="/settings/security"
              className={
                styles.backLink
              }
            >
              <span
                className={
                  styles.backArrow
                }
                aria-hidden="true"
              >
                ←
              </span>

              <span>
                Back to Security &amp; Privacy
              </span>
            </Link>
          </header>

          {/* ==================================================
              ERROR
          ================================================== */}

          {errorMessage && (
            <div
              className={
                styles.errorMessage
              }
              role="alert"
            >
              <span
                className={
                  styles.messageIcon
                }
              >
                !
              </span>

              <div>
                {errorMessage}
              </div>

              <button
                type="button"
                onClick={() =>
                  setErrorMessage("")
                }
                aria-label="Close error"
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
              role="status"
            >
              <span
                className={
                  styles.messageIcon
                }
              >
                ✓
              </span>

              <div>
                {successMessage}
              </div>
            </div>
          )}

          {/* ==================================================
              CONTENT
          ================================================== */}

          <div
            className={
              styles.contentGrid
            }
          >
            {/* ==============================================
                PASSWORD FORM
            ============================================== */}

            <form
              className={
                styles.passwordCard
              }
              onSubmit={
                handleSubmit
              }
            >
              {/* CURRENT PASSWORD */}

              <div
                className={
                  styles.fieldGroup
                }
              >
                <label
                  htmlFor="currentPassword"
                >
                  Current Password
                </label>

                <div
                  className={
                    styles.passwordInput
                  }
                >
                  <span
                    className={
                      styles.lockIcon
                    }
                  >
                    <LockIcon />
                  </span>

                  <input
                    id="currentPassword"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      currentPassword
                    }
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    disabled={
                      submitting
                    }
                  />

                  <button
                    type="button"
                    className={
                      styles.eyeButton
                    }
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) =>
                          !value
                      )
                    }
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                  >
                    <EyeIcon
                      visible={
                        showCurrentPassword
                      }
                    />
                  </button>
                </div>

                <p
                  className={
                    styles.fieldHelp
                  }
                >
                  For security, please enter
                  your current password.
                </p>
              </div>

              {/* NEW PASSWORD */}

              <div
                className={
                  styles.fieldGroup
                }
              >
                <label
                  htmlFor="newPassword"
                >
                  New Password
                </label>

                <div
                  className={
                    styles.passwordInput
                  }
                >
                  <span
                    className={
                      styles.lockIcon
                    }
                  >
                    <LockIcon />
                  </span>

                  <input
                    id="newPassword"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      newPassword
                    }
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    disabled={
                      submitting
                    }
                  />

                  <button
                    type="button"
                    className={
                      styles.eyeButton
                    }
                    onClick={() =>
                      setShowNewPassword(
                        (value) =>
                          !value
                      )
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                  >
                    <EyeIcon
                      visible={
                        showNewPassword
                      }
                    />
                  </button>
                </div>

                <div
                  className={
                    styles.strengthRow
                  }
                >
                  <div
                    className={
                      styles.strengthBars
                    }
                  >
                    {[
                      1,
                      2,
                      3,
                      4,
                      5,
                      6,
                    ].map(
                      (bar) => (
                        <span
                          key={bar}
                          className={
                            bar <=
                            passwordStrength.score
                              ? styles.strengthActive
                              : styles.strengthInactive
                          }
                        />
                      )
                    )}
                  </div>

                  {passwordStrength.label && (
                    <span
                      className={`${styles.strengthLabel} ${
                        passwordStrength.score >=
                        5
                          ? styles.strengthGood
                          : passwordStrength.score >=
                              3
                            ? styles.strengthFair
                            : styles.strengthWeak
                      }`}
                    >
                      Password strength:{" "}
                      <strong>
                        {
                          passwordStrength.label
                        }
                      </strong>
                    </span>
                  )}
                </div>

                <p
                  className={
                    styles.fieldHelp
                  }
                >
                  Use at least 8 characters
                  with a mix of letters,
                  numbers, and symbols.
                </p>
              </div>

              {/* CONFIRM PASSWORD */}

              <div
                className={
                  styles.fieldGroup
                }
              >
                <label
                  htmlFor="confirmPassword"
                >
                  Confirm New Password
                </label>

                <div
                  className={
                    styles.passwordInput
                  }
                >
                  <span
                    className={
                      styles.lockIcon
                    }
                  >
                    <LockIcon />
                  </span>

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    disabled={
                      submitting
                    }
                  />

                  <button
                    type="button"
                    className={
                      styles.eyeButton
                    }
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) =>
                          !value
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                  >
                    <EyeIcon
                      visible={
                        showConfirmPassword
                      }
                    />
                  </button>
                </div>

                <p
                  className={
                    styles.fieldHelp
                  }
                >
                  Re-enter your new password
                  to confirm.
                </p>

                {confirmPassword &&
                  newPassword !==
                    confirmPassword && (
                    <p
                      className={
                        styles.matchError
                      }
                    >
                      Passwords do not match.
                    </p>
                  )}

                {confirmPassword &&
                  newPassword ===
                    confirmPassword &&
                  newPassword.length > 0 && (
                    <p
                      className={
                        styles.matchSuccess
                      }
                    >
                      ✓ Passwords match.
                    </p>
                  )}
              </div>

              {/* FORM ACTIONS */}

              <div
                className={
                  styles.formActions
                }
              >
                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  onClick={
                    goBackToSecurity
                  }
                  disabled={
                    submitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    styles.updateButton
                  }
                  disabled={
                    submitting
                  }
                >
                  {submitting ? (
                    <>
                      <span
                        className={
                          styles.buttonSpinner
                        }
                      />

                      Updating...
                    </>
                  ) : (
                    <>
                      <LockIcon />

                      <span>
                        Update Password
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* ==============================================
                RIGHT COLUMN
            ============================================== */}

            <aside
              className={
                styles.rightColumn
              }
            >
              {/* PASSWORD TIPS */}

              <section
                className={
                  styles.tipsCard
                }
              >
                <div
                  className={
                    styles.tipsHeader
                  }
                >
                  <div
                    className={
                      styles.tipsIcon
                    }
                  >
                    <TipsIcon />
                  </div>

                  <h2>
                    Password Tips
                  </h2>
                </div>

                <ul>
                  <li>
                    <span>
                      ✓
                    </span>

                    <span>
                      Use at least 8 characters
                    </span>
                  </li>

                  <li>
                    <span>
                      ✓
                    </span>

                    <span>
                      Include uppercase and
                      lowercase letters
                    </span>
                  </li>

                  <li>
                    <span>
                      ✓
                    </span>

                    <span>
                      Include numbers and
                      special characters
                    </span>
                  </li>

                  <li>
                    <span>
                      ✓
                    </span>

                    <span>
                      Avoid using personal
                      information
                    </span>
                  </li>

                  <li>
                    <span>
                      ✓
                    </span>

                    <span>
                      Choose a strong, unique
                      password
                    </span>
                  </li>
                </ul>
              </section>

              {/* SECURITY CARD */}

              <section
                className={
                  styles.securityCard
                }
              >
                <div
                  className={
                    styles.securityIcon
                  }
                >
                  <ShieldIcon />
                </div>

                <div>
                  <h2>
                    Keep your account secure
                  </h2>

                  <p>
                    A strong password helps
                    protect your account and
                    personal data from
                    unauthorized access.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </main>
    </AppShell>
  );
}