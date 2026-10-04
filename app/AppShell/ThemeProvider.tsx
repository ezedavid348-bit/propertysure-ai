"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeOption =
  | "light"
  | "dark"
  | "system";

export type DensityOption =
  | "comfortable"
  | "compact"
  | "dense";

export type ThemeContextValue = {
  theme: ThemeOption;
  effectiveTheme: "light" | "dark";

  setTheme: (
    theme: ThemeOption
  ) => void;

  accentColor: string;

  setAccentColor: (
    color: string
  ) => void;

  density: DensityOption;

  setDensity: (
    density: DensityOption
  ) => void;

  reduceMotion: boolean;

  setReduceMotion: (
    value: boolean
  ) => void;
};

const DEFAULT_ACCENT = "#168eff";

const ThemeContext =
  createContext<
    ThemeContextValue | undefined
  >(undefined);

function getStoredValue<T>(
  key: string,
  allowed: readonly T[],
  fallback: T
): T {
  if (
    typeof window === "undefined"
  ) {
    return fallback;
  }

  try {
    const value =
      window.localStorage.getItem(
        key
      ) as T | null;

    if (
      value !== null &&
      allowed.includes(value)
    ) {
      return value;
    }
  } catch {
    // Ignore localStorage errors.
  }

  return fallback;
}

export default function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    theme,
    setThemeState,
  ] = useState<ThemeOption>(
    "light"
  );

  const [
    accentColor,
    setAccentColorState,
  ] = useState(
    DEFAULT_ACCENT
  );

  const [
    density,
    setDensityState,
  ] = useState<DensityOption>(
    "comfortable"
  );

  const [
    reduceMotion,
    setReduceMotionState,
  ] = useState(true);

  const [
    systemTheme,
    setSystemTheme,
  ] = useState<
    "light" | "dark"
  >("light");

  /*
  ============================================================
  LOAD SAVED SETTINGS
  ============================================================
  */

  useEffect(() => {
    const savedTheme =
      getStoredValue<ThemeOption>(
        "propertysure-theme",
        [
          "light",
          "dark",
          "system",
        ],
        "light"
      );

    const savedDensity =
      getStoredValue<DensityOption>(
        "propertysure-density",
        [
          "comfortable",
          "compact",
          "dense",
        ],
        "comfortable"
      );

    const savedAccent =
      window.localStorage.getItem(
        "propertysure-accent"
      );

    const savedReduceMotion =
      window.localStorage.getItem(
        "propertysure-reduce-motion"
      );

    setThemeState(
      savedTheme
    );

    setDensityState(
      savedDensity
    );

    if (savedAccent) {
      setAccentColorState(
        savedAccent
      );
    }

    if (
      savedReduceMotion ===
        "true" ||
      savedReduceMotion ===
        "false"
    ) {
      setReduceMotionState(
        savedReduceMotion ===
          "true"
      );
    }
  }, []);

  /*
  ============================================================
  SYSTEM THEME
  ============================================================
  */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const updateSystemTheme =
      () => {
        setSystemTheme(
          mediaQuery.matches
            ? "dark"
            : "light"
        );
      };

    updateSystemTheme();

    mediaQuery.addEventListener(
      "change",
      updateSystemTheme
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateSystemTheme
      );
    };
  }, []);

  /*
  ============================================================
  EFFECTIVE THEME
  ============================================================
  */

  const effectiveTheme =
    theme === "system"
      ? systemTheme
      : theme;

  /*
  ============================================================
  APPLY GLOBAL THEME
  ============================================================
  */

  useEffect(() => {
    if (
      typeof document ===
      "undefined"
    ) {
      return;
    }

    const root =
      document.documentElement;

    /*
    Main global theme attributes.
    */

    root.setAttribute(
      "data-propertysure-theme",
      effectiveTheme
    );

    root.setAttribute(
      "data-propertysure-theme-preference",
      theme
    );

    /*
    Density.
    */

    root.setAttribute(
      "data-propertysure-density",
      density
    );

    /*
    Reduce motion.
    */

    root.setAttribute(
      "data-propertysure-reduce-motion",
      reduceMotion
        ? "true"
        : "false"
    );

    /*
    Global accent.
    */

    root.style.setProperty(
      "--propertysure-accent",
      accentColor
    );

    /*
    Also expose common accent variables
    so existing components can use them.
    */

    root.style.setProperty(
      "--accent-color",
      accentColor
    );

    root.style.setProperty(
      "--primary-color",
      accentColor
    );

    /*
    Browser-level color scheme.
    */

    root.style.colorScheme =
      effectiveTheme === "dark"
        ? "dark"
        : "light";

    /*
    Reduce motion class.
    */

    if (reduceMotion) {
      root.classList.add(
        "propertysure-reduce-motion"
      );
    } else {
      root.classList.remove(
        "propertysure-reduce-motion"
      );
    }
  }, [
    effectiveTheme,
    theme,
    density,
    accentColor,
    reduceMotion,
  ]);

  /*
  ============================================================
  SAVE THEME
  ============================================================
  */

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "propertysure-theme",
        theme
      );
    } catch {
      // Ignore storage errors.
    }
  }, [theme]);

  /*
  ============================================================
  SAVE ACCENT
  ============================================================
  */

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "propertysure-accent",
        accentColor
      );
    } catch {
      // Ignore storage errors.
    }
  }, [accentColor]);

  /*
  ============================================================
  SAVE DENSITY
  ============================================================
  */

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "propertysure-density",
        density
      );
    } catch {
      // Ignore storage errors.
    }
  }, [density]);

  /*
  ============================================================
  SAVE REDUCE MOTION
  ============================================================
  */

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "propertysure-reduce-motion",
        String(
          reduceMotion
        )
      );
    } catch {
      // Ignore storage errors.
    }
  }, [reduceMotion]);

  /*
  ============================================================
  CONTEXT
  ============================================================
  */

  const value =
    useMemo<ThemeContextValue>(
      () => ({
        theme,

        effectiveTheme,

        setTheme: (
          nextTheme
        ) => {
          setThemeState(
            nextTheme
          );
        },

        accentColor,

        setAccentColor: (
          color
        ) => {
          setAccentColorState(
            color
          );
        },

        density,

        setDensity: (
          nextDensity
        ) => {
          setDensityState(
            nextDensity
          );
        },

        reduceMotion,

        setReduceMotion: (
          value
        ) => {
          setReduceMotionState(
            value
          );
        },
      }),
      [
        theme,
        effectiveTheme,
        accentColor,
        density,
        reduceMotion,
      ]
    );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/*
============================================================
USE THEME HOOK
============================================================
*/

export function useTheme() {
  const context =
    useContext(
      ThemeContext
    );

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider."
    );
  }

  return context;
}