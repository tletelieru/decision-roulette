import { defineMessages } from './react';

type Strings = {
  appName: string;
  toLight: string;
  toDark: string;
  language: string;
  hero: { title: string; subtitle: string };
  roulette: {
    spin: string;
    spinAgain: string;
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
      subtitle: 'Add your options and spin.',
    },
    roulette: {
      spin: 'SPIN',
      spinAgain: 'Spin the wheel',
      spinning: 'Spinning…',
      winner: 'The wheel says',
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
      subtitle: 'Agrega tus opciones y gira.',
    },
    roulette: {
      spin: 'GIRAR',
      spinAgain: 'Girar la ruleta',
      spinning: 'Girando…',
      winner: 'La ruleta dice',
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
