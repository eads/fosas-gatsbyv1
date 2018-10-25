import React from 'react';
import { FaPlay, FaPause, FaRedoAlt } from 'react-icons/fa';
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
        {timer && (<span>
          <FaPause onClick={stopPlaying} />
        </span>)}
        {(!timer && selectedYear != maxYear) && (<span>
          <FaPlay onClick={startPlaying} />
        </span>)}
        {(!timer && selectedYear == maxYear) && (<span>
          <FaRedoAlt onClick={restartPlaying} />
        </span>)}
      </div>
    )
  }
}


class StateMapSlider extends React.Component {

  render() {
    const { onYearChange, selectedYear, minYear, maxYear } = this.props;

    return (
      <div className="slider-container row">
        <SliderControlButton
          selectedYear={selectedYear}
          onYearChange={onYearChange}
          minYear={minYear}
          maxYear={maxYear}
        />

        <div className="slider-row">
          <p className="selected-year">
            {(selectedYear == 2005 || selectedYear == 2016) && (
              <span>2006-2016</span>
            )}
            {(selectedYear == 2006) && (
              <span>2006</span>
            )}
            {(selectedYear > 2006 && selectedYear < 2016) && (
              <span>2006-{selectedYear}</span>
            )}
          </p>

          <div className="slider">
            <Slider
              min={minYear}
              max={maxYear}
              value={selectedYear}
              onChange={onYearChange}
              dotStyle={{
                width: 11,
                height: 11,
                bottom: -3,
                marginLeft: -4,
              }}
              handleStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                width: 16,
                height: 16,
                borderWidth: 3,
                borderColor: '#000000',
                bottom: -1,
                boxShadow: 'none',
              }}
              marks ={{
                2005: 'TOT',
                2006: "'06",
                2007: "'07",
                2008: "'08",
                2009: "'09",
                2010: "'10",
                2011: "'11",
                2012: "'12",
                2013: "'13",
                2014: "'14",
                2015: "'15",
                2016: "'16",
              }}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default StateMapSlider;
