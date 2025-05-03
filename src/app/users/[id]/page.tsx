"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { userService } from "@/lib";
import { format } from "date-fns";
import { Pencil, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast-context";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Spinner } from "@/components/ui/spinner";

interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: {
    id: string;
    name: string;
  }[];
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getById(id);
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
        // For demo purposes
        setUser({
          id,
          username: "john_doe",
          email: "john@example.com",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          roles: [
            { id: "1", name: "Admin" },
            { id: "2", name: "Editor" },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, toast]);

  const handleDelete = async () => {
    try {
      await userService.delete(id);
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
        variant: "success",
      });
      router.push("/users");
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.username}
        description={user.email}
        backButton
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => router.push(`/users/edit/${id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <ConfirmationDialog
              title="Delete User"
              description="Are you sure you want to delete this user? This action cannot be undone and will permanently delete the user account and all associated data."
              onConfirm={handleDelete}
              triggerText="Delete User"
            />
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic user account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Username
                </p>
                <p>{user.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <Badge variant={user.isActive ? "success" : "destructive"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created
                </p>
                <p>{format(new Date(user.createdAt), "PPP")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Roles</CardTitle>
              <CardDescription>User's assigned roles</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => router.push(`/users/${id}/assign-role`)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Role
            </Button>
          </CardHeader>
          <CardContent>
            {user.roles.length === 0 ? (
              <p className="text-muted-foreground">No roles assigned</p>
            ) : (
              <div className="space-y-2">
                {user.roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="font-medium">{role.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/roles/${role.id}`)}
                    >
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
  );
}
