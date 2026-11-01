import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  FormControlLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { activeOptions, createId, createOption, parseBulk } from '../lib/options';
import type { Option, Preset } from '../lib/options';
import { sliceColor } from '../lib/palette';
import { CloseIcon, PlusIcon } from './icons';

type Props = {
  options: Option[];
  presets: Preset[];
  showWeights: boolean;
  onOptions: (options: Option[]) => void;
  onPresets: (presets: Preset[]) => void;
  onShowWeights: (show: boolean) => void;
};

export default function OptionsPanel({
  options,
  presets,
  showWeights,
  onOptions,
  onPresets,
  onShowWeights,
}: Props) {
  const t = useMessages(messages).options;
  const [draft, setDraft] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState('');
  const [presetId, setPresetId] = useState('');
  const [presetName, setPresetName] = useState('');

  const activeIds = activeOptions(options).map((option) => option.id);
  const dotColor = (id: string) =>
    activeIds.includes(id) ? sliceColor(activeIds.indexOf(id), activeIds.length) : 'action.disabled';

  const update = (id: string, patch: Partial<Option>) =>
    onOptions(options.map((option) => (option.id === id ? { ...option, ...patch } : option)));

  const addLabels = (labels: string[]) =>
    onOptions([...options, ...labels.map((label) => createOption(label))]);

  const addDraft = () => {
    if (!draft.trim()) return;
    addLabels([draft.trim()]);
    setDraft('');
  };

  const addBulk = () => {
    addLabels(parseBulk(bulk));
    setBulk('');
    setBulkOpen(false);
  };

  const loadPreset = (id: string) => {
    setPresetId(id);
    const preset = presets.find((item) => item.id === id);
    if (preset) onOptions(preset.options);
  };

  const savePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const preset = { id: createId(), name, options };
    onPresets([...presets, preset]);
    setPresetId(preset.id);
    setPresetName('');
  };

  const deletePreset = () => {
    onPresets(presets.filter((preset) => preset.id !== presetId));
    setPresetId('');
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h2">
            {t.title}
          </Typography>
          <FormControlLabel
            sx={{ mr: 0 }}
            labelPlacement="start"
            control={
              <Switch
                size="small"
                checked={showWeights}
                onChange={(event) => onShowWeights(event.target.checked)}
              />
            }
            label={<Typography variant="body2">{t.weights}</Typography>}
          />
        </Stack>

        <Stack spacing={0.5} sx={{ maxHeight: 320, overflowY: 'auto' }}>
          {options.map((option, index) => (
            <Stack
              key={option.id}
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                bgcolor: 'action.hover',
                borderRadius: 1,
                pl: 1.25,
                pr: 0.5,
                minHeight: 40,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  flexShrink: 0,
                  borderRadius: '50%',
                  bgcolor: dotColor(option.id),
                }}
              />
              <InputBase
                fullWidth
                value={option.label}
                inputProps={{ 'aria-label': `${t.option} ${index + 1}` }}
                onChange={(event) => update(option.id, { label: event.target.value })}
              />
              {showWeights && (
                <InputBase
                  type="number"
                  value={option.weight}
                  sx={{
                    width: 56,
                    flexShrink: 0,
                    '& input': { MozAppearance: 'textfield' },
                    '& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                  }}
                  inputProps={{ min: 0, 'aria-label': `${t.weights} ${index + 1}` }}
                  onChange={(event) =>
                    update(option.id, { weight: Math.max(0, Number(event.target.value)) })
                  }
                />
              )}
              <IconButton
                size="small"
                aria-label={`${t.remove} ${option.label}`}
                onClick={() => onOptions(options.filter((item) => item.id !== option.id))}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>

        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder={t.addPlaceholder}
            value={draft}
            slotProps={{ htmlInput: { 'aria-label': t.addPlaceholder } }}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addDraft();
            }}
          />
          <Tooltip title={t.add}>
            <span>
              <IconButton color="primary" aria-label={t.add} disabled={!draft.trim()} onClick={addDraft}>
                <PlusIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Button size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => setBulkOpen(!bulkOpen)}>
          {t.bulk}
        </Button>
        <Collapse in={bulkOpen} unmountOnExit>
          <Stack spacing={1}>
            <TextField
              multiline
              minRows={4}
              size="small"
              placeholder={t.bulkPlaceholder}
              value={bulk}
              slotProps={{ htmlInput: { 'aria-label': t.bulkPlaceholder } }}
              onChange={(event) => setBulk(event.target.value)}
            />
            <Button variant="contained" disabled={!parseBulk(bulk).length} onClick={addBulk}>
              {t.addAll}
            </Button>
          </Stack>
        </Collapse>

        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" component="h3">
              {t.starterLists}
            </Typography>
            <Stack direction="row" useFlexGap spacing={0.75} sx={{ flexWrap: 'wrap' }}>
              {t.starters.map((starter) => (
                <Chip
                  key={starter.name}
                  clickable
                  size="small"
                  variant="outlined"
                  label={starter.name}
                  onClick={() => onOptions(starter.items.map((label) => createOption(label)))}
                />
              ))}
            </Stack>
            <Typography variant="subtitle2" component="h3" sx={{ pt: 0.5 }}>
              {t.presets}
            </Typography>
            {presets.length > 0 && (
              <Stack direction="row" spacing={1}>
                <Select
                  fullWidth
                  displayEmpty
                  size="small"
                  value={presetId}
                  inputProps={{ 'aria-label': t.loadPreset }}
                  onChange={(event) => loadPreset(event.target.value)}
                >
                  <MenuItem value="" disabled>
                    {t.loadPreset}
                  </MenuItem>
                  {presets.map((preset) => (
                    <MenuItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </MenuItem>
                  ))}
                </Select>
                <Tooltip title={t.deletePreset}>
                  <span>
                    <IconButton aria-label={t.deletePreset} disabled={!presetId} onClick={deletePreset}>
                      <CloseIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            )}
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder={t.presetName}
                value={presetName}
                slotProps={{ htmlInput: { 'aria-label': t.presetName } }}
                onChange={(event) => setPresetName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') savePreset();
                }}
              />
              <Button variant="outlined" disabled={!presetName.trim()} onClick={savePreset}>
                {t.savePreset}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
