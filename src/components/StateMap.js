import React from 'react';
import ReactMapboxGl, { Source, Layer, GeoJSONLayer, Popup } from "react-mapbox-gl";
import HoverChart from './HoverChart';
import range from 'lodash/range';
import max from 'lodash/max';
import cloneDeep from 'lodash/cloneDeep';
import flatten from 'lodash/flatten';
import * as d3Scale from 'd3-scale';

import 'mapbox-gl/dist/mapbox-gl.css';

const sourceGeojson = require('../../data/processed-geojson/municipales-centroids.json');


const DEFAULT_MAP_PADDING = 15;

class StateMap extends React.Component {

  constructor(props) {
    super(props);

    if (typeof window == 'undefined') { return null; }

    this.Map = ReactMapboxGl({
      accessToken: "pk.eyJ1IjoiZGF2aWRlYWRzIiwiYSI6ImNpZ3d0azN2YzBzY213N201eTZ3b2E0cDgifQ.ZCHD8ZAk32iAp9Ue3tPVVg",
      minZoom: 2.8,
      maxZoom: 9,
    });

    if (props.selectedState.state_code) {
      const newFeatures = sourceGeojson.features.filter( (f) => f.properties.CVE_ENT == props.selectedState.state_code );
      sourceGeojson.features = newFeatures;
    }

    const bounds = [props.selectedState.bounds.slice(0, 2), props.selectedState.bounds.slice(2)];
    this.state = {
      fitBounds: bounds,
      circleSteps: props.circleSteps,
      hoverInfo: null,
      geojson: sourceGeojson,
    }
  }

  _getSourceFeatures(map, source) {
    const { selectedState, mapFilter } = this.props;
    const features = map.querySourceFeatures(source.sourceId, {
      sourceLayer: source.sourceId,
      filter: mapFilter,
    })
    return features;
  }


  onStyleLoad = (map, style) => {
    const selectedState = this.props.selectedState;
    const bounds = [selectedState.bounds.slice(0, 2), selectedState.bounds.slice(2)];
    map.fitBounds(bounds, { padding: DEFAULT_MAP_PADDING });
    setTimeout(() => {
      const paddedBounds = map.getBounds();
      map.setMaxBounds(paddedBounds);
    }, 1000);
  }

  onSourceData = (map, source) => {
    const { selectedStateData, onDataChange, onMunicipioLoad } = this.props;
    const { circleSteps } = this.state;

    // Only trigger when selectedStateData is still null
    if (source.sourceId == 'estatales' && !selectedStateData) {
      const features = this._getSourceFeatures(map, source);

      // The initial source loaded calls end up empty
      if (features.length) {
        let selectedStateData = cloneDeep(features[0].properties);
        selectedStateData.yearlyFosasData = JSON.parse(selectedStateData.yearlyFosasData);
        onDataChange(selectedStateData);
      }
    }

    if (source.sourceId.startsWith('geojson') && !this.props.circleSteps) {
      const features = this._getSourceFeatures(map, source);
      if (features.length) {
        const circleSteps = {...circleSteps}

        const maxFosas = max(features.map( (feature) => (feature.properties.num_fosas_cumulative_2016)));
        const fosasScale = d3Scale.scaleSqrt().domain([0, maxFosas]).range([0, 20]);
        circleSteps.fosas = flatten(range(0, maxFosas + 1).map( (value, i) => ( [value, fosasScale(value)] ) ));

        const maxCuerpos = max(features.map( (feature) => (feature.properties.num_cuerpos_cumulative_2016)));
        const cuerposScale = d3Scale.scaleSqrt().domain([0, maxCuerpos + 1]).range([0, 20]);
        circleSteps.cuerpos = flatten(range(0, maxCuerpos).map( (value, i) => ( [value, cuerposScale(value)] ) ));

        this.setState({circleSteps});
        onMunicipioLoad(features);
      }
    }
  }

  onMouseEnter = ({ lngLat, features}) => {
    const feature = features[0];

    const { minYear, maxYear } = this.props;
    const chartData = range(minYear + 1, maxYear + 1).map( (year, i) => {
      return {
        year: year,
        fosas: feature.properties['num_fosas_' + year] || 0,
        cuerpos: feature.properties['num_cuerpos_' + year] || 0,
      };
    });

    const hoverInfo = {
      lngLat: lngLat,
      feature: feature,
      chartData: chartData,
    };
    this.setState({ hoverInfo });
  }

  onMouseLeave = () => {
    const hoverInfo = null;
    this.setState({ hoverInfo });
  }

  render() {
    if (typeof window == 'undefined') { return null; }
    const { Map } = this;
    const { beforeLayer, selectedState, selectedStateData, selectedVar,
              selectedYear, minYear, maxYear, yearColorScale, mapFilter, hideMunicipales, hideStateOutline } = this.props;
    const { fitBounds, circleSteps, hoverInfo, geojson } = this.state;

    return (
      <div className="municipio-map-wrapper">
        <div className="municipio-map">
          <Map
            style="mapbox://styles/davideads/cjk3b13bs2t362srohj2fqshs/"
            containerStyle={{
              height: "100%",
              width: "100%"
            }}
            fitBounds={fitBounds}
            fitBoundsOptions={{padding: DEFAULT_MAP_PADDING}}
            onSourceData={this.onSourceData}
            onStyleLoad={this.onStyleLoad}
            ref={(mapbox) => { this.mapbox = mapbox; }}
          >

            <Source
              id="municipalesshapes"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.1y2adviu'
              }}
            />

            <Source
              id="estatales"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.8vvusyey'
              }}
            />

            <Layer
              id="stateFillLayer"
              sourceId="estatales"
              sourceLayer="estatales"
              before={beforeLayer}
              filter={mapFilter}
              type='fill'
              paint={{
                'fill-color': '#fff',
                'fill-opacity': 1,
              }}
            />

            {!hideStateOutline && (
              <Layer
                id="stateOutlineLayer"
                sourceId="estatales"
                sourceLayer="estatales"
                before={beforeLayer}
                filter={mapFilter}
                type='line'
                paint={{
                  'line-color': '#999999',
                  'line-width': 0.5,
                  'line-opacity': 1,
                }}
              />
            )}

            {!hideMunicipales && (
              <Layer
                id="municipioOutlineLayer"
                sourceId="municipalesshapes"
                sourceLayer="municipales"
                before={beforeLayer}
                filter={mapFilter}
                minZoom={1}
                maxZoom={11}
                type='line'
                paint={{
                  'line-color': '#ccc',
                  'line-width': 0.5,
                  'line-opacity': 0.3,
                }}
              />
            )}

            {range(minYear + 1, maxYear + 1).reverse().map( (year, i) => (
            <GeoJSONLayer
              key={'geojson' + i}
              data={geojson}
              before={beforeLayer}
              circleLayout={{
                visibility: (selectedYear == 2005 || selectedYear >= year) ? 'visible' : 'none',
              }}
              circlePaint={{
                'circle-color': yearColorScale(year),
                'circle-opacity': 1,
                'circle-stroke-width': 0,
                'circle-radius': (circleSteps != null) ? [
                  'step',
                  ['get', 'num_' + selectedVar + '_cumulative_' + year],
                  0
                ].concat(circleSteps[selectedVar]) : 0
              }}
            />
            ))}

            <GeoJSONLayer
              data={geojson}
              before={beforeLayer}
              circleLayout={{
                visibility: 'visible',
              }}
              circlePaint={{
                'circle-color': 'white',
                'circle-opacity': 0.1,
                'circle-stroke-width': 0,
                'circle-radius': (circleSteps != null) ? [
                  'step',
                  ['get', 'num_' + selectedVar + '_cumulative_' + 2016],
                  0
                ].concat(circleSteps[selectedVar]) : 0
              }}
              circleOnMouseEnter={this.onMouseEnter}
              circleOnMouseLeave={this.onMouseLeave}
            />


            { hoverInfo && (
              <Popup coordinates={hoverInfo.feature.geometry.coordinates}>
                <h3>{hoverInfo.feature.properties.NOM_MUN}</h3>
                <p><strong>Fosas</strong> {hoverInfo.feature.properties.num_fosas_total}</p>
                <HoverChart
                  hoverInfo={hoverInfo}
                  yearColorScale={yearColorScale}
                  selectedVar='fosas'
                />
                <p><strong>Cuerpos</strong> {hoverInfo.feature.properties.num_cuerpos_total}</p>
                <HoverChart
                  hoverInfo={hoverInfo}
                  yearColorScale={yearColorScale}
                  selectedVar='cuerpos'
                />
              </Popup>
            )}

          </Map>
        </div>
      </div>
    )
  }
}


export default StateMap;
