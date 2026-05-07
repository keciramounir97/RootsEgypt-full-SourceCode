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

is_http_ready() {
  candidate="$1"
  wget -q -T 2 -O /dev/null "http://$candidate/api/health/live" >/dev/null 2>&1 ||
    wget -q -T 2 -O /dev/null "http://$candidate/healthz" >/dev/null 2>&1
}

configured="$(normalize_upstream "${BACKEND_UPSTREAM:-}")"
preferred="${configured:-rootsegypt-backend:5000}"
selected=""
resolvable=""

for candidate in \
  "$preferred" \
  "rootsegypt-backend:5000" \
  "rootsegypt_backend:5000" \
  "roots-egypt-backend:5000" \
  "api:5000" \
  "backend:5000"
do
  [ -n "$candidate" ] || continue
  if is_http_ready "$candidate"; then
    selected="$candidate"
    break
  fi
  if [ -z "$resolvable" ] && is_resolvable "$candidate"; then
    resolvable="$candidate"
  fi
done

if [ -z "$selected" ]; then
  selected="${resolvable:-$preferred}"
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
