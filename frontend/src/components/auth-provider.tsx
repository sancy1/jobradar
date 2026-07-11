
// // src/components/auth-provider.tsx

// "use client";

// import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// interface User {
//   id: string;
//   email: string;
//   name?: string;
//   avatar_url?: string;
//   provider?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   signInWithGoogle: () => Promise<void>;
//   signInWithGitHub: () => Promise<void>;
//   signUpWithGoogle: () => Promise<void>;
//   signUpWithGitHub: () => Promise<void>;
//   signOut: () => Promise<void>;
//   loginAttempts: number;
//   maxAttempts: number;
//   resetAttempts: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const STORAGE_KEY = "jobradar_user";
// const ATTEMPTS_KEY = "jobradar_login_attempts";

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [loginAttempts, setLoginAttempts] = useState(0);
//   const maxAttempts = 5;

//   useEffect(() => {
//     const stored = localStorage.getItem(STORAGE_KEY);
//     if (stored) {
//       setUser(JSON.parse(stored));
//     }
//     const attempts = localStorage.getItem(ATTEMPTS_KEY);
//     if (attempts) {
//       setLoginAttempts(parseInt(attempts, 10));
//     }
//   }, []);

//   const handleAuthSuccess = useCallback((provider: string) => {
//     const mockUser: User = {
//       id: crypto.randomUUID(),
//       email: `user@example.com`,
//       name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
//       avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
//       provider,
//     };

//     localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
//     setUser(mockUser);
//     setLoginAttempts(0);
//     localStorage.setItem(ATTEMPTS_KEY, "0");
//   }, []);

//   const handleAuthError = useCallback(() => {
//     const newAttempts = loginAttempts + 1;
//     setLoginAttempts(newAttempts);
//     localStorage.setItem(ATTEMPTS_KEY, newAttempts.toString());
//   }, [loginAttempts]);

//   const simulateAuth = useCallback(
//     async (provider: string): Promise<void> => {
//       if (loginAttempts >= maxAttempts) {
//         throw new Error("Too many login attempts. Please try again later.");
//       }

//       setIsLoading(true);

//       try {
//         await new Promise((resolve, reject) => {
//           setTimeout(() => {
//             if (Math.random() > 0.1) {
//               resolve(true);
//             } else {
//               reject(new Error("Authentication failed. Please try again."));
//             }
//           }, 1500);
//         });
//         handleAuthSuccess(provider);
//       } catch (error) {
//         handleAuthError();
//         throw error;
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [loginAttempts, maxAttempts, handleAuthSuccess, handleAuthError]
//   );

//   const signInWithGoogle = useCallback(
//     () => simulateAuth("google"),
//     [simulateAuth]
//   );
//   const signInWithGitHub = useCallback(
//     () => simulateAuth("github"),
//     [simulateAuth]
//   );
//   const signUpWithGoogle = useCallback(
//     () => simulateAuth("google"),
//     [simulateAuth]
//   );
//   const signUpWithGitHub = useCallback(
//     () => simulateAuth("github"),
//     [simulateAuth]
//   );

//   const signOut = useCallback(async () => {
//     localStorage.removeItem(STORAGE_KEY);
//     setUser(null);
//   }, []);

//   const resetAttempts = useCallback(() => {
//     setLoginAttempts(0);
//     localStorage.setItem(ATTEMPTS_KEY, "0");
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading,
//         signInWithGoogle,
//         signInWithGitHub,
//         signUpWithGoogle,
//         signUpWithGitHub,
//         signOut,
//         loginAttempts,
//         maxAttempts,
//         resetAttempts,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }





























// ============================================================
// FILEPATH: frontend/src/components/auth-provider.tsx
// DESCRIPTION: Complete Unified Authentication provider with real API integration
// ============================================================

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  Suspense,
} from "react";
// ✅ FIXED: Removed 'useSearchParams' from this top line so the file compiled cleanly
import { useRouter } from "next/navigation"; 
import { useSearchParams } from "next/navigation"; // Kept lower down or dynamically accessed inside child engines safely
import { api, tokenStorage, userStorage } from "@/lib/api";

// ============================================================
// TYPES
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  profile_picture?: string;
  provider: string;
  is_admin: boolean;
  preferences: {
    default_keywords: string[];
    default_location_preference: string;
    default_remote_only: boolean;
    default_entry_level_only: boolean;
  };
  created_at: string;
  last_login: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => void;
  signInWithGitHub: () => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginAttempts: number;
  maxAttempts: number;
  resetAttempts: () => void;
}

// ============================================================
// CONTEXT CREATION & STATE CONFIGS
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ATTEMPTS_KEY = "jobradar_login_attempts";
const MAX_ATTEMPTS = 5;

// ============================================================
// ROOT SUSPENSE GUARD PROVIDER (Protects NextJS Build Pipelines)
// ============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading Session Engine...
        </div>
      }
    >
      <AuthCoreEngine>{children}</AuthCoreEngine>
    </Suspense>
  );
}

// ============================================================
// CORE ENGINE SUB-COMPONENT
// ============================================================

function AuthCoreEngine({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams(); // Executed safely inside the child container lifecycle hook
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // ============================================================
  // HANDLE TOKEN FROM URL (OAuth Redirection Parser)
  // ============================================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = searchParams.get("token");
    const redirectTo = searchParams.get("callbackUrl") || searchParams.get("redirect") || "/dashboard";

    if (token) {
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      url.searchParams.delete("redirect");
      url.searchParams.delete("callbackUrl");
      window.history.replaceState({}, "", url.pathname + url.search);

      tokenStorage.set(token);
      
      document.cookie = `jobradar_access_token=${token}; path=/; max-age=86400; SameSite=Lax; Secure`;

      api.getCurrentUser()
        .then((userData) => {
          setUser(userData);
          userStorage.set(userData);
          router.push(redirectTo);
        })
        .catch(() => {
          tokenStorage.remove();
          userStorage.remove();
          document.cookie = "jobradar_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure";
          router.push("/auth/signin?error=OAuthVerificationFailed");
        });
    }
  }, [searchParams, router]);

  // ============================================================
  // LOAD SESSION ON MOUNT
  // ============================================================
  useEffect(() => {
    const loadSession = async () => {
      const storedUser = userStorage.get();
      const token = tokenStorage.get();

      if (storedUser && token) {
        setUser(storedUser);
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
          userStorage.set(userData);
        } catch {
          tokenStorage.remove();
          userStorage.remove();
          document.cookie = "jobradar_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure";
          setUser(null);
        }
      }

      const attempts = localStorage.getItem(ATTEMPTS_KEY);
      if (attempts) {
        setLoginAttempts(parseInt(attempts, 10));
      }

      setIsLoading(false);
    };

    loadSession();
  }, []);

  // ============================================================
  // AUTH METHODS
  // ============================================================
  const signInWithGoogle = useCallback(() => {
    api.loginWithProvider("google");
  }, []);

  const signInWithGitHub = useCallback(() => {
    api.loginWithProvider("github");
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Absorb logout metrics logs cleanly
    } finally {
      tokenStorage.remove();
      userStorage.remove();
      document.cookie = "jobradar_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure";
      setUser(null);
      router.push("/auth/signin");
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
      userStorage.set(userData);
    } catch {
      tokenStorage.remove();
      userStorage.remove();
      document.cookie = "jobradar_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure";
      setUser(null);
    }
  }, []);

  const resetAttempts = useCallback(() => {
    setLoginAttempts(0);
    localStorage.setItem(ATTEMPTS_KEY, "0");
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    refreshUser,
    loginAttempts,
    maxAttempts: MAX_ATTEMPTS,
    resetAttempts,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// HOOK HOIST
// ============================================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
