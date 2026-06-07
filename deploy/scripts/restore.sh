#!/bin/bash
set -euo pipefail

# Hùng Hiền Restore Script
# Restores PostgreSQL database and uploads from a backup.

: "${DATABASE_URL:?Must set DATABASE_URL}"
: "${UPLOADS_DIR:?Must set UPLOADS_DIR}"
: "${BACKUP_DIR:?Must set BACKUP_DIR}"

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <backup-timestamp>"
  echo "Example: $0 20260607_120000"
  echo ""
  echo "Available backups:"
  find "$BACKUP_DIR" -maxdepth 1 -name "hung-hien_*" -type d | sort
  exit 1
fi

BACKUP_TIMESTAMP="$1"
BACKUP_PATH="${BACKUP_DIR}/hung-hien_${BACKUP_TIMESTAMP}"

if [ ! -d "$BACKUP_PATH" ]; then
  echo "ERROR: Backup not found: $BACKUP_PATH" >&2
  exit 1
fi

echo "=== Hùng Hiền Restore $BACKUP_TIMESTAMP ==="

# --- Verification ---
echo "Verifying checksums..."
cd "$BACKUP_PATH"
sha256sum -c database.dump.sha256
sha256sum -c uploads.tar.gz.sha256
echo "Checksums: OK"

# --- Safety gate ---
if [ "${CONFIRM_RESTORE:-}" != "yes" ]; then
  echo "ERROR: Set CONFIRM_RESTORE=yes to proceed." >&2
  exit 1
fi

# --- Stop API ---
echo "Stopping API..."
sudo systemctl stop hung-hien-api.service || true

# --- Pre-restore backup ---
echo "Creating pre-restore backup..."
PRE_RESTORE_DIR="${BACKUP_DIR}/pre-restore_${BACKUP_TIMESTAMP}_$(date +%H%M%S)"
mkdir -p "$PRE_RESTORE_DIR"
pg_dump --format=custom --file "${PRE_RESTORE_DIR}/database.dump" "$DATABASE_URL" || true
echo "Pre-restore snapshot saved to: $PRE_RESTORE_DIR"

# --- Restore database ---
echo "Restoring database..."
pg_restore --clean --if-exists --no-owner --no-comments -d "$DATABASE_URL" "${BACKUP_PATH}/database.dump"
echo "Database restore: OK"

# --- Restore uploads ---
echo "Restoring uploads..."
rm -rf "$UPLOADS_DIR"
mkdir -p "$UPLOADS_DIR"
tar -xzf "${BACKUP_PATH}/uploads.tar.gz" -C "$UPLOADS_DIR"
echo "Uploads restore: OK"

# --- Migration check ---
echo "Running migration status..."
pnpm --filter api exec prisma migrate status || echo "WARNING: Migration status check failed"

# --- Restart API ---
echo "Starting API..."
sudo systemctl start hung-hien-api.service
sleep 5

# --- Health check ---
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "fail")
echo "API health: $API_HEALTH"
if [ "$API_HEALTH" != "200" ]; then
  echo "ERROR: API health check failed after restore!" >&2
  exit 1
fi

echo "=== Restore complete ==="
