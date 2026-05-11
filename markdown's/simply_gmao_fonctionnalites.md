# Liste des Fonctionnalités Attendues — Spécifications Techniques Détaillées

## GMAO Simply GMAO — Capsules Aluminium
**Version :** 1.0 — Technique Développement  
**Date :** Juin 2025  
**Architecture :** Monolithique locale (serveur dédié usine) + PWA mobile-first  
**Cible :** Équipe de développeurs full-stack  

---

## 1. Inventaire des Écrans / Interfaces (par Profil Utilisateur)

### 1.1 Profil : Opérateur Production (20–50 utilisateurs)

| Écran | Description | Actions Principales | Device |
|-------|-------------|---------------------|--------|
| **E100 — Accueil / Scan QR** | Écran unique avec bouton "Scanner une machine" | Scan QR code équipement, voir historique de ses dernières demandes | Smartphone / Kiosque tablette fixe en ligne |
| **E101 — Déclaration Panne** | Formulaire simplifié pré-rempli par scan | Choisir type incident (Panne/Regrlage/Securite), saisir description, prendre photo, valider priorite | Smartphone / Kiosque |
| **E102 — Suivi Mes Demandes** | Liste des BT crees par l'operateur | Voir statut (Cree/Planifie/En cours/Termine/Cloture), consulter commentaire cloture, ajouter photo complementaire | Smartphone |
| **E103 — Notification BT Termine** | Ecran push notification | Lire notification, acceder au BT, confirmer reprise production | Smartphone |

### 1.2 Profil : Technicien Maintenance (4–8 utilisateurs)

| Écran | Description | Actions Principales | Device |
|-------|-------------|---------------------|--------|
| **E200 — Tableau de Bord Technicien** | Vue jour/semaine personnalisee | Voir mes BT affectes (En cours / Planifies), mes pointages du jour, acces rapide scan QR | Tablette 10" robuste IP65 |
| **E201 — Execution BT** | Interface principale terrain (UI gant-compatible) | Demarrer intervention, Pause/Reprise, Terminer, saisir cause panne, actions realisees, pieces consommees, photos avant/apres | Tablette / Smartphone robuste |
| **E202 — Checklist Preventive** | Affichage etape par etape d'une checklist | Cocher chaque etape, saisir valeur/commentaire/photo par etape, valider checklist complete | Tablette |
| **E203 — Saisie Pieces Consommees** | Sous-ecran de l'execution BT | Scan QR piece ou recherche par reference, saisie quantite, validation reservation/sortie stock | Tablette |
| **E204 — Consultation Fiche Equipement** | Fiche detaillee machine / sous-ensemble | Voir caracteristiques, historique BT, documents joints (plans, notices), dernier compteur | Tablette / Smartphone |
| **E205 — Saisie Compteur** | Ecran de releve manuel compteur | Saisir valeur compteur (heures, coups, m2), voir historique des releves, alertes si seuil depasse | Tablette |
| **E206 — Bloc ATEX Execution** | Sous-ecran conditionnel si equipement ATEX | Cocher consignation electrique, saisir N permis de feu, cocher outillage certifie Ex, nettoyage post-intervention, saisir valeur depression | Tablette |
| **E207 — Planning Personnel** | Vue calendrier de ses BT planifies | Consulter dates, equipements, type d'intervention, duree estimée | Tablette / Smartphone |

### 1.3 Profil : Responsable Maintenance (1 utilisateur)

| Écran | Description | Actions Principales | Device |
|-------|-------------|---------------------|--------|
| **E300 — Dashboard Responsable** | Vue synthétique du jour / semaine / mois | Voir BT en cours, BT en retard, preventifs 7 jours, alertes stock, equipements arretes, taux de disponibilite | Desktop / Tablette |
| **E301 — Planification Kanban** | Vue Kanban des BT par statut | Glisser-deposer BT entre colonnes, affecter technicien + date, voir charge par technicien (heures planifiees), detecter conflits | Desktop |
| **E302 — Planification Calendrier** | Vue calendrier semaine/mois | Voir BT planifies par jour, filtrer par technicien/zone, creer reservation, reporter BT | Desktop |
| **E303 — Gestion Equipements** | CRUD complet referentiel arborescent | Creer/modifier/supprimer equipement (site > zone > ligne > machine > sous-ensemble), gerer QR codes, affecter localisation, definir criticite | Desktop |
| **E304 — Validation Cloture BT** | Liste des BT "A valider" | Consulter details execution (temps, pieces, photos, causes), ajouter commentaire cloture, valider ou rouvrir BT, cloturer definitivement | Desktop |
| **E305 — Gestion Plans Preventifs** | CRUD plans preventifs | Creer/modifier plan temporel (frequence calendaire/compteur), creer plan conditionnel (seuils), affecter checklist, definir marge alerte | Desktop |
| **E306 — Suivi Echeances Preventives** | Vue preventifs a venir / en retard | Filtrer par periode (7j/30j), par zone, par technicien, code couleur (vert/orange/rouge), export Excel | Desktop |
| **E307 — Alertes et Notifications** | Centre de notifications | Consulter toutes les alertes (BT urgent, stock bas, preventif retard, seuil capteur), acquitter alertes, voir historique | Desktop |
| **E308 — Gestion Stocks** | Vue complete stocks | Consulter referentiel articles, mouvements, alertes minimum, valider ajustements inventaire | Desktop |
| **E309 — Reporting KPIs** | Vue indicateurs de performance | Voir MTTR, MTBF, taux preventif, couts, filtrer par periode/equipement/zone, export PDF/Excel | Desktop |
| **E310 — Administration Parametrage** | Ecran super-admin limité | Configurer types BT, types causes/actions, familles articles, seuils alertes, unites compteur | Desktop |

### 1.4 Profil : Magasinier (1–2 utilisateurs)

| Écran | Description | Actions Principales | Device |
|-------|-------------|---------------------|--------|
| **E400 — Gestion Articles** | CRUD referentiel articles | Creer article (reference, designation, famille, sous-famille, stock mini et localisation), generer QR code, imprimer etiquette | Desktop |
| **E401 — Mouvements Stock** | Saisie entrees/sorties/reservations | Enregistrer entree (reception, quantite, N BL, commentaire), enregistrer sortie (scan article, quantite, BT associe), transferer entre magasins | Desktop / Tablette |
| **E402 — Inventaire Mobile** | Saisie inventaire physique | Scan QR article, voir stock theorique, saisir quantite reelle, generation ecart, validation responsable | Tablette |
| **E403 — Alertes Stock** | Vue alertes rupture / minimum | Consulter alertes par criticite, acquitter, voir equipements associes, suggestion commande | Desktop |
| **E404 — Historique Mouvements** | Trace des mouvements par article | Filtrer par periode, type de mouvement, BT associe, export | Desktop |

### 1.5 Profil : Direction / Production Manager (2–3 utilisateurs)

| Écran | Description | Actions Principales | Device |
|-------|-------------|---------------------|--------|
| **E500 — Dashboard Direction** | Vue mois/trimestre strategique | Voir couts maintenance, taux preventif, MTTR/MTBF, arrets non planifies, TRS, comparatif ligne/zone | Desktop |
| **E501 — Rapport Mensuel PDF** | Generation rapport automatique | Cliquer "Generer rapport", visualiser apercu, telecharger PDF, recevoir par email automatique | Desktop |
| **E502 — Consultation Equipements** | Vue lecture seule referentiel | Rechercher equipement, consulter fiche, historique, documents, lecture seule | Desktop / Tablette |
| **E503 — Export Donnees** | Export multi-criteres | Selectionner periode, type de donnees (BT, stocks, compteurs), format (Excel, PDF), generer export | Desktop |

### 1.6 Profil : HSE / Qualite (1–2 utilisateurs)

| Écran | Description | Actions Principales | Device |
|-------|-------------|---------------------|--------|
| **E600 — Controles ATEX Reglementaires** | Vue inspections planifiees | Voir inspections ATEX a venir, en retard, consulter resultats, valider rapports | Desktop |
| **E601 — Audit Trail** | Trace complete des actions | Rechercher par utilisateur, date, type d'action, equipement, exporter pour audit | Desktop |
| **E602 — Rapport Conformite** | Generation rapport conformite | Selectionner periode, generer rapport inspections ATEX + securite machines, telecharger PDF | Desktop |

### 1.7 Profil : Administrateur (1 utilisateur DSI)

| Écran | Description | Actions Principales | Device |
|-------|-------------|---------------------|--------|
| **E700 — Gestion Utilisateurs** | CRUD utilisateurs et roles | Creer utilisateur (nom, prenom, email, login, mot de passe), affecter role, activer/desactiver, envoi identifiants par email | Desktop |
| **E701 — Gestion Roles et Permissions** | Matrice de permissions | Definir permissions par role (lecture/ecriture/suppression/admin) par module | Desktop |
| **E702 — Parametrage Metier** | Configuration listes et codifications | Gerer types BT, types causes pannes, types actions, familles/sous-familles articles, niveaux criticite, unites compteur, seuils alertes | Desktop |
| **E703 — Audit Trail Systeme** | Logs systeme complets | Consulter logs connexions, logs actions, filtrer, exporter, conservation 1 an | Desktop |
| **E704 — Sauvegarde et Maintenance** | Outils admin systeme | Lancer sauvegarde manuelle, voir etat sauvegardes auto, restauration point-in-time, etat base | Desktop |

---

## 2. Liste des Fonctionnalités par Module (Détaillée)

---

### Module 1 : Gestion des Actifs / Équipements

#### Description technique
Module CRUD arborescent 5 niveaux (Site → Zone → Ligne → Machine → Sous-ensemble) avec gestion des QR codes, des compteurs, des documents attachés et de l'historique des interventions. C'est le référentiel central sur lequel s'appuient tous les autres modules. Stockage des photos et documents en local sur le serveur (pas de S3 cloud, hébergement on-premise).

#### Fonctionnalités (liste numérotée — 1 fonction = 1 item développable)

1. **ACT-001** — Créer un site : saisir code site (ex: LAG, STG, TRO, NAP, CHI), nom, adresse, fuseau horaire, actif/inactif.
2. **ACT-002** — Modifier / supprimer un site (soft delete avec archivage, pas de suppression physique).
3. **ACT-003** — Créer une zone : saisir code zone, nom, rattachement au site, description. Exemples : Zone A (Presses + Découpe + Recuit), Zone B (Laquage + Sérigraphie + Emballage).
4. **ACT-004** — Modifier / supprimer une zone (soft delete).
5. **ACT-005** — Créer une ligne : saisir code ligne, nom, rattachement zone, type (ligne production, ligne auxiliaire). Exemple : Ligne Presses n°1, Ligne Laquage n°2.
6. **ACT-006** — Modifier / supprimer une ligne.
7. **ACT-007** — Créer un équipement (machine) : saisir code unique (10–20 car., format type-numero, ex: PR-001, LQ-002, SR-003, FR-001), désignation (100 car.), type (liste : Presse / Laquage / Sérigraphie / Four / Découpe / Emballage / Compresseur / Dépoussiéreur / Convoyeur / Autre), constructeur, numéro de série, date mise en service, localisation (arborescence site-zone-ligne), criticité (Critique / Élevée / Moyenne / Faible), statut (En service / En arrêt / En maintenance / Démantelé), date fin garantie, coût horaire arrêt (€/h), contact alimentaire (booléen), zone ATEX (Zone 20 / Zone 21 / Zone 22 / Non ATEX).
8. **ACT-008** — Modifier un équipement : tous les champs modifiables avec historique des modifications (qui, quand, ancienne valeur, nouvelle valeur).
9. **ACT-009** — Marquer équipement "En arrêt" : changement de statut avec horodatage, motif obligatoire, notification automatique à la production. Reversion automatique à "En service" quand le BT lié est clôturé.
10. **ACT-010** — Créer un sous-ensemble : saisir code (format : code-parent-suffixe, ex: PR-001-MAT-SUP pour matrice supérieure de PR-001), désignation, type (Matrice / Pompe / Buse / Brûleur / Moteur / Ventilateur / Filtre / Autre), rattachement équipement parent, stock pièces associé.
11. **ACT-011** — Modifier / supprimer sous-ensemble.
12. **ACT-012** — Générer QR code équipement : génération QR code contenant l'URL unique de la fiche (format : `https://<serveur>/equipement/<code>`) ou le code unique brut, export PNG/SVG, impression par lot (sélection multiple, format A4 avec X QR codes par page).
13. **ACT-013** — Imprimer QR codes par lot : sélectionner N équipements, générer PDF A4 avec QR codes + code + désignation sous chaque QR, envoi à l'imprimante.
14. **ACT-014** — Recherche équipement : recherche full-text sur code, désignation, constructeur, type. Filtres multi-critères (zone, criticité, statut, ATEX, contact alimentaire). Résultats affichés en liste ou arborescence repliable.
15. **ACT-015** — Scan QR code équipement : accès caméra mobile, décodage QR, ouverture directe fiche équipement (< 2 secondes). Fonctionne hors-ligne si fiche préchargée dans IndexedDB.
16. **ACT-016** — Consulter historique interventions équipement : liste chronologique des BT (50 derniers minimum), affichage date, type, technicien, durée, description. Filtrage par type (préventif / correctif / curatif / amélioration / sécurité / réglementaire). Accès direct depuis fiche équipement.
17. **ACT-017** — Export PDF historique équipement : sélectionner période, générer PDF avec logo Simply GMAO, fiche identité équipement, liste BT chronologique, temps total d'arrêt, coûts estimés.
18. **ACT-018** — Saisir compteur manuel : champ compteur sur fiche équipement, unité configurable (heures / coups / unités / m² / litres / bar / °C / mm/s), saisie valeur + date relevé, historique des relevés (tableau + courbe simple).
19. **ACT-019** — Configurer seuil compteur : définir valeur seuil + type d'alerte (préventif / avertissement), génération alerte quand compteur dépasse seuil.
20. **ACT-020** — Upload document attaché : drag & drop ou sélection fichier, types autorisés (PDF, JPG, PNG, MP4), taille max 20 Mo par fichier, stockage local serveur (`/uploads/equipements/<code>/`), types de document (Notice constructeur / Plan éclaté / Schéma électrique / Photo machine / Vidéo procédure / Certificat / Manuel sécurité / Autre).
21. **ACT-021** — Consulter document attaché : affichage inline (PDF viewer, image, vidéo), téléchargement, fonctionne hors-ligne après synchronisation PWA.
22. **ACT-022** — Badge visuel ATEX : sur fiche équipement, si Zone ATEX ≠ "Non ATEX", affichage badge rouge "ATEX" avec zone, filtrage rapide "Voir équipements ATEX".
23. **ACT-023** — Vue arborescence complète : affichage hiérarchique Site > Zone > Ligne > Machine > Sous-ensemble, repliable, avec indicateurs statut (pastille couleur : vert = en service, rouge = arrêt, orange = maintenance).
24. **ACT-024** — Dupliquer équipement : copier une fiche équipement existante (tous les champs sauf code unique et numéro de série), utile pour créer les presses PR-002, PR-003, PR-004 à partir de PR-001.

#### Données en entrée / sortie
- **Entrée** : Formulaires création/modification (champs texte, listes déroulantes, dates, fichiers), scan QR, saisie compteur, filtres recherche.
- **Sortie** : Fiche équipement (JSON + rendu HTML), liste arborescente (JSON), QR code (PNG/SVG/PDF), historique BT (JSON + PDF), documents (fichiers binaires + métadonnées JSON).

#### Règles métier critiques
- Code unique obligatoire, non modifiable après création. Format validé par regex configurable.
- Si statut passe à "En arrêt" → notification push aux opérateurs de la ligne et chef de production.
- Si statut passe à "En maintenance" via BT → statut retourne automatiquement à "En service" à la clôture du BT.
- Zone ATEX et contact alimentaire hérités automatiquement sur les BT créés pour cet équipement.
- Suppression physique interdite : archivage avec flag `is_archived` + date archivage + motif.
- Date mise en service obligatoire pour calcul âge équipement.

#### Contraintes techniques spécifiques
- Stockage fichiers en local sur le serveur (path `/var/simply-gmao/uploads/`). Pas de CDN cloud.
- Photos redimensionnées côté serveur : max 1920x1080, compression JPEG qualité 80.
- QR codes générés côté serveur (lib qrcode Python ou JS), imprimables en 300 DPI.
- Arborescence chargée lazy (pagination par niveau) pour éviter surcharge si 80+ équipements.
- IndexedDB PWA : préchargement des fiches équipements visitées récemment + marquage `is_synced`.

---

### Module 2 : Bons de Travail (BT / OT)

#### Description technique
Module cœur de la GMAO. Gestion du cycle de vie complet d'un BT : création → planification → exécution → clôture. Interface d'exécution mobile optimisée pour usage en atelier avec gants (boutons larges, peu de champs texte obligatoires). Système de chronométrage intégré avec gestion des pauses.

#### Fonctionnalités

1. **BT-001** — Créer un BT (opérateur) : formulaire simplifié — scan QR équipement (pré-remplit localisation), description panne (texte long), photo (optionnel, max 3), type = "Panne" par défaut, priorité = "Urgente" par défaut. Création en < 30 secondes. Notification push immédiate au responsable + techniciens de zone.
2. **BT-002** — Créer un BT (technicien / responsable) : formulaire complet — type de demande (Panne / Préventif / Amélioration / Sécurité / Réglementaire), équipement (arborescence ou scan QR), description, photo, priorité (Urgente / Haute / Normale / Basse), demandeur (auto), date demande (auto), zone ATEX (auto héritée), contact alimentaire (auto hérité).
3. **BT-003** — Règle métier ATEX à la création : si équipement zone ATEX, affichage case obligatoire "Besoin consignation électrique" (Oui / Non / À déterminer). Si équipement contact alimentaire, case "Impact sur chaîne alimentaire".
4. **BT-004** — Workflow statut BT : machine à états avec transitions strictes. États : `CREE` → `A_PLANIFIER` → `PLANIFIE` → `EN_COURS` → `A_CLOTURER` → `CLOTURE`. Transitions avec acteur obligatoire et horodatage.
5. **BT-005** — Transition CREE → A_PLANIFIER : le responsable valide la priorité et accepte le BT. Horodatage. Notification au demandeur.
6. **BT-006** — Transition A_PLANIFIER → PLANIFIE : le responsable affecte technicien + date prévue. Détection conflit si technicien a déjà un BT "En cours" ou charge > 8h planifiées ce jour. Stock pièces réservé si pièces listées dans le plan préventif.
7. **BT-007** — Transition PLANIFIE → EN_COURS : le technicien appuie "Démarrer intervention". Enregistrement heure début (timestamp serveur si online, horloge locale si offline). Notification au responsable + demandeur.
8. **BT-008** — Transition EN_COURS → EN_COURS (Pause) : bouton "Pause", enregistrement heure pause début, motif pause (Attente pièce / Arrêt sécurité / Attente production / Repas / Autre). Technicien ne peut pas démarrer un autre BT s'il a une pause non reprise.
9. **BT-009** — Transition Pause → EN_COURS (Reprise) : bouton "Reprise", enregistrement heure reprise. Calcul temps de pause.
10. **BT-010** — Transition EN_COURS → A_CLOTURER : bouton "Terminer intervention", enregistrement heure fin. Saisie obligatoire : cause de panne (liste), actions réalisées (texte libre + liste), temps passé total (calcul auto fin-début-pauses, éditable avec justification si modifié). Saisie optionnelle : photos avant/après (max 6), commentaire.
11. **BT-011** — Saisie cause panne : liste déroulante (configurable) : Usure / Réglage / Surchauffe / Encrassement / Vibration / Rupture / Électrique / Pneumatique / Hydraulique / Fuite / Obstruction / Défaut automate / Autre. Possibilité de sélectionner plusieurs causes.
12. **BT-012** — Saisie actions réalisées : liste déroulante (configurable) : Remplacement / Réglage / Nettoyage / Graissage / Soudure / Usinage / Programmation / Calibrage / Inspection / Démonter / Remonter / Essai / Autre + champ texte libre pour détails.
13. **BT-013** — BT "Partiellement terminé" : si intervention non résolue, technicien peut marquer "Partiellement terminé" avec commentaire, génération automatique d'un nouveau BT lié (référence BT parent) avec priorité héritée et description pré-remplie.
14. **BT-014** — Transition A_CLOTURER → CLOTURE : le responsable valide le BT. Si dépassement temps estimé > 20 %, commentaire de clôture obligatoire. Notification au demandeur. Équipement repasse en statut "En service" si applicable.
15. **BT-015** — Rouvrir un BT clôturé : le responsable peut rouvrir un BT avec motif, retour à EN_COURS ou A_PLANIFIER.
16. **BT-016** — Vue Kanban planification : colonnes CREE / A_PLANIFIER / PLANIFIE / EN_COURS / A_CLOTURER / CLOTURE. Glisser-déposer entre colonnes (avec confirmation si transition non standard). Nombre de BT affiché par colonne. Chargement lazy (30 BT par colonne).
17. **BT-017** — Vue calendrier planification : affichage semaine/mois, BT positionnés par date planifiée. Couleur par priorité (rouge = urgent, orange = haute, bleu = normale, gris = basse). Filtrage par technicien, zone.
18. **BT-018** — Affichage charge technicien : pour chaque technicien, somme des heures planifiées par jour (badge sur le planning). Alerte si > 8h/jour.
19. **BT-019** — Filtrage BT : filtres multi-critères (statut, priorité, zone, technicien, équipement, type, période demande, période clôture). Recherche full-text sur description.
20. **BT-020** — Export BT période : sélectionner période, filtrer, exporter Excel (colonnes : N°BT, Date demande, Équipement, Type, Priorité, Technicien, Temps passé, Coût pièces, Statut). Max 10 000 lignes, génération < 10 secondes.
21. **BT-021** — Notification changement statut : à chaque transition, notification push + email au demandeur et au responsable. Si priorité = Urgente, notification sonore + push persistante jusqu'à acquittement.
22. **BT-022** — Suivi demandes opérateur : liste des BT créés par l'opérateur connecté, avec statut (code couleur : gris = créé, jaune = en cours, vert = clôturé). Notification push à chaque changement de statut.
23. **BT-023** — Ajout commentaire / photo complémentaire (opérateur) : sur un BT en cours, l'opérateur demandeur peut ajouter un commentaire ou une photo (ex: précision sur la panne observée après).
24. **BT-024** — Rappel automatique préventif : 24h avant échéance préventive, notification push au technicien assigné + email.
25. **BT-025** — Dupliquer BT : créer un nouveau BT pré-rempli à partir d'un BT existant (même équipement, description, type), utile pour interventions récurrentes.
26. **BT-026** — Lien BT-Équipement-Sous-ensemble : le BT peut cibler un équipement ou un sous-ensemble spécifique. Historique impacté au niveau parent aussi.

#### Données en entrée / sortie
- **Entrée** : Formulaires création/édition, transitions workflow (boutons), saisie temps, sélection causes/actions, upload photos, scan QR.
- **Sortie** : Fiche BT (JSON), liste BT filtrée (JSON), Kanban (JSON avec position colonne), calendrier (JSON avec dates), notification push/email (payload JSON), export Excel (binaire XLSX).

#### Règles métier critiques
- Seul le responsable peut passer de CREE à PLANIFIE (validation).
- Seul le technicien assigné peut passer de PLANIFIE à EN_COURS (démarrage).
- Seul le technicien assigné peut passer de EN_COURS à A_CLOTURER.
- Seul le responsable peut passer de A_CLOTURER à CLOTURE (ou rouvrir).
- Un technicien ne peut avoir qu'un seul BT "En cours" à la fois (pas de multitâche).
- Si priorité = Urgente et création par opérateur → push immédiat + sonore au responsable et techniciens zone.
- Temps passé calculé auto = heure_fin - heure_début - Σ(pauses). Éditable avec audit de modification.
- Si BT sur équipement ATEX → bloc sécurité ATEX obligatoire à la clôture (voir Module 8).
- Si BT sur équipement contact alimentaire → case "Nettoyage/rinçage post-intervention validé" obligatoire.
- Dépassement temps estimé > 20 % → commentaire clôture obligatoire.
- Photos avant/après obligatoires pour les BT de type "Amélioration" ou "Sécurité".

#### Contraintes techniques spécifiques
- Interface execution (E201) : boutons minimum 64x64 dp, texte 18sp minimum, contrastes élevés, compatible gants.
- Chronométrage : timestamp UTC côté serveur, conversion fuseau horaire local à l'affichage. Si offline, heure locale du device avec flag `is_local_time` et correction possible à la synchronisation.
- Photos : compression JPEG côté client avant envoi (max 2 Mo), 5 MPixels suffisant.
- Workflow : implémenté via state machine côté serveur avec validation stricte des transitions. Table `bt_workflow_log` pour traçabilité.
- Glisser-déposer Kanban : implémentation HTML5 Drag & Drop API ou librairie (react-beautiful-dnd équivalent), avec call API PUT `/api/bt/{id}/transition`.

---

### Module 3 : Maintenance Préventive

#### Description technique
Module de planification des interventions récurrentes. Supporte le préventif temporel (calendaire et compteur) et le préventif conditionnel (seuils capteurs/relevés manuels). Génération automatique des BT préventifs avec anticipation configurable. Association de checklists aux plans préventifs.

#### Fonctionnalités

1. **PRE-001** — Créer un plan préventif temporel calendaire : saisir nom plan, équipement cible, fréquence (nombre + unité : Jours / Semaines / Mois / Années), base (date fixe ou date dernière intervention), marge alerte (nombre de jours avant échéance), type BT généré (Préventif systématique / Préventif conditionnel), technicien assigné par défaut, checklist associée.
2. **PRE-002** — Créer un plan préventif temporel compteur : idem PRE-001 mais fréquence en unités compteur (ex: tous les 500 000 coups, tous les 10 000 m²). Unité choisie parmi celles configurées.
3. **PRE-003** — Créer un plan préventif conditionnel (seuil) : saisir type de mesure (Vibration / Température / Pression / Dépression / Niveau / Autre), seuil d'alerte (valeur numérique + opérateur > / < / =), période de mesure (fréquence relevé). Exemple : vibration presse > 7.1 mm/s.
4. **PRE-004** — Modifier / supprimer un plan préventif (soft delete). Si suppression, annulation des BT préventifs non démarrés générés par ce plan.
5. **PRE-005** — Génération automatique BT préventif : job côté serveur (cron toutes les heures ou webhook) qui crée un BT préventif N jours avant échéance (N configurable par plan, défaut 3 jours). Le BT est créé avec statut "Planifié", type "Préventif", priorité "Normale", affectation au technicien par défaut, checklist pré-associée.
6. **PRE-006** — Génération BT préventif compteur : job quotidien qui compare compteur actuel équipement avec seuil plan compteur. Si compteur + marge ≥ seuil → génération BT.
7. **PRE-007** — Génération BT préventif conditionnel : quand un relevé de capteur ou une saisie manuelle dépasse le seuil configuré → alerte + proposition génération BT (validation responsable) ou génération auto selon paramétrage.
8. **PRE-008** — Alertes échéances préventives : 7 jours avant → notification push technicien. 3 jours avant → notification push + email. Jour J → notification push + email + alerte dashboard. Retard > 3 jours → alerte rouge + notification escalade responsable. Retard > 7 jours → notification escalade direction + HSE.
9. **PRE-009** — Vue "Préventifs à venir" : liste des préventifs des 7 et 30 prochains jours. Filtrage par zone, technicien, équipement. Code couleur : vert (à jour), orange (dans la marge), rouge (retard).
10. **PRE-010** — Vue calendrier préventifs : affichage mois avec pastilles colorées par jour (nombre de préventifs). Clic sur jour → liste détaillée.
11. **PRE-011** — Taux de réalisation préventif : calcul automatique (préventifs réalisés / préventifs planifiés sur la période), affichage par mois et cumul année. Cible > 95 %.
12. **PRE-012** — Report de préventif : le responsable peut reporter un préventif avec saisie nouvelle date et motif obligatoire. Traçabilité du report dans le BT généré et dans le plan préventif (historique des reports).
13. **PRE-013** — Préventifs réglementaires spécifiques : type de plan "Réglementaire ATEX" ou "Réglementaire Sécurité machines" ou "Appareil à pression" avec fréquence imposée par défaut (configurable). Checklist obligatoire. Non réalisable à temps = alerte escalade HSE + Direction.
14. **PRE-014** — Historique réalisations préventives : liste de tous les BT préventifs exécutés par plan, avec dates, techniciens, durées, résultats.
15. **PRE-015** — Détection conflit préventif vs production : si préventif planifié sur équipement en production active (statut "En service" et compteur incrémenté récemment), alerte "Vérifier disponibilité ligne avec production".
16. **PRE-016** — Synchronisation compteur SCADA (Phase 2) : endpoint API `/api/compteurs/push` pour réception compteur automatique depuis SCADA/PLC. Mise à jour compteur équipement + vérification seuils compteur.

#### Données en entrée / sortie
- **Entrée** : Formulaires création plan (champs texte, numériques, listes), saisie seuils, validation génération BT, report avec motif.
- **Sortie** : Liste plans (JSON), BT générés (JSON), alertes échéances (JSON + push), taux réalisation (JSON), calendrier (JSON).

#### Règles métier critiques
- Plan préventif actif = génère des BT tant que l'équipement est actif (statut ≠ Démantelé).
- Si BT préventif non réalisé à la date d'échéance + marge → alerte escalade.
- Report préventif : maximum 2 reports consécutifs autorisés (paramétrable), 3ème report = validation direction obligatoire.
- Plan préventif réglementaire ATEX : suppression interdite sans validation HSE. Modification fréquence interdite sans validation.
- Génération auto BT préventif : un seul BT préventif ouvert par plan à la fois. Si BT existant non clôturé, pas de nouvelle génération.
- Préventif conditionnel : le relevé manuel qui déclenche un BT est archivé et lié au BT créé.

#### Contraintes techniques spécifiques
- Job côté serveur : utiliser un scheduler (node-cron, APScheduler Python, ou cron système) pour la génération auto. Pas de dépendance externe type Celery/RabbitMQ (monolithique) — utiliser le scheduler intégré au framework.
- Compteurs : historique des relevés stocké dans table `compteur_releves` avec index sur `(equipement_id, date_releve)`.
- Checklists : stockées en JSONB (PostgreSQL) pour flexibilité des étapes.
- Calcul taux réalisation : vue matérialisée ou calcul à la volée avec cache 1h ( Redis ou cache mémoire application).

---

### Module 4 : Gestion des Stocks / Pièces de Rechange

#### Description technique
Module de gestion du magasin pièces avec référentiel articles, mouvements (entrées, sorties, réservations, transferts, inventaires), alertes de seuils, et lien direct avec les BT (consommation sur intervention). Stockage local, pas d'intégration ERP en V1.

#### Fonctionnalités

1. **STK-001** — Créer un article : saisir référence unique (20 car.), désignation (100 car.), famille (Mécanique / Électrique / Pneumatique / Hydraulique / Consommable / Sécurité), sous-famille (Matrice / Buse / Pompe / Joint / Roulement / Filtre / Tampon / Écluse / Thermocouple / Brûleur / Autre), fournisseur principal, référence fournisseur, prix unitaire estimé (€), stock minimum (obligatoire), stock maximum, localisation stock (format libre : "Magasin A — Étagère 3 — Bac 12"), code-barre / QR code, numéro de série (si traçable), équipement(s) associé(s).
2. **STK-002** — Modifier / supprimer article (soft delete). Si article a des mouvements historiques → suppression interdite, archivage seulement.
3. **STK-003** — Générer QR code article : génération QR code contenant référence, impression étiquette. Format étiquette standard (ex: 50x30 mm) avec code, désignation courte, QR.
4. **STK-004** — Consulter fiche article : affichage stock physique, stock disponible (physique - réservations), stock minimum, stock maximum, localisation, historique mouvements, BT associés, équipement(s) lié(s).
4. **STK-005** — Entrée stock : saisie mouvement type "Entrée" — scan QR article ou recherche référence, quantité, date (auto), commentaire (N° BL, fournisseur). Mise à jour immédiate stock physique. Saisie possible hors-ligne (queued).
6. **STK-006** — Sortie stock : saisie mouvement type "Sortie" — scan QR, quantité, BT associé (optionnel). Mise à jour immédiate. Si quantité > stock disponible → alerte bloquante (sauf validation responsable).
7. **STK-007** — Réservation stock : lors de la planification d'un BT avec pièces listées, création mouvement type "Réservation" qui décrémente le stock disponible mais pas le stock physique. Annulation réservation si BT annulé ou non démarré dans les 48h (paramétrable).
8. **STK-008** — Transfert stock : mouvement type "Transfert" — saisie article, quantité, magasin source, magasin destination. Décrémentation source + incrémentation destination en transaction atomique.
9. **STK-009** — Retour stock : si pièce prélevée mais non utilisée sur BT, création mouvement type "Retour" qui réincrémente le stock. Justification obligatoire.
10. **STK-010** — Inventaire physique mobile : génération liste d'inventaire par zone/famille/magasin. Interface mobile : scan QR article → affichage stock théorique → saisie quantité réelle. Calcul écart = réel - théorique.
11. **STK-011** — Validation ajustement inventaire : le responsable visualise la liste des écarts d'inventaire, valide (ou refuse) chaque ajustement. Si validation → mouvement type "Ajustement" créé. Traçabilité complète (qui a compté, qui a validé, quand).
12. **STK-012** — Alerte stock minimum : job quotidien vérifiant tous les articles. Si stock physique ≤ stock minimum → alerte email/push au magasinier + responsable maintenance. Contenu alerte : article, stock actuel, stock minimum, équipement(s) concerné(s), dernière date consommation.
13. **STK-013** — Alerte stock maximum : si stock physique > stock maximum → alerte "stock dormant" au responsable.
14. **STK-014** — Alerte réservation impossible : lors de planification BT, si réservation impossible (stock insuffisant) → alerte visuelle + suggestion "Commander article" (création note de commande manuelle, non intégrée ERP en V1).
15. **STK-015** — Sortie ATEX spécifique : si article avec flag "ATEX" et sortie sur BT ATEX → case obligatoire "Pièce certifiée Ex" cochée + numéro certificat / référence traçable.
16. **STK-016** — Articles critiques Simply GMAO : liste d'articles à configurer en priorité avec criticité prédéfinie : matrices emboutissage (critique), buses laquage (critique), pompes laquage (élevée), tampons sérigraphie (élevée), joints toriques kits (élevée), filtres air compresseur (élevée), thermocouples four (critique), filtres dépoussiéreur ATEX (critique sécurité).
17. **STK-017** — Historique mouvements par article : liste chronologique des entrées, sorties, réservations, transferts, ajustements. Filtres par période, type, BT.
18. **STK-018** — Recherche article : full-text sur référence, désignation, fournisseur. Filtres famille, sous-famille, équipement associé, stock alerte.
19. **STK-019** — Export stock : export Excel de la situation de stock à date avec colonnes : référence, désignation, famille, stock physique, stock disponible, stock minimum, localisation, équipement associé.
20. **STK-020** — Pièces dormantes : rapport des articles non consommés depuis N mois (N paramétrable, défaut 24 mois), avec valeur stockée estimée.

#### Données en entrée / sortie
- **Entrée** : Formulaires article, scan QR, saisie quantités mouvements, sélection type mouvement, commentaires, validation ajustement.
- **Sortie** : Fiche article (JSON), stock temps réel (JSON), liste mouvements (JSON), alertes (JSON + email/push), inventaire (JSON + PDF), export Excel.

#### Règles métier critiques
- Stock disponible = stock physique - réservations actives - sorties validées.
- Sortie impossible si quantité > stock disponible (sauf override responsable avec justification).
- Entrée et sortie doivent être horodatées et signées (utilisateur + timestamp).
- Réservation auto-annulée si BT non démarré dans les 48h (paramétrable).
- Inventaire : écart > 10 % ou valeur > 500 € → validation responsable obligatoire.
- Article avec mouvements → suppression physique interdite.
- Flag ATEX sur article séparé du flag équipement ATEX. Un article non-ATEX peut être consommé sur BT ATEX (pas de blocage), mais avec case "Pièce certifiée Ex" optionnelle.

#### Contraintes techniques spécifiques
- Transactions SQL : toute opération de mouvement doit être atomique (BEGIN ... COMMIT/ROLLBACK). Table `mouvements_stock` en insert-only (pas d'update, pas de delete) pour traçabilité complète. Le stock physique est calculé comme somme des mouvements (vue ou colonne dénormalisée avec trigger).
- Inventaire offline : stockage local des quantités saisies en IndexedDB, synchronisation différée. Conflit possible si mouvement enregistré entre temps → résolution par dernier écrasant ou validation responsable.
- QR code article : format `ART-<référence>` ou URL directe. Scan instantané (< 1 seconde).

---

### Module 5 : Documentation Technique

#### Description technique
Module de gestion des documents attachés aux équipements (plans, notices, schémas, vidéos procédures) et des checklists/modes opératoires. Versionnage des documents. Historique des consultations. Consultation hors-ligne via PWA.

#### Fonctionnalités

1. **DOC-001** — Upload document attaché à équipement : sélectionner équipement, uploader fichier (PDF, JPG, PNG, MP4, max 20 Mo), saisir type (Notice constructeur / Plan éclaté / Schéma électrique / Schéma pneumatique / Photo machine / Vidéo procédure / Certificat / Manuel sécurité / Checklist / Mode opératoire / Autre), titre, description, date validité (optionnel), version initiale = 1.0.
2. **DOC-002** — Upload document attaché à sous-ensemble : même fonctionnalité que DOC-001 mais cible un sous-ensemble.
3. **DOC-003** — Remplacer version document : upload nouveau fichier, incrémentation version (auto + 0.1 ou manuelle), commentaire de version, conservation ancienne version (archivage).
4. **DOC-004** — Consulter document : affichage inline selon type (PDF viewer navigateur, image viewer, lecteur vidéo HTML5), téléchargement, partage lien.
5. **DOC-005** — Recherche document : full-text sur titre, description, type. Filtres par équipement, type, date upload, uploader.
6. **DOC-006** — Créer une checklist modèle : saisir nom checklist, type (Préventif / Contrôle ATEX / Mise en route / Sécurité machine / Inspection périodique / Autre). Ajout d'étapes : description étape, type réponse (Case à cocher / Valeur numérique / Texte libre / Photo obligatoire / Sélection Oui-Non / Mesure avec unité), unité si applicable, commentaire exemple.
7. **DOC-007** — Modifier / dupliquer checklist modèle : édition des étapes, réordre par drag & drop, duplication pour créer variante.
8. **DOC-008** — Associer checklist à plan préventif : sélection checklist dans la fiche plan préventif. Si plan ATEX → uniquement checklists de type "Contrôle ATEX".
9. **DOC-009** — Exécuter checklist sur BT préventif : affichage des étapes une par une ou en liste déroulante. Pour chaque étape : cocher, saisir valeur/texte/photo selon type configuré. Validation impossible si étape obligatoire non cochée (paramétrable). Sauvegarde progression étape par étape.
10. **DOC-010** — Exécuter checklist sur BT réglementaire ATEX : idem DOC-009 mais avec type checklist "Contrôle ATEX". Validation finale = signature numérique technicien + inspecteur ATEX.
11. **DOC-011** — Historique consultations document : table de log qui enregistre qui a consulté quel document quand (user_id, document_id, datetime, action=lecture/téléchargement).
12. **DOC-012** — Marquer document "en vigueur" : flag `is_current` sur la dernière version. Affichage badge "Version en vigueur" vs "Version obsolète".
13. **DOC-013** — Supprimer document (soft delete) : archivage avec conservation fichiers. Si document lié à des BT clôturés → suppression interdite.
14. **DOC-014** — Synchronisation PWA documents : préchargement des documents des équipements fréquemment consultés (cache LRU) et des checklists associées aux BT planifiés du technicien. Stockage IndexedDB / Cache API.
15. **DOC-015** — Export liste documents : export Excel/PDF de l'inventaire documentaire par équipement.

#### Données en entrée / sortie
- **Entrée** : Upload fichiers binaires, formulaires métadonnées, création checklist (JSON des étapes), exécution checklist (JSON réponses).
- **Sortie** : Documents (fichiers binaires), métadonnées (JSON), checklists (JSON), historique consultations (JSON).

#### Règles métier critiques
- Type checklist "Contrôle ATEX" : minimum 10 étapes, non supprimable si associée à un plan ATEX actif.
- Exécution checklist : progression sauvegardée à chaque étape (reprise possible si BT interrompu).
- Document "en vigueur" : un seul document "en vigueur" par type par équipement (ex: une seule notice constructeur en vigueur).
- Suppression document lié à BT clôturé → interdite (archivage seulement).
- Taille totale du stockage documents : limitée à 50 Go sur le serveur local (paramétrable). Alertes à 80 % et 95 %.

#### Contraintes techniques spécifiques
- Stockage local : `/var/simply-gmao/documents/` avec sous-répertoires par équipement.
- PDF viewer : utiliser `<iframe>` ou PDF.js (librairie Mozilla), compatible mobile.
- Compression images : JPEG qualité 80, max 1920px de large.
- Vidéos : encodage H.264 MP4, max 50 Mo. Compression côté client si possible.
- Checklists : stockées en JSONB PostgreSQL (structure flexible). Réponses d'exécution stockées en JSONB liées au BT.
- Cache PWA : stratégie Cache-First pour les documents, avec invalidation quand nouvelle version uploadée (message Service Worker).

---

### Module 6 : Reporting & KPIs

#### Description technique
Module de calcul et visualisation des indicateurs de performance maintenance. Dashboards temps réel avec widgets configurables. Calculs automatiques à partir des données BT, compteurs, stocks. Export PDF/Excel pour la direction.

#### Fonctionnalités

1. **RPT-001** — Dashboard technicien (vue jour/semaine) : widgets — Mes BT en cours (nombre + liste), Mes BT planifiés aujourd'hui, Temps passé aujourd'hui (chronométrage en cours + total), Alertes préventifs proches. Accès mobile.
2. **RPT-002** — Dashboard responsable maintenance (vue semaine/mois) : widgets — BT en cours / en retard (nombre, liste), Préventifs à venir 7 jours / 30 jours (nombre), Alertes stock (nombre), Équipements arrêtés > 2h (liste), Charge par technicien (graphique barres), Taux de disponibilité global. Filtrage par zone, période.
3. **RPT-003** — Dashboard direction (vue mois/trimestre) : widgets — Coûts maintenance mensuels (pièces + heures estimées), Taux préventif / Curatif (camembert), MTTR global et par équipement, MTBF global et par équipement, Arrêts non planifiés (heures, €), TRS (Taux de Rendement Synthétique), Évolution tendance (graphique ligne 12 mois).
4. **RPT-004** — Calcul MTTR : formule = Σ(temps réparation BT curatifs et correctifs) / Nombre de pannes (BT de type Panne ou curatif) sur la période. Affichage par équipement, par zone, global. Cible < 2h.
5. **RPT-005** — Calcul MTBF : formule = Temps de fonctionnement (compteur heures ou calendaire) / Nombre de pannes sur la période. Affichage par équipement, par zone, global. Cible > 500h.
6. **RPT-006** — Calcul taux maintenance préventive : formule = Heures préventif (BT préventifs, temps passé) / Heures totales maintenance (tous BT, temps passé) × 100. Cible > 60 %.
7. **RPT-007** — Calcul taux disponibilité : formule = (Temps fonctionnement / Temps disponible) × 100. Temps disponible = heures théoriques production (ex: 24h×7j×4 semaines = 672h/mois) - arrêts planifiés. Cible > 95 %.
8. **RPT-008** — Calcul coût maintenance : formule = Σ(coût pièces consommées) + Σ(temps passé × taux horaire technicien) + coûts sous-traitance (saisie manuelle). Par équipement, par zone, par mois.
9. **RPT-009** — Calcul temps moyen réponse : formule = Moyenne(date_début_BT - date_demande_BT) pour les BT urgents. Cible < 15 minutes.
10. **RPT-010** — Calcul respect plan préventif : formule = Préventifs réalisés / Préventifs planifiés × 100. Cible > 95 %.
11. **RPT-011** — Calcul ruptures stock critiques : comptage du nombre de fois où stock = 0 sur article marqué critique. Cible = 0.
12. **RPT-012** — Graphiques interactifs : bibliothèque charting (Chart.js ou Recharts), types : barres (charge, coûts), lignes (tendances), camemberts (taux), jauges (disponibilité). Filtrage par clic sur graphique (drill-down).
13. **RPT-013** — Export Excel BT période : sélectionner période, colonnes configurables, génération < 10 secondes pour 10 000 lignes.
14. **RPT-014** — Export PDF fiche équipement + historique : génération côté serveur (librairie PDF : Puppeteer, WeasyPrint, ou jsPDF), mise en page professionnelle avec logo Simply GMAO.
15. **RPT-015** — Rapport mensuel automatique direction : job mensuel qui génère un PDF avec : résumé BT du mois (nombre, types, temps total), temps d'arrêt (planifiés vs non planifiés), coûts estimés, taux préventif, MTTR/MTBF, top 5 équipements les plus pannes. Envoi automatique par email aux destinataires configurés.
16. **RPT-016** — Rapport Pareto pannes : graphique Pareto (80/20) des causes de pannes sur la période. Top causes avec % du total.
17. **RPT-017** — Comparaison période N vs N-1 : évolution des KPIs mois par mois, année glissante.
18. **RPT-018** — Widget personnalisable : le responsable peut configurer son dashboard (ajouter/supprimer widgets, changer ordre, filtrer par défaut). Sauvegarde préférence utilisateur.

#### Données en entrée / sortie
- **Entrée** : Filtres période, zone, équipement, type BT. Sélection colonnes export. Configuration widget.
- **Sortie** : Dashboard (JSON + HTML rendu), graphiques (JSON données + rendu SVG/Canvas), rapports PDF (binaire), exports Excel (binaire XLSX).

#### Règles métier critiques
- KPIs calculés à la volée à partir des données brutes (pas de denormalisation en temps réel). Cache 1 heure pour les calculs lourds (MTBF sur 12 mois).
- Rapport mensuel PDF : généré le 1er jour du mois à 6h du matin (job cron). Si échec → retry toutes les heures + alerte admin.
- Export Excel 10 000 lignes : streaming côté serveur pour éviter saturation mémoire.
- Temps de fonctionnement pour MTBF : si compteur disponible → utiliser compteur. Sinon → temps calendaire moins arrêts planifiés.

#### Contraintes techniques spécifiques
- Cache KPIs : Redis ou cache mémoire applicatif (ex: Node.js LRU cache, Python functools.lru_cache). TTL 1h.
- Calculs lourds : exécution asynchrone si > 2 secondes (job background + notification quand prêt).
- PDF : génération côté serveur avec headless browser (Puppeteer/Playwright) ou librairie native (WeasyPrint). Template HTML/CSS avec logo intégré en base64.
- Excel : librairie streaming (ExcelJS, openpyxl en mode write_only). Pas de chargement en mémoire de toutes les lignes.
- Charts : côté client (Canvas/SVG), données JSON depuis API.

---

### Module 7 : Portail Opérateurs Production

#### Description technique
Module ultra-simplifié destiné aux opérateurs de production. Interface à 3 clics maximum. Déclaration de panne par scan QR code machine. Suivi des demandes. Notifications. Pas d'accès aux autres modules.

#### Fonctionnalités

1. **OPP-001** — Écran d'accueil opérateur : grand bouton "Scanner ma machine" + bouton "Voir mes demandes". Design minimaliste, pas de menu latéral. Logo Simply GMAO.
2. **OPP-002** — Scan QR machine : ouverture caméra, décodage QR, si équipement trouvé → passage automatique à l'écran déclaration. Si QR inconnu → message "Machine non reconnue, appelez le responsable".
3. **OPP-003** — Formulaire déclaration panne : champs — description (texte libre, placeholder "Décrivez la panne en quelques mots"), type d'incident (Panne / Anomalie qualité / Besoin réglage / Problème sécurité — liste courte), photo (optionnel, bouton caméra), priorité (Urgente / Haute — par défaut Urgente pour les opérateurs). Pré-remplissage : équipement, zone, demandeur.
4. **OPP-004** — Création BT en < 30 secondes : validation du formulaire → création BT avec statut CREE, priorité Urgente (ou celle choisie), type Panne. Notification push immédiate au responsable + techniciens zone. Retour visuel confirmation (écran vert avec "Demande envoyée !").
5. **OPP-005** — Suivi mes demandes : liste chronologique des BT créés par l'opérateur. Affichage : N° BT, équipement, date, statut (pastille couleur). Clic → détail du BT (description, photos, statut, temps écoulé depuis création).
6. **OPP-006** — Notification au demandeur : push/email à chaque changement de statut du BT (Créé → Planifié → En cours → Terminé → Clôturé). Contenu : "Votre demande sur [Équipement] est maintenant [Statut]".
7. **OPP-007** — Notification "BT terminé" : push persistante avec bouton "Confirmer reprise production". L'opérateur doit appuyer pour confirmer que la ligne peut reprendre. Si non confirmé dans les 15 min → alerte responsable.
8. **OPP-008** — Ajout commentaire / photo complémentaire : sur un BT en cours, bouton "Ajouter info" permettant d'ajouter texte ou photo (ex: "La fuite s'est aggravée").
9. **OPP-009** — Mode kiosque : interface opérateur accessible sur tablette fixe en ligne de production (mode plein écran, pas de fermeture possible sans code admin). Timeout retour accueil après 2 min d'inactivité.
10. **OPP-010** — Impression QR codes équipements : génération PDF A4 avec QR codes + code machine + nom, pour impression et collage sur machines. Sélection multiple équipements. Format : 6 QR par page A4 (2 colonnes × 3 lignes).

#### Données en entrée / sortie
- **Entrée** : Scan QR, saisie description courte, sélection type/priorité, photo, confirmation reprise.
- **Sortie** : BT créé (JSON), liste demandes (JSON), notifications push/email.

#### Règles métier critiques
- Opérateur ne peut créer que des BT de type Panne ou Anomalie (pas de préventif, pas d'amélioration).
- Priorité par défaut = Urgente pour opérateur. Le responsable peut la modifier lors de la planification.
- Confirmation reprise production obligatoire pour BT urgent sur ligne active. Sans confirmation, le statut équipement reste "En maintenance".
- Timeout session opérateur : 30 min (pas de données sensibles, simplifié).
- Kiosque : tablette verrouillée sur URL du portail opérateur (Android Kiosk Mode ou iOS Guided Access).

#### Contraintes techniques spécifiques
- Interface ultra-simplifiée : pas de scroll complexe, pas de menu. 3 écrans maximum (Accueil → Déclaration → Confirmation).
- Boutons > 80x80 dp, texte > 20sp. Contraste élevé (fond blanc, boutons couleur vive).
- Pas d'authentification complexe : QR code opérateur ou badge NFC (Phase 2) ou sélection nom dans liste déroulante (V1).
- Kiosque : implémentation via PWA en mode standalone + `navigator.lockOrientation` + écouteur inactivité pour retour accueil.

---

### Module 8 : Administration, Rôles, Sécurité, Conformité ATEX

#### Description technique
Module transversal de gestion des utilisateurs, des permissions, du paramétrage métier, de l'audit trail, des sauvegardes, et de la conformité réglementaire ATEX / contact alimentaire / sécurité machines. C'est le module le plus sensible en termes de sécurité.

#### Fonctionnalités

##### 8.1 Administration Utilisateurs et Rôles

1. **ADM-001** — Créer un utilisateur : saisir nom, prénom, email (unique), login (unique), mot de passe (généré auto ou saisi, min 8 car., 1 majuscule, 1 chiffre), rôle (Admin / Responsable Maintenance / Technicien / Opérateur / Magasinier / HSE-Qualité / Lecteur). Activation compte (actif/inactif).
2. **ADM-002** — Modifier / désactiver utilisateur : modification email, nom, rôle. Désactivation = impossibilité de connexion mais conservation historique. Pas de suppression physique.
3. **ADM-003** — Envoi identifiants par email : email automatique à la création avec login + mot de passe temporaire + lien de connexion. Mot de passe temporaire à changer au premier login.
4. **ADM-004** — Réinitialisation mot de passe : demande de réinit par email (token unique 24h), saisie nouveau mot de passe.
5. **ADM-005** — Gestion des rôles et permissions : matrice de permissions par module (Lecture / Écriture / Suppression / Admin). Table des permissions :
   - **Administrateur** : tous les droits sur tous les modules.
   - **Responsable Maintenance** : écriture sur BT, planification, stocks, équipements, préventifs, reporting. Lecture administration limitée.
   - **Technicien** : écriture sur ses BT (exécution, temps, pièces), lecture sur équipements, planning, documents. Pas de suppression.
   - **Opérateur** : écriture création BT, lecture sur ses demandes. Pas d'accès aux autres modules.
   - **Magasinier** : écriture sur stocks, inventaire. Lecture sur équipements (localisation). Pas de BT.
   - **HSE-Qualité** : écriture sur inspections ATEX, lecture sur tout (audit). Pas de modification BT.
   - **Lecteur (Direction)** : lecture sur tous les modules, reporting. Pas d'écriture.
6. **ADM-006** — Session et authentification : login/password via formulaire web. JWT token (durée 8h, refresh token 7j). Déconnexion auto après 8h d'inactivité. HTTPS/TLS 1.2+ obligatoire.
7. **ADM-007** — Logs de connexion : enregistrement de chaque connexion (date/heure, IP, user agent, succès/échec). Conservation 1 an.

##### 8.2 Paramétrage Métier

8. **ADM-008** — Configurer types de BT : CRUD liste types (Panne / Préventif / Amélioration / Sécurité / Réglementaire / Autre). Ordre personnalisable. Impact immédiat sur les nouveaux BT.
9. **ADM-009** — Configurer types de causes de panne : CRUD liste (Usure / Réglage / Surchauffe / Encrassement / Vibration / Rupture / Électrique / Pneumatique / Hydraulique / Fuite / Obstruction / Défaut automate / Autre). Historique conservé.
10. **ADM-010** — Configurer types d'actions réalisées : CRUD liste (Remplacement / Réglage / Nettoyage / Graissage / Soudure / Usinage / Programmation / Calibrage / Inspection / Démonter / Remonter / Essai / Autre).
11. **ADM-011** — Configurer unités de compteur : CRUD liste (Heures / Coups / Unités / m² / Litres / Bar / °C / mm/s / Tours/minute / Autre). Impact sur les plans préventifs compteur.
12. **ADM-012** — Configurer familles et sous-familles d'articles : arborescence 2 niveaux (famille > sous-famille). CRUD complet.
13. **ADM-013** — Configurer niveaux de criticité : liste (Critique / Élevée / Moyenne / Faible). Utilisée sur équipements et stocks.
14. **ADM-014** — Configurer seuils d'alerte globaux : jours avant préventif (défaut 3), heures max BT urgent sans démarrage (défaut 15 min), heures max équipement arrêt avant alerte direction (défaut 2h), pourcentage dépassement temps estimé pour commentaire obligatoire (défaut 20 %).
15. **ADM-015** — Configuration codification équipements : regex validation du code unique (défaut : `[A-Z]{2}-[0-9]{3}` pour PR-001). Modifiable par admin.

##### 8.3 Audit Trail et Sécurité Données

16. **ADM-016** — Audit trail actions : horodatage de TOUTES les actions de création, modification, suppression (soft), changement de statut. Enregistrement : `table_name`, `record_id`, `action` (create/update/delete), `old_values` (JSON), `new_values` (JSON), `user_id`, `timestamp`, `ip_address`.
17. **ADM-017** — Audit trail consultation : log des consultations de fiches sensibles (BT ATEX, fiches équipement ATEX, documents certificats).
18. **ADM-018** — Données non supprimables : toute suppression = soft delete (flag `is_deleted` + date + user_id). Conservation indéfinie. Possibilité de restauration par admin.
19. **ADM-019** — Anonymisation utilisateur (droit à l'oubli RGPD) : si demande, remplacement du nom/prénom/email par hash, conservation des actions avec user_id anonymisé. Réversible par admin uniquement.
20. **ADM-020** — Sauvegarde automatique quotidienne : dump PostgreSQL complet, fichiers uploads/documents. Stockage local + copie sur NAS secondaire si configuré. Rétention 30 jours. Job cron à 2h du matin.
21. **ADM-021** — Restauration point-in-time : interface admin pour restaurer la base à une date/heure donnée (à partir des dumps quotidiens). Nécessite droit Admin.
22. **ADM-022** — Export audit trail : export Excel/PDF des logs sur période, filtrable par utilisateur, action, table, date.

##### 8.4 Conformité ATEX Intégrée

23. **ATEX-001** — Identification ATEX équipement : champ obligatoire "Zone ATEX" sur fiche équipement (Zone 20 / Zone 21 / Zone 22 / Non ATEX). Badge rouge visible si ATEX. Filtrage rapide "Équipements ATEX" dans le référentiel.
24. **ATEX-002** — Bloc sécurité ATEX sur BT (création) : si équipement zone ATEX, affichage automatique case "Besoin consignation électrique" (Oui / Non / À déterminer). Case obligatoire.
25. **ATEX-003** — Bloc sécurité ATEX sur BT (exécution) : affichage conditionnel si équipement ATEX. Cases à cocher obligatoires :
    - Consignation électrique effectuée (booléen, obligatoire)
    - Outillage certifié Ex utilisé (booléen, obligatoire)
    - Nettoyage post-intervention (booléen, obligatoire)
    - N° permis de feu (texte, obligatoire si travaux chauds — type de BT = Soudure/Meulage ou case "Travaux chauds" cochée)
    - Vérification dépression post-intervention (nombre, obligatoire si équipement = dépoussiéreur)
26. **ATEX-004** — Inspecteur ATEX : champ "Inspecteur ATEX" (utilisateur) obligatoire sur BT réglementaire ATEX. Signature numérique (confirmation par mot de passe) à la clôture.
27. **ATEX-005** — Date prochaine inspection ATEX : calculée automatiquement depuis la date de dernière inspection ATEX + fréquence plan. Affichage sur fiche équipement.
28. **ATEX-006** — Plan préventif ATEX réglementaire : type spécifique "Inspection ATEX" avec fréquence paramétrable (défaut 6 mois selon EN 60079-17). Checklist obligatoire 10+ points.
29. **ATEX-007** — Génération auto BT inspection ATEX : génération automatique N jours avant échéance (défaut 7 jours). Alertes progressives (7j, 3j, J, retard).
30. **ATEX-008** — Escalade inspection ATEX non réalisée : si retard > 3 jours → alerte rouge HSE + Responsable. Si retard > 7 jours → alerte rouge Direction.
31. **ATEX-009** — Traçabilité ATEX complète : tout BT sur équipement ATEX doit avoir les champs ATEX remplis pour passer à CLOTURE. Si champs manquants → blocage transition + message explicite.
32. **ATEX-010** — Export conformité ATEX : génération PDF annuel (ou période sélectionnée) avec : liste équipements ATEX, inspections réalisées, résultats, écarts, prochaines échéances. Pour audit DREAL / HSE.

##### 8.5 Contact Alimentaire

33. **ALIM-001** — Flag contact alimentaire : booléen sur équipement (lignes laquage, sérigraphie, embouteillage). Badge orange "Contact alimentaire" sur fiche.
34. **ALIM-002** — BT contact alimentaire : case "Impact sur chaîne alimentaire" à la création. Case "Nettoyage / rinçage post-intervention validé" obligatoire à la clôture.
35. **ALIM-003** — Traçabilité produits utilisés : sur BT contact alimentaire, saisie des références des produits (graisse, produit nettoyant) utilisés. Champs libres : référence graisse, référence produit nettoyant, référence rinçage.

##### 8.6 Sécurité Machines

36. **SEC-001** — Plan préventif sécurité machines : type spécifique "Vérification sécurité machines" avec fréquence configurée (mensuelle arrêts d'urgence, trimestrielle barrières immatérielles, etc.).
37. **SEC-002** — Checklist sécurité machines : checklist intégrée avec points de contrôle (arrêts d'urgence, barrières, contacteurs portes, etc.).
38. **SEC-003** — Traçabilité vérifications : historique des vérifications avec résultats, photos, signature technicien.

#### Données en entrée / sortie
- **Entrée** : Formulaires admin, création rôle, paramétrage listes, configuration alertes, saisie sécurité ATEX, signatures numériques.
- **Sortie** : Fiches utilisateurs (JSON), matrice permissions (JSON), logs audit (JSON + export), rapports conformité (PDF), alertes réglementaires (JSON + push/email).

#### Règles métier critiques
- Un BT sur équipement ATEX ne peut être clôturé sans que toutes les cases ATEX obligatoires soient remplies.
- Un BT sur équipement contact alimentaire ne peut être clôturé sans case "Nettoyage post-intervention validé".
- Plan préventif ATEX : suppression interdite. Modification fréquence = validation HSE + trace audit.
- Signature numérique ATEX : confirmation par re-saisie du mot de passe utilisateur (pas de clé cryptographique complexe en V1). Horodatage + IP.
- Audit trail : conservation 1 an minimum, 3 ans pour les données ATEX (exigence réglementaire).
- Sauvegarde : chiffrement du dump (AES-256) si stockage sur NAS externe.

#### Contraintes techniques spécifiques
- Authentification JWT : algorithme HS256, secret stocké en variable d'environnement. Durée token 8h, refresh 7j. Blacklist token en cas de déconnexion explicite (table `token_blacklist` en base).
- Mots de passe : hash bcrypt (coût 12), jamais stocké en clair.
- HTTPS : certificat auto-signé interne accepté (serveur local), ou certificat Let's Encrypt si exposition externe.
- Audit trail : table séparée `audit_logs` avec index sur `(table_name, record_id, created_at)`. Partitionnement par mois recommandé si volume > 100K lignes/mois.
- RGPD : champ `gdpr_anonymized` sur user. Anonymisation = hash SHA-256 du nom/prénom/email avec salt.

---

## 3. Workflows Techniques Détaillés

### Workflow 1 : Demande d'intervention (Opérateur → Responsable → Technicien → Clôture)

```
[ÉTAT INITIAL : AUCUN]
  |
  | Opérateur scanne QR machine + remplit formulaire (30 sec)
  v
[ÉTAT : CREE] (BT-001)
  |
  | Notification push + sonore → Responsable + Techniciens zone
  | Priorité = Urgente (par défaut opérateur)
  v
[ÉTAT : A_PLANIFIER] (BT-005)
  |
  | Responsable valide priorité, vérifie équipement ATEX/contact alimentaire
  | Si ATEX → case "Besoin consignation" obligatoire
  v
[ÉTAT : PLANIFIE] (BT-006)
  |
  | Responsable affecte technicien + date prévue
  | Vérification charge technicien (pas de conflit)
  | Réservation stock si pièces listées dans plan préventif
  | Notification push → Technicien assigné
  v
[ÉTAT : EN_COURS] (BT-007)
  |
  | Technicien appuie "Démarrer" → timestamp début
  | Équipement passe statut "En maintenance"
  | Notification push → Demandeur + Responsable
  | Technicien peut : Pause (BT-008) / Reprise (BT-009) / Terminer (BT-010)
  | Si ATEX → bloc sécurité ATEX affiché (ATEX-003)
  | Si contact alimentaire → case impact affichée
  | Technicien saisit : causes, actions, pièces consommées (scan QR),
  |                      photos avant/après, checklist préventive si applicable
  v
[ÉTAT : A_CLOTURER] (BT-010)
  |
  | Technicien a appuyé "Terminer" → timestamp fin
  | Calcul temps passé auto
  | Si dépassement > 20% temps estimé → flag alerte
  v
[ÉTAT : CLOTURE] (BT-014)
  |
  | Responsable valide intervention
  | Si dépassement > 20% → commentaire clôture OBLIGATOIRE
  | Si intervention non satisfaisante → Rouvrir BT (BT-015)
  | Si ATEX → vérification champs ATEX obligatoires remplis
  | Si contact alimentaire → vérification nettoyage validé
  | Équipement repasse statut "En service" (sauf autre BT ouvert)
  | Notification push/email → Demandeur (clôture)
  | Si opérateur non confirmé reprise → alerte persistante
  v
[ÉTAT FINAL : CLOTURE] (archivé, visible en historique)
```

**Transitions interdites :**
- CREE → EN_COURS (interdit : doit passer par planification)
- EN_COURS → CLOTURE (interdit : doit passer par A_CLOTURER)
- CLOTURE → EN_COURS (interdit : rouverture = retour à A_PLANIFIER ou EN_COURS via BT-015)

---

### Workflow 2 : Maintenance Préventive Planifiée (Génération BT → Exécution → Validation)

```
[ÉTAT INITIAL : Plan préventif actif]
  |
  | Job serveur (cron horaire) calcule échéances
  | Si date_échéance - marge ≤ aujourd'hui ET pas de BT préventif ouvert
  v
[ÉTAT : BT PREVENTIF GÉNÉRÉ] (PRE-005)
  |
  | BT créé automatiquement avec :
  |   - Type = Préventif
  |   - Statut = PLANIFIE
  |   - Équipement = cible du plan
  |   - Priorité = Normale
  |   - Technicien = assigné par défaut du plan
  |   - Checklist = associée au plan
  |   - Date prévue = date échéance
  | Notification push → Technicien
  v
[ÉTAT : PLANIFIE]
  |
  | (Optionnel) Responsable ajuste date/technicien
  | Alertes progressives : J-7 push, J-3 push+email, J0 email+dashboard
  v
[ÉTAT : EN_COURS]
  |
  | Technicien démarre intervention
  | Affichage checklist étape par étape (DOC-009)
  | Chaque étape : cocher + commentaire/valeur/photo selon type
  | Saisie compteur équipement si applicable (ACT-018)
  | Si plan réglementaire ATEX → checklist ATEX + signature (ATEX-006)
  v
[ÉTAT : A_CLOTURER]
  |
  | Technicien termine
  | Validation checklist complète (toutes étapes obligatoires cochées)
  | Si plan réglementaire → signature inspecteur ATEX
  v
[ÉTAT : CLOTURE]
  |
  | Responsable valide (ou auto-clôture si paramétré)
  | Plan préventif mis à jour : date_dernière_intervention = date_clôture
  | Prochaine échéance recalculée (date_dernière + fréquence)
  | Taux réalisation préventif recalculé
  v
[ÉTAT FINAL : CLOTURE + Plan mis à jour]
```

**Cas alternatif — Retard :**
```
Si BT préventif non démarré à date_échéance + 3 jours :
  → Alertes escalade (PRE-008)
Si retard > 7 jours :
  → Notification Direction + HSE
  → Flag rouge dashboard
  → Rapport conformité impacté
```

**Cas alternatif — Report :**
```
Responsable reporte le BT :
  → Saisie nouvelle date + motif obligatoire
  → Compteur de reports incrémenté
  → Si 3ème report consécutif → validation Direction obligatoire
```

---

### Workflow 3 : Gestion de Panne Urgente (Alerte → Affectation → Intervention → Rapprochement Pièces)

```
[ÉTAT INITIAL : Panne détectée sur ligne active]
  |
  | Opérateur scanne QR + appuie "Panne" (3 clics, < 30 sec)
  | OU Technicien constate panne → création BT urgent
  | OU SCADA déclenche alarme (Phase 2)
  v
[ÉTAT : CREE — Priorité = URGENTE]
  |
  | Notification IMMEDIATE (push + sonore + persistante)
  | Destinataires : Responsable + Techniciens zone + Chef production
  | Contenu : Équipement, description, photo si disponible
  | Temps cible réponse : < 15 minutes
  v
[ÉTAT : A_PLANIFIER]
  |
  | Responsable valide immédiatement (ou auto-validation si paramétré)
  | Si équipement ATEX → vérification consignation nécessaire
  | Affectation technicien le plus proche / disponible
  | Si pas de technicien dispo → astreinte / appel renfort
  v
[ÉTAT : PLANIFIE]
  |
  | Technicien reçoit notification avec détail panne
  | Accès rapide : fiche équipement + historique pannes similaires
  | Consultation documents (schémas, plans) hors-ligne si préchargés
  v
[ÉTAT : EN_COURS]
  |
  | Technicien démarre chrono
  | Si stock pièces réservé → confirmation réservation
  | Si pas de réservation → scan QR pièces en temps réel
  | Si pièce non disponible → alerte magasinier + suggestion commande
  | Si pièce ATEX → vérification certification Ex
  | Exécution intervention avec saisie temps réel
  | Si temps écoulé > seuil MTTR défini (ex: 2h presse)
  |   → Alerte escalade responsable + suggestion appel renfort
  v
[ÉTAT : A_CLOTURER]
  |
  | Intervention terminée
  | Si panne résolue → clôture normale
  | Si panne partiellement résolue → BT "Partiellement terminé"
  |   + création BT fils pour suite intervention
  v
[ÉTAT : CLOTURE]
  |
  | Validation responsable
  | Opérateur doit confirmer reprise production (OPP-007)
  | Équipement repasse "En service"
  | KPIs mis à jour : MTTR, temps réponse, disponibilité
  v
[ÉTAT FINAL : CLOTURE]
```

**Métrique temps de réponse :**
```
Temps réponse = heure_début_BT - heure_création_BT
Cible : < 15 minutes pour Urgent
Si > 15 min → flag "Temps réponse dépassé" dans reporting
```

---

### Workflow 4 : Consommation Stock (Réservation → Sortie → Mise à Jour Stock)

```
[ÉTAT INITIAL : BT créé avec pièces listées]
  |
  | À la planification (BT-006) :
  |   Si BT préventif avec pièces associées au plan
  |   OU Responsable ajoute pièces manuellement au BT
  v
[ÉTAT : RÉSERVATION]
  |
  | Création mouvement type "Réservation"
  | Stock disponible décrémenté de la quantité réservée
  | Stock physique inchangé
  | Si stock disponible < 0 → alerte + suggestion commande
  | Réservation valable 48h (paramétrable)
  v
[ÉTAT : EN_COURS — Technicien intervient]
  |
  | Technicien scanne QR pièce ou recherche par référence
  | Quantité consommée saisie
  | Si quantité = quantité réservée :
  |   → Réservation transformée en Sortie (mouvement type change)
  | Si quantité < quantité réservée :
  |   → Réservation partiellement transformée en Sortie
  |   → Excès de réservation annulé (retour stock disponible)
  | Si quantité > quantité réservée :
  |   → Sortie complète + sortie supplémentaire
  | Si pièce ATEX → case "Pièce certifiée Ex" cochée
  | Stock physique décrémenté
  v
[ÉTAT : SORTIE VALIDÉE]
  |
  | Mise à jour stock temps réel
  | Si stock physique ≤ stock minimum → alerte stock bas (STK-012)
  | Si stock = 0 et article critique → alerte rouge + email
  | Coût pièces ajouté au BT pour calcul coût maintenance
  v
[ÉTAT FINAL : BT CLOTURÉ — Stock à jour]
```

**Cas alternatif — Retour pièce non utilisée :**
```
Si technicien a prélevé mais pas utilisé :
  → Création mouvement "Retour"
  → Stock physique réincrémenté
  → Commentaire "Retour BT-XXXX — pièce non utilisée"
  → Réservation annulée si applicable
```

**Cas alternatif — Réservation expirée :**
```
Si BT non démarré 48h après réservation :
  → Réservation auto-annulée
  → Stock disponible réincrémenté
  → Notification responsable "Réservation annulée — BT non démarré"
```

---

### Workflow 5 : Inspection ATEX (Planification → Check-list → Validation → Archivage)

```
[ÉTAT INITIAL : Plan préventif ATEX actif]
  |
  | Type : "Inspection ATEX" (ATEX-006)
  | Fréquence : configurable (défaut 6 mois)
  | Équipement : dépoussiéreur ATEX, installation aspiration,
  |              évents explosion, écluses, mise à la terre
  | Checklist : 10+ points contrôle obligatoires (ATEX-006)
  v
[ÉTAT : INSPECTION PLANIFIÉE]
  |
  | Génération auto BT préventif J-7 (ATEX-007)
  | BT avec type = Préventif, sous-type = Réglementaire ATEX
  | Technicien assigné = inspecteur ATEX désigné
  | Priorité = Haute (non repoussable sans validation HSE)
  v
[ÉTAT : INSPECTION EN COURS]
  |
  | Technicien (inspecteur ATEX) démarre intervention
  | Affichage checklist obligatoire (exemple points) :
  |   1. Vérifier état filtres [ ] Photo : ______
  |   2. Contrôler écluse rotative [ ] Valeur : ______
  |   3. Mesurer dépression [ ] Valeur : ______ Pa
  |   4. Vérifier tresses de masse [ ] Commentaire : ______
  |   5. Contrôler évents d'explosion [ ] Photo : ______
  |   6. Vérifier étanchéité conduits [ ] Oui / Non
  |   7. Contrôler mise à la terre [ ] Valeur ohms : ______
  |   8. Nettoyage zone Ex [ ] Photo : ______
  |   9. Vérification matériel certifié Ex [ ] Liste : ______
  |  10. Rapport d'inspection signé [ ] Signature : ______
  | Chaque étape = case + valeur/photo/commentaire selon type
  | Validation étape par étape, sauvegarde progression
  v
[ÉTAT : INSPECTION À VALIDER]
  |
  | Toutes étapes obligatoires cochées (validation bloquante)
  | Signature numérique inspecteur ATEX (re-saisie mot de passe)
  | Commentaire global sur l'inspection
  | Photos joints
  v
[ÉTAT : INSPECTION VALIDÉE]
  |
  | Responsable HSE ou Responsable Maintenance valide
  | Si écart détecté (dépression faible, filtre usé, etc.) :
  |   → Création BT correctif lié à l'inspection
  |   → Date butoir corrective paramétrable
  | Date dernière inspection mise à jour sur équipement
  | Date prochaine inspection calculée (ATEX-005)
  v
[ÉTAT : ARCHIVAGE]
  |
  | Rapport d'inspection généré (PDF)
  | Stockage dans documents équipement (DOC-001)
  | Accessible pour audit DREAL / inspection réglementaire
  | Export conformité ATEX mis à jour (ATEX-010)
  v
[ÉTAT FINAL : ARCHIVÉ — Prochaine échéance active]
```

**Escalade si inspection non réalisée :**
```
J-3 → Rappel push technicien + email
J0  → Alerte rouge dashboard + email responsable
J+3 → Alerte rouge + email HSE + Direction
J+7 → Notification Direction + risque non-conformité EN 60079-17
```

**Écarts et actions correctives :**
```
Si inspection révèle non-conformité :
  → Création BT correctif avec priorité Haute
  → Catégorie "Sécurité"
  → Équipement peut être marqué "En arrêt" si risque immédiat
  → Date butoir = date inspection + délai corrective max (paramétrable)
  → Si non résolu à date butoir → escalade Direction
```

---

## 4. Modèle de Données Conceptuel

### 4.1 Entités Principales avec Attributs Clés

#### ENT-01 : `sites`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| code | VARCHAR(10) | Code site (LAG, STG, TRO, NAP, CHI) |
| nom | VARCHAR(100) | Nom du site |
| adresse | TEXT | Adresse complète |
| fuseau_horaire | VARCHAR(50) | Ex: Europe/Paris, Europe/Madrid |
| actif | BOOLEAN | Site actif/inactif |
| created_at | TIMESTAMP | Date création |
| updated_at | TIMESTAMP | Date dernière modification |

#### ENT-02 : `zones`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| site_id | UUID FK | Référence site parent |
| code | VARCHAR(10) | Code zone (ZA, ZB) |
| nom | VARCHAR(100) | Nom (Zone A — Presses + Découpe + Recuit) |
| description | TEXT | Description |
| actif | BOOLEAN | Zone active |

#### ENT-03 : `lignes`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| zone_id | UUID FK | Référence zone parent |
| code | VARCHAR(10) | Code ligne (LPR1, LLQ2) |
| nom | VARCHAR(100) | Nom (Ligne Presses n°1) |
| type | VARCHAR(50) | Type ligne (production, auxiliaire) |
| actif | BOOLEAN | Ligne active |

#### ENT-04 : `equipements`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| ligne_id | UUID FK | Référence ligne parent |
| code | VARCHAR(20) | Code unique (PR-001, LQ-002, SR-003, FR-001) |
| designation | VARCHAR(100) | Nom métier |
| type | VARCHAR(50) | Type (Presse/Laquage/Sérigraphie/Four/Compresseur/Dépoussiéreur/Convoyeur/Découpe/Emballage/Autre) |
| constructeur | VARCHAR(100) | Nom fabricant |
| numero_serie | VARCHAR(50) | N° série constructeur |
| date_mise_service | DATE | Date mise en service |
| criticite | VARCHAR(20) | Critique / Élevée / Moyenne / Faible |
| statut | VARCHAR(20) | En service / En arrêt / En maintenance / Démantelé |
| garantie_fin | DATE | Date fin garantie |
| cout_arret_horaire | DECIMAL(10,2) | €/h |
| contact_alimentaire | BOOLEAN | Oui/Non |
| zone_atex | VARCHAR(20) | Zone 20 / Zone 21 / Zone 22 / Non ATEX |
| compteur_actuel | DECIMAL(15,2) | Valeur compteur actuelle |
| unite_compteur | VARCHAR(20) | Heures / Coups / m² / Litres / etc. |
| is_archived | BOOLEAN | Flag archivage (soft delete) |
| archived_at | TIMESTAMP | Date archivage |
| archived_by | UUID FK | Utilisateur ayant archivé |
| created_at | TIMESTAMP | Date création |

#### ENT-05 : `sous_ensembles`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| equipement_id | UUID FK | Référence équipement parent |
| code | VARCHAR(30) | Code (PR-001-MAT-SUP) |
| designation | VARCHAR(100) | Nom (Matrice supérieure) |
| type | VARCHAR(50) | Type (Matrice/Pompe/Buse/Brûleur/Moteur/Ventilateur/Filtre/Autre) |

#### ENT-06 : `articles`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| reference | VARCHAR(20) | Référence unique article |
| designation | VARCHAR(100) | Nom métier |
| famille | VARCHAR(50) | Mécanique / Électrique / Pneumatique / Hydraulique / Consommable / Sécurité |
| sous_famille | VARCHAR(50) | Matrice / Buse / Pompe / Joint / Roulement / Filtre / Tampon / Écluse / Thermocouple / Brûleur / Autre |
| fournisseur | VARCHAR(100) | Fournisseur principal |
| reference_fournisseur | VARCHAR(50) | Référence fournisseur |
| prix_unitaire | DECIMAL(10,2) | € |
| stock_minimum | DECIMAL(10,2) | Seuil alerte |
| stock_maximum | DECIMAL(10,2) | Seuil trop plein |
| localisation | VARCHAR(100) | Magasin A — Étagère 3 — Bac 12 |
| code_barre | VARCHAR(50) | Code-barre / QR |
| numero_serie | VARCHAR(50) | N° série si traçable |
| is_atex | BOOLEAN | Pièce certifiée Ex |
| is_archived | BOOLEAN | Flag archivage |
| created_at | TIMESTAMP | Date création |

#### ENT-07 : `mouvements_stock`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| article_id | UUID FK | Référence article |
| type | VARCHAR(20) | Entrée / Sortie / Réservation / Transfert / Ajustement / Retour |
| quantite | DECIMAL(10,2) | Quantité (+ pour entrée, - pour sortie) |
| magasin_source | VARCHAR(50) | Pour transfert |
| magasin_destination | VARCHAR(50) | Pour transfert |
| bt_id | UUID FK | BT associé (si sortie/réservation) |
| commentaire | TEXT | Commentaire |
| numero_bl | VARCHAR(50) | N° BL pour entrée |
| user_id | UUID FK | Utilisateur ayant créé le mouvement |
| created_at | TIMESTAMP | Date/heure mouvement |
| is_synced | BOOLEAN | Flag synchronisation offline |

#### ENT-08 : `bons_travail` (BT / OT)
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| numero_bt | VARCHAR(20) | Numéro généré (ex: BT-2025-00123) |
| type_demande | VARCHAR(30) | Panne / Préventif / Amélioration / Sécurité / Réglementaire / Autre |
| demandeur_id | UUID FK | Opérateur / technicien créateur |
| equipement_id | UUID FK | Équipement concerné |
| sous_ensemble_id | UUID FK | Sous-ensemble concerné (optionnel) |
| description | TEXT | Description panne/demande |
| priorite | VARCHAR(20) | Urgente / Haute / Normale / Basse |
| statut | VARCHAR(20) | CREE / A_PLANIFIER / PLANIFIE / EN_COURS / A_CLOTURER / CLOTURE / PARTIELLEMENT_TERMINE |
| technicien_id | UUID FK | Technicien assigné |
| date_demande | TIMESTAMP | Date/heure création |
| date_planification | TIMESTAMP | Date prévue intervention |
| date_debut | TIMESTAMP | Heure début intervention |
| date_fin | TIMESTAMP | Heure fin intervention |
| temps_passe | DECIMAL(6,2) | Minutes passées (calculé auto) |
| temps_estime | DECIMAL(6,2) | Minutes estimées à la planification |
| cause_panne | VARCHAR(50) | Usure / Réglage / Surchauffe / Encrassement / Vibration / Rupture / Électrique / Pneumatique / Hydraulique / Fuite / Obstruction / Défaut automate / Autre |
| actions_realisees | TEXT | Description actions |
| type_actions | VARCHAR(50) | Remplacement / Réglage / Nettoyage / Graissage / Soudure / Usinage / Programmation / Calibrage / Inspection / Démonter / Remonter / Essai / Autre |
| commentaire_cloture | TEXT | Commentaire validation responsable |
| photos | JSONB | URLs des photos [{url, type: avant/après, uploaded_at}] |
| is_atex | BOOLEAN | Hérité équipement |
| atex_consignation | BOOLEAN | Consignation électrique effectuée |
| atex_permis_feu | VARCHAR(50) | N° permis de feu |
| atex_outillage_ex | BOOLEAN | Outillage certifié Ex utilisé |
| atex_nettoyage | BOOLEAN | Nettoyage post-intervention |
| atex_depression | DECIMAL(8,2) | Valeur dépression post-intervention |
| atex_inspecteur_id | UUID FK | Inspecteur ATEX |
| is_contact_alimentaire | BOOLEAN | Hérité équipement |
| aliment_nettoyage_valide | BOOLEAN | Nettoyage post-intervention validé |
| aliment_produits_utilises | TEXT | Références graisse, nettoyant, rinçage |
| cout_pieces | DECIMAL(10,2) | Coût total pièces consommées |
| created_at | TIMESTAMP | Date création |
| updated_at | TIMESTAMP | Date dernière modification |
| cloture_par | UUID FK | Responsable ayant clôturé |
| date_cloture | TIMESTAMP | Date clôture |
| parent_bt_id | UUID FK | BT parent si partiellement terminé |
| plan_preventif_id | UUID FK | Plan préventif ayant généré ce BT |

#### ENT-09 : `bt_pieces` (lien BT — Article)
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| bt_id | UUID FK | Référence BT |
| article_id | UUID FK | Référence article |
| quantite | DECIMAL(10,2) | Quantité consommée |
| is_atex_certifie | BOOLEAN | Pièce certifiée Ex cochée |
| mouvement_id | UUID FK | Référence mouvement stock |
| user_id | UUID FK | Technicien ayant saisi |
| created_at | TIMESTAMP | Date saisie |

#### ENT-10 : `plans_preventifs`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| nom | VARCHAR(100) | Nom du plan |
| equipement_id | UUID FK | Équipement cible |
| type_preventif | VARCHAR(30) | Temporel / Compteur / Conditionnel |
| frequence_nombre | INTEGER | Nombre (ex: 30) |
| frequence_unite | VARCHAR(20) | Jours / Semaines / Mois / Années / Heures / Coups / m² / Litres |
| base_calcul | VARCHAR(20) | Date fixe / Date dernière intervention / Compteur actuel |
| marge_alert | INTEGER | Jours avant échéance |
| technicien_id | UUID FK | Technicien assigné par défaut |
| checklist_id | UUID FK | Checklist associée |
| type_bt_genere | VARCHAR(30) | Préventif systématique / Préventif conditionnel |
| is_atex_reglementaire | BOOLEAN | Plan réglementaire ATEX |
| is_securite_reglementaire | BOOLEAN | Plan réglementaire sécurité machines |
| actif | BOOLEAN | Plan actif/inactif |
| date_derniere_intervention | DATE | Date dernière exécution |
| date_prochaine_intervention | DATE | Date prochaine échéance |
| created_at | TIMESTAMP | Date création |

#### ENT-11 : `checklists`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| nom | VARCHAR(100) | Nom checklist |
| type | VARCHAR(50) | Préventif / Contrôle ATEX / Mise en route / Sécurité machine / Inspection périodique / Autre |
| etapes | JSONB | Tableau étapes [{ordre, description, type_reponse, obligatoire, unite, commentaire_exemple}] |
| is_atex | BOOLEAN | Checklist ATEX |
| created_at | TIMESTAMP | Date création |

#### ENT-12 : `checklist_reponses`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| bt_id | UUID FK | BT associé |
| checklist_id | UUID FK | Checklist modèle |
| etape_id | INTEGER | Index étape dans le JSON |
| valeur | TEXT | Valeur saisie (coché=1, texte=valeur, photo=URL) |
| commentaire | TEXT | Commentaire |
| photo_url | VARCHAR(255) | URL photo si applicable |
| is_valide | BOOLEAN | Étape validée |
| user_id | UUID FK | Technicien |
| created_at | TIMESTAMP | Date saisie |

#### ENT-13 : `documents`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| equipement_id | UUID FK | Équipement cible (optionnel) |
| sous_ensemble_id | UUID FK | Sous-ensemble cible (optionnel) |
| titre | VARCHAR(200) | Titre document |
| description | TEXT | Description |
| type | VARCHAR(50) | Notice / Plan éclaté / Schéma électrique / Schéma pneumatique / Photo / Vidéo / Certificat / Manuel sécurité / Checklist / Mode opératoire / Autre |
| fichier_url | VARCHAR(255) | Chemin fichier local |
| version | VARCHAR(10) | Numéro version (1.0, 1.1, 2.0) |
| is_current | BOOLEAN | Version en vigueur |
| date_validite | DATE | Date de validité |
| uploaded_by | UUID FK | Utilisateur upload |
| created_at | TIMESTAMP | Date upload |

#### ENT-14 : `utilisateurs`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| nom | VARCHAR(50) | Nom |
| prenom | VARCHAR(50) | Prénom |
| email | VARCHAR(100) | Email unique |
| login | VARCHAR(50) | Login unique |
| password_hash | VARCHAR(255) | Hash bcrypt |
| role | VARCHAR(30) | Admin / Responsable / Technicien / Opérateur / Magasinier / HSE / Lecteur |
| zone_affectation | UUID FK | Zone de travail (pour techniciens) |
| is_actif | BOOLEAN | Compte actif/inactif |
| is_temp_password | BOOLEAN | Mot de passe temporaire à changer |
| gdpr_anonymized | BOOLEAN | Données anonymisées |
| created_at | TIMESTAMP | Date création |

#### ENT-15 : `compteur_releves`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| equipement_id | UUID FK | Équipement |
| valeur | DECIMAL(15,2) | Valeur relevée |
| unite | VARCHAR(20) | Unité |
| date_releve | TIMESTAMP | Date/heure relevé |
| user_id | UUID FK | Technicien ayant saisi |
| is_synced | BOOLEAN | Flag synchronisation offline |

#### ENT-16 : `audit_logs`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| table_name | VARCHAR(50) | Table concernée |
| record_id | UUID | ID enregistrement |
| action | VARCHAR(20) | CREATE / UPDATE / DELETE / READ |
| old_values | JSONB | Anciennes valeurs |
| new_values | JSONB | Nouvelles valeurs |
| user_id | UUID FK | Utilisateur |
| ip_address | VARCHAR(45) | Adresse IP |
| user_agent | VARCHAR(255) | User agent |
| created_at | TIMESTAMP | Date/heure action |

#### ENT-17 : `alertes`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| type | VARCHAR(50) | BT urgent / Préventif retard / Stock bas / Équipement arrêt / Seuil capteur / Inspection ATEX retard |
| severite | VARCHAR(20) | Info / Warning / Critical |
| titre | VARCHAR(200) | Titre alerte |
| message | TEXT | Message détaillé |
| equipement_id | UUID FK | Équipement concerné |
| bt_id | UUID FK | BT concerné |
| article_id | UUID FK | Article concerné |
| destinataires | JSONB | [{user_id, canal: push/email, envoye: bool}] |
| is_acquittee | BOOLEAN | Acquittée |
| acquittee_par | UUID FK | Utilisateur ayant acquitté |
| acquittee_at | TIMESTAMP | Date acquittement |
| created_at | TIMESTAMP | Date création |

#### ENT-18 : `connexion_logs`
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Identifiant unique |
| user_id | UUID FK | Utilisateur |
| ip_address | VARCHAR(45) | IP |
| user_agent | VARCHAR(255) | Navigateur |
| success | BOOLEAN | Connexion réussie |
| failure_reason | VARCHAR(100) | Raison échec (si applicable) |
| created_at | TIMESTAMP | Date/heure |

---

### 4.2 Relations entre Entités

```
sites (1) ────────< (N) zones
zones (1) ────────< (N) lignes
lignes (1) ───────< (N) equipements
equipements (1) ──< (N) sous_ensembles
equipements (1) ──< (N) bons_travail
equipements (1) ──< (N) documents
equipements (1) ──< (N) compteur_releves
equipements (1) ──< (N) plans_preventifs

utilisateurs (1) ─< (N) bons_travail (demandeur)
utilisateurs (1) ─< (N) bons_travail (technicien)
utilisateurs (1) ─< (N) bons_travail (cloture_par)
utilisateurs (1) ─< (N) audit_logs
utilisateurs (1) ─< (N) mouvements_stock
utilisateurs (1) ─< (N) connexion_logs

bons_travail (1) ─< (N) bt_pieces
bons_travail (1) ─< (N) checklist_reponses
bons_travail (1) ─< (N) alertes
bons_travail (1) ─── (1) plans_preventifs (optionnel, si préventif)

articles (1) ─────< (N) bt_pieces
articles (1) ─────< (N) mouvements_stock
articles (1) ─────< (N) alertes

plans_preventifs (1) ─ (N) bons_travail (générés)
plans_preventifs (1) ── (1) checklists (optionnel)
plans_preventifs (1) ── (1) equipements

checklists (1) ───< (N) checklist_reponses

documents (1) ───── (1) equipements (optionnel)
documents (1) ───── (1) sous_ensembles (optionnel)
```

**Relations N-M explicites :**
- `equipements` <-> `articles` : relation implicite via `equipement_id` dans `articles` (1 équipement peut avoir N articles, 1 article peut être lié à N équipements — en V1, relation simplifiée 1-N avec champ `equipements_associes` JSONB dans `articles` pour future extension N-M).

---

### 4.3 Contraintes d'Intégrité Importantes

1. **CI-001** — Unicité `equipements.code` : INDEX UNIQUE sur `equipements.code` (non null).
2. **CI-002** — Unicité `articles.reference` : INDEX UNIQUE sur `articles.reference` (non null).
3. **CI-003** — Unicité `utilisateurs.email` et `utilisateurs.login` : INDEX UNIQUE.
4. **CI-004** — Arborescence cohérente : `zones.site_id` doit référencer un site actif. `lignes.zone_id` doit référencer une zone active. `equipements.ligne_id` doit référencer une ligne active.
5. **CI-005** — Statut BT : CHECK CONSTRAINT sur `bons_travail.statut` (valeurs enum autorisées).
6. **CI-006** — Priorité BT : CHECK CONSTRAINT sur `bons_travail.priorite` (valeurs enum).
7. **CI-007** — Criticité équipement : CHECK CONSTRAINT sur `equipements.criticite`.
8. **CI-008** — Zone ATEX : CHECK CONSTRAINT sur `equipements.zone_atex`.
9. **CI-009** — Type mouvement stock : CHECK CONSTRAINT sur `mouvements_stock.type`.
10. **CI-010** — Stock non négatif : TRIGGER ou application logic garantissant que la somme des mouvements par article ne devient jamais négative (sauf override responsable avec audit).
11. **CI-011** — Date clôture > Date début > Date planification > Date demande : application logic validation.
12. **CI-012** — Un seul BT "En cours" par technicien : application logic (UNIQUE sur `(technicien_id, statut)` filtré sur `statut = 'EN_COURS'`).
13. **CI-013** — Soft delete : `is_archived` = true interdit toute modification sauf restauration par admin.
14. **CI-014** — Plan préventif ATEX actif : interdiction de suppression (`actif` = true et `is_atex_reglementaire` = true) sans validation HSE.
15. **CI-015** — Checklist ATEX : si `checklists.is_atex` = true, minimum 10 étapes obligatoires (application logic).

---

## 5. Spécifications API REST (Endpoints Principaux)

**Base URL :** `https://<serveur-usine>/api/v1`
**Authentification :** Header `Authorization: Bearer <JWT_TOKEN>`
**Format :** JSON, UTF-8
**Pagination :** Paramètres `?page=1&limit=30` (défaut limit=30, max=100)
**Tri :** Paramètre `?sort=champ&order=asc|desc`
**Filtres :** Paramètres `?statut=EN_COURS&priorite=URGENTE`

---

### Module 1 — Actifs / Équipements

| Méthode | URL | Description | Paramètres | Réponse |
|---------|-----|-------------|------------|---------|
| GET | `/sites` | Liste des sites | `actif` (bool) | `{data: [...], meta: {page, limit, total}}` |
| POST | `/sites` | Créer un site | Body JSON `{code, nom, adresse, fuseau_horaire}` | `{id, code, nom, ...}` |
| GET | `/sites/:id` | Détail site | — | Site + zones associées |
| PUT | `/sites/:id` | Modifier site | Body JSON | Site modifié |
| DELETE | `/sites/:id` | Archiver site | — | `{archived: true}` |
| GET | `/zones` | Liste zones | `site_id`, `actif` | Liste paginée |
| POST | `/zones` | Créer zone | Body JSON | Zone créée |
| GET | `/zones/:id` | Détail zone | — | Zone + lignes |
| PUT | `/zones/:id` | Modifier zone | Body JSON | Zone modifiée |
| DELETE | `/zones/:id` | Archiver zone | — | Zone archivée |
| GET | `/lignes` | Liste lignes | `zone_id`, `actif` | Liste paginée |
| POST | `/lignes` | Créer ligne | Body JSON | Ligne créée |
| GET | `/lignes/:id` | Détail ligne | — | Ligne + équipements |
| PUT | `/lignes/:id` | Modifier ligne | Body JSON | Ligne modifiée |
| DELETE | `/lignes/:id` | Archiver ligne | — | Ligne archivée |
| GET | `/equipements` | Liste équipements | `zone_id`, `ligne_id`, `criticite`, `statut`, `zone_atex`, `contact_alimentaire`, `q` (recherche) | Liste paginée avec badges |
| POST | `/equipements` | Créer équipement | Body JSON `{code, designation, type, ...}` | Équipement créé + QR URL |
| GET | `/equipements/:id` | Détail équipement | — | Fiche complète + sous-ensembles + documents + historique BT (50 derniers) + compteur + prochaine inspection ATEX |
| PUT | `/equipements/:id` | Modifier équipement | Body JSON | Équipement modifié + audit log |
| DELETE | `/equipements/:id` | Archiver équipement | — | Archivage + cascade soft delete sous-ensembles |
| GET | `/equipements/:id/historique` | Historique BT | `type`, `periode_debut`, `periode_fin`, `limit` | Liste BT chronologique |
| GET | `/equipements/:id/qr` | Générer QR code | `format` (png/svg), `size` | Fichier binaire QR |
| POST | `/equipements/qr-batch` | Générer QR codes lot | Body `{equipement_ids: [...], format, size}` | PDF A4 |
| GET | `/equipements/:id/documents` | Documents équipement | `type`, `is_current` | Liste documents |
| GET | `/equipements/scan/:qrCode` | Résoudre QR code | `qrCode` (string) | Équipement ou redirection |
| POST | `/equipements/:id/compteur` | Saisir compteur | Body `{valeur, unite, date_releve}` | Relevé créé + alertes seuils |
| GET | `/equipements/:id/compteur/historique` | Historique compteur | `limit` | Liste relevés |
| GET | `/equipements/atex` | Filtrer équipements ATEX | `zone_atex` | Liste équipements ATEX |
| POST | `/equipements/:id/sous-ensembles` | Créer sous-ensemble | Body JSON | Sous-ensemble créé |
| GET | `/equipements/:id/sous-ensembles` | Liste sous-ensembles | — | Liste |
| PUT | `/sous-ensembles/:id` | Modifier sous-ensemble | Body JSON | Modifié |
| DELETE | `/sous-ensembles/:id` | Archiver sous-ensemble | — | Archivé |

### Module 2 — Bons de Travail

| Méthode | URL | Description | Paramètres | Réponse |
|---------|-----|-------------|------------|---------|
| GET | `/bt` | Liste BT | `statut`, `priorite`, `zone`, `technicien_id`, `equipement_id`, `type`, `periode_debut`, `periode_fin`, `q` (recherche full-text), `mes_bt` (bool, pour technicien) | Liste paginée avec couleurs statut |
| POST | `/bt` | Créer BT | Body JSON `{type_demande, equipement_id, description, priorite, photos[], demandeur_id, ...}` | BT créé + notification push |
| GET | `/bt/:id` | Détail BT | — | Fiche BT complète + pièces consommées + checklist réponses + photos + sécurité ATEX + chronologie workflow |
| PUT | `/bt/:id` | Modifier BT (création/planification) | Body JSON | BT modifié (champs modifiables selon statut) |
| POST | `/bt/:id/transition` | Transition workflow | Body `{nouveau_statut, commentaire, technicien_id, date_planification}` | BT avec nouveau statut + audit log + notification |
| POST | `/bt/:id/demarrer` | Démarrer intervention (shortcut) | Body `{date_debut}` (auto si absent) | BT EN_COURS + chrono démarré + notif |
| POST | `/bt/:id/pause` | Mettre en pause | Body `{motif}` | BT EN_COURS + log pause |
| POST | `/bt/:id/reprendre` | Reprendre intervention | — | BT EN_COURS + log reprise |
| POST | `/bt/:id/terminer` | Terminer intervention | Body `{date_fin, causes, actions, commentaire, photos[]}` | BT A_CLOTURER + temps calculé |
| POST | `/bt/:id/cloturer` | Clôturer BT (responsable) | Body `{commentaire_cloture, valide: true/false}` | BT CLOTURE ou rouvert |
| POST | `/bt/:id/rouvrir` | Rouvrir BT | Body `{motif, nouveau_statut}` | BT réouvert |
| POST | `/bt/:id/pieces` | Ajouter pièce consommée | Body `{article_id, quantite, is_atex_certifie}` | Pièce ajoutée + mouvement stock |
| GET | `/bt/:id/pieces` | Liste pièces BT | — | Liste avec détails articles |
| DELETE | `/bt/:id/pieces/:pieceId` | Retirer pièce | — | Suppression mouvement + stock rétabli |
| POST | `/bt/:id/checklist` | Exécuter checklist | Body `{checklist_id, reponses: [{etape_id, valeur, commentaire, photo_url}]}` | Réponses enregistrées + validation |
| GET | `/bt/:id/checklist` | Lire checklist BT | — | Checklist avec réponses |
| POST | `/bt/:id/commentaire` | Ajouter commentaire | Body `{texte, photos[]}` | Commentaire ajouté |
| GET | `/bt/:id/commentaires` | Lire commentaires | — | Liste chronologique |
| GET | `/bt/:id/timeline` | Chronologie BT | — | Liste transitions avec timestamps et acteurs |
| POST | `/bt/:id/dupliquer` | Dupliquer BT | — | Nouveau BT pré-rempli |
| GET | `/bt/kanban` | Vue Kanban | `zone`, `technicien_id`, `periode` | BT regroupés par statut |
| GET | `/bt/calendrier` | Vue Calendrier | `debut`, `fin`, `zone`, `technicien_id` | BT avec dates planifiées |
| GET | `/bt/export` | Export Excel | `periode_debut`, `periode_fin`, `format` (xlsx/csv) | Fichier binaire |
| GET | `/bt/mes-demandes` | Suivi opérateur | — | BT créés par l'utilisateur connecté |
| POST | `/bt/:id/photos` | Upload photo BT | Body multipart `{photo, type: avant/apres}` | Photo uploadée + URL |
| GET | `/bt/:id/photos` | Liste photos | — | URLs photos |

### Module 3 — Maintenance Préventive

| Méthode | URL | Description | Paramètres | Réponse |
|---------|-----|-------------|------------|---------|
| GET | `/plans-preventifs` | Liste plans | `equipement_id`, `actif`, `type_preventif` | Liste paginée |
| POST | `/plans-preventifs` | Créer plan | Body JSON `{nom, equipement_id, type_preventif, frequence_nombre, frequence_unite, base_calcul, marge_alert, technicien_id, checklist_id, is_atex_reglementaire, ...}` | Plan créé + date prochaine calculée |
| GET | `/plans-preventifs/:id` | Détail plan | — | Plan + BT générés + historique |
| PUT | `/plans-preventifs/:id` | Modifier plan | Body JSON | Plan modifié (recalcul échéances si fréquence changée) |
| DELETE | `/plans-preventifs/:id` | Désactiver plan | — | Désactivation + annulation BT non démarrés |
| POST | `/plans-preventifs/:id/generer-bt` | Génération manuelle BT | — | BT préventif créé |
| GET | `/plans-preventifs/echeances` | Échéances à venir | `jours` (7 ou 30), `zone`, `technicien_id` | Liste préventifs avec code couleur |
| GET | `/plans-preventifs/taux-realisation` | Taux réalisation | `periode_debut`, `periode_fin`, `equipement_id`, `zone` | Taux % + détail |
| POST | `/plans-preventifs/:id/reporter` | Reporter échéance | Body `{nouvelle_date, motif}` | Report enregistré + compteur reports |
| GET | `/preventifs/conditionnels` | Liste plans conditionnels | `equipement_id` | Seuils et états |
| POST | `/preventifs/conditionnels/:id/verifier` | Vérifier seuil | Body `{valeur_relevee, date_releve}` | Alerte si seuil dépassé |

### Module 4 — Stocks

| Méthode | URL | Description | Paramètres | Réponse |
|---------|-----|-------------|------------|---------|
| GET | `/articles` | Liste articles | `famille`, `sous_famille`, `equipement_id`, `alerte_stock` (min/max), `q` | Liste avec stock temps réel |
| POST | `/articles` | Créer article | Body JSON `{reference, designation, famille, stock_minimum, stock_maximum, localisation, ...}` | Article créé + QR URL |
| GET | `/articles/:id` | Détail article | — | Fiche + stock physique + disponible + historique mouvements |
| PUT | `/articles/:id` | Modifier article | Body JSON | Article modifié |
| DELETE | `/articles/:id` | Archiver article | — | Archivage (si pas de mouvements récents) |
| GET | `/articles/:id/qr` | QR code article | `format` | Fichier binaire |
| POST | `/articles/:id/mouvements` | Créer mouvement | Body `{type, quantite, magasin_source, magasin_destination, bt_id, commentaire, numero_bl}` | Mouvement créé + stock mis à jour |
| GET | `/articles/:id/mouvements` | Historique mouvements | `type`, `periode_debut`, `periode_fin`, `limit` | Liste mouvements |
| GET | `/articles/scan/:qrCode` | Résoudre QR article | `qrCode` | Article |
| GET | `/stocks/alertes` | Alertes stock | `severite`, `famille`, `equipement_id` | Liste alertes actives |
| POST | `/stocks/alertes/:id/acquitter` | Acquitter alerte | — | Alerté marquée acquittée |
| GET | `/stocks/inventaire` | Liste inventaire | `zone`, `famille`, `magasin` | Liste articles à inventorier |
| POST | `/stocks/inventaire` | Saisie inventaire | Body `{lignes: [{article_id, quantite_reelle}]}]` | Écarts calculés |
| POST | `/stocks/inventaire/:id/valider` | Valider ajustement | Body `{ecarts_valides: [...]}` | Mouvements ajustement créés |
| GET | `/stocks/export` | Export stock | `format` (xlsx/csv) | Fichier binaire |
| GET | `/stocks/pieces-dormantes` | Pièces dormantes | `mois` (défaut 24) | Liste avec valeur stockée |

### Module 5 — Documentation

| Méthode | URL | Description | Paramètres | Réponse |
|---------|-----|-------------|------------|---------|
| GET | `/documents` | Liste documents | `equipement_id`, `type`, `q` | Liste paginée |
| POST | `/documents` | Upload document | Body multipart `{fichier, equipement_id, type, titre, description, date_validite}` | Document créé + URL |
| GET | `/documents/:id` | Détail document | — | Métadonnées + URL consultation |
| GET | `/documents/:id/fichier` | Télécharger fichier | — | Fichier binaire (streaming) |
| PUT | `/documents/:id` | Modifier métadonnées | Body JSON | Document modifié |
| POST | `/documents/:id/nouvelle-version` | Upload nouvelle version | Body multipart `{fichier, commentaire_version}` | Version incrémentée + ancienne archivée |
| DELETE | `/documents/:id` | Archiver document | — | Archivage (si pas lié à BT clôturé) |
| GET | `/documents/:id/historique-consultations` | Historique lectures | — | Liste `user_id, date` |
| GET | `/checklists` | Liste checklists | `type`, `is_atex` | Liste |
| POST | `/checklists` | Créer checklist | Body `{nom, type, etapes: [...]}` | Checklist créée |
| GET | `/checklists/:id` | Détail checklist | — | Checklist avec étapes |
| PUT | `/checklists/:id` | Modifier checklist | Body JSON | Checklist modifiée |
| DELETE | `/checklists/:id` | Supprimer checklist | — | Suppression (si pas liée à plan actif) |
| POST | `/checklists/:id/dupliquer` | Dupliquer checklist | — | Nouvelle checklist copie |

### Module 6 — Reporting & KPIs

| Méthode | URL | Description | Paramètres | Réponse |
|---------|-----|-------------|------------|---------|
| GET | `/dashboard/technicien` | Dashboard tech | `date` | Widgets jour/semaine |
| GET | `/dashboard/responsable` | Dashboard resp. | `periode`, `zone` | Widgets semaine/mois |
| GET | `/dashboard/direction` | Dashboard direction | `periode` (mois/trimestre/annee) | Widgets stratégiques |
| GET | `/kpi/mttr` | Calcul MTTR | `periode_debut`, `periode_fin`, `equipement_id`, `zone` | Valeur + détail calcul |
| GET | `/kpi/mtbf` | Calcul MTBF | `periode_debut`, `periode_fin`, `equipement_id`, `zone` | Valeur + détail calcul |
| GET | `/kpi/taux-preventif` | Taux préventif | `periode_debut`, `periode_fin`, `zone` | Pourcentage |
| GET | `/kpi/disponibilite` | Disponibilité | `periode_debut`, `periode_fin`, `equipement_id`, `zone` | Pourcentage |
| GET | `/kpi/couts` | Coûts maintenance | `periode_debut`, `periode_fin`, `equipement_id`, `zone` | Montant + détail |
| GET | `/kpi/temps-reponse` | Temps réponse | `periode_debut`, `periode_fin`, `zone` | Moyenne minutes |
| GET | `/kpi/respect-preventif` | Respect plan | `periode_debut`, `periode_fin`, `zone` | Pourcentage |
| GET | `/kpi/ruptures-critiques` | Ruptures stock | `periode_debut`, `periode_fin` | Nombre |
| GET | `/kpi/pareto-pannes` | Pareto causes | `periode_debut`, `periode_fin`, `zone` | Graphique données + top 10 |
| GET | `/kpi/comparaison-periode` | Évolution N/N-1 | `periode_debut`, `periode_fin` | Comparaison mensuelle |
| GET | `/rapports/mensuel` | Rapport mensuel | `mois`, `annee` | PDF généré ou URL |
| POST | `/rapports/mensuel/generer` | Générer rapport mensuel | Body `{mois, annee, destinataires_emails[]}` | PDF + envoi email |
| GET | `/rapports/export` | Export données | `type` (bt/stocks/compteurs), `periode_debut`, `periode_fin`, `format` (xlsx/pdf) | Fichier binaire |

### Module 7 — Portail Opérateur

| Méthode | URL | Description | Paramètres | Réponse |
|---------|-----|-------------|------------|---------|
| GET | `/portail/accueil` | Accueil opérateur | — | Minimal (boutons scan + mes demandes) |
| POST | `/portail/declarer-panne` | Déclaration rapide | Body `{qr_code, description, type_incident, photo, priorite}` | BT créé + confirmation |
| GET | `/portail/mes-demandes` | Mes demandes | — | Liste BT de l'opérateur |
| GET | `/portail/mes-demandes/:id` | Détail demande | — | BT détaillé |
| POST | `/portail/confirm-reprise` | Confirmer reprise | Body `{bt_id}` | Confirmation enregistrée |
| POST | `/portail/ajouter-info` | Info complémentaire | Body `{bt_id, texte, photo}` | Commentaire ajouté |
| GET | `/portail/equipement/:qrCode` | Résoudre QR | `qrCode` | Info équipement minimal |

### Module 8 — Administration & Sécurité

| Méthode | URL | Description | Paramètres | Réponse |
|---------|-----|-------------|------------|---------|
| POST | `/auth/login` | Connexion | Body `{login, password}` | `{token, refresh_token, user}` |
| POST | `/auth/refresh` | Rafraîchir token | Body `{refresh_token}` | `{token}` |
| POST | `/auth/logout` | Déconnexion | Header Bearer | `{deconnected: true}` |
| POST | `/auth/reset-password` | Demande réinit. | Body `{email}` | Email envoyé |
| POST | `/auth/reset-password/:token` | Confirmer réinit. | Body `{nouveau_mot_de_passe}` | Mot de passe changé |
| GET | `/utilisateurs` | Liste utilisateurs | `role`, `actif`, `zone` | Liste paginée |
| POST | `/utilisateurs` | Créer utilisateur | Body `{nom, prenom, email, login, role, zone_affectation}` | User créé + email identifiants |
| GET | `/utilisateurs/:id` | Détail utilisateur | — | User + activité |
| PUT | `/utilisateurs/:id` | Modifier utilisateur | Body JSON | User modifié |
| POST | `/utilisateurs/:id/activer` | Activer compte | — | Compte activé |
| POST | `/utilisateurs/:id/desactiver` | Désactiver compte | — | Compte désactivé |
| POST | `/utilisateurs/:id/reinit-password` | Réinit mot de passe admin | — | Email envoyé |
| GET | `/roles/permissions` | Matrice permissions | — | Table rôles × modules × actions |
| PUT | `/roles/:role/permissions` | Modifier permissions | Body `{permissions: [...]}` | Matrice mise à jour |
| GET | `/parametrage/types-bt` | Liste types BT | — | Liste |
| POST | `/parametrage/types-bt` | Ajouter type BT | Body `{libelle, ordre}` | Type ajouté |
| PUT | `/parametrage/types-bt/:id` | Modifier type BT | Body JSON | Type modifié |
| DELETE | `/parametrage/types-bt/:id` | Supprimer type BT | — | Suppression (soft) |
| GET | `/parametrage/causes-pannes` | Liste causes | — | Liste |
| POST | `/parametrage/causes-pannes` | Ajouter cause | Body `{libelle, ordre}` | Cause ajoutée |
| PUT | `/parametrage/causes-pannes/:id` | Modifier cause | Body JSON | Cause modifiée |
| DELETE | `/parametrage/causes-pannes/:id` | Supprimer cause | — | Suppression (soft) |
| GET | `/parametrage/actions` | Liste actions | — | Liste |
| POST | `/parametrage/actions` | Ajouter action | Body `{libelle, ordre}` | Action ajoutée |
| PUT | `/parametrage/actions/:id` | Modifier action | Body JSON | Action modifiée |
| DELETE | `/parametrage/actions/:id` | Supprimer action | — | Suppression (soft) |
| GET | `/parametrage/unites-compteur` | Liste unités | — | Liste |
| POST | `/parametrage/unites-compteur` | Ajouter unité | Body `{libelle, symbole}` | Unité ajoutée |
| GET | `/parametrage/familles-articles` | Liste familles | — | Arbre famille/sous-famille |
| POST | `/parametrage/familles-articles` | Ajouter famille | Body `{libelle, parent_id}` | Famille ajoutée |
| PUT | `/parametrage/familles-articles/:id` | Modifier famille | Body JSON | Famille modifiée |
| DELETE | `/parametrage/familles-articles/:id` | Supprimer famille | — | Suppression (soft, si pas d'articles) |
| GET | `/parametrage/codification` | Codification équipement | — | Regex active |
| PUT | `/parametrage/codification` | Modifier codification | Body `{regex, exemple}` | Codification modifiée |
| GET | `/parametrage/seuils-alertes` | Seuils globaux | — | Configuration alertes |
| PUT | `/parametrage/seuils-alertes` | Modifier seuils | Body `{jours_preventif, minutes_urgence, heures_arret, pct_depassement}` | Seuils modifiés |
| GET | `/audit/logs` | Audit trail | `table`, `action`, `user_id`, `periode_debut`, `periode_fin`, `q` | Liste paginée |
| GET | `/audit/logs/:id` | Détail log | — | Log complet (old/new values) |
| GET | `/audit/export` | Export audit | `periode_debut`, `periode_fin`, `format` (xlsx/pdf) | Fichier binaire |
| GET | `/audit/connexions` | Logs connexion | `user_id`, `success`, `periode` | Liste paginées |
| POST | `/admin/sauvegarde` | Lancer sauvegarde manuelle | — | `{sauvegarde_id, etat}` |
| GET | `/admin/sauvegardes` | Liste sauvegardes | — | Liste avec dates, tailles |
| POST | `/admin/sauvegardes/:id/restaurer` | Restaurer base | — | Restauration lancée |
| GET | `/admin/etat-systeme` | État système | — | Disque, mémoire, DB, dernière sauvegarde |
| POST | `/admin/anonymiser/:userId` | Anonymiser utilisateur | — | User anonymisé |

### Webhook / Intégration (Phase 2)

| Méthode | URL | Description | Paramètres |
|---------|-----|-------------|------------|
| POST | `/webhook/compteurs` | Réception compteur SCADA | Body `{equipement_code, valeur, unite, timestamp}` |
| POST | `/webhook/alarmes` | Réception alarme SCADA | Body `{equipement_code, code_alarme, niveau, message, timestamp}` |

---

**Codes HTTP :**
- `200 OK` — Succès
- `201 Created` — Création réussie
- `400 Bad Request` — Données invalides (détails dans body `{errors: [...]}`)
- `401 Unauthorized` — Token manquant ou invalide
- `403 Forbidden` — Permission insuffisante
- `404 Not Found` — Ressource inexistante
- `409 Conflict` — Conflit métier (transition interdite, stock insuffisant, etc.)
- `422 Unprocessable Entity` — Validation échouée (champs ATEX manquants, etc.)
- `500 Internal Server Error` — Erreur serveur

---

## 6. Spécifications PWA / Mode Hors-Ligne

### 6.1 Architecture PWA — Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVIGATEUR (Chrome/Safari/Edge)          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ Service  │  │ IndexedDB│  │ Cache API│                │
│  │ Worker   │  │ (données)│  │ (assets) │                │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                │
│       │             │             │                       │
│       └─────────────┴─────────────┘                       │
│                     │                                       │
│              ┌──────▼──────┐                              │
│              │  App Shell  │  ← React/Vue PWA             │
│              │  (HTML/CSS/ │    Offline-first              │
│              │   JS cache) │                               │
│              └──────┬──────┘                              │
└─────────────────────┼───────────────────────────────────────┘
                      │ API REST (HTTPS) — quand online
┌─────────────────────▼───────────────────────────────────────┐
│              SERVEUR LOCAL (usine)                           │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │ Node.js │  │  PostgreSQL  │  │ Stockage fichiers   │    │
│  │ FastAPI │  │   + JSONB    │  │ /var/gmao/uploads   │    │
│  │ (API)   │  │              │  │                     │    │
│  └─────────┘  └──────────────┘  └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Données Synchronisées

| Données | Direction Sync | Fréquence | Stockage local | Taille estimée |
|---------|---------------|-----------|----------------|----------------|
| Fiches équipements (pilote) | Serveur → Client | Au login + toutes les 2h | IndexedDB | ~50 Ko / équipement × 50 = 2,5 Mo |
| Articles stock critiques | Serveur → Client | Au login + toutes les 2h | IndexedDB | ~5 Ko / article × 50 = 250 Ko |
| Documents techniques (PDF) | Serveur → Client | À la demande + préchargement | Cache API | ~500 Ko - 5 Mo selon doc |
| Checklists préventives | Serveur → Client | Au login + changement checklist | IndexedDB | ~10 Ko / checklist × 20 = 200 Ko |
| BT en cours / planifiés du technicien | Serveur → Client | Au login + toutes les 5 min | IndexedDB | ~20 Ko / BT × 10 = 200 Ko |
| Création BT (opérateur/tech) | Client → Serveur | Immédiate si online, différé si offline | IndexedDB (queue) | ~50 Ko max |
| Exécution BT (temps, pièces, photos) | Client → Serveur | Immédiate si online, différé si offline | IndexedDB (queue) | ~1 Mo max (photos) |
| Saisie compteur | Client → Serveur | Immédiate ou différé | IndexedDB (queue) | ~1 Ko |
| Mouvements stock | Client → Serveur | Immédiate ou différé | IndexedDB (queue) | ~2 Ko |
| Inventaire physique | Client → Serveur | Différé (toujours offline-friendly) | IndexedDB (queue) | ~10 Ko |
| Photos BT | Client → Serveur | Différé avec compression | IndexedDB (queue) | ~500 Ko/photo |

### 6.3 Déclencheurs de Synchronisation

1. **Au démarrage de l'application** (event `load`) :
   - Vérification connectivité (ping `/api/v1/health`).
   - Si online : sync montante (queue client → serveur) PUIS sync descendante (serveur → client).
   - Si offline : chargement depuis IndexedDB uniquement.

2. **Toutes les 5 minutes** (timer background via Service Worker) :
   - Si online et queue non vide : sync montante (BT, mouvements, photos).
   - Sync descendante limitée (BT en cours modifiés, alertes nouvelles).

3. **À chaque action utilisateur** (création BT, saisie temps, etc.) :
   - Tentative immédiate d'envoi.
   - Si échec (offline) : stockage queue IndexedDB + notification "Sauvegardé localement — sync différée".
   - Si succès : suppression de la queue + confirmation.

4. **Retour connexion** (event `online` du navigateur) :
   - Déclenchement automatique sync montante complète.
   - Notification push visuelle : "Connexion retrouvée — synchronisation en cours...".
   - Barre de progression si gros volume (photos).

5. **À la demande** (bouton "Synchroniser maintenant") :
   - Disponible pour le technicien dans les paramètres.
   - Force sync complète montante + descendante.

6. **À la planification** (responsable) :
   - Sync descendante pour pousser les nouveaux BT planifiés vers les techniciens.

### 6.4 Gestion des Conflits

**Scénario 1 : Même BT modifié offline par 2 personnes**

```
Contexte :
- Technicien A modifie un BT offline (ajoute une pièce consommée)
- Technicien B modifie le même BT offline (ajoute une photo)
- Les deux reviennent online et synchronisent

Résolution :
1. Le serveur reçoit les deux modifications en quasi-simultané
2. Pour les champs indépendants (pièces, photos, commentaires) :
   → Fusion automatique : les deux modifications sont conservées
3. Pour les champs dépendants (statut, temps) :
   → Règle "last write wins" avec validation serveur
   → Si conflit de statut (A passe EN_COURS, B aussi) :
     → Le serveur accepte le premier arrivé, rejette le second
     → Notification au second : "Ce BT a été modifié par un autre utilisateur. Rechargez la page."
   → Si conflit temps (A saisit 2h, B saisit 1h30) :
     → Conservation de la valeur la plus récente (timestamp device)
     → Flag "conflit résolu" dans l'historique audit

Implémentation technique :
- Chaque modification offline stocke un `device_timestamp` (horloge locale)
- Sync : envoi avec `device_timestamp` + `previous_server_version`
- Serveur compare `previous_server_version` avec version actuelle en base
- Si versions identiques → merge ou acceptation
- Si versions différentes → résolution par règles métier + notification
```

**Scénario 2 : Stock modifié offline par 2 techniciens**

```
Contexte :
- Technicien A consomme 2 joints offline (stock théorique : 10)
- Technicien B consomme 3 joints offline (stock théorique : 10)
- Les deux reviennent online

Résolution :
- Le serveur reçoit : A=-2, B=-3
- Traitement séquentiel (ordre d'arrivée) :
  1. A arrivé en premier : stock passe à 8
  2. B arrive ensuite : stock passe à 5
  3. Pas d'erreur car 10 - 2 - 3 = 5 ≥ 0
- Si résultat négatif (ex: A=-7, B=-5) :
  → Acceptation de A (7 restant)
  → Rejet de B avec alerte "Stock insuffisant — seulement 7 unités disponibles"
  → Notification au responsable + technicien B
```

**Scénario 3 : Création BT offline par opérateur et responsable planifie online**

```
Résolution :
- Opérateur crée BT offline (ID temporaire client `BT-LOCAL-001`)
- Sync : envoi au serveur avec ID temporaire
- Serveur crée BT réel avec ID serveur `BT-2025-00123`
- Réponse au client : mapping `BT-LOCAL-001 → BT-2025-00123`
- Client met à jour ses références locales
- Responsable peut ensuite planifier `BT-2025-00123` normalement
```

### 6.5 Stratégies de Cache (Service Worker)

| Ressource | Stratégie | Justification |
|-----------|-----------|---------------|
| App Shell (HTML/CSS/JS) | Cache-First + réseau en fallback | Application doit démarrer offline |
| API GET (équipements, articles, BT) | Network-First → Cache si offline | Données fraîches, fallback local |
| API POST/PUT (création, saisie) | Network-First → Queue IndexedDB si offline | Données critiques, pas de perte |
| Documents PDF/Images | Cache-First + réseau en background | Gros fichiers, lecture fréquente |
| Photos upload | Queue IndexedDB → envoi différé | Photos lourdes, pas de blocage UI |
| Fonts / Icons | Cache-First | Ressources statiques |

### 6.6 Stockage IndexedDB — Schéma

```javascript
// Structure des object stores IndexedDB (nom: "gmao_simply-gmao_db", version: 1)

{
  "equipements": {        // Clé: id (UUID), Index: code
    id, code, designation, type, zone, criticite, statut,
    atex_zone, contact_alimentaire, compteur, unite,
    documents_count, last_synced
  },
  "articles": {         // Clé: id (UUID), Index: reference
    id, reference, designation, famille, stock_physique,
    stock_disponible, stock_minimum, localisation, qrcode,
    last_synced
  },
  "bons_travail": {     // Clé: id (UUID ou temporaire "local_"), Index: statut
    id, numero_bt, type, statut, equipement_id, technicien_id,
    description, priorite, date_demande, date_debut, date_fin,
    temps_passe, cause_panne, actions, atex_data, pieces_consumees[],
    photos[], checklist_reponses[], is_dirty, sync_status
  },
  "checklists": {       // Clé: id (UUID)
    id, nom, type, etapes[], last_synced
  },
  "mouvements_queue": { // Clé: auto-increment
    id, type (entree/sortie/reservation/ajustement),
    article_id, quantite, bt_id, commentaire, timestamp_local,
    sync_status (pending/synced/failed), error_message
  },
  "photos_queue": {     // Clé: auto-increment
    id, bt_id, photo_blob, type (avant/apres), timestamp_local,
    compression_done, sync_status
  },
  "audit_local": {      // Clé: auto-increment
    id, action, table, record_id, timestamp_local, data
  },
  "compteurs_queue": {  // Clé: auto-increment
    id, equipement_id, valeur, unite, timestamp_local, sync_status
  },
  "documents_cache": {  // Clé: id (UUID), Index: equipement_id
    id, equipement_id, titre, type, blob, url, version,
    cached_at, is_current
  }
}
```

### 6.7 Quelles Fonctionnalités Marchent Hors-Ligne ?

| Fonctionnalité | Mode Hors-Ligne | Mode Online |
|----------------|-----------------|-------------|
| Scanner QR équipement | **Oui** (si fiche préchargée) | Oui |
| Consulter fiche équipement | **Oui** (si préchargée) | Oui |
| Créer BT (opérateur) | **Oui** (stocké localement) | Oui (envoi immédiat) |
| Exécuter BT (chrono, causes, actions) | **Oui** (stocké localement) | Oui |
| Saisir pièces consommées | **Oui** (si article préchargé) | Oui |
| Exécuter checklist | **Oui** (stocké localement) | Oui |
| Prendre photo | **Oui** (stockée localement, upload différé) | Oui |
| Consulter documents techniques | **Oui** (si préchargés) | Oui + nouveaux |
| Saisir compteur | **Oui** (stocké localement) | Oui |
| Inventaire physique | **Oui** (stocké localement) | Oui |
| Planification Kanban | **Non** (nécessite données temps réel) | Oui |
| Dashboard / Reporting | **Non** (nécessite calcul serveur) | Oui |
| Gestion utilisateurs | **Non** | Oui |
| Export Excel/PDF | **Non** | Oui |
| Validation clôture BT | **Non** (nécessite responsable) | Oui |
| Alerte temps réel | **Non** (push nécessite réseau) | Oui |

### 6.8 Quelles Fonctionnalités Nécessitent le Réseau ?

1. **Planification et affectation** : vue Kanban, calendrier, glisser-déposer.
2. **Validation clôture** : transition vers CLOTURE par le responsable.
3. **Dashboard et KPIs** : calculs serveur, agrégations.
4. **Notifications push** : envoi temps réel (Service Worker push nécessite connexion).
5. **Export rapports** : génération PDF/Excel côté serveur.
6. **Administration** : CRUD utilisateurs, paramétrage, sauvegarde.
7. **Première connexion / authentification** : validation JWT nécessite serveur.
8. **QR code inconnu** : si fiche non préchargée, nécessite requête serveur.

### 6.9 Indicateurs de Connectivité UI

| État | Indicateur visuel | Comportement |
|------|---------------------|--------------|
| Online | Pastille verte "Connecté" en haut | Sync auto toutes les 5 min |
| Offline | Pastille rouge "Hors ligne — Données locales" | Toutes les saisies vont en queue |
| Sync en cours | Spinner + "Synchronisation..." | Bloquer les transitions workflow conflictuelles |
| Sync réussie | Badge vert "Synchronisé" 2 secondes | Mise à jour des données locales |
| Sync échec | Badge orange "Échec sync — réessayer ?" | Bouton retry manuel |
| Queue non vide | Badge "N items en attente" | Indication permanente si queue > 0 |

### 6.10 Gestion des Photos Offline

```
1. Technicien prend photo sur mobile/tablette
2. Compression côté client : JPEG qualité 80, max 1920px large
3. Stockage dans IndexedDB (object store "photos_queue")
4. Affichage immédiat dans l'interface (blob local)
5. Tentative d'envoi au serveur :
   - Si online : upload immédiat via multipart/form-data
   - Si offline : reste en queue
6. Au retour online : upload séquentiel des photos (pas parallèle pour ne pas saturer la connexion)
7. Après upload réussi : suppression du blob local, remplacement par URL serveur
8. Si échec upload (timeout) : retry 3x avec backoff exponentiel, puis marquage "failed" + notification
```

---

## 7. Spécifications ATEX & Sécurité Intégrées

### 7.1 Contexte Réglementaire

| Réglementation | Application GMAO | Niveau criticité |
|----------------|-------------------|------------------|
| **ATEX 2014/34/UE + 1999/92/CE** | Traçabilité interventions, consignation, permis de feu, matériel certifié Ex | **CRITIQUE** |
| **NF EN 60079-17** | Inspections périodiques installations ATEX planifiées et traçables | **CRITIQUE** |
| **Règlement UE 1935/2004** | Traçabilité interventions lignes contact alimentaire | **ÉLEVÉE** |
| **NF EN ISO 13849-1 / EN 60204-1** | Vérifications périodiques dispositifs sécurité machines | **ÉLEVÉE** |
| **Décret n° 2010-1118 (Appareils pression)** | Traçabilité contrôles réservoirs air comprimé | **MOYENNE** |
| **Code du travail R. 4216-31 et R. 4227-42 à 54** | Document de protection contre explosions (DRPCE), évaluation risques | **CRITIQUE** |

### 7.2 Champs Obligatoires sur BT ATEX

Pour tout BT créé sur un équipement dont `zone_atex` ≠ "Non ATEX", les champs suivants sont **obligatoires** pour que le BT puisse atteindre le statut `CLOTURE` :

| ID Champ | Nom technique | Type | Obligatoire quand | Validation |
|----------|--------------|------|-------------------|------------|
| ATX-01 | `atex_consignation` | Booléen | TOUJOURS sur BT ATEX | `true` obligatoire |
| ATX-02 | `atex_permis_feu` | VARCHAR(50) | Si travaux chauds (type BT = Soudure/Meulage OU case "Travaux chauds" cochée) | Non vide, format alphanumérique |
| ATX-03 | `atex_outillage_ex` | Booléen | TOUJOURS sur BT ATEX | `true` obligatoire |
| ATX-04 | `atex_nettoyage` | Booléen | TOUJOURS sur BT ATEX | `true` obligatoire |
| ATX-05 | `atex_depression` | DECIMAL(8,2) | Si équipement type = Dépoussiéreur | Valeur numérique avec unité Pa |
| ATX-06 | `atex_inspecteur_id` | UUID (FK utilisateur) | Si BT de type "Réglementaire ATEX" | Utilisateur avec rôle HSE ou Responsable |
| ATX-07 | `atex_signature_inspecteur` | TIMESTAMP + hash | Si BT réglementaire ATEX | Confirmation mot de passe inspecteur |
| ATX-08 | `atex_commentaire_securite` | TEXT | RECOMMANDÉ sur BT ATEX | Texte libre (défaut : "RAS") |

**Implémentation technique :**
- Frontend : bloc ATEX conditionnel affiché/masqué selon `equipement.zone_atex`
- Backend : validation `422 Unprocessable Entity` si transition vers `CLOTURE` avec champs ATEX manquants
- Message d'erreur explicite : "Champs ATEX obligatoires manquants : Consignation électrique, Outillage certifié Ex"

### 7.3 Checklists de Sécurité Intégrées

#### 7.3.1 Checklist "Inspection Installation ATEX" (réglementaire EN 60079-17)

Fréquence : paramétrable (défaut 6 mois). Minimum 10 étapes obligatoires.

| N° | Étape | Type réponse | Obligatoire | Seuil alerte |
|----|-------|-------------|-------------|--------------|
| 1 | Vérifier état filtres dépoussiéreur | Photo + Case | Oui | — |
| 2 | Contrôler écluse rotative (fonctionnement) | Case + Valeur (tours/min) | Oui | < 80% nominal |
| 3 | Mesurer dépression aspiration | Valeur numérique (Pa) | Oui | < -2000 Pa |
| 4 | Vérifier tresses de masse et mise à la terre | Photo + Case | Oui | — |
| 5 | Contrôler évents d'explosion (état, absence obstruction) | Photo + Case | Oui | — |
| 6 | Vérifier étanchéité conduits et raccords | Oui/Non + Commentaire | Oui | Si Non → BT correctif |
| 7 | Contrôler résistance mise à la terre | Valeur numérique (ohms) | Oui | > 10 ohms |
| 8 | Nettoyage zone ATEX et dépôts poussière (< 1 mm) | Photo + Case | Oui | — |
| 9 | Vérification matériel certifié Ex utilisé | Liste + Case | Oui | — |
| 10 | Rapport d'inspection signé par inspecteur | Signature (mot de passe) | Oui | — |
| 11 | Vérifier éclairage ATEX (si applicable) | Case | Non | — |
| 12 | Contrôler thermostat sécurité four/dépoussiéreur | Valeur numérique (°C) | Non | > seuil |

**Résultat inspection :**
- Toutes étapes obligatoires validées → BT clôture normale
- Étape avec écart détecté → Création BT correctif lié avec priorité Haute
- Étape "Non" ou valeur hors seuil → Alertes escalade

#### 7.3.2 Checklist "Vérification Sécurité Machines" (mensuelle)

| N° | Étape | Type réponse | Équipement cible |
|----|-------|-------------|------------------|
| 1 | Tester arrêts d'urgence (tous) | Case + Valeur (temps réponse) | Toutes machines |
| 2 | Vérifier barrières immatérielles | Case | Presses, emballeuses |
| 3 | Tester contacteurs de portes sécurisées | Case | Presses, four |
| 4 | Vérifier boutons coup-de-poing | Case | Toutes machines |
| 5 | Contrôler éclairage signalisation | Case | Toutes machines |
| 6 | Vérifier présence EPI obligatoires à poste | Case | Toutes zones |

#### 7.3.3 Checklist "Contact Alimentaire — Post-Intervention"

| N° | Étape | Type réponse | Obligatoire |
|----|-------|-------------|-------------|
| 1 | Nettoyage / rinçage des surfaces contact réalisé | Case | Oui |
| 2 | Validation absence résidus graisse/produits | Case | Oui |
| 3 | Références produits utilisés notées | Texte | Oui |
| 4 | Contrôle visuel propreté | Photo | Non |

### 7.4 Traçabilité Horodatée et Signée

#### 7.4.1 Horodatage

Chaque action ATEX est horodatée avec les champs suivants :

| Événement | Timestamp stocké | Source |
|-----------|-------------------|--------|
| Création BT ATEX | `date_demande` (UTC) | Serveur |
| Démarrage intervention | `date_debut` (UTC) | Serveur ou device (flag `is_local_time`) |
| Validation consignation | `atex_consignation_at` | Device + sync |
| Saisie permis de feu | `atex_permis_feu_at` | Device + sync |
| Validation nettoyage | `atex_nettoyage_at` | Device + sync |
| Terminer intervention | `date_fin` (UTC) | Serveur ou device |
| Clôture BT | `date_cloture` (UTC) | Serveur |
| Signature inspecteur | `atex_signature_at` | Serveur |

**Format :** `TIMESTAMP WITH TIME ZONE` en base. Affichage local selon fuseau horaire du site.

#### 7.4.2 Signature Numérique (V1)

Mécanisme simplifié pour l'audit réglementaire (pas de PKI complexe en V1) :

```
1. Inspecteur ATEX clique "Valider et signer"
2. Popup : "Confirmez votre identité — Saisissez votre mot de passe"
3. Inspecteur saisit son mot de passe
4. Backend vérifie le hash bcrypt du mot de passe
5. Si validé :
   - Enregistrement : user_id, timestamp, action="signature_atex", hash_SHA256(bt_id + user_id + timestamp)
   - Le hash sert de preuve d'intégrité (concaténation des données signées)
   - Stockage dans `bons_travail.atex_signature_hash`
6. Si non validé : blocage transition + message "Signature invalide"
```

**Conservation :** Les données de signature (hash, timestamp, user_id) sont conservées 3 ans minimum (exigence réglementaire ATEX).

#### 7.4.3 Audit Trail ATEX

Toutes les actions sur BT ATEX génèrent des logs audit spécifiques (`audit_logs` avec `table_name = 'bons_travail'`) :
- Création BT sur équipement ATEX
- Modification champ ATEX (consignation, permis de feu, etc.)
- Transition statut BT ATEX
- Signature inspecteur
- Clôture BT ATEX

**Export traçabilité ATEX :** Endpoint `/api/v1/atex/tracabilite` avec filtres période, équipement, inspecteur.

### 7.5 Alertes Réglementaires

| Condition | Destinataire | Canal | Délai |
|-----------|--------------|-------|-------|
| BT urgent sur équipement ATEX créé | Responsable + Techs zone + HSE | Push + Email sonore | Immédiat |
| Inspection ATEX J-7 | Technicien assigné (inspecteur) | Push | J-7 à 8h |
| Inspection ATEX J-3 | Technicien + Responsable | Push + Email | J-3 à 8h |
| Inspection ATEX J0 (échéance) | Inspecteur + Responsable + HSE | Push + Email + Dashboard rouge | J0 à 6h |
| Inspection ATEX retard > 3 jours | HSE + Responsable + Direction | Email + Dashboard | Quotidien 8h |
| Inspection ATEX retard > 7 jours | Direction + HSE + DREAL (notification interne) | Email prioritaire | Quotidien 8h |
| Équipement ATEX arrêt > 2h | Responsable + Direction | Email | Immédiat |
| Écart inspection ATEX détecté (valeur hors seuil) | Responsable + HSE | Push + Email | Immédiat |
| Non-conformité contact alimentaire détectée | Responsable + Qualité | Push + Email | Immédiat |
| Vérification sécurité machines mensuelle non réalisée | Responsable + HSE | Email | J+1 après échéance |
| Contrôle périodique appareil pression (air comprimé) proche échéance | Responsable | Email | J-30 |

### 7.6 Badges et Signaux Visuels ATEX

| Élément | Apparence | Emplacement |
|---------|-----------|-------------|
| Badge ATEX sur fiche équipement | Pastille rouge "ATEX Zone 20/21/22" | En-tête fiche équipement, liste équipements |
| Badge contact alimentaire | Pastille orange "Contact alimentaire" | En-tête fiche équipement |
| Bloc sécurité ATEX dans BT | Encadré rouge avec icône warning | Sous-section "Sécurité ATEX" dans l'exécution BT |
| Bloc contact alimentaire dans BT | Encadré orange avec icône gobelet | Sous-section "Contact alimentaire" |
| Alerte inspection ATEX retard | Bandeau rouge clignotant (dashboard) | Dashboard responsable + vue échéances |
| Équipement ATEX en maintenance | Bordure rouge sur équipement en Kanban/liste | Planning, liste BT |

### 7.7 Conformité hors-ligne

Les champs ATEX et les checklists ATEX doivent fonctionner en mode hors-ligne :

```
1. Technicien accède à BT ATEX hors-ligne (fiche préchargée)
2. Bloc sécurité ATEX affiché normalement
3. Technicien coche les cases, saisit les valeurs
4. Données stockées localement (IndexedDB)
5. Signature : saisie du mot de passe stockée localement en hash temporaire
   (vérification serveur différée à la sync)
6. Au retour online : envoi des données ATEX + vérification signature serveur
7. Si signature invalide (mot de passe erroné) → BT bloqué en A_CLOTURER,
   notification au responsable pour re-validation manuelle
```

**Cas particulier — Signature offline :**
- En offline, le technicien "signe" en saisissant son mot de passe
- Le hash du mot de passe est stocké localement (pas en clair)
- À la synchronisation, le serveur vérifie le hash
- Si le technicien a changé son mot de passe entre-temps → échec de vérification → re-saisie obligatoire

---

## Annexe A — Glossaire Technique

| Terme | Définition |
|-------|------------|
| **BT** | Bon de Travail / Ordre de Travail — document numérique déclençant une intervention |
| **PWA** | Progressive Web App — application web installable, fonctionne hors-ligne |
| **Service Worker** | Script JS exécuté en arrière-plan gérant cache, sync, push notifications |
| **IndexedDB** | Base de données NoSQL côté client (navigateur) pour stockage offline |
| **Cache API** | API navigateur pour stocker les ressources réseau en cache |
| **JWT** | JSON Web Token — token d'authentification signé |
| **Soft delete** | Suppression logique (flag `is_archived`) conservant les données |
| **Audit trail** | Piste d'audit — log horodaté de toutes les actions sur les données |
| **CRUD** | Create Read Update Delete — opérations de base sur les données |
| **Kanban** | Méthode visuelle de gestion des tâches par colonnes de statut |
| **JSONB** | Type PostgreSQL stockant du JSON binaire avec indexation |
| **MTTR** | Mean Time To Repair — temps moyen de réparation |
| **MTBF** | Mean Time Between Failures — temps moyen entre pannes |
| **ATEX** | Atmosphères explosives — directive sécurité installations poussières |
| **QR Code** | Code-barre 2D lisible par caméra mobile |
| **IndexedDB Queue** | File d'attente de synchronisation offline-first |
| **App Shell** | Structure minimale de l'application chargée instantanément |

## Annexe B — Matériel Recommandé pour le Développement Pilote

| Équipement | Quantité | Spécifications | Usage GMAO |
|------------|----------|----------------|------------|
| Tablette robuste 10" | 4 | Android, IP65, brightness > 400 nits | Techniciens atelier (E200-E206) |
| Smartphone robuste | 2 | Android, IP68, caméra > 12MP | Technicien multi-zone, responsable |
| Kiosque tablette fixe | 2 | Android 10", fixation murale, alim. secteur | Opérateurs production (OPP) |
| Serveur dédié usine | 1 | 4 cœurs, 16 Go RAM, 500 Go SSD | Hébergement GMAO + PostgreSQL |
| NAS backup | 1 | 2 To RAID 1 | Sauvegarde quotidienne |
| Routeur WiFi industriel | 1 | 2,4/5 GHz, PoE, antenne externe | Couverture atelier zone pilote |
| Imprimante étiquettes | 1 | Thermique, 300 DPI, USB/Réseau | QR codes équipements + articles |

## Annexe C — Stack Technique Recommandée (Développement sur mesure)

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Front-end | React 18 + TypeScript | Composants réutilisables, PWA native, large écosystème |
| State management | Zustand ou Redux Toolkit | Gestion état global + offline queue |
| UI Components | MUI (Material-UI) ou Ant Design | Composants responsive, accessibles, rapides |
| PWA | Vite PWA Plugin | Génération Service Worker, manifest, offline support |
| IndexedDB | Dexie.js | Wrapper IndexedDB simple, IndexedDB promisifiée |
| Back-end | Node.js + Express + TypeScript | API REST rapide, JSON natif, large communauté |
| Alternative back-end | Python + FastAPI + Uvicorn | Performance, typage, async natif |
| Base de données | PostgreSQL 15 | Fiabilité, JSONB, fenêtres analytiques (KPIs), gratuit |
| Cache | node-cache (in-memory) ou Redis | Cache KPIs, sessions, tokens blacklist |
| Auth | JWT (jsonwebtoken lib) | Stateless, mobile-friendly, simple |
| Password hash | bcrypt | Standard industriel, coût configurable |
| QR Code | qrcode (npm) ou qrcode (Python) | Génération serveur, format PNG/SVG/PDF |
| PDF generation | Puppeteer + HTML/CSS template ou WeasyPrint | Rapports professionnels |
| Excel export | ExcelJS (streaming) | Génération streaming, pas de saturation mémoire |
| Photos | Sharp (Node.js) ou Pillow (Python) | Redimensionnement, compression serveur |
| Emails | Nodemailer (Node) ou FastAPI-Mail | Envoi SMTP interne ou externe |
| Push notifications | web-push (Node) | Notifications navigateur (Service Worker) |
| Déploiement | Docker + Docker Compose | Portabilité, reproductibilité, monolithique |
| Reverse proxy | Nginx | HTTPS, compression gzip, load balancing futur |
| Monitoring | simple log rotation + health endpoint | Suffisant pour serveur local (pas de besoin complexe) |

---

## Résumé du Document

| Section | Contenu | Items détaillés |
|---------|---------|-----------------|
| 1. Inventaire Écrans | 38 écrans répartis sur 6 profils + Admin | Écrans, actions, device privilégié |
| 2. Fonctionnalités par Module | 8 modules, **112 fonctionnalités numérotées** | Chaque fonction = 1 item développable |
| 3. Workflows | 5 workflows pas à pas | États, transitions, règles, cas alternatifs |
| 4. Modèle de Données | 18 entités avec attributs | Relations 1-N, N-M, 15 contraintes d'intégrité |
| 5. API REST | 120+ endpoints | Méthodes HTTP, URLs, paramètres, réponses |
| 6. PWA Hors-ligne | Architecture, sync, conflits, cache | Données sync, stratégies, IndexedDB, queue |
| 7. ATEX & Sécurité | 8 champs obligatoires, 3 checklists, signatures | Traçabilité horodatée, alertes réglementaires |

**Total : 112 fonctionnalités techniques détaillées** — chacune prête à être transformée en tâche de développement (ticket Jira, user story, ou tâche de sprint).

**Vocabulaire métier intégré :** presses d'emboutissage, laquage, sérigraphie, four de recuit, matrices, buses, pompes laquage, tampons sérigraphie, dépoussiéreur ATEX, Zone 20/21/22, consignation électrique, permis de feu, contact alimentaire, emboutissage aluminium.

---

*Document prêt pour l'équipe de développement. Toute modification métier doit être validée par le Responsable Maintenance et documentée ici.*
