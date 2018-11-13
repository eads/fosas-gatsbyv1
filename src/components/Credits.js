import React from 'react'
import Microcopy from './Microcopy'

class Credits extends React.Component {
  render() {
    const { microcopy } = this.props
    return (<p className="credits">
      <Microcopy
        datakey='credit_line'
        microcopy={microcopy}
      />
    </p>)
  }
}

export default Credits
