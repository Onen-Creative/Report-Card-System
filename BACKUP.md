# Backup Guide

## How It Works

**Server creates backups automatically** (no internet needed)
- Runs every night at 2 AM
- Keeps 30 days on server
- Location: `/home/acadistra/backups/`

**You download when internet is available** (pull method)
- Download anytime you want
- Works with unreliable internet
- No server configuration needed

---

## Download Backups to Your Computer

### One-Time Setup

```bash
# Setup SSH key (no password needed)
ssh-keygen -t rsa
ssh-copy-id root@YOUR_SERVER_IP

# Create backup folder
mkdir -p ~/acadistra-backups
```

### Download Latest Backup

```bash
# Download all backups
scp root@YOUR_SERVER_IP:/home/acadistra/backups/*.tar.gz ~/acadistra-backups/

# Or download specific backup
scp root@YOUR_SERVER_IP:/home/acadistra/backups/20250128_020000.tar.gz ~/acadistra-backups/
```

### Automated Download (Optional)

**On your computer, create script:**
```bash
cat > ~/download-backups.sh << 'EOF'
#!/bin/bash
echo "Downloading backups from server..."
rsync -avz --progress root@YOUR_SERVER_IP:/home/acadistra/backups/*.tar.gz ~/acadistra-backups/
echo "Download complete!"
ls -lh ~/acadistra-backups/
EOF

chmod +x ~/download-backups.sh
```

**Run whenever you have internet:**
```bash
~/download-backups.sh
```

---

## Backup Locations

| Location | Retention | Internet Required |
|----------|-----------|-------------------|
| Server | 30 days | No |
| Your Computer | Forever (until you delete) | Yes (only when downloading) |

---

## Storage Requirements

| Schools | Daily Backup | 30 Days (Server) |
|---------|--------------|------------------|
| 5 schools | 200MB | 6GB |
| 10 schools | 500MB | 15GB |
| 20 schools | 1GB | 30GB |

---

## List Available Backups

```bash
# See what backups are on server
ssh root@YOUR_SERVER_IP "ls -lh /home/acadistra/backups/"
```

---

## Restore Backup

```bash
# 1. Extract backup
tar xzf 20250128_020000.tar.gz
cd 20250128_020000

# 2. Restore database
docker exec -i acadistra_postgres pg_restore -U acadistra -d acadistra -c < acadistra.dump

# 3. Restore files
docker cp minio.tar.gz acadistra_minio:/tmp/
docker exec acadistra_minio tar xzf /tmp/minio.tar.gz -C /

# 4. Restore configs
cp env.backup /home/acadistra/acadistra/.env
cp Caddyfile.backup /home/acadistra/acadistra/Caddyfile

# 5. Restart
docker compose -f docker-compose.prod.yml restart
```

---

## Advantages of Pull Method

✅ **No internet needed on server** - Backups always work
✅ **Download when convenient** - When internet is good
✅ **Works with changing IPs** - Your IP can change anytime
✅ **Simple** - Just one command to download
✅ **Free** - $0/month

---

## Quick Reference

```bash
# Download all backups
scp root@YOUR_SERVER_IP:/home/acadistra/backups/*.tar.gz ~/acadistra-backups/

# List server backups
ssh root@YOUR_SERVER_IP "ls -lh /home/acadistra/backups/"

# Check local backups
ls -lh ~/acadistra-backups/
```

**Perfect for unreliable internet!** 🎉
