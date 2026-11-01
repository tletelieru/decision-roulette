import { secureRandom } from './random';

export type Option = { id: string; label: string; weight: number };

export type Preset = { id: string; name: string; options: Option[] };

export const createId = () => secureRandom().toString(36).slice(2, 10);

export const createOption = (label: string, weight = 1): Option => ({
  id: createId(),
  label,
  weight,
});

export function parseBulk(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function activeOptions(options: Option[]): Option[] {
  return options.filter((option) => option.label.trim() && option.weight > 0);
}

export function isOptionList(value: unknown): value is Option[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item?.id === 'string' &&
        typeof item?.label === 'string' &&
        typeof item?.weight === 'number',
    )
  );
}

export function isPresetList(value: unknown): value is Preset[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item?.id === 'string' &&
        typeof item?.name === 'string' &&
        isOptionList(item?.options),
    )
  );
}
