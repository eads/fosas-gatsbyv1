create or replace view mapasdatacombined as
  select
    munid,
    year,
    cve_ent,
    cve_mun,
    sum(fosas) as fosas,
    sum(cuerpos) as cuerpos,
    sum(cuerpos_identificados) as cuerpos_identificados,
    sum(restos) as restos,
    sum(restos_identificados) as restos_identificados,
    sum(craneos) as craneos
  from mapasdata d
    group by munid, year, cve_ent, cve_mun
  ;
