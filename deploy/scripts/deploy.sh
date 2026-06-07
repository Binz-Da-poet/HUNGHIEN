#!/bin/bash
set -euo pipefail

# Hùng Hiền Deploy Script
# Must run from the Git repo root as the hung-hien user.

REQUIRED_ENV_FILES=(
  "/etc/hung-hien/api.env"
  "/etc/hung-hien/storefront.env"
  "/etc/hung-hien/admin.env"
)

echo "=== Hùng Hiền Deploy ==="
echo "Step 1: Verify preconditions"

# Check clean working tree
if ! git diff-index --quiet HEAD --; then
  echo "ERROR: Working tree is not clean. Commit or stash changes first." >&2
  exit 1
fi

# Check required env files
for f in "${REQUIRED_ENV_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: Missing required env file: $f" >&2
    exit 1
  fi
done

echo "Step 2: Install dependencies"
pnpm install --frozen-lockfile

echo "Step 3: Build shared package"
pnpm --filter @repo/shared build

echo "Step 4: Run database migration"
pnpm --filter api exec prisma migrate deploy

echo "Step 5: Build all apps"
pnpm build

echo "Step 6: Restart services"
sudo systemctl restart hung-hien-api.service
sudo systemctl restart hung-hien-storefront.service
sudo systemctl restart hung-hien-admin.service

echo "Step 7: Health checks"
sleep 3

API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "fail")
STORE_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "fail")
ADMIN_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/ || echo "fail")

echo "  API health: $API_HEALTH"
echo "  Storefront: $STORE_HEALTH"
echo "  Admin: $ADMIN_HEALTH"

if [ "$API_HEALTH" != "200" ]; then
  echo "ERROR: API health check failed. Rolling back..." >&2
  echo "  Run: git checkout HEAD~1 && bash deploy/scripts/deploy.sh"
  exit 1
fi

echo "=== Deploy complete ==="
