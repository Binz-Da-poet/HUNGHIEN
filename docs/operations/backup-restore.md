# Hùng Hiền - Backup and Restore

## Scheduled Backup

Set up a systemd timer for daily backups:

```ini
# /etc/systemd/system/hung-hien-backup.service
[Unit]
Description=Hùng Hiền Daily Backup

[Service]
User=hung-hien
Group=hung-hien
WorkingDirectory=/opt/hung-hien
EnvironmentFile=/etc/hung-hien/api.env
Environment=BACKUP_DIR=/var/backups/hung-hien
Environment=UPLOADS_DIR=/opt/hung-hien/uploads
Environment=RETENTION_DAYS=30
ExecStart=/bin/bash deploy/scripts/backup.sh

# /etc/systemd/system/hung-hien-backup.timer
[Unit]
Description=Daily backup at 3 AM

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl enable hung-hien-backup.timer
sudo systemctl start hung-hien-backup.timer
```

## Manual Backup

```bash
cd /opt/hung-hien
DATABASE_URL=postgresql://... UPLOADS_DIR=/opt/hung-hien/uploads BACKUP_DIR=/var/backups/hung-hien bash deploy/scripts/backup.sh
```

## Restore

```bash
cd /opt/hung-hien

# List available backups
bash deploy/scripts/restore.sh

# Restore a specific backup
CONFIRM_RESTORE=yes bash deploy/scripts/restore.sh 20260607_030000
```

## Monthly Restore Drill

Every month, perform a restore drill against a disposable database:

1. Create a temporary database: `createdb hung_hien_restore_test`
2. Restore: `CONFIRM_RESTORE=yes DATABASE_URL=postgresql://.../hung_hien_restore_test bash deploy/scripts/restore.sh <timestamp>`
3. Verify data integrity
4. Drop: `dropdb hung_hien_restore_test`
5. Record date and result in this document.

### Drill Log

| Date | Result | Notes |
|------|--------|-------|
| -    | -      | -     |
