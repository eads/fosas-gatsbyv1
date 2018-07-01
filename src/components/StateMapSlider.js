import React from 'react';
import { FaPlay, FaPause, FaRepeat } from 'react-icons/lib/fa';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

class SliderControlButton extends React.Component {
  state = {
    playing: false,
    timer: null,
  }

  togglePlaying = () => {
    const { onYearChange, minYear, maxYear } = this.props;
    let timer = null;

    if (!this.state.playing) {
      this.setState({ playing: true }, () => {
        if (this.props.selectedYear == maxYear) {
          onYearChange(minYear);
        } else {
          onYearChange(this.props.selectedYear + 1);
        }
        timer = setInterval( () => {
          if (this.props.selectedYear == maxYear) {
            this.setState({ playing: false }, () => {
              clearInterval(timer);
            });
          } else {
            onYearChange(this.props.selectedYear + 1);
          }
        }, 700);
      });
    } else {
      this.setState({ playing: false }, () => {
        console.log('got here', timer);
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      });
    }
  }

  render() {
    const { togglePlaying } = this;
    const { playing } = this.state;
    const { selectedYear, maxYear } = this.props;

    return (
      <button onClick={togglePlaying}>
        {playing && (
          <FaPause />
        )}
        {(!playing && selectedYear != maxYear) && (
          <FaPlay />
        )}
        {(!playing && selectedYear == maxYear) && (
          <FaRepeat />
        )}
      </button>
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
    )
  }
}

export default StateMapSlider;
