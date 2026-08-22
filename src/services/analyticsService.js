import api from "./api";

const buildParams = (params = {}) => {
  const query = {
    groupBy: params.groupBy || "day",
  };

  // If user selected dates, use date range.
  if (params.startDate) {
    query.startDate = params.startDate;
  }

  if (params.endDate) {
    query.endDate = params.endDate;
  }

  // Only send period when no custom dates are selected.
  if (
    params.period &&
    !params.startDate &&
    !params.endDate
  ) {
    query.period = params.period;
  }

  return query;
};

/*
|--------------------------------------------------------------------------
| Customer Analytics
|--------------------------------------------------------------------------
*/
export const getCustomerAnalytics = (params = {}) => {
  return api.get("/admin/analytics/customers", {
    params: buildParams(params),
  });
};

/*
|--------------------------------------------------------------------------
| Revenue Analytics
|--------------------------------------------------------------------------
*/
export const getRevenueAnalytics = (params = {}) => {
  return api.get("/admin/analytics/revenue", {
    params: buildParams(params),
  });
};

/*
|--------------------------------------------------------------------------
| Inventory Analytics
|--------------------------------------------------------------------------
*/
export const getInventoryAnalytics = () => {
  return api.get("/admin/analytics/inventory");
};

/*
|--------------------------------------------------------------------------
| Product Analytics
|--------------------------------------------------------------------------
*/
export const getProductAnalytics = () => {
  return api.get("/admin/analytics/products");
};