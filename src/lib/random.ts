export type Rng = () => number;

export const secureRandom: Rng = () => {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0] / 2 ** 32;
};

export const randomInt = (max: number, rng: Rng = secureRandom) => Math.floor(rng() * max);

export function pickMany(weights: number[], count: number, rng: Rng = secureRandom): number[] {
  const remaining = [...weights];
  const picks: number[] = [];
  while (picks.length < count) {
    const index = pickWeightedIndex(remaining, rng);
    if (index === -1) break;
    picks.push(index);
    remaining[index] = 0;
  }
  return picks;
}

export function pickWeightedIndex(weights: number[], rng: Rng = secureRandom): number {
  const total = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0);
  if (total <= 0) return -1;
  let roll = rng() * total;
  let last = -1;
  for (const [index, weight] of weights.entries()) {
    if (weight <= 0) continue;
    last = index;
    roll -= weight;
    if (roll < 0) return index;
  }
  return last;
}
