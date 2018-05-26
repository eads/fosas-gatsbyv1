data/municipales.geojson : data/areas_geoestadisticas_municipales.shp
	ogr2ogr data/municipalities.geojson data/areas_geoestadisticas_municipales.shp -f GeoJSON -t_srs "+proj=longlat +ellps=WGS84 +no_defs +towgs84=0,0,0"

data/estatales.geojson : data/areas_geoestadisticas_estatales.shp
	ogr2ogr data/estatales.geojson data/areas_geoestadisticas_estatales.shp -f GeoJSON -t_srs "+proj=longlat +ellps=WGS84 +no_defs +towgs84=0,0,0"

data/municipales-fosas.geojson : data/municipales.geojson data/mapas-data-concentrado.xlsx
	python scripts/merge_data.py



#data/municipalities-fosas-simplified.geojson : data/municipalities-fosas.geojson
	#cat data/municipalities-fosas.geojson | simplify-geojson -t 0.001 > data/municipalities-fosas-simplified.geojson
