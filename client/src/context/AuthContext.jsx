import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  // refresh if token present
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      api.get("/auth/me").then(
        (r) => {
          setUser(r.data);
          localStorage.setItem("user", JSON.stringify(r.data));
        },
        () => {}
      );
    }
  }, []);

  async function login(email, password) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // local clean up ignore expiry
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  // merge new fields to stored user
  function updateUser(patch) {
    setUser((prev) => {
      const next = { ...(prev || {}), ...patch };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }

  // pull current user from api
  async function refresh() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch {
      return null;
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, loading, updateUser, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
