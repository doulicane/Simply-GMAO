# PROMPT DE REFONTE COMPLETE — Simply GMAO
## Pour Kimi Code (Mode Plan)

---

## CONTEXTE

Tu dois realiser une refonte complete du projet **Simply GMAO** (https://github.com/doulicane/Simply-GMAO), une application web de Gestion de Maintenance Assistee par Ordinateur (GMAO) pour PME industrielles (secteur capsules aluminium). Le projet existe en MVP mais comporte de nombreux problemes critiques de securite, d'architecture et d'UX.

**Architecture cible:**
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Zustand + TanStack Query
- **Backend:** Node.js 20 + Express + TypeScript + Prisma ORM + PostgreSQL 16 + Redis 7
- **PWA:** Service Worker + IndexedDB (Dexie.js) + mode offline-first
- **Deploy:** Docker Compose + Nginx + Ubuntu Server local

---

## PHASE 1: FONDATIONS SECURITE & CONFIGURATION (Priorite: CRITIQUE)

### 1.1 Securite Backend

**[ ] JWT Secret — Securisation:**
- Supprimer le fallback `?? 'change_me_in_production'` dans le middleware auth
- Lancer une erreur fatale au demarrage si `JWT_SECRET` n'est pas defini ou fait moins de 32 caracteres
- Generer automatiquement un secret securise si premier demarrage (stocker dans un fichier `.jwt_secret` lu par le Docker Compose)
- Ajouter `JWT_SECRET_MIN_LENGTH=32` dans la validation env

**[ ] Refresh Token Blacklisting:**
- Implementer un stockage Redis des refresh tokens emis (key: `refresh:{userId}:{tokenJti}`, TTL = 7 jours)
- Endpoint `/auth/logout` doit blacklister le refresh token immediatement
- Endpoint `/auth/refresh` doit verifier que le token n'est pas blackliste avant de generer un nouvel access token
- Nettoyage automatique des tokens expires via Redis TTL

**[ ] Suppression du header `x-demo-role`:**
- Supprimer completement le bypass d'authentification via `x-demo-role` du middleware `authenticate()`
- Le mode demo doit passer par des credentials mock valides, jamais par un header

**[ ] Validation renforcee uploads:**
- Configurer Multer avec une whitelist de MIME types : `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Limite de taille : 5 Mo pour images, 20 Mo pour PDF
- Renommage des fichiers avec UUID v4 (pas de preservation du nom original pour eviter les attaques path traversal)
- Stockage sous `/uploads/YYYY/MM/UUID.ext`

**[ ] CORS strict:**
- Desactiver `origin: '*'` meme en developpement
- Lire `CORS_ORIGIN` depuis les variables d'environnement
- Valeur par defaut: `http://localhost:5173`

**[ ] Protection brute-force:**
- Appliquer le rate limiter `authLimiter` aussi sur `/auth/refresh`
- Ajouter un rate limiter specifique pour les endpoints sensibles (upload: 10/h, export PDF: 5/h)
- Implementer un lockout progressif: apres 5 echecs, delai de 1 min, puis 5 min, puis 15 min

### 1.2 Configuration Environment

**[ ] Validation des variables d'environnement:**
- Utiliser une librairie de validation env (ex: `envalid` ou `zod` pour parser `process.env`)
- Variables OBLIGATOIRES avec validation:
  - `DATABASE_URL` (format postgresql:// valide)
  - `REDIS_URL` (format redis:// valide)
  - `JWT_SECRET` (min 32 caracteres)
  - `NODE_ENV` (enum: development, production, test)
  - `PORT` (number, default 3000)
- Variables OPTIONNELLES avec defaults:
  - `CORS_ORIGIN` (default: localhost:5173)
  - `UPLOAD_DIR` (default: ./uploads)
  - `RATE_LIMIT_MAX` (default: 500)
  - `LOG_LEVEL` (default: info)
- Lancer une erreur explicative au demarrage si une variable obligatoire est manquante ou invalide

### 1.3 Frontend — Configuration Runtime

**[ ] Variable d'environnement Vite pour l'API:**
- Creer `.env.example` dans `app/` avec `VITE_API_URL=http://localhost:3001/api`
- Modifier `authStore.ts` pour utiliser `import.meta.env.VITE_API_URL`
- Documenter dans README: copier `.env.example` vers `.env` et adapter

**[ ] Mode Mock configurable:**
- Remplacer `isMockMode = () => true` par `isMockMode = () => import.meta.env.VITE_MOCK_MODE === 'true'`
- Par defaut: `VITE_MOCK_MODE=false` (l'app utilise le backend reel)
- En developpement seulement, permettre `VITE_MOCK_MODE=true` pour travailler sans backend
- Le mode mock doit etre EXPLICITEMEMENT active, jamais par defaut

---

## PHASE 2: ARCHITECTURE BACKEND — ROBUSTESSE (Priorite: HAUTE)

### 2.1 Documentation API (Swagger/OpenAPI)

**[ ] Integration Swagger UI:**
- Installer `swagger-jsdoc` + `swagger-ui-express`
- Documenter tous les endpoints avec JSDoc annotations `@openapi`
- Endpoint `/api/docs` pour acceder a la documentation interactive
- Groupes de routes: Auth, Equipements, Bons de Travail, Stocks, Planification, Preventif, Documents, Notifications
- Chaque endpoint documente avec: description, params, body schema, response codes, auth requise

### 2.2 Pagination Universelle

**[ ] Middleware/Helper de pagination:**
- Creer un helper `paginate({ page, limit, where, orderBy, include })` qui retourne:
  ```json
  {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```
- Appliquer a TOUTES les routes GET listantes:
  - `GET /equipments`, `GET /work-orders`, `GET /stock`, `GET /tickets`
  - `GET /documents`, `GET /notifications`, `GET /audit-logs`
- Valeurs par defaut: `page=1`, `limit=20`, max `limit=100`
- Valider les params avec Zod

### 2.3 Validation Input Complete

**[ ] Schemas Zod pour toutes les routes:**
- `POST /equipments` — validation complete des champs (code unique, criticite enum, ligneId existant)
- `POST /work-orders` — validation des relations (equipmentId, demandeurId, technicienId existants)
- `POST /stock/movement` — validation: quantite > 0, type enum, stockItemId existant
- `PUT/PATCH` endpoints — validation partielle (champs modifies uniquement)
- Middleware `validate()` deja present a generaliser a TOUTES les routes modifiantes

### 2.4 Healthcheck Approfondi

**[ ] Endpoint `/api/health` ameliore:**
```json
{
  "status": "UP",
  "timestamp": "2026-05-08T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": { "status": "UP", "responseTimeMs": 12 },
    "redis": { "status": "UP", "responseTimeMs": 3 },
    "storage": { "status": "UP", "freeSpaceGb": 450 }
  },
  "uptime": 86400
}
```
- Verifier la connectivite PostgreSQL avec une requete simple (`SELECT 1`)
- Verifier Redis avec `PING`
- Verifier l'espace disque du dossier uploads
- Si un service est DOWN: status 503 avec details

### 2.5 Soft Delete & Audit Trail

**[ ] Soft Delete sur tous les modeles metier:**
- Ajouter `deletedAt DateTime? @map("deleted_at")` sur: User, Equipment, WorkOrder, StockItem, Document, PreventivePlan, Ticket
- Modifier les requetes Prisma pour filter par defaut: `where: { deletedAt: null }`
- Endpoint `DELETE /{resource}/:id` fait un `update({ deletedAt: new Date() })` au lieu de `delete()`
- Endpoint `POST /{resource}/:id/restore` pour restaurer un soft-delete

**[ ] Audit Trail automatique:**
- Middleware Prisma `$extends` pour loguer automatiquement CREATE, UPDATE, DELETE
- Table `audit_logs` deja existante — l'alimenter automatiquement
- Stocker: userId (depuis req.user), action, entityType, entityId, oldValues, newValues, timestamp, IP

### 2.6 WebSocket — Temps Reel

**[ ] Integration Socket.IO:**
- Installer `socket.io` cote serveur + `socket.io-client` cote client
- Namespace `/notifications` pour les evenements temps reel:
  - `notification:new` — nouveau BT assigne, changement de statut
  - `workorder:updated` — mise a jour d'un BT suivi
  - `stock:alert` — stock sous seuil critique
- Auth WebSocket via token JWT transmis dans le handshake
- Rooms par userId et par role pour un routage cible

---

## PHASE 3: ARCHITECTURE FRONTEND — MODERNISATION (Priorite: HAUTE)

### 3.1 Code Splitting & Lazy Loading

**[ ] React.lazy() pour toutes les pages:**
```typescript
// Remplacer les imports statiques par:
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/Login'));
const Equipements = lazy(() => import('@/pages/Equipements'));
// ... etc pour TOUTES les pages
```
- Wrapper les routes avec `<Suspense fallback={<PageSkeleton />}>`
- Creer un composant `PageSkeleton` avec layout de chargement (shimmer effect)

**[ ] Prefetching de routes:**
- Au survol d'un lien de navigation, prefetcher la page avec `const module = await import('@/pages/xxx')`
- Prioriser les pages les plus visitees (Dashboard, Bons de Travail)

### 3.2 TanStack Query (React Query)

**[ ] Remplacer fetch() brut par TanStack Query:**
- Installer `@tanstack/react-query` + `@tanstack/react-query-devtools`
- Creer un `QueryClient` avec configuration:
  ```typescript
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 min
        retry: 2,
        refetchOnWindowFocus: false,
      }
    }
  });
  ```

**[ ] Custom hooks par domaine:**
- `useEquipments()` — `useQuery({ queryKey: ['equipments'], queryFn: fetchEquipments })`
- `useWorkOrders(filters)` — avec invalidation apres mutation
- `useStocks()`, `useTickets()`, `useDashboardData()`
- `useCreateWorkOrder()`, `useUpdateWorkOrder()` — `useMutation` avec `onSuccess: invalidateQueries`

**[ ] Gestion du cache:**
- Invalidation selective apres mutations
- Prefetching des donnees liees (detail d'un equipement au clic)
- Optimistic updates pour les changements de statut rapides

### 3.3 Error Boundary & Gestion d'Erreurs

**[ ] Error Boundary React:**
- Creer `ErrorBoundary.tsx` avec fallback UI (message d'erreur, bouton retry, redirection login si 401)
- Wrapper l'application dans `App.tsx`
- Logger les erreurs vers le backend (`/api/logs/client`)

**[ ] Gestion d'erreur API uniforme:**
- Creer un interceptor/fetch wrapper qui:
  - Sur 401: deconnexion automatique + redirection vers login
  - Sur 403: toast "Acces refuse"
  - Sur 404: toast "Ressource introuvable"
  - Sur 422: afficher les erreurs de validation par champ
  - Sur 500: toast "Erreur serveur, veuillez reessayer"
  - Sur network error: toast "Connexion perdue" + mode degrade

### 3.4 PWA — Offline First

**[ ] Service Worker avec Workbox:**
- Installer `workbox-window` + `workbox-build` (dev)
- Generer un SW qui:
  - Precache l'app shell (index.html, JS, CSS bundles)
  - Runtime cache pour les appels API avec NetworkFirst + fallback cache
  - Cache images avec CacheFirst + expiration (30 jours, max 100 fichiers)
  - Background sync pour les mutations en attente

**[ ] Manifest PWA:**
- Creer `public/manifest.json` avec:
  - `name`: "GMAO Simply GMAO", `short_name`: "GMAO"
  - `theme_color`: "#dc2626", `background_color`: "#ffffff"
  - `display`: "standalone", `orientation`: "portrait"
  - Icones: 192x192, 512x512 (favicon + icone app)
  - `start_url`: "/", `scope`: "/"

**[ ] IndexedDB avec Dexie.js:**
- Creer `src/lib/db.ts` avec schema Dexie:
  ```typescript
  export const db = new Dexie('GMAOSimply GMAO') as Dexie & {
    equipments: EntityTable<Equipment, 'id'>;
    workOrders: EntityTable<WorkOrder, 'id'>;
    stockItems: EntityTable<StockItem, 'id'>;
    pendingSync: EntityTable<PendingChange, 'id'>;
  };
  db.version(1).stores({
    equipments: 'id, code, name, ligneId, criticality',
    workOrders: 'id, numero, status, equipmentId, createdAt',
    stockItems: 'id, code, name, quantite, stockMinimum',
    pendingSync: '++id, type, entity, createdAt, synced',
  });
  ```

**[ ] Sync Manager:**
- Hook `useSyncManager()` qui:
  - Detecte la connexion/deconnexion reseau (navigator.onLine + events online/offline)
  - En mode offline: stocke les mutations dans `pendingSync`
  - Au retour online: envoie les mutations en file d'attente (FIFO)
  - Affiche un toast/banner de statut de synchronisation
  - Gere les conflits (strategie: server wins, notifier l'utilisateur)

**[ ] Mode degrade UI:**
- Banner "Mode hors-ligne" visible quand offline
- Actions de mutation (creer BT, modifier statut) desactivees ou avec indicateur "en attente de sync"
- Donnees affichees depuis le cache IndexedDB quand offline

---

## PHASE 4: UX/UI — DESIGN & EXPERIENCE (Priorite: HAUTE)

### 4.1 Design System

**[ ] Palette de couleurs industrielle Simply GMAO:**
- Primary: `#B71C1C` (rouge industriel profond, plus sophistique que le rouge vif actuel)
- Secondary: `#37474F` (gris anthracite, couleur machine/outillage)
- Accent: `#FF8F00` (orange alerte/securite)
- Success: `#2E7D32` (vert validation)
- Background: `#F5F5F5` (gris tres leger)
- Surface: `#FFFFFF`
- Text primary: `#212121`
- Text secondary: `#757575`

**[ ] Typographie:**
- Headings: `Inter` ou `Roboto` (poids 600/700)
- Body: `Inter` (poids 400/500)
- Mono (code/numeros): `JetBrains Mono` ou `Roboto Mono`
- Tailles: base 16px, echelle 1.25 (sm: 14, base: 16, lg: 20, xl: 25, 2xl: 31)

**[ ] Espacement & Layout:**
- Design mobile-first (min-width: 320px)
- Touch targets minimum 44x44px (ideal 48x48px pour usage avec gants)
- Spacing system: 4px base (1=4, 2=8, 3=12, 4=16, 6=24, 8=32, 12=48)
- Sidebar navigation: 64px icones sur mobile (mode compact), 240px sur desktop

### 4.2 Composants UI a Developper/Corriger

**[ ] PageSkeleton (chargement):**
- Shimmer effect avec `animate-pulse` de Tailwind
- Structure correspondant a chaque page type (dashboard cards, table rows, form fields)

**[ ] EmptyState (etat vide):**
- Illustration + titre + description + CTA
- Variantes: aucune donnee, recherche sans resultat, erreur de chargement, offline sans cache

**[ ] ErrorState (etat d'erreur):**
- Icone d'erreur + message + bouton retry
- Codes d'erreur specifiques avec messages traduits

**[ ] OfflineBanner:**
- Banner fixe en haut de page quand `!navigator.onLine`
- Couleur orange, icone WiFi barree, texte "Mode hors-ligne — vos modifications seront synchronisees automatiquement"
- Disparait avec animation au retour online

**[ ] SyncStatusIndicator:**
- Petit indicateur dans la navbar (tourbillon quand sync en cours, check quand a jour, warning quand pending)
- Au clic: modal avec liste des modifications en attente

**[ ] ConfirmDialog:**
- Dialog de confirmation pour les actions destructrices (suppression, annulation BT)
- Variante "dangereuse" avec bouton rouge
- Requiert le texte de confirmation pour les suppressions definitives

### 4.3 Theme Sombre

**[ ] Integration next-themes:**
- Activer `next-themes` avec `ThemeProvider` au niveau de l'app
- Toggle theme dans le menu utilisateur (navbar)
- Variantes dark pour tous les composants shadcn/ui:
  - Background: `#121212`
  - Surface: `#1E1E1E`
  - Surface elevated: `#2C2C2C`
  - Text primary: `#E0E0E0`
  - Text secondary: `#9E9E9E`
- Persistance du choix dans localStorage
- Detection `prefers-color-scheme: dark`

### 4.4 Tableaux et Listes

**[ ] Tableau avance avec `@tanstack/react-table`:**
- Colonnes triables (click header)
- Colonnes filtrables (input par colonne ou filtre global)
- Selection multi-lignes avec actions groupees (changer statut, supprimer)
- Pagination cote client (si backend pagine deja) ou integration pagination backend
- Row actions (menu ⋮ par ligne: editer, voir details, dupliquer, supprimer)
- Responsive: collapse en cards sur mobile (< 768px)

**[ ] Filtres avances:**
- Barre de filtres pliable au-dessus des tableaux
- Filtres par type: select, date range, search text, toggle
- Filtres sauvegardables dans l'URL (query params) pour le partage
- Bouton "Reinitialiser les filtres"

### 4.5 Formulaires

**[ ] Amelioration des formulaires:**
- Layout en grille responsive (1 colonne mobile, 2 colonnes desktop)
- Groupes de champs avec Fieldset + legend
- Indicateur de champs modifies (dot orange)
- Auto-save dans localStorage (draft) pour les longs formulaires
- Validation en temps reel (onBlur) avec messages d'erreur sous chaque champ
- Mode "review" avant soumission pour les formulaires critiques (BT securite)

### 4.6 Dashboard & KPIs

**[ ] Dashboard par role:**
- **Responsable:** Cards KPI (BT en cours, retard, taux dispo, stocks critiques), graphique tendance, liste alertes, calendrier semaine
- **Technicien:** Liste BT assignes aujourd'hui, prochains preventifs, bouton "Scanner QR" prominent
- **Operateur:** Bouton "Declarer une panne" XL, liste de ses declarations, statut en temps reel
- **Magasinier:** Alertes stock, mouvements recents, bouton "Nouveau mouvement"
- **HSE:** BT securite en attente, equipements ATEX a controler, incidents du mois

**[ ] Graphiques ameliores (Recharts):**
- MTBF/MTTR: line chart avec tooltip detaille
- Taux disponibilite: gauge chart avec seuil colorimetrique (vert > 95%, orange 90-95%, rouge < 90%)
- Backlog: bar chart empile par statut
- Distribution pannes: pie chart par type/cause
- Tous les graphiques avec periode selectionnable (7j, 30j, 90j, 1an)

---

## PHASE 5: FONCTIONNALITES METIER (Priorite: MOYENNE)

### 5.1 QR Code & Scan

**[ ] Generation QR Code:**
- Endpoint `GET /equipments/:id/qrcode` qui genere un QR code contenant l'URL de l'equipement
- Format: `https://gmao.simply-gmao.local/equipment/{id}` ou custom scheme `gmao://equipment/{id}`
- Impression: page optimisee pour impression d'etiquettes (format 50x50mm, 300dpi)
- Generation en lot: selectionner plusieurs equipements, generer un PDF avec tous les QR codes

**[ ] Scan QR Code:**
- Composant `QRScanner` reutilisable utilisant `html5-qrcode`
- Modal fullscreen sur mobile avec camera arriere par defaut
- Torch/flash toggle
- Retour haptique (vibration) sur scan reussi
- Redirection automatique vers la fiche equipement/BT

### 5.2 Calendrier de Planification

**[ ] Vue calendrier interactive:**
- Librairie: `@schedule-x/react` ou `react-big-calendar` (francise)
- Vues: jour, semaine, mois
- Evenements colories par type (correctif=rouge, preventif=bleu, securite=orange)
- Drag & drop pour re-planifier un BT
- Click pour voir detail + modifier
- Filtres par technicien, zone, type

### 5.3 Notifications

**[ ] Systeme de notifications complet:**
- Toast notifications avec Sonner (deja installe) pour les actions reussies/echecs
- Notification center (cloche dans navbar) avec:
  - Liste des notifications non lues
  - Marquer comme lu / tout marquer comme lu
  - Notifications temps reel via WebSocket
  - Types: info (bleu), success (vert), warning (orange), error (rouge)
- Notifications push pour les evenements critiques (BT urgent assigne, stock critique)

### 5.4 Exports

**[ ] Export Excel:**
- Export des listes filtrees au format .xlsx (SheetJS)
- Colonnes selectionnables
- Formatage professionnel (en-tetes grises, colonnes auto-fit, filtres actives)

**[ ] Export PDF:**
- Fiches equipement en PDF
- Rapport mensuel de maintenance (KPIs + graphiques + tableaux)
- Generation cote serveur avec Puppeteer pour qualite print-ready

---

## PHASE 6: TESTS & QUALITE (Priorite: HAUTE)

### 6.1 Tests Backend

**[ ] Tests Unitaires (Vitest):**
- Installer `vitest` + `@vitest/coverage-v8` + `supertest`
- Couvrir les services metier:
  - `auth.service.test.ts` — login, refresh, logout, token generation
  - `equipment.service.test.ts` — CRUD, QR generation, filtres
  - `workOrder.service.test.ts` — creation, changement statut, assignation
  - `stock.service.test.ts` — mouvements, alertes, inventaire
- Mocker Prisma avec `vitest-mock-extended`
- Objectif: 80%+ de couverture sur la couche service

**[ ] Tests Integration:**
- Tester les routes API end-to-end avec `supertest`
- Setup/teardown de test database (PostgreSQL via Docker)
- Fixtures pour les donnees de test
- Test de chaque scénario: succes, validation error, auth error, not found

### 6.2 Tests Frontend

**[ ] Tests Composants (React Testing Library):**
- Installer `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event`
- Tester les composants critiques:
  - `Login.tsx` — soumission formulaire, erreurs, etats de chargement
  - `Dashboard.tsx` — affichage KPIs, gestion etat vide
  - Composants UI generiques (tables, formulaires, modals)

**[ ] Tests E2E (Playwright) — deja installe:**
- Creer `tests/e2e/` avec:
  - `auth.spec.ts` — login avec chaque role, deconnexion, acces refuse
  - `workorder.spec.ts` — creer un BT du debut a la fin, changer statuts
  - `equipment.spec.ts` — naviguer hierarchie, scan QR, filtrer
  - `offline.spec.ts` — mode offline, creation BT, synchronisation
- Page Object Model pour les pages repetees
- Screenshots de reference pour la regression visuelle

### 6.3 CI/CD

**[ ] GitHub Actions:**
- Creer `.github/workflows/ci.yml`:
  ```yaml
  # Sur chaque push/PR sur main:
  # 1. Checkout du code
  # 2. Setup Node.js 20
  # 3. Install dependencies (frontend + backend)
  # 4. Lint (ESLint + Prettier check)
  # 5. Type check (tsc --noEmit)
  # 6. Tests backend (unitaires + integration avec test DB)
  # 7. Tests frontend (composants)
  # 8. Tests E2E (Playwright)
  # 9. Build frontend + backend
  # 10. Docker build check
  ```
- Creer `.github/workflows/deploy.yml`:
  ```yaml
  # Sur release GitHub:
  # 1. Build images Docker
  # 2. Push vers registry (Docker Hub ou GHCR)
  # 3. SSH vers serveur production
  # 4. docker-compose pull + up -d
  # 5. Healthcheck post-deploy
  ```

---

## PHASE 7: DEVOPS & PRODUCTION (Priorite: MOYENNE)

### 7.1 Docker Optimise

**[ ] Multi-stage build Dockerfile backend:**
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**[ ] docker-compose.yml optimise:**
- Healthchecks sur tous les services
- Restart policy: `unless-stopped`
- Logging driver `json-file` avec rotation (max-size: 100M, max-file: 5)
- Reseau dedie `gmao-network`
- Variables d'environnement dans fichier `.env` (non versionne)

**[ ] docker-compose.prod.yml:**
- Nginx avec SSL (certificat auto-signé ou Let's Encrypt)
- Backup automatique PostgreSQL via cron dans conteneur
- Monitoring avec Uptime Kuma
- Limites de ressources (CPU/RAM) par conteneur

### 7.2 Monitoring & Logging

**[ ] Logging structure:**
- Logger Winston avec format JSON en production
- Rotation des fichiers logs (daily, keep 30 days)
- Separation: `app.log` (info+), `error.log` (error+)
- Correlation ID sur chaque requete (header `X-Request-Id`)

**[ ] Monitoring:**
- Endpoint `/api/metrics` avec `prom-client` (metriques Prometheus)
- Metriques cles: request count, response time (p50, p95, p99), error rate, DB connection pool, Redis connection
- Uptime Kuma pour healthcheck externe + alerting (email/Teams)

---

## PHASE 8: MIGRATION & DONNEES (Priorite: BASSE)

### 8.1 Migrations de Schema

**[ ] Script de migration Prisma:**
- `npx prisma migrate dev --name add_soft_delete` (ajout deletedAt)
- `npx prisma migrate dev --name add_indexes` (ajout indexes manquants)
- Script de migration de donnees si necessaire (soft delete des anciennes donnees)

### 8.2 Seeding

**[ ] Seed de donnees de developpement:**
- `prisma/seed.ts` avec:
  - 1 utilisateur par role (credentials documentes)
  - 1 site avec 2 zones, 4 lignes, 10 equipements
  - 20 articles de stock avec seuils
  - 5 plans preventifs
  - 15 bons de travail dans differents statuts
- `npx prisma db seed` pour initialiser l'environnement de dev

---

## STRUCTURE DES DOSSIERS FINALE

```
simply-gmao/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── app/
│   ├── .env.example
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── MobileNav.tsx
│   │   │   ├── feedback/
│   │   │   │   ├── PageSkeleton.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── ErrorState.tsx
│   │   │   │   ├── OfflineBanner.tsx
│   │   │   │   └── SyncStatus.tsx
│   │   │   ├── forms/
│   │   │   │   └── FormField.tsx
│   │   │   └── qr/
│   │   │       ├── QRScanner.tsx
│   │   │       └── QRGenerator.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useEquipments.ts
│   │   │   ├── useWorkOrders.ts
│   │   │   ├── useStocks.ts
│   │   │   ├── useSync.ts
│   │   │   ├── useNetworkStatus.ts
│   │   │   └── useMediaQuery.ts
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios/fetch wrapper
│   │   │   ├── db.ts            # Dexie.js IndexedDB
│   │   │   ├── queryClient.ts   # TanStack Query config
│   │   │   └── utils.ts
│   │   ├── pages/               # Lazy loaded pages
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── syncStore.ts
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   │   ├── manifest.json
│   │   ├── sw.js               # Service Worker (generated)
│   │   └── icons/
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts          # Validation env Zod
│   │   │   ├── database.ts
│   │   │   └── redis.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── validation.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── audit.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── jobs/
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
├── nginx/
│   └── nginx.conf
├── docker-compose.prod.yml
├── scripts/
│   ├── setup.sh                # Script d'installation initiale
│   └── backup.sh               # Script de backup quotidien
└── README.md
```

---

## CRITERES D'ACCEPTATION

- [ ] L'application fonctionne 100% avec le backend reel (plus de mock force)
- [ ] L'application fonctionne hors-ligne (creation BT, modification statut, consultation)
- [ ] La synchronisation se fait automatiquement au retour de la connexion
- [ ] Tous les endpoints API sont documentes dans Swagger UI
- [ ] La suite de tests backend passe a 80%+ de couverture
- [ ] Les tests E2E couvrent les parcours critiques (login, creer BT, changer statut, scan QR)
- [ ] Le deploiement Docker fonctionne en un `docker-compose up -d`
- [ ] La CI/CD GitHub Actions passe en vert
- [ ] Le theme sombre est fonctionnel et coherent
- [ ] L'application est responsive (320px a 1920px)
- [ ] Les erreurs reseau affichent un feedback utilisateur comprehensible

---

*Prompt genere le 2026-05-08 suite a analyse complete du repository doulicane/Simply-GMAO*
