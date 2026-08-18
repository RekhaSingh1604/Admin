import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/settings.css";
import '../styles/settings.css'

export default function Settings() {
  const [categories, setCategories] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [settings, setSettings] = useState({});
  const [categoryInfo, setCategoryInfo] = useState(null);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -----------------------------------------
  // LOAD SIDEBAR CATEGORIES
  // -----------------------------------------

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      setError("");

      const response = await api.get("/admin/settings/sidebar");

      console.log("SETTINGS SIDEBAR RESPONSE:", response.data);

      const data =
        response?.data?.data?.data ||
        response?.data?.data ||
        [];

      setCategories(Array.isArray(data) ? data : []);

      if (Array.isArray(data) && data.length > 0) {
        setSelectedSlug(data[0].slug);
      }
    } catch (err) {
      console.error("SETTINGS SIDEBAR ERROR:", err);

      const message =
        err?.response?.data?.message ||
        "Unable to load settings.";

      setError(message);
    } finally {
      setLoadingCategories(false);
    }
  };

  // -----------------------------------------
  // LOAD SELECTED GROUP
  // -----------------------------------------

  const loadGroup = async (slug) => {
    if (!slug) return;

    try {
      setLoadingSettings(true);
      setError("");
      setSuccess("");

      const response = await api.get(
        `/admin/settings/group/${encodeURIComponent(slug)}`
      );

      console.log("SETTINGS GROUP RESPONSE:", response.data);

      const responseData = response?.data;

      const groupData =
        responseData?.data?.data ||
        responseData?.data ||
        {};

      setCategoryInfo(groupData?.category || null);

      const values = groupData?.values || {};

      setSettings(values);
    } catch (err) {
      console.error("SETTINGS GROUP ERROR:", err);

      const message =
        err?.response?.data?.message ||
        "Unable to load settings group.";

      setError(message);
      setSettings({});
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      loadGroup(selectedSlug);
    }
  }, [selectedSlug]);

  // -----------------------------------------
  // INPUT CHANGE
  // -----------------------------------------

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // -----------------------------------------
  // SAVE SETTINGS
  // -----------------------------------------

  const handleSave = async () => {
    if (!selectedSlug) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
        Backend GET response gives:

        {
          category: {...},
          values: {
            name: "...",
            email: "...",
            phone: "...",
            smtp_password: "********"
          }
        }

        PUT endpoint is the group bulk-update endpoint.
        We send the current settings object as the group payload.
      */

      const response = await api.put(
        `/admin/settings/group/${encodeURIComponent(
          selectedSlug
        )}`,
        settings
      );

      console.log("SETTINGS UPDATE RESPONSE:", response.data);

      setSuccess("Settings updated successfully.");

      // Reload fresh values
      await loadGroup(selectedSlug);
    } catch (err) {
      console.error("SETTINGS UPDATE ERROR:", err);

      const message =
        err?.response?.data?.message ||
        "Unable to update settings.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loadingCategories) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <div>
            <h1>Settings</h1>
            <p>Manage application configuration.</p>
          </div>
        </div>

        <div className="settings-loading-grid">
          <div className="settings-skeleton sidebar-skeleton" />
          <div className="settings-skeleton content-skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* HEADER */}

      <div className="settings-header">
        <div>
          <span className="settings-eyebrow">
            ADMIN CONFIGURATION
          </span>

          <h1>Settings</h1>

          <p>
            Manage your marketplace application settings.
          </p>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="settings-alert settings-error">
          <div>
            <strong>Unable to load settings</strong>
            <p>{error}</p>
          </div>

          <button
            onClick={() => {
              if (selectedSlug) {
                loadGroup(selectedSlug);
              } else {
                loadCategories();
              }
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="settings-alert settings-success">
          {success}
        </div>
      )}

      <div className="settings-layout">
        {/* SIDEBAR */}

        <aside className="settings-sidebar">
          <div className="settings-sidebar-title">
            Settings Categories
          </div>

          {categories.length === 0 ? (
            <div className="settings-empty-small">
              No categories available.
            </div>
          ) : (
            <div className="settings-category-list">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  className={
                    selectedSlug === category.slug
                      ? "settings-category active"
                      : "settings-category"
                  }
                  onClick={() =>
                    setSelectedSlug(category.slug)
                  }
                >
                  <span className="category-icon">
                    {category.icon || "⚙"}
                  </span>

                  <span>
                    {category.name || category.slug}
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* CONTENT */}

        <main className="settings-content">
          {loadingSettings ? (
            <div className="settings-form-card">
              <div className="form-skeleton large" />
              <div className="form-skeleton" />
              <div className="form-skeleton" />
              <div className="form-skeleton" />
            </div>
          ) : Object.keys(settings).length === 0 ? (
            <div className="settings-empty">
              <div className="empty-icon">⚙</div>

              <h2>No settings found</h2>

              <p>
                There are no configurable values available
                for this category.
              </p>
            </div>
          ) : (
            <div className="settings-form-card">
              <div className="settings-card-header">
                <div>
                  <span className="settings-card-label">
                    SETTINGS GROUP
                  </span>

                  <h2>
                    {categoryInfo?.name ||
                      selectedSlug}
                  </h2>

                  <p>
                    Configure the settings for this
                    category.
                  </p>
                </div>

                <span className="settings-badge">
                  {selectedSlug}
                </span>
              </div>

              <div className="settings-form">
                {Object.entries(settings).map(
                  ([key, value]) => {
                    const isMasked =
                      typeof value === "string" &&
                      value.includes("*");

                    const isBoolean =
                      typeof value === "boolean";

                    return (
                      <div
                        className="setting-field"
                        key={key}
                      >
                        <label htmlFor={key}>
                          {formatLabel(key)}
                        </label>

                        {isBoolean ? (
                          <label className="switch-row">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                handleChange(
                                  key,
                                  e.target.checked
                                )
                              }
                            />

                            <span>
                              {value
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </label>
                        ) : (
                          <input
                            id={key}
                            type={
                              isMasked
                                ? "password"
                                : "text"
                            }
                            value={value ?? ""}
                            onChange={(e) =>
                              handleChange(
                                key,
                                e.target.value
                              )
                            }
                            placeholder={`Enter ${formatLabel(
                              key
                            )}`}
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              <div className="settings-form-footer">
                <button
                  className="save-settings-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function formatLabel(value) {
  return value
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}