import { Box } from '@mui/material';
import { useImperativeHandle, useRef } from 'react';
import type { Ref } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { wait } from '../lib/modes';
import type { Stage } from '../lib/modes';

type Props = { ref: Ref<Stage<number>> };

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
  fontSize: 'clamp(1.75rem, 8vw, 3rem)',
  fontWeight: 800,
} as const;

export default function Coin({ ref }: Props) {
  const t = useMessages(messages).coin;
  const coin = useRef<HTMLDivElement>(null);
  const toss = useRef<HTMLDivElement>(null);
  const angle = useRef(0);

  useImperativeHandle(ref, () => ({
    run: async (side, seconds) => {
      const element = coin.current;
      if (!element) return;
      const from = angle.current;
      const flips = seconds > 0 ? Math.max(4, Math.round(seconds * 3)) : 1;
      const to = (Math.ceil(from / 360) + flips) * 360 + side * 180;
      angle.current = to;
      if (seconds > 0) {
        const duration = seconds * 1000;
        element.animate?.(
          [{ transform: `rotateY(${from}deg)` }, { transform: `rotateY(${to}deg)` }],
          { duration, easing: 'cubic-bezier(0.15, 0.7, 0.2, 1)' },
        );
        toss.current?.animate?.(
          [
            { transform: 'translateY(0)' },
            { transform: 'translateY(-16%)', offset: 0.35 },
            { transform: 'translateY(0)' },
          ],
          { duration, easing: 'ease-out' },
        );
      }
      element.style.transform = `rotateY(${to}deg)`;
      if (seconds > 0) await wait(seconds * 1000);
    },
  }));

  return (
    <Box sx={{ width: '100%', display: 'grid', placeItems: 'center', py: 5 }}>
      <Box ref={toss} sx={{ width: 'min(70%, 280px)', aspectRatio: '1', perspective: 900 }}>
        <Box
          ref={coin}
          sx={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
        >
          <Box sx={{ ...FACE, bgcolor: '#2fa876' }}>{t.yes}</Box>
          <Box sx={{ ...FACE, bgcolor: '#d9402f', transform: 'rotateY(180deg)' }}>{t.no}</Box>
        </Box>
      </Box>
    </Box>
  );
}
