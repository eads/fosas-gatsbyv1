import React from 'react'
import Link from 'gatsby-link'
import StateMunicipioMap from '../components/StateMunicipioMap.js'


const IndexPage = () => (
  <div>
    <h1>Hello world</h1>
    <StateMunicipioMap selected_state={31} />
  </div>
)

export default IndexPage
