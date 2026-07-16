import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);
    client
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await client.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    const { data: meData } = await client.get("/auth/me");
    setUser(meData.user);
    return meData.user;
  };

  const register = async (payload) => {
    const { data } = await client.post("/auth/register", payload);
    localStorage.setItem("token", data.token);
    const { data: meData } = await client.get("/auth/me");
    setUser(meData.user);
    return meData.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
