/**
 * @packageDocumentation
 * @module amplifiedhq/countries-atlas/translations
 * @author AmplifiedHQ
 *
 *
 * Country name translations.
 *
 * @example
 * ```ts
 * import { getTranslation } from '@amplifiedhq/countries-atlas/translations';
 *
 * getTranslation('AD', 'fr');   // 'Andorre'
 * ```
 */
import payload from './generated/translations.js';
import { key, load } from './internal/countries.js';
import { columns, values } from './internal/codec.js';
import type { Translations } from './types.js';

export type { Translations } from './types.js';

interface Table {
  readonly locales: readonly string[];
  readonly byIso2: ReadonlyMap<string, Translations>;
}

let table: Table | undefined;

function build(): Table {
  const col = columns(payload);
  const locales = col[0].split(',');
  const perLocale = locales.map((_, i) => values(col[i + 1]));
  const byIso2 = new Map<string, Translations>();

  load().all.forEach((country, row) => {
    // Null-prototype: a plain object would resolve `getTranslation(c, 'toString')`
    // to a function rather than undefined.
    const entry = Object.create(null) as Record<string, string>;
    locales.forEach((locale, i) => {
      const value = perLocale[i][row];
      if (value !== '') entry[locale] = value;
    });
    byIso2.set(country.iso2, Object.freeze(entry));
  });

  return { locales: Object.freeze(locales), byIso2 };
}

function decoded(): Table {
  if (table === undefined) table = build();
  return table;
}

/**
 * Returns every available locale code. These are the dataset's own codes, not
 * BCP 47 tags: Korean is `kr`, Chinese is `cn`, and `br` is Brazilian
 * Portuguese.
 */
export function getLocales(): readonly string[] {
  return decoded().locales;
}

/**
 * Returns every translation of a country's name, keyed by locale, or
 * `undefined` if the country is unknown.
 *
 * @param countryCode - ISO 3166-1 alpha-2 code, case-insensitive.
 */
export function getTranslations(countryCode: string): Translations | undefined {
  return decoded().byIso2.get(key(countryCode));
}

/**
 * Returns one translation of a country's name, or `undefined` if either code is
 * unknown.
 *
 * @param countryCode - ISO 3166-1 alpha-2 code, case-insensitive.
 * @param locale - A locale code from {@link getLocales}.
 */
export function getTranslation(countryCode: string, locale: string): string | undefined {
  return getTranslations(countryCode)?.[locale];
}
