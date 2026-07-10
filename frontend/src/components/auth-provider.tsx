"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
  signUpWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  loginAttempts: number;
  maxAttempts: number;
  resetAttempts: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "jobradar_user";
const ATTEMPTS_KEY = "jobradar_login_attempts";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const maxAttempts = 5;

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUser(JSON.parse(stored));
    }
    const attempts = localStorage.getItem(ATTEMPTS_KEY);
    if (attempts) {
      setLoginAttempts(parseInt(attempts, 10));
    }
  }, []);

  const handleAuthSuccess = useCallback((provider: string) => {
    const mockUser: User = {
      id: crypto.randomUUID(),
      email: `user@example.com`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
      provider,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setLoginAttempts(0);
    localStorage.setItem(ATTEMPTS_KEY, "0");
  }, []);

  const handleAuthError = useCallback(() => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem(ATTEMPTS_KEY, newAttempts.toString());
  }, [loginAttempts]);

  const simulateAuth = useCallback(
    async (provider: string): Promise<void> => {
      if (loginAttempts >= maxAttempts) {
        throw new Error("Too many login attempts. Please try again later.");
      }

      setIsLoading(true);

      try {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.1) {
              resolve(true);
            } else {
              reject(new Error("Authentication failed. Please try again."));
            }
          }, 1500);
        });
        handleAuthSuccess(provider);
      } catch (error) {
        handleAuthError();
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [loginAttempts, maxAttempts, handleAuthSuccess, handleAuthError]
  );

  const signInWithGoogle = useCallback(
    () => simulateAuth("google"),
    [simulateAuth]
  );
  const signInWithGitHub = useCallback(
    () => simulateAuth("github"),
    [simulateAuth]
  );
  const signUpWithGoogle = useCallback(
    () => simulateAuth("google"),
    [simulateAuth]
  );
  const signUpWithGitHub = useCallback(
    () => simulateAuth("github"),
    [simulateAuth]
  );

  const signOut = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const resetAttempts = useCallback(() => {
    setLoginAttempts(0);
    localStorage.setItem(ATTEMPTS_KEY, "0");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithGoogle,
        signInWithGitHub,
        signUpWithGoogle,
        signUpWithGitHub,
        signOut,
        loginAttempts,
        maxAttempts,
        resetAttempts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
