#!/bin/bash

# Run this on YOUR COMPUTER to download backups from server
# Works even if your computer IP changes or internet is unreliable

SERVER_IP="YOUR_SERVER_IP"
SERVER_USER="root"
LOCAL_BACKUP_DIR="$HOME/acadistra-backups"
RETENTION_DAYS=30

echo "Downloading backups from server at $(date)"

# Create local directory
mkdir -p $LOCAL_BACKUP_DIR

# Download all backups from server
rsync -avz --progress \
  $SERVER_USER@$SERVER_IP:/home/acadistra/backups/*.tar.gz \
  $LOCAL_BACKUP_DIR/ 2>/dev/null || echo "⚠ Failed to download (check internet connection)"

# Clean old local backups
find $LOCAL_BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Download completed at $(date)"
ls -lh $LOCAL_BACKUP_DIR
