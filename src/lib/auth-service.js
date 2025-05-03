// src/lib/api/auth-service.js
import { httpClient } from "./http-client";

class AuthService {
  async login(credentials) {
    const response = await fetch(`${httpClient.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Invalid credentials");
    }

    return response.json();
  }

  async logout() {
    return httpClient.post("/auth/logout");
  }

  async checkPermissions(permissions) {
    return httpClient.get(
      `/auth/check-permissions?permissions=${permissions.join(",")}`
    );
  }
}

export const authService = new AuthService();
