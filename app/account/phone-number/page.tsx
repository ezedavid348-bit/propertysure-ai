"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./phone-number.module.css";
import { supabase } from "../../lib/supabase";

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "dashboard"
  | "verify"
  | "properties"
  | "history"
  | "fraud"
  | "reports"
  | "account"
  | "settings"
  | "bell"
  | "phone"
  | "shield"
  | "lock"
  | "menu"
  | "chevron"
  | "arrow"
  | "logout"
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
    dashboard: "▦",
    verify: "⇧",
    properties: "⌂",
    history: "◷",
    fraud: "◇",
    reports: "▤",
    account: "◯",
    settings: "⚙",
    bell: "🔔",
    phone: "☎",
    shield: "♢",
    lock: "▣",
    menu: "☰",
    chevron: "›",
    arrow: "←",
    logout: "↪",
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
NAVIGATION
============================================================
*/

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard" as IconName,
  },
  {
    label: "Verify Property",
    href: "/verify",
    icon: "verify" as IconName,
  },
  {
    label: "My Properties",
    href: "/my-properties",
    icon: "properties" as IconName,
  },
  {
    label: "Verification History",
    href: "/verification-history",
    icon: "history" as IconName,
  },
  {
    label: "Fraud Watch",
    href: "/fraud-watch",
    icon: "fraud" as IconName,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "reports" as IconName,
  },
];

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

  const [menuOpen, setMenuOpen] =
    useState(false);

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
        IF USER ALREADY HAS A PHONE, TRY TO DISPLAY IT
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
    setMenuOpen(false);
    router.push(path);
  };

  /*
  ============================================================
  SIGN OUT
  ============================================================
  */

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/signin");
    } catch (signOutError) {
      console.error(
        "Sign out error:",
        signOutError
      );
    }
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
      Move to the phone verification page.
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
  LOADING
  ============================================================
  */

  if (loadingUser) {
    return (
      <main className={styles.loading}>
        <div
          className={
            styles.loadingBrand
          }
        >
          <span
            className={
              styles.loadingLogo
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
            styles.loadingText
          }
        >
          Loading phone settings...
        </div>
      </main>
    );
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <main className={styles.page}>
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className={styles.sidebar}>
        <button
          type="button"
          className={styles.brandButton}
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <div
            className={
              styles.brandName
            }
          >
            <span
              className={
                styles.brandLogoDiamond
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
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              className={
                styles.navItem
              }
              onClick={() =>
                navigateTo(item.href)
              }
            >
              <span
                className={
                  styles.navIcon
                }
              >
                <Icon
                  name={item.icon}
                  size={18}
                />
              </span>

              <span>
                {item.label}
              </span>
            </button>
          ))}
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
          className={styles.navItem}
          onClick={() =>
            navigateTo("/account")
          }
        >
          <span
            className={
              styles.navIcon
            }
          >
            <Icon
              name="account"
              size={18}
            />
          </span>

          <span>Account</span>
        </button>

        <button
          type="button"
          className={styles.navItem}
          onClick={() =>
            navigateTo("/settings")
          }
        >
          <span
            className={
              styles.navIcon
            }
          >
            <Icon
              name="settings"
              size={18}
            />
          </span>

          <span>Settings</span>
        </button>

        {/* SUPPORT */}

        <div
          className={
            styles.helpBox
          }
        >
          <div
            className={
              styles.helpTitle
            }
          >
            Need Help?
          </div>

          <div
            className={
              styles.helpText
            }
          >
            Our support team is ready
            <br />
            to assist you.
          </div>

          <button
            type="button"
            className={
              styles.supportButton
            }
            onClick={() =>
              navigateTo("/account")
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
          onClick={() =>
            navigateTo("/account")
          }
        >
          <div
            className={styles.avatar}
          >
            {user.initial}
          </div>

          <div
            className={
              styles.userInfo
            }
          >
            <div
              className={
                styles.userName
              }
            >
              {user.fullName}
            </div>

            <div
              className={
                styles.userPlan
              }
            >
              {user.plan}
            </div>
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

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header
        className={
          styles.mobileHeader
        }
      >
        <button
          type="button"
          className={
            styles.menuButton
          }
          onClick={() =>
            setMenuOpen(true)
          }
          aria-label="Open navigation"
        >
          <Icon
            name="menu"
            size={23}
          />
        </button>

        <button
          type="button"
          className={
            styles.mobileLogoButton
          }
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <span
            className={
              styles.mobileLogoDiamond
            }
          >
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </button>

        <button
          type="button"
          className={
            styles.mobileBell
          }
          onClick={() =>
            navigateTo(
              "/account/notifications"
            )
          }
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            size={17}
          />

          <span
            className={
              styles.mobileNotificationDot
            }
          />
        </button>
      </header>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {menuOpen && (
        <div
          className={
            styles.mobileMenu
          }
        >
          <div
            className={
              styles.mobileMenuHeader
            }
          >
            <button
              type="button"
              className={
                styles.mobileMenuLogo
              }
              onClick={() =>
                navigateTo("/dashboard")
              }
            >
              <span>◆</span>

              <div>
                PropertySure
                <strong> AI</strong>
              </div>
            </button>

            <button
              type="button"
              className={
                styles.closeMenu
              }
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close navigation"
            >
              ×
            </button>
          </div>

          <div
            className={
              styles.mobileMenuSubtitle
            }
          >
            AI-Powered Property Due
            Diligence
          </div>

          <nav
            className={
              styles.mobileMenuNav
            }
          >
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                className={
                  styles.mobileNavItem
                }
                onClick={() =>
                  navigateTo(item.href)
                }
              >
                <span
                  className={
                    styles.navIcon
                  }
                >
                  <Icon
                    name={item.icon}
                    size={18}
                  />
                </span>

                <span>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div
            className={
              styles.mobileAccountLabel
            }
          >
            ACCOUNT
          </div>

          <button
            type="button"
            className={
              styles.mobileNavItem
            }
            onClick={() =>
              navigateTo("/account")
            }
          >
            <span
              className={
                styles.navIcon
              }
            >
              <Icon
                name="account"
                size={18}
              />
            </span>

            <span>Account</span>
          </button>

          <button
            type="button"
            className={
              styles.mobileNavItem
            }
            onClick={() =>
              navigateTo("/settings")
            }
          >
            <span
              className={
                styles.navIcon
              }
            >
              <Icon
                name="settings"
                size={18}
              />
            </span>

            <span>Settings</span>
          </button>

          <button
            type="button"
            className={`${styles.mobileNavItem} ${styles.logoutItem}`}
            onClick={signOut}
          >
            <span
              className={
                styles.navIcon
              }
            >
              <Icon
                name="logout"
                size={18}
              />
            </span>

            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section className={styles.main}>
        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header
          className={
            styles.topBar
          }
        >
          <div
            className={
              styles.topBarTitle
            }
          >
            Add Phone Number
          </div>

          <div
            className={
              styles.topBarRight
            }
          >
            <button
              type="button"
              className={
                styles.topNotification
              }
              onClick={() =>
                navigateTo(
                  "/account/notifications"
                )
              }
              aria-label="Notifications"
            >
              <Icon
                name="bell"
                size={18}
              />

              <span
                className={
                  styles.topNotificationDot
                }
              />
            </button>

            <button
              type="button"
              className={
                styles.topUser
              }
              onClick={() =>
                navigateTo("/account")
              }
            >
              <div
                className={
                  styles.topAvatar
                }
              >
                {user.initial}
              </div>

              <div
                className={
                  styles.topUserText
                }
              >
                <strong>
                  {user.fullName}
                </strong>

                <span>
                  {user.plan}
                </span>
              </div>

              <span
                className={
                  styles.topChevron
                }
              >
                ⌄
              </span>
            </button>
          </div>
        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div
          className={
            styles.content
          }
        >
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

            {/* BACK LINK BELOW TITLE */}

            <button
              type="button"
              className={
                styles.backLink
              }
              onClick={() =>
                navigateTo("/security")
              }
            >
              <Icon
                name="arrow"
                size={18}
              />

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
            {/* LEFT SIDE */}

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
                disabled={submitting}
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
      </section>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ===================================================== */}

      <nav
        className={
          styles.mobileBottomNav
        }
      >
        <button
          type="button"
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <Icon
            name="dashboard"
            size={20}
          />

          <span>
            Dashboard
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/verify")
          }
        >
          <Icon
            name="verify"
            size={20}
          />

          <span>Verify</span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/my-properties"
            )
          }
        >
          <Icon
            name="properties"
            size={20}
          />

          <span>
            Properties
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/reports")
          }
        >
          <Icon
            name="reports"
            size={20}
          />

          <span>Reports</span>
        </button>

        <button
          type="button"
          className={
            styles.activeBottom
          }
          onClick={() =>
            navigateTo("/account")
          }
        >
          <Icon
            name="account"
            size={20}
          />

          <span>Account</span>
        </button>
      </nav>
    </main>
  );
}