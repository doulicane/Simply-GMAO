# Architecture V2 — GMAO Simply GMAO

## Version
2.0 — Sprint 14

## Vue d'ensemble
La V2 prépare l'extension multi-zone, l'intégration ERP/SCADA et l'authentification SSO.

## Nouveaux composants

### 1. Connecteur SCADA
- **Endpoint** : `POST /api/v1/compteurs/push`
- **Auth** : API Key (`X-API-Key`)
- **Données** : equipmentCode, valeur, unite, timestamp
- **Stockage** : `CompteurReleve` + mise à jour `Equipment.compteurActuel`
- **Notification** : WebSocket `scada:counter`

### 2. Connecteur ERP (design)
- **Pattern** : Webhook + Polling
- **Auth** : API Key (`X-ERP-API-Key`)
- **Entités** : StockItems, StockMovements, Equipments, MaintenanceCosts
- **Status** : Spec complète, implémentation S15-S16

### 3. SSO / Active Directory
- **Protocole** : SAML 2.0
- **Librairie** : passport-saml
- **IdP** : ADFS Simply GMAO
- **Mapping** : Groupes AD → Rôles GMAO
- **Fallback** : JWT classique si SAML indisponible

### 4. Préférences utilisateur
- **Modèle** : `UserPreference` (dashboardLayout, theme, language)
- **Stockage** : PostgreSQL + localStorage (cache)
- **API** : `GET/PUT /api/preferences`

## Extensions prévues

### Multi-zone
- Duplication rapide équipements (`POST /api/equipments/:id/duplicate`)
- Import CSV batch pour Zone B
- Dashboard filtrable par zone

### Performance
- Index DB ajoutés sur tous les champs de recherche fréquente
- Cache Redis sur KPIs (TTL 5 min)
- Code splitting Vite (vendor/ui/charts)

### Sécurité
- API Keys séparées par connecteur (SCADA, ERP)
- Rotation certificats SAML annuelle
- Audit trail étendu aux connecteurs externes

## Roadmap V2
| Sprint | Focus | Livrables |
|--------|-------|-----------|
| S13 | Amorçage | Specs ERP/SCADA, duplication équipements, index DB |
| S14 | SSO + Reporting | Design SAML, préférences utilisateur, export multi-critères |
| S15 | Intégration ERP | Webhooks, polling stock, synchro bidirectionnelle |
| S16 | Intégration SCADA | Tests SCADA réel, optimisations, documentation |
| S17 | Production SSO | Déploiement ADFS, fallback, hypercare |
