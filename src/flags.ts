/**
 * @packageDocumentation
 * @module amplifiedhq/countries-atlas/flags
 * @author AmplifiedHQ
 * 
 * Helpers for the flag assets shipped under
 * `@amplifiedhq/countries-atlas/flags/*`.
 *
 * @example
 * ```ts
 * import '@amplifiedhq/countries-atlas/flags/css/flags.min.css';
 * import { flagClass, flagEmoji, flagUrl } from '@amplifiedhq/countries-atlas/flags';
 *
 * flagClass('US');   // 'flag flag-us'
 * flagEmoji('US');   // '🇺🇸'
 * flagUrl('US');     // 'https://flagcdn.com/us.svg'
 * ```
 */
import { flagEmojiFor } from './internal/codec.js';

/** Raster widths served by flagcdn. */
export type FlagWidth = 20 | 40 | 80 | 160 | 320 | 640 | 1280 | 2560;

/**
 * A public CDN to build flag URLs against.
 *
 * - `'flagcdn'` — smallest files, and the only source offering PNG. Serves each
 *   flag in its own official aspect ratio.
 * - `'flag-icons'` — SVG only, every flag 4:3, matching the bundled assets.
 */
export type FlagSource = 'flagcdn' | 'flag-icons';

/** Options for {@link flagUrl}. */
export interface FlagUrlOptions {
  /** Which CDN to use. Defaults to `'flagcdn'`. Ignored when `baseUrl` is set. */
  readonly source?: FlagSource;
  /** Your own origin, without a trailing slash. Takes precedence over `source`. */
  readonly baseUrl?: string;
  /** Defaults to `'svg'`. PNG is available from `'flagcdn'` and `baseUrl` only. */
  readonly format?: 'svg' | 'png';
  /** Raster width in pixels, for flagcdn PNGs. Defaults to `80`. */
  readonly width?: FlagWidth;
}

const FLAGCDN = 'https://flagcdn.com';
const FLAG_ICONS = 'https://cdn.jsdelivr.net/npm/flag-icons@7/flags/4x3';

/**
 * Returns the CSS classes for a country's flag, or an empty string for an
 * invalid code. Requires `flags/css/flags.min.css`.
 *
 * @param iso2 - ISO 3166-1 alpha-2 code, case-insensitive.
 */
export function flagClass(iso2: string): string {
  return isAlpha2(iso2) ? `flag flag-${iso2.toLowerCase()}` : '';
}

/**
 * Returns the flag as a regional indicator emoji, or an empty string for an
 * invalid code. Windows renders the letters rather than a flag.
 *
 * @param iso2 - ISO 3166-1 alpha-2 code, case-insensitive.
 */
export function flagEmoji(iso2: string): string {
  return isAlpha2(iso2) ? flagEmojiFor(iso2) : '';
}

/**
 * Builds a URL for a country's flag image, or an empty string for an invalid
 * code.
 *
 * To self-host, copy this package's `flags/svg/` into your static directory and
 * pass its path as `baseUrl`. The filenames are already lowercase alpha-2 codes.
 *
 * @param iso2 - ISO 3166-1 alpha-2 code, case-insensitive.
 * @param options - Source, origin, format, and width.
 *
 * @example
 * ```ts
 * flagUrl('US');                                 // https://flagcdn.com/us.svg
 * flagUrl('US', { source: 'flag-icons' });       // 4:3
 * flagUrl('US', { baseUrl: '/static/flags' });   // /static/flags/us.svg
 * flagUrl('US', { format: 'png', width: 160 });  // https://flagcdn.com/w160/us.png
 * ```
 */
export function flagUrl(iso2: string, options: FlagUrlOptions = {}): string {
  if (!isAlpha2(iso2)) return '';

  const code = iso2.toLowerCase();
  const { source = 'flagcdn', baseUrl, format = 'svg', width = 80 } = options;

  if (baseUrl !== undefined) {
    return `${trimSlash(baseUrl)}/${code}.${format === 'png' ? 'png' : 'svg'}`;
  }
  if (source === 'flag-icons') {
    return `${FLAG_ICONS}/${code}.svg`;
  }
  return format === 'png' ? `${FLAGCDN}/w${width}/${code}.png` : `${FLAGCDN}/${code}.svg`;
}

function isAlpha2(code: string): boolean {
  return typeof code === 'string' && /^[a-z]{2}$/i.test(code);
}

function trimSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
