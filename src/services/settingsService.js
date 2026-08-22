import api from "./api";

// ===============================
// SETTINGS SIDEBAR
// ===============================
export const getSettingsSidebar = () => {
  return api.get("/admin/settings/sidebar");
};

// ===============================
// GET SETTINGS GROUP
// ===============================
export const getSettingsGroup = (slug) => {
  return api.get(`/admin/settings/group/${slug}`);
};

// ===============================
// UPDATE SETTINGS GROUP
// Swagger: PUT /admin/settings/group/{slug}
// ===============================
export const updateSettingsGroup = (slug, payload) => {
  return api.put(
    `/admin/settings/group/${slug}`,
    payload
  );
};

// ===============================
// GET ALL SETTINGS
// ===============================
export const getSettings = () => {
  return api.get("/admin/settings");
};

// ===============================
// CREATE SETTING
// Swagger: POST /admin/settings
// ===============================
export const createSetting = (payload) => {
  return api.post(
    "/admin/settings",
    payload
  );
};

// ===============================
// UPDATE SETTING
// IMPORTANT:
// Swagger says PATCH + UUID
// NOT PUT + numeric ID
// ===============================
export const updateSetting = (uuid, payload) => {
  return api.patch(
    `/admin/settings/${uuid}`,
    payload
  );
};

// ===============================
// DELETE SETTING
// Swagger uses UUID
// ===============================
export const deleteSetting = (uuid) => {
  return api.delete(
    `/admin/settings/${uuid}`
  );
};