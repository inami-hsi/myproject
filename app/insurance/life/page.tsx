'use client';

import Link from 'next/link';

export default function LifeInsurancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-primary-500 hover:text-primary-600 mb-6 sm:mb-8 inline-block text-sm sm:text-base">
          ← トップへ戻る
        </Link>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
          生命保険をお探しですか？
        </h1>

        <p className="text-base sm:text-lg text-neutral-700 mb-8 sm:mb-12">
          あなたのニーズに合う保険種目をお選びください。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* 定期保険 */}
          <Link href="/insurance/life/term/questions/1">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-accent-200">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📅</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1 sm:mb-2">
                定期保険
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm">
                一定期間の死亡保障をお得に
              </p>
            </div>
          </Link>

          {/* 終身保険 */}
          <Link href="/insurance/life/whole/questions/1">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-accent-200">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">♾️</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1 sm:mb-2">
                終身保険
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm">
                一生涯の保障と貯蓄性を両立
              </p>
            </div>
          </Link>

          {/* 医療保険 */}
          <Link href="/insurance/life/medical/questions/1">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-accent-200">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🏥</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1 sm:mb-2">
                医療保険
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm">
                入院・手術の費用をカバー
              </p>
            </div>
          </Link>

          {/* がん保険 */}
          <Link href="/insurance/life/cancer/questions/1">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-accent-200">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🎗️</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1 sm:mb-2">
                がん保険
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm">
                がん治療に特化した保障
              </p>
            </div>
          </Link>

          {/* 年金保険 */}
          <Link href="/insurance/life/annuity/questions/1">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-accent-200">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🏦</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1 sm:mb-2">
                年金保険
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm">
                老後の生活資金を計画的に準備
              </p>
            </div>
          </Link>

          {/* 変額保険 */}
          <Link href="/insurance/life/variable/questions/1">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-accent-200">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📈</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1 sm:mb-2">
                変額保険
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm">
                保障と資産運用を両立
              </p>
            </div>
          </Link>

          {/* 養老保険 */}
          <Link href="/insurance/life/endowment/questions/1">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-accent-200">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🎁</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1 sm:mb-2">
                養老保険
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm">
                満期保険金＋死亡保障を両立
              </p>
            </div>
          </Link>

          {/* 学資保険 */}
          <Link href="/insurance/life/education/questions/1">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-accent-200">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🎓</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1 sm:mb-2">
                学資保険
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm">
                お子さまの教育資金を計画的に準備
              </p>
            </div>
          </Link>

          {/* 収入保障保険 */}
          <Link href="/insurance/life/income/questions/1">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-accent-200">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">💰</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1 sm:mb-2">
                収入保障保険
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm">
                遺族の生活費を年金形式で確保
              </p>
            </div>
          </Link>

          {/* 介護保険 */}
          <Link href="/insurance/life/nursing/questions/1">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-accent-200">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🤝</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1 sm:mb-2">
                介護保険
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm">
                要介護状態への備え
              </p>
            </div>
          </Link>

          {/* 就業不能保険 */}
          <Link href="/insurance/life/disability/questions/1">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer border border-accent-200">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🛡️</div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1 sm:mb-2">
                就業不能保険
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm">
                働けなくなった場合の収入を確保
              </p>
            </div>
          </Link>
        </div>

        {/* 損害保険へのリンク */}
        <div className="mt-8 text-center">
          <Link href="/insurance/loss" className="text-primary-500 hover:text-primary-600 font-medium">
            損害保険を探す →
          </Link>
        </div>
      </div>
    </main>
  );
}
