import api from "./api";

/* ROLES */

export const getRoles = () =>
  api.get("/roles");

export const getRole = (id) =>
  api.get(`/roles/${id}`);

export const createRole = (payload) =>
  api.post("/roles", payload);

export const updateRole = (
  id,
  payload
) =>
  api.patch(
    `/roles/${id}`,
    payload
  );

export const deleteRole = (id) =>
  api.delete(`/roles/${id}`);


/* PERMISSIONS */

export const getPermissions = () =>
  api.get("/permissions");

export const getPermission = (id) =>
  api.get(`/permissions/${id}`);

export const createPermission = (
  payload
) =>
  api.post(
    "/permissions",
    payload
  );

export const updatePermission = (
  id,
  payload
) =>
  api.patch(
    `/permissions/${id}`,
    payload
  );

export const deletePermission = (
  id
) =>
  api.delete(
    `/permissions/${id}`
  );

export const getPermissionModules =
  () =>
    api.get(
      "/permissions/modules"
    );


/* ROLE → PERMISSIONS */

export const getRolePermissions = (
  roleId
) =>
  api.get(
    `/roles/${roleId}/permissions`
  );

export const assignRolePermissions = (
  roleId,
  payload
) =>
  api.post(
    `/roles/${roleId}/permissions`,
    payload
  );


/* USERS */

export const getUsers = (
  status = ""
) => {
  const params = {};

  if (status) {
    params.status = status;
  }

  return api.get("/users", {
    params,
  });
};

export const getUser = (id) =>
  api.get(`/users/${id}`);

export const createUser = (
  payload
) =>
  api.post(
    "/users",
    payload
  );

export const updateUser = (
  id,
  payload
) =>
  api.patch(
    `/users/${id}`,
    payload
  );

export const deleteUser = (
  id
) =>
  api.delete(
    `/users/${id}`
  );


/* USER → ROLES */

export const getUserRoles = (
  userId
) =>
  api.get(
    `/users/${userId}/roles`
  );

export const assignUserRoles = (
  userId,
  payload
) =>
  api.post(
    `/users/${userId}/roles`,
    payload
  );