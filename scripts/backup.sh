#!/bin/bash

# Acadistra Backup Script - Server Only
# Run daily at 2 AM via cron: 0 2 * * * /home/acadistra/scripts/backup.sh

set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/acadistra/backups/$DATE"
SERVER_RETENTION_DAYS=30  # Keep 30 days on server for manual download

echo "Starting backup at $(date)"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
echo "Backing up database..."
docker exec acadistra_postgres pg_dump -U acadistra -Fc acadistra > $BACKUP_DIR/acadistra.dump

# Backup MinIO
echo "Backing up MinIO storage..."
docker exec acadistra_minio tar czf /tmp/minio_backup.tar.gz /data
docker cp acadistra_minio:/tmp/minio_backup.tar.gz $BACKUP_DIR/minio.tar.gz
docker exec acadistra_minio rm /tmp/minio_backup.tar.gz

# Backup configs
echo "Backing up configs..."
cp /home/acadistra/acadistra/.env $BACKUP_DIR/env.backup
cp /home/acadistra/acadistra/Caddyfile $BACKUP_DIR/Caddyfile.backup

# Create manifest
cat > $BACKUP_DIR/manifest.txt << EOF
Backup Date: $(date)
Database: acadistra (all schools)
Storage: MinIO data
Configs: .env, Caddyfile
EOF

# Compress backup
echo "Compressing backup..."
cd /home/acadistra/backups
tar czf ${DATE}.tar.gz $DATE
rm -rf $DATE

BACKUP_SIZE=$(du -h /home/acadistra/backups/${DATE}.tar.gz | cut -f1)
echo "Backup created: ${DATE}.tar.gz ($BACKUP_SIZE)"

# Clean old server backups
find /home/acadistra/backups -name "*.tar.gz" -type f -mtime +$SERVER_RETENTION_DAYS -delete

echo "Backup finished at $(date)"
