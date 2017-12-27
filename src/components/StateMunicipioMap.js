import React from 'react';
import { ResponsiveContainer } from 'recharts';
import * as d3Lib from 'd3';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as _ from 'lodash';
import * as topojson from 'topojson-client';
import axios from 'axios';

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
      this.setState({width: this.wrapperEl.clientWidth, height: this.wrapperEl.clientHeight * 0.7});
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

  onMouseEnter() {
    console.log(arguments);
  }

  onMouseLeave() {
    console.log(arguments);
  }

  onClick() {
    var year = parseInt(this.state.selectedYear.slice(1));
    year = year + 1;
    if (year > 2016) {
      year = 2013;
    }
    this.setState({
      selectedYear: 'y' + year
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

    var theState = _.filter(this.state.mxTopoJson.objects.states.geometries, function(o) {
      return o.properties.state_code == selectedState;
    });

    var focusedState = topojson.feature(this.state.mxTopoJson, {type:"GeometryCollection", geometries: theState});
    this.projection.fitSize([this.state.width, this.state.height], focusedState);
    var color = this.color;
    var path = this.path;
    var onClick = this.onClick.bind(this);
    var features = _.sortBy(this.municipalities.features, [function(o) { return o.properties.state_code == selectedState }]  ); // Use Lodash to sort array by 'name'
    var selectedYear = this.state.selectedYear;
    var onChange = this.onChange.bind(this);

    return <div className="municipio-map-wrapper" ref={(el) => { this.wrapperEl = el; }}>
      <div className="municipio-map">
        <div className="controls">
          <p>{theState[0].properties.state_name}</p>
          <div>Selected year: {selectedYear.slice(1)} <input type="range" min="2013" max="2016" step="1" value={parseInt(selectedYear.slice(1))} onChange={onChange} /></div>
        </div>
        <svg className="map" width={this.state.width} height={this.state.height}>
          <g>{
            features.map(function(municipality, i) {
              if (municipality.properties.state_code == selectedState) {
                var assignedColor = color(municipality.properties.years[selectedYear]).substr(1);
                return <path
                    stroke="#FC8259"
                    strokeWidth="1"
                    key={'municipality_' + i}
                    d={path(municipality)}
                    onClick={onClick}
                    style={{fill: assignedColor}}
                  />
              } else {
                //return <path
                  //stroke="#ffffff"
                  //strokeWidth="0.5"
                  //key={'municipality_' + i}
                  //d={path(municipality)}
                ///>
              }
            })
          }</g>
        </svg>
      </div>
    </div>
  }
}

export default StateMunicipioMap;



