import React from 'react';
import ReactMapboxGl, { Source, Layer, GeoJSONLayer, Popup } from "react-mapbox-gl";
import HoverChart from './HoverChart';
import range from 'lodash/range';
import max from 'lodash/max';
import flatten from 'lodash/flatten';
import throttle from 'lodash/throttle';
import find from 'lodash/find';
import * as d3Scale from 'd3-scale';
import slugify from 'slugify';

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

    if (source.sourceId.startsWith('geojson') && !this.props.circleSteps) {
      const features = this._getSourceFeatures(map, source);
      if (features.length) {
        const circleSteps = {...circleSteps}

        const maxFosas = max(features.map( (feature) => (feature.properties.fosas_cumulative_2016)));
        const fosasScale = d3Scale.scaleSqrt().domain([0, maxFosas]).range([0, 20]);
        circleSteps.fosas = flatten(range(0, maxFosas + 1).map( (value, i) => ( [value, fosasScale(value)] ) ));

        const maxCuerpos = max(features.map( (feature) => (feature.properties.cuerpos_cumulative_2016)));
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
    const munData = range(minYear + 1, maxYear + 1).map( (year, i) => {
      return {
        year: year,
        fosas: feature.properties['fosas_' + year] || 0,
        cuerpos: feature.properties['cuerpos_' + year] || 0,
      };
    });

    let selectedStateData;

    if (this.props.allStateData) {
      selectedStateData = find(this.props.allStateData.edges, (d) => (d.node.state_code == feature.properties.CVE_ENT)).node;
    } else {
      selectedStateData = this.props.selectedState;
    }

    const hoverInfo = {
      lngLat: lngLat,
      feature: feature,
      munData: munData,
      stateData: selectedStateData,
    };
    this.setState({ hoverInfo });
  }

  onMouseLeave = () => {
    const hoverInfo = null;
    this.setState({ hoverInfo });
  }

  onCircleClick = ({ features }) => {
    if (window.location.pathname === '/') {
      const feature = features[0];
      const slug = slugify(feature.properties.state_name.toLowerCase());
      window.location = `https://adondevanlosdesaparecidos.org/data/${slug}/`;
    }
  }

  onResize = () => {
    const map = this.mapbox.state.map;
    const selectedState = this.props.selectedState;
    const bounds = [selectedState.bounds.slice(0, 2), selectedState.bounds.slice(2)];
    map.fitBounds(bounds, { padding: DEFAULT_MAP_PADDING })
  }

  componentDidMount() {
    window.addEventListener("resize", throttle(this.onResize, 500));
  }

  render() {
    if (typeof window == 'undefined') { return null; }
    const { Map } = this;
    const { beforeLayer, selectedState, selectedStateData, selectedVar, selectedYear,
            minYear, maxYear, yearColorScale, mapFilter, negativeFilter,
            hideMunicipales, hideStateOutline, showPGR } = this.props;
    const { fitBounds, circleSteps, hoverInfo, geojson } = this.state;

    return (
      <div className="municipio-map-wrapper">
        <div className="municipio-map">
          <Map
            style="mapbox://styles/davideads/cjk3b13bs2t362srohj2fqshs/?fresh=true"
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
                'url': 'mapbox://davideads.2ebn32m1'
              }}
              />

            <Source
              id="municipalescentroids"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.5yjavfyx'
              }}
            />

            <Source
              id="pgrcentroids"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.4zwtyicu'
              }}
            />

            <Layer
              id="stateFillLayer"
              sourceId="estatales"
              sourceLayer="estatales"
              before={beforeLayer}
              filter={negativeFilter}
              type='fill'
              paint={{
                'fill-color': (negativeFilter) ? '#ddd' : '#fff',
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
            <Layer
              key={'municipalescentroids' + i}
              id={'municipalescentroids' + year}
              sourceId="municipalescentroids"
              sourceLayer="municipalescentroids"
              type="circle"
              before={beforeLayer}
              filter={mapFilter}
              layout={{
                visibility: (!showPGR && (selectedYear == 2005 || selectedYear >= year)) ? 'visible' : 'none',
              }}
              paint={{
                'circle-color': yearColorScale(year),
                'circle-opacity': 1,
                'circle-stroke-width': 0,
                'circle-radius': (circleSteps != null) ? [
                  'step',
                  ['get', selectedVar + '_cumulative_' + year],
                  0
                ].concat(circleSteps[selectedVar]) : 0
              }}
            />
            ))}

            <GeoJSONLayer
              data={geojson}
              before={beforeLayer}
              circleLayout={{
                visibility: (!showPGR) ? 'visible' : 'none',
              }}
              circlePaint={{
                'circle-color': 'white',
                'circle-opacity': 0.1,
                'circle-stroke-width': 0,
                'circle-radius': (circleSteps != null) ? [
                  'step',
                  ['get', selectedVar + '_cumulative_' + 2016],
                  0
                ].concat(circleSteps[selectedVar]) : 0
              }}
              circleOnMouseEnter={this.onMouseEnter}
              circleOnMouseLeave={this.onMouseLeave}
              circleOnClick={this.onCircleClick}
            />

            {range(minYear + 1, maxYear + 1).reverse().map( (year, i) => (
            <Layer
              key={'pgrcentroids' + i}
              id={'pgrcentroids' + year}
              sourceId="pgrcentroids"
              sourceLayer="pgrcentroids"
              type="circle"
              before={beforeLayer}
              filter={mapFilter}
              layout={{
                visibility: (showPGR && (selectedYear == 2005 || selectedYear >= year)) ? 'visible' : 'none',
              }}
              paint={{
                'circle-color': yearColorScale(year),
                'circle-opacity': 1,
                'circle-stroke-width': 0,
                'circle-radius': (circleSteps != null) ? [
                  'step',
                  ['get', selectedVar + '_cumulative_' + year],
                  0
                ].concat(circleSteps[selectedVar]) : 0
              }}
            />
            ))}

            { hoverInfo && (
              <Popup coordinates={hoverInfo.feature.geometry.coordinates}>
                <h3>{hoverInfo.feature.properties.NOM_MUN} <span className="state-name">{hoverInfo.feature.properties.state_name}</span></h3>
                <p><strong>Fosas</strong> {hoverInfo.feature.properties.fosas_total}</p>
                <HoverChart
                  hoverInfo={hoverInfo}
                  yearColorScale={yearColorScale}
                  selectedVar='fosas'
                />
                <p><strong>Cuerpos</strong> {hoverInfo.feature.properties.cuerpos_total}</p>
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
