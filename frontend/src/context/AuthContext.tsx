import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type UserRole =
  | "admin"
  | "manager"
  | "hr"
  | "rider"
  | "staff"
  | "user";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  staffMemberId?: number;
  memberSince?: string;
  phone?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type SignupPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

type AuthResponse =
  | { ok: true; user: AuthUser }
  | { ok: false; message: string };

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  signup: (payload: SignupPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  demoAccounts: Array<{ role: UserRole; email: string; password: string; label: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoAccounts: AuthContextType["demoAccounts"] = [
  {
    role: "admin",
    email: "admin@chickenhouse.com",
    password: "admin123",
    label: "Admin Demo",
  },
  {
    role: "manager",
    email: "zubair@chickenhouse.com",
    password: "manager123",
    label: "Manager Demo",
  },
  {
    role: "hr",
    email: "hr@chickenhouse.com",
    password: "hr123",
    label: "HR Demo",
  },
  {
    role: "rider",
    email: "bilal@chickenhouse.com",
    password: "rider123",
    label: "Rider Demo",
  },
  {
    role: "staff",
    email: "ammar@chickenhouse.com",
    password: "staff123",
    label: "General Staff Demo",
  },
  {
    role: "user",
    email: "farhan@chickenhouse.com",
    password: "user123",
    label: "Customer Demo",
  },
];

const extractError = async (response: Response) => {
  try {
    const data = await response.json();
    return String(data.message ?? "Request failed.");
  } catch {
    return "Request failed.";
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();
      setUser(data.user ?? null);
    } catch (error) {
      console.error("Failed to restore session", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const login: AuthContextType["login"] = async (payload) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return {
          ok: false,
          message: await extractError(response),
        };
      }

      const data = await response.json();
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (error) {
      console.error("Login failed", error);
      return {
        ok: false,
        message: "Unable to sign in right now. Please try again.",
      };
    }
  };

  const signup: AuthContextType["signup"] = async (payload) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return {
          ok: false,
          message: await extractError(response),
        };
      }

      const data = await response.json();
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (error) {
      console.error("Signup failed", error);
      return {
        ok: false,
        message: "Unable to create your account right now. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      signup,
      logout,
      refreshUser,
      demoAccounts,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
