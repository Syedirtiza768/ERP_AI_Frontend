"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { userService } from "@/lib";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast-context";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Spinner } from "@/components/ui/spinner";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAll();
      const formattedData = data.map((user) => ({
        ...user,
        roles: Array.isArray(user.roles) ? user.roles : [],
      }));
      setUsers(formattedData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
      setUsers([
        {
          id: "1",
          username: "admin",
          email: "admin@example.com",
          isActive: true,
          createdAt: new Date().toISOString(),
          roles: ["Admin"],
        },
        {
          id: "2",
          username: "user1",
          email: "user1@example.com",
          isActive: true,
          createdAt: new Date().toISOString(),
          roles: ["Editor"],
        },
        {
          id: "3",
          username: "user2",
          email: "user2@example.com",
          isActive: false,
          createdAt: new Date().toISOString(),
          roles: ["Viewer"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      await userService.delete(userId);
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
        variant: "success",
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "username",
      title: "Username",
    },
    {
      key: "email",
      title: "Email",
    },
    {
      key: "roles",
      title: "Roles",
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles?.length > 0 ? (
            user.roles.map((role, index) => (
              <Badge key={index} variant="outline">
                {typeof role === "string" ? role : role.name || "Unknown"}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No roles</span>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      render: (user) => (
        <Badge variant={user.isActive ? "success" : "destructive"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Created At",
      render: (user) => {
        try {
          return format(new Date(user.createdAt), "PPP");
        } catch {
          return "Invalid date";
        }
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (user) => (
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/users/edit/${user.id}`);
            }}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <ConfirmationDialog
            title="Delete User"
            description={`Are you sure you want to delete ${user.username}? This action cannot be undone.`}
            onConfirm={() => handleDeleteUser(user.id)}
            triggerText=""
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
        title="Users"
        description="Manage user accounts and permissions"
        actions={
          <Button onClick={() => router.push("/users/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          searchField="username"
          onRowClick={(user) => router.push(`/users/${user.id}`)}
          emptyMessage="No users found"
        />
      )}
    </div>
  );
}
