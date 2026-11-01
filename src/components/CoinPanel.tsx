import { Box, InputBase, Paper, Stack, Typography } from '@mui/material';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { COIN_COLORS } from '../lib/palette';

type Props = {
  labels: [string, string];
  onLabels: (labels: [string, string]) => void;
};

export default function CoinPanel({ labels, onLabels }: Props) {
  const t = useMessages(messages);
  const placeholders = [t.coin.yes, t.coin.no];

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
      <Stack spacing={1.5}>
        <Typography variant="h6" component="h2">
          {t.options.title}
        </Typography>
        <Stack spacing={0.5}>
          {labels.map((label, side) => (
            <Stack
              key={side}
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                bgcolor: 'action.hover',
                borderRadius: 2,
                px: 1.25,
                minHeight: 40,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  flexShrink: 0,
                  borderRadius: '50%',
                  bgcolor: COIN_COLORS[side],
                }}
              />
              <InputBase
                fullWidth
                value={label}
                placeholder={placeholders[side]}
                inputProps={{ 'aria-label': `${t.options.option} ${side + 1}`, maxLength: 24 }}
                onChange={(event) =>
                  onLabels(
                    side === 0 ? [event.target.value, labels[1]] : [labels[0], event.target.value],
                  )
                }
              />
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
