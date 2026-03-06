import { NextResponse } from "next/server";
import { getCurrentUser, updateUserProfile, UserProfileData } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    plan: user.plan,
    status: user.status,
    monthly_download_count: user.monthly_download_count,
    created_at: user.created_at,
    updated_at: user.updated_at,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const data: UserProfileData = await request.json();
  try {
    await updateUserProfile(user.id, data);
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Profile update failed", error);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}
