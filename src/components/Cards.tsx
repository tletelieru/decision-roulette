import { Box, Typography } from '@mui/material';
import { useImperativeHandle, useRef, useState } from 'react';
import type { Ref } from 'react';
import { wait } from '../lib/modes';
import type { Stage } from '../lib/modes';
import type { Option } from '../lib/options';
import { randomInt } from '../lib/random';

type Props = { ref: Ref<Stage<number>>; options: Option[] };

type Reveal = { position: number; label: string };

const FLIP_MS = 550;

const FACE = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  p: 1,
  borderRadius: 3,
  backfaceVisibility: 'hidden',
} as const;

export default function Cards({ ref, options }: Props) {
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const grid = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    run: async (index, seconds) => {
      setReveal(null);
      const element = grid.current;
      if (seconds > 0 && element) {
        const shuffle = seconds * 700;
        const bounds = element.getBoundingClientRect();
        for (const card of Array.from(element.children)) {
          const rect = card.getBoundingClientRect();
          const dx = bounds.left + bounds.width / 2 - rect.left - rect.width / 2;
          const dy = bounds.top + bounds.height / 2 - rect.top - rect.height / 2;
          card.animate?.(
            [
              { transform: 'none' },
              { transform: `translate(${dx}px, ${dy}px) rotate(${randomInt(40) - 20}deg)` },
              { transform: `translate(${dx}px, ${dy}px) rotate(${randomInt(40) - 20}deg)` },
              { transform: 'none' },
            ],
            { duration: shuffle, easing: 'ease-in-out' },
          );
        }
        await wait(shuffle + 100);
      }
      setReveal({ position: randomInt(options.length), label: options[index].label });
      if (seconds > 0) await wait(FLIP_MS);
    },
  }));

  return (
    <Box
      ref={grid}
      sx={{
        width: '100%',
        display: 'grid',
        gap: 1.5,
        py: 2,
        gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 120px))',
        justifyContent: 'center',
      }}
    >
      {options.map((option, position) => {
        const open = reveal?.position === position;
        return (
          <Box key={option.id} sx={{ aspectRatio: '3 / 4', perspective: 800 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: `transform ${FLIP_MS}ms ease`,
                transform: open ? 'rotateY(180deg)' : 'none',
              }}
            >
              <Box
                sx={{
                  ...FACE,
                  bgcolor: 'primary.main',
                  border: '6px solid',
                  borderColor: 'background.paper',
                  boxShadow: 2,
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0 8px, transparent 8px 16px)',
                }}
              />
              <Box
                sx={{
                  ...FACE,
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  boxShadow: 2,
                  transform: 'rotateY(180deg)',
                }}
              >
                {open && (
                  <Typography sx={{ fontWeight: 700, textAlign: 'center', overflowWrap: 'anywhere' }}>
                    {reveal.label}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
