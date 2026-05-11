#!/bin/bash
# =============================================================================
# Script de déploiement GMAO Simply GMAO — Production
# =============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "============================================================="
echo "  Deploiement GMAO Simply GMAO"
echo "============================================================="

cd "$PROJECT_DIR"

# --- Charger les variables d'environnement ---
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# --- Build frontend ---
echo "[1/4] Build frontend..."
cd app
npm ci
npm run build:deploy
cd ..

# --- Build backend ---
echo "[2/4] Build backend..."
cd app/backend
npm ci
npm run build
cd ../..

# --- Migrations base de donnees ---
echo "[3/4] Migrations Prisma..."
cd app/backend
npx prisma migrate deploy
cd ../..

# --- Deploy Docker Compose ---
echo "[4/4] Demarrage des conteneurs..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# --- Healthcheck ---
echo "Verification healthcheck..."
sleep 5
curl -sf http://localhost/api/health || {
  echo "ERREUR : Healthcheck echoue !"
  exit 1
}

echo ""
echo "============================================================="
echo "  Deploiement termine avec succes !"
echo "  Frontend : http://localhost"
echo "  API      : http://localhost/api"
echo "  Health   : http://localhost/api/health"
echo "============================================================="
