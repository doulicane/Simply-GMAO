#!/bin/bash
# =============================================================================
# Script de rollback GMAO Simply GMAO
# =============================================================================
# Restaure la version précédente des images Docker et redémarre les services.
# Usage : ./scripts/rollback.sh [TAG]
# =============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TAG="${1:-previous}"

cd "$PROJECT_DIR"

echo "🔙 Rollback GMAO Simply GMAO vers le tag : $TAG"

# Vérifier que les images existent
if ! docker images | grep -q "gmao-backend.*$TAG"; then
  echo "❌ Image gmao-backend:$TAG introuvable"
  echo "   Images disponibles :"
  docker images | grep gmao-backend || true
  exit 1
fi

# Backup rapide de la DB actuelle
echo "💾 Backup rapide avant rollback..."
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U simply-gmao simply-gmao_gmao > "backups/pre-rollback-$(date +%Y%m%d-%H%M%S).sql" 2>/dev/null || echo "⚠️ Backup ignoré (DB non dispo)"

# Rollback images
echo "🐳 Restauration des images..."
docker tag gmao-backend:$TAG gmao-backend:latest
docker tag gmao-nginx:$TAG gmao-nginx:latest || true

# Redémarrage
echo "🚀 Redémarrage des services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Rollback terminé. Vérifiez l'état avec : docker-compose -f docker-compose.prod.yml ps"
