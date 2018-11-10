create materialized view if not exists pgr_centroids as
  WITH cte AS (
   SELECT
      substring(munid FROM 3 FOR 2) AS cve_ent,
      substring(munid FROM 5 FOR 3) AS cve_mun,
      d.*
    FROM
      mapasdata_flat d
    WHERE substring(munid, 1, 2) = '00'

  )
  SELECT
    m.nom_mun,
    e.nom_ent,
    c.*,
    case
      when (m.cve_ent = '06' and m.cve_mun = '009') then ST_SetSRID(ST_MakePoint(-103.803, 18.854), 4326)
      else st_centroid(m.wkb_geometry)
    end as geom
  FROM cte c
  JOIN
    municipales m ON c.cve_ent = m.cve_ent AND c.cve_mun = m.cve_mun
  JOIN
    estatales e ON m.cve_ent = e.cve_ent
;
