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
VIEWS = mapasdatacombined

.PHONY: all db tables load_data load_geo views
all : db tables load_data load_geo views
tables : $(patsubst %, table_%, $(TABLES))
views : $(patsubst %, view_%, $(VIEWS))
load_data : $(patsubst %, load_%, $(TABLES))
load_geo : $(patsubst %, load_shapefile_%, $(GEOGRAPHIES))
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
	$(check_database) $(psql) -c "create extension postgis;"
	$(check_database) $(psql) -c "create extension tablefunc;"


drop_db :
	psql $(FOSAS_DB_ROOT_URL) -c "drop database $(FOSAS_DB_NAME);"


data/spreadsheets/mapasdata.xlsx :
	curl "https://docs.google.com/spreadsheets/d/e/2PACX-1vRw9i_b3bldB2U8gYmdSCto5PtOmT7J5uXo1hCNczuLzVhyvpGZyvE958BXswOf_1A_KECsC8OH2zHF/pub?output=xlsx" > $@


table_% : sql/tables/%.sql
	$(check_relation) $(psql) -f $<


view_% : sql/views/%.sql
	$(psql) -f $<


data/spreadsheets/%.csv : data/spreadsheets/%.xlsx
	python processors/$*.py $< > $@


load_% : data/spreadsheets/%.csv
	$(psql) -c "\copy $* from '$(CURDIR)/$<' with delimiter ',' csv header;"


load_shapefile_% : data/shapefiles/%.shp
	ogr2ogr -overwrite -f "PostgreSQL" PG:'$(FOSAS_GDALSTRING)' $< -nln $* -t_srs "+proj=longlat +ellps=WGS84 +no_defs +towgs84=0,0,0" -nlt PROMOTE_TO_MULTI


clean_files :
	rm data/spreadsheets/*
