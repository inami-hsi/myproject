import { NextResponse } from "next/server";
import { getCurrentUser, updateUserProfile, UserProfileData } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // return only profile-related fields
  const {
    age,
    gender,
    phone,
    occupation,
    childrenCount,
    hasSpouse,
    prefecture,
    hasExistingInsurance,
  } = user;

  return NextResponse.json({
    age,
    gender,
    phone,
    occupation,
    children: childrenCount,
    spouse: hasSpouse,
    prefecture,
    existingInsurance: hasExistingInsurance,
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
