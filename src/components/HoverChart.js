import React from 'react';
import max from 'lodash/max';

class HoverChart extends React.Component {

  render() {
    const { yearColorScale, hoverInfo, selectedVar } = this.props;
    const stateMax = hoverInfo.stateData[selectedVar + '_max'];
    const height = 45;

    return (
      <div className="hoverchart-wrapper">
        {hoverInfo.munData.map( (d, i) => {
          const value = d[selectedVar];

          return (
            <div
              className="bar-container"
              key={'hoverchart' + i}
            >
              <div className="bar" 
                style={{
                  height: (stateMax > 0) ? ((hoverInfo.stateData.yearlyFosasData[i][selectedVar] / stateMax) * (height - 20)) : 0,
                  backgroundColor: '#eeee99',
                }}
              >
                <div className="bar-inner"
                  style={{
                    height: (stateMax > 0) ? ((hoverInfo.stateData.yearlyFosasData[i][selectedVar] / stateMax) * (height - 20)) : 0,
                    backgroundColor: '#eeeeee',
                  }}
                />
                <div className="bar-inner"
                  style={{
                    height: (stateMax > 0) ? ((value / stateMax) * (height - 20)) : 0,
                    backgroundColor: yearColorScale(d.year),
                  }}
                />
              </div>
              <span
                className="year-label"
              >
                '{d.year.toString().slice(2)}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
}

export default HoverChart;
