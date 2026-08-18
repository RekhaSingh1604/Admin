// import api from "./api";

// export const getAnalytics = (
//   params = {}
// ) =>
//   api.get(
//     "/admin/analytics",
//     { params }
//   );

// export const getAnalyticsOrders = (
//   params = {}
// ) =>
//   api.get(
//     "/admin/analytics/orders",
//     { params }
//   );

// export const getAnalyticsRevenue = (
//   params = {}
// ) =>
//   api.get(
//     "/admin/analytics/revenue",
//     { params }
//   );

// export const getAnalyticsInventory =
//   (params = {}) =>
//     api.get(
//       "/admin/analytics/inventory",
//       { params }
//     );

// export const getAnalyticsProducts =
//   (params = {}) =>
//     api.get(
//       "/admin/analytics/products",
//       { params }
//     );

// export const getAnalyticsCustomers =
//   (params = {}) =>
//     api.get(
//       "/admin/analytics/customers",
//       { params }
//     );

// export const getAnalyticsTimeseries =
//   (params = {}) =>
//     api.get(
//       "/admin/analytics/timeseries",
//       { params }
//     );

import api from "./api";

export const getAnalytics = (params = {}) => {
  return api.get("/admin/analytics", {
    params: {
      period: params.period || "30d",
      groupBy: params.groupBy || "day",
    },
  });
};