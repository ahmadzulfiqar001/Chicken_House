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

type LoginResponse =
  | { ok: true; user: AuthUser }
  | { ok: false; message: string };

type SignupResponse =
  | { ok: true; message: string; email: string }
  | { ok: false; message: string };

type SocialProvider = "google" | "facebook";

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  signup: (payload: SignupPayload) => Promise<SignupResponse>;
  socialSignup: (provider: SocialProvider) => Promise<SignupResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      return {
        ok: true,
        message: String(data.message ?? "Account created successfully. Please sign in to continue."),
        email: String(data.email ?? payload.email),
      };
    } catch (error) {
      console.error("Signup failed", error);
      return {
        ok: false,
        message: "Unable to create your account right now. Please try again.",
      };
    }
  };

  const socialSignup: AuthContextType["socialSignup"] = async (provider) => {
    window.location.assign(`/api/auth/social/${provider}`);
    return {
      ok: true,
      message: "Redirecting to secure sign-up.",
      email: "",
    };
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
      socialSignup,
      logout,
      refreshUser,
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
