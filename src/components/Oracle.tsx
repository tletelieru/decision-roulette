import { Box, Stack, TextField, Typography } from '@mui/material';
import { useImperativeHandle, useRef, useState } from 'react';
import type { Ref } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { wait } from '../lib/modes';
import type { Stage } from '../lib/modes';
import type { Option } from '../lib/options';

type Props = {
  ref: Ref<Stage<number>>;
  options: Option[];
  question: string;
  disabled: boolean;
  onQuestion: (question: string) => void;
};

const SHAKE = [
  { transform: 'translate(0, 0) rotate(0deg)' },
  { transform: 'translate(-3%, 1%) rotate(-5deg)' },
  { transform: 'translate(3%, -1%) rotate(5deg)' },
  { transform: 'translate(-2%, -1%) rotate(-3deg)' },
  { transform: 'translate(0, 0) rotate(0deg)' },
];

export default function Oracle({ ref, options, question, disabled, onQuestion }: Props) {
  const t = useMessages(messages).oracle;
  const [answer, setAnswer] = useState<string | null>(null);
  const orb = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    run: async (index, seconds, signal) => {
      setAnswer(null);
      if (seconds > 0) {
        const shake = orb.current?.animate?.(SHAKE, { duration: 320, iterations: Infinity });
        await wait(seconds * 1000, signal);
        shake?.cancel();
      }
      setAnswer(options[index].label);
    },
  }));

  return (
    <Stack spacing={2} sx={{ alignItems: 'center', width: '100%' }}>
      <TextField
        fullWidth
        size="small"
        disabled={disabled}
        placeholder={t.placeholder}
        value={question}
        sx={{ maxWidth: 520 }}
        slotProps={{ htmlInput: { 'aria-label': t.placeholder, maxLength: 120 } }}
        onChange={(event) => onQuestion(event.target.value)}
      />
      <Box
        ref={orb}
        sx={{
          width: 'min(62%, 34dvh, 280px)',
          aspectRatio: '1',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 34% 28%, #6a6d7c 0%, #24252c 42%, #0c0c10 100%)',
          boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
        }}
      >
        <Box
          sx={{
            width: '58%',
            aspectRatio: '1',
            display: 'grid',
            placeItems: 'center',
            p: 1,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #3b2fa0 0%, #1a1650 100%)',
            border: '2px solid rgba(255,255,255,0.2)',
          }}
        >
          <Typography
            key={answer}
            sx={{
              color: '#ffffff',
              fontWeight: 800,
              textAlign: 'center',
              overflowWrap: 'anywhere',
              lineHeight: 1.15,
              fontSize: answer ? 'clamp(0.85rem, 3.4vw, 1.15rem)' : '3rem',
              animation: 'oracle-reveal 450ms ease',
              '@keyframes oracle-reveal': {
                from: { opacity: 0, transform: 'scale(0.8)' },
                to: { opacity: 1, transform: 'scale(1)' },
              },
            }}
          >
            {answer ?? '?'}
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
}
