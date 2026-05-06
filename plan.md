# Plan — Développement GMAO Ramondin (Frontend + Backend)

## Objectif
Développer et déployer une application GMAO fonctionnelle pour Ramondin.
- **Frontend** : React SPA déployée en démo interactive (PWA-ready, mock data)
- **Backend** : Code source Node.js + Express + Prisma + PostgreSQL généré pour hébergement local
- **Docker** : `docker-compose.yml` pour déploiement sur serveur dédié usine

## Architecture
- **Frontend** : React 19 + TypeScript + Vite + Tailwind + shadcn/ui + HashRouter (PWA, mode offline simulé)
- **Backend** : Node.js 20 + Express + TypeScript + Prisma ORM + PostgreSQL 16 + JWT Auth
- **Docker** : Docker Compose (Nginx + Frontend + API + PostgreSQL + Redis)

## Phase 1 : Init (Main Agent)
- Initialiser le projet webapp avec `init-webapp.sh`
- Préparer les specs fonctionnelles pour le Designer

## Phase 2 : Design (Pro_Designer)
- Créer le design system industriel (UI métier : tableaux, kanban, formulaires, dashboard)
- Design des écrans : Login, Dashboard, Équipements, BT (liste + exécution), Préventif, Stocks, Opérateur

## Phase 3 : Scaffold (Main Agent + Scaffold Agent)
- Scaffold : Layout, Navbar, Auth context, Router, Dashboard, mock data réalistes
- Générer le code backend complet dans un dossier séparé `/backend/`

## Phase 4 : Parallel Agents
- Agent 1 : Module Équipements (CRUD, arborescence, QR codes, fiche équipement)
- Agent 2 : Module Bons de Travail (liste, kanban, création, planification, exécution terrain, clôture)
- Agent 3 : Module Préventif + Stocks + Portail Opérateur
- Agent 4 : Module Reporting + ATEX + Admin

## Phase 5 : Merge, Build, Deploy
- Merger toutes les branches
- Builder le frontend
- Déployer la démo
- Livrer le code backend

## Livrables
1. Frontend déployé (démo interactive)
2. Code backend complet dans `/mnt/agents/output/app/backend/`
3. `docker-compose.yml` et scripts de déploiement
