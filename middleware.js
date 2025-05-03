import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ req, token }) => {
      // Only check for auth on protected routes
      const path = req.nextUrl.pathname;
      const isProtectedRoute = [
        "/dashboard",
        "/users",
        "/roles",
        "/permissions",
        "/audit-logs",
      ].some((route) => path.startsWith(route));

      return !isProtectedRoute || !!token;
    },
  },
});

// Configure which routes need authentication
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/roles/:path*",
    "/permissions/:path*",
    "/audit-logs/:path*",
  ],
};
