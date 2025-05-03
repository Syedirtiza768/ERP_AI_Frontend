"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"
import { useAuth } from "@/lib/auth-context"

export function MainLayout({ children }) {
  const [isMounted, setIsMounted] = useState(false)
  const { token } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render the layout on the login page
  if (!isMounted) return null
  if (pathname === "/login") return <>{children}</>
  if (!token) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
