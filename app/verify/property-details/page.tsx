"use client";

import {
  useEffect,
  useState,
} from "react";

import AppShell from "../../AppShell/AppShell";

import styles from "./property-details.module.css";

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

const STORAGE_KEY =
  "propertysure-property-details";

const propertyTypes = [
  "Residential Land",
  "Residential Property",
  "Commercial Property",
  "Commercial Land",
  "Agricultural Land",
  "Industrial Property",
  "Industrial Land",
  "Mixed-Use Property",
  "Other",
];

const residentialSubtypes = [
  "Bare Land",
  "Developed Land",
  "House",
  "Duplex",
  "Apartment",
  "Estate Property",
  "Other",
];

const commercialSubtypes = [
  "Office",
  "Shop",
  "Plaza",
  "Warehouse",
  "Hotel",
  "Commercial Land",
  "Other",
];

const agriculturalSubtypes = [
  "Farmland",
  "Plantation",
  "Agricultural Estate",
  "Farm Building",
  "Other",
];

const industrialSubtypes = [
  "Factory",
  "Industrial Land",
  "Warehouse",
  "Processing Facility",
  "Other",
];

const mixedUseSubtypes = [
  "Residential & Commercial",
  "Residential & Office",
  "Commercial & Industrial",
  "Other",
];

const sizeUnits = [
  "sqm",
  "hectares",
  "acres",
  "plots",
];

function getSubtypes(
  propertyType: string
): string[] {
  if (
    propertyType ===
    "Residential Land"
  ) {
    return residentialSubtypes;
  }

  if (
    propertyType ===
    "Residential Property"
  ) {
    return residentialSubtypes;
  }

  if (
    propertyType ===
    "Commercial Property" ||
    propertyType ===
    "Commercial Land"
  ) {
    return commercialSubtypes;
  }

  if (
    propertyType ===
    "Agricultural Land"
  ) {
    return agriculturalSubtypes;
  }

  if (
    propertyType ===
    "Industrial Property" ||
    propertyType ===
    "Industrial Land"
  ) {
    return industrialSubtypes;
  }

  if (
    propertyType ===
    "Mixed-Use Property"
  ) {
    return mixedUseSubtypes;
  }

  return [];
}

export default function PropertyDetailsPage() {
  const [
    propertyType,
    setPropertyType,
  ] = useState("");

  const [
    propertySubtype,
    setPropertySubtype,
  ] = useState("");

  const [
    estimatedSize,
    setEstimatedSize,
  ] = useState("");

  const [
    sizeUnit,
    setSizeUnit,
  ] = useState("sqm");

  const [
    estimatedValue,
    setEstimatedValue,
  ] = useState("");

  const [
    propertyDescription,
    setPropertyDescription,
  ] = useState("");

  const [
    ownerType,
    setOwnerType,
  ] = useState("Individual");

  const [
    ownerName,
    setOwnerName,
  ] = useState("");

  const [
    agentDeveloper,
    setAgentDeveloper,
  ] = useState("");

  const [
    verificationPurpose,
    setVerificationPurpose,
  ] = useState("To buy");

  const [error, setError] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const subtypes =
    getSubtypes(propertyType);

  useEffect(() => {
    try {
      const saved =
        sessionStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const details =
        JSON.parse(
          saved
        ) as Partial<PropertyDetails>;

      setPropertyType(
        details.propertyType || ""
      );

      setPropertySubtype(
        details.propertySubtype || ""
      );

      setEstimatedSize(
        details.estimatedSize || ""
      );

      setSizeUnit(
        details.sizeUnit || "sqm"
      );

      setEstimatedValue(
        details.estimatedValue || ""
      );

      setPropertyDescription(
        details.propertyDescription || ""
      );

      setOwnerType(
        details.ownerType ||
          "Individual"
      );

      setOwnerName(
        details.ownerName || ""
      );

      setAgentDeveloper(
        details.agentDeveloper || ""
      );

      setVerificationPurpose(
        details.verificationPurpose ||
          "To buy"
      );
    } catch (storageError) {
      console.warn(
        "Could not restore property details:",
        storageError
      );
    }
  }, []);

  function handlePropertyTypeChange(
    value: string
  ) {
    setPropertyType(value);

    setPropertySubtype("");

    setError("");
  }

  function handleContinue() {
    setError("");

    if (!propertyType) {
      setError(
        "Please select a property type before continuing."
      );

      return;
    }

    if (!ownerType) {
      setError(
        "Please select the seller / owner type."
      );

      return;
    }

    if (!verificationPurpose) {
      setError(
        "Please select the purpose of this verification."
      );

      return;
    }

    const details: PropertyDetails = {
      propertyType,
      propertySubtype,
      estimatedSize:
        estimatedSize.trim(),
      sizeUnit,
      estimatedValue:
        estimatedValue.trim(),
      currency: "NGN",
      propertyDescription:
        propertyDescription.trim(),
      ownerType,
      ownerName:
        ownerName.trim(),
      agentDeveloper:
        agentDeveloper.trim(),
      verificationPurpose,
    };

    try {
      setIsSaving(true);

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(details)
      );

      window.location.href =
        "/verify/document-guide";
    } catch (storageError) {
      console.error(
        "Could not save property details:",
        storageError
      );

      setError(
        "We could not save your property details. Please try again."
      );

      setIsSaving(false);
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
              WORKFLOW
          ================================================== */}

          <section
            className={
              styles.workflowCard
            }
          >
            {/* STEP 1 */}

            <div
              className={`${styles.workflowStep} ${styles.workflowActive}`}
            >
              <div
                className={
                  styles.workflowNumber
                }
              >
                1
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
              className={
                styles.workflowStep
              }
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
                styles.introEyebrow
              }
            >
              PROPERTY INFORMATION
            </div>

            <h1>
              Property Details
            </h1>

            <p>
              Tell us about the
              property you want to
              verify. This helps us
              provide the right
              document guidance and a
              more accurate report.
            </p>
          </section>

          {/* ==================================================
              PROPERTY INFORMATION
          ================================================== */}

          <section
            className={
              styles.formCard
            }
          >
            <div
              className={
                styles.cardHeading
              }
            >
              <div
                className={
                  styles.cardIcon
                }
              >
                ▦
              </div>

              <div>
                <h2>
                  Property Information
                </h2>
              </div>
            </div>

            {/* PROPERTY TYPE */}

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="propertyType"
              >
                Property Type{" "}
                <span>*</span>
              </label>

              <div
                className={
                  styles.selectWrapper
                }
              >
                <select
                  id="propertyType"
                  value={propertyType}
                  onChange={(event) =>
                    handlePropertyTypeChange(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select property
                    type
                  </option>

                  {propertyTypes.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>

                <span>⌄</span>
              </div>
            </div>

            {/* PROPERTY SUBTYPE */}

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="propertySubtype"
              >
                Property Subtype{" "}
                <em>
                  (Optional)
                </em>
              </label>

              <div
                className={
                  styles.selectWrapper
                }
              >
                <select
                  id="propertySubtype"
                  value={propertySubtype}
                  onChange={(event) =>
                    setPropertySubtype(
                      event.target.value
                    )
                  }
                  disabled={
                    subtypes.length === 0
                  }
                >
                  <option value="">
                    {subtypes.length > 0
                      ? "Select subtype"
                      : "Select property type first"}
                  </option>

                  {subtypes.map(
                    (subtype) => (
                      <option
                        key={subtype}
                        value={subtype}
                      >
                        {subtype}
                      </option>
                    )
                  )}
                </select>

                <span>⌄</span>
              </div>
            </div>

            {/* SIZE + VALUE */}

            <div
              className={
                styles.twoColumn
              }
            >
              <div
                className={
                  styles.field
                }
              >
                <label
                  htmlFor="estimatedSize"
                >
                  Estimated Size{" "}
                  <em>
                    (Optional)
                  </em>
                </label>

                <div
                  className={
                    styles.inputWithSelect
                  }
                >
                  <input
                    id="estimatedSize"
                    type="text"
                    inputMode="decimal"
                    value={
                      estimatedSize
                    }
                    onChange={(event) =>
                      setEstimatedSize(
                        event.target.value
                      )
                    }
                    placeholder="e.g. 1,000"
                  />

                  <select
                    value={sizeUnit}
                    onChange={(event) =>
                      setSizeUnit(
                        event.target.value
                      )
                    }
                    aria-label="Size unit"
                  >
                    {sizeUnits.map(
                      (unit) => (
                        <option
                          key={unit}
                          value={unit}
                        >
                          {unit}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div
                className={
                  styles.field
                }
              >
                <label
                  htmlFor="estimatedValue"
                >
                  Estimated Value{" "}
                  <em>
                    (Optional)
                  </em>
                </label>

                <div
                  className={
                    styles.valueInput
                  }
                >
                  <div
                    className={
                      styles.currency
                    }
                  >
                    <span>
                      ₦
                    </span>

                    <select
                      aria-label="Currency"
                      defaultValue="NGN"
                    >
                      <option value="NGN">
                        NGN
                      </option>
                    </select>
                  </div>

                  <input
                    id="estimatedValue"
                    type="text"
                    inputMode="numeric"
                    value={
                      estimatedValue
                    }
                    onChange={(event) =>
                      setEstimatedValue(
                        event.target.value
                      )
                    }
                    placeholder="e.g. 50,000,000"
                  />
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="propertyDescription"
              >
                Property Description{" "}
                <em>
                  (Optional)
                </em>
              </label>

              <textarea
                id="propertyDescription"
                value={
                  propertyDescription
                }
                onChange={(event) =>
                  setPropertyDescription(
                    event.target.value
                  )
                }
                maxLength={500}
                placeholder="e.g. Fenced land, existing structure, corner piece, etc."
              />

              <div
                className={
                  styles.characterCount
                }
              >
                {
                  propertyDescription.length
                }
                /500
              </div>
            </div>
          </section>

          {/* ==================================================
              PARTIES INVOLVED
          ================================================== */}

          <section
            className={
              styles.formCard
            }
          >
            <div
              className={
                styles.cardHeading
              }
            >
              <div
                className={`${styles.cardIcon} ${styles.peopleIcon}`}
              >
                ●
              </div>

              <div>
                <h2>
                  Parties Involved
                </h2>

                <p>
                  Tell us about the
                  seller/owner and
                  agent (if any).
                </p>
              </div>
            </div>

            {/* OWNER TYPE */}

            <div
              className={
                styles.field
              }
            >
              <label>
                Seller / Owner Type{" "}
                <span>*</span>
              </label>

              <div
                className={
                  styles.radioGrid
                }
              >
                {[
                  "Individual",
                  "Company",
                  "Government",
                  "Not sure",
                ].map((type) => (
                  <label
                    className={
                      styles.radioOption
                    }
                    key={type}
                  >
                    <input
                      type="radio"
                      name="ownerType"
                      value={type}
                      checked={
                        ownerType ===
                        type
                      }
                      onChange={() =>
                        setOwnerType(
                          type
                        )
                      }
                    />

                    <span
                      className={
                        styles.radioCircle
                      }
                    />

                    <span>
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* OWNER NAME */}

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="ownerName"
              >
                Seller / Owner Name{" "}
                <em>
                  (Optional)
                </em>
              </label>

              <input
                id="ownerName"
                type="text"
                value={ownerName}
                onChange={(event) =>
                  setOwnerName(
                    event.target.value
                  )
                }
                placeholder="e.g. John Doe or ABC Properties Ltd"
              />
            </div>

            {/* AGENT / DEVELOPER */}

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="agentDeveloper"
              >
                Agent / Developer{" "}
                <em>
                  (Optional)
                </em>
              </label>

              <input
                id="agentDeveloper"
                type="text"
                value={
                  agentDeveloper
                }
                onChange={(event) =>
                  setAgentDeveloper(
                    event.target.value
                  )
                }
                placeholder="e.g. XYZ Realty"
              />
            </div>
          </section>

          {/* ==================================================
              VERIFICATION PURPOSE
          ================================================== */}

          <section
            className={
              styles.formCard
            }
          >
            <div
              className={
                styles.cardHeading
              }
            >
              <div
                className={`${styles.cardIcon} ${styles.purposeIcon}`}
              >
                ▣
              </div>

              <div>
                <h2>
                  Verification
                  Purpose
                </h2>

                <p>
                  Let us know why you
                  are verifying this
                  property.
                </p>
              </div>
            </div>

            <div
              className={
                styles.purposeGrid
              }
            >
              {[
                "To buy",
                "To invest",
                "Due diligence",
                "Other",
              ].map((purpose) => (
                <label
                  className={
                    styles.radioOption
                  }
                  key={purpose}
                >
                  <input
                    type="radio"
                    name="verificationPurpose"
                    value={purpose}
                    checked={
                      verificationPurpose ===
                      purpose
                    }
                    onChange={() =>
                      setVerificationPurpose(
                        purpose
                      )
                    }
                  />

                  <span
                    className={
                      styles.radioCircle
                    }
                  />

                  <span>
                    {purpose}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div
              className={
                styles.errorMessage
              }
            >
              <span>!</span>

              <p>
                {error}
              </p>
            </div>
          )}

          {/* ==================================================
              CONTINUE
          ================================================== */}

          <button
            type="button"
            className={
              styles.continueButton
            }
            onClick={
              handleContinue
            }
            disabled={isSaving}
          >
            <span>
              {isSaving
                ? "Saving..."
                : "Continue to Document Guide"}
            </span>

            {!isSaving && (
              <b>→</b>
            )}
          </button>
        </div>
      </main>
    </AppShell>
  );
}