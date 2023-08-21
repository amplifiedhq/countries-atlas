import countriesData from '../data/atlas.json';
import { Country } from '../types/country.interface';
import { Currency } from '../types/currency.type';
import { PhoneCode } from '../types/phone-code.interface';
import { StateData } from '../types/state-data.type';
import { State } from '../types/state.interface';
import { Timezone } from '../types/timezone.type';

export class CountriesAtlas {
    private countries: Country[]

    constructor() {
        this.countries = countriesData
    }
    
    getCountries(properties?: string[]): Country[] {
        if (properties) {
            return this.countries.map(country => {
                const newCountry: Country = {};
                properties.forEach(property => {
                    newCountry[property] = country[property as keyof Country];
                });
                return newCountry;
            });
        }
        return this.countries;
    }

    find(iso2: string): Country | undefined {
        return this.countries.find(country => country.iso2?.toUpperCase() === iso2.toUpperCase())
    }

    findByIso3(iso3: string): Country | undefined {
        return this.countries.find(country => country.iso3?.toUpperCase() === iso3.toUpperCase())
    }

    // getStates(iso2: string): Promise<State[]> | undefined {
    //     const country = this.find(iso2)
    //     if (country) {
    //         return import(`../data/countries/${country.iso2?.toLowerCase()}.json`)
    //             .then(statesData => {
    //                 return statesData.states
    //             })
    //             .catch(() => {
    //                 return undefined
    //             })
    //     }
    //     return undefined
    // }

    getStates(iso2: string): State[] | undefined {
        const country = this.find(iso2)
        if (country) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const statesData = require(`../data/countries/${country.iso2?.toLowerCase()}.json`)
            return statesData.states
        }
        return undefined
    }

    // state(iso2: string, stateCode: string): Promise<State | undefined> | undefined {
    //     const country = this.find(iso2);
    //     if (country) {
    //         return import(`../data/countries/${country.iso2?.toLowerCase()}.json`)
    //             .then((statesData: StateData) => {
    //                 const state = statesData.states.find((s: State) => s.state_code?.toUpperCase() === stateCode);
    //                 return state ? state : undefined;
    //             })
    //             .catch(() => undefined);
    //     }
    //     return undefined;
    // }
    
    state(iso2: string, stateCode: string): State | undefined {
        const country = this.find(iso2);
        if (country) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const statesData = require(`../data/countries/${country.iso2?.toLowerCase()}.json`) as StateData
            const state = statesData.states.find((s: State) => s.state_code?.toUpperCase() === stateCode);
            return state ? state : undefined;
        }
        return undefined;
    }

    getTimezones(): Timezone[] {
        const timezones: Timezone[] = []
        this.countries.forEach(country => {
            country.timezones?.forEach(timezone => {
                if (!timezones.includes(timezone)) {
                    timezones.push(timezone)
                }
            })
        })
        return timezones
    }

    timezone(iso2: string): Timezone[] | undefined {
        const country = this.find(iso2)
        if (country) {
            return country.timezones
        }
        return undefined
    }

    getCallingCodes(): PhoneCode[] {
        return this.getCountries(['name', 'phone', 'iso2']).map(country => {
            return {
                ...country,
                phone_code: `+${country.phone}`,
                flag: `flag flag-${country.iso2?.toLowerCase()}`
            }
        }) as PhoneCode[]
    }

    callingCode(iso2: string): PhoneCode | undefined {
        const country = this.find(iso2)
        if (country) {
            return {
                name: country.name as string,
                phone: country.phone as string | number,
                iso2: country.iso2 as string,
                phone_code: `+${country.phone}`,
                flag: `flag flag-${country.iso2?.toLowerCase()}`
            }
        }
        return undefined
    }

    getCurrencies(): Currency[] {
        return this.getCountries(['name', 'iso2', 'currency', 'currency_symbol', 'currency_name']).map(country => {
            return {
                ...country,
                flag: `flag flag-${country.iso2?.toLowerCase()}`
            }
        }) as Currency[]
    }

    currency(iso2: string): Currency[] | Currency | undefined {
        const country = this.find(iso2)
        if (country) {
            return {
                name: country.name as string,
                iso2: country.iso2 as string,
                currency: country.currency as string,
                currency_symbol: country.currency_symbol as string,
                currency_name: country.currency_name as string,
                flag: `flag flag-${country.iso2?.toLowerCase()}`
            }
        }
        return undefined
    }
}

export default new CountriesAtlas()