"use client";

const TOKEN_KEY = "auth-token";
const USER_KEY = "auth-user";

export function setSession(token: string, user: { id: string; name: string; email: string }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Also write to cookie so proxy.ts can read it for route protection
  const maxAge = 30 * 24 * 60 * 60;
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): { id: string; name: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
