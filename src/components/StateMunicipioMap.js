import React from 'react'
import ReactMapboxGl, { Source, Layer, ZoomControl }  from "react-mapbox-gl"

import ContainerDimensions from 'react-container-dimensions'

import * as _ from 'lodash'

import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import * as d3Scale from 'd3-scale'
import * as d3ScaleChromatic from 'd3-scale-chromatic';
const d3 = { ...d3Scale, ...d3ScaleChromatic }



const BEFORELAYER = 'small city labels'
const VARS = ['fosas', 'cuerpos'] // ['cuerpos_identificados', 'restos']
const YEARS = _.range(2006, 2017)

const STATE_DATA_TEMPLATE = { yearlyFosasData: [] }
VARS.map((variable) => {
  STATE_DATA_TEMPLATE[variable] = 0
})


class StateMunicipioMap extends React.Component {
  constructor(props) {
    super(props)
    if (typeof window === `undefined`) { return null }

    this.state = {
      stateCode: props.selectedState.state_code,
      stateName: props.selectedState.state_name,
      selectedVar: VARS[0],
      selectedYear: 2005,
      stateData: STATE_DATA_TEMPLATE,
    }

    this.Map = ReactMapboxGl({
      accessToken: "pk.eyJ1IjoiZGF2aWRlYWRzIiwiYSI6ImNpZ3d0azN2YzBzY213N201eTZ3b2E0cDgifQ.ZCHD8ZAk32iAp9Ue3tPVVg",
      minZoom: 3.5,
      maxZoom: 8,
    })

    this.onSlideChange = this.onSlideChange.bind(this)
    this.onVarChange = this.onVarChange.bind(this)
  }

  onSourceData = (map, data) => {
    // Get data from state
    if (data.sourceId == 'estatales') {
      const features = map.querySourceFeatures("estatales", {
        sourceLayer: "estatalesfosas",
        filter: ["==", "CVE_ENT", this.state.stateCode],
      })
      if (features.length && _.isEqual(this.state.stateData, STATE_DATA_TEMPLATE)) {
        features[0].properties.yearlyFosasData = JSON.parse(features[0].properties.yearlyFosasData)
        console.log(features[0].properties)
        this.setState({
          stateData: features[0].properties,
        })
      }
    }
  }

  onSlideChange(value) {
    this.setState({
      selectedYear: value
    })
  }

  onVarChange(value) {
    this.setState({
      selectedVar: value
    })
  }

  render() {
    if (typeof window === `undefined`) { return null; }

    const yearColor = d3.scaleSequential(d3.interpolateViridis)
    //const yearColor = d3.scaleSequential(d3.interpolateWarm)
      .domain([2006, 2016])

    const yearMarks = {
      2005: { label: 'Total', style: { 'paddingTop': '3px', 'paddingBottom': '3px', 'color': '#fff', 'backgroundColor': '#000', 'fontSize': '13px', 'fontWeight': 'bold' } }
    }
    YEARS.map((year, i) => {
      yearMarks[year] = { label: year.toString(), style: { 'paddingTop': '3px', 'paddingBottom': '3px', 'color': '#fff', 'backgroundColor': yearColor(year), 'fontSize': '13px' } }
    })


    // "2005" as alias for "total" hack
    const selectedYear = (this.state.selectedYear === 2005) ? 'total' : this.state.selectedYear
    const selectedColumn = 'num_' + this.state.selectedVar + '_' + selectedYear

    return <div>
      <div className="state-details">
        <h1>{this.state.stateName}</h1>
      </div>

      <div className="slider-container">
        <div className="chart-wrapper">
          <ContainerDimensions>
          { ({ height }) =>
            <div className="chart">
              <div
                key={"yearrowtotal"}
                className="bar-container year-total"
              >
                <span
                  className="year-label"
                  style={{
                    color: "#fff",
                    fontSize: 11,
                    padding: 2,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  Total
                </span>
              </div>
              {this.state.stateData.yearlyFosasData.map( (yearRow, i) => (
                <div
                key={"yearrow"+i}
                className={"bar-container year-" + yearRow.year}
                >
                  {(yearRow['num_' + this.state.selectedVar] < 0) ?
                    <span className="indicator-no-data">No data</span> :
                    <span className="indicator-label">{yearRow['num_' + this.state.selectedVar]}</span>
                  }
                  <div
                    className="bar"
                    style={{
                      height: (yearRow['num_' + this.state.selectedVar] / this.state.stateData['all_max']) * (height - 50),
                      backgroundColor: yearColor(yearRow.year)
                    }}
                  />
                  <span
                    className="year-label"
                    style={{
                      color: '#fff',
                      borderTop: "2px solid #111",
                      fontSize: 11,
                      padding: 2,
                      backgroundColor: yearColor(yearRow.year)
                    }}
                  >
                    {yearRow.year}
                  </span>
                </div>
              ))}
            </div>
          }
          </ContainerDimensions>
        </div>

        <div className="slider">
          <Slider
            min={2005} max={2016}
            value={this.state.selectedYear}
            onChange={this.onSlideChange}
          />
        </div>

        <div className="toggle-buttons">
          {VARS.map( (varName, i) => (
            <button
              key={"selectbutton"+varName}
              value={varName}
              onClick={this.onVarChange.bind(this, varName)}
              className={(this.state.selectedVar == varName) ? 'active': null}
            >
              <strong>{varName}</strong> {this.state.stateData['num_' + varName + '_total']}
            </button>
          ))}
        </div>

      </div>

      <div className="municipio-map-wrapper">
        <div className="municipio-map">
          <Map
            style="mapbox://styles/davideads/cji5jndqn3ikl2smqcis7gm2x"
            pitch={[0]}
            center={this.props.selectedState.centroid.coordinates}
            maxBounds={[[-120.12776, 12.5388286402], [-84.811982388, 34.72083]]}
            fitBounds={[this.props.selectedState.bounds.slice(0, 2), this.props.selectedState.bounds.slice(2)]}
            fitBoundsOptions={{padding: 40}}
            containerStyle={{
              height: "100%",
              width: "100%"
            }}
            onSourceData={this.onSourceData}
            ref={(mapbox) => { this.mapbox = mapbox; }}
          >

            <Source
              id="centroids"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.d613g3h7'
              }}
            />

            <Source
              id="municipales"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.9qk2tt17'
              }}
            />

            <Source
              id="estatales"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.2hnqk450'
              }}
            />

            <Layer
              id="stateFillLayer"
              sourceId="estatales"
              sourceLayer="estatalesfosas"
              before={BEFORELAYER}

              filter={["==", "CVE_ENT", this.state.stateCode]}

              type='fill'
              paint={{
                'fill-color': '#777',
                'fill-opacity': 0.15,
              }}
            />

            <Layer
              id="stateOutlineLayer"
              sourceId="estatales"
              sourceLayer="estatalesfosas"
              before={BEFORELAYER}

              filter={["==", "CVE_ENT", this.state.stateCode]}

              type='line'
              paint={{
                'line-color': '#999',
                'line-width': 1,
              }}
            />

            <Layer
              id="municipioOutlineLayer"
              sourceId="municipales"
              sourceLayer="municipalitiesfosas"
              before={BEFORELAYER}

              filter={["==", "CVE_ENT", this.state.stateCode]}

              type='line'
              paint={{
                'line-color': '#666',
                'line-width': 0.5,
              }}
              />

            {YEARS.map( (theYear, i) => (
              <Layer
                id={"centroidLayer"+theYear}
                sourceId="centroids"
                sourceLayer="municipales-fosas-centroids-avkz1u"
                before={(i === 0) ? BEFORELAYER : "centroidLayer"+ (theYear-1)}
                key={'cumulative'+theYear}

                filter={["==", "CVE_ENT", this.state.stateCode]}

                type='circle'
                layout={{
                  visibility: (this.state.selectedYear == 2005 || this.state.selectedYear == theYear) ? 'visible' : 'none',
                }}
                paint={{
                  'circle-radius': [
                      'interpolate',
                      ['linear'],
                      ['get', 'num_' + this.state.selectedVar + ((this.state.selectedYear == 2005) ? '_cumulative_' : '_') + theYear],
                      0, 0,
                      10, 20,
                      40, 35
                  ],
                  'circle-color': yearColor(theYear),
                  'circle-opacity': 0.8,
                  'circle-stroke-width': 0,
                  'circle-stroke-color': '#fff',
                  'circle-stroke-opacity': 0.3,
                }}
              />
            ))}

            <ZoomControl />
          </Map>
        </div>
      </div>
    </div>
  }
}

export default StateMunicipioMap;
