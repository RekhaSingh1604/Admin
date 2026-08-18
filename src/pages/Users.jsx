
import api from "../services/api";
import { useCallback, useEffect, useState } from "react";



const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "PENDING_VERIFICATION", label: "Pending Verification" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BLOCKED", label: "Blocked" },
];

function getUsersFromResponse(response) {
  const body = response?.data;

  // Possible API structures
  if (Array.isArray(body?.data)) {
    return body.data;
  }

  if (Array.isArray(body?.data?.data)) {
    return body.data.data;
  }

  if (Array.isArray(body?.data?.items)) {
    return body.data.items;
  }

  if (Array.isArray(body?.data?.users)) {
    return body.data.users;
  }

  if (Array.isArray(body?.users)) {
    return body.users;
  }

  if (Array.isArray(body)) {
    return body;
  }

  return [];
}

function getErrorMessage(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status === 403) {
    return (
      data?.message ||
      "You do not have permission to view users. Required permission: user.view"
    );
  }

  if (status === 401) {
    return "Your session has expired. Please login again.";
  }

  return (
    data?.message ||
    error?.message ||
    "Unable to load users."
  );
}

function getUserId(user) {
  return user?.id || user?.userId || user?.uuid || "-";
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
  return user?.status || "UNKNOWN";
}

function getUserRoles(user) {
  if (Array.isArray(user?.roles)) {
    return user.roles
      .map((item) => {
        if (typeof item === "string") return item;

        return (
          item?.role?.name ||
          item?.name ||
          item?.roleName ||
          item?.role?.slug
        );
      })
      .filter(Boolean);
  }

  if (user?.role) {
    if (typeof user.role === "string") {
      return [user.role];
    }

    return [
      user.role?.name ||
        user.role?.slug ||
        user.roleName,
    ].filter(Boolean);
  }

  return [];
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const loadUsers = useCallback(
    async (showRefresh = false) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = {};

        if (status) {
          params.status = status;
        }

        console.log("GET USERS PARAMS:", params);

        const response = await api.get("/users", {
          params,
        });

        console.log("USERS FULL RESPONSE:", response);

        const list = getUsersFromResponse(response);

        console.log("USERS LIST:", list);

        setUsers(list);
      } catch (error) {
        console.error("USERS ERROR:", error);

        setUsers([]);
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    const name = getUserName(user).toLowerCase();
    const email = getUserEmail(user).toLowerCase();
    const phone = getUserPhone(user).toLowerCase();

    return (
      name.includes(searchText) ||
      email.includes(searchText) ||
      phone.includes(searchText)
    );
  });

  return (
    <div className="users-page">
      {/* Header */}
      <div className="users-header">
        <div>
          <h1>Users</h1>
          <p>Manage users and their roles.</p>
        </div>

        <button
          className="refresh-btn"
          onClick={() => loadUsers(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="users-toolbar">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="users-error">
          <div>
            <strong>Unable to load users</strong>
            <p>{error}</p>
          </div>

          <button onClick={() => loadUsers()}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading */}
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

      {/* Table */}
      {!loading && !error && (
        <div className="users-card">
          <div className="users-card-header">
            <div>
              <h2>All Users</h2>
              <span>
                {filteredUsers.length} user
                {filteredUsers.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty-users">
              <div className="empty-icon">👥</div>

              <h3>No users found</h3>

              <p>
                {search
                  ? "No users match your search."
                  : "There are no users available for this filter."}
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>User ID</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user, index) => {
                    const roles = getUserRoles(user);
                    const userStatus = getUserStatus(user);

                    return (
                      <tr
                        key={
                          user?.id ||
                          user?.uuid ||
                          user?.userId ||
                          index
                        }
                      >
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              {getUserName(user)
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {getUserName(user)}
                              </strong>

                              <span>
                                {getUserEmail(user)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {getUserPhone(user)}
                        </td>

                        <td>
                          <div className="role-list">
                            {roles.length > 0 ? (
                              roles.map((role, roleIndex) => (
                                <span
                                  className="role-badge"
                                  key={`${role}-${roleIndex}`}
                                >
                                  {role}
                                </span>
                              ))
                            ) : (
                              <span className="muted">
                                No role
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`status-badge status-${userStatus.toLowerCase()}`}
                          >
                            {userStatus.replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="user-id">
                            {getUserId(user)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}