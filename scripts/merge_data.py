# import geojson
import json
import pandas as pd
import numpy as np
import codecs

from shapely.geometry import mapping, shape
from pprint import pprint
from copy import deepcopy

PROPS = ['num_fosas',
         'num_cuerpos',
         'num_cuerpos_identificados',
         'num_restos',
         'identificados']


def merge_municipality_data():
    lookup = {}

    with open("data/mapas-data-concentrado.xlsx", "rb") as f:
        dfs = pd.read_excel(f, sheet_name=None)

    for sheetname, df in dfs.items():
        state_code = int(sheetname.split(' ')[0])
        pivot = pd.pivot_table(df, index=["municipio_code", "year"], fill_value=0, aggfunc=np.sum, values=PROPS)
        pivot_dict = pivot.reset_index().to_dict("records")

        final_dict = {}
        for row in pivot_dict:
            if not final_dict.get(row['municipio_code']):
                final_dict[row['municipio_code']] = {}

            try:
                final_dict[row['municipio_code']][int(row['year'])] = dict((prop, int(row.get(prop, 0))) for prop in PROPS)
            except ValueError:
                print(sheetname)

        lookup[state_code] = final_dict

    maxes = {prop: 0 for prop in PROPS}
    centers = {
        'type': 'FeatureCollection',
        'name': 'municipalescentroids',
        'features': [],
    }
    with codecs.open('data/municipales.geojson', encoding='utf-8', errors="replace") as f:
        data = json.load(f)
        for feature in data['features']:

            totals = dict((prop, 0) for prop in PROPS)
            state_code = int(feature['properties']['CVE_ENT'])
            mun_code = int(feature['properties']['CVE_MUN'])
            mun_data = lookup[state_code].get(mun_code)

            # feature['properties']['yearlyFosasData'] = mun_data

            cumulative_fosas_data = []

            for year in range(2006, 2017):
                cumulative_dict = {'year': year}

                for prop in PROPS:
                    if mun_data and mun_data.get(year) and mun_data[year].get(prop, 0) > 1:
                        feature['properties'][prop + '_' + str(year)] = int(mun_data[year].get(prop))
                        totals[prop] += int(mun_data[year].get(prop))
                    # elif mun_data and mun_data.get(year) and mun_data[year].get(prop) == 0:
                        # feature['properties'][prop + '_' + str(year)] = 0
                    else:
                        feature['properties'][prop + '_' + str(year)] = 0

                    if len(cumulative_fosas_data):
                        cumulative_dict[prop] = cumulative_fosas_data[-1].get(prop) + feature['properties'][prop + '_' + str(year)]
                        feature['properties'][prop + '_cumulative_' + str(year)] = cumulative_fosas_data[-1].get(prop) + feature['properties'][prop + '_' + str(year)]
                    else:
                        cumulative_dict[prop] = feature['properties'][prop + '_' + str(year)]
                        feature['properties'][prop + '_cumulative_' + str(year)] = feature['properties'][prop + '_' + str(year)]

                cumulative_fosas_data.append(cumulative_dict)

            for prop in PROPS:
                feature['properties'][prop + '_total'] = totals[prop]
                if totals[prop] > maxes[prop]:
                    maxes[prop] = totals[prop]

            try:
                shp = shape(feature['geometry'])
                feature_centroid = mapping(shp.representative_point())
                center_feature = deepcopy(feature)
                center_feature['geometry'] = feature_centroid
                centers['features'].append(center_feature)
            except:
                print('encountered feature w/o centroid pls fix')

    with open('data/municipales-fosas.geojson', 'w') as f:
        json.dump(data, f)

    with open('data/municipales-fosas-centroids.geojson', 'w') as f:
        json.dump(centers, f)


def merge_state_data():
    lookup = {}

    with open("data/mapas-data-concentrado.xlsx", "rb") as f:
        dfs = pd.read_excel(f, sheet_name=None)

    for sheetname, df in dfs.items():
        sheet_state_code = int(sheetname.split(' ')[0])
        pivot = pd.pivot_table(df, index=["state_code", "year"], fill_value=0, aggfunc=np.sum, values=PROPS)
        pivot_dict = pivot.reset_index().to_dict("records")
        final_data = [dict([k, int(v)]  for k,v in row.items()) for row in pivot_dict]
        lookup[sheet_state_code] = final_data

    maxes = {prop: 0 for prop in PROPS}
    centers = {
        'type': 'FeatureCollection',
        'name': 'estatalescentroids',
        'features': [],
    }

    state_meta = []
    with codecs.open('data/estatales.geojson', encoding='utf-8', errors="replace") as f:
        data = json.load(f)
        for feature in data['features']:
            totals = dict((prop, 0) for prop in PROPS)
            state_code = int(feature['properties']['CVE_ENT'])
            state_data = lookup[state_code]

            yearlyData = []
            state_data_dict = dict([(row['year'], row) for row in state_data])
            for year in range(2006, 2017):
                row = state_data_dict.get(year, False)
                if not row:
                    row = { 'year': year, 'state_code': state_code }
                    for prop in PROPS:
                        row[prop] = -1
                yearlyData.append(row)

            feature['properties']['yearlyFosasData'] = yearlyData

            if state_code == 25:
                pprint(yearlyData)

            for prop in PROPS:
                feature['properties'][prop + '_total'] = sum(item.get(prop, 0) for item in state_data)

            shp = shape(feature['geometry'])
            representative_point = mapping(shp.representative_point())
            centroid = mapping(shp.centroid)

            center_feature = deepcopy(feature)
            center_feature['geometry'] = representative_point
            centers['features'].append(center_feature)

            state_meta.append({
                'state_code': feature['properties']['CVE_ENT'],
                'state_name': feature['properties']['NOM_ENT'],
                'representative_point': representative_point,
                'centroid': centroid,
            })

    with open('data/estatales-fosas.geojson', 'w') as f:
        json.dump(data, f)

    with open('data/estatales-fosas-centroids.geojson', 'w') as f:
        json.dump(centers, f)

    with open('src/data/mxstates.json', 'w') as f:
        json.dump(state_meta, f)

if __name__ == '__main__':
    # merge_municipality_data()
    merge_state_data()
