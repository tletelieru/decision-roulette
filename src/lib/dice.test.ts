import { describe, expect, it } from 'vitest';
import { diceSides } from './modes';
import {
  CAMERA_DEPTH,
  dot,
  facesCamera,
  facingRotation,
  normalize,
  planRoll,
  restingRotation,
  rollAt,
  rotate,
  solidFor,
} from './dice';
import type { Quat, Vec } from './dice';

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

  it('draws exactly the faces that face the camera through perspective', () => {
    const project = ([x, y, z]: Vec) => {
      const lens = 1 / (1 - z * CAMERA_DEPTH);
      return [x * lens, y * lens];
    };
    for (const face of solid.faces) {
      const rotation = restingRotation(solid, face.value);
      for (const item of solid.faces) {
        const points = item.points.map((index) => project(rotate(rotation, solid.vertices[index])));
        const area = points.reduce((sum, [x, y], index) => {
          const [nextX, nextY] = points[(index + 1) % points.length];
          return sum + x * nextY - nextX * y;
        }, 0);
        const visible = facesCamera(rotate(rotation, item.normal), rotate(rotation, item.center));
        if (Math.abs(area) > 1e-9) expect(visible).toBe(area > 0);
      }
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
