import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const PRIMARY = rgb(0.718, 0.11, 0.11);   // #B71C1C
const DARK = rgb(0.1, 0.1, 0.12);
const GRAY = rgb(0.4, 0.4, 0.45);
const LIGHT_GRAY = rgb(0.85, 0.85, 0.88);
const WHITE = rgb(1, 1, 1);

function drawHeader(page: any, title: string, subtitle?: string) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: height - 60, width, height: 60, color: PRIMARY });
  page.drawText('GMAO SIMPLY_GMAO', { x: 30, y: height - 35, size: 16, font: StandardFonts.HelveticaBold, color: WHITE });
  page.drawText(title, { x: 30, y: height - 52, size: 10, font: StandardFonts.Helvetica, color: WHITE });
  if (subtitle) {
    page.drawText(subtitle, { x: width - 200, y: height - 52, size: 9, font: StandardFonts.Helvetica, color: WHITE });
  }
}

function drawFooter(page: any, pageNum: number, totalPages: number) {
  const { width } = page.getSize();
  page.drawText(`Page ${pageNum} / ${totalPages}`, {
    x: width - 80, y: 20, size: 8, font: StandardFonts.Helvetica, color: GRAY,
  });
  page.drawText(`Généré le ${new Date().toLocaleDateString('fr-FR')} — Document confidentiel`, {
    x: 30, y: 20, size: 8, font: StandardFonts.Helvetica, color: GRAY,
  });
}

export async function generateEquipmentPDF(data: {
  equipment: any;
  workOrders: any[];
  preventivePlans: any[];
  sousEnsembles: any[];
  documents: any[];
}): Promise<Buffer> {
  const { equipment, workOrders, preventivePlans: _preventivePlans, sousEnsembles, documents } = data;
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Page 1 — Fiche équipement
  const page1 = pdf.addPage([595, 842]);
  drawHeader(page1, 'Fiche Équipement', equipment.code);

  let y = 750;
  const col1 = 30;
  const col2 = 300;
  const lineHeight = 16;

  page1.drawText('IDENTIFICATION', { x: col1, y, size: 11, font: fontBold, color: PRIMARY });
  y -= 20;

  const infoLeft = [
    ['Code', equipment.code],
    ['Nom', equipment.name],
    ['Type', equipment.type],
    ['Fabricant', equipment.constructeur || '—'],
    ['N° série', equipment.numSerie || '—'],
    ['Localisation', equipment.localisation || '—'],
  ];
  const infoRight = [
    ['Criticité', equipment.criticality],
    ['Statut', equipment.statut],
    ['Date mise en service', equipment.dateMiseService ? new Date(equipment.dateMiseService).toLocaleDateString('fr-FR') : '—'],
    ['Compteur', `${equipment.compteurActuel?.toString() || '0'} ${equipment.compteurUnite || ''}`],
    ['Zone ATEX', equipment.zoneAtex || 'Non ATEX'],
    ['Contact alimentaire', equipment.contactAlimentaire ? 'Oui' : 'Non'],
  ];

  for (let i = 0; i < infoLeft.length; i++) {
    page1.drawText(infoLeft[i][0], { x: col1, y: y - i * lineHeight, size: 9, font: fontBold, color: GRAY });
    page1.drawText(String(infoLeft[i][1]), { x: col1 + 90, y: y - i * lineHeight, size: 9, font, color: DARK });
    page1.drawText(infoRight[i][0], { x: col2, y: y - i * lineHeight, size: 9, font: fontBold, color: GRAY });
    page1.drawText(String(infoRight[i][1]), { x: col2 + 110, y: y - i * lineHeight, size: 9, font, color: DARK });
  }
  y -= infoLeft.length * lineHeight + 25;

  // Sous-ensembles
  if (sousEnsembles.length > 0) {
    page1.drawText('SOUS-ENSEMBLES', { x: col1, y, size: 11, font: fontBold, color: PRIMARY });
    y -= 18;
    for (const se of sousEnsembles.slice(0, 8)) {
      page1.drawText(`• ${se.code} — ${se.name}`, { x: col1, y, size: 9, font, color: DARK });
      y -= 12;
    }
    y -= 10;
  }

  // Documents
  if (documents.length > 0) {
    page1.drawText('DOCUMENTS ATTACHÉS', { x: col1, y, size: 11, font: fontBold, color: PRIMARY });
    y -= 18;
    for (const doc of documents.slice(0, 6)) {
      page1.drawText(`• ${doc.originalName}`, { x: col1, y, size: 9, font, color: DARK });
      y -= 12;
    }
    y -= 10;
  }

  drawFooter(page1, 1, 1 + (workOrders.length > 0 ? 1 : 0));

  // Page 2 — Historique BT
  if (workOrders.length > 0) {
    const page2 = pdf.addPage([595, 842]);
    drawHeader(page2, 'Historique des interventions', equipment.code);
    let y2 = 750;

    page2.drawText('BONS DE TRAVAIL', { x: col1, y: y2, size: 11, font: fontBold, color: PRIMARY });
    y2 -= 20;

    // Table header
    page2.drawRectangle({ x: col1, y: y2 - 5, width: 535, height: 18, color: LIGHT_GRAY });
    const headers = ['N°', 'Date', 'Type', 'Titre', 'Statut', 'Durée'];
    const colWidths = [60, 70, 60, 200, 70, 50];
    let hx = col1;
    headers.forEach((h, i) => {
      page2.drawText(h, { x: hx + 4, y: y2 - 2, size: 8, font: fontBold, color: DARK });
      hx += colWidths[i];
    });
    y2 -= 22;

    for (const wo of workOrders.slice(0, 40)) {
      const values = [
        wo.numero,
        wo.dateCreation ? new Date(wo.dateCreation).toLocaleDateString('fr-FR') : '—',
        wo.type,
        wo.title,
        wo.status,
        wo.dureeMinutes ? `${wo.dureeMinutes} min` : '—',
      ];
      let vx = col1;
      values.forEach((v, i) => {
        const text = String(v).length > 35 ? String(v).slice(0, 35) + '…' : String(v);
        page2.drawText(text, { x: vx + 4, y: y2, size: 8, font, color: DARK });
        vx += colWidths[i];
      });
      y2 -= 14;
      if (y2 < 60) break;
    }

    drawFooter(page2, 2, 2);
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

export async function generateAtexCompliancePDF(equipments: any[], year: number): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const page = pdf.addPage([595, 842]);
  drawHeader(page, 'Rapport de conformité ATEX', `Année ${year}`);

  let y = 750;
  const col1 = 30;

  page.drawText(`Date d'inspection : ${new Date().toLocaleDateString('fr-FR')}`, { x: col1, y, size: 10, font, color: GRAY });
  y -= 25;

  page.drawText('ÉQUIPEMENTS SOUS ATEX', { x: col1, y, size: 11, font: fontBold, color: PRIMARY });
  y -= 18;

  // Table header
  page.drawRectangle({ x: col1, y: y - 5, width: 535, height: 18, color: LIGHT_GRAY });
  const headers = ['Code', 'Nom', 'Zone', 'Dernière inspection', 'Prochaine inspection', 'Statut'];
  const colWidths = [80, 160, 60, 100, 100, 60];
  let hx = col1;
  headers.forEach((h, i) => {
    page.drawText(h, { x: hx + 4, y: y - 2, size: 8, font: fontBold, color: DARK });
    hx += colWidths[i];
  });
  y -= 22;

  const atexEq = equipments.filter((e) => e.zoneAtex && e.zoneAtex !== 'NON_ATEX');
  for (const eq of atexEq) {
    const nextDate = eq.dateProchaineInspectionAtex ? new Date(eq.dateProchaineInspectionAtex) : null;
    const isOverdue = nextDate ? nextDate < new Date() : false;
    const status = isOverdue ? 'EN RETARD' : nextDate ? 'À JOUR' : 'NON PLANIFIÉ';

    const values = [
      eq.code,
      eq.name,
      eq.zoneAtex,
      eq.dateDerniereInspectionAtex ? new Date(eq.dateDerniereInspectionAtex).toLocaleDateString('fr-FR') : '—',
      nextDate ? nextDate.toLocaleDateString('fr-FR') : '—',
      status,
    ];
    let vx = col1;
    values.forEach((v, i) => {
      page.drawText(String(v).slice(0, 28), { x: vx + 4, y: y, size: 8, font, color: DARK });
      vx += colWidths[i];
    });
    y -= 14;
    if (y < 80) break;
  }

  if (atexEq.length === 0) {
    page.drawText('Aucun équipement ATEX enregistré.', { x: col1, y, size: 9, font, color: GRAY });
  }

  // Summary box
  y -= 20;
  page.drawRectangle({ x: col1, y: y - 45, width: 535, height: 50, color: LIGHT_GRAY });
  page.drawText(`Total équipements ATEX : ${atexEq.length}`, { x: col1 + 10, y: y - 15, size: 9, font: fontBold, color: DARK });
  const overdueCount = atexEq.filter((e) => e.dateProchaineInspectionAtex && new Date(e.dateProchaineInspectionAtex) < new Date()).length;
  page.drawText(`Inspections en retard : ${overdueCount}`, { x: col1 + 10, y: y - 30, size: 9, font: fontBold, color: overdueCount > 0 ? PRIMARY : DARK });

  drawFooter(page, 1, 1);

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

export async function generateMonthlyReportPDF(data: {
  month: number;
  year: number;
  kpis: any;
}): Promise<Buffer> {
  const { month, year, kpis } = data;
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const page = pdf.addPage([595, 842]);
  const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  drawHeader(page, 'Rapport mensuel de maintenance', monthName);

  let y = 750;
  const col1 = 30;
  const col2 = 300;

  page.drawText('INDICATEURS CLÉS', { x: col1, y, size: 11, font: fontBold, color: PRIMARY });
  y -= 20;

  const items = [
    ['BT créés', kpis.workOrdersCreated ?? '—'],
    ['BT clôturés', kpis.workOrdersClosed ?? '—'],
    ['Temps moyen de réparation (MTTR)', kpis.mttr ?? '—'],
    ['Temps moyen entre pannes (MTBF)', kpis.mtbf ?? '—'],
    ['Taux de disponibilité', kpis.availability ? `${kpis.availability}%` : '—'],
    ['Coût maintenance total', kpis.totalCost ? `${kpis.totalCost} €` : '—'],
    ['Respect plan préventif', kpis.preventiveCompliance ? `${kpis.preventiveCompliance}%` : '—'],
    ['Alertes stock', kpis.stockAlerts ?? '—'],
  ];

  for (let i = 0; i < items.length; i++) {
    const isLeft = i % 2 === 0;
    const x = isLeft ? col1 : col2;
    const rowY = y - Math.floor(i / 2) * 18;
    page.drawText(items[i][0], { x, y: rowY, size: 9, font: fontBold, color: GRAY });
    page.drawText(String(items[i][1]), { x: x + 140, y: rowY, size: 9, font, color: DARK });
  }
  y -= Math.ceil(items.length / 2) * 18 + 25;

  page.drawText('OBSERVATIONS', { x: col1, y, size: 11, font: fontBold, color: PRIMARY });
  y -= 15;
  page.drawText('Rapport généré automatiquement par la GMAO Simply GMAO.', { x: col1, y, size: 9, font, color: GRAY });

  drawFooter(page, 1, 1);

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
