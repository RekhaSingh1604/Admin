import React, { useEffect, useState } from "react";

import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../services/permissionService";

import "./Permissions.css";

const initialForm = {
  name: "",
  slug: "",
  module: "",
};

function getErrorMessage(
  error,
  fallback = "Something went wrong"
) {
  const data = error?.response?.data;

  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  return fallback;
}

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);

  // const [deletingId, setDeletingId] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // =====================================================
  // TOAST
  // =====================================================

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        type: "success",
        message: "",
      });
    }, 3500);
  };

  // =====================================================
  // GET LIST
  // =====================================================

  const getPermissionList = (response) => {
    const body = response?.data;

    if (Array.isArray(body?.data)) {
      return body.data;
    }

    if (Array.isArray(body)) {
      return body;
    }

    return [];
  };

  // =====================================================
  // LOAD PERMISSIONS
  // =====================================================

  const loadPermissions = async () => {
    try {
      setLoading(true);

      const response = await getPermissions();

      console.log(
        "PERMISSIONS RESPONSE:",
        response
      );

      const list = getPermissionList(response);

      console.log(
        "PERMISSIONS LIST:",
        list
      );

      setPermissions(list);
    } catch (error) {
      console.error(
        "GET PERMISSIONS ERROR:",
        error
      );

      showToast(
        "error",
        getErrorMessage(
          error,
          "Unable to load permissions"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadPermissions();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE
  // =====================================================

  const handleCreate = () => {
    setEditingId(null);

    setForm(initialForm);

    setShowModal(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (permission) => {
    // IMPORTANT:
    // API response contains "id", not "uuid"

    const id = permission?.id;

    console.log(
      "EDIT PERMISSION ID:",
      id
    );

    console.log(
      "EDIT PERMISSION OBJECT:",
      permission
    );

    if (!id) {
      showToast(
        "error",
        "Permission ID is missing"
      );

      return;
    }

    setEditingId(id);

    setForm({
      name: permission?.name || "",
      slug: permission?.slug || "",
      module: permission?.module || "",
    });

    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);

    setEditingId(null);

    setForm(initialForm);
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!form.name.trim()) {
      showToast(
        "error",
        "Permission name is required"
      );

      return false;
    }

    if (!form.slug.trim()) {
      showToast(
        "error",
        "Permission slug is required"
      );

      return false;
    }

    if (!form.module.trim()) {
      showToast(
        "error",
        "Permission module is required"
      );

      return false;
    }

    return true;
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Backend accepted these fields.
    // "action" was rejected earlier.

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      module: form.module.trim(),
    };

    console.log(
      "PERMISSION REQUEST PAYLOAD:",
      payload
    );

    try {
      setSaving(true);

      // ================================================
      // UPDATE
      // ================================================

      if (editingId) {
        console.log(
          "UPDATE PERMISSION ID:",
          editingId
        );

        const response =
          await updatePermission(
            editingId,
            payload
          );

        console.log(
          "UPDATE PERMISSION RESPONSE:",
          response
        );

        showToast(
          "success",
          "Permission updated successfully"
        );
      }

      // ================================================
      // CREATE
      // ================================================

      else {
        const response =
          await createPermission(
            payload
          );

        console.log(
          "CREATE PERMISSION RESPONSE:",
          response
        );

        showToast(
          "success",
          "Permission created successfully"
        );
      }

      setShowModal(false);

      setEditingId(null);

      setForm(initialForm);

      await loadPermissions();

    } catch (error) {
      console.error(
        "SAVE PERMISSION ERROR:",
        error
      );

      console.error(
        "SAVE RESPONSE:",
        error?.response?.data
      );

      console.log(
        "BACKEND VALIDATION MESSAGE:",
        error?.response?.data?.message
      );

      showToast(
        "error",
        getErrorMessage(
          error,
          "Unable to save permission"
        )
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeletePermission = async (
  permission
) => {
  if (!permission) {
    toast.error("Permission not found.");
    return;
  }

  /*
   * IMPORTANT:
   * First use uuid if backend provides it.
   * Otherwise use id.
   */
  const permissionId =
    permission?.uuid ??
    permission?.id ??
    permission?.permissionId;

  console.log(
    "DELETE PERMISSION OBJECT:",
    permission
  );

  console.log(
    "DELETE PERMISSION ID:",
    permissionId
  );

  if (!permissionId) {
    toast.error(
      "Permission ID is missing."
    );
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete "${permission.name}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeletingId(
      String(permissionId)
    );

    await deletePermission(
      permissionId
    );

    toast.success(
      "Permission deleted successfully!"
    );

    /*
     * Refresh list
     */
    await loadPermissions();

  } catch (error) {
    console.error(
      "DELETE PERMISSION ERROR:",
      error
    );

    console.error(
      "DELETE STATUS:",
      error?.response?.status
    );

    console.error(
      "DELETE BACKEND RESPONSE:",
      error?.response?.data
    );

    const message =
      error?.response?.data?.message;

    toast.error(
      Array.isArray(message)
        ? message.join(", ")
        : message ||
            "Failed to delete permission."
    );

  } finally {
    setDeletingId(null);
  }
};

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="permissions-page">

      {/* ================================================= */}
      {/* TOAST */}
      {/* ================================================= */}

      {toast.show && (
        <div
          className={`permission-toast ${
            toast.type === "success"
              ? "toast-success"
              : "toast-error"
          }`}
        >
          <span className="toast-icon">
            {toast.type === "success"
              ? "✓"
              : "✕"}
          </span>

          <span className="toast-message">
            {toast.message}
          </span>

          <button
            type="button"
            className="toast-close"
            onClick={() =>
              setToast({
                show: false,
                type: "success",
                message: "",
              })
            }
          >
            ×
          </button>
        </div>
      )}

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="permissions-header">

        <div className="permissions-heading">

          <h1>
            Permissions
          </h1>

          <p>
            Manage application
            permissions.
          </p>

        </div>

        <button
          type="button"
          className="create-permission-btn"
          onClick={handleCreate}
        >
          <span>+</span>

          <span>
            Create Permission
          </span>
        </button>

      </div>

      {/* ================================================= */}
      {/* CARD */}
      {/* ================================================= */}

      <div className="permissions-card">

        <div className="permissions-card-header">

          <div>
            <h2>
              All Permissions
            </h2>

            <span>
              {permissions.length} permission
              {permissions.length !== 1
                ? "s"
                : ""}
            </span>
          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={loadPermissions}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "Refresh"}
          </button>

        </div>

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading &&
          permissions.length === 0 && (
            <div className="permissions-empty">

              <div className="loader" />

              <p>
                Loading permissions...
              </p>

            </div>
          )}

        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {!loading &&
          permissions.length === 0 && (
            <div className="permissions-empty">

              <div className="empty-icon">
                🔐
              </div>

              <h3>
                No permissions found
              </h3>

              <p>
                Create your first
                permission.
              </p>

              <button
                type="button"
                className="empty-create-btn"
                onClick={handleCreate}
              >
                Create Permission
              </button>

            </div>
          )}

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        {permissions.length > 0 && (
          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Name
                  </th>

                  <th>
                    Slug
                  </th>

                  <th>
                    Module
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {permissions.map(
                  (permission) => {

                    // USE ID BECAUSE API RETURNS ID
                    const id =
                      permission?.id;

                    return (
                      <tr
                        key={
                          id ||
                          `permission-${Math.random()}`
                        }
                      >

                        {/* NAME */}

                        <td>
                          <strong>
                            {permission?.name ||
                              "-"}
                          </strong>
                        </td>

                        {/* SLUG */}

                        <td>
                          <code className="permission-slug">
                            {permission?.slug ||
                              "-"}
                          </code>
                        </td>

                        {/* MODULE */}

                        <td>
                          <span className="module-text">
                            {permission?.module ||
                              "-"}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="permission-actions">

                            <button
                              type="button"
                              className="edit-btn"
                              onClick={() =>
                                handleEdit(
                                  permission
                                )
                              }
                            >
                              Edit
                            </button>

                            {/* <button
                              type="button"
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  permission
                                )
                              }
                              disabled={
                                deletingId ===
                                id
                              }
                            >
                              {deletingId ===
                              id
                                ? "Deleting..."
                                : "Delete"}
                            </button> */}
<button
  type="button"
  className="delete-btn"
  onClick={() =>
    handleDeletePermission(permission)
  }
  disabled={
    deletingId ===
    String(
      permission?.uuid ??
      permission?.id
    )
  }
>
  {deletingId ===
  String(
    permission?.uuid ??
    permission?.id
  )
    ? "Deleting..."
    : "Delete"}
</button>
                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      {showModal && (
        <div
          className="permission-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div
            className="permission-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>
                  {editingId
                    ? "Edit Permission"
                    : "Create Permission"}
                </h2>

                <p>
                  Enter permission
                  details below.
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="permission-form"
            >

              {/* NAME */}

              <div className="form-group">

                <label>
                  Name
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="User View"
                  autoComplete="off"
                />

              </div>

              {/* SLUG */}

              <div className="form-group">

                <label>
                  Slug
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="user.view"
                  autoComplete="off"
                />

                <small>
                  Example:
                  user.view
                </small>

              </div>

              {/* MODULE */}

              <div className="form-group">

                <label>
                  Module
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="module"
                  value={form.module}
                  onChange={handleChange}
                  placeholder="users"
                  autoComplete="off"
                />

              </div>

              {/* BUTTONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Permission"
                    : "Create Permission"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}