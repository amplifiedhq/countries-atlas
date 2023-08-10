import ValidatorAtlas from '../helpers/ValidatorAtlas';

describe('ValidatorAtlas', () => {
    describe('isValidIso2', () => {
        it('should return true if the iso2 is valid', () => {
            expect(ValidatorAtlas.isValidIso2('US')).toBe(true);
        });

        it('should return false if the iso2 is invalid', () => {
            expect(ValidatorAtlas.isValidIso2('XX')).toBe(false);
        });
    });

    describe('isValidIso3', () => {
        it('should return true if the iso3 is valid', () => {
            expect(ValidatorAtlas.isValidIso3('USA')).toBe(true);
        });

        it('should return false if the iso3 is invalid', () => {
            expect(ValidatorAtlas.isValidIso3('XXX')).toBe(false);
        });
    });

    describe('isValidCurrency', () => {
        it('should return true if the currency is valid', () => {
            expect(ValidatorAtlas.isValidCurrency('USD')).toBe(true);
        });

        it('should return false if the currency is invalid', () => {
            expect(ValidatorAtlas.isValidCurrency('XXX')).toBe(false);
        });
    });

    describe('isValidTimezone', () => {
        it('should return true if the timezone is valid', () => {
            expect(ValidatorAtlas.isValidTimezone('America/New_York')).toBe(true);
        });

        it('should return false if the timezone is invalid', () => {
            expect(ValidatorAtlas.isValidTimezone('XXX')).toBe(false);
        });
    });

    describe('isValidCallingCode', () => {
        it('should return true if the calling code is valid', () => {
            expect(ValidatorAtlas.isValidCallingCode(234)).toBe(true);
        });

        it('should return false if the calling code is invalid', () => {
            expect(ValidatorAtlas.isValidCallingCode(999)).toBe(false);
        });
    });

    describe('isValidStateCode', () => {
        it('should return true if the state code is valid', () => {
            expect(ValidatorAtlas.isValidStateCode('US', 'NY')).toBe(true);
        });

        it('should return false if the state code is invalid', () => {
            expect(ValidatorAtlas.isValidStateCode('US', 'XX')).toBe(false);
        });
    });
});