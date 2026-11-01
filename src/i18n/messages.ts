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
  dice: { sides: string };
  raffle: { count: string; more: string; fewer: string };
  roulette: {
    spin: string;
    stop: string;
    action: Record<Mode, string>;
    spinning: string;
    winner: string;
    needTwo: string;
  };
  options: {
    title: string;
    raffleTitle: string;
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
    starterLists: string;
    starters: { name: string; items: string[] }[];
  };
  settings: {
    title: string;
    duration: string;
    instant: string;
    stopButton: string;
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
        coin: 'Two sides, one answer.',
        dice: 'Pick your dice and roll.',
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
    dice: { sides: 'Dice type' },
    raffle: { count: 'Winners', more: 'More winners', fewer: 'Fewer winners' },
    roulette: {
      spin: 'SPIN',
      stop: 'Stop',
      action: {
        wheel: 'Spin the wheel',
        coin: 'Flip the coin',
        dice: 'Roll the dice',
        cards: 'Shuffle and draw',
        raffle: 'Draw winners',
      },
      spinning: 'Spinning…',
      winner: 'The result is',
      needTwo: 'Add at least two options to spin.',
    },
    options: {
      title: 'Options',
      raffleTitle: 'Participants',
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
      starterLists: 'Quick lists',
      starters: [
        { name: 'Plans', items: ['Movie', 'Walk', 'Read', 'Gym', 'Games', 'Nap'] },
        { name: 'Food', items: ['Pizza', 'Sushi', 'Tacos', 'Burgers', 'Salad', 'Pasta'] },
        {
          name: 'Movies',
          items: ['Comedy', 'Horror', 'Drama', 'Action', 'Sci-fi', 'Animation'],
        },
        {
          name: 'Chores',
          items: ['Dishes', 'Laundry', 'Vacuum', 'Trash', 'Groceries', 'Bathroom'],
        },
        { name: 'Names', items: ['Ana', 'Ben', 'Carla', 'Diego', 'Elena', 'Felix'] },
      ],
    },
    settings: {
      title: 'Settings',
      duration: 'Spin duration',
      instant: 'Instant result',
      stopButton: 'Stop button',
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
        coin: 'Dos caras, una respuesta.',
        dice: 'Elige un dado y lánzalo.',
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
    dice: { sides: 'Tipo de dado' },
    raffle: { count: 'Ganadores', more: 'Más ganadores', fewer: 'Menos ganadores' },
    roulette: {
      spin: 'GIRAR',
      stop: 'Detener',
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
    },
    options: {
      title: 'Opciones',
      raffleTitle: 'Participantes',
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
      starterLists: 'Listas rápidas',
      starters: [
        { name: 'Planes', items: ['Cine', 'Paseo', 'Leer', 'Gimnasio', 'Juegos', 'Siesta'] },
        {
          name: 'Comida',
          items: ['Pizza', 'Sushi', 'Tacos', 'Hamburguesas', 'Ensalada', 'Pasta'],
        },
        {
          name: 'Películas',
          items: ['Comedia', 'Terror', 'Drama', 'Acción', 'Ciencia ficción', 'Animación'],
        },
        { name: 'Tareas', items: ['Platos', 'Ropa', 'Aspirar', 'Basura', 'Compras', 'Baño'] },
        { name: 'Nombres', items: ['Ana', 'Ben', 'Carla', 'Diego', 'Elena', 'Felix'] },
      ],
    },
    settings: {
      title: 'Ajustes',
      duration: 'Duración del giro',
      instant: 'Resultado instantáneo',
      stopButton: 'Botón de detener',
      sound: 'Sonido',
      confetti: 'Confeti',
    },
    footer: { developedBy: 'Desarrollado por' },
  },
});
