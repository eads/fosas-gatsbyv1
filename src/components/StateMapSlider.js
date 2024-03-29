import React from 'react'
import { FaPlay, FaPause, FaRedoAlt } from 'react-icons/fa'
import StateMapButtons from './StateMapButtons'
import Slider from 'rc-slider'
import ReactGA from 'react-ga'

import 'rc-slider/assets/index.css'

class SliderControlButton extends React.Component {
  state = {
    playing: false,
    timer: null,
  }

  startPlaying = () => {
    const { onYearChange, minYear, maxYear } = this.props

    if (this.props.selectedYear == maxYear) {
      onYearChange(minYear + 1)
    } else {
      onYearChange(this.props.selectedYear + 1)
    }
    var timer = setInterval( () => {
      if (this.props.selectedYear == maxYear) {
        onYearChange(minYear)
        this.setState({
          timer: clearInterval(this.state.timer),
        })
      } else {
        onYearChange(this.props.selectedYear + 1)
      }
    }, 1000)

    ReactGA.event({
      category: 'play button',
      action: 'start'
    })

    this.setState({
      timer: timer,
    })
  }

  stopPlaying = () => {
    ReactGA.event({
      category: 'play button',
      action: 'stop'
    })

    this.setState({
      timer: clearInterval(this.state.timer),
    })
  }

  restartPlaying = () => {
    ReactGA.event({
      category: 'play button',
      action: 'restart'
    })

    const { onYearChange, minYear } = this.props
    onYearChange(minYear)
  }

  render() {
    const { startPlaying, stopPlaying, restartPlaying } = this
    const { timer } = this.state
    const { selectedYear, maxYear } = this.props
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

  _onAfterChange = (year) => {
    const yearStr = (year < 2006) ? 'total' : year.toString()
    ReactGA.event({
      category: 'year scrubber',
      action: 'click year',
      label: yearStr,
    })
  }

  render() {
    const { onYearChange, selectedYear, minYear, maxYear, hideButtons } = this.props

    return (<div className="slider-container">
      <div className="row abs-row">
        <SliderControlButton
          selectedYear={selectedYear}
          onYearChange={onYearChange}
          minYear={minYear}
          maxYear={maxYear}
        />

        <div className="selected-year">
          {(selectedYear == 2005 || selectedYear == 2016) && (
            <span>2006-2016</span>
          )}
          {(selectedYear == 2006) && (
            <span>2006</span>
          )}
          {(selectedYear > 2006 && selectedYear < 2016) && (
            <span>2006-{selectedYear}</span>
          )}
        </div>
        {!hideButtons &&
          <StateMapButtons
            {...this.props}
          />
        }

      </div>
      <div className="row">
        <div className="slider">
          <Slider
            min={minYear}
            max={maxYear}
            value={selectedYear}
            onAfterChange={this._onAfterChange}
            onChange={onYearChange}
            dotStyle={{
              width: 15,
              height: 15,
              borderWidth: 0,
              bottom: -5,
              marginLeft: -6,
            }}
            handleStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              width: 15,
              height: 15,
              borderWidth: 1.5,
              borderColor: '#222',
              bottom: 0,
              marginLeft: -6,
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
    </div>)
  }
}

export default StateMapSlider
