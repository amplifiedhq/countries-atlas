
import json
# Add file path here
file_path = ''

with open(file_path, 'r') as f:
    data = json.load(f)

with open(file_path, 'w') as f:
    json.dump(data, f, separators=(',', ':'))

print("Minified " + file_path)
