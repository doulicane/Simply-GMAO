#!/bin/bash
set -e

echo "=========================================="
echo "  Build + Serve Simply GMAO (HTTPS)"
echo "=========================================="

# 1. Build du frontend
echo "🔨 Build du frontend..."
cd "$(dirname "$0")/../app"
npm run build

# 2. Build du backend
echo "🔨 Build du backend..."
cd backend
npm run build

# 3. Lancer le serveur HTTPS
echo "🚀 Lancement du serveur HTTPS..."
echo ""
echo "   URL : https://<IP>:3000"
echo ""
npm start
