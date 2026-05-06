# Spécifications Fonctionnelles Détaillées — GMAO Ramondin

## Document de référence pour le projet GMAO
**Version :** 1.0  
**Date :** Juin 2025  
**Statut :** Brouillon fonctionnel — consolidation des rapports de recherche  
**Destinataires :** Responsable Maintenance, Direction industrielle, DSI, Intégrateurs GMAO

---

## 1. Introduction

### 1.1 Contexte

Ramondin est leader mondial des capsules pour vins et spiritueux (3 milliards d'unités/an, ~56 % du marché mondial de capsules étain). Le groupe compte 501–1 000 employés répartis sur 5 sites (Laguardia/Espagne, Saint-Gaudens et Troyes/France, Napa/USA, Chili). Le site pilote pour ce projet est un site de production à fort volume (probablement Laguardia, 315+ employés, 3×8) ou un site français (50–99 employés).

L'équipe maintenance fonctionne aujourd'hui en mode **papier + Excel** : bons de travail papier, planning préventif sur tableaux Excel partagés, stocks pièces gérés approximativement, aucun historique centralisé consultable en temps réel. Ce mode de fonctionnement génère des pertes de temps importantes, un manque de traçabilité et une difficulté à anticiper les pannes sur des équipements critiques (presses d'emboutissage, lignes de laquage, four de recuit).

### 1.2 Objectifs du projet

| Objectif | Description | Indicateur de succès |
|----------|-------------|----------------------|
| O1 — Digitaliser les BT | Remplacer les bons de travail papier par des OT numériques accessibles en temps réel | 100 % des BT saisis numériquement en T+1 |
| O2 — Anticiper les pannes | Passer de < 30 % à 60 % de maintenance préventive (préventif systématique + conditionnel) | Taux préventif / curatif mesuré mensuellement |
| O3 — Maîtriser les stocks | Connaître en temps réel les stocks de pièces critiques (matrices, buses, pompes laquage) | Rupture de stock pièces critiques = 0 |
| O4 — Mesurer la performance | Disposer de KPIs industriels standardisés (MTTR, MTBF, coûts maintenance) | Dashboard accessible direction en temps réel |
| O5 — Assurer la conformité | Traçabilité des interventions ATEX et contact alimentaire | 100 % des interventions traçables et horodatées |

### 1.3 Périmètre fonctionnel

| Inclus (IN) | Exclus (OUT) — V1 |
|-------------|-------------------|
| Gestion des actifs et équipements | Gestion des bâtiments / facility management |
| Bons de travail (BT / OT) numériques | Comptabilité analytique détaillée (intégrée à l'ERP) |
| Maintenance préventive temporelle et conditionnelle | Maintenance prédictive avancée (IoT, ML) |
| Gestion des stocks de pièces de rechange | Gestion des approvisionnements longs (ERP) |
| Documentation technique attachée | CAO/DAO des pièces |
| Reporting et KPIs | BI avancée multi-site |
| Portail demandes opérateurs production | Gestion complète de la production (MES) |
| Administration, rôles, sécurité | Authentification SSO entreprise (phase 2) |

### 1.4 Utilisateurs cibles

| Rôle | Nombre estimé | Usage principal | Compétences numériques |
|------|---------------|-----------------|------------------------|
| Responsable Maintenance | 1 | Planification, reporting, validation BT, budgets | Moyenne à bonne |
| Techniciens maintenance (méca/élec) | 4–8 | Exécution BT, pointages, saisie constats | Variable, mobile-first obligatoire |
| Opérateurs production | 20–50 | Déclaration pannes, demandes interventions | Basique, saisie simplifiée |
| Magasinier / gestionnaire stocks | 1–2 | Entrées/sorties pièces, inventaire | Moyenne |
| Direction / production manager | 2–3 | Consultation dashboards, priorisation | Bonne |
| HSE / Qualité | 1–2 | Contrôles ATEX, traçabilité réglementaire | Moyenne |

---

## 2. Arborescence fonctionnelle

```
GMAO Ramondin
│
├── 1. GESTION DES ACTIFS / ÉQUIPEMENTS
│   ├── Référentiel équipements (arborescence site → zone → ligne → machine → sous-ensemble)
│   ├── Fiches équipements (caractéristiques, constructeur, garantie, numéro de série)
│   ├── Localisation et affectation
│   └── Historique des interventions par équipement
│
├── 2. BONS DE TRAVAIL (BT / OT)
│   ├── Création BT (demandeur → responsable)
│   ├── Planification et affectation aux techniciens
│   ├── Exécution BT (chronométrage, consommables, pièces, observations)
│   ├── Clôture et validation
│   └── Workflow de validation (demande → planification → exécution → clôture)
│
├── 3. MAINTENANCE PRÉVENTIVE
│   ├── Plan préventif temporel (calendaire, compteur horaire)
│   ├── Plan préventif conditionnel (seuils capteurs, inspections visuelles)
│   ├── Génération automatique des BT préventifs
│   ├── Grille d'interventions et checklists
│   └── Suivi des échéances préventives
│
├── 4. GESTION DES STOCKS / PIÈCES DE RECHANGE
│   ├── Référentiel articles (pièces, consommables, outillages)
│   ├── Stock par magasin/zone
│   ├── Seuils d'alerte (mini/maxi)
│   ├── Mouvements (entrées, sorties, réservations sur BT)
│   └── Inventaire physique
│
├── 5. DOCUMENTATION TECHNIQUE
│   ├── Documents attachés aux équipements (plans, notices, schémas)
│   ├── Checklists et modes opératoires
│   └── Historique des versions
│
├── 6. REPORTING & KPIs
│   ├── Tableaux de bord opérationnels (techniciens)
│   ├── Tableaux de bord management (responsable, direction)
│   ├── KPIs maintenance (MTTR, MTBF, taux préventif, coûts)
│   └── Export données (Excel, PDF)
│
├── 7. PORTAIL DEMANDES / OPÉRATEURS PRODUCTION
│   ├── Déclaration rapide panne (QR code machine → formulaire simplifié)
│   ├── Suivi des demandes en cours
│   └── Notification au demandeur (BT créé, en cours, clôturé)
│
└── 8. ADMINISTRATION & SÉCURITÉ
    ├── Gestion des utilisateurs et rôles
    ├── Codification et paramétrage
    ├── Sauvegardes et audit trail
    └── Conformité ATEX (consignation, permis de feu)
```

---

## 3. Spécifications détaillées par module

### 3.1 Module — Gestion des Actifs / Équipements

#### 3.1.1 Référentiel arborescent

La GMAO doit gérer une arborescence hiérarchique 4 niveaux minimum :

| Niveau | Exemple Ramondin | Usage |
|--------|-------------------|-------|
| N1 — Site | Site Laguardia, Site Saint-Gaudens | Multi-site futur |
| N2 — Zone | Zone A (Presses + Découpe + Recuit), Zone B (Laquage + Sérigraphie + Emballage) | Affectation techniciens |
| N3 — Ligne | Ligne Presses n°1, Ligne Laquage n°2 | Compteur production, arrêt ligne |
| N4 — Machine | Presse d'emboutissage #PR-001, Four recuit #FR-001 | BT, historique, plan préventif |
| N5 — Sous-ensemble | Matrice supérieure PR-001-A, Pompe laquage PL-002-B | Pièces de rechange, préventif détaillé |

**Codification recommandée :**
- `PR-001` = Presse n°1
- `LQ-002` = Ligne Laquage n°2
- `SR-003` = Machine Sérigraphie n°3
- `FR-001` = Four Recuit n°1
- Sous-ensembles : `PR-001-MAT-SUP` (matrice supérieure)

#### 3.1.2 Fiche équipement

Chaque équipement doit disposer d'une fiche complète :

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| Code unique | Texte (10–20 car.) | Oui | Codification interne |
| Désignation | Texte (100 car.) | Oui | Nom métier |
| Type | Liste | Oui | Presse / Laquage / Sérigraphie / Four / etc. |
| Constructeur | Texte | Non | Nom fabricant |
| N° série | Texte | Non | Numéro de série constructeur |
| Date mise en service | Date | Oui | Pour calcul âge équipement |
| Localisation | Arborescence | Oui | Zone / Ligne |
| Criticité | Liste | Oui | Critique / Élevée / Moyenne / Faible |
| Statut | Liste | Oui | En service / En arrêt / En maintenance / Démantelé |
| Garantie | Date | Non | Date fin garantie |
| Coût horaire arrêt | Nombre | Non | €/h — utilisé pour calcul ROI pannes |
| Compteur (heures, cycles, unités) | Nombre | Non | Compteur actuel, incrément manuel ou auto |
| Contact alimentaire | Booléen | Non | Oui pour laquage / sérigraphie |
| Zone ATEX | Liste | Non | Zone 20 / Zone 21 / Zone 22 / Non ATEX |
| Documents joints | Fichiers | Non | Plans, notices, photos |

#### 3.1.3 Historique équipement

- Liste chronologique de **toutes** les interventions (BT) réalisées sur l'équipement
- Filtrage par type (préventif, correctif, curatif, amélioration)
- Accès direct depuis la fiche équipement
- Export PDF de l'historique sur une période

#### 3.1.4 Compteurs et seuils

- Saisie manuelle du compteur (heures de fonctionnement, nombre de coups presse, m² laqués)
- Préparation future : import automatique compteur depuis SCADA/PLC
- Historique des relevés de compteur
- Seuils d'alerte sur compteur (ex : préventif matrice tous les 500 000 coups)

---

### 3.2 Module — Bons de Travail (BT / OT)

#### 3.2.1 Workflow du BT

```
[Création] → [À planifier] → [Planifié] → [En cours] → [À clôturer] → [Clôturé]
    ↑           ↑              ↑            ↑            ↑
    |           |              |            |            |
    |           |              |            |            └─ Validation responsable
    |           |              |            └─ Technicien termine
    |           |              └─ Responsable affecte date + tech
    |           └─ Responsable valide priorité
    └─ Opérateur / Tech / Responsable
```

#### 3.2.2 Création d'un BT

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| Type de demande | Liste | Oui | Panne / Préventif / Amélioration / Sécurité / Réglementaire |
| Demandeur | Utilisateur | Auto | Qui crée le BT |
| Équipement | Arborescence | Oui | Machine ou sous-ensemble concerné |
| Description panne | Texte long | Oui | Symptômes, contexte, code erreur |
| Photo | Image | Non | Photo de la panne / alarme |
| Priorité | Liste | Oui | Urgente (arrêt production) / Haute / Normale / Basse |
| Date demande | Date/Heure | Auto | Horodatage création |
| Zone ATEX | Booléen/affichage | Auto | Hérité de la fiche équipement |

**Règles métier :**
- Si priorité = **Urgente**, notification immédiate (push + sonore) au responsable et techniciens de zone
- Si équipement = **Zone ATEX**, champ obligatoire "Besoin consignation électrique" (Oui/Non/À déterminer)
- Si équipement avec **contact alimentaire**, case à cocher "Impact sur chaîne alimentaire"

#### 3.2.3 Planification

- Vue planning type calendrier (jour/semaine/mois) ou Kanban par statut
- Glisser-déposer pour affecter un BT à un technicien et une date
- Affichage de la charge de travail par technicien (heures planifiées)
- Conflit détecté si technicien déjà affecté à un BT "En cours"
- Rappel automatique 24h avant échéance préventive

#### 3.2.4 Exécution du BT (interface technicien mobile)

L'interface d'exécution est **la plus critique** de la GMAO. Elle doit être utilisable avec des gants et en mode hors-ligne.

| Fonction | Description |
|----------|-------------|
| Démarrer intervention | Bouton "Démarrer", enregistrement heure début |
| Pause / Reprise | Boutons pour interruptions (attente pièce, arrêt sécurité) |
| Terminer intervention | Bouton "Terminer", heure fin, saisie des observations |
| Saisie causes | Liste causes (usure / réglage / surchau / encrassement / vibration / etc.) |
| Saisie actions réalisées | Texte libre + liste actions types (remplacement / réglage / nettoyage / graissage) |
| Pièces consommées | Scan QR code pièce ou recherche par référence, quantité |
| Temps passé | Calcul auto (fin – début – pauses), éditable |
| Checklist | Affichage de la checklist préventif si BT préventif |
| Photos | Ajout photo avant/après |
| Signature / validation | Technicien valide, si amélioration ou sécurité : validation responsable |
| Consignation | Si ATEX : case "Consignation effectuée" + N° permis de feu |

#### 3.2.5 Clôture et validation

- Le technicien marque le BT "Terminé"
- Le responsable le passe à "Clôturé" après validation (ou auto-clôture si paramétré)
- Si intervention non résolue : BT "Partiellement terminé" avec nouvelle planification
- Commentaire de clôture obligatoire si dépassement > 20 % du temps estimé

#### 3.2.6 Suivi des demandes (portail opérateur)

- L'opérateur qui a fait la demande voit le statut de son BT en temps réel
- Notification push/email à chaque changement de statut
- Possibilité d'ajouter un commentaire / photo complémentaire

---

### 3.3 Module — Maintenance Préventive

#### 3.3.1 Plan préventif temporel

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| Fréquence | Nombre + unité | Tous les 30 jours, tous les 7 jours |
| Unité | Jours / Semaines / Mois / Années | — |
| Base | Date fixe ou compteur | Date dernière intervention ou compteur heures |
| Marge d'alerte | Nombre de jours avant échéance | 3 jours |
| Type de BT généré | Préventif systématique / Préventif conditionnel | — |
| Grille d'intervention | Checklist associée | Voir §3.5.2 |

**Exemples de plan préventif Ramondin :**

| Équipement | Fréquence | Type | Description |
|------------|-----------|------|-------------|
| Presses PR-001 à PR-004 | Tous les 500 000 coups | Compteur | Changement matrices, graissage, contrôle jeu |
| Ligne Laquage LQ-001 | Tous les 15 jours | Calendaire | Nettoyage buses, contrôle viscosité, filtration |
| Four recuit FR-001 | Tous les 30 jours | Calendaire | Contrôle brûleurs, thermocouples, circulation air |
| Compresseur CA-001 | Tous les 7 jours | Calendaire | Vidange condensats, contrôle pression, filtre air |
| Dépoussiéreur ATEX DP-001 | Tous les 7 jours | Calendaire | Contrôle dépression, nettoyage filtres, inspection Ex |

#### 3.3.2 Plan préventif conditionnel

- Déclenchement sur seuil de capteur ou relevé manuel
- Seuils configurables par équipement :
  - Vibration (mm/s) — presse
  - Température (°C) — four, moteur
  - Pression (bar) — air comprimé, laquage
  - Compteur horaire/cycle — presse
- Quand un seuil est dépassé : alerte + proposition génération BT

#### 3.3.3 Génération automatique des BT préventifs

- Création automatique du BT N jours avant échéance (paramétrable)
- Affectation automatique au technicien de zone
- Le BT apparaît dans le planning du technicien
- Si BT préventif non réalisé à la date : alerte escalade au responsable

#### 3.3.4 Suivi des échéances

- Vue "Préventifs à venir" (7 jours, 30 jours)
- Taux de réalisation préventif (préventifs réalisés / préventifs planifiés)
- Préventifs en retard (rouge > 3 jours, orange dans la marge)

---

### 3.4 Module — Gestion des Stocks / Pièces de Rechange

#### 3.4.1 Référentiel articles

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| Référence | Texte (20 car.) | Oui | Code unique article |
| Désignation | Texte (100 car.) | Oui | Nom métier |
| Famille | Liste | Oui | Mécanique / Électrique / Pneumatique / Hydraulique / Consommable / Sécurité |
| Sous-famille | Liste | Non | Matrice / Buse / Pompe / Joint / Roulement / etc. |
| Fournisseur | Texte | Non | Fournisseur principal |
| Référence fournisseur | Texte | Non | Pour commande |
| Prix unitaire estimé | Nombre | Non | Pour calcul coût maintenance |
| Stock minimum | Nombre | Oui | Seuil d'alerte rupture |
| Stock maximum | Nombre | Non | Seuil trop plein |
| Localisation stock | Texte | Oui | Magasin A — Étagère 3 — Bac 12 |
| Code-barre / QR code | Texte | Non | Pour scan mobile |
| N° série (si traçable) | Texte | Non | Pour pièces critiques |
| Équipement associé | Arborescence | Non | Pièce de rechange de quel équipement |

#### 3.4.2 Mouvements de stock

| Type | Déclencheur | Impact stock |
|------|-------------|--------------|
| Entrée stock | Réception commande, retour atelier | + quantité |
| Sortie stock | Consommation sur BT | – quantité |
| Réservation | Planification BT avec pièce | – quantité réservée (stock dispo ≠ stock physique) |
| Transfert | D'un magasin à un autre | –A, +B |
| Inventaire | Saisie inventaire physique | Ajustement |
| Retour | Pièce non utilisée sur BT | + quantité |

**Règles métier :**
- Sortie de stock ATEX : case obligatoire "Pièce certifiée Ex"
- Si stock < minimum : alerte email/push au magasinier + responsable maintenance
- Si réservation impossible (stock insuffisant) : alerte + suggestion commande

#### 3.4.3 Inventaire

- Génération de liste d'inventaire par zone/famille
- Saisie quantité réelle via mobile (scan QR code)
- Comparaison stock théorique / stock réel
- Génération écart avec ajustement possible (validation responsable)

#### 3.4.4 Articles critiques Ramondin (à configurer en priorité)

| Article | Équipement | Criticité stock |
|---------|------------|---------------|
| Matrices emboutissage | Presses | Critique — production bloquée |
| Buses laquage | Lignes laquage | Critique — qualité dégradée |
| Pompes laquage | Lignes laquage | Élevée — arrêt ligne |
| Tampons sérigraphie | Machines sérigraphie | Élevée — qualité |
| Joints toriques (kits) | Presses, pompes | Élevée — fuite |
| Filtres air compresseur | Compresseurs | Élevée — pression |
| Thermocouples four | Four recuit | Critique — régulation température |
| Filtres dépoussiéreur ATEX | Dépoussiéreurs | Critique sécurité — arrêt usine |

---

### 3.5 Module — Documentation Technique

#### 3.5.1 Documents attachés

- Upload de fichiers PDF, images, vidéos attachés à un équipement
- Types de documents : notice constructeur, plan éclaté, schéma électrique, photo machine, vidéo procédure
- Recherche par nom et type
- Consultable hors-ligne après synchronisation (PWA)

#### 3.5.2 Checklists et modes opératoires

- Création de checklists modèles (préventifs, contrôles ATEX, mises en route)
- Chaque étape = description + case à cocher + champ commentaire/photo
- Exemple checklist "Contrôle hebdomadaire compresseur" :
  1. Vérifier niveau huile [ ] Commentaire : ______
  2. Vidanger condensats réservoir [ ] Photo : ______
  3. Contrôle pression de service [ ] Valeur : ______ bar
  4. Vérifier état filtre à air [ ] Commentaire : ______

#### 3.5.3 Versions et historique

- Versionnage des documents (date, auteur)
- Historique des consultations (qui a lu quel doc quand)

---

### 3.6 Module — Reporting & KPIs

#### 3.6.1 Tableaux de bord par profil

| Profil | Type de dashboard | Indicateurs |
|--------|-------------------|-------------|
| Technicien | Vue jour/semaine | Mes BT en cours, mes BT planifiés, temps passé aujourd'hui |
| Responsable Maintenance | Vue semaine/mois | Charge par tech, BT en retard, préventifs à venir, stocks alertes |
| Direction | Vue mois/trimestre | Coûts maintenance, taux préventif, MTTR, MTBF, arrêts non planifiés |
| Opérateur | Vue simple | Mes demandes, statut |

#### 3.6.2 KPIs standard

| KPI | Formule | Cible Ramondin |
|-----|---------|----------------|
| MTTR (Mean Time To Repair) | Temps total réparation / Nombre pannes | < 2h |
| MTBF (Mean Time Between Failures) | Temps de fonctionnement / Nombre pannes | > 500h |
| Taux de maintenance préventive | (Heures préventif / Heures totales maintenance) × 100 | > 60 % |
| Taux de disponibilité | (Temps fonctionnement / Temps disponible) × 100 | > 95 % |
| Coût maintenance / Coût remplacement | Ratio coûts cumulés / valeur équipement | < 30 % |
| Temps moyen réponse | (Date début BT – Date demande) | < 15 min (urgent) |
| Respect plan préventif | Préventifs réalisés / Préventifs planifiés | > 95 % |
| Ruptures de stock critiques | Nombre de fois stock = 0 sur pièce critique | 0 |

#### 3.6.3 Alertes et notifications

| Événement | Destinataire | Canal |
|-----------|--------------|-------|
| BT urgent créé | Responsable + Techs zone | Push + Email |
| BT préventif dans 3 jours | Technicien assigné | Push |
| BT préventif en retard | Responsable | Email |
| Stock < minimum | Magasinier + Responsable | Email |
| Équipement arrêt > 2h | Responsable + Direction | Email |
| Seuil capteur dépassé | Responsable + Technicien | Push |

#### 3.6.4 Exports

- Export Excel des BT sur une période
- Export PDF fiche équipement + historique
- Export PDF rapport mensuel KPIs (pour direction)

---

### 3.7 Module — Administration & Sécurité

#### 3.7.1 Gestion des utilisateurs et rôles

| Rôle | Permissions |
|------|-------------|
| Administrateur | Paramétrage complet, gestion users, codification |
| Responsable Maintenance | Planification, validation BT, reporting, stocks |
| Technicien | Exécution BT, consultation planning, saisie temps, docs |
| Opérateur Production | Création demande, consultation statut, photos |
| Magasinier | Mouvements stock, inventaire, alertes |
| Lecteur (Direction/Qualité) | Consultation dashboards, historique, exports |

#### 3.7.2 Paramétrage métier

- Types de BT (modifiable)
- Types de causes de panne (configurable)
- Types d'actions réalisées
- Unités de compteur (heures, coups, m², litres)
- Familles et sous-familles d'articles
- Niveaux de criticité
- Seuils d'alerte (jours, stock, capteurs)

#### 3.7.3 Audit trail

- Horodatage de toutes les actions (création BT, modification statut, mouvement stock)
- Traçabilité utilisateur (qui a fait quoi quand)
- Données non supprimables (archivage), modification avec historique

#### 3.7.4 Sécurité données

- Authentification par login/mot de passe (minimum)
- Connexion HTTPS obligatoire
- Sauvegarde quotidienne automatique
- Droit à l'oubli / anonymisation si demandé

---

## 4. Contraintes réglementaires ATEX et alimentaire

### 4.1 Contexte réglementaire

Les sites Ramondin utilisent de la **poudre d'aluminium** (feuilles alliage 8011, 0.20–0.23 mm) qui présente un risque d'explosion de poussières (ATEX). Les installations laquage utilisent des solvants et des encres à l'eau sans solvant en contact avec des emballages alimentaires.

| Réglementation | Application dans la GMAO |
|----------------|---------------------------|
| **ATEX 2014/34/UE + 1999/92/CE** | Tous les équipements ATEX doivent être identifiés (Zone 20/21/22). Les BT sur ces équipements doivent tracer la consignation, le permis de feu, l'outillage certifié Ex. |
| **Contact alimentaire UE 1935/2004** | Les interventions sur lignes laquage/sérigraphie doivent tracer l'impact sur la chaîne alimentaire (risque de contamination). |
| **Sécurité machines ISO 13849-1 / EN 60204-1** | Traçabilité des vérifications périodiques des dispositifs de sécurité (barrières, arrêts d'urgence, portes interlocks). |
| **Appareils à pression** | Traçabilité des contrôles périodiques réservoirs air comprimé. |
| **EN 60079-17** | Inspections périodiques installations ATEX planifiées et traçables. |

### 4.2 Exigences fonctionnelles ATEX dans la GMAO

#### 4.2.1 Identification ATEX des équipements

- Champ obligatoire "Zone ATEX" sur chaque équipement : Zone 20 / Zone 21 / Zone 22 / Non ATEX
- Badge visuel ATEX sur les fiches équipements concernés
- Filtrage rapide "Équipements ATEX" dans le référentiel

#### 4.2.2 Traçabilité des interventions ATEX

Pour chaque BT sur équipement ATEX, les champs suivants doivent être disponibles :

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| Consignation électrique effectuée | Booléen | Oui | Verrouillage énergie |
| N° permis de feu | Texte | Si travaux chauds | Référence du permis |
| Outillage certifié Ex utilisé | Booléen | Oui | Outil non étincelant |
| Nettoyage post-intervention | Booléen | Oui | Absence résidus poussière |
| Vérification dépression post-intervention | Nombre | Si dépoussiéreur | Valeur mesurée |
| Inspecteur ATEX | Utilisateur | Oui | Nom du responsable inspection |
| Date prochaine inspection ATEX | Date | Auto | Calculée depuis la fiche équipement |

#### 4.2.3 Préventifs réglementaires ATEX

- Plan préventif obligatoire : "Inspection installation ATEX" tous les X mois (selon EN 60079-17)
- Checklist obligatoire avec 10+ points de contrôle
- Génération automatique du BT et alerte 7 jours avant échéance
- Si inspection non réalisée à temps : alerte escalade HSE + Direction

#### 4.2.4 Contact alimentaire

- Flag "Contact alimentaire" sur équipements laquage/sérigraphie
- BT sur ces équipements : case "Nettoyage / rinçage post-intervention validé"
- Traçabilité des produits utilisés (graisse, produit nettoyant) avec référence

---

## 5. Intégrations

### 5.1 Avec l'ERP

| Donnée | Sens | Priorité | Description |
|--------|------|----------|-------------|
| Stocks pièces | ERP → GMAO | Phase 2 | Synchronisation stocks ERP pour éviter double saisie |
| Commandes achats | GMAO → ERP | Phase 2 | Génération commande pièce depuis alerte stock |
| Coûts pièces | ERP → GMAO | Phase 2 | Prix unitaires pour calcul coût maintenance |
| Budget maintenance | ERP → GMAO | Phase 3 | Suivi budget vs réalisé |

### 5.2 Avec SCADA / PLCs

| Donnée | Sens | Priorité | Description |
|--------|------|----------|-------------|
| Compteurs machines | SCADA → GMAO | Phase 2 | Heures fonctionnement, coups presse, unités produites |
| Alarmes | SCADA → GMAO | Phase 3 | Alarme déclenche BT automatique avec code alarme |
| Statut machine (Marche/Arrêt) | SCADA → GMAO | Phase 3 | Détection automatique arrêt / redémarrage |

### 5.3 Capteurs IoT (Phase 3)

| Capteur | Équipement cible | Usage | Seuil typique |
|---------|------------------|-------|---------------|
| Vibration | Presses d'emboutissage | Détecter usure matrice, désalignement | > 7.1 mm/s (ISO 10816) |
| Température | Moteurs presse, four recuit | Surchauffe, dégradation | > 80 °C moteur, > ±10 °C four |
| Pression | Air comprimé, laquage | Fuite, dysfonctionnement | < 6 bar, > 8 bar |
| Dépression | Dépoussiéreurs ATEX | Filtre colmaté | < –2000 Pa |

### 5.4 APIs et connecteurs

- La GMAO doit exposer une **API REST** (ou GraphQL) pour :
  - Création BT externe (depuis SCADA, portail opérateur)
  - Lecture stocks, équipements, planning
  - Écriture compteurs, mouvements stock
- Formats : JSON, authentification par token API
- Documentation API publique pour intégrateurs

---

## 6. Exigences non-fonctionnelles

### 6.1 Performance

| Indicateur | Exigence | Justification |
|------------|----------|---------------|
| Temps de réponse page | < 2 secondes | Techniciens n'attendent pas en atelier |
| Génération BT | < 5 secondes | Création rapide depuis mobile |
| Recherche équipement / article | < 1 seconde | Scan QR ou recherche texte instantanée |
| Export Excel 10 000 lignes | < 10 secondes | Reporting mensuel direction |
| Connexion simultanée | 50 utilisateurs | Croissance future multi-site |

### 6.2 Disponibilité et fiabilité

| Exigence | Niveau | Description |
|----------|--------|-------------|
| Uptime | 99.5 % | Hors maintenance planifiée |
| Sauvegarde | Quotidienne automatique + rétention 30 jours | Restauration point-in-time |
| Perte de données admissible | 0 (transactions) | Toutes les actions sont persistées |
| Redémarrage après panne | < 15 minutes | Hot standby si hébergement cloud |

### 6.3 Mobilité et mode hors-ligne

| Exigence | Description | Priorité |
|----------|-------------|----------|
| PWA mobile-first | Application web responsive, installable sur smartphone/tablette Android/iOS | Must |
| Mode hors-ligne | Saisie BT, consommation pièces, checklist possible sans connexion | Must |
| Synchronisation | Auto-synchronisation dès retour connexion (WiFi/4G) | Must |
| Scan QR/Barcode | Caméra mobile pour scan équipement et pièce | Must |
| Notifications push | Alertes BT urgent, échéance préventif | Should |
| Gants compatibles | Interface boutons larges, peu de champs texte obligatoires | Must |

### 6.4 Sécurité et conformité

| Exigence | Description |
|----------|-------------|
| HTTPS/TLS 1.2+ | Toutes les connexions chiffrées |
| Authentification forte | Minimum login/password, MFA souhaité phase 2 |
| RGPD | Données personnelles des techniciens protégées, droit à l'oubli |
| Hébergement | Cloud EU (OVH, AWS Frankfurt, Azure West Europe) ou on-premise si contrainte groupe |
| Audit | Logs de connexion, logs d'action, conservation 1 an |

### 6.5 Multi-site et internationalisation

| Exigence | Description | Priorité |
|----------|-------------|----------|
| Multi-site | Possibilité de rattacher équipements à un site | Should (V2) |
| Langues | Espagnol, Français, Anglais | Must (site pilote FR ou ES) |
| Fuseaux horaires | Gestion heures locales par site | Should |
| Monnaie | € par défaut, $ pour Napa | Should |

### 6.6 Interface utilisateur

| Exigence | Description |
|----------|-------------|
| Simplicité | Interface intuitive, formation < 2h pour technicien |
| Kanban | Vue planning type Kanban par statut BT |
| Couleurs | Codes couleurs : rouge (urgent/retard), orange (préventif proche), vert (à jour) |
| Recherche | Recherche full-text sur équipements, BT, articles |
| Filtres | Filtres multi-critères sur toutes les listes |

---

## Annexe A — Glossaire métier

| Terme | Définition |
|-------|------------|
| **ATEX** | Atmosphères explosives — directive européenne relative aux équipements et systèmes de protection utilisés en atmosphère explosive |
| **BT / OT** | Bon de Travail / Ordre de Travail — document qui déclenche et trace une intervention maintenance |
| **Emboutissage** | Formage des feuilles d'aluminium par pression pour obtenir la forme de capsule |
| **Laquage** | Application d'un revêtement protecteur et décoratif sur la capsule |
| **MTBF** | Mean Time Between Failures — temps moyen de fonctionnement entre deux pannes |
| **MTTR** | Mean Time To Repair — temps moyen de réparation |
| **PWA** | Progressive Web App — application web installable, fonctionne hors-ligne |
| **Recuit** | Traitement thermique pour améliorer la ductilité de l'aluminium |
| **Sérigraphie** | Impression directe sur la capsule (1 à 3 couleurs) |
| **Zone 20/21/22** | Classification ATEX des zones où des atmosphères explosives poussiéreuses peuvent se former |

## Annexe B — Références rapports sources

- Rapport 1 : Contexte entreprise Ramondin (fondation, sites, processus, certifications)
- Rapport 2 : Benchmark GMAO légères (fonctionnalités, solutions, architecture, coûts)
- Rapport 3 : Expert maintenance capsules aluminium (équipements critiques, ROI, plan déploiement)
