import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ onNavigate }) {
  const {
    user,
    logout,
    logoutAll,
  } = useAuth();

  const links = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: "◔",
    },
    {
      label: "Users",
      path: "/users",
      icon: "♙",
    },
    {
      label: "Roles",
      path: "/roles",
      icon: "♟",
    },
    {
      label: "Permissions",
      path: "/permissions",
      icon: "✓",
    },
    {
      label: "Profile",
      path: "/profile",
      icon: "◎",
    },
    {
      label: "Settings",
      path: "/settings",
      icon: "⚙",
    },
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <div className="logo-box">
          B
        </div>

        <div>
          <h2>Bingo</h2>
          <span>Admin Panel</span>
        </div>
      </div>

      <div className="sidebar-section-title">
        MAIN MENU
      </div>

      <nav className="sidebar-nav">

        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "sidebar-link-active"
                  : ""
              }`
            }
          >
            <span className="sidebar-icon">
              {link.icon}
            </span>

            <span>
              {link.label}
            </span>
          </NavLink>
        ))}

      </nav>

      <div className="sidebar-footer">

        <div className="user-card">

          <div className="user-avatar">
            {(
              user?.fullName ||
              user?.name ||
              "A"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="user-info">
            <strong>
              {user?.fullName ||
                user?.name ||
                "Admin"}
            </strong>

            <span>
              {user?.email || ""}
            </span>
          </div>

        </div>

        <button
          className="sidebar-logout"
          onClick={logout}
        >
          Logout
        </button>

        <button
          className="sidebar-logout-all"
          onClick={logoutAll}
        >
          Logout all devices
        </button>

      </div>

    </aside>
  );
}