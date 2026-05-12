# PLAN D'ACTION KIMI CODE — Simply GMAO
## Corrections et Ameliorations Post-Audit

---

## CONTEXTE

Suite a l'audit de securite et de qualite, **8 correctifs critiques ont DEJA ete appliques** (voir Phase 0 ci-dessous). Ce plan couvre les **taches restantes** pour atteindre un niveau de production.

---

## PHASE 0 — CORRECTIFS DEJA APPLIQUES (Reference)

Les correctifs suivants ont ete implementes lors de l'audit. Ils sont listes ici comme reference pour Kimi Code.

### SEC-003 — Cle SCADA API en dur (CVSS 9.3) ✅
**Fichier :** `app/backend/src/routes/scada.ts`
**Probleme :** Fallback vers une cle publique connue si la variable d'env n'est pas definie.
**Correction appliquee :**
```typescript
// AVANT :
const SCADA_API_KEY = process.env.SCADA_API_KEY || 'scada-dev-key-change-in-prod';

// APRES :
const SCADA_API_KEY = process.env.SCADA_API_KEY;
if (!SCADA_API_KEY) {
  throw new Error('[SCADA] SCADA_API_KEY est obligatoire. L\'application ne peut pas demarrer.');
}
```

### SEC-002 — Mot de passe admin par defaut (CVSS 9.8) ✅
**Fichier :** `app/backend/prisma/seed-admin.ts`
**Probleme :** Mot de passe `'admin'` hardcode en clair.
**Correction appliquee :**
```typescript
// AVANT :
const passwordHash = await bcrypt.hash('admin', 12);

// APRES :
const rawPassword = process.env.ADMIN_INITIAL_PASSWORD || crypto.randomBytes(16).toString('hex');
const passwordHash = await bcrypt.hash(rawPassword, 12);
console.log(`🔐 Mot de passe genere : ${rawPassword}`);
```

### SEC-001 — Uploads sans authentification (CVSS 9.1) ✅
**Fichier :** `app/backend/src/index.ts`
**Probleme :** `app.use('/uploads', express.static(env.UPLOAD_DIR))` exposait tous les documents.
**Correction appliquee :**
```typescript
// AVANT :
app.use('/uploads', express.static(env.UPLOAD_DIR));

// APRES :
app.get('/uploads/:filename', authenticate, async (req, res, next) => {
  const filename = path.basename(req.params.filename); // Path traversal protection
  const filePath = path.join(env.UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Fichier introuvable' });
  const resolvedPath = path.resolve(filePath);
  const resolvedUploadDir = path.resolve(env.UPLOAD_DIR);
  if (!resolvedPath.startsWith(resolvedUploadDir)) return res.status(403).json({ error: 'Acces refuse' });
  res.sendFile(resolvedPath);
});
```

### BCK-003 — Injection shell dans backup (CVSS 8.5) ✅
**Fichier :** `app/backend/src/jobs/backup.ts`
**Probleme :** `execAsync(\`pg_dump "${dbUrl}" | gzip > "${dumpFile}"\`)` vulnérable aux injections.
**Correction appliquee :**
```typescript
// AVANT :
await execAsync(`pg_dump "${dbUrl}" | gzip > "${dumpFile}"`, { timeout: 300000 });

// APRES :
const pgDump = spawn('pg_dump', [dbUrl], { timeout: 300000 });
const gzip = spawn('gzip', { timeout: 300000 });
pgDump.stdout.pipe(gzip.stdin);
gzip.stdout.pipe(dumpStream);
```

### BCK-004 — AsyncLocalStorage avant authentification ✅
**Fichier :** `app/backend/src/index.ts`
**Probleme :** `runWithContext()` était appelé avant que `req.user` ne soit défini par le middleware `authenticate`.
**Correction appliquee :**
```typescript
// AVANT (index.ts) :
app.use((req, _res, next) => {
  runWithContext({ userId: (req as any).user?.id, ... }, () => next());
});

// APRES :
// runWithContext supprime de index.ts — dejà correctement implémenté dans middleware/auth.ts
// après req.user = user (ligne 169-176 de auth.ts)
```

### BCK-001 — Race condition consommation stock ✅
**Fichier :** `app/backend/src/services/workOrderService.ts`
**Probleme :** La vérification du stock se faisait hors transaction, permettant des stocks négatifs.
**Correction appliquee :**
```typescript
// AVANT :
if (data.quantite > Number(item.quantite)) throw ...; // Hors transaction
await prisma.$transaction(async (tx) => {
  await tx.stockItem.update({ where: { id }, data: { quantite: Number(item.quantite) - data.quantite } });
});

// APRES :
await prisma.$transaction(async (tx) => {
  const lockedItem = await tx.stockItem.findUnique({ where: { id: data.stockItemId } });
  if (data.quantite > Number(lockedItem.quantite)) throw new AppError('Stock insuffisant', 400);
  await tx.stockItem.update({ where: { id }, data: { quantite: { decrement: data.quantite } } });
});
```

### FRN-001 — Monkey-patch window.fetch ✅
**Fichier :** `app/src/lib/api.ts`
**Probleme :** `window.fetch` était remplacé globalement, polluant le scope et cassant la chaîne de prototypage.
**Correction appliquee :**
```typescript
// AVANT :
window.fetch = async function (...args) { ... };

// APRES :
class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];
  async request(url: string, options: RequestInit = {}): Promise<Response> {
    // Gestion du refresh token encapsulée, sans modification du global
  }
}
const apiClient = new ApiClient();
// apiFetch utilise apiClient.request() au lieu de fetch() modifié
```

### FRN-002 — JWT dans localStorage (XSS) ✅
**Fichier :** `app/src/stores/authStore.ts`
**Probleme :** Le refreshToken était stocké dans localStorage, exposé aux attaques XSS.
**Correction appliquee :**
```typescript
// AVANT :
localStorage.setItem('refreshToken', refreshToken);

// APRES :
// Le refreshToken est géré par le backend via cookie HttpOnly
// Le frontend n'a plus jamais accès au refreshToken
login: async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Envoie/reçoit les cookies
  });
  // Seul l'accessToken est reçu dans le JSON, le refreshToken est dans le cookie
}
```

---

## PHASE 1 — SECURITE BACKEND (Priorite : CRITIQUE)

### Tache 1.1 : Cookie HttpOnly pour le refreshToken
**Fichiers :**
- `app/backend/src/routes/auth.ts`
- `app/backend/package.json`
- `app/backend/src/index.ts`

**Description :**
Le frontend (`stores/authStore.ts`) a ete mis a jour pour utiliser `credentials: 'include'` et ne plus stocker le refreshToken en localStorage. Le backend doit maintenant :
1. Installer `cookie-parser`
2. Envoyer le refreshToken dans un cookie HttpOnly Secure SameSite=Strict lors du login
3. Lire le refreshToken depuis le cookie lors du refresh
4. Supprimer le cookie lors du logout

**Instructions detaillees :**

Etape 1 — Ajouter cookie-parser :
```bash
cd app/backend && npm install cookie-parser && npm install -D @types/cookie-parser
```

Etape 2 — Dans `app/backend/src/index.ts`, ajouter apres la ligne `app.use(express.json(...))` :
```typescript
import cookieParser from 'cookie-parser';
// ...
app.use(cookieParser(env.JWT_SECRET)); // signe les cookies avec le JWT_SECRET
```

Etape 3 — Dans `app/backend/src/routes/auth.ts`, modifier le login :
- Extraire la fonction de login (trouver ou le refreshToken est renvoye dans la reponse)
- Ajouter `res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 })`
- NE PLUS renvoyer le refreshToken dans le JSON de reponse

Etape 4 — Modifier le refresh token endpoint :
- Lire `req.cookies.refreshToken` au lieu de `req.body.refreshToken`
- Si pas de cookie, fallback sur `req.body.refreshToken` (transition)

Etape 5 — Modifier le logout :
- Ajouter `res.clearCookie('refreshToken')` pour supprimer le cookie

---

### Tache 1.2 : CSP (Content Security Policy) en production
**Fichier :** `app/backend/src/index.ts`

**Description :**
Actuellement : `contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false`
CSP est desactivee en dev ET en prod (undefined = desactive).

**Instructions detaillees :**
Remplacer la configuration Helmet par :
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // 'unsafe-inline' necessaire pour Vite en dev
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // necessaire pour Vite HMR
}));
```

---

### Tache 1.3 : Healthcheck securise
**Fichier :** `app/backend/src/index.ts`

**Description :**
Le healthcheck expose `version`, `uptime` et `services` sans authentification. Cela permet le fingerprinting.

**Instructions detaillees :**
- Ajouter `import { authenticate } from './middleware/auth'`
- Modifier la route `/api/health` pour retourner une version minimale sans auth :
  ```typescript
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
  });
  ```
- Creer une route detaillee `/api/health/detailed` protegee par authenticate :
  ```typescript
  app.get('/api/health/detailed', authenticate, async (_req: Request, res: Response) => {
    // ... le contenu actuel du healthcheck
  });
  ```

---

### Tache 1.4 : Validation SCADA_API_KEY dans env.ts
**Fichier :** `app/backend/src/config/env.ts`

**Description :**
SCADA_API_KEY n'est pas valide dans le schema Zod de configuration.

**Instructions detaillees :**
Ajouter dans le schema Zod (section Optionnelles avec defaults) :
```typescript
SCADA_API_KEY: z.string().min(16, 'SCADA_API_KEY doit faire au moins 16 caracteres').optional(),
```

---

## PHASE 2 — PERFORMANCE BACKEND (Priorite : HAUTE)

### Tache 2.1 : Cache Redis sur les routes de lecture frequente
**Fichiers :**
- `app/backend/src/utils/cache.ts` (nouveau)
- `app/backend/src/routes/equipments.ts`
- `app/backend/src/routes/workOrders.ts`
- `app/backend/src/routes/stock.ts`

**Description :**
Implementer un pattern cache-aside avec Redis pour les listes d'equipements, work-orders et stock.

**Instructions detaillees :**

Etape 1 — Creer `app/backend/src/utils/cache.ts` :
```typescript
import { redisClient } from '../config/redis';

const DEFAULT_TTL = 300; // 5 minutes

export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL
): Promise<T> {
  const cached = await redisClient.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  const data = await fetcher();
  await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

export async function invalidateCache(pattern: string): Promise<void> {
  const stream = redisClient.scanStream({ match: pattern, count: 100 });
  const keys: string[] = [];
  stream.on('data', (k: string[]) => keys.push(...k));
  await new Promise<void>((resolve, reject) => {
    stream.on('end', async () => {
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      resolve();
    });
    stream.on('error', reject);
  });
}
```

Etape 2 — Dans `routes/equipments.ts`, wrapper la liste avec cache :
```typescript
import { getOrSetCache, invalidateCache } from '../utils/cache';

// Dans la route GET / (liste)
const cacheKey = `equipments:list:${JSON.stringify(req.query)}`;
const result = await getOrSetCache(cacheKey, () => listEquipments(req.query, req.user), 300);
res.json(result);

// Dans les routes POST /, PUT /:id, DELETE /:id (mutation)
await invalidateCache('equipments:list:*');
```

---

### Tache 2.2 : Timeout sur les requetes Prisma
**Fichier :** `app/backend/src/config/database.ts`

**Description :**
Aucun timeout n'est configure sur Prisma. Une requete lente peut bloquer le serveur indefiniment.

**Instructions detaillees :**
Dans la creation du PrismaClient, ajouter :
```typescript
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  transactionOptions: {
    maxWait: 5000,  // Attente max pour obtenir une connexion
    timeout: 10000, // Timeout par transaction
  },
});
```

---

### Tache 2.3 : Requetes N+1 dans equipments
**Fichier :** `app/backend/src/routes/equipments.ts`

**Description :**
Les requetes de liste d'equipements peuvent provoquer des N+1 si les relations (ligne, zone, site) sont chargees ligne par ligne.

**Instructions detaillees :**
- Trouver la fonction de liste d'equipements
- Ajouter `include: { ligne: { include: { zone: { include: { site: true } } } } }` dans la requete Prisma
- Verifier que toutes les relations sont chargees en UNE seule requete

---

## PHASE 3 — FRONTEND (Priorite : HAUTE)

### Tache 3.1 : Supprimer Zustand pour les donnees serveur
**Fichiers :**
- `app/src/stores/equipmentStore.ts`
- `app/src/stores/workOrderStore.ts`
- `app/src/stores/stockStore.ts`
- `app/src/stores/preventiveStore.ts`
- `app/src/stores/dashboardStore.ts`
- `app/src/hooks/useDashboard.ts`
- `app/src/hooks/useWorkOrderActions.ts`

**Description :**
Les stores Zustand stockent des donnees serveur en double de TanStack Query. Il faut migrer vers TanStack Query uniquement pour les donnees serveur, et garder Zustand uniquement pour l'etat UI local.

**Instructions detaillees :**

Pour chaque store (equipmentStore, workOrderStore, stockStore, preventiveStore, dashboardStore) :

1. Identifier les methodes qui fetch des donnees du serveur
2. Deplacer ces fetch dans des hooks TanStack Query
3. Mettre a jour les composants qui utilisent le store pour utiliser le hook a la place

Exemple pour equipmentStore :
```typescript
// NOUVEAU HOOK : app/src/hooks/useEquipments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

export function useEquipments(filters?: any) {
  return useQuery({
    queryKey: ['equipments', filters],
    queryFn: () => fetchAPI(`/equipments?${new URLSearchParams(filters)}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEquipment(id: string) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => fetchAPI(`/equipments/${id}`),
    enabled: !!id,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetchAPI('/equipments', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
    },
  });
}
```

---

### Tache 3.2 : Eliminer les types `any`
**Fichiers :** Tous les fichiers avec `any`

**Description :**
Il y a ~50+ utilisations de `any` dans le codebase. Il faut les remplacer par des types precis.

**Instructions detaillees :**

Priorite sur ces fichiers :
1. `app/src/types/index.ts` — Ajouter les DTOs manquants
2. `app/src/stores/*.ts` — Typer les parametres `any`
3. `app/src/hooks/*.ts` — Typer les retours
4. `app/backend/src/routes/*.ts` — Typer les req.body et req.query
5. `app/backend/src/services/*.ts` — Typer les parametres et retours

Creer les types manquants dans `app/src/types/index.ts` :
```typescript
// DTOs pour les requetes API
export interface CreateEquipmentDTO {
  code: string;
  name: string;
  type: string;
  criticality: 'CRITIQUE' | 'ELEVEE' | 'MOYENNE' | 'FAIBLE';
  ligneId?: string;
}

export interface CreateWorkOrderDTO {
  title: string;
  description?: string;
  equipmentId: string;
  type: 'CORRECTIF' | 'PREVENTIF' | 'CONDITIONNEL' | 'AMELIORATION' | 'SECURITE';
  priority: 'URGENTE' | 'HAUTE' | 'MOYENNE' | 'BASSE';
}

export interface StockFilters {
  page?: number;
  limit?: number;
  search?: string;
  famille?: string;
}
```

---

### Tache 3.3 : Decomposer Dashboard.tsx
**Fichier :** `app/src/pages/Dashboard.tsx`

**Description :**
Le composant fait 736+ lignes avec 8 sous-composants inline. Il faut extraire chaque sous-composant.

**Instructions detaillees :**

Creer les fichiers suivants :
```
app/src/components/dashboard/
  DashboardKPIs.tsx       — Cartes KPI (en service, en maintenance, etc.)
  DashboardCharts.tsx     — Graphiques (camembert, barres)
  DashboardTables.tsx     — Tableaux (derniers BT, alertes)
  DashboardFilters.tsx    — Filtres de periode
  DashboardSkeleton.tsx   — Etat de chargement
```

Chaque composant doit recevoir ses props (pas de dependance aux stores, utiliser les hooks).

---

## PHASE 4 — TESTS (Priorite : HAUTE)

### Tache 4.1 : Tests unitaires backend
**Fichiers :**
- `app/backend/src/__tests__/auth.test.ts`
- `app/backend/src/__tests__/equipments.test.ts`

**Description :**
Actuellement ~3 tests. Objectif : atteindre 60% de couverture sur les routes critiques.

**Instructions detaillees :**

Pour chaque route critique (auth, equipments, workOrders, stock), creer des tests pour :
1. **Cas passant** : Requete valide → 200
2. **Cas non authentifie** : Sans token → 401
3. **Cas non autorise** : Mauvais role → 403
4. **Cas validation** : Donnees invalides → 422
5. **Cas non trouve** : ID inexistant → 404

Exemple pour auth :
```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('POST /api/auth/login', () => {
  it('should return 200 with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeUndefined(); // Cookie HttpOnly
  });

  it('should return 401 with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('should return 422 with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(422);
  });
});
```

---

### Tache 4.2 : Tests E2E Playwright
**Fichiers :**
- `app/tests/e2e/auth.spec.ts`
- `app/tests/e2e/workflow.spec.ts`

**Description :**
Tests E2E sur les parcours critiques : login → creer un BT → assigner → cloturer.

**Instructions detaillees :**

```typescript
// tests/e2e/workflow.spec.ts
import { test, expect } from '@playwright/test';

test('parcours complet BT', async ({ page }) => {
  // Login
  await page.goto('/#/login');
  await page.fill('[name="email"]', 'responsable@simply-gmao.fr');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/);

  // Creer un BT
  await page.click('text=Nouveau BT');
  await page.fill('[name="title"]', 'Test E2E BT');
  await page.selectOption('[name="equipment"]', { label: 'Equipement Test' });
  await page.click('button[type="submit"]');
  await expect(page.locator('.toast-success')).toContainText('BT cree');

  // Verifier dans la liste
  await page.click('text=Bons de travail');
  await expect(page.locator('text=Test E2E BT')).toBeVisible();
});
```

---

## PHASE 5 — QUALITE (Priorite : MOYENNE)

### Tache 5.1 : Gestion de conflits offline
**Fichier :** `app/src/hooks/useSync.ts`

**Description :**
La sync offline n'a pas de gestion de conflits. Si le serveur a ete modifie entre-temps, les donnees locales ecrasent sans avertissement.

**Instructions detaillees :**

Ajouter un mecanisme de versioning simple :
```typescript
interface SyncRecord {
  id: string;
  entity: string;
  action: 'create' | 'update' | 'delete';
  payload: any;
  clientVersion: number; // Incremente a chaque modification locale
  timestamp: number;
}

// Avant de pusher, verifier la version serveur
async function syncWithConflictResolution(record: SyncRecord) {
  const serverRecord = await fetchAPI(`/${record.entity}/${record.id}`);
  if (serverRecord.updatedAt > record.timestamp) {
    // Conflit detecte
    return { status: 'conflict', server: serverRecord, local: record.payload };
  }
  // Pas de conflit, pusher
  return { status: 'synced', result: await pushToServer(record) };
}
```

---

### Tache 5.2 : Logs des requetes lentes
**Fichier :** `app/backend/src/config/database.ts`

**Description :**
Il n'y a pas de log des requetes lentes Prisma.

**Instructions detaillees :**
Ajouter un middleware Prisma pour logger les requetes lentes :
```typescript
prisma.$use(async (params, next) => {
  const start = Date.now();
  const result = await next(params);
  const duration = Date.now() - start;
  if (duration > 1000) {
    logger.warn(`[Slow Query] ${params.model}.${params.action} — ${duration}ms`, {
      model: params.model,
      action: params.action,
      args: params.args,
      duration,
    });
  }
  return result;
});
```

---

### Tache 5.3 : Normalisation du code (FR/EN)
**Fichiers :** Tous les fichiers source

**Description :**
Le code est melange FR/EN. Standardiser en anglais pour les identifiants, francais pour les commentaires et messages utilisateur.

**Instructions detaillees :**
- Variables, fonctions, classes : ENGLISH
- Commentaires : FRANCAIS
- Messages utilisateur (UI) : FRANCAIS
- Messages API (erreurs) : FRANCAIS
- Logs serveur : FRANCAIS

Exemple :
```typescript
// BEFORE
const listeEquipements = await tx.equipment.findMany();

// AFTER
const equipmentList = await tx.equipment.findMany();
```

---

## PHASE 6 — DEPLOIEMENT (Priorite : MOYENNE)

### Tache 6.1 : Variables d'environnement requises
**Fichier :** `app/backend/.env.example`

**Instructions detaillees :**
Ajouter les variables manquantes :
```bash
# Securite
ADMIN_INITIAL_PASSWORD=
SCADA_API_KEY=change-me-in-production-min-16-chars
BCRYPT_ROUNDS=12

# Cookies
COOKIE_SECRET=same-as-jwt-secret

# Rate limiting
RATE_LIMIT_MAX=100

# Performance
CACHE_TTL=300
ENABLE_SLOW_QUERY_LOG=true
```

---

### Tache 6.2 : Checklist pre-deploiement

- [ ] Tous les tests passent (`npm test`)
- [ ] Le build frontend reussit (`npm run build`)
- [ ] Le build backend reussit (`npm run build`)
- [ ] Les migrations Prisma sont a jour (`npx prisma migrate status`)
- [ ] Le seed admin genere un mot de passe aleatoire
- [ ] SCADA_API_KEY est configure
- [ ] CSP est activee en production
- [ ] Les uploads sont proteges par authentification
- [ ] Le rate limiting est actif
- [ ] Les cookies sont HttpOnly Secure SameSite=Strict
- [ ] Le healthcheck detaille necessite une authentification
- [ ] Les logs ne contiennent pas de donnees sensibles

---

## TABLEAU RECAPITULATIF

| Phase | Tache | Priorite | Fichier(s) | Estimation |
|-------|-------|----------|------------|------------|
| 1.1 | Cookie HttpOnly refreshToken | CRITIQUE | `routes/auth.ts`, `index.ts` | 2h |
| 1.2 | CSP production | CRITIQUE | `index.ts` | 30min |
| 1.3 | Healthcheck securise | HAUTE | `index.ts` | 30min |
| 1.4 | SCADA_API_KEY dans env.ts | HAUTE | `config/env.ts` | 15min |
| 2.1 | Cache Redis | HAUTE | `utils/cache.ts`, routes | 4h |
| 2.2 | Timeout Prisma | MOYENNE | `config/database.ts` | 15min |
| 2.3 | Requetes N+1 | MOYENNE | `routes/equipments.ts` | 1h |
| 3.1 | Migrer Zustand → TanStack Query | HAUTE | stores, hooks | 8h |
| 3.2 | Eliminer les `any` | MOYENNE | Tous les fichiers | 6h |
| 3.3 | Decomposer Dashboard.tsx | MOYENNE | `pages/Dashboard.tsx` | 3h |
| 4.1 | Tests unitaires backend | HAUTE | `__tests__/*.ts` | 8h |
| 4.2 | Tests E2E Playwright | HAUTE | `tests/e2e/*.ts` | 6h |
| 5.1 | Conflits offline | BASSE | `hooks/useSync.ts` | 4h |
| 5.2 | Logs requetes lentes | BASSE | `config/database.ts` | 30min |
| 5.3 | Normalisation FR/EN | BASSE | Tous | 4h |
| 6.1 | Variables d'env | MOYENNE | `.env.example` | 15min |
| 6.2 | Checklist pre-deploiement | MOYENNE | — | 30min |

**Total estimé : ~48 heures de travail**

---

*Plan genere le 12 Mai 2026 — Suite a l'audit de securite Simply GMAO*
