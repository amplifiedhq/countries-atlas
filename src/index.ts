/**
 * @packageDocumentation
 * @module amplifiedhq/countries-atlas
 * @author AmplifiedHQ
 * 
 * @description This is the main entry point for the library.
 * 
 * @license MIT
 * 
 * @example
 * import { CountriesAtlas } from '@amplifiedhq/countries-atlas';
 * 
 * const countries = CountriesAtlas.getCountries();
 * const country = CountriesAtlas.find('US');
 * 
 * @see {@link https://github.com/amplifiedhq/countries-atlas GitHub}
 * 
 * 
 */

export { default as CountriesAtlas } from './helpers/CountriesAtlas';

// export ValidatorAtlas from './helpers/ValidatorAtlas';
export { default as ValidatorAtlas } from './helpers/ValidatorAtlas';

// Export css in /flags/css/flags.css
// Export .min.css in /flags/css/flags.min.css
// Export .scss in /flags/scss/flags.scss
