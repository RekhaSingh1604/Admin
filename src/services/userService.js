import api from "./api";

export const getUsers = async (status = "") => {
  const params = {};

  if (status) {
    params.status = status;
  }

  const response = await api.get("/users", {
    params,
  });

  return response.data;
};