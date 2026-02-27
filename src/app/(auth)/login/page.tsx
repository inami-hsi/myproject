"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckSquare, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/demo", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/dashboard");
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Branding */}
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <CheckSquare className="h-5 w-5 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold font-heading tracking-tight">
              TaskFlow
            </h1>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            集中するチームのための穏やかな生産性ツール
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl">おかえりなさい</CardTitle>
            <CardDescription>
              ワークスペースにサインインしてください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Demo Login Button */}
            <Button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              size="lg"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckSquare className="mr-2 h-4 w-4" />
              )}
              デモユーザーでログイン
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  CC-Auth連携は近日公開
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              これはデモ環境です。データは定期的にリセットされる場合があります。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
