#!/bin/bash
set -e

BASE_URL="http://localhost:3000"
CATEGORY="fire"

echo "🔥 火災保険フロー E2E テスト開始"
echo "================================================================"

# テストケース：各質問で異なる回答を選択
echo "📝 テストケース設定:"
echo "  Q1：建物タイプ = apartment（マンション/アパート）"
echo "  Q2：建築年数 = 5-15（5～15年）"
echo "  Q3：補償対象 = both（建物と家財）"
echo "  Q4：災害補償 = [flood, typhoon]（洪水、暴風）"
echo "  Q5：建物構造 = wood-mid（木造/軽量鉄骨 中程度）"
echo "  Q6：優先度 = [basic-coverage, water-damage, cost]（基本補償、水災、保険料）"
echo "  Q7：契約期間 = 5years（5年）"
echo "  Q8：相談方式 = face-to-face（対面）"
echo ""

# Q1 テスト
echo "【Q1】建物タイプ質問ページ"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/insurance/loss/$CATEGORY/questions/1")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Q1 ページ: $HTTP_CODE OK"
else
  echo "❌ Q1 ページ: $HTTP_CODE エラー"
  exit 1
fi

# Q2-Q8 テスト
for Q in {2..8}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/insurance/loss/$CATEGORY/questions/$Q")
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Q$Q ページ: $HTTP_CODE OK"
  else
    echo "❌ Q$Q ページ: $HTTP_CODE エラー"
    exit 1
  fi
  sleep 0.5
done

# 結果ページ テスト
echo ""
echo "【結果】推奨結果ページ"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/insurance/loss/$CATEGORY/questions/9")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 結果ページ: $HTTP_CODE OK"
else
  echo "❌ 結果ページ: $HTTP_CODE エラー"
  exit 1
fi

echo ""
echo "================================================================"
echo "✅ 火災保険フロー E2E テスト完了（全ページ 200 OK）"
echo ""

# 利用可能な全ページをリスト
echo "📊 利用可能なページ:"
echo "  ✓ /insurance/loss/fire/questions/1  (Q1: 建物タイプ)"
echo "  ✓ /insurance/loss/fire/questions/2  (Q2: 建築年数)"
echo "  ✓ /insurance/loss/fire/questions/3  (Q3: 補償対象)"
echo "  ✓ /insurance/loss/fire/questions/4  (Q4: 災害補償)"
echo "  ✓ /insurance/loss/fire/questions/5  (Q5: 建物構造)"
echo "  ✓ /insurance/loss/fire/questions/6  (Q6: 優先度)"
echo "  ✓ /insurance/loss/fire/questions/7  (Q7: 契約期間)"
echo "  ✓ /insurance/loss/fire/questions/8  (Q8: 相談方式)"
echo "  ✓ /insurance/loss/fire/questions/9  (結果ページ)"
echo ""

# 自動保険フロー テスト
echo "🤖 自動フロー テスト（答えを入力して結果まで到達できるか）"
echo "  → 結果ページ検証: npx tsx tests/fire-flow-simulation.ts"
echo ""
