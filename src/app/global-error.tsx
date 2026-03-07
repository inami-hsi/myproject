"use client"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ja">
      <body className="min-h-dvh font-body antialiased">
        <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
          <h1 className="font-heading text-6xl font-bold tracking-tight">500</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            サーバーエラーが発生しました
          </p>
          <button
            onClick={() => reset()}
            className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 font-heading text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            もう一度試す
          </button>
        </div>
      </body>
    </html>
  )
}
