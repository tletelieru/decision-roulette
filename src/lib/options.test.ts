import { describe, expect, it } from 'vitest';
import { activeOptions, createOption, isOptionList, isPresetList, parseBulk } from './options';

describe('parseBulk', () => {
  it('splits lines and drops blanks', () => {
    expect(parseBulk(' Pizza \r\n\r\nSushi\n  \nTacos')).toEqual(['Pizza', 'Sushi', 'Tacos']);
  });
});

describe('activeOptions', () => {
  it('skips blank labels and zero weights', () => {
    const keep = createOption('Pizza');
    expect(activeOptions([keep, createOption('  '), createOption('Sushi', 0)])).toEqual([keep]);
  });
});

describe('stored data guards', () => {
  it('accepts valid lists', () => {
    const options = [createOption('Pizza')];
    expect(isOptionList(options)).toBe(true);
    expect(isPresetList([{ id: 'a', name: 'Dinner', options }])).toBe(true);
  });

  it('rejects malformed lists', () => {
    expect(isOptionList('nope')).toBe(false);
    expect(isOptionList([{ id: 'a' }])).toBe(false);
    expect(isOptionList([null])).toBe(false);
    expect(isPresetList([{ id: 'a', name: 'Dinner', options: [{}] }])).toBe(false);
  });
});
