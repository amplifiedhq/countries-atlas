/**
 * @packageDocumentation
 * @module amplifiedhq/countries-atlas/states
 * @author AmplifiedHQ
 * 
 * States and provinces, loaded on demand per country.
 *
 * @example
 * ```ts
 * import { getStates, getState } from '@amplifiedhq/countries-atlas/states';
 *
 * await getStates('US');
 * await getState('US', 'CA');
 * ```
 */
import loaders from './generated/state-loaders.js';
import { key } from './internal/countries.js';
import { columns, decodeCoords, nullSet, values } from './internal/codec.js';
import type { State } from './types.js';

export type { State } from './types.js';

interface Index {
  readonly list: readonly State[];
  readonly byCode: ReadonlyMap<string, State>;
}

const cache = new Map<string, Index>();
// Concurrent first calls for the same country must share one decode, or each
// caller gets a different array and reference equality breaks.
const inFlight = new Map<string, Promise<Index | undefined>>();

function decode(payload: string): Index {
  const col = columns(payload);
  const names = values(col[0]);
  const codes = values(col[1]);
  const coords = decodeCoords(col[2]);
  const missing = nullSet(col[3]);

  const list: State[] = new Array(names.length);
  const byCode = new Map<string, State>();

  for (let i = 0; i < names.length; i++) {
    const absent = missing.has(i);
    const state = Object.freeze<State>({
      code: codes[i],
      name: names[i],
      latitude: absent ? null : coords[i][0],
      longitude: absent ? null : coords[i][1],
    });
    list[i] = state;
    byCode.set(state.code.toUpperCase(), state);
  }

  return { list: Object.freeze(list), byCode };
}

async function indexOf(countryCode: string): Promise<Index | undefined> {
  const code = key(countryCode).toLowerCase();
  const cached = cache.get(code);
  if (cached !== undefined) return cached;

  const pending = inFlight.get(code);
  if (pending !== undefined) return pending;

  const load = loaders.get(code);
  if (load === undefined) return undefined;

  const task = load()
    .then((module) => {
      const decoded = decode(module.default);
      cache.set(code, decoded);
      return decoded;
    })
    .finally(() => inFlight.delete(code));

  inFlight.set(code, task);
  return task;
}

/**
 * Returns every state of a country, ordered as in the source dataset.
 *
 * @param countryCode - ISO 3166-1 alpha-2 code, case-insensitive.
 * @returns The states, or an empty array when the country is unknown or has no
 *   subdivisions. Call `isValidCountryCode` to tell those apart.
 */
export async function getStates(countryCode: string): Promise<readonly State[]> {
  return (await indexOf(countryCode))?.list ?? EMPTY;
}

/**
 * Returns one state by subdivision code, or `undefined`.
 *
 * @param countryCode - ISO 3166-1 alpha-2 code, case-insensitive.
 * @param stateCode - Subdivision code, case-insensitive.
 */
export async function getState(
  countryCode: string,
  stateCode: string
): Promise<State | undefined> {
  return (await indexOf(countryCode))?.byCode.get(key(stateCode));
}

const EMPTY: readonly State[] = Object.freeze([]);
