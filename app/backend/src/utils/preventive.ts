/**
 * =============================================================================
 * Helpers Maintenance Preventive
 * =============================================================================
 * calculateNextExecution — calcule la prochaine date d'execution selon
 * la frequence (jours, semaines, mois, annees, compteur).
 * =============================================================================
 */

/**
 * Calcule la prochaine date d'execution d'un plan preventif.
 * @param fromDate — date de reference (generalement lastExecution ou now)
 * @param frequencyType — 'jours' | 'semaines' | 'mois' | 'annees' | 'compteur'
 * @param frequencyValue — valeur numerique
 */
export function calculateNextExecution(
  fromDate: Date,
  frequencyType: string,
  frequencyValue: number
): Date {
  const d = new Date(fromDate);
  switch (frequencyType) {
    case 'jours':
      d.setDate(d.getDate() + frequencyValue);
      return d;
    case 'semaines':
      d.setDate(d.getDate() + frequencyValue * 7);
      return d;
    case 'mois':
      d.setMonth(d.getMonth() + frequencyValue);
      return d;
    case 'annees':
      d.setFullYear(d.getFullYear() + frequencyValue);
      return d;
    case 'compteur':
      // Pour compteur, on ne peut pas predire la date exacte.
      // On retourne la date actuelle + 1 mois par defaut (sera reevaluee)
      d.setMonth(d.getMonth() + 1);
      return d;
    default:
      // Par defaut + 1 mois
      d.setMonth(d.getMonth() + 1);
      return d;
  }
}
