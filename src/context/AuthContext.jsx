import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pf_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.get("/auth/me")
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem("pf_token");
          delete api.defaults.headers.common["Authorization"];
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;
    localStorage.setItem("pf_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    const { token, user } = res.data;
    localStorage.setItem("pf_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("pf_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.patch("/auth/me", data);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
