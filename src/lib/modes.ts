export const modes = ['wheel', 'coin', 'dice', 'cards', 'raffle'] as const;

export type Mode = (typeof modes)[number];

export const diceSides = [4, 6, 8, 12, 20] as const;

export type Stage<T> = { run: (value: T, seconds: number) => Promise<void> };

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (modes as readonly string[]).includes(value);
}

export const needsOptions = (mode: Mode) => mode !== 'coin' && mode !== 'dice';

export const diceOption = (value: number, count: number) => (value - 1) % count;

export function diceNumbers(option: number, count: number, sides: number): number[] {
  return Array.from({ length: sides }, (_, index) => index + 1).filter(
    (value) => diceOption(value, count) === option,
  );
}

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
