import { FormControlLabel, Paper, Slider, Stack, Switch, Typography } from '@mui/material';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import type { Settings } from '../lib/settings';

type Props = { settings: Settings; onSettings: (patch: Partial<Settings>) => void };

type Toggle = 'instant' | 'sound' | 'confetti';

const TOGGLES: Toggle[] = ['instant', 'sound', 'confetti'];

export default function SettingsPanel({ settings, onSettings }: Props) {
  const t = useMessages(messages).settings;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
      <Stack spacing={1}>
        <Typography variant="h6" component="h2">
          {t.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t.duration}: {settings.duration}s
        </Typography>
        <Slider
          size="small"
          min={1}
          max={12}
          step={1}
          disabled={settings.instant}
          value={settings.duration}
          aria-label={t.duration}
          onChange={(_, value) => onSettings({ duration: value })}
        />
        {TOGGLES.map((key) => (
          <FormControlLabel
            key={key}
            sx={{ mr: 0, justifyContent: 'space-between' }}
            labelPlacement="start"
            control={
              <Switch
                size="small"
                checked={settings[key]}
                onChange={(event) => onSettings({ [key]: event.target.checked })}
              />
            }
            label={<Typography variant="body2">{t[key]}</Typography>}
          />
        ))}
      </Stack>
    </Paper>
  );
}
