import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "./Dashboard.css";

/* =========================================================
   DEFAULT DASHBOARD DATA
========================================================= */

const EMPTY_DASHBOARD = {
  totalUsers: 0,
  totalVendors: 0,
  pendingVendors: 0,
  approvedVendors: 0,
  totalProducts: 0,
  pendingProducts: 0,
  totalOrders: 0,
};

/* =========================================================
   NUMBER HELPER
========================================================= */

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);

  return Number.isNaN(number) ? 0 : number;
};

/* =========================================================
   FIND VALUE FROM OBJECT
========================================================= */

const findValue = (object, keys = []) => {
  if (!object || typeof object !== "object") {
    return undefined;
  }

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null
    ) {
      return object[key];
    }
  }

  return undefined;
};

/* =========================================================
   EXTRACT DASHBOARD DATA
========================================================= */

const extractDashboard = (response) => {
  const body = response?.data || {};

  /*
    Common API response:

    {
      success: true,
      data: {
        totalUsers: 17,
        totalVendors: 4,
        ...
      }
    }
  */

  const data =
    body?.data ||
    body?.dashboard ||
    body?.result ||
    body;

  if (!data || typeof data !== "object") {
    return EMPTY_DASHBOARD;
  }

  return {
    totalUsers: toNumber(
      findValue(data, [
        "totalUsers",
        "users",
        "userCount",
        "totalUser",
      ])
    ),

    totalVendors: toNumber(
      findValue(data, [
        "totalVendors",
        "vendors",
        "vendorCount",
        "totalVendor",
      ])
    ),

    pendingVendors: toNumber(
      findValue(data, [
        "pendingVendors",
        "pendingVendor",
        "vendorsPending",
        "pendingVendorsCount",
      ])
    ),

    approvedVendors: toNumber(
      findValue(data, [
        "approvedVendors",
        "approvedVendor",
        "vendorsApproved",
        "approvedVendorsCount",
      ])
    ),

    totalProducts: toNumber(
      findValue(data, [
        "totalProducts",
        "products",
        "productCount",
        "totalProduct",
      ])
    ),

    pendingProducts: toNumber(
      findValue(data, [
        "pendingProducts",
        "pendingProduct",
        "productsPending",
        "pendingProductsCount",
      ])
    ),

    totalOrders: toNumber(
      findValue(data, [
        "totalOrders",
        "orders",
        "orderCount",
        "totalOrder",
      ])
    ),
  };
};

/* =========================================================
   EXTRACT RECENT ORDERS
========================================================= */

const extractRecentOrders = (response) => {
  const body = response?.data || {};

  const data =
    body?.data ||
    body?.dashboard ||
    body?.result ||
    body;

  if (!data || typeof data !== "object") {
    return [];
  }

  /*
    Different possible backend structures are supported.

    data.recentOrders
    data.recent_orders
    data.orders
    data.latestOrders
    data.latest_orders
  */

  const possibleOrders = [
    data?.recentOrders,
    data?.recent_orders,
    data?.latestOrders,
    data?.latest_orders,
    data?.orders,
  ];

  for (const orders of possibleOrders) {
    if (Array.isArray(orders)) {
      return orders.slice(0, 5);
    }
  }

  return [];
};

/* =========================================================
   FORMAT CURRENCY
========================================================= */

const formatCurrency = (value) => {
  const amount = toNumber(value);

  return `₹${amount.toLocaleString("en-IN")}`;
};

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   ORDER ID
========================================================= */

const getOrderId = (order) => {
  return (
    order?.orderNumber ||
    order?.orderNo ||
    order?.orderId ||
    order?.id ||
    order?._id ||
    "-"
  );
};

/* =========================================================
   CUSTOMER NAME
========================================================= */

const getCustomerName = (order) => {
  if (order?.customerName) {
    return order.customerName;
  }

  if (order?.customer?.name) {
    return order.customer.name;
  }

  if (order?.user?.name) {
    return order.user.name;
  }

  if (order?.customer?.email) {
    return order.customer.email;
  }

  if (order?.user?.email) {
    return order.user.email;
  }

  return "Customer";
};

/* =========================================================
   ORDER STATUS
========================================================= */

const getOrderStatus = (order) => {
  return (
    order?.status ||
    order?.orderStatus ||
    order?.paymentStatus ||
    "Pending"
  );
};

/* =========================================================
   ORDER AMOUNT
========================================================= */

const getOrderAmount = (order) => {
  return (
    order?.totalAmount ??
    order?.total ??
    order?.amount ??
    order?.grandTotal ??
    order?.price ??
    0
  );
};

/* =========================================================
   DASHBOARD COMPONENT
========================================================= */

export default function Dashboard() {
  const [dashboard, setDashboard] =
    useState(EMPTY_DASHBOARD);

  const [recentOrders, setRecentOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        setError("");

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        console.log(
          "========== DASHBOARD REQUEST =========="
        );

        const response =
          await api.get("/admin/dashboard");

        console.log(
          "DASHBOARD RESPONSE:",
          response
        );

        /* -----------------------------------------------
           KPI DATA
        ------------------------------------------------ */

        const dashboardData =
          extractDashboard(response);

        console.log(
          "DASHBOARD KPI DATA:",
          dashboardData
        );

        setDashboard({
          ...EMPTY_DASHBOARD,
          ...dashboardData,
        });

        /* -----------------------------------------------
           RECENT ORDERS
        ------------------------------------------------ */

        const orders =
          extractRecentOrders(response);

        console.log(
          "RECENT ORDERS:",
          orders
        );

        setRecentOrders(orders);

      } catch (err) {
        console.error(
          "DASHBOARD ERROR:",
          err
        );

        const backendMessage =
          err?.response?.data?.message;

        if (Array.isArray(backendMessage)) {
          setError(
            backendMessage.join(", ")
          );
        } else {
          setError(
            backendMessage ||
              err?.message ||
              "Unable to load dashboard."
          );
        }

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* =======================================================
     KPI CARDS
  ======================================================= */

  const cards = [
    {
      title: "Total Users",
      value: dashboard.totalUsers,
      subtitle: "Registered users",
      icon: "👥",
      className: "blue",
    },
    {
      title: "Total Vendors",
      value: dashboard.totalVendors,
      subtitle: "Marketplace vendors",
      icon: "🏪",
      className: "purple",
    },
    {
      title: "Pending Vendors",
      value: dashboard.pendingVendors,
      subtitle: "Awaiting approval",
      icon: "⏳",
      className: "orange",
    },
    {
      title: "Approved Vendors",
      value: dashboard.approvedVendors,
      subtitle: "Approved vendors",
      icon: "✓",
      className: "green",
    },
    {
      title: "Total Products",
      value: dashboard.totalProducts,
      subtitle: "Products in marketplace",
      icon: "📦",
      className: "cyan",
    },
    {
      title: "Pending Products",
      value: dashboard.pendingProducts,
      subtitle: "Awaiting approval",
      icon: "⏳",
      className: "yellow",
    },
    {
      title: "Total Orders",
      value: dashboard.totalOrders,
      subtitle: "Marketplace orders",
      icon: "🛒",
      className: "pink",
    },
  ];

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>
          <span className="dashboard-label">
            ADMIN DASHBOARD
          </span>

          <h1>Dashboard</h1>

          <p>
            Marketplace overview
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="dashboard-error">

          <div>
            <strong>
              Unable to load dashboard
            </strong>

            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
          >
            Retry
          </button>

        </div>
      )}

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section className="kpi-grid">

        {cards.map((card) => (
          <article
            key={card.title}
            className={`kpi-card ${card.className}`}
          >

            <div className="kpi-top">

              <h3>
                {card.title}
              </h3>

              <span className="kpi-icon">
                {card.icon}
              </span>

            </div>

            <div className="kpi-value">
              {card.value}
            </div>

            <p>
              {card.subtitle}
            </p>

          </article>
        ))}

      </section>

      {/* =================================================
          RECENT ORDERS
      ================================================= */}

      <section className="orders-section">

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

        {recentOrders.length > 0 ? (
          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {recentOrders.map(
                  (order, index) => {

                    const status =
                      getOrderStatus(order);

                    return (
                      <tr
                        key={
                          order?.id ||
                          order?._id ||
                          index
                        }
                      >

                        <td>
                          <span className="order-id">
                            #{getOrderId(order)}
                          </span>
                        </td>

                        <td>
                          <div className="customer-cell">
                            <span className="customer-avatar">
                              {getCustomerName(
                                order
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </span>

                            <span>
                              {getCustomerName(
                                order
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${String(
                              status
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              getOrderAmount(
                                order
                              )
                            )}
                          </strong>
                        </td>

                        <td>
                          {formatDate(
                            order?.createdAt ||
                              order?.created_at ||
                              order?.date
                          )}
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        ) : (
          <div className="empty-orders">

            <div className="empty-orders-icon">
              🛒
            </div>

            <h3>
              No recent orders
            </h3>

            <p>
              No recent order data is available
              from the dashboard API.
            </p>

          </div>
        )}

      </section>

    </div>
  );
}