import { describe, it, expect } from 'vitest';
import { createPublicOrderCode } from './order-code';

describe('createPublicOrderCode', () => {
  it('starts with HH', () => {
    const code = createPublicOrderCode();
    expect(code).toMatch(/^HH/);
  });

  it('is exactly 12 characters long', () => {
    const code = createPublicOrderCode();
    expect(code).toHaveLength(12);
  });

  it('contains only uppercase hex after HH', () => {
    const code = createPublicOrderCode();
    const hex = code.slice(2);
    expect(hex).toMatch(/^[0-9A-F]{10}$/);
  });

  it('generates unique codes', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(createPublicOrderCode());
    }
    expect(codes.size).toBe(100);
  });
});
