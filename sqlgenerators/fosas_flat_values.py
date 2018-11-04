#!/usr/bin/env python
import itertools
import sqlparse
from jinja2 import Template


COLUMNS = [
    'fosas',
    'cuerpos',
    'cuerpos_identificados',
    'restos',
    'restos_identificados',
    'craneos',
]
YEARS = ['all_years'] + [y for y in range(2006, 2018)]

QUERY_TEMPLATE = """
drop materialized view if exists flat_values;
create materialized view flat_values as
    select
        {% for field in fields %}
            {{field}},
        {% endfor %}
        {{columns[0]}}.munid

    {% for column in columns %}
        {% if loop.first %}from{% else %}inner join{% endif %} (
            select * from crosstab (
                $$
                    select munid, year, {{column}} from mapasdatacombined
                    order by munid, year
                $$, $$
                    select distinct(year) from mapasdata order by year
                $$
            ) as (
                munid character varying,
                {% for year in years %}
                    "{{column}}_{{year}}" int{{ "," if not loop.last }}
                {% endfor %}
            )
        ) {{column}}
        {% if not loop.first %}
            on {{column}}.munid = {{columns[0]}}.munid
        {% endif %}
    {% endfor %}

    ;
"""


def generate():
    template = Template(QUERY_TEMPLATE)
    permutations = itertools.product(COLUMNS, YEARS)
    fields = ['{0}_{1}'.format(*row) for row in permutations]
    sql = template.render(fields=fields, columns=COLUMNS, years=YEARS)
    print(sqlparse.format(sql, reindent=True, keyword_case='upper'))


if __name__ == '__main__':
    generate()
