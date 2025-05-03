// src/lib/auth-context.jsx - Replace with NextAuth wrapper
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AuthProvider({ children }) {
  return children;
}

export function useAuth() {
  const { data: session } = useSession();
  const router = useRouter();

  return {
    user: session?.user,
    token: session?.accessToken,
    login: () => {
      // NextAuth handles login via its own flow
      router.push("/login");
    },
    logout: () => {
      signOut({ callbackUrl: "/login" });
    },
  };
}
