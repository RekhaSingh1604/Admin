import api from "./api";

/* =====================================================
   ROLES
===================================================== */

/**
 * Get all roles
 */
export const getRoles = () => {
  return api.get("/roles");
};

/**
 * Create role
 */
export const createRole = (payload) => {
  return api.post("/roles", payload);
};

/**
 * Update role
 */
export const updateRole = (roleId, payload) => {
  if (
    roleId === undefined ||
    roleId === null ||
    roleId === ""
  ) {
    throw new Error("Role ID is required");
  }

  return api.patch(
    `/roles/${encodeURIComponent(String(roleId))}`,
    payload
  );
};

/**
 * Delete role
 *
 * Backend endpoint:
 * DELETE /api/v1/roles/{roleId}
 */
export const deleteRole = async (roleId) => {
  if (
    roleId === undefined ||
    roleId === null ||
    roleId === ""
  ) {
    throw new Error("Role ID is required");
  }

  const id = String(roleId).trim();

  if (!id) {
    throw new Error("Role ID is required");
  }

  const url = `/roles/${encodeURIComponent(id)}`;

  console.log("========== DELETE ROLE API ==========");
  console.log("ROLE ID:", id);
  console.log("DELETE URL:", url);

  try {
    const response = await api.delete(url);

    console.log(
      "DELETE ROLE RESPONSE:",
      response
    );

    return response;
  } catch (error) {
    console.error(
      "DELETE ROLE SERVICE ERROR:",
      error
    );

    console.error(
      "DELETE STATUS:",
      error?.response?.status
    );

    console.error(
      "DELETE RESPONSE:",
      error?.response?.data
    );

    throw error;
  }
};

/* =====================================================
   PERMISSIONS
===================================================== */

/**
 * Get all permissions
 */
export const getPermissions = () => {
  return api.get("/permissions");
};

/**
 * Get permissions assigned to a role
 */
export const getRolePermissions = (roleId) => {
  if (
    roleId === undefined ||
    roleId === null ||
    roleId === ""
  ) {
    throw new Error("Role ID is required");
  }

  return api.get(
    `/roles/${encodeURIComponent(String(roleId))}/permissions`
  );
};

/**
 * Assign permissions to role
 *
 * Backend payload:
 *
 * {
 *   permissionIds: [1, 2, 3]
 * }
 */
export const assignRolePermissions = (
  roleId,
  permissionIds
) => {
  if (
    roleId === undefined ||
    roleId === null ||
    roleId === ""
  ) {
    throw new Error("Role ID is required");
  }

  const ids = Array.from(
    new Set(
      (
        Array.isArray(permissionIds)
          ? permissionIds
          : []
      )
        .map((id) => Number(id))
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        )
    )
  );

  const payload = {
    permissionIds: ids,
  };

  console.log(
    "ASSIGN ROLE PERMISSIONS PAYLOAD:",
    payload
  );

  return api.post(
    `/roles/${encodeURIComponent(String(roleId))}/permissions`,
    payload
  );
};