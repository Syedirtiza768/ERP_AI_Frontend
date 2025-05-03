"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { permissionService } from "@/lib";
import { Plus, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast-context";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Spinner } from "@/components/ui/spinner";

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchPermissions = async () => {
    try {
      const data = await permissionService.getAll();
      setPermissions(data);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
      // For demo purposes, set some sample data
      setPermissions([
        {
          id: "1",
          name: "Create User",
          description: "Ability to create new users",
          resource: "users",
          action: "create",
        },
        {
          id: "2",
          name: "Edit User",
          description: "Ability to edit existing users",
          resource: "users",
          action: "update",
        },
        {
          id: "3",
          name: "Delete User",
          description: "Ability to delete users",
          resource: "users",
          action: "delete",
        },
        {
          id: "4",
          name: "View Roles",
          description: "Ability to view roles",
          resource: "roles",
          action: "read",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleDeletePermission = async (permissionId: string) => {
    try {
      await permissionService.delete(permissionId);
      toast({
        title: "Permission deleted",
        description: "The permission has been deleted successfully.",
        variant: "success",
      });
      // Refresh the permission list
      fetchPermissions();
    } catch (error) {
      console.error("Failed to delete permission:", error);
      toast({
        title: "Error",
        description: "Failed to delete permission",
        variant: "destructive",
      });
    }
  };

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
      key: "resource",
      title: "Resource",
      render: (permission: Permission) => (
        <Badge variant="outline">{permission.resource}</Badge>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (permission: Permission) => {
        const actionColors: Record<string, string> = {
          create: "bg-green-100 text-green-800",
          read: "bg-blue-100 text-blue-800",
          update: "bg-amber-100 text-amber-800",
          delete: "bg-red-100 text-red-800",
        };

        return (
          <Badge
            className={actionColors[permission.action] || ""}
            variant="outline"
          >
            {permission.action}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (permission: Permission) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/permissions/edit/${permission.id}`);
            }}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <ConfirmationDialog
            title="Delete Permission"
            description="Are you sure you want to delete this permission? This action cannot be undone and will remove the permission from all roles."
            onConfirm={() => handleDeletePermission(permission.id)}
            variant="ghost"
            size="icon"
            icon={true}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description="Manage system permissions"
        actions={
          <Button onClick={() => router.push("/permissions/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Permission
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <DataTable
          data={permissions}
          columns={columns}
          searchField="name"
          onRowClick={(permission) =>
            router.push(`/permissions/${permission.id}`)
          }
        />
      )}
    </div>
  );
}
