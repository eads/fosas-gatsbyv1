import React from 'react';
import ReactMapboxGl, { Source, Layer, ZoomControl }  from "react-mapbox-gl";
import axios from 'axios';
import bbox from '@turf/bbox';
import slugify from 'slugify';
import transformScale from '@turf/transform-scale';
import {RadioGroup, Radio} from 'react-radio-group';


import * as _ from 'lodash';
import * as topojson from 'topojson-client';


class StateMunicipioMap extends React.Component {
  constructor(props) {
    super(props)
    if (typeof window === `undefined`) { return null }

    this.Map = ReactMapboxGl({
      accessToken: "pk.eyJ1IjoiZGF2aWRlYWRzIiwiYSI6ImNpZ3d0azN2YzBzY213N201eTZ3b2E0cDgifQ.ZCHD8ZAk32iAp9Ue3tPVVg",
      minZoom: 4,
      maxZoom: 7.9,
    })

    this.state = {
      selectedState: props.selectedState,
      selectedStateName: props.selectedStateName,
      mapCenter: [-103.401254, 23.568096],
      mapZoom: 6,
      municipalesData: [],
    }

  }

  onData = (map, data) => {
    if (data.sourceId == "municipales" && data.isSourceLoaded) {
      var features = map.querySourceFeatures("municipales", {
          sourceLayer: "municipalitiesfosas",
          filter: ["==", "CVE_ENT", this.state.selectedState],
      })
      var sorted = features.sort((a, b) => parseInt(a.properties.total_num_fosas) > parseInt(b.properties.total_num_fosas)).reverse()
      console.log(sorted)
      this.setState({
        municipalesData: sorted
      })
    }
  }

  render() {
    if (typeof window === `undefined`) { return null; }
    const { Map } = this
    console.log(this.state)

    return <div>

      <div className="state-details">
        <h1>{this.state.selectedStateName}</h1>
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
            onData={this.onData}
            ref={(mapbox) => { this.mapbox = mapbox; }}
          >
            <Source
              id="centroids"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.4id9ndop'
              }}
            />

            <Source
              id="municipales"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.9qk2tt17'
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
                    ['get', 'total_num_fosas'],
                    0, 'rgba(255, 255, 255, 0)',
                    5, 'rgba(255, 255, 255, .4)',
                    20, 'rgba(255, 255, 255, .5)',
                    50, 'rgba(255, 255, 255, .6)',
                    75, 'rgba(255, 255, 255, .7)',
                ],
              }}

              minZoom={6.5}
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
              id="centroidLayer"
              sourceId="centroids"
              sourceLayer="municipales-fosas-centroids-8ldfwu"
              before="place-city-md-s"

              filter={["==", "CVE_ENT", this.state.selectedState]}

              type='circle'
              paint={{
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['get', 'total_num_fosas'],
                    0, 0,
                    5, 10,
                    20, 15,
                    50, 25,
                    75, 30,
                ],
                'circle-color': '#fff',
                'circle-opacity': 0.6,
                'circle-stroke-width': 0.5,
                'circle-stroke-color': '#000'
              }}

              maxZoom={6.5}
            />
            <ZoomControl />
          </Map>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Fosas</th>
            <th>Cuerpos</th>
          </tr>
        </thead>
        <tbody>
        {this.state.municipalesData.map( (feature, i) => (
          <tr
            key={'feature'+i}
          >
            <td>{feature.properties.NOM_MUN}</td>
            <td>{feature.properties.total_num_fosas}</td>
            <td>{feature.properties.total_num_cuerpos}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  }
}

export default StateMunicipioMap;
