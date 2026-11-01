import { describe, expect, it } from 'vitest';
import { decodeShare, encodeShare } from './share';

describe('share links', () => {
  it('round-trips options with weights and awkward characters', () => {
    const state = {
      mode: 'raffle' as const,
      options: [
        { label: 'Ana & Ben', weight: 1 },
        { label: 'Café #1 = sí', weight: 3 },
      ],
      winners: 2,
    };
    expect(decodeShare(`#${encodeShare(state)}`)).toEqual(state);
  });

  it('leaves weights out when they are all equal', () => {
    const hash = encodeShare({ mode: 'wheel', options: [{ label: 'Pizza', weight: 1 }] });
    expect(hash).toBe('mode=wheel&o=Pizza');
  });

  it('round-trips the coin, dice and oracle', () => {
    for (const state of [
      { mode: 'coin' as const, coin: ['Heads', 'Tails'] as [string, string] },
      { mode: 'dice' as const, sides: 20 },
      { mode: 'oracle' as const, question: '¿Salgo hoy?' },
    ]) {
      expect(decodeShare(encodeShare(state))).toEqual(state);
    }
  });

  it('returns null without a valid mode', () => {
    expect(decodeShare('')).toBeNull();
    expect(decodeShare('#mode=nope&o=Pizza')).toBeNull();
    expect(decodeShare('#%%%')).toBeNull();
  });

  it('drops malformed values', () => {
    expect(decodeShare('#mode=dice&d=7&n=-1&c=one')).toEqual({ mode: 'dice' });
    expect(decodeShare('#mode=wheel&o=&o=%20%20')).toEqual({ mode: 'wheel' });
    expect(decodeShare('#mode=wheel&o=A&o=B&w=2,nope')).toEqual({
      mode: 'wheel',
      options: [
        { label: 'A', weight: 2 },
        { label: 'B', weight: 1 },
      ],
    });
  });

  it('caps long lists', () => {
    const hash = `mode=wheel${'&o=A'.repeat(150)}`;
    expect(decodeShare(hash)?.options).toHaveLength(100);
  });
});
