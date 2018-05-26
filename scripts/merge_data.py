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

def merge_data():
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
    with codecs.open('data/municipalities.geojson', encoding='utf-8', errors="ignore") as f:
        data = json.load(f)
        for feature in data['features']:

            totals = dict((prop, 0) for prop in PROPS)
            state_code = int(feature['properties']['CVE_ENT'])
            mun_code = int(feature['properties']['CVE_MUN'])
            mun_data = lookup[state_code].get(mun_code)

            feature['properties']['fosasData'] = mun_data

            for prop in PROPS:
                for year in range(2006, 2017):
                    if mun_data and mun_data.get(year) and mun_data[year].get(prop, 0) > 1:
                        feature['properties'][str(year) + '_' + prop] = int(mun_data[year].get(prop))
                        totals[prop] += int(mun_data[year].get(prop))
                    elif mun_data and mun_data.get(year) and mun_data[year].get(prop) == 0:
                        feature['properties'][str(year) + '_' + prop] = 0
                    else:
                        feature['properties'][str(year) + '_' + prop] = -1

            for prop in PROPS:
                feature['properties']['total_' + prop] = totals[prop]
                if totals[prop] > maxes[prop]:
                    maxes[prop] = totals[prop]

            try:
                shp = shape(feature['geometry'])
                feature_centroid = mapping(shp.representative_point())
                center_feature = deepcopy(feature)
                center_feature['geometry'] = feature_centroid
                centers['features'].append(center_feature)
            except:
                print('encountered one')

    with open('data/municipales-fosas.geojson', 'w') as f:
        json.dump(data, f)

    with open('data/municipales-fosas-centroids.geojson', 'w') as f:
        json.dump(centers, f)

    pprint(maxes)

if __name__ == '__main__':
    merge_data()
