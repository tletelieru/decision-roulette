import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { burstConfetti, playWin, prefersReducedMotion, vibrate } from '../lib/feedback';
import { needsOptions } from '../lib/modes';
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
const RAFFLE_KEY = 'dr-raffle';
const CARDS_KEY = 'dr-cards';
const WHEEL_STARTER = 0;
const CARDS_STARTER = 4;
const RAFFLE_STARTER = 5;
const PRESETS_KEY = 'dr-presets';
const SETTINGS_KEY = 'dr-settings';

const NUMBER_COLOR = '#6d4fe0';

type Result = { lines: string[]; color: string };

export default function Roulette() {
  const t = useMessages(messages);
  const starter = (index: number) =>
    t.options.starters[index].items.map((label) => createOption(label));
  const [options, setOptions] = useState<Option[]>(() =>
    load(OPTIONS_KEY, isOptionList, starter(WHEEL_STARTER)),
  );
  const [deck, setDeck] = useState<Option[]>(() =>
    load(CARDS_KEY, isOptionList, starter(CARDS_STARTER)),
  );
  const [names, setNames] = useState<Option[]>(() =>
    load(RAFFLE_KEY, isOptionList, starter(RAFFLE_STARTER)),
  );
  const [presets, setPresets] = useState<Preset[]>(() => load(PRESETS_KEY, isPresetList, []));
  const [settings, setSettings] = useState<Settings>(() =>
    restoreSettings(load(SETTINGS_KEY, isSettings, defaultSettings)),
  );
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [stopping, setStopping] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const wheel = useRef<WheelHandle>(null);
  const coin = useRef<Stage<number>>(null);
  const dice = useRef<Stage<number>>(null);
  const cards = useRef<Stage<number>>(null);
  const raffle = useRef<Stage<number[]>>(null);
  const list = settings.mode === 'raffle' ? names : settings.mode === 'cards' ? deck : options;
  const active = useMemo(() => activeOptions(list), [list]);
  const activeKey = active.map((option) => option.id).join();
  const { mode } = settings;
  const missingOptions = needsOptions(mode) && active.length < 2;
  const canRun = !missingOptions && !running;
  const canStop = running && settings.stopButton && !stopping;
  const stopLabel = running && settings.stopButton;
  const winners = Math.min(Math.max(1, settings.winners), Math.max(1, active.length));

  useEffect(() => save(OPTIONS_KEY, options), [options]);
  useEffect(() => save(RAFFLE_KEY, names), [names]);
  useEffect(() => save(CARDS_KEY, deck), [deck]);
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

  const draw = async (seconds: number, signal: AbortSignal): Promise<Result> => {
    const weights = active.map((option) => option.weight);
    if (mode === 'coin') {
      const side = randomInt(2);
      await coin.current?.run(side, seconds, signal);
      return { lines: [coinLabels[side]], color: COIN_COLORS[side] };
    }
    if (mode === 'dice') {
      const value = randomInt(settings.sides) + 1;
      await dice.current?.run(value, seconds, signal);
      return { lines: [`${value}`], color: NUMBER_COLOR };
    }
    if (mode === 'raffle') {
      const picks = pickMany(weights, winners);
      await raffle.current?.run(picks, seconds, signal);
      return {
        lines: picks.map((pick, place) => `${place + 1}. ${active[pick].label}`),
        color: NUMBER_COLOR,
      };
    }
    const index = pickWeightedIndex(weights);
    if (mode === 'cards') await cards.current?.run(index, seconds, signal);
    else await wheel.current?.spin(index, seconds, signal);
    return { lines: [active[index].label], color: sliceColor(index, active.length) };
  };

  const stop = () => {
    setStopping(true);
    controller.current?.abort();
  };

  const run = async () => {
    if (!canRun) return;
    controller.current = new AbortController();
    setResult(null);
    setRunning(true);
    const seconds = settings.instant || prefersReducedMotion() ? 0 : settings.duration;
    const next = await draw(seconds, controller.current.signal);
    setRunning(false);
    setStopping(false);
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
            disabled={!canRun && !canStop}
            hubLabel={stopLabel ? t.roulette.stop.toUpperCase() : t.roulette.spin}
            onHub={() => (canStop ? stop() : void run())}
          />
        )}
        {mode === 'coin' && <Coin ref={coin} labels={coinLabels} />}
        {mode === 'dice' && (
          <Dice
            key={settings.sides}
            ref={dice}
            sides={settings.sides}
            onSides={(sides) => update({ sides })}
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
                borderRadius: 1.5,
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
          disabled={!canRun && !canStop}
          onClick={() => (canStop ? stop() : void run())}
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
          {stopLabel ? t.roulette.stop : t.roulette.action[mode]}
        </Button>
      </Stack>

      <Stack spacing={2} inert={running} sx={{ minWidth: 0, opacity: running ? 0.6 : 1 }}>
        {mode === 'coin' ? (
          <CoinPanel
            labels={settings.coinLabels}
            onLabels={(labels) => update({ coinLabels: labels })}
          />
        ) : mode === 'dice' ? null : (
          <OptionsPanel
            title={mode === 'raffle' ? t.options.raffleTitle : t.options.title}
            options={list}
            presets={presets}
            showWeights={settings.showWeights}
            onOptions={mode === 'raffle' ? setNames : mode === 'cards' ? setDeck : setOptions}
            onPresets={setPresets}
            onShowWeights={(showWeights) => update({ showWeights })}
          />
        )}
        <SettingsPanel settings={settings} onSettings={update} />
      </Stack>
    </Box>
  );
}
