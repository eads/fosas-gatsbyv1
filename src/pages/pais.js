import React from "react";
import NationalMapWrapper from '../components/NationalMapWrapper';
import * as pym from 'pym.js';

class PaisPage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.pymChild = new pym.Child({ polling: 500 });
  }

  render() {
    return (
      <NationalMapWrapper
        selectedState={{
          bounds: [-117.12776, 14.5388286402, -86.811982388, 32.72083],
        }}
        mapFilter={null}
        circleSteps={{
          fosas: [0, 0, 1, 4],
          cuerpos: [0, 0, 1, 4],
        }}
      />
    )
  }
}

export default PaisPage
