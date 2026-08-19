import api from "./api";

export const getDashboard = async () => {
  const response = await api.get(
    "/admin/dashboard"
  );

  console.log(
    "DASHBOARD RESPONSE:",
    response.data
  );

  return response.data;
};