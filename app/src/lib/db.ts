/**
 * =============================================================================
 * IndexedDB — Dexie.js pour le mode offline-first
 * =============================================================================
 * Stocke les donnees metier et les mutations en attente de synchronisation.
 * =============================================================================
 */

import Dexie, { type EntityTable } from 'dexie';

// Types minimaux pour Dexie (seront enrichis par les types du projet)
interface Equipment {
  id: string;
  code: string;
  name: string;
  ligneId?: string;
  criticality: string;
  type: string;
  statut: string;
  updatedAt?: string;
}

interface WorkOrder {
  id: string;
  numero: string;
  title: string;
  status: string;
  equipmentId?: string;
  createdAt: string;
  updatedAt?: string;
}

interface StockItem {
  id: string;
  code: string;
  name: string;
  quantite: number;
  stockMinimum: number;
  updatedAt?: string;
}

interface PendingChange {
  id?: number;
  type: 'create' | 'update' | 'delete';
  entity: 'equipment' | 'workOrder' | 'stockItem' | 'ticket';
  payload: any;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  createdAt: Date;
  synced: boolean;
  retryCount: number;
  lastError?: string;
}

export const db = new Dexie('GMAOSimply GMAO') as Dexie & {
  equipments: EntityTable<Equipment, 'id'>;
  workOrders: EntityTable<WorkOrder, 'id'>;
  stockItems: EntityTable<StockItem, 'id'>;
  pendingSync: EntityTable<PendingChange, 'id'>;
};

db.version(1).stores({
  equipments: 'id, code, name, ligneId, criticality, type, statut',
  workOrders: 'id, numero, status, equipmentId, createdAt',
  stockItems: 'id, code, name, quantite, stockMinimum',
  pendingSync: '++id, type, entity, createdAt, synced',
});

/**
 * Helper : stocker une liste d'equipements dans IndexedDB
 */
export async function cacheEquipments(equipments: Equipment[]): Promise<void> {
  await db.equipments.clear();
  await db.equipments.bulkPut(equipments);
}

/**
 * Helper : stocker une liste de BT dans IndexedDB
 */
export async function cacheWorkOrders(workOrders: WorkOrder[]): Promise<void> {
  await db.workOrders.clear();
  await db.workOrders.bulkPut(workOrders);
}

/**
 * Helper : stocker une liste d'articles de stock dans IndexedDB
 */
export async function cacheStockItems(stockItems: StockItem[]): Promise<void> {
  await db.stockItems.clear();
  await db.stockItems.bulkPut(stockItems);
}

/**
 * Helper : ajouter une mutation en attente de synchronisation
 */
export async function queuePendingChange(change: Omit<PendingChange, 'id' | 'createdAt' | 'synced' | 'retryCount'>): Promise<number | undefined> {
  return await db.pendingSync.add({
    ...change,
    createdAt: new Date(),
    synced: false,
    retryCount: 0,
  });
}

/**
 * Helper : recuperer les mutations en attente
 */
export async function getPendingChanges(): Promise<PendingChange[]> {
  return await db.pendingSync.where('synced').equals(0).sortBy('createdAt');
}

/**
 * Helper : marquer une mutation comme synchronisee
 */
export async function markChangeSynced(id: number): Promise<void> {
  await db.pendingSync.update(id, { synced: true });
}

/**
 * Helper : incrementer le retry count et stocker l'erreur
 */
export async function markChangeFailed(id: number, error: string): Promise<void> {
  const existing = await db.pendingSync.get(id);
  if (existing) {
    await db.pendingSync.update(id, {
      retryCount: existing.retryCount + 1,
      lastError: error,
    });
  }
}
