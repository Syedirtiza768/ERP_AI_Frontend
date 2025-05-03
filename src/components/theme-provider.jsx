"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, session, ...props }) {
  return (
    <NextThemesProvider {...props}>
      <SessionProvider session={session}>{children}</SessionProvider>
    </NextThemesProvider>
  );
}
