# CountriesAtlas 🌎
Uncover the world with a single lightweight library - countries, codes, currencies, flags, languages, cities, and more 🌎

![GitHub license](https://img.shields.io/github/license/amplifiedhq/countries-atlas) ![npm version](https://img.shields.io/npm/v/@amplifiedhq/countries-atlas) ![npm downloads](https://img.shields.io/npm/dt/@amplifiedhq/countries-atlas) ![GitHub issues](https://img.shields.io/github/issues/amplifiedhq/countries-atlas) ![GitHub action](https://img.shields.io/github/actions/workflow/status/amplifiedhq/countries-atlas/.github/workflows/coverage.yml?branch=main)
## Installation 📦
You can install CountriesAtlas using npm registry, run the following command:
```bash
npm install @amplifiedhq/countries-atlas
```
## Features 🌟
- Rich Data Sources
    The library is based on extensive dataset from [Kaggle](https://www.kaggle.com/datasets/tanweerulhaque/countries-states-cities-dataset), which is a collection of countries, states, cities, currencies, and languages etc.
- Easy to Use
    The library is designed to be easy to use, you can get the data you want with just a few lines of code.
- Load on Demand
    The library is heavy, so we provide a way to load the data on demand, which means you can load the data you want, and the library will only load the data you need.
- Validation
    The library provides a way to validate the data, which means you can countries, iso codes, currencies, and languages etc. with ease. You can simply use the provided method in your server side code like Express.js, Nest.js, or Koa.js etc.
- Dynamic Input
    The library provides a way to get the data dynamically, which means you can use the data on your client side code like React.js, Vue.js, or Angular.js etc. The provided methods can be integrated in your inputs like select, autocomplete, or typeahead etc. for better user experience.
    - Phone Input
    - Country Input
    - Currency Input
    - Language Input
    - State Input
    - City Input
    - Timezone Input
    - etc.
## Usage 🚀
### CountriesAtlas Class 🌎
In order to use the country atlas class, you need to import the class from the library, and create an instance of the class.
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
```
### getCountries() 🌎 Method
The `getCountries()` method will return an array of countries, which contains all the countries in the world. It also contains the following properties:
- code: The ISO 3166-1 alpha-2 code of the country.
- name: The name of the country.
- native: The native name of the country.
- phone: The phone code of the country.
- continent: The continent of the country.
- capital: The capital of the country.
- currency: The currency of the country.
- languages: The languages of the country.
- iso3: The ISO 3166-1 alpha-3 code of the country.
- iso2: The ISO 3166-1 alpha-2 code of the country.
- currency_symbol: The currency symbol of the country.
- region: The region of the country.
- subregion: The subregion of the country.
- timezones: The timezones of the country.
- translations: The translations of the country.
- latitude: The latitude of the country.
- longitude: The longitude of the country.
- emoji: The emoji of the country.
- emojiU: The emoji unicode of the country.
- currency_name: The currency name of the country.
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
const countries = CountriesAtlas.getCountries()
//[
//  {
//     "code": "AD",
//     "name": "Andorra",
//     "native": "Andorra",
//     "phone": 376,
//     "continent": "Europe",
//     "capital": "Andorra la Vella",
//     "currency": "EUR",
//     "languages": "ca",
//     "iso3": "AND",
//     "iso2": "AD",
//     "currency_symbol": "€",
//     "region": "Europe",
//     "subregion": "Southern Europe",
//     "timezones": [
//       {
//         "zoneName": "Europe/Andorra",
//         "gmtOffset": 3600,
//         "gmtOffsetName": "UTC+01:00",
//         "abbreviation": "CET",
//         "tzName": "Central European Time"
//       }
//     ],
//     "translations": {
//       "kr": "안도라",
//       "br": "Andorra",
//       "pt": "Andorra",
//       "nl": "Andorra",
//       "hr": "Andora",
//       "fa": "آندورا",
//       "de": "Andorra",
//       "es": "Andorra",
//       "fr": "Andorre",
//       "ja": "アンドラ",
//       "it": "Andorra",
//       "cn": "安道尔"
//     },
//     "latitude": "42.50000000",
//     "longitude": "1.50000000",
//     "emoji": "🇦🇩",
//     "emojiU": "U+1F1E6 U+1F1E9",
//     "currency_name": "Euro"
//   },
//]
```
You can use any of the properties in the `getCountries()` method to extract the data you want, for example, if you want to get the name, iso2, and emoji of the country, you can do the following:
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
const countries = CountriesAtlas.getCountries(['name', 'iso2', 'emoji'])
//[
//  {
//     "name": "Andorra",
//     "iso2": "AD",
//     "emoji": "🇦🇩"
//   },
//]
```
### find() 🌎 Method
The `find()` method is used to find the country by the given `iso2` property, it will return the country if it exists, otherwise it will return `undefined`. For example, if you want to find the country, you can do the following:
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
const country = CountriesAtlas.find('AD')
//[
//  {
//     "code": "AD",
//     "name": "Andorra",
//     "native": "Andorra",
//     "phone": 376,
//     "continent": "Europe",
//     "capital": "Andorra la Vella",
//     "currency": "EUR",
//     "languages": "ca",
//     "iso3": "AND",
//     "iso2": "AD",
//     "currency_symbol": "€",
//     "region": "Europe",
//     "subregion": "Southern Europe",
//     "timezones": [
//       {
//         "zoneName": "Europe/Andorra",
//         "gmtOffset": 3600,
//         "gmtOffsetName": "UTC+01:00",
//         "abbreviation": "CET",
//         "tzName": "Central European Time"
//       }
//     ],
//     "translations": {
//       "kr": "안도라",
//       "br": "Andorra",
//       "pt": "Andorra",
//       "nl": "Andorra",
//       "hr": "Andora",
//       "fa": "آندورا",
//       "de": "Andorra",
//       "es": "Andorra",
//       "fr": "Andorre",
//       "ja": "アンドラ",
//       "it": "Andorra",
//       "cn": "安道尔"
//     },
//     "latitude": "42.50000000",
//     "longitude": "1.50000000",
//     "emoji": "🇦🇩",
//     "emojiU": "U+1F1E6 U+1F1E9",
//     "currency_name": "Euro"
//   },
//]

// You can also get any property you want from the country by using the . operator
const countryName = CountriesAtlas.find('AD').name
// Andorra
```
### findByIso3() 🌎 Method
The `findByIso3()` method is used to find the country by the given `iso3` property, it will return the country if it exists, otherwise it will return `undefined`. For example, if you want to find the country, you can do the following:
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
const country = CountriesAtlas.findByIso3('AND')
//[
//  {
//     "code": "AD",
//     "name": "Andorra",
//     "native": "Andorra",
//     "phone": 376,
//     "continent": "Europe",
//     "capital": "Andorra la Vella",
//     "currency": "EUR",
//     "languages": "ca",
//     "iso3": "AND",
//     "iso2": "AD",
//     "currency_symbol": "€",
//     "region": "Europe",
//     "subregion": "Southern Europe",
//     "timezones": [
//       {
//         "zoneName": "Europe/Andorra",
//         "gmtOffset": 3600,
//         "gmtOffsetName": "UTC+01:00",
//         "abbreviation": "CET",
//         "tzName": "Central European Time"
//       }
//     ],
//     "translations": {
//       "kr": "안도라",
//       "br": "Andorra",
//       "pt": "Andorra",
//       "nl": "Andorra",
//       "hr": "Andora",
//       "fa": "آندورا",
//       "de": "Andorra",
//       "es": "Andorra",
//       "fr": "Andorre",
//       "ja": "アンドラ",
//       "it": "Andorra",
//       "cn": "安道尔"
//     },
//     "latitude": "42.50000000",
//     "longitude": "1.50000000",
//     "emoji": "🇦🇩",
//     "emojiU": "U+1F1E6 U+1F1E9",
//     "currency_name": "Euro"
//   },
//]

// You can also get any property you want from the country by using the . operator
const countryName = CountriesAtlas.findByIso3('AND').name
// Andorra
```
### getStates() 🌎 Method
The `getStates()` method will return an array of states, which contains all the states in a country. It also contains the following properties:
- name: The name of the state.
- state_code: The state code of the state.
- longitude: The longitude of the state.
- latitude: The latitude of the state.
- cities: The cities of the state.
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
const states = await CountriesAtlas.getStates('AD')
// [
//     {
//       "name": "Andorra la Vella",
//       "state_code": "07",
//       "latitude": "42.50631740",
//       "longitude": "1.52183550",
//       "cities": [
//         {
//           "name": "Andorra la Vella",
//           "latitude": "42.50779000",
//           "longitude": "1.52109000"
//         }
//       ]
//     },
// ]
```
### state() 🌎 Method
The `state()` method is used to get the state by the given `iso2` and `state_code` properties, it will return the state if it exists, otherwise it will return `undefined`. For example, if you want to get the state, you can do the following:
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
const state = await CountriesAtlas.state('AD', '07')
//{
//  "name": "Andorra la Vella",
//  "state_code": "07",
//  "latitude": "42.50631740",
//  "longitude": "1.52183550",
//  "cities": [
//    {
//      "name": "Andorra la Vella",
//      "latitude": "42.50779000",
//      "longitude": "1.52109000"
//    }
//  ]
//}

// You can also get any property you want from the state by using the . operator
const stateName = CountriesAtlas.state('AD', '07').name
// Andorra la Vella
```
### getTimezones() ⏰ Method
The `getTimezones()` method will return an array of timezones, which contains all the timezones available. It also contains the following properties:
- zoneName: The zone name of the timezone.
- gmtOffset: The GMT offset of the timezone.
- gmtOffsetName: The GMT offset name of the timezone.
- abbreviation: The abbreviation of the timezone.
- tzName: The timezone name of the timezone.
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
const timezones = CountriesAtlas.getTimezones()
// [
//   {
//     "zoneName": "Europe/Andorra",
//     "gmtOffset": 3600,
//     "gmtOffsetName": "UTC+01:00",
//     "abbreviation": "CET",
//     "tzName": "Central European Time"
//   },
//   {
//     "zoneName": "Asia/Dubai",
//     "gmtOffset": 14400,
//     "gmtOffsetName": "UTC+04:00",
//     "abbreviation": "GST",
//     "tzName": "Gulf Standard Time"
//   },
// ]
```

### timezone() ⏰ Method
The `timezone()` method is used to get the timezone of a country by the given `iso2` property, it will return the timezone if it exists, otherwise it will return `undefined`. For example, if you want to get the timezone, you can do the following:
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
const timezone = CountriesAtlas.timezone('AD')
// {
//   "zoneName": "Europe/Andorra",
//   "gmtOffset": 3600,
//   "gmtOffsetName": "UTC+01:00",
//   "abbreviation": "CET",
//   "tzName": "Central European Time"
// }

// You can also get any property you want from the timezone by using the . operator
const timezoneName = CountriesAtlas.timezone('AD').tzName
// Central European Time
```
### getCallingCodes() ☎️ Method
The `getCallingCodes()` method will return an array of calling codes, which contains all the calling codes available. It also contains the following properties:
- name: The name of the country.
- phone: The phone code of the country.
- iso2: The ISO 3166-1 alpha-2 code of the country.
- phone_code: The phone code of the country with + sign as prefix.
- flag: The flag class of the country. **Note: to use the flag class, you need to import the flag css file from the library.**
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
const callingCodes = CountriesAtlas.getCallingCodes()
// [
//   {
//     "name": "Andorra",
//     "phone": 376,
//     "iso2": "AD",
//     "phone_code": "+376",
//     "flag": "flag flag-ad"
//   },
//   {
//     "name": "United Arab Emirates",
//     "phone": 971,
//     "iso2": "AE",
//     "phone_code": "+971",
//     "flag": "flag flag-ae"
//   },
// ]
```
***Note: If you want to use the flag class, you need to import the flag css file from the library, to do that [click here](#flag-css-file-).***

### callingCode() ☎️ Method
The `callingCode()` method is used to get the calling code of a country by the given `iso2` property, it will return the calling code if it exists, otherwise it will return `undefined`. For example, if you want to get the calling code, you can do the following:
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
const callingCode = CountriesAtlas.callingCode('AD')
// {
//   "name": "Andorra",
//   "phone": 376,
//   "iso2": "AD",
//   "phone_code": "+376",
//   "flag": "flag flag-ad"
// }
```
### getCurrencies() 💰 Method
The `getCurrencies()` method will return an array of currencies, which contains all the currencies available. It also contains the following properties:
- name: The name of the country.
- iso2: The ISO 3166-1 alpha-2 code of the country.
- currency code: The currency code of the country.
- currency_symbol: The currency symbol of the country.
- flag: The flag class of the country. **Note: to use the flag class, you need to import the flag css file from the library.**
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
const currencies = CountriesAtlas.getCurrencies()
// [
//   {
//     "name": "Andorra",
//     "iso2": "AD",
//     "currency": "EUR",
//     "currency_symbol": "€",
//     "currency_name": "Euro",
//     "flag": "flag flag-ad"
//   },
//   {
//     "name": "United Arab Emirates",
//     "iso2": "AE",
//     "currency": "AED",
//     "currency_symbol": "إ.د",
//     "flag": "flag flag-ae"
//   },
// ]
```
***Note: If you want to use the flag class, you need to import the flag css file from the library, to do that [click here](#flag-css-file-).***

### currency() 💰 Method
The `currency()` method is used to get the currency of a country by the given `iso2` property, it will return the currency if it exists, otherwise it will return `undefined`. For example, if you want to get the currency, you can do the following:
```typescript
import { CountriesAtlas } from '@amplifiedhq/countries-atlas'
const currency = CountriesAtlas.currency('AD')
// {
//   "name": "Andorra",
//   "iso2": "AD",
//   "currency": "EUR",
//   "currency_symbol": "€",
//   "currency_name": "Euro",
//   "flag": "flag flag-ad"
// }
```

## ValidatorAtlas Class 🧾
In order to use the validator atlas class, you need to import the class from the library, and create an instance of the class.
```typescript
import { ValidatorAtlas } from '@amplifiedhq/countries-atlas'
```
### isValidIso2() 🌎 Method
The `isValidIso2()` method is used to validate the given `iso2` property, it will return `true` if the `iso2` is valid, otherwise it will return `false`. For example, if you want to validate the `iso2`, you can do the following:
```typescript
import { ValidatorAtlas } from '@amplifiedhq/countries-atlas'

const isValid = ValidatorAtlas.isValidIso2('AD')
// true
const isValid = ValidatorAtlas.isValidIso2('ABC')
// false
```
### isValidIso3() 🌎 Method
The `isValidIso3()` method is used to validate the given `iso3` property, it will return `true` if the `iso3` is valid, otherwise it will return `false`. For example, if you want to validate the `iso3`, you can do the following:
```typescript
import { ValidatorAtlas } from '@amplifiedhq/countries-atlas'

const isValid = ValidatorAtlas.isValidIso3('AND')
// true
const isValid = ValidatorAtlas.isValidIso3('ABC')
// false
```
### isValidCurrency() ☎️ Method
The `isValidCurrency()` method is used to validate the given `currency` property, it will return `true` if the `currency` is valid, otherwise it will return `false`. For example, if you want to validate the `currency`, you can do the following:
```typescript
import { ValidatorAtlas } from '@amplifiedhq/countries-atlas'

const isValid = ValidatorAtlas.isValidCurrency('EUR')
// true
const isValid = ValidatorAtlas.isValidCurrency('ABC')
// false
```
### isValidTimezone() ⏰ Method
The `isValidTimezone()` method is used to validate the given `timezone` property, it will return `true` if the `timezone` is valid, otherwise it will return `false`. For example, if you want to validate the `timezone`, you can do the following:
```typescript
import { ValidatorAtlas } from '@amplifiedhq/countries-atlas'

const isValid = ValidatorAtlas.isValidTimezone('Europe/Andorra')
// true
const isValid = ValidatorAtlas.isValidTimezone('ABC')
// false
```
### isValidCallingCode() ☎️ Method
The `isValidCallingCode()` method is used to validate the given `callingCode` property, it will return `true` if the `callingCode` is valid, otherwise it will return `false`. For example, if you want to validate the `callingCode`, you can do the following:
```typescript
import { ValidatorAtlas } from '@amplifiedhq/countries-atlas'

const isValid = ValidatorAtlas.isValidCallingCode('376')
// true
const isValid = ValidatorAtlas.isValidCallingCode('ABC')
// false
```
### isValidStateCode() 🌎 Method
The `isValidStateCode()` method is used to validate the given `stateCode` property, it will return `true` if the `stateCode` is valid, otherwise it will return `false`. For example, if you want to validate the `stateCode`, you can do the following:
```typescript
import { ValidatorAtlas } from '@amplifiedhq/countries-atlas'

const isValid = await ValidatorAtlas.isValidStateCode('AD', '07')
// true
const isValid = await ValidatorAtlas.isValidStateCode('AD', 'ABC')
// false
```

## Flags 🚩
The library provides a way to use the flags of the countries, you can use the flag class to display the flag of the country. 

### Flag CSS File 🚩
In order to use the flag class, you need to import the flag css file from the library, you can do that by adding the following line in your `index.html` file:
```html
<link rel="stylesheet" href="https://unpkg.com/@amplifiedhq/countries-atlas/dist/flags/css/flags.min.css" />

<!-- Or you can use the local file -->
<link rel="stylesheet" href="node_modules/@amplifiedhq/countries-atlas/dist/flags/css/flags.min.css" />

<!-- Or you can use the CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@amplifiedhq/countries-atlas/dist/flags/css/flags.min.css">
```
You can also import the css in your `css` file:
```css
@import '~@amplifiedhq/countries-atlas/dist/flags/css/flags.min.css';

/* Or you can use the CDN */
@import 'https://cdn.jsdelivr.net/npm/@amplifiedhq/countries-atlas/dist/flags/css/flags.min.css';

/* Or you can use the local file */
@import 'node_modules/@amplifiedhq/countries-atlas/dist/flags/css/flags.min.css';

/* Or you can use the unpkg */
@import 'https://unpkg.com/@amplifiedhq/countries-atlas/dist/flags/css/flags.min.css';
```
In order to use the flag class, you need to add the flag class to the element, for example, if you want to display the flag of the country, you can do the following:
```html
<span class="flag flag-ad"></span>
<span class="flag flag-ae"></span>
```
### Flag SCSS File 🚩
In order to use the flag class, you need to import the flag scss file from the library, you can do that by adding the following line in your `index.html` file:
```html
<link rel="stylesheet" href="node_modules/@amplifiedhq/countries-atlas/dist/flags/scss/flags.scss" />

<!-- Or you can use the CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@amplifiedhq/countries-atlas/dist/flags/scss/flags.scss">

<!-- Or you can use the unpkg -->
<link rel="stylesheet" href="https://unpkg.com/@amplifiedhq/countries-atlas/dist/flags/scss/flags.scss">
```
You can also import the scss in your `scss` file:
```scss
@import '~@amplifiedhq/countries-atlas/dist/flags/scss/flags.scss';

/* Or you can use the CDN */

@import 'https://cdn.jsdelivr.net/npm/@amplifiedhq/countries-atlas/dist/flags/scss/flags.scss';

/* Or you can use the unpkg */

@import 'https://unpkg.com/@amplifiedhq/countries-atlas/dist/flags/scss/flags.scss';
```

In order to use the flag class, you need to add the flag class to the element, for example, if you want to display the flag of the country, you can do the following:
```html
<span class="flag flag-ad"></span>
<span class="flag flag-ae"></span>
```

## Flags Import 🚩
You can import the flags in your project, you can do that by importing the `flags` folder from the library, for example, if you want to import the flags in your app, you can do the following:
- Vue.js
```javascript
<template>
  <div>
    <img :src="AD" />
    <img :src="AE" />
    </div>
</template>

<script>
import { AD, AE } from '@amplifiedhq/countries-atlas/dist/flags';

export default {
  name: 'App',
  data() {
    return {
      AD,
      AE,
    }
  }
}
</script>
```
- React.js
```jsx
import { AD, AE } from '@amplifiedhq/countries-atlas/dist/flags';

const App = () => {
  return (
    <div>
      <img src={AD} />
      <img src={AE} />
    </div>
  );
}

export default App;
```

## Contributing 🤝
Contributions, issues and feature requests are welcome. After cloning & setting up project locally, you can just submit a PR to this repo and it will be deployed once it's accepted.

## Show your support 🌟
Give a ⭐️ if this project helped you!

## License 📝
This project is [MIT](LICENSE.md) licensed.

## Credits 🙏
- [Kaggle](https://www.kaggle.com/datasets/tanweerulhaque/countries-states-cities-dataset) for the dataset.
