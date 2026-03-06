import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
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
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="font-heading text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              ログイン
            </Link>
            <Link
              href="/search"
              className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 font-heading text-sm font-medium text-background transition-colors duration-200 hover:bg-foreground/90"
            >
              無料で始める
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
