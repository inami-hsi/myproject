/**
 * Tailwind CSS クラスを統合するユーティリティ
 * shadcn/ui で使用される一般的なパターン
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter((cls): cls is string => Boolean(cls))
    .join(' ');
}

/**
 * 数値をパーセンテージ表示の星に変換
 */
export function scoreToStars(score: number): string {
  const stars = Math.round(score / 20); // 0-5星
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}

/**
 * マッチスコアをアイコン表現に変換
 */
export function matchScoreToIcon(score: number): string {
  if (score >= 90) return '🟢';
  if (score >= 75) return '🟡';
  return '🟠';
}

/**
 * 2つの日付の差分を表示形式に変換
 */
export function formatDaysDiff(date1: Date, date2: Date): string {
  const days = Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return '今日';
  if (days === 1) return '昨日';
  if (days < 7) return `${days}日前`;
  if (days < 30) return `${Math.floor(days / 7)}週前`;
  return `${Math.floor(days / 30)}ヶ月前`;
}

/**
 * オブジェクトをクエリ文字列に変換
 */
export function objectToQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else if (value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });
  return params.toString();
}
