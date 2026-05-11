/**
 * =============================================================================
 * Export helpers — Excel et CSV
 * =============================================================================
 * Fonctions d'export des listes filtrees au format .xlsx et .csv.
 * =============================================================================
 */

import * as XLSX from 'xlsx';

interface ExportColumn<T> {
  header: string;
  key: keyof T | ((row: T) => string | number | boolean | null | undefined);
  width?: number;
}

/**
 * Exporte des donnees au format Excel (.xlsx)
 */
export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  const rows = data.map((row) => {
    const obj: Record<string, string | number | boolean | null | undefined> = {};
    columns.forEach((col) => {
      const value = typeof col.key === 'function' ? col.key(row) : row[col.key];
      obj[col.header] = value ?? '';
    });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Ajuster les largeurs de colonnes
  const colWidths = columns.map((col) => ({ wch: col.width ?? 20 }));
  ws['!cols'] = colWidths;

  // Style en-tetes (mettre en gras via la premiere ligne)
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellRef]) continue;
    ws[cellRef].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'D9D9D9' } },
    };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Donnees');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Exporte des donnees au format CSV
 */
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  const headers = columns.map((c) => c.header).join(';');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = typeof col.key === 'function' ? col.key(row) : row[col.key];
        const str = String(value ?? '');
        // Echapper les points-virgules et guillemets
        if (str.includes(';') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(';')
  );

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper pour formater une date en français
 */
export function formatDateFR(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
