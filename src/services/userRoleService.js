// import api from "./api";

// /**
//  * Get roles assigned to a user
//  *
//  * GET /api/v1/users/{userId}/roles
//  */
// export const getUserRoles = async (userId) => {
//   if (!userId) {
//     throw new Error("User ID is required");
//   }

//   return api.get(`/users/${userId}/roles`);
// };

// /**
//  * Assign role to user
//  *
//  * POST /api/v1/users/{userId}/roles
//  */
// export const assignUserRole = async (userId, roleId) => {
//   if (!userId) {
//     throw new Error("User ID is required");
//   }

//   if (!roleId) {
//     throw new Error("Role ID is required");
//   }

//   return api.post(`/users/${userId}/roles`, {
//     roleId,
//   });
// };

import api from "./api";

// Get roles assigned to user
export const getUserRoles = (userId) => {
  return api.get(`/users/${userId}/roles`);
};

// Assign roles to user
export const assignUserRoles = (userId, roleIds) => {
  return api.post(`/users/${userId}/roles`, {
    roleIds,
  });
};