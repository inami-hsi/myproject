import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "利用規約",
  description: "企業リストの利用規約",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-3xl font-bold tracking-tight">利用規約</h1>
      <p className="mt-2 text-sm text-muted-foreground">最終更新日: 2026年3月7日</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="font-heading text-lg font-semibold">第1条（適用）</h2>
          <p className="mt-2">
            本利用規約（以下「本規約」）は、企業リスト（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスを利用するものとします。
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">第2条（定義）</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>「ユーザー」とは、本サービスを利用する全ての方を指します。</li>
            <li>「有料プラン」とは、Starter プランおよび Pro プランを指します。</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">第3条（アカウント）</h2>
          <p className="mt-2">
            ユーザーは正確な情報を登録し、アカウントの管理責任を負うものとします。アカウントの不正利用による損害について、当社は責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">第4条（料金・支払い）</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>有料プランの料金は、料金ページに記載の通りとします。</li>
            <li>支払いはクレジットカードによる月額自動課金です。</li>
            <li>プランの変更・解約はいつでも可能です。解約後は次の請求日まで現在のプランをご利用いただけます。</li>
            <li>返金は原則として行いません。</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">第5条（禁止事項）</h2>
          <p className="mt-2">ユーザーは以下の行為を行ってはなりません。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>本サービスのデータを大量に自動取得する行為（スクレイピング等）</li>
            <li>取得したデータを第三者に再販売する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>法令に違反する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">第6条（データの正確性）</h2>
          <p className="mt-2">
            本サービスで提供する企業情報は、gBizINFO等の公開データに基づいていますが、その正確性・完全性・最新性を保証するものではありません。
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">第7条（免責事項）</h2>
          <p className="mt-2">
            本サービスの利用により生じた損害について、当社の故意または重大な過失がある場合を除き、当社は責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">第8条（サービスの変更・停止）</h2>
          <p className="mt-2">
            当社は、事前の通知なく本サービスの内容を変更、または一時的に停止することがあります。
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">第9条（規約の変更）</h2>
          <p className="mt-2">
            当社は本規約を変更できるものとします。変更後の規約は本ページに掲載した時点で効力を生じます。
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">第10条（準拠法・管轄）</h2>
          <p className="mt-2">
            本規約は日本法に準拠し、本サービスに関する紛争は東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>
      </div>
    </div>
  )
}
