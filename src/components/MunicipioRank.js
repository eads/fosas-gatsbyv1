import React from 'react';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';

class MunicipioRank extends React.Component {
  render() {
    const { municipioData, selectedYear, selectedVar } = this.props;
    const selected = (selectedYear == 2005) ? 'total' : selectedYear;
    const municipios = sortBy(uniqBy(map(municipioData, 'properties'), 'NOM_MUN'), '' + selectedVar + '_' + selected).reverse();

    return (<table>
      <thead>
        <tr>
          <th colSpan={2}></th>
          <th className="number">Fosas</th>
          <th className="number">Cuerpos</th>
        </tr>
      </thead>
      <tbody>
        {municipios.slice(0, 5).map( (m, i) => (
          <tr key={"municipio" + i}>
            <td>{i + 1}.</td>
            <td className="municipio-name">{m.NOM_MUN}</td>
            <td className="number">{m['fosas_' + selected]}</td>
            <td className="number">{m['cuerpos_' + selected]}</td>
          </tr>
        ))}
      </tbody>
    </table>);
  }
}

export default MunicipioRank;

