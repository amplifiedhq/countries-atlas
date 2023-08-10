# CountryAtlas TODO

## TODO
### Get Countries
- [x] Find Country, param - iso2 code, iso3 code ...
    - `CountryAtlas.getCountries` - Get all countries
    - `CountryAtlas.find('iso2', 'US')` - Find country by iso2 code
    - `CountryAtlas.find('iso3', 'USA')` - Find country by iso3 code
    - `CountryAtlas.getCountries([..properties])` - Get all countries selecting the properties
    - **Method Chaining**
      - `CountryAtlas.find('iso2', 'US').name` - Find country by iso2 code and get name
         - `CountryAtlas.find('iso2', 'US').capital` - Find country by iso2 code and get capital
      - `CountryAtlas.find('iso2', 'US').currency` - Find country by iso2 code and get currency

### Get States
- [x] Find State, get state, param - state code
    - `CountryAtlas.states('US')` - Get all states of country
    - `CountryAtlas.state('US', 'NY')` - Get state by state_code as param
    - **Method Chaining**
      - `CountryAtlas.state('US', 'NY').name` - Get state by state_code as param and get name
      - `CountryAtlas.state('US', 'NY').latitude` - Get state by state_code as param and get latitude
      - `CountryAtlas.state('US', 'NY').longitude` - Get state by state_code as param and get longitude
      - `CountryAtlas.state('US', 'NY').cities` - Get all cities of state

### Get Currencies
These is use to get the iso2, iso3, currency name, symbol, etc.
- [x] `CountryAtlas.getCurrencies()` - Get all currencies, but it will be using the CountryAtlas.getCountries([..properties]) method

### Get Currency
- [x] `CountryAtlas.getCurrencies()` - Get all currencies
  - Note - Flags will be added to the currencies 
- [x] `CountryAtlas.currency('US')` - Get currency by iso2 code => {currency: 'usd', currency_symbol: '$'}
- [ ] `CountryAtlas.getCountriesWithCurrency('USD')` - Get countries with currency => 
    ```json 
    [{
        iso2: 'US', 
        iso3: 'USA', 
        currency: 'usd', 
        currency_symbol: '$'
    }]
    ```
- [ ] `CountryAtlas.getCountriesWithCurrency('USD', ['iso2', 'iso3'])` - Get countries with currency and select properties => 
    ```json 
    [{
        iso2: 'US', 
        iso3: 'USA'
    }]
    ```

### Get Timezones
- [x] `CountryAtlas.getTimezones()` - Get all timezones
- [x] `CountryAtlas.timezone('US')` - Get timezones by iso2 code

### Get Flags
- [ ] `CountryAtlas.getFlags()` - Get all flags
- [ ] `CountryAtlas.getFlag('US')` - Get flag by iso2 code => Returns SVG

### Get Calling Codes
- [x] `CountryAtlas.getCallingCodes()` - Get all calling codes
    - Note - Flags will be added to the calling codes
- [x] `CountryAtlas.callingCode('US')` - Get calling code by iso2 code

### Validators
- [x] `CountryAtlas.isValidIso2('US')` - Validate iso2 code
- [x] `CountryAtlas.isValidIso3('USA')` - Validate iso3 code
- [x] `CountryAtlas.isValidCurrency('USD')` - Validate currency code
- [x] `CountryAtlas.isValidTimezone('America/New_York')` - Validate timezone code
- [x] `CountryAtlas.isValidCallingCode('1')` - Validate calling code
- [x] `CountryAtlas.isValidStateCode('NY')` - Validate state code
- [ ] `CountryAtlas.isValidStateName('New York')` - Validate state name

**Note** - All the above methods will return `true` or `false`

***More methods will be added soon***