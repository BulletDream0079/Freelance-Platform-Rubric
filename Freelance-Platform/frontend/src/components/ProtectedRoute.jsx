import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <h1>Access denied</h1>
        <p className="text-muted">
          You don't have permission to view this page. Signed in as{" "}
          <strong>{user.role}</strong>.
        </p>
      </div>
    );
  }
  return children;
}