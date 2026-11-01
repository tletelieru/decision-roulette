import { IconButton, Stack, Link, Tooltip, Typography } from '@mui/material';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { GitHubIcon } from './icons';

const GITHUB_URL = 'https://github.com/tletelieru';
const SITE_URL = 'https://tletelieru.github.io/tletelieru/';

export default function Footer() {
  const t = useMessages(messages).footer;

  return (
    <Stack component="footer" spacing={0.25} sx={{ alignItems: 'center', pt: 2 }}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t.developedBy}{' '}
          <Link href={SITE_URL} target="_blank" rel="noreferrer">
            tletelieru
          </Link>
        </Typography>
        <Tooltip title="GitHub">
          <IconButton
            size="small"
            aria-label="GitHub"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        © 2026 tletelieru. {t.rights}
      </Typography>
    </Stack>
  );
}
