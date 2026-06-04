import { describe, expect, it } from 'vitest';
import { formatVnd } from './currency';

describe('formatVnd', () => {
  it('formats whole numbers as Vietnamese dong', () => {
    expect(formatVnd(12500000)).toBe('12.500.000₫');
  });

  it('formats numeric strings from API responses', () => {
    expect(formatVnd('990000')).toBe('990.000₫');
  });

  it('returns 0 dong for invalid values', () => {
    expect(formatVnd('not-a-number')).toBe('0₫');
  });
});
