import api from "./api";

/* =========================
   LOGIN
========================= */

export const login = async (
  email,
  password
) => {
  const response = await api.post(
    "/auth/login",
    {
      email,
      password,
    }
  );

  return response;
};

/* =========================
   PROFILE
========================= */

export const getProfile = async () => {
  const response = await api.get(
    "/auth/profile"
  );

  return response;
};

/* =========================
   REFRESH TOKEN
========================= */

export const refreshToken = async (
  refreshToken
) => {
  const response = await api.post(
    "/auth/refresh",
    {
      refreshToken,
    }
  );

  return response;
};

/* =========================
   LOGOUT
========================= */

export const logout = async () => {
  const response = await api.post(
    "/auth/logout"
  );

  return response;
};

/* =========================
   LOGOUT ALL
========================= */

export const logoutAll = async () => {
  const response = await api.post(
    "/auth/logout-all"
  );

  return response;
};

/* =========================
   FORGOT PASSWORD
========================= */

export const forgotPassword = async (
  email
) => {
  const response = await api.post(
    "/auth/forgot-password",
    {
      email,
    }
  );

  return response;
};

/* =========================
   RESET PASSWORD
========================= */

export const resetPassword = async ({
  token,
  otp,
  password,
  confirmPassword,
}) => {
  const response = await api.post(
    "/auth/reset-password",
    {
      token,
      otp,
      password,
      confirmPassword,
    }
  );

  return response;
};

/* =========================
   SET PASSWORD
========================= */

export const setPassword = async (
  password,
  confirmPassword
) => {
  const response = await api.post(
    "/auth/set-password",
    {
      password,
      confirmPassword,
    }
  );

  return response;
};