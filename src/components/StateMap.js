import React from 'react';

class StateMap extends React.Component {
  render() {
    return <h1>map</h1>
  }
  Xrender() {
    return (
      <div className="municipio-map-wrapper">
        <div className="municipio-map">
          <Map
            style="mapbox://styles/davideads/cjirt87zo2kuw2rp7da7jmizf/"
            maxBounds={[[-120.12776, 12.5388286402], [-84.811982388, 34.72083]]}
            fitBounds={[this.props.selectedState.bounds.slice(0, 2), this.props.selectedState.bounds.slice(2)]}
            fitBoundsOptions={{padding: 10}}
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
                'url': 'mapbox://davideads.5rgtszcw'
              }}
            />

            <Source
              id="municipales"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.aekfu8a3'
              }}
            />

            <Source
              id="estatales"
              tileJsonSource={{
                'type': 'vector',
                'url': 'mapbox://davideads.7vp1dlm9'
              }}
            />

            <Layer
              id="stateFillLayer"
              sourceId="estatales"
              sourceLayer="estatales"
              before={BEFORELAYER}

              filter={["==", "CVE_ENT", this.state.stateCode]}

              type='fill'
              paint={{
                'fill-color': '#181818',
                'fill-opacity': 1,
              }}
            />

            <Layer
              id="stateOutlineLayer"
              sourceId="estatales"
              sourceLayer="estatales"
              before={BEFORELAYER}

              filter={["==", "CVE_ENT", this.state.stateCode]}

              type='line'
              paint={{
                'line-color': '#888',
                'line-width': 1,
              }}
            />

            <Layer
              id="municipioOutlineLayer"
              sourceId="municipales"
              sourceLayer="municipales"
              before={BEFORELAYER}
              minZoom={1}
              maxZoom={11}
              filter={["==", "CVE_ENT", this.state.stateCode]}

              type='line'
              paint={{
                'line-color': '#666',
                'line-width': 0.5,
                'line-opacity': 0.3
              }}
              />

            {YEARS.map( (theYear, i) => (
              <Layer
                id={"centroidLayer"+theYear}
                sourceId="centroids"
                sourceLayer="municipalescentroids"
                before={(i === 0) ? BEFORELAYER : "centroidLayer"+ (theYear-1)}
                key={'cumulative'+theYear}
                filter={["==", "CVE_ENT", this.state.stateCode]}
                minZoom={1}
                maxZoom={11}

                type='circle'
                layout={{
                  visibility: (this.state.selectedYear == 2005 || this.state.selectedYear == theYear) ? 'visible' : 'none',
                }}
                paint={{
                  'circle-radius': [
                      'step',
                      ['get', 'num_' + this.state.selectedVar + ((this.state.selectedYear == 2005) ? '_cumulative_' : '_') + theYear],
                      0,
                      ...circleSteps
                  ],
                  'circle-color': yearColor(theYear),
                  'circle-opacity': (this.state.selectedYear == 2005) ? 1 : .9,
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
    )
  }
}


export default StateMap;
