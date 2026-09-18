"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type AdminUser = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] =
    useState("all");

  const [selectedUser, setSelectedUser] =
    useState<AdminUser | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch("/api/admin/users", {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load users."
        );
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error("Admin users error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.id.toLowerCase().includes(query) ||
        (user.email || "").toLowerCase().includes(query);

      const verified = Boolean(user.email_confirmed_at);

      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && verified) ||
        (verificationFilter === "unverified" && !verified);

      return matchesSearch && matchesVerification;
    });
  }, [users, search, verificationFilter]);

  const verifiedUsers = users.filter(
    (user) => Boolean(user.email_confirmed_at)
  ).length;

  const unverifiedUsers =
    users.length - verifiedUsers;

  const signedInUsers = users.filter(
    (user) => Boolean(user.last_sign_in_at)
  ).length;

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <main className="page">
        <div className="loading">
          Loading users...
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #f7f9fc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
          }

          .loading {
            color: #64748b;
            font-size: 14px;
          }
        `}</style>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="errorCard">
          <h2>Unable to load users</h2>

          <p>{error}</p>

          <div className="errorActions">
            <button
              type="button"
              onClick={loadUsers}
            >
              Try Again
            </button>

            <button
              type="button"
              className="secondaryButton"
              onClick={() => router.push("/admin")}
            >
              Admin Dashboard
            </button>
          </div>
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #f7f9fc;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: Arial, sans-serif;
          }

          .errorCard {
            width: 100%;
            max-width: 520px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
          }

          .errorCard h2 {
            margin: 0 0 10px;
            color: #102a43;
          }

          .errorCard p {
            margin: 0 0 20px;
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
            word-break: break-word;
          }

          .errorActions {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
          }

          .errorActions button {
            border: 0;
            background: #1676c5;
            color: #ffffff;
            border-radius: 8px;
            padding: 10px 18px;
            font-weight: 700;
            cursor: pointer;
          }

          .errorActions .secondaryButton {
            background: #eef2f6;
            color: #315878;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <div>
            <button
              type="button"
              className="backButton"
              onClick={() => router.push("/admin")}
            >
              ← Admin Dashboard
            </button>

            <h1>Users</h1>

            <p>
              View registered PropertySure AI users.
            </p>
          </div>

          <button
            type="button"
            className="refreshButton"
            onClick={loadUsers}
          >
            Refresh
          </button>
        </header>

        <section className="statsGrid">
          <div className="statCard">
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>

          <div className="statCard">
            <span>Verified Email</span>
            <strong>{verifiedUsers}</strong>
          </div>

          <div className="statCard">
            <span>Unverified Email</span>
            <strong>{unverifiedUsers}</strong>
          </div>

          <div className="statCard">
            <span>Signed In</span>
            <strong>{signedInUsers}</strong>
          </div>
        </section>

        <section className="filters">
          <input
            type="text"
            placeholder="Search by email or user ID..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={verificationFilter}
            onChange={(event) =>
              setVerificationFilter(event.target.value)
            }
          >
            <option value="all">All Users</option>
            <option value="verified">Verified Email</option>
            <option value="unverified">
              Unverified Email
            </option>
          </select>
        </section>

        <section className="tableCard">
          <div className="tableHeader">
            <div>
              <h2>Registered Users</h2>

              <p>
                Showing {filteredUsers.length} of{" "}
                {users.length} users
              </p>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="emptyState">
              <h3>No users found</h3>

              <p>
                No users match the current search or filter.
              </p>
            </div>
          ) : (
            <div className="tableWrapper">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>User ID</th>
                    <th>Registered</th>
                    <th>Email Status</th>
                    <th>Last Sign In</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const verified =
                      Boolean(user.email_confirmed_at);

                    return (
                      <tr key={user.id}>
                        <td>
                          <strong>
                            {user.email || "No email"}
                          </strong>
                        </td>

                        <td>
                          <span className="userId">
                            {user.id}
                          </span>
                        </td>

                        <td>
                          <span className="date">
                            {formatDate(user.created_at)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status ${
                              verified
                                ? "statusVerified"
                                : "statusUnverified"
                            }`}
                          >
                            {verified
                              ? "Verified"
                              : "Unverified"}
                          </span>
                        </td>

                        <td>
                          {formatDate(user.last_sign_in_at)}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="viewButton"
                            onClick={() =>
                              setSelectedUser(user)
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedUser && (
        <div
          className="modalBackdrop"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modalHeader">
              <div>
                <span className="eyebrow">
                  USER DETAILS
                </span>

                <h2>
                  {selectedUser.email || "Registered User"}
                </h2>
              </div>

              <button
                type="button"
                className="closeButton"
                onClick={() => setSelectedUser(null)}
              >
                ×
              </button>
            </div>

            <div className="detailsGrid">
              <div className="detail full">
                <span>Email</span>

                <strong>
                  {selectedUser.email || "No email"}
                </strong>
              </div>

              <div className="detail full">
                <span>User ID</span>

                <strong className="break">
                  {selectedUser.id}
                </strong>
              </div>

              <div className="detail">
                <span>Registration Date</span>

                <strong>
                  {formatDate(selectedUser.created_at)}
                </strong>
              </div>

              <div className="detail">
                <span>Email Status</span>

                <strong>
                  {selectedUser.email_confirmed_at
                    ? "Verified"
                    : "Unverified"}
                </strong>
              </div>

              <div className="detail full">
                <span>Email Confirmed At</span>

                <strong>
                  {formatDate(
                    selectedUser.email_confirmed_at
                  )}
                </strong>
              </div>

              <div className="detail full">
                <span>Last Sign In</span>

                <strong>
                  {formatDate(
                    selectedUser.last_sign_in_at
                  )}
                </strong>
              </div>
            </div>

            <div className="modalFooter">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f7f9fc;
          color: #102a43;
          font-family: Arial, sans-serif;
          padding: 40px 24px 70px;
        }

        .container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .backButton {
          display: block;
          border: 0;
          background: transparent;
          padding: 0;
          margin-bottom: 16px;
          color: #1676c5;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        h1 {
          margin: 0 0 8px;
          font-size: 32px;
          letter-spacing: -0.5px;
        }

        .header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .refreshButton {
          border: 1px solid #d8e1eb;
          background: #ffffff;
          color: #315878;
          border-radius: 8px;
          padding: 10px 15px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .refreshButton:hover {
          border-color: #1676c5;
          color: #1676c5;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 16px;
          margin-bottom: 20px;
        }

        .statCard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 20px;
        }

        .statCard span {
          display: block;
          margin-bottom: 9px;
          color: #718096;
          font-size: 12px;
        }

        .statCard strong {
          font-size: 25px;
          color: #102a43;
        }

        .filters {
          display: grid;
          grid-template-columns: 1fr 190px;
          gap: 12px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 18px;
        }

        .filters input,
        .filters select {
          width: 100%;
          height: 44px;
          box-sizing: border-box;
          border: 1px solid #dce3ea;
          border-radius: 9px;
          padding: 0 13px;
          background: #ffffff;
          color: #334155;
          font-size: 13px;
          outline: none;
        }

        .filters input:focus,
        .filters select:focus {
          border-color: #1676c5;
        }

        .tableCard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
        }

        .tableHeader {
          padding: 20px 22px;
          border-bottom: 1px solid #e8edf2;
        }

        .tableHeader h2 {
          margin: 0 0 6px;
          font-size: 18px;
        }

        .tableHeader p {
          margin: 0;
          color: #718096;
          font-size: 13px;
        }

        .tableWrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
        }

        th {
          padding: 14px 18px;
          background: #fafbfd;
          border-bottom: 1px solid #e8edf2;
          text-align: left;
          color: #69778a;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        td {
          padding: 16px 18px;
          border-bottom: 1px solid #edf1f4;
          color: #3d4c5f;
          font-size: 13px;
          vertical-align: middle;
        }

        tbody tr:hover {
          background: #fbfcfe;
        }

        .date {
          white-space: nowrap;
          color: #64748b;
        }

        .userId {
          display: block;
          max-width: 190px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: monospace;
          font-size: 11px;
          color: #64748b;
        }

        .status {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
        }

        .statusVerified {
          background: #e9f7ef;
          color: #1b7b49;
        }

        .statusUnverified {
          background: #fff5df;
          color: #996400;
        }

        .viewButton {
          border: 1px solid #d7e0e8;
          background: #ffffff;
          color: #1676c5;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .viewButton:hover {
          background: #f3f8fc;
        }

        .emptyState {
          padding: 60px 20px;
          text-align: center;
        }

        .emptyState h3 {
          margin: 0 0 8px;
        }

        .emptyState p {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }

        .modalBackdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 27, 40, 0.45);
        }

        .modal {
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 25px 70px rgba(15, 27, 40, 0.2);
        }

        .modalHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding: 24px;
          border-bottom: 1px solid #e8edf2;
        }

        .eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #1676c5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .modalHeader h2 {
          margin: 0;
          font-size: 20px;
          word-break: break-word;
        }

        .closeButton {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: #f1f4f7;
          color: #536174;
          font-size: 22px;
          cursor: pointer;
        }

        .detailsGrid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 1px;
          background: #e8edf2;
        }

        .detail {
          background: #ffffff;
          padding: 17px 20px;
          min-width: 0;
        }

        .detail.full {
          grid-column: 1 / -1;
        }

        .detail span {
          display: block;
          margin-bottom: 7px;
          color: #7a8798;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .detail strong {
          display: block;
          color: #263548;
          font-size: 13px;
          line-height: 1.5;
        }

        .break {
          word-break: break-all;
        }

        .modalFooter {
          display: flex;
          justify-content: flex-end;
          padding: 18px 24px;
          border-top: 1px solid #e8edf2;
        }

        .modalFooter button {
          border: 0;
          border-radius: 8px;
          padding: 10px 18px;
          background: #1676c5;
          color: #ffffff;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 850px) {
          .statsGrid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .header {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 650px) {
          .page {
            padding: 28px 15px 50px;
          }

          h1 {
            font-size: 28px;
          }

          .filters {
            grid-template-columns: 1fr;
          }

          .detailsGrid {
            grid-template-columns: 1fr;
          }

          .detail.full {
            grid-column: auto;
          }
        }

        @media (max-width: 450px) {
          .statsGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}