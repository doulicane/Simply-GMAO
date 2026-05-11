# Research Findings — GMAO Simply GMAO

## Contexte Entreprise
Simply GMAO : leader mondial capsules aluminium pour vins/spiritueux. 3 milliards d'unités/an, 500-1000 employés, sites Espagne (Laguardia), France (Saint-Gaudens, Troyes), USA (Napa), Chili. Production en 3×8. Certifications ISO 9001, 14001, HACCP.

## Équipements Critiques (à digitaliser)
1. Presses d'emboutissage (CRITIQUE) — matrices 15-80K€, arrêt 2-5K€/h
2. Lignes de laquage (CRITIQUE) — buses, solvants, risque ATEX
3. Machines sérigraphie/decorating (ÉLEVÉE)
4. Emballeuses/Flow-pack (ÉLEVÉE)
5. Four de recuit (CRITIQUE) — brûleurs, thermocouples
6. Compresseurs/air comprimé (CRITIQUE)
7. Dépoussiéreurs/installations ATEX (CRITIQUE SÉCURITÉ)
8. Ligne découpe/blanking (MOYENNE)

## Réglementations
- ATEX 2014/34/UE + 1999/92/CE : poussières aluminium combustibles (St 3, Kst 1100)
- Contact alimentaire UE 1935/2004
- Sécurité machines ISO 13849-1 / EN 60204-1
- EN 60079-17 : inspection installations ATEX

## Profils Utilisateurs
- Opérateur Production (20-50) : déclaration panne simplifiée, scan QR
- Technicien Maintenance (4-8) : exécution BT, checklists, mode offline
- Responsable Maintenance (1) : planification Kanban, validation, KPIs
- Magasinier (1-2) : mouvements stock, inventaire
- Direction (2-3) : dashboards, reporting
- HSE/Qualité (1-2) : contrôles ATEX, traçabilité

## Modules Fonctionnels
1. Gestion Actifs (arborescence site→zone→ligne→machine→sous-ensemble, QR codes)
2. Bons de Travail (workflow : Créé→Planifié→En cours→Terminé→Clôturé)
3. Maintenance Préventive (temporelle + conditionnelle, auto-génération BT)
4. Stocks/Pièces de rechange (alertes minimum, réservation sur BT)
5. Documentation Technique (upload PDF, consultation hors-ligne)
6. Reporting & KPIs (MTTR, MTBF, taux disponibilité)
7. Portail Opérateurs (déclaration 30 sec, scan QR machine)
8. Admin/ATEX/Sécurité (RBAC, consignation, permis de feu, audit trail)

## Stack Technique
Frontend: React 18 + TypeScript + Vite + Tailwind + shadcn/ui + PWA (Workbox)
Backend: Node.js 20 + Express + TypeScript + PostgreSQL 16 + Prisma
Déploiement: Docker + Docker Compose, serveur dédié local Ubuntu 22.04
