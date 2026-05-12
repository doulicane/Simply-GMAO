/**
 * =============================================================================
 * Sanitisation des inputs utilisateur
 * =============================================================================
 * Supprime les balises HTML et les caracteres dangereux des chaines texte
 * pour prevenir les XSS stockes.
 * =============================================================================
 */

const DANGEROUS_CHARS = /[<>"']/g;

export function sanitizeString(str: string): string {
  return str.replace(DANGEROUS_CHARS, '');
}

export function sanitizeOptionalString(val: string | null | undefined): string | null | undefined {
  if (val === null || val === undefined) return val;
  return sanitizeString(val);
}
