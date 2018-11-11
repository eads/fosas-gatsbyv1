import React from 'react'
import ReactMapboxGl, { Source, Layer, GeoJSONLayer, Popup } from "react-mapbox-gl"
import Microcopy from './Microcopy'
import HoverChart from './HoverChart'
import range from 'lodash/range'
import max from 'lodash/max'
import flatten from 'lodash/flatten'
import throttle from 'lodash/throttle'
import find from 'lodash/find'
import * as d3Scale from 'd3-scale'
import slugify from 'slugify'
import StateMapLegend from './StateMapLegend'

import 'mapbox-gl/dist/mapbox-gl.css'

const sourceGeojson = require('../../data/processed-geojson/municipales_centroids.json')
const pgrGeojson = require('../../data/processed-geojson/pgr_centroids.json')

const DEFAULT_MAP_PADDING = 10

class StateMap extends React.Component {


  constructor(props) {
    super(props)

    if (typeof window == 'undefined') { return null }

    this.Map = ReactMapboxGl({
      accessToken: "pk.eyJ1IjoiYWRvbmRldmFuIiwiYSI6ImNqbm0yc2x3aDA0c2QzcXVteWhjaW5vZTMifQ.9iTMcfENx9TOCQ94oXEevQ",
      minZoom: 2,
      maxZoom: 11,
    })

    if (props.selectedState.state_code) {
      const newFeatures = sourceGeojson.features.filter( (f) => f.properties.cve_ent == props.selectedState.state_code )
      sourceGeojson.features = newFeatures
    }

    const bounds = [props.selectedState.bounds.slice(0, 2), props.selectedState.bounds.slice(2)]
    this.state = {
      zoom: [4],
      fitBounds: bounds,
      circleSteps: props.circleSteps,
      hoverInfo: null,
      geojson: sourceGeojson,
    }
  }

  _getSourceFeatures(map, source) {
    const { selectedState, mapFilter } = this.props
    const features = map.querySourceFeatures(source.sourceId, {
      sourceLayer: source.sourceId,
      filter: mapFilter,
    })
    return features
  }


  onStyleLoad = (map, style) => {
    setTimeout(() => {
      const paddedBounds = map.getBounds()
      map.setMaxBounds(paddedBounds)
    }, 0)
  }

  onSourceData = (map, source) => {
    const { selectedStateData, onDataChange, onMunicipioLoad } = this.props
    const { circleSteps } = this.state

    if (source.sourceId.indexOf('geojson') === 0 && !this.props.circleSteps) {
      const features = source.source.data.features
      if (features.length) {
        const circleSteps = {...circleSteps}

        let minRadius, maxRadius;
        if (window.innerWidth < 640) {
          minRadius = 1.75
          maxRadius = 13
        } else {
          minRadius = 2.5
          maxRadius = 20
        }

        let maxFosas = max(features.map( (feature) => (feature.properties.fosas_cumulative_2016 || feature.properties.fosas_all_years)))

        if (maxFosas < 5) {
          maxFosas = 5
        }

        const fosasScale = d3Scale.scaleSqrt().domain([1, maxFosas]).range([minRadius, maxRadius])
        circleSteps.fosas = flatten(range(1, maxFosas + 1).map( (value, i) => ( [value, fosasScale(value)] ) ))

        let maxCuerpos = max(features.map( (feature) => (feature.properties.cuerpos_cumulative_2016 || feature.properties.cuerpos_all_years)))

        if (maxCuerpos < 5) {
          maxCuerpos = 5
        }

        const cuerposScale = d3Scale.scaleSqrt().domain([1, maxCuerpos]).range([minRadius, maxRadius])
        circleSteps.cuerpos = flatten(range(1, maxCuerpos + 1).map( (value, i) => ( [value, cuerposScale(value)] ) ))

        this.setState({circleSteps})
        onMunicipioLoad(features, circleSteps)
      }
    }
  }

  onMouseEnter = ({ lngLat, features}) => {
    const feature = features[0]

    const { minYear, maxYear } = this.props
    const munData = range(minYear + 1, maxYear + 1).map( (year, i) => {
      return {
        year: year,
        fosas: feature.properties['fosas_' + year] || 0,
        cuerpos: feature.properties['cuerpos_' + year] || 0,
      }
    })

    let selectedStateData

    if (this.props.allStateData) {
      selectedStateData = find(this.props.allStateData.edges, (d) => (d.node.state_code == feature.properties.cve_ent)).node
    } else {
      selectedStateData = this.props.selectedState
    }

    const hoverInfo = {
      lngLat: lngLat,
      feature: feature,
      munData: munData,
      stateData: selectedStateData,
    }
    this.setState({ hoverInfo })
  }

  onMouseLeave = () => {
    const hoverInfo = null
    this.setState({ hoverInfo })
  }

  onCircleClick = ({ features }) => {
    if (window.location.pathname === '/') {
      const feature = features[0]
      const slug = slugify(feature.properties.nom_ent.toLowerCase())
      window.parent.location.href = `https://adondevanlosdesaparecidos.org/data/${slug}/`
    }
  }

  onResize = () => {
    if (this.mapbox) {
      const map = this.mapbox.state.map
      const selectedState = this.props.selectedState
      const bounds = [selectedState.bounds.slice(0, 2), selectedState.bounds.slice(2)]
      map.fitBounds(bounds, { padding: DEFAULT_MAP_PADDING })
    }
  }

  componentDidMount() {
    window.addEventListener("resize", throttle(this.onResize, 500))
  }

  render() {
    if (typeof window == 'undefined') { return null }
    const { Map } = this
    const { beforeLayer, selectedState, selectedStateData, selectedVar, selectedYear,
            minYear, maxYear, yearColorScale, mapFilter, negativeFilter,
            hideMunicipales, hideStateOutline, showPGR, microcopy } = this.props
    const { fitBounds, circleSteps, hoverInfo, geojson } = this.state

    return (
      <div className="municipio-map-wrapper">
        <div className="adonde-watermark">
          <a href="https://adondevanlosdesaparecidos.org/" target="_parent">
            <img
              src="/images/logo-adondevanlosdesaparecidos_520x236.png"
            />
          </a>
        </div>

        <StateMapLegend
          circleSteps={circleSteps}
          selectedVar={selectedVar}
        />

        <div className="municipio-map">
          <Map
            style="mapbox://styles/adondevan/cjnrw39nu0z5v2rlmp27xqfx5"
            containerStyle={{
              height: "100%",
              width: "100%"
            }}
            fitBounds={fitBounds}
            fitBoundsOptions={{padding: DEFAULT_MAP_PADDING}}
            onSourceData={this.onSourceData}
            onStyleLoad={this.onStyleLoad}
            zoom={this.state.zoom}
            ref={(mapbox) => { this.mapbox = mapbox }}
          >

            <Source
              id="municipalesshapes"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://adondevan.municipales'
              }}
            />

            <Source
              id="estatales"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://adondevan.estatales'
              }}
              />

            <Source
              id="municipalescentroids"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://adondevan.municipales_centroids'
              }}
            />

            <Source
              id="pgrcentroids"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://adondevan.pgr_centroids'
              }}
            />

            <Layer
              id="stateFillLayer"
              sourceId="estatales"
              sourceLayer="estatales"
              before={beforeLayer}
              filter={negativeFilter}
              type='fill'
              paint={{
                'fill-color': (negativeFilter) ? '#ddd' : '#fff',
                'fill-opacity': 1,
              }}
            />

            {!hideStateOutline && (
              <Layer
                id="stateOutlineLayer"
                sourceId="estatales"
                sourceLayer="estatales"
                before={beforeLayer}
                filter={mapFilter}
                type='line'
                paint={{
                  'line-color': '#999999',
                  'line-width': 0.5,
                  'line-opacity': 1,
                }}
              />
            )}

            {!hideMunicipales && (
              <Layer
                id="municipioOutlineLayer"
                sourceId="municipalesshapes"
                sourceLayer="municipales"
                before={beforeLayer}
                minZoom={1}
                maxZoom={11}
                type='line'
                paint={{
                  'line-color': '#ccc',
                  'line-width': 0.5,
                  'line-opacity': 0.3,
                }}
              />
            )}

            {!showPGR && (
            <Layer
              id='municipalescentroids-morelos'
              sourceId="municipalescentroids"
              sourceLayer="municipales_centroids"
              type="circle"
              before={beforeLayer}
              filter={mapFilter}
              layout={{
                visibility: (!showPGR && selectedYear == 2005) ? 'visible' : 'none',
              }}
              paint={{
                'circle-color': '#666666',
                'circle-opacity': 1,
                'circle-stroke-width': 0,
                'circle-radius': (circleSteps != null) ? [
                  'step',
                  ['get', selectedVar + '_all_years'],
                  0
                ].concat(circleSteps[selectedVar]) : 0
              }}
            />
            )}

            {!showPGR && range(minYear + 1, maxYear + 1).reverse().map( (year, i) => (
            <Layer
              key={'municipalescentroids' + i}
              id={'municipalescentroids' + year}
              sourceId="municipalescentroids"
              sourceLayer="municipales_centroids"
              type="circle"
              before={beforeLayer}
              filter={mapFilter}
              layout={{
                visibility: (!showPGR && (selectedYear == 2005 || selectedYear >= year)) ? 'visible' : 'none',
              }}
              paint={{
                'circle-color': yearColorScale(year),
                'circle-opacity': 1,
                'circle-stroke-width': 0,
                'circle-radius': (circleSteps != null) ? [
                  'step',
                  ['get', selectedVar + '_cumulative_' + year],
                  0
                ].concat(circleSteps[selectedVar]) : 0
              }}
            />
            ))}

            {!showPGR && (
            <GeoJSONLayer
              data={geojson}
              before={beforeLayer}
              circleLayout={{
                visibility: (!showPGR) ? 'visible' : 'none',
              }}
              circlePaint={{
                'circle-color': 'white',
                'circle-opacity': 0.05,
                'circle-stroke-width': 0,
                'circle-radius': (circleSteps != null) ? [
                  'step',
                  ['get', selectedVar + '_all_years'],
                  0
                ].concat(circleSteps[selectedVar].map( (d, i) => (i % 2 ? d + 2 : d) )) : 0
              }}
              circleOnMouseEnter={this.onMouseEnter}
              circleOnMouseLeave={this.onMouseLeave}
              circleOnClick={this.onCircleClick}
            />
            )}

            {!showPGR && (
            <GeoJSONLayer
              data={geojson}
              before={beforeLayer}
              circleLayout={{
                visibility: (!showPGR) ? 'visible' : 'none',
              }}
              circlePaint={{
                'circle-color': 'white',
                'circle-opacity': 0.05,
                'circle-stroke-width': 0,
                'circle-radius': (circleSteps != null) ? [
                  'step',
                  ['get', selectedVar + '_cumulative_' + 2016],
                  0
                ].concat(circleSteps[selectedVar].map( (d, i) => (i % 2 ? d + 2 : d) )) : 0
              }}
              circleOnMouseEnter={this.onMouseEnter}
              circleOnMouseLeave={this.onMouseLeave}
              circleOnClick={this.onCircleClick}
            />
            )}

            {showPGR && range(minYear + 1, maxYear + 1).reverse().map( (year, i) => (
            <Layer
              key={'pgrcentroids' + i}
              id={'pgrcentroids' + year}
              sourceId="pgrcentroids"
              sourceLayer="pgr_centroids"
              type="circle"
              before={beforeLayer}
              filter={mapFilter}
              layout={{
                visibility: (showPGR && (selectedYear == 2005 || selectedYear >= year)) ? 'visible' : 'none',
              }}
              paint={{
                'circle-color': yearColorScale(year),
                'circle-opacity': 1,
                'circle-stroke-width': 0,
                'circle-radius': (circleSteps != null) ? [
                  'step',
                  ['get', selectedVar + '_cumulative_' + year],
                  0
                ].concat(circleSteps[selectedVar]) : 0
              }}
            />
            ))}

            {showPGR && (
            <GeoJSONLayer
              data={pgrGeojson}
              before={beforeLayer}
              circleLayout={{
                visibility: (showPGR) ? 'visible' : 'none',
              }}
              circlePaint={{
                'circle-color': 'white',
                'circle-opacity': 0.05,
                'circle-stroke-width': 0,
                'circle-radius': (circleSteps != null) ? [
                  'step',
                  ['get', selectedVar + '_cumulative_' + 2016],
                  0
                ].concat(circleSteps[selectedVar].map( (d, i) => (i % 2 ? d + 2 : d) )) : 0
              }}
              circleOnMouseEnter={this.onMouseEnter}
              circleOnMouseLeave={this.onMouseLeave}
              circleOnClick={this.onCircleClick}
            />
            )}

            { hoverInfo && (
              <Popup coordinates={hoverInfo.feature.geometry.coordinates}>
                <h3>{hoverInfo.feature.properties.nom_mun} <span className="state-name">{(hoverInfo.stateData.state_name.indexOf('Veracruz') === 0) ? 'Veracruz' : hoverInfo.stateData.state_name }</span></h3>
                {(hoverInfo.stateData.state_code === '17') && (<div>
                  <p><strong>Fosas</strong> {hoverInfo.feature.properties.fosas_all_years}</p>
                  <div className="hoverchart-wrapper"><p><em><Microcopy
                    datakey='morelos_no_data_warning'
                    microcopy={microcopy}
                  /></em></p></div>
                </div>)}
                {(hoverInfo.stateData.state_code !== '17') && (<div>
                  <p><strong>Fosas</strong> {hoverInfo.feature.properties.fosas_cumulative_2016}</p>
                  {!showPGR && (
                  <HoverChart
                    hoverInfo={hoverInfo}
                    yearColorScale={yearColorScale}
                    selectedVar='fosas'
                  />
                )}
                </div>)}
                {(hoverInfo.stateData.state_code === '17') && (<div>
                  <p><strong>Cuerpos</strong> {hoverInfo.feature.properties.cuerpos_all_years}</p>
                  <div className="hoverchart-wrapper"><p><em><Microcopy
                    datakey='morelos_no_data_warning'
                    microcopy={microcopy}
                  /></em></p></div>
                </div>)}
                {(hoverInfo.stateData.state_code !== '17') && (<div>
                  <p><strong>Cuerpos</strong> {hoverInfo.feature.properties.cuerpos_cumulative_2016}</p>
                  {!showPGR && (<div>
                  <HoverChart
                    hoverInfo={hoverInfo}
                    yearColorScale={yearColorScale}
                    selectedVar='cuerpos'
                  />
                  <p className="hover-footnote">
                    <Microcopy
                      datakey='small_value_warning'
                      microcopy={microcopy}
                    />
                  </p>
                  </div>)}
                </div>)}
              </Popup>
            )}

          </Map>
        </div>
      </div>
    )
  }
}


export default StateMap
