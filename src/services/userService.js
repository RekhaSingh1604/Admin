import api from "./api";

/* =========================
   GET USERS
========================= */

export const getUsers = async (params = {}) => {
  const response = await api.get("/users", {
    params,
  });

  return response;
};

/* =========================
   GET SINGLE USER
========================= */

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);

  return response;
};

/* =========================
   CREATE USER
========================= */

export const createUser = async (userData) => {
  const response = await api.post(
    "/users",
    userData
  );

  return response;
};

/* =========================
   UPDATE USER
========================= */

export const updateUser = async (
  id,
  userData
) => {
  const response = await api.patch(
    `/users/${id}`,
    userData
  );

  return response;
};

/* =========================
   DELETE USER
========================= */

export const deleteUser = async (id) => {
  const response = await api.delete(
    `/users/${id}`
  );

  return response;
};

/* =========================
   GET ROLES
========================= */

export const getRoles = async () => {
  const response = await api.get(
    "/roles"
  );

  return response;
};

/* =========================
   ASSIGN USER ROLES
========================= */

export const assignUserRoles = async (
  userId,
  roleIds
) => {
  const response = await api.post(
    `/users/${userId}/roles`,
    {
      roleIds,
    }
  );

  return response;
};