import React from 'react';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';

class MunicipioRank extends React.Component {
  render() {
    const { municipioData, selectedYear, selectedVar } = this.props;
    const selected = (selectedYear == 2005) ? 'total' : selectedYear;
    const municipios = sortBy(uniqBy(map(municipioData, 'properties'), 'NOM_MUN'), 'num_' + selectedVar + '_' + selected).reverse();

    return (<table>
      <thead>
        <tr>
          <th></th>
          <th className="number">Fosas</th>
          <th className="number">Cuerpos</th>
        </tr>
      </thead>
      <tbody>
        {municipios.slice(0, 10).map( (m, i) => (
          <tr key={"municipio" + i}>
            <td className="municipio-name">{m.NOM_MUN}</td>
            <td className="number">{m['num_fosas_' + selected]}</td>
            <td className="number">{m['num_cuerpos_' + selected]}</td>
          </tr>
        ))}
      </tbody>
    </table>);
  }
}

export default MunicipioRank;

