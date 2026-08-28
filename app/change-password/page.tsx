"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import styles from "./password.module.css";

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "bell"
  | "arrow"
  | "chevron";

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const icons: Record<IconName, string> = {
    bell: "🔔",
    arrow: "←",
    chevron: "⌄",
  };

  return (
    <span
      className={styles.icon}
      style={{
        fontSize: `${size}px`,
      }}
      aria-hidden="true"
    >
      {icons[name]}
    </span>
  );
}

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

  const [fullName, setFullName] =
    useState("User");

  const [initial, setInitial] =
    useState("U");

  const [plan, setPlan] =
    useState("Free Plan");

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

        const authUser =
          data.user;

        const metadata =
          authUser.user_metadata || {};

        /*
        --------------------------------------------------------
        EMAIL
        --------------------------------------------------------
        */

        const userEmail =
          authUser.email || "";

        setEmail(userEmail);

        /*
        --------------------------------------------------------
        NAME
        --------------------------------------------------------
        */

        const metadataName =
          metadata.full_name ||
          metadata.name ||
          metadata.display_name ||
          "";

        const fallbackName =
          userEmail
            ? userEmail
                .split("@")[0]
                .replace(
                  /[._-]+/g,
                  " "
                )
                .replace(
                  /\b\w/g,
                  (letter: string) =>
                    letter.toUpperCase()
                )
            : "User";

        const resolvedName =
          String(metadataName).trim() ||
          fallbackName;

        setFullName(
          resolvedName
        );

        /*
        --------------------------------------------------------
        INITIAL
        --------------------------------------------------------
        */

        const resolvedInitial =
          resolvedName
            .trim()
            .charAt(0)
            .toUpperCase() ||
          "U";

        setInitial(
          resolvedInitial
        );

        /*
        --------------------------------------------------------
        PLAN
        --------------------------------------------------------
        */

        const metadataPlan =
          metadata.plan ||
          metadata.subscription_plan ||
          metadata.account_plan ||
          "Free Plan";

        setPlan(
          String(metadataPlan)
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
        router.push("/security");
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
      {/* ====================================================
          SIDEBAR
      ==================================================== */}

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
            <span>⌂</span>
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
          <span>◉</span>
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

        {/* SUPPORT */}

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

        {/* USER */}

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
            {initial}
          </div>

          <div
            className={
              styles.sidebarUserInfo
            }
          >
            <strong>
              {fullName}
            </strong>

            <span>
              {plan}
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

      {/* ====================================================
          MAIN
      ==================================================== */}

      <section
        className={
          styles.main
        }
      >
        {/* ==================================================
            TOP BAR
        ================================================== */}

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
            <Icon
              name="arrow"
              size={18}
            />

            <span>
              Back to Security
            </span>
          </button>

          <div
            className={
              styles.topbarRight
            }
          >
            {/* =================================================
                SAME NOTIFICATION BELL STYLE
                USED BY SECURITY PAGE
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
              <Icon
                name="bell"
                size={18}
              />

              <span
                className={
                  styles.notificationDot
                }
              />
            </button>

            {/* =================================================
                DYNAMIC USER PROFILE
            ================================================= */}

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
                {initial}
              </div>

              <div
                className={
                  styles.topUserText
                }
              >
                <strong>
                  {fullName}
                </strong>

                <span>
                  {plan}
                </span>
              </div>

              <span
                className={
                  styles.topProfileChevron
                }
              >
                ⌄
              </span>
            </button>
          </div>
        </header>

        {/* ==================================================
            PAGE INTRO
        ================================================== */}

        <div
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
        </div>

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
          >
            <span>✓</span>

            <div>
              {successMessage}
            </div>
          </div>
        )}

        {/* ==================================================
            CONTENT GRID
        ================================================== */}

        <div
          className={
            styles.contentGrid
          }
        >
          {/* ==================================================
              PASSWORD FORM
          ================================================== */}

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
                  ♙
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
                  {showCurrentPassword
                    ? "◉"
                    : "◌"}
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
                  ♙
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
                  {showNewPassword
                    ? "◉"
                    : "◌"}
                </button>
              </div>

              {/* PASSWORD STRENGTH */}

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
                  ♙
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
                  {showConfirmPassword
                    ? "◉"
                    : "◌"}
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
                    <span>
                      ♙
                    </span>

                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ==================================================
              RIGHT COLUMN
          ================================================== */}

          <aside
            className={
              styles.rightColumn
            }
          >
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
                  ♢
                </div>

                <h2>
                  Password Tips
                </h2>
              </div>

              <ul>
                <li>
                  <span>✓</span>
                  Use at least 8 characters
                </li>

                <li>
                  <span>✓</span>
                  Include uppercase and
                  lowercase letters
                </li>

                <li>
                  <span>✓</span>
                  Include numbers and
                  special characters
                </li>

                <li>
                  <span>✓</span>
                  Avoid using personal
                  information
                </li>

                <li>
                  <span>✓</span>
                  Choose a strong, unique
                  password
                </li>
              </ul>
            </section>

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
                ♙
              </div>

              <h2>
                Keep your account secure
              </h2>

              <p>
                A strong password helps
                protect your account and
                personal data from
                unauthorized access.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}