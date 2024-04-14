import CountriesAtlas from './CountriesAtlas';

class ValidatorAtlas {
    /**
     * Validate ISO2 code.
     * 
     * @param {string} iso2 - ISO2 code of the country.
     * @returns {boolean} - True if valid, false otherwise.
     */
    static isValidIso2(iso2: string): boolean {
        return !!CountriesAtlas.find(iso2);
    }

    /**
     * Validate ISO3 code.
     * 
     * @param {string} iso3 - ISO3 code of the country.
     * @returns {boolean} - True if valid, false otherwise.
     */
    static isValidIso3(iso3: string): boolean {
        return !!CountriesAtlas.findByIso3(iso3);
    }

    /**
     * Validate currency code.
     * 
     * @param {string} currency - Currency code.
     * @returns {boolean} - True if valid, false otherwise.
     */
    static isValidCurrency(currency: string): boolean {
        return CountriesAtlas.getCountries(['currency']).some(country => country.currency === currency);
    }

    /**
     * Validate timezone.
     * 
     * @param {string} timezone - Timezone.
     * @returns {boolean} - True if valid, false otherwise.
     */
    static isValidTimezone(timezone: string): boolean {
        return CountriesAtlas.getTimezones().some(tz => tz.zoneName === timezone);
    }

    /**
     * Validate calling code.
     * 
     * @param {string|number} callingCode - Calling code.
     * @returns {boolean} - True if valid, false otherwise.
     */
    static isValidCallingCode(callingCode: string|number): boolean {
        return CountriesAtlas.getCallingCodes().some(code => code.phone === callingCode);
    }

    // static async isValidStateCode(iso2: string, stateCode: string): Promise<boolean> {
    //     return !!(await CountriesAtlas.state(iso2, stateCode));
    // }
    
    /**
     * Validate state code.
     * 
     * @param {string} iso2 - ISO2 code of the country.
     * @param {string} stateCode - State code.
     * @returns {Promise<boolean>} - True if valid, false otherwise.
     */
    static async isValidStateCode(iso2: string, stateCode: string): Promise<boolean> {
        return !!(await CountriesAtlas.state(iso2, stateCode));
    }
}

export default ValidatorAtlas;

