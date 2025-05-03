import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // ✅ Redirect authenticated users away from login page
    if (pathname === "/login" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // ✅ These routes require authentication
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

        // 🚫 Block access to protected routes without token
        if (isProtected && !token) {
          return false;
        }

        return true; // allow everything else
      },
    },
    pages: {
      signIn: "/login", // where to redirect if unauthorized
    },
  }
);

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/users/:path*",
    "/roles/:path*",
    "/permissions/:path*",
    "/audit-logs/:path*",
  ],
};
