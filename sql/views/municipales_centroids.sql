create materialized view if not exists municipales_centroids as
  select
    m.cve_ent,
    m.cve_mun,
    m.nom_mun,
    e.nom_ent,
    d.*,
    case
      when (m.cve_ent = '06' and m.cve_mun = '009') then ST_SetSRID(ST_MakePoint(-103.803, 18.854), 4326)
      else st_centroid(m.wkb_geometry)
    end as geom
  from
    mapasdata_flat d
  join
    municipales m on d.munid = m.munid
  join
    estatales e on m.cve_ent = e.cve_ent
;
