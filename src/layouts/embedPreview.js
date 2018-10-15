import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import "../styles/preview.scss"

const TemplateWrapper = ({ children }) => (
  <div>
    <Helmet>
      <title>Mapas de Fosas</title>
      <meta name="description" content="DO NOT SHARE" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="https://i0.wp.com/adondevanlosdesaparecidos.org/wp-content/uploads/2018/02/cropped-logo-adonde-1.png?fit=32%2C32&#038;ssl=1" sizes="32x32" />
      <link rel="icon" href="https://i0.wp.com/adondevanlosdesaparecidos.org/wp-content/uploads/2018/02/cropped-logo-adonde-1.png?fit=192%2C192&#038;ssl=1" sizes="192x192" />
      <link rel="apple-touch-icon-precomposed" href="https://i0.wp.com/adondevanlosdesaparecidos.org/wp-content/uploads/2018/02/cropped-logo-adonde-1.png?fit=180%2C180&#038;ssl=1" />
      <meta name="msapplication-TileImage" content="https://i0.wp.com/adondevanlosdesaparecidos.org/wp-content/uploads/2018/02/cropped-logo-adonde-1.png?fit=270%2C270&#038;ssl=1" />
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
