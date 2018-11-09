import React from 'react';

class StateMapLegend extends React.Component {

  render() {
    const { circleSteps, selectedVar } = this.props;
    return (<div className="legend">
      {(circleSteps !== null) && (<div>
        <div
          style={{
            backgroundColor: '#fff',
            borderColor: '#666',
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: Math.round(circleSteps[selectedVar][1]),
            height: Math.floor(circleSteps[selectedVar][1]) * 2,
            width: Math.floor(circleSteps[selectedVar][1]) * 2,
            position: 'absolute',
            left: 11 + (Math.floor(circleSteps[selectedVar][circleSteps[selectedVar].length - 1]) / 2),
            bottom: 10,
            zIndex: 225,
          }}
          />
        <div
          style={{
            backgroundColor: '#fff',
            borderColor: '#666',
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: Math.round(circleSteps[selectedVar][circleSteps[selectedVar].length - 1]),
            height: Math.floor(circleSteps[selectedVar][circleSteps[selectedVar].length - 1]) * 2,
            width: Math.floor(circleSteps[selectedVar][circleSteps[selectedVar].length - 1]) * 2,
            position: 'absolute',
            left: 5,
            top: 10,
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
            left: 10 + Math.floor(circleSteps[selectedVar][circleSteps[selectedVar].length - 1]) * 2,
            top: 10,
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
            left: 10 + Math.floor(circleSteps[selectedVar][circleSteps[selectedVar].length - 1]) * 2,
            top: Math.floor(circleSteps[selectedVar][circleSteps[selectedVar].length - 1]) * 2,
          }}
        >
        {circleSteps[selectedVar][0]} {selectedVar.slice(0, -1)}
        </div>

      </div>)}
    </div>);
  }

}

export default StateMapLegend;
