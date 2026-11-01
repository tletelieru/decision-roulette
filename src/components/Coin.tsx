import { Box } from '@mui/material';
import { useImperativeHandle, useRef } from 'react';
import type { Ref } from 'react';
import { hurry, STOP_MS, wait } from '../lib/modes';
import type { Stage } from '../lib/modes';
import { COIN_COLORS } from '../lib/palette';

type Props = { ref: Ref<Stage<number>>; labels: [string, string] };

const FACE = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  backfaceVisibility: 'hidden',
  border: '8px solid rgba(255,255,255,0.35)',
  boxShadow: 'inset 0 0 0 3px rgba(0,0,0,0.12), inset 0 -10px 24px rgba(0,0,0,0.18)',
  color: '#ffffff',
  p: 2,
  textAlign: 'center',
  overflowWrap: 'anywhere',
  fontSize: 'clamp(1.25rem, 6vw, 2.25rem)',
  fontWeight: 800,
} as const;

export default function Coin({ ref, labels }: Props) {
  const coin = useRef<HTMLDivElement>(null);
  const toss = useRef<HTMLDivElement>(null);
  const angle = useRef(0);

  useImperativeHandle(ref, () => ({
    run: async (side, seconds, signal) => {
      const element = coin.current;
      if (!element) return;
      const from = angle.current;
      const flips = seconds > 0 ? Math.max(4, Math.round(seconds * 3)) : 1;
      const to = (Math.ceil(from / 360) + flips) * 360 + side * 180;
      angle.current = to;
      let flip: Animation | undefined;
      let hop: Animation | undefined;
      if (seconds > 0) {
        const duration = seconds * 1000;
        flip = element.animate?.(
          [{ transform: `rotateY(${from}deg)` }, { transform: `rotateY(${to}deg)` }],
          { duration, easing: 'cubic-bezier(0.15, 0.7, 0.2, 1)' },
        );
        hop = toss.current?.animate?.(
          [
            { transform: 'translateY(0)' },
            { transform: 'translateY(-16%)', offset: 0.35 },
            { transform: 'translateY(0)' },
          ],
          { duration, easing: 'ease-out' },
        );
      }
      element.style.transform = `rotateY(${to}deg)`;
      if (seconds > 0) {
        signal?.addEventListener(
          'abort',
          () => {
            hurry(flip);
            hurry(hop);
          },
          { once: true },
        );
        await wait(seconds * 1000, signal);
        if (signal?.aborted) await wait(STOP_MS);
      }
    },
  }));

  return (
    <Box sx={{ width: '100%', display: 'grid', placeItems: 'center', py: 2 }}>
      <Box ref={toss} sx={{ width: 'min(58%, 34dvh, 260px)', aspectRatio: '1', perspective: 900 }}>
        <Box
          ref={coin}
          sx={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
        >
          <Box sx={{ ...FACE, bgcolor: COIN_COLORS[0] }}>{labels[0]}</Box>
          <Box sx={{ ...FACE, bgcolor: COIN_COLORS[1], transform: 'rotateY(180deg)' }}>
            {labels[1]}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
