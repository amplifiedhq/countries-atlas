# CountryAtlas TODO

## TODO
### Get Countries
- Find Country, param - iso2 code, iso3 code ...
    - `CountryAtlas.getCountries` - Get all countries
    - `CountryAtlas.find('iso2', 'US')` - Find country by iso2 code
    - `CountryAtlas.find('iso3', 'USA')` - Find country by iso3 code
    - `CountryAtlas.getCountries([..properties])` - Get all countries selecting the properties
    - **Method Chaining**
      - `CountryAtlas.find('iso2', 'US').name` - Find country by iso2 code and get name
         - `CountryAtlas.find('iso2', 'US').capital` - Find country by iso2 code and get capital
      - `CountryAtlas.find('iso2', 'US').currency` - Find country by iso2 code and get currency

### Get States
- Find State, get state, param - state code
    - `CountryAtlas.find('iso2', 'US').states()` - Get all states of country
    - `CountryAtlas.find('iso2', 'US').state('NY')` - Get state by state_code as param
    - **Method Chaining**
      - `CountryAtlas.find('iso2', 'US').state('NY').name` - Get state by state_code as param and get name
      - `CountryAtlas.find('iso2', 'US').state('NY').latitude` - Get state by state_code as param and get latitude
      - `CountryAtlas.find('iso2', 'US').state('NY').longitude` - Get state by state_code as param and get longitude

### Get Cities
- Find Cities, get cities, param - state code
    - `CountryAtlas.find('iso2', 'US').state('NY').cities()` - Get all cities of state

### Get Currencies
These is use to get the iso2, iso3, currency name, symbol, etc.
- `CountryAtlas.getCurrencies()` - Get all currencies, but it will be using the CountryAtlas.getCountries([..properties]) method

### Get Currency
- `CountryAtlas.getCurrencies()` - Get all currencies
  - Note - Flags will be added to the currencies 
- `CountryAtlas.getCurrency('US')` - Get currency by iso2 code => {currency: 'usd', currency_symbol: '$'}
- `CountryAtlas.getCountriesWithCurrency('USD')` - Get countries with currency => 
    ```json 
    [{
        iso2: 'US', 
        iso3: 'USA', 
        currency: 'usd', 
        currency_symbol: '$'
    }]
    ```
- `CountryAtlas.getCountriesWithCurrency('USD', ['iso2', 'iso3'])` - Get countries with currency and select properties => 
    ```json 
    [{
        iso2: 'US', 
        iso3: 'USA'
    }]
    ```

### Get Timezones
- `CountryAtlas.getTimezones()` - Get all timezones
- `CountryAtlas.getTimezone('US')` - Get timezones by iso2 code

### Get Flags
- `CountryAtlas.getFlags()` - Get all flags
- `CountryAtlas.getFlag('US')` - Get flag by iso2 code => Returns SVG

### Get Calling Codes
- `CountryAtlas.getCallingCodes()` - Get all calling codes
    - Note - Flags will be added to the calling codes
- `CountryAtlas.getCallingCode('US')` - Get calling code by iso2 code

### Validators
- `CountryAtlas.isValidIso2('US')` - Validate iso2 code
- `CountryAtlas.isValidIso3('USA')` - Validate iso3 code
- `CountryAtlas.isValidCurrency('USD')` - Validate currency code
- `CountryAtlas.isValidTimezone('America/New_York')` - Validate timezone code
- `CountryAtlas.isValidCallingCode('1')` - Validate calling code
- `CountryAtlas.isValidStateCode('NY')` - Validate state code
- `CountryAtlas.isValidStateName('New York')` - Validate state name

**Note** - All the above methods will return `true` or `false`

***More methods will be added soon***