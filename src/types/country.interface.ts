import { Timezone } from "./timezone.type";
import { Translations } from "./translation.type";

export interface Country {
    code?: string;
    name?: string;
    native?: string;
    phone?: string|number;
    continent?: string;
    capital?: string;
    currency?: string;
    languages?: string[] | string;
    iso3?: string;
    iso2?: string;
    currency_symbol?: string;
    region?: string;
    subregion?: string;
    timezones?: Timezone[];
    translations?: Translations;
    latitude?: string;
    longitude?: string;
    emoji?: string;
    emojiU?: string;
    currency_name?: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
