import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-6">
            <Link href="/search" className="font-heading text-lg font-bold tracking-tight">
              企業リスト
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                検索
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                ダッシュボード
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                料金
              </Link>
            </nav>
          </div>
          <UserButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
