#!/bin/bash
# restore.sh — Restore Docker volume from backup archive

BACKUP_FILE="${1:-disaster-recovery/backup.tar.gz}"
NEW_VOLUME="${2:-lab4-dr-restored}"

echo "=== Lab4 Disaster Recovery — Restore ==="
echo "Backup  : $BACKUP_FILE"
echo "Volume  : $NEW_VOLUME"
echo ""

docker volume create "$NEW_VOLUME"

docker run --rm \
  -v "${NEW_VOLUME}:/data" \
  -v "$(pwd)/disaster-recovery:/backup" \
  alpine sh -c "cd / && tar xzf /backup/$(basename $BACKUP_FILE)"

echo ""
echo "Restore complete. Volume: $NEW_VOLUME"
docker volume inspect "$NEW_VOLUME"
