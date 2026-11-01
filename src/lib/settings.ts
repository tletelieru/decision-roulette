import { diceSides, isMode } from './modes';
import type { Mode } from './modes';

export type Settings = {
  duration: number;
  instant: boolean;
  sound: boolean;
  confetti: boolean;
  showWeights: boolean;
  mode: Mode;
  sides: number;
  winners: number;
  diceOptions: boolean;
  coinLabels: [string, string];
};

export const defaultSettings: Settings = {
  duration: 5,
  instant: false,
  sound: true,
  confetti: true,
  showWeights: false,
  mode: 'wheel',
  sides: 6,
  winners: 1,
  diceOptions: false,
  coinLabels: ['', ''],
};

function isCoinLabels(value: unknown): value is [string, string] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((label) => typeof label === 'string')
  );
}

export function isSettings(value: unknown): value is Partial<Settings> {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.duration === 'number' &&
    ['instant', 'sound', 'confetti', 'showWeights'].every(
      (key) => typeof item[key] === 'boolean',
    )
  );
}

export function restoreSettings(saved: Partial<Settings>): Settings {
  const merged = { ...defaultSettings, ...saved };
  return {
    ...merged,
    mode: isMode(merged.mode) ? merged.mode : defaultSettings.mode,
    coinLabels: isCoinLabels(merged.coinLabels) ? merged.coinLabels : defaultSettings.coinLabels,
    sides: (diceSides as readonly number[]).includes(merged.sides)
      ? merged.sides
      : defaultSettings.sides,
  };
}
