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
TABLES = src.mapasdata
VIEWS = mapasdata municipales estatales
GEOVIEWS = municipales_centroids
GENERATEDVIEWS = mapasdata_flat
TILESETS = municipales_centroids estatales municipales

.PHONY: all db tables load_data load_geo views geojson mbtiles mapbox clean
all : db tables load_data load_geo views mbtiles
tables : $(patsubst %, table_%, $(TABLES))
views : $(patsubst %, view_%, $(VIEWS)) $(patsubst %, generated_view_%, $(GENERATEDVIEWS)) $(patsubst %, postprocess_%, $(GENERATEDVIEWS)) $(patsubst %, generated_view_%, $(GENERATEDVIEWS)) $(patsubst %, view_%, $(GEOVIEWS))
load_data : $(patsubst %, load_%, $(TABLES))
load_geo : $(patsubst %, load_shapefile_%, $(GEOGRAPHIES))
geojson : $(patsubst %, data/processed-geojson/%.json, $(TILESETS))
mbtiles : $(patsubst %, data/mbtiles/%.mbtiles, $(TILESETS))
mapbox : $(patsubst %, upload_tiles_%, $(TILESETS))
clean: drop_db clean_files


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
	$(psql) -c "create schema if not exists src;"
	$(psql) -c "create extension if not exists postgis;"
	$(psql) -c "create extension if not exists tablefunc;"


drop_db :
	psql $(FOSAS_DB_ROOT_URL) -c "drop database $(FOSAS_DB_NAME);"


data/spreadsheets/src.mapasdata.xlsx :
	curl "https://docs.google.com/spreadsheets/d/e/2PACX-1vRw9i_b3bldB2U8gYmdSCto5PtOmT7J5uXo1hCNczuLzVhyvpGZyvE958BXswOf_1A_KECsC8OH2zHF/pub?output=xlsx" > $@


table_% : sql/tables/%.sql
	$(check_relation) $(psql) -f $<


view_% : sql/views/%.sql
	$(psql) -f $<


generated_view_% :
	python sqlgenerators/$*.py | $(psql)


data/spreadsheets/%.csv : data/spreadsheets/%.xlsx
	python processors/$*.py $< > $@


load_% : data/spreadsheets/%.csv
	$(psql) -c "\copy $* from '$(CURDIR)/$<' with delimiter ',' csv header;"


load_shapefile_% : data/shapefiles/%.shp
	ogr2ogr -overwrite -f "PostgreSQL" PG:'$(FOSAS_GDALSTRING)' $< -nln src.$* -t_srs "+proj=longlat +ellps=WGS84 +no_defs +towgs84=0,0,0" -nlt PROMOTE_TO_MULTI


.PRECIOUS: data/processed-geojson/%.json
data/processed-geojson/%.json :
	ogr2ogr -f GeoJSON $@ PG:$(FOSAS_GDALSTRING) -sql "select * from $*;"


data/mbtiles/municipales_centroids.mbtiles : data/processed-geojson/municipales_centroids.json
	tippecanoe -r1 -Z2 -z11 -ps -o $@ -f $<


data/mbtiles/%.mbtiles : data/processed-geojson/%.json
	tippecanoe -ab -Z2 -z11 -S 5 -o $@ -f $<


upload_tiles_% : data/mbtiles/%.mbtiles
	mapbox upload adondevan.$* $<


postprocess_% : generated_view_%
	python processors/postprocess_$*.py


clean_% :
	rm -Rf data/$*/*
