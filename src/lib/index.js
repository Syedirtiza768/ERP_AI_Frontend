// src/lib/api/index.js
import { httpClient } from "./http-client";
import { authService } from "./auth-service";
import { userService } from "./user-service";
import { roleService } from "./role-service";
import { permissionService } from "./permission-service";
import { auditService } from "./audit-service";

// For backward compatibility with existing code
const api = {
  // Basic HTTP methods
  get: httpClient.get.bind(httpClient),
  post: httpClient.post.bind(httpClient),
  patch: httpClient.patch.bind(httpClient),
  delete: httpClient.delete.bind(httpClient),

  // Auth endpoints
  login: authService.login.bind(authService),
  logout: authService.logout.bind(authService),
  checkPermissions: authService.checkPermissions.bind(authService),

  // Resource endpoints
  getUsers: userService.getAll.bind(userService),
  getUser: userService.getById.bind(userService),
  getUserProfile: userService.getProfile.bind(userService),
  createUser: userService.create.bind(userService),
  updateUser: userService.update.bind(userService),
  deleteUser: userService.delete.bind(userService),

  // Role endpoints
  getRoles: roleService.getAll.bind(roleService),
  getRole: roleService.getById.bind(roleService),
  createRole: roleService.create.bind(roleService),
  updateRole: roleService.update.bind(roleService),
  deleteRole: roleService.delete.bind(roleService),

  // Permission endpoints
  getPermissions: permissionService.getAll.bind(permissionService),
  getPermission: permissionService.getById.bind(permissionService),
  createPermission: permissionService.create.bind(permissionService),
  updatePermission: permissionService.update.bind(permissionService),
  deletePermission: permissionService.delete.bind(permissionService),

  // User-Role endpoints
  getUserRoles: roleService.getUserRoles.bind(roleService),
  assignRoleToUser: roleService.assignRoleToUser.bind(roleService),
  removeRoleFromUser: roleService.removeRoleFromUser.bind(roleService),

  // Role-Permission endpoints
  getPermissionsByRoleId: roleService.getPermissions.bind(roleService),
  assignPermissionsToRole: roleService.assignPermissions.bind(roleService),
  removePermissionFromRole: roleService.removePermission.bind(roleService),

  // Audit logs endpoints
  getAuditLogs: auditService.getAll.bind(auditService),
  getAuditLogsByUser: auditService.getByUser.bind(auditService),
  getAuditLogsByResource: auditService.getByResource.bind(auditService),
  getAuditLogsByAction: auditService.getByAction.bind(auditService),
};

export {
  api,
  httpClient,
  authService,
  userService,
  roleService,
  permissionService,
  auditService,
};
