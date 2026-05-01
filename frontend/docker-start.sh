#!/bin/sh
set -eu

normalize_upstream() {
  value="$1"
  value="${value#http://}"
  value="${value#https://}"
  value="${value%%/*}"
  printf '%s' "$value"
}

is_resolvable() {
  candidate="$1"
  host="${candidate%%:*}"
  getent hosts "$host" >/dev/null 2>&1
}

configured="$(normalize_upstream "${BACKEND_UPSTREAM:-}")"
selected=""

for candidate in \
  "$configured" \
  "backend:5000" \
  "rootsegypt_backend:5000" \
  "rootsegypt-backend:5000" \
  "api:5000" \
  "roots-egypt-backend:5000"
do
  [ -n "$candidate" ] || continue
  if is_resolvable "$candidate"; then
    selected="$candidate"
    break
  fi
done

if [ -z "$selected" ]; then
  selected="${configured:-backend:5000}"
fi

export BACKEND_UPSTREAM="$selected"
envsubst '${BACKEND_UPSTREAM}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

echo "============================================"
echo "   [OK] FRONTEND DEPLOYMENT SUCCESSFUL"
echo "   Serving on port 80 (nginx)"
echo "   API upstream: $BACKEND_UPSTREAM"
echo "============================================"

exec nginx -g 'daemon off;'
