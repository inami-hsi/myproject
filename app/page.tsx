'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-primary-50 to-neutral-50">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
          比較推奨意向把握シート
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-neutral-700 mb-4 sm:mb-6">
          保険選びの新しい形 - ロ方式ガイダンス
        </p>

        <p className="text-sm sm:text-base text-neutral-600 mb-8 sm:mb-12">
          保険業法に基づいた、あなたのニーズに合わせた保険商品をご提案します。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* 損害保険ボタン */}
          <Link href="/insurance/loss" className="block">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-primary-200 hover:border-primary-500 group">
              <div className="text-5xl sm:text-6xl mb-4">🛡️</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                損害保険
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base mb-4">
                自動車・火災・賠償責任・傷害
              </p>
              <div className="inline-flex items-center gap-2 text-primary-500 font-semibold text-sm sm:text-base group-hover:text-primary-700">
                保険を選ぶ
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>

          {/* 生命保険ボタン */}
          <Link href="/insurance/life" className="block">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-success-200 hover:border-success-500 group">
              <div className="text-5xl sm:text-6xl mb-4">💚</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 group-hover:text-success-600 transition-colors">
                生命保険
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base mb-4">
                定期・終身・医療・がん・年金など
              </p>
              <div className="inline-flex items-center gap-2 text-success-500 font-semibold text-sm sm:text-base group-hover:text-success-700">
                保険を選ぶ
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
