import json
import random

def merge_data():
    with open('mx-geojson.json') as f:
        data = json.load(f)
        for feature in data['features']:
            mun_code = feature['properties'].get('mun_code')
            if mun_code:
                feature['properties']['2006_fosas'] = random.randint(0, 50)
                feature['properties']['2007_fosas'] = random.randint(0, 50)
                feature['properties']['2008_fosas'] = random.randint(0, 50)
                feature['properties']['2009_fosas'] = random.randint(0, 50)
                feature['properties']['2010_fosas'] = random.randint(0, 50)
                feature['properties']['2011_fosas'] = random.randint(0, 50)
                feature['properties']['2012_fosas'] = random.randint(0, 50)
                feature['properties']['2013_fosas'] = random.randint(0, 50)
                feature['properties']['2014_fosas'] = random.randint(0, 50)
                feature['properties']['2015_fosas'] = random.randint(0, 50)
                feature['properties']['2016_fosas'] = random.randint(0, 50)

    with open('mx-geojson-merged.json', 'w') as f:
        json.dump(data, f)

if __name__ == '__main__':
    merge_data()
