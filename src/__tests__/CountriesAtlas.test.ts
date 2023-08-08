import countriesData from '../../data/atlas.json';
import CountriesAtlas from '../helpers/CountriesAtlas';

describe('CountriesAtlas', () => {
    describe('getCountries', () => {
        it('returns all countries', () => {
            const countries = CountriesAtlas.getCountries()
            expect(countries.length).toEqual(countriesData.length)
        })
    })

    describe('find', () => {
        it('returns a country by iso2', () => {
            const country = CountriesAtlas.find('US')
            expect(country).toEqual(countriesData.find(country => country.iso2 === 'US'))
        })
    })
})

