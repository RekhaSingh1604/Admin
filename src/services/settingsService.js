import api from "./api";

export const getSettingsSidebar =
  () =>
    api.get(
      "/admin/settings/sidebar"
    );

export const getSettingsGroup = (
  slug
) =>
  api.get(
    `/admin/settings/group/${slug}`
  );

export const updateSettingsGroup = (
  slug,
  payload
) =>
  api.put(
    `/admin/settings/group/${slug}`,
    payload
  );

export const getSettings = () =>
  api.get("/admin/settings");

export const createSetting = (
  payload
) =>
  api.post(
    "/admin/settings",
    payload
  );

export const updateSetting = (
  id,
  payload
) =>
  api.put(
    `/admin/settings/${id}`,
    payload
  );

export const deleteSetting = (
  id
) =>
  api.delete(
    `/admin/settings/${id}`
  );

export const getSettingCategories =
  () =>
    api.get(
      "/admin/settings/categories"
    );

export const createSettingCategory =
  (payload) =>
    api.post(
      "/admin/settings/categories",
      payload
    );

export const updateSettingCategory =
  (id, payload) =>
    api.put(
      `/admin/settings/categories/${id}`,
      payload
    );

export const deleteSettingCategory =
  (id) =>
    api.delete(
      `/admin/settings/categories/${id}`
    );