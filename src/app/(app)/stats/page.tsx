'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PrefectureStat {
  prefecture_code: string
  prefecture_name: string
  region: string
  total_companies: number
  with_website: number
  avg_capital: number | null
  avg_employees: number | null
}

interface RegionStat {
  name: string
  total_companies: number
  with_website: number
  prefecture_count: number
}

interface RegionData {
  prefectures: PrefectureStat[]
  regions: RegionStat[]
  total: number
}

interface IndustryStat {
  code: string
  name: string
  company_count: number
  percentage: number
}

interface IndustryData {
  industries: IndustryStat[]
  total: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Region color map for the heatmap badges */
const REGION_COLORS: Record<string, string> = {
  '北海道': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  '東北': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  '関東': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  '中部': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  '近畿': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  '中国': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  '四国': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  '九州沖縄': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  return n.toLocaleString('ja-JP')
}

function formatCompact(n: number): string {
  if (n >= 10000) {
    return `${(n / 10000).toFixed(1)}万`
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}千`
  }
  return n.toString()
}

/**
 * Returns a CSS intensity class (background opacity) based on a value
 * relative to the max value. Used for the prefecture heatmap.
 */
function getHeatIntensity(value: number, maxValue: number): string {
  if (maxValue === 0) return 'bg-muted'
  const ratio = value / maxValue
  if (ratio >= 0.8) return 'bg-[#e07a5f] text-white'
  if (ratio >= 0.6) return 'bg-[#e07a5f]/80 text-white'
  if (ratio >= 0.4) return 'bg-[#e07a5f]/60 text-white'
  if (ratio >= 0.2) return 'bg-[#e07a5f]/40 text-foreground'
  if (ratio > 0.05) return 'bg-[#e07a5f]/20 text-foreground'
  return 'bg-[#e07a5f]/10 text-foreground'
}

/**
 * Returns a bar width percentage string for the CSS bar chart.
 */
function getBarWidth(value: number, maxValue: number): string {
  if (maxValue === 0) return '0%'
  return `${Math.max(2, (value / maxValue) * 100)}%`
}

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function StatsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 lg:px-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-3">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Region cards skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-md border p-4 space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-6 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
          {Array.from({ length: 47 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-6 flex-1 animate-pulse rounded bg-muted" style={{ maxWidth: `${80 - i * 6}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StatsPage() {
  const [regionData, setRegionData] = useState<RegionData | null>(null)
  const [industryData, setIndustryData] = useState<IndustryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [regionsRes, industriesRes] = await Promise.all([
          fetch('/api/stats/regions'),
          fetch('/api/stats/industries'),
        ])

        if (!regionsRes.ok || !industriesRes.ok) {
          if (regionsRes.status === 401 || industriesRes.status === 401) {
            throw new Error('ログインしてください')
          }
          throw new Error('統計データの取得に失敗しました')
        }

        const [regionsJson, industriesJson] = await Promise.all([
          regionsRes.json(),
          industriesRes.json(),
        ])

        setRegionData(regionsJson)
        setIndustryData(industriesJson)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <StatsSkeleton />
  }

  if (error || !regionData || !industryData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive">{error ?? '統計データの取得に失敗しました'}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  const { prefectures, regions, total } = regionData
  const { industries } = industryData

  const maxPrefCompanies = Math.max(...prefectures.map((p) => p.total_companies), 1)
  const maxIndustryCount = industries.length > 0 ? industries[0].company_count : 1
  const maxRegionCompanies = Math.max(...regions.map((r) => r.total_companies), 1)

  const totalWithWebsite = prefectures.reduce((sum, p) => sum + p.with_website, 0)
  const websiteRate = total > 0 ? Math.round((totalWithWebsite / total) * 1000) / 10 : 0

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 lg:px-6">
      {/* ── Header ──────────────────────────────────── */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          地域統計ダッシュボード
        </h1>
        <p className="text-sm text-muted-foreground">
          都道府県別・業種別の企業データ統計
        </p>
      </div>

      {/* ── Summary cards ───────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>総企業数</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold font-mono tabular-nums">
              {formatNumber(total)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">社</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ウェブサイト保有率</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold font-mono tabular-nums">
              {websiteRate}
              <span className="text-lg ml-0.5">%</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(totalWithWebsite)} 社がウェブサイトあり
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>業種カテゴリ数</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold font-mono tabular-nums">
              {industries.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">大分類</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Region summary cards ────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">地域別企業数</CardTitle>
          <CardDescription>8地域の企業数と構成比</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {regions.map((region) => {
              const pct = total > 0 ? Math.round((region.total_companies / total) * 1000) / 10 : 0
              return (
                <div
                  key={region.name}
                  className="relative overflow-hidden rounded-md border p-4"
                >
                  {/* Background bar */}
                  <div
                    className="absolute inset-y-0 left-0 bg-[#e07a5f]/10 transition-all duration-500"
                    style={{ width: getBarWidth(region.total_companies, maxRegionCompanies) }}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className={REGION_COLORS[region.name] ?? ''}>
                        {region.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono tabular-nums">
                        {pct}%
                      </span>
                    </div>
                    <p className="font-heading text-xl font-bold font-mono tabular-nums">
                      {formatCompact(region.total_companies)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {region.prefecture_count}都道府県 / WEB {formatNumber(region.with_website)}社
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Prefecture heatmap ──────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">都道府県別ヒートマップ</CardTitle>
          <CardDescription>
            企業数の多い都道府県ほど濃い色で表示
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <span>少</span>
            <div className="flex gap-0.5">
              <div className="h-3 w-6 rounded-sm bg-[#e07a5f]/10" />
              <div className="h-3 w-6 rounded-sm bg-[#e07a5f]/20" />
              <div className="h-3 w-6 rounded-sm bg-[#e07a5f]/40" />
              <div className="h-3 w-6 rounded-sm bg-[#e07a5f]/60" />
              <div className="h-3 w-6 rounded-sm bg-[#e07a5f]/80" />
              <div className="h-3 w-6 rounded-sm bg-[#e07a5f]" />
            </div>
            <span>多</span>
          </div>

          {/* Grouped by region */}
          <div className="space-y-4">
            {regions.map((region) => {
              const regionPrefs = prefectures.filter((p) => p.region === region.name)
              if (regionPrefs.length === 0) return null
              return (
                <div key={region.name}>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    {region.name}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {regionPrefs.map((pref) => (
                      <div
                        key={pref.prefecture_code}
                        className={`
                          group relative rounded-md px-2 py-1.5 text-center
                          transition-all duration-200 hover:scale-105 cursor-default
                          ${getHeatIntensity(pref.total_companies, maxPrefCompanies)}
                        `}
                        title={`${pref.prefecture_name}: ${formatNumber(pref.total_companies)}社`}
                      >
                        <span className="text-xs font-medium whitespace-nowrap">
                          {pref.prefecture_name.replace(/県|府|都/, '')}
                        </span>
                        <span className="block text-[10px] font-mono tabular-nums leading-tight opacity-80">
                          {formatCompact(pref.total_companies)}
                        </span>
                        {/* Tooltip on hover */}
                        <div className="
                          invisible group-hover:visible absolute z-10 bottom-full left-1/2
                          -translate-x-1/2 mb-2 rounded-md border bg-popover px-3 py-2
                          text-xs text-popover-foreground shadow-md whitespace-nowrap
                        ">
                          <p className="font-medium">{pref.prefecture_name}</p>
                          <p className="font-mono tabular-nums">{formatNumber(pref.total_companies)} 社</p>
                          <p className="text-muted-foreground">
                            WEB: {formatNumber(pref.with_website)} 社
                          </p>
                          {pref.avg_capital != null && (
                            <p className="text-muted-foreground">
                              平均資本金: {formatCompact(Math.round(pref.avg_capital))} 円
                            </p>
                          )}
                          {pref.avg_employees != null && (
                            <p className="text-muted-foreground">
                              平均従業員: {Math.round(pref.avg_employees)} 人
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Prefecture ranking table ────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">都道府県ランキング</CardTitle>
          <CardDescription>企業数上位の都道府県</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium w-10">#</th>
                  <th className="pb-2 font-medium">都道府県</th>
                  <th className="pb-2 font-medium">地域</th>
                  <th className="pb-2 font-medium text-right">企業数</th>
                  <th className="pb-2 font-medium text-right">WEB保有</th>
                  <th className="pb-2 font-medium text-right hidden sm:table-cell">構成比</th>
                  <th className="pb-2 font-medium hidden md:table-cell min-w-[120px]">分布</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...prefectures]
                  .sort((a, b) => b.total_companies - a.total_companies)
                  .slice(0, 20)
                  .map((pref, i) => {
                    const pct = total > 0 ? Math.round((pref.total_companies / total) * 1000) / 10 : 0
                    return (
                      <tr key={pref.prefecture_code} className="hover:bg-muted/50 transition-colors duration-200">
                        <td className="py-2 font-mono tabular-nums text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="py-2 font-medium">{pref.prefecture_name}</td>
                        <td className="py-2">
                          <Badge variant="outline" className={`text-[10px] ${REGION_COLORS[pref.region] ?? ''}`}>
                            {pref.region}
                          </Badge>
                        </td>
                        <td className="py-2 text-right font-mono tabular-nums">
                          {formatNumber(pref.total_companies)}
                        </td>
                        <td className="py-2 text-right font-mono tabular-nums">
                          {formatNumber(pref.with_website)}
                        </td>
                        <td className="py-2 text-right font-mono tabular-nums hidden sm:table-cell">
                          {pct}%
                        </td>
                        <td className="py-2 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#e07a5f] transition-all duration-500"
                                style={{ width: getBarWidth(pref.total_companies, maxPrefCompanies) }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Industry bar chart ──────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">業種別企業数</CardTitle>
          <CardDescription>上位{industries.length}業種</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {industries.map((industry, i) => (
              <div key={industry.code} className="group">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-right text-xs font-mono tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="w-40 sm:w-56 text-sm truncate" title={industry.name}>
                    {industry.name}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full rounded bg-[#e07a5f] transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: getBarWidth(industry.company_count, maxIndustryCount) }}
                      >
                        {industry.company_count / maxIndustryCount > 0.15 && (
                          <span className="text-[10px] font-mono tabular-nums text-white whitespace-nowrap">
                            {formatNumber(industry.company_count)}
                          </span>
                        )}
                      </div>
                    </div>
                    {industry.company_count / maxIndustryCount <= 0.15 && (
                      <span className="text-xs font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                        {formatNumber(industry.company_count)}
                      </span>
                    )}
                  </div>
                  <span className="w-12 text-right text-xs font-mono tabular-nums text-muted-foreground">
                    {industry.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
