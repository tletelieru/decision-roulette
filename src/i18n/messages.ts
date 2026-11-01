import type { Mode } from '../lib/modes';
import { defineMessages } from './react';

type Strings = {
  appName: string;
  toLight: string;
  toDark: string;
  language: string;
  hero: { title: string; subtitle: Record<Mode, string> };
  modes: Record<Mode, string> & { label: string };
  coin: { yes: string; no: string };
  dice: { sides: string; mapped: string };
  raffle: { count: string };
  roulette: {
    spin: string;
    action: Record<Mode, string>;
    spinning: string;
    winner: string;
    needTwo: string;
    defaults: string[];
  };
  options: {
    title: string;
    option: string;
    weights: string;
    remove: string;
    add: string;
    addPlaceholder: string;
    bulk: string;
    bulkPlaceholder: string;
    addAll: string;
    presets: string;
    loadPreset: string;
    deletePreset: string;
    presetName: string;
    savePreset: string;
  };
  settings: {
    title: string;
    duration: string;
    instant: string;
    sound: string;
    confetti: string;
  };
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
      subtitle: {
        wheel: 'Add your options and spin.',
        coin: 'A quick yes or no.',
        dice: 'Roll a die, with or without options.',
        cards: 'Shuffle the deck and reveal one card.',
        raffle: 'Draw winners without repeats.',
      },
    },
    modes: {
      label: 'Picker mode',
      wheel: 'Wheel',
      coin: 'Coin',
      dice: 'Dice',
      cards: 'Cards',
      raffle: 'Raffle',
    },
    coin: { yes: 'Yes', no: 'No' },
    dice: { sides: 'Die type', mapped: 'Each number maps to your options, in order.' },
    raffle: { count: 'Winners' },
    roulette: {
      spin: 'SPIN',
      action: {
        wheel: 'Spin the wheel',
        coin: 'Flip the coin',
        dice: 'Roll the die',
        cards: 'Shuffle and draw',
        raffle: 'Draw winners',
      },
      spinning: 'Spinning…',
      winner: 'The result is',
      needTwo: 'Add at least two options to spin.',
      defaults: ['Pizza', 'Sushi', 'Tacos', 'Burgers', 'Salad', 'Pasta'],
    },
    options: {
      title: 'Options',
      option: 'Option',
      weights: 'Weights',
      remove: 'Remove',
      add: 'Add option',
      addPlaceholder: 'Add an option',
      bulk: 'Paste a list',
      bulkPlaceholder: 'One option per line',
      addAll: 'Add all',
      presets: 'Saved lists',
      loadPreset: 'Load a list',
      deletePreset: 'Delete list',
      presetName: 'List name',
      savePreset: 'Save',
    },
    settings: {
      title: 'Settings',
      duration: 'Spin duration',
      instant: 'Instant result',
      sound: 'Sound',
      confetti: 'Confetti',
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
      subtitle: {
        wheel: 'Agrega tus opciones y gira.',
        coin: 'Un sí o no rápido.',
        dice: 'Lanza un dado, con o sin opciones.',
        cards: 'Baraja el mazo y revela una carta.',
        raffle: 'Sortea ganadores sin repetir.',
      },
    },
    modes: {
      label: 'Modo de selección',
      wheel: 'Ruleta',
      coin: 'Moneda',
      dice: 'Dados',
      cards: 'Cartas',
      raffle: 'Sorteo',
    },
    coin: { yes: 'Sí', no: 'No' },
    dice: { sides: 'Tipo de dado', mapped: 'Cada número corresponde a tus opciones, en orden.' },
    raffle: { count: 'Ganadores' },
    roulette: {
      spin: 'GIRAR',
      action: {
        wheel: 'Girar la ruleta',
        coin: 'Lanzar la moneda',
        dice: 'Lanzar el dado',
        cards: 'Barajar y sacar',
        raffle: 'Sortear ganadores',
      },
      spinning: 'Girando…',
      winner: 'El resultado es',
      needTwo: 'Agrega al menos dos opciones para girar.',
      defaults: ['Pizza', 'Sushi', 'Tacos', 'Hamburguesas', 'Ensalada', 'Pasta'],
    },
    options: {
      title: 'Opciones',
      option: 'Opción',
      weights: 'Pesos',
      remove: 'Quitar',
      add: 'Agregar opción',
      addPlaceholder: 'Agrega una opción',
      bulk: 'Pegar una lista',
      bulkPlaceholder: 'Una opción por línea',
      addAll: 'Agregar todas',
      presets: 'Listas guardadas',
      loadPreset: 'Cargar una lista',
      deletePreset: 'Borrar lista',
      presetName: 'Nombre de la lista',
      savePreset: 'Guardar',
    },
    settings: {
      title: 'Ajustes',
      duration: 'Duración del giro',
      instant: 'Resultado instantáneo',
      sound: 'Sonido',
      confetti: 'Confeti',
    },
    footer: { developedBy: 'Desarrollado por' },
  },
});
