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

  it('spins to a result with instant mode', async () => {
    localStorage.setItem(
      'dr-settings',
      JSON.stringify({
        duration: 5,
        instant: true,
        sound: false,
        confetti: false,
        showWeights: false,
      }),
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Spin the wheel' }));
    expect(await screen.findByText('The result is')).toBeTruthy();
  });

  it.each([
    ['Coin', 'Flip the coin'],
    ['Dice', 'Roll the dice'],
    ['Cards', 'Shuffle and draw'],
    ['Raffle', 'Draw winners'],
  ])('runs the %s mode', async (mode, action) => {
    localStorage.setItem(
      'dr-settings',
      JSON.stringify({
        duration: 5,
        instant: true,
        sound: false,
        confetti: false,
        showWeights: false,
      }),
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: mode }));
    fireEvent.click(screen.getByRole('button', { name: action }));
    expect(await screen.findByText('The result is')).toBeTruthy();
  });

  it('uses the coin sides instead of the option list', async () => {
    localStorage.setItem(
      'dr-settings',
      JSON.stringify({
        duration: 5,
        instant: true,
        sound: false,
        confetti: false,
        showWeights: false,
      }),
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Coin' }));
    expect(screen.queryByRole('button', { name: 'Remove Movie' })).toBeNull();
    for (const [name, value] of [
      ['Option 1', 'Heads'],
      ['Option 2', 'Heads'],
    ]) {
      fireEvent.change(screen.getByRole('textbox', { name }), { target: { value } });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Flip the coin' }));
    await screen.findByText('The result is');
    expect(screen.getByRole('heading', { name: 'Options' })).toBeTruthy();
    expect(screen.getAllByText('Heads').length).toBeGreaterThanOrEqual(3);
  });

  it('rolls plain numbers without the option list', async () => {
    localStorage.setItem(
      'dr-settings',
      JSON.stringify({
        duration: 5,
        instant: true,
        sound: false,
        confetti: false,
        showWeights: false,
      }),
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Dice' }));
    expect(screen.queryByRole('button', { name: 'Remove Movie' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));
    await screen.findByText('The result is');
    expect(screen.getByText(/^(1|2|3|4|5|6)$/)).toBeTruthy();
  });

  it('loads a quick list', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Food' }));
    expect(screen.getByRole('button', { name: 'Remove Pizza' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Remove Movie' })).toBeNull();
  });

  it('limits raffle winners to the option count', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Raffle' }));
    const fewer = screen.getByRole('button', { name: 'Fewer winners' }) as HTMLButtonElement;
    const more = screen.getByRole('button', { name: 'More winners' }) as HTMLButtonElement;
    expect(fewer.disabled).toBe(true);
    for (let i = 0; i < 5; i += 1) fireEvent.click(more);
    expect(more.disabled).toBe(true);
    expect(screen.getByText('6')).toBeTruthy();
  });

  it('adds options and blocks spinning with fewer than two', () => {
    localStorage.setItem('dr-options', '[]');
    render(<App />);
    expect(screen.getByText('Add at least two options to spin.')).toBeTruthy();
    const input = screen.getByRole('textbox', { name: 'Add an option' });
    for (const label of ['Yes', 'No']) {
      fireEvent.change(input, { target: { value: label } });
      fireEvent.keyDown(input, { key: 'Enter' });
    }
    expect(screen.queryByText('Add at least two options to spin.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Remove Yes' })).toBeTruthy();
  });

  it('toggles color mode and remembers it', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('color-mode')).toBe('dark');
  });
});
