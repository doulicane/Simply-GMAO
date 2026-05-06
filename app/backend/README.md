# GMAO Ramondin — Backend API

> Application de Gestion de Maintenance Assistee par Ordinateur pour l'industrie des capsules aluminium.
> Hebergement 100 % local sur serveur dedie usine (Ubuntu 22.04, Docker).

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Runtime | Node.js 20 LTS |
| Langage | TypeScript (strict mode) |
| Framework | Express.js |
| ORM | Prisma + PostgreSQL 16 |
| Cache / Jobs | Redis 7 + BullMQ |
| Auth | JWT (access 15 min / refresh 7 jours) |
| Upload | Multer (stockage local) |
| Reverse Proxy | Nginx (SSL, gzip, cache) |

---

## Structure du projet

```
.
├── docker-compose.yml          # Orchestration des 4 services
├── Dockerfile                  # Build multi-etape de l'API
├── .env.example                # Variables d'environnement
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma           # Modele de donnees complet
│   └── seed.ts                # Donnees de test realistes
├── src/
│   ├── index.ts               # Point d'entree Express
│   ├── config/
│   │   ├── database.ts        # Singleton PrismaClient
│   │   └── redis.ts          # Client Redis / BullMQ
│   ├── middleware/
│   │   ├── auth.ts           # JWT + RBAC
│   │   ├── validation.ts     # Validation Zod
│   │   └── errorHandler.ts   # Gestion globale des erreurs
│   ├── utils/
│   │   └── logger.ts         # Winston logger
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── equipments.ts
│   │   ├── workOrders.ts
│   │   ├── preventive.ts
│   │   ├── stock.ts
│   │   ├── dashboard.ts
│   │   └── upload.ts
│   └── jobs/
│       └── preventiveGenerator.ts  # Job BullMQ auto-BT
├── nginx/
│   ├── nginx.conf             # Reverse proxy SSL
│   └── ssl/                   # Certificats TLS
├── uploads/                   # Fichiers uploades (volume Docker)
└── logs/                      # Logs applicatifs
```

---

## API REST (v1)

### Authentification
| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Login + password |
| POST | `/api/auth/refresh` | Rafraichir access token |
| GET | `/api/auth/me` | Profil connecte |

### Equipements
| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/equipments` | Liste paginee + filtres |
| GET | `/api/equipments/:id` | Fiche detaillee |
| POST | `/api/equipments` | Creation |
| PUT | `/api/equipments/:id` | Modification |
| DELETE | `/api/equipments/:id` | Suppression logique |
| GET | `/api/equipments/:id/history` | Historique BT |

### Bons de Travail
| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/work-orders` | Liste + filtres |
| POST | `/api/work-orders` | Creation |
| GET | `/api/work-orders/:id` | Detail |
| PUT | `/api/work-orders/:id` | Modification |
| PUT | `/api/work-orders/:id/status` | Changement statut |
| PUT | `/api/work-orders/:id/assign` | Affectation technicien |
| POST | `/api/work-orders/:id/start` | Demarrer intervention |
| POST | `/api/work-orders/:id/complete` | Terminer intervention |
| POST | `/api/work-orders/:id/validate` | Valider / cloturer |

### Maintenance Preventive
| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/preventive-plans` | Liste plans |
| POST | `/api/preventive-plans` | Creation plan |
| PUT | `/api/preventive-plans/:id` | Modification |
| DELETE | `/api/preventive-plans/:id` | Desactivation |
| POST | `/api/preventive-plans/:id/generate-wo` | Generer BT manuellement |
| GET | `/api/preventive-plans/upcoming` | Echeances a venir |

### Stocks
| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/stock` | Liste articles |
| POST | `/api/stock` | Creation article |
| PUT | `/api/stock/:id` | Modification |
| GET | `/api/stock/:id` | Fiche article |
| GET | `/api/stock/low-stock` | Articles sous seuil |
| POST | `/api/stock/movements` | Mouvement de stock |
| GET | `/api/stock/movements` | Historique mouvements |

### Dashboard
| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/dashboard/kpis` | KPIs agreges |
| GET | `/api/dashboard/alerts` | Alertes en cours |
| GET | `/api/dashboard/recent-work-orders` | BT recents |
| GET | `/api/dashboard/upcoming-preventive` | Preventifs a venir |

### Upload
| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/upload` | Upload document |
| POST | `/api/upload/photo` | Upload photo (5 Mo max) |

---

## Format de reponse JSON

Toutes les reponses suivent le format :

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

En cas d'erreur :
```json
{
  "success": false,
  "error": "Message d'erreur",
  "code": "ERROR_CODE"
}
```

---

## Deploiement local (Docker)

### 1. Preparer le serveur (Ubuntu 22.04)

```bash
# Mise a jour systeme
sudo apt update && sudo apt upgrade -y

# Installer Docker
sudo apt install -y docker.io docker-compose

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER
# Se reconnecter pour que le groupe prenne effet
```

### 2. Copier les fichiers

```bash
mkdir -p /opt/ramondin-gmao && cd /opt/ramondin-gmao
cp -r /chemin/livraison/backend/* .
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
nano .env
```

Modifier au minimum :
- `DB_PASSWORD` : mot de passe PostgreSQL
- `JWT_SECRET` : cle securisee (64+ caracteres aleatoires)

Generer une cle securisee :
```bash
openssl rand -base64 64
```

### 4. Generer les certificats SSL (auto-signes)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/server.key \
  -out nginx/ssl/server.crt \
  -subj "/C=ES/ST=Alava/L=Saint-Gaudens/O=Ramondin/CN=gmao.ramondin.local"
```

### 5. Lancer la stack

```bash
docker-compose up -d
```

### 6. Initialiser la base de donnees

```bash
# Appliquer les migrations Prisma
docker-compose exec api npx prisma migrate deploy

# Generer le client Prisma
docker-compose exec api npx prisma generate

# Seeder les donnees de test
docker-compose exec api npx ts-node prisma/seed.ts
```

### 7. Verifier l'installation

```bash
# Etat des conteneurs
docker-compose ps

# Healthcheck API
curl -k https://gmao.ramondin.local/api/health

# Connexion (login = responsable@ramondin.local / password = ramondin2025)
curl -k -X POST https://gmao.ramondin.local/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"responsable@ramondin.local","password":"ramondin2025"}'
```

### 8. Logs et monitoring

```bash
# Logs de l'API en temps reel
docker-compose logs -f api

# Logs de la base
docker-compose logs -f postgres

# Statistiques conteneurs
docker stats
```

---

## Utilisateurs de test (seed)

| Email | Role | Mot de passe |
|-------|------|-------------|
| responsable@ramondin.local | Responsable Maintenance | ramondin2025 |
| tech1@ramondin.local | Technicien | ramondin2025 |
| tech2@ramondin.local | Technicien | ramondin2025 |
| operateur@ramondin.local | Operateur | ramondin2025 |
| magasinier@ramondin.local | Magasinier | ramondin2025 |
| hse@ramondin.local | HSE | ramondin2025 |
| admin@ramondin.local | Administrateur | ramondin2025 |

---

## Backup et restauration

### Backup quotidien automatique (cron)

```bash
# Ajouter dans crontab (crontab -e)
0 2 * * * /opt/ramondin-gmao/scripts/backup.sh
```

### Backup manuel

```bash
# Dump PostgreSQL
docker-compose exec -T postgres pg_dump -U gmao ramondin_gmao > backup_$(date +%Y%m%d).sql

# Sauvegarder les uploads
tar czf uploads_backup_$(date +%Y%m%d).tar.gz /opt/ramondin-gmao/uploads
```

### Restauration

```bash
# Restaurer la base
cat backup_YYYYMMDD.sql | docker-compose exec -T postgres psql -U gmao -d ramondin_gmao
```

---

## Maintenance

### Mise a jour sans coupure

```bash
# 1. Backup complet
./scripts/backup.sh

# 2. Pull / rebuild des images
docker-compose pull
docker-compose build

# 3. Redeploiement Blue/Green
docker-compose up -d

# 4. Migrations
docker-compose exec api npx prisma migrate deploy
```

### Arret propre

```bash
docker-compose down
```

### Redemarrage

```bash
docker-compose restart api
```

---

## Securite

- HTTPS/TLS 1.2+ obligatoire
- JWT access token 15 min, refresh token 7 jours
- Mots de passe hashes avec bcrypt (cout 12)
- Rate limiting : 500 req/15 min par IP
- Headers de securite (HSTS, CSP, X-Frame-Options)
- Audit trail sur toutes les actions critiques
- Donnees industrielles 100 % local (pas de cloud externe)

---

## Licence

Proprietaire — Ramondin S.A.  
Non autorise a la distribution externe.
