import React from 'react';
import { FaPlay, FaPause, FaRepeat } from 'react-icons/lib/fa';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

class SliderControlButton extends React.Component {
  state = {
    playing: false,
    timer: null,
  }

  startPlaying = () => {
    const { onYearChange, minYear, maxYear } = this.props;

    if (this.props.selectedYear == maxYear) {
      onYearChange(minYear + 1);
    } else {
      onYearChange(this.props.selectedYear + 1);
    }
    var timer = setInterval( () => {
      if (this.props.selectedYear == maxYear) {
        onYearChange(minYear);
        this.setState({
          timer: clearInterval(this.state.timer),
        });
      } else {
        onYearChange(this.props.selectedYear + 1);
      }
    }, 1000)

    this.setState({
      timer: timer,
    });
  }

  stopPlaying = () => {
    this.setState({
      timer: clearInterval(this.state.timer),
    });
  }

  restartPlaying = () => {
    const { onYearChange, minYear } = this.props;
    onYearChange(minYear);
  }

  render() {
    const { startPlaying, stopPlaying, restartPlaying } = this;
    const { timer } = this.state;
    const { selectedYear, maxYear } = this.props;

    return (
      <div className="control-button">
        {timer && (
          <FaPause onClick={stopPlaying} />
        )}
        {(!timer && selectedYear != maxYear) && (
          <FaPlay onClick={startPlaying} />
        )}
        {(!timer && selectedYear == maxYear) && (
          <FaRepeat onClick={restartPlaying} />
        )}
      </div>
    )
  }
}


class StateMapSlider extends React.Component {

  render() {
    const { onYearChange, selectedYear, minYear, maxYear } = this.props;

    return (
      <div className="slider-container">
        <SliderControlButton
          selectedYear={selectedYear}
          onYearChange={onYearChange}
          minYear={minYear}
          maxYear={maxYear}
        />

        <div className="slider">
          <Slider
            min={minYear}
            max={maxYear}
            value={selectedYear}
            onChange={onYearChange}
            marks ={{
              2005: 'Total',
              2016: '2016',
            }}
          />
        </div>
      </div>
    )
  }
}

export default StateMapSlider;
