import React from 'react';
import ContainerDimensions from 'react-container-dimensions'

class StateMapChart extends React.Component {

  render() {
    const { onYearChange, selectedYear, yearColorScale, selectedStateData, selectedVar } = this.props;
    let total = '';
    if (selectedStateData) {
      total = (selectedYear == 2005) ? selectedStateData[selectedVar + '_total'] : selectedStateData.yearlyFosasData[selectedYear - 2006][selectedVar];
      total = (total === -1) ? 'Sin datos' : total;
    }

    return (
      <div className="chart-wrapper">
        <h2>
          {selectedVar} 
          <span className="number">
            {(selectedStateData &&
              (total)
            )}
          </span>
        </h2>

        {selectedStateData && (
        <ContainerDimensions>
          { ({ height }) =>
            <div className="chart">


              {selectedStateData.yearlyFosasData.map( (yearRow, i) => (
                <div
                  key={"yearrow"+i}
                  className={"bar-container year-" + yearRow.year}
                  style={{
                    height: height,
                    backgroundColor: (yearRow.year == selectedYear) ? '#ffffff' : 'transparent',
                  }}
                >
                  {(yearRow[selectedVar] < 0) ?
                    <span className="indicator-label indicator-no-data"></span> :
                    <span className="indicator-label">{yearRow[selectedVar]}</span>
                  }
                  <div
                    className="bar"
                    style={{
                      height: (yearRow[selectedVar] / selectedStateData[selectedVar + '_max']) * (height - 58),
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
