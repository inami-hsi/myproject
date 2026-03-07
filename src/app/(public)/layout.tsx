import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-heading text-lg font-bold tracking-tight"
          >
            企業リスト
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            {userId ? (
              <>
                <Link
                  href="/search"
                  className="font-heading text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  企業検索
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-3 sm:px-4 font-heading text-sm font-medium text-background transition-colors duration-200 hover:bg-foreground/90"
                >
                  ダッシュボード
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-heading text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  ログイン
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-3 sm:px-4 font-heading text-xs sm:text-sm font-medium text-background transition-colors duration-200 hover:bg-foreground/90"
                >
                  無料登録
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} 企業リスト
          </p>
          <nav className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              利用規約
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              料金
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
