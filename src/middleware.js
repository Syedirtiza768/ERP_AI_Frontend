import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/users",
  "/roles",
  "/permissions",
  "/audit-logs",
];

export default withAuth(
  // The function is called only if authorized returns true
  function middleware(req) {
    // At this point, the user is authenticated
    // Additional middleware logic can go here

    // For example, redirect authenticated users away from login page
    if (req.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // The authorized callback determines if the request is authorized
      authorized: ({ token, req }) => {
        // Is this a protected route?
        const isProtectedRoute = protectedRoutes.some((route) =>
          req.nextUrl.pathname.startsWith(route)
        );

        // If it's a protected route, only allow with valid token
        if (isProtectedRoute) {
          return !!token; // Return true only if token exists, false will trigger redirect
        }

        // For non-protected routes, always authorize
        return true;
      },
    },
    pages: {
      // Where to redirect if unauthorized (when authorized returns false)
      signIn: "/login",
    },
  }
);

// Configure which routes this middleware applies to
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
