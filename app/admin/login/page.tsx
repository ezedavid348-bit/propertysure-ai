"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import styles from "./admin-login.module.css";
import { supabase } from "../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkExistingAdminSession() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (active) {
            setCheckingSession(false);
          }

          return;
        }

        const { data: admin, error: adminError } =
          await supabase
            .from("admin_users")
            .select("user_id, role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();

        if (adminError) {
          console.error(
            "Admin session check failed:",
            adminError
          );
        }

        if (admin) {
          router.replace("/admin");
          return;
        }

        if (active) {
          setCheckingSession(false);
        }
      } catch (error) {
        console.error(
          "Session check failed:",
          error
        );

        if (active) {
          setCheckingSession(false);
        }
      }
    }

    checkExistingAdminSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Please enter your admin email and password."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: authData,
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        setError(
          "Invalid admin email or password."
        );
        setLoading(false);
        return;
      }

      const user = authData.user;

      if (!user) {
        setError(
          "Admin sign-in could not be completed."
        );
        setLoading(false);
        return;
      }

      const {
        data: admin,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select("user_id, role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminError) {
        console.error(
          "Admin authorization check failed:",
          adminError
        );

        await supabase.auth.signOut();

        setError(
          "We could not verify this account as a PropertySure AI administrator."
        );

        setLoading(false);
        return;
      }

      if (!admin) {
        await supabase.auth.signOut();

        setError(
          "This account is not authorized to access the PropertySure AI admin dashboard."
        );

        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      console.error(
        "Admin login failed:",
        error
      );

      setError(
        "Something went wrong while signing in. Please try again."
      );

      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner} />

          <p>
            Checking admin access...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />

      <section className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logoMark}>
            PS
          </div>

          <div>
            <div className={styles.brandName}>
              PropertySure AI
            </div>

            <div className={styles.brandLabel}>
              ADMIN PORTAL
            </div>
          </div>
        </div>

        <div className={styles.header}>
          <p className={styles.eyebrow}>
            Secure Administration
          </p>

          <h1 className={styles.title}>
            Welcome back
          </h1>

          <p className={styles.subtitle}>
            Sign in to access the PropertySure AI
            administration dashboard.
          </p>
        </div>

        {error && (
          <div
            className={styles.errorBox}
            role="alert"
          >
            <span className={styles.errorIcon}>
              !
            </span>

            <span>{error}</span>
          </div>
        )}

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div className={styles.field}>
            <label htmlFor="admin-email">
              Admin Email
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your admin email"
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="admin-password">
              Password
            </label>

            <div className={styles.passwordWrapper}>
              <input
                id="admin-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
              />

              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.signInButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className={
                    styles.buttonSpinner
                  }
                />

                Signing in...
              </>
            ) : (
              "Sign in to Admin"
            )}
          </button>
        </form>

        <div className={styles.securityNote}>
          <div className={styles.lockIcon}>
            🔒
          </div>

          <div>
            <strong>
              Authorized access only
            </strong>

            <p>
              Admin access is restricted to
              authorized PropertySure AI
              administrators.
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <p>
            Admin accounts are provisioned by
            PropertySure AI.
          </p>

          <a href="/signin">
            Return to PropertySure AI
          </a>
        </div>
      </section>
    </main>
  );
}