import React from 'react';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';

import ReactTable from "react-table";
import "react-table/react-table.css";

class MunicipioRank extends React.Component {
  render() {
    const { municipioData, selectedYear, selectedVar } = this.props;
    const selected = (selectedYear == 2005) ? 'cumulative_2016' : selectedYear;
    const municipios = sortBy(uniqBy(map(municipioData, 'properties'), 'nom_mun'), '' + selectedVar + '_' + selected).reverse();
    return (
       <ReactTable
        data={municipios}
        columns={[
          {
            Header: "Municipio",
            accessor: "nom_mun",
          },
          {
            Header: "Fosas",
            accessor: 'fosas_' + selected,
            width: 60,
          },
          {
            Header: "Cuerpos",
            accessor: 'cuerpos_' + selected,
            width: 60,
          },
        ]}
        showPagination={false}
        sortable={false}
        pageSize={municipios.length}
       />
    );
  }
}

export default MunicipioRank;
