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
          bounds: [-117.12776, 14.5388286402, -76.811982388, 32.72083],
        }}
        mapFilter={null}
      />
    )
  }
}

export default PaisPage
