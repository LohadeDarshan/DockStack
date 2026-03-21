#!/bin/bash

BACKEND_URL=$1     # pass URL as argument
MAX_RETRIES=10
RETRY_INTERVAL=10

echo "🔍 Starting health check on: $BACKEND_URL"

for i in $(seq 1 $MAX_RETRIES); do
  echo "Attempt $i of $MAX_RETRIES..."

  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/users")

  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Health check PASSED (HTTP $HTTP_STATUS)"
    exit 0
  else
    echo "❌ Health check FAILED (HTTP $HTTP_STATUS) — retrying in ${RETRY_INTERVAL}s"
    sleep $RETRY_INTERVAL
  fi
done

echo "🚨 All retries exhausted. Deployment UNHEALTHY."
exit 1