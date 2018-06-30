import React from "react";
import StateMapWrapper from '../components/StateMapWrapper';
import * as pym from 'pym.js';

class MapTemplate extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.pymChild = new pym.Child({ polling: 500 });
  }

  render() {
    return (
      <StateMapWrapper
        selectedState={this.props.data.mxstatesJson}
      />
    )
  }
}

export default MapTemplate

export const pageQuery = graphql`
  query StateByCode($state_code: String!) {
    mxstatesJson(state_code: { eq: $state_code } ) {
      state_code
      state_name
      bounds
      centroid {
        coordinates
      }
    }
  }
`
