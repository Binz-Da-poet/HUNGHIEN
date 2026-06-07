import { randomBytes } from 'node:crypto';

/** Generate "HH" + 10 uppercase hex characters */
export function createPublicOrderCode(): string {
  const hex = randomBytes(5).toString('hex').toUpperCase();
  return `HH${hex}`;
}
