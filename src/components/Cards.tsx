import { Box, Typography } from '@mui/material';
import { useImperativeHandle, useState } from 'react';
import type { Ref } from 'react';
import { wait } from '../lib/modes';
import type { Stage } from '../lib/modes';
import type { Option } from '../lib/options';
import { moveAll } from '../lib/random';

type Props = { ref: Ref<Stage<number>>; options: Option[] };

const FLIP_MS = 380;
const ROUND_MS = 650;
const MOVE_MS = 500;

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
  const [reveal, setReveal] = useState<number | null>(null);
  const [slots, setSlots] = useState(() => options.map((_, index) => index));

  useImperativeHandle(ref, () => ({
    run: async (index, seconds, signal) => {
      setReveal(null);
      if (seconds > 0) {
        const shuffle = Math.max(ROUND_MS, seconds * 1000 - FLIP_MS);
        const rounds = Math.max(1, Math.round(shuffle / ROUND_MS));
        for (let round = 0; round < rounds && !signal?.aborted; round += 1) {
          setSlots(moveAll);
          await wait(shuffle / rounds, signal);
        }
      }
      setReveal(index);
      if (seconds > 0) await wait(FLIP_MS);
    },
  }));

  return (
    <Box
      sx={{ position: 'relative', width: '100%', maxWidth: 620, height: 'clamp(220px, 34dvh, 300px)' }}
    >
      {options.map((option, index) => {
        const open = reveal === index;
        const { left, top, angle } = fanPlacement(slots[index], options.length);
        return (
          <Box
            key={option.id}
            sx={{
              position: 'absolute',
              left,
              top,
              width: 'clamp(92px, 24%, 136px)',
              aspectRatio: '3 / 4',
              zIndex: open ? options.length : slots[index],
              transform: `translateX(-50%) rotate(${angle}deg)`,
              transformOrigin: '50% 100%',
              transition: `left ${MOVE_MS}ms ease-in-out, top ${MOVE_MS}ms ease-in-out, transform ${MOVE_MS}ms ease-in-out`,
              perspective: 800,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                transition: `transform ${FLIP_MS}ms ease, filter ${FLIP_MS}ms ease`,
                transform: open ? `rotate(${-angle}deg) translateY(-8%) scale(1.14)` : 'none',
                filter: reveal !== null && !open ? 'grayscale(0.75) brightness(0.6)' : 'none',
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
                      {option.label}
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
