import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../services/roleService";

import PermissionMatrix from "./PermissionMatrix";

import "../styles/Roles.css";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  level: "",
  parentRoleId: "",
};

export default function Roles() {
  /* =====================================================
     ROLES
  ===================================================== */

  const [roles, setRoles] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  /* =====================================================
     CREATE / EDIT
  ===================================================== */

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingRole, setEditingRole] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  /* =====================================================
     DELETE
  ===================================================== */

  const [
    deleteModalOpen,
    setDeleteModalOpen,
  ] = useState(false);

  const [
    deletingRole,
    setDeletingRole,
  ] = useState(null);

  /* =====================================================
     PERMISSION MATRIX
  ===================================================== */

  const [
    permissionMatrixRole,
    setPermissionMatrixRole,
  ] = useState(null);

  /* =====================================================
     TOAST
  ===================================================== */

  const [toast, setToast] =
    useState({
      show: false,
      type: "",
      message: "",
    });

  const showToast = (
    type,
    message
  ) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        type: "",
        message: "",
      });
    }, 3500);
  };

  /* =====================================================
     LOAD ROLES
  ===================================================== */

  const loadRoles = async () => {
    try {
      setLoading(true);

      const response =
        await getRoles();

      console.log(
        "ROLES RESPONSE:",
        response
      );

      const responseData =
        response?.data;

      const list =
        Array.isArray(
          responseData?.data
        )
          ? responseData.data
          : Array.isArray(
              responseData
            )
          ? responseData
          : [];

      console.log(
        "ROLES LIST:",
        list
      );

      setRoles(list);
    } catch (error) {
      console.error(
        "GET ROLES ERROR:",
        error
      );

      const message =
        error?.response?.data?.message;

      showToast(
        "error",
        Array.isArray(message)
          ? message.join(", ")
          : message ||
              "Unable to load roles."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredRoles =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return roles;
      }

      return roles.filter(
        (role) =>
          String(
            role?.name || ""
          )
            .toLowerCase()
            .includes(value) ||
          String(
            role?.slug || ""
          )
            .toLowerCase()
            .includes(value) ||
          String(
            role?.description || ""
          )
            .toLowerCase()
            .includes(value)
      );
    }, [roles, search]);

  /* =====================================================
     SYSTEM ROLE CHECK
  ===================================================== */

  const isSystemRole = (
    role
  ) => {
    return (
      role?.isSystem === true ||
      role?.is_system === true ||
      String(
        role?.type || ""
      ).toLowerCase() ===
        "system"
    );
  };

  /* =====================================================
     CREATE
  ===================================================== */

  const openCreate = () => {
    setEditingRole(null);

    setForm({
      ...emptyForm,
    });

    setModalOpen(true);
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const openEdit = (
    role
  ) => {
    console.log(
      "EDIT ROLE OBJECT:",
      role
    );

    const roleId =
      role?.id ??
      role?.uuid;

    console.log(
      "EDIT ROLE ID:",
      roleId
    );

    if (!roleId) {
      showToast(
        "error",
        "Role ID is missing."
      );

      return;
    }

    setEditingRole({
      ...role,
      _id: roleId,
    });

    setForm({
      name:
        role?.name || "",

      slug:
        role?.slug || "",

      description:
        role?.description || "",

      level:
        role?.level !== null &&
        role?.level !== undefined
          ? String(
              role.level
            )
          : "",

      parentRoleId:
        role?.parentRoleId !==
          null &&
        role?.parentRoleId !==
          undefined
          ? String(
              role.parentRoleId
            )
          : "",
    });

    setModalOpen(true);
  };

  /* =====================================================
     CLOSE FORM
  ===================================================== */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);

    setEditingRole(null);

    setForm({
      ...emptyForm,
    });
  };

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  /* =====================================================
     CREATE / UPDATE
  ===================================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const name =
      form.name.trim();

    const slug =
      form.slug
        .trim()
        .toLowerCase();

    if (!name) {
      showToast(
        "error",
        "Role name is required."
      );
      return;
    }

    if (!slug) {
      showToast(
        "error",
        "Role slug is required."
      );
      return;
    }

    if (slug.length < 3) {
      showToast(
        "error",
        "Role slug must be at least 3 characters."
      );
      return;
    }

    const payload = {
      name,
      slug,
    };

    if (
      form.description.trim()
    ) {
      payload.description =
        form.description.trim();
    }

    if (
      form.level !== ""
    ) {
      payload.level =
        Number(form.level);
    }

    if (
      form.parentRoleId !==
      ""
    ) {
      payload.parentRoleId =
        form.parentRoleId;
    }

    console.log(
      "ROLE REQUEST PAYLOAD:",
      payload
    );

    try {
      setSaving(true);

      if (editingRole) {
        const roleId =
          editingRole?._id ??
          editingRole?.id ??
          editingRole?.uuid;

        if (!roleId) {
          throw new Error(
            "Role ID is missing."
          );
        }

        const response =
          await updateRole(
            roleId,
            payload
          );

        console.log(
          "UPDATE ROLE RESPONSE:",
          response
        );

        showToast(
          "success",
          "Role updated successfully."
        );
      } else {
        const response =
          await createRole(
            payload
          );

        console.log(
          "CREATE ROLE RESPONSE:",
          response
        );

        showToast(
          "success",
          "Role created successfully."
        );
      }

      setModalOpen(false);

      setEditingRole(null);

      setForm({
        ...emptyForm,
      });

      await loadRoles();
    } catch (error) {
      console.error(
        "SAVE ROLE ERROR:",
        error
      );

      const message =
        error?.response?.data?.message;

      showToast(
        "error",
        Array.isArray(message)
          ? message.join(", ")
          : message ||
              error?.message ||
              "Unable to save role."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     OPEN DELETE
  ===================================================== */

  const openDelete = (
    role
  ) => {
    console.log(
      "DELETE ROLE OBJECT:",
      role
    );

    const roleId =
      role?.id ??
      role?.uuid;

    console.log(
      "DELETE ROLE ID:",
      roleId
    );

    if (!roleId) {
      showToast(
        "error",
        "Role ID is missing."
      );

      return;
    }

    if (
      isSystemRole(role)
    ) {
      showToast(
        "error",
        "System roles cannot be deleted."
      );

      return;
    }

    setDeletingRole({
      ...role,
      id: roleId,
    });

    setDeleteModalOpen(
      true
    );
  };

  /* =====================================================
     CLOSE DELETE
  ===================================================== */

  const closeDelete = () => {
    if (saving) {
      return;
    }

    setDeleteModalOpen(
      false
    );

    setDeletingRole(null);
  };

  /* =====================================================
     DELETE ROLE
  ===================================================== */

  const handleDeleteRole = async () => {
  console.log(
    "========== DELETE START =========="
  );

  if (!deletingRole) {
    showToast(
      "error",
      "No role selected."
    );
    return;
  }

  const roleId =
    deletingRole?.id ??
    deletingRole?.uuid;

  console.log(
    "DELETING ROLE:",
    deletingRole
  );

  console.log(
    "DELETE ROLE ID:",
    roleId
  );

  if (
    roleId === undefined ||
    roleId === null ||
    roleId === ""
  ) {
    showToast(
      "error",
      "Role ID is missing."
    );
    return;
  }

  if (isSystemRole(deletingRole)) {
    showToast(
      "error",
      "System roles cannot be deleted."
    );
    return;
  }

  try {
    setSaving(true);

    console.log(
      "DELETE REQUEST STARTED"
    );

    const response =
      await deleteRole(roleId);

    console.log(
      "DELETE SUCCESS RESPONSE:",
      response
    );

    /*
      Close modal first
    */
    setDeleteModalOpen(false);
    setDeletingRole(null);

    /*
      Reload roles from backend
    */
    await loadRoles();

    /*
      Success message
    */
    showToast(
      "success",
      "Role deleted successfully."
    );

    console.log(
      "========== DELETE SUCCESS =========="
    );
  } catch (error) {
    console.error(
      "========== DELETE FAILED =========="
    );

    console.error(
      "DELETE ERROR:",
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

    console.error(
      "DELETE URL:",
      error?.config?.url
    );

    const backendMessage =
      error?.response?.data?.message;

    const message = Array.isArray(
      backendMessage
    )
      ? backendMessage.join(", ")
      : backendMessage ||
        error?.message ||
        "Unable to delete role.";

    showToast(
      "error",
      message
    );
  } finally {
    setSaving(false);
  }
};

  /* =====================================================
     PERMISSION MATRIX
  ===================================================== */

  const openPermissionMatrix =
    (role) => {
      const roleId =
        role?.id ??
        role?.uuid;

      console.log(
        "PERMISSION MATRIX ROLE:",
        role
      );

      console.log(
        "PERMISSION MATRIX ROLE ID:",
        roleId
      );

      if (!roleId) {
        showToast(
          "error",
          "Role ID is missing."
        );

        return;
      }

      setPermissionMatrixRole(
        {
          ...role,
          id: roleId,
        }
      );
    };

  const closePermissionMatrix =
    () => {
      setPermissionMatrixRole(
        null
      );
    };

  const handlePermissionsSaved =
    async () => {
      setPermissionMatrixRole(
        null
      );

      await loadRoles();

      showToast(
        "success",
        "Permissions updated successfully."
      );
    };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="roles-page">

      {/* TOAST */}

      {toast.show && (
        <div
          className={`role-toast role-toast-${toast.type}`}
        >
          <div className="role-toast-icon">
            {toast.type ===
            "success"
              ? "✓"
              : "!"}
          </div>

          <div className="role-toast-content">
            <strong>
              {toast.type ===
              "success"
                ? "Success"
                : "Error"}
            </strong>

            <span>
              {toast.message}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setToast({
                show: false,
                type: "",
                message: "",
              })
            }
          >
            ×
          </button>
        </div>
      )}

      {/* HEADER */}

      <div className="roles-header">

        <div>
          <span className="roles-eyebrow">
            ADMIN RBAC
          </span>

          <h1>
            Roles
          </h1>

          <p>
            Manage roles and
            access levels.
          </p>
        </div>

        <button
          type="button"
          className="role-primary-btn"
          onClick={
            openCreate
          }
        >
          + Add Role
        </button>

      </div>

      {/* SEARCH */}

      <div className="roles-toolbar">

        <input
          type="text"
          placeholder="Search role name or slug..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

        <button
          type="button"
          className="role-refresh-btn"
          onClick={
            loadRoles
          }
          disabled={
            loading
          }
        >
          {loading
            ? "Loading..."
            : "Refresh"}
        </button>

      </div>

      {/* TABLE */}

      <div className="roles-card">

        <div className="roles-card-header">

          <div>
            <h2>
              All Roles
            </h2>

            <span>
              {
                filteredRoles.length
              }{" "}
              roles
            </span>
          </div>

        </div>

        {loading ? (
          <div className="roles-empty">
            Loading roles...
          </div>
        ) : filteredRoles.length ===
          0 ? (
          <div className="roles-empty">
            <h3>
              No roles found
            </h3>

            <p>
              Try another search
              or create a new
              role.
            </p>
          </div>
        ) : (
          <div className="roles-table-wrapper">

            <table className="roles-table">

              <thead>
                <tr>
                  <th>
                    ROLE
                  </th>

                  <th>
                    SLUG
                  </th>

                  <th>
                    DESCRIPTION
                  </th>

                  <th>
                    LEVEL
                  </th>

                  <th>
                    TYPE
                  </th>

                  <th>
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredRoles.map(
                  (role) => {
                    const system =
                      isSystemRole(
                        role
                      );

                    return (
                      <tr
                        key={
                          role?.id ??
                          role?.uuid
                        }
                      >

                        <td>
                          <strong>
                            {
                              role?.name
                            }
                          </strong>

                          {system && (
                            <small className="system-badge">
                              SYSTEM
                            </small>
                          )}
                        </td>

                        <td>
                          <code>
                            {
                              role?.slug ||
                              "-"
                            }
                          </code>
                        </td>

                        <td>
                          {
                            role?.description ||
                            "-"
                          }
                        </td>

                        <td>
                          {
                            role?.level ??
                            "-"
                          }
                        </td>

                        <td>
                          <span
                            className={`role-badge ${
                              system
                                ? "system"
                                : "custom"
                            }`}
                          >
                            {system
                              ? "System"
                              : "Custom"}
                          </span>
                        </td>

                        <td>

                          <div className="role-actions">

                            <button
                              type="button"
                              className="permissions-btn"
                              onClick={() =>
                                openPermissionMatrix(
                                  role
                                )
                              }
                            >
                              Permissions
                            </button>

                            <button
                              type="button"
                              className="edit-btn"
                              onClick={() =>
                                openEdit(
                                  role
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="delete-btn"
                              disabled={
                                system
                              }
                              onClick={() =>
                                openDelete(
                                  role
                                )
                              }
                            >
                              Delete
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

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {modalOpen && (
        <div className="role-modal-overlay">

          <div className="role-modal">

            <div className="role-modal-header">

              <div>
                <h2>
                  {editingRole
                    ? "Edit Role"
                    : "Create Role"}
                </h2>

                <p>
                  {editingRole
                    ? "Update role details."
                    : "Create a new application role."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="role-form-grid">

                <div className="role-form-group">

                  <label>
                    Role Name *
                  </label>

                  <input
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. MANAGER"
                    maxLength={100}
                    disabled={
                      saving
                    }
                  />

                </div>

                <div className="role-form-group">

                  <label>
                    Slug *
                  </label>

                  <input
                    name="slug"
                    value={
                      form.slug
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. manager"
                    maxLength={100}
                    disabled={
                      saving
                    }
                  />

                </div>

                <div className="role-form-group full">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Describe this role..."
                    rows={4}
                    disabled={
                      saving
                    }
                  />

                </div>

                <div className="role-form-group">

                  <label>
                    Level
                  </label>

                  <input
                    type="number"
                    name="level"
                    value={
                      form.level
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 10"
                    disabled={
                      saving
                    }
                  />

                </div>

                <div className="role-form-group">

                  <label>
                    Parent Role ID
                  </label>

                  <input
                    name="parentRoleId"
                    value={
                      form.parentRoleId
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Optional"
                    disabled={
                      saving
                    }
                  />

                </div>

              </div>

              <div className="role-modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingRole
                    ? "Update Role"
                    : "Create Role"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteModalOpen &&
        deletingRole && (
          <div className="role-modal-overlay">

            <div className="delete-modal">

              <div className="delete-icon">
                !
              </div>

              <h2>
                Delete Role?
              </h2>

              <p>
                Are you sure you
                want to delete{" "}
                <strong>
                  {
                    deletingRole.name
                  }
                </strong>
                ?
              </p>

              <p className="delete-warning">
                This action cannot
                be undone.
              </p>

              <div className="delete-modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    closeDelete
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="confirm-delete-btn"
                  onClick={
                    handleDeleteRole
                  }
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Deleting..."
                    : "Delete Role"}
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =================================================
          PERMISSION MATRIX
      ================================================= */}

      {permissionMatrixRole && (
        <PermissionMatrix
          role={
            permissionMatrixRole
          }
          onClose={
            closePermissionMatrix
          }
          onSaved={
            handlePermissionsSaved
          }
        />
      )}

    </div>
  );
}