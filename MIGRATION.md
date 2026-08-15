# Migrate from v1 to v2

v2 replaces the two singleton objects with named functions, ships as ES modules, and packs the dataset into a smaller format. The data itself is unchanged: the same 250 countries, 4,857 states, and 147,644 cities.

There's no deprecation layer. Every v1 call site needs an edit. This guide lists all of them.

Most changes are a rename plus an `await`. A typical application takes about 15 minutes.

## What changed

| | v1.4.17 | v2.0.0 |
| --- | --- | --- |
| Install size | 18.09 MB | 8.30 MB |
| Dataset within that | 12.14 MB | 3.37 MB |
| Flag assets within that | 4.88 MB | 4.87 MB |
| Tarball | 3.46 MB | 2.78 MB |
| API | 2 singletons, 17 methods | 20 named functions |
| Module format | CommonJS | ES modules |
| Exported types | None | All |

## Install and import

```bash
npm install @amplifiedhq/countries-atlas@2
```

v2 requires Node.js 18 or later and ships as ES modules only.

**Bundlers** — Vite, webpack, Rollup, esbuild, Next.js, and Nuxt need no changes. Delete the `@rollup/plugin-commonjs` `dynamicRequireTargets` entry and the Nuxt `build.transpile` entry, which both worked around v1's dynamic `require()`.

**CommonJS callers** — `require()` works only where Node.js supports requiring an ES module. `await import()` works everywhere. Tested results:

| Node.js | `import` | `await import()` from CommonJS | `require()` |
| --- | --- | --- | --- |
| 18.20 | Works | Works | `ERR_REQUIRE_ESM` |
| 20.19 and later | Works | Works | Works |
| 21.x | Works | Works | `ERR_REQUIRE_ESM` |
| 22.12 and later | Works | Works | Works |

If `require()` fails on your version, change the call site:

```diff
- const { getCountry } = require('@amplifiedhq/countries-atlas');
+ const { getCountry } = await import('@amplifiedhq/countries-atlas');
```

Node.js 18 and 21 are both past end of life. Node.js 21 never received the `require(esm)` backport that landed in 20.19.

**Jest** — run it with Node's ES module support enabled, or switch to Vitest:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest
```

Configuring `transform` alone doesn't help; the blocker is that Jest doesn't transform `node_modules` by default, and `require()` of an ES module fails regardless.

Imports now come from subpaths, so you load only what you use:

```ts
import { getCountry } from '@amplifiedhq/countries-atlas';
import { getStates } from '@amplifiedhq/countries-atlas/states';
import { getCities } from '@amplifiedhq/countries-atlas/cities';
import { flagClass } from '@amplifiedhq/countries-atlas/flags';
import { getTranslation } from '@amplifiedhq/countries-atlas/translations';
```

## Map v1 methods to v2 functions

`CountriesAtlas` and `ValidatorAtlas` are gone. Import the functions directly.

### Countries

```diff
- import { CountriesAtlas } from '@amplifiedhq/countries-atlas';
+ import { getCountries, getCountry } from '@amplifiedhq/countries-atlas';

- CountriesAtlas.getCountries()
+ getCountries()

- CountriesAtlas.find('US')
+ getCountry('US')

- CountriesAtlas.findByIso3('USA')
+ getCountry('USA')
```

`getCountry()` accepts both alpha-2 and alpha-3 codes, so `findByIso3()` has no separate replacement.

To replace `getCountries(properties)`, map over the result:

```diff
- CountriesAtlas.getCountries(['name', 'iso2', 'emoji'])
+ getCountries().map(({ name, iso2, emoji }) => ({ name, iso2, emoji }))
```

The v1 method returned `Country[]` whatever you asked for, added `undefined`-valued keys for unrecognised property names, and provided no type narrowing. `.map()` is shorter and fully typed.

### States and cities

These functions are now asynchronous, because each country is a separate module loaded on demand.

```diff
- import { CountriesAtlas } from '@amplifiedhq/countries-atlas';
+ import { getStates, getState } from '@amplifiedhq/countries-atlas/states';
+ import { getCities } from '@amplifiedhq/countries-atlas/cities';

- const states = CountriesAtlas.getStates('US');
+ const states = await getStates('US');

- const california = CountriesAtlas.state('US', 'CA');
+ const california = await getState('US', 'CA');
```

Cities are no longer nested inside each state. In v1, asking for a country's provinces also returned every city in that country. Fetch them separately:

```diff
- const cities = CountriesAtlas.getStates('US')
-   .find((s) => s.state_code === 'CA').cities;
+ const cities = await getCities('US', 'CA');
```

Unknown countries return an empty array instead of `undefined`, so you can map the result without a guard. To tell an unknown country from one with no subdivisions, call `isValidCountryCode()`.

### Time zones, currencies, and calling codes

```diff
- CountriesAtlas.getTimezones()      // 428 entries, 5 of them duplicates
+ getTimezones()                     // 423 entries, deduplicated by value

- CountriesAtlas.timezone('US')
+ getCountry('US')?.timezones

- CountriesAtlas.getCurrencies()     // 250 rows, one per country
+ getCurrencies()                    // 155 distinct ISO 4217 currencies

- CountriesAtlas.currency('US')
+ getCountry('US')?.currency

- CountriesAtlas.getCallingCodes()   // 250 rows, one per country
+ getCallingCodes()                  // 257 rows, one per code

- CountriesAtlas.callingCode('US')
+ getCountry('US')?.callingCodes     // ['1']
```

To rebuild v1's per-country currency list, map over the countries:

```ts
getCountries().map((country) => ({
  ...country.currency,
  iso2: country.iso2,
  name: country.name,
}));
```

### Validators

```diff
- import { ValidatorAtlas } from '@amplifiedhq/countries-atlas';
+ import {
+   isValidCountryCode,
+   isValidCurrencyCode,
+   isValidTimezone,
+   isValidCallingCode,
+ } from '@amplifiedhq/countries-atlas';

- ValidatorAtlas.isValidIso2('US')
- ValidatorAtlas.isValidIso3('USA')
+ isValidCountryCode('US')
+ isValidCountryCode('USA')

- ValidatorAtlas.isValidCurrency('USD')
+ isValidCurrencyCode('USD')

- ValidatorAtlas.isValidTimezone('America/New_York')
+ isValidTimezone('America/New_York')

- ValidatorAtlas.isValidCallingCode(1)
+ isValidCallingCode(1)
```

`isValidStateCode()` is removed. It read a country's data from disk to return a boolean, which is now asynchronous. Compare the lookup instead:

```diff
- ValidatorAtlas.isValidStateCode('US', 'CA')
+ (await getState('US', 'CA')) !== undefined
```

## Update field names

Every field on `Country` is now required and correctly typed, so you can drop the optional chaining v1 forced on you.

| v1 | v2 | Notes |
| --- | --- | --- |
| `code` | Removed | Always identical to `iso2` |
| `native` | `nativeName` | |
| `phone` | `callingCodes` | `string[]`, was `number \| string` |
| `languages` | `languages` | `string[]`, was a comma-joined string |
| `currency` | `currency.code` | |
| `currency_name` | `currency.name` | |
| `currency_symbol` | `currency.symbol` | |
| `latitude`, `longitude` | Unchanged | `number`, was `string` |
| `emojiU` | Removed | Derive from `emoji` if you need it |
| `translations` | Moved | See the `/translations` subpath |

`State` and `City` also changed:

| v1 | v2 |
| --- | --- |
| `state_code` | `code` |
| `latitude`, `longitude` | Unchanged names, `number \| null` instead of `string \| null` |
| `State.cities` | Removed. Call `getCities()` |
| — | `City.stateCode`, new |

Coordinates are rounded to five decimal places, about 1.1 metres. The source carried eight decimal places, but 97% of its values held no information past the fifth.

## Update flag imports

All 250 flag SVGs still ship, byte for byte. The stylesheets now come from a generator rather than being hand-maintained, so `flags.css`, `flags.min.css`, and `flags.scss` are equivalent to v1's but not identical to the byte. Import paths moved, because v2 declares an `exports` map.

```diff
- import '@amplifiedhq/countries-atlas/dist/flags/css/flags.min.css';
+ import '@amplifiedhq/countries-atlas/flags/css/flags.min.css';

- import { US } from '@amplifiedhq/countries-atlas/dist/flags';
- <img src={US} />
+ import us from '@amplifiedhq/countries-atlas/flags/svg/us.svg';
+ <img src={us} />
```

```diff
- @import '~@amplifiedhq/countries-atlas/dist/flags/scss/flags.scss';
+ @use '@amplifiedhq/countries-atlas/flags/scss/flags';
```

The barrel module of 250 named SVG re-exports is gone. Import the file you need by path. The `./flags/*` wildcard export makes every asset reachable, and you no longer load a 250-entry module to render one flag.

The stylesheets are now generated from `flags/svg/` at build time, so `flags.scss` exposes `$flag-width` and `$flag-height` as `!default` variables:

```scss
@use '@amplifiedhq/countries-atlas/flags/scss/flags' with (
  $flag-width: 24px,
  $flag-height: 18px
);
```

The `flag` string is no longer stored on each record. v1 wrote `flag: "flag flag-us"` onto every currency and calling-code row. Call the function instead:

```diff
- CountriesAtlas.callingCode('US').flag
+ flagClass('US')                      // 'flag flag-us'
```

`flagEmoji()` and `flagUrl()` are new. Neither needs a bundled asset:

```ts
import { flagEmoji, flagUrl } from '@amplifiedhq/countries-atlas/flags';

flagEmoji('US');                             // '🇺🇸'
flagUrl('US');                               // https://flagcdn.com/us.svg
flagUrl('US', { baseUrl: '/static/flags' }); // /static/flags/us.svg
```

## Behaviour changes

The following v1 behaviours were incorrect. If you wrote a workaround for any of them, remove it.

| Behaviour in v1 | Behaviour in v2 |
| --- | --- |
| `isValidCallingCode('376')` returned `false`. The comparison was strict against numbers, so string input never matched. | Accepts `376`, `'376'`, and `'+376'`. |
| Countries with several calling codes returned one joined string, such as `"1809,1829,1849"`, producing the phone code `"+1809,1829,1849"`. | Returns `['1809', '1829', '1849']`. |
| Countries with several currency codes returned a joined string, such as `"USD,USN,USS"`, so `currency` couldn't be validated or used for lookup. | Returns `'USD'`, the code that `currency.name` and `currency.symbol` describe. |
| `getTimezones()` returned 428 entries for 423 zones, because it deduplicated object references rather than values. | Returns 423 entries. |
| `getCountries()` returned the internal array by reference, so mutating a result corrupted the dataset for the process. | Returns frozen objects. |
| `find(undefined)` threw a `TypeError`. | Returns `undefined`. |
| `getCurrencies()` returned one row per country, not per currency. | Returns 155 distinct currencies. |
| Uruguay's currency was listed as `UYI,UYU`, so the primary code was the indexed accounting unit. | Corrected in the source data to `UYU,UYI`. |

## Stay on v1

v1 remains on npm. To pin it:

```bash
npm install @amplifiedhq/countries-atlas@1.4.17
```

v1 receives no further updates. Data corrections land in v2.
