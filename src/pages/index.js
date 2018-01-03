import React from 'react'
import Link from "gatsby-link";
import * as pym from 'pym.js'

class IndexPage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      iframeSrc: '/veracruz-de-ignacio-de-la-llave'
    }
  }

  clickPreviewLink(e) {
    e.preventDefault();
    this.setState({
      iframeSrc: e.target.href
    });
  }

  createEmbed(src) {
    return {__html: '<p data-pym-src="' + src + '"></p>'};
  }

  render() {
    // Horribly hacky, but that's OK for what we need to do
    if (typeof window != 'undefined') {
      setTimeout(pym.autoInit, 0)
    }
    return (
      <div className="preview">
        <div className="pages">
          <ul>
          {this.props.data.allSitePage.edges.map((page, i) => (
            <li key={'page_' + i}><Link to={page.node.path} onClick={this.clickPreviewLink.bind(this)}>{page.node.path}</Link></li>
          ))}
          </ul>
        </div>

        <div className="switcher">
          <button>Mobile (480px)</button>
          <button>Tablet (768px)</button>
          <button>Content well (1210px)</button>
          <button>100%</button>
        </div>

        <div
          dangerouslySetInnerHTML={this.createEmbed(this.state.iframeSrc)}></div>

        <p>Embed code:</p>
        <textarea value={'<p data-pym-src="' + this.state.iframeSrc + '">Loading...</p>\n\
          <script type="text/javascript" src="https://pym.nprapps.org/pym-loader.v1.min.js"></script>'} readOnly />
      </div>
    )
  }
}

export default IndexPage

export const pageQuery = graphql`
  query AllPages {
    allSitePage (
      sort: { order: ASC, fields: [path] }
    ) {
      edges {
        node {
          path
        }
      }
    }
  }
`
