"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./language-region.module.css";
import { supabase } from "../../lib/supabase";

/*
============================================================
PROPERTYSURE AI
LANGUAGE & REGION SETTINGS
============================================================
*/

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
  | "menu"
  | "globe"
  | "location"
  | "calendar"
  | "number"
  | "clock"
  | "check"
  | "chevron"
  | "language";

function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "language":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21" />
          <path d="M12 3c-2.4 2.5-3.6 5.5-3.6 9S9.6 18.5 12 21" />
        </svg>
      );

    case "globe":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c3 3 4.5 6 4.5 9S15 18 12 21" />
          <path d="M12 3c-3 3-4.5 6-4.5 9S9 18 12 21" />
        </svg>
      );

    case "location":
      return (
        <svg {...commonProps}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="4.5"
            width="18"
            height="16"
            rx="2"
          />
          <path d="M16 2.5v4M8 2.5v4M3 9h18" />
        </svg>
      );

    case "clock":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "check":
      return (
        <svg {...commonProps}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...commonProps}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );

    default:
      return (
        <span
          className={`${styles.icon} ${className}`}
          style={{ fontSize: `${size}px` }}
          aria-hidden="true"
        >
          {name === "dashboard" && "▦"}
          {name === "verify" && "⇧"}
          {name === "properties" && "⌂"}
          {name === "history" && "◷"}
          {name === "fraud" && "◈"}
          {name === "reports" && "▤"}
          {name === "account" && "◯"}
          {name === "settings" && "⚙"}
          {name === "bell" && "🔔"}
          {name === "menu" && "☰"}
          {name === "number" && "123"}
        </span>
      );
  }
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
LANGUAGE OPTIONS
============================================================
*/

type LanguageOption = {
  value: string;
  label: string;
  nativeLabel: string;
  locale: string;
};

const languageOptions: LanguageOption[] = [
  {
    value: "en",
    label: "English",
    nativeLabel: "English",
    locale: "en",
  },
  {
    value: "fr",
    label: "French",
    nativeLabel: "Français",
    locale: "fr",
  },
  {
    value: "es",
    label: "Spanish",
    nativeLabel: "Español",
    locale: "es",
  },
  {
    value: "pt",
    label: "Portuguese",
    nativeLabel: "Português",
    locale: "pt",
  },
  {
    value: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    locale: "ar",
  },
  {
    value: "de",
    label: "German",
    nativeLabel: "Deutsch",
    locale: "de",
  },
  {
    value: "it",
    label: "Italian",
    nativeLabel: "Italiano",
    locale: "it",
  },
  {
    value: "nl",
    label: "Dutch",
    nativeLabel: "Nederlands",
    locale: "nl",
  },
  {
    value: "zh",
    label: "Chinese",
    nativeLabel: "中文",
    locale: "zh",
  },
  {
    value: "ja",
    label: "Japanese",
    nativeLabel: "日本語",
    locale: "ja",
  },
  {
    value: "ko",
    label: "Korean",
    nativeLabel: "한국어",
    locale: "ko",
  },
  {
    value: "ru",
    label: "Russian",
    nativeLabel: "Русский",
    locale: "ru",
  },
  {
    value: "sw",
    label: "Swahili",
    nativeLabel: "Kiswahili",
    locale: "sw",
  },
];

/*
============================================================
REGION / COUNTRY OPTIONS
============================================================
*/

type RegionOption = {
  value: string;
  label: string;
  locale: string;
  timeZone: string;
  dateFormat: DateFormat;
  numberFormat: NumberFormat;
  weekStartsOn: WeekStart;
};

const regionOptions: RegionOption[] = [
  {
    value: "NG",
    label: "Nigeria",
    locale: "en-NG",
    timeZone: "Africa/Lagos",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "GH",
    label: "Ghana",
    locale: "en-GH",
    timeZone: "Africa/Accra",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Monday",
  },
  {
    value: "KE",
    label: "Kenya",
    locale: "en-KE",
    timeZone: "Africa/Nairobi",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Monday",
  },
  {
    value: "ZA",
    label: "South Africa",
    locale: "en-ZA",
    timeZone: "Africa/Johannesburg",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1 234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "UG",
    label: "Uganda",
    locale: "en-UG",
    timeZone: "Africa/Kampala",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Monday",
  },
  {
    value: "TZ",
    label: "Tanzania",
    locale: "sw-TZ",
    timeZone: "Africa/Dar_es_Salaam",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Monday",
  },
  {
    value: "RW",
    label: "Rwanda",
    locale: "en-RW",
    timeZone: "Africa/Kigali",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Monday",
  },
  {
    value: "EG",
    label: "Egypt",
    locale: "ar-EG",
    timeZone: "Africa/Cairo",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Saturday",
  },
  {
    value: "MA",
    label: "Morocco",
    locale: "fr-MA",
    timeZone: "Africa/Casablanca",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1 234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "US",
    label: "United States",
    locale: "en-US",
    timeZone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "CA",
    label: "Canada",
    locale: "en-CA",
    timeZone: "America/Toronto",
    dateFormat: "YYYY-MM-DD",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "MX",
    label: "Mexico",
    locale: "es-MX",
    timeZone: "America/Mexico_City",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "GB",
    label: "United Kingdom",
    locale: "en-GB",
    timeZone: "Europe/London",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Monday",
  },
  {
    value: "IE",
    label: "Ireland",
    locale: "en-IE",
    timeZone: "Europe/Dublin",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Monday",
  },
  {
    value: "FR",
    label: "France",
    locale: "fr-FR",
    timeZone: "Europe/Paris",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1 234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "DE",
    label: "Germany",
    locale: "de-DE",
    timeZone: "Europe/Berlin",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1.234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "ES",
    label: "Spain",
    locale: "es-ES",
    timeZone: "Europe/Madrid",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1.234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "IT",
    label: "Italy",
    locale: "it-IT",
    timeZone: "Europe/Rome",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1.234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "NL",
    label: "Netherlands",
    locale: "nl-NL",
    timeZone: "Europe/Amsterdam",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1.234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "CH",
    label: "Switzerland",
    locale: "de-CH",
    timeZone: "Europe/Zurich",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1'234.56",
    weekStartsOn: "Monday",
  },
  {
    value: "PT",
    label: "Portugal",
    locale: "pt-PT",
    timeZone: "Europe/Lisbon",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1 234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "SE",
    label: "Sweden",
    locale: "sv-SE",
    timeZone: "Europe/Stockholm",
    dateFormat: "YYYY-MM-DD",
    numberFormat: "1 234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "NO",
    label: "Norway",
    locale: "nb-NO",
    timeZone: "Europe/Oslo",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1 234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "DK",
    label: "Denmark",
    locale: "da-DK",
    timeZone: "Europe/Copenhagen",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1.234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "FI",
    label: "Finland",
    locale: "fi-FI",
    timeZone: "Europe/Helsinki",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1 234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "PL",
    label: "Poland",
    locale: "pl-PL",
    timeZone: "Europe/Warsaw",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1 234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "AT",
    label: "Austria",
    locale: "de-AT",
    timeZone: "Europe/Vienna",
    dateFormat: "DD.MM.YYYY",
    numberFormat: "1.234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "AE",
    label: "United Arab Emirates",
    locale: "ar-AE",
    timeZone: "Asia/Dubai",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "SA",
    label: "Saudi Arabia",
    locale: "ar-SA",
    timeZone: "Asia/Riyadh",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "QA",
    label: "Qatar",
    locale: "ar-QA",
    timeZone: "Asia/Qatar",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "IN",
    label: "India",
    locale: "en-IN",
    timeZone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,23,456.78",
    weekStartsOn: "Sunday",
  },
  {
    value: "PK",
    label: "Pakistan",
    locale: "en-PK",
    timeZone: "Asia/Karachi",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "BD",
    label: "Bangladesh",
    locale: "bn-BD",
    timeZone: "Asia/Dhaka",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "CN",
    label: "China",
    locale: "zh-CN",
    timeZone: "Asia/Shanghai",
    dateFormat: "YYYY-MM-DD",
    numberFormat: "1,234.56",
    weekStartsOn: "Monday",
  },
  {
    value: "JP",
    label: "Japan",
    locale: "ja-JP",
    timeZone: "Asia/Tokyo",
    dateFormat: "YYYY-MM-DD",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "KR",
    label: "South Korea",
    locale: "ko-KR",
    timeZone: "Asia/Seoul",
    dateFormat: "YYYY-MM-DD",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "SG",
    label: "Singapore",
    locale: "en-SG",
    timeZone: "Asia/Singapore",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "MY",
    label: "Malaysia",
    locale: "ms-MY",
    timeZone: "Asia/Kuala_Lumpur",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Sunday",
  },
  {
    value: "ID",
    label: "Indonesia",
    locale: "id-ID",
    timeZone: "Asia/Jakarta",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1.234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "AU",
    label: "Australia",
    locale: "en-AU",
    timeZone: "Australia/Sydney",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Monday",
  },
  {
    value: "NZ",
    label: "New Zealand",
    locale: "en-NZ",
    timeZone: "Pacific/Auckland",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    weekStartsOn: "Monday",
  },
  {
    value: "BR",
    label: "Brazil",
    locale: "pt-BR",
    timeZone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1.234,56",
    weekStartsOn: "Sunday",
  },
  {
    value: "AR",
    label: "Argentina",
    locale: "es-AR",
    timeZone: "America/Argentina/Buenos_Aires",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1.234,56",
    weekStartsOn: "Monday",
  },
  {
    value: "CL",
    label: "Chile",
    locale: "es-CL",
    timeZone: "America/Santiago",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1.234,56",
    weekStartsOn: "Monday",
  },
];

/*
============================================================
FORMAT TYPES
============================================================
*/

type DateFormat =
  | "DD/MM/YYYY"
  | "MM/DD/YYYY"
  | "YYYY-MM-DD"
  | "DD.MM.YYYY";

const dateFormatOptions: {
  value: DateFormat;
  label: string;
}[] = [
  {
    value: "DD/MM/YYYY",
    label: "DD/MM/YYYY",
  },
  {
    value: "MM/DD/YYYY",
    label: "MM/DD/YYYY",
  },
  {
    value: "YYYY-MM-DD",
    label: "YYYY-MM-DD",
  },
  {
    value: "DD.MM.YYYY",
    label: "DD.MM.YYYY",
  },
];

type NumberFormat =
  | "1,234.56"
  | "1.234,56"
  | "1 234,56"
  | "1'234.56"
  | "1,23,456.78";

const numberFormatOptions: {
  value: NumberFormat;
  label: string;
}[] = [
  {
    value: "1,234.56",
    label: "1,234.56",
  },
  {
    value: "1.234,56",
    label: "1.234,56",
  },
  {
    value: "1 234,56",
    label: "1 234,56",
  },
  {
    value: "1'234.56",
    label: "1'234.56",
  },
  {
    value: "1,23,456.78",
    label: "1,23,456.78",
  },
];

/*
============================================================
WEEK START
============================================================
*/

type WeekStart =
  | "Monday"
  | "Sunday";

const weekStartOptions: WeekStart[] = [
  "Monday",
  "Sunday",
];

/*
============================================================
TIME ZONE
============================================================
*/

const timeZoneOptions = Array.from(
  new Map(
    regionOptions.map((region) => [
      region.timeZone,
      {
        value: region.timeZone,
        label: region.timeZone,
      },
    ])
  ).values()
);

/*
============================================================
STORAGE
============================================================
*/

const STORAGE_KEY =
  "propertysure-language-region-settings";

type SavedSettings = {
  language: string;
  region: string;
  dateFormat: DateFormat;
  numberFormat: NumberFormat;
  timeZone: string;
  weekStartsOn: WeekStart;
};

/*
============================================================
SECTION
============================================================
*/

function SettingsSection({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.settingsSection}>
      <div className={styles.sectionLabel}>
        {label}
      </div>

      <div className={styles.settingsCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}

/*
============================================================
SELECT CONTROL
============================================================
*/

function SelectControl({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: IconName;
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.selectField}>
      <span className={styles.selectLabel}>
        <Icon name={icon} size={15} />
        <span>{label}</span>
      </span>

      <span className={styles.selectWrapper}>
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <Icon
          name="chevron"
          size={17}
          className={styles.selectChevron}
        />
      </span>
    </label>
  );
}

/*
============================================================
FORMAT DATE
============================================================
*/

function formatDate(
  date: Date,
  format: DateFormat,
  locale: string,
  timeZone: string
) {
  try {
    const parts = new Intl.DateTimeFormat(
      locale,
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone,
      }
    ).formatToParts(date);

    const day =
      parts.find(
        (part) => part.type === "day"
      )?.value || "";

    const month =
      parts.find(
        (part) => part.type === "month"
      )?.value || "";

    const year =
      parts.find(
        (part) => part.type === "year"
      )?.value || "";

    if (format === "MM/DD/YYYY") {
      return `${month}/${day}/${year}`;
    }

    if (format === "YYYY-MM-DD") {
      return `${year}-${month}-${day}`;
    }

    if (format === "DD.MM.YYYY") {
      return `${day}.${month}.${year}`;
    }

    return `${day}/${month}/${year}`;
  } catch {
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const year = date.getFullYear();

    if (format === "MM/DD/YYYY") {
      return `${month}/${day}/${year}`;
    }

    if (format === "YYYY-MM-DD") {
      return `${year}-${month}-${day}`;
    }

    if (format === "DD.MM.YYYY") {
      return `${day}.${month}.${year}`;
    }

    return `${day}/${month}/${year}`;
  }
}

/*
============================================================
FORMAT NUMBER
============================================================
*/

function formatNumber(
  value: number,
  format: NumberFormat
) {
  if (format === "1,23,456.78") {
    return new Intl.NumberFormat(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(value);
  }

  if (format === "1.234,56") {
    return new Intl.NumberFormat(
      "de-DE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(value);
  }

  if (format === "1 234,56") {
    return new Intl.NumberFormat(
      "fr-FR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(value);
  }

  if (format === "1'234.56") {
    const fixed = value.toFixed(2);
    const [integer, decimal] =
      fixed.split(".");

    const grouped =
      integer.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        "'"
      );

    return `${grouped}.${decimal}`;
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
}

/*
============================================================
FORMAT TIME
============================================================
*/

function formatTime(
  date: Date,
  timeZone: string,
  locale: string
) {
  try {
    return new Intl.DateTimeFormat(
      locale,
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone,
        hour12: false,
      }
    ).format(date);
  } catch {
    return date.toLocaleTimeString(
      locale,
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }
    );
  }
}

/*
============================================================
PREVIEW
============================================================
*/

function PreviewPanel({
  language,
  region,
  dateFormat,
  numberFormat,
  timeZone,
  weekStartsOn,
}: {
  language: LanguageOption;
  region: RegionOption;
  dateFormat: DateFormat;
  numberFormat: NumberFormat;
  timeZone: string;
  weekStartsOn: WeekStart;
}) {
  const [now, setNow] =
    useState<Date>(() => new Date());

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setNow(new Date());
      }, 1000);

    return () =>
      window.clearInterval(interval);
  }, []);

  const formattedDate =
    formatDate(
      now,
      dateFormat,
      language.locale,
      timeZone
    );

  const formattedNumber =
    formatNumber(
      1234567.89,
      numberFormat
    );

  const formattedTime =
    formatTime(
      now,
      timeZone,
      language.locale
    );

  return (
    <section className={styles.previewSection}>
      <div className={styles.sectionLabel}>
        PREVIEW
      </div>

      <div className={styles.previewCard}>
        <div className={styles.previewHeader}>
          <div className={styles.previewBrand}>
            <span
              className={styles.previewDiamond}
            >
              ◆
            </span>

            <strong>
              PropertySure
              <span> AI</span>
            </strong>
          </div>

          <span className={styles.previewBell}>
            🔔
          </span>
        </div>

        <div className={styles.previewBody}>
          <div className={styles.previewIntro}>
            <h3>Language & Region</h3>

            <p>
              Live preview of your selected
              settings.
            </p>
          </div>

          <div className={styles.previewGrid}>
            <div className={styles.previewItem}>
              <span>LANGUAGE</span>

              <strong>
                {language.label}
              </strong>
            </div>

            <div className={styles.previewItem}>
              <span>REGION</span>

              <strong>
                {region.label}
              </strong>
            </div>

            <div className={styles.previewItem}>
              <span>DATE</span>

              <strong>
                {formattedDate}
              </strong>
            </div>

            <div className={styles.previewItem}>
              <span>NUMBER</span>

              <strong>
                {formattedNumber}
              </strong>
            </div>

            <div className={styles.previewItem}>
              <span>LOCAL TIME</span>

              <strong>
                {formattedTime}
              </strong>
            </div>

            <div className={styles.previewItem}>
              <span>WEEK STARTS</span>

              <strong>
                {weekStartsOn}
              </strong>
            </div>
          </div>

          <div className={styles.previewExample}>
            <div
              className={
                styles.previewExampleHeader
              }
            >
              <span>
                <Icon
                  name="check"
                  size={14}
                />
              </span>

              <strong>
                Verification date
              </strong>
            </div>

            <div
              className={
                styles.previewExampleValue
              }
            >
              {formattedDate}
            </div>

            <p>
              This value updates automatically
              when you change the date format.
            </p>
          </div>

          <div className={styles.previewExample}>
            <div
              className={
                styles.previewExampleHeader
              }
            >
              <span>
                <Icon
                  name="number"
                  size={13}
                />
              </span>

              <strong>
                Example property value
              </strong>
            </div>

            <div
              className={
                styles.previewExampleValue
              }
            >
              {formattedNumber}
            </div>

            <p>
              This value updates automatically
              when you change the number format.
            </p>
          </div>

          <div className={styles.previewTime}>
            <div>
              <span>
                CURRENT LOCAL TIME
              </span>

              <strong>
                {formattedTime}
              </strong>
            </div>

            <div>
              <span>TIME ZONE</span>

              <strong>
                {timeZone}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.previewNotice}>
        <span className={styles.noticeIcon}>
          i
        </span>

        <p>
          Changes are applied to your
          PropertySure AI preferences.
          Other parts of the application
          can use these saved settings for
          localized dates, numbers and times.
        </p>
      </div>
    </section>
  );
}

/*
============================================================
PAGE
============================================================
*/

export default function LanguageRegionPage() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [savedMessage, setSavedMessage] =
    useState("");

  const [user, setUser] = useState({
    fullName: "User",
    initial: "U",
    plan: "Free Plan",
  });

  /*
  ============================================================
  SETTINGS STATE
  ============================================================
  */

  const [language, setLanguage] =
    useState("en");

  const [region, setRegion] =
    useState("NG");

  const [dateFormat, setDateFormat] =
    useState<DateFormat>("DD/MM/YYYY");

  const [numberFormat, setNumberFormat] =
    useState<NumberFormat>("1,234.56");

  const [timeZone, setTimeZone] =
    useState("Africa/Lagos");

  const [weekStartsOn, setWeekStartsOn] =
    useState<WeekStart>("Sunday");

  /*
  ============================================================
  REGION-AWARE DEFAULTS
  ============================================================
  */

  const applyRegionDefaults = (
    regionCode: string
  ) => {
    const selected =
      regionOptions.find(
        (item) =>
          item.value === regionCode
      );

    if (!selected) {
      return;
    }

    setTimeZone(
      selected.timeZone
    );

    setDateFormat(
      selected.dateFormat
    );

    setNumberFormat(
      selected.numberFormat
    );

    setWeekStartsOn(
      selected.weekStartsOn
    );

    const matchingLanguage =
      languageOptions.find(
        (item) =>
          item.locale
            .split("-")[0]
            .toLowerCase() ===
          selected.locale
            .split("-")[0]
            .toLowerCase()
      );

    if (matchingLanguage) {
      setLanguage(
        matchingLanguage.value
      );
    }
  };

  /*
  ============================================================
  LOAD USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        /*
        ------------------------------------------------------
        LOCAL STORAGE
        ------------------------------------------------------
        */

        if (
          typeof window !==
          "undefined"
        ) {
          const saved =
            window.localStorage.getItem(
              STORAGE_KEY
            );

          if (saved) {
            try {
              const parsed =
                JSON.parse(
                  saved
                ) as Partial<SavedSettings>;

              if (
                parsed.language
              ) {
                setLanguage(
                  parsed.language
                );
              }

              if (
                parsed.region
              ) {
                setRegion(
                  parsed.region
                );
              }

              if (
                parsed.dateFormat
              ) {
                setDateFormat(
                  parsed.dateFormat
                );
              }

              if (
                parsed.numberFormat
              ) {
                setNumberFormat(
                  parsed.numberFormat
                );
              }

              if (
                parsed.timeZone
              ) {
                setTimeZone(
                  parsed.timeZone
                );
              }

              if (
                parsed.weekStartsOn
              ) {
                setWeekStartsOn(
                  parsed.weekStartsOn
                );
              }
            } catch {
              console.warn(
                "Could not parse saved language and region settings."
              );
            }
          }
        }

        /*
        ------------------------------------------------------
        SUPABASE
        ------------------------------------------------------
        */

        const {
          data: {
            user: authUser,
          },
          error,
        } =
          await supabase.auth.getUser();

        if (error) {
          console.error(
            "Could not load authenticated user:",
            error
          );

          return;
        }

        if (!authUser) {
          router.replace(
            "/signin"
          );

          return;
        }

        if (!mounted) {
          return;
        }

        const metadata =
          authUser.user_metadata ||
          {};

        /*
        ------------------------------------------------------
        USER
        ------------------------------------------------------
        */

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
              .replace(
                /[._-]+/g,
                " "
              )
              .replace(
                /\b\w/g,
                (
                  letter: string
                ) =>
                  letter.toUpperCase()
              )
          : "User";

        const fullName =
          String(
            metadataName
          ).trim() ||
          fallbackName;

        const initial =
          fullName
            .charAt(0)
            .toUpperCase() ||
          "U";

        const plan =
          metadata.plan ||
          metadata.subscription_plan ||
          metadata.account_plan ||
          "Free Plan";

        setUser({
          fullName,
          initial,
          plan: String(plan),
        });

        /*
        ------------------------------------------------------
        SUPABASE SETTINGS
        ------------------------------------------------------
        */

        if (
          metadata.language
        ) {
          setLanguage(
            String(
              metadata.language
            )
          );
        }

        if (
          metadata.region
        ) {
          setRegion(
            String(
              metadata.region
            )
          );
        }

        if (
          metadata.date_format
        ) {
          setDateFormat(
            metadata.date_format as DateFormat
          );
        }

        if (
          metadata.number_format
        ) {
          setNumberFormat(
            metadata.number_format as NumberFormat
          );
        }

        if (
          metadata.time_zone
        ) {
          setTimeZone(
            String(
              metadata.time_zone
            )
          );
        }

        if (
          metadata.week_starts_on
        ) {
          const savedWeekStart =
            String(
              metadata.week_starts_on
            );

          if (
            savedWeekStart ===
              "Monday" ||
            savedWeekStart ===
              "Sunday"
          ) {
            setWeekStartsOn(
              savedWeekStart
            );
          }
        }
      } catch (error) {
        console.error(
          "Language and region loading error:",
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
  SELECTED OPTIONS
  ============================================================
  */

  const selectedLanguage =
    useMemo(
      () =>
        languageOptions.find(
          (item) =>
            item.value ===
            language
        ) ||
        languageOptions[0],
      [language]
    );

  const selectedRegion =
    useMemo(
      () =>
        regionOptions.find(
          (item) =>
            item.value ===
            region
        ) ||
        regionOptions[0],
      [region]
    );

  /*
  ============================================================
  LANGUAGE CHANGE
  ============================================================
  */

  const handleLanguageChange = (
    value: string
  ) => {
    setLanguage(value);
  };

  /*
  ============================================================
  REGION CHANGE
  ============================================================
  */

  const handleRegionChange = (
    value: string
  ) => {
    setRegion(value);

    applyRegionDefaults(value);
  };

  /*
  ============================================================
  SAVE SETTINGS
  ============================================================
  */

  useEffect(() => {
    if (loadingUser) {
      return;
    }

    const settings: SavedSettings = {
      language,
      region,
      dateFormat,
      numberFormat,
      timeZone,
      weekStartsOn,
    };

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error(
        "Could not save local language settings:",
        error
      );
    }

    const timer =
      window.setTimeout(
        async () => {
          setSaving(true);
          setSavedMessage("");

          try {
            const {
              error,
            } =
              await supabase.auth.updateUser(
                {
                  data: {
                    language,
                    region,
                    date_format:
                      dateFormat,
                    number_format:
                      numberFormat,
                    time_zone:
                      timeZone,
                    week_starts_on:
                      weekStartsOn,
                  },
                }
              );

            if (error) {
              console.error(
                "Could not save language and region settings:",
                error
              );

              setSavedMessage(
                "Saved on this device"
              );
            } else {
              setSavedMessage(
                "Changes saved"
              );
            }
          } catch (error) {
            console.error(
              "Language settings save error:",
              error
            );

            setSavedMessage(
              "Saved on this device"
            );
          } finally {
            setSaving(false);

            window.setTimeout(
              () => {
                setSavedMessage("");
              },
              2500
            );
          }
        },
        600
      );

    return () =>
      window.clearTimeout(timer);
  }, [
    language,
    region,
    dateFormat,
    numberFormat,
    timeZone,
    weekStartsOn,
    loadingUser,
  ]);

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const navigateTo = (
    path: string
  ) => {
    setMenuOpen(false);
    router.push(path);
  };

  const backToSettings = () => {
    navigateTo("/settings");
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
    } catch (error) {
      console.error(
        "Sign out error:",
        error
      );
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
              styles.loadingDiamond
            }
          >
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <p>
          Loading language settings...
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
      {/* ====================================================
          DESKTOP TOP BAR
      ==================================================== */}

      <header className={styles.topBar}>
        <button
          type="button"
          className={styles.topBrand}
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <span
            className={
              styles.topDiamond
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
          className={styles.topBell}
          onClick={() =>
            navigateTo(
              "/settings/notifications"
            )
          }
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            size={20}
          />

          <span
            className={
              styles.topBellDot
            }
          />
        </button>
      </header>

      {/* ====================================================
          MOBILE HEADER
      ==================================================== */}

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
            size={24}
          />
        </button>

        <button
          type="button"
          className={
            styles.mobileLogo
          }
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >
          <span
            className={
              styles.mobileDiamond
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
              "/settings/notifications"
            )
          }
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            size={19}
          />

          <span
            className={
              styles.mobileBellDot
            }
          />
        </button>
      </header>

      {/* ====================================================
          MOBILE MENU
      ==================================================== */}

      {menuOpen && (
        <div
          className={
            styles.mobileMenu
          }
        >
          <div
            className={
              styles.mobileMenuTop
            }
          >
            <button
              type="button"
              className={
                styles.mobileMenuLogo
              }
              onClick={() =>
                navigateTo(
                  "/dashboard"
                )
              }
            >
              <span>◆</span>

              <strong>
                PropertySure
                <b> AI</b>
              </strong>
            </button>

            <button
              type="button"
              className={
                styles.closeButton
              }
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <p
            className={
              styles.mobileMenuSubtitle
            }
          >
            AI-Powered Property
            <br />
            Due Diligence
          </p>

          <nav
            className={
              styles.mobileMenuNav
            }
          >
            {navItems.map(
              (item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() =>
                    navigateTo(
                      item.href
                    )
                  }
                >
                  <Icon
                    name={item.icon}
                    size={19}
                  />

                  <span>
                    {item.label}
                  </span>
                </button>
              )
            )}
          </nav>

          <div
            className={
              styles.mobileMenuLabel
            }
          >
            ACCOUNT
          </div>

          <button
            type="button"
            className={
              styles.mobileMenuItem
            }
            onClick={() =>
              navigateTo(
                "/account"
              )
            }
          >
            <Icon
              name="account"
              size={19}
            />

            <span>
              Account
            </span>
          </button>

          <button
            type="button"
            className={
              styles.mobileMenuItem
            }
            onClick={() =>
              navigateTo(
                "/settings"
              )
            }
          >
            <Icon
              name="settings"
              size={19}
            />

            <span>
              Settings
            </span>
          </button>

          <button
            type="button"
            className={`${styles.mobileMenuItem} ${styles.logoutItem}`}
            onClick={signOut}
          >
            <span>↪</span>

            <span>
              Sign Out
            </span>
          </button>
        </div>
      )}

      {/* ====================================================
          MAIN
      ==================================================== */}

      <section className={styles.main}>
        <header
          className={
            styles.pageHeader
          }
        >
          <h1>
            Language & Region
          </h1>

          <p>
            Choose your preferred
            language, region, and
            formats.
          </p>

          <button
            type="button"
            className={
              styles.backButton
            }
            onClick={
              backToSettings
            }
          >
            ‹ Back to Settings
          </button>
        </header>

        <div
          className={
            styles.contentLayout
          }
        >
          {/* ==================================================
              LEFT SETTINGS
          ================================================== */}

          <div
            className={
              styles.settingsColumn
            }
          >
            <SettingsSection
              label="LANGUAGE"
              title="Language"
              description="Select the language you prefer to use."
            >
              <div
                className={
                  styles.sectionContent
                }
              >
                <SelectControl
                  icon="language"
                  label="Language"
                  value={
                    language
                  }
                  options={
                    languageOptions.map(
                      (item) => ({
                        value:
                          item.value,
                        label:
                          `${item.label} · ${item.nativeLabel}`,
                      })
                    )
                  }
                  onChange={
                    handleLanguageChange
                  }
                />
              </div>
            </SettingsSection>

            <SettingsSection
              label="REGION & FORMAT"
              title="Region & Format"
              description="Set your country or region, date format, and number format."
            >
              <div
                className={
                  styles.sectionContent
                }
              >
                <SelectControl
                  icon="location"
                  label="Region"
                  value={
                    region
                  }
                  options={
                    regionOptions
                  }
                  onChange={
                    handleRegionChange
                  }
                />

                <div
                  className={
                    styles.divider
                  }
                />

                <div
                  className={
                    styles.twoColumn
                  }
                >
                  <SelectControl
                    icon="calendar"
                    label="Date Format"
                    value={
                      dateFormat
                    }
                    options={
                      dateFormatOptions
                    }
                    onChange={(
                      value
                    ) =>
                      setDateFormat(
                        value as DateFormat
                      )
                    }
                  />

                  <SelectControl
                    icon="number"
                    label="Number Format"
                    value={
                      numberFormat
                    }
                    options={
                      numberFormatOptions
                    }
                    onChange={(
                      value
                    ) =>
                      setNumberFormat(
                        value as NumberFormat
                      )
                    }
                  />
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              label="TIME & CALENDAR"
              title="Time & Calendar"
              description="Set your time zone and preferred week start day."
            >
              <div
                className={
                  styles.sectionContent
                }
              >
                <SelectControl
                  icon="clock"
                  label="Time Zone"
                  value={
                    timeZone
                  }
                  options={
                    timeZoneOptions
                  }
                  onChange={
                    setTimeZone
                  }
                />

                <div
                  className={
                    styles.divider
                  }
                />

                <SelectControl
                  icon="calendar"
                  label="Week Starts On"
                  value={
                    weekStartsOn
                  }
                  options={
                    weekStartOptions.map(
                      (day) => ({
                        value: day,
                        label: day,
                      })
                    )
                  }
                  onChange={(
                    value
                  ) =>
                    setWeekStartsOn(
                      value as WeekStart
                    )
                  }
                />
              </div>
            </SettingsSection>

            {(saving ||
              savedMessage) && (
              <div
                className={
                  styles.saveStatus
                }
              >
                <span
                  className={
                    saving
                      ? styles.saveSpinner
                      : styles.saveCheck
                  }
                >
                  {saving
                    ? ""
                    : "✓"}
                </span>

                <span>
                  {saving
                    ? "Saving changes..."
                    : savedMessage}
                </span>
              </div>
            )}
          </div>

          {/* ==================================================
              RIGHT PREVIEW
          ================================================== */}

          <PreviewPanel
            language={
              selectedLanguage
            }
            region={
              selectedRegion
            }
            dateFormat={
              dateFormat
            }
            numberFormat={
              numberFormat
            }
            timeZone={
              timeZone
            }
            weekStartsOn={
              weekStartsOn
            }
          />
        </div>
      </section>

      {/* ====================================================
          MOBILE BOTTOM NAV
      ==================================================== */}

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
          <span>Dashboard</span>
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
          <span>Properties</span>
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
          <span>Reports</span>
        </button>

        <button
          type="button"
          className={
            styles.bottomActive
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
          <span>Account</span>
        </button>
      </nav>
    </main>
  );
}