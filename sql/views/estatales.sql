create materialized view estatales as
  select
    e.ogc_fid,
    e.cve_ent,
    e.nom_ent,
    e.wkb_geometry
  from src.areas_geoestadisticas_estatales e
;
