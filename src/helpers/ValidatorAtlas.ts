import CountriesAtlas from './CountriesAtlas';

class ValidatorAtlas {
    static isValidIso2(iso2: string): boolean {
        return !!CountriesAtlas.find(iso2);
    }

    static isValidIso3(iso3: string): boolean {
        return !!CountriesAtlas.findByIso3(iso3);
    }

    static isValidCurrency(currency: string): boolean {
        return CountriesAtlas.getCountries(['currency']).some(country => country.currency === currency);
    }

    static isValidTimezone(timezone: string): boolean {
        return CountriesAtlas.getTimezones().some(tz => tz.zoneName === timezone);
    }

    static isValidCallingCode(callingCode: string|number): boolean {
        return CountriesAtlas.getCallingCodes().some(code => code.phone === callingCode);
    }

    static async isValidStateCode(iso2: string, stateCode: string): Promise<boolean> {
        const state = await CountriesAtlas.state(iso2, stateCode);
        return !!state;
    }
}

export default ValidatorAtlas;

