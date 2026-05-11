import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const PRIMARY = rgb(0.718, 0.11, 0.11);
const DARK = rgb(0.1, 0.1, 0.12);
const GRAY = rgb(0.4, 0.4, 0.45);
const WHITE = rgb(1, 1, 1);
const LIGHT_GRAY = rgb(0.9, 0.9, 0.92);

function drawHeader(page: any, title: string) {
  const { width } = page.getSize();
  page.drawRectangle({ x: 0, y: page.getSize().height - 50, width, height: 50, color: PRIMARY });
  page.drawText('GMAO SIMPLY_GMAO', { x: 30, y: page.getSize().height - 30, size: 14, font: StandardFonts.HelveticaBold, color: WHITE });
  page.drawText(title, { x: 30, y: page.getSize().height - 45, size: 10, font: StandardFonts.Helvetica, color: WHITE });
}

export async function generateFicheTechnicienPDF(): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([595, 842]);
  drawHeader(page, 'Fiche Technicien — Procédure rapide');

  let y = 750;
  const x = 40;

  const steps = [
    '1. SCANNER le QR Code de l\'équipement',
    '2. VÉRIFIER le bloc ATEX (si zone ATEX)',
    '3. DÉMARRER l\'intervention (bouton vert)',
    '4. SAISIR les pièces consommées',
    '5. AJOUTER des photos si besoin',
    '6. TERMINER et saisir cause/actions',
    '7. FAIRE signer l\'inspecteur ATEX si nécessaire',
  ];

  page.drawText('PROCÉDURE BT EN 7 ÉTAPES', { x, y, size: 12, font: fontBold, color: PRIMARY });
  y -= 25;

  for (const step of steps) {
    page.drawRectangle({ x, y: y - 5, width: 515, height: 22, color: LIGHT_GRAY });
    page.drawText(step, { x: x + 10, y, size: 10, font, color: DARK });
    y -= 30;
  }

  y -= 15;
  page.drawText('CONTACT SUPPORT', { x, y, size: 12, font: fontBold, color: PRIMARY });
  y -= 20;
  page.drawText('Responsable maintenance : responsable@simply-gmao.local', { x, y, size: 9, font, color: GRAY });
  y -= 14;
  page.drawText('Admin système : admin@simply-gmao.local', { x, y, size: 9, font, color: GRAY });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

export async function generateFicheOperateurPDF(): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([595, 842]);
  drawHeader(page, 'Fiche Opérateur — 3 clics pour déclarer une panne');

  let y = 750;
  const x = 40;

  page.drawText('DÉCLARER UNE PANNE EN 30 SECONDES', { x, y, size: 14, font: fontBold, color: PRIMARY });
  y -= 30;

  const steps = [
    '1. CLIQUER sur « Déclarer une panne »',
    '2. SÉLECTIONNER la machine et le type de panne',
    '3. DÉCRIRE le problème en 1 phrase',
    '4. CLIQUER sur « Envoyer »',
  ];

  for (const step of steps) {
    page.drawRectangle({ x, y: y - 5, width: 515, height: 28, color: LIGHT_GRAY });
    page.drawText(step, { x: x + 10, y, size: 12, font: fontBold, color: DARK });
    y -= 36;
  }

  y -= 20;
  page.drawText('ASTUCES', { x, y, size: 12, font: fontBold, color: PRIMARY });
  y -= 20;
  page.drawText('• Pas besoin de connexion : la déclaration est envoyée automatiquement', { x, y, size: 9, font, color: GRAY });
  y -= 14;
  page.drawText('• Vous pouvez suivre vos demandes dans « Mes demandes »', { x, y, size: 9, font, color: GRAY });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

export async function generateDocAdminPDF(): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([595, 842]);
  drawHeader(page, 'Documentation Administrateur');

  let y = 750;
  const x = 40;

  const sections = [
    { title: '1. Gestion des utilisateurs', content: 'Créer / modifier / désactiver via Menu Admin → Utilisateurs. Rôles : admin, responsable, technicien, magasinier, opérateur, hse.' },
    { title: '2. Sauvegardes automatiques', content: 'Backup quotidien à 2h00 (pg_dump + uploads). Rétention 7 jours. Restauration via script ./scripts/restore.sh' },
    { title: '3. Paramétrage', content: 'Seuils stock, fréquences préventives, types BT, causes pannes configurables dans les paramètres système.' },
    { title: '4. Mise à jour', content: 'docker-compose pull && docker-compose up -d. Rollback : docker-compose down && ./scripts/rollback.sh' },
  ];

  for (const section of sections) {
    page.drawText(section.title, { x, y, size: 11, font: fontBold, color: PRIMARY });
    y -= 16;
    const lines = section.content.match(/.{1,90}(\s|$)/g) || [section.content];
    for (const line of lines) {
      page.drawText(line.trim(), { x, y, size: 9, font, color: GRAY });
      y -= 12;
    }
    y -= 8;
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
