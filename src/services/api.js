import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://13.159.7.199:5001/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ================================
// REQUEST INTERCEPTOR
// ================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================================
// TOKEN REFRESH
// ================================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// ================================
// RESPONSE INTERCEPTOR
// ================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only refresh on 401
    if (
      error?.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    // Never refresh login/refresh requests
    if (
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    const refreshToken =
      localStorage.getItem("refreshToken");

    if (!refreshToken) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      window.location.href = "/login";

      return Promise.reject(error);
    }

    // ================================
    // Another refresh already running
    // ================================

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        });
      }).then((token) => {
        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${token}`;

        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // IMPORTANT:
      // Use axios directly so refresh request
      // doesn't trigger this interceptor again.

      const response = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {
          refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = response?.data;

      // Support backend response structures
      const outerData =
        responseData?.data || {};

      const innerData =
        outerData?.data ||
        outerData;

      const tokens =
        innerData?.tokens ||
        outerData?.tokens ||
        responseData?.tokens ||
        {};

      const newAccessToken =
        tokens?.accessToken ||
        tokens?.access_token ||
        innerData?.accessToken ||
        innerData?.access_token ||
        outerData?.accessToken ||
        outerData?.access_token ||
        responseData?.accessToken ||
        responseData?.access_token;

      const newRefreshToken =
        tokens?.refreshToken ||
        tokens?.refresh_token ||
        innerData?.refreshToken ||
        innerData?.refresh_token ||
        outerData?.refreshToken ||
        outerData?.refresh_token ||
        responseData?.refreshToken ||
        responseData?.refresh_token;

      if (!newAccessToken) {
        throw new Error(
          "Refresh response did not contain access token."
        );
      }

      // Save new access token
      localStorage.setItem(
        "accessToken",
        newAccessToken
      );

      // Save rotated refresh token if backend sends one
      if (newRefreshToken) {
        localStorage.setItem(
          "refreshToken",
          newRefreshToken
        );
      }

      // Resolve queued requests
      processQueue(
        null,
        newAccessToken
      );

      // Retry original request
      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);

    } catch (refreshError) {
      processQueue(refreshError);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      window.location.href = "/login";

      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;