import json
import os

# Check if the countries and states are in sync
countries_file = os.path.join(os.path.dirname(__file__), '../src/data/atlas.json')
states_path = os.path.join(os.path.dirname(__file__), '../src/data/countries')

with open(countries_file) as f:
    countries = json.load(f)

for country in countries:
    country_name = country['iso2']
    country_file = os.path.join(states_path, country_name.lower() + '.json')
    if not os.path.exists(country_file):
        raise Exception('Missing file: ' + country_file)
print('All countries are in sync, count are : ' + str(len(countries)))

# Check if the flags are in sync
flags_path = os.path.join(os.path.dirname(__file__), '../flags/svg')
flags = os.listdir(flags_path)
for country in countries:
    country_name = country['iso2'].lower() + '.svg'
    if country_name not in flags:
        raise Exception('Missing flag: ' + country_name)
print('All flags are in sync, count are : ' + str(len(flags)))
exit(0)
