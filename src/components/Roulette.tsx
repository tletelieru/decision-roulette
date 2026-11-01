import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { burstConfetti, playWin, prefersReducedMotion, vibrate } from '../lib/feedback';
import { diceOption, needsOptions } from '../lib/modes';
import type { Mode, Stage } from '../lib/modes';
import { activeOptions, createOption, isOptionList, isPresetList } from '../lib/options';
import type { Option, Preset } from '../lib/options';
import { COIN_COLORS, readableText, sliceColor } from '../lib/palette';
import { pickMany, pickWeightedIndex, randomInt } from '../lib/random';
import { defaultSettings, isSettings, restoreSettings } from '../lib/settings';
import type { Settings } from '../lib/settings';
import { load, save } from '../lib/storage';
import Cards from './Cards';
import Coin from './Coin';
import CoinPanel from './CoinPanel';
import Dice from './Dice';
import ModeTabs from './ModeTabs';
import OptionsPanel from './OptionsPanel';
import Raffle from './Raffle';
import SettingsPanel from './SettingsPanel';
import Wheel from './Wheel';
import type { WheelHandle } from './Wheel';

const OPTIONS_KEY = 'dr-options';
const PRESETS_KEY = 'dr-presets';
const SETTINGS_KEY = 'dr-settings';

const NUMBER_COLOR = '#6d4fe0';

type Result = { lines: string[]; color: string };

export default function Roulette() {
  const t = useMessages(messages);
  const [options, setOptions] = useState<Option[]>(() =>
    load(OPTIONS_KEY, isOptionList, t.roulette.defaults.map((label) => createOption(label))),
  );
  const [presets, setPresets] = useState<Preset[]>(() => load(PRESETS_KEY, isPresetList, []));
  const [settings, setSettings] = useState<Settings>(() =>
    restoreSettings(load(SETTINGS_KEY, isSettings, defaultSettings)),
  );
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const wheel = useRef<WheelHandle>(null);
  const coin = useRef<Stage<number>>(null);
  const dice = useRef<Stage<number>>(null);
  const cards = useRef<Stage<number>>(null);
  const raffle = useRef<Stage<number[]>>(null);
  const active = useMemo(() => activeOptions(options), [options]);
  const activeKey = active.map((option) => option.id).join();
  const { mode } = settings;
  const missingOptions = needsOptions(mode) && active.length < 2;
  const canRun = !missingOptions && !running;
  const winners = Math.min(Math.max(1, settings.winners), Math.max(1, active.length));

  useEffect(() => save(OPTIONS_KEY, options), [options]);
  useEffect(() => save(PRESETS_KEY, presets), [presets]);
  useEffect(() => save(SETTINGS_KEY, settings), [settings]);

  const coinLabels: [string, string] = [
    settings.coinLabels[0].trim() || t.coin.yes,
    settings.coinLabels[1].trim() || t.coin.no,
  ];

  const update = (patch: Partial<Settings>) => setSettings({ ...settings, ...patch });

  const changeMode = (next: Mode) => {
    setResult(null);
    update({ mode: next });
  };

  const draw = async (seconds: number): Promise<Result> => {
    const weights = active.map((option) => option.weight);
    if (mode === 'coin') {
      const side = randomInt(2);
      await coin.current?.run(side, seconds);
      return { lines: [coinLabels[side]], color: COIN_COLORS[side] };
    }
    if (mode === 'dice') {
      const value = randomInt(settings.sides) + 1;
      await dice.current?.run(value, seconds);
      const option =
        settings.diceOptions && active.length
          ? active[diceOption(value, active.length)].label
          : null;
      return { lines: [option ? `${value} → ${option}` : `${value}`], color: NUMBER_COLOR };
    }
    if (mode === 'raffle') {
      const picks = pickMany(weights, winners);
      await raffle.current?.run(picks, seconds);
      return {
        lines: picks.map((pick, place) => `${place + 1}. ${active[pick].label}`),
        color: NUMBER_COLOR,
      };
    }
    const index = pickWeightedIndex(weights);
    if (mode === 'cards') await cards.current?.run(index, seconds);
    else await wheel.current?.spin(index, seconds);
    return { lines: [active[index].label], color: sliceColor(index, active.length) };
  };

  const run = async () => {
    if (!canRun) return;
    setResult(null);
    setRunning(true);
    const next = await draw(settings.instant || prefersReducedMotion() ? 0 : settings.duration);
    setRunning(false);
    setResult(next);
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
      <Stack spacing={2} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
            {t.hero.title}
          </Typography>
          <Typography color="text.secondary">{t.hero.subtitle[mode]}</Typography>
        </Stack>

        <ModeTabs mode={mode} disabled={running} onMode={changeMode} />

        {mode === 'wheel' && (
          <Wheel
            ref={wheel}
            options={active}
            sound={settings.sound}
            disabled={!canRun}
            hubLabel={t.roulette.spin}
            onHub={() => void run()}
          />
        )}
        {mode === 'coin' && <Coin ref={coin} labels={coinLabels} />}
        {mode === 'dice' && (
          <Dice
            key={settings.sides}
            ref={dice}
            sides={settings.sides}
            options={active}
            useOptions={settings.diceOptions}
            onSides={(sides) => update({ sides })}
            onUseOptions={(diceOptions) => update({ diceOptions })}
          />
        )}
        {mode === 'cards' && <Cards key={activeKey} ref={cards} options={active} />}
        {mode === 'raffle' && (
          <Raffle
            key={activeKey}
            ref={raffle}
            options={active}
            count={winners}
            onCount={(count) => update({ winners: count })}
          />
        )}

        <Box aria-live="polite" sx={{ width: '100%', maxWidth: 520 }}>
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
              {result.lines.map((line) => (
                <Typography key={line} variant="h5" component="p" sx={{ overflowWrap: 'anywhere' }}>
                  {line}
                </Typography>
              ))}
            </Paper>
          ) : (
            (missingOptions || running) && (
              <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                {missingOptions ? t.roulette.needTwo : t.roulette.spinning}
              </Typography>
            )
          )}
        </Box>

        <Button
          variant="contained"
          size="large"
          disabled={!canRun}
          onClick={() => void run()}
          sx={{
            px: 6,
            width: { xs: '100%', sm: 'auto' },
            maxWidth: 520,
            position: { xs: 'sticky', md: 'static' },
            bottom: 12,
            zIndex: 2,
            '&.Mui-disabled': { bgcolor: 'action.disabledBackground', backdropFilter: 'blur(8px)' },
          }}
        >
          {t.roulette.action[mode]}
        </Button>
      </Stack>

      <Stack spacing={2} inert={running} sx={{ minWidth: 0, opacity: running ? 0.6 : 1 }}>
        {mode === 'coin' ? (
          <CoinPanel
            labels={settings.coinLabels}
            onLabels={(labels) => update({ coinLabels: labels })}
          />
        ) : mode === 'dice' && !settings.diceOptions ? null : (
          <OptionsPanel
            options={options}
            presets={presets}
            showWeights={settings.showWeights}
            onOptions={setOptions}
            onPresets={setPresets}
            onShowWeights={(showWeights) => update({ showWeights })}
          />
        )}
        <SettingsPanel settings={settings} onSettings={update} />
      </Stack>
    </Box>
  );
}
