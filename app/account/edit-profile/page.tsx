"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";
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
  | "calendar"
  | "camera"
  | "upload"
  | "shield"
  | "lock"
  | "check"
  | "arrow"
  | "chevron"
  | "menu"
  | "close";

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
    calendar: "□",
    camera: "●",
    upload: "↑",
    shield: "♢",
    lock: "▣",
    check: "✓",
    arrow: "←",
    chevron: "⌄",
    menu: "☰",
    close: "×",
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
COUNTRIES
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
USER PROFILE TYPE
============================================================
*/

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  residentialAddress: string;
  city: string;
  state: string;
  country: string;
  occupation: string;
  company: string;
};

/*
============================================================
KYC
============================================================
*/

type KycStatus =
  | "Not Verified"
  | "Pending"
  | "Verified"
  | "Rejected";

const kycSteps = [
  {
    title: "Personal Information",
    description: "Provide your basic information",
  },
  {
    title: "Identity Document",
    description: "Select the type of ID to verify",
  },
  {
    title: "Document Upload",
    description: "Upload clear photos of your document",
  },
  {
    title: "Selfie Verification",
    description: "Take a selfie for face verification",
  },
  {
    title: "Review & Submit",
    description: "We'll review and verify your identity",
  },
];

/*
============================================================
HELPERS
============================================================
*/

function getInitials(name: string) {
  const cleaned = name.trim();

  if (!cleaned) {
    return "U";
  }

  const parts = cleaned.split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function formatPhoneForDisplay(phone: string) {
  if (!phone) {
    return "";
  }

  const normalized = phone.replace(/\s+/g, "");

  if (normalized.startsWith("+234")) {
    const local = normalized.slice(4);

    if (local.length === 10) {
      return `${local.slice(0, 3)} ${local.slice(
        3,
        6
      )} ${local.slice(6)}`;
    }
  }

  return normalized;
}

function normalizeCountryCode(value: string) {
  const lowerValue = value.toLowerCase();

  const match = countries.find(
    (country) =>
      lowerValue.includes(country.name.toLowerCase()) ||
      lowerValue.includes(country.code.toLowerCase())
  );

  return match?.code || "NG";
}

function formatDateForInput(value: unknown) {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  const parsed = new Date(stringValue);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

/*
============================================================
PAGE
============================================================
*/

export default function EditProfilePage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [userId, setUserId] = useState("");

  const [plan, setPlan] = useState("Free Plan");

  const [avatarUrl, setAvatarUrl] = useState("");

  const [kycStatus, setKycStatus] =
    useState<KycStatus>("Not Verified");

  const [kycStep, setKycStep] = useState(1);

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    residentialAddress: "",
    city: "",
    state: "",
    country: "Nigeria",
    occupation: "",
    company: "",
  });

  /*
  ============================================================
  LOAD AUTH USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!authUser) {
          router.replace("/signin");
          return;
        }

        if (!mounted) {
          return;
        }

        const metadata = authUser.user_metadata || {};

        const email = authUser.email || "";

        const metadataName =
          metadata.full_name ||
          metadata.name ||
          metadata.display_name ||
          "";

        const fallbackName = email
          ? email
              .split("@")[0]
              .replace(/[._-]+/g, " ")
              .replace(
                /\b\w/g,
                (letter: string) =>
                  letter.toUpperCase()
              )
          : "User";

        const fullName =
          String(metadataName).trim() ||
          fallbackName;

        const phone =
          authUser.phone ||
          metadata.phone ||
          "";

        const country =
          metadata.country ||
          "Nigeria";

        const kycMetadataStatus =
          metadata.kyc_status;

        const validKycStatuses: KycStatus[] = [
          "Not Verified",
          "Pending",
          "Verified",
          "Rejected",
        ];

        const resolvedKycStatus =
          validKycStatuses.includes(
            kycMetadataStatus
          )
            ? kycMetadataStatus
            : "Not Verified";

        const metadataKycStep = Number(
          metadata.kyc_step || 1
        );

        const safeKycStep = Math.min(
          Math.max(
            Number.isFinite(metadataKycStep)
              ? metadataKycStep
              : 1,
            1
          ),
          5
        );

        setUserId(authUser.id);

        setPlan(
          String(
            metadata.plan ||
              metadata.subscription_plan ||
              metadata.account_plan ||
              "Free Plan"
          )
        );

        setAvatarUrl(
          String(
            metadata.avatar_url ||
              metadata.profile_photo ||
              ""
          )
        );

        setKycStatus(resolvedKycStatus);

        setKycStep(safeKycStep);

        setForm({
          fullName,
          email,
          phone,
          dateOfBirth: formatDateForInput(
            metadata.date_of_birth ||
              metadata.dob
          ),
          residentialAddress: String(
            metadata.residential_address ||
              metadata.address ||
              ""
          ),
          city: String(metadata.city || ""),
          state: String(metadata.state || ""),
          country: String(country),
          occupation: String(
            metadata.occupation || ""
          ),
          company: String(
            metadata.company || ""
          ),
        });
      } catch (loadError) {
        console.error(
          "Edit profile loading error:",
          loadError
        );

        if (mounted) {
          setError(
            "Unable to load your profile."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

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
  CURRENT COUNTRY
  ============================================================
  */

  const selectedCountry = useMemo(() => {
    const code = normalizeCountryCode(
      form.country
    );

    return (
      countries.find(
        (country) =>
          country.code === code
      ) || countries[0]
    );
  }, [form.country]);

  /*
  ============================================================
  FORM UPDATE
  ============================================================
  */

  const updateField = <
    K extends keyof ProfileForm
  >(
    field: K,
    value: ProfileForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setMessage("");
  };

  /*
  ============================================================
  SAVE PROFILE
  ============================================================
  */

  const saveProfile = async () => {
    setError("");
    setMessage("");

    if (!form.fullName.trim()) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user: currentUser },
        error: currentUserError,
      } = await supabase.auth.getUser();

      if (currentUserError) {
        throw currentUserError;
      }

      if (!currentUser) {
        router.replace("/signin");
        return;
      }

      const existingMetadata =
        currentUser.user_metadata || {};

      const updatedMetadata = {
        ...existingMetadata,

        full_name:
          form.fullName.trim(),

        date_of_birth:
          form.dateOfBirth || null,

        residential_address:
          form.residentialAddress.trim(),

        city:
          form.city.trim(),

        state:
          form.state.trim(),

        country:
          form.country.trim(),

        occupation:
          form.occupation.trim(),

        company:
          form.company.trim(),
      };

      const emailChanged =
        form.email.trim() !==
        (currentUser.email || "");

      const { error: updateError } =
        await supabase.auth.updateUser({
          ...(emailChanged
            ? {
                email:
                  form.email.trim(),
              }
            : {}),

          data: updatedMetadata,
        });

      if (updateError) {
        throw updateError;
      }

      setMessage(
        emailChanged
          ? "Profile saved. Please check your email to confirm the new email address."
          : "Profile updated successfully."
      );
    } catch (saveError) {
      console.error(
        "Save profile error:",
        saveError
      );

      const errorMessage =
        saveError instanceof Error
          ? saveError.message
          : "Unable to save your profile.";

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  /*
  ============================================================
  PHOTO UPLOAD
  ============================================================
  */

  const openPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload a JPG, PNG, GIF, or WEBP image."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      setError(
        "Profile photo must be 2MB or smaller."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploadingPhoto(true);

      const fileExtension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const filePath =
        `${userId}/avatar-${Date.now()}.${fileExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(
            filePath,
            file,
            {
              cacheControl: "3600",
              upsert: true,
              contentType: file.type,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl =
        publicUrlData.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Unable to generate the profile photo URL."
        );
      }

      const {
        data: { user: currentUser },
        error: currentUserError,
      } = await supabase.auth.getUser();

      if (currentUserError) {
        throw currentUserError;
      }

      if (!currentUser) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const existingMetadata =
        currentUser.user_metadata || {};

      const { error: updateError } =
        await supabase.auth.updateUser({
          data: {
            ...existingMetadata,
            avatar_url: publicUrl,
          },
        });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);

      setMessage(
        "Profile photo updated successfully."
      );
    } catch (uploadError) {
      console.error(
        "Profile photo upload error:",
        uploadError
      );

      const errorMessage =
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload your profile photo.";

      setError(errorMessage);
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  };

  /*
  ============================================================
  KYC STATUS UI
  ============================================================
  */

  const kycStatusClass =
    kycStatus === "Verified"
      ? styles.kycVerified
      : kycStatus === "Pending"
      ? styles.kycPending
      : kycStatus === "Rejected"
      ? styles.kycRejected
      : styles.kycNotVerified;

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loadingGlow} />

        <div className={styles.loadingBrand}>
          <span
            className={styles.loadingLogo}
          >
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <p>
          Loading your profile...
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
          <div className={styles.brandName}>
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
              className={styles.navItem}
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
          className={`${styles.navItem} ${styles.activeNavItem}`}
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

          <span>
            Account
          </span>
        </button>

        <button
          type="button"
          className={
            styles.navItem
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

          <span>
            Settings
          </span>
        </button>

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
            Our support team is
            ready
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
            className={
              styles.avatarSmall
            }
          >
            {getInitials(
              form.fullName
            )}
          </div>

          <div
            className={
              styles.sidebarUserText
            }
          >
            <strong>
              {form.fullName ||
                "User"}
            </strong>

            <span>
              {plan}
            </span>
          </div>

          <span
            className={
              styles.sidebarChevron
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
              styles.notificationDot
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
            <div
              className={
                styles.mobileMenuLogo
              }
            >
              <span>
                ◆
              </span>

              <strong>
                PropertySure
                <em> AI</em>
              </strong>
            </div>

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
              <Icon
                name="close"
                size={28}
              />
            </button>
          </div>

          <div
            className={
              styles.mobileMenuSubtitle
            }
          >
            AI-Powered Property
            Due Diligence
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
                  navigateTo(
                    item.href
                  )
                }
              >
                <Icon
                  name={item.icon}
                  size={18}
                />

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
            className={`${styles.mobileNavItem} ${styles.mobileActive}`}
            onClick={() =>
              navigateTo("/account")
            }
          >
            <Icon
              name="account"
              size={18}
            />

            <span>
              Account
            </span>
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
            <Icon
              name="settings"
              size={18}
            />

            <span>
              Settings
            </span>
          </button>

          <button
            type="button"
            className={
              styles.mobileNavItem
            }
            onClick={signOut}
          >
            <span>
              ↪
            </span>

            <span>
              Sign Out
            </span>
          </button>
        </div>
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section
        className={
          styles.main
        }
      >
        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header
          className={
            styles.topBar
          }
        >
          <div />

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
                size={17}
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
                navigateTo(
                  "/account"
                )
              }
            >
              <div
                className={
                  styles.topAvatar
                }
              >
                {getInitials(
                  form.fullName
                )}
              </div>

              <div
                className={
                  styles.topUserText
                }
              >
                <strong>
                  {form.fullName ||
                    "User"}
                </strong>

                <span>
                  {plan}
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
              Edit Profile
            </h1>

            <p>
              Update your personal
              information and profile
              details.
            </p>

            <button
              type="button"
              className={
                styles.backLink
              }
              onClick={() =>
                navigateTo(
                  "/account"
                )
              }
            >
              <Icon
                name="arrow"
                size={18}
              />

              <span>
                Back to Account
              </span>
            </button>
          </div>

          <section
            className={
              styles.profileCard
            }
          >
            <div
              className={
                styles.photoSection
              }
            >
              <h2>
                Profile Photo
              </h2>

              <p
                className={
                  styles.photoDescription
                }
              >
                Click on the photo to
                upload or change it.
              </p>

              <button
                type="button"
                className={
                  styles.avatarButton
                }
                onClick={
                  openPhotoPicker
                }
                disabled={
                  uploadingPhoto
                }
                aria-label="Change profile photo"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className={
                      styles.profileImage
                    }
                  />
                ) : (
                  <span
                    className={
                      styles.avatarLarge
                    }
                  >
                    {getInitials(
                      form.fullName
                    )}
                  </span>
                )}

                <span
                  className={
                    styles.cameraButton
                  }
                >
                  <Icon
                    name="camera"
                    size={17}
                  />
                </span>
              </button>

              <button
                type="button"
                className={
                  styles.changePhotoButton
                }
                onClick={
                  openPhotoPicker
                }
                disabled={
                  uploadingPhoto
                }
              >
                <Icon
                  name="upload"
                  size={17}
                />

                <span>
                  {uploadingPhoto
                    ? "Uploading..."
                    : "Change Photo"}
                </span>
              </button>

              <p
                className={
                  styles.photoHint
                }
              >
                JPG, PNG or GIF. Max
                size 2MB.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className={
                  styles.hiddenFileInput
                }
                onChange={
                  handlePhotoChange
                }
              />
            </div>

            <div
              className={
                styles.personalSection
              }
            >
              <h2>
                Personal Information
              </h2>

              <div
                className={
                  styles.formGrid
                }
              >
                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="fullName">
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={
                      form.fullName
                    }
                    onChange={(event) =>
                      updateField(
                        "fullName",
                        event.target
                          .value
                      )
                    }
                    autoComplete="name"
                  />
                </div>

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={
                      form.email
                    }
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target
                          .value
                      )
                    }
                    autoComplete="email"
                  />
                </div>

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <button
                    type="button"
                    className={
                      styles.phoneField
                    }
                    onClick={() =>
                      navigateTo(
                        "/account/phone-number"
                      )
                    }
                  >
                    <span
                      className={
                        styles.phoneFlag
                      }
                    >
                      {
                        selectedCountry.flag
                      }
                    </span>

                    <span
                      className={
                        styles.phoneValue
                      }
                    >
                      {formatPhoneForDisplay(
                        form.phone
                      ) ||
                        "Add phone number"}
                    </span>

                    <span
                      className={
                        styles.phoneArrow
                      }
                    >
                      ›
                    </span>
                  </button>
                </div>

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="dateOfBirth">
                    Date of Birth
                  </label>

                  <div
                    className={
                      styles.inputWithIcon
                    }
                  >
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={
                        form.dateOfBirth
                      }
                      onChange={(event) =>
                        updateField(
                          "dateOfBirth",
                          event.target
                            .value
                        )
                      }
                    />

                    <Icon
                      name="calendar"
                      size={17}
                    />
                  </div>
                </div>

                <div
                  className={`${styles.field} ${styles.fullWidth}`}
                >
                  <label htmlFor="address">
                    Residential Address
                  </label>

                  <input
                    id="address"
                    type="text"
                    value={
                      form.residentialAddress
                    }
                    onChange={(event) =>
                      updateField(
                        "residentialAddress",
                        event.target
                          .value
                      )
                    }
                    autoComplete="street-address"
                  />
                </div>

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    value={
                      form.city
                    }
                    onChange={(event) =>
                      updateField(
                        "city",
                        event.target
                          .value
                      )
                    }
                    autoComplete="address-level2"
                  />
                </div>

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="state">
                    State
                  </label>

                  <div
                    className={
                      styles.selectField
                    }
                  >
                    <input
                      id="state"
                      type="text"
                      value={
                        form.state
                      }
                      onChange={(event) =>
                        updateField(
                          "state",
                          event.target
                            .value
                        )
                      }
                      autoComplete="address-level1"
                    />

                    <Icon
                      name="chevron"
                      size={17}
                    />
                  </div>
                </div>

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="country">
                    Country
                  </label>

                  <div
                    className={
                      styles.selectField
                    }
                  >
                    <select
                      id="country"
                      value={
                        normalizeCountryCode(
                          form.country
                        )
                      }
                      onChange={(event) => {
                        const selected =
                          countries.find(
                            (item) =>
                              item.code ===
                              event
                                .target
                                .value
                          );

                        updateField(
                          "country",
                          selected?.name ||
                            "Nigeria"
                        );
                      }}
                    >
                      {countries.map(
                        (item) => (
                          <option
                            key={
                              item.code
                            }
                            value={
                              item.code
                            }
                          >
                            {item.name}
                          </option>
                        )
                      )}
                    </select>

                    <Icon
                      name="chevron"
                      size={17}
                    />
                  </div>
                </div>

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="occupation">
                    Occupation
                  </label>

                  <input
                    id="occupation"
                    type="text"
                    value={
                      form.occupation
                    }
                    onChange={(event) =>
                      updateField(
                        "occupation",
                        event.target
                          .value
                      )
                    }
                  />
                </div>

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="company">
                    Company{" "}
                    <span>
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="company"
                    type="text"
                    value={
                      form.company
                    }
                    onChange={(event) =>
                      updateField(
                        "company",
                        event.target
                          .value
                      )
                    }
                  />
                </div>
              </div>

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
                  onClick={() =>
                    navigateTo(
                      "/account"
                    )
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={
                    styles.saveButton
                  }
                  onClick={
                    saveProfile
                  }
                  disabled={saving}
                >
                  <span>
                    {saving
                      ? "Saving..."
                      : "▣"}
                  </span>

                  <span>
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {error && (
            <div
              className={
                styles.errorMessage
              }
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className={
                styles.successMessage
              }
            >
              {message}
            </div>
          )}

          <section
            className={
              styles.kycCard
            }
          >
            <div
              className={
                styles.kycHeader
              }
            >
              <div>
                <h2>
                  Identity Verification
                  (KYC)
                </h2>

                <p>
                  Verify your identity to
                  secure your account and
                  increase trust when using
                  PropertySure AI.
                </p>
              </div>

              <span
                className={`${styles.kycStatus} ${kycStatusClass}`}
              >
                <Icon
                  name="shield"
                  size={15}
                />

                {kycStatus}
              </span>
            </div>

            <div
              className={
                styles.kycSteps
              }
            >
              {kycSteps.map(
                (step, index) => {
                  const stepNumber =
                    index + 1;

                  const completed =
                    stepNumber <
                    kycStep;

                  const active =
                    stepNumber ===
                    kycStep;

                  return (
                    <div
                      key={
                        step.title
                      }
                      className={
                        styles.kycStep
                      }
                    >
                      <div
                        className={
                          styles.stepTop
                        }
                      >
                        <div
                          className={`${styles.stepCircle} ${
                            completed
                              ? styles.stepCompleted
                              : active
                              ? styles.stepActive
                              : ""
                          }`}
                        >
                          {completed ? (
                            <Icon
                              name="check"
                              size={14}
                            />
                          ) : (
                            stepNumber
                          )}
                        </div>

                        {index <
                          kycSteps.length -
                            1 && (
                          <div
                            className={`${styles.stepLine} ${
                              completed
                                ? styles.stepLineCompleted
                                : ""
                            }`}
                          />
                        )}
                      </div>

                      <h3>
                        {
                          step.title
                        }
                      </h3>

                      <p>
                        {
                          step.description
                        }
                      </p>
                    </div>
                  );
                }
              )}
            </div>

            <div
              className={
                styles.kycInfoBox
              }
            >
              <div
                className={
                  styles.kycInfoIcon
                }
              >
                <Icon
                  name="shield"
                  size={25}
                />
              </div>

              <div
                className={
                  styles.kycInfoText
                }
              >
                <h3>
                  Why verify your
                  identity?
                </h3>

                <p>
                  Identity verification
                  helps us protect your
                  account, prevent fraud,
                  and build trust in the
                  PropertySure AI platform.
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.startVerification
                }
                onClick={() =>
                  navigateTo(
                    "/account/identity-verification"
                  )
                }
              >
                <Icon
                  name="shield"
                  size={17}
                />

                <span>
                  {kycStatus ===
                  "Verified"
                    ? "View Verification"
                    : "Start Verification"}
                </span>
              </button>
            </div>

            <div
              className={
                styles.kycPrivacy
              }
            >
              <Icon
                name="lock"
                size={17}
              />

              <span>
                Your information is
                encrypted and securely
                stored. We never share
                your data with third
                parties.
              </span>
            </div>
          </section>

          <div
            className={
              styles.pageFooter
            }
          >
            You can manage security,
            connected accounts, and
            notification preferences in
            the{" "}
            <button
              type="button"
              onClick={() =>
                navigateTo(
                  "/settings"
                )
              }
            >
              Settings
            </button>{" "}
            page.
          </div>
        </div>
      </section>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <nav
        className={
          styles.mobileBottomNav
        }
      >
        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
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
            navigateTo(
              "/verify"
            )
          }
        >
          <Icon
            name="verify"
            size={20}
          />

          <span>
            Verify
          </span>
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
            navigateTo(
              "/reports"
            )
          }
        >
          <Icon
            name="reports"
            size={20}
          />

          <span>
            Reports
          </span>
        </button>

        <button
          type="button"
          className={
            styles.activeBottom
          }
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >
          <Icon
            name="account"
            size={20}
          />

          <span>
            Account
          </span>
        </button>
      </nav>
    </main>
  );
}