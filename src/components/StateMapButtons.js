import React from 'react';

class StateMapButtons extends React.Component {

  onVarChange = (event) => {
    const value = event.target.value;
    this.props.onVarChange(value);
  }

  render() {
    const { vars, selectedVar } = this.props;
    const { onVarChange } = this;

    return (
      <div className="toggle-buttons">
        {vars.map( (varName, i) => (
          <button
            key={"selectbutton"+varName}
            value={varName}
            onClick={onVarChange}
            className={(selectedVar == varName) ? 'active': null}
          >
            {varName} XX
          </button>
        ))}
      </div>
    )
  }
}


export default StateMapButtons;


