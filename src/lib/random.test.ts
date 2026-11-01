import { describe, expect, it } from 'vitest';
import { pickMany, pickWeightedIndex, randomInt, secureRandom } from './random';

describe('pickWeightedIndex', () => {
  it('maps the roll onto the weight ranges', () => {
    expect(pickWeightedIndex([1, 3], () => 0)).toBe(0);
    expect(pickWeightedIndex([1, 3], () => 0.24)).toBe(0);
    expect(pickWeightedIndex([1, 3], () => 0.25)).toBe(1);
    expect(pickWeightedIndex([1, 3], () => 0.99)).toBe(1);
  });

  it('never picks a zero weight', () => {
    expect(pickWeightedIndex([0, 2, 0], () => 0)).toBe(1);
    expect(pickWeightedIndex([0, 2, 0], () => 0.999)).toBe(1);
  });

  it('returns -1 when nothing can be picked', () => {
    expect(pickWeightedIndex([])).toBe(-1);
    expect(pickWeightedIndex([0, 0])).toBe(-1);
  });

  it('follows the weights over many picks', () => {
    const counts = [0, 0];
    for (let i = 0; i < 20000; i += 1) counts[pickWeightedIndex([1, 3])] += 1;
    expect(counts[1] / 20000).toBeGreaterThan(0.72);
    expect(counts[1] / 20000).toBeLessThan(0.78);
  });
});

describe('pickMany', () => {
  it('picks without repeats', () => {
    for (let i = 0; i < 200; i += 1) {
      const picks = pickMany([1, 1, 1, 1, 1], 3);
      expect(new Set(picks).size).toBe(3);
    }
  });

  it('stops when the pool runs out', () => {
    expect(pickMany([1, 0, 1], 5).sort()).toEqual([0, 2]);
  });
});

describe('randomInt', () => {
  it('stays below the maximum', () => {
    expect(randomInt(6, () => 0)).toBe(0);
    expect(randomInt(6, () => 0.999)).toBe(5);
  });
});

describe('secureRandom', () => {
  it('stays in [0, 1)', () => {
    for (let i = 0; i < 1000; i += 1) {
      const value = secureRandom();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
