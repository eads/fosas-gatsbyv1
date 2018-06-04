import React from 'react';
import ReactMapboxGl, { Source, Layer, ZoomControl }  from "react-mapbox-gl";

import * as _ from 'lodash';
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell} from 'recharts'

import Slider, { Range } from 'rc-slider';

import * as d3Scale from 'd3-scale'
import * as d3ScaleChromatic from 'd3-scale-chromatic';
const d3 = { ...d3Scale, ...d3ScaleChromatic }

import 'rc-slider/assets/index.css';

const BEFORELAYER = 'small city labels'
const VARS = ['fosas', 'cuerpos'] // ['cuerpos_identificados', 'restos']
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
      selectedState: props.selectedState.state_code,
      stateName: props.selectedState.state_name,
      selectedVar: VARS[0],
      selectedYear: 2005,
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
          stateData: features[0].properties,
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

    const yearColor = d3.scaleSequential(d3.interpolateCool)
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

      <div className="municipio-map-wrapper">
        <div className="municipio-map">
          <Map
            style="mapbox://styles/davideads/cjhipex780dkz2rlttuuadp4f"
            center={this.props.selectedState.centroid.coordinates}
            zoom={[5.5]}
            bearing={[0]}
            pitch={[0]}
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
                'url': 'mapbox://davideads.7deav60y'
              }}
              />

            <Layer
              id="stateFillLayer"
              sourceId="estatales"
              sourceLayer="estatalesfosas"
              before={BEFORELAYER}

              filter={["==", "CVE_ENT", this.state.selectedState]}

              type='fill'
              paint={{
                'fill-color': '#fff',
                'fill-opacity': 0.5,
              }}
            />



            <Layer
              id="stateOutlineLayer"
              sourceId="estatales"
              sourceLayer="estatalesfosas"
              before={BEFORELAYER}

              filter={["==", "CVE_ENT", this.state.selectedState]}

              type='line'
              paint={{
                'line-color': '#333',
                'line-width': 1.2,
              }}
            />

            <Layer
              id="municipioOutlineLayer"
              sourceId="municipales"
              sourceLayer="municipalitiesfosas"
              before={BEFORELAYER}

              filter={["==", "CVE_ENT", this.state.selectedState]}

              type='line'
              paint={{
                'line-color': '#ccc',
                'line-width': 0.5,
              }}
            />

            {(this.state.selectedYear != 2005) && <Layer
              id={"centroidLayer"}
              sourceId="centroids"
              sourceLayer="municipales-fosas-centroids-avkz1u"
              before={BEFORELAYER}

              filter={["==", "CVE_ENT", this.state.selectedState]}

              type='circle'
              //layout={{
                //visibility: (this.state.selectedYear != 2005) ? 'visible' : 'none',
              //}}
              paint={{
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['get', selectedColumn],
                    0, 0,
                    5, 10,
                    40, 50
                ],
                'circle-color': yearColor(this.state.selectedYear),
                'circle-opacity': 1,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
              }}
            />}

            {(this.state.selectedYear == 2005) && YEARS.reverse().map( (theYear, i) => { 
              console.log('called')
              return (
              <Layer
                id={"centroidLayer"+i}
                sourceId="centroids"
                sourceLayer="municipales-fosas-centroids-avkz1u"
                before={(i === 0) ? BEFORELAYER : "centroidLayer"+ (i-1)}
                key={'cumulative'+i}

                filter={["==", "CVE_ENT", this.state.selectedState]}

                type='circle'
                layout={{
                  visibility: (this.state.selectedYear == 2005) ? 'visible' : 'none',
                }}
                paint={{
                  'circle-radius': [
                      'interpolate',
                      ['linear'],
                      ['get', 'num_' + this.state.selectedVar + '_cumulative_' + theYear],
                      0, 0,
                      5, 10,
                      40, 50
                  ],
                  'circle-color': yearColor(theYear),
                  'circle-opacity': 1,
                  'circle-stroke-width': 0.5,
                  'circle-stroke-color': '#fff',
                  'circle-stroke-opacity': 0.7,
                }}
              />
            )})}

            {console.log(this.mapbox && this.mapbox.state && this.mapbox.state.map && this.mapbox.state.map.getStyle().layers)}

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
