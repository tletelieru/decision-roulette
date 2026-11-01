import { Box, Container, CssBaseline, Stack, ThemeProvider, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import { messages } from './i18n/messages';
import { pickLocale, preferredLocaleKey } from './i18n/locales';
import type { Locale } from './i18n/locales';
import { LocaleProvider, useMessages } from './i18n/react';
import { colorModeKey, createAppTheme, pickColorMode } from './lib/theme';
import type { ColorMode } from './lib/theme';

const prefersDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

function Hero() {
  const t = useMessages(messages).hero;

  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: { xs: 4, md: 8 } }}>
      <Box
        component="img"
        src={`${import.meta.env.BASE_URL}favicon.svg`}
        alt=""
        sx={{ width: { xs: 180, md: 260 }, height: { xs: 180, md: 260 } }}
      />
      <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
        {t.title}
      </Typography>
      <Typography color="text.secondary">{t.subtitle}</Typography>
    </Stack>
  );
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() =>
    pickLocale(localStorage.getItem(preferredLocaleKey), navigator.languages),
  );
  const [mode, setMode] = useState<ColorMode>(() =>
    pickColorMode(localStorage.getItem(colorModeKey), prefersDark()),
  );
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = messages[locale].appName;
    localStorage.setItem(preferredLocaleKey, locale);
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem(colorModeKey, mode);
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocaleProvider locale={locale}>
        <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 } }}>
          <Stack spacing={3}>
            <Header
              locale={locale}
              mode={mode}
              onLocale={setLocale}
              onToggleMode={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            />
            <Box component="main">
              <Hero />
            </Box>
            <Footer />
          </Stack>
        </Container>
      </LocaleProvider>
    </ThemeProvider>
  );
}
