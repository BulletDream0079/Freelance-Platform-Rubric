import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      const dest =
        location.state?.from?.pathname ||
        (user.role === "admin" ? "/admin" : user.role === "client" ? "/client" : "/freelancer");
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  }
  function quickFill(em, pw) {
    setEmail(em);
    setPassword(pw);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to access your dashboard</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 6 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-foot">
          New here? <Link to="/register">Create an account</Link>
        </div>

        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid var(--border)",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          <strong style={{ display: "block", marginBottom: 8, color: "var(--text)" }}>
            Demo accounts (click to fill):
          </strong>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => quickFill("admin@demo.com", "admin123")}>
            Admin
          </button>{" "}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => quickFill("sarah@demo.com", "client123")}>
            Client
          </button>{" "}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => quickFill("mike@demo.com", "free123")}>
            Freelancer
          </button>
        </div>
      </div>
    </div>
  );
}
