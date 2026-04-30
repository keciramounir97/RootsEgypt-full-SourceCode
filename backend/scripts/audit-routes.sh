#!/bin/bash
# Route audit - tests all known routes and reports status codes
BASE="${1:-http://localhost:5000/api}"

# Get tokens
USER_LOGIN=$(curl -s -X POST $BASE/auth/login -H "Content-Type: application/json" -d '{"email":"routeverify@test.com","password":"newpass123"}')
USER_TOKEN=$(echo "$USER_LOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('token','') or '')" 2>/dev/null)

ADMIN_LOGIN=$(curl -s -X POST $BASE/auth/login -H "Content-Type: application/json" -d '{"email":"apitest@test.com","password":"test123"}')
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('token','') or '')" 2>/dev/null)
if [ -z "$ADMIN_TOKEN" ]; then ADMIN_TOKEN="$USER_TOKEN"; fi

test() { echo -n "$1: "; curl -s -o /dev/null -w "%{http_code}" $2; echo ""; }

echo "=== ROUTE AUDIT ==="
echo ""
echo "--- Public (no auth) ---"
test "GET /health" "$BASE/health"
test "GET /trees" "$BASE/trees"
test "GET /books" "$BASE/books"
test "GET /gallery" "$BASE/gallery"
test "GET /search?q=x" "$BASE/search?q=x"

echo "--- Auth ---"
test "POST /auth/login" "-X POST $BASE/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"routeverify@test.com\",\"password\":\"newpass123\"}'"
test "POST /auth/signup" "-X POST $BASE/auth/signup -H 'Content-Type: application/json' -d '{\"email\":\"audit$(date +%s)@test.com\",\"password\":\"pass123456\",\"fullName\":\"Audit\"}'"
test "POST /auth/reset" "-X POST $BASE/auth/reset -H 'Content-Type: application/json' -d '{\"email\":\"x@x.com\"}'"
test "POST /auth/refresh" "-X POST $BASE/auth/refresh -H 'Content-Type: application/json' -d '{\"refreshToken\":\"invalid\"}'"
test "GET /auth/me" "$BASE/auth/me -H 'Authorization: Bearer $USER_TOKEN'"
test "POST /auth/logout" "-X POST $BASE/auth/logout -H 'Authorization: Bearer $USER_TOKEN'"

echo "--- User routes (JWT) ---"
test "GET /my/trees" "$BASE/my/trees -H 'Authorization: Bearer $USER_TOKEN'"
test "POST /my/trees" "-X POST $BASE/my/trees -H 'Authorization: Bearer $USER_TOKEN' -H 'Content-Type: application/json' -d '{\"title\":\"AuditTree\"}'"
test "GET /my/books" "$BASE/my/books -H 'Authorization: Bearer $USER_TOKEN'"
test "GET /my/gallery" "$BASE/my/gallery -H 'Authorization: Bearer $USER_TOKEN'"

echo "--- Trees (public) ---"
test "GET /trees/2" "$BASE/trees/2"
test "GET /trees/2/people" "$BASE/trees/2/people"
test "GET /people/1" "$BASE/people/1"

echo "--- Admin routes ---"
test "GET /admin/users" "$BASE/admin/users -H 'Authorization: Bearer $ADMIN_TOKEN'"
test "GET /admin/books" "$BASE/admin/books -H 'Authorization: Bearer $ADMIN_TOKEN'"
test "GET /admin/trees" "$BASE/admin/trees -H 'Authorization: Bearer $ADMIN_TOKEN'"
test "GET /admin/gallery" "$BASE/admin/gallery -H 'Authorization: Bearer $ADMIN_TOKEN'"
test "GET /admin/stats" "$BASE/admin/stats -H 'Authorization: Bearer $ADMIN_TOKEN'"
test "GET /activity" "$BASE/activity -H 'Authorization: Bearer $ADMIN_TOKEN'"

echo "--- Contact/Newsletter ---"
test "POST /contact" "-X POST $BASE/contact -H 'Content-Type: application/json' -d '{\"name\":\"Test\",\"email\":\"test@test.com\",\"message\":\"Hi\"}'"
test "POST /newsletter/subscribe" "-X POST $BASE/newsletter/subscribe -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\"}'"
