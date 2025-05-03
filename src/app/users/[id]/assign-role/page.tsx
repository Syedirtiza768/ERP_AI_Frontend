"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api-service"

interface Role {
  id: string
  name: string
}

interface User {
  id: string
  username: string
  email: string
}

export default function AssignRolePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, rolesData] = await Promise.all([api.get<User>(`/users/${id}`), api.get<Role[]>("/roles")])
        setUser(userData)
        setRoles(rolesData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setError("Failed to load data")
        // For demo purposes
        setUser({
          id,
          username: "john_doe",
          email: "john@example.com",
        })
        setRoles([
          { id: "1", name: "Admin" },
          { id: "2", name: "Editor" },
          { id: "3", name: "Viewer" },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    if (!selectedRoleId) {
      setError("Please select a role")
      setIsSaving(false)
      return
    }

    try {
      await api.post("/user-roles", {
        userId: id,
        roleId: selectedRoleId,
      })
      router.push(`/users/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign role")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div>Loading data...</div>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Assign Role</h1>
        <p className="text-muted-foreground">Assign a role to user: {user?.username}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Assignment</CardTitle>
          <CardDescription>Select a role to assign to this user</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleId">Role</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger id="roleId">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Assigning..." : "Assign Role"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
