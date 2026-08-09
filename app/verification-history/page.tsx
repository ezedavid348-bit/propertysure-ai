"use client";

import { useState } from "react";

type Status = "complete" | "review" | "processing" | "failed";

type Verification = {
  property: string;
  location: string;
  id: string;
  documents: string[];
  documentCount: number;
  verifiedCount?: number;
  status: Status;
  date: string;
  time: string;
  image: string;
};

const verifications: Verification[] = [
  {
    property: "Lekki Phase 1 Property",
    location: "Lekki, Lagos State",
    id: "PS-VER-2025-00032",
    documents: [
      "C of O",
      "Deed of Assignment",
      "Survey Plan",
      "Allocation Letter",
    ],
    documentCount: 4,
    verifiedCount: 4,
    status: "complete",
    date: "Aug 8, 2025",
    time: "10:24 AM",
    image: "/about-hero.jpg",
  },
  {
    property: "Maitama Residence",
    location: "Maitama, Abuja FCT",
    id: "PS-VER-2025-00031",
    documents: [
      "C of O",
      "Deed of Assignment",
      "Survey Plan",
      "Allocation Letter",
    ],
    documentCount: 4,
    status: "review",
    date: "Aug 6, 2025",
    time: "02:15 PM",
    image: "/about-office.jpg",
  },
  {
    property: "Asokoro Plot 45",
    location: "Asokoro, Abuja FCT",
    id: "PS-VER-2025-00030",
    documents: [
      "C of O",
      "Deed of Assignment",
      "Survey Plan",
    ],
    documentCount: 3,
    verifiedCount: 3,
    status: "complete",
    date: "Aug 4, 2025",
    time: "11:48 AM",
    image: "/early-users-background.jpg",
  },
  {
    property: "Gwarinpa Estate Plot 12",
    location: "Gwarinpa, Abuja FCT",
    id: "PS-VER-2025-00029",
    documents: [
      "C of O",
      "Deed of Assignment",
      "Survey Plan",
    ],
    documentCount: 3,
    status: "processing",
    date: "Aug 3, 2025",
    time: "09:30 AM",
    image: "/faq-background.jpg",
  },
  {
    property: "Victoria Island Property",
    location: "Victoria Island, Lagos",
    id: "PS-VER-2025-00028",
    documents: [
      "C of O",
      "Deed of Assignment",
      "Survey Plan",
      "Allocation Letter",
      "Governor's Consent",
    ],
    documentCount: 5,
    status: "failed",
    date: "Aug 1, 2025",
    time: "05:20 PM",
    image: "/about-hero.jpg",
  },
];

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
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

function FilterIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 7h12" />
      <path d="M8 12h8" />
      <path d="M8 17h4" />
      <path d="m4 4-2 2 2 2" />
      <path d="M2 6h3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="21"
      height="21"
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

function MenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
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

function PropertyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 10 12 3l9 7" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
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
      <path d="M9 13h6" />
      <path d="M9 17h6" />
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
      <path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
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
      <path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6" />
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
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.6v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.3v-2.6h.2A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2H15v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function statusLabel(status: Status) {
  if (status === "complete") return "Verification Complete";
  if (status === "review") return "Review Required";
  if (status === "processing") return "Processing";
  return "Failed";
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`statusBadge ${status}`}>
      <span className="statusDot" />
      {statusLabel(status)}
    </span>
  );
}

export default function VerificationHistoryPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredVerifications = verifications.filter((item) => {
    const matchesSearch =
      item.property.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.documents.some((doc) =>
        doc.toLowerCase().includes(search.toLowerCase())
      );

    const matchesFilter =
      activeFilter === "all" || item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <main className="historyPage">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="topBar">

        <div className="brand">
          <span className="brandDiamond" />
          <span>PropertySure AI</span>
        </div>

        <div className="topSearch">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search anything..."
          />
          <span className="shortcut">Ctrl K</span>
        </div>

        <div className="topRight">

          <button className="notificationButton">
            <BellIcon />
            <span className="notificationCount">3</span>
          </button>

          <div className="userProfile">
            <div className="avatar">D</div>
            <div>
              <strong>David Eze</strong>
              <small>Premium Account</small>
            </div>
            <span className="profileArrow">⌄</span>
          </div>

        </div>

      </header>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="mobileHeader">

        <button className="mobileMenu">
          <MenuIcon />
        </button>

        <div className="mobileBrand">
          <span className="brandDiamond" />
          <strong>PropertySure AI</strong>
        </div>

        <button className="notificationButton">
          <BellIcon />
          <span className="notificationCount">3</span>
        </button>

      </header>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <nav>

          <a href="/dashboard" className="navItem">
            <HomeIcon />
            <span>Dashboard</span>
          </a>

          <a
            href="/verification-history"
            className="navItem active"
          >
            <HistoryIcon />
            <span>Verification History</span>
          </a>

          <a href="#" className="navItem">
            <PropertyIcon />
            <span>My Properties</span>
          </a>

          <a href="#" className="navItem">
            <ReportIcon />
            <span>Reports</span>
          </a>

          <a href="#" className="navItem">
            <ShieldIcon />
            <span>Fraud Watch</span>
          </a>

          <div className="navDivider" />

          <a href="#" className="navItem">
            <UserIcon />
            <span>Account</span>
          </a>

          <a href="#" className="navItem">
            <SettingsIcon />
            <span>Settings</span>
          </a>

        </nav>

        <div className="premiumCard">

          <div className="crown">♛</div>

          <h3>You're on Premium Plan</h3>

          <p>
            Enjoy priority support, advanced fraud detection,
            and professional verification.
          </p>

          <button>Upgrade Plan</button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="mainContent">

        <div className="pageHeader">

          <div>
            <h1>Verification History</h1>
            <p>
              View and track all your property verifications
            </p>
          </div>

          <button className="newVerification">
            <PlusIcon />
            New Verification
          </button>

        </div>

        {/* ===================================================
            FILTER PANEL
        =================================================== */}

        <section className="filterPanel">

          <div className="filterRow">

            <div className="historySearch">
              <SearchIcon />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by property name, location or document..."
              />

            </div>

            <button className="selectButton">
              <FilterIcon />
              All Status
              <span>⌄</span>
            </button>

            <button className="selectButton">
              <SortIcon />
              Newest First
              <span>⌄</span>
            </button>

          </div>

          {/* STATUS FILTERS */}

          <div className="statusFilters">

            <button
              className={`filterChip ${
                activeFilter === "all" ? "selected" : ""
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All
              <span>32</span>
            </button>

            <button
              className={`filterChip complete ${
                activeFilter === "complete" ? "selected" : ""
              }`}
              onClick={() => setActiveFilter("complete")}
            >
              <span className="chipDot" />
              Verification Complete
              <span>18</span>
            </button>

            <button
              className={`filterChip review ${
                activeFilter === "review" ? "selected" : ""
              }`}
              onClick={() => setActiveFilter("review")}
            >
              <span className="chipDot" />
              Review Required
              <span>6</span>
            </button>

            <button
              className={`filterChip processing ${
                activeFilter === "processing" ? "selected" : ""
              }`}
              onClick={() => setActiveFilter("processing")}
            >
              <span className="chipDot" />
              Processing
              <span>6</span>
            </button>

            <button
              className={`filterChip failed ${
                activeFilter === "failed" ? "selected" : ""
              }`}
              onClick={() => setActiveFilter("failed")}
            >
              <span className="chipDot" />
              Failed
              <span>2</span>
            </button>

          </div>

        </section>

        {/* ===================================================
            DESKTOP TABLE
        =================================================== */}

        <section className="historyTable">

          <div className="tableHeader">

            <div>Property</div>
            <div>Documents Summary</div>
            <div>Overall Status</div>
            <div>Date</div>
            <div>Action</div>

          </div>

          {filteredVerifications.map((item) => (

            <article
              className="historyRow"
              key={item.id}
            >

              {/* PROPERTY */}

              <div className="propertyCell">

                <div className="propertyImage">
                  <img
                    src={item.image}
                    alt=""
                  />
                </div>

                <div className="propertyInfo">

                  <strong>{item.property}</strong>

                  <span>{item.location}</span>

                  <small>ID: {item.id}</small>

                </div>

              </div>

              {/* DOCUMENTS */}

              <div className="documentsCell">

                <div className="documentCount">

                  <DocumentIcon />

                  <strong>
                    {item.verifiedCount
                      ? `${item.verifiedCount} Documents Verified`
                      : `${item.documentCount} Documents Submitted`}
                  </strong>

                  {item.verifiedCount && (
                    <span className="tinyCheck">✓</span>
                  )}

                </div>

                <p>
                  {item.documents.join(", ")}
                </p>

                <button className="viewDocuments">
                  View Documents ({item.documentCount})
                </button>

              </div>

              {/* STATUS */}

              <div className="overallStatus">
                <StatusBadge status={item.status} />
              </div>

              {/* DATE */}

              <div className="dateCell">

                <span>{item.date}</span>
                <small>{item.time}</small>

              </div>

              {/* ACTION */}

              <div className="actionCell">

                <button className="viewDetails">
                  View Details
                </button>

                <button className="moreButton">
                  <MoreIcon />
                </button>

              </div>

            </article>

          ))}

          {/* PAGINATION */}

          <div className="pagination">

            <span>
              Showing 1 to {filteredVerifications.length} of 32 results
            </span>

            <div className="pageButtons">

              <button>‹</button>
              <button className="current">1</button>
              <button>2</button>
              <button>3</button>
              <span>...</span>
              <button>7</button>
              <button>›</button>

            </div>

          </div>

        </section>

      </section>

      {/* =====================================================
          MOBILE CONTENT
      ===================================================== */}

      <section className="mobileContent">

        <div className="mobilePageTitle">

          <h1>Verification History</h1>

          <p>
            View and track all your property verifications
          </p>

        </div>

        <button className="mobileNewVerification">
          <PlusIcon />
          New Verification
        </button>

        <div className="mobileSearch">

          <SearchIcon />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
          />

          <SearchIcon />

        </div>

        <div className="mobileSelectRow">

          <button>
            <FilterIcon />
            All Status
            <span>⌄</span>
          </button>

          <button>
            <SortIcon />
            Newest First
            <span>⌄</span>
          </button>

        </div>

        <div className="mobileFilters">

          <button
            className={activeFilter === "all" ? "selected" : ""}
            onClick={() => setActiveFilter("all")}
          >
            All <span>32</span>
          </button>

          <button
            className={`complete ${
              activeFilter === "complete" ? "selected" : ""
            }`}
            onClick={() => setActiveFilter("complete")}
          >
            <span />
            Complete <b>18</b>
          </button>

          <button
            className={`review ${
              activeFilter === "review" ? "selected" : ""
            }`}
            onClick={() => setActiveFilter("review")}
          >
            <span />
            Review <b>6</b>
          </button>

          <button
            className={`processing ${
              activeFilter === "processing" ? "selected" : ""
            }`}
            onClick={() => setActiveFilter("processing")}
          >
            <span />
            Processing <b>6</b>
          </button>

        </div>

        <div className="mobileHistoryList">

          {filteredVerifications.map((item) => (

            <article
              className="mobileHistoryCard"
              key={item.id}
            >

              <div className="mobilePropertyTop">

                <div className="mobilePropertyImage">
                  <img
                    src={item.image}
                    alt=""
                  />
                </div>

                <div className="mobilePropertyInfo">

                  <strong>{item.property}</strong>

                  <span>{item.location}</span>

                  <div className="mobileStatus">
                    <StatusBadge status={item.status} />
                  </div>

                  <small>
                    {item.verifiedCount
                      ? `${item.verifiedCount} Documents Verified`
                      : `${item.documentCount} Documents Submitted`}
                  </small>

                  <small>
                    {item.date} • {item.time}
                  </small>

                </div>

                <button className="mobileMore">
                  <MoreIcon />
                </button>

              </div>

            </article>

          ))}

        </div>

      </section>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <nav className="mobileBottomNav">

        <a href="/dashboard">
          <HomeIcon />
          <span>Dashboard</span>
        </a>

        <a
          href="/verification-history"
          className="active"
        >
          <HistoryIcon />
          <span>History</span>
        </a>

        <button className="mobileAdd">
          <PlusIcon />
        </button>

        <a href="#">
          <PropertyIcon />
          <span>Properties</span>
        </a>

        <a href="#">
          <UserIcon />
          <span>Account</span>
        </a>

      </nav>

      {/* =====================================================
          PAGE STYLES
      ===================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .historyPage {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 55% 20%,
              rgba(16, 91, 170, 0.16),
              transparent 35%
            ),
            #031329;
          color: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* TOP BAR */

        .topBar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 76px;
          background: rgba(2, 16, 34, 0.97);
          border-bottom: 1px solid rgba(80, 150, 220, 0.16);
          display: flex;
          align-items: center;
          padding: 0 28px;
          z-index: 100;
        }

        .brand {
          width: 215px;
          display: flex;
          align-items: center;
          gap: 11px;
          font-size: 18px;
          font-weight: 700;
        }

        .brandDiamond {
          width: 16px;
          height: 16px;
          background: #1685ff;
          transform: rotate(45deg);
          display: inline-block;
        }

        .topSearch {
          width: 270px;
          height: 40px;
          border: 1px solid rgba(82, 148, 215, 0.28);
          border-radius: 7px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 11px;
          color: #7890ae;
        }

        .topSearch input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 13px;
        }

        .shortcut {
          background: rgba(120, 160, 200, 0.12);
          border-radius: 4px;
          padding: 3px 5px;
          font-size: 10px;
        }

        .topRight {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .notificationButton {
          position: relative;
          border: none;
          background: transparent;
          color: white;
          cursor: pointer;
        }

        .notificationCount {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ef4444;
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .userProfile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-left: 18px;
          border-left: 1px solid rgba(120, 160, 200, 0.18);
        }

        .avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(145deg, #b99b7b, #423329);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .userProfile strong {
          display: block;
          font-size: 13px;
        }

        .userProfile small {
          display: block;
          color: #8298b5;
          font-size: 10px;
          margin-top: 3px;
        }

        .profileArrow {
          color: #94a7bf;
          margin-left: 12px;
        }

        /* SIDEBAR */

        .sidebar {
          position: fixed;
          top: 76px;
          left: 0;
          bottom: 0;
          width: 230px;
          border-right: 1px solid rgba(80, 150, 220, 0.14);
          background: rgba(2, 16, 34, 0.76);
          padding: 28px 14px 20px;
          display: flex;
          flex-direction: column;
          z-index: 90;
        }

        .navItem {
          height: 48px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 0 14px;
          margin-bottom: 5px;
          border-radius: 6px;
          color: #c3cfde;
          text-decoration: none;
          font-size: 14px;
          transition: 0.2s;
        }

        .navItem:hover {
          background: rgba(24, 112, 216, 0.1);
        }

        .navItem.active {
          background: rgba(21, 113, 230, 0.18);
          color: #2595ff;
          border-left: 3px solid #198cff;
          padding-left: 11px;
        }

        .navDivider {
          height: 1px;
          background: rgba(100, 150, 200, 0.14);
          margin: 14px 10px;
        }

        .premiumCard {
          margin-top: auto;
          border: 1px solid rgba(74, 137, 205, 0.25);
          border-radius: 7px;
          padding: 17px 14px;
          background: rgba(8, 34, 65, 0.45);
        }

        .crown {
          color: #2994ff;
          font-size: 22px;
          margin-bottom: 10px;
        }

        .premiumCard h3 {
          margin: 0 0 8px;
          font-size: 14px;
        }

        .premiumCard p {
          color: #91a5c0;
          font-size: 11px;
          line-height: 1.55;
          margin: 0 0 15px;
        }

        .premiumCard button {
          width: 100%;
          height: 37px;
          background: #146ff2;
          color: white;
          border: none;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
        }

        /* MAIN */

        .mainContent {
          margin-left: 230px;
          padding: 112px 24px 40px;
        }

        .pageHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          max-width: 870px;
          margin: 0 auto 28px;
        }

        .pageHeader h1 {
          margin: 0;
          font-size: 27px;
        }

        .pageHeader p {
          margin: 7px 0 0;
          color: #8296b1;
          font-size: 13px;
        }

        .newVerification,
        .mobileNewVerification {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #176ff1;
          color: white;
          border: none;
          border-radius: 6px;
          height: 43px;
          padding: 0 17px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        /* FILTER */

        .filterPanel {
          max-width: 870px;
          margin: 0 auto 0;
          border: 1px solid rgba(65, 127, 190, 0.18);
          border-radius: 8px 8px 0 0;
          background: rgba(4, 24, 49, 0.48);
          padding: 15px;
        }

        .filterRow {
          display: grid;
          grid-template-columns: 1fr 205px 205px;
          gap: 13px;
        }

        .historySearch,
        .selectButton {
          height: 43px;
          border: 1px solid rgba(70, 130, 190, 0.25);
          background: rgba(2, 19, 40, 0.75);
          border-radius: 6px;
          color: #bdcce0;
        }

        .historySearch {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 12px;
        }

        .historySearch input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: white;
          font-size: 12px;
        }

        .selectButton {
          padding: 0 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .selectButton span {
          margin-left: auto;
        }

        .statusFilters {
          display: flex;
          gap: 10px;
          margin-top: 14px;
          overflow-x: auto;
        }

        .filterChip {
          height: 38px;
          padding: 0 13px;
          border-radius: 5px;
          border: 1px solid rgba(70, 130, 190, 0.25);
          background: rgba(3, 24, 48, 0.8);
          color: #c2cede;
          white-space: nowrap;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
        }

        .filterChip span:last-child {
          background: rgba(255,255,255,0.06);
          padding: 2px 5px;
          border-radius: 4px;
        }

        .filterChip.selected {
          background: #0d5fd5;
          color: white;
          border-color: #2188ff;
        }

        .chipDot,
        .statusDot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          display: inline-block;
        }

        .filterChip.complete {
          color: #27dc86;
        }

        .filterChip.review {
          color: #ffae00;
        }

        .filterChip.processing {
          color: #238cff;
        }

        .filterChip.failed {
          color: #ff4545;
        }

        /* TABLE */

        .historyTable {
          max-width: 870px;
          margin: 0 auto;
          border: 1px solid rgba(65, 127, 190, 0.18);
          border-top: none;
          border-radius: 0 0 8px 8px;
          overflow: hidden;
          background: rgba(2, 19, 39, 0.72);
        }

        .tableHeader,
        .historyRow {
          display: grid;
          grid-template-columns: 1.35fr 1.25fr 0.9fr 0.72fr 0.72fr;
          column-gap: 16px;
          align-items: center;
        }

        .tableHeader {
          min-height: 48px;
          padding: 0 16px;
          color: #8fa5c0;
          font-size: 11px;
          border-bottom: 1px solid rgba(80, 145, 210, 0.14);
        }

        .historyRow {
          min-height: 115px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(80, 145, 210, 0.13);
        }

        .historyRow:last-of-type {
          border-bottom: none;
        }

        .propertyCell {
          display: flex;
          gap: 11px;
          min-width: 0;
        }

        .propertyImage {
          flex: 0 0 68px;
          height: 76px;
          border-radius: 5px;
          overflow: hidden;
          background: #12375e;
        }

        .propertyImage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .propertyInfo {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .propertyInfo strong {
          font-size: 13px;
          margin-bottom: 5px;
        }

        .propertyInfo span {
          color: #93a7c1;
          font-size: 10px;
          margin-bottom: 6px;
        }

        .propertyInfo small {
          color: #617b9b;
          font-size: 9px;
        }

        .documentsCell {
          min-width: 0;
        }

        .documentCount {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #e1e9f2;
          font-size: 11px;
        }

        .documentsCell p {
          color: #9aadc4;
          font-size: 10px;
          line-height: 1.5;
          margin: 7px 0 3px;
        }

        .tinyCheck {
          color: #22df88;
        }

        .viewDocuments {
          background: none;
          border: none;
          color: #218fff;
          font-size: 9px;
          padding: 0;
          cursor: pointer;
        }

        .statusBadge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid currentColor;
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 10px;
          white-space: nowrap;
          background: rgba(255,255,255,0.025);
        }

        .statusBadge.complete {
          color: #16d97b;
        }

        .statusBadge.review {
          color: #ffac00;
        }

        .statusBadge.processing {
          color: #1689ff;
        }

        .statusBadge.failed {
          color: #ff3f47;
        }

        .dateCell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: #bac8d9;
          font-size: 10px;
        }

        .dateCell small {
          color: #8499b4;
        }

        .actionCell {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .viewDetails {
          height: 36px;
          border: 1px solid #1478e8;
          background: rgba(11, 78, 150, 0.12);
          color: #3b9aff;
          border-radius: 5px;
          padding: 0 11px;
          font-size: 10px;
          cursor: pointer;
        }

        .moreButton {
          border: none;
          background: transparent;
          color: #8ea3bd;
          cursor: pointer;
          padding: 4px;
        }

        /* PAGINATION */

        .pagination {
          min-height: 52px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #8298b4;
          font-size: 10px;
        }

        .pageButtons {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .pageButtons button {
          width: 31px;
          height: 31px;
          background: transparent;
          border: 1px solid rgba(80, 140, 200, 0.2);
          border-radius: 5px;
          color: #c4d2e2;
          cursor: pointer;
        }

        .pageButtons button.current {
          background: #176ff1;
          border-color: #176ff1;
          color: white;
        }

        /* MOBILE */

        .mobileHeader,
        .mobileContent,
        .mobileBottomNav {
          display: none;
        }

        @media (max-width: 800px) {

          .topBar,
          .sidebar,
          .mainContent {
            display: none;
          }

          .mobileHeader {
            position: fixed;
            display: flex;
            top: 0;
            left: 0;
            right: 0;
            height: 72px;
            align-items: center;
            justify-content: space-between;
            padding: 0 18px;
            background: #03162f;
            border-bottom: 1px solid rgba(80, 150, 220, 0.16);
            z-index: 100;
          }

          .mobileMenu {
            border: none;
            background: transparent;
            color: white;
            padding: 0;
          }

          .mobileBrand {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 15px;
          }

          .mobileBrand .brandDiamond {
            width: 12px;
            height: 12px;
          }

          .mobileHeader .notificationButton {
            color: white;
          }

          .mobileContent {
            display: block;
            padding: 95px 18px 105px;
            min-height: 100vh;
          }

          .mobilePageTitle h1 {
            font-size: 21px;
            margin: 0;
          }

          .mobilePageTitle p {
            color: #8298b4;
            font-size: 11px;
            margin: 6px 0 18px;
          }

          .mobileNewVerification {
            width: 100%;
            height: 43px;
            margin-bottom: 13px;
          }

          .mobileSearch {
            height: 42px;
            border: 1px solid rgba(70, 130, 190, 0.28);
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 11px;
            color: #7890ae;
          }

          .mobileSearch input {
            flex: 1;
            border: none;
            outline: none;
            background: transparent;
            color: white;
            min-width: 0;
            font-size: 11px;
          }

          .mobileSelectRow {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 10px;
          }

          .mobileSelectRow button {
            height: 40px;
            border: 1px solid rgba(70, 130, 190, 0.25);
            border-radius: 6px;
            background: rgba(2, 19, 40, 0.75);
            color: #b8c9dc;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 0 9px;
            font-size: 10px;
          }

          .mobileSelectRow span {
            margin-left: auto;
          }

          .mobileFilters {
            display: flex;
            gap: 7px;
            overflow-x: auto;
            margin: 12px 0;
            padding-bottom: 3px;
          }

          .mobileFilters button {
            flex: 0 0 auto;
            height: 34px;
            border: 1px solid rgba(70, 130, 190, 0.25);
            background: rgba(2, 19, 40, 0.75);
            color: #aebfd2;
            border-radius: 5px;
            padding: 0 10px;
            font-size: 9px;
          }

          .mobileFilters button.selected {
            background: #0d62d7;
            border-color: #258cff;
            color: white;
          }

          .mobileFilters button.complete {
            color: #20db83;
          }

          .mobileFilters button.review {
            color: #ffae00;
          }

          .mobileFilters button.processing {
            color: #288fff;
          }

          .mobileFilters button span {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
            margin-right: 4px;
          }

          .mobileHistoryList {
            border: 1px solid rgba(70, 130, 190, 0.2);
            border-radius: 8px;
            overflow: hidden;
            background: rgba(2, 20, 42, 0.75);
          }

          .mobileHistoryCard {
            padding: 14px 12px;
            border-bottom: 1px solid rgba(70, 130, 190, 0.13);
          }

          .mobileHistoryCard:last-child {
            border-bottom: none;
          }

          .mobilePropertyTop {
            display: flex;
            gap: 10px;
            position: relative;
          }

          .mobilePropertyImage {
            width: 60px;
            height: 65px;
            flex: 0 0 60px;
            overflow: hidden;
            border-radius: 5px;
            background: #12375e;
          }

          .mobilePropertyImage img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .mobilePropertyInfo {
            min-width: 0;
            padding-right: 22px;
          }

          .mobilePropertyInfo strong {
            display: block;
            font-size: 12px;
            margin-bottom: 4px;
          }

          .mobilePropertyInfo > span {
            display: block;
            color: #8da2bc;
            font-size: 9px;
            margin-bottom: 5px;
          }

          .mobilePropertyInfo small {
            display: block;
            color: #8ca0ba;
            font-size: 9px;
            margin-top: 4px;
          }

          .mobileStatus {
            margin-bottom: 3px;
          }

          .mobileStatus .statusBadge {
            padding: 4px 6px;
            font-size: 8px;
          }

          .mobileStatus .statusDot {
            width: 5px;
            height: 5px;
          }

          .mobileMore {
            position: absolute;
            right: 0;
            top: 0;
            background: transparent;
            border: none;
            color: #9aacbf;
          }

          .mobileBottomNav {
            position: fixed;
            display: flex;
            align-items: center;
            justify-content: space-around;
            left: 0;
            right: 0;
            bottom: 0;
            height: 70px;
            background: rgba(2, 19, 40, 0.98);
            border-top: 1px solid rgba(70, 130, 190, 0.2);
            z-index: 200;
          }

          .mobileBottomNav a {
            width: 20%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            color: #758ba7;
            text-decoration: none;
            font-size: 9px;
          }

          .mobileBottomNav a.active {
            color: #2292ff;
          }

          .mobileAdd {
            width: 47px;
            height: 47px;
            border-radius: 50%;
            border: none;
            background: #176ff1;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 18px rgba(0, 110, 255, 0.3);
            transform: translateY(-10px);
          }

        }

        @media (max-width: 480px) {

          .mobileContent {
            padding-left: 16px;
            padding-right: 16px;
          }

          .mobilePageTitle h1 {
            font-size: 20px;
          }

          .mobilePropertyImage {
            width: 58px;
            height: 63px;
            flex-basis: 58px;
          }

        }

      `}</style>

    </main>
  );
}