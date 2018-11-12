# A donde van los desaparecidos

README is @TODO.

## Requirements

* NodeJS (yarn optional)
* GNU make
* PostgreSQL + PostGIS
* Python 3
* GDAL
* Mapbox + AWS S3 (for deployment)

## Install

```
yarn install
source env.sh
make all
```

## Deploy

```
gatsby build && aws s3 sync ./public s3://graphics.adondevanlosdesparicidos.org/ --acl public-read --delete
```

## Events

| Category     | Action      | Label | Description                    |
| ------------ | ----------- | ----- | ------------------------------ |
| play button  | start       | none  | Start playing                  |
| play button  | stop        | none  | Stop playing                   |
| play button  | restart     | none  | Rewind player                  |
| switch pgr/state buttons | \[pgr/state\] | none | PGR toggle (nat'l map) |
| switch data type buttons | \[fosas, cuerpos\] | none | Data type toggle |
| year scrubber | click year | \[2006-2016, total\] | Interact with year scrubber  |

