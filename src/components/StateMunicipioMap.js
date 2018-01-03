import React from 'react';
import axios from 'axios';
import slugify from 'slugify';
//import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import ReactMapboxGl, { Source, Layer, ZoomControl, GeoJSONLayer }  from "react-mapbox-gl";
import * as _ from 'lodash';

import * as topojson from 'topojson-client';

import bbox from '@turf/bbox';
import transformScale from '@turf/transform-scale';

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiZGF2aWRlYWRzIiwiYSI6ImNpZ3d0azN2YzBzY213N201eTZ3b2E0cDgifQ.ZCHD8ZAk32iAp9Ue3tPVVg",
  minZoom: 4,
  maxZoom: 7.9,
});

class StateMunicipioMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedState: props.selectedState,
      selectedStateName: 'XXX',
      selectedYear: '2006',
      mapCenter: [-103.401254, 23.568096],
      mapZoom: 4,
      mxAllMunicipalities: null,
      mxAllStates: null,
      mxMunicipalities: null,
      mxStates: null,
      totalFosas: 0
    }
  }

  filterMunicipalitiesByState(muniFeatures, stateCode) {
    return {
      features: _.filter(muniFeatures.features, (f) => { return f.properties.state_code == stateCode }),
      type: 'FeatureCollection'
    }
  }

  filterState(stateFeatures, stateCode) {
    return {
      features: _.filter(stateFeatures.features, (f) => { return f.properties.state_code == stateCode }),
      type: 'FeatureCollection'
    }
  }

  selectState(stateCode) {
    var activeState = this.filterState(this.state.mxAllStates, stateCode);
    var stateBbox = bbox(transformScale(activeState, 1.2));
    this.mapbox.state.map.fitBounds(stateBbox);

    var munis = this.filterMunicipalitiesByState(this.state.mxAllMunicipalities, stateCode);

    var totalFosas = _.sumBy(munis.features, (o) => { return o.properties.total_fosas });
    console.log(totalFosas);

    this.setState({
      selectedState: stateCode,
      selectedStateName: activeState.features[0].properties.state_name,
      mxMunicipalities: munis,
      totalFosas: totalFosas
    });
  }

  componentDidMount() {
    axios.get('/map-data/mx-topojson-merged.json')
      .then(res => {
        var mx = res.data;
        this.setState({
          mxAllMunicipalities: topojson.feature(mx, mx.objects.municipalities),
          mxAllStates: topojson.feature(mx, mx.objects.states)
        }, this.selectState.bind(this, this.state.selectedState));
      });
  }

  onStateClick(e) {
    this.selectState(e.features[0].properties.state_code)
  }

  onSelectorChange(e) {
    this.setState({
      selectedYear: parseInt(e.target.value),

      // If not specified, map inherits initial center and zoom level
      center: this.mapbox.state.map.getCenter(),
      mapZoom: this.mapbox.state.map.getZoom(),
    });
  }

  render() {
    var property = this.state.selectedYear + '_fosas';

    return <div>
      <div className="municipio-map-wrapper">
        <div className="municipio-map">
          <Map
            style="mapbox://styles/davideads/cjbrhq8dz8r4l2spcryp96h6q"
            containerStyle={{
              height: "100%",
              width: "100%"
            }}
            center={this.state.mapCenter}
            zoom={[this.state.mapZoom]}
            ref={(mapbox) => { this.mapbox = mapbox; }}
          >
            {this.state.mxMunicipalities &&
            <div>
              <GeoJSONLayer
                id="all-states"
                data={this.state.mxAllStates}
                before='waterway-label'
                fillPaint={{
                    'fill-color': 'rgba(255, 255, 255, 0.15)',
                    'fill-opacity': 1
                }}
                fillOnClick={this.onStateClick.bind(this)}
              />
              <GeoJSONLayer
                id="muni-choropleth"
                data={this.state.mxMunicipalities}
                before='waterway-label'
                fillPaint={{
                    'fill-color': {
                        //property: property,
                        property: 'total_fosas',
                        stops: [
                          [0, 'rgba(255, 255, 255, 0.25)'],
                          [5, '#EED322'],
                          [10, '#E6B71E'],
                          [15, '#DA9C20'],
                          [20, '#CA8323'],
                          [25, '#B86B25'],
                          [30, '#A25626'],
                          [60, '#8B4225'],
                          [90, '#723122']
                        ]
                    },
                    'fill-opacity': 1
                }}
              />
              <GeoJSONLayer
                id="muni-lines"
                data={this.state.mxMunicipalities}
                before='waterway-label'
                linePaint={{
                  'line-color': '#ffffff',
                  'line-width': 0.1,
                  'line-opacity': 0.25,
                }}
                layerOptions={{
                  minzoom: 4.5
                }}
              />
            </div>
            }
            <ZoomControl />
          </Map>
        </div>
      </div>
      <div className="controls">
        Selected year: {this.state.selectedYear}
        <input type="range" min="2006" max="2016" step="1" value={this.state.selectedYear} onChange={this.onSelectorChange.bind(this)} />
      </div>
      <div className="state-details">
        <h1>{this.state.selectedStateName}</h1>
        <p>Total fosas: {this.state.totalFosas}</p>
      </div>
    </div>
  }
}

export default StateMunicipioMap;
