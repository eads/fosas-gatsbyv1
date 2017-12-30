import React from 'react';
import axios from 'axios';
import slugify from 'slugify';
//import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import ReactMapboxGl, { Source, Layer, ZoomControl, GeoJSONLayer }  from "react-mapbox-gl";

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
      selectedYear: '2006',
      mapCenter: [-103.401254, 23.568096],
      mapZoom: 4,
      mxMunicipalities: null,
      mxStates: null,
    }
  }

  componentDidMount() {
    axios.get('/map-data/mx-topojson-merged.json')
      .then(res => {
        var mx = res.data;
        var municipalities = topojson.feature(mx, mx.objects.municipalities);
        var states = topojson.feature(mx, mx.objects.states);

        this.setState({
          mxMunicipalities: municipalities,
          mxStates: states,
        });
      });
  }

  onStateClick(state) {
    this.setState({
      selectedState: state.properties.state_code
    });
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
                data={this.state.mxMunicipalities}
                before='waterway-label'
                fillPaint={{
                    'fill-color': {
                        property: property,
                        stops: [
                          [0, 'rgba(0, 0, 0, 0)'],
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
        <h1>state name</h1>
        <p>lorem ipsum</p>
      </div>
    </div>
  }
}

export default StateMunicipioMap;
