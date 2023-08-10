const requireCountryStates = (countryCode: string) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const states = require(`../data/countries/${countryCode.toLowerCase()}.json`);
    return states;
}

export default requireCountryStates