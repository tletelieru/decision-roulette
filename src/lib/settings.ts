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
};

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
    sides: (diceSides as readonly number[]).includes(merged.sides)
      ? merged.sides
      : defaultSettings.sides,
  };
}
