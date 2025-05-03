// src/app/layout.jsx - Update to remove redundant AuthProvider
import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/main-layout";
import { Toaster } from "@/components/ui/toast-context";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing users, roles, and permissions",
  generator: "v0.dev",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MainLayout>{children}</MainLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
