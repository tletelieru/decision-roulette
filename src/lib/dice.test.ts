import { describe, expect, it } from 'vitest';
import { diceSides } from './modes';
import { dot, facingRotation, normalize, planRoll, restingRotation, rollAt, rotate, solidFor } from './dice';
import type { Quat } from './dice';

describe.each(diceSides)('d%i', (sides) => {
  const solid = solidFor(sides);

  it('has one face per number', () => {
    expect(solid.faces).toHaveLength(sides);
    expect(solid.faces.map((face) => face.value).sort((a, b) => a - b)).toEqual(
      Array.from({ length: sides }, (_, index) => index + 1),
    );
  });

  it('turns every face toward the viewer with its number upright', () => {
    for (const face of solid.faces) {
      const rotation = facingRotation(face);
      expect(rotate(rotation, face.normal)[2]).toBeCloseTo(1);
      expect(rotate(rotation, face.up)[1]).toBeCloseTo(1);
    }
  });

  it('rests with the rolled face as the most visible one', () => {
    for (const face of solid.faces) {
      const rotation = restingRotation(solid, face.value);
      const best = solid.faces.reduce((top, item) =>
        rotate(rotation, item.normal)[2] > rotate(rotation, top.normal)[2] ? item : top,
      );
      expect(best.value).toBe(face.value);
    }
  });

  it('winds faces outward', () => {
    for (const face of solid.faces) expect(dot(face.normal, face.center)).toBeGreaterThan(0);
  });
});

describe('rollAt', () => {
  const from: Quat = [0.5, 0.5, 0.5, 0.5];
  const end = restingRotation(solidFor(20), 7);
  const roll = planRoll(from, end, 3, normalize([1, 1, 0]));
  const same = (a: Quat, b: Quat) =>
    Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]);

  it('starts where the die was', () => {
    expect(same(rollAt(roll, 0), from)).toBeCloseTo(1);
  });

  it('ends on the rolled face', () => {
    expect(same(rollAt(roll, 1), end)).toBeCloseTo(1);
  });
});
