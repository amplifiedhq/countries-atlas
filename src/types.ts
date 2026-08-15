/** ISO 4217 currency. */
export interface Currency {
  /**
   * ISO 4217 alphabetic code, such as `"EUR"`. Where the source lists several
   * codes for one country, this is the first, the one `name` and `symbol`
   * describe. Empty for Antarctica, which has no currency.
   */
  readonly code: string;
  /** English name, such as `"Euro"`. */
  readonly name: string;
  /** Display symbol, such as `"€"`. May equal `code`. */
  readonly symbol: string;
}

/** An IANA time zone. */
export interface Timezone {
  /** IANA zone name, such as `"Europe/Andorra"`. */
  readonly name: string;
  /** Offset from UTC in seconds. */
  readonly utcOffset: number;
  /** Human-readable offset, such as `"UTC+01:00"`. */
  readonly utcOffsetName: string;
  /** Short abbreviation, such as `"CET"`. */
  readonly abbreviation: string;
  /** Full name, such as `"Central European Time"`. */
  readonly description: string;
}

/** A country. */
export interface Country {
  /** ISO 3166-1 alpha-2 code, uppercase. */
  readonly iso2: string;
  /** ISO 3166-1 alpha-3 code, uppercase. */
  readonly iso3: string;
  /** English name. */
  readonly name: string;
  /** Name in the country's own language. */
  readonly nativeName: string;
  /** Capital city. Empty for territories without one. */
  readonly capital: string;
  /** E.164 calling codes without the `+`, such as `["376"]`. */
  readonly callingCodes: readonly string[];
  /** Currency in circulation. */
  readonly currency: Currency;
  /** Continent name, such as `"Europe"`. */
  readonly continent: string;
  /** UN geoscheme region, such as `"Europe"`. */
  readonly region: string;
  /** UN geoscheme subregion, such as `"Southern Europe"`. */
  readonly subregion: string;
  /** ISO 639-1 language codes, such as `["ca"]`. */
  readonly languages: readonly string[];
  /** Latitude of the country centroid, in decimal degrees. */
  readonly latitude: number;
  /** Longitude of the country centroid, in decimal degrees. */
  readonly longitude: number;
  /** Flag as a regional indicator emoji. */
  readonly emoji: string;
  /** Time zones observed by the country. */
  readonly timezones: readonly Timezone[];
}

/** A first-level administrative division: state, province, region. */
export interface State {
  /** Subdivision code as used by ISO 3166-2, such as `"CA"`. */
  readonly code: string;
  /** English name. */
  readonly name: string;
  /** Centroid latitude, or `null` when the source has none. */
  readonly latitude: number | null;
  /** Centroid longitude, or `null` when the source has none. */
  readonly longitude: number | null;
}

/** A city or town. */
export interface City {
  /** English name. */
  readonly name: string;
  /** Code of the state this city belongs to. */
  readonly stateCode: string;
  /** Latitude, or `null` when the source has none. */
  readonly latitude: number | null;
  /** Longitude, or `null` when the source has none. */
  readonly longitude: number | null;
}

/** Country name translations, keyed by the dataset's locale codes. */
export type Translations = Readonly<Record<string, string>>;
