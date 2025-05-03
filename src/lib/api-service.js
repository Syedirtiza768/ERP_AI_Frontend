import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiService {
  async fetchWithAuth(endpoint, options = {}) {
    const session = await getSession();

    if (!session?.accessToken) {
      throw new Error("No access token available");
    }

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    let response = await fetch(`${API_URL}${endpoint}`, mergedOptions);

    // If unauthorized, try to refresh the token
    if (response.status === 401 && session.refreshToken) {
      const refreshed = await this.refreshToken(
        session.refreshToken,
        session.user.id
      );

      if (refreshed) {
        // Update the authorization header with new token
        mergedOptions.headers.Authorization = `Bearer ${refreshed}`;

        // Retry the request
        response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
      }
    }

    return response;
  }

  async refreshToken(refreshToken, userId) {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken, user_id: userId }),
      });

      if (response.ok) {
        const data = await response.json();

        // Here you would update the session with the new token
        // This is a simplified version - in practice,
        // you might need to use a custom event or context
        // to propagate the new token
        return data.access_token;
      }

      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }

  // User methods
  async getUsers() {
    const response = await this.fetchWithAuth("/users");
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  }

  async getUser(id) {
    const response = await this.fetchWithAuth(`/users/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch user ${id}`);
    return response.json();
  }

  async createUser(userData) {
    const response = await this.fetchWithAuth("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Failed to create user");
    return response.json();
  }

  async updateUser(id, userData) {
    const response = await this.fetchWithAuth(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error(`Failed to update user ${id}`);
    return response.json();
  }

  async deleteUser(id) {
    const response = await this.fetchWithAuth(`/users/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`Failed to delete user ${id}`);
    return true;
  }

  // Role methods
  async getRoles() {
    const response = await this.fetchWithAuth("/roles");
    if (!response.ok) throw new Error("Failed to fetch roles");
    return response.json();
  }

  async getRole(id) {
    const response = await this.fetchWithAuth(`/roles/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch role ${id}`);
    return response.json();
  }

  async createRole(roleData) {
    const response = await this.fetchWithAuth("/roles", {
      method: "POST",
      body: JSON.stringify(roleData),
    });
    if (!response.ok) throw new Error("Failed to create role");
    return response.json();
  }

  // Permission methods
  async getPermissions() {
    const response = await this.fetchWithAuth("/permissions");
    if (!response.ok) throw new Error("Failed to fetch permissions");
    return response.json();
  }

  async assignRoleToUser(userId, roleId) {
    const response = await this.fetchWithAuth("/user-roles", {
      method: "POST",
      body: JSON.stringify({ userId, roleId }),
    });
    if (!response.ok) throw new Error("Failed to assign role");
    return response.json();
  }

  async removeRoleFromUser(userId, roleId) {
    const response = await this.fetchWithAuth(
      `/user-roles/user/${userId}/role/${roleId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to remove role");
    return true;
  }
}

export const api = new ApiService();
