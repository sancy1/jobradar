// ============================================================
// FILEPATH: frontend/src/lib/auth-utils.ts
// DESCRIPTION: Authentication utilities (cookie + storage sync)
// ============================================================

import { tokenStorage, userStorage } from "./api";
import { User } from "@/components/auth-provider";

// ============================================================
// COOKIE HELPERS
// ============================================================

export function setAuthCookie(token: string) {
  if (typeof window === "undefined") return;
  // ✅ FIXED: Changed to 'jobradar_access_token' and added Secure flag for strict environment parity
  document.cookie = `jobradar_access_token=${token}; path=/; max-age=86400; SameSite=Lax; Secure`;
}

export function removeAuthCookie() {
  if (typeof window === "undefined") return;
  // ✅ FIXED: Aligned with the correct cookie namespace and ensured clean deletion across all browsers
  document.cookie = "jobradar_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure";
}

// ============================================================
// SESSION HELPERS
// ============================================================

export function setSession(token: string, user: User) {
  tokenStorage.set(token);
  userStorage.set(user);
  setAuthCookie(token);
}

export function clearSession() {
  tokenStorage.remove();
  userStorage.remove();
  removeAuthCookie();
}

// ============================================================
// TOKEN DECODING
// ============================================================

export function decodeToken(token: string): any {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    
    // ✅ FIXED: Made string parsing safe for both Next.js Node.js server environments and client-side runtimes
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = typeof window === "undefined"
      ? Buffer.from(base64, "base64").toString("utf8")
      : atob(base64);

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getTokenExpiry(token: string): number | null {
  const decoded = decodeToken(token);
  return decoded?.exp || null;
}

export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  // Buffer verification clock skew by 10 seconds to account for slight server synchronization delays
  return Date.now() >= (expiry * 1000) - 10000;
}

// ============================================================
// SYNC TOKEN WITH MIDDLEWARE
// ============================================================

export function syncAuthState(token: string | null) {
  if (token) {
    setAuthCookie(token);
  } else {
    removeAuthCookie();
  }
}
