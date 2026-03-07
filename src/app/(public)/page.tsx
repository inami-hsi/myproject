import type { Metadata } from "next";
import Link from "next/link";
import { Database, Filter, Download, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "企業リスト - 企業情報検索・リスト作成ツール",
  description:
    "企業情報を簡単に検索・リスト化。業種・地域・従業員数などの条件で企業を絞り込み、CSV/Excelでダウンロード。",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            日本600万社から、
            <br />
            ターゲット企業を
            <span className="text-terracotta">瞬時に抽出</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            業種×地域で企業リストをCSVダウンロード。
            <br className="hidden sm:block" />
            営業リスト作成を、もっとシンプルに。
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-md bg-foreground px-8 font-heading text-sm font-semibold text-background transition-colors duration-200 hover:bg-foreground/90"
            >
              無料アカウント作成
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-md border border-border px-8 font-heading text-sm font-medium transition-colors duration-200 hover:bg-secondary"
            >
              料金プランを見る
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-muted/30">
                <Database className="h-5 w-5 text-terracotta" />
              </div>
              <h3 className="font-heading text-lg font-semibold">
                600万社の企業データ
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                国税庁法人番号とgBizINFOを統合。日本全国の法人情報を網羅した信頼性の高いデータベース。
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-muted/30">
                <Filter className="h-5 w-5 text-terracotta" />
              </div>
              <h3 className="font-heading text-lg font-semibold">
                業種×地域で絞り込み
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                日本標準産業分類と47都道府県で自在にフィルタリング。ターゲット企業を正確に抽出。
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-muted/30">
                <Download className="h-5 w-5 text-terracotta" />
              </div>
              <h3 className="font-heading text-lg font-semibold">
                CSVで即ダウンロード
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                検索結果をCSV形式で即座にダウンロード。営業リスト作成に最適なフォーマット。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/10 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold md:text-3xl">
            使い方はシンプル
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground font-heading text-lg font-bold">
                1
              </div>
              <h3 className="mt-4 font-heading font-semibold">
                検索条件を設定
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                業種・地域・設立年などの条件を指定
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground font-heading text-lg font-bold">
                2
              </div>
              <h3 className="mt-4 font-heading font-semibold">
                結果をプレビュー
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                ヒットした企業一覧を画面上で確認
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground font-heading text-lg font-bold">
                3
              </div>
              <h3 className="mt-4 font-heading font-semibold">
                CSVダウンロード
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                ワンクリックで営業リストをエクスポート
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            まずは無料で
            <span className="text-terracotta">50社</span>
            ダウンロード
          </h2>
          <p className="mt-4 text-muted-foreground">
            アカウント登録は無料。クレジットカード不要で、すぐに企業リストの検索・ダウンロードが可能です。
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-foreground px-8 font-heading text-sm font-semibold text-background transition-colors duration-200 hover:bg-foreground/90"
          >
            無料アカウント作成
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
