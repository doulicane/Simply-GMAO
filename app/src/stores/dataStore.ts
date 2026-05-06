import { create } from 'zustand';
import type {
  Equipment, WorkOrder, PreventivePlan, StockItem,
  AlertItem, NotificationItem, DashboardKPI, AvailabilityByLine,
} from '@/types';

interface DataState {
  equipment: Equipment[];
  workOrders: WorkOrder[];
  preventivePlans: PreventivePlan[];
  stockItems: StockItem[];
  alerts: AlertItem[];
  notifications: NotificationItem[];
  kpi: DashboardKPI;
  availabilityByLine: AvailabilityByLine[];
  addWorkOrder: (wo: WorkOrder) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrder['status']) => void;
  acknowledgeAlert: (id: string) => void;
  markNotificationRead: (id: string) => void;
}

const EQUIPMENT: Equipment[] = [
  { id: 'EQ-001', code: 'PR-001', name: 'Presse #1 — Haulick', type: 'presse', status: 'running', criticality: 'critique', line: 'Ligne Presses', location: 'Hall A — Poste 1', manufacturer: 'Haulick', model: 'HCP-300', serialNumber: 'HA-2018-0042', commissioningDate: '2018-03-15', lastMaintenanceDate: '2026-04-20', nextMaintenanceDate: '2026-05-20', mttr: 2.1, mtbf: 168, availability: 96.2, qrCode: 'PR-001' },
  { id: 'EQ-002', code: 'PR-002', name: 'Presse #2 — Haulick', type: 'presse', status: 'running', criticality: 'critique', line: 'Ligne Presses', location: 'Hall A — Poste 2', manufacturer: 'Haulick', model: 'HCP-300', serialNumber: 'HA-2019-0011', commissioningDate: '2019-01-10', lastMaintenanceDate: '2026-04-18', nextMaintenanceDate: '2026-05-18', mttr: 1.8, mtbf: 172, availability: 97.1, qrCode: 'PR-002' },
  { id: 'EQ-003', code: 'PR-003', name: 'Presse #3 — Sacmi', type: 'presse', status: 'breakdown', criticality: 'critique', line: 'Ligne Presses', location: 'Hall A — Poste 3', manufacturer: 'Sacmi', model: 'PMV-250', serialNumber: 'SC-2020-0089', commissioningDate: '2020-06-22', lastMaintenanceDate: '2026-04-10', nextMaintenanceDate: '2026-05-10', mttr: 3.2, mtbf: 145, availability: 82.4, qrCode: 'PR-003' },
  { id: 'EQ-004', code: 'PR-004', name: 'Presse #4 — Sacmi', type: 'presse', status: 'standby', criticality: 'elevee', line: 'Ligne Presses', location: 'Hall A — Poste 4', manufacturer: 'Sacmi', model: 'PMV-250', serialNumber: 'SC-2021-0034', commissioningDate: '2021-09-05', lastMaintenanceDate: '2026-04-25', nextMaintenanceDate: '2026-05-25', mttr: 2.5, mtbf: 155, availability: 91.3, qrCode: 'PR-004' },
  { id: 'EQ-005', code: 'LQ-001', name: 'Ligne de laquage #1', type: 'laquage', status: 'running', criticality: 'critique', line: 'Ligne Laquage', location: 'Hall B — Zone Laquage', manufacturer: 'Soudronic', model: 'LAC-400', serialNumber: 'SO-2019-0056', commissioningDate: '2019-04-12', lastMaintenanceDate: '2026-04-22', nextMaintenanceDate: '2026-05-22', mttr: 2.8, mtbf: 160, availability: 94.5, qrCode: 'LQ-001' },
  { id: 'EQ-006', code: 'LQ-002', name: 'Ligne de laquage #2', type: 'laquage', status: 'running', criticality: 'critique', line: 'Ligne Laquage', location: 'Hall B — Zone Laquage', manufacturer: 'Soudronic', model: 'LAC-400', serialNumber: 'SO-2020-0023', commissioningDate: '2020-02-18', lastMaintenanceDate: '2026-04-15', nextMaintenanceDate: '2026-05-15', mttr: 2.3, mtbf: 165, availability: 95.8, qrCode: 'LQ-002' },
  { id: 'EQ-007', code: 'LQ-003', name: 'Ligne de laquage #3', type: 'laquage', status: 'maintenance', criticality: 'elevee', line: 'Ligne Laquage', location: 'Hall B — Zone Laquage', manufacturer: 'Soudronic', model: 'LAC-400', serialNumber: 'SO-2021-0078', commissioningDate: '2021-07-30', lastMaintenanceDate: '2026-05-01', nextMaintenanceDate: '2026-06-01', mttr: 3.0, mtbf: 150, availability: 88.7, qrCode: 'LQ-003' },
  { id: 'EQ-008', code: 'SR-001', name: 'Machine sérigraphie #1', type: 'serigraphie', status: 'running', criticality: 'elevee', line: 'Ligne Sérigraphie', location: 'Hall C — Poste Sérigraphie', manufacturer: 'DMG', model: 'SER-200', serialNumber: 'DM-2018-0091', commissioningDate: '2018-08-14', lastMaintenanceDate: '2026-04-28', nextMaintenanceDate: '2026-05-28', mttr: 1.5, mtbf: 180, availability: 93.2, qrCode: 'SR-001' },
  { id: 'EQ-009', code: 'SR-002', name: 'Machine sérigraphie #2', type: 'serigraphie', status: 'stopped', criticality: 'elevee', line: 'Ligne Sérigraphie', location: 'Hall C — Poste Sérigraphie', manufacturer: 'DMG', model: 'SER-200', serialNumber: 'DM-2020-0045', commissioningDate: '2020-11-20', lastMaintenanceDate: '2026-04-12', nextMaintenanceDate: '2026-05-12', mttr: 2.0, mtbf: 175, availability: 89.1, qrCode: 'SR-002' },
  { id: 'EQ-010', code: 'FR-001', name: 'Four de recuit continu', type: 'recuit', status: 'running', criticality: 'critique', line: 'Ligne Recuit', location: 'Hall D — Zone Thermique', manufacturer: 'Ebner', model: 'RTC-600', serialNumber: 'EB-2017-0033', commissioningDate: '2017-05-08', lastMaintenanceDate: '2026-04-05', nextMaintenanceDate: '2026-05-05', mttr: 4.5, mtbf: 200, availability: 92.8, qrCode: 'FR-001' },
  { id: 'EQ-011', code: 'CP-001', name: 'Compresseur principal Atlas Copco', type: 'compresseur', status: 'running', criticality: 'critique', line: 'Utilités', location: 'Sous-sol — Local Compresseurs', manufacturer: 'Atlas Copco', model: 'GA-160', serialNumber: 'AC-2019-0067', commissioningDate: '2019-02-25', lastMaintenanceDate: '2026-04-30', nextMaintenanceDate: '2026-05-30', mttr: 3.5, mtbf: 220, availability: 98.5, qrCode: 'CP-001' },
  { id: 'EQ-012', code: 'CP-002', name: 'Compresseur secours Ingersoll Rand', type: 'compresseur', status: 'standby', criticality: 'elevee', line: 'Utilités', location: 'Sous-sol — Local Compresseurs', manufacturer: 'Ingersoll Rand', model: 'R-132', serialNumber: 'IR-2020-0012', commissioningDate: '2020-03-10', lastMaintenanceDate: '2026-04-08', nextMaintenanceDate: '2026-05-08', mttr: 2.8, mtbf: 210, availability: 99.1, qrCode: 'CP-002' },
  { id: 'EQ-013', code: 'DP-001', name: 'Dépoussiéreur Nederman', type: 'depoussiereur', status: 'running', criticality: 'critique', line: 'Extraction', location: 'Hall A — Extraction Poussière', manufacturer: 'Nederman', model: 'NOM-11', serialNumber: 'NE-2021-0055', commissioningDate: '2021-01-15', lastMaintenanceDate: '2026-04-14', nextMaintenanceDate: '2026-05-14', mttr: 1.2, mtbf: 300, availability: 97.5, qrCode: 'DP-001' },
  { id: 'EQ-014', code: 'DP-002', name: 'Dépoussiéreur secours', type: 'depoussiereur', status: 'standby', criticality: 'elevee', line: 'Extraction', location: 'Hall A — Extraction Poussière', manufacturer: 'Nederman', model: 'NOM-11', serialNumber: 'NE-2022-0021', commissioningDate: '2022-04-20', lastMaintenanceDate: '2026-04-16', nextMaintenanceDate: '2026-05-16', mttr: 1.0, mtbf: 320, availability: 98.2, qrCode: 'DP-002' },
  { id: 'EQ-015', code: 'EM-001', name: 'Ligne emballage Flow-pack', type: 'emballage', status: 'running', criticality: 'elevee', line: 'Ligne Emballage', location: 'Hall E — Zone Expédition', manufacturer: 'IMA', model: 'FLP-500', serialNumber: 'IM-2020-0078', commissioningDate: '2020-09-12', lastMaintenanceDate: '2026-04-26', nextMaintenanceDate: '2026-05-26', mttr: 1.8, mtbf: 190, availability: 95.3, qrCode: 'EM-001' },
  { id: 'EQ-016', code: 'EM-002', name: 'Palettiseur automatique', type: 'emballage', status: 'running', criticality: 'moyenne', line: 'Ligne Emballage', location: 'Hall E — Zone Expédition', manufacturer: 'Kuka', model: 'KP-300', serialNumber: 'KU-2021-0099', commissioningDate: '2021-06-01', lastMaintenanceDate: '2026-04-29', nextMaintenanceDate: '2026-05-29', mttr: 2.2, mtbf: 185, availability: 94.1, qrCode: 'EM-002' },
  { id: 'EQ-017', code: 'TR-001', name: 'Pont roulant 5T', type: 'autre', status: 'running', criticality: 'critique', line: 'Manutention', location: 'Hall A — Voie de roulement', manufacturer: 'Demag', model: 'DR-5T', serialNumber: 'DE-2018-0017', commissioningDate: '2018-01-20', lastMaintenanceDate: '2026-04-03', nextMaintenanceDate: '2026-05-03', mttr: 2.0, mtbf: 250, availability: 96.8, qrCode: 'TR-001' },
  { id: 'EQ-018', code: 'TR-002', name: 'Transpalette électrique Jungheinrich', type: 'autre', status: 'running', criticality: 'moyenne', line: 'Manutention', location: 'Magasin — Quai', manufacturer: 'Jungheinrich', model: 'EJE-120', serialNumber: 'JU-2022-0044', commissioningDate: '2022-08-15', lastMaintenanceDate: '2026-04-27', nextMaintenanceDate: '2026-05-27', mttr: 0.5, mtbf: 400, availability: 99.0, qrCode: 'TR-002' },
  { id: 'EQ-019', code: 'AG-001', name: 'Agitateur bassin laque', type: 'autre', status: 'running', criticality: 'elevee', line: 'Ligne Laquage', location: 'Hall B — Zone Préparation', manufacturer: 'Ystral', model: 'YST-100', serialNumber: 'YS-2020-0031', commissioningDate: '2020-05-12', lastMaintenanceDate: '2026-04-19', nextMaintenanceDate: '2026-05-19', mttr: 1.0, mtbf: 280, availability: 97.0, qrCode: 'AG-001' },
  { id: 'EQ-020', code: 'OV-001', name: 'Oven de séchage intermédiaire', type: 'autre', status: 'running', criticality: 'elevee', line: 'Ligne Laquage', location: 'Hall B — Zone Cuisson', manufacturer: 'Gema', model: 'OV-200', serialNumber: 'GE-2019-0088', commissioningDate: '2019-10-05', lastMaintenanceDate: '2026-04-23', nextMaintenanceDate: '2026-05-23', mttr: 1.5, mtbf: 260, availability: 96.1, qrCode: 'OV-001' },
];

const WORK_ORDERS: WorkOrder[] = [
  { id: 'WO-001', number: 'BT-4521', title: 'Panne hydraulique Presse #3', description: 'Fuite d\'huile hydraulique sur le vérin principal. Arrêt de production.', type: 'corrective', status: 'in_progress', priority: 'P1', equipmentId: 'EQ-003', equipmentName: 'Presse #3 — Sacmi', requestedBy: 'Marie Lefebvre', assignedTo: 'Jean Martin', createdAt: '2026-05-05T14:32:00Z', plannedStart: '2026-05-05T15:00:00Z', actualStart: '2026-05-05T15:10:00Z', duration: 2.5, partsUsed: [{ partId: 'SP-003', partName: 'Joint torique 120x5 NBR', quantity: 4, unitCost: 12.5 }], cost: 150 },
  { id: 'WO-002', number: 'BT-4522', title: 'Remplacement buses de laquage LQ-001', description: 'Usure anormale des buses, qualité de finition dégradée.', type: 'corrective', status: 'waiting_parts', priority: 'P2', equipmentId: 'EQ-005', equipmentName: 'Ligne de laquage #1', requestedBy: 'Pierre Durand', assignedTo: 'Jean Martin', createdAt: '2026-05-04T09:15:00Z', plannedStart: '2026-05-06T08:00:00Z', duration: 3.0, partsUsed: [], cost: 0 },
  { id: 'WO-003', number: 'BT-4523', title: 'Révision pompe à vide CP-001', description: 'Vibration excessive sur la pompe à vide du compresseur principal.', type: 'preventive', status: 'planned', priority: 'P2', equipmentId: 'EQ-011', equipmentName: 'Compresseur principal Atlas Copco', requestedBy: 'Pierre Durand', assignedTo: 'Luc Bernard', createdAt: '2026-05-03T11:00:00Z', plannedStart: '2026-05-07T09:00:00Z', duration: 4.0, partsUsed: [], cost: 0 },
  { id: 'WO-004', number: 'BT-4524', title: 'Décalibrage capteur fin de course SR-001', description: 'Capteur de position déréglé, arrêts intempestifs.', type: 'corrective', status: 'completed', priority: 'P3', equipmentId: 'EQ-008', equipmentName: 'Machine sérigraphie #1', requestedBy: 'Marie Lefebvre', assignedTo: 'Jean Martin', createdAt: '2026-05-02T16:45:00Z', plannedStart: '2026-05-03T08:00:00Z', actualStart: '2026-05-03T08:15:00Z', actualEnd: '2026-05-03T09:30:00Z', duration: 1.25, partsUsed: [{ partId: 'SP-012', partName: 'Capteur inductif M18', quantity: 1, unitCost: 89.0 }], cost: 89 },
  { id: 'WO-005', number: 'BT-4525', title: 'Nettoyage filtre dépoussiéreur DP-001', description: 'Maintenance mensuelle du filtre à cartouches.', type: 'preventive', status: 'in_progress', priority: 'P3', equipmentId: 'EQ-013', equipmentName: 'Dépoussiéreur Nederman', requestedBy: 'Sophie Moreau', assignedTo: 'Jean Martin', createdAt: '2026-05-05T07:30:00Z', plannedStart: '2026-05-05T08:00:00Z', actualStart: '2026-05-05T08:00:00Z', duration: 1.5, partsUsed: [{ partId: 'SP-008', partName: 'Filtre cartouche', quantity: 2, unitCost: 145.0 }], cost: 290 },
  { id: 'WO-006', number: 'BT-4526', title: 'Fuite air comprimé réseau Hall A', description: 'Fuite détectée au niveau du réseau principal, perte de pression.', type: 'corrective', status: 'planned', priority: 'P2', equipmentId: 'EQ-011', equipmentName: 'Compresseur principal Atlas Copco', requestedBy: 'Pierre Durand', assignedTo: 'Jean Martin', createdAt: '2026-05-01T10:20:00Z', plannedStart: '2026-05-08T14:00:00Z', duration: 2.0, partsUsed: [], cost: 0 },
  { id: 'WO-007', number: 'BT-4527', title: 'Graissage centralisé Presse #2', description: 'Graissage automatique en défaut, pompe de graissage à changer.', type: 'corrective', status: 'planned', priority: 'P2', equipmentId: 'EQ-002', equipmentName: 'Presse #2 — Haulick', requestedBy: 'Pierre Durand', assignedTo: 'Jean Martin', createdAt: '2026-05-04T13:10:00Z', plannedStart: '2026-05-06T10:00:00Z', duration: 2.5, partsUsed: [{ partId: 'SP-005', partName: 'Pompe à graisse SKF 24V', quantity: 1, unitCost: 320.0 }], cost: 320 },
  { id: 'WO-008', number: 'BT-4528', title: 'Contrôle mensuel dépoussiéreur', description: 'Vérification conformité du système d\'extraction.', type: 'safety', status: 'planned', priority: 'P2', equipmentId: 'EQ-013', equipmentName: 'Dépoussiéreur Nederman', requestedBy: 'Sophie Moreau', assignedTo: 'Sophie Moreau', createdAt: '2026-05-05T08:00:00Z', plannedStart: '2026-05-09T09:00:00Z', duration: 1.0, partsUsed: [], cost: 0 },
  { id: 'WO-009', number: 'BT-4529', title: 'Remplacement courroie emballeuse EM-001', description: 'Usure des courroies de transmission, risque de rupture.', type: 'preventive', status: 'closed', priority: 'P3', equipmentId: 'EQ-015', equipmentName: 'Ligne emballage Flow-pack', requestedBy: 'Pierre Durand', assignedTo: 'Jean Martin', createdAt: '2026-04-28T09:00:00Z', plannedStart: '2026-04-29T08:00:00Z', actualStart: '2026-04-29T08:00:00Z', actualEnd: '2026-04-29T10:30:00Z', duration: 2.5, partsUsed: [{ partId: 'SP-020', partName: 'Courroie synchrone T10-1200', quantity: 2, unitCost: 45.0 }], cost: 90 },
  { id: 'WO-010', number: 'BT-4530', title: 'Anomalie température four FR-001', description: 'Dérive de température zone 3, thermocouple à vérifier.', type: 'corrective', status: 'in_progress', priority: 'P1', equipmentId: 'EQ-010', equipmentName: 'Four de recuit continu', requestedBy: 'Marie Lefebvre', assignedTo: 'Jean Martin', createdAt: '2026-05-05T12:00:00Z', plannedStart: '2026-05-05T13:00:00Z', actualStart: '2026-05-05T13:15:00Z', duration: 3.0, partsUsed: [{ partId: 'SP-011', partName: 'Thermocouple type K L=500mm', quantity: 1, unitCost: 75.0 }], cost: 75 },
  { id: 'WO-011', number: 'BT-4531', title: 'Révision annuelle pont roulant TR-001', description: 'Révision réglementaire annuelle du pont roulant 5T.', type: 'preventive', status: 'planned', priority: 'P2', equipmentId: 'EQ-017', equipmentName: 'Pont roulant 5T', requestedBy: 'Pierre Durand', assignedTo: 'Jean Martin', createdAt: '2026-04-15T08:00:00Z', plannedStart: '2026-05-15T08:00:00Z', duration: 6.0, partsUsed: [], cost: 0 },
  { id: 'WO-012', number: 'BT-4532', title: 'Changement filtre hydraulique PR-001', description: 'Indicateur de colmatage au rouge.', type: 'corrective', status: 'completed', priority: 'P3', equipmentId: 'EQ-001', equipmentName: 'Presse #1 — Haulick', requestedBy: 'Marie Lefebvre', assignedTo: 'Jean Martin', createdAt: '2026-05-03T07:45:00Z', plannedStart: '2026-05-03T09:00:00Z', actualStart: '2026-05-03T09:00:00Z', actualEnd: '2026-05-03T10:00:00Z', duration: 1.0, partsUsed: [{ partId: 'SP-002', partName: 'Filtre hydraulique MP Filtri 100L', quantity: 1, unitCost: 135.0 }], cost: 135 },
  { id: 'WO-013', number: 'BT-4533', title: 'Réglage agitateur bassin laque AG-001', description: 'Vitesse d\'agitation trop élevée, formation de mousse.', type: 'improvement', status: 'draft', priority: 'P4', equipmentId: 'EQ-019', equipmentName: 'Agitateur bassin laque', requestedBy: 'Pierre Durand', assignedTo: undefined, createdAt: '2026-05-05T15:00:00Z', plannedStart: undefined, duration: 1.0, partsUsed: [], cost: 0 },
  { id: 'WO-014', number: 'BT-4534', title: 'Maintenance préventive LQ-003', description: 'Arrêt programmé pour maintenance trimestrielle.', type: 'preventive', status: 'in_progress', priority: 'P3', equipmentId: 'EQ-007', equipmentName: 'Ligne de laquage #3', requestedBy: 'Pierre Durand', assignedTo: 'Jean Martin', createdAt: '2026-05-01T08:00:00Z', plannedStart: '2026-05-05T08:00:00Z', actualStart: '2026-05-05T08:00:00Z', duration: 8.0, partsUsed: [], cost: 0 },
  { id: 'WO-015', number: 'BT-4535', title: 'Panne électrique transpalette TR-002', description: 'Batterie ne tient plus la charge, remplacement nécessaire.', type: 'corrective', status: 'waiting_parts', priority: 'P3', equipmentId: 'EQ-018', equipmentName: 'Transpalette électrique Jungheinrich', requestedBy: 'Luc Bernard', assignedTo: 'Jean Martin', createdAt: '2026-05-04T11:30:00Z', plannedStart: '2026-05-07T08:00:00Z', duration: 2.0, partsUsed: [{ partId: 'SP-025', partName: 'Batterie lithium 24V 200Ah', quantity: 1, unitCost: 890.0 }], cost: 890 },
];

const PREVENTIVE_PLANS: PreventivePlan[] = [
  { id: 'PP-001', code: 'MP-LUB-PR2', title: 'Lubrification Presse #2', description: 'Graissage des glissières et vérins', equipmentId: 'EQ-002', equipmentName: 'Presse #2 — Haulick', frequency: 'monthly', estimatedDuration: 2, nextDueDate: '2026-05-18', lastDoneDate: '2026-04-18', assignedTo: 'Jean Martin', status: 'active', checklist: ['Vérifier niveau réservoir graisse', 'Graisser glissières X/Y', 'Graisser vérin principal', 'Contrôler pression graissage', 'Nettoyer excédents'], sparePartsNeeded: ['SP-005'] },
  { id: 'PP-002', code: 'MP-FIL-LQ1', title: 'Changement filtres laquage #1', description: 'Remplacement filtres à air et à laque', equipmentId: 'EQ-005', equipmentName: 'Ligne de laquage #1', frequency: 'quarterly', estimatedDuration: 3, nextDueDate: '2026-05-22', lastDoneDate: '2026-02-22', assignedTo: 'Jean Martin', status: 'active', checklist: ['Arrêter ligne', 'Vider circuits', 'Remplacer filtres', 'Rincer circuits', 'Redémarrer et vérifier'], sparePartsNeeded: ['SP-008', 'SP-009'] },
  { id: 'PP-003', code: 'MP-CAL-SR1', title: 'Calibrage sérigraphie #1', description: 'Calibrage capteurs et réglage impression', equipmentId: 'EQ-008', equipmentName: 'Machine sérigraphie #1', frequency: 'monthly', estimatedDuration: 1.5, nextDueDate: '2026-05-28', lastDoneDate: '2026-04-28', assignedTo: 'Jean Martin', status: 'active', checklist: ['Calibrer capteur position', 'Vérifier alignment têtes', 'Contrôler qualité test', 'Ajuster pression raclette'], sparePartsNeeded: [] },
  { id: 'PP-004', code: 'MP-REC-FR1', title: 'Inspection thermique four FR-001', description: 'Inspection des thermocouples et isolation', equipmentId: 'EQ-010', equipmentName: 'Four de recuit continu', frequency: 'quarterly', estimatedDuration: 4, nextDueDate: '2026-05-05', lastDoneDate: '2026-02-05', assignedTo: 'Jean Martin', status: 'overdue', checklist: ['Vérifier thermocouples Z1-Z6', 'Contrôler isolation porte', 'Inspecter convoyeur', 'Vérifier brûleurs', 'Test de sécurité gaz'], sparePartsNeeded: ['SP-011'] },
  { id: 'PP-005', code: 'MP-COM-CP1', title: 'Révision compresseur CP-001', description: 'Révision périodique compresseur principal', equipmentId: 'EQ-011', equipmentName: 'Compresseur principal Atlas Copco', frequency: 'biannual', estimatedDuration: 6, nextDueDate: '2026-06-15', lastDoneDate: '2024-12-15', assignedTo: 'Jean Martin', status: 'active', checklist: ['Remplacer filtres air/huile', 'Vérifier courroies', 'Contrôler pression soupapes', 'Analyse huile', 'Test démarrage secours'], sparePartsNeeded: ['SP-006', 'SP-007'] },
  { id: 'PP-006', code: 'MP-DEP-DP1', title: 'Contrôle dépoussiéreur DP-001', description: 'Vérification conformité et nettoyage', equipmentId: 'EQ-013', equipmentName: 'Dépoussiéreur Nederman', frequency: 'monthly', estimatedDuration: 1.5, nextDueDate: '2026-05-14', lastDoneDate: '2026-04-14', assignedTo: 'Sophie Moreau', status: 'active', checklist: ['Vérifier pression différentielle', 'Inspecter cartouches', 'Contrôler vanne décompression', 'Vérifier mise à terre', 'Test alarme'], sparePartsNeeded: ['SP-008'] },
  { id: 'PP-007', code: 'MP-HUI-PR1', title: 'Contrôle huile hydraulique PR-001', description: 'Analyse et remplacement huile hydraulique', equipmentId: 'EQ-001', equipmentName: 'Presse #1 — Haulick', frequency: 'quarterly', estimatedDuration: 3, nextDueDate: '2026-06-20', lastDoneDate: '2026-03-20', assignedTo: 'Jean Martin', status: 'active', checklist: ['Prélever échantillon', 'Analyse laboratoire', 'Remplacer si nécessaire', 'Purger circuits', 'Vérifier niveau'], sparePartsNeeded: ['SP-004'] },
  { id: 'PP-008', code: 'MP-EMB-EM1', title: 'Révision emballeuse EM-001', description: 'Révision mécanique et électrique', equipmentId: 'EQ-015', equipmentName: 'Ligne emballage Flow-pack', frequency: 'annual', estimatedDuration: 8, nextDueDate: '2026-07-12', lastDoneDate: '2024-07-12', assignedTo: 'Jean Martin', status: 'active', checklist: ['Réviser moteurs', 'Changer courroies', 'Calibrer capteurs', 'Lubrifier articulations', 'Test production'], sparePartsNeeded: ['SP-020'] },
  { id: 'PP-009', code: 'MP-PONT-TR1', title: 'Visite réglementaire pont roulant', description: 'Contrôle réglementaire annuel', equipmentId: 'EQ-017', equipmentName: 'Pont roulant 5T', frequency: 'annual', estimatedDuration: 6, nextDueDate: '2026-05-15', lastDoneDate: '2024-05-15', assignedTo: 'Jean Martin', status: 'overdue', checklist: ['Contrôle freins', 'Test limiteur charge', 'Vérifier câbles', 'Inspection structures', 'Test commandes'], sparePartsNeeded: [] },
  { id: 'PP-010', code: 'MP-SEC-LQ2', title: 'Test sécurité laquage #2', description: 'Test des équipements de sécurité ligne laquage', equipmentId: 'EQ-006', equipmentName: 'Ligne de laquage #2', frequency: 'quarterly', estimatedDuration: 2, nextDueDate: '2026-05-15', lastDoneDate: '2026-02-15', assignedTo: 'Sophie Moreau', status: 'active', checklist: ['Test détecteurs gaz', 'Vérification extincteurs', 'Test arrêt d\'urgence', 'Contrôle évacuation', 'Vérification EPI'], sparePartsNeeded: [] },
];

const STOCK_ITEMS: StockItem[] = [
  { id: 'SP-001', code: 'MAT-001', name: 'Matrix Presse Haulick Ø52mm', category: 'Matrices', description: 'Matrix standard capsules aluminium Ø52mm', quantity: 12, minStock: 5, maxStock: 20, unit: 'pc', location: 'Magasin A — Étagère 1', status: 'ok', unitCost: 2400.0, supplier: 'Haulick GmbH', lastRestockDate: '2026-03-15', reorderPoint: 6 },
  { id: 'SP-002', code: 'FIL-001', name: 'Filtre hydraulique MP Filtri 100L', category: 'Filtres', description: 'Filtre retour hydraulique pour presses', quantity: 3, minStock: 5, maxStock: 15, unit: 'pc', location: 'Magasin B — Étagère 3', status: 'low', unitCost: 135.0, supplier: 'MP Filtri', lastRestockDate: '2026-02-10', reorderPoint: 5 },
  { id: 'SP-003', code: 'JNT-001', name: 'Joint torique 120x5 NBR', category: 'Joints', description: 'Joint torique vérin principal presse', quantity: 25, minStock: 10, maxStock: 50, unit: 'pc', location: 'Magasin B — Étagère 2', status: 'ok', unitCost: 12.5, supplier: 'Parker', lastRestockDate: '2026-04-01', reorderPoint: 12 },
  { id: 'SP-004', code: 'HUI-001', name: 'Huile hydraulique ISO VG 46', category: 'Fluides', description: 'Huile hydraulique 208L fût', quantity: 2, minStock: 3, maxStock: 10, unit: 'fût', location: 'Extérieur — Zone Fluides', status: 'low', unitCost: 450.0, supplier: 'TotalEnergies', lastRestockDate: '2026-01-20', reorderPoint: 3 },
  { id: 'SP-005', code: 'POM-001', name: 'Pompe à graisse SKF 24V', category: 'Pompes', description: 'Pompe graissage centralisé SKF', quantity: 1, minStock: 2, maxStock: 5, unit: 'pc', location: 'Magasin B — Étagère 4', status: 'critical', unitCost: 320.0, supplier: 'SKF', lastRestockDate: '2024-12-05', reorderPoint: 2 },
  { id: 'SP-006', code: 'FIL-002', name: 'Filtre air compresseur', category: 'Filtres', description: 'Filtre aspiration compresseur Atlas Copco', quantity: 8, minStock: 3, maxStock: 12, unit: 'pc', location: 'Magasin B — Étagère 3', status: 'ok', unitCost: 85.0, supplier: 'Atlas Copco', lastRestockDate: '2026-03-22', reorderPoint: 4 },
  { id: 'SP-007', code: 'FIL-003', name: 'Filtre huile compresseur', category: 'Filtres', description: 'Filtre huile séparateur', quantity: 6, minStock: 3, maxStock: 10, unit: 'pc', location: 'Magasin B — Étagère 3', status: 'ok', unitCost: 95.0, supplier: 'Atlas Copco', lastRestockDate: '2026-03-22', reorderPoint: 4 },
  { id: 'SP-008', code: 'FIL-004', name: 'Filtre cartouche', category: 'Filtres', description: 'Cartouche filtrante dépoussiéreur', quantity: 4, minStock: 4, maxStock: 12, unit: 'pc', location: 'Magasin B — Étagère 5', status: 'low', unitCost: 145.0, supplier: 'Nederman', lastRestockDate: '2026-02-28', reorderPoint: 4 },
  { id: 'SP-009', code: 'BUSE-001', name: 'Buse de laquage 1.2mm', category: 'Buses', description: 'Buse atomisation laque 1.2mm inox', quantity: 15, minStock: 8, maxStock: 30, unit: 'pc', location: 'Magasin C — Étagère 1', status: 'ok', unitCost: 65.0, supplier: 'SATA', lastRestockDate: '2026-04-10', reorderPoint: 10 },
  { id: 'SP-010', code: 'BUSE-002', name: 'Buse de laquage 1.5mm', category: 'Buses', description: 'Buse atomisation laque 1.5mm inox', quantity: 10, minStock: 8, maxStock: 25, unit: 'pc', location: 'Magasin C — Étagère 1', status: 'ok', unitCost: 65.0, supplier: 'SATA', lastRestockDate: '2026-04-10', reorderPoint: 10 },
  { id: 'SP-011', code: 'THM-001', name: 'Thermocouple type K L=500mm', category: 'Instrumentation', description: 'Thermocouple four recuit', quantity: 3, minStock: 3, maxStock: 8, unit: 'pc', location: 'Magasin D — Étagère 2', status: 'low', unitCost: 75.0, supplier: 'Wika', lastRestockDate: '2026-01-15', reorderPoint: 3 },
  { id: 'SP-012', code: 'CAP-001', name: 'Capteur inductif M18', category: 'Instrumentation', description: 'Capteur de proximité inductif M18 PNP', quantity: 7, minStock: 4, maxStock: 12, unit: 'pc', location: 'Magasin D — Étagère 2', status: 'ok', unitCost: 89.0, supplier: 'Baumer', lastRestockDate: '2026-03-01', reorderPoint: 5 },
  { id: 'SP-013', code: 'ROU-001', name: 'Roulement à billes 6208-2RS', category: 'Mécanique', description: 'Roulement standard moteur', quantity: 20, minStock: 8, maxStock: 30, unit: 'pc', location: 'Magasin E — Étagère 1', status: 'ok', unitCost: 28.0, supplier: 'SKF', lastRestockDate: '2026-03-10', reorderPoint: 10 },
  { id: 'SP-014', code: 'ROU-002', name: 'Roulement à rouleaux NU2208', category: 'Mécanique', description: 'Roulement lourd pompe/vérin', quantity: 6, minStock: 3, maxStock: 10, unit: 'pc', location: 'Magasin E — Étagère 1', status: 'ok', unitCost: 145.0, supplier: 'SKF', lastRestockDate: '2026-02-20', reorderPoint: 4 },
  { id: 'SP-015', code: 'COUR-001', name: 'Courroie trapézoïdale SPA 1500', category: 'Transmission', description: 'Courroie transmission moteur', quantity: 8, minStock: 4, maxStock: 15, unit: 'pc', location: 'Magasin E — Étagère 3', status: 'ok', unitCost: 35.0, supplier: 'Optibelt', lastRestockDate: '2026-03-05', reorderPoint: 5 },
  { id: 'SP-016', code: 'COUR-002', name: 'Courroie trapézoïdale SPB 2240', category: 'Transmission', description: 'Courroie transmission compresseur', quantity: 5, minStock: 3, maxStock: 10, unit: 'pc', location: 'Magasin E — Étagère 3', status: 'ok', unitCost: 52.0, supplier: 'Optibelt', lastRestockDate: '2026-02-15', reorderPoint: 3 },
  { id: 'SP-017', code: 'CHA-001', name: 'Chaîne à rouleaux 16B-1', category: 'Transmission', description: 'Chaîne transmission convoyeur', quantity: 4, minStock: 2, maxStock: 8, unit: 'm', location: 'Magasin E — Étagère 4', status: 'ok', unitCost: 78.0, supplier: 'Tsubaki', lastRestockDate: '2026-01-25', reorderPoint: 2 },
  { id: 'SP-018', code: 'PNE-001', name: 'Pneu transpalette 200/50-10', category: 'Manutention', description: 'Pneu plein transpalette', quantity: 2, minStock: 2, maxStock: 6, unit: 'pc', location: 'Magasin F — Zone Manutention', status: 'low', unitCost: 120.0, supplier: 'Continental', lastRestockDate: '2024-11-10', reorderPoint: 2 },
  { id: 'SP-019', code: 'BAT-001', name: 'Batterie plomb 24V 200Ah', category: 'Électrique', description: 'Batterie transpalette/traction', quantity: 1, minStock: 2, maxStock: 4, unit: 'pc', location: 'Magasin F — Zone Électrique', status: 'critical', unitCost: 890.0, supplier: 'Hawker', lastRestockDate: '2024-10-05', reorderPoint: 2 },
  { id: 'SP-020', code: 'SYN-001', name: 'Courroie synchrone T10-1200', category: 'Transmission', description: 'Courroie crantée emballeuse', quantity: 6, minStock: 3, maxStock: 10, unit: 'pc', location: 'Magasin E — Étagère 3', status: 'ok', unitCost: 45.0, supplier: 'ContiTech', lastRestockDate: '2026-03-18', reorderPoint: 4 },
  { id: 'SP-021', code: 'LAM-001', name: 'Lampe UV 8kW', category: 'Laquage', description: 'Lampe polymérisation UV ligne laquage', quantity: 3, minStock: 2, maxStock: 6, unit: 'pc', location: 'Magasin C — Étagère 2', status: 'ok', unitCost: 1250.0, supplier: 'Hönle', lastRestockDate: '2026-02-01', reorderPoint: 2 },
  { id: 'SP-022', code: 'SOU-001', name: 'Soupape de sécurité 1/2"', category: 'Pneumatique', description: 'Soupape sécurité air comprimé', quantity: 5, minStock: 3, maxStock: 10, unit: 'pc', location: 'Magasin G — Étagère 1', status: 'ok', unitCost: 95.0, supplier: 'Festo', lastRestockDate: '2026-03-12', reorderPoint: 4 },
  { id: 'SP-023', code: 'SOU-002', name: 'Soupape de sécurité 3/4"', category: 'Pneumatique', description: 'Soupape sécurité air comprimé grand débit', quantity: 3, minStock: 2, maxStock: 6, unit: 'pc', location: 'Magasin G — Étagère 1', status: 'ok', unitCost: 145.0, supplier: 'Festo', lastRestockDate: '2026-01-30', reorderPoint: 2 },
  { id: 'SP-024', code: 'VER-001', name: 'Vérin pneumatique Ø80x200', category: 'Pneumatique', description: 'Vérin standard automatisation', quantity: 4, minStock: 2, maxStock: 8, unit: 'pc', location: 'Magasin G — Étagère 2', status: 'ok', unitCost: 185.0, supplier: 'Festo', lastRestockDate: '2026-02-25', reorderPoint: 2 },
  { id: 'SP-025', code: 'BAT-002', name: 'Batterie lithium 24V 200Ah', category: 'Électrique', description: 'Batterie lithium transpalette Jungheinrich', quantity: 0, minStock: 1, maxStock: 3, unit: 'pc', location: 'Magasin F — Zone Électrique', status: 'out_of_stock', unitCost: 890.0, supplier: 'Jungheinrich', lastRestockDate: '2024-09-15', reorderPoint: 1 },
  { id: 'SP-026', code: 'VER-002', name: 'Vérin hydraulique 100x500', category: 'Hydraulique', description: 'Vérin principal presse Haulick', quantity: 1, minStock: 1, maxStock: 3, unit: 'pc', location: 'Magasin H — Zone Hydraulique', status: 'ok', unitCost: 4200.0, supplier: 'Haulick GmbH', lastRestockDate: '2024-08-20', reorderPoint: 1 },
  { id: 'SP-027', code: 'POM-002', name: 'Pompe hydraulique 25cc', category: 'Hydraulique', description: 'Pompe groupe hydraulique presse', quantity: 2, minStock: 1, maxStock: 4, unit: 'pc', location: 'Magasin H — Zone Hydraulique', status: 'ok', unitCost: 1850.0, supplier: 'Rexroth', lastRestockDate: '2024-12-15', reorderPoint: 1 },
  { id: 'SP-028', code: 'ELE-001', name: 'Variateur de fréquence 15kW', category: 'Électrique', description: 'Variateur moteur principal', quantity: 1, minStock: 1, maxStock: 3, unit: 'pc', location: 'Magasin D — Étagère 3', status: 'ok', unitCost: 2450.0, supplier: 'Siemens', lastRestockDate: '2024-07-10', reorderPoint: 1 },
  { id: 'SP-029', code: 'ELE-002', name: 'Contacteur 3RT1054', category: 'Électrique', description: 'Contacteur puissance Siemens', quantity: 4, minStock: 2, maxStock: 6, unit: 'pc', location: 'Magasin D — Étagère 3', status: 'ok', unitCost: 320.0, supplier: 'Siemens', lastRestockDate: '2026-03-08', reorderPoint: 2 },
  { id: 'SP-030', code: 'JNT-002', name: 'Joint spi 60x80x10', category: 'Joints', description: 'Joint spi vérin/axe rotatif standard', quantity: 12, minStock: 6, maxStock: 20, unit: 'pc', location: 'Magasin B — Étagère 2', status: 'ok', unitCost: 8.5, supplier: 'Simrit', lastRestockDate: '2026-04-05', reorderPoint: 8 },
];

const ALERTS: AlertItem[] = [
  { id: 'AL-001', type: 'breakdown', title: 'Presse #3 — Arrêt production', description: 'Panne hydraulique — BT #4521', equipmentId: 'EQ-003', workOrderId: 'WO-001', priority: 'P1', createdAt: '2026-05-05T14:32:00Z', acknowledged: false },
  { id: 'AL-002', type: 'overdue_pm', title: 'MP FR-001 en retard', description: 'Inspection thermique four dépassée de 0j', equipmentId: 'EQ-010', priority: 'P1', createdAt: '2026-05-05T08:00:00Z', acknowledged: false },
  { id: 'AL-003', type: 'overdue_pm', title: 'MP Pont roulant en retard', description: 'Visite réglementaire dépassée de 0j', equipmentId: 'EQ-017', priority: 'P2', createdAt: '2026-05-05T08:00:00Z', acknowledged: false },
  { id: 'AL-004', type: 'low_stock', title: 'Stock critique — Batterie 24V', description: 'Batterie lithium 24V 200Ah : rupture', stockItemId: 'SP-025', priority: 'P2', createdAt: '2026-05-04T10:00:00Z', acknowledged: false },
  { id: 'AL-005', type: 'low_stock', title: 'Stock bas — Huile hydraulique', description: 'Huile ISO VG 46 : 2 fûts restants (min: 3)', stockItemId: 'SP-004', priority: 'P3', createdAt: '2026-05-03T08:00:00Z', acknowledged: false },
  { id: 'AL-006', type: 'safety', title: 'Permis de feu en cours', description: 'Permis de feu Hall A — expire à 18h00', priority: 'P2', createdAt: '2026-05-05T10:00:00Z', acknowledged: false },
  { id: 'AL-007', type: 'breakdown', title: 'Four FR-001 — Dérive température', description: 'Zone 3 en anomalie — BT #4530', equipmentId: 'EQ-010', workOrderId: 'WO-010', priority: 'P1', createdAt: '2026-05-05T12:00:00Z', acknowledged: false },
  { id: 'AL-008', type: 'info', title: 'Maintenance LQ-003 en cours', description: 'Arrêt programmé jusqu\'à 16h00', equipmentId: 'EQ-007', priority: 'P3', createdAt: '2026-05-05T08:00:00Z', acknowledged: true },
];

const NOTIFICATIONS: NotificationItem[] = [
  { id: 'NT-001', title: 'BT #4521 pris en charge', message: 'Jean Martin a pris en charge la panne Presse #3', type: 'info', read: false, createdAt: '2026-05-05T15:10:00Z', link: '/bons-de-travail' },
  { id: 'NT-002', title: 'Stock critique', message: 'Batterie lithium 24V 200Ah en rupture de stock', type: 'warning', read: false, createdAt: '2026-05-04T10:00:00Z', link: '/stocks' },
  { id: 'NT-003', title: 'MP terminée', message: 'BT #4529 terminée — Remplacement courroie EM-001', type: 'success', read: true, createdAt: '2026-04-29T10:30:00Z', link: '/bons-de-travail' },
];

const KPI: DashboardKPI = {
  availability: 94.2,
  availabilityTrend: 1.3,
  mttr: 2.4,
  mttrTrend: -0.3,
  mtbf: 156,
  mtbfTrend: 12,
  openWorkOrders: 7,
  urgentWorkOrders: 3,
  highWorkOrders: 2,
  mediumWorkOrders: 2,
  lowWorkOrders: 0,
  overdueWorkOrders: 2,
};

const AVAILABILITY_BY_LINE: AvailabilityByLine[] = [
  { line: 'Presses', availability: 91.8, target: 95 },
  { line: 'Laquage', availability: 93.0, target: 95 },
  { line: 'Sérigraphie', availability: 91.2, target: 92 },
  { line: 'Emballage', availability: 94.7, target: 95 },
  { line: 'Recuit', availability: 92.8, target: 95 },
  { line: 'Air comprimé', availability: 98.8, target: 98 },
];

export const useDataStore = create<DataState>((set) => ({
  equipment: EQUIPMENT,
  workOrders: WORK_ORDERS,
  preventivePlans: PREVENTIVE_PLANS,
  stockItems: STOCK_ITEMS,
  alerts: ALERTS,
  notifications: NOTIFICATIONS,
  kpi: KPI,
  availabilityByLine: AVAILABILITY_BY_LINE,

  addWorkOrder: (wo) =>
    set((state) => ({ workOrders: [wo, ...state.workOrders] })),

  updateWorkOrderStatus: (id, status) =>
    set((state) => ({
      workOrders: state.workOrders.map((wo) =>
        wo.id === id ? { ...wo, status } : wo
      ),
    })),

  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((al) =>
        al.id === id ? { ...al, acknowledged: true } : al
      ),
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((nt) =>
        nt.id === id ? { ...nt, read: true } : nt
      ),
    })),
}));
