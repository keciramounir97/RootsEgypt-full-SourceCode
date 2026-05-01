/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "../../api/client";

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: number; // roleId mapped to role
  roleName?: string;
  status: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signup: (fullName: string, phone: string | undefined, email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<User | null>;
  requestReset: (email: string) => Promise<any>;
  verifyReset: (email: string, code: string, newPassword: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeEmail = (value: string | undefined | null) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const normalizeUser = (raw: any): User | null => {
    if (!raw) return null;
    const roleId = raw.roleId ?? raw.role_id ?? raw.role;
    return {
      ...raw,
      role: typeof roleId === "number" ? roleId : Number(roleId) || 0,
    };
  };

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const res = await api.get("/me");
      const data = res.data.data || res.data;
      const user = normalizeUser(data);
      setUser(user);
      return user;
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      return null;
    }
  }, []);

  /* LOAD SESSION */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  useEffect(() => {
    const onAuthExpired = () => {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    };

    const onAuthMissing = () => {
      setUser(null);
      setLoading(false);
    };

    window.addEventListener("auth:expired", onAuthExpired);
    // @ts-ignore - custom event
    window.addEventListener("auth:missing", onAuthMissing);
    return () => {
      window.removeEventListener("auth:expired", onAuthExpired);
      // @ts-ignore
      window.removeEventListener("auth:missing", onAuthMissing);
    };
  }, []);

  /* SIGNUP */
  const signup = (
    fullName: string,
    phone: string | undefined,
    email: string,
    password: string,
  ) =>
    api.post("/signup", {
      fullName: fullName?.trim(),
      phone: phone?.trim(),
      email: normalizeEmail(email),
      password,
    });

  /* LOGIN */
  const login = async (email: string, password: string) => {
    const res = await api.post("/login", {
      email: normalizeEmail(email),
      password,
    });
    // Backend returns wrapped response: { data: { token, user, ... } }
    const data = res.data.data || res.data;
    localStorage.setItem("token", data.token);
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }

    const user = normalizeUser(data.user);
    setUser(user);
    return user;
  };

  /* PASSWORD RESET */
  const requestReset = (email: string) =>
    api.post("/reset", { email: normalizeEmail(email) });

  const verifyReset = (email: string, code: string, newPassword: string) =>
    api.post("/reset/verify", {
      email: normalizeEmail(email),
      code: String(code || "").trim(),
      newPassword,
    });

  /* LOGOUT */
  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  const isAdmin = !!(user && (user.role === 1 || user.role === 3));

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signup,
        login,
        requestReset,
        verifyReset,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
