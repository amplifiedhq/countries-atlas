export const COL = '\x1e';
export const UNIT = '\x1f';
export const GROUP = '\n';

export function columns(payload: string): string[] {
  return payload.split(COL);
}

export function values(column: string): string[] {
  return column === '' ? [] : column.split(UNIT);
}

export function fixed(column: string, width: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < column.length; i += width) out.push(column.slice(i, i + width));
  return out;
}

export function base36List(column: string): number[] {
  return column === '' ? [] : column.split(',').map((v) => parseInt(v, 36));
}

/**
 * Decodes a delta-compressed polyline into `[lat, lon]` pairs: zigzag, 5-bit
 * chunks, +63 offset, fixed at 5 decimal places. Must mirror `encodeCoords` in
 * scripts/build-data.mjs.
 */
export function decodeCoords(payload: string): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let i = 0;
  let lat = 0;
  let lon = 0;

  while (i < payload.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = payload.charCodeAt(i++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = payload.charCodeAt(i++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lon += result & 1 ? ~(result >> 1) : result >> 1;

    out.push([Math.round(lat) / 1e5, Math.round(lon) / 1e5]);
  }

  return out;
}

/** Indices whose coordinates were null in the source. */
export function nullSet(column: string): Set<number> {
  return new Set(base36List(column));
}

export function formatUtcOffset(seconds: number): string {
  // The dataset spells zero as UTC±00, not UTC+00:00.
  if (seconds === 0) return 'UTC±00';
  const sign = seconds < 0 ? '-' : '+';
  const abs = Math.abs(seconds);
  const hh = String(Math.floor(abs / 3600)).padStart(2, '0');
  const mm = String(Math.floor((abs % 3600) / 60)).padStart(2, '0');
  return `UTC${sign}${hh}:${mm}`;
}

export function flagEmojiFor(iso2: string): string {
  return String.fromCodePoint(
    ...[...iso2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}
