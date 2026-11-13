import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const persist = (value) => {
    setUser(value);
    if (value) sessionStorage.setItem("df_session", JSON.stringify(value));
    else sessionStorage.removeItem("df_session");
  };
  useEffect(() => {
    let active = true;
    localStorage.removeItem("df_user");
    const restore = async () => {
      try {
        const saved = JSON.parse(
          sessionStorage.getItem("df_session") || "null",
        );
        if (!saved?.token) return;
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${saved.token}` },
        });
        if (response.ok && active)
          persist({ ...(await response.json()), token: saved.token });
        else sessionStorage.removeItem("df_session");
      } catch {
        sessionStorage.removeItem("df_session");
      } finally {
        if (active) setLoading(false);
      }
    };
    restore();
    return () => {
      active = false;
    };
  }, []);
  const authenticate = async (path, body) => {
    try {
      const response = await fetch(`/api/auth/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok)
        return {
          ok: false,
          error:
            typeof data.detail === "string"
              ? data.detail
              : "Revisa los datos de acceso.",
        };
      persist({ ...data.user, token: data.access_token });
      return { ok: true, role: data.user.role };
    } catch {
      return {
        ok: false,
        error:
          "No se pudo conectar con el servicio de acceso. Intenta nuevamente.",
      };
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: (email, password, role) =>
          authenticate("login", { email, password, role }),
        register: (data) => authenticate("register", data),
        logout: () => persist(null),
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
