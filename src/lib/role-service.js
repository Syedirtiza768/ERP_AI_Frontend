// src/lib/api/role-service.js
import { httpClient } from "./http-client";

class RoleService {
  async getAll() {
    return httpClient.get("/roles");
  }

  async getCount() {
    return httpClient.getCount("roles");
  }

  async getById(id) {
    return httpClient.get(`/roles/${id}`);
  }

  async create(roleData) {
    return httpClient.post("/roles", roleData);
  }

  async update(id, roleData) {
    return httpClient.patch(`/roles/${id}`, roleData);
  }

  async delete(id) {
    return httpClient.delete(`/roles/${id}`);
  }

  // User-Role relationships
  async getUserRoles(userId) {
    return httpClient.get(`/user-roles/user/${userId}`);
  }

  async assignRoleToUser(userId, roleId) {
    return httpClient.post("/user-roles", { userId, roleId });
  }

  async removeRoleFromUser(userId, roleId) {
    return httpClient.delete(`/user-roles/user/${userId}/role/${roleId}`);
  }

  // Role-Permission relationships
  async getPermissions(roleId) {
    return httpClient.get(`/role-permissions/role/${roleId}`);
  }

  async assignPermissions(roleId, permissionIds) {
    return httpClient.post("/role-permissions", {
      roleId,
      permissionIds,
    });
  }

  async removePermission(roleId, permissionId) {
    return httpClient.delete(
      `/role-permissions/role/${roleId}/permission/${permissionId}`
    );
  }
}

export const roleService = new RoleService();
