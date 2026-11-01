import { diceSides, isMode } from './modes';
import type { Mode } from './modes';

export type SharedOption = { label: string; weight: number };

export type SharedState = {
  mode: Mode;
  options?: SharedOption[];
  sides?: number;
  winners?: number;
  coin?: [string, string];
  question?: string;
};

const MAX_OPTIONS = 100;
const MAX_LABEL = 80;
const MAX_QUESTION = 120;

export function encodeShare(state: SharedState): string {
  const params = new URLSearchParams({ mode: state.mode });
  const options = state.options ?? [];
  options.forEach((option) => params.append('o', option.label));
  if (options.some((option) => option.weight !== 1)) {
    params.set('w', options.map((option) => option.weight).join(','));
  }
  if (state.sides) params.set('d', String(state.sides));
  if (state.winners && state.winners > 1) params.set('n', String(state.winners));
  if (state.coin?.some(Boolean)) state.coin.forEach((label) => params.append('c', label));
  if (state.question) params.set('q', state.question);
  return params.toString();
}

export function decodeShare(hash: string): SharedState | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const mode = params.get('mode');
  if (!isMode(mode)) return null;
  const state: SharedState = { mode };

  const weights = (params.get('w') ?? '').split(',').map(Number);
  const options = params
    .getAll('o')
    .map((label, index) => ({
      label: label.trim().slice(0, MAX_LABEL),
      weight: Number.isFinite(weights[index]) && weights[index] >= 0 ? weights[index] : 1,
    }))
    .filter((option) => option.label)
    .slice(0, MAX_OPTIONS);
  if (params.get('w') === null) options.forEach((option) => (option.weight = 1));
  if (options.length) state.options = options;

  const sides = Number(params.get('d'));
  if ((diceSides as readonly number[]).includes(sides)) state.sides = sides;

  const winners = Number(params.get('n'));
  if (Number.isInteger(winners) && winners >= 1) state.winners = winners;

  const coin = params.getAll('c');
  if (coin.length === 2) {
    state.coin = [coin[0].slice(0, MAX_LABEL), coin[1].slice(0, MAX_LABEL)];
  }

  const question = params.get('q');
  if (question) state.question = question.slice(0, MAX_QUESTION);

  return state;
}
