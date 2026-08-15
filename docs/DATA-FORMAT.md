# Packed data format

`scripts/build-data.mjs` converts the raw JSON in `data/` into the modules under `src/generated/`. This document describes that format. You don't need it to use the library.

The encoder lives in `scripts/build-data.mjs`. The decoder lives in `src/internal/codec.ts`. They're separate implementations, so a mistake in one surfaces as a parity failure instead of both agreeing on a wrong answer. `src/__tests__/parity.test.ts` decodes every record and compares it against the source on each run.

## Why the data isn't JSON

The v1 dataset is 11.50 MB of minified JSON across the 250 files in `data/countries/`. The published v1 package carried a pretty-printed copy of the same records at 12.73 MB, which is the figure the [migration guide](../MIGRATION.md) compares against. All sizes in this document are decimal: 1 KB is 1,000 bytes.

| Component | Size | Share |
| --- | --- | --- |
| Structure: keys, punctuation, state records | 6.58 MB | 57% |
| Coordinate strings | 3.30 MB | 29% |
| City names | 1.61 MB | 14% |

Only the last row is irreducible. The first row is everything that is neither a coordinate nor a city name — dominated by the keys `name`, `latitude`, and `longitude` repeated once per city, 147,644 times. Coordinates were stored as strings such as `"42.50779000"`. Across city rows, 97.35% of values held nothing past the fifth decimal; across all tables the figure is 94.35%, and state rows are the exception at 2.37%.

The packed payload is 3.08 MB, or 3.39 MB once wrapped in JavaScript modules — a reduction of 3.4 times. Gzipped, the gap narrows to 2.31 MB against 1.64 MB, because gzip already finds much of the key repetition. The gain is in install size, parse time, and memory rather than download size.

A shared token dictionary for city names was measured and rejected. Tokenising on word boundaries and indexing in base36 saved roughly 0.2 MB of the 1.61 MB of names, which gzip recovers anyway, at the cost of a much harder format to read.

## Separators

Three control characters that can't occur in geographic names. The encoder asserts this for the free-text fields — names, capitals, currency names and symbols, time zone fields, translations, and state and city names — so a data update that introduced one fails the build instead of corrupting a payload. The remaining fields are codes with fixed shapes, checked by their own assertions.

| Character | Name | Separates |
| --- | --- | --- |
| `\x1e` | `COL` | Columns within a payload |
| `\x1f` | `UNIT` | Values within a column |
| `\n` | `GROUP` | Cities within a state |

## Primitives

### Coordinates

Coordinates are rounded to five decimal places, about 1.1 metres, delta-encoded against the previous record, then written with Google's polyline varint: zigzag the signed integer, emit five bits at a time, and add 63 to each chunk to keep it printable ASCII.

Consecutive records are usually close together, so most deltas collapse to two or three characters. A latitude and longitude pair averages about 8 bytes, against 22 for the two source strings.

```text
42.50779, 1.52109  ->  4250779, 152109  ->  delta  ->  "uhmbGyahH"
```

Zero is a valid coordinate, so nulls can't be encoded in band. The encoder writes them as `0, 0` and records their indices in a separate base36 mask column, which the decoder uses to restore them. 69 states have no coordinates. No city does.

### Dictionaries

Fields with few distinct values are stored as a dictionary column plus a base36 index column. Across 250 countries there are 7 continents, 7 regions, 23 subregions, 155 currency names, and 110 currency symbols.

### Derived fields

Two fields are computed at decode time rather than stored, and a third is dropped outright:

- `emoji` — the regional indicator pair is `iso2` shifted into `U+1F1E6`.
- `emojiU` — derivable the same way, so v2 drops it rather than exposing it.
- `utcOffsetName` — formatted from the offset in seconds. The dataset writes zero as `UTC±00` rather than `UTC+00:00`, which the formatter reproduces.

The encoder drops `code`, which is always identical to `iso2`, and asserts that before relying on it.

## Module layouts

### core.ts

56 KB, all 250 countries, in 21 columns:

| Column | Contents | Encoding |
| --- | --- | --- |
| 0 | iso2 | Concatenated, fixed width 2 |
| 1 | iso3 | Concatenated, fixed width 3 |
| 2 | name | `UNIT`-joined |
| 3 | nativeName | `UNIT`-joined |
| 4 | capital | `UNIT`-joined |
| 5 | callingCodes | `UNIT`-joined, comma-separated within |
| 6 | currency code | `UNIT`-joined |
| 7–8 | currency symbol | Dictionary and index |
| 9–10 | currency name | Dictionary and index |
| 11–12 | continent | Dictionary and index |
| 13–14 | region | Dictionary and index |
| 15–16 | subregion | Dictionary and index |
| 17 | languages | `UNIT`-joined, comma-separated within |
| 18 | coordinates | Polyline |
| 19 | time zone table | `UNIT`-joined, fields separated by `\|` |
| 20 | time zone indices | `UNIT`-joined, comma-separated base36 |

Column 19 holds the 423 distinct time zones once. Each country stores indices into it. v1 repeated the full object for every country that observed a zone.

### states/&lt;iso2&gt;.ts

209 KB across all countries, about 840 bytes each:

| Column | Contents |
| --- | --- |
| 0 | State names, `UNIT`-joined |
| 1 | Subdivision codes, `UNIT`-joined |
| 2 | Coordinates, polyline |
| 3 | Null-coordinate mask, base36 |

### cities/&lt;iso2&gt;.ts

3.05 MB across all countries, from 160 bytes to 396 KB each:

| Column | Contents |
| --- | --- |
| 0 | City names, `GROUP`-joined within a state, `UNIT`-joined between states |
| 1 | Coordinates, polyline, in state order |
| 2 | Null-coordinate mask, base36 |

The grouping in column 0 ties each city to its state: group *n* belongs to state *n* of the same country, so no per-city state code is stored. Decoding cities therefore also loads that country's states module, which is small.

The same grouping builds the per-state index that `getCities(country, state)` reads, so narrowing to a state costs a map lookup rather than a scan. Because the index keys on uppercase subdivision codes, the encoder asserts those are unique within each country.

Only the 192 countries that have city data get a module.

### translations.ts

53 KB. Column 0 is the comma-separated locale list. Each following column holds one locale's values in country order. Splitting by locale rather than inlining per country keeps translation bytes out of the core table.

### state-loaders.ts and city-loaders.ts

A map from country code to `() => import('./cities/us.js')`. The import specifiers are written as literals rather than built from a template, so bundlers resolve every chunk statically and code-split them. v1's dynamic `require()` with a template literal path couldn't do this, which is why it needed Vite and Nuxt workarounds.

## Build details

Generated modules annotate their export as `string`, written as `const data: string = "..."` rather than `export default "..."`. Without the annotation, TypeScript infers the string literal type and writes the entire payload into the `.d.ts` as well, which doubles the generated payload in `dist` from 3.39 MB to 6.78 MB.

`scripts/finalize-dist.mjs` then deletes those declaration files: 446 files no consumer can reach, because the generated modules aren't in the `exports` map and no public declaration references them.

## Change the format

1. Edit the encoder in `scripts/build-data.mjs`.
2. Edit the matching decoder in `src/internal/codec.ts`, or the module that reads the column.
3. Run `npm run build:data && npm test`. The parity suite compares all 250 countries, 4,857 states, and 147,644 cities against the raw JSON.
4. Run `npm run build` to see the effect on published size.
