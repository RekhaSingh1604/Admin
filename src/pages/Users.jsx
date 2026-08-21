import {
  useCallback,
  useEffect,
  useState,
} from "react";

import UserModal from "../components/users/UserModal";

import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService";

const STATUS_OPTIONS = [
  {
    value: "",
    label: "All Status",
  },
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
  },
  {
    value: "PENDING_VERIFICATION",
    label: "Pending Verification",
  },
  {
    value: "SUSPENDED",
    label: "Suspended",
  },
  {
    value: "BLOCKED",
    label: "Blocked",
  },
];

function extractUsers(response) {
  const body = response?.data;

  if (Array.isArray(body)) {
    return body;
  }

  if (Array.isArray(body?.data)) {
    return body.data;
  }

  if (Array.isArray(body?.data?.data)) {
    return body.data.data;
  }

  if (Array.isArray(body?.data?.users)) {
    return body.data.users;
  }

  if (Array.isArray(body?.users)) {
    return body.users;
  }

  if (Array.isArray(body?.items)) {
    return body.items;
  }

  return [];
}

function extractRoles(response) {
  const body = response?.data;

  if (Array.isArray(body)) {
    return body;
  }

  if (Array.isArray(body?.data)) {
    return body.data;
  }

  if (Array.isArray(body?.data?.data)) {
    return body.data.data;
  }

  if (Array.isArray(body?.data?.roles)) {
    return body.data.roles;
  }

  if (Array.isArray(body?.roles)) {
    return body.roles;
  }

  return [];
}

function getUserId(user) {
  return (
    user?.id ||
    user?.userId ||
    user?.uuid
  );
}

function getUserName(user) {
  return (
    user?.fullName ||
    user?.name ||
    user?.username ||
    "Unknown User"
  );
}

function getUserEmail(user) {
  return user?.email || "-";
}

function getUserPhone(user) {
  return user?.phone || "-";
}

function getUserStatus(user) {
  return (
    user?.status ||
    "UNKNOWN"
  );
}

function getUserRoles(user) {
  if (
    Array.isArray(user?.roles)
  ) {
    return user.roles;
  }

  return [];
}

function getErrorMessage(error) {
  return (
    error?.response?.data
      ?.message ||
    error?.response?.data
      ?.error ||
    error?.message ||
    "Something went wrong."
  );
}

export default function Users() {
  const [users, setUsers] =
    useState([]);

  const [roles, setRoles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [toast, setToast] =
    useState(null);

  /* =========================
     TOAST
  ========================= */

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  /* =========================
     LOAD USERS
  ========================= */

  const loadUsers = useCallback(
    async (refresh = false) => {
      try {
        setError("");

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await getUsers(
            status
              ? { status }
              : {}
          );

        setUsers(
          extractUsers(response)
        );
      } catch (error) {
        console.error(
          "GET USERS ERROR:",
          error
        );

        setError(
          getErrorMessage(error)
        );

        setUsers([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status]
  );

  /* =========================
     LOAD ROLES
  ========================= */

  const loadRoles =
    useCallback(async () => {
      try {
        const response =
          await getRoles();

        setRoles(
          extractRoles(response)
        );
      } catch (error) {
        console.error(
          "GET ROLES ERROR:",
          error
        );

        setRoles([]);
      }
    }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  /* =========================
     CREATE / UPDATE
  ========================= */

  const handleSaveUser =
    async (payload) => {
      try {
        setSaving(true);

        if (selectedUser) {
          const id =
            getUserId(
              selectedUser
            );

          await updateUser(
            id,
            payload
          );

          showToast(
            "User updated successfully."
          );
        } else {
          await createUser(
            payload
          );

          showToast(
            "User created successfully."
          );
        }

        setModalOpen(false);
        setSelectedUser(null);

        await loadUsers(true);
      } catch (error) {
        console.error(
          "SAVE USER ERROR:",
          error
        );

        showToast(
          getErrorMessage(error),
          "error"
        );
      } finally {
        setSaving(false);
      }
    };

  /* =========================
     DELETE
  ========================= */

  const handleDeleteUser =
    async (user) => {
      const id =
        getUserId(user);

      const confirmed =
        window.confirm(
          `Are you sure you want to delete ${getUserName(
            user
          )}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(id);

        await deleteUser(id);

        showToast(
          "User deleted successfully."
        );

        await loadUsers(true);
      } catch (error) {
        console.error(
          "DELETE USER ERROR:",
          error
        );

        showToast(
          getErrorMessage(error),
          "error"
        );
      } finally {
        setDeletingId(null);
      }
    };

  /* =========================
     FILTER
  ========================= */

  const filteredUsers =
    users.filter((user) => {
      const text =
        search
          .toLowerCase()
          .trim();

      if (!text) {
        return true;
      }

      return (
        getUserName(user)
          .toLowerCase()
          .includes(text) ||
        getUserEmail(user)
          .toLowerCase()
          .includes(text) ||
        getUserPhone(user)
          .toLowerCase()
          .includes(text)
      );
    });

  /* =========================
     OPEN CREATE
  ========================= */

  const openCreateModal =
    () => {
      setSelectedUser(null);
      setModalOpen(true);
    };

  /* =========================
     OPEN EDIT
  ========================= */

  const openEditModal =
    (user) => {
      setSelectedUser(user);
      setModalOpen(true);
    };

  return (
    <div className="users-page">

      {/* TOAST */}

      {toast && (
        <div
          className={`toast toast-${toast.type}`}
        >
          {toast.message}
        </div>
      )}

      {/* HEADER */}

      <div className="users-header">

        <div>
          <h1>Users</h1>

          <p>
            Manage users and
            their roles.
          </p>
        </div>

        <div className="users-actions">

          <button
            className="secondary-btn"
            onClick={() =>
              loadUsers(true)
            }
            disabled={
              loading ||
              refreshing
            }
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            className="primary-btn"
            onClick={
              openCreateModal
            }
          >
            + Add User
          </button>

        </div>

      </div>

      {/* FILTERS */}

      <div className="users-toolbar">

        <input
          type="text"
          placeholder="Search name, email or phone..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >
          {STATUS_OPTIONS.map(
            (item) => (
              <option
                key={
                  item.value
                }
                value={
                  item.value
                }
              >
                {item.label}
              </option>
            )
          )}
        </select>

      </div>

      {/* ERROR */}

      {error && (
        <div className="users-error">

          <div>
            <strong>
              Unable to load users
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            onClick={() =>
              loadUsers()
            }
          >
            Try Again
          </button>

        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="users-card">

          <div className="table-loading">

            <div className="skeleton skeleton-title" />

            <div className="skeleton" />

            <div className="skeleton" />

            <div className="skeleton" />

            <div className="skeleton" />

          </div>

        </div>
      )}

      {/* TABLE */}

      {!loading &&
        !error && (
          <div className="users-card">

            <div className="users-card-header">

              <div>
                <h2>
                  All Users
                </h2>

                <span>
                  {
                    filteredUsers.length
                  } users
                </span>
              </div>

            </div>

            {filteredUsers.length ===
            0 ? (
              <div className="empty-users">

                <h3>
                  No users found
                </h3>

                <p>
                  No users match
                  your current
                  filters.
                </p>

              </div>
            ) : (
              <div className="table-container">

                <table className="users-table">

                  <thead>
                    <tr>
                      <th>
                        User
                      </th>

                      <th>
                        Phone
                      </th>

                      <th>
                        Roles
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredUsers.map(
                      (user) => {

                        const id =
                          getUserId(
                            user
                          );

                        const userRoles =
                          getUserRoles(
                            user
                          );

                        return (
                          <tr
                            key={id}
                          >

                            <td>

                              <div className="user-cell">

                                <div className="user-avatar">
                                  {getUserName(
                                    user
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <div>

                                  <strong>
                                    {getUserName(
                                      user
                                    )}
                                  </strong>

                                  <span>
                                    {getUserEmail(
                                      user
                                    )}
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>
                              {getUserPhone(
                                user
                              )}
                            </td>

                            <td>

                              {userRoles.length >
                              0 ? (
                                <div className="role-list">

                                  {userRoles.map(
                                    (
                                      role,
                                      index
                                    ) => (
                                      <span
                                        className="role-badge"
                                        key={
                                          index
                                        }
                                      >
                                        {typeof role ===
                                        "string"
                                          ? role
                                          : role?.name ||
                                            role?.roleName ||
                                            role?.slug ||
                                            `Role ${
                                              role?.id ||
                                              ""
                                            }`}
                                      </span>
                                    )
                                  )}

                                </div>
                              ) : (
                                <span>
                                  No role
                                </span>
                              )}

                            </td>

                            <td>

                              <span className="status-badge">
                                {getUserStatus(
                                  user
                                ).replaceAll(
                                  "_",
                                  " "
                                )}
                              </span>

                            </td>

                            <td>

                              <div className="table-actions">

                                <button
                                  className="edit-btn"
                                  onClick={() =>
                                    openEditModal(
                                      user
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  className="delete-btn"
                                  onClick={() =>
                                    handleDeleteUser(
                                      user
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
        )}

      {/* MODAL */}

      <UserModal
        open={
          modalOpen
        }
        user={
          selectedUser
        }
        roles={roles}
        loading={
          saving
        }
        onClose={() => {
          if (!saving) {
            setModalOpen(
              false
            );
            setSelectedUser(
              null
            );
          }
        }}
        onSubmit={
          handleSaveUser
        }
      />

    </div>
  );
}