import React from 'react';
import * as d3Lib from 'd3';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as _ from 'lodash';
import * as topojson from 'topojson-client';
import mx from '../data/mx.json';

const d3 = Object.assign({}, d3Lib, d3ScaleChromatic);

class StateMunicipioMap extends React.Component {
  constructor(props) {
    super(props);
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

    this.state = {
      selectedState: this.props.selected_state,
      selectedYear: 'y2013'
    }
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
    var selectedState = this.state.selectedState;

    var theState = _.filter(mx.objects.states.geometries, function(o) {
      return o.properties.state_code == selectedState;
    });

    var focusedState = topojson.feature(mx, {type:"GeometryCollection", geometries: theState});
    this.projection.fitSize([700, 500], focusedState);
    var color = this.color;
    var path = this.path;
    var onClick = this.onClick.bind(this);
    var features = _.sortBy(this.municipalities.features, [function(o) { return o.properties.state_code == selectedState }]  ); // Use Lodash to sort array by 'name'
    var selectedYear = this.state.selectedYear;
    var onChange = this.onChange.bind(this);

    return <div>
      <h1>{theState[0].properties.state_name}</h1>
      <h2>Selected year: {selectedYear.slice(1)}</h2>
      <div><input type="range" min="2013" max="2016" step="1" value={parseInt(selectedYear.slice(1))} onChange={onChange} /></div>

      <svg width="700" height="500" className="map">
        <g>{
          features.map(function(municipality, i) {
            if (municipality.properties.state_code == selectedState) {
              return <path
                  key={'municipality_' + i}
                  d={path(municipality)}
                  onClick={onClick}
                />
            } else {
              return <path
                key={'municipality_' + i}
                d={path(municipality)}
              />
            }
          })
        }</g>
      </svg>
    </div>
  }
}

export default StateMunicipioMap;



