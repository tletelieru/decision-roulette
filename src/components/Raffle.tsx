import { Chip, Stack, TextField } from '@mui/material';
import { useImperativeHandle, useState } from 'react';
import type { Ref } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { wait } from '../lib/modes';
import type { Stage } from '../lib/modes';
import type { Option } from '../lib/options';
import { randomInt } from '../lib/random';

type Props = {
  ref: Ref<Stage<number[]>>;
  options: Option[];
  count: number;
  onCount: (count: number) => void;
};

export default function Raffle({ ref, options, count, onCount }: Props) {
  const t = useMessages(messages).raffle;
  const [winners, setWinners] = useState<number[]>([]);
  const [cursor, setCursor] = useState(-1);

  useImperativeHandle(ref, () => ({
    run: async (picks, seconds) => {
      setWinners([]);
      const perWinner = (seconds * 1000) / picks.length;
      for (let round = 0; round < picks.length; round += 1) {
        for (let elapsed = 0; elapsed < perWinner; elapsed += 90) {
          setCursor(randomInt(options.length));
          await wait(90);
        }
        setWinners(picks.slice(0, round + 1));
      }
      setCursor(-1);
    },
  }));

  return (
    <Stack spacing={2.5} sx={{ width: '100%', alignItems: 'center' }}>
      <TextField
        size="small"
        type="number"
        label={t.count}
        value={count}
        sx={{ width: 140 }}
        slotProps={{ htmlInput: { min: 1, max: Math.max(1, options.length) } }}
        onChange={(event) => onCount(Math.floor(Number(event.target.value)))}
      />
      <Stack
        direction="row"
        useFlexGap
        spacing={1}
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        {options.map((option, index) => {
          const place = winners.indexOf(index);
          const won = place !== -1;
          return (
            <Chip
              key={option.id}
              label={won ? `${place + 1}. ${option.label}` : option.label}
              color={won ? 'primary' : 'default'}
              variant={won || cursor === index ? 'filled' : 'outlined'}
              sx={{ fontWeight: won ? 700 : 500, maxWidth: '100%' }}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}
