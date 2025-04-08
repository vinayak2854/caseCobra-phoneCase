"use server";

import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export const getAuthStatus = async () => {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id || !user.email) {
      console.error("Invalid user data:", user);
      redirect("/api/auth/login");
    }

    const existingUser = await db.user.findFirst({
      where: { id: user.id },
    });

    if (!existingUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Auth error:", error);
    redirect("/api/auth/login");
  }
};
