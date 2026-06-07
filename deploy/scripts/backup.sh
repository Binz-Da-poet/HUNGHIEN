#!/bin/bash
set -euo pipefail

# Hùng Hiền Backup Script
# Backs up PostgreSQL database and uploads directory.

: "${DATABASE_URL:?Must set DATABASE_URL}"
: "${UPLOADS_DIR:?Must set UPLOADS_DIR}"
: "${BACKUP_DIR:?Must set BACKUP_DIR}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BACKUP_NAME="hung-hien_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
mkdir -p "$BACKUP_PATH"

echo "=== Hùng Hiền Backup $TIMESTAMP ==="

# --- Database backup ---
echo "Backing up database..."
pg_dump --format=custom --file "${BACKUP_PATH}/database.dump" "$DATABASE_URL"
echo "Database dump: OK"

# --- Uploads backup ---
echo "Backing up uploads..."
if [ -d "$UPLOADS_DIR" ]; then
  tar -czf "${BACKUP_PATH}/uploads.tar.gz" -C "$UPLOADS_DIR" .
  echo "Uploads archive: OK"
else
  echo "WARNING: UPLOADS_DIR does not exist, skipping uploads backup."
  tar -czf "${BACKUP_PATH}/uploads.tar.gz" --files-from /dev/null
fi

# --- Checksums ---
cd "$BACKUP_PATH"
sha256sum database.dump > database.dump.sha256
sha256sum uploads.tar.gz > uploads.tar.gz.sha256

# --- Metadata ---
cat > metadata.json <<EOF
{
  "timestamp": "$TIMESTAMP",
  "commit": "$COMMIT_SHA",
  "database_file": "database.dump",
  "uploads_file": "uploads.tar.gz"
}
EOF

echo "Backup created: $BACKUP_PATH"

# --- Retention ---
echo "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -maxdepth 1 -name "hung-hien_*" -type d -mtime "+$RETENTION_DAYS" -exec rm -rf {} \; 2>/dev/null || true

echo "=== Backup complete ==="
