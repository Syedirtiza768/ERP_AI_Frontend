// src/lib/api/http-client.js
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class HttpClient {
  constructor(baseUrl = API_URL) {
    this.baseUrl = baseUrl;
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: "GET", ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: "DELETE", ...options });
  }

  async request(endpoint, options = {}) {
    try {
      const session = await getSession();

      let headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      // Add authorization header if we have a token
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      const mergedOptions = {
        ...options,
        headers,
      };

      let url = endpoint.startsWith("http")
        ? endpoint
        : `${this.baseUrl}${endpoint}`;

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

      // Handle response
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
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }

  // Token refresh helper
  async refreshToken(refreshToken, userId) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
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

  // Method to handle count requests
  async getCount(resource) {
    try {
      // For count endpoints, we'll get the list and return the count
      const response = await this.get(`/${resource}`);

      // Check if it's the audit logs endpoint which returns {data, total}
      if (resource === "audit-logs" && response.total !== undefined) {
        return { count: response.total };
      }

      // For normal arrays
      return { count: Array.isArray(response) ? response.length : 0 };
    } catch (error) {
      console.error(`Count for ${resource} failed:`, error);
      return { count: 0 };
    }
  }
}

export const httpClient = new HttpClient();
