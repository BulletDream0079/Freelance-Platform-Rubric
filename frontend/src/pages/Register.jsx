import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("freelancer");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const user = await register({ name, email, password, role });
      navigate(user.role === "client" ? "/client" : "/freelancer", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Could not register");
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-sub">Join thousands of buyers and sellers on FreeLancer</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            I want to...
          </label>
          <div className="role-picker">
            <div
              className={`role-option ${role === "freelancer" ? "active" : ""}`}
              onClick={() => setRole("freelancer")}
            >
              <div className="role-option-title">Sell my services</div>
              <div className="role-option-desc">I'm a freelancer</div>
            </div>
            <div
              className={`role-option ${role === "client" ? "active" : ""}`}
              onClick={() => setRole("client")}
            >
              <div className="role-option-title">Hire freelancers</div>
              <div className="role-option-desc">I'm a client</div>
            </div>
          </div>
          <span className="role-picker-admin-note">
            Admin accounts are seeded for the demo and cannot be created here.
          </span>

          <div className="field">
            <label>Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
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
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 6 }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
