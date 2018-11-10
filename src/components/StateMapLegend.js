import React from 'react';

class StateMapLegend extends React.Component {

  render() {
    const { circleSteps, selectedVar } = this.props;

    let minRadius, minDiameter, maxRadius, maxDiameter;
    if (circleSteps !== null) {
       minRadius = Math.floor(circleSteps[selectedVar][1]);
       minDiameter = minRadius * 2;
       maxRadius = Math.floor(circleSteps[selectedVar][circleSteps[selectedVar].length - 1]);
       maxDiameter = maxRadius * 2;
    }

    return (<div className="legend">
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
            borderRadius: maxRadius,
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
        {circleSteps[selectedVar][circleSteps[selectedVar].length - 2]} {selectedVar}
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
        {circleSteps[selectedVar][0]} {selectedVar.slice(0, -1)}
        </div>

      </div>)}
    </div>);
  }

}

export default StateMapLegend;
