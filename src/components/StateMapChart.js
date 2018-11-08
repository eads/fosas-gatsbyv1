import React from 'react';
import ContainerDimensions from 'react-container-dimensions'
import Microcopy from './Microcopy';

class StateMapChart extends React.Component {

  render() {
    const { onYearChange, selectedYear, yearColorScale, selectedState, selectedVar, microcopy } = this.props;
    let total = '';
    if (selectedState) {
      total = (selectedYear == 2005) ? selectedState[selectedVar + '_total'] : selectedState.yearlyFosasData[selectedYear - 2006][selectedVar];
      total = (total === -1) ? 'Sin datos' : total;
    }

    return (
      <div className="chart-wrapper">
        <h2>
          {selectedVar}
          <span className="number">
            {(selectedState &&
              (total)
            )}
          </span>
        </h2>
        {(selectedState && selectedState.state_code === '17') && (
          <div className="chart"><p><em><Microcopy
            datakey='morelos_no_data_warning'
            microcopy={microcopy}
          /></em></p></div>
        )}
        {(selectedState && selectedState.state_code !== '17') && (
        <ContainerDimensions>
          { ({ height }) =>
            <div className="chart">
              {selectedState.yearlyFosasData.map( (yearRow, i) => (
                <div
                  key={"yearrow"+i}
                  className={"bar-container year-" + yearRow.year}
                  style={{
                    height: height,
                    backgroundColor: (yearRow.year == selectedYear) ? '#f3f3f3' : 'transparent',
                  }}
                >
                  {(yearRow[selectedVar] < 0) ?
                    <span className="indicator-label indicator-no-data"></span> :
                    <span className="indicator-label">{yearRow[selectedVar]}</span>
                  }
                  <div
                    className="bar"
                    style={{
                      height: (yearRow[selectedVar] / selectedState[selectedVar + '_max']) * (height - 30),
                      backgroundColor: yearColorScale(yearRow.year)
                    }}
                  />
                  <span
                    className="year-label"
                  >
                    '{yearRow.year.toString().slice(2)}
                  </span>
                </div>
              ))}
            </div>
          }
        </ContainerDimensions>
        )}
      </div>
    )
  }
}


export default StateMapChart;
