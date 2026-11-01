import { Button, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { resultBlob, resultText } from '../lib/resultImage';
import type { ResultCard } from '../lib/resultImage';

type Props = { card: Omit<ResultCard, 'confetti'>; link: string };

const FILE_NAME = 'decision-maker-result.png';

export default function ResultActions({ card, link }: Props) {
  const t = useMessages(messages).result;
  const [confetti, setConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const download = async () => {
    const blob = await resultBlob({ ...card, confetti });
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = FILE_NAME;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const text = resultText(card);
    const blob = await resultBlob({ ...card, confetti });
    const files = blob ? [new File([blob], FILE_NAME, { type: 'image/png' })] : [];
    try {
      if (files.length && navigator.canShare?.({ files })) {
        await navigator.share({ files, text, title: card.appName });
      } else if (navigator.share) {
        await navigator.share({ text, url: link, title: card.appName });
      } else {
        await navigator.clipboard.writeText(`${text}\n${link}`);
        setCopied(true);
      }
    } catch {
      setCopied(false);
    }
  };

  return (
    <Stack
      direction="row"
      useFlexGap
      spacing={1}
      sx={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', pt: 1 }}
    >
      <Button size="small" variant="outlined" onClick={() => void share()}>
        {copied ? t.copied : t.share}
      </Button>
      <Button size="small" variant="outlined" onClick={() => void download()}>
        {t.download}
      </Button>
      <FormControlLabel
        sx={{ m: 0 }}
        control={
          <Switch
            size="small"
            checked={confetti}
            onChange={(event) => setConfetti(event.target.checked)}
          />
        }
        label={<Typography variant="body2">{t.withConfetti}</Typography>}
      />
    </Stack>
  );
}
