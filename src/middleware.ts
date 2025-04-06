import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/configure/preview",
  "/configure/design",
  "/thank-you",
];

export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req }: { req: NextRequest }) => {
        const pathname = req.nextUrl.pathname;
        // Allow all auth-related paths
        if (pathname.startsWith("/api/auth")) {
          return true;
        }
        // Check if the path is protected
        if (protectedPaths.some((path) => pathname.startsWith(path))) {
          // Return true if authenticated, false otherwise
          return req.auth?.isAuthenticated ?? false;
        }
        // Allow access to all other paths
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/configure/:path*",
    "/thank-you/:path*",
    "/api/auth/:path*",
  ],
};
