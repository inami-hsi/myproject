'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardUser {
  email: string
  plan: 'free' | 'starter' | 'pro'
  monthly_download_count: number
  download_reset_at: string
  download_limit: number
}

interface RecentDownload {
  id: string
  format: 'csv' | 'xlsx'
  encoding: 'utf8' | 'sjis'
  record_count: number
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'expired'
  created_at: string
}

interface SavedSearch {
  id: string
  name: string
  search_params: Record<string, unknown>
  result_count: number | null
  created_at: string
  updated_at: string
}

interface DashboardData {
  user: DashboardUser
  recent_downloads: RecentDownload[]
  saved_searches: SavedSearch[]
  stats: {
    total_downloads_this_month: number
    total_saved_searches: number
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
}

const PLAN_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  free: 'secondary',
  starter: 'default',
  pro: 'default',
}

const STATUS_LABELS: Record<string, string> = {
  pending: '処理待ち',
  generating: '生成中',
  completed: '完了',
  failed: '失敗',
  expired: '期限切れ',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatNumber(n: number): string {
  return n.toLocaleString('ja-JP')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) {
          throw new Error(res.status === 401 ? 'ログインしてください' : 'データの取得に失敗しました')
        }
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-destructive">{error ?? 'データの取得に失敗しました'}</div>
      </div>
    )
  }

  const { user, recent_downloads, saved_searches, stats } = data
  const usagePercent =
    user.download_limit > 0
      ? Math.min((user.monthly_download_count / user.download_limit) * 100, 100)
      : 0

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 lg:px-6">
      {/* ── Welcome ────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            ダッシュボード
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Badge variant={PLAN_BADGE_VARIANT[user.plan]} className="w-fit">
          {PLAN_LABELS[user.plan]}プラン
        </Badge>
      </div>

      {/* ── Usage card ─────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">今月のダウンロード使用量</CardTitle>
          <CardDescription>
            {formatNumber(user.monthly_download_count)} / {formatNumber(user.download_limit)} 件
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress
            value={usagePercent}
            max={100}
            indicatorClassName={usagePercent >= 90 ? 'bg-destructive' : undefined}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              残り {formatNumber(Math.max(0, user.download_limit - user.monthly_download_count))} 件
            </span>
            <span>
              リセット: {formatDate(user.download_reset_at)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Plan management ─────────────────────── */}
      {user.plan === 'free' ? (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-heading font-semibold">もっと多くの企業リストをダウンロード</p>
              <p className="text-sm text-muted-foreground">
                Starterプランにアップグレードすると月間3,000件までダウンロードできます。
              </p>
            </div>
            <Button asChild>
              <Link href="/pricing">プランをアップグレード</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">プラン管理</CardTitle>
            <CardDescription>
              現在のプラン: {PLAN_LABELS[user.plan]}（月額 {user.plan === 'starter' ? '¥2,980' : '¥9,800'}）
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              disabled={portalLoading}
              onClick={async () => {
                setPortalLoading(true)
                try {
                  const res = await fetch('/api/billing/portal', { method: 'POST' })
                  const data = await res.json()
                  if (data.url) {
                    window.location.href = data.url
                  } else {
                    alert(data.error || 'ポータルの作成に失敗しました')
                  }
                } catch {
                  alert('ポータルの作成に失敗しました')
                } finally {
                  setPortalLoading(false)
                }
              }}
            >
              {portalLoading ? '読み込み中...' : 'プラン変更・解約'}
            </Button>
            {user.plan === 'starter' && (
              <Button asChild variant="default">
                <Link href="/pricing">Proプランにアップグレード</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Stats row ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>今月のダウンロード件数</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold tabular-nums">
              {formatNumber(stats.total_downloads_this_month)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>保存済み検索条件</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold tabular-nums">
              {stats.total_saved_searches}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Saved searches ─────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">保存済み検索条件</CardTitle>
          <CardDescription>クリックして検索を再実行</CardDescription>
        </CardHeader>
        <CardContent>
          {saved_searches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              保存済みの検索条件はまだありません。
              <Link href="/search" className="ml-1 underline hover:text-foreground">
                検索ページへ
              </Link>
            </p>
          ) : (
            <ul className="divide-y">
              {saved_searches.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/search?saved=${s.id}`}
                    className="flex items-center justify-between py-3 text-sm hover:bg-muted/50 -mx-2 px-2 rounded transition-colors duration-200"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {s.result_count !== null ? `${formatNumber(s.result_count)} 件` : '--'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ── Recent downloads ───────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近のダウンロード</CardTitle>
          <CardDescription>直近10件</CardDescription>
        </CardHeader>
        <CardContent>
          {recent_downloads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              ダウンロード履歴はまだありません。
              <Link href="/search" className="ml-1 underline hover:text-foreground">
                検索ページへ
              </Link>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">日時</th>
                    <th className="pb-2 font-medium">形式</th>
                    <th className="pb-2 font-medium text-right">件数</th>
                    <th className="pb-2 font-medium text-right">ステータス</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recent_downloads.map((d) => (
                    <tr key={d.id}>
                      <td className="py-2 tabular-nums">{formatDate(d.created_at)}</td>
                      <td className="py-2 uppercase">{d.format}</td>
                      <td className="py-2 text-right tabular-nums">
                        {formatNumber(d.record_count)}
                      </td>
                      <td className="py-2 text-right">
                        <Badge
                          variant={
                            d.status === 'completed'
                              ? 'default'
                              : d.status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className="text-xs"
                        >
                          {STATUS_LABELS[d.status] ?? d.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
