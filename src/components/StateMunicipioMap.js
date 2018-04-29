import React from 'react';
import ReactMapboxGl, { Source, Layer, ZoomControl, GeoJSONLayer }  from "react-mapbox-gl";
import axios from 'axios';
import bbox from '@turf/bbox';
import slugify from 'slugify';
import transformScale from '@turf/transform-scale';
import {RadioGroup, Radio} from 'react-radio-group';


import * as _ from 'lodash';
import * as topojson from 'topojson-client';


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
      selectedStateName: '',
      selectedProp: 'num_fosas',
      selectedYear: '2006',
      showYear: false,
      mapCenter: [-103.401254, 23.568096],
      mapZoom: 5,
      mxAllMunicipalities: null,
      mxAllStates: null,
      mxMunicipalities: null,
      mxStates: null,
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

    this.setState({
      selectedState: stateCode,
      selectedStateName: activeState.features[0].properties.state_name,
      mxMunicipalities: munis,
      center: this.mapbox.state.map.getCenter(),
      mapZoom: this.mapbox.state.map.getZoom(),
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
      showYear: true,
      selectedYear: parseInt(e.target.value),
      center: this.mapbox.state.map.getCenter(),
      mapZoom: this.mapbox.state.map.getZoom(),
    });
  }

  setMapProp(value) {
    this.setState({
      selectedProp: value,
      center: this.mapbox.state.map.getCenter(),
      mapZoom: this.mapbox.state.map.getZoom(),
    });
  }

  setMapYearStatus(value) {
    this.setState({
      showYear: value == 'on' ? true : false,
      center: this.mapbox.state.map.getCenter(),
      mapZoom: this.mapbox.state.map.getZoom(),
    });
  }



  render() {
    var property = this.state.showYear ? this.state.selectedYear + '_' + this.state.selectedProp : 'total_' + this.state.selectedProp;
    var setMapProp = this.setMapProp.bind(this);
    var setMapYearStatus = this.setMapYearStatus.bind(this);

    return <div>
      <div className="state-details">
        <h1>{this.state.selectedStateName}</h1>
      </div>
      <div className="municipio-map-wrapper">
        <div className="municipio-map">
          <Map
            style="mapbox://styles/davideads/cjbrhq8dz8r4l2spcryp96h6q"
            center={this.state.mapCenter}
            zoom={[this.state.mapZoom]}
            containerStyle={{
              height: "100%",
              width: "100%"
            }}
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
                        property: property,
                        stops: [
                          [-1, 'rgba(255, 255, 255, 0.1)'],
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

      <RadioGroup
        name="select-prop"
        className="prop-selector controls"
        selectedValue={this.state.selectedProp}
        onChange={setMapProp}>

        <div>
          <Radio value="num_fosas" id="num_fosas" />
          <label htmlFor="num_fosas">
            Fosas
          </label>
        </div>

        <div>
          <Radio value="num_cuerpos" id="num_cuerpos" />
          <label htmlFor="num_cuerpos">
            Cuerpos
          </label>
        </div>

        <div>
          <Radio value="num_cuerpos_identificados" id="num_cuerpos_identificados" />
          <label htmlFor="num_cuerpos_identificados">
            Cuerpos Identificados
          </label>
        </div>

        <div>
          <Radio value="num_restos" id="num_restos" />
          <label htmlFor="num_restos">
            Restos
          </label>
        </div>

      </RadioGroup>

      <RadioGroup
        name="select-year-status"
        className="year-status-selector controls"
        selectedValue={this.state.showYear ? 'on' : 'off'}
        onChange={setMapYearStatus}>

        <div>
          <Radio value="off" id="select-year-status-off" />
          <label htmlFor="select-year-status-off">
            Todos años
          </label>
        </div>

        <div>
          <Radio value="on" id="select-year-status-on" />
          <label htmlFor="select-year-status-on" className={this.state.showYear ? 'enabled' : 'disabled'}>
            Select año
            <div className="year-slider">
              <span>2006</span>
              <input 
                type="range"
                min="2006"
                max="2016"
                step="1"
                value={this.state.selectedYear}
                onChange={this.onSelectorChange.bind(this)}
              />
              <span>2016</span>
              <strong> {this.state.selectedYear}</strong>
            </div>
          </label>
        </div>
      </RadioGroup>
    </div>
  }
}

export default StateMunicipioMap;
