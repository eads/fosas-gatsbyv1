import React from 'react'
import find from 'lodash/find'


class Microcopy extends React.Component {
  render() {
    const { microcopy, datakey, lang } = this.props
    const copyObj = find(microcopy.edges, (d) => (d.node.key == datakey))

    // toggle spanish/english
    const value = copyObj.node.value || copyObj.node.valueen

    if (copyObj.node.html) {
      return (<div dangerouslySetInnerHTML={{__html: value}} />)
    } else {
      return (<span>{value}</span>)
    }
  }
}

export default Microcopy
