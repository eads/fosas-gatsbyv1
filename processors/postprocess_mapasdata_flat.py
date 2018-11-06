import dataset
import os

COLUMNS = [
    'fosas',
    'cuerpos',
    'cuerpos_identificados',
    'restos',
    'restos_identificados',
    'craneos',
]
YEARS = [y for y in range(2006, 2018)]


def post_process():
    db = dataset.connect(os.environ.get('FOSAS_DB_URL'))
    table = db['mapasdata_flat']
    for row in table:
        for column in COLUMNS:
            cumulative = 0
            for year in YEARS:
                value_key = '{column}_{year}'.format(column=column, year=year)
                cumulative_key = '{column}_cumulative_{year}'.format(column=column, year=year)
                cumulative += row[value_key]
                row[cumulative_key] = cumulative

        table.update(row, ['munid'])


if __name__ == '__main__':
    post_process()
