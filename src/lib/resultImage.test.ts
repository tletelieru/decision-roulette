import { describe, expect, it } from 'vitest';
import { confettiPieces, resultText, shareMessage, wrapWords } from './resultImage';

describe('confettiPieces', () => {
  it('keeps every piece on the card and off the background color', () => {
    const pieces = confettiPieces(300, 1200, 630, '#d9402f');
    expect(pieces).toHaveLength(300);
    for (const piece of pieces) {
      expect(piece.x).toBeLessThan(1200);
      expect(piece.y).toBeLessThan(630);
      expect(piece.color).not.toBe('#d9402f');
    }
  });
});

describe('wrapWords', () => {
  it('breaks text at the width limit', () => {
    expect(wrapWords('Pregunta otra vez', (line) => line.length <= 8)).toEqual([
      'Pregunta',
      'otra vez',
    ]);
  });

  it('keeps a single long word whole', () => {
    expect(wrapWords('Definitivamente', () => false)).toEqual(['Definitivamente']);
  });
});

describe('shareMessage', () => {
  it('sends the result with the page link', () => {
    expect(
      shareMessage({ winner: 'The result is', lines: ['Yes'] }, 'https://example.com/#mode=coin'),
    ).toBe('The result is: Yes\nhttps://example.com/#mode=coin');
  });
});

describe('resultText', () => {
  it('joins the result lines', () => {
    expect(resultText({ winner: 'The result is', lines: ['1. Ana', '2. Ben'] })).toBe(
      'The result is: 1. Ana, 2. Ben',
    );
  });

  it('leads with the question when there is one', () => {
    expect(resultText({ winner: 'The result is', lines: ['Yes'], question: 'Go out?' })).toBe(
      'Go out? The result is: Yes',
    );
  });
});
