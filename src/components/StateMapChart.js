import React from 'react';
import ContainerDimensions from 'react-container-dimensions'

class StateMapChart extends React.Component {

  render() {
    const { onYearChange, selectedYear, yearColorScale, selectedStateData, selectedVar } = this.props;

    return (
      <div className="chart-wrapper">
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
                    backgroundColor: (yearRow.year == selectedYear) ? '#000' : 'transparent',
                  }}
                >
                  {(yearRow['num_' + selectedVar] < 0) ?
                    <span className="indicator-label indicator-no-data"></span> :
                    <span className="indicator-label">{yearRow['num_' + selectedVar]}</span>
                  }
                  <div
                    className="bar"
                    style={{
                      height: (yearRow['num_' + selectedVar] / selectedStateData['all_max']) * (height - 38),
                      backgroundColor: yearColorScale(yearRow.year)
                    }}
                  />
                  <span
                    className="year-label"
                    style={{
                      backgroundColor: yearColorScale(yearRow.year)
                    }}
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
