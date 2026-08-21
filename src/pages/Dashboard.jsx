import { useEffect, useState } from "react";
import { getDashboard } from "../services/dashboardService";
import "./Dashboard.css";

export default function Dashboard() {
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getDashboard();

      // Backend response:
      // {
      //   success: true,
      //   data: {
      //     totalUsers,
      //     totalVendors,
      //     pendingVendors,
      //     approvedVendors,
      //     totalProducts,
      //     pendingProducts,
      //     totalOrders
      //   }
      // }

      const data =
        response?.data ||
        response;

      setDashboard(data);

    } catch (error) {
      console.error(
        "DASHBOARD ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-header">
          <div>
            <div className="skeleton title-skeleton"></div>
            <div className="skeleton subtitle-skeleton"></div>
          </div>

          <div className="skeleton button-skeleton"></div>
        </div>

        <div className="dashboard-grid">

          {Array.from({
            length: 7,
          }).map((_, index) => (
            <div
              className="dashboard-card skeleton-card"
              key={index}
            >
              <div className="skeleton skeleton-label"></div>

              <div className="skeleton skeleton-value"></div>

              <div className="skeleton skeleton-description"></div>
            </div>
          ))}

        </div>

        <div className="dashboard-section">

          <div className="section-header">
            <div>
              <div className="skeleton section-title-skeleton"></div>

              <div className="skeleton section-subtitle-skeleton"></div>
            </div>
          </div>

          <div className="orders-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading recent orders...
            </p>

          </div>

        </div>

      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-error">

          <div className="error-icon">
            !
          </div>

          <h2>
            Unable to load dashboard
          </h2>

          <p>
            {error}
          </p>

          <button
            className="refresh-button"
            onClick={loadDashboard}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  /* =========================
     EMPTY
  ========================= */

  if (!dashboard) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-empty">

          <div className="empty-icon">
            📊
          </div>

          <h2>
            No dashboard data
          </h2>

          <p>
            Dashboard information is
            currently unavailable.
          </p>

          <button
            className="refresh-button"
            onClick={loadDashboard}
          >
            Refresh
          </button>

        </div>

      </div>
    );
  }

  /* =========================
     KPI CARDS
  ========================= */

  const cards = [
    {
      title: "Total Users",
      value:
        dashboard.totalUsers ?? 0,
      description:
        "Registered users",
      className: "blue",
    },

    {
      title: "Total Vendors",
      value:
        dashboard.totalVendors ?? 0,
      description:
        "Marketplace vendors",
      className: "purple",
    },

    {
      title: "Pending Vendors",
      value:
        dashboard.pendingVendors ?? 0,
      description:
        "Awaiting approval",
      className: "orange",
    },

    {
      title: "Approved Vendors",
      value:
        dashboard.approvedVendors ?? 0,
      description:
        "Approved vendors",
      className: "green",
    },

    {
      title: "Total Products",
      value:
        dashboard.totalProducts ?? 0,
      description:
        "Products in marketplace",
      className: "cyan",
    },

    {
      title: "Pending Products",
      value:
        dashboard.pendingProducts ?? 0,
      description:
        "Awaiting approval",
      className: "yellow",
    },

    {
      title: "Total Orders",
      value:
        dashboard.totalOrders ?? 0,
      description:
        "Marketplace orders",
      className: "pink",
    },
  ];

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="dashboard-header">

        <div>
          <h1>
            Dashboard
          </h1>

          <p>
            Marketplace overview
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadDashboard}
        >
          ↻ Refresh
        </button>

      </div>

      {/* =========================
          KPI CARDS
      ========================= */}

      <div className="dashboard-grid">

        {cards.map((card) => (
          <div
            className={`dashboard-card ${card.className}`}
            key={card.title}
          >

            <div className="card-top">

              <span className="card-title">
                {card.title}
              </span>

              <span className="card-dot"></span>

            </div>

            <div className="card-value">
              {card.value}
            </div>

            <div className="card-description">
              {card.description}
            </div>

          </div>
        ))}

      </div>

      {/* =========================
          RECENT ORDERS
      ========================= */}

      <div className="dashboard-section">

        <div className="section-header">

          <div>
            <h2>
              Recent Orders
            </h2>

            <p>
              Latest marketplace orders
            </p>
          </div>

        </div>

        <div className="orders-empty">

          <div className="empty-icon">
            🛒
          </div>

          <h3>
            Recent orders unavailable
          </h3>

          <p>
            The current dashboard API
            provides the total order count,
            but does not return a recent
            orders list.
          </p>

        </div>

      </div>

    </div>
  );
}