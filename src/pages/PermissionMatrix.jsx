import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPermissions,
  getRolePermissions,
  assignRolePermissions,
} from "../services/roleService";

import "../styles/PermissionMatrix.css";

export default function PermissionMatrix({
  role,
  onClose,
  onSaved,
}) {
  const [permissions, setPermissions] =
    useState([]);

  const [
    selectedIds,
    setSelectedIds,
  ] = useState(new Set());

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const roleId =
    role?.id ??
    role?.uuid;

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
    }, 3000);
  };

  /* =====================================================
     LOAD
  ===================================================== */

  const loadData = async () => {
    if (!roleId) {
      showToast(
        "error",
        "Role ID is missing."
      );

      return;
    }

    try {
      setLoading(true);

      const [
        permissionsResponse,
        rolePermissionsResponse,
      ] =
        await Promise.all([
          getPermissions(),
          getRolePermissions(
            roleId
          ),
        ]);

      console.log(
        "PERMISSIONS RESPONSE:",
        permissionsResponse
      );

      console.log(
        "ROLE PERMISSIONS RESPONSE:",
        rolePermissionsResponse
      );

      /* ALL */

      const permissionData =
        permissionsResponse
          ?.data?.data;

      const all =
        Array.isArray(
          permissionData
        )
          ? permissionData
          : [];

      setPermissions(all);

      /* ASSIGNED */

      const roleData =
        rolePermissionsResponse
          ?.data?.data;

      let assigned = [];

      if (
        Array.isArray(
          roleData
        )
      ) {
        assigned =
          roleData;
      } else if (
        Array.isArray(
          roleData?.permissions
        )
      ) {
        assigned =
          roleData.permissions;
      } else if (
        Array.isArray(
          roleData?.data
        )
      ) {
        assigned =
          roleData.data;
      }

      const ids =
        assigned
          .map((item) => {
            if (
              typeof item ===
              "object"
            ) {
              return Number(
                item?.id ??
                  item?.permissionId
              );
            }

            return Number(item);
          })
          .filter(
            (id) =>
              Number.isInteger(id)
          );

      console.log(
        "ASSIGNED PERMISSION IDS:",
        ids
      );

      setSelectedIds(
        new Set(ids)
      );
    } catch (error) {
      console.error(
        "PERMISSION LOAD ERROR:",
        error
      );

      const message =
        error?.response?.data?.message;

      showToast(
        "error",
        Array.isArray(message)
          ? message.join(", ")
          : message ||
              "Unable to load permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleId]);

  /* =====================================================
     SEARCH
  ===================================================== */

  const filtered =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return permissions;
      }

      return permissions.filter(
        (permission) =>
          String(
            permission?.name ||
              ""
          )
            .toLowerCase()
            .includes(value) ||
          String(
            permission?.slug ||
              ""
          )
            .toLowerCase()
            .includes(value) ||
          String(
            permission?.module ||
              ""
          )
            .toLowerCase()
            .includes(value) ||
          String(
            permission?.action ||
              ""
          )
            .toLowerCase()
            .includes(value)
      );
    }, [
      permissions,
      search,
    ]);

  /* =====================================================
     GROUP
  ===================================================== */

  const groups =
    useMemo(() => {
      return filtered.reduce(
        (
          result,
          permission
        ) => {
          const module =
            permission?.module ||
            "Other";

          if (
            !result[module]
          ) {
            result[module] =
              [];
          }

          result[module].push(
            permission
          );

          return result;
        },
        {}
      );
    }, [filtered]);

  /* =====================================================
     TOGGLE
  ===================================================== */

  const togglePermission = (
    id
  ) => {
    const numericId =
      Number(id);

    setSelectedIds(
      (previous) => {
        const next =
          new Set(previous);

        if (
          next.has(
            numericId
          )
        ) {
          next.delete(
            numericId
          );
        } else {
          next.add(
            numericId
          );
        }

        return next;
      }
    );
  };

  /* =====================================================
     SELECT ALL
  ===================================================== */

  const selectAll = () => {
    const ids =
      permissions
        .map(
          (permission) =>
            Number(
              permission?.id
            )
        )
        .filter(
          (id) =>
            Number.isInteger(id)
        );

    setSelectedIds(
      new Set(ids)
    );

    showToast(
      "success",
      `${ids.length} permissions selected.`
    );
  };

  /* =====================================================
     CLEAR ALL
  ===================================================== */

  const clearAll = () => {
    setSelectedIds(
      new Set()
    );

    showToast(
      "success",
      "All permissions cleared."
    );
  };

  /* =====================================================
     GROUP SELECT
  ===================================================== */

  const selectGroup = (
    items
  ) => {
    setSelectedIds(
      (previous) => {
        const next =
          new Set(previous);

        items.forEach(
          (item) => {
            const id =
              Number(
                item?.id
              );

            if (
              Number.isInteger(id)
            ) {
              next.add(id);
            }
          }
        );

        return next;
      }
    );
  };

  /* =====================================================
     GROUP CLEAR
  ===================================================== */

  const clearGroup = (
    items
  ) => {
    setSelectedIds(
      (previous) => {
        const next =
          new Set(previous);

        items.forEach(
          (item) => {
            next.delete(
              Number(
                item?.id
              )
            );
          }
        );

        return next;
      }
    );
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave =
    async () => {
      if (!roleId) {
        showToast(
          "error",
          "Role ID is missing."
        );

        return;
      }

      try {
        setSaving(true);

        /*
          ALWAYS NUMBER IDS
        */

        const finalIds =
          Array.from(
            selectedIds
          )
            .map((id) =>
              Number(id)
            )
            .filter(
              (id) =>
                Number.isInteger(
                  id
                ) &&
                id > 0
            );

        console.log(
          "========== SAVE PERMISSIONS =========="
        );

        console.log(
          "ROLE ID:",
          roleId
        );

        console.log(
          "FINAL PERMISSION IDS:",
          finalIds
        );

        console.log(
          "FINAL PAYLOAD:",
          {
            permissionIds:
              finalIds,
          }
        );

        console.log(
          "======================================"
        );

        await assignRolePermissions(
          roleId,
          finalIds
        );

        showToast(
          "success",
          "Permissions saved successfully."
        );

        /*
          Give toast a moment,
          then notify parent.
        */

        setTimeout(() => {
          if (onSaved) {
            onSaved();
          }
        }, 500);
      } catch (error) {
        console.error(
          "PERMISSION SAVE ERROR:",
          error
        );

        console.error(
          "STATUS:",
          error?.response?.status
        );

        console.error(
          "BACKEND RESPONSE:",
          error?.response?.data
        );

        const message =
          error?.response?.data?.message;

        showToast(
          "error",
          Array.isArray(message)
            ? message.join(", ")
            : message ||
                "Unable to save permissions."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="permission-overlay">

      {/* TOAST */}

      {toast.show && (
        <div
          className={`permission-toast permission-toast-${toast.type}`}
        >
          <strong>
            {toast.type ===
            "success"
              ? "Success"
              : "Error"}
          </strong>

          <span>
            {toast.message}
          </span>

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

      <div className="permission-modal">

        {/* HEADER */}

        <div className="permission-header">

          <div>
            <span>
              RBAC
            </span>

            <h2>
              Permission Matrix
            </h2>

            <p>
              Role:{" "}
              <strong>
                {role?.name}
              </strong>
            </p>
          </div>

          <button
            type="button"
            className="permission-close"
            onClick={
              onClose
            }
            disabled={
              saving
            }
          >
            ×
          </button>

        </div>

        {/* TOOLBAR */}

        <div className="permission-toolbar">

          <input
            type="text"
            placeholder="Search permissions..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          <div className="matrix-toolbar-buttons">

            <button
              type="button"
              className="matrix-select-btn"
              onClick={
                selectAll
              }
              disabled={
                loading ||
                permissions.length ===
                  0
              }
            >
              Select All
            </button>

            <button
              type="button"
              className="matrix-clear-btn"
              onClick={
                clearAll
              }
              disabled={
                loading ||
                selectedIds.size ===
                  0
              }
            >
              Clear All
            </button>

          </div>

        </div>

        {/* COUNT */}

        <div className="permission-count">
          Selected{" "}
          <strong>
            {
              selectedIds.size
            }
          </strong>{" "}
          /{" "}
          {
            permissions.length
          }
        </div>

        {/* CONTENT */}

        <div className="permission-content">

          {loading && (
            <div className="permission-state">
              Loading permissions...
            </div>
          )}

          {!loading &&
            permissions.length ===
              0 && (
              <div className="permission-state">
                No permissions found.
              </div>
            )}

          {!loading &&
            Object.entries(
              groups
            ).map(
              ([
                module,
                items,
              ]) => {

                const allSelected =
                  items.every(
                    (item) =>
                      selectedIds.has(
                        Number(
                          item?.id
                        )
                      )
                  );

                return (
                  <section
                    className="permission-group"
                    key={module}
                  >

                    <div className="permission-group-header">

                      <div>
                        <h3>
                          {module}
                        </h3>

                        <span>
                          {
                            items.length
                          }{" "}
                          permissions
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          allSelected
                            ? clearGroup(
                                items
                              )
                            : selectGroup(
                                items
                              )
                        }
                      >
                        {allSelected
                          ? "Clear"
                          : "Select"}
                      </button>

                    </div>

                    <div className="permission-grid">

                      {items.map(
                        (
                          permission
                        ) => {

                          const id =
                            Number(
                              permission?.id
                            );

                          const selected =
                            selectedIds.has(
                              id
                            );

                          return (
                            <label
                              key={id}
                              className={`permission-item ${
                                selected
                                  ? "selected"
                                  : ""
                              }`}
                            >

                              <input
                                type="checkbox"
                                checked={
                                  selected
                                }
                                onChange={() =>
                                  togglePermission(
                                    id
                                  )
                                }
                              />

                              <span className="permission-checkbox">
                                {selected
                                  ? "✓"
                                  : ""}
                              </span>

                              <span className="permission-details">

                                <strong>
                                  {
                                    permission?.name ||
                                    permission?.slug ||
                                    `Permission ${id}`
                                  }
                                </strong>

                                <small>
                                  {
                                    permission?.slug ||
                                    ""
                                  }
                                </small>

                                <small>
                                  {
                                    permission?.action ||
                                    ""
                                  }
                                </small>

                              </span>

                            </label>
                          );
                        }
                      )}

                    </div>

                  </section>
                );
              }
            )}

        </div>

        {/* FOOTER */}

        <div className="permission-footer">

          <button
            type="button"
            className="matrix-cancel"
            onClick={
              onClose
            }
            disabled={
              saving
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="matrix-save"
            onClick={
              handleSave
            }
            disabled={
              saving
            }
          >
            {saving
              ? "Saving..."
              : "Save Permissions"}
          </button>

        </div>

      </div>

    </div>
  );
}