#!/usr/bin/env python
import itertools
import sqlparse
from jinja2 import Template


COLUMNS = [
    'fosas',
    'cuerpos',
    # 'cuerpos_identificados',
    # 'restos',
    # 'restos_identificados',
    # 'craneos',
]
YEARS = ['all_years'] + [y for y in range(2006, 2018)]

QUERY_TEMPLATE = """
create table if not exists mapasdata_flat as
    select
        {% for field in fields %}
            coalesce({{field}}, 0) as {{field}},
        {% endfor %}
        {{columns[0]}}.munid

    {% for column in columns %}
        {% if loop.first %}from{% else %}inner join{% endif %} (
            select * from crosstab (
                $$
                    select munid, year, {{column}} from public.mapasdata
                    order by munid, year
                $$, $$
                    select distinct(year) from public.mapasdata order by year
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

    {% for column in columns %}
        inner join (
            select * from crosstab (
                $$
                    select munid, year,
                    0 as {{column}}_cumulative
                    from public.mapasdata
                    order by munid, year
                $$, $$
                    select distinct(year) from public.mapasdata order by year
                $$
            ) as (
                munid character varying,
                {% for year in years %}
                    "{{column}}_cumulative_{{year}}" int{{ "," if not loop.last }}
                {% endfor %}
            )
        ) cumulative_{{column}}
        on cumulative_{{column}}.munid = {{columns[0]}}.munid
    {% endfor %}
    ;

alter table mapasdata_flat add primary key (munid);
"""


def generate():
    template = Template(QUERY_TEMPLATE)
    permutations = list(itertools.product(COLUMNS, YEARS))
    fields = ['{0}_{1}'.format(*row) for row in permutations] + ['{0}_cumulative_{1}'.format(*row) for row in permutations]
    sql = template.render(fields=fields, columns=COLUMNS, years=YEARS)
    print(sqlparse.format(sql, reindent=True, keyword_case='upper'))


if __name__ == '__main__':
    generate()
