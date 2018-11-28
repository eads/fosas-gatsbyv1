import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import "../styles/main.scss"


const CONFIG = {
  title: "A donde van los desaparecidos",
  description: "A dónde van los desaparecidos es un sitio de investigación periodística y análisis sobre las lógicas de la desaparición de personas en México.",
  image: "https://data.adondevanlosdesaparecidos.org/images/facebook-share.jpg",
  image_height: "788",
  image_width: "940",
  url: "https://data.adondevanlosdesaparecidos.org/",
  type: "article",
  fbAppID: "315929295670767",
  twitterUser: "desaparecerenmx",
}

/*
      <meta property="og:image:height" content={CONFIG.image_height} />
      <meta property="og:image:width" content={CONFIG.image_width} />
*/

const TemplateWrapper = ({ children }) => (
  <div>
    <Helmet>
      <title>{CONFIG.title}</title>

      <link rel="icon" href="https://i0.wp.com/adondevanlosdesaparecidos.org/wp-content/uploads/2018/06/cropped-logo-adondevanlosdesaparecidos_520x236.png?fit=32%2C32&#038;ssl=1" sizes="32x32" />
      <link rel="icon" href="https://i0.wp.com/adondevanlosdesaparecidos.org/wp-content/uploads/2018/06/cropped-logo-adondevanlosdesaparecidos_520x236.png?fit=192%2C192&#038;ssl=1" sizes="192x192" />
      <link rel="apple-touch-icon-precomposed" href="https://i0.wp.com/adondevanlosdesaparecidos.org/wp-content/uploads/2018/06/cropped-logo-adondevanlosdesaparecidos_520x236.png?fit=180%2C180&#038;ssl=1" />
      <meta name="msapplication-TileImage" content="https://i0.wp.com/adondevanlosdesaparecidos.org/wp-content/uploads/2018/06/cropped-logo-adondevanlosdesaparecidos_520x236.png?fit=270%2C270&#038;ssl=1" />

      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <meta name="description" content={CONFIG.description} />
      <meta name="image" content={CONFIG.image} />

      <meta property="og:url" content={CONFIG.url} />
      <meta property="og:type" content={CONFIG.type} />
      <meta property="og:title" content={CONFIG.title} />
      <meta property="og:description" content={CONFIG.description} />
      <meta property="og:image" content={CONFIG.image} />
      <meta property="fb:app_id" content={CONFIG.fbAppID} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={CONFIG.twitterUser} />
      <meta name="twitter:title" content={CONFIG.title} />
      <meta name="twitter:description" content={CONFIG.description} />
      <meta name="twitter:image" content={CONFIG.image} />

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
