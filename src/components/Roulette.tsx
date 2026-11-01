import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { burstConfetti, playWin, prefersReducedMotion, vibrate } from '../lib/feedback';
import { activeOptions, createOption, isOptionList, isPresetList } from '../lib/options';
import type { Option, Preset } from '../lib/options';
import { readableText, sliceColor } from '../lib/palette';
import { pickWeightedIndex } from '../lib/random';
import { defaultSettings, isSettings } from '../lib/settings';
import type { Settings } from '../lib/settings';
import { load, save } from '../lib/storage';
import OptionsPanel from './OptionsPanel';
import SettingsPanel from './SettingsPanel';
import Wheel from './Wheel';
import type { WheelHandle } from './Wheel';

const OPTIONS_KEY = 'dr-options';
const PRESETS_KEY = 'dr-presets';
const SETTINGS_KEY = 'dr-settings';

type Result = { option: Option; color: string };

export default function Roulette() {
  const t = useMessages(messages);
  const [options, setOptions] = useState<Option[]>(() =>
    load(OPTIONS_KEY, isOptionList, t.roulette.defaults.map((label) => createOption(label))),
  );
  const [presets, setPresets] = useState<Preset[]>(() => load(PRESETS_KEY, isPresetList, []));
  const [settings, setSettings] = useState<Settings>(() =>
    load(SETTINGS_KEY, isSettings, defaultSettings),
  );
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const wheel = useRef<WheelHandle>(null);
  const active = useMemo(() => activeOptions(options), [options]);
  const canSpin = active.length >= 2 && !spinning;

  useEffect(() => save(OPTIONS_KEY, options), [options]);
  useEffect(() => save(PRESETS_KEY, presets), [presets]);
  useEffect(() => save(SETTINGS_KEY, settings), [settings]);

  const spin = async () => {
    if (!canSpin) return;
    const index = pickWeightedIndex(active.map((option) => option.weight));
    setResult(null);
    setSpinning(true);
    const seconds = settings.instant || prefersReducedMotion() ? 0 : settings.duration;
    await wheel.current?.spin(index, seconds);
    setSpinning(false);
    setResult({ option: active[index], color: sliceColor(index, active.length) });
    if (settings.sound) playWin();
    if (settings.confetti) burstConfetti();
    vibrate([30, 40, 60]);
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 360px' },
        alignItems: 'start',
      }}
    >
      <Stack spacing={2.5} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
            {t.hero.title}
          </Typography>
          <Typography color="text.secondary">{t.hero.subtitle}</Typography>
        </Stack>

        <Wheel
          ref={wheel}
          options={active}
          sound={settings.sound}
          disabled={!canSpin}
          hubLabel={t.roulette.spin}
          onHub={() => void spin()}
        />

        <Box aria-live="polite" sx={{ width: '100%', maxWidth: 520, minHeight: 92 }}>
          {result ? (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 4,
                textAlign: 'center',
                bgcolor: result.color,
                color: readableText(result.color),
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {t.roulette.winner}
              </Typography>
              <Typography variant="h5" component="p" sx={{ overflowWrap: 'anywhere' }}>
                {result.option.label}
              </Typography>
            </Paper>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', pt: 2 }}>
              {active.length < 2 ? t.roulette.needTwo : spinning ? t.roulette.spinning : ''}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          size="large"
          disabled={!canSpin}
          onClick={() => void spin()}
          sx={{ px: 6 }}
        >
          {t.roulette.spinAgain}
        </Button>
      </Stack>

      <Stack spacing={2} sx={{ minWidth: 0 }}>
        <OptionsPanel
          options={options}
          presets={presets}
          showWeights={settings.showWeights}
          onOptions={setOptions}
          onPresets={setPresets}
          onShowWeights={(showWeights) => setSettings({ ...settings, showWeights })}
        />
        <SettingsPanel
          settings={settings}
          onSettings={(patch) => setSettings({ ...settings, ...patch })}
        />
      </Stack>
    </Box>
  );
}
