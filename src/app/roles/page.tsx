"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { api } from "@/lib/api-service"
import { Plus, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/components/ui/toast-context"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Spinner } from "@/components/ui/spinner"

interface Role {
  id: string
  name: string
  description: string
  permissionCount: number
  userCount: number
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const fetchRoles = async () => {
    try {
      const data = await api.get<Role[]>("/roles")
      setRoles(data)
    } catch (error) {
      console.error("Failed to fetch roles:", error)
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      })
      // For demo purposes, set some sample data
      setRoles([
        {
          id: "1",
          name: "Admin",
          description: "Full system access",
          permissionCount: 18,
          userCount: 2,
        },
        {
          id: "2",
          name: "Editor",
          description: "Can edit content",
          permissionCount: 10,
          userCount: 5,
        },
        {
          id: "3",
          name: "Viewer",
          description: "Read-only access",
          permissionCount: 4,
          userCount: 12,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleDeleteRole = async (roleId: string) => {
    try {
      await api.delete(`/roles/${roleId}`)
      toast({
        title: "Role deleted",
        description: "The role has been deleted successfully.",
        variant: "success",
      })
      // Refresh the role list
      fetchRoles()
    } catch (error) {
      console.error("Failed to delete role:", error)
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      })
    }
  }

  const columns = [
    {
      key: "name",
      title: "Name",
    },
    {
      key: "description",
      title: "Description",
    },
    {
      key: "permissionCount",
      title: "Permissions",
      render: (role: Role) => <Badge variant="secondary">{role.permissionCount}</Badge>,
    },
    {
      key: "userCount",
      title: "Users",
      render: (role: Role) => <Badge variant="secondary">{role.userCount}</Badge>,
    },
    {
      key: "actions",
      title: "Actions",
      render: (role: Role) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/roles/edit/${role.id}`)
            }}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <ConfirmationDialog
            title="Delete Role"
            description="Are you sure you want to delete this role? This action cannot be undone and will remove the role from all users."
            onConfirm={() => handleDeleteRole(role.id)}
            variant="ghost"
            size="icon"
            icon={true}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Manage user roles and their permissions"
        actions={
          <Button onClick={() => router.push("/roles/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <DataTable
          data={roles}
          columns={columns}
          searchField="name"
          onRowClick={(role) => router.push(`/roles/${role.id}`)}
        />
      )}
    </div>
  )
}
