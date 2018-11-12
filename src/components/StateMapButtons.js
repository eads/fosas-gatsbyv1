import React from 'react'
import ReactGA from 'react-ga'

class StateMapButtons extends React.Component {

  onVarChange = (event) => {
    const value = event.target.value
    ReactGA.event({
      category: 'switch data type buttons',
      action: value,
    })
    this.props.onVarChange(value)
  }

  render() {
    const { vars, selectedVar, selectedStateData, hideValues } = this.props
    const { onVarChange } = this

    return (
      <div className="toggle-buttons">
        {vars.map( (varName, i) => (
          <button
            key={"selectbutton"+varName}
            value={varName}
            onClick={onVarChange}
            className={(selectedVar == varName) ? 'active': null}
          >
            {varName}
          </button>
        ))}
      </div>
    )
  }
}


export default StateMapButtons


