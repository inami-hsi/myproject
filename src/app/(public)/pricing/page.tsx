"use client";

import Link from "next/link";
import { Check, Minus } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: 0,
    description: "まずは試してみたい方に",
    features: {
      downloads: "50件",
      savedSearches: "3件",
      format: "CSV",
      detail: "基本情報",
      notification: null,
    },
    cta: "無料で始める",
    href: "/search",
    highlighted: false,
  },
  {
    name: "Starter",
    price: 2980,
    description: "営業チームの日常業務に",
    features: {
      downloads: "3,000件",
      savedSearches: "20件",
      format: "CSV / Excel",
      detail: "全情報",
      notification: "週次",
    },
    cta: "Starterプランを始める",
    priceId: "starter",
    highlighted: true,
  },
  {
    name: "Pro",
    price: 9800,
    description: "大規模な営業活動に",
    features: {
      downloads: "30,000件",
      savedSearches: "無制限",
      format: "CSV / Excel",
      detail: "全情報",
      notification: "日次 / 週次 / 月次",
    },
    cta: "Proプランを始める",
    priceId: "pro",
    highlighted: false,
  },
] as const;

const featureRows = [
  { key: "downloads", label: "月間ダウンロード数" },
  { key: "savedSearches", label: "保存検索" },
  { key: "format", label: "ダウンロード形式" },
  { key: "detail", label: "企業詳細" },
  { key: "notification", label: "通知" },
] as const;

type FeatureKey = (typeof featureRows)[number]["key"];

function formatPrice(price: number): string {
  if (price === 0) return "¥0";
  return `¥${price.toLocaleString("ja-JP")}`;
}

async function handleCheckout(priceId: string) {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  } catch {
    // Checkout error handling would go here
  }
}

function PlanCard({
  plan,
}: {
  plan: (typeof plans)[number];
}) {
  const isHighlighted = plan.highlighted;

  return (
    <div
      className={`relative flex flex-col rounded-lg border p-6 ${
        isHighlighted
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background"
      }`}
    >
      {isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-terracotta px-3 py-1 font-heading text-xs font-semibold text-white">
            おすすめ
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
        <p
          className={`mt-1 text-sm ${
            isHighlighted ? "text-background/70" : "text-muted-foreground"
          }`}
        >
          {plan.description}
        </p>
      </div>

      <div className="mb-6">
        <span className="font-heading text-4xl font-bold tabular-nums">
          {formatPrice(plan.price)}
        </span>
        <span
          className={`ml-1 text-sm ${
            isHighlighted ? "text-background/70" : "text-muted-foreground"
          }`}
        >
          / 月
        </span>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {featureRows.map((row) => {
          const value = plan.features[row.key as FeatureKey];
          return (
            <li key={row.key} className="flex items-start gap-3 text-sm">
              {value ? (
                <Check
                  className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                    isHighlighted ? "text-terracotta" : "text-terracotta"
                  }`}
                />
              ) : (
                <Minus
                  className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                    isHighlighted ? "text-background/40" : "text-muted-foreground/40"
                  }`}
                />
              )}
              <span>
                <span
                  className={
                    isHighlighted ? "text-background/70" : "text-muted-foreground"
                  }
                >
                  {row.label}:
                </span>{" "}
                <span className="font-medium">{value ?? "--"}</span>
              </span>
            </li>
          );
        })}
      </ul>

      {"href" in plan && plan.href ? (
        <Link
          href={plan.href}
          className={`inline-flex h-11 items-center justify-center rounded-md font-heading text-sm font-semibold transition-colors duration-200 ${
            isHighlighted
              ? "bg-background text-foreground hover:bg-background/90"
              : "border border-border hover:bg-secondary"
          }`}
        >
          {plan.cta}
        </Link>
      ) : (
        <button
          onClick={() => {
            if ("priceId" in plan && plan.priceId) {
              handleCheckout(plan.priceId);
            }
          }}
          className={`inline-flex h-11 items-center justify-center rounded-md font-heading text-sm font-semibold transition-colors duration-200 ${
            isHighlighted
              ? "bg-background text-foreground hover:bg-background/90"
              : "border border-border hover:bg-secondary"
          }`}
        >
          {plan.cta}
        </button>
      )}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            料金プラン
          </h1>
          <p className="mt-4 text-muted-foreground">
            必要な規模に合わせて、最適なプランを選択できます。
          </p>
        </div>

        {/* Plan cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* Comparison table */}
        <div className="mt-20">
          <h2 className="text-center text-xl font-bold md:text-2xl">
            プラン比較
          </h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 pr-4 text-left font-heading font-semibold">
                    機能
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      className="px-4 py-3 text-center font-heading font-semibold"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 pr-4 text-muted-foreground">月額</td>
                  {plans.map((plan) => (
                    <td
                      key={plan.name}
                      className="px-4 py-3 text-center font-medium tabular-nums"
                    >
                      {formatPrice(plan.price)}
                    </td>
                  ))}
                </tr>
                {featureRows.map((row) => (
                  <tr key={row.key} className="border-b">
                    <td className="py-3 pr-4 text-muted-foreground">
                      {row.label}
                    </td>
                    {plans.map((plan) => {
                      const value = plan.features[row.key as FeatureKey];
                      return (
                        <td
                          key={plan.name}
                          className="px-4 py-3 text-center font-medium"
                        >
                          {value ?? (
                            <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            すべてのプランに14日間の無料トライアルが含まれます。いつでもプラン変更・解約が可能です。
          </p>
        </div>
      </div>
    </div>
  );
}
