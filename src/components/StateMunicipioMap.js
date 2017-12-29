import React from 'react';
import axios from 'axios';
import slugify from 'slugify';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { navigateTo } from "gatsby-link"
import ReactMapboxGl, { Source, Layer, ZoomControl }  from "react-mapbox-gl";

import * as _ from 'lodash';
import * as d3Lib from 'd3';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as topojson from 'topojson-client';

const data = [
  {name: '2013', uv: 4000, pv: 2000, amt: 2400},
  {name: '2014', uv: 3000, pv: 2500, amt: 2210},
  {name: '2015', uv: 3200, pv: 2300, amt: 2290},
  {name: '2016', uv: 2800, pv: 2600, amt: 2000},
];

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiZGF2aWRlYWRzIiwiYSI6ImNpZ3d0azN2YzBzY213N201eTZ3b2E0cDgifQ.ZCHD8ZAk32iAp9Ue3tPVVg",
  minZoom: 5.1,
  maxZoom: 7.9,
});

const d3 = Object.assign({}, d3Lib, d3ScaleChromatic);

class StateMunicipioMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedState: props.selectedState,
      selectedYear: '2013',
      width: 0,
      height: 0
    }
  }

  updateDimensions() {
    if (this.wrapperEl) {
      this.setState({width: this.wrapperEl.clientWidth, height: this.wrapperEl.clientHeight});
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  componentDidMount() {
    //axios.get('/map-data/mx.json')
      //.then(res => {
        //window.addEventListener("resize", this.updateDimensions.bind(this));
        //var mx = res.data;
        //mx.objects.municipalities.geometries.map(function(o) {
          //var rand = Math.floor(2 + Math.random() * 5);
          //o.properties.years = {
            //'y2013': rand,
            //'y2014': rand - Math.round(Math.random() + 1),
            //'y2015': rand,
            //'y2016': rand + Math.round(Math.random())
          //};
        //});
        //this.color = d3.scaleThreshold()
            //.domain(d3.range(2, 20))
            //.range(d3.schemeOrRd[9]),
        //this.projection = d3.geoMercator();
        //this.path = d3.geoPath(this.projection);
        //this.municipalities = topojson.feature(mx, mx.objects.municipalities);
        //this.states = topojson.feature(mx, mx.objects.states);
        //this.setState({
          //mxTopoJson: mx
        //}, this.updateDimensions.bind(this));
      //});
  }

  onStateClick(state) {
    this.setState({
      selectedState: state.properties.state_code
    });
  }

  random() {
    return Math.floor(Math.random() * 10);
  }

  onChange(e) {
    this.setState({
      selectedYear: 'y' + e.target.value
    });
  }

  tilesetLoaded(source) {
    console.log(source);
  }

  render() {
    var property = this.state.selectedYear + '_fosas';

    return <div className="container">
      <h1>Map</h1>
      <Map
        style="mapbox://styles/davideads/cjbr9vxjd7ssv2spp4n4w39nh"
        containerStyle={{
          height: "95vh",
          width: "65vw"
        }}
        center={[-103.401254, 23.568096]}
        zoom={[5]}
      >
        <Source
          id="MxMunicipalities"
          tileJsonSource={
            {type: 'vector', url: 'mapbox://davideads.7hc85ep1' }
          }
          onSourceLoaded={this.tilesetLoaded.bind(this)}
        />
        <Layer
          id="wtf"
          sourceId="MxMunicipalities"
          sourceLayer="mx-geojson-8a95ky"
          type="fill"
          before="waterway-label"
          paint={{
              'fill-color': {
                  property: property,
                  stops: [
                      [0, '#ffffff'],
                      [50, '#555555']
                  ]
              },
              'fill-opacity': 0.2
          }}
        />
        <ZoomControl />
      </Map>
    </div>
  }
}

export default StateMunicipioMap;



