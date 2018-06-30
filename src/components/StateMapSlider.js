import React from 'react';
import ContainerDimensions from 'react-container-dimensions'

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

class StateMapSlider extends React.Component {

  render() {
    const { onYearChange, selectedYear, minYear, maxYear } = this.props;

    return (
      <div className="slider-container">
        <div className="chart-wrapper">
          <h1>CHART TK</h1>

        </div>

        <Slider
          min={minYear}
          max={maxYear}
          value={selectedYear}
          onChange={onYearChange}
        />
      </div>
    )
  }
}


export default StateMapSlider;


/*
 * <div className="slider-container">
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
                onClick={this.onSlideChange.bind(this, yearRow.year)}
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
*/
