create or replace view mapasdatacombined as
  select
    d.*,
    e.nom_ent,
    m.nom_mun,
    m.wkb_geography
  from mapasdata d
  join areas_geoestadisticas_estatales e
    on d.cve_ent = e.cve_ent
  join areas_geoestadisticas_municipales m
    on d.cve_mun = m.cve_mun and d.cve_ent = m.cve_ent
  ;
