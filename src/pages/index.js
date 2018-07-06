import React from 'react'
import * as pym from 'pym.js'
import Slider from 'rc-slider/lib/Slider'
import loremIpsum from 'lorem-ipsum'
import Link from 'gatsby-link'

import { Persist } from 'react-persist'

import 'rc-slider/assets/index.css'
import "../styles/preview.scss"


class EmbedPage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      embedWidth: 800,
      iframeSrc: './zacatecas',
    }

    this.lipsum = {
      hed: loremIpsum({count:7, units:'words'}),
      graf: loremIpsum({count:6})
    }

    this.onSliderChange = this.onSliderChange.bind(this)
    this.onClickWidgetLink = this.onClickWidgetLink.bind(this)
  }

  createEmbed(src) {
    return {__html: '<p data-pym-src="' + src + '"></p>'};
  }

  onSliderChange(embedWidth) {
    this.setState({'embedWidth': embedWidth})
  }

  onClickWidgetLink(event) {
    event.preventDefault();
    this.setState({
      iframeSrc: event.target.href
    });
  }

  render() {
    if (typeof window != 'undefined') {
      setTimeout(pym.autoInit, 0)
    }
    return (
      <div className="embed-preview">

        <Persist
          name="FosasMap"
          data={this.state}
          onMount={data => this.setState(data)}
        />

        <div className="embed-preview-meta">
          <h1>FOSAS</h1>

          <p>Copy this embed code and paste it into your website:</p>
          <textarea value={`<p data-pym-src="TK">Loading...</p>\n<script type="text/javascript" src="https://pym.nprapps.org/pym-loader.v1.min.js"></script>`} readOnly />

          <h2>Embed size <small>({this.state.embedWidth}px)</small></h2>
          <Slider
            value={this.state.embedWidth}
            min={300}
            max={1100}
            marks={{
              300: '300px',
              500: '500',
              700: '700',
              900: '900',
              1100: '1100px'
            }}
            onChange={this.onSliderChange}
            trackStyle={{ height: 7 }}
            railStyle={{ backgroundColor: '#ccc', height: 7 }}
            handleStyle={{
              height: 16,
              width: 16,
              marginLeft: -8,
              marginTop: -4,
            }}
            dotStyle={{
              display: "none",
            }}
          />

          <div className="pages">
            <h2>Pages</h2>
            <ul>
              {this.props.data.allSitePage.edges.map((page, i) => (
                (page.node.path != '/404/' && !page.node.path.startsWith('/dev-')) && <li key={'page_' + i}>
                  <Link
                    to={(page.node.path.endsWith('/')) ? page.node.path + 'index.html' : page.node.path}
                    onClick={this.onClickWidgetLink}
                  >
                    {(page.node.path == '/') ? 'index.html' : page.node.path}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="embed-preview-pane">
          <div className={this.state.embedClass}>
            <div className="content-preview">
              <div style={{width: this.state.embedWidth + 'px'}}>
                <h1 className="hooha">{this.lipsum.hed}</h1>
                <p className="hooha">{this.lipsum.graf}</p>
                <div
                  dangerouslySetInnerHTML={this.createEmbed(this.state.iframeSrc)}
                />
                <p className="hooha">{this.lipsum.graf}</p>
                <p className="hooha">{this.lipsum.graf}</p>
                <p className="hooha">{this.lipsum.graf}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default EmbedPage

export const query = graphql`
  query EmbedQuery {
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
