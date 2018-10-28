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
    const { allMxstatesJson } = this.props.data;

    var bounds;
    if (typeof window !== 'undefined' && window.innerWidth > 739) {
      bounds = [-117.12776, 14.5388286402, -76.811982388, 32.72083];
    } else {
      bounds = [-117.12776, 14.5388286402, -86.811982388, 32.72083];
    }

    return (
      <NationalMapWrapper
        selectedState={{
          bounds: bounds,
        }}
        allStateData={allMxstatesJson}
        mapFilter={null}
      />
    )
  }
}

export default PaisPage

export const pageQuery = graphql`
  query StateCodes {
    allMxstatesJson {
      edges {
        node {
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
    }
  }
`
