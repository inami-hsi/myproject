#!/bin/bash

# 火災保険フロー テストスクリプト
# すべてのステップをHTTPリクエストで検証

BASE_URL="http://localhost:3001"
CATEGORY="fire"

echo "🔥 火災保険フロー検証テスト開始"
echo "================================"
echo ""

# Q1-Q8 までのステップをチェック
for step in {1..8}; do
  url="${BASE_URL}/insurance/loss/${CATEGORY}/questions/${step}"
  
  echo "【Q${step}】ページロード確認: ${url}"
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$response" = "200" ]; then
    echo "  ✅ ステータス: 200 OK"
    
    # ページのコンテンツを軽くチェック（HTML に質問単語が含まれているか）
    content=$(curl -s "$url" | grep -o "質問\|建物\|築\|補償\|構造\|契約\|相談" | head -1)
    if [ ! -z "$content" ]; then
      echo "  ✅ コンテンツ: 質問テキスト検出"
    fi
  else
    echo "  ❌ ステータス: ${response}"
  fi
  echo ""
done

# 結果ページ（ステップ9以上）の確認
echo "【結果ページ】推奨結果ページ確認"
result_url="${BASE_URL}/insurance/loss/${CATEGORY}/questions/9"
response=$(curl -s -o /dev/null -w "%{http_code}" "$result_url")

if [ "$response" = "200" ]; then
  echo "  ✅ ステータス: 200 OK（ステップ9以降でリダイレクトされる可能性あり）"
else
  echo "  ℹ️  ステータス: ${response}（結果表示は動的に行われます）"
fi

echo ""
echo "================================"
echo "✅ 火災保険フロー検証完了"
echo "================================"
echo ""
echo "📝 次のステップ:"
echo "  1. ブラウザを開いて http://localhost:3001/insurance/loss/fire/questions/1"
echo "  2. 各質問に回答して進める"
echo "  3. 最後の質問後、推奨結果が表示されることを確認"
echo ""
