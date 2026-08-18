import api from "../services/api";

import { useEffect, useState } from "react";
import "../styles/profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPasswordForm, setShowPasswordForm] =
    useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  // ================================
  // GET PROFILE
  // ================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/auth/profile");

      console.log(
        "PROFILE RESPONSE:",
        response.data
      );

      /*
        API response:

        {
          success: true,
          statusCode: 200,
          data: {
            message: "...",
            data: {
              id,
              fullName,
              email,
              phone,
              roles: [],
              permissions: []
            }
          }
        }
      */

      const profileData =
        response?.data?.data?.data ||
        response?.data?.data ||
        response?.data;

      if (!profileData) {
        throw new Error(
          "Profile data not found."
        );
      }

      setProfile(profileData);
    } catch (err) {
      console.error(
        "PROFILE ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ================================
  // CHANGE PASSWORD
  // POST /auth/set-password
  // ================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!newPassword.trim()) {
      setPasswordError(
        "Please enter a new password."
      );
      return;
    }

    if (!confirmPassword.trim()) {
      setPasswordError(
        "Please confirm your new password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "Passwords do not match."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "Password must be at least 8 characters."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await api.post(
        "/auth/set-password",
        {
          password: newPassword,
        }
      );

      console.log(
        "CHANGE PASSWORD RESPONSE:",
        response.data
      );

      setPasswordSuccess(
        response?.data?.message ||
          response?.data?.data?.message ||
          "Password changed successfully."
      );

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowPasswordForm(false);
      }, 1200);
    } catch (err) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        err
      );

      setPasswordError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <div>
            <h1>Profile</h1>
            <p>
              Manage your account information.
            </p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card skeleton-card">
            <div className="skeleton skeleton-title"></div>

            <div className="skeleton-row">
              <div className="skeleton skeleton-avatar"></div>

              <div className="skeleton-info">
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-line small"></div>
              </div>
            </div>

            <div className="skeleton skeleton-field"></div>
            <div className="skeleton skeleton-field"></div>
            <div className="skeleton skeleton-field"></div>
          </div>

          <div className="profile-card skeleton-card">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-field"></div>
            <div className="skeleton skeleton-field"></div>
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // ERROR
  // ================================

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <div>
            <h1>Profile</h1>
            <p>
              Manage your account information.
            </p>
          </div>
        </div>

        <div className="profile-error-card">
          <div className="error-icon">
            !
          </div>

          <h2>Unable to load profile</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={fetchProfile}
            className="primary-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="empty-profile">
          <h2>No profile found</h2>
          <p>
            Profile information is not available.
          </p>
        </div>
      </div>
    );
  }

  // ================================
  // ROLE
  // ================================

  const role =
    profile?.roles?.[0]?.role?.name ||
    profile?.roles?.[0]?.name ||
    profile?.role ||
    "User";

  const roleSlug =
    profile?.roles?.[0]?.role?.slug ||
    profile?.roles?.[0]?.slug ||
    "";

  // ================================
  // AVATAR LETTER
  // ================================

  const avatarLetter =
    profile?.fullName
      ?.charAt(0)
      ?.toUpperCase() || "U";

  // ================================
  // MAIN UI
  // ================================

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header">
        <div>
          <h1>Profile</h1>

          <p>
            View and manage your account information.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={fetchProfile}
        >
          ↻ Refresh
        </button>
      </div>

      {/* PROFILE GRID */}
      <div className="profile-grid">

        {/* ================================
            PERSONAL INFORMATION
        ================================= */}

        <section className="profile-card">

          <div className="card-header">
            <div>
              <h2>Personal Information</h2>

              <p>
                Your account details.
              </p>
            </div>
          </div>

          <div className="profile-main">

            <div className="profile-avatar">
              {avatarLetter}
            </div>

            <div>
              <h3>
                {profile.fullName ||
                  "Unnamed User"}
              </h3>

              <p>
                {profile.email ||
                  "No email available"}
              </p>
            </div>

          </div>

          {/* DETAILS */}

          <div className="details-grid">

            <div className="detail-item">
              <span className="detail-label">
                Full Name
              </span>

              <strong>
                {profile.fullName || "—"}
              </strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                Email
              </span>

              <strong>
                {profile.email || "—"}
              </strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                Phone
              </span>

              <strong>
                {profile.phone || "—"}
              </strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                User ID
              </span>

              <strong>
                {profile.id || "—"}
              </strong>
            </div>

          </div>

        </section>

        {/* ================================
            ACCOUNT STATUS
        ================================= */}

        <section className="profile-card">

          <div className="card-header">
            <div>
              <h2>Account</h2>

              <p>
                Account status and role.
              </p>
            </div>
          </div>

          <div className="account-details">

            <div className="account-row">

              <span>
                Status
              </span>

              <span
                className={`status-badge ${
                  profile.status === "ACTIVE"
                    ? "active"
                    : "inactive"
                }`}
              >
                {profile.status ||
                  "UNKNOWN"}
              </span>

            </div>

            <div className="account-row">

              <span>
                Role
              </span>

              <strong>
                {role}
              </strong>

            </div>

            {roleSlug && (
              <div className="account-row">

                <span>
                  Role Slug
                </span>

                <strong>
                  {roleSlug}
                </strong>

              </div>
            )}

            <div className="account-row">

              <span>
                Email Verified
              </span>

              <span
                className={`status-badge ${
                  profile.isEmailVerified
                    ? "active"
                    : "inactive"
                }`}
              >
                {profile.isEmailVerified
                  ? "Verified"
                  : "Not Verified"}
              </span>

            </div>

            <div className="account-row">

              <span>
                Phone Verified
              </span>

              <span
                className={`status-badge ${
                  profile.isPhoneVerified
                    ? "active"
                    : "inactive"
                }`}
              >
                {profile.isPhoneVerified
                  ? "Verified"
                  : "Not Verified"}
              </span>

            </div>

            <div className="account-row">

              <span>
                KYC Status
              </span>

              <strong>
                {profile.kycStatus || "—"}
              </strong>

            </div>

          </div>

        </section>

      </div>

      {/* ================================
          SECURITY
      ================================= */}

      <section className="profile-card security-card">

        <div className="card-header">

          <div>
            <h2>Security</h2>

            <p>
              Manage your account password.
            </p>
          </div>

        </div>

        {!showPasswordForm ? (

          <div className="security-content">

            <div className="security-info">

              <div className="security-icon">
                🔒
              </div>

              <div>
                <strong>
                  Password
                </strong>

                <p>
                  Change your password
                  securely.
                </p>
              </div>

            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setPasswordError("");
                setPasswordSuccess("");
                setShowPasswordForm(true);
              }}
            >
              Change Password
            </button>

          </div>

        ) : (

          <form
            className="password-form"
            onSubmit={handleChangePassword}
          >

            {/* NEW PASSWORD */}

            <div className="form-field">

              <label htmlFor="newPassword">
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Enter new password"
                autoComplete="new-password"
              />

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="form-field">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
              />

            </div>

            {/* ERROR */}

            {passwordError && (
              <div className="alert alert-error">
                {passwordError}
              </div>
            )}

            {/* SUCCESS */}

            {passwordSuccess && (
              <div className="alert alert-success">
                {passwordSuccess}
              </div>
            )}

            {/* BUTTONS */}

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                disabled={passwordLoading}
                onClick={() => {
                  setShowPasswordForm(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={passwordLoading}
              >
                {passwordLoading
                  ? "Updating..."
                  : "Update Password"}
              </button>

            </div>

          </form>

        )}

      </section>

      {/* ================================
          ACCOUNT INFORMATION
      ================================= */}

      <section className="profile-card">

        <div className="card-header">
          <div>
            <h2>Account Information</h2>

            <p>
              Additional account details.
            </p>
          </div>
        </div>

        <div className="details-grid">

          <div className="detail-item">
            <span className="detail-label">
              Account Created
            </span>

            <strong>
              {profile.createdAt
                ? new Date(
                    profile.createdAt
                  ).toLocaleDateString()
                : "—"}
            </strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Last Updated
            </span>

            <strong>
              {profile.updatedAt
                ? new Date(
                    profile.updatedAt
                  ).toLocaleDateString()
                : "—"}
            </strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Last Login
            </span>

            <strong>
              {profile.lastLoginAt
                ? new Date(
                    profile.lastLoginAt
                  ).toLocaleString()
                : "—"}
            </strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              User UUID
            </span>

            <strong className="uuid-text">
              {profile.uuid || "—"}
            </strong>
          </div>

        </div>

      </section>

    </div>
  );
}