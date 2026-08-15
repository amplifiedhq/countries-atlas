/**
 * Checks that the packed format decodes back to the raw JSON in `data/`, which
 * is the source of truth for every field the library exposes.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { getCountries, getCountry, getTimezones } from '../index.js';
import { getStates } from '../states.js';
import { getCities } from '../cities.js';
import { getTranslations } from '../translations.js';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data');

interface RawCountry {
  code: string;
  name: string;
  native: string;
  phone: string | number;
  continent: string;
  capital: string;
  currency: string;
  languages: string;
  iso3: string;
  iso2: string;
  currency_symbol: string;
  region: string;
  subregion: string;
  timezones: Array<{
    zoneName: string;
    gmtOffset: number;
    gmtOffsetName: string;
    abbreviation: string;
    tzName: string;
  }>;
  translations: Record<string, string>;
  latitude: string;
  longitude: string;
  emoji: string;
  currency_name: string;
}

interface RawState {
  name: string;
  state_code: string;
  latitude: string | null;
  longitude: string | null;
  cities?: Array<{ name: string; latitude: string | null; longitude: string | null }>;
}

const raw: RawCountry[] = JSON.parse(readFileSync(join(DATA, 'atlas.json'), 'utf8'));
const rawByIso2 = new Map(raw.map((c) => [c.iso2, c]));

// Rounds a coordinate the way the encoder does. Comparing integers is exact,
// avoiding float noise on values that land on a half-step.
function q(value: string | number): number {
  return Math.round(Number(value) * 1e5);
}

function readCountryFile(iso2: string): RawState[] {
  const path = join(DATA, 'countries', `${iso2.toLowerCase()}.json`);
  return JSON.parse(readFileSync(path, 'utf8')).states ?? [];
}

describe('country parity', () => {
  it('exposes every country exactly once', () => {
    const decoded = getCountries();
    expect(decoded).toHaveLength(raw.length);
    expect(new Set(decoded.map((c) => c.iso2)).size).toBe(raw.length);
  });

  it('round-trips every scalar field', () => {
    for (const source of raw) {
      const country = getCountry(source.iso2);
      expect(country, source.iso2).toBeDefined();
      expect(country!.iso2).toBe(source.iso2);
      expect(country!.iso3).toBe(source.iso3);
      expect(country!.name).toBe(source.name);
      expect(country!.nativeName).toBe(source.native);
      expect(country!.capital).toBe(source.capital ?? '');
      expect(country!.continent).toBe(source.continent);
      expect(country!.region).toBe(source.region);
      expect(country!.subregion).toBe(source.subregion);
      expect(country!.emoji).toBe(source.emoji);
      expect(country!.currency.code).toBe(source.currency.split(',')[0]);
      expect(country!.currency.name).toBe(source.currency_name);
      expect(country!.currency.symbol).toBe(source.currency_symbol);
    }
  });

  it('splits comma-joined source fields into arrays', () => {
    for (const source of raw) {
      const country = getCountry(source.iso2)!;
      expect(country.callingCodes.join(','), source.iso2).toBe(String(source.phone));
      expect(country.languages.join(','), source.iso2).toBe(source.languages);
    }
  });

  it('preserves country coordinates within quantisation tolerance', () => {
    for (const source of raw) {
      const country = getCountry(source.iso2)!;
      expect(q(country.latitude), source.iso2).toBe(q(source.latitude));
      expect(q(country.longitude), source.iso2).toBe(q(source.longitude));
    }
  });

  it('round-trips every timezone of every country', () => {
    for (const source of raw) {
      const country = getCountry(source.iso2)!;
      expect(country.timezones, source.iso2).toHaveLength(source.timezones.length);
      country.timezones.forEach((tz, i) => {
        const expected = source.timezones[i];
        expect(tz.name).toBe(expected.zoneName);
        expect(tz.utcOffset).toBe(expected.gmtOffset);
        expect(tz.utcOffsetName).toBe(expected.gmtOffsetName);
        expect(tz.abbreviation).toBe(expected.abbreviation);
        expect(tz.description).toBe(expected.tzName);
      });
    }
  });

  it('deduplicates the global timezone list by value', () => {
    const names = getTimezones().map((tz) => tz.name);
    const expected = new Set(raw.flatMap((c) => c.timezones.map((t) => t.zoneName)));
    expect(new Set(names).size).toBe(names.length);
    expect(new Set(names)).toEqual(expected);
  });

  it('round-trips every translation', () => {
    for (const source of raw) {
      const decoded = getTranslations(source.iso2);
      // Empty strings are dropped on encode.
      const expected = Object.fromEntries(
        Object.entries(source.translations ?? {}).filter(([, v]) => v !== '')
      );
      expect(decoded, source.iso2).toEqual(expected);
    }
  });
});

describe('state and city parity', () => {
  const files = readdirSync(join(DATA, 'countries')).filter((f) => f.endsWith('.json'));

  it('covers every country file', () => {
    expect(files).toHaveLength(250);
  });

  it('round-trips every state of every country', async () => {
    for (const file of files) {
      const iso2 = file.replace(/\.json$/, '');
      const sourceStates = readCountryFile(iso2);
      const decoded = await getStates(iso2);

      expect(decoded, iso2).toHaveLength(sourceStates.length);
      decoded.forEach((state, i) => {
        const source = sourceStates[i];
        expect(state.name, `${iso2}[${i}]`).toBe(source.name);
        expect(state.code, `${iso2}[${i}]`).toBe(source.state_code ?? '');

        if (source.latitude === null) {
          expect(state.latitude, `${iso2}[${i}]`).toBeNull();
        } else {
          expect(q(state.latitude!), `${iso2}[${i}]`).toBe(q(source.latitude));
        }
        if (source.longitude === null) {
          expect(state.longitude, `${iso2}[${i}]`).toBeNull();
        } else {
          expect(q(state.longitude!), `${iso2}[${i}]`).toBe(q(source.longitude));
        }
      });
    }
  });

  it('round-trips every city of every country', async () => {
    let checked = 0;

    for (const file of files) {
      const iso2 = file.replace(/\.json$/, '');
      const sourceStates = readCountryFile(iso2);
      const expected = sourceStates.flatMap((s) =>
        (s.cities ?? []).map((c) => ({ ...c, stateCode: s.state_code ?? '' }))
      );
      const decoded = await getCities(iso2);

      expect(decoded, iso2).toHaveLength(expected.length);
      decoded.forEach((city, i) => {
        const source = expected[i];
        expect(city.name, `${iso2}[${i}]`).toBe(source.name);
        expect(city.stateCode, `${iso2}[${i}]`).toBe(source.stateCode);

        if (source.latitude === null) {
          expect(city.latitude, `${iso2}[${i}]`).toBeNull();
        } else {
          expect(q(city.latitude!), `${iso2}[${i}] ${source.name}`).toBe(q(source.latitude));
        }
        if (source.longitude === null) {
          expect(city.longitude, `${iso2}[${i}]`).toBeNull();
        } else {
          expect(q(city.longitude!), `${iso2}[${i}] ${source.name}`).toBe(q(source.longitude));
        }
      });
      checked += decoded.length;
    }

    expect(checked).toBe(147644);
  });
});

describe('source invariants the format relies on', () => {
  it('derives the flag emoji from the country code', () => {
    for (const source of raw) {
      expect(getCountry(source.iso2)!.emoji, source.iso2).toBe(source.emoji);
    }
  });

  it('never needed the redundant `code` field', () => {
    expect(raw.every((c) => c.code === c.iso2)).toBe(true);
  });

  it('has a country for every ISO2 referenced by a country file', () => {
    for (const file of readdirSync(join(DATA, 'countries'))) {
      const iso2 = file.replace(/\.json$/, '').toUpperCase();
      expect(rawByIso2.has(iso2), iso2).toBe(true);
    }
  });
});

describe('flag assets', () => {
  const svgDir = join(DATA, '..', 'flags', 'svg');
  const codes = readdirSync(svgDir)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.replace(/\.svg$/, ''));

  it('has exactly one flag per country, and no orphans', () => {
    expect(new Set(codes)).toEqual(new Set(raw.map((c) => c.iso2.toLowerCase())));
    expect(codes).toHaveLength(raw.length);
  });

  it('names every flag after a lowercase ISO 3166-1 alpha-2 code', () => {
    for (const code of codes) expect(code, code).toMatch(/^[a-z]{2}$/);
  });
});
