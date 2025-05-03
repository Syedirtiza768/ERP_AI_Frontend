// src/lib/api/audit-service.js
import { httpClient } from "./http-client";

class AuditService {
  async getAll(page = 1, limit = 10) {
    return httpClient.get(`/audit-logs?page=${page}&limit=${limit}`);
  }

  async getCount() {
    return httpClient.getCount("audit-logs");
  }

  async getByUser(userId, page = 1, limit = 10) {
    return httpClient.get(
      `/audit-logs/user/${userId}?page=${page}&limit=${limit}`
    );
  }

  async getByResource(resource, page = 1, limit = 10) {
    return httpClient.get(
      `/audit-logs/resource/${resource}?page=${page}&limit=${limit}`
    );
  }

  async getByAction(action, page = 1, limit = 10) {
    return httpClient.get(
      `/audit-logs/action/${action}?page=${page}&limit=${limit}`
    );
  }
}

export const auditService = new AuditService();
