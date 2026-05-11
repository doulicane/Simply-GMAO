# Spécification Technique — Connecteur ERP GMAO Simply GMAO

## Version
1.0 — Sprint 13 (V2 Amorçage)

## Objectif
Synchroniser les données entre la GMAO Simply GMAO et le système ERP de l'entreprise (SAP B1 / Sage / autre) pour :
- **Articles de stock** : création, mise à jour des quantités, mouvements
- **Commandes d'achat** : génération automatique lors des ruptures de stock
- **Équipements** : synchronisation du référentiel actif
- **Coûts maintenance** : remontée des coûts BT pour analyse financière

## Architecture

```
┌─────────────┐     Webhook / Polling      ┌─────────────┐
│   ERP       │ <───────────────────────>  │  GMAO API   │
│  (externe)  │    REST JSON + API Key     │  (interne)  │
└─────────────┘                            └─────────────┘
```

## Authentification
- **Méthode** : API Key dans le header `X-ERP-API-Key`
- **Validation** : comparaison avec `ERP_API_KEY` en variable d'environnement
- **Rate limiting** : 100 req/min par clé

## Endpoints

### 1. Articles de stock

#### `GET /api/v1/erp/stock-items`
Liste des articles synchronisables.

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "code": "ART-001",
      "name": "Roulement 6204",
      "famille": "Mécanique",
      "quantite": 12,
      "stockMinimum": 5,
      "prixUnitaire": 12.50,
      "localisation": "Magasin A",
      "fournisseur": "SKF"
    }
  ]
}
```

#### `POST /api/v1/erp/stock-items/sync`
Synchronisation bidirectionnelle.

**Body** :
```json
{
  "direction": "push",
  "items": [
    { "code": "ART-001", "quantite": 15 }
  ]
}
```

### 2. Mouvements de stock

#### `POST /api/v1/erp/stock-movements`
Enregistrement d'un mouvement depuis l'ERP.

**Body** :
```json
{
  "stockItemCode": "ART-001",
  "type": "ENTREE",
  "quantite": 10,
  "date": "2025-06-15T10:00:00Z",
  "referenceERP": "BL-2025-00123"
}
```

### 3. Équipements

#### `GET /api/v1/erp/equipments`
Export du référentiel équipements.

### 4. Coûts maintenance

#### `GET /api/v1/erp/maintenance-costs`
Résumé des coûts par période.

**Query** : `?from=2025-01-01&to=2025-06-30`

**Réponse** :
```json
{
  "success": true,
  "data": {
    "totalCoutMainOeuvre": 45230.50,
    "totalPieces": 12890.00,
    "byEquipment": [
      { "code": "EQ-001", "cout": 8500.00 }
    ]
  }
}
```

## Webhooks (ERP → GMAO)
L'ERP peut notifier la GMAO via webhook sur ces événements :
- `stock.received` — Réception de marchandises
- `stock.adjusted` — Inventaire ajusté
- `purchase_order.created` — Commande créée

## Polling (GMAO → ERP)
Si l'ERP ne supporte pas les webhooks, la GMAO peut poller toutes les heures via un job BullMQ.

## Sécurité
- HTTPS obligatoire en production
- API Key rotation tous les 90 jours
- IP whitelist optionnelle
- Audit log de toutes les transactions

## Roadmap implémentation
| Phase | Sprint | Description |
|-------|--------|-------------|
| 1 | S13 | Spécification + endpoints stubs |
| 2 | S14 | Implémentation push stock |
| 3 | S15 | Webhooks + polling bidirectionnel |
| 4 | S16 | Tests intégration ERP réel |
