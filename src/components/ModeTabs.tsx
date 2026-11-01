import { Chip, Stack } from '@mui/material';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { modes } from '../lib/modes';
import type { Mode } from '../lib/modes';

type Props = { mode: Mode; disabled: boolean; onMode: (mode: Mode) => void };

export default function ModeTabs({ mode, disabled, onMode }: Props) {
  const t = useMessages(messages).modes;

  return (
    <Stack
      role="group"
      aria-label={t.label}
      direction="row"
      spacing={1}
      sx={{ maxWidth: '100%', overflowX: 'auto', pb: 0.5, scrollbarWidth: 'none' }}
    >
      {modes.map((item) => (
        <Chip
          key={item}
          clickable
          disabled={disabled}
          label={t[item]}
          aria-pressed={item === mode}
          color={item === mode ? 'primary' : 'default'}
          variant={item === mode ? 'filled' : 'outlined'}
          onClick={() => onMode(item)}
          sx={{ fontWeight: 600 }}
        />
      ))}
    </Stack>
  );
}
