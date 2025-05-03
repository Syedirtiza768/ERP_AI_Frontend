// src/lib/api/permission-service.js
import { httpClient } from "./http-client";

class PermissionService {
  async getAll() {
    return httpClient.get("/permissions");
  }

  async getCount() {
    return httpClient.getCount("permissions");
  }

  async getById(id) {
    return httpClient.get(`/permissions/${id}`);
  }

  async create(permissionData) {
    return httpClient.post("/permissions", permissionData);
  }

  async update(id, permissionData) {
    return httpClient.patch(`/permissions/${id}`, permissionData);
  }

  async delete(id) {
    return httpClient.delete(`/permissions/${id}`);
  }
}

export const permissionService = new PermissionService();
