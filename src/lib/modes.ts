export const modes = ['wheel', 'coin', 'dice', 'cards', 'raffle'] as const;

export type Mode = (typeof modes)[number];

export const diceSides = [4, 6, 8, 12, 20] as const;

export type Stage<T> = { run: (value: T, seconds: number) => Promise<void> };

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (modes as readonly string[]).includes(value);
}

export const needsOptions = (mode: Mode) => mode !== 'coin' && mode !== 'dice';

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
