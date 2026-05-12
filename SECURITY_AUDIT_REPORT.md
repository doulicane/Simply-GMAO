# 🔍 Rapport d'Audit — Faiblesses & Bugs Simply GMAO

> Date : 2026-05-12
> Scope : Frontend (React/Vite), Backend (Express/Prisma), API REST, E2E Playwright
> Méthode : Tests exploratoires manuels + scripts Playwright + curl

---

## 🚨 CRITIQUES (Bloquants / Majeurs)

### 1. Génération de PDF totalement inopérante
**Fichier** : `app/backend/src/services/pdfService.ts`

**Description** : Toutes les fonctions de génération de PDF (`generateEquipmentPDF`, `generateAtexCompliancePDF`, `generateMonthlyReportPDF`) plantent avec une erreur de type interne non catchée :

```
TypeError: `options.font` must be of type `PDFFont` or `n`, but was actually of type `string`
```

**Cause** : Les fonctions auxiliaires `drawHeader()` et `drawFooter()` passent directement `StandardFonts.HelveticaBold` et `StandardFonts.Helvetica` (qui sont des **strings**) à `page.drawText()`. Or `pdf-lib` exige un objet `PDFFont` obtenu via `pdf.embedFont()`.

**Impact** : L'export PDF depuis la fiche équipement retourne du JSON d'erreur au lieu d'un fichier PDF. L'utilisateur télécharge un fichier `.pdf` contenant en réalité du JSON.

**Recommandation** : Modifier `drawHeader` / `drawFooter` pour accepter les objets `PDFFont` en paramètre et les passer à `drawText`.

```ts
// Au lieu de :
font: StandardFonts.HelveticaBold
// Utiliser :
font: fontBoldObj
```

---

### 2. Route ATEX mal montée (erreur de copier-coller)
**Fichier** : `app/backend/src/index.ts` ligne 247

**Description** :
```ts
app.use('/api/work-orders', atexRoutes);   // ❌
// Devrait être :
app.use('/api/atex', atexRoutes);          // ✅
```

**Impact** : Les endpoints ATEX sont accessibles via `/api/work-orders/compliance/pdf` au lieu de `/api/atex/compliance/pdf`. Cela crée une collision de routing et rend la documentation API incorrecte.

**Recommandation** : Corriger le mount path.

---

### 3. Stack traces exposées dans les réponses d'erreur (dev)
**Fichier** : `app/backend/src/middleware/errorHandler.ts`

**Description** : Le middleware `globalErrorHandler` ajoute le champ `stack` à la réponse JSON dès que `NODE_ENV === 'development'` (ligne 126). De plus, les erreurs `INTERNAL_ERROR` (comme le bug PDF) retournent toujours la stack trace.

**Impact** : Fuite d'information sur la structure interne du code (chemins de fichiers, versions de librairies, logique interne). Dangereux si l'environnement de production est déployé avec `NODE_ENV=development`.

**Preuve** :
```json
{
  "success": false,
  "error": "...",
  "code": "INTERNAL_ERROR",
  "stack": [
    "TypeError: ...",
    "    at /Users/.../backend/src/services/pdfService.ts:12:8",
    ...
  ]
}
```

**Recommandation** : Ne jamais exposer `stack` au client, même en dev. Logger côté serveur uniquement.

---

### 4. XSS stocké accepté par le backend
**Endpoint** : `POST /api/equipments`

**Description** : Le backend accepte et persiste des payloads HTML/JS dans les champs texte (ex: `name`) sans nettoyage ni validation.

**Preuve** :
```bash
curl -X POST /api/equipments -d '{"name": "<script>alert(1)</script>", ...}'
# → 201 Created
```

**Impact** : Bien que le frontend React échappe actuellement les caractères HTML, c'est une vulnérabilité si :
- Un autre client consomme l'API (mobile, export PDF fixé, etc.)
- Une future régression retire l'échappement
- Le contenu est inclus dans un email ou un PDF sans échappement

**Recommandation** : Sanitiser les entrées texte côté backend (ex: DOMPurify ou validation stricte).

---

## ⚠️ MOYENNES

### 5. `SCADA_API_KEY` bloque le démarrage du backend
**Fichier** : `app/backend/src/routes/scada.ts` lignes 25-28

**Description** :
```ts
if (!SCADA_API_KEY) {
  throw new Error('[SCADA] SCADA_API_KEY est obligatoire. L\'application ne peut pas demarrer.');
}
```

**Impact** : Un connecteur externe (SCADA) optionnel empêche le démarrage de l'application principale. Fragilité opérationnelle.

**Recommandation** : Rendre la clé optionnelle et désactiver la route SCADA si non configurée.

---

### 6. Incohérence Zod : `null` rejeté pour `ligneId`
**Fichier** : `app/backend/src/routes/equipments.ts` ligne 41

**Description** :
```ts
ligneId: z.string().uuid().optional(),
```

`optional()` accepte `undefined` mais **pas** `null`. Or le frontend envoie `null` pour les champs vides.

**Impact** : La création d'équipement échoue côté backend si le frontend envoie `ligneId: null`.

**Recommandation** :
```ts
ligneId: z.string().uuid().optional().nullable(),
```

---

### 7. Pas de rate limiting global sur les API CRUD
**Fichiers** : Toutes les routes sauf `auth.ts`

**Description** : Seul le login a un rate limiting (progressive lockout). Les endpoints de création, modification, suppression n'ont aucune protection.

**Impact** : Vulnérabilité aux attaques par force brute ou DoS sur les endpoints sensibles.

**Recommandation** : Ajouter un middleware de rate limiting global (ex: `express-rate-limit`) sur toutes les routes API.

---

### 8. Clés React dupliquées sur les listes
**Console** : `Encountered two children with the same key, %s`

**Description** : Plusieurs composants utilisent des clés React non uniques dans des listes (`map()`). Cela se produit probablement dans `KanbanBoard`, `EquipmentTree`, ou `Stock`.

**Impact** : Comportements erratiques du DOM (éléments dupliqués, omis, ou non mis à jour correctement).

**Recommandation** : Vérifier que chaque `key={...}` est unique et stable.

---

### 9. Accessibilité — Login non navigable au clavier
**Page** : `/login`

**Description** : La navigation par `Tab` depuis le chargement de la page n'atterrit pas directement sur le champ `username`. Le focus semble passer par d'autres éléments (logo ?) avant d'atteindre le formulaire.

**Impact** : Utilisateurs en situation de handicap ou utilisateurs avancés (keyboard-only) ne peuvent pas se connecter facilement.

**Recommandation** : Ajouter `autoFocus` sur le premier champ et vérifier l'ordre de tabulation (`tabindex`).

---

## ℹ️ FAIBLES (Améliorations)

### 10. Error Boundary trop générique
**Fichier** : `app/src/components/ErrorBoundary.tsx`

**Description** : Toute erreur React affiche « Une erreur est survenue. Veuillez réessayer. » sans indication sur la cause.

**Recommandation** : Différencier les erreurs réseau (retry), les erreurs de validation, et les erreurs inattendues.

---

### 11. Patterns glob fragiles dans les mocks E2E
**Fichier** : `app/e2e/mocks/api.ts`

**Description** : Les patterns comme `**/api/equipments?**` utilisent `?` comme wildcard Playwright, pas comme littéral. Bien que cela fonctionne dans la plupart des cas, ce n'est pas explicite.

**Recommandation** : Utiliser des RegExp explicites :
```ts
await page.route(/\/api\/equipments\?/, ...)
```

---

### 12. Page Planification sans heading cohérent
**Page** : `/planification`

**Description** : La page affiche un calendrier mais pas de heading `h1` avec le texte "PLANIFICATION". Le test E2E `getByRole('heading', { name: 'PLANIFICATION' })` échoue.

**Recommandation** : Ajouter un heading visible pour la cohérence UI et l'accessibilité.

---

### 13. Test E2E skipé
**Fichier** : `app/backend/src/__tests__/workOrders.test.ts` ligne 74

**Description** : Un test de mise à jour de statut est marqué `.skip('TODO: mock service')`.

**Recommandation** : Implémenter le mock et réactiver le test.

---

## ✅ Corrections appliquées (Sprint 8 — 2026-05-12)

| # | Item | Fichier(s) modifié(s) | Statut |
|---|------|----------------------|--------|
| 1 | Génération PDF inopérante | `pdfService.ts` | ✅ Corrigé — `drawHeader`/`drawFooter` reçoivent désormais des objets `PDFFont` embeddés |
| 2 | Route ATEX mal montée | `index.ts` | ✅ Corrigé — mount path changé en `/api/atex` |
| 3 | Stack traces exposées | `errorHandler.ts` | ✅ Corrigé — champ `stack` retiré des réponses JSON client, log serveur conservé |
| 4 | XSS stocké | `sanitize.ts`, `equipments.ts`, `workOrders.ts`, `stock.ts`, `tickets.ts` | ✅ Corrigé — helper `sanitizeString` + `sanitizeOptionalString` appliqués aux schémas Zod |
| 5 | `SCADA_API_KEY` bloquante | `scada.ts` | ✅ Corrigé — clé optionnelle, middleware retourne 503 si non configurée |
| 6 | Zod `null` rejeté | `equipments.ts` | ✅ Corrigé — `ligneId: z.string().uuid().optional().nullable()` |

## 📊 Résumé par criticité

| Criticité | Nombre | Items |
|-----------|--------|-------|
| 🚨 Critique | 0 | — |
| ⚠️ Moyenne | 4 | Rate limit manquant, Clés React, Accessibilité login, SCADA_KEY (corrigé) |
| ℹ️ Faible | 4 | Error Boundary, Mocks glob, Heading Planif, Test skipé |

---

## 🛠️ Plan d'action recommandé

1. ✅ **Corriger `pdfService.ts`** : passer les objets `PDFFont` à `drawHeader` / `drawFooter`
2. ✅ **Corriger le mount ATEX** dans `index.ts`
3. ✅ **Retirer les stack traces** des réponses client
4. ✅ **Sanitiser les inputs texte** côté backend
5. ✅ **Rendre `SCADA_API_KEY` optionnelle**
6. ✅ **Corriger `ligneId: z.string().uuid().optional().nullable()`**
7. **Ajouter `express-rate-limit`** sur les routes CRUD *(Sprint 9)*
8. **Corriger les clés React dupliquées** *(Sprint 9)*
9. **Ajouter `autoFocus`** sur le login *(Sprint 9)*
10. **Ajouter un heading** sur la page Planification *(Sprint 10)*
