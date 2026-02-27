'use client';

import Link from 'next/link';

export default function LossInsurancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-primary-500 hover:text-primary-600 mb-8 inline-block">
          ← トップへ戻る
        </Link>

        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
          損害保険をお探しですか？
        </h1>

        <p className="text-lg text-neutral-700 mb-12">
          あなたのニーズに合う保険種目をお選びください。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 自動車保険 */}
          <Link href="/insurance/loss/auto/questions/1">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-primary-200">
              <div className="text-4xl mb-3">🚗</div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                自動車保険
              </h2>
              <p className="text-neutral-600 text-sm">
                お車の保険選びをサポート
              </p>
            </div>
          </Link>

          {/* 火災保険 */}
          <Link href="/insurance/loss/fire/questions/1">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-primary-200">
              <div className="text-4xl mb-3">🏠</div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                火災保険
              </h2>
              <p className="text-neutral-600 text-sm">
                ご家族やお住いの保険をサポート
              </p>
            </div>
          </Link>

          {/* 賠償責任保険 */}
          <Link href="/insurance/loss/liability/questions/1">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-primary-200">
              <div className="text-4xl mb-3">⚖️</div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                賠償責任保険
              </h2>
              <p className="text-neutral-600 text-sm">
                事故の際の金銭的リスク対策
              </p>
            </div>
          </Link>

          {/* 傷害保険 */}
          <Link href="/insurance/loss/injury/questions/1">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-primary-200">
              <div className="text-4xl mb-3">🤕</div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                傷害保険
              </h2>
              <p className="text-neutral-600 text-sm">
                けがのリスク対策（労災上乗せ）
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
