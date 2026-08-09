"use client";

import { useState } from "react";

type DocumentStatus = "verified" | "review" | "processing";

type Property = {
  id: number;
  name: string;
  location: string;
  image: string;
  documents: {
    name: string;
    status: DocumentStatus;
  }[];
  overallStatus: "Verification Complete" | "Review Required" | "Processing";
};

const properties: Property[] = [
  {
    id: 1,
    name: "Lekki Phase 1 Property",
    location: "Lekki, Lagos State",
  
     image: "/properties/lekki-property.jpg",
    documents: [
      { name: "Certificate of Occupancy", status: "verified" },
      { name: "Deed of Assignment", status: "verified" },
      { name: "Survey Plan", status: "verified" },
      { name: "Allocation Letter", status: "verified" },
    ],
    overallStatus: "Verification Complete",
  },
  {
    id: 2,
    name: "Maitama Residence",
    location: "Maitama, Abuja FCT",
   
    image: "/properties/maitama-property.jpg",
    documents: [
      { name: "Certificate of Occupancy", status: "verified" },
      { name: "Deed of Assignment", status: "verified" },
      { name: "Survey Plan", status: "review" },
      { name: "Allocation Letter", status: "verified" },
    ],
    overallStatus: "Review Required",
  },
  {
    id: 3,
    name: "Asokoro Plot 45",
    location: "Asokoro, Abuja FCT",
    
     image: "/properties/asokoro-plot.jpg",
    documents: [
      { name: "Certificate of Occupancy", status: "verified" },
      { name: "Deed of Assignment", status: "verified" },
      { name: "Survey Plan", status: "verified" },
    ],
    overallStatus: "Verification Complete",
  },
  {
    id: 4,
    name: "Gwarinpa Estate Plot 12",
    location: "Gwarinpa, Abuja FCT",
   
  image: "/properties/property-land.jpg",
    documents: [
      { name: "Certificate of Occupancy", status: "processing" },
      { name: "Deed of Assignment", status: "processing" },
      { name: "Survey Plan", status: "processing" },
    ],
    overallStatus: "Processing",
  },
];

function DiamondLogo() {
  return <span className="diamond-logo" />;
}

function SearchIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6M9 9h2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3 20 6v6c0 5-3.3 8-8 10-4.7-2-8-5-8-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.8v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1A1.7 1.7 0 0 0 7.4 15a1.7 1.7 0 0 0-1.6-1H5.6v-2.8h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L7 8.2l2-2 .1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h2.8V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14h-.2a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M8 6h12M8 12h8M8 18h4" />
      <path d="M4 5v14M2 17l2 2 2-2" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function DocumentStatusIcon({
  status,
}: {
  status: DocumentStatus;
}) {
  if (status === "verified") {
    return (
      <span className="doc-status verified-doc">
        <CheckIcon />
      </span>
    );
  }

  if (status === "review") {
    return <span className="doc-status review-doc">!</span>;
  }

  return (
    <span className="doc-status processing-doc">
      <ClockIcon />
    </span>
  );
}

export default function MyPropertiesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Properties");
  const [sort, setSort] = useState("Newest First");
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(search.toLowerCase()) ||
      property.location.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All Properties" ||
      (filter === "Verified" &&
        property.overallStatus === "Verification Complete") ||
      (filter === "Review Required" &&
        property.overallStatus === "Review Required") ||
      (filter === "Processing" &&
        property.overallStatus === "Processing");

    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <div className="property-app">
        {/* DESKTOP HEADER */}
        <header className="desktop-header">
          <div className="brand">
            <DiamondLogo />
            <span>PropertySure AI</span>
          </div>

          <div className="global-search">
            <SearchIcon />
            <span>Search anything...</span>
            <kbd>Ctrl K</kbd>
          </div>

          <div className="header-right">
            <button className="notification-button" aria-label="Notifications">
              <BellIcon />
              <span className="notification-count">3</span>
            </button>

            <div className="user-profile">
              <div className="avatar">D</div>
              <div>
                <strong>David Eze</strong>
                <span>Premium Account</span>
              </div>
              <span className="chevron">⌄</span>
            </div>
          </div>
        </header>

        {/* MOBILE HEADER */}
        <header className="mobile-header">
          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open navigation"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="mobile-brand">
            <DiamondLogo />
            <span>PropertySure AI</span>
          </div>

          <button className="mobile-notification">
            <BellIcon />
            <span className="notification-count">3</span>
          </button>
        </header>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="mobile-menu">
            <button onClick={() => setMenuOpen(false)}>Dashboard</button>
            <button onClick={() => setMenuOpen(false)}>
              Verification History
            </button>
            <button
              className="mobile-menu-active"
              onClick={() => setMenuOpen(false)}
            >
              My Properties
            </button>
            <button onClick={() => setMenuOpen(false)}>Reports</button>
            <button onClick={() => setMenuOpen(false)}>Fraud Watch</button>
            <button onClick={() => setMenuOpen(false)}>Account</button>
            <button onClick={() => setMenuOpen(false)}>Settings</button>
          </div>
        )}

        <div className="page-layout">
          {/* DESKTOP SIDEBAR */}
          <aside className="sidebar">
            <nav>
              <a className="nav-item">
                <HomeIcon />
                <span>Dashboard</span>
              </a>

              <a className="nav-item">
                <HistoryIcon />
                <span>Verification History</span>
              </a>

              <a className="nav-item active">
                <HomeIcon />
                <span>My Properties</span>
              </a>

              <a className="nav-item">
                <ReportIcon />
                <span>Reports</span>
              </a>

              <a className="nav-item">
                <ShieldIcon />
                <span>Fraud Watch</span>
              </a>

              <div className="nav-divider" />

              <a className="nav-item">
                <UserIcon />
                <span>Account</span>
              </a>

              <a className="nav-item">
                <SettingsIcon />
                <span>Settings</span>
              </a>
            </nav>

            {/* PREMIUM CARD */}
            <div className="premium-card">
              <div className="crown">♛</div>
              <h3>You&apos;re on Premium Plan</h3>
              <p>
                Enjoy priority support, advanced fraud detection, and
                professional verification.
              </p>
              <button>Upgrade Plan</button>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="main-content">
            <div className="page-heading">
              <div>
                <h1>My Properties</h1>
                <p>
                  Manage your properties and track their verification status.
                </p>
              </div>

              <button className="add-property-button">
                <span>＋</span>
                Add Property
              </button>
            </div>

            {/* FILTER BAR */}
            <div className="filter-panel">
              <div className="property-search">
                <SearchIcon />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by property name or location..."
                />
              </div>

              <div className="select-wrapper">
                <FilterIcon />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>All Properties</option>
                  <option>Verified</option>
                  <option>Review Required</option>
                  <option>Processing</option>
                </select>
              </div>

              <div className="select-wrapper">
                <SortIcon />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option>Newest First</option>
                  <option>Oldest First</option>
                  <option>Name A-Z</option>
                </select>
              </div>
            </div>

            {/* PROPERTY GRID */}
            <section className="property-grid">
              {filteredProperties.map((property) => (
                <article className="property-card" key={property.id}>
                  <div className="property-card-top">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="property-image"
                    />

                    <div className="property-main-info">
                      <div className="property-title-row">
                        <div>
                          <h2>{property.name}</h2>
                          <p>{property.location}</p>
                        </div>

                        <button className="more-button">
                          <MoreIcon />
                        </button>
                      </div>

                      <div
                        className={`document-summary ${
                          property.overallStatus === "Verification Complete"
                            ? "summary-verified"
                            : property.overallStatus === "Review Required"
                              ? "summary-review"
                              : "summary-processing"
                        }`}
                      >
                        <strong>
                          {property.documents.length} Documents
                        </strong>

                        <span>•</span>

                        <strong>
                          {property.overallStatus === "Verification Complete"
                            ? "Verified"
                            : property.overallStatus === "Review Required"
                              ? "Review Required"
                              : "Processing"}
                        </strong>
                      </div>

                      <div className="documents-list">
                        {property.documents.map((document) => (
                          <div
                            className="document-row"
                            key={document.name}
                          >
                            <DocumentStatusIcon status={document.status} />
                            <span>{document.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="property-card-bottom">
                    <span
                      className={`overall-badge ${
                        property.overallStatus === "Verification Complete"
                          ? "complete-badge"
                          : property.overallStatus === "Review Required"
                            ? "review-badge"
                            : "processing-badge"
                      }`}
                    >
                      {property.overallStatus}
                    </span>

                    <button className="details-button">
                      View Details
                    </button>
                  </div>
                </article>
              ))}
            </section>

            {filteredProperties.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">⌂</div>
                <h2>No properties found</h2>
                <p>
                  Try changing your search or filter, or add a new property.
                </p>
                <button className="add-property-button">
                  ＋ Add Property
                </button>
              </div>
            )}
          </main>
        </div>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="mobile-bottom-nav">
          <button>
            <HomeIcon />
            <span>Dashboard</span>
          </button>

          <button>
            <HistoryIcon />
            <span>History</span>
          </button>

          <button className="mobile-add-button">
            <span>＋</span>
          </button>

          <button className="mobile-nav-active">
            <HomeIcon />
            <span>Properties</span>
          </button>

          <button>
            <UserIcon />
            <span>Account</span>
          </button>
        </nav>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #061a36;
          color: #ffffff;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        button,
        input,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .property-app {
          min-height: 100vh;
          width: 100%;
          background:
            radial-gradient(
              circle at 75% 20%,
              rgba(17, 74, 140, 0.1),
              transparent 30%
            ),
            #061a36;
          color: #ffffff;
        }

        /* =========================================
           DESKTOP HEADER
        ========================================= */

        .desktop-header {
          height: 76px;
          width: 100%;
          border-bottom: 1px solid rgba(65, 118, 175, 0.28);
          display: flex;
          align-items: center;
          padding: 0 22px;
          gap: 45px;
          background: rgba(4, 20, 43, 0.92);
        }

        .brand {
          min-width: 195px;
          display: flex;
          align-items: center;
          font-size: 18px;
          font-weight: 700;
          white-space: nowrap;
        }

        .diamond-logo {
          width: 16px;
          height: 16px;
          display: inline-block;
          background: #1686ff;
          transform: rotate(45deg);
          margin-right: 12px;
          flex-shrink: 0;
        }

        .global-search {
          height: 40px;
          width: 275px;
          border: 1px solid #21446d;
          background: #071d3a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 12px;
          color: #8298b4;
          font-size: 13px;
        }

        .global-search kbd {
          margin-left: auto;
          color: #a5b5ca;
          background: #0d294c;
          padding: 3px 7px;
          border-radius: 4px;
          font-size: 11px;
        }

        .header-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .notification-button,
        .mobile-notification {
          border: 0;
          background: transparent;
          color: #ffffff;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-count {
          position: absolute;
          right: -6px;
          top: -7px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ef4444;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 10px;
          font-weight: 700;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 170px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background:
            linear-gradient(145deg, #c38a61, #333b55);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .user-profile strong {
          display: block;
          font-size: 13px;
        }

        .user-profile span {
          display: block;
          color: #8da2bd;
          font-size: 11px;
          margin-top: 3px;
        }

        .user-profile .chevron {
          color: #9cb0c9;
          font-size: 18px;
          margin-left: auto;
        }

        /* =========================================
           PAGE LAYOUT
        ========================================= */

        .page-layout {
          display: flex;
          min-height: calc(100vh - 76px);
        }

        .sidebar {
          width: 226px;
          flex-shrink: 0;
          border-right: 1px solid rgba(65, 118, 175, 0.25);
          background: #06172f;
          padding: 28px 14px 20px;
          display: flex;
          flex-direction: column;
        }

        .nav-item {
          height: 46px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 14px;
          color: #a9b9cd;
          text-decoration: none;
          border-radius: 7px;
          margin-bottom: 5px;
          font-size: 14px;
          transition: 0.2s;
        }

        .nav-item:hover {
          background: #0a274b;
          color: #ffffff;
        }

        .nav-item.active {
          color: #238bff;
          background: #0d3970;
          border-left: 3px solid #1686ff;
          padding-left: 11px;
        }

        .nav-divider {
          height: 1px;
          background: #17375d;
          margin: 23px 10px;
        }

        .premium-card {
          margin-top: auto;
          border: 1px solid #1d436d;
          background: #071d39;
          border-radius: 7px;
          padding: 17px 14px 15px;
        }

        .premium-card .crown {
          color: #348dff;
          font-size: 24px;
          margin-bottom: 8px;
        }

        .premium-card h3 {
          margin: 0 0 9px;
          font-size: 14px;
        }

        .premium-card p {
          margin: 0;
          color: #8ea5c1;
          font-size: 12px;
          line-height: 1.55;
        }

        .premium-card button {
          width: 100%;
          margin-top: 17px;
          height: 38px;
          border: 0;
          border-radius: 5px;
          color: #ffffff;
          background: #1477f2;
          font-weight: 700;
          font-size: 12px;
        }

        /* =========================================
           MAIN
        ========================================= */

        .main-content {
          flex: 1;
          min-width: 0;
          padding: 30px 26px 55px;
        }

        .page-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .page-heading h1 {
          margin: 0;
          font-size: 29px;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .page-heading p {
          margin: 7px 0 0;
          color: #8fa5c0;
          font-size: 14px;
        }

        .add-property-button {
          border: 0;
          background: #1678f2;
          color: #ffffff;
          height: 43px;
          padding: 0 19px;
          border-radius: 6px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          white-space: nowrap;
          transition: 0.2s;
        }

        .add-property-button:hover {
          background: #2485fb;
        }

        .add-property-button span {
          font-size: 21px;
          line-height: 1;
        }

        /* =========================================
           FILTER PANEL
        ========================================= */

        .filter-panel {
          margin-top: 26px;
          padding: 10px;
          border: 1px solid #183d66;
          background: rgba(5, 23, 47, 0.58);
          border-radius: 8px;
          display: grid;
          grid-template-columns: minmax(260px, 1fr) 198px 198px;
          gap: 10px;
        }

        .property-search,
        .select-wrapper {
          height: 43px;
          border: 1px solid #204a78;
          background: #071e3b;
          border-radius: 7px;
          display: flex;
          align-items: center;
          color: #8198b5;
        }

        .property-search {
          padding: 0 13px;
          gap: 10px;
        }

        .property-search input {
          border: 0;
          outline: none;
          background: transparent;
          color: #ffffff;
          width: 100%;
          min-width: 0;
          font-size: 13px;
        }

        .property-search input::placeholder {
          color: #728aa8;
        }

        .select-wrapper {
          padding: 0 12px;
          gap: 9px;
        }

        .select-wrapper select {
          border: 0;
          outline: none;
          background: transparent;
          color: #dce7f4;
          width: 100%;
          cursor: pointer;
          font-size: 13px;
        }

        .select-wrapper option {
          background: #071e3b;
          color: #ffffff;
        }

        /* =========================================
           PROPERTY GRID
        ========================================= */

        .property-grid {
          margin-top: 17px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .property-card {
          border: 1px solid #19436f;
          background: #061d3a;
          border-radius: 8px;
          overflow: hidden;
          min-width: 0;
        }

        .property-card-top {
          display: flex;
          gap: 15px;
          padding: 18px 17px 16px;
          min-height: 275px;
        }

        .property-image {
          width: 135px;
          height: 175px;
          object-fit: cover;
          border-radius: 6px;
          flex-shrink: 0;
          background: #0c3158;
        }

        .property-main-info {
          min-width: 0;
          flex: 1;
        }

        .property-title-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }

        .property-title-row h2 {
          margin: 2px 0 6px;
          font-size: 17px;
          line-height: 1.2;
          font-weight: 700;
        }

        .property-title-row p {
          margin: 0;
          color: #91a7c1;
          font-size: 13px;
        }

        .more-button {
          border: 0;
          background: transparent;
          color: #91a8c1;
          padding: 0;
          height: 25px;
          flex-shrink: 0;
        }

        .document-summary {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 20px;
          font-size: 13px;
        }

        .summary-verified {
          color: #31dc94;
        }

        .summary-review {
          color: #ffc247;
        }

        .summary-processing {
          color: #4c9fff;
        }

        .documents-list {
          margin-top: 13px;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .document-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #d7e1ed;
          font-size: 12px;
          line-height: 1.25;
        }

        .doc-status {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .verified-doc {
          color: #031b19;
          background: #31dc94;
        }

        .review-doc {
          color: #171000;
          background: #ffc247;
          font-size: 11px;
          font-weight: 800;
        }

        .processing-doc {
          color: #328fff;
          background: transparent;
          border: 1px solid #328fff;
        }

        .property-card-bottom {
          border-top: 1px solid #173b63;
          padding: 12px 17px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .overall-badge {
          padding: 9px 12px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid transparent;
        }

        .complete-badge {
          color: #35df98;
          background: rgba(24, 185, 116, 0.08);
          border-color: rgba(24, 185, 116, 0.24);
        }

        .review-badge {
          color: #ffc247;
          background: rgba(255, 190, 50, 0.07);
          border-color: rgba(255, 190, 50, 0.25);
        }

        .processing-badge {
          color: #4ba1ff;
          background: rgba(44, 135, 255, 0.07);
          border-color: rgba(44, 135, 255, 0.25);
        }

        .details-button {
          height: 36px;
          padding: 0 14px;
          border: 1px solid #1b69ae;
          border-radius: 5px;
          background: transparent;
          color: #3598ff;
          font-size: 12px;
        }

        .details-button:hover {
          background: #0b2f55;
        }

        /* =========================================
           EMPTY STATE
        ========================================= */

        .empty-state {
          margin-top: 25px;
          border: 1px solid #19436f;
          border-radius: 8px;
          padding: 50px 20px;
          text-align: center;
        }

        .empty-icon {
          font-size: 34px;
          color: #338fff;
        }

        .empty-state h2 {
          margin: 12px 0 6px;
          font-size: 20px;
        }

        .empty-state p {
          color: #8da5c0;
          margin: 0 0 20px;
        }

        /* =========================================
           MOBILE HEADER
        ========================================= */

        .mobile-header,
        .mobile-menu,
        .mobile-bottom-nav {
          display: none;
        }

        /* =========================================
           TABLET
        ========================================= */

        @media (max-width: 1050px) {
          .sidebar {
            width: 190px;
          }

          .desktop-header {
            gap: 20px;
          }

          .global-search {
            width: 220px;
          }

          .filter-panel {
            grid-template-columns: 1fr 170px 170px;
          }

          .property-grid {
            grid-template-columns: 1fr;
          }
        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 768px) {
          html,
          body {
            width: 100%;
            overflow-x: hidden;
          }

          .property-app {
            min-height: 100vh;
            padding-bottom: 80px;
          }

          .desktop-header,
          .sidebar {
            display: none;
          }

          .mobile-header {
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 25px;
            border-bottom: 1px solid #17395f;
            background: #041b38;
            position: relative;
            z-index: 20;
          }

          .mobile-menu-button {
            width: 31px;
            height: 31px;
            padding: 5px 2px;
            background: transparent;
            border: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
          }

          .mobile-menu-button span {
            width: 27px;
            height: 2px;
            background: #ffffff;
            display: block;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            font-size: 16px;
            font-weight: 700;
          }

          .mobile-brand .diamond-logo {
            width: 13px;
            height: 13px;
            margin-right: 10px;
          }

          .mobile-notification {
            width: 30px;
            height: 30px;
          }

          .mobile-menu {
            position: absolute;
            top: 72px;
            left: 0;
            right: 0;
            z-index: 50;
            display: flex;
            flex-direction: column;
            background: #061b37;
            border-bottom: 1px solid #19446f;
            padding: 10px 15px;
          }

          .mobile-menu button {
            height: 46px;
            text-align: left;
            border: 0;
            background: transparent;
            color: #a9bbd0;
            padding: 0 15px;
            border-radius: 6px;
          }

          .mobile-menu button.mobile-menu-active {
            color: #2d96ff;
            background: #0c3564;
          }

          .page-layout {
            display: block;
            min-height: 0;
          }

          .main-content {
            padding: 28px 20px 40px;
            width: 100%;
          }

          .page-heading {
            display: block;
          }

          .page-heading h1 {
            font-size: 27px;
          }

          .page-heading p {
            margin-top: 8px;
            line-height: 1.5;
          }

          .add-property-button {
            width: 100%;
            height: 46px;
            margin-top: 20px;
          }

          .filter-panel {
            margin-top: 24px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 9px;
            padding: 0;
            border: 0;
            background: transparent;
          }

          .property-search {
            grid-column: 1 / -1;
            width: 100%;
            height: 47px;
          }

          .select-wrapper {
            width: 100%;
            height: 46px;
          }

          .property-grid {
            display: block;
            margin-top: 17px;
          }

          .property-card {
            margin-bottom: 13px;
            border-radius: 8px;
          }

          .property-card-top {
            padding: 16px;
            min-height: 0;
            gap: 14px;
          }

          .property-image {
            width: 86px;
            height: 104px;
            border-radius: 6px;
          }

          .property-title-row h2 {
            font-size: 15px;
            margin-top: 0;
            margin-bottom: 5px;
          }

          .property-title-row p {
            font-size: 11px;
          }

          .document-summary {
            margin-top: 12px;
            font-size: 11px;
            flex-wrap: wrap;
          }

          .documents-list {
            margin-top: 9px;
            gap: 6px;
          }

          .document-row {
            font-size: 10px;
            gap: 6px;
          }

          .doc-status {
            width: 13px;
            height: 13px;
          }

          .property-card-bottom {
            padding: 10px 16px;
          }

          .overall-badge {
            font-size: 10px;
            padding: 7px 9px;
          }

          .details-button {
            height: 32px;
            padding: 0 10px;
            font-size: 10px;
          }

          .mobile-bottom-nav {
            position: fixed;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            align-items: center;
            bottom: 0;
            left: 0;
            right: 0;
            height: 74px;
            z-index: 100;
            background: #041a36;
            border-top: 1px solid #17395f;
            padding: 5px 10px 7px;
          }

          .mobile-bottom-nav button {
            border: 0;
            background: transparent;
            color: #7188a5;
            height: 62px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            font-size: 10px;
          }

          .mobile-bottom-nav button svg {
            width: 20px;
            height: 20px;
          }

          .mobile-bottom-nav button span {
            font-size: 10px;
          }

          .mobile-bottom-nav .mobile-nav-active {
            color: #2392ff;
          }

          .mobile-add-button {
            width: 58px !important;
            height: 58px !important;
            margin: auto;
            border-radius: 50% !important;
            background: #1478f2 !important;
            color: #ffffff !important;
            font-size: 31px !important;
            box-shadow: 0 5px 20px rgba(0, 100, 255, 0.22);
          }

          .mobile-add-button span {
            font-size: 30px !important;
            line-height: 1;
          }
        }

        /* =========================================
           SMALL PHONES
        ========================================= */

        @media (max-width: 480px) {
          .mobile-header {
            padding: 0 18px;
          }

          .main-content {
            padding-left: 16px;
            padding-right: 16px;
          }

          .page-heading h1 {
            font-size: 25px;
          }

          .page-heading p {
            font-size: 13px;
          }

          .property-card-top {
            gap: 11px;
          }

          .property-image {
            width: 78px;
            height: 98px;
          }

          .property-title-row h2 {
            font-size: 14px;
          }

          .property-title-row p {
            font-size: 10px;
          }

          .document-summary {
            font-size: 10px;
          }

          .document-row {
            font-size: 9.5px;
          }

          .property-card-bottom {
            gap: 7px;
          }

          .overall-badge {
            font-size: 9px;
          }

          .details-button {
            font-size: 9px;
          }
        }
      `}</style>
    </>
  );
}