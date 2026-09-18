"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Payment = {
  id: string;
  created_at: string;
  verification_id: string | null;
  user_id: string | null;
  plan: string | null;
  amount: number | null;
  currency: string | null;
  provider: string | null;
  payment_method: string | null;
  provider_reference: string | null;
  status: string | null;
  paid_at: string | null;
  updated_at: string | null;
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      setCheckingAdmin(true);
      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          window.location.href = "/signin";
          return;
        }

        const { data: admin, error: adminError } = await supabase
          .from("admin_users")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (adminError) {
          throw new Error(adminError.message);
        }

        if (!admin) {
          window.location.href = "/";
          return;
        }

        setCheckingAdmin(false);

        const { data, error: paymentsError } = await supabase
          .from("payments")
          .select(
            "id,created_at,verification_id,user_id,plan,amount,currency,provider,payment_method,provider_reference,status,paid_at,updated_at",
          )
          .order("created_at", { ascending: false });

        if (paymentsError) {
          throw new Error(paymentsError.message);
        }

        setPayments((data || []) as Payment[]);
      } catch (err) {
        console.error("Admin payments error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load payments.",
        );
      } finally {
        setLoading(false);
        setCheckingAdmin(false);
      }
    };

    loadPayments();
  }, []);

  const formatAmount = (
    amount: number | null,
    currency: string | null,
  ) => {
    if (amount === null || amount === undefined) {
      return "—";
    }

    if ((currency || "").toUpperCase() === "NGN") {
      return `₦${amount.toLocaleString("en-NG")}`;
    }

    return `${currency || ""} ${amount.toLocaleString()}`.trim();
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const normalizeStatus = (status: string | null) => {
    return (status || "unknown").toLowerCase();
  };

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !query ||
        payment.id.toLowerCase().includes(query) ||
        (payment.provider_reference || "")
          .toLowerCase()
          .includes(query) ||
        (payment.user_id || "").toLowerCase().includes(query) ||
        (payment.verification_id || "")
          .toLowerCase()
          .includes(query) ||
        (payment.plan || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        normalizeStatus(payment.status) === statusFilter;

      const matchesPlan =
        planFilter === "all" ||
        (payment.plan || "").toLowerCase() ===
          planFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [payments, search, statusFilter, planFilter]);

  const totalPayments = payments.length;

  const paidPayments = payments.filter(
    (payment) => normalizeStatus(payment.status) === "paid",
  ).length;

  const pendingPayments = payments.filter(
    (payment) => normalizeStatus(payment.status) === "pending",
  ).length;

  const failedPayments = payments.filter(
    (payment) => normalizeStatus(payment.status) === "failed",
  ).length;

  const totalRevenue = payments
    .filter(
      (payment) => normalizeStatus(payment.status) === "paid",
    )
    .reduce((total, payment) => total + (payment.amount || 0), 0);

  if (checkingAdmin || loading) {
    return (
      <main className="adminPage">
        <div className="adminLoading">Loading payments...</div>

        <style jsx>{`
          .adminPage {
            min-height: 100vh;
            background: #f6f8fb;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            font-family: Arial, Helvetica, sans-serif;
          }

          .adminLoading {
            color: #536174;
            font-size: 15px;
          }
        `}</style>
      </main>
    );
  }

  if (error) {
    return (
      <main className="adminPage">
        <div className="errorCard">
          <h2>Unable to load payments</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>

        <style jsx>{`
          .adminPage {
            min-height: 100vh;
            background: #f6f8fb;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            font-family: Arial, Helvetica, sans-serif;
          }

          .errorCard {
            width: 100%;
            max-width: 520px;
            background: white;
            border: 1px solid #e5eaf0;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(20, 35, 50, 0.06);
          }

          .errorCard h2 {
            margin: 0 0 10px;
            color: #162333;
          }

          .errorCard p {
            color: #657386;
            line-height: 1.6;
            word-break: break-word;
          }

          .errorCard button {
            margin-top: 12px;
            border: 0;
            border-radius: 8px;
            padding: 11px 18px;
            background: #1676c5;
            color: white;
            cursor: pointer;
            font-weight: 600;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <div className="container">
        <div className="topBar">
          <div>
            <button
              type="button"
              className="backButton"
              onClick={() => {
                window.location.href = "/admin";
              }}
            >
              ← Admin Dashboard
            </button>

            <h1>Payments</h1>
            <p>
              Monitor customer payments and Paystack transactions.
            </p>
          </div>
        </div>

        <section className="statsGrid">
          <div className="statCard">
            <span className="statLabel">Total Payments</span>
            <strong>{totalPayments}</strong>
          </div>

          <div className="statCard">
            <span className="statLabel">Paid</span>
            <strong>{paidPayments}</strong>
          </div>

          <div className="statCard">
            <span className="statLabel">Pending</span>
            <strong>{pendingPayments}</strong>
          </div>

          <div className="statCard">
            <span className="statLabel">Failed</span>
            <strong>{failedPayments}</strong>
          </div>

          <div className="statCard revenueCard">
            <span className="statLabel">Paid Revenue</span>
            <strong>₦{totalRevenue.toLocaleString("en-NG")}</strong>
          </div>
        </section>

        <section className="controlsCard">
          <div className="searchBox">
            <input
              type="text"
              placeholder="Search payment, reference, user, verification..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={planFilter}
            onChange={(event) =>
              setPlanFilter(event.target.value)
            }
          >
            <option value="all">All Plans</option>
            <option value="essential">Essential</option>
            <option value="professional">Professional</option>
            <option value="premium">Premium</option>
          </select>
        </section>

        <section className="tableCard">
          <div className="tableHeader">
            <div>
              <h2>Payment Transactions</h2>
              <span>
                Showing {filteredPayments.length} of{" "}
                {payments.length} payments
              </span>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="emptyState">
              <h3>No payments found</h3>
              <p>
                No payment transactions match the current filters.
              </p>
            </div>
          ) : (
            <div className="tableWrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Provider</th>
                    <th>Reference</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => {
                    const status = normalizeStatus(
                      payment.status,
                    );

                    return (
                      <tr key={payment.id}>
                        <td>
                          <span className="dateText">
                            {formatDate(payment.created_at)}
                          </span>
                        </td>

                        <td>
                          <span className="planBadge">
                            {payment.plan || "—"}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {formatAmount(
                              payment.amount,
                              payment.currency,
                            )}
                          </strong>
                        </td>

                        <td>
                          {payment.provider || "—"}
                        </td>

                        <td>
                          <span className="reference">
                            {payment.provider_reference ||
                              payment.id}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status status-${status}`}
                          >
                            {payment.status || "Unknown"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="viewButton"
                            onClick={() =>
                              setSelectedPayment(payment)
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

      {selectedPayment && (
        <div
          className="modalBackdrop"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modalHeader">
              <div>
                <span className="modalEyebrow">
                  PAYMENT DETAILS
                </span>
                <h2>Transaction Details</h2>
              </div>

              <button
                type="button"
                className="closeButton"
                onClick={() => setSelectedPayment(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modalStatusRow">
              <span
                className={`status status-${normalizeStatus(
                  selectedPayment.status,
                )}`}
              >
                {selectedPayment.status || "Unknown"}
              </span>

              <strong>
                {formatAmount(
                  selectedPayment.amount,
                  selectedPayment.currency,
                )}
              </strong>
            </div>

            <div className="detailsGrid">
              <div className="detailItem">
                <span>Plan</span>
                <strong>
                  {selectedPayment.plan || "—"}
                </strong>
              </div>

              <div className="detailItem">
                <span>Provider</span>
                <strong>
                  {selectedPayment.provider || "—"}
                </strong>
              </div>

              <div className="detailItem">
                <span>Payment Method</span>
                <strong>
                  {selectedPayment.payment_method || "—"}
                </strong>
              </div>

              <div className="detailItem">
                <span>Currency</span>
                <strong>
                  {selectedPayment.currency || "—"}
                </strong>
              </div>

              <div className="detailItem full">
                <span>Provider Reference</span>
                <strong className="break">
                  {selectedPayment.provider_reference ||
                    "—"}
                </strong>
              </div>

              <div className="detailItem full">
                <span>Payment ID</span>
                <strong className="break">
                  {selectedPayment.id}
                </strong>
              </div>

              <div className="detailItem full">
                <span>Verification ID</span>
                <strong className="break">
                  {selectedPayment.verification_id || "—"}
                </strong>
              </div>

              <div className="detailItem full">
                <span>User ID</span>
                <strong className="break">
                  {selectedPayment.user_id || "—"}
                </strong>
              </div>

              <div className="detailItem">
                <span>Created</span>
                <strong>
                  {formatDate(selectedPayment.created_at)}
                </strong>
              </div>

              <div className="detailItem">
                <span>Paid At</span>
                <strong>
                  {formatDate(selectedPayment.paid_at)}
                </strong>
              </div>

              <div className="detailItem full">
                <span>Last Updated</span>
                <strong>
                  {formatDate(selectedPayment.updated_at)}
                </strong>
              </div>
            </div>

            <div className="modalFooter">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .adminPage {
          min-height: 100vh;
          background: #f6f8fb;
          color: #162333;
          font-family: Arial, Helvetica, sans-serif;
          padding: 42px 24px 70px;
        }

        .container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .topBar {
          margin-bottom: 28px;
        }

        .backButton {
          border: 0;
          background: transparent;
          color: #1676c5;
          font-size: 14px;
          font-weight: 600;
          padding: 0;
          margin-bottom: 18px;
          cursor: pointer;
        }

        h1 {
          margin: 0;
          font-size: 32px;
          letter-spacing: -0.6px;
        }

        .topBar p {
          margin: 8px 0 0;
          color: #66758a;
          font-size: 15px;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .statCard {
          background: white;
          border: 1px solid #e4eaf0;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 5px 20px rgba(20, 35, 50, 0.035);
        }

        .statLabel {
          display: block;
          color: #718095;
          font-size: 13px;
          margin-bottom: 10px;
        }

        .statCard strong {
          display: block;
          font-size: 25px;
          color: #162333;
        }

        .revenueCard strong {
          font-size: 22px;
        }

        .controlsCard {
          display: grid;
          grid-template-columns: minmax(240px, 1fr) 180px 180px;
          gap: 12px;
          background: white;
          border: 1px solid #e4eaf0;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 18px;
        }

        .searchBox input,
        .controlsCard select {
          width: 100%;
          height: 44px;
          border: 1px solid #dce3ea;
          border-radius: 9px;
          background: white;
          padding: 0 13px;
          color: #243244;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
        }

        .searchBox input:focus,
        .controlsCard select:focus {
          border-color: #1676c5;
        }

        .tableCard {
          background: white;
          border: 1px solid #e4eaf0;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(20, 35, 50, 0.035);
        }

        .tableHeader {
          padding: 20px 22px;
          border-bottom: 1px solid #e8edf2;
        }

        .tableHeader h2 {
          margin: 0 0 6px;
          font-size: 18px;
        }

        .tableHeader span {
          color: #718095;
          font-size: 13px;
        }

        .tableWrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 980px;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 14px 18px;
          background: #fafbfd;
          color: #69778a;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.35px;
          border-bottom: 1px solid #e8edf2;
        }

        td {
          padding: 16px 18px;
          border-bottom: 1px solid #edf1f4;
          color: #334154;
          font-size: 13px;
          vertical-align: middle;
        }

        tbody tr:hover {
          background: #fbfcfe;
        }

        .dateText {
          white-space: nowrap;
        }

        .planBadge {
          display: inline-flex;
          align-items: center;
          padding: 6px 9px;
          border-radius: 7px;
          background: #eef5fb;
          color: #176eae;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .reference {
          display: block;
          max-width: 190px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: monospace;
          font-size: 12px;
          color: #536174;
        }

        .status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .status-paid {
          background: #e9f7ef;
          color: #1b7b49;
        }

        .status-pending {
          background: #fff5df;
          color: #996400;
        }

        .status-failed {
          background: #fdeceb;
          color: #b42318;
        }

        .status-unknown {
          background: #edf1f5;
          color: #5f6d7e;
        }

        .viewButton {
          border: 1px solid #d7e0e8;
          background: white;
          color: #1676c5;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .viewButton:hover {
          background: #f3f8fc;
        }

        .emptyState {
          text-align: center;
          padding: 60px 20px;
        }

        .emptyState h3 {
          margin: 0 0 8px;
        }

        .emptyState p {
          margin: 0;
          color: #718095;
          font-size: 14px;
        }

        .modalBackdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(15, 27, 40, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal {
          width: 100%;
          max-width: 760px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 70px rgba(15, 27, 40, 0.2);
        }

        .modalHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid #e8edf2;
        }

        .modalEyebrow {
          display: block;
          color: #1676c5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 7px;
        }

        .modalHeader h2 {
          margin: 0;
          font-size: 21px;
        }

        .closeButton {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: #f1f4f7;
          color: #536174;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }

        .modalStatusRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 20px 24px;
          background: #fafbfd;
          border-bottom: 1px solid #e8edf2;
        }

        .modalStatusRow > strong {
          font-size: 22px;
        }

        .detailsGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1px;
          background: #e8edf2;
        }

        .detailItem {
          background: white;
          padding: 17px 20px;
          min-width: 0;
        }

        .detailItem.full {
          grid-column: 1 / -1;
        }

        .detailItem span {
          display: block;
          color: #7a8798;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .detailItem strong {
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
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 1050px) {
          .statsGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .adminPage {
            padding: 28px 15px 50px;
          }

          h1 {
            font-size: 27px;
          }

          .statsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .controlsCard {
            grid-template-columns: 1fr;
          }

          .detailsGrid {
            grid-template-columns: 1fr;
          }

          .detailItem.full {
            grid-column: auto;
          }

          .modalStatusRow {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .statsGrid {
            grid-template-columns: 1fr;
          }

          .statCard strong {
            font-size: 23px;
          }

          .revenueCard strong {
            font-size: 20px;
          }
        }
      `}</style>
    </main>
  );
}