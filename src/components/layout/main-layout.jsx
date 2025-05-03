// src/components/layout/main-layout.jsx - Simplify to use only NextAuth
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { useSession } from "next-auth/react";

export function MainLayout({ children }) {
  const [isMounted, setIsMounted] = useState(false);
  const { status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render the layout on the login page
  if (!isMounted) return null;
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
