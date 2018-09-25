###############################################################################
#
# FOSAS LOADER
#
# You must set some environment variables:
#
# export FOSAS_DB_NAME=fosas
# export FOSAS_DB_ROOT_URL=postgres://localhost/
# export FOSAS_DB_URL=$FOSAS_DB_ROOT_URL$FOSAS_DB_NAME
# export FOSAS_GDALSTRING="dbname=$FOSAS_DB_NAME"
#
###############################################################################

GEOGRAPHIES = areas_geoestadisticas_estatales areas_geoestadisticas_municipales
TABLES = mapasdata

.PHONY: all geojson merge
tables : $(patsubst %, table_%, $(TABLES))

#geojson: $(patsubst %, data/source-geojson/%.json, $(GEOGRAPHIES))
#merge: data/processed-geojson/municipales.json data/processed-geojson/municipales-centroids.json data/processed-geojson/estatales.json data/processed-geojson/estatales-centroids.json src/data/mxstates.json
#tiles: $(patsubst %, data/mbtiles/%.mbtiles, $(GEOGRAPHIES)) $(patsubst %, data/mbtiles/%-centroids.mbtiles, $(GEOGRAPHIES)) data/mbtiles/pgr-centroids.mbtiles

define psql
	psql $(FOSAS_DB_URL)
endef


define check_database
	$(psql) -c "select 1;" > /dev/null 2>&1 ||
endef


define check_relation
 $(psql) -c "\d $*" > /dev/null 2>&1 ||
endef


db :
	$(check_database) psql $(FOSAS_DB_ROOT_URL) -c "create database $(FOSAS_DB_NAME);"
	$(psql) -c "create extension postgis;"


drop_db :
	psql $(FOSAS_DB_ROOT_URL) -c "drop database $(FOSAS_DB_NAME);"


data/spreadsheets/mapasdata.xlsx :
	curl "https://docs.google.com/spreadsheets/d/e/2PACX-1vRw9i_b3bldB2U8gYmdSCto5PtOmT7J5uXo1hCNczuLzVhyvpGZyvE958BXswOf_1A_KECsC8OH2zHF/pub?output=xlsx" > $@


table_% : sql/tables/%.sql
	$(check_relation) $(psql) -f $<


data/spreadsheets/%.csv : data/spreadsheets/%.xlsx
	python processors/$*.py $< > $@


load_% : data/spreadsheets/%.csv
	$(psql) -c "\copy $* from '$(CURDIR)/$<' with delimiter ',' csv header;"


load_shapefile_% : data/shapefiles/%.shp
	ogr2ogr -overwrite -f "PostgreSQL" PG:'$(FOSAS_GDALSTRING)' $< -nln $* -t_srs "+proj=longlat +ellps=WGS84 +no_defs +towgs84=0,0,0" -nlt PROMOTE_TO_MULTI


#data/source-geojson/%.json : data/shapefiles/areas_geoestadisticas_%.shp
	#ogr2ogr $@ $< -f GeoJSON -t_srs "+proj=longlat +ellps=WGS84 +no_defs +towgs84=0,0,0"

# this is UGLY
#data/processed-geojson/municipales.json data/processed-geojson/municipales-centroids.json data/processed-geojson/estatales.json data/processed-geojson/estatales-centroids.json src/data/mxstates.json : data/source-geojson/estatales.json data/source-geojson/municipales.json data/source/mapas-data-concentrado.xlsx
	#python scripts/merge_data.py

#data/mbtiles/%.mbtiles : data/processed-geojson/%.json
	#tippecanoe -o $@ -Z 1 -z 11 -r1 $<

#data/mbtiles/%-centroids.mbtiles : data/processed-geojson/%-centroids.json
	#tippecanoe -o $@ -Z 1 -z 11 $<

#static/tiles/%/ : data/mbtiles/%.mbtiles
	#mb-util --image_format=pbf data/mbtiles/$*.mbtiles static/tiles/$*/

#clean : clean_tiles clean_geojson clean_source clean_source_geojson

#clean_tiles :
	#rm -Rf data/mbtiles/*

#clean_geojson :
	#rm -Rf data/processed-geojson/*

#clean_source :
	#rm -Rf data/source/*

#clean_source_geojson :
	#rm -Rf data/source-geojson/*
