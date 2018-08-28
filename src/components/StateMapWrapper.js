import React from 'react';

import StateMap from './StateMap';
import StateMapSlider from './StateMapSlider';
import StateMapButtons from './StateMapButtons';
import StateMapChart from './StateMapChart';

import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

const VARS = ['fosas', 'cuerpos'];

// The MINYEAR constant represents the "total" in the range. This is because
// rc-slider wants discrete, continuous ranges.
// @TODO fix this ugly hack
const MINYEAR = 2005;
const MAXYEAR = 2016;

class StateMapWrapper extends React.Component {
  state = {
    selectedState: {},
    selectedStateData: null,
    selectedVar: 'fosas',
    selectedYear: MINYEAR,
    minYear: MINYEAR,
    maxYear: MAXYEAR,
    mapFilter: null,
    circleSteps: null,
    yearColorScale: d3Scale.scaleOrdinal(
      [
       '#453581',
       '#481c6e',
       '#98d83e',
       '#67cc5c',
       '#40bd72',
       '#25ac82',
       '#1f998a',
       '#24878e',
       '#2b748e',
       '#34618d',
       '#3d4d8a'
      ])
      .domain([MINYEAR, MAXYEAR]), // Colors only apply to year after fake "total" year
  }

  constructor(props) {
    super(props);
    this.state.selectedState = props.selectedState;
    this.state.mapFilter = (props.mapFilter) || ["==", "CVE_ENT", props.selectedState.state_code];
  }

  setYear = (selectedYear) => {
    this.setState({
      selectedYear
    });
  }

  setVar = (selectedVar) => {
    this.setState({
      selectedVar
    });
  }

  setSelectedStateData = (selectedStateData) => {
    this.setState({
      selectedStateData
    });
  }

  render() {
    const { selectedState } = this.state;

    return (
      <div className="state-details">
        <StateMapButtons
          {...this.state}
          vars={VARS}
          onVarChange={this.setVar}
        />
        <div className="row">
          <div className="col controls">
            <StateMapSlider
              {...this.state}
              onYearChange={this.setYear}
            />
            <StateMapChart
              {...this.state}
              onYearChange={this.setYear}
              selectedVar='fosas'
            />
            <StateMapChart
              {...this.state}
              onYearChange={this.setYear}
              selectedVar='cuerpos'
            />
          </div>
          <div className="col map">
            <StateMap
              {...this.state}
              beforeLayer="ne-10m-admin-0-countries-9a6s71"
              onDataChange={this.setSelectedStateData}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default StateMapWrapper;
