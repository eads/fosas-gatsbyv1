import React from 'react';

import StateMap from './StateMap';
import StateMapSlider from './StateMapSlider';
import StateMapButtons from './StateMapButtons';
import StateMapChart from './StateMapChart';
import Microcopy from './Microcopy';

import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

const VARS = ['fosas', 'cuerpos'];

// The MINYEAR constant represents the "total" in the range. This is because
// rc-slider wants discrete, continuous ranges.
// @TODO fix this ugly hack
const MINYEAR = 2005;
const MAXYEAR = 2016;

class NationalMapWrapper extends React.Component {
  state = {
    selectedState: {},
    allStateData: null,
    selectedVar: 'fosas',
    selectedYear: MINYEAR,
    minYear: MINYEAR,
    maxYear: MAXYEAR,
    mapFilter: null,
    negativeFilter: null,
    showPGR: false,
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
      .domain([MINYEAR, MAXYEAR]),
  }

  constructor(props) {
    super(props);
    this.state.selectedState = props.selectedState;
    this.state.allStateData = props.allStateData;
    this.state.mapFilter = (props.mapFilter === undefined) ? ["==", "CVE_ENT", props.selectedState.state_code] : props.mapFilter;
    this.state.circleSteps = props.circleSteps || null;
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

  togglePGR = () => {
    const { showPGR } = this.state;
    this.setState({
      showPGR: !showPGR
    });
  }

  render() {
    const { microcopy } = this.props;
    const { selectedState, showPGR } = this.state;

    return (
      <div className="state-details national">
          <div style={{
            position: 'absolute',
            left: 10,
            bottom: 32,
            zIndex: 99,
            opacity: 0.5,
          }}>
            <img
              src="logo-adondevanlosdesaparecidos_520x236.png"
              style={{
                width: 'auto',
                height: 40,
              }}
            />
          </div>

        <div className="controls">

          <StateMapSlider
            {...this.state}
            onYearChange={this.setYear}
          />

          <div className="controls-content">
            <Microcopy
              datakey='national_map_text'
              microcopy={microcopy}
            />
          </div>
        </div>
        <StateMap
          {...this.state}
          bounds={[selectedState.bounds.slice(0, 2), selectedState.bounds.slice(2)]}
          beforeLayer="water-label"
          onDataChange={this.setSelectedStateData}
          showPGR={showPGR}
          onMunicipioLoad={() => {}}
          microcopy={microcopy}
        />
      </div>
    )
  }
}

export default NationalMapWrapper;

