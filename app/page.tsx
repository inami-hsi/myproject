'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-primary-50 to-neutral-50">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
          あなたにぴったりの保険を探そう
        </h1>

        <p className="text-lg md:text-xl text-neutral-700 mb-6">
          保険選びの新しい形 - ロ方式ガイダンス
        </p>

        <p className="text-base text-neutral-600 mb-12">
          保険業法に基づいた、あなたのニーズに合わせた保険商品をご提案します。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <Link
            href="/insurance/loss"
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
          >
            損害保険を探す
          </Link>
          <Link
            href="/insurance/life"
            className="bg-success-500 hover:bg-success-600 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
          >
            生命保険を探す
          </Link>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">
            このサイトの特徴
          </h2>
          <ul className="text-left space-y-3 text-neutral-700">
            <li className="flex items-start">
              <span className="text-success-500 font-bold mr-3">✓</span>
              <span>5分で最適保険が見つかる</span>
            </li>
            <li className="flex items-start">
              <span className="text-success-500 font-bold mr-3">✓</span>
              <span>5社以上の保険会社を自動比較</span>
            </li>
            <li className="flex items-start">
              <span className="text-success-500 font-bold mr-3">✓</span>
              <span>あなたの個別の推奨理由を表示</span>
            </li>
            <li className="flex items-start">
              <span className="text-success-500 font-bold mr-3">✓</span>
              <span>保険業法の「ロ方式」準拠</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
