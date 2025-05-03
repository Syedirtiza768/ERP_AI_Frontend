// src/components/layout/main-layout.jsx - Simplify to use only NextAuth
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { useSession } from "next-auth/react";

export function MainLayout({ children }) {
  const [isMounted, setIsMounted] = useState(false);
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle authentication for protected routes
  useEffect(() => {
    if (isMounted && status === "unauthenticated") {
      const protectedRoutes = [
        "/dashboard",
        "/users",
        "/roles",
        "/permissions",
        "/audit-logs",
      ];

      const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (isProtected) {
        router.push("/login");
      }
    }
  }, [isMounted, status, pathname, router]);

  // Don't render until auth is determined
  if (!isMounted || status === "loading") return null;

  // Special case for login page
  if (pathname === "/login") return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {pathname !== "/login" && <Sidebar />}
      <div className="flex flex-1 flex-col overflow-hidden">
        {pathname !== "/login" && <Navbar />}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
