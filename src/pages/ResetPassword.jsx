import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { resetPassword } from "../services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  /*
    Support reset links such as:

    /reset-password?token=abc&otp=123456

    If backend sends only token,
    user can enter OTP manually.
  */

  const urlToken =
    searchParams.get("token") || "";

  const urlOtp =
    searchParams.get("otp") || "";

  const [token, setToken] =
    useState(urlToken);

  const [otp, setOtp] =
    useState(urlOtp);

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token.trim()) {
      setError("Reset token is required.");
      return;
    }

    if (!otp.trim()) {
      setError("OTP is required.");
      return;
    }

    if (!password) {
      setError("New password is required.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        token: token.trim(),
        otp: otp.trim(),
        password,
        confirmPassword,
      });

      setSuccess(
        "Password reset successfully. You can now login."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);

    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-header">

          <h1>
            Reset Password
          </h1>

          <p>
            Enter the OTP and create
            your new password.
          </p>

        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>
              Reset Token
            </label>

            <input
              type="text"
              value={token}
              placeholder="Enter reset token"
              onChange={(event) =>
                setToken(
                  event.target.value
                )
              }
              disabled={loading}
              required
            />

          </div>

          <div className="form-group">

            <label>
              OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              placeholder="Enter 6-digit OTP"
              onChange={(event) =>
                setOtp(
                  event.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              disabled={loading}
              required
            />

          </div>

          <div className="form-group">

            <label>
              New Password
            </label>

            <input
              type="password"
              value={password}
              placeholder="Enter new password"
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              disabled={loading}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              value={
                confirmPassword
              }
              placeholder="Confirm new password"
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              disabled={loading}
              required
            />

          </div>

          <button
            type="submit"
            className="primary-btn full-btn"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>

        <div className="auth-footer">

          <Link to="/login">
            ← Back to Login
          </Link>

        </div>

      </div>

    </div>
  );
}