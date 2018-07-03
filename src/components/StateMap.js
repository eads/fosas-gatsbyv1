import React from 'react';
import ReactMapboxGl, { Source, Layer, ZoomControl }  from "react-mapbox-gl";
import range from 'lodash/range';
import max from 'lodash/max';
import cloneDeep from 'lodash/cloneDeep';
import flatten from 'lodash/flatten';
import * as d3Scale from 'd3-scale';

import 'mapbox-gl/dist/mapbox-gl.css';

const DEFAULT_MAP_PADDING = 15;

class StateMap extends React.Component {

  constructor(props) {
    super(props);

    this.Map = ReactMapboxGl({
      accessToken: "pk.eyJ1IjoiZGF2aWRlYWRzIiwiYSI6ImNpZ3d0azN2YzBzY213N201eTZ3b2E0cDgifQ.ZCHD8ZAk32iAp9Ue3tPVVg",
      minZoom: 3.5,
      maxZoom: 8,
    });

    const bounds = [props.selectedState.bounds.slice(0, 2), props.selectedState.bounds.slice(2)];
    this.state = {
      fitBounds: bounds,
      circleSteps: null,
    }
  }

  _getSourceFeatures(map, source) {
    const { selectedState } = this.props;
    const features = map.querySourceFeatures(source.sourceId, {
      sourceLayer: source.sourceId,
      filter: ["==", "CVE_ENT", selectedState.state_code],
    })
    return features;
  }


  onStyleLoad = (map, style) => {
    const selectedState = this.props.selectedState;
    const bounds = [selectedState.bounds.slice(0, 2), selectedState.bounds.slice(2)];
    map.fitBounds(bounds, { padding: DEFAULT_MAP_PADDING });
  }

  onSourceData = (map, source) => {
    const { selectedStateData, onDataChange } = this.props;
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

    if (source.sourceId == 'municipalescentroids') {
      const features = this._getSourceFeatures(map, source);

      if (features.length && !circleSteps) {
        const circleSteps = {...circleSteps}

        const maxFosas = max(features.map( (feature) => (feature.properties.num_fosas_cumulative_2016)));
        const fosasScale = d3Scale.scaleSqrt().domain([0, maxFosas]).range([0, 20]);
        circleSteps.fosas = flatten(range(0, maxFosas).map( (value, i) => ( [value, fosasScale(value)] ) ));

        const maxCuerpos = max(features.map( (feature) => (feature.properties.num_cuerpos_cumulative_2016)));
        const cuerposScale = d3Scale.scaleSqrt().domain([0, maxCuerpos]).range([0, 20]);
        circleSteps.cuerpos = flatten(range(0, maxCuerpos).map( (value, i) => ( [value, cuerposScale(value)] ) ));

        this.setState({circleSteps});
      }
    }

  }

  render() {
    const { Map } = this;
    const { beforeLayer, selectedState, selectedStateData, selectedVar,
              selectedYear, minYear, maxYear, yearColorScale } = this.props;
    const { fitBounds, circleSteps } = this.state;

    return (
      <div className="municipio-map-wrapper">
        <div className="municipio-map">
          <Map
            style="mapbox://styles/davideads/cjirt87zo2kuw2rp7da7jmizf/"
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
              id="municipalescentroids"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.30q52zlr'
              }}
            />

            <Source
              id="municipalesshapes"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.aeiezxnw'
              }}
            />

            <Source
              id="estatales"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.2lwa8js4'
              }}
            />

            <Layer
              id="stateFillLayer"
              sourceId="estatales"
              sourceLayer="estatales"
              before={beforeLayer}

              filter={["==", "CVE_ENT", selectedState.state_code]}

              type='fill'
              paint={{
                'fill-color': '#181818',
                'fill-opacity': 1,
              }}
            />

            <Layer
              id="stateOutlineLayer"
              sourceId="estatales"
              sourceLayer="estatales"
              before={beforeLayer}
              filter={["==", "CVE_ENT", selectedState.state_code]}
              type='line'
              paint={{
                'line-color': '#888',
                'line-width': 1,
              }}
            />

            <Layer
              id="municipioOutlineLayer"
              sourceId="municipalesshapes"
              sourceLayer="municipales"
              before={beforeLayer}
              minZoom={1}
              maxZoom={11}
              filter={["==", "CVE_ENT", selectedState.state_code]}
              type='line'
              paint={{
                'line-color': '#666',
                'line-width': 0.5,
                'line-opacity': 0.3
              }}
            />

            {range(minYear + 1, maxYear + 1).map( (year, i) => (
              <Layer
                id={"centroidLayer"+year}
                sourceId="municipalescentroids"
                sourceLayer="municipalescentroids"
                before={(i === 0) ? beforeLayer : "centroidLayer"+ (year-1)}
                key={'cumulative'+year}
                filter={["==", "CVE_ENT", selectedState.state_code]}
                minZoom={1}
                maxZoom={11}
                type='circle'
                layout={{
                  visibility: (selectedYear == 2005 || selectedYear == year) ? 'visible' : 'none',
                }}
                paint={{
                  'circle-radius': (circleSteps != null) ? [
                    'step',
                    ['get', 'num_' + selectedVar + ((selectedYear == 2005) ? '_cumulative_' : '_') + year],
                    0
                  ].concat(circleSteps[selectedVar]) : 0,
                  'circle-color': yearColorScale(year),
                  'circle-opacity': (selectedYear == 2005) ? 1 : .9,
                  'circle-stroke-width': 0,
                  'circle-stroke-color': '#fff',
                  'circle-stroke-opacity': 0.3,
                }}
              >
              </Layer>
            ))}
            <ZoomControl />
          </Map>
        </div>
      </div>
    )
  }
}


export default StateMap;

/* 
 *             <Layer
              id="stateOutlineLayer"
              sourceId="estatales"
              sourceLayer="estatales"
              before={BEFORELAYER}

              filter={["==", "CVE_ENT", this.state.stateCode]}

              type='line'
              paint={{
                'line-color': '#888',
                'line-width': 1,
              }}
            />

            <Layer
              id="municipioOutlineLayer"
              sourceId="municipales"
              sourceLayer="municipales"
              before={BEFORELAYER}
              minZoom={1}
              maxZoom={11}
              filter={["==", "CVE_ENT", this.state.stateCode]}

              type='line'
              paint={{
                'line-color': '#666',
                'line-width': 0.5,
                'line-opacity': 0.3
              }}
              />

            {YEARS.map( (theYear, i) => (
              <Layer
                id={"centroidLayer"+theYear}
                sourceId="centroids"
                sourceLayer="municipalescentroids"
                before={(i === 0) ? BEFORELAYER : "centroidLayer"+ (theYear-1)}
                key={'cumulative'+theYear}
                filter={["==", "CVE_ENT", this.state.stateCode]}
                minZoom={1}
                maxZoom={11}

                type='circle'
                layout={{
                  visibility: (this.state.selectedYear == 2005 || this.state.selectedYear == theYear) ? 'visible' : 'none',
                }}
                paint={{
                  'circle-radius': [
                      'step',
                      ['get', 'num_' + this.state.selectedVar + ((this.state.selectedYear == 2005) ? '_cumulative_' : '_') + theYear],
                      0,
                      ...circleSteps
                  ],
                  'circle-color': yearColor(theYear),
                  'circle-opacity': (this.state.selectedYear == 2005) ? 1 : .9,
                  'circle-stroke-width': 0,
                  'circle-stroke-color': '#fff',
                  'circle-stroke-opacity': 0.3,
                }}
              />
              ))}
              */
