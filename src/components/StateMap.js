import React from 'react';
import ReactMapboxGl, { Source, Layer, ZoomControl }  from "react-mapbox-gl";
import range from 'lodash/range';
import cloneDeep from 'lodash/cloneDeep';

import 'mapbox-gl/dist/mapbox-gl.css';

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
    }
  }

  componentDidMount() {
    const selectedState = this.props.selectedState;
    const bounds = [selectedState.bounds.slice(0, 2), selectedState.bounds.slice(2)];
  }

  _getSourceFeatures(map, source) {
    const { selectedState } = this.props;
    const features = map.querySourceFeatures(source.sourceId, {
      sourceLayer: source.sourceId,
      filter: ["==", "CVE_ENT", selectedState.state_code],
    })
    return features;
  }

  onSourceData = (map, source) => {
    const { selectedStateData, onDataChange } = this.props;

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

    //if (data.sourceId == 'centroids') {
      //const features = map.querySourceFeatures("centroids", {
        //sourceLayer: "municipalescentroids",
        //filter: ["==", "CVE_ENT", this.state.stateCode],
      //})
      //if (features.length && this.state.maxFosas == null && this.state.maxCuerpos == null) {
        //const maxFosas = _.max(features.map( (feature) => (feature.properties.num_fosas_cumulative_2016)))
        //const maxCuerpos = _.max(features.map( (feature) => (feature.properties.num_cuerpos_cumulative_2016)))
        //this.setState({
          //maxFosas: maxFosas,
          //maxCuerpos: maxCuerpos,
        //})
      //}
    //}

  }

  render() {
    const { Map } = this;
    const { beforeLayer, selectedState, selectedStateData, selectedVar,
              selectedYear, minYear, maxYear, yearColorScale } = this.props;
    const { fitBounds } = this.state;

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
            fitBoundsOptions={{padding: 15}}
            onSourceData={this.onSourceData}
            ref={(mapbox) => { this.mapbox = mapbox; }}
          >

            <Source
              id="municipalescentroids"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.5rgtszcw'
              }}
            />

            <Source
              id="municipalesshapes"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.aekfu8a3'
              }}
            />

            <Source
              id="estatales"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.7vp1dlm9'
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

            {range(minYear, maxYear + 1).map( (year, i) => (
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
                  'circle-radius': 5,
                  'circle-color': yearColorScale(year),
                  'circle-opacity': (selectedYear == 2005) ? 1 : .9,
                  'circle-stroke-width': 0,
                  'circle-stroke-color': '#fff',
                  'circle-stroke-opacity': 0.3,
                }}
              ></Layer>
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
