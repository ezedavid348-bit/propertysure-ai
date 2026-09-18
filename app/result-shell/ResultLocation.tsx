"use client";

import styles from "./result-shell.module.css";

export type ResultLocationData = {
  status:
    | "consistent"
    | "mismatch"
    | "inconclusive";

  statusLabel: string;

  latitude: number | null;
  longitude: number | null;

  coordinatesLabel: string;

  documentLocation: string;
  detectedLocation: string;

  confidence: number | null;

  source: string;

  distanceMeters: number | null;

  message: string;
};

type Props = {
  data: ResultLocationData;
};

function getMapUrl(
  latitude: number,
  longitude: number,
) {
  const delta = 0.015;

  const bbox =
    `${longitude - delta},` +
    `${latitude - delta},` +
    `${longitude + delta},` +
    `${latitude + delta}`;

  return (
    "https://www.openstreetmap.org/export/embed.html" +
    `?bbox=${encodeURIComponent(bbox)}` +
    "&layer=mapnik" +
    `&marker=${encodeURIComponent(
      `${latitude},${longitude}`,
    )}`
  );
}

function getMapsLink(
  latitude: number,
  longitude: number,
) {
  return (
    "https://www.google.com/maps/search/" +
    `?api=1&query=${encodeURIComponent(
      `${latitude},${longitude}`,
    )}`
  );
}

export default function ResultLocation({
  data,
}: Props) {
  const {
    latitude,
    longitude,
  } = data;

  /*
   * Keep the actual coordinate values in local
   * constants so TypeScript can safely narrow
   * them after the null check below.
   */
  const hasCoordinates =
    typeof latitude === "number" &&
    typeof longitude === "number";

  const statusClass =
    data.status === "consistent"
      ? styles.locationStatusConsistent
      : data.status === "mismatch"
        ? styles.locationStatusMismatch
        : styles.locationStatusInconclusive;

  return (
    <section className={styles.locationCard}>
      <div className={styles.locationHeader}>
        <div className={styles.locationHeading}>
          <div
            className={styles.locationIcon}
            aria-hidden="true"
          >
            ⌖
          </div>

          <div>
            <span
              className={styles.locationEyebrow}
            >
              GEOGRAPHIC VERIFICATION SIGNAL
            </span>

            <h2>
              Property Location &amp; GPS Analysis
            </h2>

            <p>
              Available GPS and location information
              is compared with the property location
              stated in the submitted documents.
            </p>
          </div>
        </div>

        <span
          className={`${styles.locationStatus} ${statusClass}`}
        >
          {data.statusLabel}
        </span>
      </div>

      <div className={styles.locationGrid}>
        <div className={styles.locationMetric}>
          <span>GPS Coordinates</span>

          <strong>
            {data.coordinatesLabel}
          </strong>
        </div>

        <div className={styles.locationMetric}>
          <span>
            Document-Stated Location
          </span>

          <strong>
            {data.documentLocation}
          </strong>
        </div>

        <div className={styles.locationMetric}>
          <span>
            Detected / Reported Location
          </span>

          <strong>
            {data.detectedLocation}
          </strong>
        </div>

        <div className={styles.locationMetric}>
          <span>Location Confidence</span>

          <strong>
            {data.confidence !== null
              ? `${data.confidence}%`
              : "Not available"}
          </strong>
        </div>

        <div className={styles.locationMetric}>
          <span>Location Source</span>

          <strong>
            {data.source}
          </strong>
        </div>

        <div className={styles.locationMetric}>
          <span>Distance Analysis</span>

          <strong>
            {data.distanceMeters !== null
              ? `${data.distanceMeters.toLocaleString(
                  "en-NG",
                )} m`
              : "Not available"}
          </strong>
        </div>
      </div>

      <div className={styles.locationMessage}>
        <div
          className={
            styles.locationMessageIcon
          }
          aria-hidden="true"
        >
          {data.status === "mismatch"
            ? "!"
            : data.status === "consistent"
              ? "✓"
              : "i"}
        </div>

        <div>
          <strong>
            {data.statusLabel}
          </strong>

          <p>{data.message}</p>
        </div>
      </div>

      <div
        className={styles.locationMapPanel}
      >
        <div
          className={
            styles.locationMapHeader
          }
        >
          <div>
            <span>
              PROPERTY LOCATION MAP
            </span>

            <strong>
              Geographic Reference
            </strong>
          </div>

          <span
            className={
              styles.locationCoordinateBadge
            }
          >
            {hasCoordinates
              ? "Coordinates available"
              : "Not available"}
          </span>
        </div>

        {hasCoordinates ? (
          <div
            className={
              styles.locationMapFrame
            }
          >
            <iframe
              title="Property location map"
              src={getMapUrl(
                latitude,
                longitude,
              )}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div
              className={
                styles.locationMapOverlay
              }
            >
              <span>
                Property Coordinates
              </span>

              <strong>
                {data.coordinatesLabel}
              </strong>
            </div>
          </div>
        ) : (
          <div
            className={
              styles.locationMapUnavailable
            }
          >
            <div
              className={
                styles.locationMapUnavailableIcon
              }
              aria-hidden="true"
            >
              ⌖
            </div>

            <div>
              <strong>
                Map unavailable
              </strong>

              <p>
                A property map will appear
                here when usable GPS
                coordinates are available
                from the verification data.
              </p>
            </div>
          </div>
        )}

        {hasCoordinates ? (
          <div
            className={
              styles.locationMapFooter
            }
          >
            <span>
              Geographic reference based on
              the available verification
              coordinates.
            </span>

            <a
              href={getMapsLink(
                latitude,
                longitude,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Maps{" "}
              <span aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        ) : null}
      </div>

      <p
        className={
          styles.locationDisclaimer
        }
      >
        GPS is an additional geographic
        verification signal. It can help
        identify inconsistencies between the
        reported property location and the
        submitted documents, but it does not
        by itself establish document
        authenticity, ownership, or government
        issuance.
      </p>
    </section>
  );
}