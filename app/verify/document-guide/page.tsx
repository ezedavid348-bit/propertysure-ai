"use client";

import {
  useEffect,
  useState,
} from "react";

import AppShell from "../../AppShell/AppShell";

import styles from "./document-guide.module.css";

type PropertyDetails = {
  propertyType: string;
  propertySubtype: string;
  estimatedSize: string;
  sizeUnit: string;
  estimatedValue: string;
  currency: string;
  propertyDescription: string;
  ownerType: string;
  ownerName: string;
  agentDeveloper: string;
  verificationPurpose: string;
};

type DocumentStatus =
  | "Required"
  | "Recommended"
  | "If applicable"
  | "Optional";

type DocumentItem = {
  name: string;
  status: DocumentStatus;
  icon: string;
};

type DocumentCategory = {
  title: string;
  subtitle?: string;
  badge?: string;
  icon: string;
  iconClass: string;
  documents: DocumentItem[];
};

const STORAGE_KEY =
  "propertysure-property-details";

const DOCUMENT_GUIDE_KEY =
  "propertysure-document-guide";

const residentialLandCategories:
  DocumentCategory[] = [
    {
      title:
        "Title & Ownership Documents",
      badge: "Essential",
      icon: "▤",
      iconClass: "green",
      documents: [
        {
          name:
            "Certificate of Occupancy (C of O)",
          status: "Required",
          icon: "▧",
        },
        {
          name:
            "Deed of Assignment",
          status: "Required",
          icon: "▧",
        },
        {
          name:
            "Governor's Consent",
          status: "Recommended",
          icon: "▧",
        },
        {
          name:
            "Allocation Letter",
          status: "If applicable",
          icon: "▧",
        },
        {
          name:
            "Previous Owner's Receipt",
          status: "Recommended",
          icon: "▧",
        },
      ],
    },
    {
      title:
        "Survey & Land Documents",
      badge: "Essential",
      icon: "▣",
      iconClass: "blue",
      documents: [
        {
          name: "Survey Plan",
          status: "Required",
          icon: "▤",
        },
        {
          name:
            "Approved Survey Plan",
          status: "Recommended",
          icon: "▤",
        },
        {
          name: "Site Plan",
          status: "If applicable",
          icon: "▤",
        },
      ],
    },
    {
      title:
        "Building & Development Documents",
      subtitle: "If applicable",
      icon: "▧",
      iconClass: "yellow",
      documents: [
        {
          name: "Building Approval",
          status: "If applicable",
          icon: "▤",
        },
        {
          name:
            "Approved Building Plan",
          status: "If applicable",
          icon: "▤",
        },
        {
          name:
            "Development Permit",
          status: "If applicable",
          icon: "▤",
        },
      ],
    },
    {
      title:
        "Seller / Company Documents",
      subtitle: "If applicable",
      icon: "▧",
      iconClass: "purple",
      documents: [
        {
          name:
            "Seller's Identification (NIN, Passport, etc.)",
          status: "Recommended",
          icon: "▤",
        },
        {
          name:
            "CAC Documents (if company)",
          status: "If applicable",
          icon: "▤",
        },
        {
          name:
            "Agent/Developer Registration",
          status: "If applicable",
          icon: "▤",
        },
      ],
    },
    {
      title:
        "Other Supporting Documents",
      badge: "Optional",
      icon: "▤",
      iconClass: "gray",
      documents: [
        {
          name:
            "Any other relevant documents",
          status: "If applicable",
          icon: "▤",
        },
      ],
    },
  ];

function getStatusClass(
  status: DocumentStatus
) {
  if (status === "Required") {
    return styles.required;
  }

  if (status === "Recommended") {
    return styles.recommended;
  }

  if (status === "If applicable") {
    return styles.applicable;
  }

  return styles.optional;
}

function getDocumentCategories(
  propertyType: string
): DocumentCategory[] {
  /*
   * The current Document Guide design supplied
   * for PropertySure is based on Residential Land.
   *
   * We preserve that exact document structure
   * for the first implementation. The property
   * type selected on Step 1 is still displayed
   * in the page introduction and is stored for
   * the later verification workflow.
   */

  if (
    propertyType ===
    "Residential Land"
  ) {
    return residentialLandCategories;
  }

  return residentialLandCategories;
}

export default function DocumentGuidePage() {
  const [
    propertyDetails,
    setPropertyDetails,
  ] =
    useState<PropertyDetails | null>(
      null
    );

  const [
    openCategories,
    setOpenCategories,
  ] = useState<boolean[]>(
    residentialLandCategories.map(
      () => true
    )
  );

  const [
    isContinuing,
    setIsContinuing,
  ] = useState(false);

  useEffect(() => {
    try {
      const saved =
        sessionStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const parsed =
        JSON.parse(
          saved
        ) as PropertyDetails;

      setPropertyDetails(parsed);
    } catch (error) {
      console.warn(
        "Could not load property details:",
        error
      );
    }
  }, []);

  const propertyType =
    propertyDetails?.propertyType ||
    "Residential Land";

  const categories =
    getDocumentCategories(
      propertyType
    );

  function toggleCategory(
    index: number
  ) {
    setOpenCategories(
      (current) =>
        current.map(
          (isOpen, categoryIndex) =>
            categoryIndex === index
              ? !isOpen
              : isOpen
        )
    );
  }

  function handleBack() {
    window.location.href =
      "/verify/property-details";
  }

  function handleContinue() {
    try {
      setIsContinuing(true);

      const guideData = {
        propertyType,
        propertySubtype:
          propertyDetails?.propertySubtype ||
          "",
        categories:
          categories.map(
            (category) => ({
              title:
                category.title,
              documents:
                category.documents.map(
                  (document) => ({
                    name:
                      document.name,
                    status:
                      document.status,
                  })
                ),
            })
          ),
      };

      sessionStorage.setItem(
        DOCUMENT_GUIDE_KEY,
        JSON.stringify(
          guideData
        )
      );

      window.location.href =
        "/verify";
    } catch (error) {
      console.error(
        "Could not save document guide:",
        error
      );

      setIsContinuing(false);
    }
  }

  return (
    <AppShell activePath="/verify">
      <main className={styles.page}>
        <div
          className={
            styles.content
          }
        >
          {/* ==================================================
              BACK TO PROPERTY DETAILS
          ================================================== */}

          <button
            type="button"
            className={
              styles.backLink
            }
            onClick={handleBack}
          >
            <span>←</span>

            Back to Property Details
          </button>

          {/* ==================================================
              WORKFLOW
          ================================================== */}

          <section
            className={
              styles.workflowCard
            }
          >
            {/* STEP 1 */}

            <div
              className={`${styles.workflowStep} ${styles.workflowComplete}`}
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                ✓
              </div>

              <div>
                <strong>
                  Property Details
                </strong>

                <span>
                  Tell us about the
                  property
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLine
              }
            />

            {/* STEP 2 */}

            <div
              className={`${styles.workflowStep} ${styles.workflowActive}`}
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                2
              </div>

              <div>
                <strong>
                  Document Guide
                </strong>

                <span>
                  Recommended
                  documents
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLine
              }
            />

            {/* STEP 3 */}

            <div
              className={
                styles.workflowStep
              }
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                3
              </div>

              <div>
                <strong>
                  Upload Documents
                </strong>

                <span>
                  Add your documents
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLine
              }
            />

            {/* STEP 4 */}

            <div
              className={
                styles.workflowStep
              }
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                4
              </div>

              <div>
                <strong>
                  Review Package
                </strong>

                <span>
                  Confirm your
                  documents
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLine
              }
            />

            {/* STEP 5 */}

            <div
              className={
                styles.workflowStep
              }
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                5
              </div>

              <div>
                <strong>
                  Select Plan
                </strong>

                <span>
                  Choose your
                  service
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLine
              }
            />

            {/* STEP 6 */}

            <div
              className={
                styles.workflowStep
              }
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                6
              </div>

              <div>
                <strong>
                  Secure Checkout
                </strong>

                <span>
                  Complete payment
                </span>
              </div>
            </div>

            <div
              className={
                styles.workflowLine
              }
            />

            {/* STEP 7 */}

            <div
              className={
                styles.workflowStep
              }
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                7
              </div>

              <div>
                <strong>
                  Verification
                </strong>

                <span>
                  AI analysis and
                  results
                </span>
              </div>
            </div>
          </section>

          {/* ==================================================
              PAGE INTRO
          ================================================== */}

          <section
            className={
              styles.introSection
            }
          >
            <div
              className={
                styles.introBadge
              }
            >
              <span>✓</span>

              DOCUMENT GUIDE
            </div>

            <h1>
              Recommended
              <br />
              <strong>
                Documents
              </strong>
            </h1>

            <p>
              Based on a{" "}
              <strong>
                {propertyType}
              </strong>
              , here are the
              documents you may need
              for a complete
              verification. You don't
              need to have all of them
              now.
            </p>
          </section>

          {/* ==================================================
              INFORMATION NOTICE
          ================================================== */}

          <section
            className={
              styles.infoNotice
            }
          >
            <div
              className={
                styles.infoIcon
              }
            >
              i
            </div>

            <div>
              <strong>
                These are recommended
                documents.
              </strong>

              <p>
                You can still continue
                even if some are
                missing. Our AI will
                identify and guide you.
              </p>
            </div>
          </section>

          {/* ==================================================
              DOCUMENT CATEGORIES
          ================================================== */}

          <section
            className={
              styles.categories
            }
          >
            {categories.map(
              (
                category,
                categoryIndex
              ) => {
                const isOpen =
                  openCategories[
                    categoryIndex
                  ] ?? true;

                return (
                  <article
                    className={
                      styles.categoryCard
                    }
                    key={
                      category.title
                    }
                  >
                    <button
                      type="button"
                      className={
                        styles.categoryHeader
                      }
                      onClick={() =>
                        toggleCategory(
                          categoryIndex
                        )
                      }
                      aria-expanded={
                        isOpen
                      }
                    >
                      <div
                        className={
                          styles.categoryTitleArea
                        }
                      >
                        <span
                          className={`${styles.categoryIcon} ${
                            styles[
                              category.iconClass
                            ]
                          }`}
                        >
                          {
                            category.icon
                          }
                        </span>

                        <div>
                          <div
                            className={
                              styles.categoryTitleRow
                            }
                          >
                            <h2>
                              {
                                category.title
                              }
                            </h2>

                            {category.badge && (
                              <span
                                className={
                                  styles.categoryBadge
                                }
                              >
                                {
                                  category.badge
                                }
                              </span>
                            )}
                          </div>

                          {category.subtitle && (
                            <span
                              className={
                                styles.categorySubtitle
                              }
                            >
                              {
                                category.subtitle
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`${styles.categoryChevron} ${
                          isOpen
                            ? styles.chevronOpen
                            : ""
                        }`}
                      >
                        ⌃
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        className={
                          styles.documentList
                        }
                      >
                        {category.documents.map(
                          (
                            document
                          ) => (
                            <div
                              className={
                                styles.documentRow
                              }
                              key={
                                document.name
                              }
                            >
                              <span
                                className={
                                  styles.documentIcon
                                }
                              >
                                {
                                  document.icon
                                }
                              </span>

                              <span
                                className={
                                  styles.documentName
                                }
                              >
                                {
                                  document.name
                                }
                              </span>

                              <span
                                className={`${styles.documentStatus} ${getStatusClass(
                                  document.status
                                )}`}
                              >
                                {
                                  document.status
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </section>

          {/* ==================================================
              NOT SURE NOTICE
          ================================================== */}

          <section
            className={
              styles.helpNotice
            }
          >
            <div
              className={
                styles.helpIcon
              }
            >
              ?
            </div>

            <div>
              <strong>
                Not sure about a
                document?
              </strong>

              <p>
                Our team will help you
                during the verification
                process.
              </p>
            </div>
          </section>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div
            className={
              styles.actions
            }
          >
            <button
              type="button"
              className={
                styles.backButton
              }
              onClick={handleBack}
            >
              <span>←</span>

              Back
            </button>

            <button
              type="button"
              className={
                styles.continueButton
              }
              onClick={
                handleContinue
              }
              disabled={
                isContinuing
              }
            >
              <span>
                {isContinuing
                  ? "Loading..."
                  : "Continue to Upload Documents"}
              </span>

              {!isContinuing && (
                <b>→</b>
              )}
            </button>
          </div>

          {/* ==================================================
              SECURITY NOTE
          ================================================== */}

          <div
            className={
              styles.securityNote
            }
          >
            <span>🔒</span>

            Your documents remain
            securely stored while your
            verification is being
            processed.
          </div>
        </div>
      </main>
    </AppShell>
  );
}