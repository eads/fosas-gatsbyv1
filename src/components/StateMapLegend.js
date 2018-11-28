import React from 'react'
import Microcopy from './Microcopy'

class StateMapLegend extends React.Component {

  render() {
    const { circleSteps, selectedVar, microcopy } = this.props

    let minRadius, minDiameter, maxRadius, maxDiameter
    if (circleSteps !== null) {
       minRadius = Math.floor(circleSteps[selectedVar][1])
       minDiameter = minRadius * 2
       maxRadius = Math.floor(circleSteps[selectedVar][circleSteps[selectedVar].length - 1])
       maxDiameter = maxRadius * 2
    }

    return (<div className="legend"><div className="legend-inner">
      {(circleSteps !== null) && (<div>
        <div
          style={{
            backgroundColor: '#fff',
            borderColor: '#666',
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: minRadius + 1,
            height: minDiameter,
            width: minDiameter,
            position: 'absolute',
            left: maxRadius - minRadius,
            top: maxDiameter - minDiameter,
            zIndex: 225,
          }}
        />
        <div
          style={{
            backgroundColor: '#fff',
            borderColor: '#666',
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: maxRadius + 1,
            height: maxDiameter,
            width: maxDiameter,
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 200,
          }}
        />
        <div
          style={{
            backgroundColor: '#fff',
            fontSize: 9,
            paddingRight: 2,
            paddingLeft: 2,
            position: 'absolute',
            left: 5 + maxDiameter,
            top: 0,
          }}
        >
          {circleSteps[selectedVar][circleSteps[selectedVar].length - 2]} <Microcopy
            datakey={`${selectedVar}_legend_label_plural`}
            microcopy={microcopy}
          />
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            fontSize: 9,
            paddingRight: 2,
            paddingLeft: 2,
            position: 'absolute',
            left: 5 + maxDiameter,
            top: maxDiameter - 9,
          }}
        >
          {circleSteps[selectedVar][0]} <Microcopy
            datakey={`${selectedVar}_legend_label_singular`}
            microcopy={microcopy}
          />
        </div>

      </div>)}
    </div></div>)
  }

}

export default StateMapLegend
