import { describe, expect, it } from 'vitest';
import {
  buildSlices,
  landingPoint,
  overshootFor,
  sliceAt,
  spinPosition,
  spinTarget,
  wrapDelta,
} from './wheel';

describe('buildSlices', () => {
  it('sizes slices by weight', () => {
    const slices = buildSlices([1, 3]);
    expect(slices[0]).toEqual({ start: 0, end: 0.25 });
    expect(slices[1]).toEqual({ start: 0.25, end: 1 });
  });
});

describe('spinning', () => {
  const slices = buildSlices([1, 2, 1, 4]);

  it('stops on the picked slice from any starting rotation', () => {
    for (const from of [0, 0.37, 5.91, 12.5]) {
      slices.forEach((slice, index) => {
        const to = spinTarget(from, landingPoint(slice), 6);
        expect(to).toBeGreaterThan(from + 5);
        expect(sliceAt(to, slices)).toBe(index);
      });
    }
  });

  it('stops on the picked slice when spinning backwards', () => {
    for (const from of [0, 0.37, -5.91, 12.5]) {
      slices.forEach((slice, index) => {
        const to = spinTarget(from, landingPoint(slice), 6, -1);
        expect(to).toBeLessThan(from - 5);
        expect(sliceAt(to, slices)).toBe(index);
      });
    }
  });

  it('takes the short way across the top of the wheel', () => {
    expect(wrapDelta(0.95)).toBeCloseTo(-0.05);
    expect(wrapDelta(-0.95)).toBeCloseTo(0.05);
    expect(wrapDelta(0.1)).toBeCloseTo(0.1);
  });

  it('keeps the settle bounce inside the slice', () => {
    slices.forEach((slice, index) => {
      for (const roll of [0, 1]) {
        const to = spinTarget(0, landingPoint(slice, () => roll), 6);
        const peak = spinPosition(0.92, 0, to, overshootFor(slice));
        expect(sliceAt(peak, slices)).toBe(index);
      }
    });
  });

  it('runs from start to target', () => {
    expect(spinPosition(0, 2, 10, 0.01)).toBe(2);
    expect(spinPosition(1, 2, 10, 0.01)).toBe(10);
  });
});
