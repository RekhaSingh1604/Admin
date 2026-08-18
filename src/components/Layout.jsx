import {
  useState,
} from "react";

import Sidebar from "./Sidebar";

export default function Layout({
  children,
}) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <div className="app-shell">

      <button
        className="mobile-menu"
        onClick={() =>
          setMobileOpen(
            !mobileOpen
          )
        }
      >
        ☰
      </button>

      <div
        className={
          mobileOpen
            ? "sidebar-wrapper open"
            : "sidebar-wrapper"
        }
      >
        <Sidebar
          onNavigate={() =>
            setMobileOpen(false)
          }
        />
      </div>

      <main className="main-content">
        {children}
      </main>

    </div>
  );
}