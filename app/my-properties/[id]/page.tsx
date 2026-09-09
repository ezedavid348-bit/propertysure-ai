"use client";

import {
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../AppShell/AppShell";
import { supabase } from "../../lib/supabase";
import styles from "./property-details.module.css";

type Property = {
  id: string;
  user_id: string;
  name: string;
  property_type: string;
  relationship: string;
  owner_name: string | null;
  owner_contact: string | null;
  image_url: string | null;
  state: string;
  lga: string;
  address: string;
  size: string | null;
  asking_price: string | null;
  description: string | null;
  verification_status: string;
  created_at: string;
  updated_at: string;
};

function formatRelationship(
  relationship: string
) {
  const labels: Record<string, string> = {
    owner: "Owner",
    buyer: "Buyer",
    agent: "Agent",
    manager: "Manager / Developer",
    other: "Other",
  };

  return (
    labels[relationship] ||
    relationship
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  );
}

function formatVerificationStatus(
  status: string
) {
  const normalized =
    status.toLowerCase();

  if (
    normalized === "verified" ||
    normalized === "complete" ||
    normalized === "completed"
  ) {
    return {
      label: "Verified",
      className: "verified",
    };
  }

  if (
    normalized === "pending" ||
    normalized === "review" ||
    normalized === "in_progress"
  ) {
    return {
      label: "Verification in Progress",
      className: "pending",
    };
  }

  if (
    normalized === "flagged" ||
    normalized === "fraud"
  ) {
    return {
      label: "Flagged",
      className: "flagged",
    };
  }

  return {
    label: "Not Verified",
    className: "notVerified",
  };
}

function formatDate(
  value: string
) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const propertyId =
    typeof params?.id === "string"
      ? params.id
      : "";

  const [loading, setLoading] =
    useState(true);

  const [property, setProperty] =
    useState<Property | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let mounted = true;

    const loadProperty =
      async () => {
        try {
          setLoading(true);
          setErrorMessage("");

          const {
            data: {
              user,
            },
            error: userError,
          } =
            await supabase.auth.getUser();

          if (
            userError ||
            !user
          ) {
            router.replace(
              "/signin"
            );
            return;
          }

          if (!propertyId) {
            if (mounted) {
              setErrorMessage(
                "This property could not be found."
              );
              setLoading(false);
            }

            return;
          }

          const {
            data,
            error,
          } =
            await supabase
              .from("properties")
              .select("*")
              .eq("id", propertyId)
              .eq(
                "user_id",
                user.id
              )
              .single();

          if (error) {
            console.error(
              "Property details error:",
              error
            );

            if (mounted) {
              setErrorMessage(
                "We could not load this property. Please try again."
              );
              setLoading(false);
            }

            return;
          }

          if (mounted) {
            setProperty(
              data as Property
            );
            setLoading(false);
          }
        } catch (error) {
          console.error(
            "Unexpected property details error:",
            error
          );

          if (mounted) {
            setErrorMessage(
              "Something went wrong while loading this property."
            );
            setLoading(false);
          }
        }
      };

    loadProperty();

    return () => {
      mounted = false;
    };
  }, [
    propertyId,
    router,
  ]);

  if (loading) {
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

  if (!property) {
    return (
      <AppShell
        activePath="/my-properties"
      >
        <main
          className={
            styles.page
          }
        >
          <div
            className={
              styles.content
            }
          >
            <button
              type="button"
              className={
                styles.backButton
              }
              onClick={() =>
                router.push(
                  "/my-properties"
                )
              }
            >
              <span>
                ←
              </span>

              Back to My Properties
            </button>

            <section
              className={
                styles.errorCard
              }
            >
              <div
                className={
                  styles.errorIcon
                }
              >
                !
              </div>

              <h1>
                Property not found
              </h1>

              <p>
                {errorMessage ||
                  "This property could not be found or you do not have access to it."}
              </p>

              <button
                type="button"
                className={
                  styles.primaryButton
                }
                onClick={() =>
                  router.push(
                    "/my-properties"
                  )
                }
              >
                Back to My Properties
              </button>
            </section>
          </div>
        </main>
      </AppShell>
    );
  }

  const verification =
    formatVerificationStatus(
      property.verification_status
    );

  return (
    <AppShell
      activePath="/my-properties"
    >
      <main
        className={styles.page}
      >
        <div
          className={
            styles.content
          }
        >
          {/* =========================================
              BACK
          ========================================= */}

          <button
            type="button"
            className={
              styles.backButton
            }
            onClick={() =>
              router.push(
                "/my-properties"
              )
            }
          >
            <span
              aria-hidden="true"
            >
              ←
            </span>

            Back to My Properties
          </button>

          {/* =========================================
              PROPERTY HERO
          ========================================= */}

          <section
            className={
              styles.propertyHero
            }
          >
            <div
              className={
                styles.heroImage
              }
            >
              {property.image_url ? (
                <img
                  src={
                    property.image_url
                  }
                  alt={
                    property.name
                  }
                />
              ) : (
                <div
                  className={
                    styles.imagePlaceholder
                  }
                >
                  <span
                    aria-hidden="true"
                  >
                    ◆
                  </span>

                  <small>
                    No property image
                  </small>
                </div>
              )}
            </div>

            <div
              className={
                styles.heroContent
              }
            >
              <div
                className={
                  styles.heroTop
                }
              >
                <div>
                  <p
                    className={
                      styles.eyebrow
                    }
                  >
                    Property Details
                  </p>

                  <h1>
                    {property.name}
                  </h1>

                  <div
                    className={
                      styles.heroMeta
                    }
                  >
                    <span>
                      {
                        property.property_type
                      }
                    </span>

                    <span
                      className={
                        styles.metaDot
                      }
                    >
                      •
                    </span>

                    <span>
                      {formatRelationship(
                        property.relationship
                      )}
                    </span>
                  </div>
                </div>

                <div
                  className={`${styles.statusBadge} ${
                    styles[
                      verification.className
                    ]
                  }`}
                >
                  <span
                    className={
                      styles.statusDot
                    }
                  />

                  {
                    verification.label
                  }
                </div>
              </div>

              <div
                className={
                  styles.heroLocation
                }
              >
                <span
                  aria-hidden="true"
                >
                  ●
                </span>

                <span>
                  {property.lga},{" "}
                  {property.state}
                </span>
              </div>
            </div>
          </section>

          {/* =========================================
              VERIFICATION ACTION
          ========================================= */}

          <section
            className={
              styles.verificationCard
            }
          >
            <div
              className={
                styles.verificationIcon
              }
            >
              ✓
            </div>

            <div
              className={
                styles.verificationContent
              }
            >
              <h2>
                Property Verification
              </h2>

              {verification.className ===
              "verified" ? (
                <p>
                  This property has
                  completed verification.
                  View the verification
                  report for the detailed
                  findings.
                </p>
              ) : verification.className ===
                "pending" ? (
                <p>
                  Verification for this
                  property is currently in
                  progress. You can view the
                  verification status and
                  available results.
                </p>
              ) : (
                <p>
                  This property has not
                  been verified yet. Start
                  a PropertySure AI
                  verification whenever you
                  are ready.
                </p>
              )}
            </div>

            <div
              className={
                styles.verificationAction
              }
            >
              {verification.className ===
              "verified" ? (
                <button
                  type="button"
                  className={
                    styles.primaryButton
                  }
                  onClick={() =>
                    router.push(
                      `/verification-details?property=${property.id}`
                    )
                  }
                >
                  View Verification
                </button>
              ) : (
                <button
                  type="button"
                  className={
                    styles.primaryButton
                  }
                  onClick={() =>
                    router.push(
                      `/verify?property=${property.id}`
                    )
                  }
                >
                  Start Verification
                </button>
              )}
            </div>
          </section>

          {/* =========================================
              INFORMATION GRID
          ========================================= */}

          <div
            className={
              styles.detailsGrid
            }
          >
            {/* LOCATION */}

            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.cardHeader
                }
              >
                <div
                  className={
                    styles.cardIcon
                  }
                >
                  ●
                </div>

                <div>
                  <h2>
                    Location
                  </h2>

                  <p>
                    Where the property is
                    located.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.infoList
                }
              >
                <div
                  className={
                    styles.infoRow
                  }
                >
                  <span>
                    State
                  </span>

                  <strong>
                    {property.state}
                  </strong>
                </div>

                <div
                  className={
                    styles.infoRow
                  }
                >
                  <span>
                    LGA / Area Council
                  </span>

                  <strong>
                    {property.lga}
                  </strong>
                </div>

                <div
                  className={`${styles.infoRow} ${styles.infoRowStacked}`}
                >
                  <span>
                    Address / Location
                  </span>

                  <strong>
                    {property.address}
                  </strong>
                </div>
              </div>
            </section>

            {/* PROPERTY INFORMATION */}

            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.cardHeader
                }
              >
                <div
                  className={
                    styles.cardIcon
                  }
                >
                  ◆
                </div>

                <div>
                  <h2>
                    Property Information
                  </h2>

                  <p>
                    Key details about this
                    property.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.infoList
                }
              >
                <div
                  className={
                    styles.infoRow
                  }
                >
                  <span>
                    Property Type
                  </span>

                  <strong>
                    {
                      property.property_type
                    }
                  </strong>
                </div>

                <div
                  className={
                    styles.infoRow
                  }
                >
                  <span>
                    Your Relationship
                  </span>

                  <strong>
                    {formatRelationship(
                      property.relationship
                    )}
                  </strong>
                </div>

                <div
                  className={
                    styles.infoRow
                  }
                >
                  <span>
                    Property Size
                  </span>

                  <strong>
                    {property.size ||
                      "Not provided"}
                  </strong>
                </div>

                <div
                  className={
                    styles.infoRow
                  }
                >
                  <span>
                    Asking Price
                  </span>

                  <strong>
                    {property.asking_price ||
                      "Not provided"}
                  </strong>
                </div>
              </div>
            </section>

            {/* OWNER / SELLER */}

            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.cardHeader
                }
              >
                <div
                  className={
                    styles.cardIcon
                  }
                >
                  ◉
                </div>

                <div>
                  <h2>
                    Owner / Seller
                  </h2>

                  <p>
                    Ownership information
                    currently recorded.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.infoList
                }
              >
                <div
                  className={
                    styles.infoRow
                  }
                >
                  <span>
                    Name
                  </span>

                  <strong>
                    {property.owner_name ||
                      "Not provided"}
                  </strong>
                </div>

                <div
                  className={
                    styles.infoRow
                  }
                >
                  <span>
                    Contact
                  </span>

                  <strong>
                    {property.owner_contact ||
                      "Not provided"}
                  </strong>
                </div>

                <div
                  className={
                    styles.infoRow
                  }
                >
                  <span>
                    Your Relationship
                  </span>

                  <strong>
                    {formatRelationship(
                      property.relationship
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* RECORD INFORMATION */}

            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.cardHeader
                }
              >
                <div
                  className={
                    styles.cardIcon
                  }
                >
                  ✓
                </div>

                <div>
                  <h2>
                    Record Information
                  </h2>

                  <p>
                    Property portfolio
                    record details.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.infoList
                }
              >
                <div
                  className={
                    styles.infoRow
                  }
                >
                  <span>
                    Added
                  </span>

                  <strong>
                    {formatDate(
                      property.created_at
                    )}
                  </strong>
                </div>

                <div
                  className={
                    styles.infoRow
                  }
                >
                  <span>
                    Last Updated
                  </span>

                  <strong>
                    {formatDate(
                      property.updated_at
                    )}
                  </strong>
                </div>

                <div
                  className={`${styles.infoRow} ${styles.infoRowStacked}`}
                >
                  <span>
                    Property ID
                  </span>

                  <strong
                    className={
                      styles.propertyId
                    }
                  >
                    {property.id}
                  </strong>
                </div>
              </div>
            </section>
          </div>

          {/* =========================================
              DESCRIPTION
          ========================================= */}

          {property.description && (
            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.cardHeader
                }
              >
                <div
                  className={
                    styles.cardIcon
                  }
                >
                  ≡
                </div>

                <div>
                  <h2>
                    Property Description
                  </h2>

                  <p>
                    Additional information
                    recorded for this
                    property.
                  </p>
                </div>
              </div>

              <p
                className={
                  styles.description
                }
              >
                {property.description}
              </p>
            </section>
          )}

          {/* =========================================
              IMPORTANT NOTICE
          ========================================= */}

          <div
            className={
              styles.notice
            }
          >
            <div
              className={
                styles.noticeIcon
              }
            >
              ✓
            </div>

            <div>
              <strong>
                Adding a property does
                not verify it
              </strong>

              <p>
                This property is part of
                your PropertySure AI
                portfolio. Verification
                is a separate due-diligence
                process that you can start
                whenever you are ready.
              </p>
            </div>
          </div>

          {/* =========================================
              BOTTOM ACTIONS
          ========================================= */}

          <div
            className={
              styles.bottomActions
            }
          >
            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={() =>
                router.push(
                  "/my-properties"
                )
              }
            >
              ← My Properties
            </button>

            {verification.className !==
              "verified" && (
              <button
                type="button"
                className={
                  styles.primaryButton
                }
                onClick={() =>
                  router.push(
                    `/verify?property=${property.id}`
                  )
                }
              >
                Start Verification
              </button>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}