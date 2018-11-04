create or replace view areas_geoestadisticas_muncipales_ids as
  select
    concat(m.cve_ent, m.cve_mun) as munid,
    m.ogc_fid,
    m.cve_ent,
    m.cve_mun,
    m.nom_mun,
    m.wkb_geometry
  from areas_geoestadisticas_municipales m
;
