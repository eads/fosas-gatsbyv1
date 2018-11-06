create materialized view if not exists municipales as
  select
    concat(m.cve_ent, m.cve_mun) as munid,
    m.ogc_fid,
    m.cve_ent,
    m.cve_mun,
    m.nom_mun,
    m.wkb_geometry
  from src.areas_geoestadisticas_municipales m
;
