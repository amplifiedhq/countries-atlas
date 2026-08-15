import { describe, expect, it } from 'vitest';

import { getCities } from '../cities.js';
import { flagClass, flagEmoji, flagUrl } from '../flags.js';
import { getState, getStates } from '../states.js';
import { getLocales, getTranslation, getTranslations } from '../translations.js';

describe('getStates', () => {
  it('returns the states of a country', async () => {
    const states = await getStates('US');
    expect(states.length).toBeGreaterThan(50);
    // Coordinates are rounded to 5 decimal places on encode.
    expect(states[0]).toEqual({
      code: 'AL',
      name: 'Alabama',
      latitude: 32.31823,
      longitude: -86.9023,
    });
  });

  it('is case-insensitive', async () => {
    expect(await getStates('us')).toBe(await getStates('US'));
  });

  it('caches the decoded result', async () => {
    expect(await getStates('AD')).toBe(await getStates('AD'));
  });

  it('returns an empty frozen array for unknown countries', async () => {
    const states = await getStates('XX');
    expect(states).toEqual([]);
    expect(Object.isFrozen(states)).toBe(true);
  });

  it('looks up a single state case-insensitively', async () => {
    const california = await getState('US', 'ca');
    expect(california).toMatchObject({ code: 'CA', name: 'California' });
    expect(await getState('US', 'XX')).toBeUndefined();
    expect(await getState('XX', 'CA')).toBeUndefined();
  });

  it('preserves null coordinates rather than coercing them to zero', async () => {
    const withNulls = (await getStates('BW')).filter((s) => s.latitude === null);
    expect(withNulls.length).toBeGreaterThan(0);
    for (const state of withNulls) expect(state.longitude).toBeNull();
  });
});

describe('getCities', () => {
  it('returns every city of a country', async () => {
    const cities = await getCities('AD');
    expect(cities.length).toBeGreaterThan(5);
    expect(cities[0]).toEqual({
      name: 'Andorra la Vella',
      stateCode: '07',
      latitude: 42.50779,
      longitude: 1.52109,
    });
  });

  it('narrows to a single state', async () => {
    const all = await getCities('US');
    const california = await getCities('US', 'CA');
    expect(california.length).toBeGreaterThan(100);
    expect(california.length).toBeLessThan(all.length);
    expect(california.every((c) => c.stateCode === 'CA')).toBe(true);
  });

  it('matches the state code case-insensitively', async () => {
    expect((await getCities('US', 'ca')).length).toBe((await getCities('US', 'CA')).length);
  });

  it('tags every city with the state it belongs to', async () => {
    const cities = await getCities('AD');
    const states = await getStates('AD');
    const codes = new Set(states.map((s) => s.code));
    expect(cities.every((c) => codes.has(c.stateCode))).toBe(true);
  });

  it('returns empty for unknown countries and states', async () => {
    expect(await getCities('XX')).toEqual([]);
    expect(await getCities('US', 'XX')).toEqual([]);
  });

  it('caches the decoded country', async () => {
    expect(await getCities('AD')).toBe(await getCities('AD'));
  });

  it('serves a state slice from an index, not a fresh scan', async () => {
    // Same reference every call: a regression to `list.filter(...)` would
    // allocate a new array and fail here.
    const first = await getCities('US', 'CA');
    expect(await getCities('US', 'CA')).toBe(first);
    expect(await getCities('US', 'ca')).toBe(first);
    expect(Object.isFrozen(first)).toBe(true);
  });
});

describe('flags', () => {
  it('derives the emoji arithmetically from the country code', () => {
    expect(flagEmoji('US')).toBe('🇺🇸');
    expect(flagEmoji('us')).toBe('🇺🇸');
    expect(flagEmoji('AD')).toBe('🇦🇩');
  });

  it('returns an empty string for anything that is not a 2-letter code', () => {
    expect(flagEmoji('USA')).toBe('');
    expect(flagEmoji('1')).toBe('');
    expect(flagEmoji('')).toBe('');
  });

  it('builds CSS classes for the shipped stylesheet', () => {
    expect(flagClass('US')).toBe('flag flag-us');
    expect(flagClass('ad')).toBe('flag flag-ad');
    expect(flagClass('USA')).toBe('');
    expect(flagClass('')).toBe('');
  });

  it('defaults to flagcdn', () => {
    expect(flagUrl('US')).toBe('https://flagcdn.com/us.svg');
    expect(flagUrl('us')).toBe('https://flagcdn.com/us.svg');
    expect(flagUrl('US', { format: 'png' })).toBe('https://flagcdn.com/w80/us.png');
    expect(flagUrl('US', { format: 'png', width: 320 })).toBe('https://flagcdn.com/w320/us.png');
  });

  it('offers the 4:3 flag-icons source, which matches the bundled assets', () => {
    expect(flagUrl('US', { source: 'flag-icons' })).toBe(
      'https://cdn.jsdelivr.net/npm/flag-icons@7/flags/4x3/us.svg'
    );
    expect(flagUrl('US', { source: 'flag-icons', format: 'png' })).toMatch(/\.svg$/);
  });

  it('accepts any origin, which overrides the source', () => {
    expect(flagUrl('US', { baseUrl: 'https://cdn.example.com/flags' })).toBe(
      'https://cdn.example.com/flags/us.svg'
    );
    expect(flagUrl('US', { baseUrl: '/static/flags' })).toBe('/static/flags/us.svg');
    expect(flagUrl('US', { baseUrl: '/static/flags/' })).toBe('/static/flags/us.svg');
    expect(flagUrl('US', { baseUrl: '/f', source: 'flag-icons' })).toBe('/f/us.svg');
    expect(flagUrl('US', { baseUrl: '/f', format: 'png' })).toBe('/f/us.png');
  });

  it('returns an empty string for an invalid code', () => {
    expect(flagUrl('USA')).toBe('');
    expect(flagUrl('')).toBe('');
  });
});

describe('translations', () => {
  it('lists the available locales', () => {
    const locales = getLocales();
    expect(locales).toContain('fr');
    expect(locales).toContain('ja');
    expect(new Set(locales).size).toBe(locales.length);
  });

  it('returns one translation', () => {
    expect(getTranslation('AD', 'fr')).toBe('Andorre');
    expect(getTranslation('AD', 'ja')).toBe('アンドラ');
  });

  it('returns the full set for a country', () => {
    const translations = getTranslations('AD')!;
    expect(translations.fr).toBe('Andorre');
    expect(Object.isFrozen(translations)).toBe(true);
  });

  it('returns undefined for unknown countries and locales', () => {
    expect(getTranslations('XX')).toBeUndefined();
    expect(getTranslation('AD', 'xx')).toBeUndefined();
    expect(getTranslation('XX', 'fr')).toBeUndefined();
  });
});

describe('hostile input', () => {
  const hostile = ['__proto__', 'constructor', 'toString', 'valueOf', '  __PROTO__  '];

  it('treats Object.prototype keys as unknown countries', async () => {
    for (const code of hostile) {
      expect(await getStates(code), code).toEqual([]);
      expect(await getCities(code), code).toEqual([]);
      expect(await getState(code, 'CA'), code).toBeUndefined();
    }
  });

  it('treats Object.prototype keys as unknown locales and states', async () => {
    for (const key of hostile) {
      expect(getTranslation('AD', key), key).toBeUndefined();
      expect(await getCities('US', key), key).toEqual([]);
    }
  });
});

describe('concurrent first load', () => {
  it('decodes a country once and returns one shared reference', async () => {
    const [cities, states] = await Promise.all([
      Promise.all(Array.from({ length: 8 }, () => getCities('BR'))),
      Promise.all(Array.from({ length: 8 }, () => getStates('DE'))),
    ]);
    expect(new Set(cities).size).toBe(1);
    expect(new Set(states).size).toBe(1);
    expect(await getCities('BR')).toBe(cities[0]);
  });

  it('keeps state slices stable across a racing first load', async () => {
    const slices = await Promise.all(Array.from({ length: 8 }, () => getCities('AR', 'C')));
    expect(new Set(slices).size).toBe(1);
    expect(await getCities('AR', 'C')).toBe(slices[0]);
  });
});
