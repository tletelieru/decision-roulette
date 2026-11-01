import { describe, expect, it } from 'vitest';
import { STOP_MS, stoppableProgress, wait } from './modes';

describe('stoppableProgress', () => {
  it('runs on its own timing until stopped', () => {
    const progress = stoppableProgress(1000, new AbortController().signal, 0);
    expect(progress(250)).toBe(0.25);
    expect(progress(2000)).toBe(1);
  });

  it('finishes from where it was after stopping', () => {
    const control = new AbortController();
    const progress = stoppableProgress(10000, control.signal, 0);
    expect(progress(1000)).toBe(0.1);
    control.abort();
    expect(progress(1000)).toBe(0.1);
    expect(progress(1000 + STOP_MS / 2)).toBeCloseTo(0.55);
    expect(progress(1000 + STOP_MS)).toBe(1);
  });
});

describe('wait', () => {
  it('ends early when aborted', async () => {
    const control = new AbortController();
    const start = performance.now();
    const pending = wait(5000, control.signal);
    control.abort();
    await pending;
    expect(performance.now() - start).toBeLessThan(500);
  });
});
