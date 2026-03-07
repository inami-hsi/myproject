import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <h1 className="font-heading text-6xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        ページが見つかりませんでした
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 font-heading text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        トップページへ戻る
      </Link>
    </div>
  )
}
