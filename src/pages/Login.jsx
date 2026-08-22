import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      await login(
        email.trim(),
        password
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Invalid email or password."
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
        {/* HEADER */}

        <div className="login-header">
          <h1>Bingo Admin</h1>

          <p>
            Sign in to continue
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {/* EMAIL */}

        <div className="form-group">
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            placeholder="Enter email"
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            disabled={loading}
            autoComplete="email"
          />
        </div>

        {/* PASSWORD */}

        <div className="form-group">
          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            placeholder="Enter password"
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        {/* FORGOT PASSWORD */}

        <div className="forgot-password-link">
          <Link to="/forgot-password">
            Forgot Password?
          </Link>
        </div>

        {/* LOGIN BUTTON */}

        <button
          type="submit"
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