# RAPPORT MÉTIER — ANALYSE DES BESOINS MAINTENANCE ET DIGITALISATION
## Usine de Fabrication de Capsules Aluminium (type Ramondin)

---

**Document :** RM-2025-CAPSULES-001  
**Classification :** Confidentiel — Direction & Maintenance  
**Date :** Juin 2025  
**Rédigé par :** Expert Maintenance Industriel — Secteur Emballage Métallique  
**Destinataire :** Responsable Maintenance / Direction Industrielle  

---

## SOMMAIRE

1. [Équipements critiques d'une usine de capsules aluminium](#1-équipements-critiques)
2. [Types de maintenance nécessaires et répartition recommandée](#2-types-de-maintenance)
3. [Processus métier à digitaliser (priorisation)](#3-processus-métier-à-digitaliser)
4. [Réglementations et sécurité](#4-réglementations-et-sécurité)
5. [Organisation maintenance recommandée](#5-organisation-maintenance)
6. [Pièges et risques du passage papier → digital](#6-pièges-et-risques)
7. [Business Case — ROI estimé de la digitalisation](#7-business-case-roi)

---

## 1. ÉQUIPEMENTS CRITIQUES D'UNE USINE DE CAPSULES ALUMINIUM

### 1.1 Cartographie des machines principales

Une usine de capsules aluminium de type Ramondin (ou équivalent : Pelliconi, Guala Closures, etc.) compte typiquement 4 à 8 lignes de production. Chaque ligne intègre les équipements suivants, classés par criticité pour la maintenance :

| Rang | Équipement | Fonction | Criticité Maintenance | Type d'usure dominante |
|------|-----------|----------|----------------------|----------------------|
| **1** | **Presses d'emboutissage** (transfer presses ou deep-drawing presses) | Formage du disque aluminium en capsule vierge | **CRITIQUE** | Usure des matrices et poinçons, guidage, lubrification, vibrations, jeu mécanique |
| **2** | **Lignes de laquage** (coating lines — vernis intérieur/extérieur) | Application du vernis de protection et décor de base | **CRITIQUE** | Buses, pompes, systèmes de chauffe, ventilation/séchage, filtration des solvants |
| **3** | **Machines de sérigraphie / decorating** (printing lines) | Impression du décor (marque, millésime, etc.) | **ÉLEVÉE** | Tampons, encres, nettoyage, calibration couleur, alignement |
| **4** | **Emballeuses / Flow-pack / Cartonneuses** | Conditionnement final (sachets, cartons, palettes) | **ÉLEVÉE** | Mécanisme de pliage, thermosoudure, convoyeurs, changement format |
| **5** | **Four de recuit / traitement thermique** (annealing oven) | Relaxation des contraintes mécaniques post-emboutissage | **CRITIQUE** | Brûleurs, thermocouples, circulation d'air, isolation, sécurité gaz |
| **6** | **Ligne de découpe / blanking line** | Découpe des disques à partir de bande aluminium | **MOYENNE** | Cisailles, couteaux, guidage, tension de bande |
| **7** | **Systèmes de manutention et convoyage** | Transport inter-étapes | **MOYENNE** | Rouleaux, courroies, motoréducteurs, capteurs |
| **8** | **Compresseurs et réseau air comprimé** | Alimentation pneumatique des presses et emballeuses | **CRITIQUE** | Filtres, sécheurs, vidanges, contrôle pression, fuites |
| **9** | **Groupe froid / climatisation process** | Stabilisation température encres et vernis | **MOYENNE** | Compresseur frigorifique, échangeurs, fluide frigorigène |
| **10** | **Dépoussiéreurs / installations ATEX** | Aspiration des poussières d'aluminium | **CRITIQUE SÉCURITÉ** | Filtres, ventilateurs, écluses, tresses de masse, contrôle étanchéité |

### 1.2 Besoins maintenance spécifiques par famille d'équipement

#### Presses d'emboutissage
- **Fréquence :** Maintenance préventive journalière (lubrification, nettoyage) + mensuelle (réglages, contrôle jeu) + annuelle (révision guidages, vérin principal)
- **Points de vigilance :** Vibrations excessives → fissuration des matrices ; lubrification insuffisante → brûlure des coussinets ; alignement défaut → bris d'outillage (coût : 15 000–80 000 € l'ensemble matrices/poinçons)
- **Pièces de rechange critiques :** Matrices, poinçons, coussinets, joints d'étanchéité, capteurs de proximité
- **Coût d'arrêt :** 2 000–5 000 €/heure selon la ligne et le produit

#### Lignes de laquage
- **Fréquence :** Nettoyage hebdomadaire des circuits encres/vernis ; maintenance mensuelle des pompes et systèmes de chauffe ; révision annuelle des fours et brûleurs
- **Points de vigilance :** Bouchage buses → défaut de couverture vernis ; température four instable → défauts de polymérisation ; accumulation de solvants → risque ATEX/incendie
- **Pièces de rechange critiques :** Buses, pompes à diaphragme, joints PTFE, résistances chauffantes, filtres à cartouches
- **Coût d'arrêt :** 1 500–3 000 €/heure

#### Machines de sérigraphie / Decorating
- **Fréquence :** Maintenance préventive quotidienne (nettoyage tampons/raclettes) ; réglage mensuel ; révision semestrielle
- **Points de vigilance :** Usure des tampons silicone → défaut d'impression ; encrages mal réglés → rejets qualité ; alignment caméras vision → défauts de contrôle
- **Pièces de rechange critiques :** Tampons silicone, raclette, encres (consommable), éclairage UV, capteurs vision
- **Coût d'arrêt :** 1 000–2 500 €/heure

#### Fours de recuit
- **Fréquence :** Contrôle quotidien des températures ; maintenance mensuelle brûleurs et échangeurs ; révision annuelle
- **Points de vigilance :** Dérive thermique → contraintes résiduelles dans l'aluminium → fissures en emboutissage ; fuite gaz → risque explosion
- **Pièces de rechange critiques :** Thermocouples, brûleurs, soufflante, joints de porte
- **Coût d'arrêt :** 3 000–6 000 €/heure (bouteille thermique à reconstituer)

#### Dépoussiéreurs / Installations ATEX
- **Fréquence :** Contrôle quotidien du niveau de filtration ; maintenance mensuelle des écluses et ventilateurs ; audit trimestriel des mises à la terre et étanchéité
- **Points de vigilance :** Dépôt de poussière > 1 mm → risque d'explosion secondaire ; électricité statique → source d'inflammation ; écluse rotative bloquée → surcharge ventilateur
- **Pièces de rechange critiques :** Filtres, écluse rotative, ventilateur ATEX, joints, tresses de masse
- **Coût d'un incident :** Potentiellement millions d'euros (arrêt long, expertise, réparations, assurance, image)

---

## 2. TYPES DE MAINTENANCE NÉCESSAIRES ET RÉPARTITION RECOMMANDÉE

### 2.1 Les 4 piliers de la maintenance dans une usine de capsules

Dans ce type d'usine (production en continu, forte cadence 400–800 capsules/minute, contraintes qualité élevées), la stratégie maintenance doit être pensée comme suit :

| Type de maintenance | Définition | Application concrète dans l'usine | % du temps maintenance cible |
|--------------------|-----------|-----------------------------------|------------------------------|
| **Préventif Systématique (Calendaire)** | Interventions planifiées selon temps d'usage ou date | Changement filtres, vidanges, graissage périodique, contrôle sécurité gaz, nettoyage circuits vernis | **35 %** |
| **Préventif Conditionnel (Predictive)** | Interventions déclenchées par l'état réel de l'équipement | Analyse vibratoire des presses, thermographie électrique, surveillance température four, analyse huile, endoscopie | **25 %** |
| **Correctif Programmé** | Réparation planifiée suite à diagnostic sans arrêt immédiat | Remplacement d'un joint qui fuit légèrement, reprogrammation automate, réglage dérive | **20 %** |
| **Curatif (Panne)** | Intervention urgente suite à arrêt non planifié | Bris matrice, panne pompe vernis, défaut électrique, blocage emballeuse | **20 %** |

> **Benchmark sectoriel :** Une usine mature vise 60 % de maintenance préventive (systématique + conditionnel) contre 40 % de correctif/curatif. Une usine en mode "papier + Excel" atteint rarement plus de 30 % de préventif — le reste est du curatif réactif, coûteux et stressant.

### 2.2 Préventif conditionnel — Outils et fréquences recommandées

| Technique | Équipements ciblés | Fréquence | Seuils d'alerte |
|-----------|-------------------|-----------|-----------------|
| **Analyse vibratoire** | Presses d'emboutissage, ventilateurs ATEX | Mensuelle | ISO 10816 — alerte au-dessus de 7,1 mm/s RMS |
| **Thermographie électrique** | Armoires électriques, coffrets moteurs, barres cuivre | Trimestrielle | Écart > 15 °C par rapport à la référence |
| **Analyse d'huile** | Compresseurs, boîtes de vitesse presses | Semestrielle | Taux de particules ferreuses, viscosité, eau |
| **Ultrasons fuites** | Réseau air comprimé, circuits pneumatiques | Semestrielle | Coût d'une fuite de 3 mm : ~1 000 €/an |
| **Endoscopie** | Four de recuit (brûleurs), conduits ventilation | Annuelle | Détection de fissures, encrassement |
| **Contrôles non destructifs (CNT)** | Matrices et poinçons presses | Annuelle | Fissuration, usure dimensionnelle |

### 2.3 Pourquoi le préventif conditionnel est particulièrement pertinent ici

Dans l'emboutissage aluminium, la dégradation des matrices ne suit pas un profil linéaire : une matrice peut tenir 8 millions de coups puis casser brutalement en 2 heures. Le conditionnel (comptage de coups, suivi des vibrations, mesures dimensionnelles des pièces produites) permet d'anticiper cette rupture et de planifier le changement en arrêt programmé.

---

## 3. PROCESSUS MÉTIER À DIGITALISER (PRIORISATION)

### 3.1 Matrice de priorisation

| Rang | Processus métier | Priorité | Justification | Complexité de mise en œuvre | Impact ROI |
|------|-----------------|----------|---------------|----------------------------|------------|
| **1** | **Demande d'intervention / Bon de travail (BT)** | 🔴 CRITIQUE | C'est le flux de base. Sans BT numérique, aucune traçabilité, aucun historique, aucun calcul de KPI. | Faible | Très élevé |
| **2** | **Planification maintenance préventive** | 🔴 CRITIQUE | Permet de passer du curatif au préventif. Génère automatiquement les tâches périodiques. | Faible | Très élevé |
| **3** | **Gestion des interventions urgentes (pannes)** | 🔴 CRITIQUE | Impact direct sur la production. Nécessite alerte immédiate, suivi temps réel, escalade. | Moyenne | Très élevé |
| **4** | **Gestion des pièces de rechange / stock** | 🟠 ÉLEVÉE | 25 % des pannes sont dues à l'indisponibilité de pièces. Stock dormant = trésorerie dormante. | Moyenne | Élevé |
| **5** | **Suivi du temps de travail par intervention** | 🟠 ÉLEVÉE | Indispensable pour calculer MTTR, coûts horaires, productivité des techniciens. | Faible | Élevé |
| **6** | **Documentation technique attachée aux équipements** | 🟡 MOYENNE | Accès immédiat aux plans, notices, schémas électriques depuis le terrain. Gagne 15–30 min/intervention. | Faible | Moyen |
| **7** | **Reporting et KPIs (MTTR, MTBF, TRS, coûts)** | 🟡 MOYENNE | Nécessite que les processus 1–5 fonctionnent. Permet le pilotage par la direction. | Moyenne | Élevé |

### 3.2 Description détaillée des 7 processus à digitaliser

#### Processus 1 — Demande d'intervention / Bon de travail (BT)
**Actuellement :** L'opérateur de production remplit un papier à la main, le dépose dans une boîte, le responsable maintenance le récupère quand il passe, le retranscrit dans un Excel le soir ou le week-end. Résultat : 30 % des demandes sont perdues, 50 % sont incomplets (pas de localisation précise, pas de description du défaut), aucun historique structuré.

**Digitalisé :**
- Opérateur scanne un QR code sur la machine → formulaire pré-rempli (n° machine, localisation, photo possible)
- Description du défaut via liste déroulante + champ libre
- Catégorisation automatique : panne / réglage / amélioration / sécurité
- Notification push au responsable maintenance et au technicien de zone
- Suivi en temps réel : demandée → affectée → en cours → terminée → validée

**Gain estimé :** -20 à -30 % de temps de préparation des interventions ; élimination des pertes de demandes.

#### Processus 2 — Planification maintenance préventive
**Actuellement :** Le responsable maintenance tient un fichier Excel avec des dates. Il doit vérifier manuellement ce qui est dû, imprimer des fiches, les distribuer. Souvent, le préventif est "repoussé" parce qu'on n'a pas le temps ou les pièces.

**Digitalisé :**
- Plan de maintenance préventive paramétré par équipement (fréquence en jours/heures de fonctionnement/nombre de pièces produites)
- Génération automatique des bons de travail préventifs
- Alertes 7 jours avant échéance
- Visualisation sur planning Gantt par technicien et par zone
- Report avec justification obligatoire (traçabilité pour audits)

**Gain estimé :** +15 % de préventif réalisé sur le plan ; baisse de 25 à 50 % des pannes imprévues sur les équipements couverts.

#### Processus 3 — Gestion des interventions urgentes (pannes)
**Actuellement :** L'opérateur appelle le chef d'équipe au talkie-walkie. Le chef appelle le technicien. Le technicien arrive, découvre le problème, revient chercher des pièces, repart, appelle un collègue... Temps perdu en allers-retours et en communication : 40 % du MTTR.

**Digitalisé :**
- Déclenchement d'alerte multi-canal (push, SMS, e-mail) avec priorisation par criticité machine
- Fiche panne avec diagnostic pré-rempli (historique des pannes similaires sur cette machine)
- Check-list de sécurité intégrée (consignation, ATEX, EPI)
- Saisie temps réel des actions réalisées, pièces consommées, temps passé
- Escalade automatique si MTTR dépasse un seuil défini (ex: 2h pour une presse)

**Gain estimé :** Réduction du MTTR de 25 à 40 % ; amélioration de la disponibilité de +5 à +8 points.

#### Processus 4 — Gestion des pièces de rechange / stock
**Actuellement :** Stock dans un local, inventaire annuel (souvent désastreux), pas de lien entre consommation et machines. On découvre qu'on n'a plus de joint quand on en a besoin. On commande en urgence (délai allongé, coût +30 %).

**Digitalisé :**
- Référentiel pièces de rechange lié aux équipements (nomenclature par machine)
- Seuils de stock minimum avec alerte automatique
- Réservation de pièces sur le BT avant intervention
- Suivi des consommations par machine et par type de panne
- Identification des pièces dormantes (pas consommées en 24 mois)

**Gain estimé :** -10 à -20 % sur la valeur du stock ; -30 % sur les commandes en urgence ; réduction des arrêts pour indisponibilité de pièces de 50 %.

#### Processus 5 — Suivi du temps de travail par intervention
**Actuellement :** Les techniciens notent approximativement leurs heures sur des feuilles. Le responsable les additionne le vendredi soir. Précision : ±20 %. Impossible de savoir si une intervention de 4h était justifiée ou si on aurait pu faire mieux.

**Digitalisé :**
- Chrono intégré dans l'application mobile : démarrage → pause → reprise → fin
- Saisie des temps par type d'activité : diagnostic, réparation, essai, attente pièce, attente production
- Comptage automatique des heures par technicien, par machine, par type de panne
- Détection des anomalies : une intervention sur joint presse ne devrait pas durer 6h

**Gain estimé :** Productivité maintenance +15 % ; visibilité sur les postes de "perte de temps" (attente, déplacement).

#### Processus 6 — Documentation technique attachée aux équipements
**Actuellement :** Les notices et schémas sont dans des classeurs dans le bureau du chef, ou dans des cartons au fond de l'atelier. Le technicien sur la ligne 3 à 2h du matin cherche le schéma électrique de l'emballeuse pendant 20 minutes. Il n'a pas la bonne version.

**Digitalisé :**
- Document attaché à chaque fiche équipement : plans, schémas électriques, notices constructeur, procédures de réglage, photos de référence
- Accès hors ligne sur smartphone/tablette du technicien
- Versionning des documents (on sait quelle version est en vigueur)
- Procédures de maintenance intégrées (étapes à suivre, couples de serrage, EPI requis)

**Gain estimé :** -15 à -30 min par intervention ; réduction des erreurs de réglage ; homogénéisation des pratiques.

#### Processus 7 — Reporting et KPIs (MTTR, MTBF, TRS, coûts)
**Actuellement :** Le responsable maintenance passe un week-end par mois à compiler des données incohérentes dans PowerPoint. La direction ne croit pas les chiffres. On ne sait pas si on progresse.

**Digitalisé :**
- Tableaux de bord automatiques mis à jour en temps réel
- KPIs standards : MTTR (Mean Time To Repair), MTBF (Mean Time Between Failures), Taux de disponibilité, TRS (Taux de Rendement Synthétique), coût maintenance/tonne produite
- KPIs métier : coût panne presse vs. coût panne emballeuse, taux de réalisation du préventif, stock pièces valeur et rotation
- Export mensuel pour la direction (PDF auto-généré)

**Gain estimé :** Temps de reporting -80 % ; décisions basées sur des données fiables ; pilotage proactif au lieu de réactif.

---

## 4. RÉGLEMENTATIONS ET SÉCURITÉ

### 4.1 Contraintes réglementaires applicables

| Réglementation | Champ d'application | Impact sur la maintenance | Exigences spécifiques |
|---------------|--------------------|--------------------------|----------------------|
| **Directive ATEX 2014/34/UE + 1999/92/CE** | Poussières d'aluminium combustibles | 🔴 CRITIQUE | Zonage ATEX (zones 20/21/22), matériel certifié Ex, maintenance des évents d'explosion, écluses, mise à la terre, nettoyage sans nuage de poussière |
| **Code du travail — R. 4216-31 et R. 4227-42 à R. 4227-54** | Lieux de travail avec atmosphères explosives | 🔴 CRITIQUE | Document de protection contre les explosions (DRPCE), évaluation des risques, formation du personnel, consignation électrique spécifique ATEX |
| **Règlement (UE) 1935/2004 + contact alimentaire** | Capsules en contact avec des boissons | 🟠 ÉLEVÉE | Maintenance des surfaces en contact (pas de contamination), traçabilité des interventions sur lignes de laquage/sérigraphie (risque migration substances) |
| **NF EN ISO 13849-1 / EN 60204-1** | Sécurité des machines / Équipements électriques | 🟠 ÉLEVÉE | Vérifications périodiques des dispositifs de sécurité (barrières immatérielles, arrêts d'urgence, contacteurs de porte), vérifications électriques quadriennale |
| **Décret n° 2010-1118 (TR-2010)** / **Arrêté du 25 mars 1980** | Appareils à pression | 🟡 MOYENNE | Vérification périodique des réservoirs air comprimé, détendeurs, soupapes de sécurité |
| **Norme EN 60079-17** | Inspection et maintenance des installations ATEX | 🟠 ÉLEVÉE | Contrôles visuels périodiques, contrôles détaillés, contrôles d'étanchéité, traçabilité dans la GMAO |

### 4.2 Spécificité ATEX — Poussières d'aluminium

L'aluminium est un métal **hautement combustible en poussière fine** (classe St 3, Kst pouvant atteindre 1 100 bar.m.s⁻¹). Dans une usine de capsules :

- **Zone 20** possible : à l'intérieur des dépoussiéreurs, séparateurs, écluses rotatives
- **Zone 21** probable : autour des presses d'emboutissage (où les poussières se déposent), circuits de transport de copeaux
- **Zone 22** possible : zones de stockage bandes, entrepôts si dépôts de poussière > 1 mm

**Implications maintenance :**
1. **Nettoyage :** Interdiction d'utiliser de l'air soufflé (nuage de poussière). Obligation d'aspiration industrielle ATEX. Les dépôts de poussière doivent être maintenus < 1 mm d'épaisseur.
2. **Électricité statique :** Toutes les masses métalliques (conduits, machines, structures) doivent être interconnectées et mises à la terre. Les tresses de masse font l'objet de contrôles périodiques à tracer.
3. **Permis de feu :** Tout travail par points chauds (soudure, meulage) en zone ATEX nécessite un permis de feu avec contrôle d'atmosphère.
4. **Consignation :** Procédure de consignation électrique spécifique en zone ATEX — les sources d'inflammation doivent être éliminées avant intervention.
5. **Matériel mobile :** Outillage électrique portatif (perceuses, lampes) utilisé en zone ATEX doit être certifié II 2D ou 3D selon le zonage.

> **Point de vigilance critique :** La GMAO doit permettre de tracer toutes les interventions sur équipements ATEX (quand, qui, quoi, avec quel matériel). C'est une exigence légale de démontrer la maintenance des systèmes de protection.

### 4.3 Sécurité machines — Vérifications réglementaires

| Équipement / Dispositif | Fréquence de contrôle | Document associé dans GMAO |
|------------------------|-----------------------|---------------------------|
| Arrêts d'urgence et boutons coup-de-poing | Mensuel | Fiche de contrôle préventive |
| Barrières immatérielles et tapis sensitifs | Trimestriel | Fiche de contrôle + rapport |
| Contacteurs de portes sécurisées | Trimestriel | Fiche de contrôle |
| Mise à la terre et liaisons équipotentielles ATEX | Trimestriel | Fiche de contrôle + photo |
| Évents d'explosion dépoussiéreurs | Semestriel | Fiche de contrôle + mesure |
| Écluses rotatives ATEX | Mensuel | Fiche de contrôle |
| Réservoirs air comprimé | Vérification périodique réglementaire | Certificat + fiche révision |
| Vérification électrique générale (TER, isolement) | Quadriennale | PV de vérification |

---

## 5. ORGANISATION MAINTENANCE RECOMMANDÉE

### 5.1 Modèle d'organisation pour démarrer la digitalisation

Pour une usine de capsules aluminium avec 4–8 lignes, 3 à 6 techniciens maintenance et un responsable maintenance, je recommande le modèle suivant :

#### Structure : Maintenance par zones + équipe de permanence

| Fonction | Rôle | Nombre | Missions |
|----------|------|--------|----------|
| **Responsable Maintenance** | Pilote la fonction, planification, reporting, relation fournisseurs | 1 | Planification préventif, analyse KPIs, gestion budget, amélioration continue |
| **Techniciens Maintenance Zone A** | Presses + Découpe + Recuit | 1–2 | Interventions curatives et préventives sur zone A, fiches terrain GMAO |
| **Techniciens Maintenance Zone B** | Laquage + Sérigraphie + Emballage | 1–2 | Interventions curatives et préventives sur zone B, fiches terrain GMAO |
| **Technicien Électrique/Automatisme** | Toutes zones — spécialiste élec/PLC | 1 | Pannes électriques, modifications automates, paramétrages, sécurité |
| **Agent maintenance multi-qualifié** | Permanence nuit/we | 1 (si production 3×8) | Dépannage de nuit, sécurisation, consignation, remise en service |

> **Pourquoi pas une maintenance centralisée ?** Dans une usine de capsules, les machines sont spécialisées et l'expertise métier est importante (un technicien qui connait les presses depuis 5 ans résout un problème 3× plus vite qu'un généraliste). Le modèle par zone permet de capitaliser cet expertise. La GMAO viendra consolider les données de toutes les zones dans un référentiel unique.

### 5.2 Organisation temporelle — Équipes de jour/nuit

| Mode de production | Organisation maintenance | Couverture |
|--------------------|------------------------|------------|
| **5×8 (1 équipe)** | 1 technicien de jour + astreinte téléphonique soir | Préventif le matin (6h–8h), curatif en continu |
| **3×8 (3 équipes)** | 1 technicien de jour + 1 permanencier nuit | Préventif en début de matinée, curatif 24/7 |
| **Continu (7j/7)** | 2×8 de jour + 1 de nuit + week-end | Préventif dimanche matin ou en roulement |

**Recommandation pour démarrer :**
- Si production 5×8 : 1 responsable + 2 techniciens mécano + 1 électricien. Préventif planifié en début de semaine (lundi–mardi matin).
- Curatif : système d'astreinte avec prime d'intervention (à tracer dans la GMAO pour le suivi).

### 5.3 Rôles dans la GMAO

| Profil | Droit dans la GMAO | Actions principales |
|--------|-------------------|---------------------|
| Opérateur production | Lecture + création BT | Créer une demande d'intervention, consulter état de sa demande |
| Technicien maintenance | Lecture + écriture sur ses BT | Consulter BT affecté, saisir temps, pièces consommées, clôturer |
| Responsable maintenance | Administrateur | Planifier, affecter, reporter, consulter KPIs, gérer stock, paramétrer plans préventifs |
| Direction | Lecture dashboards | Consulter indicateurs, coûts, disponibilité |

---

## 6. PIÈGES ET RISQUES DU PASSAGE PAPIER → DIGITAL

### 6.1 Les 10 écueils classiques et comment les éviter

| N° | Piège / Risque | Conséquence | Antidote |
|----|---------------|-------------|----------|
| **1** | **Vouloir tout digitaliser d'un coup** | Échec du projet, surcharge des équipes, abandon au bout de 3 mois | Prioriser (cf. §3). Démarrer par BT + planification préventive. Ajouter les modules progressivement (approche agile). |
| **2** | **Choisir une GMAO trop complexe** | Les techniciens ne s'en servent pas, retour au papier | Sélectionner une GMAO simple, mobile-first, avec interface intuitive. Tester avec les techniciens avant d'acheter. |
| **3** | **Ne pas impliquer les techniciens terrain** | Résistance au changement, sabotage passif ("ça marche pas", "c'est plus long") | Co-construire avec les techniciens. Désigner un "champion" maintenance qui accompagne ses collègues. Montrer les bénéfices pour eux (moins de paperasse, moins de déplacements inutiles). |
| **4** | **Saisir les données historiques papier dans la GMAO** | Mois de travail fastidieux, données de mauvaise qualité | Ne pas saisir l'historique papier. Démarrer à J=0 avec les données propres. Seuls les gros équipements critiques nécessitent une reprise d'historique (3 dernières pannes suffisent). |
| **5** | **Oublier la connexion réseau en atelier** | La GMAO nécessite le WiFi. Sans couverture, les techniciens ne peuvent pas saisir en temps réel | Vérifier la couverture WiFi/4G en atelier AVANT d'acheter la GMAO. Prévoir des tablettes avec mode hors ligne si nécessaire. |
| **6** | **Sous-estimer le temps de paramétrage initial** | Le responsable maintenance passe 3 week-ends à créer les fiches équipements. Le projet patine. | Prévoir 5 à 10 jours de temps dégagé pour le paramétrage initial. Découper le paramétrage par zone. Utiliser l'import Excel si disponible. |
| **7** | **Ne pas définir les règles de nommage et codification** | Chaque technicien nomme la machine "presse 1", "ligne A", "vieille presse" → données inexploitables | Établir un référentiel unique avant démarrage : code machine (PR-001, LQ-002...), nomenclature pièces, types de pannes. Documenter et diffuser. |
| **8** | **Laisser la GMAO devenir un "cimetière de données"** | Personne ne consulte l'historique, les pannes se répètent | Instaurer un rituel mensuel : revue des pannes récurrentes avec les techniciens, analyse des causes racines, actions correctives tracées dans la GMAO. |
| **9** | **Ne pas former** | Les techniciens utilisent 10 % des fonctionnalités, le ROI n'est pas atteint | Formation initiale 2h par groupe + fiches récapitulatives A4 laminées. Session de rappel à 1 mois. |
| **10** | **Négliger le lien avec la production** | L'opérateur continue d'appeler au talkie au lieu de passer par la GMAO | Systématiser : pas de BT papier accepté. Le chef de production doit aussi être formé et impliqué. |

### 6.2 Check-list de réussite du projet GMAO

- [ ] WiFi/4G opérationnel en atelier
- [ ] Référentiel machines et pièces validé
- [ ] Techniciens formés et 1 "champion" identifié
- [ ] Module BT + planification préventive opérationnels (phase 1)
- [ ] Direction informée et dashboards accessibles
- [ ] Pas de double saisie (papier + digital) — coupure nette
- [ ] Révision mensuelle des données avec les techniciens

---

## 7. BUSINESS CASE — ROI ESTIMÉ DE LA DIGITALISATION

### 7.1 Hypothèses de l'usine cible

| Paramètre | Valeur |
|-----------|--------|
| Nombre de lignes de production | 4 |
| Équipements répertoriés | ~80 (machines + sous-ensembles) |
| Techniciens maintenance | 4 (2 mécano, 1 élec, 1 polyvalent) |
| Responsable maintenance | 1 |
| Production | 5×8 + astreinte |
| Budget maintenance annuel estimé | 400 000 € (main d'œuvre interne, pièces, sous-traitance) |
| Coût horaire arrêt production moyen | 2 500 €/h |
| Heures d'arrêt non planifié actuel | 200 h/an |

### 7.2 Investissement GMAO (estimation)

| Poste | Coût |
|-------|------|
| Abonnement GMAO SaaS (année 1) | 6 000 – 12 000 € |
| Paramétrage et accompagnement | 5 000 – 10 000 € |
| Tablettes/smartphones + supports | 2 000 – 4 000 € |
| Formation équipes (5 jours) | 3 000 – 5 000 € |
| Temps interne responsable maintenance | 4 000 € |
| **Total année 1** | **20 000 – 35 000 €** |
| Années 2 et 3 (abonnement + support) | 8 000 – 15 000 €/an |

### 7.3 Gains attendus (conservateurs)

| Levier de gain | Hypothèse | Gain annuel |
|----------------|-----------|-------------|
| Réduction pannes imprévues | -25 % sur 200h = 50h gagnées | 50h × 2 500 € = **125 000 €** |
| Réduction temps de préparation | -25 % sur ~400 interventions/an × 30 min | ~1 500h gagnées à 40 €/h = **60 000 €** |
| Optimisation stock pièces | -15 % sur stock de 80 000 € | **12 000 €** de trésorerie libérée/an |
| Réduction commandes en urgence | -30 % sur 40 000 €/an de pièces urgentes | **12 000 €** |
| Productivité techniciens | -15 % de temps perdu (attente, déplacement) | **25 000 €** |
| Reporting et décisions | Temps responsable maintenance : 2j/mois → 4h/mois | **8 000 €** |
| **Total gains annuels** | | **242 000 €** |

### 7.4 Calcul du ROI

| Indicateur | Valeur |
|------------|--------|
| Investissement année 1 | 30 000 € (médiane) |
| Gains annuels récurrents | 242 000 € |
| **ROI année 1** | **(242 000 – 30 000) / 30 000 × 100 = 707 %** |
| **Payback (temps de retour)** | **~1,5 mois** |
| ROI sur 3 ans (avec investissement total 55 000 €) | **> 1 200 %** |

> **Même en divisant les gains par deux pour rester très prudent** (hypothèse pessimiste : 121 000 € de gains), le ROI reste supérieur à 400 % et le payback à 3 mois.

### 7.5 Argumentaire pour convaincre la direction

**Ce qu'une GMAO apporte concrètement à la direction :**

1. **Visibilité financière instantanée** : "Combien nous coûte la maintenance cette année ?" → réponse en 3 clics, pas en 3 jours de compilation Excel.

2. **Prédictibilité** : Savoir quelles machines vont tomber en panne avant qu'elles ne tombent. Planifier les arrêts en accord avec la production, pas subir les pannes.

3. **Réduction du risque ATEX** : Traçabilité complète des contrôles sécurité. En cas d'accident ou d'inspection DREAL, la direction peut prouver la maintenance régulière des systèmes de protection.

4. **Amélioration de l'image employeur** : Les jeunes techniciens veulent travailler avec des outils modernes. Une GMAO mobile aide à recruter et à fidéliser.

5. **Condition pour toute certification** : ISO 9001, ISO 14001, BRC (contact alimentaire), IFS — toutes exigent une traçabilité des interventions et un système documenté. La GMAO en est le socle.

---

## 8. PLAN DE DÉPLOIEMENT RECOMMANDÉ (PHASAGE)

### Phase 1 — Fondations (Mois 1–2)
- Choix et contractualisation GMAO
- Déploiement WiFi/tablettes
- Création du référentiel machines (80 fiches)
- Paramétrage des plans de maintenance préventive (20 tâches récurrentes)
- Formation initiale équipes

### Phase 2 — Cœur de métier (Mois 3–4)
- Mise en production du BT numérique (arrêt total papier)
- Lancement des préventifs planifiés
- Gestion du stock pièces dans la GMAO
- Tableau de bord mensuel pour la direction

### Phase 3 — Optimisation (Mois 5–6)
- Analyse des premiers KPIs, ajustement des plannings
- Ajout documentation technique
- Intégration des contrôles ATEX et sécurité machines
- Revue des pannes récurrentes, actions correctives

### Phase 4 — Maturité (Mois 7–12)
- Connexion capteurs conditionnels (IoT) si pertinent
- Maintenance prédictive avancée sur presses critiques
- Optimisation continue des stocks et des plannings
- Préparation certification (ISO, BRC, etc.)

---

## CONCLUSION ET RECOMMANDATIONS

La digitalisation de la maintenance dans une usine de capsules aluminium n'est pas un luxe technologique — c'est une **nécessité opérationnelle et réglementaire**.

**Les 3 priorités absolues sont :**
1. **Digitaliser le Bon de Travail** — c'est la base de toute traçabilité
2. **Structurer le préventif** — c'est le levier le plus puissant pour réduire les pannes
3. **Tracer les contrôles ATEX** — c'est une obligation légale dont la non-conformité peut coûter l'arrêt du site

**Les 3 facteurs clés de succès sont :**
1. **Simplicité** — une GMAO que les techniciens utilisent réellement sur le terrain
2. **Implication** — co-construire avec les équipes, ne pas imposer d'en haut
3. **Cohérence** — ne jamais garder le double flux papier/digital

**Le ROI est indiscutable :** pour un investissement de ~30 000 € la première année, les gains attendus dépassent 200 000 €/an. Le retour sur investissement est atteint en moins de 2 mois.

**Ma recommandation opérationnelle :** Lancer un appel d'offres restreint auprès de 3 éditeurs de GMAO SaaS adaptées aux PME industrielles, avec un pilote de 3 mois sur une zone (presse + laquage) avant déploiement généralisé.

---

*Document rédigé dans un objectif de soutien à la décision. Les chiffres présentés sont des estimations sectorielles à adapter au contexte spécifique de l'usine. Une analyse fine du terrain (walkdown, entretiens techniciens, audit documentaire) permettra d'affiner ces préconisations.*
