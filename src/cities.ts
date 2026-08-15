/**
 * @packageDocumentation
 * @module amplifiedhq/countries-atlas/cities
 * @author AmplifiedHQ
 *
 * Cities and towns, loaded on demand per country.
 *
 * @example
 * ```ts
 * import { getCities } from '@amplifiedhq/countries-atlas/cities';
 *
 * await getCities('AD');
 * await getCities('US', 'CA');
 * ```
 */
import loaders from './generated/city-loaders.js';
import { key } from './internal/countries.js';
import { GROUP, columns, decodeCoords, nullSet, values } from './internal/codec.js';
import { getStates } from './states.js';
import type { City, State } from './types.js';

export type { City } from './types.js';

interface Index {
  readonly list: readonly City[];
  readonly byState: ReadonlyMap<string, readonly City[]>;
}

const cache = new Map<string, Index>();
// Concurrent first calls for the same country must share one decode, or each
// caller gets a different array and reference equality breaks.
const inFlight = new Map<string, Promise<Index | undefined>>();

/**
 * The packed format already groups cities by state, so the per-state index
 * costs nothing beyond this pass.
 */
function decode(payload: string, states: readonly State[]): Index {
  const col = columns(payload);
  const groups = values(col[0]);
  const coords = decodeCoords(col[1]);
  const missing = nullSet(col[2]);

  const list: City[] = [];
  const byState = new Map<string, readonly City[]>();
  let n = 0;

  for (let g = 0; g < groups.length; g++) {
    const group = groups[g];
    if (group === '') continue;

    const stateCode = states[g]?.code ?? '';
    const names = group.split(GROUP);
    const inState: City[] = new Array(names.length);

    for (let j = 0; j < names.length; j++) {
      const i = n++;
      const absent = missing.has(i);
      const city = Object.freeze<City>({
        name: names[j],
        stateCode,
        latitude: absent ? null : coords[i][0],
        longitude: absent ? null : coords[i][1],
      });
      inState[j] = city;
      list.push(city);
    }

    byState.set(stateCode.toUpperCase(), Object.freeze(inState));
  }

  return { list: Object.freeze(list), byState };
}

/**
 * Returns the cities of a country, optionally narrowed to one state. Both forms
 * are constant time after the country's first load.
 *
 * @param countryCode - ISO 3166-1 alpha-2 code, case-insensitive.
 * @param stateCode - Optional subdivision code, case-insensitive.
 * @returns The cities, ordered by state then as in the source dataset, or an
 *   empty array when the country or state is unknown.
 */
export async function getCities(countryCode: string, stateCode?: string): Promise<readonly City[]> {
  const index = await indexOf(countryCode);
  if (index === undefined) return EMPTY;

  if (stateCode === undefined) return index.list;
  return index.byState.get(key(stateCode)) ?? EMPTY;
}

async function indexOf(countryCode: string): Promise<Index | undefined> {
  const code = key(countryCode).toLowerCase();
  const cached = cache.get(code);
  if (cached !== undefined) return cached;

  const pending = inFlight.get(code);
  if (pending !== undefined) return pending;

  const load = loaders.get(code);
  if (load === undefined) return undefined;

  const task = Promise.all([load(), getStates(code)])
    .then(([payload, states]) => {
      const decoded = decode(payload.default, states);
      cache.set(code, decoded);
      return decoded;
    })
    .finally(() => inFlight.delete(code));

  inFlight.set(code, task);
  return task;
}

const EMPTY: readonly City[] = Object.freeze([]);
