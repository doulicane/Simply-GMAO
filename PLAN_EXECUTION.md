# PLAN D'EXECUTION — Phases 1 à 6 (Simply GMAO)

> Plan construit apres validation de la Phase 0 (8 correctifs critiques)

---

## PHILOSOPHIE

- **Sprint 1** = Securite + Performance backend (impact immediat, risque reduit)
- **Sprint 2** = Refonte frontend (depend du backend stable)
- **Sprint 3** = Tests (depend du code finalise des sprints 1 et 2)
- **Sprint 4** = Qualite + Documentation + Deploiement

---

## SPRINT 1 — SECURITE & PERFORMANCE BACKEND (~6h)

### 1.1 CSP Production (30min)
- **Fichier** : `app/backend/src/index.ts`
- **Action** : Activer Helmet CSP en production avec directives strictes
- **Dependance** : Aucune
- **Validation** : `curl -I` verifie le header `Content-Security-Policy`

### 1.2 Healthcheck securise (30min)
- **Fichier** : `app/backend/src/index.ts`
- **Action** : Split `/api/health` (public, minimal) + `/api/health/detailed` (auth)
- **Dependance** : Aucune
- **Validation** : `curl /api/health` ne doit pas exposer `version`/`uptime`

### 1.3 SCADA_API_KEY dans env.ts (15min)
- **Fichier** : `app/backend/src/config/env.ts`
- **Action** : Ajouter `SCADA_API_KEY` au schema Zod avec min(16)
- **Dependance** : Aucune
- **Validation** : `npm run build` passe

### 1.4 Cache Redis sur routes de lecture (4h)
- **Fichiers** :
  - `app/backend/src/utils/cache.ts` (nouveau)
  - `app/backend/src/routes/equipments.ts`
  - `app/backend/src/routes/workOrders.ts`
  - `app/backend/src/routes/stock.ts`
- **Action** : Pattern cache-aside (getOrSetCache / invalidateCache)
- **Dependance** : Aucune
- **Validation** : Redis CLI `KEYS equipments:list:*` apres un GET

### 1.5 Timeout Prisma (15min)
- **Fichier** : `app/backend/src/config/database.ts`
- **Action** : `transactionOptions: { maxWait: 5000, timeout: 10000 }`
- **Dependance** : Aucune

### 1.6 Requetes N+1 dans equipments (1h)
- **Fichier** : `app/backend/src/routes/equipments.ts`
- **Action** : `include: { ligne: { include: { zone: { include: { site: true } } } } }`
- **Dependance** : Aucune
- **Validation** : Log Prisma en dev montre 1 requete pour la liste

---

## SPRINT 2 — FRONTEND REFONTE (~17h)

### 2.1 Migrer Zustand vers TanStack Query (8h)
- **Fichiers** :
  - `app/src/stores/equipmentStore.ts` -> `app/src/hooks/useEquipments.ts`
  - `app/src/stores/workOrderStore.ts` -> `app/src/hooks/useWorkOrders.ts`
  - `app/src/stores/stockStore.ts` -> `app/src/hooks/useStock.ts`
  - `app/src/stores/preventiveStore.ts` -> `app/src/hooks/usePreventive.ts`
  - `app/src/stores/dashboardStore.ts` -> `app/src/hooks/useDashboard.ts`
- **Action** :
  - Creer hooks TanStack Query (useQuery / useMutation / invalidateQueries)
  - Garder Zustand UNIQUEMENT pour etat UI local (sidebar, modals, etc.)
  - Mettre a jour tous les composants consommateurs
- **Dependance** : Backend stable (Sprint 1)
- **Validation** : Aucun `fetch` direct dans les stores serveur

### 2.2 Eliminer les types `any` (6h)
- **Fichiers** : Tous les fichiers avec `any`
- **Action** :
  1. `app/src/types/index.ts` — DTOs manquants (CreateEquipmentDTO, etc.)
  2. `app/src/stores/*.ts` — Typer les params
  3. `app/src/hooks/*.ts` — Typer les retours
  4. `app/backend/src/routes/*.ts` — Typer req.body / req.query
  5. `app/backend/src/services/*.ts` — Typer params et retours
- **Dependance** : Sprint 2.1 (car les nouveaux hooks doivent etre types)
- **Validation** : `npx tsc --noEmit` 0 erreur, 0 `any` restant

### 2.3 Decomposer Dashboard.tsx (3h)
- **Fichier** : `app/src/pages/Dashboard.tsx` (736+ lignes)
- **Action** : Extraire en :
  - `DashboardKPIs.tsx`
  - `DashboardCharts.tsx`
  - `DashboardTables.tsx`
  - `DashboardFilters.tsx`
  - `DashboardSkeleton.tsx`
- **Dependance** : Sprint 2.1 (utilise les hooks)
- **Validation** : Dashboard.tsx < 150 lignes

---

## SPRINT 3 — TESTS (~14h)

### 3.1 Tests unitaires backend (8h)
- **Fichiers** :
  - `app/backend/src/__tests__/auth.test.ts`
  - `app/backend/src/__tests__/equipments.test.ts`
  - `app/backend/src/__tests__/workOrders.test.ts`
  - `app/backend/src/__tests__/stock.test.ts`
- **Action** : Couverture 60%+ sur routes critiques
  - Cas passant -> 200
  - Non auth -> 401
  - Mauvais role -> 403
  - Validation -> 422
  - Non trouve -> 404
- **Dependance** : Sprint 1 (backend stable)
- **Validation** : `npm test` >= 60% coverage

### 3.2 Tests E2E Playwright (6h)
- **Fichiers** :
  - `app/tests/e2e/auth.spec.ts`
  - `app/tests/e2e/workflow.spec.ts`
- **Action** : Parcours critiques
  - Login -> Dashboard
  - Creer BT -> Assigner -> Cloturer
  - Consommer stock sur BT
- **Dependance** : Sprint 2 (frontend stable)
- **Validation** : `npx playwright test` passe

---

## SPRINT 4 — QUALITE & DEPLOIEMENT (~8h)

### 4.1 Gestion de conflits offline (4h)
- **Fichier** : `app/src/hooks/useSync.ts`
- **Action** : Versioning client + detection conflit (timestamp serveur vs local)
- **Dependance** : Sprint 2 (hooks stables)

### 4.2 Logs requetes lentes Prisma (30min)
- **Fichier** : `app/backend/src/config/database.ts`
- **Action** : Middleware Prisma `duration > 1000ms` -> `logger.warn`
- **Dependance** : Aucune

### 4.3 Normalisation FR/EN (4h)
- **Fichiers** : Tous les sources
- **Action** :
  - Variables/fonctions/classes -> **ENGLISH**
  - Commentaires -> **FRANCAIS**
  - Messages UI/API -> **FRANCAIS**
- **Dependance** : Sprint 2 et 3 (code finalise)
- **Validation** : ESLint custom rule ou grep `const [a-zA-Z]*[eéèê]quipement` = 0

### 4.4 Variables d'environnement (15min)
- **Fichier** : `app/backend/.env.example`
- **Action** : Ajouter `ADMIN_INITIAL_PASSWORD`, `SCADA_API_KEY`, `COOKIE_SECRET`, etc.
- **Dependance** : Aucune

### 4.5 Checklist pre-deploiement (30min)
- **Fichier** : `KIMI_CODE_PLAN.md` (mise a jour)
- **Action** : Cocher et documenter chaque item de la checklist

---

## TABLEAU RECAPITULATIF

| Sprint | Duree estimée | Livrable |
|--------|--------------|----------|
| Sprint 1 | ~6h | Backend securise + performant |
| Sprint 2 | ~17h | Frontend propre (TanStack Query, types stricts) |
| Sprint 3 | ~14h | Couverture tests 60%+ + E2E verts |
| Sprint 4 | ~8h | Code normalise + pret pour prod |
| **Total** | **~45h** | **Simply GMAO production-ready** |

---

## DEPENDANCES CLES

```
Sprint 1 (Backend)
    |
    v
Sprint 2 (Frontend) <-- depend du backend stable
    |
    v
Sprint 3 (Tests) <-- depend du frontend/backend finalises
    |
    v
Sprint 4 (Qualite/Deploy) <-- depend de tout le reste
```

---

## PROCHAINES ACTIONS IMMEDIATES

1. **Demarrer Sprint 1** : CSP + Healthcheck + env SCADA (rapide, 1h15)
2. **Puis** : Cache Redis + Timeout Prisma + N+1 (gros morceau, 4-5h)
3. **Validation** : `npm run build` + `npm test` passent

---

*Plan genere le 11 Mai 2026*
