// src/lib/api-service.js
import { getSession } from "next-auth/react";

// Match the port used in your backend main.ts file
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiService {
  // Basic HTTP methods
  async get(endpoint, options = {}) {
    try {
      // Special handling for count endpoints that don't exist in backend
      if (endpoint.endsWith("/count")) {
        const resource = endpoint.split("/")[1].replace("/count", "");
        return this.getCount(resource);
      }

      const response = await this.fetchWithAuth(endpoint, {
        method: "GET",
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  // Method to handle count requests
  async getCount(resource) {
    try {
      // For count endpoints, we'll get the list and return the count
      const response = await this.fetchWithAuth(`/${resource}`, {
        method: "GET",
      });

      if (!response.ok) {
        return { count: 0 };
      }

      const data = await response.json();

      // Check if it's the audit logs endpoint which returns {data, total}
      if (resource === "audit-logs" && data.total !== undefined) {
        return { count: data.total };
      }

      // For normal arrays
      return { count: Array.isArray(data) ? data.length : 0 };
    } catch (error) {
      console.error(`Count for ${resource} failed:`, error);
      return { count: 0 };
    }
  }

  async post(endpoint, data, options = {}) {
    try {
      const response = await this.fetchWithAuth(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  async patch(endpoint, data, options = {}) {
    try {
      const response = await this.fetchWithAuth(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`PATCH ${endpoint} failed:`, error);
      throw error;
    }
  }

  async delete(endpoint, options = {}) {
    try {
      const response = await this.fetchWithAuth(endpoint, {
        method: "DELETE",
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      // Handle 204 No Content response
      if (response.status === 204) {
        return true;
      }

      try {
        return await response.json();
      } catch (e) {
        // If no JSON is returned, just return success
        return true;
      }
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  // Helper for authentication and token refresh
  async fetchWithAuth(endpoint, options = {}) {
    try {
      const session = await getSession();

      let headers = {
        "Content-Type": "application/json",
      };

      // Add authorization header if we have a token
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      const mergedOptions = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      let url = endpoint.startsWith("http")
        ? endpoint
        : `${API_URL}${endpoint}`;
      let response = await fetch(url, mergedOptions);

      // If unauthorized, try to refresh the token
      if (response.status === 401 && session?.refreshToken) {
        try {
          const refreshResult = await this.refreshToken(
            session.refreshToken,
            session.user.id
          );

          if (refreshResult?.access_token) {
            // Update the authorization header with new token
            mergedOptions.headers.Authorization = `Bearer ${refreshResult.access_token}`;

            // Retry the request
            response = await fetch(url, mergedOptions);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // Continue with the error response
        }
      }

      return response;
    } catch (error) {
      console.error(`Network error: ${error.message}`);
      throw error;
    }
  }

  // Token refresh helper
  async refreshToken(refreshToken, userId) {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refresh_token: refreshToken,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }

  // --- Specific API endpoints based on your NestJS backend ---

  // Auth endpoints
  async login(credentials) {
    const response = await fetch(`${API_URL}/auth/login`, {
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
    return this.post("/auth/logout");
  }

  async checkPermissions(permissions) {
    return this.get(
      `/auth/check-permissions?permissions=${permissions.join(",")}`
    );
  }

  // User endpoints
  async getUsers() {
    return this.get("/users");
  }

  async getUser(id) {
    return this.get(`/users/${id}`);
  }

  async getUserProfile() {
    return this.get("/users/profile");
  }

  async createUser(userData) {
    return this.post("/users", userData);
  }

  async updateUser(id, userData) {
    return this.patch(`/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  // Role endpoints
  async getRoles() {
    return this.get("/roles");
  }

  async getRole(id) {
    return this.get(`/roles/${id}`);
  }

  async createRole(roleData) {
    return this.post("/roles", roleData);
  }

  async updateRole(id, roleData) {
    return this.patch(`/roles/${id}`, roleData);
  }

  async deleteRole(id) {
    return this.delete(`/roles/${id}`);
  }

  // Permission endpoints
  async getPermissions() {
    return this.get("/permissions");
  }

  async getPermission(id) {
    return this.get(`/permissions/${id}`);
  }

  async createPermission(permissionData) {
    return this.post("/permissions", permissionData);
  }

  async updatePermission(id, permissionData) {
    return this.patch(`/permissions/${id}`, permissionData);
  }

  async deletePermission(id) {
    return this.delete(`/permissions/${id}`);
  }

  // User-Role endpoints
  async getUserRoles(userId) {
    return this.get(`/user-roles/user/${userId}`);
  }

  async assignRoleToUser(userId, roleId) {
    return this.post("/user-roles", { userId, roleId });
  }

  async removeRoleFromUser(userId, roleId) {
    return this.delete(`/user-roles/user/${userId}/role/${roleId}`);
  }

  // Role-Permission endpoints
  async getPermissionsByRoleId(roleId) {
    return this.get(`/role-permissions/role/${roleId}`);
  }

  async assignPermissionsToRole(roleId, permissionIds) {
    return this.post("/role-permissions", {
      roleId,
      permissionIds,
    });
  }

  async removePermissionFromRole(roleId, permissionId) {
    return this.delete(
      `/role-permissions/role/${roleId}/permission/${permissionId}`
    );
  }

  // Audit logs endpoints
  async getAuditLogs(page = 1, limit = 10) {
    return this.get(`/audit-logs?page=${page}&limit=${limit}`);
  }

  async getAuditLogsByUser(userId, page = 1, limit = 10) {
    return this.get(`/audit-logs/user/${userId}?page=${page}&limit=${limit}`);
  }

  async getAuditLogsByResource(resource, page = 1, limit = 10) {
    return this.get(
      `/audit-logs/resource/${resource}?page=${page}&limit=${limit}`
    );
  }

  async getAuditLogsByAction(action, page = 1, limit = 10) {
    return this.get(`/audit-logs/action/${action}?page=${page}&limit=${limit}`);
  }
}

export const api = new ApiService();
