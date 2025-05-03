"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { api } from "@/lib/api-service"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/components/ui/toast-context"
import { Spinner } from "@/components/ui/spinner"

interface AuditLog {
  id: string
  action: string
  resource: string
  resourceId: string
  userId: string
  username: string
  timestamp: string
  details: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.get<AuditLog[]>("/audit-logs")
        setLogs(data)
      } catch (error) {
        console.error("Failed to fetch audit logs:", error)
        toast({
          title: "Error",
          description: "Failed to load audit logs",
          variant: "destructive",
        })
        // For demo purposes, set some sample data
        setLogs([
          {
            id: "1",
            action: "create",
            resource: "users",
            resourceId: "123",
            userId: "456",
            username: "admin",
            timestamp: new Date().toISOString(),
            details: "Created new user 'john_doe'",
          },
          {
            id: "2",
            action: "update",
            resource: "roles",
            resourceId: "789",
            userId: "456",
            username: "admin",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            details: "Updated role 'Editor'",
          },
          {
            id: "3",
            action: "delete",
            resource: "permissions",
            resourceId: "101",
            userId: "456",
            username: "admin",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            details: "Deleted permission 'delete_users'",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [toast])

  const columns = [
    {
      key: "timestamp",
      title: "Timestamp",
      render: (log: AuditLog) => format(new Date(log.timestamp), "PPpp"),
    },
    {
      key: "username",
      title: "User",
    },
    {
      key: "action",
      title: "Action",
      render: (log: AuditLog) => {
        const actionColors: Record<string, string> = {
          create: "bg-green-100 text-green-800",
          read: "bg-blue-100 text-blue-800",
          update: "bg-amber-100 text-amber-800",
          delete: "bg-red-100 text-red-800",
        }

        return (
          <Badge className={actionColors[log.action] || ""} variant="outline">
            {log.action}
          </Badge>
        )
      },
    },
    {
      key: "resource",
      title: "Resource",
      render: (log: AuditLog) => <Badge variant="outline">{log.resource}</Badge>,
    },
    {
      key: "details",
      title: "Details",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="View system activity and changes" />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <DataTable data={logs} columns={columns} searchField="details" />
      )}
    </div>
  )
}
