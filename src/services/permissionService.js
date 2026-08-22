import api from "./api";

/* =========================
   GET ALL PERMISSIONS
========================= */

export const getPermissions = async () => {
  return api.get("/permissions");
};

/* =========================
   GET PERMISSION
========================= */

export const getPermissionById = async (id) => {
  return api.get(`/permissions/${id}`);
};

/* =========================
   CREATE
========================= */

export const createPermission = async (payload) => {
  return api.post("/permissions", payload);
};

/* =========================
   UPDATE
========================= */

export const updatePermission = async (
  id,
  payload
) => {
  return api.patch(`/permissions/${id}`, payload);
};

/* =========================
   DELETE
========================= */

// export const deletePermission = async (id) => {
//   return api.delete(`/permissions/${id}`);
// };
export const deletePermission = async (
  id
) => {
  return api.delete(
    `/permissions/${id}`
  );
};