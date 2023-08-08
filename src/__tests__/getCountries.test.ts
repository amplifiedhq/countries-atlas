import countriesData from '../../data/atlas.json';
import CountryData from '../helpers/getCountries';

const testCountry = countriesData[0]; // Assuming you're testing the first country

describe('CountryData', () => {
    const countryData = new CountryData(testCountry)

    it('should return correct country code', () => {
        expect(countryData.code()).toBe(testCountry.code);
    });

    it('should return correct country name', () => {
        expect(countryData.name()).toBe(testCountry.name);
    });

    it('should return correct native name', () => {
        expect(countryData.native()).toBe(testCountry.native);
    });

    it('should return correct phone code', () => {
        expect(countryData.phone()).toBe(testCountry.phone);
    });

    it('should return correct ISO2 code', () => {
        expect(countryData.iso2()).toBe(testCountry.iso2);
    });

    it('should return correct ISO3 code', () => {
        expect(countryData.iso3()).toBe(testCountry.iso3);
    });

    // Add more test cases for other methods

    it('should return correct emoji', () => {
        expect(countryData.emoji()).toBe(testCountry.emoji);
    });

    it('should return correct emojiU', () => {
        expect(countryData.emojiU()).toBe(testCountry.emojiU);
    });
});
