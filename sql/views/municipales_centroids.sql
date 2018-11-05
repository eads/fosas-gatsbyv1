create materialized view municipales_centroids as
  select
    m.cve_ent,
    m.cve_mun,
    m.nom_mun,
    e.nom_ent,
    d.*,
    st_centroid(m.wkb_geometry) as geom
  from
    mapasdata_flat d
  join
    municipales m on d.munid = m.munid
  join
    estatales e on m.cve_ent = e.cve_ent
;
