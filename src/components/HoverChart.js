import React from 'react';
import max from 'lodash/max';

class HoverChart extends React.Component {

  render() {
    const { yearColorScale, hoverInfo, selectedVar } = this.props;
    const varMax = max(hoverInfo.chartData.map( d => d[selectedVar] ));

    const height = 45;

    return (
      <div className="hoverchart-wrapper">
        {hoverInfo.chartData.map( (d, i) => {
          const value = d[selectedVar];

          return (
            <div
              className="bar-container"
              key={'hoverchart' + i}
            >
              <div className="bar"
                style={{
                  height: (varMax > 0) ? ((value / varMax) * (height - 20)) : 0,
                  backgroundColor: yearColorScale(d.year),
                }}
              />
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
