import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (q.trim()) navigate(`/jobs?q=${encodeURIComponent(q.trim())}`);
    else navigate("/jobs");
  }

  const dashboardLink =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "client"
      ? "/client"
      : "/freelancer";

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">F</span>FreeLancer
        </Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for services..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <SearchIcon />
          </button>
        </form>

        <div className="nav-links">
          <Link to="/jobs">Find Services</Link>
          {!user || user.role === "freelancer" ? (
            <Link to={user ? "/freelancer" : "/register"}>Become a Seller</Link>
          ) : null}

          {!user ? (
            <>
              <Link to="/login">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join
              </Link>
            </>
          ) : (
            <div style={{ position: "relative" }} ref={menuRef}>
              <div
                className="user-chip"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Account menu"
              >
                <img src={user.avatar} alt={user.name} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {user.name.split(" ")[0]}
                </span>
              </div>
              {menuOpen && (
                <div className="user-menu">
                  <div
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--border)",
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        textTransform: "capitalize",
                      }}
                    >
                      {user.role}
                    </div>
                  </div>
                  <Link to={dashboardLink} onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  {user.role === "freelancer" && (
                    <Link to="/freelancer/profile" onClick={() => setMenuOpen(false)}>
                      My Profile
                    </Link>
                  )}
                  {user.role === "client" && (
                    <>
                      <Link to="/client/post-job" onClick={() => setMenuOpen(false)}>
                        Post a Job
                      </Link>
                      <Link to="/client/manage" onClick={() => setMenuOpen(false)}>
                        Manage Jobs
                      </Link>
                    </>
                  )}
                  {user.role === "admin" && (
                    <>
                      <Link to="/admin/users" onClick={() => setMenuOpen(false)}>
                        User Management
                      </Link>
                      <Link to="/admin/listings" onClick={() => setMenuOpen(false)}>
                        Listings Management
                      </Link>
                    </>
                  )}
                  <div className="user-menu-divider"></div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      navigate("/");
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
      <path d="M21 21l-4-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}