"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import AppShell from "../../../AppShell/AppShell";
import LoadingScreen from "../../../AppShell/LoadingScreen";

import styles from "./feature-request.module.css";

import { supabase } from "../../../lib/supabase";

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "feature"
  | "arrow"
  | "document"
  | "check"
  | "shield";

function Icon({
  name,
  size = 22,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const icons: Record<IconName, string> = {
    feature: "♧",
    arrow: "→",
    document: "▤",
    check: "✓",
    shield: "◇",
  };

  return (
    <span
      className={`${styles.icon} ${className}`}
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
FEATURE REQUEST CATEGORIES
============================================================

These categories focus on future capabilities and improvements
that customers may want PropertySure AI to add.
============================================================
*/

const featureCategories = [
  "Property Search & Discovery",
  "Property Due Diligence",
  "Property Reports & Documents",
  "Fraud Prevention & Risk Detection",
  "AI Features",
  "Property Monitoring & Alerts",
  "Professional & Expert Services",
  "Collaboration & Sharing",
  "Payments & Transactions",
  "Mobile & Remote Access",
  "Integrations & Connections",
  "Something Else",
];

/*
============================================================
PAGE
============================================================
*/

export default function FeatureRequestPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [featureTitle, setFeatureTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [benefit, setBenefit] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  /*
  ============================================================
  LOAD USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        setLoadingUser(true);

        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error(
            "Could not load authenticated user:",
            error
          );

          return;
        }

        if (!authUser) {
          router.replace("/signin");
          return;
        }

        if (mounted) {
          const metadata =
            authUser.user_metadata || {};

          const name =
            metadata.full_name ||
            metadata.fullName ||
            metadata.name ||
            "";

          setFullName(name);
          setEmail(authUser.email || "");
        }
      } catch (error) {
        console.error(
          "Feature request user loading error:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

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

  const navigateTo = (path: string) => {
    router.push(path);
  };

  /*
  ============================================================
  BACK TO SUPPORT & HELP
  ============================================================
  */

  const backToSupportHelp = () => {
    router.push("/settings/support-help");
  };

  /*
  ============================================================
  SUBMIT FEATURE REQUEST
  ============================================================
  */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !category ||
      !featureTitle.trim() ||
      !description.trim()
    ) {
      return;
    }

    try {
      setSubmitting(true);

      /*
       * Database/API submission can be connected later.
       * For now this provides the complete UI flow.
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Feature request submission error:",
        error
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loadingUser) {
    return <LoadingScreen />;
  }

  /*
  ============================================================
  SUCCESS STATE
  ============================================================
  */

  if (submitted) {
    return (
      <AppShell
        activePath="/settings"
        headerPath="/settings"
      >
        <main className={styles.page}>
          <section className={styles.main}>
            <div className={styles.mainInner}>
              <button
                type="button"
                className={styles.backButton}
                onClick={backToSupportHelp}
              >
                <span
                  className={styles.backArrow}
                  aria-hidden="true"
                >
                  ←
                </span>

                <span>
                  Back to Support & Help
                </span>
              </button>

              <section
                className={
                  styles.successCard
                }
              >
                <div
                  className={
                    styles.successIcon
                  }
                >
                  <Icon
                    name="check"
                    size={32}
                  />
                </div>

                <span
                  className={
                    styles.sectionEyebrow
                  }
                >
                  FEATURE REQUEST RECEIVED
                </span>

                <h1>
                  Thank you for your idea.
                </h1>

                <p>
                  Your feature request has
                  been received. Our team can
                  review your suggestion and
                  consider it for a future
                  PropertySure AI update.
                </p>

                <button
                  type="button"
                  className={
                    styles.primaryButton
                  }
                  onClick={backToSupportHelp}
                >
                  Return to Support & Help

                  <Icon
                    name="arrow"
                    size={18}
                  />
                </button>
              </section>
            </div>
          </section>
        </main>
      </AppShell>
    );
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
        <section className={styles.main}>
          <div className={styles.mainInner}>

            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <button
              type="button"
              className={styles.backButton}
              onClick={backToSupportHelp}
            >
              <span
                className={styles.backArrow}
                aria-hidden="true"
              >
                ←
              </span>

              <span>
                Back to Support & Help
              </span>
            </button>

            {/* =================================================
                HERO
            ================================================= */}

            <section
              className={styles.heroCard}
            >
              <div
                className={styles.heroIcon}
              >
                <Icon
                  name="feature"
                  size={32}
                />
              </div>

              <div
                className={
                  styles.heroContent
                }
              >
                <span
                  className={
                    styles.sectionEyebrow
                  }
                >
                  PRODUCT FEEDBACK
                </span>

                <h1>
                  Feature Requests
                </h1>

                <p>
                  Have an idea that could
                  make PropertySure AI
                  better? Tell us what you
                  would like us to build,
                  improve, or add in the
                  future.
                </p>
              </div>
            </section>

            {/* =================================================
                FORM
            ================================================= */}

            <section
              className={styles.formCard}
            >
              <div
                className={
                  styles.formHeader
                }
              >
                <span
                  className={
                    styles.sectionEyebrow
                  }
                >
                  SHARE YOUR IDEA
                </span>

                <h2>
                  What would you like us
                  to build?
                </h2>

                <p>
                  Give us enough detail to
                  understand your idea and
                  how it could help you or
                  other PropertySure users.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className={styles.form}
              >

                {/* ============================================
                    FULL NAME
                ============================================ */}

                <div
                  className={styles.field}
                >
                  <label htmlFor="fullName">
                    Full name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(
                        event.target.value
                      )
                    }
                    placeholder="Your full name"
                  />
                </div>

                {/* ============================================
                    EMAIL
                ============================================ */}

                <div
                  className={styles.field}
                >
                  <label htmlFor="email">
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="Your email address"
                  />
                </div>

                {/* ============================================
                    FEATURE CATEGORY
                ============================================ */}

                <div
                  className={styles.field}
                >
                  <label htmlFor="category">
                    Feature category

                    <span
                      className={
                        styles.required
                      }
                    >
                      *
                    </span>
                  </label>

                  <select
                    id="category"
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value
                      )
                    }
                    required
                  >
                    <option value="">
                      Select a feature
                      category
                    </option>

                    {featureCategories.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* ============================================
                    FEATURE TITLE
                ============================================ */}

                <div
                  className={styles.field}
                >
                  <label htmlFor="featureTitle">
                    Feature title

                    <span
                      className={
                        styles.required
                      }
                    >
                      *
                    </span>
                  </label>

                  <input
                    id="featureTitle"
                    type="text"
                    value={featureTitle}
                    onChange={(event) =>
                      setFeatureTitle(
                        event.target.value
                      )
                    }
                    placeholder="Briefly describe your idea"
                    required
                  />
                </div>

                <p
                  className={
                    styles.fieldHint
                  }
                >
                  Example: "Allow users to
                  compare two properties side
                  by side."
                </p>

                {/* ============================================
                    DESCRIPTION
                ============================================ */}

                <div
                  className={styles.field}
                >
                  <label htmlFor="description">
                    Describe your idea

                    <span
                      className={
                        styles.required
                      }
                    >
                      *
                    </span>
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    placeholder="Tell us what you would like PropertySure AI to do..."
                    rows={7}
                    required
                  />
                </div>

                {/* ============================================
                    BENEFIT
                ============================================ */}

                <div
                  className={styles.field}
                >
                  <label htmlFor="benefit">
                    How would this help?
                  </label>

                  <textarea
                    id="benefit"
                    value={benefit}
                    onChange={(event) =>
                      setBenefit(
                        event.target.value
                      )
                    }
                    placeholder="Tell us how this feature would make PropertySure AI more useful for you or other users..."
                    rows={5}
                  />
                </div>

                {/* ============================================
                    INFORMATION BOX
                ============================================ */}

                <div
                  className={
                    styles.infoBox
                  }
                >
                  <div
                    className={
                      styles.infoIcon
                    }
                  >
                    <Icon
                      name="shield"
                      size={20}
                    />
                  </div>

                  <div>
                    <strong>
                      Your feedback matters
                    </strong>

                    <p>
                      Feature requests help
                      us understand what
                      users would like to
                      see in future versions
                      of PropertySure AI.
                    </p>
                  </div>
                </div>

                {/* ============================================
                    SUBMIT BUTTON
                ============================================ */}

                <button
                  type="submit"
                  className={
                    styles.submitButton
                  }
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Feature Request"}

                  {!submitting && (
                    <Icon
                      name="arrow"
                      size={18}
                    />
                  )}
                </button>

              </form>
            </section>
          </div>
        </section>
      </main>
    </AppShell>
  );
}