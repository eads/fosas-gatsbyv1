import codecs
import csv
import json

from operator import itemgetter


PROPS = ['num_fosas',
         'num_cuerpos']


def analyze_national_per_year():
    per_year = {year: {"year": year, "num_fosas": 0, "num_fosas_change": 0, "num_cuerpos": 0, "num_cuerpos_change": 0} for year in range(2006, 2017)}

    with codecs.open('data/processed-geojson/municipales-centroids.json', encoding='utf-8') as f:
        data = json.load(f)
        for feature in data['features']:
            properties = feature['properties']
            for year in range(2006, 2017):
                for prop in PROPS:
                    per_year[year][prop] += properties[prop + '_' + str(year)]

        for year in range(2007, 2017):
            for prop in PROPS:
                per_year[year][prop + '_change'] = (per_year[year][prop] - per_year[year - 1][prop]) / float(per_year[year - 1][prop]) * 100

    with open('data/analysis/national-per-year.csv', 'w') as f:
        writer = csv.DictWriter(f, fieldnames=['year', 'num_fosas', 'num_fosas_change', 'num_cuerpos', 'num_cuerpos_change'])
        writer.writeheader()
        writer.writerows(per_year.values())


def analyze_per_municipality():
    with codecs.open('src/data/mxstates.json', encoding='utf-8') as f:
        states = json.load(f)
        state_lookup = {row['state_code']: row for row in states}

    municipalities = []
    with codecs.open('data/processed-geojson/municipales-centroids.json', encoding='utf-8') as f:
        data = json.load(f)
        for feature in data['features']:

            properties = feature['properties']

            row = {
                'state_code': properties['CVE_ENT'],
                'state_name': state_lookup[properties['CVE_ENT']]['state_name'],
                'municipality_code': properties['CVE_MUN'],
                'municipality_name': properties['NOM_MUN'],
            }

            for prop in PROPS:
                total = 0
                for year in range(2006, 2017):
                    total += properties[prop + '_' + str(year)]
                row[prop + '_total'] = total

            municipalities.append(row)

        municipalities = sorted(municipalities, key=itemgetter('num_fosas_total'), reverse=True)

        with open('data/analysis/municipalities-counts.csv', 'w') as f:
            writer = csv.DictWriter(f, fieldnames=['state_code', 'state_name', 'municipality_code', 'municipality_name', 'num_fosas_total', 'num_cuerpos_total'])
            writer.writeheader()
            writer.writerows(municipalities)


if __name__ == '__main__':
    analyze_national_per_year()
    analyze_per_municipality()
