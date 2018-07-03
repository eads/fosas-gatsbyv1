GEOGRAPHIES = municipales estatales

.PHONY: all geojson merge
all: tiles
geojson: $(patsubst %, data/source-geojson/%.json, $(GEOGRAPHIES))
merge: data/processed-geojson/municipales.json data/processed-geojson/municipales-centroids.json data/processed-geojson/estatales.json data/processed-geojson/estatales-centroids.json src/data/mxstates.json
tiles: $(patsubst %, data/mbtiles/%.mbtiles, $(GEOGRAPHIES)) $(patsubst %, data/mbtiles/%-centroids.mbtiles, $(GEOGRAPHIES))

data/source/mapas-data-concentrado.xlsx :
	curl "https://docs.google.com/spreadsheets/d/e/2PACX-1vRw9i_b3bldB2U8gYmdSCto5PtOmT7J5uXo1hCNczuLzVhyvpGZyvE958BXswOf_1A_KECsC8OH2zHF/pub?output=xlsx" > data/source/mapas-data-concentrado.xlsx

data/source-geojson/%.json : data/shapefiles/areas_geoestadisticas_%.shp
	ogr2ogr $@ $< -f GeoJSON -t_srs "+proj=longlat +ellps=WGS84 +no_defs +towgs84=0,0,0"

# this is UGLY
data/processed-geojson/municipales.json data/processed-geojson/municipales-centroids.json data/processed-geojson/estatales.json data/processed-geojson/estatales-centroids.json src/data/mxstates.json : data/source-geojson/estatales.json data/source-geojson/municipales.json data/source/mapas-data-concentrado.xlsx
	python scripts/merge_data.py

data/mbtiles/%.mbtiles : data/processed-geojson/%.json
	tippecanoe -o $@ -Z 1 -z 11 -b0 -r1 -pk -pf $<

data/mbtiles/%-centroids.mbtiles : data/processed-geojson/%-centroids.json
	tippecanoe -o $@ -Z 1 -z 11 -b0 -r1 -pk -pf $<

static/tiles/%/ : data/mbtiles/%.mbtiles
	mb-util --image_format=pbf data/mbtiles/$*.mbtiles static/tiles/$*/

clean :
	rm -Rf data/mbtiles/*
	rm -Rf data/processed-geojson/*
	rm -Rf data/source/*
	rm -Rf data/source-geojson/*
