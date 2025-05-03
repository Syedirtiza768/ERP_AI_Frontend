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
    try {
      // First try to call the backend logout endpoint if it exists
      await httpClient.post("/auth/logout").catch(() => {
        // Ignore backend errors during logout
        console.log(
          "Backend logout failed, continuing with client-side logout"
        );
      });

      // Return true to indicate success
      return true;
    } catch (error) {
      console.error("Logout failed:", error);
      return false;
    }
  }

  async checkPermissions(permissions) {
    return httpClient.get(
      `/auth/check-permissions?permissions=${permissions.join(",")}`
    );
  }
}

export const authService = new AuthService();
