/**
 * @packageDocumentation
 * @module amplifiedhq/countries-atlas
 * @author AmplifiedHQ
 * 
 * Countries, ISO codes, currencies, calling codes, languages, and time zones.
 *
 * @example
 * ```ts
 * import { getCountry } from '@amplifiedhq/countries-atlas';
 *
 * getCountry('US')?.name;   // 'United States'
 * ```
 *
 * @license MIT
 * @see {@link https://github.com/amplifiedhq/countries-atlas}
 */
import { key, load } from './internal/countries.js';
import type { Country, Currency, Timezone } from './types.js';

export type { City, Country, Currency, State, Timezone, Translations } from './types.js';

/** A calling code paired with the country that uses it. */
export interface CallingCode {
  /** E.164 calling code without the `+`. */
  readonly code: string;
  readonly country: Country;
}

/** Returns every country, ordered by ISO 3166-1 alpha-2 code. Frozen. */
export function getCountries(): readonly Country[] {
  return load().all;
}

/**
 * Returns the country with the given ISO 3166-1 alpha-2 or alpha-3 code,
 * ignoring case and surrounding whitespace, or `undefined`.
 */
export function getCountry(code: string): Country | undefined {
  const k = key(code);
  const table = load();
  return k.length === 3 ? table.byIso3.get(k) : table.byIso2.get(k);
}

/** Returns every distinct ISO 4217 currency, ordered by code. */
export function getCurrencies(): readonly Currency[] {
  return currencies().list;
}

/** Returns the currency with the given ISO 4217 code, or `undefined`. */
export function getCurrency(code: string): Currency | undefined {
  return currencies().byCode.get(key(code));
}

/** Returns every distinct IANA time zone. */
export function getTimezones(): readonly Timezone[] {
  return load().timezones;
}

/** Returns the time zone with the given IANA name, or `undefined`. */
export function getTimezone(name: string): Timezone | undefined {
  return timezones().get(name);
}

/**
 * Returns one entry per calling code. Countries with several codes contribute
 * several entries, so the result suits a phone number picker directly.
 */
export function getCallingCodes(): readonly CallingCode[] {
  return callingCodes().list;
}

/** Reports whether `code` is a known alpha-2 or alpha-3 country code. */
export function isValidCountryCode(code: string): boolean {
  return getCountry(code) !== undefined;
}

/** Reports whether `code` is a known ISO 4217 currency code. */
export function isValidCurrencyCode(code: string): boolean {
  return currencies().byCode.has(key(code));
}

/** Reports whether `name` is a known IANA time zone name. */
export function isValidTimezone(name: string): boolean {
  return timezones().has(typeof name === 'string' ? name : '');
}

/** Reports whether `code` is a known calling code. Accepts `1`, `'1'`, `'+1'`. */
export function isValidCallingCode(code: string | number): boolean {
  if (typeof code !== 'string' && typeof code !== 'number') return false;
  return callingCodes().byCode.has(String(code).trim().replace(/^\+/, ''));
}

interface CurrencyIndex {
  readonly list: readonly Currency[];
  readonly byCode: ReadonlyMap<string, Currency>;
}

let currencyIndex: CurrencyIndex | undefined;

function currencies(): CurrencyIndex {
  if (currencyIndex === undefined) {
    const byCode = new Map<string, Currency>();
    for (const country of load().all) {
      const { code } = country.currency;
      // Antarctica carries an empty code and is not a currency.
      if (code !== '' && !byCode.has(code)) byCode.set(code, country.currency);
    }
    const list = Object.freeze([...byCode.values()].sort((a, b) => a.code.localeCompare(b.code)));
    currencyIndex = { list, byCode };
  }
  return currencyIndex;
}

let timezoneIndex: ReadonlyMap<string, Timezone> | undefined;

function timezones(): ReadonlyMap<string, Timezone> {
  if (timezoneIndex === undefined) {
    timezoneIndex = new Map(load().timezones.map((tz) => [tz.name, tz]));
  }
  return timezoneIndex;
}

interface CallingCodeIndex {
  readonly list: readonly CallingCode[];
  readonly byCode: ReadonlySet<string>;
}

let callingCodeIndex: CallingCodeIndex | undefined;

function callingCodes(): CallingCodeIndex {
  if (callingCodeIndex === undefined) {
    const list: CallingCode[] = [];
    const byCode = new Set<string>();
    for (const country of load().all) {
      for (const code of country.callingCodes) {
        list.push(Object.freeze({ code, country }));
        byCode.add(code);
      }
    }
    callingCodeIndex = { list: Object.freeze(list), byCode };
  }
  return callingCodeIndex;
}
