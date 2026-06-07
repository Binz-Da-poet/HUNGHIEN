# Hùng Hiền - VPS Deployment Guide

## Prerequisites

- Ubuntu 22.04+ with non-root `hung-hien` user
- Node.js 20, pnpm 9 installed globally
- PostgreSQL 16

## First Deployment

### 1. Create PostgreSQL database

```sql
CREATE USER hung_hien WITH PASSWORD 'your-password';
CREATE DATABASE hung_hien OWNER hung_hien;
```

### 2. Create environment files

```
# /etc/hung-hien/api.env
DATABASE_URL=postgresql://hung_hien:password@localhost:5432/hung_hien
SESSION_SECRET=generate-a-random-secret
SESSION_TTL=86400
NODE_ENV=production
PORT=3001
UPLOADS_DIR=/opt/hung-hien/uploads
STORE_URL=https://shop.example.vn
ADMIN_URL=https://admin.example.vn
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
API_INTERNAL_URL=http://localhost:3001

# /etc/hung-hien/storefront.env
NEXT_PUBLIC_API_URL=https://shop.example.vn/api
API_INTERNAL_URL=http://localhost:3001

# /etc/hung-hien/admin.env
NEXT_PUBLIC_API_URL=https://admin.example.vn/api
API_INTERNAL_URL=http://localhost:3001
```

### 3. Create uploads directory

```bash
sudo mkdir -p /opt/hung-hien/uploads
sudo chown hung-hien:hung-hien /opt/hung-hien/uploads
```

### 4. Clone and deploy

```bash
git clone <repo> /opt/hung-hien
cd /opt/hung-hien
bash deploy/scripts/deploy.sh
```

### 5. Set up Nginx

```bash
sudo cp deploy/nginx/hung-hien.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/hung-hien.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Set up TLS with Certbot

```bash
sudo certbot --nginx -d shop.example.vn -d admin.example.vn
```

### 7. Install systemd units

```bash
sudo cp deploy/systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable hung-hien-api hung-hien-storefront hung-hien-admin
```

## Rollback

To rollback to the previous deploy:

```bash
cd /opt/hung-hien
git checkout HEAD~1
bash deploy/scripts/deploy.sh
```

## Monitoring

Check service status:

```bash
systemctl status hung-hien-api hung-hien-storefront hung-hien-admin
```

Check logs:

```bash
journalctl -u hung-hien-api -f
```
