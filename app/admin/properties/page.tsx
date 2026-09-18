"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

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

type FilterStatus = "all" | string;

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(value: string | null) {
  if (!value) {
    return "—";
  }

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function displayValue(value: string | null) {
  if (!value || !value.trim()) {
    return "—";
  }

  return value;
}

function statusLabel(status: string | null) {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusStyle(status: string | null): React.CSSProperties {
  const normalized = status?.toLowerCase();

  if (
    normalized === "verified" ||
    normalized === "approved" ||
    normalized === "complete" ||
    normalized === "completed"
  ) {
    return {
      background: "#ecfdf3",
      color: "#137a4a",
      border: "1px solid #c9ecd9",
    };
  }

  if (
    normalized === "flagged" ||
    normalized === "rejected" ||
    normalized === "failed"
  ) {
    return {
      background: "#fff1f1",
      color: "#b4232d",
      border: "1px solid #f2cccc",
    };
  }

  if (
    normalized === "processing" ||
    normalized === "pending" ||
    normalized === "under_review" ||
    normalized === "review"
  ) {
    return {
      background: "#fff8e8",
      color: "#956300",
      border: "1px solid #f1dfb0",
    };
  }

  return {
    background: "#f4f6f8",
    color: "#64748b",
    border: "1px solid #e2e8f0",
  };
}

export default function AdminPropertiesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [properties, setProperties] = useState<Property[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<FilterStatus>("all");

  const [selectedProperty, setSelectedProperty] =
    useState<Property | null>(null);

  const checkAdminAndLoad = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/signin");
        return;
      }

      setEmail(user.email ?? "");

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminError) {
        console.error(
          "Admin access check failed:",
          adminError
        );

        router.replace("/dashboard");
        return;
      }

      if (!admin) {
        router.replace("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .select(
          `
            id,
            user_id,
            name,
            property_type,
            relationship,
            owner_name,
            owner_contact,
            image_url,
            state,
            lga,
            address,
            size,
            asking_price,
            description,
            verification_status,
            created_at,
            updated_at
          `
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Unable to load properties:",
          error
        );

        setErrorMessage(
          "Property records could not be loaded right now."
        );

        setLoading(false);
        return;
      }

      setProperties((data ?? []) as Property[]);
      setLoading(false);
    } catch (error) {
      console.error(
        "Unexpected admin properties error:",
        error
      );

      setErrorMessage(
        "Something went wrong while loading property records."
      );

      setLoading(false);
    }
  }, [router]);

  async function refreshProperties() {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/signin");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminError || !admin) {
        router.replace("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .select(
          `
            id,
            user_id,
            name,
            property_type,
            relationship,
            owner_name,
            owner_contact,
            image_url,
            state,
            lga,
            address,
            size,
            asking_price,
            description,
            verification_status,
            created_at,
            updated_at
          `
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Unable to refresh properties:",
          error
        );

        setErrorMessage(
          "Property records could not be refreshed."
        );

        return;
      }

      setProperties((data ?? []) as Property[]);
    } catch (error) {
      console.error(
        "Unexpected property refresh error:",
        error
      );

      setErrorMessage(
        "Something went wrong while refreshing property records."
      );
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    checkAdminAndLoad();
  }, [checkAdminAndLoad]);

  const availableStatuses = useMemo(() => {
    const statuses = properties
      .map((property) => property.verification_status)
      .filter(Boolean);

    return Array.from(new Set(statuses));
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesSearch =
        !query ||
        property.name.toLowerCase().includes(query) ||
        property.property_type.toLowerCase().includes(query) ||
        property.relationship.toLowerCase().includes(query) ||
        (property.owner_name ?? "")
          .toLowerCase()
          .includes(query) ||
        (property.owner_contact ?? "")
          .toLowerCase()
          .includes(query) ||
        property.state.toLowerCase().includes(query) ||
        property.lga.toLowerCase().includes(query) ||
        property.address.toLowerCase().includes(query) ||
        (property.asking_price ?? "")
          .toLowerCase()
          .includes(query) ||
        property.verification_status
          .toLowerCase()
          .includes(query) ||
        property.user_id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        property.verification_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [properties, search, statusFilter]);

  const stats = useMemo(() => {
    const statusCounts = properties.reduce<
      Record<string, number>
    >((counts, property) => {
      const status = property.verification_status || "unknown";

      counts[status] = (counts[status] ?? 0) + 1;

      return counts;
    }, {});

    return {
      total: properties.length,

      verified:
        (statusCounts.verified ?? 0) +
        (statusCounts.approved ?? 0) +
        (statusCounts.complete ?? 0) +
        (statusCounts.completed ?? 0),

      pending:
        (statusCounts.pending ?? 0) +
        (statusCounts.processing ?? 0),

      review:
        (statusCounts.review ?? 0) +
        (statusCounts.under_review ?? 0),

      flagged:
        (statusCounts.flagged ?? 0) +
        (statusCounts.rejected ?? 0) +
        (statusCounts.failed ?? 0),
    };
  }, [properties]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={loadingContainerStyle}>
          <h2 style={loadingTitleStyle}>
            PropertySure AI
          </h2>

          <p style={loadingTextStyle}>
            Loading property center...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={topBarStyle}>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            style={backButtonStyle}
          >
            ← Admin Dashboard
          </button>

          <button
            type="button"
            onClick={refreshProperties}
            disabled={refreshing}
            style={{
              ...refreshButtonStyle,
              opacity: refreshing ? 0.6 : 1,
              cursor: refreshing
                ? "default"
                : "pointer",
            }}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        <header style={headerStyle}>
          <div>
            <p style={eyebrowStyle}>
              PROPERTYSURE AI ADMINISTRATION
            </p>

            <h1 style={titleStyle}>
              Properties
            </h1>

            <p style={subtitleStyle}>
              View properties submitted through PropertySure AI
              and inspect their recorded information.
            </p>
          </div>

          <div style={administratorStyle}>
            <span style={administratorLabelStyle}>
              ADMINISTRATOR
            </span>

            <strong style={administratorEmailStyle}>
              {email}
            </strong>
          </div>
        </header>

        {errorMessage && (
          <div
            role="alert"
            style={errorStyle}
          >
            {errorMessage}
          </div>
        )}

        <section style={statsGridStyle}>
          <AdminStat
            label="Total Properties"
            value={stats.total}
          />

          <AdminStat
            label="Verified"
            value={stats.verified}
          />

          <AdminStat
            label="Pending"
            value={stats.pending}
          />

          <AdminStat
            label="Under Review"
            value={stats.review}
          />

          <AdminStat
            label="Flagged"
            value={stats.flagged}
          />
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <p style={sectionEyebrowStyle}>
                PROPERTY ACTIVITY
              </p>

              <h2 style={panelTitleStyle}>
                Property Records
              </h2>

              <p style={panelSubtitleStyle}>
                Select a property to inspect its recorded
                information and verification status.
              </p>
            </div>
          </div>

          <div style={toolbarStyle}>
            <div style={searchWrapperStyle}>
              <span style={searchIconStyle}>
                ⌕
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search properties..."
                style={searchInputStyle}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              style={filterSelectStyle}
            >
              <option value="all">
                All statuses
              </option>

              {availableStatuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {filteredProperties.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyIconStyle}>
                ✓
              </div>

              <h3 style={emptyTitleStyle}>
                No property records found
              </h3>

              <p style={emptyTextStyle}>
                {properties.length === 0
                  ? "There are currently no property records available."
                  : "No property records match your current search or filter."}
              </p>
            </div>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      PROPERTY
                    </th>

                    <th style={thStyle}>
                      LOCATION
                    </th>

                    <th style={thStyle}>
                      OWNER
                    </th>

                    <th style={thStyle}>
                      STATUS
                    </th>

                    <th style={thStyle}>
                      ASKING PRICE
                    </th>

                    <th style={thStyle}>
                      CREATED
                    </th>

                    <th style={thStyle}>
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProperties.map(
                    (property) => (
                      <tr key={property.id}>
                        <td style={tdStyle}>
                          <div style={documentNameStyle}>
                            {property.name}
                          </div>

                          <div style={secondaryTextStyle}>
                            {property.property_type}
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <div style={locationPrimaryStyle}>
                            {property.lga},{" "}
                            {property.state}
                          </div>

                          <div style={secondaryTextStyle}>
                            {property.address}
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <div style={locationPrimaryStyle}>
                            {displayValue(
                              property.owner_name
                            )}
                          </div>

                          <div style={secondaryTextStyle}>
                            {shortId(property.user_id)}
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              ...statusPillStyle,
                              ...statusStyle(
                                property.verification_status
                              ),
                            }}
                          >
                            {statusLabel(
                              property.verification_status
                            )}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <span style={priceStyle}>
                            {displayValue(
                              property.asking_price
                            )}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={secondaryTextStyle}
                          >
                            {formatDate(
                              property.created_at
                            )}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProperty(
                                property
                              )
                            }
                            style={reviewButtonStyle}
                          >
                            Review →
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div style={panelFooterStyle}>
            Showing{" "}
            <strong>
              {filteredProperties.length}
            </strong>{" "}
            of{" "}
            <strong>
              {properties.length}
            </strong>{" "}
            property records.
          </div>
        </section>
      </div>

      {selectedProperty && (
        <div
          style={modalOverlayStyle}
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setSelectedProperty(null);
            }
          }}
        >
          <section style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <p style={sectionEyebrowStyle}>
                  PROPERTY DETAILS
                </p>

                <h2 style={modalTitleStyle}>
                  {selectedProperty.name}
                </h2>

                <p style={modalSubtitleStyle}>
                  Created{" "}
                  {formatDate(
                    selectedProperty.created_at
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedProperty(null)
                }
                style={closeButtonStyle}
                aria-label="Close property details"
              >
                ×
              </button>
            </div>

            <div style={modalBodyStyle}>
              {selectedProperty.image_url && (
                <div style={imageSectionStyle}>
                  <img
                    src={selectedProperty.image_url}
                    alt={selectedProperty.name}
                    style={propertyImageStyle}
                  />
                </div>
              )}

              <div style={detailGridStyle}>
                <DetailItem
                  label="Property Name"
                  value={selectedProperty.name}
                />

                <DetailItem
                  label="Property Type"
                  value={selectedProperty.property_type}
                />

                <DetailItem
                  label="Relationship"
                  value={selectedProperty.relationship}
                />

                <DetailItem
                  label="Verification Status"
                  value={statusLabel(
                    selectedProperty.verification_status
                  )}
                />

                <DetailItem
                  label="Owner Name"
                  value={displayValue(
                    selectedProperty.owner_name
                  )}
                />

                <DetailItem
                  label="Owner Contact"
                  value={displayValue(
                    selectedProperty.owner_contact
                  )}
                />

                <DetailItem
                  label="State"
                  value={selectedProperty.state}
                />

                <DetailItem
                  label="LGA"
                  value={selectedProperty.lga}
                />

                <DetailItem
                  label="Property Size"
                  value={displayValue(
                    selectedProperty.size
                  )}
                />

                <DetailItem
                  label="Asking Price"
                  value={displayValue(
                    selectedProperty.asking_price
                  )}
                />

                <DetailItem
                  label="User ID"
                  value={selectedProperty.user_id}
                  fullWidth
                />

                <DetailItem
                  label="Property ID"
                  value={selectedProperty.id}
                  fullWidth
                />

                <DetailItem
                  label="Address"
                  value={selectedProperty.address}
                  fullWidth
                />
              </div>

              <div style={detailSectionStyle}>
                <p style={detailLabelStyle}>
                  DESCRIPTION
                </p>

                <div style={descriptionStyle}>
                  {displayValue(
                    selectedProperty.description
                  )}
                </div>
              </div>

              <div style={detailSectionStyle}>
                <p style={detailLabelStyle}>
                  RECORD INFORMATION
                </p>

                <div style={detailGridStyle}>
                  <DetailItem
                    label="Created"
                    value={formatDate(
                      selectedProperty.created_at
                    )}
                  />

                  <DetailItem
                    label="Last Updated"
                    value={formatDate(
                      selectedProperty.updated_at
                    )}
                  />
                </div>
              </div>
            </div>

            <div style={modalFooterStyle}>
              <button
                type="button"
                onClick={() =>
                  setSelectedProperty(null)
                }
                style={closeFooterButtonStyle}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function AdminStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={statCardStyle}>
      <div style={statLabelStyle}>
        {label}
      </div>

      <strong style={statValueStyle}>
        {value}
      </strong>
    </div>
  );
}

function DetailItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      style={{
        ...(fullWidth
          ? {
              gridColumn: "1 / -1",
            }
          : {}),
      }}
    >
      <p style={detailLabelStyle}>
        {label}
      </p>

      <div style={detailValueStyle}>
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f7f9fc",
  fontFamily: "Arial, sans-serif",
  padding: "36px 24px 60px",
  color: "#102a43",
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "1400px",
  margin: "0 auto",
};

const loadingContainerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const loadingTitleStyle: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#102a43",
  fontSize: "24px",
};

const loadingTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "14px",
};

const topBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  marginBottom: "18px",
};

const backButtonStyle: React.CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#1676c5",
  padding: "6px 0",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
};

const refreshButtonStyle: React.CSSProperties = {
  border: "1px solid #d8e1eb",
  background: "#ffffff",
  color: "#315878",
  borderRadius: "8px",
  padding: "9px 14px",
  fontSize: "12px",
  fontWeight: 700,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "24px",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "28px",
  marginBottom: "20px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: "0 0 8px",
  color: "#1676c5",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 8px",
  color: "#102a43",
  fontSize: "30px",
  lineHeight: 1.2,
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: "680px",
  color: "#64748b",
  fontSize: "14px",
  lineHeight: 1.6,
};

const administratorStyle: React.CSSProperties = {
  minWidth: "220px",
  padding: "14px 16px",
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
};

const administratorLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "7px",
  color: "#94a3b8",
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const administratorEmailStyle: React.CSSProperties = {
  display: "block",
  color: "#315878",
  fontSize: "12px",
  wordBreak: "break-word",
};

const errorStyle: React.CSSProperties = {
  marginBottom: "20px",
  padding: "13px 16px",
  border: "1px solid #f0caca",
  borderRadius: "10px",
  background: "#fff6f6",
  color: "#b4232d",
  fontSize: "13px",
  lineHeight: 1.5,
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
  marginBottom: "20px",
};

const statCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "13px",
  padding: "18px",
};

const statLabelStyle: React.CSSProperties = {
  marginBottom: "9px",
  color: "#64748b",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const statValueStyle: React.CSSProperties = {
  color: "#102a43",
  fontSize: "25px",
  lineHeight: 1,
};

const panelStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  overflow: "hidden",
};

const panelHeaderStyle: React.CSSProperties = {
  padding: "24px 24px 18px",
};

const sectionEyebrowStyle: React.CSSProperties = {
  margin: "0 0 7px",
  color: "#1676c5",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const panelTitleStyle: React.CSSProperties = {
  margin: "0 0 7px",
  color: "#102a43",
  fontSize: "21px",
};

const panelSubtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "12px",
  lineHeight: 1.5,
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  padding: "0 24px 20px",
  flexWrap: "wrap",
};

const searchWrapperStyle: React.CSSProperties = {
  flex: "1 1 320px",
  minWidth: "240px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  border: "1px solid #dce4ec",
  background: "#ffffff",
  borderRadius: "9px",
  padding: "0 12px",
};

const searchIconStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "16px",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  border: 0,
  outline: 0,
  background: "transparent",
  padding: "11px 0",
  color: "#102a43",
  fontSize: "12px",
};

const filterSelectStyle: React.CSSProperties = {
  minWidth: "170px",
  border: "1px solid #dce4ec",
  background: "#ffffff",
  borderRadius: "9px",
  padding: "11px 12px",
  color: "#315878",
  fontSize: "12px",
  outline: 0,
};

const tableWrapperStyle: React.CSSProperties = {
  width: "100%",
  overflowX: "auto",
  borderTop: "1px solid #edf1f5",
  borderBottom: "1px solid #edf1f5",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  minWidth: "1150px",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  padding: "13px 16px",
  textAlign: "left",
  color: "#94a3b8",
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.07em",
  borderBottom: "1px solid #edf1f5",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "16px",
  verticalAlign: "top",
  borderBottom: "1px solid #f0f3f6",
  fontSize: "12px",
};

const documentNameStyle: React.CSSProperties = {
  marginBottom: "5px",
  color: "#102a43",
  fontSize: "12px",
  fontWeight: 700,
};

const locationPrimaryStyle: React.CSSProperties = {
  marginBottom: "5px",
  color: "#315878",
  fontSize: "11px",
  fontWeight: 600,
};

const secondaryTextStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "10px",
  lineHeight: 1.5,
};

const priceStyle: React.CSSProperties = {
  color: "#102a43",
  fontSize: "11px",
  fontWeight: 700,
};

const statusPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "999px",
  padding: "5px 8px",
  fontSize: "9px",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const reviewButtonStyle: React.CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#1676c5",
  padding: 0,
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const panelFooterStyle: React.CSSProperties = {
  padding: "14px 24px",
  color: "#94a3b8",
  fontSize: "10px",
};

const emptyStateStyle: React.CSSProperties = {
  padding: "70px 24px",
  textAlign: "center",
  borderTop: "1px solid #edf1f5",
  borderBottom: "1px solid #edf1f5",
};

const emptyIconStyle: React.CSSProperties = {
  width: "42px",
  height: "42px",
  margin: "0 auto 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "#eef6ff",
  color: "#1676c5",
  fontSize: "18px",
  fontWeight: 700,
};

const emptyTitleStyle: React.CSSProperties = {
  margin: "0 0 7px",
  color: "#102a43",
  fontSize: "16px",
};

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "12px",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background: "rgba(15, 23, 42, 0.45)",
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "850px",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  background: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  boxShadow:
    "0 20px 60px rgba(15, 23, 42, 0.18)",
  overflow: "hidden",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "18px",
  padding: "24px",
  borderBottom: "1px solid #edf1f5",
};

const modalTitleStyle: React.CSSProperties = {
  margin: "0 0 6px",
  color: "#102a43",
  fontSize: "21px",
};

const modalSubtitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "11px",
};

const closeButtonStyle: React.CSSProperties = {
  width: "32px",
  height: "32px",
  border: "1px solid #dce4ec",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#64748b",
  fontSize: "20px",
  lineHeight: 1,
  cursor: "pointer",
};

const modalBodyStyle: React.CSSProperties = {
  padding: "24px",
  overflowY: "auto",
};

const imageSectionStyle: React.CSSProperties = {
  marginBottom: "24px",
};

const propertyImageStyle: React.CSSProperties = {
  width: "100%",
  maxHeight: "280px",
  objectFit: "cover",
  display: "block",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
};

const detailGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "20px",
};

const detailLabelStyle: React.CSSProperties = {
  margin: "0 0 7px",
  color: "#94a3b8",
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
};

const detailValueStyle: React.CSSProperties = {
  color: "#315878",
  fontSize: "12px",
  lineHeight: 1.5,
  wordBreak: "break-word",
};

const detailSectionStyle: React.CSSProperties = {
  marginTop: "26px",
  paddingTop: "22px",
  borderTop: "1px solid #edf1f5",
};

const descriptionStyle: React.CSSProperties = {
  padding: "16px",
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  color: "#475569",
  fontSize: "12px",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
};

const modalFooterStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  padding: "16px 24px",
  borderTop: "1px solid #edf1f5",
};

const closeFooterButtonStyle: React.CSSProperties = {
  border: "1px solid #d8e1eb",
  background: "#ffffff",
  color: "#315878",
  borderRadius: "8px",
  padding: "9px 16px",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
};