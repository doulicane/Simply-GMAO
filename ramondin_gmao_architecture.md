# Architecture Technique — GMAO Ramondin
## Document d'architecture logicielle et infrastructure
**Version :** 1.0  
**Date :** Juin 2025  
**Statut :** Validé pour développement MVP V1  
**Contrainte maîtresse :** Hébergement 100 % local (serveur dédié usine) — aucune dépendance cloud externe

---

## 1. Vue d'ensemble architecturale

### 1.1 Diagramme textuel de l'architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RÉSEAU LAN USINE (192.168.x.x)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Smartphone  │  │ Tablette    │  │ PC Bureau   │  │ Kiosque production  │ │
│  │ Technicien  │  │ Technicien  │  │ Resp. Maint.│  │ (déclaration panne) │ │
│  │   (PWA)     │  │   (PWA)     │  │   (Web)     │  │      (PWA)          │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                │                    │            │
│         └────────────────┴────────────────┴────────────────────┘            │
│                                      │                                      │
│                              WiFi / Ethernet                              │
│                                      │                                      │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SERVEUR DÉDIÉ USINE (Ubuntu 22.04 LTS)                   │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │  CONTENEUR : nginx (Reverse Proxy + SSL + Static Files)             │     │
│  │  ├── Port 80/443 : routage vers le front et l'API                  │     │
│  │  ├── Certificat TLS local (auto-signé ou CA interne)              │     │
│  │  └── Compression gzip, cache headers                                │     │
│  └──────────────────────────────┬────────────────────────────────────┘     │
│                                 │                                           │
│  ┌──────────────────────────────▼────────────────────────────────────┐     │
│  │  CONTENEUR : gmao-frontend (React 18 PWA — Nginx)                 │     │
│  │  ├── Bundle SPA + Service Worker + Manifest                         │     │
│  │  └── Assets statiques (JS, CSS, icônes, fonts)                      │     │
│  └──────────────────────────────┬────────────────────────────────────┘     │
│                                 │                                           │
│  ┌──────────────────────────────▼────────────────────────────────────┐     │
│  │  CONTENEUR : gmao-api (Node.js 20 + Express + TypeScript)          │     │
│  │  ├── Auth JWT │ Business Logic │ Upload fichiers │ Notifications  │     │
│  │  └── API REST v1 (JSON) — documentation OpenAPI/Swagger            │     │
│  └──────────────────────────────┬────────────────────────────────────┘     │
│                                 │                                           │
│  ┌──────────────────────────────▼────────────────────────────────────┐     │
│  │  CONTENEUR : postgres (PostgreSQL 16)                               │     │
│  │  ├── Données métier : BT, équipements, stocks, users, ATEX...       │     │
│  │  └── Volume Docker persistant + backups quotidiens                 │     │
│  └──────────────────────────────┬────────────────────────────────────┘     │
│                                 │                                           │
│  ┌──────────────────────────────▼────────────────────────────────────┐     │
│  │  CONTENEUR : redis (Redis 7)                                        │     │
│  │  ├── Cache API (sessions, permissions, données référentielles)       │     │
│  │  └── File d'attente jobs (notifications, exports PDF, synchro)      │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │  STOCKAGE FICHIERS LOCAL (/data/uploads)                            │     │
│  │  ├── Photos de pannes (BT) : /uploads/photos/YYYY/MM/                 │     │
│  │  ├── Documents techniques (PDF) : /uploads/documents/                 │     │
│  │  └── Checklists modèles : /uploads/checklists/                        │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ rsync / USB / NAS
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BACKUPS & REDONDANCE LOCALE                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │ Disque externe    │  │ NAS local (opt.) │  │ Backup cloud interne     │   │
│  │ USB 3.0 / eSATA   │  │ Synology/QNAP    │  │ groupe (opt. phase 2)    │   │
│  │ Rotation 30j      │  │ Snapshots        │  │ Si politique DSI         │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Philosophie architecturale : pourquoi cette stack pour un environnement industriel local

| Principe | Application dans l'architecture |
|----------|--------------------------------|
| **Autonomie réseau** | L'application fonctionne entièrement sur le LAN usine. Pas de DNS externe, pas de CDN, pas d'API tierces. Si la connexion Internet du site tombe, la GMAO continue de fonctionner. |
| **Simplicité opérationnelle** | Un seul serveur physique, Docker Compose pour orchestrer les services. Pas de Kubernetes, pas de cluster. Un prestataire IT ou un technicien système peut redémarrer la stack en 2 commandes. |
| **Coût maîtrisé** | Ubuntu Server gratuit, PostgreSQL gratuit, Docker gratuit. Coût matériel < 3 000 €. Pas de licences SaaS récurrentes. |
| **Mobile-first, offline-first** | Les techniciens sont en atelier avec des smartphones. La PWA fonctionne hors-ligne et synchronise automatiquement. Pas d'app native à distribuer via un store. |
| **Sécurité par défaut** | TLS interne, authentification JWT, rôles granulaires, audit trail. Les données de maintenance restent dans l'enceinte industrielle. |
| **Extensibilité future** | API REST documentée, structure modulaire. En phase 2, on pourra ajouter un connecteur SCADA, une passerelle IoT, ou une réplication vers le siège sans casser l'architecture. |

---

## 2. Stack technique détaillée

| Couche | Technologie choisie | Justification |
|--------|---------------------|---------------|
| **Front-end** | React 18 + Vite + TypeScript + PWA (Workbox) | Mobile-first, responsive, PWA installable sur Android/iOS sans store. Vite offre un build rapide et un bundle léger. TypeScript réduit les bugs. |
| **UI / Composants** | Tailwind CSS + Headless UI + Radix UI | Design system utility-first, composants accessibles, interface utilisable avec des gants (boutons larges, contrastes forts). |
| **State Management Offline** | Dexie.js (IndexedDB wrapper) + Zustand | Dexie gère le stockage local structuré pour le mode hors-ligne. Zustand gère l'état global léger. |
| **Back-end** | Node.js 20 LTS + Express + TypeScript | Ecosystème mature, 1 langage (JS/TS) sur toute la stack, excellent support async/IO. Performant pour une API REST locale. |
| **ORM / Base** | Prisma ORM | Type-safe, migrations automatiques, introspection PostgreSQL, modèle de données versionné. |
| **Base de données** | PostgreSQL 16 | ACID strict, fiabilité éprouvée, JSONB pour les champs flexibles (checklists, paramètres ATEX), excellent outillage de backup. |
| **Cache / Session** | Redis 7 | Cache des requêtes API fréquentes (référentiel équipements, stocks), sessions JWT, rate limiting. Accélère les réponses < 50 ms. |
| **Files / Queues** | BullMQ (Redis-based) | Traitements asynchrones : génération des BT préventifs, envoi de notifications internes, exports PDF/Excel. Pas de dépendance externe. |
| **Stockage fichiers** | Filesystem local (ext4) servi par Nginx | Photos et PDF stockés localement, servis par Nginx (performance). Pas de S3. Structure `/uploads/YYYY/MM/`. |
| **Reverse proxy** | Nginx | SSL/TLS termination, compression gzip, cache headers, servir le front et les fichiers statiques. Configuration simple et robuste. |
| **Conteneurisation** | Docker + Docker Compose | Reproductibilité totale du déploiement. Un seul fichier `docker-compose.yml` décrit toute la stack. Facile à sauvegarder, cloner, restaurer. |
| **OS serveur** | Ubuntu Server 22.04 LTS (ou 24.04 LTS) | Stable, support 5 ans, gratuit, communauté immense, compatibilité Docker optimale. Pas de licence Windows Server. |
| **Scan QR / Code-barre** | html5-qrcode (librairie JS) | Accès caméra native via navigateur, pas d'app native. Fonctionne hors-ligne. |
| **Exports PDF** | Puppeteer (headless Chrome) | Génération côté serveur des rapports mensuels, fiches équipements. Pas de dépendance SaaS. |
| **Exports Excel** | SheetJS (xlsx) côté front ou ExcelJS côté back | Génération locale des exports de données. |

---

## 3. Architecture détaillée

### 3.1 Modèle de données

La base PostgreSQL est structurée autour de 10 domaines fonctionnels. Voici les tables principales avec leur rôle.

#### 3.1.1 Arborescence et équipements

| Table | Description | Clés / Remarques |
|-------|-------------|------------------|
| `sites` | Sites multi-site (future-proof) | id, nom, code, timezone |
| `zones` | Zones de l'usine (A, B...) | id, site_id, nom, code |
| `lignes` | Lignes de production | id, zone_id, nom, code |
| `equipements` | Machines et sous-ensembles | id, parent_id (auto-référence), code, designation, type, constructeur, date_mise_en_service, criticite, statut, zone_atex, contact_alimentaire, compteur_valeur, compteur_unite |
| `compteur_releves` | Historique des relevés de compteur | id, equipement_id, valeur, date_releve, user_id |

#### 3.1.2 Bons de travail (BT / OT)

| Table | Description | Remarques |
|-------|-------------|-----------|
| `bons_travail` | BT principal | id, numero, type, statut, equipement_id, demandeur_id, technicien_id, priorite, description, date_creation, date_planification, date_debut, date_fin, temps_estime, temps_passe, cause_panne, actions_realisees, commentaire_cloture |
| `bt_pieces` | Pièces consommées sur un BT | id, bt_id, article_id, quantite, prix_unitaire |
| `bt_photos` | Photos attachées à un BT | id, bt_id, chemin_fichier, description, date_ajout |
| `bt_checklist_executions` | Exécution d'une checklist sur un BT | id, bt_id, checklist_id, statut |
| `bt_checklist_items` | Réponses aux étapes d'une checklist | id, execution_id, etape_id, coche, commentaire, photo_chemin |

#### 3.1.3 Maintenance préventive

| Table | Description | Remarques |
|-------|-------------|-----------|
| `plans_preventifs` | Plans de maintenance préventive | id, equipement_id, type (temporel/compteur), frequence, unite, base, marge_alerte, prochaine_echeance, technicien_id, checklist_id |
| `checklists` | Modèles de checklists | id, nom, type, actif |
| `checklist_etapes` | Étapes d'une checklist | id, checklist_id, ordre, description, type_reponse (checkbox/valeur/photo), obligatoire |

#### 3.1.4 Stocks et articles

| Table | Description | Remarques |
|-------|-------------|-----------|
| `articles` | Référentiel pièces de rechange | id, reference, designation, famille, sous_famille, fournisseur, stock_min, stock_max, localisation, code_barre, prix_unitaire_estime |
| `stock_mouvements` | Mouvements de stock (entrée/sortie/réservation/transfert/inventaire/retour) | id, article_id, type, quantite, bt_id, commentaire, date_mouvement, user_id |
| `stock_inventaires` | Sessions d'inventaire physique | id, date_debut, date_fin, statut, user_id |
| `stock_inventaire_lignes` | Lignes d'inventaire | id, inventaire_id, article_id, quantite_theorique, quantite_reelle, ecart |

#### 3.1.5 Utilisateurs, sécurité et audit

| Table | Description | Remarques |
|-------|-------------|-----------|
| `utilisateurs` | Comptes utilisateurs | id, nom, prenom, email, login, password_hash, role, actif, langue |
| `roles` | Rôles et permissions | id, nom, permissions (JSONB) |
| `audit_logs` | Traçabilité de toutes les actions | id, table_concernee, record_id, action (CREATE/UPDATE/DELETE), user_id, date_action, donnees_avant, donnees_apres |

#### 3.1.6 ATEX et conformité

| Table | Description | Remarques |
|-------|-------------|-----------|
| `atex_interventions` | Données ATEX spécifiques à un BT | id, bt_id, consignation_electrique, permis_feu_numero, outillage_certifie_ex, nettoyage_post_intervention, depression_post_intervention, inspecteur_atex |
| `contact_alimentaire_interventions` | Traçabilité contact alimentaire | id, bt_id, nettoyage_valide, produits_utilises, validation_qualite |

#### 3.1.7 Documents et médias

| Table | Description | Remarques |
|-------|-------------|-----------|
| `documents` | Documents attachés aux équipements | id, equipement_id, titre, type (notice/plan/schema), chemin_fichier, version, date_upload, user_id |

### 3.2 API REST principale (v1)

L'API expose les endpoints suivants, tous préfixés par `/api/v1`.

#### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/login` | Login + password → JWT access + refresh token |
| POST | `/auth/refresh` | Refresh token → nouveau access token |
| POST | `/auth/logout` | Révocation du refresh token |
| GET  | `/auth/me` | Profil utilisateur courant |

#### Équipements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/equipements` | Liste paginée avec filtres (zone, type, criticité, statut) |
| GET | `/equipements/:id` | Fiche équipement avec arborescence parent/enfant |
| GET | `/equipements/:id/historique` | Historique BT de l'équipement (50 derniers) |
| POST | `/equipements/:id/compteur` | Saisie d'un relevé de compteur |
| GET | `/equipements/scan/:qr_code` | Résolution QR code → équipement |

#### Bons de travail

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/bt` | Liste BT avec filtres (statut, technicien, zone, priorité) |
| POST | `/bt` | Création d'un BT |
| GET | `/bt/:id` | Détail complet d'un BT |
| PATCH | `/bt/:id/statut` | Changement de statut (planifié → en cours → terminé → clôturé) |
| POST | `/bt/:id/demarrer` | Démarrage intervention (timestamp) |
| POST | `/bt/:id/terminer` | Terminer intervention + causes/actions |
| POST | `/bt/:id/pieces` | Ajout pièce consommée |
| POST | `/bt/:id/photos` | Upload photo (multipart/form-data) |
| POST | `/bt/:id/checklist` | Soumission checklist exécutée |

#### Maintenance préventive

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/preventifs` | Liste des plans préventifs |
| POST | `/preventifs` | Création d'un plan préventif |
| GET | `/preventifs/echeances` | Préventifs à venir (7j, 30j) avec code couleur |
| POST | `/preventifs/:id/generer-bt` | Génération manuelle du BT préventif |

#### Stocks

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/articles` | Référentiel articles avec stock courant |
| POST | `/articles/:id/mouvement` | Entrée / sortie / transfert / réservation |
| GET | `/articles/scan/:qr_code` | Résolution QR code → article |
| GET | `/stocks/alertes` | Liste des stocks sous seuil minimum |
| POST | `/inventaires` | Lancement session inventaire |
| POST | `/inventaires/:id/lignes` | Saisie quantité réelle |

#### Reporting

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/dashboard/responsable` | Widgets BT en cours, retard, préventifs, stocks |
| GET | `/kpi/mttr-mtbf` | Calcul MTTR / MTBF par période et équipement |
| GET | `/kpi/taux-preventif` | Ratio préventif / total |
| GET | `/exports/bt` | Export Excel des BT sur période |
| GET | `/exports/rapport-mensuel` | Génération PDF rapport mensuel (Puppeteer) |

#### ATEX

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/equipements/atex` | Filtrage rapide équipements ATEX |
| GET | `/bt/:id/atex` | Données ATEX d'un BT |
| PATCH | `/bt/:id/atex` | Mise à jour données ATEX |

### 3.3 PWA / Mode hors-ligne

#### 3.3.1 Architecture offline-first

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVIGATEUR (Mobile)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Service Worker (Workbox)                            │   │
│  │  ├── Cache statiques : App Shell, CSS, JS, fonts     │   │
│  │  ├── Cache données : IndexedDB (Dexie.js)           │   │
│  │  └── Stratégie réseau : Stale-while-revalidate      │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │  IndexedDB — Tables locales synchronisées            │   │
│  │  ├── ref_equipements (référentiel complet)         │   │
│  │  ├── ref_articles (stocks + localisation)          │   │
│  │  ├── ref_checklists (modèles de checklists)        │   │
│  │  ├── bt_draft (BT créés/modifiés hors-ligne)       │   │
│  │  ├── bt_photos_pending (file d'attente photos)     │   │
│  │  ├── stock_mouvements_pending (mouvements en attente)│  │
│  │  └── compteur_releves_pending                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │  Synchronisation Manager (Zustand + worker)         │   │
│  │  ├── Détection reconnexion réseau                   │   │
│  │  ├── Envoi différé : BT, photos, mouvements         │   │
│  │  ├── Gestion des conflits (dernier écrase premier)  │   │
│  │  └── Barre de statut sync visible pour l'utilisateur│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### 3.3.2 Stratégie de synchronisation

| Scénario | Comportement |
|----------|--------------|
| **Technicien scanne QR machine (hors-ligne)** | Le référentiel équipements est pré-chargé dans IndexedDB. Le scan fonctionne immédiatement, la fiche s'affiche depuis le cache. |
| **Technicien crée un BT (hors-ligne)** | Le BT est stocké dans `bt_draft` avec un UUID local. Statut "pending_sync". Le technicien peut le consulter, le modifier, y ajouter des photos. |
| **Technicien ajoute une photo (hors-ligne)** | La photo est stockée en base64/blob dans IndexedDB (`bt_photos_pending`). Pas de compression côté client pour garder la qualité. |
| **Technicien consomme une pièce (hors-ligne)** | Le mouvement est stocké dans `stock_mouvements_pending`. Le stock affiché est mis à jour localement (optimistic UI). |
| **Retour réseau détecté** | Le Sync Manager envoie les données par ordre de priorité : (1) statuts BT urgents, (2) mouvements stock, (3) BT normaux, (4) photos. |
| **Conflit de données** | Règle simple : le serveur fait foi. Si un BT a été modifié sur le serveur entre-temps, la version locale est rejetée et le technicien est notifié. |

#### 3.3.3 PWA — Manifest et installation

```json
{
  "name": "GMAO Ramondin",
  "short_name": "GMAO",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#dc2626",
  "icons": [...],
  "orientation": "portrait"
}
```

- **Display mode** : `standalone` (pas de barre d'adresse du navigateur)
- **Orientation** : portrait pour smartphones, landscape autorisé pour tablettes
- **Icône** : sur l'écran d'accueil Android/iOS
- **Mise à jour** : nouvelle version détectée par le Service Worker → prompt "Nouvelle version disponible, mettre à jour ?"

### 3.4 Gestion des médias

#### 3.4.1 Stockage local

| Type de média | Emplacement serveur | Règles |
|---------------|---------------------|--------|
| Photos BT (panne, avant/après) | `/data/uploads/photos/YYYY/MM/UUID.jpg` | Compression JPEG 80% côté serveur, max 5 Mo upload, rétention illimitée |
| Documents techniques (PDF) | `/data/uploads/documents/YYYY/MM/UUID.pdf` | Max 50 Mo, indexation par métadonnées (pas de full-text PDF) |
| Photos checklist | `/data/uploads/checklists/YYYY/MM/UUID.jpg` | Même règle que photos BT |
| QR codes générés | `/data/uploads/qrcodes/` | PNG 300×300 dpi, génération à la volée ou en lot |

#### 3.4.2 Organisation du stockage

- Le volume Docker `/data/uploads` est monté sur un dossier du host (ex: `/opt/ramondin-gmao/uploads`)
- Nginx sert directement les fichiers statiques sous `/uploads/` (pas de passage par Node.js)
- Les chemins sont stockés en base, pas les fichiers (pas de BLOB dans PostgreSQL)
- Backup quotidien du dossier uploads par `rsync` vers disque externe

### 3.5 Sécurité

#### 3.5.1 Authentification

| Élément | Implémentation |
|---------|----------------|
| Protocole | JWT (JSON Web Tokens) |
| Access token | Durée 15 minutes, stocké en mémoire (React state) |
| Refresh token | Durée 7 jours, stocké dans un cookie `HttpOnly Secure SameSite=Strict` |
| Révocation | Refresh tokens stockés dans Redis (blacklist possible) |
| Mot de passe | Hash bcrypt avec coût 12, validation règle de complexité |

#### 3.5.2 Autorisation (RBAC)

| Rôle | Permissions API |
|------|-----------------|
| Administrateur | Toutes |
| Responsable Maintenance | CRUD BT, planification, validation, reporting, stocks, paramétrage |
| Technicien | Lire BT assignés, modifier statut BT, consulter équipements, lire stocks, saisir compteur |
| Opérateur | Créer BT (pannes uniquement), consulter statut de ses BT, lire équipements |
| Magasinier | Mouvements stock, inventaire, lire articles |
| Lecteur | Lecture dashboards, historique, exports |

#### 3.5.3 Transport et réseau

| Couche | Mesure |
|--------|--------|
| Chiffrement | HTTPS obligatoire avec TLS 1.3. Certificat : auto-signé avec CA interne ou Let's Encrypt si domaine public |
| Headers sécurité | HSTS, X-Content-Type-Options, X-Frame-Options, CSP restrictif |
| Réseau | Accès au serveur limité au LAN usine (192.168.x.x). Pas d'exposition Internet |
| Firewall | UFW (Uncomplicated Firewall) : ports 80, 443 ouverts uniquement sur le LAN. SSH (22) restreint aux IP admin |
| VPN (option) | Si accès externe nécessaire pour le siège : VPN site-to-site ou WireGuard, jamais exposition directe |

#### 3.5.4 Audit trail

- Table `audit_logs` alimentée par triggers PostgreSQL sur toutes les tables métier critiques
- Données stockées : utilisateur, timestamp, action (CREATE/UPDATE/DELETE), anciennes valeurs, nouvelles valeurs
- Conservation : 2 ans (archivage automatique après 2 ans vers fichier CSV compressé)
- Impossibilité de suppression physique : toutes les suppressions sont des "soft delete" (`deleted_at`)

### 3.6 Backups et résilience

#### 3.6.1 Stratégie de backup (3-2-1 local)

| Backup | Fréquence | Cible | Outil | Rétention |
|--------|-----------|-------|-------|-----------|
| Base de données (pg_dump) | Tous les jours à 02h00 | Disque externe USB + NAS | `pg_dump` custom-format + `cron` | 30 jours |
| Fichiers uploads (rsync) | Tous les jours à 02h30 | Disque externe USB + NAS | `rsync -av` | 30 jours |
| Snapshot Docker volumes | Hebdomadaire (dimanche) | NAS | `docker-compose down` + tar volumes | 8 semaines |
| Configuration serveur | Mensuelle | NAS + cloud groupe (si autorisé) | `etckeeper` + `ansible-pull` | 12 mois |

#### 3.6.2 Procédure de restauration

1. **Restauration base de données** : `pg_restore` depuis le backup custom-format (temps estimé : < 10 min pour une base < 5 Go)
2. **Restauration fichiers** : `rsync` inverse depuis le backup
3. **Restauration complète** : redéploiement du `docker-compose.yml` + restauration DB + uploads
4. **RTO (Recovery Time Objective)** : < 30 minutes
5. **RPO (Recovery Point Objective)** : < 24 heures (perte max d'une journée de données)

#### 3.6.3 Monitoring basique

| Outil | Usage |
|-------|-------|
| Uptime Kuma (Docker) | Monitoring HTTP de l'API et du front. Alertes email/Teams si down > 5 min |
| `docker stats` | Surveillance consommation CPU/RAM des conteneurs |
| `df -h` + `ncdu` | Surveillance espace disque (alerte si > 80 %) |
| Logs | Centralisation dans volumes Docker, rotation via logrotate |

---

## 4. Infrastructure physique

### 4.1 Spécifications matérielles recommandées

#### Option A : Serveur tour (recommandé pour démarrer)

| Composant | Spécification | Justification |
|-----------|---------------|---------------|
| **Modèle** | Dell PowerEdge T150 ou HPE ProLiant ML30 Gen11 | Serveur d'entrée de gamme fiable, support 3 ans inclus |
| **CPU** | Intel Xeon E-2434 (4 cœurs, 3.4 GHz) ou équivalent | Suffisant pour 50 connexions simultanées, génération PDF, exports |
| **RAM** | 32 Go DDR4 ECC | PostgreSQL + Redis + Node.js + Nginx confortable. Marge pour la croissance. |
| **Disque système** | 2 × SSD SATA 500 Go en RAID 1 (mirror) | Redondance disque. Si un SSD tombe, l'autre assure. Hot-swap si le chassis le permet. |
| **Disque données** | 1 × SSD SATA 1 To (backup RAID 1 optionnel) | Photos, documents, backups locaux |
| **Réseau** | 2 × Gigabit Ethernet (bonding possible) | Connexion réseau redondante |
| **Alimentation** | 1 × PSU (redondance PSU en option) | Alimentation serveur qualifiée |
| **Budget** | **2 000 – 3 000 €** | Tout compris (serveur, SSD, câbles, installation) |

#### Option B : PC industriel compact (si encombrement critique)

| Composant | Spécification |
|-----------|---------------|
| **Modèle** | PC industriel fanless (ex: Beckhoff C6670, Siemens SIMATIC IPC) ou NUC industriel |
| **CPU** | Intel Core i5-1340P ou équivalent (12 threads) |
| **RAM** | 32 Go DDR4 |
| **Stockage** | 2 × NVMe 1 To en RAID 1 (via logiciel mdadm) |
| **Réseau** | 2 × GbE |
| **Budget** | **1 500 – 2 500 €** |
| **Avantage** | Compact, silencieux, peu d'encombrement en salle serveur |
| **Inconvénient** | Moins d'options d'extension, RAID matériel difficile |

#### Option C : Virtualisation (si infrastructure existante)

Si l'usine dispose déjà d'un hyperviseur (VMware ESXi, Proxmox) : allouer une VM avec 4 vCPU, 16-24 Go RAM, 200 Go disque. Avantage : snapshots, migration live.

### 4.2 Réseau LAN recommandé

```
┌─────────────────────────────────────────────────────────────┐
│                     RÉSEAU LAN USINE                         │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌────────────┐ │
│  │   Routeur    │──────│  Switch L2   │──────│ Serveur    │ │
│  │   / Pare-feu │      │   managé     │      │ GMAO       │ │
│  └──────────────┘      └──────┬───────┘      └────────────┘ │
│                             │                               │
│           ┌─────────────────┼─────────────────┐              │
│           │                 │                 │              │
│      ┌────▼────┐      ┌────▼────┐      ┌────▼────┐        │
│      │  VLAN   │      │  VLAN   │      │  VLAN   │        │
│      │PRODUCTION│      │MAINTENANCE│     │  ADMIN  │        │
│      │192.168.10│      │192.168.20│      │192.168.30│       │
│      │         │      │  /x     │      │  /x     │        │
│      │ PCs MES │      │WiFi Tech│      │ PC admin│        │
│      │  SCADA  │      │Kiosques │      │  SI     │        │
│      └─────────┘      └─────────┘      └─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

| Élément | Recommandation |
|---------|----------------|
| **Segmentation** | VLAN dédié "Maintenance" (192.168.20.0/24) isolé du VLAN production. Le serveur GMAO est sur ce VLAN. |
| **WiFi** | Points d'accès WiFi 5 ou 6 (802.11ac/ax) déployés dans les zones d'accès techniciens. SSID dédié "MAINTENANCE" avec WPA3-Enterprise (ou WPA2-PSK fort) |
| **Couverture** | Zone ATEX : attention aux bornes WiFi certifiées (antennes Ex d ou antennes à l'extérieur de la zone). Si couverture impossible → mode hors-ligne obligatoire |
| **Kiosques production** | Tablettes fixes (Android) sur le VLAN Maintenance, accès PWA restreint au portail opérateur |

### 4.3 Accès depuis smartphones et tablettes des techniciens

| Élément | Recommandation |
|---------|----------------|
| **Appareils** | Smartphones Android robustes (Samsung XCover 7, CAT S75) ou tablettes 10" (Samsung Galaxy Tab Active 5) — IP67, écran utilisable avec des gants |
| **Alternative BYOD** | Si politique autorise : smartphones personnels des techniciens. La PWA s'installe sur n'importe quel smartphone moderne sans contrainte de store |
| **Navigateur** | Chrome Android / Safari iOS (support PWA complet). Pas de navigateur exotique requis |
| **Autonomie** | Chargeurs à induction ou stations de charge dans le local maintenance |

### 4.4 Redondance et haute disponibilité

| Niveau | Mise en œuvre | Budget |
|--------|---------------|--------|
| **Basique (recommandé V1)** | RAID 1 disques + backup quotidien + serveur unique. Si panne serveur : restauration depuis backup sur matériel de remplacement (< 4h) | Inclus |
| **Intermédiaire (option V2)** | 2ème serveur identique + réplication PostgreSQL en streaming (warm standby). Bascule manuelle en cas de panne (< 15 min) | +2 000 € |
| **Avancé (option V3)** | Cluster Docker Swarm 2 nœuds + stockage partagé (Ceph/NFS) + réplication DB + load balancing. Bascule automatique | +5 000 € |

**Recommandation V1** : Niveau basique suffisant. La maintenance peut fonctionner quelques heures sur papier en cas d'indisponibilité serveur. L'investissement HA n'est pas justifié tant que le ROI de la GMAO n'est pas démontré.

---

## 5. Déploiement

### 5.1 Structure du projet Docker Compose

```yaml
# docker-compose.yml (extrait structuré)
version: "3.8"
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - gmao-uploads:/data/uploads
    depends_on: [api, frontend]

  frontend:
    image: ramondin/gmao-frontend:${VERSION:-latest}
    build: ./frontend
    environment:
      - VITE_API_URL=/api/v1

  api:
    image: ramondin/gmao-api:${VERSION:-latest}
    build: ./api
    environment:
      - DATABASE_URL=postgresql://gmao:password@postgres:5432/ramondin_gmao
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - UPLOAD_DIR=/data/uploads
    volumes:
      - gmao-uploads:/data/uploads
    depends_on: [postgres, redis]

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    environment:
      - POSTGRES_DB=ramondin_gmao
      - POSTGRES_USER=gmao
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  # Optionnel : monitoring
  uptime-kuma:
    image: louislam/uptime-kuma:1
    ports:
      - "3001:3001"
    volumes:
      - uptime_data:/app/data

volumes:
  postgres_data:
  redis_data:
  gmao-uploads:
  uptime_data:
```

### 5.2 Processus de déploiement initial

```bash
# 1. Préparation du serveur (Ubuntu 22.04 LTS fraîche)
ssh admin@serveur-gmao
sudo apt update && sudo apt install -y docker.io docker-compose

# 2. Clonage / déploiement
mkdir -p /opt/ramondin-gmao && cd /opt/ramondin-gmao
cp -r /tmp/livraison/* .

# 3. Variables d'environnement
cp .env.example .env
# Éditer : DB_PASSWORD, JWT_SECRET, VERSION

# 4. Génération certificat auto-signé (ou copie certificat CA interne)
./scripts/generate-ssl.sh gmao.ramondin.local

# 5. Lancement
sudo docker-compose up -d

# 6. Migrations base de données
sudo docker-compose exec api npx prisma migrate deploy

# 7. Seed initial (utilisateur admin, zones, types)
sudo docker-compose exec api npx ts-node scripts/seed.ts

# 8. Vérification
sudo docker-compose ps
curl -k https://gmao.ramondin.local/api/v1/health
```

### 5.3 Mise à jour de l'application sans coupure

| Étape | Action | Downtime |
|-------|--------|----------|
| 1 | Construire les nouvelles images (`docker-compose build`) | 0 |
| 2 | Tests de recette sur un environnement de staging (clone du serveur ou VM locale) | 0 |
| 3 | Backup complet avant mise à jour (`pg_dump` + `tar` uploads) | 0 |
| 4 | Déploiement Blue/Green : `docker-compose up -d` avec nouvelle image, Nginx bascule vers nouveau conteneur | < 5 secondes |
| 5 | Migrations Prisma (`prisma migrate deploy`) | < 10 secondes |
| 6 | Rollback possible : `docker-compose up -d` avec ancienne image + restauration DB si échec | < 2 minutes |

**Technique** : Utilisation de Docker Compose avec un tag de version explicite. Le conteneur `api` et `frontend` sont redémarrés, Nginx ne sert que ce qui est healthy. PostgreSQL et Redis restent en place (zéro downtime).

### 5.4 Gestion des migrations de base de données

| Outil | Prisma Migrate |
|-------|----------------|
| Workflow | Chaque évolution de schéma = un fichier de migration versionné (`prisma/migrations/YYYYMMDDHHMMSS_description/`) |
| Déploiement | `prisma migrate deploy` applique uniquement les migrations non encore exécutées, dans une transaction |
| Rollback | `prisma migrate resolve` pour marquer une migration comme appliquée/rollbackée. Restauration du backup si incident grave |
| Principe | Migrations réversibles quand possible. Sinon, backup obligatoire avant déploiement |

---

## 6. Choix retenus vs alternatives écartées

### 6.1 Pourquoi pas un SaaS cloud (MaintainX, Limble, UpKeep) ?

| Critère | SaaS | Self-hosted local (choix retenu) |
|---------|------|----------------------------------|
| **Connexion Internet** | Obligatoire. Si la connexion tombe, la GMAO est inaccessible | Indépendant. Le LAN usine suffit |
| **Données industrielles** | Hébergées chez un tiers (AWS US, Azure...) | Restent dans l'enceinte Ramondin |
| **Mode hors-ligne** | Limité, souvent read-only ou cache partiel | Véritable offline-first, sync complète |
| **Coût récurrent** | 6 000 – 12 000 €/an (10 users) | Investissement initial unique ~3 000 €, maintenance ~500 €/an |
| **Personnalisation ATEX** | Configurable mais limitée | Développement sur mesure des champs ATEX et contact alimentaire |
| **Intégration SCADA** | API externe, latence, sécurité | API locale, latence < 1 ms, réseau isolé |

**Verdict** : La contrainte de non-dépendance à Internet + la confidentialité des données de maintenance industrielle + le besoin d'un offline robuste rendent le SaaS incompatible avec le cahier des charges. La solution self-hosted est le seul modèle viable.

### 6.2 Pourquoi pas GLPI / OpenMAINT / Odoo ?

| Solution | Inconvénient majeur pour Ramondin |
|----------|-----------------------------------|
| **GLPI** | Conçu pour le helpdesk IT, pas la maintenance industrielle. Pas de PWA native, pas de mode hors-ligne robuste, pas de gestion des compteurs machines. Interface vieillissante. Courbe d'apprentissage longue pour les techniciens. |
| **OpenMAINT** | Orienté Facility Management (bâtiments), pas production industrielle. Installation complexe (Java + Tomcat + PostgreSQL). Communauté restreinte. Pas de PWA mobile moderne. Documentation en italien. |
| **Odoo Maintenance** | Module maintenance basique dans un ERP monolithique. Pas de PWA, pas d'offline, pas de champs ATEX spécifiques. Déployer tout Odoo pour une GMAO = surdimensionné. Maintenance du core Odoo lourde. |

**Verdict** : Les solutions open source existantes ne couvrent pas les besoins spécifiques de Ramondin (mobile-first, offline, ATEX, compteurs) sans un travail de développement et de fork considérable. Il est plus efficace de développer une solution sur mesure avec une stack moderne.

### 6.3 Pourquoi pas une application native iOS / Android ?

| Critère | App native | PWA (choix retenu) |
|---------|------------|---------------------|
| **Distribution** | App Store + Google Play + gestion des mises à jour | URL + "Ajouter à l'écran d'accueil". Mise à jour instantanée côté serveur |
| **Multi-plateforme** | 2 codebases (Swift + Kotlin) | 1 codebase (React + TypeScript) |
| **Coût** | 2× le coût de développement | Standard web |
| **Hors-ligne** | Bon (stockage natif) | Très bon avec Service Workers + IndexedDB |
| **Accès caméra / QR** | Natif | Via API web moderne (getUserMedia, html5-qrcode) |
| **Notifications push** | Natif | Web Push API (supporté par Chrome Android, iOS 16.4+) |

**Verdict** : La PWA offre 95% des capacités d'une app native avec 50% du coût et une maintenance divisée par 2. Dans un contexte industriel avec des techniciens aux profils variés, la simplicité de déploiement (pas de store, pas de MDM complexe) est un avantage décisif.

### 6.4 Pourquoi Node.js et pas Python/Django ou PHP/Symfony ?

| Critère | Node.js/Express (choix retenu) | Python/FastAPI | PHP/Symfony |
|---------|----------------------------------|----------------|-------------|
| **Langage unifié** | JS/TS front + back = 1 stack | 2 langages (JS + Python) | 2 langages (JS + PHP) |
| **Ecosystème PWA** | Excellent (Workbox, Vite, PWA plugins) | Bon | Moyen |
| **Performance API** | Très bon (event loop, async natif) | Excellent (asyncio) | Bon (FPM) |
| **JSON / API REST** | Natif, standard industriel | Excellent avec FastAPI | Nécessite API Platform |
| **Communauté** | Très large, documentation abondante | Grande, croissante | Grande mais déclinante |

**Verdict** : Node.js/TypeScript permet de former une équipe de développement autonome avec une seule stack, réduit les bugs d'interopérabilité, et bénéficie d'un écosystème PWA très mature. FastAPI est une excellente alternative si l'équipe dispose déjà de compétences Python.

---

## 7. Schéma de séquence simplifié

### Scénario : "Un opérateur déclare une panne en mode hors-ligne, le technicien intervient et synchronise"

```
Opérateur (Production)        Smartphone       Serveur GMAO (LAN)       Technicien (Atelier)
        │                          │                    │                       │
        │ 1. Scan QR machine       │                    │                       │
        │─────────────────────────>│                    │                       │
        │                          │                    │                       │
        │ 2. Formulaire pré-rempli │                    │                       │
        │    (équipement identifié)│                    │                       │
        │<─────────────────────────│                    │                       │
        │                          │                    │                       │
        │ 3. Saisit description +  │                    │                       │
        │    photo de la panne     │                    │                       │
        │─────────────────────────>│                    │                       │
        │                          │                    │                       │
        │ 4. Appui sur "Envoyer"   │                    │                       │
        │─────────────────────────>│                    │                       │
        │                          │                    │                       │
        │    [RÉSEAU INDISPONIBLE] │                    │                       │
        │                          │                    │                       │
        │ 5. BT stocké localement  │                    │                       │
        │    dans IndexedDB        │                    │                       │
        │    statut = "pending"    │                    │                       │
        │<─────────────────────────│                    │                       │
        │                          │                    │                       │
        │ 6. Retour WiFi détecté   │                    │                       │
        │─────────────────────────>│                    │                       │
        │                          │ 7. POST /api/v1/bt │                       │
        │                          │───────────────────>│                       │
        │                          │                    │                       │
        │                          │ 8. BT enregistré   │                       │
        │                          │    priorité = URGENT│                       │
        │                          │<───────────────────│                       │
        │                          │                    │                       │
        │                          │ 9. Notif push/email│                       │
        │                          │    au responsable  │                       │
        │                          │────────────────────┼──────────────────────>│
        │                          │                    │                       │
        │                          │                    │ 10. Responsable planifie│
        │                          │                    │    BT → Technicien    │
        │                          │                    │<──────────────────────│
        │                          │                    │                       │
        │                          │ 11. Technicien voit│                       │
        │                          │    BT dans son     │                       │
        │                          │    planning PWA    │                       │
        │                          │<───────────────────────────────────────────│
        │                          │                    │                       │
        │                          │                    │ 12. Technicien scan QR  │
        │                          │                    │    machine + démarre BT │
        │                          │                    │<──────────────────────│
        │                          │                    │                       │
        │                          │ 13. PATCH /bt/:id/│                       │
        │                          │     statut → EN_COURS                       │
        │                          │<───────────────────────────────────────────│
        │                          │                    │                       │
        │                          │                    │ 14. Intervient, saisit  │
        │                          │                    │    causes, pièces,      │
        │                          │                    │    photos, checklist    │
        │                          │                    │<──────────────────────│
        │                          │                    │                       │
        │                          │ 15. [WiFi coupé en  │                       │
        │                          │      zone ATEX]    │                       │
        │                          │                    │                       │
        │                          │ 16. Données stockées│                       │
        │                          │     localement      │                       │
        │                          │                    │                       │
        │                          │ 17. Retour WiFi     │                       │
        │                          │     synchro auto    │                       │
        │                          │ 18. POST photos +   │                       │
        │                          │     mouvements stock│                       │
        │                          │     PATCH statut    │                       │
        │                          │────────────────────┼──────────────────────>│
        │                          │                    │                       │
        │                          │ 19. BT clôturé     │                       │
        │                          │     Opérateur notifié                       │
        │                          │────────────────────┼──────────────────────>│
        │ 20. "Votre panne est     │                    │                       │
        │     résolue"             │                    │                       │
        │<─────────────────────────│                    │                       │
```

---

## Annexe A — Checklist de validation de l'architecture

| # | Vérification | Critère de succès |
|---|--------------|-------------------|
| A1 | Accès PWA depuis smartphone Android/iOS | Chargement < 3 secondes sur WiFi |
| A2 | Mode hors-ligne fonctionnel | Création BT, scan QR, saisie pièces, photos possibles sans réseau |
| A3 | Synchronisation auto | Retour réseau → sync complète < 10 secondes |
| A4 | Backup quotidien | `pg_dump` génère un fichier exploitable, restauration testée |
| A5 | Sécurité HTTPS | Qualys SSL Labs minimum B, pas de warning navigateur |
| A6 | Performance API | Temps de réponse page < 2 secondes, recherche < 1 seconde |
| A7 | Charge simulée | 50 connexions simultanées, serveur < 70 % CPU/RAM |
| A8 | ATEX traçable | Champs consignation + permis de feu obligatoires et horodatés |
| A9 | Audit trail | Toute modification de BT tracée avec utilisateur + timestamp |
| A10 | Extensibilité | API REST documentée, ajout d'un connecteur SCADA possible sans réécriture |

## Annexe B — Résumé des ports réseau et services

| Port | Service | Exposition | Description |
|------|---------|------------|-------------|
| 80 | Nginx | LAN uniquement | HTTP (redirection vers HTTPS) |
| 443 | Nginx | LAN uniquement | HTTPS (front + API + fichiers) |
| 5432 | PostgreSQL | Localhost/conteneurs uniquement | Base de données (pas d'exposition externe) |
| 6379 | Redis | Localhost/conteneurs uniquement | Cache + queues (pas d'exposition externe) |
| 3001 | Uptime Kuma | LAN (admin uniquement) | Monitoring (optionnel) |
| 22 | SSH | IP admin uniquement (UFW) | Administration serveur |

## Annexe C — Glossaire technique

| Terme | Définition |
|-------|------------|
| **PWA** | Progressive Web App — application web installable, fonctionnant hors-ligne |
| **JWT** | JSON Web Token — token signé pour authentification stateless |
| **Service Worker** | Script exécuté par le navigateur en arrière-plan pour le cache et les notifications |
| **IndexedDB** | Base de données NoSQL intégrée au navigateur pour le stockage local |
| **Prisma** | ORM moderne pour Node.js/TypeScript avec typage fort |
| **BullMQ** | Système de file d'attente basé sur Redis pour Node.js |
| **RPO/RTO** | Recovery Point Objective / Recovery Time Objective — métriques de reprise d'activité |
| **VLAN** | Virtual LAN — segmentation logique d'un réseau physique |
| **RAID 1** | Mirroring de disques — redondance disque par copie intégrale |

---

*Document produit pour le projet GMAO Ramondin — Hébergement local, PWA offline-first, stack moderne Dockerisée.*
