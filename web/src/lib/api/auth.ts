import { request } from "./client";

export interface AuthResponse {
  access_token: string;
  user_id: string;
  name: string;
  email: string;
}

export function apiRegister(email: string, name: string, password: string) {
  return request<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, name, password }),
  });
}

export function apiLogin(email: string, password: string) {
  return request<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
