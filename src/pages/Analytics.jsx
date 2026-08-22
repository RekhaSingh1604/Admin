import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import toast, { Toaster } from "react-hot-toast";

import {
  getCustomerAnalytics,
  getRevenueAnalytics,
  getInventoryAnalytics,
  getProductAnalytics,
} from "../services/analyticsService";

import "./Analytics.css";

/* =========================================================
   OPTIONS
========================================================= */

const PERIOD_OPTIONS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "1 Year", value: "1y" },
];

const GROUP_OPTIONS = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

const PIE_COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

/* =========================================================
   HELPERS
========================================================= */

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const formatNumber = (value) => {
  return toNumber(value).toLocaleString(
    "en-IN"
  );
};

const formatCurrency = (value) => {
  return `₹${toNumber(value).toLocaleString(
    "en-IN"
  )}`;
};

/*
|--------------------------------------------------------------------------
| Get actual backend data
|--------------------------------------------------------------------------
*/

const extractData = (response) => {
  const body = response?.data ?? response;

  if (
    body &&
    typeof body === "object" &&
    body.data !== undefined
  ) {
    return body.data;
  }

  return body || {};
};

/*
|--------------------------------------------------------------------------
| Error message
|--------------------------------------------------------------------------
*/

const getErrorMessage = (
  error,
  fallback
) => {
  const message =
    error?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (typeof message === "string") {
    return message;
  }

  return (
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

/* =========================================================
   CUSTOMER NORMALIZER
========================================================= */

const normalizeCustomer = (
  response
) => {
  const data = extractData(response);

  const source =
    data?.summary ||
    data?.stats ||
    data;

  const summary = {
    newCustomers: toNumber(
      source?.newCustomers ??
        source?.new_customers ??
        source?.newCustomerCount
    ),

    previousPeriodCustomers: toNumber(
      source?.previousPeriodCustomers ??
        source?.previous_period_customers ??
        source?.previousCustomers
    ),

    totalCustomers: toNumber(
      source?.totalCustomers ??
        source?.total_customers ??
        source?.customers
    ),
  };

  let list =
    data?.timeline ||
    data?.series ||
    data?.chart ||
    data?.data ||
    data?.items ||
    [];

  if (!Array.isArray(list)) {
    list = [];
  }

  const chart = list.map(
    (item, index) => ({
      name:
        item?.date ||
        item?.period ||
        item?.label ||
        item?.name ||
        `Period ${index + 1}`,

      customers: toNumber(
        item?.customers ??
          item?.newCustomers ??
          item?.new_customers ??
          item?.count ??
          item?.value
      ),
    })
  );

  /*
   * If API only gives summary,
   * create chart from summary.
   */

  if (chart.length === 0) {
    chart.push(
      {
        name: "New",
        customers:
          summary.newCustomers,
      },
      {
        name: "Previous",
        customers:
          summary.previousPeriodCustomers,
      },
      {
        name: "Total",
        customers:
          summary.totalCustomers,
      }
    );
  }

  return {
    summary,
    chart,
  };
};

/* =========================================================
   REVENUE NORMALIZER
========================================================= */

const normalizeRevenue = (
  response
) => {
  const data = extractData(response);

  const source =
    data?.summary ||
    data?.stats ||
    data;

  const summary = {
    grossSales: toNumber(
      source?.grossSales ??
        source?.gross_sales ??
        source?.grossRevenue
    ),

    paidRevenue: toNumber(
      source?.paidRevenue ??
        source?.paid_revenue ??
        source?.revenue ??
        source?.totalRevenue
    ),

    refundedAmount: toNumber(
      source?.refundedAmount ??
        source?.refunded_amount ??
        source?.refunds
    ),
  };

  let list =
    data?.timeline ||
    data?.series ||
    data?.chart ||
    data?.data ||
    data?.items ||
    [];

  if (!Array.isArray(list)) {
    list = [];
  }

  const chart = list.map(
    (item, index) => ({
      name:
        item?.date ||
        item?.period ||
        item?.label ||
        item?.name ||
        `Period ${index + 1}`,

      revenue: toNumber(
        item?.revenue ??
          item?.paidRevenue ??
          item?.paid_revenue ??
          item?.amount ??
          item?.value
      ),
    })
  );

  if (chart.length === 0) {
    chart.push(
      {
        name: "Gross Sales",
        revenue:
          summary.grossSales,
      },
      {
        name: "Paid Revenue",
        revenue:
          summary.paidRevenue,
      },
      {
        name: "Refunded",
        revenue:
          summary.refundedAmount,
      }
    );
  }

  return {
    summary,
    chart,
  };
};

/* =========================================================
   INVENTORY NORMALIZER
========================================================= */

const normalizeInventory = (
  response
) => {
  const data = extractData(response);

  const source =
    data?.summary ||
    data?.stats ||
    data;

  const get = (
    camel,
    snake
  ) => {
    return toNumber(
      source?.[camel] ??
        source?.[snake]
    );
  };

  const summary = {
    stockOnHand: get(
      "stockOnHand",
      "stock_on_hand"
    ),

    totalVariants: get(
      "totalVariants",
      "total_variants"
    ),

    inStockVariants: get(
      "inStockVariants",
      "in_stock_variants"
    ),

    lowStockVariants: get(
      "lowStockVariants",
      "low_stock_variants"
    ),

    outOfStockVariants: get(
      "outOfStockVariants",
      "out_of_stock_variants"
    ),

    reservedStock: get(
      "reservedStock",
      "reserved_stock"
    ),

    damagedStock: get(
      "damagedStock",
      "damaged_stock"
    ),
  };

  const chart = [
    {
      name: "In Stock",
      value:
        summary.inStockVariants,
    },
    {
      name: "Low Stock",
      value:
        summary.lowStockVariants,
    },
    {
      name: "Out of Stock",
      value:
        summary.outOfStockVariants,
    },
    {
      name: "Reserved",
      value:
        summary.reservedStock,
    },
    {
      name: "Damaged",
      value:
        summary.damagedStock,
    },
  ].filter(
    (item) => item.value > 0
  );

  return {
    summary,
    chart,
  };
};

/* =========================================================
   PRODUCT NORMALIZER
========================================================= */

const normalizeProduct = (
  response
) => {
  const data = extractData(response);

  const source =
    data?.summary ||
    data?.stats ||
    data;

  const summary = {
    totalProducts: toNumber(
      source?.totalProducts ??
        source?.total_products ??
        source?.products
    ),

    publishedProducts: toNumber(
      source?.publishedProducts ??
        source?.published_products
    ),

    featuredProducts: toNumber(
      source?.featuredProducts ??
        source?.featured_products
    ),
  };

  return {
    summary,

    chart: [
      {
        name: "Total",
        value:
          summary.totalProducts,
      },
      {
        name: "Published",
        value:
          summary.publishedProducts,
      },
      {
        name: "Featured",
        value:
          summary.featuredProducts,
      },
    ],
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Analytics() {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  /* FILTERS */

  const [period, setPeriod] =
    useState("30d");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [groupBy, setGroupBy] =
    useState("day");

  /* LOADING */

  const [loading, setLoading] =
    useState(false);

  /* API DATA */

  const [customerResponse, setCustomerResponse] =
    useState(null);

  const [revenueResponse, setRevenueResponse] =
    useState(null);

  const [inventoryResponse, setInventoryResponse] =
    useState(null);

  const [productResponse, setProductResponse] =
    useState(null);

  /* ERRORS */

  const [errors, setErrors] =
    useState({
      customer: "",
      revenue: "",
      inventory: "",
      product: "",
    });

  /* =======================================================
     BUILD PARAMS
  ======================================================= */

  const buildParams =
    useCallback(() => {
      const params = {
        period,
        groupBy,
      };

      /*
       * Date range overrides preset period.
       */

      if (startDate) {
        params.startDate =
          startDate;
      }

      if (endDate) {
        params.endDate =
          endDate;
      }

      return params;
    }, [
      period,
      groupBy,
      startDate,
      endDate,
    ]);

  /* =======================================================
     LOAD ANALYTICS
  ======================================================= */

  const loadAnalytics =
    useCallback(async () => {
      if (
        startDate &&
        endDate &&
        startDate > endDate
      ) {
        toast.error(
          "Start date cannot be after end date."
        );

        return;
      }

      setLoading(true);

      setErrors({
        customer: "",
        revenue: "",
        inventory: "",
        product: "",
      });

      const params =
        buildParams();

      console.log(
        "FINAL ANALYTICS PARAMS:",
        params
      );

      const results =
        await Promise.allSettled([
          getCustomerAnalytics(
            params
          ),
          getRevenueAnalytics(
            params
          ),
          getInventoryAnalytics(),
          getProductAnalytics(),
        ]);

      /* CUSTOMER */

      if (
        results[0].status ===
        "fulfilled"
      ) {
        console.log(
          "CUSTOMER ANALYTICS RESPONSE:",
          results[0].value
        );

        setCustomerResponse(
          results[0].value
        );
      } else {
        console.error(
          "CUSTOMER ANALYTICS ERROR:",
          results[0].reason
        );

        setErrors((prev) => ({
          ...prev,
          customer:
            getErrorMessage(
              results[0].reason,
              "Unable to load customer analytics."
            ),
        }));
      }

      /* REVENUE */

      if (
        results[1].status ===
        "fulfilled"
      ) {
        console.log(
          "REVENUE ANALYTICS RESPONSE:",
          results[1].value
        );

        setRevenueResponse(
          results[1].value
        );
      } else {
        console.error(
          "REVENUE ANALYTICS ERROR:",
          results[1].reason
        );

        setErrors((prev) => ({
          ...prev,
          revenue:
            getErrorMessage(
              results[1].reason,
              "Unable to load revenue analytics."
            ),
        }));
      }

      /* INVENTORY */

      if (
        results[2].status ===
        "fulfilled"
      ) {
        console.log(
          "INVENTORY ANALYTICS RESPONSE:",
          results[2].value
        );

        setInventoryResponse(
          results[2].value
        );
      } else {
        console.error(
          "INVENTORY ANALYTICS ERROR:",
          results[2].reason
        );

        setErrors((prev) => ({
          ...prev,
          inventory:
            getErrorMessage(
              results[2].reason,
              "Unable to load inventory analytics."
            ),
        }));
      }

      /* PRODUCT */

      if (
        results[3].status ===
        "fulfilled"
      ) {
        console.log(
          "PRODUCT ANALYTICS RESPONSE:",
          results[3].value
        );

        setProductResponse(
          results[3].value
        );
      } else {
        console.error(
          "PRODUCT ANALYTICS ERROR:",
          results[3].reason
        );

        setErrors((prev) => ({
          ...prev,
          product:
            getErrorMessage(
              results[3].reason,
              "Unable to load product analytics."
            ),
        }));
      }

      setLoading(false);
    }, [
      buildParams,
      startDate,
      endDate,
    ]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadAnalytics();
  }, []);

  /* =======================================================
     NORMALIZE
  ======================================================= */

  const customerData =
    useMemo(
      () =>
        normalizeCustomer(
          customerResponse
        ),
      [customerResponse]
    );

  const revenueData =
    useMemo(
      () =>
        normalizeRevenue(
          revenueResponse
        ),
      [revenueResponse]
    );

  const inventoryData =
    useMemo(
      () =>
        normalizeInventory(
          inventoryResponse
        ),
      [inventoryResponse]
    );

  const productData =
    useMemo(
      () =>
        normalizeProduct(
          productResponse
        ),
      [productResponse]
    );

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleApply = () => {
    loadAnalytics();
  };

  const handleRefresh = () => {
    toast.loading(
      "Refreshing analytics...",
      {
        id: "analytics-refresh",
      }
    );

    loadAnalytics().finally(() => {
      toast.success(
        "Analytics refreshed.",
        {
          id: "analytics-refresh",
        }
      );
    });
  };

  const handleStartDate = (
    event
  ) => {
    const value =
      event.target.value;

    setStartDate(value);

    /*
     * If selected start date becomes
     * greater than end date,
     * clear end date.
     */

    if (
      endDate &&
      value > endDate
    ) {
      setEndDate("");
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="analytics-page">
      <Toaster
        position="top-right"
      />

      {/* HEADER */}

      <div className="analytics-header">
        <div>
          <span className="analytics-eyebrow">
            ADMIN ANALYTICS
          </span>

          <h1>Analytics</h1>

          <p>
            Monitor your customers,
            revenue, inventory and
            products.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner" />
              Refreshing...
            </>
          ) : (
            <>↻ Refresh</>
          )}
        </button>
      </div>

      {/* FILTERS */}

      <section className="filter-card">
        <div className="filter-item">
          <label>
            Period
          </label>

          <select
            value={period}
            onChange={(e) =>
              setPeriod(
                e.target.value
              )
            }
          >
            {PERIOD_OPTIONS.map(
              (item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              )
            )}
          </select>
        </div>

        <div className="filter-item">
          <label>
            Start Date
          </label>

          <input
            type="date"
            value={startDate}
            max={endDate || today}
            onChange={
              handleStartDate
            }
          />
        </div>

        <div className="filter-item">
          <label>
            End Date
          </label>

          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            max={today}
            onChange={(e) =>
              setEndDate(
                e.target.value
              )
            }
          />
        </div>

        <div className="filter-item">
          <label>
            Group By
          </label>

          <select
            value={groupBy}
            onChange={(e) =>
              setGroupBy(
                e.target.value
              )
            }
          >
            {GROUP_OPTIONS.map(
              (item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              )
            )}
          </select>
        </div>

        <button
          type="button"
          className="apply-button"
          onClick={handleApply}
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : "Apply Filters"}
        </button>
      </section>

      {/* SUMMARY CARDS */}

      <section className="summary-grid">
        <SummaryCard
          title="Total Customers"
          value={formatNumber(
            customerData.summary
              .totalCustomers
          )}
          icon="👥"
        />

        <SummaryCard
          title="Paid Revenue"
          value={formatCurrency(
            revenueData.summary
              .paidRevenue
          )}
          icon="₹"
        />

        <SummaryCard
          title="Total Products"
          value={formatNumber(
            productData.summary
              .totalProducts
          )}
          icon="📦"
        />

        <SummaryCard
          title="Stock On Hand"
          value={formatNumber(
            inventoryData.summary
              .stockOnHand
          )}
          icon="📊"
        />
      </section>

      {/* CUSTOMER */}

      <AnalyticsCard
        title="Customer Analytics"
        description="Customer performance over the selected period."
      >
        <div className="mini-stats">
          <Stat
            label="New Customers"
            value={formatNumber(
              customerData.summary
                .newCustomers
            )}
          />

          <Stat
            label="Previous Period"
            value={formatNumber(
              customerData.summary
                .previousPeriodCustomers
            )}
          />

          <Stat
            label="Total Customers"
            value={formatNumber(
              customerData.summary
                .totalCustomers
            )}
          />
        </div>

        {errors.customer ? (
          <ErrorState
            message={errors.customer}
            retry={loadAnalytics}
          />
        ) : (
          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={
                  customerData.chart
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="customers"
                  name="Customers"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </AnalyticsCard>

      {/* REVENUE */}

      <AnalyticsCard
        title="Revenue Analytics"
        description="Revenue performance over the selected period."
      >
        <div className="mini-stats">
          <Stat
            label="Gross Sales"
            value={formatCurrency(
              revenueData.summary
                .grossSales
            )}
          />

          <Stat
            label="Paid Revenue"
            value={formatCurrency(
              revenueData.summary
                .paidRevenue
            )}
          />

          <Stat
            label="Refunded Amount"
            value={formatCurrency(
              revenueData.summary
                .refundedAmount
            )}
          />
        </div>

        {errors.revenue ? (
          <ErrorState
            message={errors.revenue}
            retry={loadAnalytics}
          />
        ) : (
          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  revenueData.chart
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#7c3aed"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </AnalyticsCard>

      {/* INVENTORY */}

      <AnalyticsCard
        title="Inventory Analytics"
        description="Current inventory statistics."
      >
        {errors.inventory ? (
          <ErrorState
            message={errors.inventory}
            retry={loadAnalytics}
          />
        ) : inventoryData.chart
            .length === 0 ? (
          <EmptyState
            text="No inventory analytics data found."
          />
        ) : (
          <div className="pie-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    inventoryData.chart
                  }
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius="65%"
                  innerRadius="28%"
                  paddingAngle={3}
                >
                  {inventoryData.chart.map(
                    (_, index) => (
                      <Cell
                        key={index}
                        fill={
                          PIE_COLORS[
                            index %
                              PIE_COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </AnalyticsCard>

      {/* PRODUCT */}

      <AnalyticsCard
        title="Product Analytics"
        description="Product performance statistics."
      >
        <div className="mini-stats">
          <Stat
            label="Total Products"
            value={formatNumber(
              productData.summary
                .totalProducts
            )}
          />

          <Stat
            label="Published Products"
            value={formatNumber(
              productData.summary
                .publishedProducts
            )}
          />

          <Stat
            label="Featured Products"
            value={formatNumber(
              productData.summary
                .featuredProducts
            )}
          />
        </div>

        {errors.product ? (
          <ErrorState
            message={errors.product}
            retry={loadAnalytics}
          />
        ) : (
          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  productData.chart
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="value"
                  name="Products"
                  fill="#059669"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </AnalyticsCard>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="summary-card">
      <div className="summary-card-content">
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      <div className="summary-icon">
        {icon}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AnalyticsCard({
  title,
  description,
  children,
}) {
  return (
    <section className="analytics-card">
      <div className="analytics-card-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {children}
    </section>
  );
}

function ErrorState({
  message,
  retry,
}) {
  return (
    <div className="error-state">
      <div className="error-symbol">
        !
      </div>

      <div className="error-details">
        <h3>
          Unable to load analytics
        </h3>

        <p>{message}</p>
      </div>

      <button
        type="button"
        onClick={retry}
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState({
  text,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        📊
      </div>

      <h3>{text}</h3>

      <p>
        No records were returned by
        the API.
      </p>
    </div>
  );
}