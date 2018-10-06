import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import "../styles/preview.scss"

const EmbedLayout = ({ children }) => (
  <div>
    <Helmet>
      <title>Mapas de Fosas</title>
      <meta name="description" content="DO NOT SHARE" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="shortcut icon" href="/favicon.png" />
    </Helmet>
    <div>
      {children()}
    </div>
  </div>
)

EmbedLayout.propTypes = {
  children: PropTypes.func,
}

export default EmbedLayout
