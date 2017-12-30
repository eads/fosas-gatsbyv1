import React from "react";
import StateMunicipioMap from '../components/StateMunicipioMap.js'
import * as pym from 'pym.js'

class MapTemplate extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.pymChild = new pym.Child({ polling: 500 });
  }

  render() {
    return (
      <div className="container">
        <StateMunicipioMap selectedState={this.props.data.mxmunicipalitiesJson.state_code}/>
      </div>
    )
  }
}

export default MapTemplate

export const pageQuery = graphql`
  query StateByCode($state_code: Int!) {
    mxmunicipalitiesJson(state_code: { eq: $state_code } ) {
      state_code
      mun_name
      mun_code
    }
  }
`
