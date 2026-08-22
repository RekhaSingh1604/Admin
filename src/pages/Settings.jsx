import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getSettingsSidebar,
  getSettingsGroup,
  getSettings,
  createSetting,
  updateSetting,
  deleteSetting,
} from "../services/settingsService";

import '../styles/settings.css'


// ======================================================
// TOAST COMPONENT
// ======================================================

function Toast({
  toast,
  onClose,
}) {
  if (!toast) return null;

  return (
    <div
      className={`settings-toast ${toast.type}`}
    >
      <div className="toast-icon">
        {toast.type === "success"
          ? "✓"
          : toast.type === "error"
          ? "!"
          : "i"}
      </div>

      <div className="toast-content">
        <strong>
          {toast.type === "success"
            ? "Success"
            : toast.type === "error"
            ? "Error"
            : "Info"}
        </strong>

        <span>
          {toast.message}
        </span>
      </div>

      <button
        onClick={onClose}
        className="toast-close"
      >
        ×
      </button>
    </div>
  );
}


// ======================================================
// INITIAL FORM
// ======================================================

const initialForm = {
  categoryUuid: "",
  key: "",
  label: "",
  group: "",
  description: "",
  value: "",
  defaultValue: "",
  type: "STRING",

  validation: {
    required: false,
    min: "",
    max: "",
    minLength: "",
    maxLength: "",
  },

  options: {
    values: [],
  },

  isEncrypted: false,
  isPublic: false,
  isEditable: true,
  sortOrder: 0,
};


// ======================================================
// MAIN COMPONENT
// ======================================================

export default function Settings() {

  // ====================================================
  // STATES
  // ====================================================

  const [categories, setCategories] =
    useState([]);

  const [settings, setSettings] =
    useState([]);

  const [selectedSlug, setSelectedSlug] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingSetting, setEditingSetting] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [toast, setToast] =
    useState(null);


  // ====================================================
  // TOAST HELPER
  // ====================================================

  const showToast = (
    type,
    message
  ) => {

    setToast({
      type,
      message,
    });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };


  // ====================================================
  // ERROR MESSAGE HELPER
  // ====================================================

  const getErrorMessage = (
    error
  ) => {

    const data =
      error?.response?.data;

    if (
      Array.isArray(data?.message)
    ) {
      return data.message.join(
        " "
      );
    }

    if (
      typeof data?.message ===
      "string"
    ) {
      return data.message;
    }

    if (
      typeof data?.error ===
      "string"
    ) {
      return data.error;
    }

    if (
      error?.message
    ) {
      return error.message;
    }

    return "Something went wrong.";
  };


  // ====================================================
  // LOAD ALL DATA
  // ====================================================

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {

    setLoading(true);

    try {

      // ----------------------------------------------
      // 1. SIDEBAR
      // ----------------------------------------------

      const sidebarResponse =
        await getSettingsSidebar();

      console.log(
        "GET SIDEBAR RESPONSE:",
        sidebarResponse
      );

      const sidebarPayload =
        sidebarResponse?.data;

      console.log(
        "SIDEBAR RAW RESPONSE:",
        sidebarPayload
      );

      let sidebarCategories = [];

      if (
        Array.isArray(
          sidebarPayload?.data
        )
      ) {
        sidebarCategories =
          sidebarPayload.data;
      }

      console.log(
        "EXTRACTED CATEGORIES:",
        sidebarCategories
      );


      // ----------------------------------------------
      // 2. ALL SETTINGS
      // ----------------------------------------------

      const settingsResponse =
        await getSettings();

      console.log(
        "ALL SETTINGS RESPONSE:",
        settingsResponse
      );

      const settingsPayload =
        settingsResponse?.data;

      const allSettings =
        Array.isArray(
          settingsPayload?.data
        )
          ? settingsPayload.data
          : [];

      console.log(
        "ALL SETTINGS:",
        allSettings
      );


      setSettings(
        allSettings
      );


      // ----------------------------------------------
      // 3. BUILD CATEGORY LIST
      // ----------------------------------------------

      const categoryMap =
        new Map();


      // First: sidebar categories
      sidebarCategories.forEach(
        (category) => {

          if (
            category?.slug
          ) {

            categoryMap.set(
              category.slug,
              {
                slug:
                  category.slug,

                name:
                  category.name ||
                  category.slug,

                icon:
                  category.icon ||
                  "settings",

                sortOrder:
                  category.sortOrder ||
                  0,

                uuid:
                  category.uuid ||
                  category.categoryUuid ||
                  "",
              }
            );
          }
        }
      );


      // Second: get UUID from settings
      allSettings.forEach(
        (setting) => {

          const category =
            setting?.category;

          if (
            category?.slug
          ) {

            const old =
              categoryMap.get(
                category.slug
              ) || {};

            categoryMap.set(
              category.slug,
              {
                ...old,

                slug:
                  category.slug,

                name:
                  category.name ||
                  old.name ||
                  category.slug,

                icon:
                  category.icon ||
                  old.icon ||
                  "settings",

                sortOrder:
                  category.sortOrder ??
                  old.sortOrder ??
                  0,

                uuid:
                  category.uuid ||
                  old.uuid ||
                  "",
              }
            );
          }
        }
      );


      const finalCategories =
        Array.from(
          categoryMap.values()
        )
        .sort(
          (a, b) =>
            a.sortOrder -
            b.sortOrder
        );


      console.log(
        "FINAL CATEGORY LIST:",
        finalCategories
      );


      setCategories(
        finalCategories
      );


      // ----------------------------------------------
      // SELECT FIRST CATEGORY
      // ----------------------------------------------

      if (
        finalCategories.length > 0
      ) {

        const currentExists =
          finalCategories.some(
            (item) =>
              item.slug ===
              selectedSlug
          );

        if (
          !selectedSlug ||
          !currentExists
        ) {
          setSelectedSlug(
            finalCategories[0].slug
          );
        }
      }

    } catch (error) {

      console.error(
        "SETTINGS LOAD ERROR:",
        error
      );

      showToast(
        "error",
        getErrorMessage(error)
      );

    } finally {

      setLoading(false);
    }
  };


  // ====================================================
  // GET CATEGORY UUID
  // ====================================================

  const resolveCategoryUuid =
    async (slug) => {

      // ----------------------------------------------
      // FIRST: CHECK SETTINGS DATA
      // ----------------------------------------------

      const existing =
        settings.find(
          (setting) =>
            setting?.category
              ?.slug === slug
        );

      if (
        existing?.category?.uuid
      ) {

        return existing
          .category
          .uuid;
      }


      // ----------------------------------------------
      // SECOND: CHECK CATEGORY LIST
      // ----------------------------------------------

      const category =
        categories.find(
          (item) =>
            item.slug === slug
        );

      if (
        category?.uuid
      ) {

        return category.uuid;
      }


      // ----------------------------------------------
      // THIRD: CALL GROUP API
      // ----------------------------------------------

      try {

        console.log(
          "RESOLVING CATEGORY:",
          slug
        );

        const response =
          await getSettingsGroup(
            slug
          );

        console.log(
          "CATEGORY GROUP RESPONSE:",
          response
        );

        const data =
          response?.data?.data;

        const uuid =
          data?.category?.uuid ||
          data?.uuid ||
          "";

        if (uuid) {

          // update local category
          setCategories(
            (prev) =>
              prev.map(
                (item) =>
                  item.slug === slug
                    ? {
                        ...item,
                        uuid,
                      }
                    : item
              )
          );
        }

        return uuid;

      } catch (error) {

        console.error(
          "CATEGORY UUID ERROR:",
          error
        );

        return "";
      }
    };


  // ====================================================
  // SELECT CATEGORY
  // ====================================================

  const handleCategorySelect =
    async (slug) => {

      setSelectedSlug(slug);

      const uuid =
        await resolveCategoryUuid(
          slug
        );

      console.log(
        "SELECTED CATEGORY UUID:",
        uuid
      );
    };


  // ====================================================
  // CURRENT SETTINGS
  // ====================================================

  const visibleSettings =
    useMemo(() => {

      if (!selectedSlug) {
        return [];
      }

      return settings.filter(
        (setting) =>
          setting?.category
            ?.slug === selectedSlug
      );

    }, [
      settings,
      selectedSlug,
    ]);


  // ====================================================
  // OPEN CREATE
  // ====================================================

  const openCreate = async () => {

    setEditingSetting(null);

    const uuid =
      await resolveCategoryUuid(
        selectedSlug
      );

    setForm({
      ...initialForm,

      categoryUuid:
        uuid,

      group:
        categories.find(
          (item) =>
            item.slug ===
            selectedSlug
        )?.name ||
        "",
    });

    setModalOpen(true);
  };


  // ====================================================
  // OPEN EDIT
  // ====================================================

  const openEdit = (
    setting
  ) => {

    console.log(
      "EDIT SETTING:",
      setting
    );

    setEditingSetting(
      setting
    );

    setForm({
      categoryUuid:
        setting?.category?.uuid ||
        setting?.categoryUuid ||
        "",

      key:
        setting?.key || "",

      label:
        setting?.label || "",

      group:
        setting?.group || "",

      description:
        setting?.description || "",

      value:
        setting?.value ?? "",

      defaultValue:
        setting?.defaultValue ?? "",

      type:
        setting?.type ||
        "STRING",

      validation: {
        required:
          setting?.validation
            ?.required ?? false,

        min:
          setting?.validation
            ?.min ?? "",

        max:
          setting?.validation
            ?.max ?? "",

        minLength:
          setting?.validation
            ?.minLength ?? "",

        maxLength:
          setting?.validation
            ?.maxLength ?? "",
      },

      options: {
        values:
          setting?.options
            ?.values || [],
      },

      isEncrypted:
        setting?.isEncrypted ??
        false,

      isPublic:
        setting?.isPublic ??
        false,

      isEditable:
        setting?.isEditable ??
        true,

      sortOrder:
        setting?.sortOrder ?? 0,
    });

    setModalOpen(true);
  };


  // ====================================================
  // FORM CHANGE
  // ====================================================

  const updateForm = (
    field,
    value
  ) => {

    setForm(
      (prev) => ({
        ...prev,
        [field]: value,
      })
    );
  };


  // ====================================================
  // VALIDATE FORM
  // ====================================================

  const validateForm = () => {

    if (
      !form.categoryUuid
    ) {

      showToast(
        "error",
        "Please select a category."
      );

      return false;
    }


    if (
      !form.key.trim()
    ) {

      showToast(
        "error",
        "Setting key is required."
      );

      return false;
    }


    if (
      !form.label.trim()
    ) {

      showToast(
        "error",
        "Setting label is required."
      );

      return false;
    }


    if (
      !form.type
    ) {

      showToast(
        "error",
        "Please select setting type."
      );

      return false;
    }


    return true;
  };


  // ====================================================
  // BUILD PAYLOAD
  // ====================================================

  const buildPayload = () => {

    const payload = {

      categoryUuid:
        form.categoryUuid,

      key:
        form.key.trim(),

      label:
        form.label.trim(),

      group:
        form.group.trim(),

      description:
        form.description.trim(),

      value:
        form.value,

      defaultValue:
        form.defaultValue,

      type:
        form.type,

      validation: {},

      options:
        null,

      isEncrypted:
        Boolean(
          form.isEncrypted
        ),

      isPublic:
        Boolean(
          form.isPublic
        ),

      isEditable:
        Boolean(
          form.isEditable
        ),

      sortOrder:
        Number(
          form.sortOrder || 0
        ),
    };


    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (
      form.validation.required
    ) {
      payload.validation.required =
        true;
    }

    if (
      form.validation.min !== ""
    ) {
      payload.validation.min =
        Number(
          form.validation.min
        );
    }

    if (
      form.validation.max !== ""
    ) {
      payload.validation.max =
        Number(
          form.validation.max
        );
    }

    if (
      form.validation.minLength !== ""
    ) {
      payload.validation.minLength =
        Number(
          form.validation.minLength
        );
    }

    if (
      form.validation.maxLength !== ""
    ) {
      payload.validation.maxLength =
        Number(
          form.validation.maxLength
        );
    }


    // ----------------------------------------------
    // OPTIONS
    // ----------------------------------------------

    if (
      form.options.values
        .length > 0
    ) {

      payload.options = {
        values:
          form.options.values,
      };
    }


    console.log(
      "FINAL SETTING PAYLOAD:",
      payload
    );

    return payload;
  };


  // ====================================================
  // SAVE
  // ====================================================

  const handleSave =
    async (e) => {

      e.preventDefault();

      if (
        !validateForm()
      ) {
        return;
      }

      setSaving(true);

      try {

        const payload =
          buildPayload();

        console.log(
          "SETTING REQUEST PAYLOAD:",
          payload
        );


        // --------------------------------------------
        // CREATE
        // --------------------------------------------

        if (
          !editingSetting
        ) {

          const response =
            await createSetting(
              payload
            );

          console.log(
            "CREATE SETTING RESPONSE:",
            response
          );

          showToast(
            "success",
            "Setting created successfully."
          );

        }

        // --------------------------------------------
        // UPDATE
        // --------------------------------------------

        else {

          const uuid =
            editingSetting?.uuid;

          if (!uuid) {

            showToast(
              "error",
              "Setting UUID is missing. Cannot update."
            );

            return;
          }


          // IMPORTANT:
          // PATCH + UUID
          const response =
            await updateSetting(
              uuid,
              payload
            );

          console.log(
            "UPDATE SETTING RESPONSE:",
            response
          );

          showToast(
            "success",
            "Setting updated successfully."
          );
        }


        setModalOpen(false);

        setEditingSetting(null);

        setForm(
          initialForm
        );

        await loadData();

      } catch (error) {

        console.error(
          "SETTING SAVE ERROR:",
          error
        );

        showToast(
          "error",
          getErrorMessage(error)
        );

      } finally {

        setSaving(false);
      }
    };


  // ====================================================
  // DELETE
  // ====================================================

  const handleDelete =
    async (setting) => {

      if (!setting?.uuid) {

        showToast(
          "error",
          "Setting UUID is missing."
        );

        return;
      }


      const confirmed =
        window.confirm(
          `Delete "${setting.label}"?`
        );

      if (!confirmed) {
        return;
      }


      setDeleting(true);

      try {

        console.log(
          "DELETE UUID:",
          setting.uuid
        );

        await deleteSetting(
          setting.uuid
        );

        showToast(
          "success",
          "Setting deleted successfully."
        );

        await loadData();

      } catch (error) {

        console.error(
          "DELETE SETTING ERROR:",
          error
        );

        showToast(
          "error",
          getErrorMessage(error)
        );

      } finally {

        setDeleting(false);
      }
    };


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="settings-page">

      {/* TOAST */}

      <Toast
        toast={toast}
        onClose={() =>
          setToast(null)
        }
      />


      {/* HEADER */}

      <div className="settings-header">

        <div>

          <div className="settings-eyebrow">
            ADMIN CONFIGURATION
          </div>

          <h1>
            Settings
          </h1>

          <p>
            Manage your application
            settings.
          </p>

        </div>

        <div className="settings-tabs">

          <button className="active">
            Settings
          </button>

          <button>
            All Settings
          </button>

        </div>

      </div>


      {/* BODY */}

      <div className="settings-layout">

        {/* LEFT */}

        <aside className="settings-sidebar">

          <div className="sidebar-heading">

            <div>

              <small>
                CONFIGURATION
              </small>

              <h2>
                Settings Groups
              </h2>

            </div>

            <button
              onClick={openCreate}
              disabled={
                !selectedSlug
              }
              className="add-button"
            >
              +
            </button>

          </div>


          {/* LOADING */}

          {loading && (
            <div className="empty-box">
              Loading categories...
            </div>
          )}


          {/* ERROR */}

          {!loading &&
            categories.length === 0 && (
              <div className="empty-box error-box">

                <strong>
                  No categories found.
                </strong>

                <span>
                  Check browser console
                  for category response.
                </span>

                <button
                  onClick={loadData}
                  className="retry-button"
                >
                  Retry
                </button>

              </div>
            )}


          {/* CATEGORIES */}

          {!loading &&
            categories.length > 0 && (

              <div className="category-list">

                {categories.map(
                  (category) => (

                    <button
                      key={
                        category.slug
                      }
                      onClick={() =>
                        handleCategorySelect(
                          category.slug
                        )
                      }
                      className={
                        selectedSlug ===
                        category.slug
                          ? "category-item active"
                          : "category-item"
                      }
                    >

                      <span className="category-icon">
                        {category.icon ||
                          "⚙"}
                      </span>

                      <span>
                        {category.name}
                      </span>

                    </button>

                  )
                )}

              </div>
            )}

        </aside>


        {/* RIGHT */}

        <main className="settings-content">

          <div className="content-header">

            <div>

              <small>
                SETTINGS GROUP
              </small>

              <h2>
                {
                  categories.find(
                    (item) =>
                      item.slug ===
                      selectedSlug
                  )?.name ||
                  "Settings"
                }
              </h2>

            </div>

            <button
              className="primary-button"
              onClick={openCreate}
              disabled={
                !selectedSlug
              }
            >
              + Add Setting
            </button>

          </div>


          {/* SETTINGS */}

          {visibleSettings.length ===
            0 && (

            <div className="no-settings">

              <h3>
                No settings found.
              </h3>

              <p>
                Click "Add Setting" to
                create one.
              </p>

            </div>
          )}


          {visibleSettings.length >
            0 && (

            <div className="settings-list">

              {visibleSettings.map(
                (setting) => (

                  <div
                    className="setting-card"
                    key={
                      setting.uuid
                    }
                  >

                    <div className="setting-info">

                      <div className="setting-title">

                        <h3>
                          {setting.label}
                        </h3>

                        <span>
                          {setting.key}
                        </span>

                      </div>

                      <p>
                        {
                          setting.description
                        }
                      </p>

                      <div className="setting-meta">

                        <span>
                          Type:{" "}
                          {setting.type}
                        </span>

                        <span>
                          Value:{" "}
                          {String(
                            setting.value
                          )}
                        </span>

                      </div>

                    </div>


                    <div className="setting-actions">

                      <button
                        className="edit-button"
                        onClick={() =>
                          openEdit(
                            setting
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        disabled={
                          deleting
                        }
                        onClick={() =>
                          handleDelete(
                            setting
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </main>

      </div>


      {/* MODAL */}

      {modalOpen && (

        <div className="modal-overlay">

          <div className="settings-modal">

            <div className="modal-header">

              <div>

                <h2>
                  {editingSetting
                    ? "Edit Setting"
                    : "Add Setting"}
                </h2>

                <p>
                  Configure setting
                  information.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setModalOpen(false)
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                handleSave
              }
            >

              {/* CATEGORY */}

              <div className="form-group">

                <label>
                  Category *
                </label>

                <select
                  value={
                    selectedSlug
                  }
                  onChange={async (
                    e
                  ) => {

                    const slug =
                      e.target.value;

                    setSelectedSlug(
                      slug
                    );

                    const uuid =
                      await resolveCategoryUuid(
                        slug
                      );

                    console.log(
                      "SELECTED CATEGORY UUID:",
                      uuid
                    );

                    setForm(
                      (prev) => ({
                        ...prev,
                        categoryUuid:
                          uuid,
                      })
                    );

                  }}
                  required
                >

                  <option value="">
                    Select Category
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
                        {category.name}
                      </option>

                    )
                  )}

                </select>

                {!form.categoryUuid && (
                  <small className="field-error">
                    Select a category.
                  </small>
                )}

              </div>


              {/* KEY */}

              <div className="form-group">

                <label>
                  Key *
                </label>

                <input
                  value={
                    form.key
                  }
                  onChange={(e) =>
                    updateForm(
                      "key",
                      e.target.value
                    )
                  }
                  placeholder="smtp.host"
                  required
                />

              </div>


              {/* LABEL */}

              <div className="form-group">

                <label>
                  Label *
                </label>

                <input
                  value={
                    form.label
                  }
                  onChange={(e) =>
                    updateForm(
                      "label",
                      e.target.value
                    )
                  }
                  placeholder="SMTP Host"
                  required
                  maxLength={150}
                />

              </div>


              {/* GROUP */}

              <div className="form-group">

                <label>
                  Group
                </label>

                <input
                  value={
                    form.group
                  }
                  onChange={(e) =>
                    updateForm(
                      "group",
                      e.target.value
                    )
                  }
                  placeholder="SMTP"
                />

              </div>


              {/* DESCRIPTION */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    updateForm(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="SMTP Host Address"
                  rows={3}
                />

              </div>


              {/* VALUE */}

              <div className="form-group">

                <label>
                  Value
                </label>

                <input
                  value={
                    form.value
                  }
                  onChange={(e) =>
                    updateForm(
                      "value",
                      e.target.value
                    )
                  }
                  placeholder="smtp.gmail.com"
                />

              </div>


              {/* DEFAULT VALUE */}

              <div className="form-group">

                <label>
                  Default Value
                </label>

                <input
                  value={
                    form.defaultValue
                  }
                  onChange={(e) =>
                    updateForm(
                      "defaultValue",
                      e.target.value
                    )
                  }
                  placeholder="smtp.gmail.com"
                />

              </div>


              {/* TYPE */}

              <div className="form-group">

                <label>
                  Type *
                </label>

                <select
                  value={
                    form.type
                  }
                  onChange={(e) =>
                    updateForm(
                      "type",
                      e.target.value
                    )
                  }
                >

                  <option value="STRING">
                    STRING
                  </option>

                  <option value="NUMBER">
                    NUMBER
                  </option>

                  <option value="BOOLEAN">
                    BOOLEAN
                  </option>

                  <option value="JSON">
                    JSON
                  </option>

                  <option value="ARRAY">
                    ARRAY
                  </option>

                  <option value="OBJECT">
                    OBJECT
                  </option>

                  <option value="EMAIL">
                    EMAIL
                  </option>

                  <option value="URL">
                    URL
                  </option>

                  <option value="PASSWORD">
                    PASSWORD
                  </option>

                  <option value="COLOR">
                    COLOR
                  </option>

                  <option value="FILE">
                    FILE
                  </option>

                </select>

              </div>


              {/* REQUIRED */}

              <label className="checkbox-row">

                <input
                  type="checkbox"
                  checked={
                    form.validation
                      .required
                  }
                  onChange={(e) =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        validation: {
                          ...prev.validation,
                          required:
                            e.target
                              .checked,
                        },
                      })
                    )
                  }
                />

                Required

              </label>


              {/* ENCRYPTED */}

              <label className="checkbox-row">

                <input
                  type="checkbox"
                  checked={
                    form.isEncrypted
                  }
                  onChange={(e) =>
                    updateForm(
                      "isEncrypted",
                      e.target.checked
                    )
                  }
                />

                Encrypted

              </label>


              {/* PUBLIC */}

              <label className="checkbox-row">

                <input
                  type="checkbox"
                  checked={
                    form.isPublic
                  }
                  onChange={(e) =>
                    updateForm(
                      "isPublic",
                      e.target.checked
                    )
                  }
                />

                Public

              </label>


              {/* EDITABLE */}

              <label className="checkbox-row">

                <input
                  type="checkbox"
                  checked={
                    form.isEditable
                  }
                  onChange={(e) =>
                    updateForm(
                      "isEditable",
                      e.target.checked
                    )
                  }
                />

                Editable

              </label>


              {/* SORT ORDER */}

              <div className="form-group">

                <label>
                  Sort Order
                </label>

                <input
                  type="number"
                  value={
                    form.sortOrder
                  }
                  onChange={(e) =>
                    updateForm(
                      "sortOrder",
                      e.target.value
                    )
                  }
                />

              </div>


              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setModalOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    saving
                  }
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

    </div>
  );
}