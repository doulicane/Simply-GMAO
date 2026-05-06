#!/usr/bin/env node
/**
 * =============================================================================
 * Prisma Seed — GMAO Ramondin
 * =============================================================================
 * Script d'initialisation de la base de donnees avec des donnees realistes
 * pour le site pilote de Saint-Gaudens (Espagne).
 *
 * Donnees injectees :
 *   - 1 site (Saint-Gaudens)
 *   - 2 zones (Zone A Production, Zone B Finition)
 *   - 4 lignes de production
 *   - 20 equipements industriels
 *   - 6 utilisateurs (roles varies)
 *   - 15 bons de travail
 *   - 30 articles de stock
 *   - 8 plans preventifs
 *
 * Usage :
 *   npx ts-node prisma/seed.ts
 * =============================================================================
 */

import { PrismaClient, Role, WorkOrderStatus, WorkOrderType, Priority, EquipmentCriticality, EquipmentStatus, StockMovementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'ramondin2025';

async function main(): Promise<void> {
  console.log('🌱 [SEED] Demarrage de l\'initialisation des donnees...');

  // ========================================================================
  // 1. UTILISATEURS
  // ========================================================================
  console.log('👤 [SEED] Creation des utilisateurs...');

  const usersData = [
    { email: 'responsable@ramondin.local', firstName: 'Carlos', lastName: 'Martinez', role: Role.RESPONSABLE },
    { email: 'tech1@ramondin.local', firstName: 'Juan', lastName: 'Garcia', role: Role.TECHNICIEN },
    { email: 'tech2@ramondin.local', firstName: 'Miguel', lastName: 'Lopez', role: Role.TECHNICIEN },
    { email: 'operateur@ramondin.local', firstName: 'Ana', lastName: 'Fernandez', role: Role.OPERATEUR },
    { email: 'magasinier@ramondin.local', firstName: 'Luis', lastName: 'Sanchez', role: Role.MAGASINIER },
    { email: 'hse@ramondin.local', firstName: 'Elena', lastName: 'Rodriguez', role: Role.HSE },
    { email: 'admin@ramondin.local', firstName: 'System', lastName: 'Administrator', role: Role.ADMIN },
  ];

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);

  const users: Record<string, { id: string; email: string; role: Role }> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: hashedPassword,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        active: true,
      },
    });
    users[u.role] = user;
    console.log(`   ✓ Utilisateur ${u.firstName} ${u.lastName} (${u.role})`);
  }

  // ========================================================================
  // 2. SITE
  // ========================================================================
  console.log('🏭 [SEED] Creation du site Saint-Gaudens...');

  const site = await prisma.site.upsert({
    where: { code: 'LAG' },
    update: {},
    create: {
      name: 'Usine Saint-Gaudens',
      code: 'STG',
      location: 'Saint-Gaudens, Haute-Garonne, France',
    },
  });

  // ========================================================================
  // 3. ZONES
  // ========================================================================
  console.log('📍 [SEED] Creation des zones...');

  const zoneA = await prisma.zone.upsert({
    where: { code: 'ZA' },
    update: {},
    create: {
      name: 'Zone A — Production (Presses, Decoupe, Recuit)',
      code: 'ZA',
      siteId: site.id,
    },
  });

  const zoneB = await prisma.zone.upsert({
    where: { code: 'ZB' },
    update: {},
    create: {
      name: 'Zone B — Finition (Laquage, Serigraphie, Emballage)',
      code: 'ZB',
      siteId: site.id,
    },
  });

  const zoneC = await prisma.zone.upsert({
    where: { code: 'ZC' },
    update: {},
    create: {
      name: 'Zone C — Utilites (Air comprime, Electricite, Eau)',
      code: 'ZC',
      siteId: site.id,
    },
  });

  const zoneD = await prisma.zone.upsert({
    where: { code: 'ZD' },
    update: {},
    create: {
      name: 'Zone D — Stockage & Expedition',
      code: 'ZD',
      siteId: site.id,
    },
  });

  // ========================================================================
  // 4. LIGNES
  // ========================================================================
  console.log('🏭 [SEED] Creation des lignes...');

  const lignesData = [
    { name: 'Ligne Presses n°1', code: 'LPR1', zoneId: zoneA.id },
    { name: 'Ligne Presses n°2', code: 'LPR2', zoneId: zoneA.id },
    { name: 'Ligne Laquage n°1', code: 'LLQ1', zoneId: zoneB.id },
    { name: 'Ligne Serigraphie n°1', code: 'LSR1', zoneId: zoneB.id },
    { name: 'Ligne Emballage n°1', code: 'LEMB1', zoneId: zoneB.id },
    { name: 'Station Air Comprime', code: 'SAC1', zoneId: zoneC.id },
    { name: 'Poste Electricite', code: 'PELEC1', zoneId: zoneC.id },
    { name: 'Quai Expedition', code: 'QEXP1', zoneId: zoneD.id },
    { name: 'Entrepot Matieres Premieres', code: 'EMP1', zoneId: zoneD.id },
  ];

  const lignes: { id: string; code: string }[] = [];
  for (const l of lignesData) {
    const ligne = await prisma.ligne.upsert({
      where: { code: l.code },
      update: {},
      create: l,
    });
    lignes.push({ id: ligne.id, code: ligne.code });
    console.log(`   ✓ Ligne ${ligne.name}`);
  }

  const lpr1 = lignes.find((l) => l.code === 'LPR1')!;
  const lpr2 = lignes.find((l) => l.code === 'LPR2')!;
  const llq1 = lignes.find((l) => l.code === 'LLQ1')!;
  const lsr1 = lignes.find((l) => l.code === 'LSR1')!;
  const lemb1 = lignes.find((l) => l.code === 'LEMB1')!;
  const sac1 = lignes.find((l) => l.code === 'SAC1')!;
  const pelec1 = lignes.find((l) => l.code === 'PELEC1')!;
  const qexp1 = lignes.find((l) => l.code === 'QEXP1')!;
  const emp1 = lignes.find((l) => l.code === 'EMP1')!;

  // ========================================================================
  // 5. EQUIPEMENTS (55 items)
  // ========================================================================
  console.log('🔧 [SEED] Creation des equipements...');

  const equipmentsData = [
    // Presses
    { code: 'PR-001', name: 'Presse d\'emboutissage n°1', type: 'Presse', criticality: EquipmentCriticality.CRITIQUE, ligneId: lpr1.id, constructeur: 'Minster', dateMiseService: new Date('2018-03-15'), compteurActuel: 1250000, compteurUnite: 'coups' },
    { code: 'PR-002', name: 'Presse d\'emboutissage n°2', type: 'Presse', criticality: EquipmentCriticality.CRITIQUE, ligneId: lpr1.id, constructeur: 'Minster', dateMiseService: new Date('2019-06-20'), compteurActuel: 980000, compteurUnite: 'coups' },
    { code: 'PR-003', name: 'Presse d\'emboutissage n°3', type: 'Presse', criticality: EquipmentCriticality.CRITIQUE, ligneId: lpr2.id, constructeur: 'Komatsu', dateMiseService: new Date('2020-01-10'), compteurActuel: 750000, compteurUnite: 'coups' },
    { code: 'PR-004', name: 'Presse d\'emboutissage n°4', type: 'Presse', criticality: EquipmentCriticality.CRITIQUE, ligneId: lpr2.id, constructeur: 'Komatsu', dateMiseService: new Date('2021-04-05'), compteurActuel: 420000, compteurUnite: 'coups' },
    { code: 'PR-005', name: 'Presse d\'emboutissage n°5', type: 'Presse', criticality: EquipmentCriticality.CRITIQUE, ligneId: lpr2.id, constructeur: 'Aida', dateMiseService: new Date('2022-09-12'), compteurActuel: 180000, compteurUnite: 'coups' },
    { code: 'PR-006', name: 'Presse de redressage n°1', type: 'Presse', criticality: EquipmentCriticality.MOYENNE, ligneId: lpr1.id, constructeur: 'Schuler', dateMiseService: new Date('2017-05-18'), compteurActuel: 560000, compteurUnite: 'coups' },
    // Laquage
    { code: 'LQ-001', name: 'Ligne de laquage n°1', type: 'Laquage', criticality: EquipmentCriticality.ELEVEE, ligneId: llq1.id, contactAlimentaire: true, constructeur: 'SAMES', dateMiseService: new Date('2017-08-12'), compteurActuel: 85000, compteurUnite: 'm2' },
    { code: 'LQ-002', name: 'Ligne de laquage n°2', type: 'Laquage', criticality: EquipmentCriticality.ELEVEE, ligneId: llq1.id, contactAlimentaire: true, constructeur: 'SAMES', dateMiseService: new Date('2019-02-28'), compteurActuel: 62000, compteurUnite: 'm2' },
    { code: 'LQ-003', name: 'Ligne de laquage n°3', type: 'Laquage', criticality: EquipmentCriticality.ELEVEE, ligneId: llq1.id, contactAlimentaire: true, constructeur: 'Gema', dateMiseService: new Date('2022-07-15'), compteurActuel: 15000, compteurUnite: 'm2' },
    { code: 'LQ-004', name: 'Cabine de laquage manuel', type: 'Laquage', criticality: EquipmentCriticality.MOYENNE, ligneId: llq1.id, contactAlimentaire: true, constructeur: 'SAMES', dateMiseService: new Date('2020-11-03'), compteurActuel: 8000, compteurUnite: 'm2' },
    { code: 'LQ-005', name: 'Four de polymerisation', type: 'Four', criticality: EquipmentCriticality.ELEVEE, ligneId: llq1.id, constructeur: 'BMI', dateMiseService: new Date('2018-04-20'), compteurActuel: 36000, compteurUnite: 'heures' },
    // Serigraphie
    { code: 'SR-001', name: 'Machine serigraphie n°1', type: 'Serigraphie', criticality: EquipmentCriticality.MOYENNE, ligneId: lsr1.id, contactAlimentaire: true, constructeur: 'Tampoprint', dateMiseService: new Date('2018-11-01'), compteurActuel: 450000, compteurUnite: 'unites' },
    { code: 'SR-002', name: 'Machine serigraphie n°2', type: 'Serigraphie', criticality: EquipmentCriticality.MOYENNE, ligneId: lsr1.id, contactAlimentaire: true, constructeur: 'Tampoprint', dateMiseService: new Date('2020-05-20'), compteurActuel: 280000, compteurUnite: 'unites' },
    { code: 'SR-003', name: 'Machine serigraphie n°3', type: 'Serigraphie', criticality: EquipmentCriticality.MOYENNE, ligneId: lsr1.id, contactAlimentaire: true, constructeur: 'ITW Trans Tech', dateMiseService: new Date('2023-01-10'), compteurActuel: 45000, compteurUnite: 'unites' },
    { code: 'SR-004', name: 'Secheuse UV serigraphie', type: 'Serigraphie', criticality: EquipmentCriticality.MOYENNE, ligneId: lsr1.id, contactAlimentaire: true, constructeur: 'IST Metz', dateMiseService: new Date('2019-08-15'), compteurActuel: 29000, compteurUnite: 'heures' },
    // Fours & Traitement thermique
    { code: 'FR-001', name: 'Four de recuit tunnel', type: 'Four', criticality: EquipmentCriticality.CRITIQUE, ligneId: lpr1.id, constructeur: 'BMI', dateMiseService: new Date('2016-09-10'), compteurActuel: 48500, compteurUnite: 'heures' },
    { code: 'FR-002', name: 'Four de sechage pieces', type: 'Four', criticality: EquipmentCriticality.MOYENNE, ligneId: llq1.id, constructeur: 'BMI', dateMiseService: new Date('2018-12-01'), compteurActuel: 31000, compteurUnite: 'heures' },
    { code: 'FR-003', name: 'Etuve de sechage serigraphie', type: 'Four', criticality: EquipmentCriticality.MOYENNE, ligneId: lsr1.id, constructeur: 'Heraeus', dateMiseService: new Date('2021-06-15'), compteurActuel: 12000, compteurUnite: 'heures' },
    // Compresseurs & Air comprime
    { code: 'CP-001', name: 'Compresseur air principal', type: 'Compresseur', criticality: EquipmentCriticality.ELEVEE, ligneId: lpr1.id, constructeur: 'Atlas Copco', dateMiseService: new Date('2017-01-15'), compteurActuel: 42000, compteurUnite: 'heures' },
    { code: 'CP-002', name: 'Compresseur air auxiliaire', type: 'Compresseur', criticality: EquipmentCriticality.MOYENNE, ligneId: lpr2.id, constructeur: 'Atlas Copco', dateMiseService: new Date('2021-03-22'), compteurActuel: 18000, compteurUnite: 'heures' },
    { code: 'CP-003', name: 'Compresseur a vis n°1', type: 'Compresseur', criticality: EquipmentCriticality.ELEVEE, ligneId: sac1.id, constructeur: 'Kaeser', dateMiseService: new Date('2019-05-10'), compteurActuel: 28000, compteurUnite: 'heures' },
    { code: 'CP-004', name: 'Compresseur a vis n°2', type: 'Compresseur', criticality: EquipmentCriticality.ELEVEE, ligneId: sac1.id, constructeur: 'Kaeser', dateMiseService: new Date('2020-02-28'), compteurActuel: 22000, compteurUnite: 'heures' },
    { code: 'SC-001', name: 'Sechoir d\'air comprime', type: 'Compresseur', criticality: EquipmentCriticality.ELEVEE, ligneId: sac1.id, constructeur: 'Donaldson', dateMiseService: new Date('2019-05-10'), compteurActuel: 28000, compteurUnite: 'heures' },
    { code: 'RB-001', name: 'Reservoir air 500L', type: 'Compresseur', criticality: EquipmentCriticality.MOYENNE, ligneId: sac1.id, constructeur: 'Atlas Copco', dateMiseService: new Date('2017-01-15'), compteurActuel: 0, compteurUnite: 'heures' },
    // Depoussiereurs & Filtration
    { code: 'DP-001', name: 'Depoussiereur industriel', type: 'Depoussiereur', criticality: EquipmentCriticality.CRITIQUE, ligneId: lpr1.id, constructeur: 'WAM', dateMiseService: new Date('2019-08-01'), compteurActuel: 32000, compteurUnite: 'heures' },
    { code: 'DP-002', name: 'Filtre a manches ligne laquage', type: 'Depoussiereur', criticality: EquipmentCriticality.ELEVEE, ligneId: llq1.id, constructeur: 'Delfin', dateMiseService: new Date('2020-03-15'), compteurActuel: 24000, compteurUnite: 'heures' },
    { code: 'DP-003', name: 'Hotte aspiration poussieres', type: 'Ventilation', criticality: EquipmentCriticality.MOYENNE, ligneId: lpr2.id, constructeur: 'Nederman', dateMiseService: new Date('2018-07-20'), compteurActuel: 35000, compteurUnite: 'heures' },
    // Decoupe & Outillage
    { code: 'DC-001', name: 'Decoupeuse rotative', type: 'Decoupe', criticality: EquipmentCriticality.MOYENNE, ligneId: lpr1.id, constructeur: 'Atlas Die', dateMiseService: new Date('2020-06-10'), compteurActuel: 210000, compteurUnite: 'coups' },
    { code: 'DC-002', name: 'Decoupeuse laser CO2', type: 'Decoupe', criticality: EquipmentCriticality.MOYENNE, ligneId: lpr2.id, constructeur: 'Trumpf', dateMiseService: new Date('2021-09-01'), compteurActuel: 8500, compteurUnite: 'heures' },
    { code: 'DC-003', name: 'Decoupeuse plastron', type: 'Decoupe', criticality: EquipmentCriticality.FAIBLE, ligneId: lpr1.id, constructeur: 'Bobst', dateMiseService: new Date('2019-11-12'), compteurActuel: 95000, compteurUnite: 'coups' },
    // Emballage
    { code: 'EM-001', name: 'Ligne emballage automatique', type: 'Emballage', criticality: EquipmentCriticality.MOYENNE, ligneId: lsr1.id, contactAlimentaire: true, constructeur: 'ProMach', dateMiseService: new Date('2019-04-15'), compteurActuel: 150000, compteurUnite: 'unites' },
    { code: 'EM-002', name: 'Cercleuse automatique', type: 'Emballage', criticality: EquipmentCriticality.MOYENNE, ligneId: lemb1.id, contactAlimentaire: true, constructeur: 'Signode', dateMiseService: new Date('2020-08-20'), compteurActuel: 78000, compteurUnite: 'unites' },
    { code: 'EM-003', name: 'Thermoretrécissable', type: 'Emballage', criticality: EquipmentCriticality.MOYENNE, ligneId: lemb1.id, contactAlimentaire: true, constructeur: 'ARPAC', dateMiseService: new Date('2018-03-10'), compteurActuel: 65000, compteurUnite: 'unites' },
    { code: 'EM-004', name: 'Etiqueteuse automatique', type: 'Emballage', criticality: EquipmentCriticality.FAIBLE, ligneId: lemb1.id, contactAlimentaire: true, constructeur: 'CAB', dateMiseService: new Date('2021-01-15'), compteurActuel: 42000, compteurUnite: 'unites' },
    { code: 'EM-005', name: 'Balance controle poids', type: 'Emballage', criticality: EquipmentCriticality.ELEVEE, ligneId: lemb1.id, contactAlimentaire: true, constructeur: 'Mettler Toledo', dateMiseService: new Date('2019-06-01'), compteurActuel: 110000, compteurUnite: 'unites' },
    // Convoyeurs
    { code: 'CV-001', name: 'Convoyeur principal Zone A', type: 'Convoyeur', criticality: EquipmentCriticality.FAIBLE, ligneId: lpr1.id, constructeur: 'Interroll', dateMiseService: new Date('2018-02-01'), compteurActuel: 38000, compteurUnite: 'heures' },
    { code: 'CV-002', name: 'Convoyeur Zone B', type: 'Convoyeur', criticality: EquipmentCriticality.FAIBLE, ligneId: llq1.id, constructeur: 'Interroll', dateMiseService: new Date('2020-09-20'), compteurActuel: 22000, compteurUnite: 'heures' },
    { code: 'CV-003', name: 'Convoyeur retour dechets', type: 'Convoyeur', criticality: EquipmentCriticality.FAIBLE, ligneId: lpr2.id, constructeur: 'Interroll', dateMiseService: new Date('2019-04-15'), compteurActuel: 26000, compteurUnite: 'heures' },
    { code: 'CV-004', name: 'Convoyeur palette quai', type: 'Convoyeur', criticality: EquipmentCriticality.FAIBLE, ligneId: qexp1.id, constructeur: 'AmbaFlex', dateMiseService: new Date('2021-07-01'), compteurActuel: 12000, compteurUnite: 'heures' },
    { code: 'CV-005', name: 'Monte-charge palettes', type: 'Convoyeur', criticality: EquipmentCriticality.MOYENNE, ligneId: emp1.id, constructeur: 'Beumer', dateMiseService: new Date('2018-10-10'), compteurActuel: 18000, compteurUnite: 'heures' },
    // Ventilation & Aspiration
    { code: 'AC-001', name: 'Groupe aspiration centrale', type: 'Ventilation', criticality: EquipmentCriticality.ELEVEE, ligneId: lpr1.id, constructeur: 'Systemair', dateMiseService: new Date('2017-11-10'), compteurActuel: 51000, compteurUnite: 'heures' },
    { code: 'AC-002', name: 'Ventilateur extraction fumees', type: 'Ventilation', criticality: EquipmentCriticality.ELEVEE, ligneId: llq1.id, constructeur: 'Systemair', dateMiseService: new Date('2018-05-22'), compteurActuel: 43000, compteurUnite: 'heures' },
    { code: 'AC-003', name: 'Ventilateur hotte laquage', type: 'Ventilation', criticality: EquipmentCriticality.ELEVEE, ligneId: llq1.id, constructeur: 'Kruger', dateMiseService: new Date('2019-09-10'), compteurActuel: 31000, compteurUnite: 'heures' },
    // Ecluses & Manutention
    { code: 'EL-001', name: 'Ecluse rotative', type: 'Ecluse', criticality: EquipmentCriticality.ELEVEE, ligneId: lpr1.id, constructeur: 'DMN Westinghouse', dateMiseService: new Date('2021-01-20'), compteurActuel: 14000, compteurUnite: 'heures' },
    { code: 'EL-002', name: 'Ecluse rotative silo', type: 'Ecluse', criticality: EquipmentCriticality.MOYENNE, ligneId: emp1.id, constructeur: 'DMN Westinghouse', dateMiseService: new Date('2020-04-05'), compteurActuel: 18000, compteurUnite: 'heures' },
    { code: 'EL-003', name: 'Vanne papillon DN400', type: 'Ecluse', criticality: EquipmentCriticality.FAIBLE, ligneId: sac1.id, constructeur: 'WAM', dateMiseService: new Date('2019-02-15'), compteurActuel: 0, compteurUnite: 'heures' },
    // Electricite & Automatisme
    { code: 'TR-001', name: 'Transformateur principal 1000kVA', type: 'Electricite', criticality: EquipmentCriticality.CRITIQUE, ligneId: pelec1.id, constructeur: 'Schneider', dateMiseService: new Date('2016-01-10'), compteurActuel: 0, compteurUnite: 'heures' },
    { code: 'TR-002', name: 'Transformateur auxiliaire 400kVA', type: 'Electricite', criticality: EquipmentCriticality.ELEVEE, ligneId: pelec1.id, constructeur: 'Schneider', dateMiseService: new Date('2018-06-20'), compteurActuel: 0, compteurUnite: 'heures' },
    { code: 'GE-001', name: 'Groupe electrogene secours', type: 'Electricite', criticality: EquipmentCriticality.CRITIQUE, ligneId: pelec1.id, constructeur: 'Cummins', dateMiseService: new Date('2017-03-15'), compteurActuel: 5200, compteurUnite: 'heures' },
    { code: 'AR-001', name: 'Armoire electrique generale', type: 'Electricite', criticality: EquipmentCriticality.ELEVEE, ligneId: pelec1.id, constructeur: 'Schneider', dateMiseService: new Date('2016-01-10'), compteurActuel: 0, compteurUnite: 'heures' },
    { code: 'ON-001', name: 'Onduleur ASI', type: 'Electricite', criticality: EquipmentCriticality.CRITIQUE, ligneId: pelec1.id, constructeur: 'APC', dateMiseService: new Date('2020-11-01'), compteurActuel: 0, compteurUnite: 'heures' },
    // Stockage & Manutention
    { code: 'CH-001', name: 'Chariot elevateurs n°1', type: 'Manutention', criticality: EquipmentCriticality.MOYENNE, ligneId: emp1.id, constructeur: 'Toyota', dateMiseService: new Date('2019-08-12'), compteurActuel: 8500, compteurUnite: 'heures' },
    { code: 'CH-002', name: 'Chariot elevateurs n°2', type: 'Manutention', criticality: EquipmentCriticality.MOYENNE, ligneId: qexp1.id, constructeur: 'Toyota', dateMiseService: new Date('2021-02-20'), compteurActuel: 4200, compteurUnite: 'heures' },
    { code: 'CH-003', name: 'Transpalette electrique', type: 'Manutention', criticality: EquipmentCriticality.FAIBLE, ligneId: emp1.id, constructeur: 'Still', dateMiseService: new Date('2020-05-15'), compteurActuel: 3600, compteurUnite: 'heures' },
    { code: 'PO-001', name: 'Pont roulant 5T', type: 'Manutention', criticality: EquipmentCriticality.ELEVEE, ligneId: lpr1.id, constructeur: 'Demag', dateMiseService: new Date('2016-04-10'), compteurActuel: 12000, compteurUnite: 'heures' },
    { code: 'PO-002', name: 'Pont roulant 3T', type: 'Manutention', criticality: EquipmentCriticality.ELEVEE, ligneId: lpr2.id, constructeur: 'Demag', dateMiseService: new Date('2018-09-22'), compteurActuel: 8500, compteurUnite: 'heures' },
    // Traitement eau
    { code: 'TE-001', name: 'Station de traitement des eaux', type: 'TraitementEau', criticality: EquipmentCriticality.ELEVEE, ligneId: llq1.id, constructeur: 'Veolia', dateMiseService: new Date('2017-07-01'), compteurActuel: 48000, compteurUnite: 'heures' },
    { code: 'TE-002', name: 'Pompe de relevage eaux usees', type: 'TraitementEau', criticality: EquipmentCriticality.MOYENNE, ligneId: sac1.id, constructeur: 'Grundfos', dateMiseService: new Date('2019-03-10'), compteurActuel: 22000, compteurUnite: 'heures' },
    { code: 'TE-003', name: 'Adoucisseur d\'eau', type: 'TraitementEau', criticality: EquipmentCriticality.FAIBLE, ligneId: sac1.id, constructeur: 'Culligan', dateMiseService: new Date('2020-01-20'), compteurActuel: 15000, compteurUnite: 'heures' },
    // Pesage & Metrologie
    { code: 'PE-001', name: 'Balance de precision labo', type: 'Metrologie', criticality: EquipmentCriticality.MOYENNE, ligneId: lpr1.id, constructeur: 'Sartorius', dateMiseService: new Date('2021-05-10'), compteurActuel: 0, compteurUnite: 'heures' },
    { code: 'PE-002', name: 'Densimetre en ligne', type: 'Metrologie', criticality: EquipmentCriticality.FAIBLE, ligneId: llq1.id, constructeur: 'Anton Paar', dateMiseService: new Date('2020-08-15'), compteurActuel: 0, compteurUnite: 'heures' },
    // Controle qualite
    { code: 'CQ-001', name: 'Machine de controle optique', type: 'ControleQualite', criticality: EquipmentCriticality.MOYENNE, ligneId: lpr1.id, constructeur: 'Keyence', dateMiseService: new Date('2022-02-01'), compteurActuel: 8500, compteurUnite: 'heures' },
    { code: 'CQ-002', name: 'Testeur d\'etancheite', type: 'ControleQualite', criticality: EquipmentCriticality.ELEVEE, ligneId: lpr2.id, constructeur: 'Zaxis', dateMiseService: new Date('2021-06-10'), compteurActuel: 12000, compteurUnite: 'heures' },
    { code: 'CQ-003', name: 'Spectrophotometre', type: 'ControleQualite', criticality: EquipmentCriticality.MOYENNE, ligneId: llq1.id, constructeur: 'X-Rite', dateMiseService: new Date('2020-04-20'), compteurActuel: 6000, compteurUnite: 'heures' },
  ];

  const equipments: Record<string, { id: string; code: string }> = {};

  for (const e of equipmentsData) {
    const eq = await prisma.equipment.upsert({
      where: { code: e.code },
      update: {},
      create: {
        code: e.code,
        name: e.name,
        type: e.type,
        criticality: e.criticality,
        localisation: e.ligneId,
        ligneId: e.ligneId,
        contactAlimentaire: e.contactAlimentaire ?? false,
        constructeur: e.constructeur,
        dateMiseService: e.dateMiseService,
        compteurActuel: e.compteurActuel ?? 0,
        compteurUnite: e.compteurUnite,
        statut: EquipmentStatus.EN_SERVICE,
      },
    });
    equipments[e.code] = eq;
    console.log(`   ✓ Equipement ${e.code} — ${e.name}`);
  }

  // ========================================================================
  // 6. BONS DE TRAVAIL (15 items)
  // ========================================================================
  console.log('📝 [SEED] Creation des bons de travail...');

  const workOrdersData = [
    { numero: 'BT-2025-0001', title: 'Remplacement matrice superieure PR-001', description: 'Usure detectee sur matrice superieure, traces de deformation.', equipmentCode: 'PR-001', type: WorkOrderType.CORRECTIF, priority: Priority.URGENTE, status: WorkOrderStatus.CLOTURE, dureeMinutes: 180, causePanne: 'Usure', actionsRealisees: 'Remplacement matrice, reglage jeu, graissage' },
    { numero: 'BT-2025-0002', title: 'Nettoyage buses ligne laquage LQ-001', description: 'Encrassement des buses, perte de qualite de jet.', equipmentCode: 'LQ-001', type: WorkOrderType.PREVENTIF, priority: Priority.MOYENNE, status: WorkOrderStatus.TERMINE, dureeMinutes: 120, actionsRealisees: 'Nettoyage buses, controle viscosite, changement filtres' },
    { numero: 'BT-2025-0003', title: 'Fuite pneumatique convoyeur CV-001', description: 'Fuite d\'air sur le vérin d\'indexage.', equipmentCode: 'CV-001', type: WorkOrderType.CORRECTIF, priority: Priority.HAUTE, status: WorkOrderStatus.EN_COURS, actionsRealisees: '' },
    { numero: 'BT-2025-0004', title: 'Inspection depoussiereur DP-001', description: 'Inspection mensuelle installation.', equipmentCode: 'DP-001', type: WorkOrderType.PREVENTIF, priority: Priority.HAUTE, status: WorkOrderStatus.PLANIFIE, actionsRealisees: '' },
    { numero: 'BT-2025-0005', title: 'Réglage presse PR-002 — alignement', description: 'Désalignement detecte, vibrations anormales.', equipmentCode: 'PR-002', type: WorkOrderType.CORRECTIF, priority: Priority.HAUTE, status: WorkOrderStatus.CLOTURE, dureeMinutes: 90, causePanne: 'Réglage', actionsRealisees: 'Réalignement, serrage bolts, verification jeu' },
    { numero: 'BT-2025-0006', title: 'Maintenance préventive compresseur CP-001', description: 'Vidange condensats, controle pression, filtre air.', equipmentCode: 'CP-001', type: WorkOrderType.PREVENTIF, priority: Priority.MOYENNE, status: WorkOrderStatus.TERMINE, dureeMinutes: 60, actionsRealisees: 'Vidange, controle pression, remplacement filtre' },
    { numero: 'BT-2025-0007', title: 'Panne electrique four recuit FR-001', description: 'Thermocouple T3 defaillant, temperature instable.', equipmentCode: 'FR-001', type: WorkOrderType.CORRECTIF, priority: Priority.URGENTE, status: WorkOrderStatus.TERMINE, dureeMinutes: 240, causePanne: 'Électrique', actionsRealisees: 'Remplacement thermocouple, calibration, essai' },
    { numero: 'BT-2025-0008', title: 'Changement roulements serigraphie SR-001', description: 'Bruit anormal tete d\'impression.', equipmentCode: 'SR-001', type: WorkOrderType.CORRECTIF, priority: Priority.MOYENNE, status: WorkOrderStatus.CLOTURE, dureeMinutes: 150, causePanne: 'Usure', actionsRealisees: 'Remplacement roulements, reglage courroie' },
    { numero: 'BT-2025-0009', title: 'Inspection machines Zone A', description: 'Verification arrets d\'urgence, barrières, interlocks.', equipmentCode: 'PR-001', type: WorkOrderType.PREVENTIF, priority: Priority.HAUTE, status: WorkOrderStatus.PLANIFIE, actionsRealisees: '' },
    { numero: 'BT-2025-0010', title: 'Optimisation cycle presse PR-003', description: 'Amelioration parametres pour reduire temps cycle.', equipmentCode: 'PR-003', type: WorkOrderType.AMELIORATION, priority: Priority.BASSE, status: WorkOrderStatus.CREE, actionsRealisees: '' },
    { numero: 'BT-2025-0011', title: 'Fuite hydraulique decoupeuse DC-001', description: 'Fuite sur distributeur principal.', equipmentCode: 'DC-001', type: WorkOrderType.CORRECTIF, priority: Priority.HAUTE, status: WorkOrderStatus.EN_COURS, actionsRealisees: '' },
    { numero: 'BT-2025-0012', title: 'Nettoyage filtration laquage LQ-002', description: 'Remplacement filtres cuve et pompe.', equipmentCode: 'LQ-002', type: WorkOrderType.PREVENTIF, priority: Priority.MOYENNE, status: WorkOrderStatus.TERMINE, dureeMinutes: 90, actionsRealisees: 'Nettoyage cuve, remplacement filtres, controle pompe' },
    { numero: 'BT-2025-0013', title: 'Panne compresseur CP-002', description: 'Surchauffe groupe, arret automatique.', equipmentCode: 'CP-002', type: WorkOrderType.CORRECTIF, priority: Priority.URGENTE, status: WorkOrderStatus.PLANIFIE, actionsRealisees: '' },
    { numero: 'BT-2025-0014', title: 'Calibrage machine serigraphie SR-002', description: 'Derive couleur detectee sur controle qualite.', equipmentCode: 'SR-002', type: WorkOrderType.CONDITIONNEL, priority: Priority.MOYENNE, status: WorkOrderStatus.CREE, actionsRealisees: '' },
    { numero: 'BT-2025-0015', title: 'Verification ecluse rotative EL-001', description: 'Controle usure palettes et joint tournant.', equipmentCode: 'EL-001', type: WorkOrderType.PREVENTIF, priority: Priority.MOYENNE, status: WorkOrderStatus.TERMINE, dureeMinutes: 75, actionsRealisees: 'Controle usure, graissage, ajustement jeu' },
  ];

  for (const wo of workOrdersData) {
    const eq = equipments[wo.equipmentCode];

    await prisma.workOrder.upsert({
      where: { numero: wo.numero },
      update: {},
      create: {
        numero: wo.numero,
        title: wo.title,
        description: wo.description,
        equipmentId: eq?.id,
        type: wo.type,
        priority: wo.priority,
        status: wo.status,
        demandeurId: users[Role.OPERATEUR]?.id ?? users[Role.ADMIN]!.id,
        technicienId: wo.status !== WorkOrderStatus.CREE ? users[Role.TECHNICIEN]!.id : null,
        responsableId: users[Role.RESPONSABLE]!.id,
        dateCreation: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        datePlanifiee: wo.status !== WorkOrderStatus.CREE ? new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000) : null,
        dateDebut: ([WorkOrderStatus.EN_COURS, WorkOrderStatus.TERMINE, WorkOrderStatus.CLOTURE] as WorkOrderStatus[]).includes(wo.status) ? new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000) : null,
        dateFin: ([WorkOrderStatus.TERMINE, WorkOrderStatus.CLOTURE] as WorkOrderStatus[]).includes(wo.status) ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000) : null,
        dureeMinutes: wo.dureeMinutes ?? null,
        causePanne: wo.causePanne ?? null,
        actionsRealisees: wo.actionsRealisees ?? null,
        validatedBy: wo.status === WorkOrderStatus.CLOTURE ? users[Role.RESPONSABLE]!.id : null,
        validatedAt: wo.status === WorkOrderStatus.CLOTURE ? new Date() : null,
      },
    });
    console.log(`   ✓ BT ${wo.numero} — ${wo.title}`);
  }

  // ========================================================================
  // 7. STOCK ITEMS (30 items)
  // ========================================================================
  console.log('📦 [SEED] Creation des articles de stock...');

  const stockItemsData = [
    { code: 'MAT-PR-001', name: 'Matrice emboutissage PR-001', famille: 'Mécanique', sousFamille: 'Matrice', quantite: 2, stockMinimum: 1, localisation: 'Magasin A — Étagère 1 — Bac 1', prixUnitaire: 4500.00, fournisseur: 'Minster France' },
    { code: 'MAT-PR-002', name: 'Matrice emboutissage PR-002', famille: 'Mécanique', sousFamille: 'Matrice', quantite: 1, stockMinimum: 1, localisation: 'Magasin A — Étagère 1 — Bac 2', prixUnitaire: 4500.00, fournisseur: 'Minster France' },
    { code: 'BUS-LQ-001', name: 'Buse laquage LQ-001 (0.8mm)', famille: 'Mécanique', sousFamille: 'Buse', quantite: 12, stockMinimum: 5, localisation: 'Magasin B — Étagère 2 — Bac 5', prixUnitaire: 85.00, fournisseur: 'SAMES' },
    { code: 'BUS-LQ-002', name: 'Buse laquage LQ-002 (1.2mm)', famille: 'Mécanique', sousFamille: 'Buse', quantite: 8, stockMinimum: 5, localisation: 'Magasin B — Étagère 2 — Bac 6', prixUnitaire: 92.00, fournisseur: 'SAMES' },
    { code: 'POM-LQ-001', name: 'Pompe laquage SAMES PP-30', famille: 'Hydraulique', sousFamille: 'Pompe', quantite: 1, stockMinimum: 1, localisation: 'Magasin B — Étagère 3 — Bac 1', prixUnitaire: 2400.00, fournisseur: 'SAMES' },
    { code: 'TAM-SR-001', name: 'Tampon serigraphie 60 Shore', famille: 'Consommable', sousFamille: 'Tampon', quantite: 25, stockMinimum: 10, localisation: 'Magasin B — Étagère 4 — Bac 3', prixUnitaire: 45.00, fournisseur: 'Tampoprint' },
    { code: 'TAM-SR-002', name: 'Tampon serigraphie 70 Shore', famille: 'Consommable', sousFamille: 'Tampon', quantite: 18, stockMinimum: 10, localisation: 'Magasin B — Étagère 4 — Bac 4', prixUnitaire: 45.00, fournisseur: 'Tampoprint' },
    { code: 'JOI-001', name: 'Kit joints toriques presses (x50)', famille: 'Mécanique', sousFamille: 'Joint', quantite: 4, stockMinimum: 2, localisation: 'Magasin A — Étagère 2 — Bac 10', prixUnitaire: 120.00, fournisseur: 'Parker' },
    { code: 'JOI-002', name: 'Kit joints laquage (x30)', famille: 'Mécanique', sousFamille: 'Joint', quantite: 3, stockMinimum: 2, localisation: 'Magasin B — Étagère 2 — Bac 8', prixUnitaire: 95.00, fournisseur: 'Parker' },
    { code: 'FIL-AC-001', name: 'Filtre air compresseur Atlas Copco', famille: 'Mécanique', sousFamille: 'Filtre', quantite: 6, stockMinimum: 3, localisation: 'Magasin C — Étagère 1 — Bac 2', prixUnitaire: 78.00, fournisseur: 'Atlas Copco' },
    { code: 'THE-FR-001', name: 'Thermocouple type K four recuit', famille: 'Électrique', sousFamille: 'Thermocouple', quantite: 3, stockMinimum: 2, localisation: 'Magasin C — Étagère 2 — Bac 1', prixUnitaire: 185.00, fournisseur: 'BMI' },
    { code: 'FIL-DP-001', name: 'Filtre cartouche depoussiereur', famille: 'Mécanique', sousFamille: 'Filtre', quantite: 8, stockMinimum: 4, localisation: 'Magasin C — Étagère 1 — Bac 5', prixUnitaire: 220.00, fournisseur: 'WAM' },
    { code: 'HUI-PR-001', name: 'Huile hydraulique ISO VG 46 (200L)', famille: 'Consommable', sousFamille: 'Huile', quantite: 2, stockMinimum: 1, localisation: 'Magasin D — Zone fluides', prixUnitaire: 450.00, fournisseur: 'Total' },
    { code: 'GRE-001', name: 'Graisse alimentaire NSF H1 (5kg)', famille: 'Consommable', sousFamille: 'Graisse', quantite: 4, stockMinimum: 2, localisation: 'Magasin D — Zone fluides', prixUnitaire: 85.00, fournisseur: 'Klüber' },
    { code: 'PEI-001', name: 'Peinture laquage RAL 3005 (20L)', famille: 'Consommable', sousFamille: 'Peinture', quantite: 6, stockMinimum: 3, localisation: 'Magasin D — Zone peintures', prixUnitaire: 180.00, fournisseur: 'SAMES' },
    { code: 'ROU-001', name: 'Roulement SKF 6208-2RS', famille: 'Mécanique', sousFamille: 'Roulement', quantite: 10, stockMinimum: 5, localisation: 'Magasin A — Étagère 3 — Bac 2', prixUnitaire: 35.00, fournisseur: 'SKF' },
    { code: 'ROU-002', name: 'Roulement SKF 6314-C3', famille: 'Mécanique', sousFamille: 'Roulement', quantite: 4, stockMinimum: 2, localisation: 'Magasin A — Étagère 3 — Bac 3', prixUnitaire: 120.00, fournisseur: 'SKF' },
    { code: 'VIS-001', name: 'Vis sans fin ecluse DMN 200mm', famille: 'Mécanique', sousFamille: 'Vis', quantite: 1, stockMinimum: 1, localisation: 'Magasin A — Étagère 4 — Bac 1', prixUnitaire: 850.00, fournisseur: 'DMN Westinghouse' },
    { code: 'MOT-001', name: 'Moteur 5.5kW 400V IP55', famille: 'Électrique', sousFamille: 'Moteur', quantite: 2, stockMinimum: 1, localisation: 'Magasin C — Étagère 3 — Bac 2', prixUnitaire: 650.00, fournisseur: 'Leroy-Somer' },
    { code: 'MOT-002', name: 'Moteur 11kW 400V IP55', famille: 'Électrique', sousFamille: 'Moteur', quantite: 1, stockMinimum: 1, localisation: 'Magasin C — Étagère 3 — Bac 3', prixUnitaire: 1100.00, fournisseur: 'Leroy-Somer' },
    { code: 'VAR-001', name: 'Variateur Altivar  ATV320 5.5kW', famille: 'Électrique', sousFamille: 'Variateur', quantite: 1, stockMinimum: 1, localisation: 'Magasin C — Étagère 4 — Bac 1', prixUnitaire: 890.00, fournisseur: 'Schneider' },
    { code: 'BRO-FR-001', name: 'Bruleur gaz four recuit BMI', famille: 'Mécanique', sousFamille: 'Brûleur', quantite: 1, stockMinimum: 1, localisation: 'Magasin A — Étagère 5 — Bac 1', prixUnitaire: 3200.00, fournisseur: 'BMI' },
    { code: 'VEN-001', name: 'Ventilateur centrifuge 2.2kW', famille: 'Mécanique', sousFamille: 'Ventilateur', quantite: 2, stockMinimum: 1, localisation: 'Magasin A — Étagère 5 — Bac 2', prixUnitaire: 480.00, fournisseur: 'Systemair' },
    { code: 'COU-001', name: 'Coussinet bronze presse (jeu)', famille: 'Mécanique', sousFamille: 'Coussinet', quantite: 6, stockMinimum: 3, localisation: 'Magasin A — Étagère 2 — Bac 5', prixUnitaire: 65.00, fournisseur: 'Minster France' },
    { code: 'DET-001', name: 'Detecteur de proximite ind. M18', famille: 'Électrique', sousFamille: 'Capteur', quantite: 8, stockMinimum: 4, localisation: 'Magasin C — Étagère 5 — Bac 1', prixUnitaire: 42.00, fournisseur: 'IFM' },
    { code: 'LUB-001', name: 'Systeme lubrification centralisee', famille: 'Hydraulique', sousFamille: 'Pompe', quantite: 1, stockMinimum: 1, localisation: 'Magasin B — Étagère 3 — Bac 2', prixUnitaire: 1800.00, fournisseur: 'SKF Lincoln' },
    { code: 'ENC-001', name: 'Enceinte protection (cartouche)', famille: 'Mécanique', sousFamille: 'Cartouche', quantite: 4, stockMinimum: 2, localisation: 'Magasin C — Étagère 6 — Bac 1', prixUnitaire: 350.00, fournisseur: 'WAM' },
    { code: 'CEL-001', name: 'Cellule photoelectrique diffuse', famille: 'Électrique', sousFamille: 'Capteur', quantite: 5, stockMinimum: 3, localisation: 'Magasin C — Étagère 5 — Bac 2', prixUnitaire: 55.00, fournisseur: 'Sick' },
    { code: 'COU-PR-001', name: 'Couplage elastique presse 180mm', famille: 'Mécanique', sousFamille: 'Couplage', quantite: 2, stockMinimum: 1, localisation: 'Magasin A — Étagère 3 — Bac 6', prixUnitaire: 210.00, fournisseur: 'Lovejoy' },
    { code: 'RES-001', name: 'Resistance chauffante four 2kW', famille: 'Électrique', sousFamille: 'Résistance', quantite: 4, stockMinimum: 2, localisation: 'Magasin C — Étagère 2 — Bac 3', prixUnitaire: 145.00, fournisseur: 'BMI' },
  ];

  const stockItems: Record<string, { id: string; code: string }> = {};

  for (const s of stockItemsData) {
    const item = await prisma.stockItem.upsert({
      where: { code: s.code },
      update: {},
      create: {
        code: s.code,
        name: s.name,
        famille: s.famille,
        sousFamille: s.sousFamille,
        quantite: s.quantite,
        stockMinimum: s.stockMinimum,
        localisation: s.localisation,
        prixUnitaire: s.prixUnitaire,
        fournisseur: s.fournisseur,
        active: true,
      },
    });
    stockItems[s.code] = item;
    console.log(`   ✓ Stock ${s.code} — ${s.name}`);
  }

  // Mouvements de stock initiaux (entrees)
  for (const s of stockItemsData) {
    const item = stockItems[s.code];
    await prisma.stockMovement.create({
      data: {
        stockItemId: item.id,
        type: StockMovementType.ENTREE,
        quantite: s.quantite,
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        commentaire: 'Stock initial — reception commande',
      },
    });
  }

  // ========================================================================
  // 8. PLANS PREVENTIFS (8 items)
  // ========================================================================
  console.log('🔁 [SEED] Creation des plans preventifs...');

  const preventivePlansData = [
    { equipmentCode: 'PR-001', title: 'Preventif matrices presse PR-001', description: 'Changement matrices, graissage, controle jeu', frequencyType: 'compteur', frequencyValue: 500000, nextExecution: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), alerteAvantJours: 7 },
    { equipmentCode: 'PR-002', title: 'Preventif matrices presse PR-002', description: 'Changement matrices, graissage, controle jeu', frequencyType: 'compteur', frequencyValue: 500000, nextExecution: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), alerteAvantJours: 7 },
    { equipmentCode: 'LQ-001', title: 'Preventif hebdomadaire laquage LQ-001', description: 'Nettoyage buses, controle viscosite, filtration', frequencyType: 'jours', frequencyValue: 15, nextExecution: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), alerteAvantJours: 3 },
    { equipmentCode: 'FR-001', title: 'Preventif mensuel four recuit', description: 'Controle bruleurs, thermocouples, circulation air', frequencyType: 'jours', frequencyValue: 30, nextExecution: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), alerteAvantJours: 7 },
    { equipmentCode: 'CP-001', title: 'Preventif hebdomadaire compresseur', description: 'Vidange condensats, controle pression, filtre air', frequencyType: 'jours', frequencyValue: 7, nextExecution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), alerteAvantJours: 1 },
    { equipmentCode: 'DP-001', title: 'Inspection depoussiereur', description: 'Controle depression, nettoyage filtres, inspection', frequencyType: 'jours', frequencyValue: 7, nextExecution: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), alerteAvantJours: 2 },
    { equipmentCode: 'SR-001', title: 'Preventif tampons serigraphie', description: 'Remplacement tampons usés, nettoyage enceinte', frequencyType: 'compteur', frequencyValue: 200000, nextExecution: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), alerteAvantJours: 5 },
    { equipmentCode: 'AC-001', title: 'Preventif ventilation Zone A', description: 'Controle courroies, paliers, bilan de depression', frequencyType: 'jours', frequencyValue: 30, nextExecution: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), alerteAvantJours: 5 },
  ];

  for (const p of preventivePlansData) {
    const eq = equipments[p.equipmentCode];
    await prisma.preventivePlan.create({
      data: {
        equipmentId: eq!.id,
        title: p.title,
        description: p.description,
        frequencyType: p.frequencyType,
        frequencyValue: p.frequencyValue,
        nextExecution: p.nextExecution,
        alerteAvantJours: p.alerteAvantJours,
        autoGenerateWO: true,
        active: true,
        checklist: JSON.stringify([
          { ordre: 1, description: 'Verifier etat general equipement', type: 'checkbox', obligatoire: true },
          { ordre: 2, description: 'Controler points de lubrification', type: 'checkbox', obligatoire: true },
          { ordre: 3, description: 'Mesurer temperatures / pressions', type: 'valeur', obligatoire: false },
          { ordre: 4, description: 'Nettoyer zones sensibles', type: 'checkbox', obligatoire: true },
          { ordre: 5, description: 'Photo avant / apres', type: 'photo', obligatoire: false },
        ]),
      },
    });
    console.log(`   ✓ Plan preventif — ${p.title}`);
  }

  console.log('\n✅ [SEED] Initialisation terminee avec succes !');
  console.log(`   📊 Recapitulatif :`);
  console.log(`      • ${usersData.length} utilisateurs`);
  console.log(`      • 1 site, 2 zones, 4 lignes`);
  console.log(`      • ${equipmentsData.length} equipements`);
  console.log(`      • ${workOrdersData.length} bons de travail`);
  console.log(`      • ${stockItemsData.length} articles de stock`);
  console.log(`      • ${preventivePlansData.length} plans preventifs`);
}

main()
  .catch((e: Error) => {
    console.error('❌ [SEED] Erreur lors de l\'initialisation :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
