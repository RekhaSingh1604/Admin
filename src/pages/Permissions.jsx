import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import "./Permissions.css";

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");

  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // =========================================
  // LOAD PERMISSIONS
  // =========================================

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/permissions");

      console.log("PERMISSIONS RESPONSE:", response.data);

      const raw =
        response?.data?.data?.data ||
        response?.data?.data ||
        response?.data;

      const list = Array.isArray(raw)
        ? raw
        : raw?.items ||
          raw?.permissions ||
          [];

      setPermissions(list);
    } catch (err) {
      console.error("PERMISSIONS ERROR:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOAD MODULES
  // =========================================

  const loadModules = async () => {
    try {
      const response = await api.get(
        "/permissions/modules"
      );

      console.log(
        "PERMISSION MODULES:",
        response.data
      );

      const raw =
        response?.data?.data?.data ||
        response?.data?.data ||
        response?.data;

      if (Array.isArray(raw)) {
        setModules(raw);
      } else if (raw?.modules) {
        setModules(raw.modules);
      }
    } catch (err) {
      console.error(
        "MODULES ERROR:",
        err
      );
    }
  };

  useEffect(() => {
    loadPermissions();
    loadModules();
  }, []);

  // =========================================
  // FILTER
  // =========================================

  const filteredPermissions = useMemo(() => {
    return permissions.filter((permission) => {
      const name =
        permission?.name ||
        permission?.slug ||
        permission?.key ||
        "";

      const description =
        permission?.description || "";

      const module =
        permission?.module ||
        permission?.moduleName ||
        permission?.resource ||
        "";

      const matchesSearch =
        name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        description
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesModule =
        selectedModule === "all" ||
        module === selectedModule;

      return matchesSearch && matchesModule;
    });
  }, [
    permissions,
    search,
    selectedModule,
  ]);

  // =========================================
  // CREATE
  // =========================================

  const handleCreate = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!form.name.trim()) {
      setError("Permission name is required.");
      return;
    }

    try {
      setSaving(true);

      /*
        IMPORTANT:
        Exact Swagger CreatePermissionDto was
        not visible in the supplied screenshot.

        This payload uses the common fields.
        If Swagger requires different fields,
        change only this object.
      */

      const payload = {
        name: form.name.trim(),
        description:
          form.description.trim(),
      };

      await api.post(
        "/permissions",
        payload
      );

      setSuccess(
        "Permission created successfully."
      );

      setForm({
        name: "",
        description: "",
      });

      setShowCreate(false);

      await loadPermissions();
    } catch (err) {
      console.error(
        "CREATE PERMISSION ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to create permission."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="permissions-page">
        <div className="permissions-header">
          <div>
            <h1>Permissions</h1>
            <p>
              Manage permissions and access control.
            </p>
          </div>
        </div>

        <div className="permission-skeleton">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              className="skeleton-row"
              key={item}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="permissions-page">

      {/* HEADER */}

      <div className="permissions-header">
        <div>
          <h1>Permissions</h1>
          <p>
            Manage permissions and access control.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() =>
            setShowCreate(true)
          }
        >
          + Create Permission
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="permission-alert error">
          <span>{error}</span>

          <button
            onClick={() => {
              setError("");
              loadPermissions();
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="permission-alert success">
          {success}
        </div>
      )}

      {/* STATS */}

      <div className="permission-stats">

        <div className="permission-stat">
          <span>Total Permissions</span>
          <strong>
            {permissions.length}
          </strong>
        </div>

        <div className="permission-stat">
          <span>Modules</span>
          <strong>
            {modules.length}
          </strong>
        </div>

        <div className="permission-stat">
          <span>Visible Results</span>
          <strong>
            {filteredPermissions.length}
          </strong>
        </div>

      </div>

      {/* FILTER */}

      <div className="permission-toolbar">

        <input
          type="text"
          placeholder="Search permissions..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={selectedModule}
          onChange={(e) =>
            setSelectedModule(e.target.value)
          }
        >
          <option value="all">
            All Modules
          </option>

          {modules.map((module, index) => {
            const value =
              typeof module === "string"
                ? module
                : module?.slug ||
                  module?.name ||
                  module?.module;

            const label =
              typeof module === "string"
                ? module
                : module?.name ||
                  module?.slug ||
                  module?.module;

            return (
              <option
                key={index}
                value={value}
              >
                {label}
              </option>
            );
          })}
        </select>

      </div>

      {/* TABLE */}

      <div className="permissions-card">

        <div className="permissions-table-wrap">

          <table className="permissions-table">

            <thead>
              <tr>
                <th>Permission</th>
                <th>Module</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {filteredPermissions.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="empty-cell"
                  >
                    <div className="empty-state">
                      <div className="empty-icon">
                        ✓
                      </div>

                      <h3>
                        No permissions found
                      </h3>

                      <p>
                        Try changing your search
                        or module filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPermissions.map(
                  (permission, index) => {

                    const name =
                      permission?.name ||
                      permission?.slug ||
                      permission?.key ||
                      "—";

                    const module =
                      permission?.module ||
                      permission?.moduleName ||
                      permission?.resource ||
                      name.split(".")[0] ||
                      "—";

                    return (
                      <tr
                        key={
                          permission?.id ||
                          permission?.uuid ||
                          index
                        }
                      >

                        <td>
                          <strong>
                            {name}
                          </strong>

                          {permission?.id && (
                            <small>
                              ID: {permission.id}
                            </small>
                          )}
                        </td>

                        <td>
                          <span className="module-badge">
                            {module}
                          </span>
                        </td>

                        <td>
                          {permission?.description ||
                            "No description"}
                        </td>

                        <td>
                          <span className="active-badge">
                            Active
                          </span>
                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* CREATE MODAL */}

      {showCreate && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowCreate(false)
          }
        >
          <div
            className="permission-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">
              <div>
                <h2>
                  Create Permission
                </h2>

                <p>
                  Add a new permission.
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setShowCreate(false)
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreate}
            >

              <div className="form-group">
                <label>
                  Permission Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. analytics.view"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Description
                </label>

                <textarea
                  placeholder="Describe this permission..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowCreate(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Creating..."
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