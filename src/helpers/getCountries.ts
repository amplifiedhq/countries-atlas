import countriesData from '../../data/atlas.json';
import { Country } from '../types/country.interface';

class CountryData {
    private countryData: Country;

    constructor(countryData: Country) {
        this.countryData = countryData;
    }

    code(): string {
        return this.countryData.code;
    }

    name(): string {
        return this.countryData.name;
    }

    native(): string {
        return this.countryData.native;
    }

    phone(): number | string {
        return this.countryData.phone;
    }

    continent(): string {
        return this.countryData.continent;
    }

    currency(): string {
        return this.countryData.currency;
    }

    capital(): string {
        return this.countryData.capital;
    }

    languages(): string[] | string {
        return this.countryData.languages;
    }

    iso2(): string {
        return this.countryData.iso2;
    }

    iso3(): string {
        return this.countryData.iso3;
    }



    // Add more methods for other properties

    emoji(): string {
        return this.countryData.emoji;
    }

    emojiU(): string {
        return this.countryData.emojiU;
    }
}

export default CountryData;
