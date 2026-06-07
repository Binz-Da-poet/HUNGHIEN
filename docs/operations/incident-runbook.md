# Hùng Hiền - Incident Runbook

## Incidents and Responses

### Database Unavailable

**Symptom:** `/api/health` returns 503, `database: "error"`

**Response:**
1. Check PostgreSQL: `systemctl status postgresql`
2. Check disk space: `df -h`
3. Check connection pool: `SELECT count(*) FROM pg_stat_activity;`
4. Restart PostgreSQL if needed: `systemctl restart postgresql`
5. After recovery: `systemctl restart hung-hien-api`

### Uploads Unavailable

**Symptom:** Images return 404, uploads fail with disk errors

**Response:**
1. Check mount: `mount | grep uploads`
2. Check disk: `df -h /opt/hung-hien/uploads`
3. Verify permissions: `ls -la /opt/hung-hien/uploads`
4. Restore from backup if files lost: follow backup/restore procedure

### Failed Migration

**Symptom:** Deploy fails at migration step

**Response:**
1. Do NOT rollback database manually
2. Check migration status: `pnpm --filter api exec prisma migrate status`
3. Review migration SQL for conflicts
4. If deploy script failed, restart services to resume from previous state
5. Create a new migration with fix and redeploy

### Credential/Session Compromise

**Symptom:** Unauthorized admin access suspected

**Response:**
1. Rotate `SESSION_SECRET` in `/etc/hung-hien/api.env`
2. Clear admin sessions: restart API service
3. Change admin password
4. Review recent access logs: `journalctl -u hung-hien-api -n 1000`
5. Enable additional IP restriction on nginx if needed

### Overselling or Incorrect Stock

**Symptom:** Customer complaints about out-of-stock items being sold

**Response:**
1. Check stock values: `SELECT id, name, stock FROM "Product";`
2. Review recent orders for the product
3. Cancel oversold orders and notify customers
4. If pattern persists, review checkout stock validation logic
5. Consider adding pessimistic stock locking

### Rollback Procedure

If any issue requires rolling back to a previous deploy:

```bash
cd /opt/hung-hien
git log --oneline -5  # find the last good commit
git checkout <good_commit_sha>
bash deploy/scripts/deploy.sh
```

### Communication Checklist

When an incident occurs:

1. [ ] Identify affected services and customers
2. [ ] Post status update
3. [ ] Implement fix
4. [ ] Verify resolution
5. [ ] Write post-mortem (what happened, root cause, prevention)

### Key Contacts

| Role | Contact |
|------|---------|
| Developer | [add contact] |
| System Admin | [add contact] |
| Emergency | [add contact] |
