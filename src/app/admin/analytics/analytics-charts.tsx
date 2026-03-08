'use client'

interface Props {
  dailyData: { date: string; count: number }[]
}

export function AnalyticsCharts({ dailyData }: Props) {
  const maxCount = Math.max(...dailyData.map((d) => d.count), 1)

  return (
    <div className="mt-4">
      {/* Bar chart */}
      <div className="flex items-end gap-1" style={{ height: 200 }}>
        {dailyData.map((d) => {
          const height = maxCount > 0 ? (d.count / maxCount) * 100 : 0
          const dateObj = new Date(d.date + 'T00:00:00')
          const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`

          return (
            <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-8 hidden rounded bg-eg-primary px-2 py-1 text-xs text-white group-hover:block">
                {label}: {d.count}件
              </div>
              {/* Bar */}
              <div
                className="w-full min-w-1 rounded-t bg-eg-accent/80 transition-colors hover:bg-eg-accent"
                style={{ height: `${Math.max(height, d.count > 0 ? 4 : 0)}%` }}
              />
            </div>
          )
        })}
      </div>

      {/* X-axis labels (show every 5 days) */}
      <div className="mt-2 flex gap-1">
        {dailyData.map((d, i) => {
          const dateObj = new Date(d.date + 'T00:00:00')
          const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
          const show = i % 5 === 0 || i === dailyData.length - 1

          return (
            <div key={d.date} className="flex-1 text-center">
              {show && (
                <span className="text-[10px] text-eg-text-secondary">{label}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 flex gap-6 text-sm text-eg-text-secondary">
        <span>
          合計: <strong className="text-eg-primary">{dailyData.reduce((s, d) => s + d.count, 0)}</strong>件
        </span>
        <span>
          日平均: <strong className="text-eg-primary">
            {(dailyData.reduce((s, d) => s + d.count, 0) / dailyData.length).toFixed(1)}
          </strong>件
        </span>
        <span>
          最大: <strong className="text-eg-primary">{maxCount}</strong>件/日
        </span>
      </div>
    </div>
  )
}
