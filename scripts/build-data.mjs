/**
 * Generates the packed data modules in `src/generated/` from the raw JSON in
 * `data/`. Format is documented in docs/DATA-FORMAT.md; the decoder in
 * src/internal/codec.ts must stay in sync with the encoders here.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { validate } from './validate-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const OUT = join(ROOT, 'src', 'generated');

const COL = '\x1e';
const UNIT = '\x1f';
const GROUP = '\n';

const B36 = '0123456789abcdefghijklmnopqrstuvwxyz';

function toBase36(n) {
  if (n === 0) return '0';
  let s = '';
  let v = Math.abs(n);
  while (v > 0) {
    s = B36[v % 36] + s;
    v = Math.floor(v / 36);
  }
  return n < 0 ? '-' + s : s;
}

function polylineNumber(value) {
  let v = value < 0 ? ~(value << 1) : value << 1;
  let out = '';
  while (v >= 0x20) {
    out += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }
  return out + String.fromCharCode(v + 63);
}

// Nulls are written as 0/0 and recorded in the accompanying null mask.
function encodeCoords(pairs) {
  let out = '';
  let prevLat = 0;
  let prevLon = 0;
  for (const [lat, lon] of pairs) {
    const iLat = lat == null ? 0 : Math.round(Number(lat) * 1e5);
    const iLon = lon == null ? 0 : Math.round(Number(lon) * 1e5);
    out += polylineNumber(iLat - prevLat) + polylineNumber(iLon - prevLon);
    prevLat = iLat;
    prevLon = iLon;
  }
  return out;
}

function encodeNullMask(pairs) {
  const idx = [];
  pairs.forEach(([lat, lon], i) => {
    if (lat == null || lon == null) idx.push(i);
  });
  return idx.map(toBase36).join(',');
}

function dictionary(values) {
  const uniq = [...new Set(values)];
  const lookup = new Map(uniq.map((v, i) => [v, i]));
  return {
    dict: uniq.join(UNIT),
    index: values.map((v) => toBase36(lookup.get(v))).join(','),
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(`[build-data] ${message}`);
}

function assertClean(values, label, { allowEmpty = true } = {}) {
  for (const v of values) {
    if (v == null) {
      assert(allowEmpty, `${label} is null, which encodes indistinguishably from ""`);
      continue;
    }
    const s = String(v);
    assert(
      !s.includes(COL) && !s.includes(UNIT) && !s.includes(GROUP),
      `${label} contains a reserved separator: ${JSON.stringify(s)}`
    );
    assert(
      allowEmpty || s !== '',
      `${label} is empty, which shifts every later value in its column`
    );
  }
}

function assertFiniteCoords(pairs, label) {
  for (const [lat, lon] of pairs) {
    for (const [v, axis] of [
      [lat, 'latitude'],
      [lon, 'longitude'],
    ]) {
      if (v == null) continue;
      const n = Number(v);
      assert(Number.isFinite(n), `${label} has a non-numeric ${axis}: ${JSON.stringify(v)}`);
      const limit = axis === 'latitude' ? 90 : 180;
      assert(Math.abs(n) <= limit, `${label} has ${axis} out of range: ${n}`);
    }
  }
}

validate();

const atlas = JSON.parse(readFileSync(join(DATA, 'atlas.json'), 'utf8'));
atlas.sort((a, b) => a.iso2.localeCompare(b.iso2));

function buildCore() {
  const iso2 = atlas.map((c) => c.iso2);

  const zoneByName = new Map();
  for (const c of atlas) {
    for (const tz of c.timezones ?? []) {
      const existing = zoneByName.get(tz.zoneName);
      if (existing) {
        assert(
          existing.gmtOffset === tz.gmtOffset &&
            existing.abbreviation === tz.abbreviation &&
            existing.tzName === tz.tzName,
          `timezone ${tz.zoneName} has conflicting definitions`
        );
      } else {
        zoneByName.set(tz.zoneName, tz);
      }
    }
  }
  const zones = [...zoneByName.values()];
  assertClean(
    zones.flatMap((z) => [z.zoneName, z.abbreviation, z.tzName]),
    'timezone'
  );
  const zoneIndex = new Map(zones.map((z, i) => [z.zoneName, i]));

  // The name and symbol describe only the first of a country's currency codes.
  const primaryCurrency = atlas.map((c) => String(c.currency ?? '').split(',')[0]);
  assert(
    primaryCurrency.every((code) => code.length === 3 || code === ''),
    'every primary currency code must be 3 chars, or empty for no currency'
  );

  const currencyName = dictionary(atlas.map((c) => c.currency_name ?? ''));
  const currencySymbol = dictionary(atlas.map((c) => c.currency_symbol ?? ''));
  const continent = dictionary(atlas.map((c) => c.continent ?? ''));
  const region = dictionary(atlas.map((c) => c.region ?? ''));
  const subregion = dictionary(atlas.map((c) => c.subregion ?? ''));

  const columns = [
    iso2.join(''), // 0  fixed width 2
    atlas.map((c) => c.iso3).join(''), // 1  fixed width 3
    atlas.map((c) => c.name).join(UNIT), // 2
    atlas.map((c) => c.native ?? '').join(UNIT), // 3
    atlas.map((c) => c.capital ?? '').join(UNIT), // 4
    atlas.map((c) => String(c.phone ?? '')).join(UNIT), // 5
    primaryCurrency.join(UNIT), // 6
    currencySymbol.dict, // 7
    currencySymbol.index, // 8
    currencyName.dict, // 9
    currencyName.index, // 10
    continent.dict, // 11
    continent.index, // 12
    region.dict, // 13
    region.index, // 14
    subregion.dict, // 15
    subregion.index, // 16
    atlas.map((c) => c.languages ?? '').join(UNIT), // 17
    encodeCoords(atlas.map((c) => [c.latitude, c.longitude])), // 18
    // 19 timezone dictionary: zoneName|gmtOffset|abbreviation|tzName
    zones.map((z) => [z.zoneName, z.gmtOffset, z.abbreviation, z.tzName].join('|')).join(UNIT),
    // 20 per-country zone indices
    atlas
      .map((c) => (c.timezones ?? []).map((t) => toBase36(zoneIndex.get(t.zoneName))).join(','))
      .join(UNIT),
  ];

  return { payload: columns.join(COL), zoneCount: zones.length };
}

function buildTranslations() {
  const locales = [...new Set(atlas.flatMap((c) => Object.keys(c.translations ?? {})))].sort();
  assertClean(
    atlas.flatMap((c) => Object.values(c.translations ?? {})),
    'translation'
  );
  const columns = [
    locales.join(','),
    ...locales.map((loc) => atlas.map((c) => c.translations?.[loc] ?? '').join(UNIT)),
  ];
  return columns.join(COL);
}

function buildCountryChunks() {
  const files = readdirSync(join(DATA, 'countries')).filter((f) => f.endsWith('.json'));

  // Every country must have a subdivision file, and every file a country.
  const present = new Set(files.map((f) => f.replace(/\.json$/, '').toLowerCase()));
  const expected = new Set(atlas.map((c) => c.iso2.toLowerCase()));
  const missing = [...expected].filter((c) => !present.has(c)).sort();
  const orphans = [...present].filter((c) => !expected.has(c)).sort();
  assert(missing.length === 0, `country with no data/countries file: ${missing.join(', ')}`);
  assert(orphans.length === 0, `data/countries file with no country: ${orphans.join(', ')}`);
  const states = new Map();
  const cities = new Map();
  let totalStates = 0;
  let totalCities = 0;

  for (const file of files.sort()) {
    const code = file.replace(/\.json$/, '').toLowerCase();
    const parsed = JSON.parse(readFileSync(join(DATA, 'countries', file), 'utf8'));
    const list = parsed.states ?? [];
    totalStates += list.length;

    assertClean(
      list.map((s) => s.name),
      `state name in ${file}`,
      { allowEmpty: false }
    );
    assertClean(
      list.map((s) => s.state_code),
      `state code in ${file}`,
      { allowEmpty: false }
    );
    assertFiniteCoords(
      list.map((s) => [s.latitude, s.longitude]),
      `state in ${file}`
    );

    // The runtime indexes states and cities by uppercase code.
    const codes = list.map((s) => (s.state_code ?? '').toUpperCase());
    assert(
      new Set(codes).size === codes.length,
      `duplicate state codes in ${file}: ${codes.filter((c, i) => codes.indexOf(c) !== i).join(', ')}`
    );

    states.set(
      code,
      [
        list.map((s) => s.name).join(UNIT),
        list.map((s) => s.state_code ?? '').join(UNIT),
        encodeCoords(list.map((s) => [s.latitude, s.longitude])),
        encodeNullMask(list.map((s) => [s.latitude, s.longitude])),
      ].join(COL)
    );

    const cityNames = [];
    const cityPairs = [];
    for (const s of list) {
      const own = s.cities ?? [];
      totalCities += own.length;
      assertClean(
        own.map((c) => c.name),
        `city name in ${file}`,
        { allowEmpty: false }
      );
      assertFiniteCoords(
        own.map((c) => [c.latitude, c.longitude]),
        `city in ${file}`
      );
      cityNames.push(own.map((c) => c.name).join(GROUP));
      for (const c of own) cityPairs.push([c.latitude, c.longitude]);
    }

    if (totalOf(cityNames) > 0) {
      cities.set(
        code,
        [cityNames.join(UNIT), encodeCoords(cityPairs), encodeNullMask(cityPairs)].join(COL)
      );
    }
  }

  return { states, cities, totalStates, totalCities };
}

function totalOf(groups) {
  return groups.reduce((n, g) => n + (g === '' ? 0 : g.split(GROUP).length), 0);
}

const BANNER = '// Generated by scripts/build-data.mjs. Do not edit.\n';

function emit(relPath, payload) {
  const full = join(OUT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  // The `: string` annotation is load-bearing. Without it TypeScript infers the
  // string literal type and writes the entire payload into the .d.ts as well,
  // doubling the published size.
  writeFileSync(
    full,
    `${BANNER}const data: string = ${JSON.stringify(payload)};\nexport default data;\n`,
    'utf8'
  );
  return Buffer.byteLength(payload, 'utf8');
}

function mb(bytes) {
  return `${(bytes / 1e6).toFixed(2)} MB`;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const core = buildCore();
const coreBytes = emit('core.ts', core.payload);
const translations = buildTranslations();
const translationBytes = emit('translations.ts', translations);

const { states, cities, totalStates, totalCities } = buildCountryChunks();

let stateBytes = 0;
for (const [code, payload] of states) stateBytes += emit(`states/${code}.ts`, payload);

let cityBytes = 0;
for (const [code, payload] of cities) cityBytes += emit(`cities/${code}.ts`, payload);

// Import specifiers are literals so bundlers can resolve every chunk statically.
function emitLoader(name, keys, dir) {
  // A Map, not an object literal: `loaders['__proto__']` on a literal returns
  // Object.prototype instead of undefined, which crashes the caller.
  const entries = keys
    .map((code) => `  ['${code}', () => import('./${dir}/${code}.js')],`)
    .join('\n');
  writeFileSync(
    join(OUT, `${name}.ts`),
    `${BANNER}type Loader = () => Promise<{ default: string }>;\n\n` +
      `const loaders = new Map<string, Loader>([\n${entries}\n]);\n\n` +
      `export default loaders;\n`,
    'utf8'
  );
}

emitLoader('state-loaders', [...states.keys()], 'states');
emitLoader('city-loaders', [...cities.keys()], 'cities');

const gzipped = [core.payload, translations, ...states.values(), ...cities.values()].reduce(
  (n, p) => n + gzipSync(Buffer.from(p), { level: 9 }).length,
  0
);

const total = coreBytes + translationBytes + stateBytes + cityBytes;
console.log('packed data written to src/generated/');
console.log(`  core          ${String(atlas.length).padStart(7)} countries   ${mb(coreBytes)}`);
console.log(`  timezones     ${String(core.zoneCount).padStart(7)} zones`);
console.log(`  translations                      ${mb(translationBytes)}`);
console.log(`  states        ${String(totalStates).padStart(7)} rows        ${mb(stateBytes)}`);
console.log(`  cities        ${String(totalCities).padStart(7)} rows        ${mb(cityBytes)}`);
console.log(`  ------------------------------------------`);
console.log(`  total                             ${mb(total)}  (${mb(gzipped)} gzipped)`);
