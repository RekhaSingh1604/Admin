import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError(
        "Email and password are required."
      );
      return;
    }

    try {
      setLoading(true);

      await login(
        email.trim(),
        password
      );

      navigate(
        "/dashboard",
        { replace: true }
      );
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <form
        className="login-card"
        onSubmit={handleSubmit}
      >
        <div className="login-header">
          <h1>Bingo Admin</h1>
          <p>
            Sign in to continue
          </p>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            value={email}
            placeholder="Enter email"
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <input
            type="password"
            value={password}
            placeholder="Enter password"
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />
        </div>

        <button
          className="primary-btn full-btn"
          disabled={loading}
        >
          {loading
            ? "Signing in..."
            : "Login"}
        </button>
      </form>

    </div>
  );
}