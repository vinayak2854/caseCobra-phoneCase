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
      authorized: ({
        req,
        token,
      }: {
        req: NextRequest;
        token?: string | null;
      }) => {
        const pathname = req.nextUrl.pathname;
        // Allow all auth-related paths
        if (pathname.startsWith("/api/auth")) {
          return true;
        }
        // Check if the path is protected
        if (protectedPaths.some((path) => pathname.startsWith(path))) {
          // Return true if authenticated, false otherwise
          return !!token;
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
