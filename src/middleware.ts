import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
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
          if (!token) {
            // Redirect to login if not authenticated
            const redirectUrl = new URL("/api/auth/login", req.url);
            redirectUrl.searchParams.set("post_login_redirect_url", pathname);
            return false;
          }
          return true;
        }

        // Allow access to all other paths
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/configure/:path*", "/thank-you/:path*", "/api/auth/:path*"],
};
