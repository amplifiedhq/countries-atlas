import payload from '../generated/core.js';
import type { Country, Timezone } from '../types.js';
import {
  base36List,
  columns,
  decodeCoords,
  fixed,
  flagEmojiFor,
  formatUtcOffset,
  values,
} from './codec.js';

interface Table {
  readonly all: readonly Country[];
  readonly byIso2: ReadonlyMap<string, Country>;
  readonly byIso3: ReadonlyMap<string, Country>;
  readonly timezones: readonly Timezone[];
}

let table: Table | undefined;

function build(): Table {
  const col = columns(payload);

  const iso2 = fixed(col[0], 2);
  const iso3 = fixed(col[1], 3);
  const names = values(col[2]);
  const natives = values(col[3]);
  const capitals = values(col[4]);
  const phones = values(col[5]);
  const currencyCodes = values(col[6]);

  const symbolDict = values(col[7]);
  const symbolIdx = base36List(col[8]);
  const currencyNameDict = values(col[9]);
  const currencyNameIdx = base36List(col[10]);
  const continentDict = values(col[11]);
  const continentIdx = base36List(col[12]);
  const regionDict = values(col[13]);
  const regionIdx = base36List(col[14]);
  const subregionDict = values(col[15]);
  const subregionIdx = base36List(col[16]);

  const languages = values(col[17]);
  const coords = decodeCoords(col[18]);

  const timezones: Timezone[] = values(col[19]).map((entry) => {
    const [name, offset, abbreviation, description] = entry.split('|');
    const utcOffset = Number(offset);
    return Object.freeze({
      name,
      utcOffset,
      utcOffsetName: formatUtcOffset(utcOffset),
      abbreviation,
      description,
    });
  });
  const zoneIdx = values(col[20]);

  const all = iso2.map((code, i) =>
    Object.freeze<Country>({
      iso2: code,
      iso3: iso3[i],
      name: names[i],
      nativeName: natives[i],
      capital: capitals[i],
      callingCodes: Object.freeze(phones[i] === '' ? [] : phones[i].split(',')),
      currency: Object.freeze({
        code: currencyCodes[i],
        name: currencyNameDict[currencyNameIdx[i]],
        symbol: symbolDict[symbolIdx[i]],
      }),
      continent: continentDict[continentIdx[i]],
      region: regionDict[regionIdx[i]],
      subregion: subregionDict[subregionIdx[i]],
      languages: Object.freeze(languages[i] === '' ? [] : languages[i].split(',')),
      latitude: coords[i][0],
      longitude: coords[i][1],
      emoji: flagEmojiFor(code),
      timezones: Object.freeze(base36List(zoneIdx[i]).map((z) => timezones[z])),
    })
  );

  return {
    all: Object.freeze(all),
    byIso2: new Map(all.map((c) => [c.iso2, c])),
    byIso3: new Map(all.map((c) => [c.iso3, c])),
    timezones: Object.freeze(timezones),
  };
}

export function load(): Table {
  if (table === undefined) table = build();
  return table;
}

export function key(code: string): string {
  return typeof code === 'string' ? code.trim().toUpperCase() : '';
}
