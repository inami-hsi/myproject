import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOrCreateDemoUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getOrCreateDemoUser();
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name } });
  } catch (error) {
    console.error("Demo login failed:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
