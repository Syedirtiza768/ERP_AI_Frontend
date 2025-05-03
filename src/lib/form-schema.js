import { z } from "zod"

// User form schemas
export const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
})

// Role form schemas
export const roleFormSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().optional(),
})

// Permission form schemas
export const permissionFormSchema = z.object({
  name: z.string().min(2, "Permission name must be at least 2 characters"),
  description: z.string().optional(),
  resource: z.string().min(1, "Resource is required"),
  action: z.string().min(1, "Action is required"),
})

// Role assignment schema
export const roleAssignmentSchema = z.object({
  roleId: z.string().min(1, "Please select a role"),
})

// Permission assignment schema
export const permissionAssignmentSchema = z.object({
  permissionIds: z.array(z.string()).min(1, "Select at least one permission"),
})
