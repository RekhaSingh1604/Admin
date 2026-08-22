import api from "./api";

/**
 * Get all permissions assigned to a role
 *
 * GET /api/v1/roles/{roleId}/permissions
 */
export const getRolePermissions = async (roleId) => {
  if (!roleId) {
    throw new Error("Role ID is required");
  }

  return api.get(`/roles/${roleId}/permissions`);
};

/**
 * Assign permissions to a role
 *
 * POST /api/v1/roles/{roleId}/permissions
 *
 * Payload:
 * {
 *   permissionIds: ["37", "38", "39"]
 * }
 */
export const assignRolePermissions = async (
  roleId,
  permissionIds = []
) => {
  if (!roleId) {
    throw new Error("Role ID is required");
  }

  if (!Array.isArray(permissionIds)) {
    throw new Error("permissionIds must be an array");
  }

  return api.post(`/roles/${roleId}/permissions`, {
    permissionIds,
  });
};