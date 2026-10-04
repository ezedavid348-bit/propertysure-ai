"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./phone-number.module.css";
import { supabase } from "../../lib/supabase";
import AppShell from "../../AppShell/AppShell";
import LoadingScreen from "../../AppShell/LoadingScreen";

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "phone"
  | "shield"
  | "lock"
  | "check"
  | "info";

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const icons: Record<IconName, string> = {
    phone: "☎",
    shield: "♢",
    lock: "▣",
    check: "✓",
    info: "ⓘ",
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
COUNTRIES / REGIONS
============================================================
*/

const countries = [
  {
    code: "NG",
    name: "Nigeria",
    dialCode: "+234",
    flag: "🇳🇬",
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "🇬🇧",
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "🇨🇦",
  },
  {
    code: "GH",
    name: "Ghana",
    dialCode: "+233",
    flag: "🇬🇭",
  },
  {
    code: "ZA",
    name: "South Africa",
    dialCode: "+27",
    flag: "🇿🇦",
  },
  {
    code: "KE",
    name: "Kenya",
    dialCode: "+254",
    flag: "🇰🇪",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    flag: "🇦🇪",
  },
];

/*
============================================================
USER DATA
============================================================
*/

type UserInfo = {
  fullName: string;
  initial: string;
  plan: string;
  email: string;
  phone: string;
};

/*
============================================================
ADD PHONE NUMBER PAGE
============================================================
*/

export default function AddPhoneNumberPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [user, setUser] =
    useState<UserInfo>({
      fullName: "User",
      initial: "U",
      plan: "Free Plan",
      email: "",
      phone: "",
    });

  const [selectedCountry, setSelectedCountry] =
    useState("NG");

  const [phoneNumber, setPhoneNumber] =
    useState("");

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
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!authUser) {
          router.replace("/signin");
          return;
        }

        if (!mounted) {
          return;
        }

        const metadata =
          authUser.user_metadata || {};

        const metadataName =
          metadata.full_name ||
          metadata.name ||
          metadata.display_name ||
          "";

        const email =
          authUser.email || "";

        const fallbackName = email
          ? email
              .split("@")[0]
              .replace(/[._-]+/g, " ")
              .replace(/\b\w/g, (letter: string) =>
                letter.toUpperCase()
              )
          : "User";

        const fullName =
          String(metadataName).trim() ||
          fallbackName;

        const initial =
          fullName
            .trim()
            .charAt(0)
            .toUpperCase() || "U";

        const plan =
          metadata.plan ||
          metadata.subscription_plan ||
          metadata.account_plan ||
          "Free Plan";

        const existingPhone =
          authUser.phone || "";

        setUser({
          fullName,
          initial,
          plan: String(plan),
          email,
          phone: existingPhone,
        });

        /*
        --------------------------------------------------------
        IF USER ALREADY HAS A PHONE, DISPLAY IT
        --------------------------------------------------------
        */

        if (existingPhone) {
          const matchingCountry =
            countries.find((country) =>
              existingPhone.startsWith(
                country.dialCode
              )
            );

          if (matchingCountry) {
            setSelectedCountry(
              matchingCountry.code
            );

            setPhoneNumber(
              existingPhone.slice(
                matchingCountry.dialCode.length
              )
            );
          } else {
            setPhoneNumber(
              existingPhone
            );
          }
        }
      } catch (loadError) {
        console.error(
          "Add phone number user loading error:",
          loadError
        );

        if (mounted) {
          setError(
            "Unable to load your account information."
          );
        }
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
  BACK TO SECURITY & PRIVACY
  ============================================================
  
  IMPORTANT:
  The Security & Privacy page is located at:

  /settings/security

  NOT:

  /security
  ============================================================
  */

  const goBackToSecurity = () => {
    router.push("/settings/security");
  };

  /*
  ============================================================
  SELECTED COUNTRY
  ============================================================
  */

  const country =
    countries.find(
      (item) =>
        item.code === selectedCountry
    ) || countries[0];

  /*
  ============================================================
  PHONE INPUT
  ============================================================
  */

  const handlePhoneChange = (
    value: string
  ) => {
    /*
    ----------------------------------------------------------
    Keep only numbers.
    ----------------------------------------------------------
    */

    const digits =
      value.replace(/\D/g, "");

    setPhoneNumber(digits);
    setError("");
    setMessage("");
  };

  /*
  ============================================================
  SEND VERIFICATION CODE
  ============================================================
  */

  const sendVerificationCode = async () => {
    setError("");
    setMessage("");

    const digits =
      phoneNumber.replace(/\D/g, "");

    if (!digits) {
      setError(
        "Please enter your phone number."
      );
      return;
    }

    if (digits.length < 7) {
      setError(
        "Please enter a valid phone number."
      );
      return;
    }

    const fullPhone =
      `${country.dialCode}${digits}`;

    try {
      setSubmitting(true);

      /*
      --------------------------------------------------------
      Supabase sends the phone-change OTP.
      --------------------------------------------------------
      */

      const {
        error: updateError,
      } =
        await supabase.auth.updateUser({
          phone: fullPhone,
        });

      if (updateError) {
        throw updateError;
      }

      /*
      --------------------------------------------------------
      Store the pending phone locally so the verification
      page can use it.
      --------------------------------------------------------
      */

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "pending_phone_number",
          fullPhone
        );

        window.sessionStorage.setItem(
          "pending_phone_country",
          country.code
        );
      }

      setMessage(
        "A verification code has been sent to your phone."
      );

      /*
      --------------------------------------------------------
      Move to phone verification page.
      --------------------------------------------------------
      */

      router.push(
        "/account/phone-number/verify"
      );
    } catch (submitError) {
      console.error(
        "Phone number update error:",
        submitError
      );

      const errorMessage =
        submitError instanceof Error
          ? submitError.message
          : "Unable to send the verification code.";

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  /*
  ============================================================
  SHARED LOADING SCREEN
  ============================================================
  */

  if (loadingUser) {
    return <LoadingScreen />;
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <AppShell
      activePath="/account"
      headerPath="/account"
    >
      <main className={styles.page}>
        <div className={styles.content}>

          {/* =================================================
              PAGE INTRO
          ================================================= */}

          <div
            className={
              styles.pageIntro
            }
          >
            <h1>
              Add Phone Number
            </h1>

            <p>
              Add a phone number to your
              account for verification,
              account recovery, and
              enhanced security.
            </p>

            {/* =================================================
                BACK TO SECURITY & PRIVACY
            ================================================= */}

            <button
              type="button"
              className={
                styles.backLink
              }
              onClick={
                goBackToSecurity
              }
            >
              <span
                aria-hidden="true"
              >
                ←
              </span>

              <span>
                Back to Security & Privacy
              </span>
            </button>
          </div>

          {/* =================================================
              PHONE CARD
          ================================================= */}

          <section
            className={
              styles.phoneCard
            }
          >

            {/* =================================================
                LEFT SIDE — PHONE FORM
            ================================================= */}

            <div
              className={
                styles.phoneFormSection
              }
            >
              <div
                className={
                  styles.formHeading
                }
              >
                <h2>
                  Phone Number
                </h2>

                <p>
                  Enter your mobile number
                  to get started.
                </p>
              </div>

              {/* COUNTRY */}

              <div
                className={
                  styles.fieldGroup
                }
              >
                <label
                  htmlFor="country"
                >
                  Country / Region
                </label>

                <div
                  className={
                    styles.selectWrapper
                  }
                >
                  <span
                    className={
                      styles.countryFlag
                    }
                  >
                    {country.flag}
                  </span>

                  <select
                    id="country"
                    value={
                      selectedCountry
                    }
                    onChange={(event) => {
                      setSelectedCountry(
                        event.target.value
                      );

                      setError("");
                      setMessage("");
                    }}
                    className={
                      styles.countrySelect
                    }
                  >
                    {countries.map(
                      (item) => (
                        <option
                          key={item.code}
                          value={
                            item.code
                          }
                        >
                          {item.name} (
                          {
                            item.dialCode
                          }
                          )
                        </option>
                      )
                    )}
                  </select>

                  <span
                    className={
                      styles.selectChevron
                    }
                  >
                    ⌄
                  </span>
                </div>
              </div>

              {/* PHONE */}

              <div
                className={
                  styles.fieldGroup
                }
              >
                <label
                  htmlFor="phone"
                >
                  Phone Number
                </label>

                <div
                  className={
                    styles.phoneInputWrapper
                  }
                >
                  <span
                    className={
                      styles.dialCode
                    }
                  >
                    {country.dialCode}
                  </span>

                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={
                      phoneNumber
                    }
                    onChange={(event) =>
                      handlePhoneChange(
                        event.target.value
                      )
                    }
                    placeholder="801 234 5678"
                    className={
                      styles.phoneInput
                    }
                    disabled={
                      submitting
                    }
                  />
                </div>
              </div>

              {/* INFO */}

              <div
                className={
                  styles.infoMessage
                }
              >
                <Icon
                  name="info"
                  size={17}
                />

                <span>
                  We will send a
                  verification code to
                  this number.
                </span>
              </div>

              {/* ERROR */}

              {error && (
                <div
                  className={
                    styles.errorMessage
                  }
                >
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {message && (
                <div
                  className={
                    styles.successMessage
                  }
                >
                  {message}
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="button"
                className={
                  styles.submitButton
                }
                onClick={
                  sendVerificationCode
                }
                disabled={
                  submitting
                }
              >
                {submitting
                  ? "Sending..."
                  : "Send Verification Code"}
              </button>
            </div>

            {/* =================================================
                RIGHT SECURITY PANEL
            ================================================= */}

            <div
              className={
                styles.securityPanel
              }
            >
              <div
                className={
                  styles.phoneIllustration
                }
              >
                <div
                  className={
                    styles.phoneIllustrationBody
                  }
                >
                  <div
                    className={
                      styles.phoneSpeaker
                    }
                  />

                  <div
                    className={
                      styles.phoneScreen
                    }
                  >
                    <span>
                      •••
                    </span>
                  </div>

                  <div
                    className={
                      styles.phoneHome
                    }
                  />
                </div>

                <div
                  className={
                    styles.securityBadge
                  }
                >
                  <Icon
                    name="shield"
                    size={22}
                  />

                  <span>
                    ✓
                  </span>
                </div>
              </div>

              <h3>
                Your phone number helps
                keep your account safe
              </h3>

              <div
                className={
                  styles.securityBenefits
                }
              >
                <div
                  className={
                    styles.benefitItem
                  }
                >
                  <span
                    className={
                      styles.benefitCheck
                    }
                  >
                    <Icon
                      name="check"
                      size={13}
                    />
                  </span>

                  <span>
                    Two-factor
                    authentication
                  </span>
                </div>

                <div
                  className={
                    styles.benefitItem
                  }
                >
                  <span
                    className={
                      styles.benefitCheck
                    }
                  >
                    <Icon
                      name="check"
                      size={13}
                    />
                  </span>

                  <span>
                    Account recovery
                  </span>
                </div>

                <div
                  className={
                    styles.benefitItem
                  }
                >
                  <span
                    className={
                      styles.benefitCheck
                    }
                  >
                    <Icon
                      name="check"
                      size={13}
                    />
                  </span>

                  <span>
                    Important security
                    alerts
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              PRIVACY NOTICE
          ================================================= */}

          <section
            className={
              styles.privacyCard
            }
          >
            <div
              className={
                styles.privacyIcon
              }
            >
              <Icon
                name="lock"
                size={25}
              />
            </div>

            <div
              className={
                styles.privacyText
              }
            >
              <h3>
                Your privacy is important
                to us
              </h3>

              <p>
                Your phone number will be
                used only for security
                purposes and will never be
                shared with third parties.
              </p>
            </div>
          </section>

        </div>
      </main>
    </AppShell>
  );
}