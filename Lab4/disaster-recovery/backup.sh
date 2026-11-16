#!/bin/bash
# backup.sh — Backup Docker volume data for disaster recovery

VOLUME_NAME="${1:-lab4-dr-vol}"
BACKUP_DIR="$(dirname "$0")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.tar.gz"

echo "=== Lab4 Disaster Recovery — Backup ==="
echo "Volume  : $VOLUME_NAME"
echo "Backup  : $BACKUP_FILE"
echo ""

docker run --rm \
  -v "${VOLUME_NAME}:/data" \
  -v "${BACKUP_DIR}:/backup" \
  alpine tar czf "/backup/backup_${TIMESTAMP}.tar.gz" /data

echo ""
echo "Backup complete: $BACKUP_FILE"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null
