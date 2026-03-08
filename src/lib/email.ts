import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = '企業リスト <noreply@resend.dev>'
const APP_NAME = '企業リスト'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://company-list-builder.vercel.app'

// ---------------------------------------------------------------------------
// Send helper (fire-and-forget, logs errors but does not throw)
// ---------------------------------------------------------------------------

async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return
  try {
    await getResend().emails.send({ from: FROM, to, subject, html })
  } catch (error) {
    console.error('[email] Failed to send:', { to, subject, error })
  }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export async function sendDownloadComplete(to: string, opts: {
  recordCount: number
  format: string
  downloadId: string
}) {
  await send(to, `ダウンロードが完了しました - ${APP_NAME}`, `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #141413;">ダウンロード完了</h2>
      <p>リクエストされたダウンロードファイルの生成が完了しました。</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 16px 4px 0; color: #666;">件数</td><td>${opts.recordCount.toLocaleString('ja-JP')} 件</td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #666;">形式</td><td>${opts.format.toUpperCase()}</td></tr>
      </table>
      <a href="${APP_URL}/dashboard" style="display: inline-block; padding: 10px 24px; background: #141413; color: #fff; text-decoration: none; border-radius: 6px;">
        ダッシュボードで確認
      </a>
      <p style="margin-top: 24px; font-size: 12px; color: #999;">
        このメールは${APP_NAME}から自動送信されています。
      </p>
    </div>
  `)
}

export async function sendUsageAlert(to: string, opts: {
  used: number
  limit: number
  percent: number
}) {
  await send(to, `使用量が${opts.percent}%に達しました - ${APP_NAME}`, `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #141413;">使用量アラート</h2>
      <p>今月のダウンロード使用量が上限の <strong>${opts.percent}%</strong> に達しました。</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 16px 4px 0; color: #666;">使用済み</td><td>${opts.used.toLocaleString('ja-JP')} 件</td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #666;">上限</td><td>${opts.limit.toLocaleString('ja-JP')} 件</td></tr>
      </table>
      <p>上限に達するとダウンロードができなくなります。プランのアップグレードをご検討ください。</p>
      <a href="${APP_URL}/pricing" style="display: inline-block; padding: 10px 24px; background: #141413; color: #fff; text-decoration: none; border-radius: 6px;">
        プランを確認
      </a>
      <p style="margin-top: 24px; font-size: 12px; color: #999;">
        このメールは${APP_NAME}から自動送信されています。
      </p>
    </div>
  `)
}

export async function sendPlanChanged(to: string, opts: {
  oldPlan: string
  newPlan: string
}) {
  const planLabels: Record<string, string> = { free: 'Free', starter: 'Starter', pro: 'Pro' }
  const oldLabel = planLabels[opts.oldPlan] || opts.oldPlan
  const newLabel = planLabels[opts.newPlan] || opts.newPlan

  await send(to, `プランが変更されました - ${APP_NAME}`, `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #141413;">プラン変更完了</h2>
      <p>プランが変更されました。</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 16px 4px 0; color: #666;">変更前</td><td>${oldLabel}プラン</td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color: #666;">変更後</td><td><strong>${newLabel}プラン</strong></td></tr>
      </table>
      <a href="${APP_URL}/dashboard" style="display: inline-block; padding: 10px 24px; background: #141413; color: #fff; text-decoration: none; border-radius: 6px;">
        ダッシュボードを確認
      </a>
      <p style="margin-top: 24px; font-size: 12px; color: #999;">
        このメールは${APP_NAME}から自動送信されています。
      </p>
    </div>
  `)
}
