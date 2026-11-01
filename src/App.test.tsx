import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('preferred-lang', 'en');
  localStorage.setItem('color-mode', 'light');
});

afterEach(cleanup);

describe('App', () => {
  it('credits the developer in the footer', () => {
    render(<App />);
    const footer = within(screen.getByRole('contentinfo'));
    expect(footer.getByRole('link', { name: 'tletelieru' }).getAttribute('href')).toBe(
      'https://tletelieru.github.io/tletelieru/',
    );
    expect(footer.getByRole('link', { name: 'GitHub' }).getAttribute('href')).toBe(
      'https://github.com/tletelieru',
    );
  });

  it('switches language and remembers it', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'ES' }));
    expect(screen.getByRole('heading', { name: 'Deja que el azar decida' })).toBeTruthy();
    expect(localStorage.getItem('preferred-lang')).toBe('es');
    expect(document.documentElement.lang).toBe('es');
  });

  it('toggles color mode and remembers it', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('color-mode')).toBe('dark');
  });
});
