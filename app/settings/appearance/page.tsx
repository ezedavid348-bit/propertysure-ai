"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import AppShell from "../../AppShell/AppShell";
import LoadingScreen from "../../AppShell/LoadingScreen";

import styles from "./appearance.module.css";

import { supabase } from "../../lib/supabase";

import {
  useTheme,
  type ThemeOption,
  type DensityOption,
} from "../../AppShell/ThemeProvider";

/*
============================================================
PROPERTYSURE AI
APPEARANCE SETTINGS PAGE
============================================================
*/

/*
============================================================
ICONS
============================================================
*/

type IconName =
  | "sun"
  | "moon"
  | "system"
  | "comfortable"
  | "compact"
  | "dense"
  | "check"
  | "bell";

function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const icons: Record<IconName, string> = {
    sun: "☀",
    moon: "●",
    system: "▣",
    comfortable: "☷",
    compact: "☷",
    dense: "☷",
    check: "✓",
    bell: "🔔",
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
THEME OPTIONS
============================================================
*/

const themeOptions: {
  value: ThemeOption;
  title: string;
  description: string;
  icon: IconName;
}[] = [
  {
    value: "light",
    title: "Light",
    description: "Clean and bright",
    icon: "sun",
  },
  {
    value: "dark",
    title: "Dark",
    description: "Easy on the eyes",
    icon: "moon",
  },
  {
    value: "system",
    title: "System",
    description: "Follow system",
    icon: "system",
  },
];

/*
============================================================
ACCENT COLORS
============================================================
*/

const accentColors = [
  "#168eff",
  "#20a35a",
  "#7635d3",
  "#efa000",
  "#ef5260",
  "#28a9b5",
];

/*
============================================================
DENSITY OPTIONS
============================================================
*/

const densityOptions: {
  value: DensityOption;
  title: string;
  description: string;
  icon: IconName;
}[] = [
  {
    value: "comfortable",
    title: "Comfortable",
    description: "More spacing",
    icon: "comfortable",
  },
  {
    value: "compact",
    title: "Compact",
    description: "Balanced",
    icon: "compact",
  },
  {
    value: "dense",
    title: "Dense",
    description: "More content",
    icon: "dense",
  },
];

/*
============================================================
DATABASE TYPES
============================================================
*/

type DatabaseRecord = Record<string, unknown>;

type PreviewActivityData = {
  id: string;

  title: string;

  description: string;

  time: string;

  status:
    | "success"
    | "warning"
    | "neutral";
};

/*
============================================================
HELPERS
============================================================
*/

function getString(
  record: DatabaseRecord,
  keys: string[]
): string {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "";
}

function getDateValue(
  record: DatabaseRecord
): number {
  const raw = getString(record, [
    "created_at",
    "updated_at",
    "submitted_at",
    "verified_at",
    "date_created",
    "createdAt",
    "updatedAt",
  ]);

  if (!raw) {
    return 0;
  }

  const timestamp =
    new Date(raw).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

function formatRelativeTime(
  record: DatabaseRecord
): string {
  const timestamp =
    getDateValue(record);

  if (!timestamp) {
    return "Recent";
  }

  const difference = Math.max(
    0,
    Date.now() - timestamp
  );

  const minutes = Math.floor(
    difference / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.floor(
    days / 7
  );

  if (weeks < 5) {
    return `${weeks}w ago`;
  }

  return new Date(
    timestamp
  ).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );
}

function getActivityTitle(
  record: DatabaseRecord
): string {
  const address = getString(
    record,
    [
      "property_address",
      "propertyAddress",
      "address",
      "property_location",
      "propertyLocation",
      "location",
      "property_name",
      "propertyName",
      "title",
      "name",
    ]
  );

  if (address) {
    return address;
  }

  return "Property verification";
}

function getActivityStatus(
  record: DatabaseRecord
): {
  description: string;
  status:
    | "success"
    | "warning"
    | "neutral";
} {
  const rawStatus =
    getString(record, [
      "status",
      "verification_status",
      "verificationStatus",
      "report_status",
      "reportStatus",
    ]).toLowerCase();

  if (
    rawStatus.includes("flag") ||
    rawStatus.includes("fraud") ||
    rawStatus.includes("attention") ||
    rawStatus.includes("risk")
  ) {
    return {
      description: "Attention required",
      status: "warning",
    };
  }

  if (
    rawStatus.includes("verified") ||
    rawStatus.includes("complete") ||
    rawStatus.includes("approved")
  ) {
    return {
      description:
        "Verification completed",
      status: "success",
    };
  }

  if (
    rawStatus.includes("pending") ||
    rawStatus.includes("review")
  ) {
    return {
      description:
        "Verification pending",
      status: "neutral",
    };
  }

  return {
    description:
      "Verification submitted",
    status: "neutral",
  };
}

/*
============================================================
SELECTION CARD
============================================================
*/

function SelectionCard({
  selected,
  onClick,
  icon,
  title,
  description,
  accent,
}: {
  selected: boolean;

  onClick: () => void;

  icon: IconName;

  title: string;

  description: string;

  accent: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.selectionCard} ${
        selected
          ? styles.selectionCardSelected
          : ""
      }`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span
        className={`${styles.radio} ${
          selected
            ? styles.radioSelected
            : ""
        }`}
        style={
          selected
            ? {
                borderColor: accent,
              }
            : undefined
        }
      >
        {selected && (
          <span
            className={
              styles.radioDot
            }
            style={{
              background: accent,
            }}
          />
        )}
      </span>

      <span
        className={
          styles.selectionIcon
        }
        style={{
          color: accent,
        }}
      >
        <Icon
          name={icon}
          size={27}
        />
      </span>

      <strong>{title}</strong>

      <small>{description}</small>
    </button>
  );
}

/*
============================================================
SECTION
============================================================
*/

function AppearanceSection({
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
    <section
      className={
        styles.appearanceSection
      }
    >
      <div
        className={
          styles.sectionLabel
        }
      >
        {label}
      </div>

      <div
        className={
          styles.settingsCard
        }
      >
        <div
          className={
            styles.sectionHeader
          }
        >
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
PREVIEW ACTIVITY
============================================================
*/

function PreviewActivity({
  accent,
  title,
  description,
  time,
  status,
}: {
  accent: string;

  title: string;

  description: string;

  time: string;

  status:
    | "success"
    | "warning"
    | "neutral";
}) {
  const icon =
    status === "warning"
      ? "!"
      : status === "success"
      ? "✓"
      : "•";

  return (
    <div
      className={
        styles.previewActivity
      }
    >
      <span
        className={
          styles.previewActivityIcon
        }
        style={{
          color: accent,
          background: `${accent}18`,
        }}
      >
        {icon}
      </span>

      <div>
        <strong>{title}</strong>

        <span>{description}</span>
      </div>

      <small>{time}</small>
    </div>
  );
}

/*
============================================================
PREVIEW PANEL
============================================================
*/

function PreviewPanel({
  effectiveTheme,
  accent,
  density,
  stats,
  activities,
}: {
  effectiveTheme:
    | "light"
    | "dark";

  accent: string;

  density: DensityOption;

  stats: {
    verifications: number;

    properties: number;

    alerts: number;
  };

  activities: PreviewActivityData[];
}) {
  return (
    <section
      className={`${styles.previewSection} ${
        effectiveTheme === "dark"
          ? styles.previewDark
          : ""
      } ${
        styles[
          `previewDensity${density}`
        ]
      }`}
    >
      <div
        className={
          styles.sectionLabel
        }
      >
        PREVIEW
      </div>

      <div
        className={
          styles.previewCard
        }
      >
        <div
          className={
            styles.previewHeader
          }
        >
          <div
            className={
              styles.previewBrand
            }
          >
            <span
              className={
                styles.previewDiamond
              }
              style={{
                color: accent,
              }}
            >
              ◆
            </span>

            <strong>
              PropertySure
              <span
                style={{
                  color: accent,
                }}
              >
                {" "}
                AI
              </span>
            </strong>
          </div>

          <span
            className={
              styles.previewBell
            }
          >
            🔔
          </span>
        </div>

        <div
          className={
            styles.previewBody
          }
        >
          <h3>Dashboard</h3>

          <p>
            Welcome back! Here's
            what's happening.
          </p>

          <div
            className={
              styles.previewStats
            }
          >
            <div>
              <span>
                Verifications
              </span>

              <strong>
                {
                  stats.verifications
                }
              </strong>

              <small
                className={
                  styles.previewPositive
                }
              >
                Live data
              </small>
            </div>

            <div>
              <span>
                Properties
              </span>

              <strong>
                {stats.properties}
              </strong>

              <small
                className={
                  styles.previewPositive
                }
              >
                Live data
              </small>
            </div>

            <div>
              <span>Alerts</span>

              <strong>
                {stats.alerts}
              </strong>

              <small
                className={
                  stats.alerts > 0
                    ? styles.previewNegative
                    : styles.previewPositive
                }
              >
                {stats.alerts > 0
                  ? "Needs attention"
                  : "No alerts"}
              </small>
            </div>
          </div>

          <h4>Recent Activity</h4>

          {activities.length > 0 ? (
            activities.map(
              (activity) => (
                <PreviewActivity
                  key={activity.id}
                  accent={
                    activity.status ===
                    "warning"
                      ? "#efa000"
                      : activity.status ===
                        "success"
                      ? accent
                      : "#8192ac"
                  }
                  title={
                    activity.title
                  }
                  description={
                    activity.description
                  }
                  time={
                    activity.time
                  }
                  status={
                    activity.status
                  }
                />
              )
            )
          ) : (
            <div
              className={
                styles.previewEmpty
              }
            >
              <span
                style={{
                  color: accent,
                }}
              >
                ✓
              </span>

              <div>
                <strong>
                  No recent activity
                </strong>

                <span>
                  Your recent
                  verification
                  activity will
                  appear here.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/*
============================================================
PAGE
============================================================
*/

export default function AppearancePage() {
  const router = useRouter();

  /*
  ============================================================
  CENTRAL THEME PROVIDER
  ============================================================
  */

  const {
    theme,
    effectiveTheme,
    setTheme,
    accentColor,
    setAccentColor,
    density,
    setDensity,
    reduceMotion,
    setReduceMotion,
  } = useTheme();

  /*
  ============================================================
  USER LOADING
  ============================================================
  */

  const [
    loadingUser,
    setLoadingUser,
  ] = useState(true);

  /*
  ============================================================
  PREVIEW DATA
  ============================================================
  */

  const [
    verificationCount,
    setVerificationCount,
  ] = useState(0);

  const [
    propertyCount,
    setPropertyCount,
  ] = useState(0);

  const [
    alertCount,
    setAlertCount,
  ] = useState(0);

  const [
    activities,
    setActivities,
  ] = useState<
    PreviewActivityData[]
  >([]);

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
          router.replace("/signin");

          return;
        }
      } catch (error) {
        console.error(
          "Appearance user loading error:",
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
  LOAD PREVIEW DATA
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadPreviewData =
      async () => {
        try {
          /*
          VERIFICATIONS
          */

          const {
            count: verificationTotal,
            error: verificationCountError,
          } =
            await supabase
              .from(
                "verification_reports"
              )
              .select("id", {
                count: "exact",
                head: true,
              });

          if (
            verificationCountError
          ) {
            console.error(
              "Verification count error:",
              verificationCountError
            );
          }

          /*
          FLAGGED REPORTS
          */

          const {
            count: flaggedCount,
            error: flaggedError,
          } =
            await supabase
              .from(
                "verification_reports"
              )
              .select("id", {
                count: "exact",
                head: true,
              })
              .eq(
                "status",
                "Flagged"
              );

          if (flaggedError) {
            console.error(
              "Flagged verification count error:",
              flaggedError
            );
          }

          /*
          PROPERTIES
          */

          const {
            count: propertiesTotal,
            error: propertiesError,
          } =
            await supabase
              .from("properties")
              .select("id", {
                count: "exact",
                head: true,
              });

          if (propertiesError) {
            console.warn(
              "Properties table could not be read. Falling back to verification data.",
              propertiesError
            );
          }

          /*
          RECENT REPORTS
          */

          const {
            data: reports,
            error: reportsError,
          } =
            await supabase
              .from(
                "verification_reports"
              )
              .select("*")
              .limit(20);

          if (reportsError) {
            console.error(
              "Recent verification activity error:",
              reportsError
            );
          }

          const records =
            Array.isArray(reports)
              ? (reports as DatabaseRecord[])
              : [];

          const sortedRecords =
            [...records].sort(
              (a, b) =>
                getDateValue(b) -
                getDateValue(a)
            );

          const mappedActivities =
            sortedRecords
              .slice(0, 3)
              .map(
                (
                  record,
                  index
                ) => {
                  const status =
                    getActivityStatus(
                      record
                    );

                  return {
                    id:
                      getString(
                        record,
                        [
                          "id",
                          "report_id",
                          "verification_id",
                        ]
                      ) ||
                      `activity-${index}`,

                    title:
                      getActivityTitle(
                        record
                      ),

                    description:
                      status.description,

                    time:
                      formatRelativeTime(
                        record
                      ),

                    status:
                      status.status,
                  };
                }
              );

          /*
          PROPERTY FALLBACK
          */

          let finalPropertyCount =
            propertiesTotal ?? 0;

          if (
            propertiesError ||
            propertiesTotal === null
          ) {
            const uniquePropertyNames =
              new Set<string>();

            records.forEach(
              (record) => {
                const title =
                  getActivityTitle(
                    record
                  );

                if (
                  title !==
                    "Property verification" &&
                  title
                ) {
                  uniquePropertyNames.add(
                    title
                  );
                }
              }
            );

            finalPropertyCount =
              uniquePropertyNames.size;
          }

          if (!mounted) {
            return;
          }

          setVerificationCount(
            verificationTotal ?? 0
          );

          setPropertyCount(
            finalPropertyCount
          );

          setAlertCount(
            flaggedCount ?? 0
          );

          setActivities(
            mappedActivities
          );
        } catch (error) {
          console.error(
            "Preview data loading error:",
            error
          );
        }
      };

    loadPreviewData();

    return () => {
      mounted = false;
    };
  }, []);

  /*
  ============================================================
  BACK TO SETTINGS
  ============================================================
  */

  const backToSettings = () => {
    router.push("/settings");
  };

  /*
  ============================================================
  PAGE STYLE
  ============================================================
  */

  const pageStyle = useMemo(
    () =>
      ({
        "--accent-color":
          accentColor,
      } as CSSProperties),
    [accentColor]
  );

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
  PAGE
  ============================================================
  */

  return (
    <AppShell
      activePath="/settings"
      headerPath="/settings"
    >
      <main
        className={`${styles.page} ${
          effectiveTheme === "dark"
            ? styles.themeDark
            : styles.themeLight
        } ${
          styles[
            `density${density}`
          ]
        }`}
        style={pageStyle}
      >
        <section
          className={styles.main}
        >
          <header
            className={
              styles.pageHeader
            }
          >
            <h1>Appearance</h1>

            <p>
              Customize how
              PropertySure AI
              looks and feels.
            </p>

            {/* EXACT GENERAL-STYLE BACK BUTTON */}

            <button
              type="button"
              className={
                styles.backButton
              }
              onClick={
                backToSettings
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
                Back to Settings
              </span>
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
              {/* THEME */}

              <AppearanceSection
                label="THEME"
                title="Theme"
                description="Choose how the application looks."
              >
                <div
                  className={
                    styles.selectionGrid
                  }
                >
                  {themeOptions.map(
                    (option) => (
                      <SelectionCard
                        key={
                          option.value
                        }
                        selected={
                          theme ===
                          option.value
                        }
                        onClick={() =>
                          setTheme(
                            option.value
                          )
                        }
                        icon={
                          option.icon
                        }
                        title={
                          option.title
                        }
                        description={
                          option.description
                        }
                        accent={
                          accentColor
                        }
                      />
                    )
                  )}
                </div>
              </AppearanceSection>

              {/* ACCENT COLOR */}

              <section
                className={
                  styles.appearanceSection
                }
              >
                <div
                  className={
                    styles.sectionLabel
                  }
                >
                  ACCENT COLOR
                </div>

                <div
                  className={
                    styles.settingsCard
                  }
                >
                  <div
                    className={
                      styles.sectionHeader
                    }
                  >
                    <div>
                      <h2>
                        Accent Color
                      </h2>

                      <p>
                        Choose your
                        preferred
                        accent color.
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      styles.colorRow
                    }
                  >
                    {accentColors.map(
                      (color) => (
                        <button
                          key={color}
                          type="button"
                          className={`${styles.colorButton} ${
                            accentColor ===
                            color
                              ? styles.colorButtonSelected
                              : ""
                          }`}
                          style={{
                            background:
                              color,
                          }}
                          onClick={() =>
                            setAccentColor(
                              color
                            )
                          }
                          aria-label={`Select accent color ${color}`}
                          aria-pressed={
                            accentColor ===
                            color
                          }
                        >
                          {accentColor ===
                            color && (
                            <span>
                              ✓
                            </span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </section>

              {/* DISPLAY DENSITY */}

              <AppearanceSection
                label="DISPLAY DENSITY"
                title="Display Density"
                description="Adjust the spacing and layout density."
              >
                <div
                  className={
                    styles.selectionGrid
                  }
                >
                  {densityOptions.map(
                    (option) => (
                      <SelectionCard
                        key={
                          option.value
                        }
                        selected={
                          density ===
                          option.value
                        }
                        onClick={() =>
                          setDensity(
                            option.value
                          )
                        }
                        icon={
                          option.icon
                        }
                        title={
                          option.title
                        }
                        description={
                          option.description
                        }
                        accent={
                          accentColor
                        }
                      />
                    )
                  )}
                </div>
              </AppearanceSection>

              {/* REDUCE MOTION */}

              <section
                className={
                  styles.appearanceSection
                }
              >
                <div
                  className={
                    styles.sectionLabel
                  }
                >
                  REDUCE MOTION
                </div>

                <div
                  className={
                    styles.settingsCard
                  }
                >
                  <div
                    className={
                      styles.motionRow
                    }
                  >
                    <div
                      className={
                        styles.motionText
                      }
                    >
                      <h2>
                        Reduce Motion
                      </h2>

                      <p>
                        Minimize
                        animations
                        and motion
                        effects.
                        Helps
                        reduce
                        motion
                        for
                        accessibility
                        and
                        focus.
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`${styles.toggle} ${
                        reduceMotion
                          ? styles.toggleOn
                          : ""
                      }`}
                      onClick={() =>
                        setReduceMotion(
                          !reduceMotion
                        )
                      }
                      aria-label="Toggle reduce motion"
                      aria-pressed={
                        reduceMotion
                      }
                    >
                      <span
                        className={
                          styles.toggleKnob
                        }
                      />
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* ==================================================
                PREVIEW
            ================================================== */}

            <PreviewPanel
              effectiveTheme={
                effectiveTheme
              }
              accent={accentColor}
              density={density}
              stats={{
                verifications:
                  verificationCount,
                properties:
                  propertyCount,
                alerts: alertCount,
              }}
              activities={
                activities
              }
            />
          </div>
        </section>
      </main>
    </AppShell>
  );
}