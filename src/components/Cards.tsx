import { Box, Typography } from '@mui/material';
import { useImperativeHandle, useRef, useState } from 'react';
import type { Ref } from 'react';
import { wait } from '../lib/modes';
import type { Stage } from '../lib/modes';
import type { Option } from '../lib/options';
import { randomInt } from '../lib/random';

type Props = { ref: Ref<Stage<number>>; options: Option[] };

type Reveal = { position: number; label: string };

const FLIP_MS = 380;
const MAX_SHUFFLE_MS = 1200;

const FACE = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  p: 1,
  borderRadius: 1,
  backfaceVisibility: 'hidden',
} as const;

function fanPlacement(position: number, count: number) {
  const offset = count > 1 ? (position / (count - 1)) * 2 - 1 : 0;
  const spread = Math.min(30, count * 5);
  const tilt = Math.min(24, count * 4);
  return {
    left: `${50 + offset * spread}%`,
    top: `${16 + offset * offset * 10}%`,
    angle: offset * tilt,
  };
}

export default function Cards({ ref, options }: Props) {
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const fan = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    run: async (index, seconds) => {
      setReveal(null);
      const element = fan.current;
      if (seconds > 0 && element) {
        const shuffle = Math.min(seconds * 300, MAX_SHUFFLE_MS);
        const bounds = element.getBoundingClientRect();
        for (const card of Array.from(element.children)) {
          const rect = card.getBoundingClientRect();
          const dx = bounds.left + bounds.width / 2 - rect.left - rect.width / 2;
          card.firstElementChild?.animate?.(
            [
              { transform: 'none' },
              { transform: `translateX(${dx}px) rotate(${randomInt(30) - 15}deg)`, offset: 0.4 },
              { transform: `translateX(${dx}px) rotate(${randomInt(30) - 15}deg)`, offset: 0.6 },
              { transform: 'none' },
            ],
            { duration: shuffle, easing: 'ease-in-out' },
          );
        }
        await wait(shuffle);
      }
      setReveal({ position: randomInt(options.length), label: options[index].label });
      if (seconds > 0) await wait(FLIP_MS);
    },
  }));

  return (
    <Box
      ref={fan}
      sx={{ position: 'relative', width: '100%', maxWidth: 620, height: 'clamp(220px, 34dvh, 300px)' }}
    >
      {options.map((option, position) => {
        const open = reveal?.position === position;
        const { left, top, angle } = fanPlacement(position, options.length);
        return (
          <Box
            key={option.id}
            sx={{
              position: 'absolute',
              left,
              top,
              width: 'clamp(92px, 24%, 136px)',
              aspectRatio: '3 / 4',
              zIndex: open ? options.length : position,
              transform: `translateX(-50%) rotate(${angle}deg)`,
              transformOrigin: '50% 100%',
              perspective: 800,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                transition: `transform ${FLIP_MS}ms ease, filter ${FLIP_MS}ms ease`,
                transform: open ? `rotate(${-angle}deg) translateY(-8%) scale(1.14)` : 'none',
                filter: reveal && !open ? 'grayscale(0.75) brightness(0.6)' : 'none',
              }}
            >
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
                    border: '5px solid',
                    borderColor: 'background.paper',
                    boxShadow: 3,
                    backgroundImage:
                      'repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0 8px, transparent 8px 16px)',
                  }}
                />
                <Box
                  sx={{
                    ...FACE,
                    bgcolor: 'background.paper',
                    border: '3px solid',
                    borderColor: 'primary.main',
                    boxShadow: 6,
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {open && (
                    <Typography
                      sx={{ fontWeight: 700, textAlign: 'center', overflowWrap: 'anywhere' }}
                    >
                      {reveal.label}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
