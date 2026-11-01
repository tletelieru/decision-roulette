import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import { useImperativeHandle, useRef, useState } from 'react';
import type { Ref } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { diceSides, wait } from '../lib/modes';
import type { Stage } from '../lib/modes';
import { randomInt } from '../lib/random';

type Props = {
  ref: Ref<Stage<number>>;
  sides: number;
  hasOptions: boolean;
  onSides: (sides: number) => void;
};

const SHAPES: Record<number, string> = {
  4: '50,8 94,86 6,86',
  6: '12,12 88,12 88,88 12,88',
  8: '50,4 96,50 50,96 4,50',
  12: '50,5 95,38 78,92 22,92 5,38',
  20: '50,4 90,27 90,73 50,96 10,73 10,27',
};

export default function Dice({ ref, sides, hasOptions, onSides }: Props) {
  const t = useMessages(messages).dice;
  const theme = useTheme();
  const [face, setFace] = useState(sides);
  const die = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    run: async (value, seconds) => {
      const total = seconds * 1000;
      if (total > 0) {
        die.current?.animate?.(
          [{ rotate: '0deg' }, { rotate: `${360 * Math.max(2, Math.round(seconds))}deg` }],
          { duration: total, easing: 'cubic-bezier(0.15, 0.7, 0.2, 1)' },
        );
      }
      let delay = 50;
      for (let elapsed = 0; elapsed + delay < total; elapsed += delay) {
        setFace(randomInt(sides) + 1);
        await wait(delay);
        delay *= 1.1;
      }
      setFace(value);
    },
  }));

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', width: '100%' }}>
      <ToggleButtonGroup
        exclusive
        size="small"
        aria-label={t.sides}
        value={sides}
        onChange={(_, next: number | null) => {
          if (next) onSides(next);
        }}
      >
        {diceSides.map((option) => (
          <ToggleButton key={option} value={option} sx={{ px: 1.5, fontWeight: 700 }}>
            d{option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Box ref={die} sx={{ position: 'relative', width: 'min(52%, 30dvh, 240px)', aspectRatio: '1' }}>
        <Box component="svg" viewBox="0 0 100 100" aria-hidden sx={{ display: 'block' }}>
          <polygon
            points={SHAPES[sides]}
            fill={theme.palette.primary.main}
            stroke={theme.palette.background.paper}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </Box>
        <Typography
          component="span"
          sx={{
            position: 'absolute',
            inset: sides === 4 ? '18% 0 0' : 0,
            display: 'grid',
            placeItems: 'center',
            color: theme.palette.primary.contrastText,
            fontSize: 'clamp(2.5rem, 12vw, 4.5rem)',
            fontWeight: 800,
          }}
        >
          {face}
        </Typography>
      </Box>
      {hasOptions && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {t.mapped}
        </Typography>
      )}
    </Stack>
  );
}
