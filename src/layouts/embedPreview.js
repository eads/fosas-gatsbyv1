import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import "../styles/preview.scss"

const TemplateWrapper = ({ children }) => (
  <div>
    <Helmet>
      <title>Mapas de Fosas @TK</title>
      <meta name="description" content="@TK" />
      <meta name="keywords" content="@TK" />
      <link rel="shortcut icon" href="/favicon.png" />
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
