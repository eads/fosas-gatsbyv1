import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import "../styles/main.scss"

const TemplateWrapper = ({ children }) => (
  <div>
    <Helmet>
      <title>Mapas de Fosas</title>
      <link rel="shortcut icon" href="/favicon.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Helmet>
    <div>
      {children()}
    </div>
  </div>
)

TemplateWrapper.propTypes = {
  children: PropTypes.func,
}

export default TemplateWrapper
