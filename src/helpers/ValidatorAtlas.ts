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

    static isValidCallingCode(callingCode: string): boolean {
        return CountriesAtlas.getCallingCodes().some(code => code.phone === callingCode);
    }

    static isValidStateCode(iso2: string, stateCode: string): boolean {
        return !!CountriesAtlas.find(iso2)?.states && CountriesAtlas.find(iso2)?.states.includes(stateCode);
    }
}

export default ValidatorAtlas;

