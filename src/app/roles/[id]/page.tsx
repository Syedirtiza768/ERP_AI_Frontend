"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api-service"
import { Pencil, Shield } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/components/ui/toast-context"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Spinner } from "@/components/ui/spinner"

interface Role {
  id: string
  name: string
  description: string
  permissions: {
    id: string
    name: string
    resource: string
    action: string
  }[]
  users: {
    id: string
    username: string
  }[]
}

export default function RoleDetailPage({ params }: { params: { id: string } }) {
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const data = await api.get<Role>(`/roles/${id}`)
        setRole(data)
      } catch (error) {
        console.error("Failed to fetch role:", error)
        toast({
          title: "Error",
          description: "Failed to load role data",
          variant: "destructive",
        })
        // For demo purposes
        setRole({
          id,
          name: "Admin",
          description: "Full system access",
          permissions: [
            { id: "1", name: "Create User", resource: "users", action: "create" },
            { id: "2", name: "Edit User", resource: "users", action: "update" },
            { id: "3", name: "Delete User", resource: "users", action: "delete" },
          ],
          users: [
            { id: "1", username: "admin" },
            { id: "2", username: "john_doe" },
          ],
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRole()
  }, [id, toast])

  const handleDelete = async () => {
    try {
      await api.delete(`/roles/${id}`)
      toast({
        title: "Role deleted",
        description: "The role has been deleted successfully.",
        variant: "success",
      })
      router.push("/roles")
    } catch (error) {
      console.error("Failed to delete role:", error)
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!role) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p>Role not found</p>
      </div>
    )
  }

  // Group permissions by resource
  const groupedPermissions: Record<string, typeof role.permissions> = {}
  role.permissions.forEach((permission) => {
    if (!groupedPermissions[permission.resource]) {
      groupedPermissions[permission.resource] = []
    }
    groupedPermissions[permission.resource].push(permission)
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.name}
        description={role.description}
        backButton
        actions={
          <>
            <Button variant="outline" onClick={() => router.push(`/roles/edit/${id}`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <ConfirmationDialog
              title="Delete Role"
              description="Are you sure you want to delete this role? This action cannot be undone and will remove the role from all users."
              onConfirm={handleDelete}
              triggerText="Delete Role"
            />
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>Permissions assigned to this role</CardDescription>
            </div>
            <Button size="sm" onClick={() => router.push(`/roles/${id}/assign-permissions`)}>
              <Shield className="mr-2 h-4 w-4" />
              Manage Permissions
            </Button>
          </CardHeader>
          <CardContent>
            {role.permissions.length === 0 ? (
              <p className="text-muted-foreground">No permissions assigned</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                  <div key={resource} className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      <Badge variant="outline">{resource}</Badge>
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="rounded-md border p-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{permission.name}</p>
                            <Badge
                              variant="outline"
                              className={
                                permission.action === "create"
                                  ? "bg-green-100 text-green-800"
                                  : permission.action === "read"
                                    ? "bg-blue-100 text-blue-800"
                                    : permission.action === "update"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-800"
                              }
                            >
                              {permission.action}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Users with this role</CardDescription>
          </CardHeader>
          <CardContent>
            {role.users.length === 0 ? (
              <p className="text-muted-foreground">No users have this role</p>
            ) : (
              <div className="space-y-2">
                {role.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-md border p-3">
                    <p>{user.username}</p>
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/users/${user.id}`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
