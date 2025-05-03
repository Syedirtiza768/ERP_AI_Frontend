"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api-service"
import { Badge } from "@/components/ui/badge"

interface Permission {
  id: string
  name: string
  resource: string
  action: string
}

interface Role {
  id: string
  name: string
}

export default function AssignPermissionsPage({ params }: { params: { id: string } }) {
  const [role, setRole] = useState<Role | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roleData, permissionsData, rolePermissionsData] = await Promise.all([
          api.get<Role>(`/roles/${id}`),
          api.get<Permission[]>("/permissions"),
          api.get<{ permissionId: string }[]>(`/roles/${id}/permissions`),
        ])
        setRole(roleData)
        setPermissions(permissionsData)
        setSelectedPermissions(rolePermissionsData.map((rp) => rp.permissionId))
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setError("Failed to load data")
        // For demo purposes
        setRole({
          id,
          name: "Admin",
        })
        setPermissions([
          { id: "1", name: "Create User", resource: "users", action: "create" },
          { id: "2", name: "Edit User", resource: "users", action: "update" },
          { id: "3", name: "Delete User", resource: "users", action: "delete" },
          { id: "4", name: "View Roles", resource: "roles", action: "read" },
        ])
        setSelectedPermissions(["1", "2"])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      await api.post("/role-permissions", {
        roleId: id,
        permissionIds: selectedPermissions,
      })
      router.push(`/roles/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign permissions")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div>Loading data...</div>
  }

  // Group permissions by resource
  const groupedPermissions: Record<string, Permission[]> = {}
  permissions.forEach((permission) => {
    if (!groupedPermissions[permission.resource]) {
      groupedPermissions[permission.resource] = []
    }
    groupedPermissions[permission.resource].push(permission)
  })

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Assign Permissions</h1>
        <p className="text-muted-foreground">Assign permissions to role: {role?.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Assignment</CardTitle>
          <CardDescription>Select permissions to assign to this role</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource} className="space-y-4">
                <div className="flex items-center">
                  <Badge variant="outline" className="text-sm">
                    {resource}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {perms.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <div className="grid gap-1">
                        <Label
                          htmlFor={permission.id}
                          className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{permission.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Permissions"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
