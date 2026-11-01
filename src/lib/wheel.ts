import { secureRandom } from './random';
import type { Rng } from './random';

export type Slice = { start: number; end: number };

const SETTLE_AT = 0.92;

export const mod1 = (value: number) => ((value % 1) + 1) % 1;

export function buildSlices(weights: number[]): Slice[] {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let start = 0;
  return weights.map((weight) => {
    const end = start + weight / total;
    const slice = { start, end };
    start = end;
    return slice;
  });
}

export function landingPoint(slice: Slice, rng: Rng = secureRandom): number {
  return slice.start + (slice.end - slice.start) * (0.2 + 0.6 * rng());
}

export function spinTarget(from: number, landing: number, turns: number, direction = 1): number {
  if (direction < 0) return Math.floor(from) - turns - mod1(landing);
  return Math.ceil(from) + turns + mod1(-landing);
}

export function wrapDelta(delta: number): number {
  return mod1(delta + 0.5) - 0.5;
}

export function overshootFor(slice: Slice): number {
  return Math.min((slice.end - slice.start) * 0.15, 0.012);
}

export function spinPosition(
  progress: number,
  from: number,
  to: number,
  overshoot: number,
): number {
  if (progress >= 1) return to;
  const peak = to + overshoot;
  if (progress < SETTLE_AT) {
    const t = progress / SETTLE_AT;
    return from + (peak - from) * (1 - (1 - t) ** 3);
  }
  const t = (progress - SETTLE_AT) / (1 - SETTLE_AT);
  return peak - overshoot * (t * t * (3 - 2 * t));
}

export function sliceAt(rotation: number, slices: Slice[]): number {
  const point = mod1(-rotation);
  const index = slices.findIndex((slice) => point >= slice.start && point < slice.end);
  return index === -1 ? slices.length - 1 : index;
}
