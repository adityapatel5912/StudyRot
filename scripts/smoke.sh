#!/usr/bin/env bash
# Smoke test script for StudyRot API endpoints
set -e

HOST="${1:-http://localhost:3000}"

echo "========================================"
echo "StudyRot Smoke Test Suite against $HOST"
echo "========================================"

# 1. Health check
echo -n "Checking /api/health ... "
HEALTH_RES=$(curl -s "$HOST/api/health")
if echo "$HEALTH_RES" | grep -q '"ok":true\|"status"'; then
  echo "✅ PASS"
else
  echo "❌ FAIL ($HEALTH_RES)"
fi

# 2. Demo Generate endpoint
echo -n "Checking /api/demo-generate ... "
DEMO_RES=$(curl -s -X POST "$HOST/api/demo-generate" \
  -H "Content-Type: application/json" \
  -d '{"text": "Photosynthesis", "subject": "Science", "grade": 10}')
if echo "$DEMO_RES" | grep -q 'posts'; then
  echo "✅ PASS"
else
  echo "❌ FAIL ($DEMO_RES)"
fi

# 3. Key error handling
echo -n "Checking /api/generate without key returns error envelope ... "
GEN_RES=$(curl -s -X POST "$HOST/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"text": "Photosynthesis", "subject": "Science", "grade": 10}')
if echo "$GEN_RES" | grep -q 'KEY_REQUIRED\|detail'; then
  echo "✅ PASS"
else
  echo "❌ FAIL ($GEN_RES)"
fi

# 4. Battle room create
echo -n "Checking /api/battle/create ... "
BATTLE_RES=$(curl -s -X POST "$HOST/api/battle/create" \
  -H "Content-Type: application/json" \
  -d '{"topic": "Electricity", "subject": "Science", "grade": 10}')
if echo "$BATTLE_RES" | grep -q 'room_code'; then
  echo "✅ PASS"
else
  echo "❌ FAIL ($BATTLE_RES)"
fi

echo "========================================"
echo "All smoke tests finished."
echo "========================================"
