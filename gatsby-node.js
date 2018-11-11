/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
const path = require(`path`);
const slugify = require(`slugify`);

exports.modifyWebpackConfig = ({ config, stage }) => {
  // Fix for D3
  config.merge({
    node: { fs: 'empty', child_process: 'empty', pym: 'empty' },
    module: { noParse: /(mapbox-gl)\.js$/ },
  })
  if (stage === "build-html") {
    config.loader("null", {
      test: /(mapbox-gl)\.js$/,
      loader: "null-loader",
    });
  }
  return config
}

exports.onCreatePage = async ({ page, boundActionCreators }) => {
  const { createPage } = boundActionCreators;

  return new Promise((resolve, reject) => {
    if (page.path == "/embed/") {
      page.layout = "embedPreview";
      createPage(page);
    }
    resolve();
  });
};

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    graphql(`
      {
        allMxstatesJson {
          edges {
            node {
              state_name
              state_code
            }
          }
        }
      }
    `).then(result => {
      result.data.allMxstatesJson.edges.map(({ node }) => {
        var slug = slugify(node.state_name, {lower: true})
        createPage({
          path: slug + '/',
          component: path.resolve(`./src/templates/map.js`),
          context: {
            // Data passed to context available in page queries as GraphQL variables.
            state_code: node.state_code,
          },
        })
      })
      resolve()
    })
  })
}
