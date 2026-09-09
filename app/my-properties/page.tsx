"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "../lib/supabase";

import AppShell from "../AppShell/AppShell";

import styles from "./my-properties.module.css";

const PROPERTIES_TABLE = "properties";

type PropertyStatus =
  | "Verified"
  | "Pending"
  | "Flagged"
  | "Unknown";

type Property = {
  id: string;
  propertyName: string;
  location: string;
  status: PropertyStatus;
  documents: number;
  createdAt: string;
  reportId: string;
  verificationLevel: string;
  imageUrl: string;
};

/* =========================================================
   HELPERS
========================================================= */

function stringValue(
  row: Record<string, unknown>,
  keys: string[],
  fallback = ""
): string {
  for (const key of keys) {
    const value = row[key];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return String(value);
    }
  }

  return fallback;
}

function numberValue(
  row: Record<string, unknown>,
  keys: string[],
  fallback = 0
): number {
  for (const key of keys) {
    const value = row[key];

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return fallback;
}

function normalizeStatus(
  value: string
): PropertyStatus {
  const normalized =
    value.trim().toLowerCase();

  if (
    normalized.includes("flag") ||
    normalized.includes("fraud") ||
    normalized.includes("risk") ||
    normalized.includes("reject")
  ) {
    return "Flagged";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("progress") ||
    normalized.includes("processing") ||
    normalized.includes("review") ||
    normalized.includes("started")
  ) {
    return "Pending";
  }

  if (
    normalized.includes("verif") ||
    normalized.includes("complete") ||
    normalized.includes("approved") ||
    normalized.includes("success")
  ) {
    return "Verified";
  }

  return "Unknown";
}

function formatDate(
  value: string
): string {
  if (!value) {
    return "Date unavailable";
  }

  const parsed = new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(parsed);
}

function mapProperty(
  row: Record<string, unknown>
): Property {
  const status =
    normalizeStatus(
      stringValue(
        row,
        [
          "status",
          "verification_status",
          "property_status",
          "result_status",
        ],
        "Pending"
      )
    );

  const rawId =
    stringValue(
      row,
      [
        "id",
        "property_id",
        "verification_id",
      ],
      ""
    );

  const reportId =
    stringValue(
      row,
      [
        "report_id",
        "verification_id",
        "reference_id",
        "report_reference",
      ],
      ""
    );

  const imageUrl =
    stringValue(
      row,
      [
        "image_url",
        "imageUrl",
        "property_image",
        "property_image_url",
      ],
      ""
    );

  return {
    id:
      rawId ||
      `${stringValue(
        row,
        [
          "property_name",
          "name",
        ],
        "property"
      )}-${stringValue(
        row,
        ["created_at"],
        ""
      )}`,

    propertyName:
      stringValue(
        row,
        [
          "property_name",
          "propertyName",
          "name",
          "property_title",
          "title",
        ],
        "Property"
      ),

    location:
      stringValue(
        row,
        [
          "location",
          "property_location",
          "address",
          "property_address",
          "state",
          "property_state",
        ],
        "Location unavailable"
      ),

    status,

    documents:
      numberValue(
        row,
        [
          "documents_count",
          "document_count",
          "documents",
          "file_count",
          "total_documents",
        ],
        0
      ),

    createdAt:
      stringValue(
        row,
        [
          "created_at",
          "updated_at",
          "verified_at",
          "completed_at",
        ],
        ""
      ),

    reportId,

    verificationLevel:
      stringValue(
        row,
        [
          "verification_level",
          "verification_tier",
          "service_level",
          "service_tier",
          "plan_type",
          "package",
        ],
        "Verification"
      ),

    imageUrl,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function MyPropertiesPage() {
  const router = useRouter();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState("All Properties");

  const [
    filterOpen,
    setFilterOpen,
  ] = useState(false);

  const [
    loadingUser,
    setLoadingUser,
  ] = useState(true);

  const [
    loadingProperties,
    setLoadingProperties,
  ] = useState(true);

  const [
    properties,
    setProperties,
  ] = useState<Property[]>([]);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /* =========================================================
     AUTHENTICATION
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function checkAuthentication() {
      try {
        setLoadingUser(true);

        const {
          data,
          error,
        } =
          await supabase.auth.getUser();

        if (error) {
          console.warn(
            "My Properties auth error:",
            error
          );

          return;
        }

        if (!data.user) {
          router.replace("/signin");
        }
      } catch (error) {
        console.warn(
          "My Properties authentication warning:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* =========================================================
     LOAD PROPERTIES
  ========================================================= */

  const loadProperties =
    useCallback(
      async () => {
        setLoadingProperties(true);
        setErrorMessage("");

        try {
          const {
            data: authData,
            error: authError,
          } =
            await supabase.auth.getUser();

          if (authError) {
            console.warn(
              "My Properties authentication warning:",
              authError
            );

            setProperties([]);

            setErrorMessage(
              "Unable to authenticate your account."
            );

            return;
          }

          const authUser =
            authData.user;

          if (!authUser) {
            router.replace(
              "/signin"
            );

            return;
          }

          const {
            data,
            error,
          } =
            await supabase
              .from(
                PROPERTIES_TABLE
              )
              .select("*")
              .eq(
                "user_id",
                authUser.id
              );

          if (error) {
            console.warn(
              "Could not load properties.",
              {
                message:
                  error.message,
                details:
                  error.details,
                hint:
                  error.hint,
                code:
                  error.code,
              }
            );

            setProperties([]);

            setErrorMessage(
              "We couldn't connect to your properties data right now."
            );

            return;
          }

          const mappedProperties =
            (
              (data ||
                []) as Record<
                string,
                unknown
              >[]
            ).map(
              mapProperty
            );

          mappedProperties.sort(
            (a, b) => {
              const aTime =
                a.createdAt
                  ? new Date(
                      a.createdAt
                    ).getTime()
                  : 0;

              const bTime =
                b.createdAt
                  ? new Date(
                      b.createdAt
                    ).getTime()
                  : 0;

              return (
                bTime - aTime
              );
            }
          );

          setProperties(
            mappedProperties
          );

          setErrorMessage("");
        } catch (error) {
          console.warn(
            "Properties loading warning:",
            error
          );

          setProperties([]);

          setErrorMessage(
            "Something went wrong while loading your properties."
          );
        } finally {
          setLoadingProperties(
            false
          );
        }
      },
      [router]
    );

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  /* =========================================================
     REALTIME
  ========================================================= */

  useEffect(() => {
    let channel:
      | ReturnType<
          typeof supabase.channel
        >
      | null = null;

    let cancelled = false;

    async function setupRealtime() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getUser();

        if (error) {
          console.warn(
            "Properties realtime auth warning:",
            error
          );

          return;
        }

        const authUser =
          data.user;

        if (
          !authUser ||
          cancelled
        ) {
          return;
        }

        channel =
          supabase
            .channel(
              `properties-page-${authUser.id}`
            )
            .on(
              "postgres_changes",
              {
                event: "*",
                schema:
                  "public",
                table:
                  PROPERTIES_TABLE,
                filter:
                  `user_id=eq.${authUser.id}`,
              },
              () => {
                loadProperties();
              }
            )
            .subscribe(
              (status: string) => {
                if (
                  status ===
                  "CHANNEL_ERROR"
                ) {
                  console.warn(
                    "Properties realtime channel warning."
                  );
                }
              }
            );
      } catch (error) {
        console.warn(
          "Realtime setup warning:",
          error
        );
      }
    }

    setupRealtime();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(
          channel
        );
      }
    };
  }, [loadProperties]);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigateTo =
    useCallback(
      (path: string) => {
        setFilterOpen(false);
        router.push(path);
      },
      [router]
    );

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredProperties =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return properties.filter(
        (property) => {
          const matchesSearch =
            !searchText ||
            property.propertyName
              .toLowerCase()
              .includes(
                searchText
              ) ||
            property.location
              .toLowerCase()
              .includes(
                searchText
              ) ||
            property.reportId
              .toLowerCase()
              .includes(
                searchText
              );

          const matchesFilter =
            filter ===
              "All Properties" ||
            property.status ===
              filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      properties,
      search,
      filter,
    ]);

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loadingUser) {
    return (
      <main
        className={
          styles.loadingPage
        }
      >
        <div
          className={
            styles.loadingBrand
          }
        >
          <span
            className={
              styles.loadingDiamond
            }
          />

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <div
          className={
            styles.loadingIndicator
          }
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>

        <p
          className={
            styles.loadingText
          }
        >
          Loading...
        </p>
      </main>
    );
  }

  return (
    <AppShell
      activePath="/my-properties"
    >
      <main
        className={
          styles.propertiesPage
        }
      >
        <section
          className={
            styles.content
          }
        >

          {/* ====================================================
              SEARCH + ADD PROPERTY
          ==================================================== */}

          <section
            className={
              styles.filterRow
            }
          >
            <div
              className={
                styles.searchBox
              }
            >
              <span
                className={
                  styles.searchIcon
                }
              >
                ⌕
              </span>

              <input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search by property, location or report ID"
              />
            </div>

            <button
              className={
                styles.addPropertyButton
              }
              onClick={() =>
                navigateTo(
                  "/my-properties/add"
                )
              }
              type="button"
            >
              <span
                className={
                  styles.addPropertyPlus
                }
              >
                +
              </span>

              <span>
                Add Property
              </span>
            </button>

            <div
              className={
                styles.filterDropdown
              }
            >
              <button
                className={`${styles.filterTrigger} ${
                  filterOpen
                    ? styles.filterTriggerOpen
                    : ""
                }`}
                onClick={() =>
                  setFilterOpen(
                    (current) =>
                      !current
                  )
                }
                aria-expanded={
                  filterOpen
                }
                aria-haspopup="listbox"
                type="button"
              >
                <div
                  className={
                    styles.filterTriggerLeft
                  }
                >
                  <div
                    className={`${styles.filterStatusIcon} ${styles.all}`}
                  >
                    ⌂
                  </div>

                  <div
                    className={
                      styles.filterTriggerText
                    }
                  >
                    <span
                      className={
                        styles.filterSmallLabel
                      }
                    >
                      FILTER PROPERTIES
                    </span>

                    <strong>
                      {filter}
                    </strong>
                  </div>
                </div>

                <span
                  className={
                    styles.filterChevron
                  }
                >
                  ⌄
                </span>
              </button>

              {filterOpen && (
                <>
                  <button
                    className={
                      styles.filterBackdrop
                    }
                    aria-label="Close filter"
                    onClick={() =>
                      setFilterOpen(
                        false
                      )
                    }
                    type="button"
                  />

                  <div
                    className={
                      styles.filterMenu
                    }
                    role="listbox"
                    aria-label="Filter properties"
                  >
                    {[
                      "All Properties",
                      "Verified",
                      "Pending",
                      "Flagged",
                    ].map(
                      (option) => (
                        <button
                          key={option}
                          className={`${styles.filterOption} ${
                            filter ===
                            option
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => {
                            setFilter(
                              option
                            );

                            setFilterOpen(
                              false
                            );
                          }}
                          role="option"
                          aria-selected={
                            filter ===
                            option
                          }
                          type="button"
                        >
                          <div
                            className={`${styles.filterStatusIcon} ${
                              option ===
                              "Verified"
                                ? styles.verified
                                : option ===
                                    "Pending"
                                  ? styles.pending
                                  : option ===
                                      "Flagged"
                                    ? styles.flagged
                                    : styles.all
                            }`}
                          >
                            {option ===
                              "Verified" &&
                              "✓"}

                            {option ===
                              "Pending" &&
                              "◷"}

                            {option ===
                              "Flagged" &&
                              "!"}

                            {option ===
                              "All Properties" &&
                              "⌂"}
                          </div>

                          <div
                            className={
                              styles.filterOptionText
                            }
                          >
                            <strong>
                              {option}
                            </strong>

                            <span>
                              {option ===
                                "All Properties" &&
                                "View all properties"}

                              {option ===
                                "Verified" &&
                                "Successfully verified properties"}

                              {option ===
                                "Pending" &&
                                "Properties still under verification"}

                              {option ===
                                "Flagged" &&
                                "Properties requiring attention"}
                            </span>
                          </div>

                          {filter ===
                            option && (
                            <span
                              className={
                                styles.selectedCheck
                              }
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ====================================================
              SECTION HEADER
          ==================================================== */}

          <div
            className={
              styles.propertiesSectionHeader
            }
          >
            <h2>
              Your Properties
            </h2>

            <span>
              {
                filteredProperties.length
              }{" "}
              {
                filteredProperties.length ===
                1
                  ? "property"
                  : "properties"
              }
            </span>
          </div>

          {/* ====================================================
              PROPERTY GRID
          ==================================================== */}

          <section
            className={
              styles.propertiesGrid
            }
          >
            {loadingProperties ? (
              <div
                className={
                  styles.loadingPropertiesCard
                }
              >
                <div
                  className={
                    styles.loadingSpinner
                  }
                />

                <h3>
                  Loading properties
                </h3>

                <p>
                  Retrieving your property portfolio...
                </p>
              </div>
            ) : filteredProperties.length ===
              0 ? (
              <div
                className={
                  styles.emptyPropertyCard
                }
              >
                <div
                  className={
                    styles.emptyPropertyIcon
                  }
                >
                  ⌂
                </div>

                <h3>
                  No properties yet
                </h3>

                <p>
                  Properties you add to
                  your portfolio will
                  appear here. You can
                  add a property now and
                  verify it separately
                  whenever you are ready.
                </p>

                <button
                  className={
                    styles.emptyAddPropertyButton
                  }
                  onClick={() =>
                    navigateTo(
                      "/my-properties/add"
                    )
                  }
                  type="button"
                >
                  ＋ Add Property
                </button>
              </div>
            ) : (
              filteredProperties.map(
                (property) => (
                  <article
                    className={
                      styles.propertyCard
                    }
                    key={
                      property.id
                    }
                  >
                    <div
                      className={
                        styles.propertyImage
                      }
                    >
                      {property.imageUrl ? (
                        <img
                          src={
                            property.imageUrl
                          }
                          alt={`${property.propertyName} property`}
                          className={
                            styles.propertyImageElement
                          }
                        />
                      ) : (
                        <div
                          className={
                            styles.propertyImageFallback
                          }
                        >
                          <span
                            className={
                              styles.fallbackDiamond
                            }
                          />

                          <span
                            className={
                              styles.fallbackBrand
                            }
                          >
                            PropertySure
                            <strong>
                              {" "}
                              AI
                            </strong>
                          </span>

                          <span
                            className={
                              styles.fallbackLabel
                            }
                          >
                            No property image
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className={
                        styles.propertyCardBody
                      }
                    >
                      <div
                        className={
                          styles.propertyCardHeader
                        }
                      >
                        <div
                          className={`${styles.propertyIcon} ${
                            property.status ===
                            "Verified"
                              ? styles.propertyGreen
                              : property.status ===
                                  "Pending"
                                ? styles.propertyOrange
                                : property.status ===
                                    "Flagged"
                                  ? styles.propertyRed
                                  : styles.propertyBlue
                          }`}
                        >
                          ⌂
                        </div>

                        <div
                          className={
                            styles.propertyTitle
                          }
                        >
                          <div
                            className={
                              styles.propertyTitleRow
                            }
                          >
                            <h3>
                              {
                                property.propertyName
                              }
                            </h3>

                            <span
                              className={`${styles.statusBadge} ${
                                property.status ===
                                "Verified"
                                  ? styles.verifiedBadge
                                  : property.status ===
                                      "Pending"
                                    ? styles.pendingBadge
                                    : property.status ===
                                        "Flagged"
                                      ? styles.flaggedBadge
                                      : styles.unknownBadge
                              }`}
                            >
                              {property.status ===
                                "Verified" &&
                                "✓ "}

                              {property.status ===
                                "Pending" &&
                                "⌛ "}

                              {property.status ===
                                "Flagged" &&
                                "! "}

                              {
                                property.status
                              }
                            </span>
                          </div>

                          {property.reportId && (
                            <span
                              className={
                                styles.reportId
                              }
                            >
                              Report ID:{" "}
                              {
                                property.reportId
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={
                          styles.cardDivider
                        }
                      />

                      <div
                        className={
                          styles.propertyDetails
                        }
                      >
                        <div
                          className={
                            styles.detailRow
                          }
                        >
                          <span
                            className={
                              styles.detailIcon
                            }
                          >
                            ⌖
                          </span>

                          <span>
                            Location
                          </span>

                          <strong>
                            {
                              property.location
                            }
                          </strong>
                        </div>

                        <div
                          className={
                            styles.detailRow
                          }
                        >
                          <span
                            className={
                              styles.detailIcon
                            }
                          >
                            ▤
                          </span>

                          <span>
                            Documents
                          </span>

                          <strong>
                            {property.documents >
                            0
                              ? `${property.documents} ${
                                  property.documents ===
                                  1
                                    ? "document"
                                    : "documents"
                                }`
                              : "Package pending"}
                          </strong>
                        </div>

                        <div
                          className={
                            styles.detailRow
                          }
                        >
                          <span
                            className={
                              styles.detailIcon
                            }
                          >
                            ◷
                          </span>

                          <span>
                            Added
                          </span>

                          <strong>
                            {formatDate(
                              property.createdAt
                            )}
                          </strong>
                        </div>

                        <div
                          className={
                            styles.detailRow
                          }
                        >
                          <span
                            className={
                              styles.detailIcon
                            }
                          >
                            ✓
                          </span>

                          <span>
                            Verification
                          </span>

                          <strong>
                            {
                              property.verificationLevel
                            }
                          </strong>
                        </div>
                      </div>

                      {/* ==================================================
                          PROPERTY ACTIONS
                      ================================================== */}

                      <div
                        className={
                          styles.propertyActions
                        }
                      >
                        <button
                          className={
                            styles.viewPropertyButton
                          }
                          onClick={() =>
                            navigateTo(
                              `/my-properties/${encodeURIComponent(
                                property.id
                              )}`
                            )
                          }
                          type="button"
                        >
                          View Property
                        </button>

                        <button
                          className={
                            styles.historyButton
                          }
                          onClick={() =>
                            navigateTo(
                              "/verification-history"
                            )
                          }
                          type="button"
                        >
                          History
                        </button>
                      </div>
                    </div>
                  </article>
                )
              )
            )}
          </section>

          {/* ====================================================
              INFO BAR
          ==================================================== */}

          <div
            className={
              styles.infoBar
            }
          >
            <div
              className={
                styles.infoBarIcon
              }
            >
              ✓
            </div>

            <p>
              Your property portfolio
              represents properties you
              have added to PropertySure
              AI, whether you own them,
              are considering purchasing
              them, represent them, or
              manage them. Each property
              can be verified separately.
            </p>
          </div>

        </section>
      </main>
    </AppShell>
  );
}