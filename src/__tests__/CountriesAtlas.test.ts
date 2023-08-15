import countriesData from '../data/atlas.json';
import CountriesAtlas from '../helpers/CountriesAtlas';
import USAStates from '../data/countries/us.json';
import { State } from '../types/state.interface';
import { City } from '../types/city.type';

describe('CountriesAtlas', () => {
    describe('getCountries', () => {
        it('returns all countries', () => {
            const countries = CountriesAtlas.getCountries()
            expect(countries.length).toEqual(countriesData.length)
        })

        it('returns all countries with only the iso2 and name properties', () => {
            const countries = CountriesAtlas.getCountries(['iso2', 'name'])
            expect(countries.length).toEqual(countriesData.length)
            countries.forEach(country => {
                expect(country.iso2).toBeDefined()
                expect(country.name).toBeDefined()
            })
        })
    })

    describe('find', () => {
        it('returns a country by iso2', () => {
            const country = CountriesAtlas.find('US')
            expect(country).toEqual(countriesData.find(country => country.iso2 === 'US'))
        })

        it('returns a country by iso3', () => {
            const country = CountriesAtlas.findByIso3('USA')
            expect(country).toEqual(countriesData.find(country => country.iso3 === 'USA'))
        })

        it('returns undefined if no country is found', () => {
            const country = CountriesAtlas.find('XX') 
            expect(country).toBeUndefined()
        })

        it('returns proper country if iso2 is lowercase', () => {
            const country = CountriesAtlas.find('us')
            expect(country).toEqual(countriesData.find(country => country.iso2 === 'US'))
        })

        it('returns proper country if iso3 is lowercase', () => {
            const country = CountriesAtlas.findByIso3('usa')
            expect(country).toEqual(countriesData.find(country => country.iso3 === 'USA'))
        })

        it('returns chained property if property is chained', () => {
            const country = CountriesAtlas.find('us')
            expect(country?.name).toEqual('United States')
        })
    })

    describe('states', () => {
        it('returns states for a country', async () => {
            const states = await CountriesAtlas.getStates('US')
            expect(states).toBeDefined()
            expect(states?.length).toEqual(USAStates.states.length)
        })

        it('returns undefined if no country is found', async () => {
            const states = await CountriesAtlas.getStates('XX')
            expect(states).toBeUndefined()
        })
    })

    describe('state', () => {
        it('returns a state for a country', async () => {
            const state = await CountriesAtlas.state('US', 'CA')
            expect(state).toBeDefined()
            expect(state?.state_code).toEqual('CA')
        })

        it('returns undefined if no country is found', async () => {
            const state = await CountriesAtlas.state('XX', 'CA')
            expect(state).toBeUndefined()
        })

        it('returns undefined if no state is found', async () => {
            const state = await CountriesAtlas.state('US', 'XX')
            expect(state).toBeUndefined()
        })

        it('returns chained property if property is chained', async () => {
            const state = await CountriesAtlas.state('US', 'CA')
            expect(state?.name).toEqual('California')
        })

        it('returns cities if cities is chained', async () => {
            const state = await CountriesAtlas.state('US', 'CA')
            expect(state?.cities).toBeDefined() as City[]|undefined
            expect(state?.cities?.length).toEqual(USAStates.states.find((state: State) => state.state_code === 'CA')?.cities?.length)
        })
    })

    describe('getTimezones', () => {
        it('returns all timezones', () => {
            const timezones = CountriesAtlas.getTimezones()
            expect(timezones.length).toEqual(countriesData.map(country => country.timezones).flat().length)
        })
    })

    describe('timezone', () => {
        it('returns a timezone for a country', () => {
            const timezone = CountriesAtlas.timezone('US')
            expect(timezone).toEqual(countriesData.find(country => country.iso2 === 'US')?.timezones)
        })

        it('returns undefined if no timezone is found', () => {
            const timezone = CountriesAtlas.timezone('XX')
            expect(timezone).toBeUndefined()
        })
    })

    describe('getCallingCodes', () => {
        it('returns all calling codes', () => {
            const callingCodes = CountriesAtlas.getCallingCodes()
            expect(callingCodes.length).toEqual(countriesData.map(country => country.phone).length)
        })
    })

    describe('callingCode', () => {
        it('returns a calling code for a country', () => {
            const callingCode = CountriesAtlas.callingCode('US')
            expect(callingCode?.phone).toEqual(countriesData.find(country => country.iso2 === 'US')?.phone)
        })

        it('returns undefined if no calling code is found', () => {
            const callingCode = CountriesAtlas.callingCode('XX')
            expect(callingCode).toBeUndefined()
        })
    })

    describe('getCurrencies', () => {
        it('returns all currencies', () => {
            const currencies = CountriesAtlas.getCurrencies()
            expect(currencies.length).toEqual(countriesData.map(country => country.currency).length)
        })

        it('returns all currencies with only the code and name properties', () => {
            const currencies = CountriesAtlas.getCurrencies()
            expect(currencies.length).toEqual(countriesData.map(country => country.currency).length)
            currencies.forEach(currency => {
                expect(currency?.currency_symbol).toBeDefined()
                expect(currency?.name).toBeDefined()
            })
        })
    })

    describe('currency', () => {
        it('returns a currency for a country', () => {
            const currency = CountriesAtlas.currency('US')
            expect(currency).toBeDefined();
        })

        it('returns undefined if no currency is found', () => {
            const currency = CountriesAtlas.currency('XX')
            expect(currency).toBeUndefined()
        })
    })

})