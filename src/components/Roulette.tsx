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
import { decodeShare, encodeShare } from '../lib/share';
import type { SharedState } from '../lib/share';
import { load, save } from '../lib/storage';
import Cards from './Cards';
import Coin from './Coin';
import CoinPanel from './CoinPanel';
import Dice from './Dice';
import ModeTabs from './ModeTabs';
import Oracle from './Oracle';
import OptionsPanel from './OptionsPanel';
import Raffle from './Raffle';
import SettingsPanel from './SettingsPanel';
import Wheel from './Wheel';
import type { WheelHandle } from './Wheel';

const OPTIONS_KEY = 'dr-options';
const RAFFLE_KEY = 'dr-raffle';
const CARDS_KEY = 'dr-cards';
const ORACLE_KEY = 'dr-oracle';
const WHEEL_STARTER = 0;
const CARDS_STARTER = 4;
const RAFFLE_STARTER = 5;
const ORACLE_STARTER = 6;
const PRESETS_KEY = 'dr-presets';
const SETTINGS_KEY = 'dr-settings';

const NUMBER_COLOR = '#6d4fe0';

type Result = { lines: string[]; color: string };

export default function Roulette() {
  const t = useMessages(messages);
  const starter = (index: number) =>
    t.options.starters[index].items.map((label) => createOption(label));
  const [shared] = useState(() => decodeShare(window.location.hash));
  const [sharedList] = useState(
    () => shared?.options?.map((option) => createOption(option.label, option.weight)) ?? null,
  );
  const initialList = (listMode: Mode, key: string, starterIndex: number) =>
    shared?.mode === listMode && sharedList
      ? sharedList
      : load(key, isOptionList, starter(starterIndex));
  const [options, setOptions] = useState<Option[]>(() =>
    initialList('wheel', OPTIONS_KEY, WHEEL_STARTER),
  );
  const [deck, setDeck] = useState<Option[]>(() => initialList('cards', CARDS_KEY, CARDS_STARTER));
  const [names, setNames] = useState<Option[]>(() =>
    initialList('raffle', RAFFLE_KEY, RAFFLE_STARTER),
  );
  const [answers, setAnswers] = useState<Option[]>(() =>
    initialList('oracle', ORACLE_KEY, ORACLE_STARTER),
  );
  const [question, setQuestion] = useState(shared?.question ?? '');
  const [copied, setCopied] = useState(false);
  const [presets, setPresets] = useState<Preset[]>(() => load(PRESETS_KEY, isPresetList, []));
  const [settings, setSettings] = useState<Settings>(() => {
    const restored = restoreSettings(load(SETTINGS_KEY, isSettings, defaultSettings));
    if (!shared) return restored;
    return {
      ...restored,
      mode: shared.mode,
      sides: shared.sides ?? restored.sides,
      winners: shared.winners ?? restored.winners,
      coinLabels: shared.coin ?? restored.coinLabels,
    };
  });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [stopping, setStopping] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const wheel = useRef<WheelHandle>(null);
  const coin = useRef<Stage<number>>(null);
  const dice = useRef<Stage<number>>(null);
  const cards = useRef<Stage<number>>(null);
  const raffle = useRef<Stage<number[]>>(null);
  const oracle = useRef<Stage<number>>(null);
  const lists = { raffle: names, cards: deck, oracle: answers };
  const setters = { raffle: setNames, cards: setDeck, oracle: setAnswers };
  const listMode = settings.mode as keyof typeof lists;
  const list = lists[listMode] ?? options;
  const active = useMemo(() => activeOptions(list), [list]);
  const activeKey = active.map((option) => option.id).join();
  const { mode } = settings;
  const missingOptions = needsOptions(mode) && active.length < 2;
  const missingQuestion = mode === 'oracle' && !question.trim();
  const canRun = !missingOptions && !missingQuestion && !running;
  const canStop = running && settings.stopButton && !stopping;
  const stopLabel = running && settings.stopButton;
  const winners = Math.min(Math.max(1, settings.winners), Math.max(1, active.length));

  useEffect(() => {
    if (options !== sharedList) save(OPTIONS_KEY, options);
  }, [options, sharedList]);
  useEffect(() => {
    if (names !== sharedList) save(RAFFLE_KEY, names);
  }, [names, sharedList]);
  useEffect(() => {
    if (deck !== sharedList) save(CARDS_KEY, deck);
  }, [deck, sharedList]);
  useEffect(() => {
    if (answers !== sharedList) save(ORACLE_KEY, answers);
  }, [answers, sharedList]);
  useEffect(() => save(PRESETS_KEY, presets), [presets]);
  useEffect(() => save(SETTINGS_KEY, settings), [settings]);

  const coinLabels: [string, string] = [
    settings.coinLabels[0].trim() || t.coin.yes,
    settings.coinLabels[1].trim() || t.coin.no,
  ];

  const shareHash = useMemo(() => {
    const state: SharedState = { mode };
    if (mode === 'coin') state.coin = settings.coinLabels;
    else if (mode === 'dice') state.sides = settings.sides;
    else {
      state.options = active.map(({ label, weight }) => ({ label: label.trim(), weight }));
      if (mode === 'raffle') state.winners = winners;
      if (mode === 'oracle') state.question = question.trim();
    }
    return encodeShare(state);
  }, [active, mode, question, settings.coinLabels, settings.sides, winners]);

  useEffect(() => {
    const timer = setTimeout(() => history.replaceState(null, '', `#${shareHash}`), 250);
    return () => clearTimeout(timer);
  }, [shareHash]);

  useEffect(() => {
    const reload = () => location.reload();
    window.addEventListener('hashchange', reload);
    return () => window.removeEventListener('hashchange', reload);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyLink = async () => {
    const { origin, pathname } = window.location;
    try {
      await navigator.clipboard.writeText(`${origin}${pathname}#${shareHash}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

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
    else if (mode === 'oracle') await oracle.current?.run(index, seconds, signal);
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

        {mode === 'oracle' && (
          <Oracle
            key={activeKey}
            ref={oracle}
            options={active}
            question={question}
            disabled={running}
            onQuestion={setQuestion}
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
            (missingOptions || missingQuestion || running) && (
              <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                {missingOptions
                  ? t.roulette.needTwo
                  : missingQuestion
                    ? t.oracle.needQuestion
                    : t.roulette.spinning}
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
        <Button size="small" onClick={() => void copyLink()}>
          {copied ? t.roulette.copied : t.roulette.copyLink}
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
            options={list}
            presets={presets}
            showWeights={settings.showWeights}
            onOptions={setters[listMode] ?? setOptions}
            onPresets={setPresets}
            onShowWeights={(showWeights) => update({ showWeights })}
          />
        )}
        <SettingsPanel settings={settings} onSettings={update} />
      </Stack>
    </Box>
  );
}
