import React from 'react';
import find from 'lodash/find';


class Microcopy extends React.Component {
  render() {
    const { microcopy, datakey } = this.props;
    const copyObj = find(microcopy.edges, (d) => (d.node.key == datakey));
    if (copyObj.node.html) {
      return (<div dangerouslySetInnerHTML={{__html: copyObj.node.value}} />);
    } else {
      return (<span>{copyObj.node.value}</span>);
    }
  }
}

export default Microcopy;
