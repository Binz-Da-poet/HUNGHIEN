/**
 * Normalize a Vietnamese phone number to the standard 10-digit 0xxx format.
 * Strips separators. Converts leading 84 → 0.
 */
export function normalizeVietnamesePhone(phone: string): string {
  let normalized = phone.replace(/[^0-9]/g, '');
  if (normalized.startsWith('84') && normalized.length > 10) {
    normalized = '0' + normalized.slice(2);
  }
  return normalized;
}
