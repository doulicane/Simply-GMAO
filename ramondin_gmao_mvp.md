# MVP Priorisé avec User Stories — GMAO Ramondin

## Document de planification agile pour le projet GMAO
**Version :** 1.0  
**Date :** Juin 2025  
**Statut :** MVP V1 détaillé — prêt pour grooming et sprint planning  
**Méthodologie :** Agile Scrum, sprints 2 semaines

---

## 1. Vision du MVP (V1)

### 1.1 Objectif du MVP

> "En 8 à 12 semaines, fournir une GMAO numérique minimaliste mais opérationnelle qui remplace le papier pour les bons de travail et le planning préventif, sur un pilote de 1 site, 1 zone, 4 techniciens et 20 équipements critiques."

### 1.2 Ce qui est IN (V1 — Must Have)

| # | Fonctionnalité IN | Justification métier |
|---|-------------------|---------------------|
| 1 | Création BT numérique par opérateur et responsable | Remplace le papier, point de départ digital |
| 2 | Workflow BT simple (Créé → Planifié → En cours → Clôturé) | Traçabilité temps réel, pas de perte d'OT |
| 3 | Exécution BT mobile avec pointage temps | Le cœur du quotidien technicien |
| 4 | Mode hors-ligne PWA | Ateliers sans WiFi stable, 3×8 |
| 5 | Référentiel équipements (30-50 machines pilote) | Base de données structurée, fin du " Excel dispersé " |
| 6 | Plan préventif temporel simple (calendaire) | Passer de 0 à préventif planifié sur équipements critiques |
| 7 | Génération auto BT préventifs | Anticiper les échéances, ne plus oublier |
| 8 | Gestion stocks basique (30-50 articles critiques) | Éviter la rupture sur matrices et buses |
| 9 | Alertes stock minimum | Réagir avant la rupture |
| 10 | Tableau de bord responsable (BT en cours, retard, préventifs) | Vue synthétique pour décider chaque matin |
| 11 | KPIs basiques (MTTR, taux préventif, temps réponse) | Première mesure de la performance |
| 12 | Portail opérateur (déclaration panne simplifiée) | Impliquer production, arrêt papier |
| 13 | Checklists préventives | Standardiser les interventions |
| 14 | Identification ATEX sur équipements | Conformité réglementaire obligatoire |
| 15 | Traçabilité consignation / permis de feu sur BT ATEX | Sécurité, audit |

### 1.3 Ce qui est OUT (V1 — report V2/V3)

| # | Fonctionnalité OUT | Report vers | Raison |
|---|--------------------|-------------|--------|
| 1 | Intégration ERP (stocks, achats) | V2 — Mois 4-6 | Complexité, besoin ERP identifié d'abord |
| 2 | Connexion SCADA / compteurs auto | V2 — Mois 4-6 | Nécessite infrastructure réseau atelier |
| 3 | Capteurs IoT (vibration, température) | V3 — Mois 7-12 | Maintenance conditionnelle avancée |
| 4 | Maintenance prédictive ML | V3 — Mois 9-12 | Besoin historique de 6-12 mois |
| 5 | Multi-site (Laguardia + France + USA) | V3 — Mois 6-12 | Pilote 1 site d'abord |
| 6 | Authentification SSO / AD | V2 — Mois 4-5 | Priorité basse sur login/password |
| 7 | Gestion des fournisseurs / achats | V2 — Mois 5-6 | Hors périmètre GMAO légère |
| 8 | Gestion des bâtiments / facility | V3 — Hors périmètre | Hors scope industriel process |
| 9 | CAO/DAO et schémas techniques avancés | V2 — Mois 5-6 | Upload PDF suffisant V1 |
| 10 | BI avancée et data mining | V3 — Mois 9-12 | Dashboards basiques V1 suffisants |

---

## 2. Epics

### Epic 1 — Référentiel et Actifs (E001)
> En tant que responsable maintenance, je veux un référentiel numérique de mes équipements afin de ne plus dépendre d'Excel dispersés et de tracer chaque intervention sur la bonne machine.

### Epic 2 — Bons de Travail Numériques (E002)
> En tant que technicien, je veux créer, exécuter et clôturer des BT depuis mon smartphone/tablette afin de gagner du temps et d'éviter la double saisie papier/Excel.

### Epic 3 — Maintenance Préventive (E003)
> En tant que responsable maintenance, je veux planifier et suivre les préventifs sur mes équipements critiques afin de réduire les pannes imprévues de 25 %.

### Epic 4 — Gestion des Stocks (E004)
> En tant que magasinier, je veux connaître en temps réel mes stocks de pièces critiques afin d'éviter les ruptures qui bloquent la production.

### Epic 5 — Reporting et Tableaux de Bord (E005)
> En tant que direction, je veux des indicateurs de performance maintenance afin de justifier l'investissement et de piloter l'amélioration continue.

### Epic 6 — Portail Opérateurs Production (E006)
> En tant qu'opérateur, je veux déclarer une panne en 30 secondes depuis le poste de production afin que la maintenance intervienne rapidement sans remplir de papier.

### Epic 7 — Conformité ATEX et Sécurité (E007)
> En tant que responsable HSE, je veux que chaque intervention sur équipement ATEX soit traçée avec consignation et permis de feu afin d'être conforme aux directives 1999/92/CE et 2014/34/UE.

### Epic 8 — Administration et Paramétrage (E008)
> En tant qu'administrateur, je veux paramétrer la GMAO (utilisateurs, codification, alertes) afin qu'elle corresponde exactement à l'organisation de mon site.

---

## 3. User Stories détaillées

### Epic 1 — Référentiel et Actifs (E001)

#### US-001 — Créer un équipement dans le référentiel
**En tant que** responsable maintenance,  
**je veux** créer une fiche équipement avec code unique, désignation, zone, criticité et type,  
**afin de** constituer un référentiel structuré de mes machines (presses, laquage, sérigraphie, four).

**Critères d'acceptation :**
- Le code unique respecte la codification (ex: PR-001, LQ-002)
- La zone est choisie dans une liste prédéfinie (Zone A / Zone B)
- La criticité est choisie parmi Critique / Élevée / Moyenne / Faible
- Le type est choisi parmi une liste de 10 types métier minimum
- La fiche est immédiatement consultable par tous les utilisateurs

**Priorité :** Must  
**Estimation :** 3 points  
**Dépendances :** Aucune

---

#### US-002 — Rechercher un équipement par scan QR code
**En tant que** technicien,  
**je veux** scanner un QR code collé sur la machine pour accéder directement à sa fiche,  
**afin de** gagner du temps et éviter les erreurs de saisie manuelle.

**Critères d'acceptation :**
- Le QR code pointe vers le code unique de l'équipement
- Le scan ouvre la fiche équipement en moins de 2 secondes
- Fonctionne hors-ligne si la fiche a été préchargée

**Priorité :** Must  
**Estimation :** 2 points  
**Dépendances :** US-001

---

#### US-003 — Consulter l'historique des interventions d'un équipement
**En tant que** technicien,  
**je veux** voir la liste chronologique des BT réalisés sur un équipement,  
**afin de** comprendre les pannes récurrentes et ne pas répéter les erreurs.

**Critères d'acceptation :**
- L'historique affiche les 50 derniers BT minimum
- Chaque ligne montre : date, type, technicien, durée, description
- Filtrage possible par type (préventif / correctif / curatif)
- Accessible depuis la fiche équipement

**Priorité :** Must  
**Estimation :** 3 points  
**Dépendances :** US-001, US-006

---

#### US-004 — Marquer un équipement comme "En arrêt" ou "En maintenance"
**En tant que** responsable maintenance,  
**je veux** changer le statut d'un équipement (En service / En arrêt / En maintenance),  
**afin de** informer la production et la direction en temps réel.

**Critères d'acceptation :**
- Le statut est visible en grand sur la fiche équipement
- Un changement de statut "En arrêt" génère une notification à la production
- Le statut revient à "En service" quand le BT lié est clôturé

**Priorité :** Should  
**Estimation :** 2 points  
**Dépendances :** US-001

---

### Epic 2 — Bons de Travail Numériques (E002)

#### US-005 — Créer un BT de panne depuis le poste
**En tant qu'opérateur de production,**  
**je veux** créer un BT urgent en 3 clics depuis mon poste (photo + description),  
**afin de** signaler une panne sans quitter ma ligne de production.

**Critères d'acceptation :**
- Formulaire simplifié : équipement (scan QR), description, photo optionnelle
- Création en moins de 30 secondes
- Notification immédiate (push) au responsable maintenance et techniciens de zone
- Le BT est créé avec priorité "Urgente" par défaut

**Priorité :** Must  
**Estimation :** 3 points  
**Dépendances :** US-001, US-002

---

#### US-006 — Planifier un BT (affecter technicien + date)
**En tant que** responsable maintenance,  
**je veux** affecter un BT à un technicien et une date depuis une vue Kanban,  
**afin de** organiser le travail de mon équipe sans Excel ni papier.

**Critères d'acceptation :**
- Vue Kanban avec colonnes : À planifier / Planifié / En cours / Terminé / Clôturé
- Glisser-déposer d'un BT d'une colonne à une autre
- Affectation d'un technicien par liste déroulante
- Affichage de la charge de travail du technicien (heures planifiées)

**Priorité :** Must  
**Estimation :** 5 points  
**Dépendances :** US-005

---

#### US-007 — Démarrer et terminer une intervention (chronométrage)
**En tant que** technicien,  
**je veux** appuyer sur "Démarrer" et "Terminer" sur mon mobile pour chronométrer mon intervention,  
**afin de** connaître le temps réel passé et ne pas compter approximativement.

**Critères d'acceptation :**
- Boutons larges, visibles avec des gants
- Heure début et fin enregistrées automatiquement
- Calcul du temps passé (fin – début – pauses)
- Saisie possible du temps manuellement si oubli
- Fonctionne hors-ligne

**Priorité :** Must  
**Estimation :** 3 points  
**Dépendances :** US-006

---

#### US-008 — Saisir les causes et actions réalisées sur un BT
**En tant que** technicien,  
**je veux** sélectionner la cause de panne dans une liste et décrire les actions réalisées,  
**afin de** constituer un historique exploitable pour l'analyse des pannes récurrentes.

**Critères d'acceptation :**
- Liste causes : Usure / Réglage / Surchauffe / Encrassement / Vibration / Rupture / Électrique / Etc.
- Champ texte libre pour les actions détaillées
- Photo avant/après optionnelle

**Priorité :** Must  
**Estimation :** 2 points  
**Dépendances :** US-007

---

#### US-009 — Consommer des pièces de rechange sur un BT
**En tant que** technicien,  
**je veux** ajouter les pièces utilisées à un BT (scan QR ou recherche),  
**afin de** tracer la consommation et mettre à jour le stock automatiquement.

**Critères d'acceptation :**
- Recherche par référence ou scan QR code
- Saisie quantité
- Décrémentation automatique du stock
- Si stock insuffisant : alerte "Stock bas" visible

**Priorité :** Must  
**Estimation :** 3 points  
**Dépendances :** US-007, US-014

---

#### US-010 — Valider et clôturer un BT (responsable)
**En tant que** responsable maintenance,  
**je veux** clôturer un BT après validation de l'intervention,  
**afin de** finaliser la traçabilité et libérer la machine pour la production.

**Critères d'acceptation :**
- Le BT "Terminé" apparaît dans ma liste "À valider"
- Je peux ajouter un commentaire de clôture
- Si l'intervention n'est pas satisfaisante, je peux la rouvrir
- Notification au demandeur quand le BT est clôturé

**Priorité :** Must  
**Estimation :** 2 points  
**Dépendances :** US-007

---

#### US-011 — Suivre mes demandes (portail opérateur)
**En tant qu'opérateur,**  
**je veux** voir le statut de mes BT déclarés (créé / en cours / terminé),  
**afin de** savoir quand je pourrai reprendre la production sur ma ligne.

**Critères d'acceptation :**
- Liste de mes BT avec code couleur (gris/jaune/vert)
- Mise à jour en temps réel
- Notification quand mon BT passe à "Terminé"

**Priorité :** Should  
**Estimation :** 2 points  
**Dépendances :** US-005, US-010

---

### Epic 3 — Maintenance Préventive (E003)

#### US-012 — Créer un plan préventif temporel
**En tant que** responsable maintenance,  
**je veux** configurer un plan préventif avec fréquence (ex: tous les 30 jours) sur un équipement,  
**afin de** ne plus oublier les entretiens réguliers.

**Critères d'acceptation :**
- Fréquence : nombre + unité (jours, semaines, mois)
- Base : date dernière intervention ou date fixe
- Affectation automatique à un technicien
- Marge d'alerte configurable (ex: 3 jours avant)

**Priorité :** Must  
**Estimation :** 3 points  
**Dépendances :** US-001

---

#### US-013 — Générer automatiquement un BT préventif
**En tant que** responsable maintenance,  
**je veux** que la GMAO crée automatiquement un BT préventif N jours avant l'échéance,  
**afin de** anticiper la planification sans intervention manuelle.

**Critères d'acceptation :**
- Génération automatique selon la fréquence paramétrée
- Le BT apparaît dans la colonne "Planifié" du Kanban
- Alertes 7 jours, 3 jours et jour J si non réalisé
- Si retard > 3 jours : alerte rouge + notification responsable

**Priorité :** Must  
**Estimation :** 3 points  
**Dépendances :** US-012, US-006

---

#### US-014 — Exécuter une checklist préventive
**En tant que** technicien,  
**je veux** consulter une checklist étape par étape lors d'un préventif,  
**afin de** ne rien oublier et standardiser la qualité des interventions.

**Critères d'acceptation :**
- Affichage des étapes une par une ou en liste
- Case à cocher par étape
- Champ commentaire et photo par étape
- Validation impossible si une étape n'est pas cochée (paramétrable)

**Priorité :** Must  
**Estimation :** 3 points  
**Dépendances :** US-013

---

#### US-015 — Consulter les préventifs à venir
**En tant que** responsable maintenance,  
**je veux** voir la liste des préventifs des 7 et 30 prochains jours,  
**afin de** organiser mes ressources et mes stocks en amont.

**Critères d'acceptation :**
- Vue calendrier et vue liste
- Filtrage par zone et par technicien
- Code couleur : vert (à jour), orange (dans 7 jours), rouge (retard)
- Export Excel possible

**Priorité :** Should  
**Estimation :** 2 points  
**Dépendances :** US-013

---

### Epic 4 — Gestion des Stocks (E004)

#### US-016 — Créer un article de stock
**En tant que** magasinier,  
**je veux** créer une fiche article avec référence, désignation, famille, stock mini et localisation,  
**afin de** référencer toutes les pièces de rechange.

**Critères d'acceptation :**
- Référence unique obligatoire
- Famille choisie dans liste (Mécanique / Électrique / Pneumatique / Consommable / Sécurité)
- Stock minimum et localisation obligatoires
- Génération QR code pour l'article

**Priorité :** Must  
**Estimation :** 2 points  
**Dépendances :** Aucune

---

#### US-017 — Saisir une entrée de stock
**En tant que** magasinier,  
**je veux** enregistrer une entrée de stock (quantité, date, commentaire),  
**afin de** mettre à jour le stock après réception d'une commande.

**Critères d'acceptation :**
- Recherche article par référence ou scan QR
- Saisie quantité et date
- Commentaire optionnel (N° BL, fournisseur)
- Stock mis à jour immédiatement

**Priorité :** Must  
**Estimation :** 2 points  
**Dépendances :** US-016

---

#### US-018 — Recevoir une alerte stock bas
**En tant que** responsable maintenance,  
**je veux** recevoir une alerte quand le stock d'une pièce critique passe sous le minimum,  
**afin de** commander à temps et éviter une rupture qui bloque la production.

**Critères d'acceptation :**
- Alerte email et push dès stock < minimum
- L'alerte indique : article, stock actuel, stock minimum, équipement concerné
- Liste des alertes consultable dans un tableau de bord "Stocks"
- Possibilité d'acquitter l'alerte

**Priorité :** Must  
**Estimation :** 2 points  
**Dépendances :** US-016

---

#### US-019 — Réaliser un inventaire physique mobile
**En tant que** magasinier,  
**je veux** faire un inventaire en scannant les articles et en saisissant la quantité réelle,  
**afin de** comparer stock théorique et réel rapidement.

**Critères d'acceptation :**
- Scan QR article → affichage stock théorique → saisie quantité réelle
- Génération d'un écart par article
- Validation responsable pour ajuster le stock
- Fonctionne hors-ligne

**Priorité :** Could  
**Estimation :** 3 points  
**Dépendances :** US-016

---

### Epic 5 — Reporting et Tableaux de Bord (E005)

#### US-020 — Voir un tableau de bord responsable maintenance
**En tant que** responsable maintenance,  
**je veux** consulter un dashboard avec mes indicateurs clés du jour,  
**afin de** prendre mes décisions chaque matin en 5 minutes.

**Critères d'acceptation :**
- Widgets : BT en cours / BT en retard / Préventifs 7 jours / Alertes stock
- Mise à jour en temps réel
- Filtrage par zone et par date
- Responsive (consultable sur tablette)

**Priorité :** Must  
**Estimation :** 3 points  
**Dépendances :** US-006, US-013, US-018

---

#### US-021 — Calculer et afficher MTTR et MTBF
**En tant que** responsable maintenance,  
**je veux** voir le MTTR et le MTBF calculés automatiquement par équipement et par période,  
**afin de** identifier les machines les moins fiables et justifier les investissements.

**Critères d'acceptation :**
- MTTR = somme temps réparation / nombre de pannes (BT curatifs)
- MTBF = temps de fonctionnement / nombre de pannes
- Affichage par équipement et par période (semaine, mois, année)
- Export Excel / PDF

**Priorité :** Should  
**Estimation :** 3 points  
**Dépendances :** US-007, US-010

---

#### US-022 — Exporter un rapport mensuel en PDF
**En tant que** direction,  
**je veux** exporter un rapport PDF mensuel avec les KPIs et les arrêts,  
**afin de** présenter les résultats au comité de direction.

**Critères d'acceptation :**
- Rapport prêt en 1 clic
- Contenu : résumé BT, temps d'arrêt, coûts estimés, taux préventif, MTTR/MTBF
- Mise en page professionnelle avec logo
- Envoi par email automatique optionnel

**Priorité :** Should  
**Estimation :** 3 points  
**Dépendances :** US-020, US-021

---

### Epic 6 — Portail Opérateurs Production (E006)

#### US-023 — Déclarer une panne par scan QR machine
**En tant qu'opérateur,**  
**je veux** scanner le QR code de ma machine et déclarer une panne en 30 secondes,  
**afin de** ne pas perdre de temps avec du papier.

**Critères d'acceptation :**
- Scan QR → formulaire pré-rempli avec l'équipement
- Champs : description (texte libre), photo (optionnel), type d'urgence
- Bouton "Envoyer" → BT créé avec priorité Urgente
- Confirmation visuelle immédiate

**Priorité :** Must  
**Estimation :** 2 points  
**Dépendances :** US-002

---

#### US-024 — Imprimer les QR codes des équipements
**En tant que** responsable maintenance,  
**je veux** générer et imprimer des QR codes pour tous mes équipements pilote,  
**afin de** les coller sur les machines pour les scans.

**Critères d'acceptation :**
- Génération par lot (sélection multiple)
- Format A4 avec plusieurs QR codes par page
- Chaque QR code contient le code unique
- Impression PDF ou directe

**Priorité :** Should  
**Estimation :** 2 points  
**Dépendances :** US-001

---

### Epic 7 — Conformité ATEX et Sécurité (E007)

#### US-025 — Identifier un équipement comme ATEX (Zone 20/21/22)
**En tant que** responsable maintenance,  
**je veux** marquer un équipement comme ATEX avec sa zone de classification,  
**afin de** appliquer les procédures de sécurité spécifiques.

**Critères d'acceptation :**
- Champ "Zone ATEX" : Zone 20 / Zone 21 / Zone 22 / Non ATEX
- Badge rouge visible sur la fiche équipement si ATEX
- Filtrage rapide "Voir tous les équipements ATEX"

**Priorité :** Must  
**Estimation :** 1 point  
**Dépendances :** US-001

---

#### US-026 — Saisir les informations de consignation sur un BT ATEX
**En tant que** technicien,  
**je veux** cocher "Consignation effectuée" et saisir le N° de permis de feu sur un BT ATEX,  
**afin de** garantir la traçabilité réglementaire de chaque intervention.

**Critères d'acceptation :**
- Si équipement = ATEX, affichage automatique du bloc "Sécurité ATEX"
- Cases à cocher : Consignation électrique / Permis de feu / Outillage certifié Ex / Nettoyage post-intervention
- Champ texte "N° permis de feu" obligatoire si travaux chauds
- Données visibles dans l'historique et les exports

**Priorité :** Must  
**Estimation :** 2 points  
**Dépendances :** US-025, US-007

---

#### US-027 — Planifier un contrôle ATEX réglementaire
**En tant que** responsable HSE,  
**je veux** créer un préventif spécifique "Inspection ATEX" avec une checklist obligatoire,  
**afin de** respecter la EN 60079-17.

**Critères d'acceptation :**
- Type de préventif spécifique "Réglementaire ATEX"
- Fréquence paramétrable (ex: tous les 6 mois)
- Checklist obligatoire avec 10 points minimum
- Si non réalisé à l'échéance : alerte rouge à HSE + Direction

**Priorité :** Should  
**Estimation :** 2 points  
**Dépendances :** US-012

---

### Epic 8 — Administration et Paramétrage (E008)

#### US-028 — Créer un utilisateur avec un rôle
**En tant qu'administrateur,**  
**je veux** créer un compte utilisateur avec un rôle (technicien, opérateur, responsable, magasinier, lecteur),  
**afin de** contrôler qui peut faire quoi dans la GMAO.

**Critères d'acceptation :**
- Nom, prénom, email, login, mot de passe
- Rôle choisi dans liste prédéfinie
- Activation / désactivation du compte
- Envoi automatique des identifiants par email

**Priorité :** Must  
**Estimation :** 2 points  
**Dépendances :** Aucune

---

#### US-029 — Configurer les types de causes et actions
**En tant qu'administrateur,**  
**je veux** personnaliser la liste des causes de pannes et des actions réalisées,  
**afin de** adapter la GMAO au vocabulaire de mon site.

**Critères d'acceptation :**
- Ajout, modification, suppression d'éléments de liste
- Ordre personnalisable
- Impact immédiat sur les nouveaux BT
- Historique des anciennes valeurs conservé

**Priorité :** Should  
**Estimation :** 2 points  
**Dépendances :** Aucune

---

#### US-030 — Saisir un compteur horaire sur un équipement
**En tant que** technicien,  
**je veux** saisir manuellement le compteur horaire ou en cycles de ma machine,  
**afin de** déclencher les préventifs au bon moment.

**Critères d'acceptation :**
- Champ compteur sur la fiche équipement
- Unité configurable (heures, coups, unités, m²)
- Historique des relevés
- Alertes si compteur dépasse le seuil de préventif

**Priorité :** Should  
**Estimation :** 2 points  
**Dépendances :** US-001

---

## 4. Matrice de priorisation (MoSCoW)

### Must Have (M) — Indispensables pour le MVP

> "Sans ces fonctionnalités, la GMAO ne remplace pas le papier et ne délivre pas de valeur."

| ID | User Story | Epic | Estim. | Sprint |
|----|------------|------|--------|--------|
| US-001 | Créer un équipement | E001 | 3 | S1 |
| US-002 | Scan QR équipement | E001 | 2 | S1 |
| US-003 | Historique interventions équipement | E001 | 3 | S2 |
| US-005 | Créer BT panne (opérateur) | E002 | 3 | S1 |
| US-006 | Planifier BT (Kanban) | E002 | 5 | S2 |
| US-007 | Chronométrage intervention | E002 | 3 | S2 |
| US-008 | Causes et actions BT | E002 | 2 | S3 |
| US-009 | Consommation pièces sur BT | E002 | 3 | S3 |
| US-010 | Clôturer BT (responsable) | E002 | 2 | S3 |
| US-012 | Créer plan préventif | E003 | 3 | S2 |
| US-013 | Génération auto BT préventif | E003 | 3 | S3 |
| US-014 | Checklist préventive | E003 | 3 | S3 |
| US-016 | Créer article stock | E004 | 2 | S2 |
| US-017 | Entrée stock | E004 | 2 | S3 |
| US-018 | Alerte stock bas | E004 | 2 | S3 |
| US-020 | Dashboard responsable | E005 | 3 | S4 |
| US-023 | Déclarer panne scan QR (opérateur) | E006 | 2 | S1 |
| US-025 | Identifier équipement ATEX | E007 | 1 | S1 |
| US-026 | Consignation BT ATEX | E007 | 2 | S3 |
| US-028 | Créer utilisateur avec rôle | E008 | 2 | S1 |

**Total Must Have :** 21 US — ~50 points — ~5 sprints (10 semaines)

---

### Should Have (S) — Fortement souhaitables, ajoutent du value

> "Améliorent l'adoption et la visibilité. Peuvent être reportés si nécessaire."

| ID | User Story | Epic | Estim. |
|----|------------|------|--------|
| US-004 | Statut équipement (En service/Arrêt) | E001 | 2 |
| US-011 | Suivi demandes opérateur | E006 | 2 |
| US-015 | Préventifs à venir (calendrier) | E003 | 2 |
| US-021 | MTTR / MTBF automatique | E005 | 3 |
| US-022 | Export rapport mensuel PDF | E005 | 3 |
| US-024 | Impression QR codes équipements | E006 | 2 |
| US-027 | Contrôle ATEX réglementaire | E007 | 2 |
| US-029 | Configurer causes et actions | E008 | 2 |
| US-030 | Saisie compteur horaire | E001 | 2 |

**Total Should Have :** 9 US — ~20 points — ~2 sprints (4 semaines)

---

### Could Have (C) — Souhaitables si temps disponible

| ID | User Story | Epic | Estim. |
|----|------------|------|--------|
| US-019 | Inventaire physique mobile | E004 | 3 |
| — | Multi-langue (FR + ES) | E008 | 5 |
| — | Recherche full-text globale | E008 | 3 |
| — | Upload documents techniques (PDF) | E001 | 2 |

**Total Could Have :** ~4 US — ~13 points

---

### Won't Have (W) — Hors périmètre V1

| ID | Fonctionnalité | Raison | Report |
|----|---------------|--------|--------|
| W1 | Intégration ERP stocks/achats | Complexité, besoin ERP mûr d'abord | V2 |
| W2 | Connexion SCADA / PLC | Infrastructure réseau à préparer | V2 |
| W3 | Capteurs IoT (vibration, température) | Maintenance conditionnelle avancée | V3 |
| W4 | Maintenance prédictive ML | Besoin historique 6-12 mois | V3 |
| W5 | Multi-site (5 sites Ramondin) | Pilote 1 site d'abord | V3 |
| W6 | Authentification SSO / AD | Login/password suffisant V1 | V2 |
| W7 | Gestion des fournisseurs et achats | Hors scope GMAO légère | V2 |
| W8 | BI avancée et data mining | Dashboards basiques suffisent V1 | V3 |
| W9 | Gestion des bâtiments | Hors scope process | — |
| W10 | CAO/DAO intégré | Upload PDF suffisant | V2 |

---

## 5. Roadmap V1 → V2 → V3 (12 mois)

### Phase 1 — MVP V1 : Fondations (Mois 1-3)

**Objectif :** Remplacer le papier sur 1 site pilote, 1 zone, 20-30 équipements, 4 techniciens.

| Livrable | Durée | Semaine |
|----------|-------|---------|
| S1 : Sprint 0 + Sprint 1 | Paramétrage + US-001, 002, 005, 023, 025, 028 | S1-S2 |
| S2 : Sprint 2 | US-003, 006, 007, 012, 016 | S3-S4 |
| S3 : Sprint 3 | US-008, 009, 010, 013, 014, 017, 018, 026 | S5-S6 |
| S4 : Sprint 4 | US-020 + Should Have + recette | S7-S8 |
| Recette UAT et corrections | Tests avec techniciens sur machines réelles | S9-S10 |
| Formation et Go-Live V1 | 2h par technicien, fiches A4, champion par zone | S11-S12 |

**Livrables V1 :**
- [ ] GMAO opérationnelle sur site pilote
- [ ] 30 équipements référencés avec QR codes
- [ ] 30-50 articles stock référencés
- [ ] BT 100 % numériques (zéro papier)
- [ ] Préventifs planifiés sur équipements critiques
- [ ] Dashboard responsable opérationnel
- [ ] Mode hors-ligne fonctionnel

**Investissement V1 :**

| Poste | Coût estimé |
|-------|-------------|
| SaaS GMAO (10 users, 3 mois) | 1 500 – 2 000 € |
| Paramétrage initial | 3 000 – 5 000 € |
| Tablettes/smartphones (4 techs + 1 resp + magasinier) | 1 500 – 2 500 € |
| Formation | 1 000 – 1 500 € |
| Temps interne (responsable 10 jours) | 2 000 € |
| **Total V1** | **9 000 – 13 000 €** |

---

### Phase 2 — V2 : Connecter et étendre (Mois 4-8)

**Objectif :** Intégrer l'ERP, connecter le SCADA, étendre à la deuxième zone, enrichir les fonctionnalités.

| Mois | Focus | Livrables |
|------|-------|-----------|
| 4 | Intégration ERP stocks | Synchronisation stocks ERP ↔ GMAO, commandes auto |
| 5 | Connexion SCADA compteurs | Import auto compteurs machines, alertes temps réel |
| 5-6 | Extension Zone B | Équipements laquage + sérigraphie + emballage |
| 6 | Authentification SSO | Intégration Active Directory |
| 7 | Analyse pannes récurrentes | Rapport pannes par cause, Pareto, tendance |
| 7-8 | Documentation technique | Upload notices, plans éclatés, accès mobile |

**Nouvelles fonctionnalités V2 :**
- [ ] Intégration ERP (synchro stocks, coûts, commandes)
- [ ] Import compteurs SCADA/PLC (pas de saisie manuelle)
- [ ] Zone B intégrée (lignes laquage, sérigraphie, emballeuses)
- [ ] Authentification SSO
- [ ] Recherche full-text documents
- [ ] Rapport Pareto des pannes (80/20)
- [ ] Gestion des fournisseurs et commandes depuis GMAO
- [ ] Alertes automatiques sur compteurs machines

**Investissement V2 :**

| Poste | Coût estimé |
|-------|-------------|
| SaaS (10 users, 6 mois suppl.) | 3 000 – 4 500 € |
| Intégration ERP | 4 000 – 8 000 € |
| Connexion SCADA | 3 000 – 6 000 € |
| Extension zone + paramétrage | 2 000 – 3 000 € |
| Formation zone B | 1 000 € |
| **Total V2** | **13 000 – 22 500 €** |

---

### Phase 3 — V3 : Intelligence et multi-site (Mois 9-12)

**Objectif :** Maintenance conditionnelle, capteurs IoT, prédictif pression, déploiement multi-site.

| Mois | Focus | Livrables |
|------|-------|-----------|
| 9-10 | Capteurs IoT pilote | Vibration presses, température moteurs, pression air |
| 10 | Maintenance conditionnelle | Seuils capteurs, génération auto BT conditionnel |
| 10-11 | Prédictif avancé | Analyse tendance vibrations, alertes avant rupture matrice |
| 11 | Déploiement site 2 | Saint-Gaudens ou Troyes |
| 12 | Revue annuelle + optimisation | Bilan KPIs, ajustement préventifs, plan année N+1 |

**Nouvelles fonctionnalités V3 :**
- [ ] Capteurs IoT (vibration, température, pression)
- [ ] Maintenance conditionnelle automatique (seuils)
- [ ] Prédictif avancé (tendances, alertes anticipées)
- [ ] Multi-site (Laguardia + France)
- [ ] BI avancée (Power BI / Tableau connector)
- [ ] Gestion des budgets maintenance par ligne
- [ ] Optimisation stocks par algorithme (ABC/XYZ)

**Investissement V3 :**

| Poste | Coût estimé |
|-------|-------------|
| SaaS (année 2 complète) | 6 000 – 9 000 € |
| Capteurs IoT + installation | 5 000 – 10 000 € |
| Prédictif / data science | 3 000 – 6 000 € |
| Déploiement multi-site | 3 000 – 5 000 € |
| **Total V3** | **17 000 – 30 000 €** |

---

### Synthèse budget et ROI sur 12 mois

| Phase | Durée | Investissement | Cumulé |
|-------|-------|----------------|--------|
| V1 — Fondations | 3 mois | 9 000 – 13 000 € | 9 000 – 13 000 € |
| V2 — Connecter | 5 mois | 13 000 – 22 500 € | 22 000 – 35 500 € |
| V3 — Intelligence | 4 mois | 17 000 – 30 000 € | 39 000 – 65 500 € |
| **Année 1 totale** | **12 mois** | **39 000 – 65 500 €** | |

**Gains estimés année 1 :**

| Gain | Calcul | Montant |
|------|--------|---------|
| Réduction pannes -25% | 50h × 2 500 €/h | 125 000 € |
| Réduction préparation -25% | Temps gagné techs | 60 000 € |
| Optimisation stock -15% | Moins de capital immobilisé | 12 000 € |
| Réduction commandes urgentes -30% | Moins de frais transport express | 12 000 € |
| Productivité techniciens +15% | Moins de paperasse, meilleure planif | 25 000 € |
| Reporting et traçabilité | Valeur conformité + direction | 8 000 € |
| **Total gains** | | **242 000 €/an** |

**ROI année 1 :** 370 % – 620 %  
**Payback :** 2 – 3 mois

---

## 6. Recommandation technique

### 6.1 Choix de la solution : SaaS GMAO légère

**Recommandation :** Solution **SaaS GMAO légère de type MaintainX, Limble CMMS ou UpKeep** pour le MVP V1.

**Justification :**

| Critère | SaaS GMAO légère | Open Source | Sur mesure |
|---------|-------------------|-------------|------------|
| Délai mise en oeuvre | 4-8 semaines | 3-6 mois | 6-12 mois |
| Coût année 1 (10 users) | 6 000 – 12 000 € | 6 000 – 12 000 € + IT | 50 000 – 100 000 € |
| Mobile / PWA | Natif | À développer | À développer |
| Mode hors-ligne | Oui (PWA) | À configurer | À développer |
| APIs ouvertes | Oui | Oui | Oui |
| Support / SLA | Oui | Communauté | Interne/Prestataire |
| Scalabilité | Cloud auto | Limité serveur | Dépend architecture |

**Verdict :** Le SaaS légère est le meilleur compromis pour Ramondin : déploiement rapide, coût maîtrisé, mobile-first, pas de dette technique. L'open source (GLPI, OpenMAINT) est une alternative viable si la DSI a des compétences PHP/Python disponibles.

### 6.2 Stack technique suggérée (si développement sur mesure)

Si le choix final se porte sur une solution custom ou open source fortement adaptée :

| Couche | Technologie recommandée | Justification |
|--------|------------------------|---------------|
| Front-end | React.js ou Vue.js | PWA native, composants réutilisables |
| Mobile | PWA (Progressive Web App) | Pas de store, hors-ligne, multi-plateforme |
| Back-end | Node.js (Express) ou Python (FastAPI) | API REST rapide, JSON |
| Base de données | PostgreSQL | Fiabilité, JSONB flexible, géospatial |
| Cache / Hors-ligne | IndexedDB + Service Workers | Stockage local navigateur |
| Auth | JWT (JSON Web Tokens) | Stateless, mobile-friendly |
| Déploiement | Docker + Docker Compose | Portabilité, reproductibilité |
| Hébergement | Cloud EU (OVH / AWS Frankfurt / Scaleway) | RGPD, latence faible |

### 6.3 Architecture simplifiée

```
┌─────────────────────────────────────────────────────────────┐
│                    UTILISATEURS                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Tablette │  │ Smartphone│  │  PC Web  │  │  Kiosque │    │
│  │  Tech    │  │  Tech     │  │  Resp    │  │  Opérateur│   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└───────┼─────────────┼─────────────┼─────────────┼────────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│              PWA — FRONT-END (React/Vue)                   │
│         Cache hors-ligne (IndexedDB / Service Workers)       │
└─────────────────────────────┬───────────────────────────────┘
                              │ API REST (HTTPS)
┌─────────────────────────────▼───────────────────────────────┐
│              BACK-END (Node.js / Python)                   │
│         Auth JWT │ Business Logic │ Notifications Push      │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│              BASE DE DONNÉES (PostgreSQL)                    │
│    Équipements │ BT │ Stocks │ Users │ Documents │ Audit     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│     ERP       │    │  SCADA / PLC  │    │   Capteurs    │
│  (Phase 2)    │    │  (Phase 2)    │    │  IoT (Ph.3)   │
└───────────────┘    └───────────────┘    └───────────────┘
```

### 6.4 Matériel recommandé pour le pilote

| Équipement | Quantité | Prix unit. | Total | Usage |
|------------|----------|------------|-------|-------|
| Tablette robuste 10" (Android, IP65) | 4 | 300 € | 1 200 € | Techniciens atelier |
| Smartphone robuste (Android, IP68) | 2 | 250 € | 500 € | Tech multi-zone, resp |
| Kiosque tablette production (fixe) | 2 | 400 € | 800 € | Déclaration pannes opérateurs |
| Imprimante étiquettes QR code | 1 | 150 € | 150 € | QR codes équipements |
| Étiquettes QR code résistantes | 200 | 0.50 € | 100 € | Collage sur machines |
| Routeur WiFi industriel (atelier) | 1 | 200 € | 200 € | Couverture WiFi zone pilote |
| **Total matériel** | | | **2 950 €** | |

### 6.5 Planning de sélection et déploiement

| Semaine | Action | Responsable |
|---------|--------|-------------|
| S1-S2 | Benchmark 3 SaaS (MaintainX, Limble, UpKeep) + démo | Responsable + DSI |
| S3 | Test pilote avec 2 techniciens sur 5 équipements | Champions techs |
| S4 | Choix final, négociation contrat, commande | Direction + Achats |
| S5-S6 | Paramétrage référentiel (30 équipements, 40 articles, 10 users) | Responsable + Intégrateur |
| S7 | Formation responsable + paramétrage préventifs | Intégrateur |
| S8 | Formation techniciens (2h pratique sur machines) | Intégrateur + Champion |
| S9 | Go-Live V1 — BT uniquement | Tous |
| S10-S12 | Ajout préventifs + stocks + recette | Responsable + Intégrateur |

---

## Annexe A — Résumé des 30 User Stories

| ID | Epic | Intitulé | Priorité | Estim. |
|----|------|----------|----------|--------|
| US-001 | E001 | Créer un équipement | Must | 3 |
| US-002 | E001 | Scan QR équipement | Must | 2 |
| US-003 | E001 | Historique interventions équipement | Must | 3 |
| US-004 | E001 | Statut équipement En service/Arrêt | Should | 2 |
| US-005 | E002 | Créer BT panne (opérateur) | Must | 3 |
| US-006 | E002 | Planifier BT (Kanban) | Must | 5 |
| US-007 | E002 | Chronométrage intervention | Must | 3 |
| US-008 | E002 | Causes et actions BT | Must | 2 |
| US-009 | E002 | Consommation pièces sur BT | Must | 3 |
| US-010 | E002 | Clôturer BT (responsable) | Must | 2 |
| US-011 | E006 | Suivi demandes opérateur | Should | 2 |
| US-012 | E003 | Créer plan préventif | Must | 3 |
| US-013 | E003 | Génération auto BT préventif | Must | 3 |
| US-014 | E003 | Exécuter checklist préventive | Must | 3 |
| US-015 | E003 | Préventifs à venir (calendrier) | Should | 2 |
| US-016 | E004 | Créer article stock | Must | 2 |
| US-017 | E004 | Saisir entrée stock | Must | 2 |
| US-018 | E004 | Alerte stock bas | Must | 2 |
| US-019 | E004 | Inventaire physique mobile | Could | 3 |
| US-020 | E005 | Dashboard responsable | Must | 3 |
| US-021 | E005 | MTTR / MTBF automatique | Should | 3 |
| US-022 | E005 | Export rapport mensuel PDF | Should | 3 |
| US-023 | E006 | Déclarer panne scan QR | Must | 2 |
| US-024 | E006 | Impression QR codes équipements | Should | 2 |
| US-025 | E007 | Identifier équipement ATEX | Must | 1 |
| US-026 | E007 | Consignation BT ATEX | Must | 2 |
| US-027 | E007 | Planifier contrôle ATEX réglementaire | Should | 2 |
| US-028 | E008 | Créer utilisateur avec rôle | Must | 2 |
| US-029 | E008 | Configurer causes et actions | Should | 2 |
| US-030 | E001 | Saisie compteur horaire | Should | 2 |

**Total :** 30 User Stories | 74 points de story | ~8 sprints (16 semaines) pour V1 complète

## Annexe B — Checklist de lancement V1

- [ ] Référentiel équipements créé (30 machines minimum)
- [ ] QR codes imprimés et collés sur les machines
- [ ] 30-50 articles stock créés avec seuils minimum
- [ ] 4 techniciens + 1 responsable + 1 magasinier formés
- [ ] Plan préventif configuré sur les 5 équipements critiques
- [ ] Mode hors-ligne testé en conditions réelles
- [ ] Zéro BT papier accepté à partir du Go-Live
- [ ] Chef de production informé et portail opérateur actif
- [ ] Alertes stock et préventifs configurées
- [ ] Dashboard responsable validé par le responsable maintenance
