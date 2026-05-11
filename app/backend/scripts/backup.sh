#!/bin/bash
# =============================================================================
# Script de backup quotidien — GMAO Simply GMAO
# =============================================================================
# A executer via cron : 0 2 * * * /opt/simply-gmao-gmao/scripts/backup.sh
# =============================================================================

set -e

BACKUP_DIR="/opt/simply-gmao-gmao/backups"
UPLOADS_DIR="/opt/simply-gmao-gmao/uploads"
COMPOSE_FILE="/opt/simply-gmao-gmao/docker-compose.yml"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

echo "[BACKUP] Demarrage du backup : ${DATE}"

# Creation du repertoire de backup
mkdir -p "${BACKUP_DIR}"

# ---------------------------------------------------------------------------
# 1. Backup PostgreSQL
# ---------------------------------------------------------------------------
echo "[BACKUP] Dump PostgreSQL..."
docker-compose -f "${COMPOSE_FILE}" exec -T postgres pg_dump \
  -U gmao -d simply-gmao_gmao -Fc \
  > "${BACKUP_DIR}/db_backup_${DATE}.dump"

# ---------------------------------------------------------------------------
# 2. Backup des fichiers uploads
# ---------------------------------------------------------------------------
echo "[BACKUP] Backup uploads..."
tar czf "${BACKUP_DIR}/uploads_backup_${DATE}.tar.gz" -C "${UPLOADS_DIR}" .

# ---------------------------------------------------------------------------
# 3. Backup docker-compose + .env
# ---------------------------------------------------------------------------
echo "[BACKUP] Backup configuration..."
tar czf "${BACKUP_DIR}/config_backup_${DATE}.tar.gz" -C /opt/simply-gmao-gmao \
  docker-compose.yml .env nginx/

# ---------------------------------------------------------------------------
# 4. Nettoyage des vieux backups (> 30 jours)
# ---------------------------------------------------------------------------
echo "[BACKUP] Nettoyage vieux backups (> ${RETENTION_DAYS} jours)..."
find "${BACKUP_DIR}" -name "*.dump" -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

# ---------------------------------------------------------------------------
# 5. Recapitulatif
# ---------------------------------------------------------------------------
echo "[BACKUP] Termine avec succes."
echo "  - DB   : ${BACKUP_DIR}/db_backup_${DATE}.dump"
echo "  - Files: ${BACKUP_DIR}/uploads_backup_${DATE}.tar.gz"
echo "  - Config: ${BACKUP_DIR}/config_backup_${DATE}.tar.gz"
echo "  - Taille totale: $(du -sh ${BACKUP_DIR} | cut -f1)"
