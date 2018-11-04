drop materialized view if exists flat_values;

create materialized view flat_values as
  select
    f.munid,
    fosas_all_years,
    fosas_2006,
    fosas_2007,
    fosas_2008,
    fosas_2009,
    fosas_2010,
    fosas_2011,
    fosas_2012,
    fosas_2013,
    fosas_2014,
    fosas_2015,
    fosas_2016,
    fosas_2017,
    cuerpos_all_years,
    cuerpos_2006,
    cuerpos_2007,
    cuerpos_2008,
    cuerpos_2009,
    cuerpos_2010,
    cuerpos_2011,
    cuerpos_2012,
    cuerpos_2013,
    cuerpos_2014,
    cuerpos_2015,
    cuerpos_2016,
    cuerpos_2017,
    restos_all_years,
    restos_2006,
    restos_2007,
    restos_2008,
    restos_2009,
    restos_2010,
    restos_2011,
    restos_2012,
    restos_2013,
    restos_2014,
    restos_2015,
    restos_2016,
    restos_2017,
    restos_identificados_all_years,
    restos_identificados_2006,
    restos_identificados_2007,
    restos_identificados_2008,
    restos_identificados_2009,
    restos_identificados_2010,
    restos_identificados_2011,
    restos_identificados_2012,
    restos_identificados_2013,
    restos_identificados_2014,
    restos_identificados_2015,
    restos_identificados_2016,
    restos_identificados_2017


from (
  select * from crosstab(
    $$
      select munid, year, fosas from mapasdata
    $$, $$
      select distinct(year) from mapasdata order by year
    $$
  ) as (
    munid character varying,
    "fosas_all_years" int,
    "fosas_2006" int,
    "fosas_2007" int,
    "fosas_2008" int,
    "fosas_2009" int,
    "fosas_2010" int,
    "fosas_2011" int,
    "fosas_2012" int,
    "fosas_2013" int,
    "fosas_2014" int,
    "fosas_2015" int,
    "fosas_2016" int,
    "fosas_2017" int
  )
) f

join (
  select * from crosstab(
    $$
      select munid, year, cuerpos from mapasdata
    $$, $$
      select distinct(year) from mapasdata order by year
    $$
  ) as (
    munid character varying,
    "cuerpos_all_years" int,
    "cuerpos_2006" int,
    "cuerpos_2007" int,
    "cuerpos_2008" int,
    "cuerpos_2009" int,
    "cuerpos_2010" int,
    "cuerpos_2011" int,
    "cuerpos_2012" int,
    "cuerpos_2013" int,
    "cuerpos_2014" int,
    "cuerpos_2015" int,
    "cuerpos_2016" int,
    "cuerpos_2017" int
  )
) c
on c.munid = f.munid

join (
  select * from crosstab(
    $$
      select munid, year, restos from mapasdata
    $$, $$
      select distinct(year) from mapasdata order by year
    $$
  ) as (
    munid character varying,
    "restos_all_years" int,
    "restos_2006" int,
    "restos_2007" int,
    "restos_2008" int,
    "restos_2009" int,
    "restos_2010" int,
    "restos_2011" int,
    "restos_2012" int,
    "restos_2013" int,
    "restos_2014" int,
    "restos_2015" int,
    "restos_2016" int,
    "restos_2017" int
  )
) r
on r.munid = f.munid

join (
  select * from crosstab(
    $$
      select munid, year, restos_identificados from mapasdata
    $$, $$
      select distinct(year) from mapasdata order by year
    $$
  ) as (
    munid character varying,
    "restos_identificados_all_years" int,
    "restos_identificados_2006" int,
    "restos_identificados_2007" int,
    "restos_identificados_2008" int,
    "restos_identificados_2009" int,
    "restos_identificados_2010" int,
    "restos_identificados_2011" int,
    "restos_identificados_2012" int,
    "restos_identificados_2013" int,
    "restos_identificados_2014" int,
    "restos_identificados_2015" int,
    "restos_identificados_2016" int,
    "restos_identificados_2017" int
  )
) ri
on ri.munid = f.munid

;

