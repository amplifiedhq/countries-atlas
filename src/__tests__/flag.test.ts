import fs from 'fs'
import path from 'path'
import CountriesAtlas  from '../helpers/CountriesAtlas';

const flag_path = path.join(__dirname, '../../flags/svg')

describe('flag', () => {
    it('should have all flags', () => {
        const countries = CountriesAtlas.getCountries(['iso2']).map(country => country.iso2)
        const flags = fs.readdirSync(flag_path)
        const flags_iso2 = flags.map(flag => flag.split('.')[0].toUpperCase())
        const flags_iso2_filtered = flags_iso2.filter(flag => flag !== '')
        expect(countries).toEqual(expect.arrayContaining(flags_iso2_filtered))
    })
}
)