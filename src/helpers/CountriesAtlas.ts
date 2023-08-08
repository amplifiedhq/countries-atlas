import countriesData from '../../data/atlas.json';
import { Country } from '../types/country.interface';

export class CountriesAtlas {
    private countries: Country[]

    constructor() {
        this.countries = countriesData
    }

    getCountries(): Country[] {
        return this.countries
    }
    
    find(iso2: string): Country | undefined {
        return this.countries.find(country => country.iso2 === iso2)
    }
}

export default new CountriesAtlas()