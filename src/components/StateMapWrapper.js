import React from 'react';

import StateMap from './StateMap';
import StateMapSlider from './StateMapSlider';
import StateMapButtons from './StateMapButtons';

import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';

const VARS = ['fosas', 'cuerpos'];

class StateMapWrapper extends React.Component {
  state = {
    selectedState: {},
    selectedStateData: {},
    selectedVar: 'fosas',
    selectedYear: 2005,
    minYear: 2005,
    maxYear: 2016,
  }

  yearColorScale = scaleSequential(interpolateViridis).domain([2006, 2016])

  setYear = (selectedYear) => {
    this.setState({
      selectedYear
    })
  }

  setVar = (selectedVar) => {
    this.setState({
      selectedVar
    })
  }

  render() {
    if (typeof window === `undefined`) { return null; }
    const { selectedState } = this.props;
    console.log(this.state);

    return (
      <div className="state-details">
        <h1>{selectedState.state_name}</h1>
        <StateMapSlider
          {...this.state}
          onYearChange={this.setYear}
        />
        <StateMapButtons
          {...this.state}
          vars={VARS}
          onVarChange={this.setVar}
        />
        <StateMap />
      </div>
    )
  }
}

export default StateMapWrapper;
