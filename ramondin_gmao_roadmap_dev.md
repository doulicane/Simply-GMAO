# Roadmap de Développement — GMAO Ramondin

## Document de planification agile — Sprints 2 semaines — Stack React + Node + PostgreSQL + Docker

**Version :** 1.0 — Prêt pour exécution  
**Date :** Juin 2025  
**Statut :** Validé pour développement sur mesure (sur site)  
**Méthodologie :** Agile Scrum, sprints de 2 semaines, review terrain tous les 2-3 sprints  
**Équipe type :** 1 Lead Dev Fullstack + 1 Dev Frontend + 1 Dev Backend + 1 PO/Analyste (3 développeurs + 1 PO)

---

## 1. Vue d'ensemble de la roadmap

### 1.1 Phases, sprints et livrables

| Phase | Sprints | Période estimée | Objectif stratégique | Livrable principal |
|-------|---------|-----------------|----------------------|-------------------|
| **Phase 0 — Fondations** | S0 | Semaine 1 | Setup technique, infra, équipe opérationnelle | Serveur de dev opérationnel, repo Git, CI/CD minimal |
| **Phase 1 — V1 MVP** | S1 à S8 | Semaines 2-17 (~4 mois) | Core GMAO numérique : équipements, BT, préventif, stocks, ATEX, dashboards | GMAO testable en atelier dès S4, V1 complète en S8 |
| **Phase 2 — V1 Consolidation** | S9 à S12 | Semaines 18-25 (~2 mois) | Documentation, reporting avancé, recette terrain, go-live | GMAO en production sur site pilote |
| **Phase 3 — V2 Amorçage** | S13 à S14 | Semaines 26-29 (~2 mois) | Extension zone B, intégration ERP/SCADA design, optimisations | Spécifications V2 validées, code prêt |

### 1.2 Objectif par phase

**V1 MVP (S1-S8) :** Fournir une GMAO numérique minimaliste mais opérationnelle qui remplace le papier pour les bons de travail et le planning préventif. Pilote sur 1 site, 1 zone, 20-30 équipements, 4 techniciens. Mode hors-ligne fonctionnel. Conformité ATEX intégrée dès le début.

**V1 Consolidation (S9-S12) :** Stabiliser, documenter, former, déployer en production. Générer les premiers rapports KPIs. Valider avec les techniciens sur le terrain. Zéro BT papier.

**V2 Amorçage (S13-S14) :** Préparer l'extension multi-zone, concevoir les connecteurs ERP et SCADA. Optimiser les performances et l'expérience utilisateur sur retour terrain.

### 1.3 Vue synthétique 14 sprints

| Sprint | Semaine | Points | Thème |
|--------|---------|--------|-------|
| S0 | 1 | — | Setup technique + Infrastructure |
| S1 | 2-3 | 38 | Auth / Users / Roles / Référentiel équipements / ATEX |
| S2 | 4-5 | 42 | BT création / Portail opérateur v1 / Workflow statut / PWA base |
| S3 | 6-7 | 44 | Kanban planification / Exécution BT / Chronométrage / Mode offline |
| S4 | 8-9 | 40 | Clôture BT / Photos / Consommation pièces / Stocks basique |
| S5 | 10-11 | 42 | Préventif CRUD / Génération auto BT / Checklists / Alertes |
| S6 | 12-13 | 38 | ATEX bloc sécurité / Contact alimentaire / Audit trail / Dashboard v1 |
| S7 | 14-15 | 40 | Stocks avancés / Inventaire mobile / QR articles / Alertes stock |
| S8 | 16-17 | 42 | KPIs / Dashboard direction / Export Excel / Sync offline complète |
| S9 | 18-19 | 38 | Documents techniques / Sous-ensembles / Compteurs / Migration données |
| S10 | 20-21 | 40 | Reporting PDF / Rapport mensuel / Pareto / Recette terrain |
| S11 | 22-23 | 38 | Portail opérateur final / Widgets / Multi-langue / Tests E2E |
| S12 | 24-25 | 36 | Go-Live V1 / Formation / Documentation / Corrections / Perf |
| S13 | 26-27 | 36 | V2 Amorçage — Extension Zone B / Design ERP connector |
| S14 | 28-29 | 34 | V2 Amorçage — SCADA endpoint / SSO / Optimisations |

**Total :** 14 sprints (28 semaines + 1 semaine S0) = ~7 mois  
**Total points :** ~560 story points  
**Capacité équipe :** 3 devs × 10 jours/sprint × 0.7 vélocité = ~21 jours-dev/sprint = ~42 points/sprint (1 point = ½ jour)

---

## 2. Découpage en Sprints (2 semaines chacun)

---

### Sprint 0 (S0) — Setup technique & Infrastructure

| | |
|---|---|
| **Objectif** | Mettre en place l'environnement de développement, le serveur local, Docker, CI/CD et la base de données. |
| **Durée** | 1 semaine (sprint 0 raccourci) |

- **Tâches techniques :**
  - [ ] Provisionnement serveur Ubuntu 22.04 LTS (ou VM)
  - [ ] Installation Docker + Docker Compose
  - [ ] Mise en place repo Git (monorepo front + back + docker)
  - [ ] Docker Compose : nginx, postgres, redis, api (Node), frontend (React)
  - [ ] Prisma ORM initialisé, premier schéma DB, première migration
  - [ ] Seed basique (admin user, sites, zones types, familles articles types)
  - [ ] Setup CI minimal (GitHub Actions / GitLab CI) : lint + build + test unitaires
  - [ ] Configuration VS Code, conventions de code, pre-commit hooks
  - [ ] Certificat TLS auto-signé ou CA interne
  - [ ] Documentation technique initiale (README, ARCHITECTURE.md)

- **Fonctionnalités livrées :** Aucune (fondations)
- **User stories associées :** E008 (Administration — fondations)
- **Dépendances :** Aucune
- **Points estimés :** — (setup, pas de story points métier)
- **Risques / Hypothèses :**
  - **Risque :** Le serveur physique n'est pas livré à temps → Mitigation : utiliser une VM sur PC de développement en attendant
  - **Hypothèse :** L'équipe est formée à TypeScript, React, Node.js, Docker

---

### Sprint 1 (S1) — Authentification, Users, Roles & Référentiel Équipements

| | |
|---|---|
| **Objectif** | Sécuriser l'accès et constituer le référentiel arborescent des équipements avec identification ATEX. |
| **Période** | Semaines 2-3 |

- **Fonctionnalités livrées :**
  - ADM-001 à ADM-007 : Création / modification / désactivation utilisateurs, envoi identifiants par email, réinitialisation mot de passe, gestion rôles et permissions, session JWT, logs connexion
  - ADM-008 à ADM-015 : Paramétrage types BT, causes, actions, unités compteur, familles articles, criticité, seuils alertes, codification équipements
  - ACT-001 à ACT-005 : CRUD sites, zones, lignes
  - ACT-007 à ACT-008 : CRUD équipements (machine) avec criticité, statut, ATEX, contact alimentaire
  - ACT-012, ACT-014, ACT-022 : Génération QR code équipement, recherche équipement, badge ATEX
  - ATEX-001 : Identification ATEX équipement (Zone 20/21/22/Non ATEX)
  - ALIM-001 : Flag contact alimentaire

- **User stories associées :** US-001, US-025, US-028, US-029, E001, E007, E008

- **Tâches techniques :**
  - [ ] API Auth JWT (login, refresh, logout, me) avec bcrypt + Redis blacklist
  - [ ] RBAC middleware (permissions par rôle sur chaque endpoint)
  - [ ] Modèles Prisma : utilisateurs, roles, sites, zones, lignes, equipements
  - [ ] Migrations DB + seeds (types, familles, seuils)
  - [ ] Frontend : layout authentifié, navigation conditionnelle par rôle
  - [ ] UI CRUD équipements (formulaire responsive, table avec filtres)
  - [ ] Génération QR codes côté serveur (lib qrcode JS)
  - [ ] Badge visuel ATEX + filtre rapide
  - [ ] Service Worker initial (cache app shell)

- **Dépendances :** S0 terminé
- **Points estimés :** 38 points
- **Risques / Hypothèses :**
  - **Risque :** Email serveur (SMTP) non configuré → Mitigation : envoi via console/logs en dev, config SMTP externe en recette
  - **Hypothèse :** Les 10 types d'équipements métier sont validés par le responsable maintenance

---

### Sprint 2 (S2) — Bons de Travail : Création & Portail Opérateur

| | |
|---|---|
| **Objectif** | Permettre aux opérateurs de déclarer des pannes en 30 secondes et aux responsables de créer des BT complets. |
| **Période** | Semaines 4-5 |

- **Fonctionnalités livrées :**
  - BT-001 à BT-003 : Création BT opérateur (simplifié), création BT responsable (complet), règles ATEX à la création
  - BT-004 : Workflow statut BT (machine à états CREE → A_PLANIFIER → PLANIFIE → EN_COURS → A_CLOTURER → CLOTURE)
  - BT-005 : Transition CREE → A_PLANIFIER
  - BT-021 : Notification changement statut (push + email)
  - OPP-001 à OPP-004 : Portail opérateur — écran accueil, scan QR, formulaire déclaration, création BT < 30s
  - OPP-005 : Suivi mes demandes opérateur
  - ACT-015 : Scan QR code équipement (lecteur caméra PWA)

- **User stories associées :** US-005, US-023, US-011 (partiel), E002, E006

- **Tâches techniques :**
  - [ ] Modèle `bons_travail` Prisma avec workflow state machine
  - [ ] API CRUD BT + transitions statut avec validation RBAC
  - [ ] Table `bt_workflow_log` pour traçabilité transitions
  - [ ] Frontend : formulaire BT opérateur ultra-simplifié (3 champs)
  - [ ] Frontend : formulaire BT complet (responsable/technicien)
  - [ ] Intégration scan QR (html5-qrcode) dans PWA
  - [ ] Notifications push internes (Web Push API) — MVP sans serveur externe
  - [ ] Emails (nodemailer) pour notifications
  - [ ] PWA : écran opérateur standalone, navigation simplifiée
  - [ ] IndexedDB : préchargement référentiel équipements pour offline

- **Dépendances :** S1 (équipements, auth, ATEX)
- **Points estimés :** 42 points
- **Risques / Hypothèses :**
  - **Risque :** Les opérateurs n'ont pas de smartphones ou refusent de les utiliser → Mitigation : tablettes kiosque en production comme fallback
  - **Hypothèse :** Le réseau WiFi couvre les zones de déclaration des opérateurs

---

### Sprint 3 (S3) — Kanban Planification & Exécution BT Mobile

| | |
|---|---|
| **Objectif** | Le responsable planifie via Kanban, le technicien démarre/termine ses interventions avec chronométrage. |
| **Période** | Semaines 6-7 |

- **Fonctionnalités livrées :**
  - BT-006 : Transition A_PLANIFIER → PLANIFIE (affectation technicien + date, détection conflit charge)
  - BT-007 : Transition PLANIFIE → EN_COURS (démarrer intervention, timestamp)
  - BT-008, BT-009 : Pause / Reprise intervention
  - BT-010 : Transition EN_COURS → A_CLOTURER (terminer, saisie causes, actions, temps passé)
  - BT-011, BT-012 : Saisie cause panne et actions réalisées (listes configurables)
  - BT-016 : Vue Kanban planification (colonnes statut, drag & drop)
  - BT-017, BT-018 : Vue calendrier planification, affichage charge technicien
  - BT-019 : Filtrage BT multi-critères
  - US-006, US-007 : Planification et chronométrage

- **User stories associées :** US-006, US-007, US-008, E002

- **Tâches techniques :**
  - [ ] API transitions BT avec validations métier (un seul BT EN_COURS par technicien)
  - [ ] API calcul temps passé auto (fin - début - pauses)
  - [ ] Frontend Kanban (react-beautiful-dnd ou @hello-pangea/dnd)
  - [ ] Frontend calendrier (react-big-calendar ou FullCalendar)
  - [ ] Frontend exécution BT mobile (boutons 64×64 dp, contrastes élevés, gant-compatible)
  - [ ] Chronométrage temps réel avec Web Worker (affichage mm:ss en cours)
  - [ ] Saisie hors-ligne des transitions BT (IndexedDB + sync différée)
  - [ ] Conflit de charge : somme heures planifiées par jour/technicien

- **Dépendances :** S2 (BT création, workflow statut)
- **Points estimés :** 44 points
- **Risques / Hypothèses :**
  - **Risque :** Le drag & drop Kanban sur mobile est difficile → Mitigation : boutons de transition sur mobile, DnD uniquement desktop
  - **Hypothèse :** Les techniciens acceptent de porter des tablettes/smartphones en atelier

---

### Sprint 4 (S4) — Clôture BT, Photos & Stocks Basique → **LIVRABLE TESTABLE**

| | |
|---|---|
| **Objectif** | Boucler le cycle de vie complet du BT (création à clôture) avec photos et consommation de pièces + gestion stocks basique. |
| **Période** | Semaines 8-9 |

- **Fonctionnalités livrées :**
  - BT-010 (suite), BT-014 : Transition A_CLOTURER → CLOTURE, validation responsable, commentaire clôture
  - BT-013 : BT partiellement terminé (création BT fils)
  - BT-015 : Rouvrir un BT clôturé
  - BT-020 : Export BT période (Excel)
  - ACT-020, ACT-021 : Upload et consultation document attaché équipement
  - STK-001 à STK-004 : CRUD articles, fiche article avec stock
  - STK-005, STK-006 : Entrée / sortie stock avec scan QR
  - STK-012 : Alerte stock minimum
  - STK-016 : Articles critiques Ramondin (liste préconfigurée)

- **User stories associées :** US-009, US-010, US-016, US-017, US-018, E002, E004

- **Tâches techniques :**
  - [ ] API upload fichiers (multer), stockage `/data/uploads/photos/` et `/documents/`
  - [ ] Redimensionnement images côté serveur (sharp), compression JPEG 80%
  - [ ] API CRUD stocks, mouvements atomiques (transactions SQL)
  - [ ] Modèle `stock_mouvements` insert-only avec trigger calcul stock
  - [ ] Frontend : saisie pièces sur BT (scan QR article ou recherche)
  - [ ] Frontend : écran clôture BT (validation responsable)
  - [ ] Frontend : gestion stocks (entrée/sortie simple)
  - [ ] Job quotidien alertes stock (node-cron + BullMQ)
  - [ ] Export Excel BT (ExcelJS streaming)

- **Dépendances :** S3 (exécution BT EN_COURS)
- **Points estimés :** 40 points
- **Risques / Hypothèses :**
  - **Risque :** Le stock de départ est inconnu → Mitigation : sprint de migration données prévu S9, inventaire initial obligatoire avant Go-Live
  - **Livrable testable :** Dès la fin de ce sprint, un opérateur peut créer un BT, un responsable le planifier, un technicien l'exécuter et le clôturer, avec consommation de pièces et alertes stock.

---

### Sprint 5 (S5) — Maintenance Préventive & Checklists

| | |
|---|---|
| **Objectif** | Automatiser la maintenance préventive avec génération de BT, checklists et alertes d'échéance. |
| **Période** | Semaines 10-11 |

- **Fonctionnalités livrées :**
  - PRE-001, PRE-002 : Créer plan préventif temporel calendaire et compteur
  - PRE-003 : Plan préventif conditionnel (seuil)
  - PRE-004 : Modifier / supprimer plan préventif
  - PRE-005, PRE-006, PRE-007 : Génération automatique BT préventif (temporel, compteur, conditionnel)
  - PRE-008 : Alertes échéances préventives (7j, 3j, J, retard)
  - PRE-009, PRE-010 : Vue préventifs à venir et calendrier préventifs
  - PRE-012 : Report de préventif
  - DOC-006, DOC-007 : Créer / modifier / dupliquer checklist modèle
  - DOC-008 : Associer checklist à plan préventif
  - DOC-009 : Exécuter checklist sur BT préventif
  - US-012, US-013, US-014, US-015 : Plan préventif, génération auto, checklist, préventifs à venir

- **User stories associées :** US-012, US-013, US-014, US-015, E003

- **Tâches techniques :**
  - [ ] Modèles Prisma : plans_preventifs, checklists, checklist_etapes
  - [ ] Job serveur génération BT préventifs (BullMQ + cron horaire)
  - [ ] Job serveur compteur (quotidien)
  - [ ] API CRUD plans préventifs
  - [ ] Frontend : formulaire plan préventif (fréquence, marge, technicien)
  - [ ] Frontend : éditeur checklist (étapes avec type réponse configurable)
  - [ ] Frontend : exécution checklist étape par étape sur BT mobile
  - [ ] Stockage checklist en JSONB PostgreSQL
  - [ ] Alertes échéances (notification push + email)

- **Dépendances :** S4 (BT cycle complet, stocks)
- **Points estimés :** 42 points
- **Risques / Hypothèses :**
  - **Risque :** La fréquence des préventifs n'est pas connue au démarrage → Mitigation : valeurs par défaut paramétrables, ajustement facile par admin

---

### Sprint 6 (S6) — ATEX Avancé, Audit Trail & Dashboard v1

| | |
|---|---|
| **Objectif** | Intégrer la conformité ATEX complète dans le workflow BT, activer l'audit trail et livrer le premier dashboard responsable. |
| **Période** | Semaines 12-13 |

- **Fonctionnalités livrées :**
  - ATEX-002 : Bloc sécurité ATEX sur BT (création)
  - ATEX-003 : Bloc sécurité ATEX sur BT (exécution) — consignation, permis de feu, outillage Ex, nettoyage, dépression
  - ATEX-004 : Inspecteur ATEX + signature numérique
  - ATEX-005 : Date prochaine inspection ATEX calculée
  - ATEX-006, ATEX-007 : Plan préventif ATEX réglementaire + génération auto
  - ATEX-009 : Traçabilité ATEX complète (blocage clôture si champs manquants)
  - ALIM-002, ALIM-003 : BT contact alimentaire (nettoyage, produits utilisés)
  - ADM-016, ADM-017, ADM-018 : Audit trail actions, consultation, soft delete
  - ADM-020, ADM-021 : Sauvegarde automatique, restauration
  - RPT-001, RPT-002 : Dashboard technicien et responsable v1
  - US-020 : Dashboard responsable maintenance
  - US-026 : Consignation BT ATEX
  - US-027 : Contrôle ATEX réglementaire (partiel)

- **User stories associées :** US-020, US-025, US-026, US-027, E005, E007

- **Tâches techniques :**
  - [ ] Modèles Prisma : atex_interventions, contact_alimentaire_interventions, audit_logs
  - [ ] Triggers PostgreSQL pour audit trail (CREATE/UPDATE/DELETE)
  - [ ] API endpoints ATEX (GET/PATCH sur BT)
  - [ ] Validation blocante ATEX à la transition A_CLOTURER → CLOTURE
  - [ ] Signature numérique ATEX (re-saisie mot de passe + horodatage)
  - [ ] Frontend : bloc ATEX conditionnel sur écran exécution BT
  - [ ] Frontend : dashboard responsable (widgets React + Recharts)
  - [ ] Job backup quotidien (pg_dump + rsync uploads)
  - [ ] Interface restauration admin

- **Dépendances :** S5 (préventif, checklists)
- **Points estimés :** 38 points
- **Risques / Hypothèses :**
  - **Risque :** ATEX mal intégrée → refus HSE → Mitigation : review dédiée avec HSE à la fin du sprint, checklist validation ATEX
  - **Hypothèse :** Les procédures ATEX existantes de Ramondin sont fournies (consignation, permis de feu, inspection)

---

### Sprint 7 (S7) — Stocks Avancés, Inventaire Mobile & QR Articles

| | |
|---|---|
| **Objectif** | Finaliser la gestion des stocks avec mouvements avancés, inventaire physique et alertes. |
| **Période** | Semaines 14-15 |

- **Fonctionnalités livrées :**
  - STK-003 : Générer QR code article
  - STK-005 à STK-009 : Entrée, sortie, réservation, transfert, retour stock
  - STK-010 : Inventaire physique mobile (scan QR, saisie quantité réelle)
  - STK-011 : Validation ajustement inventaire (responsable)
  - STK-012, STK-013 : Alertes stock minimum et maximum
  - STK-014 : Alerte réservation impossible
  - STK-015 : Sortie ATEX spécifique
  - STK-017, STK-018, STK-019 : Historique mouvements, recherche article, export stock
  - STK-020 : Pièces dormantes
  - US-019 : Inventaire physique mobile

- **User stories associées :** US-019, E004

- **Tâches techniques :**
  - [ ] API mouvements atomiques (réservation, transfert, retour)
  - [ ] Annulation auto réservation après 48h (job BullMQ)
  - [ ] Frontend : inventaire mobile (scan → stock théorique → saisie réel)
  - [ ] Frontend : validation écarts inventaire (desktop)
  - [ ] Génération QR code article côté serveur
  - [ ] Impression étiquettes article
  - [ ] Inventaire offline (IndexedDB) + sync

- **Dépendances :** S4 (stocks basique)
- **Points estimés :** 40 points
- **Risques / Hypothèses :**
  - **Risque :** Le magasinier n'a pas de tablette → Mitigation : interface desktop pour saisie, tablette magasin partagée
  - **Hypothèse :** Les emplacements magasin sont identifiés et nommés

---

### Sprint 8 (S8) — KPIs, Dashboard Direction & Synchronisation Offline Complète

| | |
|---|---|
| **Objectif** | Livrer les indicateurs de performance, le dashboard direction et finaliser la synchronisation hors-ligne. |
| **Période** | Semaines 16-17 |

- **Fonctionnalités livrées :**
  - RPT-003 : Dashboard direction (mois/trimestre)
  - RPT-004 à RPT-011 : MTTR, MTBF, taux préventif, disponibilité, coût maintenance, temps réponse, respect plan préventif, ruptures stock
  - RPT-012 : Graphiques interactifs (Recharts)
  - RPT-013 : Export Excel BT période
  - RPT-016 : Rapport Pareto pannes
  - RPT-017 : Comparaison période N vs N-1
  - US-021 : MTTR / MTBF automatique
  - DOC-014 : Synchronisation PWA documents (cache LRU)
  - Sync offline final : BT complets, photos, mouvements stock, compteurs, inventaire

- **User stories associées :** US-021, US-022 (partiel), E005

- **Tâches techniques :**
  - [ ] Calculs KPIs côté API avec cache Redis (TTL 1h)
  - [ ] Frontend : widgets dashboard direction (barres, lignes, camemberts)
  - [ ] Frontend : dashboard technicien (vue jour/semaine)
  - [ ] Sync Manager PWA final : détection reconnexion, file d'attente priorisée, gestion conflits
  - [ ] Barre de statut sync visible en permanence
  - [ ] Tests de charge : 50 connexions simultanées
  - [ ] Tests end-to-end offline → online

- **Dépendances :** S6 (dashboard v1), S7 (stocks avancés)
- **Points estimés :** 42 points
- **Risques / Hypothèses :**
  - **Risque :** Calculs KPIs lents sur gros volumes → Mitigation : vues matérialisées PostgreSQL + cache Redis agressif
  - **Hypothèse :** Au moins 2-3 mois de données BT existent pour calculer les KPIs (même si migration est partielle)

---

### Sprint 9 (S9) — Documents Techniques, Sous-ensembles, Compteurs & Migration Données

| | |
|---|---|
| **Objectif** | Enrichir le référentiel avec sous-ensembles, documents attachés, compteurs et procéder à la migration des données initiales. |
| **Période** | Semaines 18-19 |

- **Fonctionnalités livrées :**
  - ACT-010, ACT-011 : CRUD sous-ensembles
  - ACT-018, ACT-019 : Saisir compteur manuel, configurer seuil compteur
  - ACT-016, ACT-017 : Historique interventions équipement, export PDF historique
  - DOC-001 à DOC-005 : Upload, remplacer version, consulter, recherche documents
  - DOC-011, DOC-012, DOC-013 : Historique consultations, document "en vigueur", suppression
  - ACT-013 : Imprimer QR codes par lot (format A4)
  - US-003, US-004, US-024, US-030 : Historique, statut équipement, impression QR, compteur
  - **Migration données :** Import référentiel équipements (Excel → DB), import articles stock, import utilisateurs

- **User stories associées :** US-003, US-004, US-024, US-030, E001

- **Tâches techniques :**
  - [ ] Modèle `sous_ensembles` Prisma
  - [ ] Modèle `compteur_releves` + API saisie
  - [ ] Upload documents jusqu'à 50 Mo, stockage local
  - [ ] PDF viewer inline (PDF.js), lecteur vidéo HTML5
  - [ ] Génération PDF historique équipement (Puppeteer)
  - [ ] Script d'import CSV/Excel (équipements, articles, users)
  - [ ] Validation et nettoyage données importées
  - [ ] Génération QR codes par lot en PDF A4

- **Dépendances :** S8 (core stable)
- **Points estimés :** 38 points
- **Risques / Hypothèses :**
  - **Risque :** Données historiques inexistantes ou de mauvaise qualité → Mitigation : templates Excel fournis au responsable, saisie manuelle des 30 équipements pilote si nécessaire
  - **Hypothèse :** Les documents techniques existants sont disponibles en PDF

---

### Sprint 10 (S10) — Reporting PDF, Recette Terrain & Optimisations

| | |
|---|---|
| **Objectif** | Générer les rapports PDF direction, réaliser la première recette terrain avec les techniciens et optimiser les performances. |
| **Période** | Semaines 20-21 |

- **Fonctionnalités livrées :**
  - RPT-014 : Export PDF fiche équipement + historique
  - RPT-015 : Rapport mensuel automatique PDF (job cron)
  - RPT-018 : Widget personnalisable dashboard
  - DOC-015 : Export liste documents
  - US-022 : Export rapport mensuel PDF
  - ATEX-010 : Export conformité ATEX (PDF annuel)
  - SEC-001, SEC-002, SEC-003 : Plan préventif sécurité machines, checklist, traçabilité
  - **Recette terrain :** Tests sur machines réelles avec 2 techniciens pilotes
  - **Optimisations :** Performance API < 1s, taille bundle PWA < 2 Mo gzippé

- **User stories associées :** US-022, E005, E007

- **Tâches techniques :**
  - [ ] Template HTML/CSS rapport mensuel avec logo Ramondin
  - [ ] Job cron mensuel génération PDF (BullMQ)
  - [ ] Frontend : configuration widgets dashboard (drag & drop préférences)
  - [ ] Plan préventif sécurité machines (type spécifique)
  - [ ] Export conformité ATEX PDF
  - [ ] Session recette terrain (2-3 jours) — observations, corrections
  - [ ] Optimisation requêtes Prisma (lazy loading, eager load)
  - [ ] Compression bundle Vite (code splitting, lazy routes)
  - [ ] Cache API Redis optimisation

- **Dépendances :** S9 (documents, sous-ensembles)
- **Points estimés :** 40 points
- **Risques / Hypothèses :**
  - **Risque :** Résistance au changement des techniciens → Mitigation : review terrain avec accompagnement, formation hands-on, intégrer leurs retours immédiatement
  - **Hypothèse :** 2 techniciens "champions" sont identifiés pour le pilote

---

### Sprint 11 (S11) — Portail Opérateur Final, Tests E2E & Multi-langue

| | |
|---|---|
| **Objectif** | Finaliser le portail opérateur avec kiosque et notifications reprise, passer les tests end-to-end et ajouter la multi-langue FR/ES. |
| **Période** | Semaines 22-23 |

- **Fonctionnalités livrées :**
  - OPP-006, OPP-007 : Notification BT terminé + confirmation reprise production
  - OPP-008 : Ajout commentaire/photo complémentaire opérateur
  - OPP-009 : Mode kiosque (plein écran, timeout retour accueil)
  - OPP-010 : Impression QR codes équipements par lot (A4)
  - BT-023 : Ajout commentaire/photo opérateur sur BT en cours
  - BT-024 : Rappel automatique préventif (24h avant)
  - BT-025 : Dupliquer BT
  - ADM-019 : Anonymisation utilisateur (RGPD)
  - Multi-langue : i18n FR + ES (react-i18next)
  - Tests E2E : Cypress / Playwright (scénarios critiques)

- **User stories associées :** US-011, E006, E008

- **Tâches techniques :**
  - [ ] Frontend kiosque mode (fullscreen, lock orientation, inactivity timeout)
  - [ ] Frontend : écran confirmation reprise production (bouton "Confirmer")
  - [ ] Notification push persistante reprise production
  - [ ] i18n architecture (dictionnaires FR/ES)
  - [ ] Tests E2E : création BT → planification → exécution → clôture
  - [ ] Tests E2E : mode offline → online sync
  - [ ] Tests E2E : ATEX workflow complet
  - [ ] Tests E2E : inventaire mobile

- **Dépendances :** S10 (recette terrain)
- **Points estimés :** 38 points
- **Risques / Hypothèses :**
  - **Risque :** Tests E2E instables sur PWA offline → Mitigation : tests isolés par scénario, mock IndexedDB
  - **Hypothèse :** Les opérateurs hispanophones de Laguardia sont pris en compte (ES)

---

### Sprint 12 (S12) — Go-Live V1, Formation & Documentation

| | |
|---|---|
| **Objectif** | Déployer la V1 en production sur le serveur usine, former les utilisateurs et livrer la documentation. |
| **Période** | Semaines 24-25 |

- **Fonctionnalités livrées :**
  - Déploiement production (serveur dédié usine)
  - Formation responsable maintenance (4h)
  - Formation techniciens (2h × 4 techs)
  - Formation magasinier (2h)
  - Formation opérateurs (30 min × 20 opérateurs)
  - Documentation admin (PDF) : gestion utilisateurs, paramétrage, sauvegardes
  - Documentation technicien (fiche A4 laminée) : scan QR, démarrer/terminer BT, saisie pièces
  - Documentation opérateur (fiche A4) : 3 clics pour déclarer une panne
  - Corrections bugs critiques remontés recette
  - Optimisations performance finales
  - Monitoring Uptime Kuma (optionnel)

- **Tâches techniques :**
  - [ ] Déploiement Docker Compose sur serveur usine
  - [ ] Migrations Prisma en production
  - [ ] Seed production (utilisateurs, paramètres)
  - [ ] Import données migration (équipements, articles)
  - [ ] Tests de charge en production (50 utilisateurs simultanés)
  - [ ] Vérification backup auto (pg_dump + rsync)
  - [ ] Rollback planifié (images Docker versionnées)
  - [ ] Fiches imprimées pour atelier
  - [ ] Support hypercare (2 semaines post Go-Live)

- **Dépendances :** S11 (tests E2E passés)
- **Points estimés :** 36 points
- **Risques / Hypothèses :**
  - **Risque :** Serveur local en panne jour du Go-Live → Mitigation : serveur de test comme fallback temporaire, hypercare renforcée
  - **Risque :** Données de test en production → Mitigation : wipe DB test, import propre, vérification admin

---

### Sprint 13 (S13) — V2 Amorçage : Extension Zone B & Connecteurs

| | |
|---|---|
| **Objectif** | Étendre le référentiel à la Zone B et concevoir les connecteurs ERP et SCADA. |
| **Période** | Semaines 26-27 |

- **Fonctionnalités livrées :**
  - Extension référentiel : équipements Zone B (laquage, sérigraphie, emballage)
  - Duplication rapide équipements (ACT-024)
  - Spécification technique connecteur ERP (endpoint design)
  - Spécification technique connecteur SCADA (endpoint `/api/compteurs/push`)
  - API endpoint compteurs push (stub, prêt pour SCADA)
  - PRE-016 : Synchronisation compteur SCADA (stub)
  - Optimisation requêtes (index, vues matérialisées)
  - Refactoring front (composants partagés)

- **Tâches techniques :**
  - [ ] Création équipements Zone B (import CSV)
  - [ ] Duplication équipement API + UI
  - [ ] Design document API ERP connector (webhook / polling)
  - [ ] Design document API SCADA connector (POST compteurs)
  - [ ] Endpoint `/api/v1/compteurs/push` (auth API key, validation données)
  - [ ] Optimisation DB : index manquants, vues matérialisées KPIs
  - [ ] Refactoring composants React (design system)

- **Dépendances :** S12 (V1 en production)
- **Points estimés :** 36 points

---

### Sprint 14 (S14) — V2 Amorçage : SSO, Reporting Avancé & Stabilisation

| | |
|---|---|
| **Objectif** | Préparer l'authentification SSO, enrichir le reporting et stabiliser pour V2. |
| **Période** | Semaines 28-29 |

- **Fonctionnalités livrées :**
  - ADM-006 (SSO) : Design intégration Active Directory / LDAP
  - RPT-018 : Widgets personnalisables (sauvegarde préférences)
  - Export données multi-critères (E503)
  - Audit trail consultation (E601)
  - Rapport conformité (E602)
  - Corrections V1 post Go-Live (retours terrain)
  - Documentation V2 (specs techniques)

- **Tâches techniques :**
  - [ ] Recherche SSO Node.js (passport-saml / passport-ldapauth)
  - [ ] Sauvegarde préférences utilisateur dashboard (DB + localStorage)
  - [ ] Export données multi-critères (streaming Excel)
  - [ ] Corrections bugs remontés hypercare
  - [ ] Revue architecture V2 avec équipe

- **Dépendances :** S13
- **Points estimés :** 34 points

---

## 3. Plan de déploiement par environnement

### 3.1 Environnement de développement (local des devs)

| Élément | Configuration |
|---------|---------------|
| **Machine** | PC développeur (Linux/macOS/Windows + WSL2) |
| **Docker** | Docker Desktop / docker-compose |
| **Base** | PostgreSQL 16 en conteneur (données locales) |
| **Redis** | Redis 7 en conteneur |
| **Front** | Vite dev server (`npm run dev`) sur localhost:5173 |
| **API** | Node.js nodemon (`npm run dev`) sur localhost:3000 |
| **Proxy** | Nginx en conteneur ou vite proxy |
| **Données** | Seed automatique + fixtures de test |
| **Tests** | Jest (unit), Cypress/Playwright (E2E) |

**Procédure :**
```bash
git clone <repo>
cd ramondin-gmao
docker-compose -f docker-compose.dev.yml up -d  # DB + Redis
npm install        # front
npm run dev        # front localhost:5173
cd api && npm install && npm run dev  # API localhost:3000
```

### 3.2 Environnement de test / recette (serveur de pré-prod)

| Élément | Configuration |
|---------|---------------|
| **Machine** | Serveur dédié usine OU VM sur hyperviseur existant |
| **OS** | Ubuntu 22.04 LTS |
| **Docker** | Docker Compose production-like |
| **Base** | PostgreSQL 16 (données de test — mirror production partiel) |
| **Données** | Snapshot de la production anonymisé ou données synthétiques |
| **Accès** | LAN usine uniquement (192.168.x.x) |
| **URL** | `https://gmao-test.ramondin.local` |
| **Usage** | Recette UAT, démo terrain, tests de charge |

**Procédure de livraison recette :**
```bash
# CI/CD build
npm run build
docker-compose build
# Déploiement recette
docker-compose -f docker-compose.recette.yml up -d
npx prisma migrate deploy
npm run seed:recette
```

### 3.3 Environnement de production (serveur dédié usine)

| Élément | Configuration |
|---------|---------------|
| **Machine** | Serveur tour Dell/HPE ou PC industriel (2 000-3 000 €) |
| **Specs** | 4 cœurs, 32 Go RAM, 2×SSD 500 Go RAID 1, 1×SSD 1 To données |
| **OS** | Ubuntu 22.04 LTS |
| **Docker** | Docker Compose (fichier `docker-compose.prod.yml`) |
| **Backup** | pg_dump quotidien 02h + rsync uploads + snapshot volumes |
| **Monitoring** | Uptime Kuma (optionnel) + `docker stats` + logrotate |
| **URL** | `https://gmao.ramondin.local` |
| **Accès** | LAN usine uniquement, VLAN Maintenance isolé |
| **Certificat** | Auto-signé CA interne ou Let's Encrypt si domaine public |

### 3.4 Processus de livraison CI/CD

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Commit    │───>│   Build CI  │───>│   Recette   │───>│  Production │
│   (Git)     │    │   (Docker)  │    │   (UAT)     │    │   (Go-Live) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
        │                  │                 │                 │
        ▼                  ▼                 ▼                 ▼
   Push branch      Lint + Test      Tests terrain      Backup auto
   Pull Request     Build images     Validation PO      Migrate DB
   Code review      Push registry    Démo techniciens    Switch Blue/Green
```

| Étape | Action | Responsable | Durée |
|-------|--------|-------------|-------|
| 1 | Développement sur branche feature | Dev | Sprint |
| 2 | Pull Request + code review | Lead Dev | 1-2 jours |
| 3 | CI : lint, tests unitaires, build Docker | CI/CD | 10 min |
| 4 | Déploiement recette automatique | CI/CD | 5 min |
| 5 | Recette UAT + démo terrain | PO + Techs | 2-3 jours |
| 6 | Validation PO pour production | PO | 1 jour |
| 7 | Backup complet production | Admin | 15 min |
| 8 | Déploiement production (blue/green) | Lead Dev | 5 min |
| 9 | Migrations Prisma | Lead Dev | 10 sec |
| 10 | Vérification health checks | Lead Dev | 5 min |
| 11 | Rollback si anomalie (< 2 min) | Lead Dev | 2 min |

---

## 4. Gestion des risques projet

### 4.1 Matrice des risques

| # | Risque | Probabilité | Impact | Mitigation | Sprint concerné |
|---|--------|-------------|--------|------------|---------------|
| R1 | **Réseau LAN instable / zones sans WiFi** | Élevée (60%) | Critique | PWA offline-first obligatoire, IndexedDB, sync auto. Bornes WiFi supplémentaires budgeté. Test réseau terrain S2. | S1-S4 |
| R2 | **Résistance au changement des techniciens** | Élevée (50%) | Élevé | Reviews terrain tous les 2-3 sprints, formation hands-on, champions techs identifiés, fiches A4 laminées. | S10-S12 |
| R3 | **Données historiques inexistantes ou de mauvaise qualité** | Moyenne (40%) | Élevé | Templates Excel fournis S0, saisie manuelle des 30 équipements pilote acceptée, migration S9 dédiée. | S9 |
| R4 | **Serveur local en panne (pas de cloud de secours)** | Moyenne (30%) | Critique | RAID 1 disques, backup quotidien, NAS local, RTO < 30 min, serveur de test comme fallback temporaire. | S12 |
| R5 | **Conformité ATEX mal intégrée → refus HSE** | Moyenne (35%) | Critique | ATEX intégrée dès S1-S6, blocage workflow si champs manquants, review HSE fin S6, checklist validation ATEX. | S1-S6 |
| R6 | **Dérapage budget / délai** | Moyenne (40%) | Élevé | MoSCoW strict, V1 scope verrouillé, Should Have reportables, revue points par sprint, vélocité trackée. | Tous |
| R7 | **Complexité mode hors-ligne sous-estimée** | Moyenne (35%) | Élevé | Sync Manager isolé, IndexedDB + Dexie.js, tests offline dès S3, conflit "serveur fait foi". | S3-S8 |
| R8 | **Smartphones/tablettes non adaptés atelier** | Moyenne (25%) | Élevé | Spécifications matérielles validées S0 (IP65, écran gant), test matériel S2, alternative BYOD. | S0-S2 |
| R9 | **Performance API insuffisante en production** | Faible (20%) | Moyen | Cache Redis dès S1, tests charge S8, optimisation index DB, code splitting front. | S8 |
| R10 | **Départ d'un développeur en cours de projet** | Faible (15%) | Moyen | Monorepo documenté, conventions claires, bus factor réduit (2 devs connaissent chaque module), documentation technique. | Tous |
| R11 | **Email/SMTP non disponible en usine** | Moyenne (30%) | Moyen | Notifications push Web internes prioritaires, emails via SMTP externe (fournisseur), fallback logs en dev. | S1-S2 |
| R12 | **QR codes machines illisibles (usure, saleté)** | Moyenne (25%) | Moyen | Étiquettes résistantes laminées, impression A4 standard, double codage (URL + code brut), recherche manuelle fallback. | S1-S9 |

### 4.2 Plan de contingence

| Scénario | Réponse |
|----------|---------|
| **WiFi indisponible > 2h** | Les techniciens continuent en mode offline. Sync auto au retour réseau. Paperasse d'urgence uniquement si PWA plante. |
| **Serveur GMAO indisponible** | Maintenance sur papier. Restauration serveur depuis backup (< 30 min). Si > 4h : serveur de test comme fallback. |
| **Techniciens refusent la PWA** | Déploiement progressif (1 tech pilote → 2 → 4). Responsable comme facilitateur. Injonction management si blocage persistant. |
| **ATEX retoqué par HSE** | Revue dédiée S6. Si rejet : sprint ATEX supplémentaire (S6.5) avant de continuer. Budget 2 semaines buffer. |
| **Dérapage 1 sprint** | Should Have reportés automatiquement. Must Have priorisés. Scope réduit si nécessaire (ex : export PDF reporté V2). |

---

## 5. Ressources et budget

### 5.1 Profils nécessaires et nombre de jours

| Profil | Rôle | Jours V1 (S1-S12) | Jours V2 (S13-S14) | Taux indicatif | Budget V1 | Budget V2 |
|--------|------|-------------------|--------------------|----------------|-----------|-----------|
| **Lead Dev Fullstack** | Architecture, code review, DevOps, mentoring | 120 j | 20 j | 700 €/j | 84 000 € | 14 000 € |
| **Dev Frontend** | React, PWA, UI/UX, tests E2E | 100 j | 16 j | 500 €/j | 50 000 € | 8 000 € |
| **Dev Backend** | Node.js, API, DB, jobs, intégrations | 100 j | 16 j | 550 €/j | 55 000 € | 8 800 € |
| **PO / Analyste métier** | User stories, recette, formation, support | 60 j | 10 j | 500 €/j | 30 000 € | 5 000 € |
| **Support hypercare** | Corrections post Go-Live | — | 10 j | 500 €/j | — | 5 000 € |
| **Sous-total développement** | | | | | **219 000 €** | **40 800 €** |

### 5.2 Budget par phase

| Phase | Poste | Budget |
|-------|-------|--------|
| **V1 MVP (S1-S8)** | Développement (3 devs + PO, 4 mois) | ~140 000 € |
| **V1 Consolidation (S9-S12)** | Développement + formation + documentation + recette | ~80 000 € |
| **V2 Amorçage (S13-S14)** | Extension + design connecteurs | ~40 000 € |
| **Matériel** | Serveur (2 500 €) + tablettes/smartphones (2 500 €) + kiosques (800 €) + imprimante (150 €) | ~5 950 € |
| **Infrastructure** | NAS backup (option), routeur WiFi, câbles | ~2 000 € |
| **Formation** | Temps interne (responsable 10 j, techs 2h × 4) | ~3 000 € |
| **Buffer risque (10%)** | | ~27 000 € |
| **TOTAL V1 complète** | | **~260 000 €** |
| **TOTAL V1+V2 (14 sprints)** | | **~300 000 €** |

> **Note :** Ce budget correspond à une solution **sur mesure** développée spécifiquement pour Ramondin. Si l'option SaaS légère (MaintainX, Limble, UpKeep) est retenue, le budget V1 serait réduit à ~10 000-15 000 € (paramétrage + formation) mais avec moins de personnalisation ATEX et offline.

### 5.3 Calendrier indicatif en semaines

```
Semaine :  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
           |--S0--||-----S1-----||-----S2-----||-----S3-----||-----S4-----||-----S5-----||
           Fondations   Actifs+Auth   BT Création  Kanban+Exec   Clôture+Stock  Préventif

Semaine : 18 19 20 21 22 23 24 25 26 27 28 29
           ||-----S6-----||-----S7-----||-----S8-----||-----S9-----||----S10-----||
           ATEX+Audit+Dashboard  Stocks avancés   KPIs+Direction   Docs+Compteurs  Rapports

Semaine : 22 23 24 25 26 27 28 29
           ||----S11-----||----S12-----||----S13-----||----S14-----||
           Kiosque+Tests   Go-Live+Form.  V2 Zone B    V2 Connecteurs
```

---

## 6. Critères d'acceptation par phase

### 6.1 V1 MVP — Critères de "terminé"

La V1 est considérée comme "terminée et utilisable" quand **tous** les critères suivants sont validés :

| # | Critère | Validation | Sprint |
|---|---------|------------|--------|
| CA-01 | Au moins 30 équipements référencés avec QR codes imprimés et collés | Vérification physique | S9 |
| CA-02 | Au moins 30-50 articles stock référencés avec seuils minimum | Import validé | S9 |
| CA-03 | 4 techniciens + 1 responsable + 1 magasinier créés en base | Vérification admin | S1 |
| CA-04 | 1 opérateur peut créer un BT en < 30 secondes (test chronométré) | Test terrain | S2 |
| CA-05 | Workflow BT complet validé : Créé → Planifié → En cours → Terminé → Clôturé | Test E2E | S4 |
| CA-06 | Mode hors-ligne testé : création BT, scan QR, photos, saisie pièces sans réseau | Test terrain zone sans WiFi | S8 |
| CA-07 | Synchronisation auto : retour réseau → sync complète < 10 secondes | Test mesuré | S8 |
| CA-08 | Dashboard responsable affiche BT en cours, préventifs 7j, alertes stock | Validation PO | S6 |
| CA-09 | Plan préventif configuré sur 5 équipements critiques avec génération auto | Vérification | S5 |
| CA-10 | BT ATEX : blocage clôture si consignation non cochée | Test E2E | S6 |
| CA-11 | Alerte stock bas reçue par email/push quand stock < minimum | Test mesuré | S4 |
| CA-12 | Zéro BT papier accepté à partir du Go-Live | Engagement management | S12 |
| CA-13 | Chef de production informé et portail opérateur actif | Validation | S2 |
| CA-14 | Backup quotidien fonctionnel et testé (restauration < 30 min) | Test admin | S6 |
| CA-15 | Temps de réponse API < 2 secondes (page), < 1 seconde (recherche) | Test charge | S8 |
| CA-16 | 50 connexions simultanées, serveur < 70 % CPU/RAM | Test charge | S12 |

### 6.2 Tests / Recette avant go-live

| Type | Description | Quand | Responsable |
|------|-------------|-------|-------------|
| **Tests unitaires** | Jest sur API + front, couverture > 70% | Chaque sprint | Dev |
| **Tests E2E** | Cypress/Playwright : 10 scénarios critiques | S11 | Dev + PO |
| **Recette terrain** | 2-3 jours avec techniciens sur machines réelles | S10 | PO + Techs pilotes |
| **Tests charge** | 50 utilisateurs simultanés (k6 ou Artillery) | S8, S12 | Lead Dev |
| **Tests offline** | Création BT, photos, mouvements sans réseau | S8 | Dev + Techs |
| **Tests sécurité** | Audit trail, RBAC, ATEX blocage, JWT | S6 | Lead Dev |
| **Recette UAT** | Tests fonctionnels par responsable maintenance | S10-S11 | Responsable |
| **Acceptation HSE** | Validation ATEX par responsable HSE | S6 | HSE |
| **Pen test interne** | Scan ports, headers sécurité, HTTPS | S12 | Lead Dev |

### 6.3 Plan de roll-out (déploiement progressif)

| Phase | Période | Zone | Utilisateurs | Objectif |
|-------|---------|------|-------------|----------|
| **Pilote 1** | Semaine 9 (fin S4) | Zone A — 5 équipements | 2 techniciens + resp | Test terrain, retours UI/UX |
| **Pilote 2** | Semaine 13 (fin S6) | Zone A — 20 équipements | 4 techniciens + resp + magasinier | Test complet workflow + ATEX |
| **Pilote 3** | Semaine 17 (fin S8) | Zone A complète | Tous les opérateurs (20) + production | Portail opérateur, zéro papier |
| **Go-Live V1** | Semaine 24-25 (S12) | Zone A complète | Tous | Production réelle, hypercare 2 sem. |
| **Extension V2** | Semaines 26-35 | Zone B + autres zones | Extension progressive | Laquage, sérigraphie, emballage |

---

## 7. Matrice de dépendances entre sprints

### 7.1 Tableau de dépendances

| Sprint | Dépend de | Bloque | Justification |
|--------|-----------|--------|---------------|
| **S0** | — | S1 | Setup infra obligatoire |
| **S1** | S0 | S2, S5, S6, S7, S9 | Auth + référentiel équipements base de tout |
| **S2** | S1 | S3 | BT création nécessite équipements et auth |
| **S3** | S2 | S4 | Exécution BT nécessite BT créés et planifiés |
| **S4** | S3 | S5 | Clôture BT et stocks basique nécessitent exécution |
| **S5** | S4 | S6 | Préventif nécessite BT cycle complet fonctionnel |
| **S6** | S5, S4 | S8 | ATEX + dashboard v1 sur données existantes |
| **S7** | S4 | S8 | Stocks avancés sur stocks basique |
| **S8** | S6, S7 | S9, S10 | KPIs nécessitent données + dashboards |
| **S9** | S8 | S10 | Documents et sous-ensembles sur core stable |
| **S10** | S9 | S11 | Recette terrain sur version complète |
| **S11** | S10 | S12 | Tests E2E sur version stabilisée |
| **S12** | S11 | S13 | Go-Live après tests validés |
| **S13** | S12 | S14 | V2 amorçage sur V1 en production |
| **S14** | S13 | — | Dernier sprint V2 amorçage |

### 7.2 Diagramme de dépendances (texte)

```
S0 ──> S1 ────────────────────────────────────────────────────┐
       │                                                      │
       ├──> S2 ──> S3 ──> S4 ──> S5 ──> S6 ──> S8 ──> S9 ──> S10 ──> S11 ──> S12 ──> S13 ──> S14
       │              │    │           │    ↑                 ↑
       │              │    └───────────┘    │                 │
       │              │         ↑           │                 │
       │              └─────────┘           │                 │
       │                                    │                 │
       └──> S7 ─────────────────────────────┘                 │
                                                             │
S1 (équipements) ────────────────────────────────────────────┘
```

### 7.3 Chemin critique

Le chemin critique (détermine la durée minimale du projet) est :

```
S0 → S1 → S2 → S3 → S4 → S5 → S6 → S8 → S9 → S10 → S11 → S12
```

**Durée chemin critique :** 13 sprints × 2 semaines + 1 semaine S0 = **27 semaines** (~6.5 mois)

Le sprint S7 (stocks avancés) peut être parallélisé avec S5-S6 car il ne dépend que de S4.

### 7.4 Marges et buffers

| Type | Durée | Sprint | Usage |
|------|-------|--------|-------|
| **Buffer ATEX** | 1 sprint | Entre S6 et S7 | Si rejet HSE, sprint correction ATEX |
| **Buffer recette** | 0.5 sprint | Fin S10 | Corrections remontées terrain |
| **Buffer go-live** | 0.5 sprint | S12 | Corrections bugs critiques |
| **Total buffer** | **2 semaines** | | Réserve non planifiée |

---

## Annexe A — Récapitulatif des points par sprint

| Sprint | Must Have | Should Have | Could Have | Total | Capacité | Marge |
|--------|-----------|-------------|------------|-------|----------|-------|
| S1 | 30 | 8 | 0 | 38 | 42 | +4 |
| S2 | 35 | 7 | 0 | 42 | 42 | 0 |
| S3 | 38 | 6 | 0 | 44 | 42 | -2 |
| S4 | 32 | 8 | 0 | 40 | 42 | +2 |
| S5 | 35 | 7 | 0 | 42 | 42 | 0 |
| S6 | 30 | 8 | 0 | 38 | 42 | +4 |
| S7 | 32 | 8 | 0 | 40 | 42 | +2 |
| S8 | 35 | 7 | 0 | 42 | 42 | 0 |
| S9 | 30 | 8 | 0 | 38 | 42 | +4 |
| S10 | 32 | 8 | 0 | 40 | 42 | +2 |
| S11 | 30 | 8 | 0 | 38 | 42 | +4 |
| S12 | 30 | 6 | 0 | 36 | 42 | +6 |
| S13 | 28 | 8 | 0 | 36 | 42 | +6 |
| S14 | 26 | 8 | 0 | 34 | 42 | +8 |
| **TOTAL** | **423** | **97** | **0** | **520** | **588** | **+68** |

> La vélocité cible est de ~42 points/sprint. Le total de 520 points est couvert avec une marge de 68 points (13%). Les items Could Have sont reportés si nécessaire.

## Annexe B — Références fonctionnalités par sprint

| Sprint | Fonctionnalités (IDs) |
|--------|----------------------|
| S1 | ADM-001..ADM-015, ACT-001..ACT-005, ACT-007..ACT-008, ACT-012, ACT-014, ACT-022, ATEX-001, ALIM-001 |
| S2 | BT-001..BT-005, BT-021, OPP-001..OPP-005, ACT-015 |
| S3 | BT-006..BT-012, BT-016..BT-019, US-006, US-007, US-008 |
| S4 | BT-010, BT-013..BT-015, BT-020, ACT-020..ACT-021, STK-001..STK-004, STK-005..STK-006, STK-012, STK-016 |
| S5 | PRE-001..PRE-012, DOC-006..DOC-009, US-012..US-015 |
| S6 | ATEX-002..ATEX-009, ALIM-002..ALIM-003, ADM-016..ADM-021, RPT-001..RPT-002, US-020, US-026, US-027 |
| S7 | STK-003, STK-005..STK-015, STK-017..STK-020, US-019 |
| S8 | RPT-003..RPT-018, US-021, US-022 (partiel), DOC-014 |
| S9 | ACT-010..ACT-011, ACT-013, ACT-016..ACT-019, DOC-001..DOC-005, DOC-011..DOC-013, US-003, US-004, US-024, US-030 |
| S10 | RPT-014..RPT-015, RPT-018, RPT-016..RPT-017, ATEX-010, SEC-001..SEC-003, US-022, DOC-015 |
| S11 | OPP-006..OPP-010, BT-023..BT-025, ADM-019, i18n FR/ES, Tests E2E |
| S12 | Déploiement prod, formations, documentation, corrections, hypercare |
| S13 | ACT-024, Extension Zone B, PRE-016 (stub), Design ERP/SCADA |
| S14 | SSO design, RPT-018 final, E503, E601, E602, corrections hypercare |

## Annexe C — Checklist de revue avant chaque sprint

- [ ] User stories groomées et estimées en points
- [ ] Dépendances identifiées et débloquées
- [ ] Maquettes UI validées (si nouveau écran)
- [ ] API contract OpenAPI mis à jour
- [ ] Tests d'acceptation définis
- [ ] Démo terrain programmée (si sprint de review)
- [ ] Backup DB avant migration (si sprint avec migration)

---

*Document produit pour le projet GMAO Ramondin — Roadmap de développement agile, sprints 2 semaines, prête pour exécution.*
