# ============================================
# Dockerfile multi-etape — GMAO Ramondin API
# ============================================

# --------------------------
# Etape 1 : Build
# --------------------------
FROM node:20-alpine AS builder

# Installation des dependences systemes pour Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copie des fichiers de dependences
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dependences
RUN npm ci

# Copie du code source
COPY . .

# Compilation TypeScript
RUN npm run build

# Generation du client Prisma
RUN npx prisma generate

# --------------------------
# Etape 2 : Production
# --------------------------
FROM node:20-alpine AS production

# Installation des dependences systemes pour Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Copie des fichiers necessaires depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Creation du repertoire d'uploads
RUN mkdir -p /data/uploads/photos /data/uploads/documents

# Exposition du port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Lancement de l'application
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && node dist/index.js"]
