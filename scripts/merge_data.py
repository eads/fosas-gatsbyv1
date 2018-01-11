import json
import random
import pandas as pd
import numpy as np

PROPS = ['num_fosas',
         'num_cuerpos',
         'num_cuerpos_identificados',
         'num_restos',
         'identificados']

def merge_data():
    lookup = {}

    with open("mapas-data-concentrado.xlsx", "rb") as f:
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

    with open('mx.json') as f:
        data = json.load(f)
        for feature in data['objects']['municipalities']['geometries']:
            totals = dict((prop, 0) for prop in PROPS)
            state_code = feature['properties']['state_code']
            mun_code = feature['properties']['mun_code']
            mun_data = lookup[state_code].get(mun_code)
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

    with open('../static/map-data/mx-topojson-merged.json', 'w') as f:
        json.dump(data, f)

if __name__ == '__main__':
    merge_data()
