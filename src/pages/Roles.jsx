import {
  useEffect,
  useState,
} from "react";

import {
  getRoles,
  deleteRole,
} from "../services/rbacService";

import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import PermissionGate from "../components/PermissionGate";

export default function Roles() {
  const [roles, setRoles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getRoles();

      console.log(
        "ROLES RESPONSE:",
        response.data
      );

      const data =
        response?.data?.data;

      const list =
        Array.isArray(data)
          ? data
          : data?.roles ||
            data?.items ||
            [];

      setRoles(list);
    } catch (error) {
      console.error(
        "ROLES ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Unable to load roles."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleDelete = async (
    id
  ) => {
    if (
      !window.confirm(
        "Delete this role?"
      )
    ) {
      return;
    }

    try {
      await deleteRole(id);
      await loadRoles();
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to delete role."
      );
    }
  };

  if (loading) {
    return (
      <Loading text="Loading roles..." />
    );
  }

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>Roles</h1>
          <p>
            Manage roles and access.
          </p>
        </div>

        <PermissionGate permission="role.create">
          <button className="primary-btn">
            + Create Role
          </button>
        </PermissionGate>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {!roles.length ? (
        <EmptyState
          title="No roles found"
          message="No roles are available."
        />
      ) : (
        <div className="table-card">

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {roles.map((role) => (
                <tr
                  key={
                    role.uuid ||
                    role.id
                  }
                >
                  <td>
                    {role.name ||
                      "-"}
                  </td>

                  <td>
                    {role.slug ||
                      "-"}
                  </td>

                  <td>
                    {role.description ||
                      "-"}
                  </td>

                  <td>
                    <PermissionGate permission="role.update">
                      <button className="small-btn">
                        Edit
                      </button>
                    </PermissionGate>

                    <PermissionGate permission="role.delete">
                      <button
                        className="small-btn danger"
                        onClick={() =>
                          handleDelete(
                            role.uuid ||
                              role.id
                          )
                        }
                      >
                        Delete
                      </button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
}