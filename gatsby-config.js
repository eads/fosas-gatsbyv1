module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
  },
  pathPrefix: '/graphics.adondevanlosdesparicidos.org',
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-json`,
    `gatsby-plugin-sass`,
    {
      resolve: 'gatsby-source-google-sheets',
      options: {
        spreadsheetId: '1kFRw0g4O89FxLL7AF3SDDIvzcm3gomFUpigDw196mDk',
        worksheetTitle: 'microcopy',
        credentials: require('./secrets/adondevanlosdesaparecidos-421f63e1eb6a.json')
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data/`,
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-128994147-1",
        head: true,
        exclude: ["/embed/**",],
      },
    },

  ],
}
