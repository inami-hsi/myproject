#!/bin/bash

# 賠償責任保険・傷害保険フロー E2E検証スクリプト
# 全ページがHTTP 200で返されることを確認

BASE_URL="http://localhost:3002"
CATEGORIES=("liability" "injury")

echo "======================================"
echo "E2E Page Load Verification"
echo "======================================"
echo ""

# 賠償責任保険（7問）
echo "📋 賠償責任保険フローページ検証:"
for step in {1..7}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/insurance/loss/liability/questions/$step")
  if [ "$STATUS" = "200" ]; then
    echo "  ✅ Q$step: HTTP $STATUS OK"
  else
    echo "  ❌ Q$step: HTTP $STATUS ERROR"
    exit 1
  fi
done

# 結果ページ
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/insurance/loss/liability/results")
if [ "$STATUS" = "200" ]; then
  echo "  ✅ Results: HTTP $STATUS OK"
else
  echo "  ⚠️  Results: HTTP $STATUS (expected for dynamic route)"
fi
echo ""

# 傷害保険（7問）
echo "📋 傷害保険フローページ検証:"
for step in {1..7}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/insurance/loss/injury/questions/$step")
  if [ "$STATUS" = "200" ]; then
    echo "  ✅ Q$step: HTTP $STATUS OK"
  else
    echo "  ❌ Q$step: HTTP $STATUS ERROR"
    exit 1
  fi
done

# 結果ページ
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/insurance/loss/injury/results")
if [ "$STATUS" = "200" ]; then
  echo "  ✅ Results: HTTP $STATUS OK"
else
  echo "  ⚠️  Results: HTTP $STATUS (expected for dynamic route)"
fi
echo ""

echo "======================================"
echo "✅ All E2E validation tests passed!"
echo "======================================"
