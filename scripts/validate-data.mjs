/**
 * Every invariant the data in `data/` and `flags/` must satisfy, in one place.
 * `build-data.mjs` and `build-flags.mjs` both call `validate()` before
 * generating anything; `npm run validate` runs it on its own.
 *
 * Most rules exist because the packed format encodes fields into shared,
 * delimited columns: a value that is empty, null, or contains a separator does
 * not corrupt one record, it shifts every later record in that column.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');
const FLAGS = join(ROOT, 'flags', 'svg');

const COL = '\x1e';
const UNIT = '\x1f';
const GROUP = '\n';

const problems = [];

function check(condition, message) {
  if (!condition) problems.push(message);
}

function checkClean(value, label, { allowEmpty = true } = {}) {
  if (value == null) {
    check(allowEmpty, `${label} is null, which encodes indistinguishably from ""`);
    return;
  }
  const s = String(value);
  check(
    !s.includes(COL) && !s.includes(UNIT) && !s.includes(GROUP),
    `${label} contains a reserved separator: ${JSON.stringify(s)}`
  );
  check(allowEmpty || s !== '', `${label} is empty, which shifts every later value in its column`);
}

function checkCoords(lat, lon, label) {
  for (const [value, axis, limit] of [
    [lat, 'latitude', 90],
    [lon, 'longitude', 180],
  ]) {
    if (value == null) continue;
    const n = Number(value);
    check(Number.isFinite(n), `${label} has a non-numeric ${axis}: ${JSON.stringify(value)}`);
    check(!Number.isFinite(n) || Math.abs(n) <= limit, `${label} has ${axis} out of range: ${n}`);
  }
}

function flagEmojiFor(iso2) {
  return String.fromCodePoint(...[...iso2].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/**
 * @returns counts of everything checked.
 * @throws listing every problem found, not just the first.
 */
export function validate() {
  problems.length = 0;

  const atlas = JSON.parse(readFileSync(join(DATA, 'atlas.json'), 'utf8'));
  const countryFiles = readdirSync(join(DATA, 'countries')).filter((f) => f.endsWith('.json'));
  const flagFiles = readdirSync(FLAGS).filter((f) => f.endsWith('.svg'));

  check(new Set(atlas.map((c) => c.iso2)).size === atlas.length, 'duplicate iso2 codes');
  check(new Set(atlas.map((c) => c.iso3)).size === atlas.length, 'duplicate iso3 codes');

  for (const c of atlas) {
    const at = `country ${c.iso2}`;
    check(/^[A-Z]{2}$/.test(c.iso2 ?? ''), `${at}: iso2 must be two uppercase letters`);
    check(/^[A-Z]{3}$/.test(c.iso3 ?? ''), `${at}: iso3 must be three uppercase letters`);
    check(c.code === c.iso2, `${at}: \`code\` diverges from \`iso2\`, which the build drops`);
    check(typeof c.languages === 'string', `${at}: \`languages\` must be a comma-joined string`);

    const currency = String(c.currency ?? '').split(',')[0];
    check(
      /^[A-Z]{3}$/.test(currency) || currency === '',
      `${at}: primary currency must be three letters, or empty for none`
    );
    check(c.emoji === flagEmojiFor(c.iso2), `${at}: emoji does not match its country code`);

    for (const field of [
      'name',
      'native',
      'capital',
      'currency_symbol',
      'currency_name',
      'iso2',
      'iso3',
      'currency',
      'languages',
      'phone',
    ]) {
      checkClean(c[field], `${at}: ${field}`);
    }
    checkCoords(c.latitude, c.longitude, at);

    for (const tz of c.timezones ?? []) {
      checkClean(tz.zoneName, `${at}: timezone name`, { allowEmpty: false });
      checkClean(tz.abbreviation, `${at}: timezone abbreviation`);
      checkClean(tz.tzName, `${at}: timezone description`);
    }
    for (const [locale, value] of Object.entries(c.translations ?? {})) {
      checkClean(value, `${at}: translation ${locale}`);
    }
  }

  // A zone is stored once and referenced by index, so every country that
  // observes it must describe it identically.
  const zones = new Map();
  for (const c of atlas) {
    for (const tz of c.timezones ?? []) {
      const seen = zones.get(tz.zoneName);
      if (!seen) zones.set(tz.zoneName, tz);
      else {
        check(
          seen.gmtOffset === tz.gmtOffset &&
            seen.abbreviation === tz.abbreviation &&
            seen.tzName === tz.tzName,
          `timezone ${tz.zoneName} is defined differently in ${c.iso2}`
        );
      }
    }
  }

  const expected = new Set(atlas.map((c) => c.iso2.toLowerCase()));
  const present = new Set(countryFiles.map((f) => f.replace(/\.json$/, '').toLowerCase()));
  const flags = new Set(flagFiles.map((f) => f.replace(/\.svg$/, '').toLowerCase()));

  for (const c of [...expected].filter((c) => !present.has(c)).sort()) {
    check(false, `country ${c.toUpperCase()} has no data/countries/${c}.json`);
  }
  for (const c of [...present].filter((c) => !expected.has(c)).sort()) {
    check(false, `data/countries/${c}.json has no matching country`);
  }
  for (const c of [...expected].filter((c) => !flags.has(c)).sort()) {
    check(false, `country ${c.toUpperCase()} has no flags/svg/${c}.svg`);
  }
  for (const f of [...flags].filter((f) => !expected.has(f)).sort()) {
    check(false, `flags/svg/${f}.svg has no matching country`);
  }

  let stateCount = 0;
  let cityCount = 0;

  for (const file of countryFiles.sort()) {
    const states = JSON.parse(readFileSync(join(DATA, 'countries', file), 'utf8')).states ?? [];
    stateCount += states.length;

    const codes = states.map((s) => (s.state_code ?? '').toUpperCase());
    const duplicated = [...new Set(codes.filter((c, i) => codes.indexOf(c) !== i))];
    check(
      duplicated.length === 0,
      `${file}: duplicate state codes would drop rows from the index: ${duplicated.join(', ')}`
    );

    for (const s of states) {
      checkClean(s.name, `${file}: state name`, { allowEmpty: false });
      checkClean(s.state_code, `${file}: state code`, { allowEmpty: false });
      checkCoords(s.latitude, s.longitude, `${file}: state ${s.state_code}`);

      for (const c of s.cities ?? []) {
        cityCount++;
        checkClean(c.name, `${file}: city name in ${s.state_code}`, { allowEmpty: false });
        checkCoords(c.latitude, c.longitude, `${file}: city ${c.name}`);
      }
    }
  }

  if (problems.length > 0) {
    const shown = problems
      .slice(0, 20)
      .map((p) => `  - ${p}`)
      .join('\n');
    const more = problems.length > 20 ? `\n  ...and ${problems.length - 20} more` : '';
    throw new Error(`data validation failed with ${problems.length} problem(s):\n${shown}${more}`);
  }

  return {
    countries: atlas.length,
    states: stateCount,
    cities: cityCount,
    timezones: zones.size,
    flags: flags.size,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const s = validate();
  console.log(
    `data is in sync: ${s.countries} countries, ${s.states} states, ` +
      `${s.cities} cities, ${s.timezones} timezones, ${s.flags} flags`
  );
}
