export const modes = ['wheel', 'coin', 'dice', 'cards', 'raffle', 'oracle'] as const;

export type Mode = (typeof modes)[number];

export const diceSides = [4, 6, 8, 12, 20] as const;

export type Stage<T> = {
  run: (value: T, seconds: number, signal?: AbortSignal) => Promise<void>;
};

export const STOP_MS = 500;

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (modes as readonly string[]).includes(value);
}

export const needsOptions = (mode: Mode) => mode !== 'coin' && mode !== 'dice';

export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

export function stoppableProgress(
  total: number,
  signal: AbortSignal | undefined,
  start: number,
): (now: number) => number {
  let stoppedAt: number | null = null;
  let from = 0;
  return (now) => {
    const plain = Math.min(1, (now - start) / total);
    if (!signal?.aborted) return plain;
    if (stoppedAt === null) {
      stoppedAt = now;
      from = plain;
    }
    return Math.min(1, from + ((1 - from) * (now - stoppedAt)) / STOP_MS);
  };
}

export function hurry(animation: Animation | undefined) {
  if (!animation) return;
  const end = Number(animation.effect?.getComputedTiming().endTime ?? 0);
  const remaining = end - Number(animation.currentTime ?? 0);
  if (remaining > 0) animation.updatePlaybackRate(remaining / STOP_MS);
}
