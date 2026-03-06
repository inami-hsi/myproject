import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-background p-4">
      <h1 className="text-2xl font-heading font-bold mb-6">プロフィール編集</h1>
      <ProfileForm />
    </div>
  );
}
