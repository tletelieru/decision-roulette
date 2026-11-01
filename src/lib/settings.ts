export type Settings = {
  duration: number;
  instant: boolean;
  sound: boolean;
  confetti: boolean;
  showWeights: boolean;
};

export const defaultSettings: Settings = {
  duration: 5,
  instant: false,
  sound: true,
  confetti: true,
  showWeights: false,
};

export function isSettings(value: unknown): value is Settings {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.duration === 'number' &&
    ['instant', 'sound', 'confetti', 'showWeights'].every(
      (key) => typeof item[key] === 'boolean',
    )
  );
}
