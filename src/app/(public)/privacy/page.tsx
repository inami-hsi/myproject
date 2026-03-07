import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "企業リストのプライバシーポリシー",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-3xl font-bold tracking-tight">プライバシーポリシー</h1>
      <p className="mt-2 text-sm text-muted-foreground">最終更新日: 2026年3月7日</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="font-heading text-lg font-semibold">1. 収集する情報</h2>
          <p className="mt-2">本サービスでは以下の情報を収集します。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>アカウント情報</strong>: メールアドレス、氏名（Clerk認証経由）</li>
            <li><strong>決済情報</strong>: クレジットカード情報はStripe社が管理し、当社は保持しません</li>
            <li><strong>利用データ</strong>: 検索履歴、ダウンロード履歴</li>
            <li><strong>エラー情報</strong>: サービス改善のためのエラーログ（Sentry経由）</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">2. 情報の利用目的</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>本サービスの提供・運営</li>
            <li>ユーザーサポート</li>
            <li>サービスの改善・新機能開発</li>
            <li>利用状況の分析</li>
            <li>不正利用の防止</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">3. 第三者サービス</h2>
          <p className="mt-2">本サービスでは以下の第三者サービスを利用しています。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Clerk</strong>（認証）: ユーザー認証の管理</li>
            <li><strong>Stripe</strong>（決済）: クレジットカード決済の処理</li>
            <li><strong>Supabase</strong>（データベース）: ユーザーデータの保存</li>
            <li><strong>Vercel</strong>（ホスティング）: サービスのホスティング</li>
            <li><strong>Sentry</strong>（エラー監視）: エラーの検知・通知</li>
          </ul>
          <p className="mt-2">
            各サービスのプライバシーポリシーについては、各社のウェブサイトをご確認ください。
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">4. 情報の保護</h2>
          <p className="mt-2">
            当社はユーザーの個人情報を適切に管理し、不正アクセス・漏洩等の防止に努めます。通信はSSL/TLSにより暗号化されています。
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">5. Cookieの使用</h2>
          <p className="mt-2">
            本サービスでは、認証状態の維持等のためにCookieを使用します。ブラウザの設定でCookieを無効にできますが、一部の機能が利用できなくなる場合があります。
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">6. データの削除</h2>
          <p className="mt-2">
            アカウントの削除を希望する場合は、お問い合わせください。アカウント削除後、個人情報は合理的な期間内に削除します。
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">7. ポリシーの変更</h2>
          <p className="mt-2">
            本ポリシーは予告なく変更することがあります。変更後のポリシーは本ページに掲載した時点で効力を生じます。
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">8. お問い合わせ</h2>
          <p className="mt-2">
            プライバシーに関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
          </p>
        </section>
      </div>
    </div>
  )
}
