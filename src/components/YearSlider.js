import React from 'react';


class YearSlider extends React.Component {

  render() {
    const { min, max, value, onChange } = this.props;
    return (
    <input type="range" id="cowbell" name="cowbell" 
           min="0" max="100" value="90" step="2" />
    )
  }
}

export default YearSlider;

