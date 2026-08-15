import { describe, expect, it } from 'vitest';

import {
  getCallingCodes,
  getCountries,
  getCountry,
  getCurrencies,
  getCurrency,
  getTimezone,
  getTimezones,
  isValidCallingCode,
  isValidCountryCode,
  isValidCurrencyCode,
  isValidTimezone,
} from '../index.js';

describe('getCountries', () => {
  it('returns all 250 countries ordered by ISO2', () => {
    const countries = getCountries();
    expect(countries).toHaveLength(250);
    expect(countries[0].iso2).toBe('AD');
    expect([...countries].sort((a, b) => a.iso2.localeCompare(b.iso2))).toEqual([...countries]);
  });

  it('returns frozen objects, so a caller cannot corrupt the shared table', () => {
    const country = getCountries()[0];
    expect(Object.isFrozen(getCountries())).toBe(true);
    expect(Object.isFrozen(country)).toBe(true);
    expect(() => {
      (country as { name: string }).name = 'HACKED';
    }).toThrow(TypeError);
    expect(getCountry('AD')!.name).toBe('Andorra');
  });
});

describe('getCountry', () => {
  it('looks up by alpha-2 and alpha-3', () => {
    expect(getCountry('US')!.name).toBe('United States');
    expect(getCountry('USA')!.name).toBe('United States');
  });

  it('is case- and whitespace-insensitive', () => {
    expect(getCountry('us')).toBe(getCountry('US'));
    expect(getCountry('  us  ')).toBe(getCountry('US'));
    expect(getCountry('usa')).toBe(getCountry('USA'));
  });

  it('returns undefined for unknown codes instead of throwing', () => {
    expect(getCountry('XX')).toBeUndefined();
    expect(getCountry('XXX')).toBeUndefined();
    expect(getCountry('')).toBeUndefined();
  });

  it('does not throw on nullish input', () => {
    expect(getCountry(undefined as unknown as string)).toBeUndefined();
    expect(getCountry(null as unknown as string)).toBeUndefined();
  });

  it('exposes correctly shaped records', () => {
    const andorra = getCountry('AD')!;
    expect(andorra).toMatchObject({
      iso2: 'AD',
      iso3: 'AND',
      name: 'Andorra',
      capital: 'Andorra la Vella',
      continent: 'Europe',
      region: 'Europe',
      subregion: 'Southern Europe',
      callingCodes: ['376'],
      languages: ['ca'],
      emoji: '🇦🇩',
      currency: { code: 'EUR', name: 'Euro', symbol: '€' },
    });
    expect(andorra.latitude).toBeCloseTo(42.5, 5);
    expect(andorra.longitude).toBeCloseTo(1.5, 5);
  });

  it('splits multi-code countries into separate calling codes', () => {
    expect(getCountry('DO')!.callingCodes).toEqual(['1809', '1829', '1849']);
    expect(getCountry('KZ')!.callingCodes).toEqual(['76', '77']);
  });

  it('splits multi-language countries into separate codes', () => {
    expect(getCountry('AF')!.languages).toEqual(['ps', 'uz', 'tk']);
  });
});

describe('getCurrencies', () => {
  it('deduplicates by ISO 4217 code', () => {
    const currencies = getCurrencies();
    const codes = currencies.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.filter((c) => c === 'EUR')).toHaveLength(1);
    expect(currencies.length).toBeLessThan(getCountries().length);
  });

  it('is sorted by code', () => {
    const codes = getCurrencies().map((c) => c.code);
    expect([...codes].sort()).toEqual([...codes]);
  });

  it('looks up a currency case-insensitively', () => {
    expect(getCurrency('eur')).toEqual({ code: 'EUR', name: 'Euro', symbol: '€' });
    expect(getCurrency('XXX')).toBeUndefined();
  });

  it('uses the primary code for countries that list several', () => {
    // The source joins these with commas, such as "USD,USN,USS".
    expect(getCountry('US')!.currency.code).toBe('USD');
    expect(getCountry('CH')!.currency.code).toBe('CHF');
    expect(getCountry('BO')!.currency.code).toBe('BOB');
    expect(getCountry('UY')!.currency.code).toBe('UYU');
    expect(getCurrency('USD')!.name).toBe('United States Dollar');
    expect(isValidCurrencyCode('USD')).toBe(true);
  });

  it('never exposes a comma-joined currency code', () => {
    for (const country of getCountries()) {
      const expected = country.iso2 === 'AQ' ? /^$/ : /^[A-Z]{3}$/;
      expect(country.currency.code, country.iso2).toMatch(expected);
    }
  });

  it('reports an empty code for a territory with no currency', () => {
    expect(getCountry('AQ')!.currency.code).toBe('');
    expect(getCurrencies().some((c) => c.code === '')).toBe(false);
  });
});

describe('getTimezones', () => {
  it('returns 423 distinct zones', () => {
    const zones = getTimezones();
    expect(zones).toHaveLength(423);
    expect(new Set(zones.map((z) => z.name)).size).toBe(423);
  });

  it('derives the offset name, including the ± spelling at zero', () => {
    expect(getTimezone('Europe/Andorra')).toEqual({
      name: 'Europe/Andorra',
      utcOffset: 3600,
      utcOffsetName: 'UTC+01:00',
      abbreviation: 'CET',
      description: 'Central European Time',
    });
    expect(getTimezone('Asia/Kabul')!.utcOffsetName).toBe('UTC+04:30');
    expect(getTimezone('Africa/Abidjan')!.utcOffsetName).toBe('UTC±00');
  });

  it('returns undefined for an unknown zone', () => {
    expect(getTimezone('Mars/Olympus_Mons')).toBeUndefined();
  });
});

describe('getCallingCodes', () => {
  it('emits one entry per code, not per country', () => {
    const codes = getCallingCodes();
    const dominica = codes.filter((c) => c.country.iso2 === 'DO');
    expect(dominica.map((c) => c.code)).toEqual(['1809', '1829', '1849']);
    expect(codes.length).toBeGreaterThan(getCountries().length);
  });

  it('links each code back to its country', () => {
    const entry = getCallingCodes().find((c) => c.code === '376')!;
    expect(entry.country.iso2).toBe('AD');
  });
});

describe('validators', () => {
  it('validates country codes in both ISO forms', () => {
    expect(isValidCountryCode('US')).toBe(true);
    expect(isValidCountryCode('usa')).toBe(true);
    expect(isValidCountryCode('XX')).toBe(false);
  });

  it('validates currency codes', () => {
    expect(isValidCurrencyCode('USD')).toBe(true);
    expect(isValidCurrencyCode('xxx')).toBe(false);
  });

  it('validates timezones', () => {
    expect(isValidTimezone('America/New_York')).toBe(true);
    expect(isValidTimezone('XXX')).toBe(false);
  });

  it('accepts numbers, strings and +-prefixed calling codes', () => {
    expect(isValidCallingCode(376)).toBe(true);
    expect(isValidCallingCode('376')).toBe(true);
    expect(isValidCallingCode('+376')).toBe(true);
    expect(isValidCallingCode(' 376 ')).toBe(true);
    expect(isValidCallingCode(999)).toBe(false);
    expect(isValidCallingCode(undefined as unknown as string)).toBe(false);
  });

  it('validates the calling codes of multi-code countries', () => {
    expect(isValidCallingCode('1829')).toBe(true);
    expect(isValidCallingCode('77')).toBe(true);
  });
});
