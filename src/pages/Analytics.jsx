import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import api from "../services/api";

import "./Analytics.css";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState("90d");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async (
    selectedPeriod = period
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/analytics",
        {
          params: {
            period: selectedPeriod,
            groupBy: "day",
          },
        }
      );

      console.log(
        "ANALYTICS RESPONSE:",
        response.data
      );

      const result =
        response?.data?.data?.data ||
        response?.data?.data ||
        response?.data;

      setAnalytics(result);
    } catch (err) {
      console.error(
        "ANALYTICS ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(period);
  }, [period]);

  if (loading) {
    return (
      <div className="analytics-page">
        <h1>Analytics</h1>

        <div className="analytics-loading">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">

        <div className="analytics-header">
          <div>
            <h1>Analytics</h1>
            <p>
              Marketplace performance analytics.
            </p>
          </div>

          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value)
            }
          >
            <option value="7d">
              Last 7 Days
            </option>

            <option value="30d">
              Last 30 Days
            </option>

            <option value="90d">
              Last 90 Days
            </option>

            <option value="12m">
              Last 12 Months
            </option>
          </select>
        </div>

        <div className="analytics-error">
          <h2>
            Unable to load analytics
          </h2>

          <p>{error}</p>

          <button
            onClick={() =>
              loadAnalytics(period)
            }
          >
            Try Again
          </button>
        </div>

      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-page">
        <div className="analytics-empty">
          No analytics data available.
        </div>
      </div>
    );
  }

  const summary =
    analytics.summary || {};

  const orders =
    analytics.orders || {};

  const revenue =
    analytics.revenue || {};

  const inventory =
    analytics.inventory || {};

  const customers =
    analytics.customers || {};

  const timeseries =
    analytics.timeseries || [];

  const topProducts =
    analytics.topProducts || [];

  const topCustomers =
    analytics.topCustomers || [];

  const vendors =
    analytics.vendors || [];

  const recentOrders =
    analytics.recentOrders || [];

  return (
    <div className="analytics-page">

      {/* HEADER */}

      <div className="analytics-header">

        <div>
          <h1>Analytics</h1>

          <p>
            Marketplace performance analytics.
          </p>
        </div>

        <select
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value)
          }
        >
          <option value="7d">
            Last 7 Days
          </option>

          <option value="30d">
            Last 30 Days
          </option>

          <option value="90d">
            Last 90 Days
          </option>

          <option value="12m">
            Last 12 Months
          </option>
        </select>

      </div>

      {/* KPI */}

      <div className="analytics-kpis">

        <Kpi
          title="New Orders"
          value={summary.newOrders}
          growth={
            summary.ordersGrowthPct
          }
        />

        <Kpi
          title="Revenue"
          value={`₹${Number(
            summary.revenue || 0
          ).toLocaleString()}`}
          growth={
            summary.revenueGrowthPct
          }
        />

        <Kpi
          title="Average Order"
          value={`₹${Number(
            summary.averageOrderValue || 0
          ).toLocaleString()}`}
        />

        <Kpi
          title="New Customers"
          value={
            summary.newCustomers
          }
          growth={
            summary.customersGrowthPct
          }
        />

      </div>

      {/* CHART */}

      <section className="analytics-card">

        <div className="analytics-card-header">

          <div>
            <h2>
              Orders & Revenue
            </h2>

            <p>
              Performance over selected period.
            </p>
          </div>

        </div>

        <div className="chart-container">

          {timeseries.length === 0 ? (
            <div className="chart-empty">
              No timeseries data available.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={330}
            >
              <LineChart
                data={timeseries}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#2864e8"
                  strokeWidth={3}
                  dot={false}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={false}
                />

              </LineChart>
            </ResponsiveContainer>
          )}

        </div>

      </section>

      {/* SECOND ROW */}

      <div className="analytics-two-column">

        {/* ORDERS */}

        <section className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>
                Orders Overview
              </h2>

              <p>
                Order status breakdown.
              </p>
            </div>
          </div>

          <div className="order-status-list">

            {Object.entries(
              orders.byStatus || {}
            ).map(
              ([status, value]) => (
                <div
                  className="status-line"
                  key={status}
                >
                  <span>
                    {status}
                  </span>

                  <strong>
                    {value}
                  </strong>
                </div>
              )
            )}

          </div>

          <div className="order-summary-box">

            <div>
              <span>
                Total Orders
              </span>

              <strong>
                {orders.totalOrdersAllTime ||
                  0}
              </strong>
            </div>

            <div>
              <span>
                Growth
              </span>

              <strong>
                {orders.growthPct || 0}%
              </strong>
            </div>

          </div>

        </section>

        {/* REVENUE */}

        <section className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>
                Revenue
              </h2>

              <p>
                Revenue breakdown.
              </p>
            </div>
          </div>

          <div className="revenue-main">
            ₹
            {Number(
              revenue.paidRevenue || 0
            ).toLocaleString()}
          </div>

          <div className="revenue-list">

            <div>
              <span>
                Gross Sales
              </span>

              <strong>
                ₹
                {Number(
                  revenue.grossSales || 0
                ).toLocaleString()}
              </strong>
            </div>

            <div>
              <span>
                Refunded
              </span>

              <strong>
                ₹
                {Number(
                  revenue.refundedAmount || 0
                ).toLocaleString()}
              </strong>
            </div>

            <div>
              <span>
                Tax
              </span>

              <strong>
                ₹
                {Number(
                  revenue.breakdown?.tax ||
                    0
                ).toLocaleString()}
              </strong>
            </div>

          </div>

        </section>

      </div>

      {/* INVENTORY */}

      <section className="analytics-card">

        <div className="analytics-card-header">
          <div>
            <h2>
              Inventory
            </h2>

            <p>
              Current stock health.
            </p>
          </div>
        </div>

        <div className="inventory-grid">

          <InventoryItem
            label="Stock On Hand"
            value={
              inventory.stockOnHand
            }
          />

          <InventoryItem
            label="Reserved"
            value={
              inventory.reservedStock
            }
          />

          <InventoryItem
            label="Sold"
            value={
              inventory.soldStock
            }
          />

          <InventoryItem
            label="Low Stock"
            value={
              inventory.lowStockVariants
            }
          />

          <InventoryItem
            label="Out of Stock"
            value={
              inventory.outOfStockVariants
            }
          />

        </div>

      </section>

      {/* TOP PRODUCTS + CUSTOMERS */}

      <div className="analytics-two-column">

        <section className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>
                Top Products
              </h2>
            </div>
          </div>

          <div className="simple-list">

            {topProducts.length === 0 ? (
              <p className="muted">
                No products available.
              </p>
            ) : (
              topProducts.map(
                (product, index) => (
                  <div
                    className="simple-list-row"
                    key={
                      product.productId ||
                      index
                    }
                  >

                    <div>
                      <strong>
                        {product.title}
                      </strong>

                      <span>
                        {product.unitsSold ||
                          0} units sold
                      </span>
                    </div>

                    <strong>
                      ₹
                      {Number(
                        product.revenue ||
                          0
                      ).toLocaleString()}
                    </strong>

                  </div>
                )
              )
            )}

          </div>

        </section>

        <section className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h2>
                Top Customers
              </h2>
            </div>
          </div>

          <div className="simple-list">

            {topCustomers.length === 0 ? (
              <p className="muted">
                No customers available.
              </p>
            ) : (
              topCustomers.map(
                (customer, index) => (
                  <div
                    className="simple-list-row"
                    key={
                      customer.userId ||
                      index
                    }
                  >

                    <div>
                      <strong>
                        {customer.fullName}
                      </strong>

                      <span>
                        {customer.email}
                      </span>
                    </div>

                    <strong>
                      ₹
                      {Number(
                        customer.spent || 0
                      ).toLocaleString()}
                    </strong>

                  </div>
                )
              )
            )}

          </div>

        </section>

      </div>

      {/* VENDORS */}

      <section className="analytics-card">

        <div className="analytics-card-header">
          <div>
            <h2>
              Top Vendors
            </h2>

            <p>
              Vendor sales performance.
            </p>
          </div>
        </div>

        <div className="simple-list">

          {vendors.length === 0 ? (
            <div className="chart-empty">
              No vendor data available.
            </div>
          ) : (
            vendors.map(
              (vendor, index) => (
                <div
                  className="simple-list-row"
                  key={
                    vendor.vendorId ||
                    index
                  }
                >

                  <div>
                    <strong>
                      {vendor.shopName}
                    </strong>

                    <span>
                      {vendor.orders || 0} orders
                    </span>
                  </div>

                  <div className="vendor-money">
                    <strong>
                      ₹
                      {Number(
                        vendor.sales || 0
                      ).toLocaleString()}
                    </strong>

                    <span>
                      Commission ₹
                      {Number(
                        vendor.commission ||
                          0
                      ).toLocaleString()}
                    </span>
                  </div>

                </div>
              )
            )
          )}

        </div>

      </section>

      {/* RECENT ORDERS */}

      <section className="analytics-card">

        <div className="analytics-card-header">
          <div>
            <h2>
              Recent Orders
            </h2>
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <div className="chart-empty">
            No recent orders available.
          </div>
        ) : (
          <div className="orders-table-wrap">

            <table className="orders-table">

              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>

                {recentOrders.map(
                  (order, index) => (
                    <tr
                      key={
                        order.uuid ||
                        index
                      }
                    >
                      <td>
                        <strong>
                          {order.orderNumber}
                        </strong>
                      </td>

                      <td>
                        {order.customer}
                      </td>

                      <td>
                        <span className="order-badge">
                          {order.status}
                        </span>
                      </td>

                      <td>
                        {order.paymentStatus}
                      </td>

                      <td>
                        ₹
                        {Number(
                          order.amount || 0
                        ).toLocaleString()}
                      </td>
                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}

/* =========================================
   KPI
========================================= */

function Kpi({
  title,
  value,
  growth,
}) {
  return (
    <div className="analytics-kpi">

      <span>
        {title}
      </span>

      <strong>
        {value ?? 0}
      </strong>

      {growth !== undefined && (
        <small
          className={
            growth >= 0
              ? "growth-positive"
              : "growth-negative"
          }
        >
          {growth >= 0 ? "↑" : "↓"}{" "}
          {Math.abs(growth)}%
        </small>
      )}

    </div>
  );
}

/* =========================================
   INVENTORY
========================================= */

function InventoryItem({
  label,
  value,
}) {
  return (
    <div className="inventory-item">

      <span>
        {label}
      </span>

      <strong>
        {Number(value || 0).toLocaleString()}
      </strong>

    </div>
  );
}