import React from 'react';
import axios from 'axios';
import slugify from 'slugify';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { navigateTo } from "gatsby-link"

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

const d3 = Object.assign({}, d3Lib, d3ScaleChromatic);

class StateMunicipioMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mxTopoJson: null,
      selectedState: props.selectedState,
      selectedYear: 'y2013',
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
    axios.get('/map-data/mx.json')
      .then(res => {
        window.addEventListener("resize", this.updateDimensions.bind(this));
        var mx = res.data;
        mx.objects.municipalities.geometries.map(function(o) {
          var rand = Math.floor(2 + Math.random() * 5);
          o.properties.years = {
            'y2013': rand,
            'y2014': rand - Math.round(Math.random() + 1),
            'y2015': rand,
            'y2016': rand + Math.round(Math.random())
          };
        });
        this.color = d3.scaleThreshold()
            .domain(d3.range(2, 20))
            .range(d3.schemeOrRd[9]),
        this.projection = d3.geoMercator();
        this.path = d3.geoPath(this.projection);
        this.municipalities = topojson.feature(mx, mx.objects.municipalities);
        this.states = topojson.feature(mx, mx.objects.states);
        this.setState({
          mxTopoJson: mx
        }, this.updateDimensions.bind(this));
      });
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

  render() {
    if (!this.state.mxTopoJson) return <div>loading</div>;

    var selectedState = this.state.selectedState;
    var color = this.color;
    var path = this.path;
    var onChange = this.onChange.bind(this);

    var theState = _.filter(this.state.mxTopoJson.objects.states.geometries, function(o) {
      return o.properties.state_code == selectedState;
    });

    var focusedState = topojson.feature(this.state.mxTopoJson, {type:"GeometryCollection", geometries: theState});
    this.projection.fitExtent([
        [this.state.width * 0.2, this.state.height * 0.2],
        [this.state.width * 0.8, this.state.height * 0.8]
      ], focusedState);


    var features = _.sortBy(this.municipalities.features, [function(o) { return o.properties.state_code == selectedState }]  ); // Use Lodash to sort array by 'name'
    var stateFeatures = this.states.features;

    var selectedYear = this.state.selectedYear;

    return <div className="container">
      <div className="controls">
        <h1>
          {theState[0].properties.state_name}
        </h1>
        <p>
          Selected year: {selectedYear.slice(1)} 
          <input type="range" min="2013" max="2016" step="1" value={parseInt(selectedYear.slice(1))} onChange={onChange} />
        </p>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer aspect={3}>
          <BarChart data={data} stackOffset="sign">
           <XAxis dataKey="name" />
           <Bar dataKey="pv" fill="#999999" />
           <Bar dataKey="uv" fill="#aa3333" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="municipio-map-wrapper" ref={(el) => { this.wrapperEl = el; }}>
        <div className="municipio-map">
          <svg className="map" width={this.state.width} height={this.state.height}>
            <g>{
              stateFeatures.map((state, i) => {
                var onStateClick = this.onStateClick.bind(this, state);
                  return <path
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      key={'state_' + i}
                      d={path(state)}
                      style={{fill: "#dddddd"}}
                      onClick={onStateClick}
                    />
              })
            }</g>
            <g>{
              features.map(function(municipality, i) {
                if (municipality.properties.state_code == selectedState) {
                  var assignedColor = color(municipality.properties.years[selectedYear]).substr(1);
                  return <path
                      stroke="#FC8259"
                      strokeWidth="1"
                      key={'municipality_' + i}
                      d={path(municipality)}
                      style={{fill: assignedColor}}
                    />
                }
              })
            }</g>
            <g>{
              stateFeatures.map((state, i) => {
                var onStateClick = this.onStateClick.bind(this, state);
                return <text
                    key={'state_' + i}
                    x={path.centroid(state)[0]}
                    y={path.centroid(state)[1]}
                    className="map-label"
                    onClick={onStateClick}
                  >
                    {state.properties.state_name}
                  </text>
              })
            }</g>
          </svg>
        </div>
      </div>
    </div>
  }
}

export default StateMunicipioMap;



