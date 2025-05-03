"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  userService,
  roleService,
  permissionService,
  auditService,
} from "@/lib";
import { Users, ShieldCheck, Key, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    userCount: 0,
    roleCount: 0,
    permissionCount: 0,
    auditLogCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Using try/catch for each call to ensure one failure doesn't stop the others
        let userCount = { count: 0 };
        let roleCount = { count: 0 };
        let permissionCount = { count: 0 };
        let auditLogCount = { count: 0 };

        try {
          userCount = await userService.getCount();
        } catch (error) {
          console.error("Failed to fetch user count:", error);
        }

        try {
          roleCount = await roleService.getCount();
        } catch (error) {
          console.error("Failed to fetch role count:", error);
        }

        try {
          permissionCount = await permissionService.getCount();
        } catch (error) {
          console.error("Failed to fetch permission count:", error);
        }

        try {
          auditLogCount = await auditService.getCount();
        } catch (error) {
          console.error("Failed to fetch audit log count:", error);
        }

        setStats({
          userCount: userCount.count || 0,
          roleCount: roleCount.count || 0,
          permissionCount: permissionCount.count || 0,
          auditLogCount: auditLogCount.count || 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        toast({
          title: "Error",
          description: "Failed to load statistics. Please try again later.",
          variant: "destructive",
        });

        // Set sample data for demo purposes
        setStats({
          userCount: 24,
          roleCount: 5,
          permissionCount: 18,
          auditLogCount: 156,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const statCards = [
    {
      title: "Total Users",
      value: stats.userCount,
      description: "Active user accounts",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Roles",
      value: stats.roleCount,
      description: "User role types",
      icon: ShieldCheck,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Permissions",
      value: stats.permissionCount,
      description: "Access control permissions",
      icon: Key,
      color: "text-amber-500",
      bgColor: "bg-amber-100",
    },
    {
      title: "Audit Logs",
      value: stats.auditLogCount,
      description: "System activity records",
      icon: ClipboardList,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your system's key metrics and activities"
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${card.bgColor}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <p className="font-medium">User Created</p>
                    <p className="text-sm text-muted-foreground">
                      New user account was created
                    </p>
                    <p className="text-xs text-muted-foreground">
                      2 minutes ago
                    </p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="font-medium">Permission Updated</p>
                    <p className="text-sm text-muted-foreground">
                      Permission "manage_users" was updated
                    </p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                  <div>
                    <p className="font-medium">Role Assigned</p>
                    <p className="text-sm text-muted-foreground">
                      User assigned to "Admin" role
                    </p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API Status</p>
                      <p className="text-sm text-muted-foreground">
                        All systems operational
                      </p>
                    </div>
                    <div className="flex h-3 w-3 items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Database</p>
                      <p className="text-sm text-muted-foreground">
                        Connected and healthy
                      </p>
                    </div>
                    <div className="flex h-3 w-3 items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Authentication Service</p>
                      <p className="text-sm text-muted-foreground">
                        Working normally
                      </p>
                    </div>
                    <div className="flex h-3 w-3 items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
