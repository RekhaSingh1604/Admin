import { useEffect, useState } from "react";
import "../styles/settings.css";

import {
  getSettingsSidebar,
  getSettingsGroup,
  updateSettingsGroup,
  getSettings,
  createSetting,
  updateSetting,
  deleteSetting,
  getSettingCategories,
  createSettingCategory,
  updateSettingCategory,
  deleteSettingCategory,
} from "../services/settingsService";

export default function Settings() {
  // =========================
  // SIDEBAR / GROUP
  // =========================

  const [categories, setCategories] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");

  const [settings, setSettings] = useState({});
  const [categoryInfo, setCategoryInfo] = useState(null);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  // =========================
  // CRUD DATA
  // =========================

  const [allSettings, setAllSettings] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const [loadingCrud, setLoadingCrud] = useState(false);

  // =========================
  // UI
  // =========================

  const [activePanel, setActivePanel] = useState("settings");

  const [showSettingModal, setShowSettingModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [editingSetting, setEditingSetting] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // SETTING FORM
  // =========================

  const [settingForm, setSettingForm] = useState({
    key: "",
    value: "",
    category: "",
  });

  // =========================
  // CATEGORY FORM
  // =========================

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    icon: "",
    sortOrder: 1,
  });

  // =========================
  // HELPERS
  // =========================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const getErrorMessage = (err, fallback) => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      fallback
    );
  };

  const extractData = (response) => {
    return (
      response?.data?.data?.data ||
      response?.data?.data ||
      response?.data ||
      []
    );
  };

  // =========================
  // LOAD SIDEBAR
  // =========================

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      clearMessages();

      const response = await getSettingsSidebar();

      console.log(
        "SETTINGS SIDEBAR:",
        response.data
      );

      const data = extractData(response);

      const list = Array.isArray(data)
        ? data
        : data?.categories || [];

      setCategories(list);

      if (list.length > 0 && !selectedSlug) {
        setSelectedSlug(list[0].slug);
      }
    } catch (err) {
      console.error(
        "SETTINGS SIDEBAR ERROR:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load settings categories."
        )
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  // =========================
  // LOAD GROUP
  // =========================

  const loadGroup = async (slug) => {
    if (!slug) return;

    try {
      setLoadingSettings(true);
      clearMessages();

      const response =
        await getSettingsGroup(slug);

      console.log(
        "SETTINGS GROUP:",
        response.data
      );

      const data = extractData(response);

      setCategoryInfo(
        data?.category || null
      );

      setSettings(
        data?.values || {}
      );
    } catch (err) {
      console.error(
        "SETTINGS GROUP ERROR:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load settings group."
        )
      );

      setSettings({});
    } finally {
      setLoadingSettings(false);
    }
  };

  // =========================
  // LOAD CRUD SETTINGS
  // =========================

  const loadAllSettings = async () => {
    try {
      setLoadingCrud(true);

      const response =
        await getSettings();

      console.log(
        "ALL SETTINGS:",
        response.data
      );

      const data = extractData(response);

      const list = Array.isArray(data)
        ? data
        : data?.items ||
          data?.settings ||
          [];

      setAllSettings(list);
    } catch (err) {
      console.error(
        "ALL SETTINGS ERROR:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load settings."
        )
      );
    } finally {
      setLoadingCrud(false);
    }
  };

  // =========================
  // LOAD CRUD CATEGORIES
  // =========================

  const loadAllCategories = async () => {
    try {
      setLoadingCrud(true);

      const response =
        await getSettingCategories();

      console.log(
        "ALL SETTING CATEGORIES:",
        response.data
      );

      const data = extractData(response);

      const list = Array.isArray(data)
        ? data
        : data?.items ||
          data?.categories ||
          [];

      setAllCategories(list);
    } catch (err) {
      console.error(
        "ALL CATEGORIES ERROR:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load setting categories."
        )
      );
    } finally {
      setLoadingCrud(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      loadGroup(selectedSlug);
    }
  }, [selectedSlug]);

  // =========================
  // CRUD PANEL LOAD
  // =========================

  useEffect(() => {
    if (activePanel === "settings") {
      loadAllSettings();
    }

    if (activePanel === "categories") {
      loadAllCategories();
    }
  }, [activePanel]);

  // =========================
  // GROUP VALUE CHANGE
  // =========================

  const handleGroupChange = (
    key,
    value
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // =========================
  // SAVE GROUP
  // =========================

  const handleSaveGroup = async () => {
    if (!selectedSlug) return;

    try {
      setSaving(true);
      clearMessages();

      await updateSettingsGroup(
        selectedSlug,
        settings
      );

      setSuccess(
        "Settings updated successfully."
      );

      await loadGroup(selectedSlug);
    } catch (err) {
      console.error(
        "UPDATE GROUP ERROR:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to update settings."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // SETTING MODAL
  // =========================

  const openCreateSetting = () => {
    setEditingSetting(null);

    setSettingForm({
      key: "",
      value: "",
      category:
        selectedSlug || "",
    });

    setShowSettingModal(true);
    clearMessages();
  };

  const openEditSetting = (
    setting
  ) => {
    setEditingSetting(setting);

    setSettingForm({
      key:
        setting?.key ||
        setting?.name ||
        "",
      value:
        setting?.value ?? "",
      category:
        setting?.category ||
        setting?.categorySlug ||
        selectedSlug ||
        "",
    });

    setShowSettingModal(true);
    clearMessages();
  };

  const closeSettingModal = () => {
    setShowSettingModal(false);
    setEditingSetting(null);
  };

  const handleSettingSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!settingForm.key.trim()) {
      setError("Setting key is required.");
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      const payload = {
        key: settingForm.key.trim(),
        value: settingForm.value,
        category: settingForm.category,
      };

      if (editingSetting) {
        await updateSetting(
          editingSetting.id ||
            editingSetting.uuid,
          payload
        );

        setSuccess(
          "Setting updated successfully."
        );
      } else {
        await createSetting(payload);

        setSuccess(
          "Setting created successfully."
        );
      }

      closeSettingModal();

      await loadAllSettings();

      if (selectedSlug) {
        await loadGroup(selectedSlug);
      }
    } catch (err) {
      console.error(
        "SETTING SAVE ERROR:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to save setting."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE SETTING
  // =========================

  const handleDeleteSetting = async (
    setting
  ) => {
    const id =
      setting?.id ||
      setting?.uuid;

    if (!id) {
      setError(
        "Setting ID is missing."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Delete setting "${
          setting?.key ||
          setting?.name ||
          "this setting"
        }"?`
      );

    if (!confirmed) return;

    try {
      setLoadingCrud(true);
      clearMessages();

      await deleteSetting(id);

      setSuccess(
        "Setting deleted successfully."
      );

      await loadAllSettings();

      if (selectedSlug) {
        await loadGroup(selectedSlug);
      }
    } catch (err) {
      console.error(
        "DELETE SETTING ERROR:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to delete setting."
        )
      );
    } finally {
      setLoadingCrud(false);
    }
  };

  // =========================
  // CATEGORY MODAL
  // =========================

  const openCreateCategory = () => {
    setEditingCategory(null);

    setCategoryForm({
      name: "",
      slug: "",
      icon: "",
      sortOrder: 1,
    });

    setShowCategoryModal(true);
    clearMessages();
  };

  const openEditCategory = (
    category
  ) => {
    setEditingCategory(category);

    setCategoryForm({
      name:
        category?.name || "",
      slug:
        category?.slug || "",
      icon:
        category?.icon || "",
      sortOrder:
        category?.sortOrder || 1,
    });

    setShowCategoryModal(true);
    clearMessages();
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleCategorySubmit =
    async (event) => {
      event.preventDefault();

      if (!categoryForm.name.trim()) {
        setError(
          "Category name is required."
        );
        return;
      }

      if (!categoryForm.slug.trim()) {
        setError(
          "Category slug is required."
        );
        return;
      }

      try {
        setSaving(true);
        clearMessages();

        const payload = {
          name: categoryForm.name.trim(),
          slug: categoryForm.slug.trim(),
          icon: categoryForm.icon.trim(),
          sortOrder:
            Number(categoryForm.sortOrder) || 1,
        };

        if (editingCategory) {
          await updateSettingCategory(
            editingCategory.id ||
              editingCategory.uuid,
            payload
          );

          setSuccess(
            "Category updated successfully."
          );
        } else {
          await createSettingCategory(
            payload
          );

          setSuccess(
            "Category created successfully."
          );
        }

        closeCategoryModal();

        await loadAllCategories();
        await loadCategories();
      } catch (err) {
        console.error(
          "CATEGORY SAVE ERROR:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to save category."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  // =========================
  // DELETE CATEGORY
  // =========================

  const handleDeleteCategory =
    async (category) => {
      const id =
        category?.id ||
        category?.uuid;

      if (!id) {
        setError(
          "Category ID is missing."
        );
        return;
      }

      const confirmed =
        window.confirm(
          `Delete category "${
            category?.name ||
            category?.slug ||
            "this category"
          }"?`
        );

      if (!confirmed) return;

      try {
        setLoadingCrud(true);
        clearMessages();

        await deleteSettingCategory(id);

        setSuccess(
          "Category deleted successfully."
        );

        await loadAllCategories();
        await loadCategories();
      } catch (err) {
        console.error(
          "DELETE CATEGORY ERROR:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to delete category."
          )
        );
      } finally {
        setLoadingCrud(false);
      }
    };

  // =========================
  // LOADING
  // =========================

  if (loadingCategories) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <div>
            <span className="settings-eyebrow">
              ADMIN CONFIGURATION
            </span>

            <h1>Settings</h1>

            <p>
              Manage your marketplace
              application settings.
            </p>
          </div>
        </div>

        <div className="settings-loading-grid">
          <div className="settings-skeleton sidebar-skeleton" />

          <div className="settings-skeleton content-skeleton" />
        </div>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="settings-page">

      {/* HEADER */}

      <div className="settings-header">
        <div>
          <span className="settings-eyebrow">
            ADMIN CONFIGURATION
          </span>

          <h1>Settings</h1>

          <p>
            Manage your marketplace
            application settings.
          </p>
        </div>

        <div className="settings-header-actions">
          <button
            className={
              activePanel === "settings"
                ? "header-tab active"
                : "header-tab"
            }
            onClick={() =>
              setActivePanel("settings")
            }
          >
            Settings
          </button>

          <button
            className={
              activePanel === "categories"
                ? "header-tab active"
                : "header-tab"
            }
            onClick={() =>
              setActivePanel("categories")
            }
          >
            Categories
          </button>
        </div>
      </div>

      {/* ALERT */}

      {error && (
        <div className="settings-alert settings-error">
          <div>
            <strong>
              Something went wrong
            </strong>

            <p>{error}</p>
          </div>

          <button
            onClick={() => {
              setError("");
            }}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="settings-alert settings-success">
          <span>{success}</span>

          <button
            onClick={() =>
              setSuccess("")
            }
          >
            ×
          </button>
        </div>
      )}

      {/* =========================
          SETTINGS PANEL
      ========================= */}

      {activePanel === "settings" && (
        <div className="settings-layout">

          {/* SIDEBAR */}

          <aside className="settings-sidebar">

            <div className="settings-sidebar-top">
              <div>
                <span>
                  CONFIGURATION
                </span>

                <h3>
                  Settings Groups
                </h3>
              </div>

              <button
                className="icon-add-btn"
                onClick={openCreateSetting}
                title="Add setting"
              >
                +
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="settings-empty-small">
                <div>⚙</div>

                <p>
                  No categories
                  available.
                </p>
              </div>
            ) : (
              <div className="settings-category-list">
                {categories.map(
                  (category) => (
                    <button
                      key={
                        category.slug
                      }
                      className={
                        selectedSlug ===
                        category.slug
                          ? "settings-category active"
                          : "settings-category"
                      }
                      onClick={() =>
                        setSelectedSlug(
                          category.slug
                        )
                      }
                    >
                      <span className="category-icon">
                        {category.icon ||
                          "⚙"}
                      </span>

                      <span className="category-name">
                        {category.name ||
                          category.slug}
                      </span>

                      <span className="category-arrow">
                        →
                      </span>
                    </button>
                  )
                )}
              </div>
            )}

          </aside>

          {/* CONTENT */}

          <main className="settings-content">

            {loadingSettings ? (
              <div className="settings-form-card">
                <div className="form-skeleton large" />
                <div className="form-skeleton" />
                <div className="form-skeleton" />
                <div className="form-skeleton" />
              </div>
            ) : Object.keys(
                settings
              ).length === 0 ? (
              <div className="settings-empty">
                <div className="empty-icon">
                  ⚙
                </div>

                <h2>
                  No settings found
                </h2>

                <p>
                  There are no
                  configurable values
                  available for this
                  category.
                </p>

                <button
                  className="primary-settings-btn"
                  onClick={
                    openCreateSetting
                  }
                >
                  + Add Setting
                </button>
              </div>
            ) : (
              <div className="settings-form-card">

                <div className="settings-card-header">

                  <div>
                    <span className="settings-card-label">
                      SETTINGS GROUP
                    </span>

                    <h2>
                      {categoryInfo?.name ||
                        selectedSlug}
                    </h2>

                    <p>
                      Configure the
                      settings for this
                      category.
                    </p>
                  </div>

                  <span className="settings-badge">
                    {selectedSlug}
                  </span>
                </div>

                <div className="settings-form">

                  {Object.entries(
                    settings
                  ).map(
                    ([key, value]) => {

                      const isBoolean =
                        typeof value ===
                        "boolean";

                      const isMasked =
                        typeof value ===
                          "string" &&
                        value.includes("*");

                      return (
                        <div
                          className="setting-field"
                          key={key}
                        >
                          <label
                            htmlFor={key}
                          >
                            {formatLabel(
                              key
                            )}
                          </label>

                          {isBoolean ? (
                            <label className="switch-row">
                              <input
                                type="checkbox"
                                checked={
                                  value
                                }
                                onChange={(
                                  e
                                ) =>
                                  handleGroupChange(
                                    key,
                                    e.target
                                      .checked
                                  )
                                }
                              />

                              <span className="switch-ui" />

                              <span>
                                {value
                                  ? "Enabled"
                                  : "Disabled"}
                              </span>
                            </label>
                          ) : (
                            <input
                              id={key}
                              type={
                                isMasked
                                  ? "password"
                                  : "text"
                              }
                              value={
                                value ??
                                ""
                              }
                              onChange={(
                                e
                              ) =>
                                handleGroupChange(
                                  key,
                                  e.target
                                    .value
                                )
                              }
                              placeholder={`Enter ${formatLabel(
                                key
                              )}`}
                            />
                          )}
                        </div>
                      );
                    }
                  )}

                </div>

                <div className="settings-form-footer">

                  <button
                    className="secondary-settings-btn"
                    onClick={() =>
                      loadGroup(
                        selectedSlug
                      )
                    }
                    disabled={saving}
                  >
                    Reset
                  </button>

                  <button
                    className="save-settings-btn"
                    onClick={
                      handleSaveGroup
                    }
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </div>
            )}

          </main>
        </div>
      )}

      {/* =========================
          CATEGORIES MANAGEMENT
      ========================= */}

      {activePanel ===
        "categories" && (
        <div className="crud-card">

          <div className="crud-header">

            <div>
              <span className="settings-card-label">
                SETTINGS MANAGEMENT
              </span>

              <h2>
                Setting Categories
              </h2>

              <p>
                Create and manage
                configuration categories.
              </p>
            </div>

            <button
              className="primary-settings-btn"
              onClick={
                openCreateCategory
              }
            >
              + Add Category
            </button>

          </div>

          {loadingCrud ? (
            <div className="crud-loading">
              <div />
              <div />
              <div />
              <div />
            </div>
          ) : allCategories.length ===
            0 ? (
            <div className="crud-empty">
              <div>📁</div>

              <h3>
                No categories found
              </h3>

              <p>
                Create your first
                settings category.
              </p>
            </div>
          ) : (
            <div className="crud-table-wrapper">

              <table className="settings-table">

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Icon</th>
                    <th>Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {allCategories.map(
                    (category) => (
                      <tr
                        key={
                          category.id ||
                          category.uuid ||
                          category.slug
                        }
                      >
                        <td>
                          <strong>
                            {
                              category.name
                            }
                          </strong>
                        </td>

                        <td>
                          <span className="slug-badge">
                            {
                              category.slug
                            }
                          </span>
                        </td>

                        <td>
                          <span className="table-icon">
                            {category.icon ||
                              "⚙"}
                          </span>
                        </td>

                        <td>
                          {
                            category.sortOrder
                          }
                        </td>

                        <td>
                          <div className="table-actions">

                            <button
                              className="edit-btn"
                              onClick={() =>
                                openEditCategory(
                                  category
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteCategory(
                                  category
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>

            </div>
          )}

        </div>
      )}

      {/* =========================
          SETTINGS CRUD
      ========================= */}

      {activePanel === "settings" && (
        <div className="crud-card settings-crud-card">

          <div className="crud-header">

            <div>
              <span className="settings-card-label">
                SETTINGS CRUD
              </span>

              <h2>
                All Settings
              </h2>

              <p>
                Create, update and
                remove individual
                settings.
              </p>
            </div>

            <button
              className="primary-settings-btn"
              onClick={
                openCreateSetting
              }
            >
              + Add Setting
            </button>

          </div>

          {loadingCrud ? (
            <div className="crud-loading">
              <div />
              <div />
              <div />
            </div>
          ) : allSettings.length ===
            0 ? (
            <div className="crud-empty">
              <div>⚙</div>

              <h3>
                No settings found
              </h3>

              <p>
                No individual
                settings are available.
              </p>
            </div>
          ) : (
            <div className="crud-table-wrapper">

              <table className="settings-table">

                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {allSettings.map(
                    (setting) => (
                      <tr
                        key={
                          setting.id ||
                          setting.uuid ||
                          setting.key
                        }
                      >
                        <td>
                          <strong>
                            {setting.key ||
                              setting.name}
                          </strong>
                        </td>

                        <td>
                          <span className="value-preview">
                            {String(
                              setting.value ??
                                ""
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="slug-badge">
                            {setting.category ||
                              setting.categorySlug ||
                              "-"}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">

                            <button
                              className="edit-btn"
                              onClick={() =>
                                openEditSetting(
                                  setting
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteSetting(
                                  setting
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>

            </div>
          )}

        </div>
      )}

      {/* =========================
          SETTING MODAL
      ========================= */}

      {showSettingModal && (
        <div
          className="settings-modal-overlay"
          onMouseDown={
            closeSettingModal
          }
        >

          <div
            className="settings-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <span>
                  SETTING
                </span>

                <h2>
                  {editingSetting
                    ? "Edit Setting"
                    : "Create Setting"}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={
                  closeSettingModal
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleSettingSubmit
              }
            >

              <div className="modal-field">

                <label>
                  Setting Key
                </label>

                <input
                  value={
                    settingForm.key
                  }
                  onChange={(e) =>
                    setSettingForm(
                      (prev) => ({
                        ...prev,
                        key:
                          e.target
                            .value,
                      })
                    )
                  }
                  placeholder="e.g. company_name"
                />

              </div>

              <div className="modal-field">

                <label>
                  Value
                </label>

                <textarea
                  value={
                    settingForm.value
                  }
                  onChange={(e) =>
                    setSettingForm(
                      (prev) => ({
                        ...prev,
                        value:
                          e.target
                            .value,
                      })
                    )
                  }
                  placeholder="Enter setting value"
                  rows="4"
                />

              </div>

              <div className="modal-field">

                <label>
                  Category
                </label>

                <select
                  value={
                    settingForm.category
                  }
                  onChange={(e) =>
                    setSettingForm(
                      (prev) => ({
                        ...prev,
                        category:
                          e.target
                            .value,
                      })
                    )
                  }
                >

                  <option value="">
                    Select category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.slug
                        }
                        value={
                          category.slug
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-settings-btn"
                  onClick={
                    closeSettingModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-settings-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingSetting
                    ? "Update Setting"
                    : "Create Setting"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================
          CATEGORY MODAL
      ========================= */}

      {showCategoryModal && (
        <div
          className="settings-modal-overlay"
          onMouseDown={
            closeCategoryModal
          }
        >

          <div
            className="settings-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <span>
                  CATEGORY
                </span>

                <h2>
                  {editingCategory
                    ? "Edit Category"
                    : "Create Category"}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={
                  closeCategoryModal
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleCategorySubmit
              }
            >

              <div className="modal-field">

                <label>
                  Category Name
                </label>

                <input
                  value={
                    categoryForm.name
                  }
                  onChange={(e) =>
                    setCategoryForm(
                      (prev) => ({
                        ...prev,
                        name:
                          e.target
                            .value,
                      })
                    )
                  }
                  placeholder="Company"
                />

              </div>

              <div className="modal-field">

                <label>
                  Slug
                </label>

                <input
                  value={
                    categoryForm.slug
                  }
                  onChange={(e) =>
                    setCategoryForm(
                      (prev) => ({
                        ...prev,
                        slug:
                          e.target
                            .value
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            ),
                      })
                    )
                  }
                  placeholder="company"
                />

              </div>

              <div className="modal-grid">

                <div className="modal-field">

                  <label>
                    Icon
                  </label>

                  <input
                    value={
                      categoryForm.icon
                    }
                    onChange={(e) =>
                      setCategoryForm(
                        (prev) => ({
                          ...prev,
                          icon:
                            e.target
                              .value,
                        })
                      )
                    }
                    placeholder="building"
                  />

                </div>

                <div className="modal-field">

                  <label>
                    Sort Order
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      categoryForm.sortOrder
                    }
                    onChange={(e) =>
                      setCategoryForm(
                        (prev) => ({
                          ...prev,
                          sortOrder:
                            e.target
                              .value,
                        })
                      )
                    }
                  />

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-settings-btn"
                  onClick={
                    closeCategoryModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-settings-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// =========================
// FORMAT LABEL
// =========================

function formatLabel(value) {
  return String(value)
    .replace(/_/g, " ")
    .replace(
      /([A-Z])/g,
      " $1"
    )
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}