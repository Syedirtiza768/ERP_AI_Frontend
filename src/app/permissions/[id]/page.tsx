"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api-service"
import { Pencil } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/components/ui/toast-context"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Spinner } from "@/components/ui/spinner"

interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  roles: {
    id: string
    name: string
  }[]
}

export default function PermissionDetailPage({ params }: { params: { id: string } }) {
  const [permission, setPermission] = useState<Permission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params

  useEffect(() => {
    const fetchPermission = async () => {
      try {
        const data = await api.get<Permission>(`/permissions/${id}`)
        setPermission(data)
      } catch (error) {
        console.error("Failed to fetch permission:", error)
        toast({
          title: "Error",
          description: "Failed to load permission data",
          variant: "destructive",
        })
        // For demo purposes
        setPermission({
          id,
          name: "Create User",
          description: "Ability to create new users",
          resource: "users",
          action: "create",
          roles: [
            { id: "1", name: "Admin" },
            { id: "2", name: "Editor" },
          ],
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPermission()
  }, [id, toast])

  const handleDelete = async () => {
    try {
      await api.delete(`/permissions/${id}`)
      toast({
        title: "Permission deleted",
        description: "The permission has been deleted successfully.",
        variant: "success",
      })
      router.push("/permissions")
    } catch (error) {
      console.error("Failed to delete permission:", error)
      toast({
        title: "Error",
        description: "Failed to delete permission",
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

  if (!permission) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p>Permission not found</p>
      </div>
    )
  }

  const actionColors: Record<string, string> = {
    create: "bg-green-100 text-green-800",
    read: "bg-blue-100 text-blue-800",
    update: "bg-amber-100 text-amber-800",
    delete: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={permission.name}
        description={permission.description}
        backButton
        actions={
          <>
            <Button variant="outline" onClick={() => router.push(`/permissions/edit/${id}`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <ConfirmationDialog
              title="Delete Permission"
              description="Are you sure you want to delete this permission? This action cannot be undone and will remove the permission from all roles."
              onConfirm={handleDelete}
              triggerText="Delete Permission"
            />
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Permission Details</CardTitle>
            <CardDescription>Information about this permission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resource</p>
                <Badge variant="outline">{permission.resource}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Action</p>
                <Badge className={actionColors[permission.action] || ""} variant="outline">
                  {permission.action}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p>{permission.description || "No description provided"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>Roles with this permission</CardDescription>
          </CardHeader>
          <CardContent>
            {permission.roles.length === 0 ? (
              <p className="text-muted-foreground">No roles have this permission</p>
            ) : (
              <div className="space-y-2">
                {permission.roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between rounded-md border p-3">
                    <p>{role.name}</p>
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/roles/${role.id}`)}>
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
