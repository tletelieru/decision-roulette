import { defineMessages } from './react';

type Strings = {
  appName: string;
  toLight: string;
  toDark: string;
  language: string;
  hero: { title: string; subtitle: string };
  footer: { developedBy: string };
};

export const messages = defineMessages<Strings>({
  en: {
    appName: 'Decision Roulette',
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
    language: 'Language',
    hero: {
      title: 'Let chance decide',
      subtitle: 'Spin a wheel, pull a slot, flip a coin or roll the dice.',
    },
    footer: { developedBy: 'Developed by' },
  },
  es: {
    appName: 'Ruleta de Decisiones',
    toLight: 'Cambiar a modo claro',
    toDark: 'Cambiar a modo oscuro',
    language: 'Idioma',
    hero: {
      title: 'Deja que el azar decida',
      subtitle: 'Gira una ruleta, tira una tragamonedas, lanza una moneda o los dados.',
    },
    footer: { developedBy: 'Desarrollado por' },
  },
});
