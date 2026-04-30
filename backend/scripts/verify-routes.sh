#!/bin/bash
# Route verification - run with backend on port 5000
BASE="http://localhost:5000/api"
test_route() { echo -n "$1: "; curl -s -o /dev/null -w "%{http_code}" $2; echo ""; }
test_post() { echo -n "$1: "; curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$3" "$BASE/$2"; echo ""; }

echo "=== ROUTE VERIFICATION ==="
echo ""
echo "--- Public ---"
test_route "GET /health" "$BASE/health"
test_route "GET /trees" "$BASE/trees"
test_route "GET /books" "$BASE/books"
test_route "GET /gallery" "$BASE/gallery"
test_route "GET /search" "$BASE/search?q=x"
echo "--- Auth (no token) ---"
test_post "POST /auth/login" "auth/login" '{"email":"routeverify@test.com","password":"test123456"}'
test_post "POST /auth/reset" "auth/reset" '{"email":"x@x.com"}'
test_post "POST /auth/reset/verify" "auth/reset/verify" '{}'
test_post "POST /auth/refresh" "auth/refresh" '{}'
echo "--- Auth (with token) ---"
TOKEN=$(curl -s -X POST $BASE/auth/login -H "Content-Type: application/json" -d '{"email":"routeverify@test.com","password":"test123456"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('token','') or '')" 2>/dev/null)
test_route "GET /auth/me" "$BASE/auth/me -H 'Authorization: Bearer $TOKEN'"
echo "--- Trees (my, with token) ---"
test_route "GET /my/trees" "$BASE/my/trees -H 'Authorization: Bearer $TOKEN'"
test_post "POST /my/trees" "my/trees" '{"title":"Verify"}' -H "Authorization: Bearer $TOKEN"
echo "--- People ---"
test_route "GET /trees/2/people" "$BASE/trees/2/people"
test_post "POST /my/trees/2/people" "my/trees/2/people" '{"name":"Test"}' -H "Authorization: Bearer $TOKEN"
echo "--- Activity ---"
test_route "GET /activity" "$BASE/activity -H 'Authorization: Bearer $TOKEN'"
echo ""
echo "Done."
