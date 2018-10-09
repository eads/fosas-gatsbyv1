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

class NationalMapWrapper extends React.Component {
  state = {
    selectedState: {},
    selectedStateData: null,
    selectedVar: 'fosas',
    selectedYear: MINYEAR,
    minYear: MINYEAR,
    maxYear: MAXYEAR,
    mapFilter: null,
    negativeFilter: null,
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

  render() {
    const { selectedState } = this.state;

    return (
      <div className="state-details national">
        <div className="controls">
          <StateMapSlider
            {...this.state}
            onYearChange={this.setYear}
          />
          <p>Proin a risus libero. Etiam tincidunt tristique leo, ac hendrerit risus aliquet ac. Integer at semper augue. Vivamus ut mollis nulla. Cras vel interdum justo, tincidunt lobortis nibh. Nulla porttitor ex sem, nec sollicitudin sem dictum aliquam. Sed mollis, massa tincidunt bibendum imperdiet, quam erat convallis massa, at lobortis ante lorem sit amet massa. Curabitur porta scelerisque ligula, eget vulputate nulla interdum sed. Curabitur porttitor nisi ultricies enim efficitur rutrum. Aenean in nunc sit amet enim sollicitudin dapibus. Sed vestibulum mollis odio, at dignissim massa consectetur a.</p>
        </div>
        <StateMap
          {...this.state}
          bounds={[selectedState.bounds.slice(0, 2), selectedState.bounds.slice(2)]}
          hideStateOutline={true}
          beforeLayer="water-label"
          onDataChange={this.setSelectedStateData}
          onMunicipioLoad={() => {}}
        />
      </div>
    )
  }
}

export default NationalMapWrapper;

