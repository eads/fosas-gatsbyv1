import React from 'react';
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
    );
  }
}

export default MapTemplate

export const pageQuery = graphql`
  query StateByCode($state_code: String!) {
    mxstatesJson(state_code: { eq: $state_code } ) {
      state_code
      state_name
      bounds
      fosas_total
      fosas_max
      cuerpos_total
      cuerpos_max
      restos_total
      restos_max
      cuerpos_identificados_total
      cuerpos_identificados_max
      restos_identificados_total
      restos_identificados_max
      all_max
      centroid {
        coordinates
      }
      yearlyFosasData {
        year
        state_code
        fosas
        cuerpos
        cuerpos_identificados
        restos_identificados
      }
    }
  }
`
