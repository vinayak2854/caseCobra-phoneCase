import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import type { NextRequest, NextResponse } from "next/server";

export const GET = handleAuth({
  afterAuth: async (req: NextRequest, res: NextResponse, session: any) => {
    // Handle post-authentication logic here
    return res;
  },
});
