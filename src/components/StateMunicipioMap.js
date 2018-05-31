import React from 'react';
import ReactMapboxGl, { Source, Layer, ZoomControl }  from "react-mapbox-gl";

import * as _ from 'lodash';
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell} from 'recharts'

import Slider, { Range } from 'rc-slider';

import * as d3Scale from 'd3-scale'
import * as d3ScaleChromatic from 'd3-scale-chromatic';
const d3 = { ...d3Scale, ...d3ScaleChromatic }

import 'rc-slider/assets/index.css';

const VARS = ['fosas', 'cuerpos', 'cuerpos_identificados', 'restos']
const YEARS = _.range(2006, 2017)

const STATE_DATA_TEMPLATE = { yearlyFosasData: [] }
VARS.map((variable) => {
  STATE_DATA_TEMPLATE[variable] = 0
})


const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiZGF2aWRlYWRzIiwiYSI6ImNpZ3d0azN2YzBzY213N201eTZ3b2E0cDgifQ.ZCHD8ZAk32iAp9Ue3tPVVg",
  minZoom: 4,
  maxZoom: 7.9,
})

class StateMunicipioMap extends React.Component {
  constructor(props) {
    super(props)
    if (typeof window === `undefined`) { return null }

    this.state = {
      selectedState: props.selectedState,
      stateName: props.stateName,
      selectedVar: VARS[0],
      selectedYear: 2005,
      mapCenter: [-103.401254, 23.568096],
      mapZoom: 5.5,
      stateData: STATE_DATA_TEMPLATE,
    }
  }

  onSourceData = (map, data) => {
    // Get data from state
    if (data.sourceId == 'estatales') {
      const features = map.querySourceFeatures("estatales", {
        sourceLayer: "estatalesfosas",
        filter: ["==", "CVE_ENT", this.state.selectedState],
      })
      if (features.length && _.isEqual(this.state.stateData, STATE_DATA_TEMPLATE)) {
        features[0].properties.yearlyFosasData = JSON.parse(features[0].properties.yearlyFosasData)
        this.setState({
          stateData: features[0].properties
        })
      }
    }
  }

  onYearSliderChange = (value) => {
    this.setState({
      selectedYear: value
    })
  }

  render() {
    if (typeof window === `undefined`) { return null; }

    //const yearColor = d3.scaleSequential(d3.interpolateCool)
      //.domain([0, 9])

    const yearColor = d3.scaleLinear()
      .domain([2006, 2016])
      .range(['rgb(110, 64, 170)', 'rgb(26, 213, 177)'])

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

      <div className="municipio-map-wrapper">
        <div className="municipio-map">
          <Map
            style="mapbox://styles/davideads/cjhfdld1208y82so2rhup98zc"
            center={this.state.mapCenter}
            zoom={[this.state.mapZoom]}
            containerStyle={{
              height: "100%",
              width: "100%"
            }}
            onSourceData={this.onSourceData}
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
                'url': 'mapbox://davideads.7deav60y'
              }}
            />

            <Layer
              id="municipioFillLayer"
              sourceId="municipales"
              sourceLayer="municipalitiesfosas"
              before="place-city-md-s"

              filter={["==", "CVE_ENT", this.state.selectedState]}

              type='fill'
              paint={{
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', selectedColumn],
                    0, 'rgba(255, 255, 255, 0)',
                    5, 'rgba(255, 255, 255, .4)',
                    20, 'rgba(255, 255, 255, .5)',
                    50, 'rgba(255, 255, 255, .6)',
                    75, 'rgba(255, 255, 255, .7)',
                ],
              }}

              minZoom={10.5}
            />

            <Layer
              id="municipioOutlineLayer"
              sourceId="municipales"
              sourceLayer="municipalitiesfosas"
              before="place-city-md-s"

              filter={["==", "CVE_ENT", this.state.selectedState]}

              type='line'
              paint={{
                'line-color': '#555',
                'line-width': 0.5,
              }}
              />

            <Layer
              id="stateOutlineLayer"
              sourceId="estatales"
              sourceLayer="estatalesfosas"
              before="place-city-md-s"

              filter={["==", "CVE_ENT", this.state.selectedState]}

              type='line'
              paint={{
                'line-color': '#fff',
                'line-width': 1.2,
              }}
            />

            {YEARS.reverse().map( (year, i) => (
              <Layer
                id={"centroidLayer"+i}
                sourceId="centroids"
                sourceLayer="municipales-fosas-centroids-avkz1u"
                before="place-city-md-s"
                key={'cumulative'+i}

                filter={["==", "CVE_ENT", this.state.selectedState]}

                type='circle'
                paint={{
                  'circle-radius': (this.state.selectedYear > 2005) ? 0 : [
                      'interpolate',
                      ['linear'],
                      ['get', 'num_' + this.state.selectedVar + '_cumulative_' + year],
                      0, 0,
                      32, 20
                  ],
                  'circle-color': yearColor(year),
                  'circle-opacity': 1,
                  'circle-stroke-width': 0,
                  'circle-stroke-color': '#fff'
                }}

                maxZoom={10.5}
              />
            ))}

            <Layer
              id={"centroidLayer"}
              sourceId="centroids"
              sourceLayer="municipales-fosas-centroids-avkz1u"
              before="place-city-md-s"

              filter={["==", "CVE_ENT", this.state.selectedState]}

              type='circle'
              paint={{
                'circle-radius': (this.state.selectedYear == 2005) ? 0 : [
                    'interpolate',
                    ['linear'],
                    ['get', selectedColumn],
                    0, 0,
                    32, 20
                ],
                'circle-color': yearColor(this.state.selectedYear),
                'circle-opacity': 1,
                'circle-stroke-width': 0,
                'circle-stroke-color': '#fff'
              }}

              maxZoom={10.5}
            />

            <ZoomControl />
          </Map>
        </div>
      </div>

      <div className="slider-container">
        <Slider
          min={2005}
          max={2016}
          step={1}
          marks={yearMarks}
          value={this.state.selectedYear}
          onChange={this.onYearSliderChange}
        />
      </div>

      <div className="indicators">
      {VARS.map( (varname, i) => (
        <div key={'total'+i} className="indicator-block">
          <p>{varname}: {this.state.stateData['num_' + varname + '_total']}</p>
          <ResponsiveContainer aspect={2}>
            <BarChart
              data={this.state.stateData.yearlyFosasData}
            >
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="year" type="number" domain={[2006, 2016]} />
              <YAxis/>
              <Bar dataKey={'num_' + varname} fill="#8884d8">
                {
                  this.state.stateData.yearlyFosasData.map((row, i) => {
                    const color = yearColor(row.year)
                    return <Cell key={"cell"+i} fill={color} />
                  })
                }
               </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
      </div>

    </div>
  }
}

export default StateMunicipioMap;



            /*
            {(this.state.selectedYear == 2005) && this.state.stateData.yearlyFosasData.reverse().map( (year, i) => {
              var selectedVar = 'num_' + this.state.selectedVar
              var strokeWidth = this.dotStrokeScale(year[selectedVar])
              var currentDotRadius = _.clone(pastDotRadius)
              pastDotRadius += currentDotRadius
              console.log(currentDotRadius, year)

              return (
                <Layer
                  key={"centroids_"+i}
                  id={"centroidLayer"+i}
                  sourceId="centroids"
                  sourceLayer="municipales-fosas-centroids-8ldfwu"

                  filter={["==", "CVE_ENT", this.state.selectedState]}

                  type='circle'
                  paint={{
                    'circle-radius': currentDotRadius,
                    'circle-opacity': 1,
                    'circle-stroke-width': strokeWidth,
                    'circle-stroke-color': "rgba(" + (i * 25) + ", " + (i * 25) + ", 255, 1)"
                  }}

                  maxZoom={10.5}
                />
            )})}
            */
